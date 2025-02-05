import { Mediation } from "../types/mediation";
import { MODEL_IDS } from "../types/models";

export const testMediations: Mediation[] = [
  {
    id: "1",
    title: "NFT Transfer Dispute",
    description:
      "Dispute over an NFT transfer that failed to complete after payment",
    createdAt: "2024-03-20T10:00:00Z",
    status: "funded",
    parties: ["0x1234...", "0x5678..."],
    creator: "0x2E14e1cBb0c387F85AdAc2E31fd473db7FAe647F",
    mediatorModel: MODEL_IDS.DEEPSEEK_R1_671B_DISPUTE,
  },
  {
    id: "2",
    title: "Smart Contract Payment Issue",
    description:
      "Disagreement about milestone completion in a freelance smart contract",
    createdAt: "2024-03-19T15:30:00Z",
    status: "open",
    parties: ["0x91011...", "0x1213..."],
    mediator: "0x1415...",
    creator: "0x2E14e1cBb0c387F85AdAc2E31fd473db7FAe647F",
    mediatorModel: MODEL_IDS.DEEPSEEK_R1_671B_DISPUTE,
  },
  {
    id: "3",
    title: "DAO Governance Dispute",
    description: "Resolution of contested DAO proposal execution",
    createdAt: "2024-03-15T09:00:00Z",
    status: "resolved",
    parties: ["0x1617...", "0x1819..."],
    mediator: "0x2021...",
    creator: "0x2E14e1cBb0c387F85AdAc2E31fd473db7FAe647F",
    mediatorModel: MODEL_IDS.DEEPSEEK_R1_671B_FUND,
  },
  {
    id: "4",
    title: "DeFi Protocol Bug Compensation",
    description: "Dispute over compensation for losses due to protocol bug",
    createdAt: "2024-03-10T14:20:00Z",
    status: "unresolved",
    parties: ["0x2223...", "0x2425..."],
    mediator: "0x2627...",
    creator: "0x2E14e1cBb0c387F85AdAc2E31fd473db7FAe647F",
    mediatorModel: MODEL_IDS.DEEPSEEK_R1_671B_FUND,
  },
  {
    id: "5",
    title: "Token Vesting Schedule Dispute",
    description: "Disagreement about vesting schedule implementation",
    createdAt: "2024-03-05T11:45:00Z",
    status: "resolved",
    parties: ["0x2E14e1cBb0c387F85AdAc2E31fd473db7FAe647F", "0x3031..."],
    mediator: "0x3233...",
    creator: "0x2E14e1cBb0c387F85AdAc2E31fd473db7FAe647F",
    mediatorModel: MODEL_IDS.DEEPSEEK_R1_671B_DISPUTE,
  },
];
