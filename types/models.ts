export const MODEL_IDS = {
  DEEPSEEK_R1_671B_FUND: "deepseek-r1-671b",
  DEEPSEEK_R1_671B_DISPUTE: "deepseek-r1-671b-dispute",
} as const;

export const MODEL_NAMES = {
  [MODEL_IDS.DEEPSEEK_R1_671B_FUND]: "DeepSeek R1 Funding Model",
  [MODEL_IDS.DEEPSEEK_R1_671B_DISPUTE]: "DeepSeek R1 Dispute Model",
} as const;

export const MODEL_DESCRIPTIONS = {
  [MODEL_IDS.DEEPSEEK_R1_671B_FUND]:
    "DeepSeek Reasoning model optimised for funding decisions and token distribution schemes.",
  [MODEL_IDS.DEEPSEEK_R1_671B_DISPUTE]:
    "DeepSeek Reasoning model optimised for settling disputes between two parties.",
} as const;

export const MODEL_SYSTEM_PROMPTS = {
  [MODEL_IDS.DEEPSEEK_R1_671B_FUND]:
    "You are a funding model that is used to make funding decisions and token distribution schemes.",
  [MODEL_IDS.DEEPSEEK_R1_671B_DISPUTE]:
    "You are a dispute model that is used to settle disputes between two parties.",
} as const;

// Type for model IDs
export type ModelId = (typeof MODEL_IDS)[keyof typeof MODEL_IDS];

// Helper function to get human readable name
export function getModelName(modelId: ModelId): string {
  return MODEL_NAMES[modelId] || modelId;
}

// Helper function to get model description
export function getModelDescription(modelId: ModelId): string {
  return MODEL_DESCRIPTIONS[modelId] || "";
}

// Helper function to get model system prompt
export function getModelSystemPrompt(modelId: ModelId): string {
  return MODEL_SYSTEM_PROMPTS[modelId] || "";
}
