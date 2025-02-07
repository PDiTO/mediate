export const runtime = "nodejs";
export const maxDuration = 300;

import { NextRequest, NextResponse } from "next/server";

import { getLangChainTools } from "@coinbase/agentkit-langchain";
import {
  AgentKit,
  CdpWalletProvider,
  walletActionProvider,
} from "@coinbase/agentkit";

import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { HumanMessage } from "@langchain/core/messages";
import { MemorySaver } from "@langchain/langgraph";
import { Serper } from "@langchain/community/tools/serper";

import { ReasonTool } from "@/lib/tools/reason";
import { SleepTool } from "@/lib/tools/sleep";
import { readNillionRecordsWithSchema } from "@/lib/nillion/core/read";
import { Party } from "@/types/party";
import { Mediation } from "@/types/mediation";
import { ModelId } from "@/lib/models/models";
import { MODEL_IDS } from "@/lib/models/models";
import { updateNillionRecordWithSchema } from "@/lib/nillion/core/update";

type MediationResponse = {
  status: "success" | "failure";
  justification: string;
  outcomes: {
    address: string;
    amount: string;
    status: "success" | "failure";
    transactionHash: string | null;
  }[];
};

let agent: any = null;
let agentConfig: any = null;

function validateEnvironment(): boolean {
  const requiredVars = [
    "OPENAI_API_KEY",
    "CDP_API_KEY_NAME",
    "CDP_API_KEY_PRIVATE_KEY",
    "SERPER_API_KEY",
    "VENICE_API_KEY",
  ];

  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error("Missing required environment variables:", missingVars);
    return false;
  }

  return true;
}

async function initializeAgent(
  walletData: string,
  reasoningModelId: ModelId = MODEL_IDS.DEEPSEEK_R1_70B_DISPUTE
) {
  if (agent && agentConfig) {
    return { agent, agentConfig };
  }

  try {
    const llm = new ChatOpenAI({
      model: "gpt-4o-mini",
    });

    // Configure CDP Wallet Provider
    const config = {
      apiKeyName: process.env.CDP_API_KEY_NAME!,
      apiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY!.replace(
        /\\n/g,
        "\n"
      ),
      cdpWalletData: walletData,
      networkId: process.env.NETWORK_ID || "base-sepolia",
    };

    const walletProvider = await CdpWalletProvider.configureWithWallet(config);

    // Initialize AgentKit
    const agentkit = await AgentKit.from({
      walletProvider,
      actionProviders: [walletActionProvider()],
    });

    const tools = [
      ...(await getLangChainTools(agentkit)),
      new Serper(process.env.SERPER_API_KEY!),
      new ReasonTool(reasoningModelId),
      new SleepTool(),
    ];

    // Store buffered conversation history in memory
    const memory = new MemorySaver();
    agentConfig = {
      configurable: { thread_id: "CDP AgentKit API Route" },
    };

    // Create React Agent
    agent = createReactAgent({
      llm,
      tools,
      checkpointSaver: memory,
      messageModifier: `
        You are an expert onchain mediator empowered with a suite of specialized tools. 
        Your job is to help resolve issues between parties fairly and efficiently. 
        Follow these steps for every request:

        1. Research Phase: First, analyze the issue by gathering all relevant supplementary 
           information using your research tools. If you feel that research is not needed, 
           you may move to the next step.

        2. Reasoning Phase: Once you have the complete information, use the reasoning-tool 
           to analyze the findings.
           When calling the reasoning tool, you MUST provide input in the following JSON format:
           {
             "research": "Any research findings from the research phase",
             "description": "A clear description of the dispute",
             "totalFunds": "The total amount of funds available to distribute",
             "parties": [
               {
                 "address": "wallet address of party 1",
                 "evidence": "evidence or arguments from party 1",
                 "minSplit": "optional minimum percentage split required by party 1"
               },
               {
                 "address": "wallet address of party 2",
                 "evidence": "evidence or arguments from party 2",
                 "minSplit": "optional minimum percentage split required by party 2"
               }
             ]
           }
           The tool will return an outcome which you must obey. Do not deviate from this outcome. 
           Only ever call the reasoning tool once.

        3. Settlement Phase: With the outcome determined, pass this result to your settlement 
           tools to transfer the correct amount of funds to the corresponding party addresses. 
           You should use the sleep tool for 30 seconds between each transfer to avoid rate limiting and gas failures.

        Your overall goal is to coordinate these steps seamlessly. You must always obey the 
        outcome of the reasoning tool. You must always distribute all funds. You never need 
        to check any balances. Assume you have the funds available. Always respond with JSON, 
        where transactions fail because of insufficient funds, you may set the transaction 
        hash field to null.

        Your final response should be a JSON object in the following format:
        {
          "status": "Either 'resolved' or 'unresolved'",
          "justification": "The reasoning behind the outcome split. This should be a short explanation of the outcomes, not the status.",
          "outcomes": [
            {
              "address": "wallet address of party 1",
              "amount": "amount of funds to transferred",
              "status": "Either 'success' or 'failure'",
              "transactionHash": "transaction hash of the transfer"
            }
          ]
        }
      `.trim(),
    });

    return { agent, agentConfig };
  } catch (error) {
    console.error("Failed to initialize agent:", error);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!validateEnvironment()) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "Id is required" }, { status: 400 });
    }

    // Get data
    const mediationData = await readNillionRecordsWithSchema(
      "mediationSchema",
      {
        _id: id,
      }
    );
    const partiesData = await readNillionRecordsWithSchema("partySchema", {
      mediationId: id,
    });

    await updateNillionRecordWithSchema("mediationSchema", id, {
      status: "pending",
    });

    const mediation: Mediation = mediationData[0];
    const parties: Party[] = partiesData;

    const message = `
Title: ${mediation.title}\n
Description: ${mediation.description}\n
Total Funds: ${mediation.amount} ETH\n
Parties:
${parties
  .filter((p) => p.statement)
  .map((p) => `Party ${p.address}: ${p.statement}`)
  .join("\n")}`;

    const { agent, agentConfig } = await initializeAgent(
      mediation.mediatorCDPData!
    );

    const responses: any[] = [];
    const stream = await agent.stream(
      { messages: [new HumanMessage(message)] },
      agentConfig
    );

    for await (const chunk of stream) {
      if ("agent" in chunk) {
        responses.push({
          type: "agent",
          content: chunk.agent.messages[0].content,
        });
      } else if ("tools" in chunk) {
        responses.push({
          type: "tools",
          content: chunk.tools.messages[0].content,
        });
      }
    }

    const lastResponse = responses[responses.length - 1].content;

    const jsonString = lastResponse.replace(/^```json\n|\n```$/g, "");
    console.log(responses);

    const result = JSON.parse(jsonString) as MediationResponse;
    console.log(result);

    await updateNillionRecordWithSchema("mediationSchema", id, {
      status: result.status,
      resolution: result.justification,
    });

    for (const outcome of result.outcomes) {
      const id = parties.find((p) => p.address === outcome.address)!._id;
      await updateNillionRecordWithSchema("partySchema", id, {
        status: outcome.status === "success" ? "received" : "submitted",
        amount: outcome.amount,
        txHash: outcome.transactionHash,
        updatedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
