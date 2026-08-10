export type OperationKind = "receivable" | "payable" | "undetermined";

export interface Account {
  id: string;
  name: string;
  startingBalance: number;
  createdAt: string;
}

export interface Operation {
  id: string;
  accountId: string;
  kind: OperationKind;
  amount: number | null;
  date: string; // ISO
  details: string;
  createdAt: string;
}

export interface AppSettings {
  language: "ar" | "en";
  theme: "system" | "light" | "dark";
  currency: string;
}

export const signedAmount = (op: Operation): number => {
  if (op.kind === "undetermined" || op.amount == null) return 0;
  return op.kind === "payable" ? -Math.abs(op.amount) : Math.abs(op.amount);
};

export const balanceTone = (value: number): "positive" | "negative" | "neutral" =>
  value > 0.0001 ? "positive" : value < -0.0001 ? "negative" : "neutral";

export const kindTone = (kind: OperationKind): "positive" | "negative" | "neutral" =>
  kind === "receivable" ? "positive" : kind === "payable" ? "negative" : "neutral";
