import type { IDifficulty } from "./difficulty_interface";

export interface IBeatmap {
  id: number;
  folder_path: string;
  audio_path: string;
  bg_path: string | null;
  video_path: string | null;
  artist: string;
  title: string;
  creator: string;
  difficulties: Array<IDifficulty>;
}
