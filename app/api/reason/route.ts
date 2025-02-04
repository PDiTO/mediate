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
    "NEXT_PUBLIC_OPENAI_API_KEY",
    "NEXT_PUBLIC_CDP_API_KEY_NAME",
    "NEXT_PUBLIC_CDP_API_KEY_PRIVATE_KEY",
    "NEXT_PUBLIC_SERPER_API_KEY",
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
      model: process.env.NEXT_PUBLIC_MODEL_NAME ?? "gpt-4o-mini",
    });

    // Configure CDP Wallet Provider
    const config = {
      apiKeyName: process.env.NEXT_PUBLIC_CDP_API_KEY_NAME!,
      apiKeyPrivateKey:
        process.env.NEXT_PUBLIC_CDP_API_KEY_PRIVATE_KEY!.replace(/\\n/g, "\n"),
      networkId: process.env.NEXT_PUBLIC_NETWORK_ID || "base-sepolia",
    };

    const walletProvider = await CdpWalletProvider.configureWithWallet(config);

    // Initialize AgentKit
    const agentkit = await AgentKit.from({
      walletProvider,
      actionProviders: [
        wethActionProvider(),
        pythActionProvider(),
        walletActionProvider(),
        erc20ActionProvider(),
        cdpApiActionProvider({
          apiKeyName: process.env.NEXT_PUBLIC_CDP_API_KEY_NAME!,
          apiKeyPrivateKey:
            process.env.NEXT_PUBLIC_CDP_API_KEY_PRIVATE_KEY!.replace(
              /\\n/g,
              "\n"
            ),
        }),
        cdpWalletActionProvider({
          apiKeyName: process.env.NEXT_PUBLIC_CDP_API_KEY_NAME!,
          apiKeyPrivateKey:
            process.env.NEXT_PUBLIC_CDP_API_KEY_PRIVATE_KEY!.replace(
              /\\n/g,
              "\n"
            ),
        }),
      ],
    });

    const tools = [
      ...(await getLangChainTools(agentkit)),
      new Serper(process.env.NEXT_PUBLIC_SERPER_API_KEY!),
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
        You are a helpful agent that can interact onchain using the Coinbase Developer Platform AgentKit.
        You are empowered to interact onchain using your tools. If you ever need funds, you can request
        them from the faucet if you are on network ID 'base-sepolia'. If not, you can provide your wallet
        details and request funds from the user. Before executing your first action, get the wallet details
        to see what network you're on. If there is a 5XX (internal) HTTP error code, ask the user to try
        again later. If someone asks you to do something you can't do with your currently available tools,
        you must say so, and encourage them to implement it themselves using the CDP SDK + Agentkit,
        recommend they go to docs.cdp.coinbase.com for more information. Be concise and helpful with your
        responses. Refrain from restating your tools' descriptions unless it is explicitly requested.
        
        You are specifically focused on helping mediate disputes and agreements between parties. Your role
        is to help understand the situation, propose fair solutions, and if needed, help implement those
        solutions using smart contracts and on-chain actions.
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
