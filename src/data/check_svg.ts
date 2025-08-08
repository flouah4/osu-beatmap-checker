import okCheckSvg from "../assets/ok_check.svg";
import infoCheckSvg from "../assets/info_check.svg";
import warningCheckSvg from "../assets/warning_check.svg";
import issueCheckSvg from "../assets/issue_check.svg";
import okCheckDarkSvg from "../assets/ok_check_dark.svg";
import infoCheckDarkSvg from "../assets/info_check_dark.svg";
import warningCheckDarkSvg from "../assets/warning_check_dark.svg";
import issueCheckDarkSvg from "../assets/issue_check_dark.svg";
import { CheckStatus } from "../types/check_interface";

export const checkSvg = {
  light: {
    [CheckStatus.Ok]: okCheckSvg,
    [CheckStatus.Info]: infoCheckSvg,
    [CheckStatus.Warning]: warningCheckSvg,
    [CheckStatus.Issue]: issueCheckSvg,
  },
  dark: {
    [CheckStatus.Ok]: okCheckDarkSvg,
    [CheckStatus.Info]: infoCheckDarkSvg,
    [CheckStatus.Warning]: warningCheckDarkSvg,
    [CheckStatus.Issue]: issueCheckDarkSvg,
  },
};
