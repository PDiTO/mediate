import { ModelId } from "../lib/models/models";

export interface Mediation {
  _id: string;
  title: string;
  description: string;
  amount: number;
  createdAt: string;
  creator: string;
  parties: string[];
  model: ModelId;
  status: "open" | "funded" | "pending" | "resolved" | "unresolved";
  mediator?: string;
  mediatorCDPData?: string;
  resolution?: string;
  resolutionDate?: string;
}

export interface MediationWithParties extends Mediation {
  partiesStatus: string[];
}
