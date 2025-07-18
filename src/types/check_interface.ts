export interface ICheck {
  id: string;
  status: CheckStatus;
  title: string;
  details: string[];
}

export enum CheckStatus {
  Ok = "ok",
  Info = "info",
  Warning = "warning",
  Issue = "issue",
}
