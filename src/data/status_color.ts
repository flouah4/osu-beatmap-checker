import { CheckStatus } from "../types/check_interface";

export const statusColor = {
  [CheckStatus.Ok]: "bg-neo-green",
  [CheckStatus.Info]: "bg-neo-blue",
  [CheckStatus.Warning]: "bg-neo-yellow",
  [CheckStatus.Issue]: "bg-neo-red",
  null: "bg-neo-blue",
};
