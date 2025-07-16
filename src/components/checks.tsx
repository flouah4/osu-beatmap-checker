import { CheckStatus, type ICheck } from "../types/check_interface";
import okCheckSvg from "../assets/ok_check.svg";
import warningCheckSvg from "../assets/warning_check.svg";
import issueCheckSvg from "../assets/issue_check.svg";
import { statusColor } from "../data/status_color";

export function Checks({ checks }: { checks: ICheck[] }) {
  return checks.map((check: ICheck, i: number) => (
    <div key={i} className="flex gap-2.5">
      <div
        className={`${
          statusColor[check.status]
        } p-0.5 rounded-[4px] ring-2 ring-inset h-fit`}
      >
        {check.status === CheckStatus.Ok && (
          <img src={okCheckSvg} className="min-w-4 min-h-4" />
        )}
        {check.status === CheckStatus.Warning && (
          <img src={warningCheckSvg} className="min-w-4 min-h-4" />
        )}
        {check.status === CheckStatus.Issue && (
          <img src={issueCheckSvg} className="min-w-4 min-h-4" />
        )}
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-regular">{check.title}</p>
        {check.details.map((detail, i) => (
          <p key={i} className="text-small">
            {detail}
          </p>
        ))}
      </div>
    </div>
  ));
}
