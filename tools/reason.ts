import { Tool } from "langchain/tools";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

interface PartyEvidence {
  address: string;
  evidence: string;
  minSplit?: number;
}

const openai = new OpenAI({
  apiKey: process.env.VENICE_API_KEY,
  baseURL: process.env.VENICE_BASE_URL || "https://api.venice.ai/api/v1",
});

export class ReasoningTool extends Tool {
  name = "reasoning-tool";
  description =
    "A tool for determining fair outcomes between parties in a dispute based on evidence and requirements";

  constructor() {
    super();
  }

  async _call(input: string): Promise<string> {
    console.log("ReasoningTool input:", input);

    try {
      const inputData = JSON.parse(input);
      const { description, parties } = inputData;

      // Build the user prompt by combining description and evidence
      let userPrompt = description + "\n\n";
      parties.forEach((party: PartyEvidence, index: number) => {
        userPrompt += `Party ${index + 1} (${party.address}) Evidence: ${
          party.evidence
        }`;
        if (party.minSplit !== undefined) {
          userPrompt += ` Minimum acceptable split: ${party.minSplit}%`;
        }
        userPrompt += "\n";
      });

      const completion = await openai.chat.completions.create({
        model: process.env.VENICE_MODEL_NAME || "deepseek-r1-671b",
        messages: [
          {
            role: "system",
            content: `You are a resolution expert who analyzes disputes and evidence to determine fair outcomes. You must ALWAYS respond with a JSON object in the following format:

{
  "summary": "A summary of the dispute and your reasoning",
  "parties": [
    {
      "address": "address of party 1",
      "amount": number representing the fair amount for party 1
    },
    {
      "address": "address of party 2",
      "amount": number representing the fair amount for party 2
    }
  ]
}

The amounts should be numbers representing the fair split of the total disputed amount, where the sum of all amounts equals the total amount in dispute. Base your decision on the evidence provided and any minimum split requirements specified by the parties.`,
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
      });

      let completionObject = completion;
      if (typeof completion === "string") {
        try {
          completionObject = JSON.parse(completion);
        } catch (err) {
          console.error("Error parsing completion string:", err);
        }
      }

      return completionObject.choices[0].message.content ?? "";
    } catch (error) {
      console.error("Error in reasoning tool:", error);
      throw new Error(`Failed to process reasoning request: ${error}`);
    }
  }
}

// Example usage:
/*
const reasoningTool = new ReasoningTool();
const input = {
  systemPrompt: "You are a resolution expert...",
  description: "Contract dispute regarding payment for services rendered.",
  parties: [
    {
      address: "0x123...abc",
      evidence: "I didn't get paid for my work...",
      minSplit: 50
    },
    {
      address: "0x456...def",
      evidence: "The quality of the work was not good...",
      minSplit: 75
    }
  ]
};

const result = await reasoningTool.call(JSON.stringify(input));
console.log(result);
*/
