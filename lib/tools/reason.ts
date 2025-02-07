import { z } from "zod";
import { StructuredTool } from "@langchain/core/tools";
import OpenAI from "openai";
import dotenv from "dotenv";
import { ModelConfig, ModelId, getModel } from "../models/models";
import { MODEL_IDS } from "../models/models";

dotenv.config();

// Define input schema using zod
const ReasonInputSchema = z.object({
  description: z.string().describe("The description of the issue"),
  research: z.string().optional().describe("The research findings"),
  parties: z.array(
    z.object({
      address: z.string().describe("The address of the party"),
      evidence: z.string().describe("The evidence given by the party"),
      minSplit: z
        .number()
        .optional()
        .describe("The minimum split for the party"),
    })
  ),
});

const openai = new OpenAI({
  apiKey: process.env.VENICE_API_KEY,
  baseURL: process.env.VENICE_BASE_URL || "https://api.venice.ai/api/v1",
});

export class ReasonTool extends StructuredTool {
  name = "reason-new-tool";
  description =
    "A tool for determining fair outcomes between parties in a dispute based on evidence, requirements, and research findings";
  schema = ReasonInputSchema;
  private modelConfig: ModelConfig;

  constructor(modelId: ModelId = MODEL_IDS.DEEPSEEK_R1_70B_DISPUTE) {
    super();
    this.modelConfig = getModel(modelId);
  }

  async _call(input: z.infer<typeof ReasonInputSchema>): Promise<string> {
    console.log("ReasonNewTool input:", input);

    try {
      const { research, description, parties } = input;

      // Build the user prompt by combining description, research, and evidence
      let userPrompt = description + "\n\n";

      // Add research findings if available
      if (research) {
        userPrompt += "Research Findings:\n" + research + "\n\n";
      }

      // Add party evidence
      userPrompt += "Party Evidence:\n";
      parties.forEach((party, index) => {
        userPrompt += `Party ${index + 1} (${party.address}) Evidence: ${
          party.evidence
        }`;
        if (party.minSplit !== undefined) {
          userPrompt += ` Minimum acceptable split: ${party.minSplit}%`;
        }
        userPrompt += "\n";
      });

      const completion = await openai.chat.completions.create({
        model: this.modelConfig.model,
        messages: [
          {
            role: "system",
            content:
              this.modelConfig.systemPrompt +
              `\n\nYou must ALWAYS respond with a JSON object in the following format:

{
  "summary": "A summary of the dispute, research findings, and your reasoning",
  "parties": [
    {
      "address": "address of party 1",
      "amount": number representing the fair amount for party 1,
      "justification": "specific reasoning for this party's allocation"
    },
    {
      "address": "address of party 2",
      "amount": number representing the fair amount for party 2,
      "justification": "specific reasoning for this party's allocation"
    }
  ],
  "confidence_score": number between 0 and 1 representing confidence in the decision
}

The amounts should be numbers representing the fair split of the total disputed amount, where the sum of all amounts equals the total amount in dispute. Base your decision on the research findings, evidence provided, and any minimum split requirements specified by the parties.`,
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
