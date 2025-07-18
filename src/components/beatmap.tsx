import { useBeatmap } from "../context/beatmap_context";
import { statusColor } from "../data/status_color";
import type { IDifficulty } from "../types/difficulty_interface";
import { Checks } from "./checks";

export function Beatmap() {
  const {
    beatmap,
    isLoadingGeneral,
    generalStatus,
    isSelectedGeneral,
    generalChecks,
    isLoadingDifficulty,
    selectedDifficultyChecks,
    getDifficultyGeneralStatus,
  } = useBeatmap();

  if (!beatmap && !isLoadingGeneral) {
    return (
      <div className="flex justify-center items-center p-4 w-full text-regular">
        Select a beatmap
      </div>
    );
  } else if (isLoadingGeneral) {
    return (
      <div className="flex justify-center items-center p-4 w-full text-regular">
        Loading beatmap...
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-col bg-neo-purple px-4 py-3 border-b-4">
        <p className="text-lead  text-center">
          {beatmap.artist} - {beatmap.title}
        </p>
        <p className="text-small text-center">mapped by {beatmap.creator}</p>
      </div>
      <div className="flex flex-wrap border-b-2 divide-x-2">
        <div
          className={`${statusColor[generalStatus]} px-4 py-2 flex-1 border-b-2`}
        >
          <p className="text-regular leading-[16px] text-center">General</p>
        </div>
        {beatmap.difficulties.map((difficulty: IDifficulty, i: number) => (
          <div
            key={i}
            className={`${
              statusColor[getDifficultyGeneralStatus(difficulty.file_path)]
            } px-4 py-2 flex-1 border-b-2 cursor-not-allowed hover:`}
          >
            <p className="text-regular leading-[16px] text-center min-w-max">
              {difficulty.name}
            </p>
          </div>
        ))}
      </div>
      <div className="p-4">
        {isSelectedGeneral && <Checks checks={generalChecks} />}
        {!isSelectedGeneral && !isLoadingDifficulty && (
          <Checks checks={selectedDifficultyChecks} />
        )}
        {!isSelectedGeneral && isLoadingDifficulty && (
          <div className="flex justify-center items-center text-regular">
            Loading difficulty...
          </div>
        )}
      </div>
    </div>
  );
}
