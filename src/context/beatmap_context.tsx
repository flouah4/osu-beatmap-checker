import { createContext, useContext, useEffect, useState } from "react";
import type { BeatmapPath, IBeatmap } from "../types/beatmap_interface";
import { CheckStatus, type ICheck } from "../types/check_interface";
import type { DifficultyPath } from "../types/difficulty_interface";

const BeatmapContext = createContext(null);

export function useBeatmap() {
  return useContext(BeatmapContext);
}

export function BeatmapProvider({ children }) {
  const [beatmap, setBeatmap] = useState<IBeatmap | null>(null);
  const [generalStatus, setGeneralStatus] = useState<CheckStatus | null>(null);
  const [generalChecks, setGeneralChecks] = useState<ICheck[]>([]);
  /**
   * The structure of the difficulty checks is made of osu file path keys and
   * object values which store the general status of the difficulty and its checks
   *
   * For example:
   * {
   *   "C:\Users\*****\AppData\Local\osu!\Songs\2387463 Lady Gaga - Poker Face\Lady Gaga - Poker Face (Neto) [Collab Insane].osu": {
   *     general_status: "ok",
   *     checks: [...]
   *   }
   * }
   *
   * The reason we use the .osu file path to identify difficulties is to be able
   * to store beatmaps which don't have an id because they are not uploaded
   */
  const [difficultyChecks, setDifficultyChecks] = useState<
    Record<DifficultyPath, { general_status: CheckStatus; checks: ICheck[] }>
  >({});
  const [isLoadingGeneral, setIsLoadingGeneral] = useState<boolean>(false);
  const [isLoadingDifficulty, setIsLoadingDifficulty] =
    useState<boolean>(false);
  const [selectedDifficulty, setSelectedDifficulty] =
    useState<DifficultyPath | null>(null);
  const [isSelectedGeneral, setIsSelectedGeneral] = useState<boolean>(false);

  function isBeatmapSelected(beatmapFolderPath: BeatmapPath) {
    return beatmap && beatmap.folder_path === beatmapFolderPath;
  }

  function isDifficultySelected(osuFilePath: DifficultyPath) {
    return selectedDifficulty && selectedDifficulty === osuFilePath;
  }

  function getDifficultyGeneralStatus(osuFilePath: DifficultyPath) {
    const object = difficultyChecks[osuFilePath];
    if (!object) {
      return null;
    }
    return object.general_status;
  }

  function getDifficultyChecks(osuFilePath: DifficultyPath) {
    const object = difficultyChecks[osuFilePath];
    if (!object) {
      return null;
    }
    return object.checks;
  }

  function selectGeneral() {
    setIsSelectedGeneral(true);
  }

  function selectBeatmap(beatmapFolderPath: BeatmapPath) {
    if (isBeatmapSelected(beatmapFolderPath)) {
      return;
    }

    setIsLoadingGeneral(true);
    setIsSelectedGeneral(true);

    (window as any).api.osu
      .check_beatmap_general(beatmapFolderPath)
      .then(
        ({
          beatmap,
          general_status,
          checks,
        }: {
          beatmap: IBeatmap;
          general_status: CheckStatus;
          checks: ICheck[];
        }) => {
          setBeatmap(beatmap);
          setGeneralStatus(general_status);
          setGeneralChecks(checks);
          setIsLoadingGeneral(false);
          console.log("the checks:", checks);
        }
      );
  }

  function selectDifficulty(osuFilePath: DifficultyPath) {
    if (isDifficultySelected(osuFilePath)) {
      return;
    }

    setIsLoadingDifficulty(true);
    setSelectedDifficulty(osuFilePath);
    setIsSelectedGeneral(false);

    (window as any).api.osu
      .check_difficulty(osuFilePath)
      .then(
        ({
          general_status,
          checks,
        }: {
          general_status: CheckStatus;
          checks: ICheck[];
        }) => {
          setDifficultyChecks((prev) => ({
            ...prev,
            [osuFilePath]: { general_status, checks },
          }));
          setIsLoadingDifficulty(false);
        }
      );
  }

  useEffect(() => {
    console.log("New beatmap", beatmap);
  }, [beatmap]);
  useEffect(() => {
    console.log("New general checks", generalChecks);
  }, [generalChecks]);
  useEffect(() => {
    console.log("New difficulty", selectedDifficulty);
  }, [selectedDifficulty]);
  useEffect(() => {
    console.log("New difficulty checks", difficultyChecks);
  }, [difficultyChecks]);

  return (
    <BeatmapContext.Provider
      value={{
        beatmap,
        generalStatus,
        generalChecks,
        difficultyChecks,
        isLoadingGeneral,
        isLoadingDifficulty,
        selectedDifficulty,
        isSelectedGeneral,
        isBeatmapSelected,
        isDifficultySelected,
        getDifficultyGeneralStatus,
        getDifficultyChecks,
        selectGeneral,
        selectBeatmap,
        selectDifficulty,
      }}
    >
      {children}
    </BeatmapContext.Provider>
  );
}
