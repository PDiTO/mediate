export interface Party {
  _id: string;
  mediationId: string;
  address: string;
  statement: string;
  amount: string;
  txHash: string;
  createdAt: string;
  updatedAt: string;
  status: "submitted" | "received";
}
