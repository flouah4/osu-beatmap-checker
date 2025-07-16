import okCheckSvg from "../assets/ok_check.svg";
import infoCheckSvg from "../assets/info_check.svg";
import warningCheckSvg from "../assets/warning_check.svg";
import issueCheckSvg from "../assets/issue_check.svg";
import { CheckStatus } from "../types/check_interface";

export const checkSvg = {
  [CheckStatus.Ok]: okCheckSvg,
  [CheckStatus.Info]: infoCheckSvg,
  [CheckStatus.Warning]: warningCheckSvg,
  [CheckStatus.Issue]: issueCheckSvg,
};
