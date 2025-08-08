import { useSettings } from "../context/settings_context";
import { checkSvg } from "../data/check_svg";
import { CheckStatus, type ICheck } from "../types/check_interface";
import Detail from "./detail";

export function Checks({ checks }: { checks: ICheck[] }) {
  const { showOkChecks, darkMode } = useSettings();

  const notOkChecks = checks.filter(
    (check) =>
      check.status === CheckStatus.Warning || check.status === CheckStatus.Issue
  );
  const checksToDisplay = showOkChecks ? checks : notOkChecks;

  return (
    <div className="flex flex-col gap-2">
      {checksToDisplay.map((check, i) => (
        <div key={i} className="flex gap-2.5">
          <div className="min-w-5 min-h-5">
            <img src={(darkMode ? checkSvg.dark : checkSvg.light)[check.status]} />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-regular">{check.title}</p>
            {check.details.map((detail, i) => (
              <Detail key={i} text={detail} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
