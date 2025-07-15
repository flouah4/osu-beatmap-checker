import { createContext, useContext, useEffect, useState } from "react";
import type { IBeatmap } from "../types/beatmap_interface";
import { CheckStatus, type ICheck } from "../types/check_interface";

const BeatmapContext = createContext(null!);

export function useBeatmap() {
  return useContext(BeatmapContext);
}

export function BeatmapProvider({ children }) {
  const [beatmap, setBeatmap] = useState<IBeatmap | null>(null);
  const [checks, setChecks] = useState<ICheck[]>([]);
  const [generalStatus, setGeneralStatus] = useState<CheckStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  function selectBeatmap(beatmap_id: number) {
    setIsLoading(true);
    (window as any).api.osu
      .check_beatmap(beatmap_id)
      .then(({ beatmap, checks }: { beatmap: IBeatmap; checks: ICheck[] }) => {
        setIsLoading(false);
        setBeatmap(beatmap);
        setChecks(checks);
      });
  }

  useEffect(() => {
    console.log("New beatmap", beatmap);
  }, [beatmap]);

  useEffect(() => {
    console.log("New checks", checks);

    if (checks.some((check) => check.status === CheckStatus.Issue)) {
      setGeneralStatus(CheckStatus.Issue);
    } else if (checks.some((check) => check.status === CheckStatus.Warning)) {
      setGeneralStatus(CheckStatus.Warning);
    } else {
      setGeneralStatus(CheckStatus.Ok);
    }
  }, [checks]);

  return (
    <BeatmapContext.Provider
      value={{ beatmap, checks, generalStatus, isLoading, selectBeatmap }}
    >
      {children}
    </BeatmapContext.Provider>
  );
}
