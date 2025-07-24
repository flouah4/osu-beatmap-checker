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
    selectGeneral,
    generalChecks,
    isLoadingDifficulty,
    getDifficultyGeneralStatus,
    selectDifficulty,
    isDifficultySelected,
    getDifficultyChecks,
    selectedDifficulty,
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
          onClick={selectGeneral}
          className={`${
            isSelectedGeneral
              ? "bg-neo-purple cursor-default"
              : `${statusColor[generalStatus]} cursor-pointer`
          } px-4 py-2 flex-1 border-b-2`}
        >
          <p className="text-regular leading-[16px] text-center">General</p>
        </div>
        {beatmap.difficulties.map((difficulty: IDifficulty, i: number) => (
          <div
            key={i}
            onClick={() => selectDifficulty(difficulty.file_path)}
            className={`${
              isDifficultySelected(difficulty.file_path)
                ? "bg-neo-purple cursor-default"
                : `${
                    statusColor[
                      getDifficultyGeneralStatus(difficulty.file_path)
                    ]
                  } cursor-pointer`
            } px-4 py-2 flex-1 border-b-2`}
          >
            <p className="text-regular leading-[16px] text-center min-w-max">
              {difficulty.name}
            </p>
          </div>
        ))}
      </div>
      <div className="p-4 pb-20 overflow-auto">
        {isSelectedGeneral && <Checks checks={generalChecks} />}
        {!isSelectedGeneral && selectedDifficulty && !isLoadingDifficulty && (
          <Checks checks={getDifficultyChecks(selectedDifficulty)} />
        )}
        {!isSelectedGeneral && isLoadingDifficulty && (
          <div className="flex justify-center items-center text-regular h-full">
            Loading difficulty...
          </div>
        )}
      </div>
    </div>
  );
}
