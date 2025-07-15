import { useBeatmap } from "../context/beatmap_context";
import { CheckStatus, type ICheck } from "../types/check_interface";

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
                <svg
                  width="16"
                  height="17"
                  viewBox="0 0 16 17"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M13.3334 4.5L6.00002 11.8333L2.66669 8.5"
                    stroke="#614054"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
              {check.status === CheckStatus.Warning && (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8 5.33337V8.00004"
                    stroke="#614054"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8 10.6666H8.00667"
                    stroke="#614054"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
              {check.status === CheckStatus.Issue && (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 4L4 12"
                    stroke="#614054"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M4 4L12 12"
                    stroke="#614054"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
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
