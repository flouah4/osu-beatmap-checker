import { useBeatmap } from "../context/beatmap_context";
import { CheckStatus, type ICheck } from "../types/check_interface";
import okCheckSvg from "../assets/ok_check.svg";
import warningCheckSvg from "../assets/warning_check.svg";
import issueCheckSvg from "../assets/issue_check.svg";

export function Beatmap() {
  const { beatmap, isLoading, generalStatus, checks } = useBeatmap();

  if (!beatmap) {
    return (
      <div className="flex justify-center items-center p-4 w-full text-regular">
        Select a beatmap
      </div>
    );
  } else if (isLoading) {
    return (
      <div className="flex justify-center items-center p-4 w-full text-regular">
        Loading beatmap...
      </div>
    );
  }

  const statusColor = {
    [CheckStatus.Ok]: "bg-neo-green",
    [CheckStatus.Warning]: "bg-neo-yellow",
    [CheckStatus.Issue]: "bg-neo-red",
  };

  return (
    <div className="flex flex-col w-full divide-y-4">
      <div className="flex flex-col bg-neo-purple px-4 py-3">
        <p className="text-lead  text-center">
          {beatmap.artist} - {beatmap.title}
        </p>
        <p className="text-small text-center">mapped by {beatmap.creator}</p>
      </div>
      <div className={`${statusColor[generalStatus]} px-4 py-2`}>
        <p className="text-regular leading-[16px] text-center">General</p>
      </div>
      <div className="p-4">
        {checks.map((check: ICheck, i: number) => (
          <div key={i} className="flex gap-2.5">
            <div
              className={`${
                statusColor[check.status]
              } p-0.5 rounded-[4px] ring-2 ring-inset h-fit`}
            >
              {check.status === CheckStatus.Ok && (
                <img src={okCheckSvg} alt="Ok" />
              )}
              {check.status === CheckStatus.Warning && (
                <img src={warningCheckSvg} alt="Warning" />
              )}
              {check.status === CheckStatus.Issue && (
                <img src={issueCheckSvg} alt="Issue" />
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
        ))}
      </div>
    </div>
  );
}
