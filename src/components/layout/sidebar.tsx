import { useEffect, useState } from "react";
import { useDebounce } from "../../hooks/use_debounce";
import { useBeatmap } from "../../context/beatmap_context";

interface IBeatmapInfo {
  id: number;
  artist: string;
  title: string;
  creator: string;
}

export function Sidebar() {
  const [beatmaps, setBeatmaps] = useState<IBeatmapInfo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [search, setSearch] = useState<string>("");
  const { value } = useDebounce(search);

  const { selectBeatmap } = useBeatmap();

  useEffect(() => {
    setIsLoading(true);
    (window as any).api.osu
      .get_beatmaps(value)
      .then((result: IBeatmapInfo[]) => {
        setIsLoading(false);
        setBeatmaps(result);
      });
  }, [value]);

  useEffect(() => {
    console.log("Logging new beatmaps", beatmaps);
  }, [beatmaps]);

  return (
    <div className="flex flex-col gap-4 border-r-4 p-4 w-[300px] overflow-auto scrollbar-hidden">
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        type="text"
        placeholder="Search beatmap"
        className="bg-input placeholder:text-small text-small px-4 py-2 border-2 rounded-[4px] outline-0"
      />
      <div className="flex flex-col gap-3">
        {isLoading && <p className="text-small">Loading beatmaps...</p>}
        {beatmaps.length === 0 && (
          <p className="text-small">No beatmaps found</p>
        )}
        {beatmaps.length >= 1 &&
          beatmaps.map((beatmap, i) => (
            <div
              key={i}
              onClick={() => selectBeatmap(beatmap.id)}
              className="flex flex-col gap-1 bg-neo-blue neo-box px-4 py-2 cursor-pointer last:mb-14"
            >
              <p className="text-regular leading-[16px] text-center">
                {beatmap.artist} - {beatmap.title}
              </p>
              <p className="text-small text-center">
                mapped by {beatmap.creator}
              </p>
            </div>
          ))}
      </div>
    </div>
  );
}
