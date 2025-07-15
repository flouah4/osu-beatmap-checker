import type { IDifficulty } from "./difficulty_interface";

export interface IBeatmap {
  id: number;
  artist: string;
  title: string;
  creator: string;
  difficulties: Array<IDifficulty>;
}
