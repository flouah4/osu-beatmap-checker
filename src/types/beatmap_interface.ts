import type { IDifficulty } from "./difficulty_interface";

export interface IBeatmap {
  folder_path: string;
  artist: string;
  title: string;
  creator: string;
  difficulties: Array<IDifficulty>;
}

export type BeatmapPath = IBeatmap["folder_path"];
