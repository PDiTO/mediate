import { NextRequest, NextResponse } from "next/server";
import {
  AgentKit,
  CdpWalletProvider,
  wethActionProvider,
  walletActionProvider,
  erc20ActionProvider,
  cdpApiActionProvider,
  cdpWalletActionProvider,
  pythActionProvider,
} from "@coinbase/agentkit";
import { ReasoningTool } from "@/tools/reason";

import { getLangChainTools } from "@coinbase/agentkit-langchain";
import { HumanMessage } from "@langchain/core/messages";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { Serper } from "@langchain/community/tools/serper";

// Initialize agent and config at module level for reuse
let agent: any = null;
let agentConfig: any = null;

/**
 * Validates that required environment variables are set
 */
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

/**
 * Initialize the agent with CDP Agentkit
 */
async function initializeAgent() {
  if (agent && agentConfig) {
    return { agent, agentConfig };
  }

  try {
    const llm = new ChatOpenAI({
      model: process.env.MODEL_NAME ?? "gpt-4o-mini",
    });

    // Configure CDP Wallet Provider
    const config = {
      apiKeyName: process.env.CDP_API_KEY_NAME!,
      apiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY!.replace(
        /\\n/g,
        "\n"
      ),
      networkId: process.env.NETWORK_ID || "base-sepolia",
    };

    const walletProvider = await CdpWalletProvider.configureWithWallet(config);

    // Initialize AgentKit
    const agentkit = await AgentKit.from({
      walletProvider,
      actionProviders: [walletActionProvider(), erc20ActionProvider()],
    });

    const tools = [
      ...(await getLangChainTools(agentkit)),
      new Serper(process.env.SERPER_API_KEY!),
      new ReasoningTool(),
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
You are an expert onchain mediator empowered with a suite of specialized tools. Your job is to help resolve issues between parties fairly and efficiently. Follow these steps for every request:

1. Research Phase: First, analyze the issue by gathering all relevant supplementary information using your research tools. If you feel that research is not needed, you may provide to the next step.

2. Reasoning Phase: Once you have the complete information, use the reasoning-tool to analyze the findings.
   When calling the reasoning tool, you MUST provide input in the following JSON format:
   {
    "research": "Any research findings from the research phase",
     "description": "A clear description of the dispute",
     "totalFunds": "The total amount of funds available to distribute",
     "parties": [
       {
         "address": "wallet address of party 1",
         "evidence": "evidence or arguments from party 1",
         "minSplit": optional minimum percentage split required by party 1
       },
       {
         "address": "wallet address of party 2",
         "evidence": "evidence or arguments from party 2",
         "minSplit": optional minimum percentage split required by party 2
       },
       ...
     ]
   }
   The tool will return an outcome which you must obey. Do not deviate from this outcome.

3. Settlement Phase: With the outcome determined, pass this result to your settlement tools to transfer the correct amount of funds to the corresponding party addresses.

Your overall goal is to coordinate these steps seamlessly. You must always obey the outcome of the reasoning tool. You must always distribute all funds. You never need to check any balances. Assume you have the funds available. Always respond with JSON, where transactions fail because of insufficient funds, you may set the transaction hash field to null.

Your final response should be a JSON object in the following format:
{
  "status": "Either 'success' or 'failure'",
  "justification": "The reasoning behind the outcome split. This should be a short explanation of the outcomes, not the status.",
  "outcomes": [
  {
    "address": "wallet address of party 1",
    "amount": "amount of funds to transferred",
    "transactionHash": "transaction hash of the transfer"
  },
  ...]
}
`,
    });

    return { agent, agentConfig };
  } catch (error) {
    console.error("Failed to initialize agent:", error);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  try {
    // Validate environment
    if (!validateEnvironment()) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Get request body
    const body = await req.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Initialize or get existing agent
    const { agent, agentConfig } = await initializeAgent();

    // Process the message
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

    return NextResponse.json({ responses });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
