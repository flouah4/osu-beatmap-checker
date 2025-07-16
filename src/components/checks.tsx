import { checkSvg } from "../data/check_svg";
import type { ICheck } from "../types/check_interface";

export function Checks({ checks }: { checks: ICheck[] }) {
  return (
    <div className="flex flex-col gap-2">
      {checks.map((check: ICheck, i: number) => (
        <div key={i} className="flex gap-2.5">
          <div className="min-w-5 min-h-5">
            <img src={checkSvg[check.status]} />
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
      ))}
    </div>
  );
}
