export type ModelId = (typeof MODEL_IDS)[keyof typeof MODEL_IDS];

type ModelConfig = {
  name: string;
  description: string;
  systemPrompt: string;
  model: string;
};

export type Models = {
  readonly [K in ModelId]: ModelConfig;
};

export const MODEL_IDS = {
  DEEPSEEK_R1_671B_FUND: "deepseek-r1-671b",
  DEEPSEEK_R1_671B_DISPUTE: "deepseek-r1-671b-dispute",
  OPENAI_GPT_4O: "gpt-4o-dispute",
} as const;

export const MODELS: Models = {
  [MODEL_IDS.DEEPSEEK_R1_671B_FUND]: {
    name: "DeepSeek R1 Funding Model",
    description:
      "DeepSeek Reasoning model optimised for funding decisions and token distribution schemes.",
    systemPrompt:
      "You are a funding model that is used to make funding decisions and token distribution schemes.",
    model: "deepseek-r1-671b",
  },
  [MODEL_IDS.DEEPSEEK_R1_671B_DISPUTE]: {
    name: "DeepSeek R1 Dispute Model",
    description:
      "DeepSeek Reasoning model optimised for settling disputes between two parties.",
    systemPrompt:
      "You are a dispute model that is used to settle disputes between two parties.",
    model: "deepseek-r1-671b",
  },
  [MODEL_IDS.OPENAI_GPT_4O]: {
    name: "OpenAI GPT-4o Dispute Model",
    description:
      "OpenAI GPT-4o model optimised for settling disputes between two parties.",
    systemPrompt:
      "You are a dispute model that is used to settle disputes between two parties.",
    model: "gpt-4o",
  },
} as const;

export function getModel(modelId: ModelId): ModelConfig {
  return MODELS[modelId];
}

const model = getModel("deepseek-r1-671b");
