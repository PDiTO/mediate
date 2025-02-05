import { ModelId } from "./models";

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
