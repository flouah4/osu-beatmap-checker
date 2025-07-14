import { createContext, useContext, useEffect, useState } from "react";
import type { IBeatmap } from "../types/beatmap_interface";
import type { CheckStatus, ICheck } from "../types/check_interface";

const BeatmapContext = createContext(null!);

export function useBeatmap() {
  return useContext(BeatmapContext);
}

export function BeatmapProvider({ children }) {
  const [beatmap, setBeatmap] = useState<IBeatmap | null>(null);
  const [checks, setChecks] = useState<ICheck[]>([]);
  const [generalStatus, setGeneralStatus] = useState<CheckStatus | null>(null);
  const [isChecking, setIsChecking] = useState<boolean>(false);

  function selectBeatmap(beatmap_id: number) {
    (window as any).api.osu
      .check_beatmap(beatmap_id)
      .then((checks: ICheck[]) => {
        setChecks(checks);
      });
  }

  useEffect(() => {
    console.log("New checks", checks);
  }, [checks]);

  return (
    <BeatmapContext.Provider value={{ selectBeatmap }}>
      {children}
    </BeatmapContext.Provider>
  );
}
