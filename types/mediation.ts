import { ModelId } from "../lib/models/models";

export interface Mediation {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  status: "open" | "funded" | "resolved" | "unresolved";
  parties: string[]; // wallet addresses
  mediator?: string; // wallet address
  creator: string; // wallet address
  mediatorModel?: ModelId; // AI model ID
}

export interface MediationEvidence {
  address: string;
  evidence: string;
  minSplit?: number;
}
