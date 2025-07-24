/**
 * Converts bracketed timestamp markers inside plain text to clickable
 * osu://edit links.
 *
 * Example marker: [timestamp:117275,2,1]
 * Renders as: <a href="osu://edit/01:57:275-(2,1)">01:57:275 (2,1)</a>
 *
 * Notes
 * -----
 * • The first number is **milliseconds** (not mmssmmm).
 * • It is converted to mm:ss:mmm format.
 */
export default function Detail({ text }: { text: string }) {
  const TIMESTAMP_RE = /\[timestamp:(\d+(?:,\d+)*)\]/g;

  /**
   * Convert milliseconds → "mm:ss:mmm".
   * 117275 → "01:57:275"
   */
  const msToTime = (raw: string) => {
    const total = Number(raw);
    const minutes = Math.floor(total / 60000);
    const seconds = Math.floor((total % 60000) / 1000);
    const millis = total % 1000;
    return (
      String(minutes).padStart(2, "0") +
      ":" +
      String(seconds).padStart(2, "0") +
      ":" +
      String(millis).padStart(3, "0")
    );
  };

  const parts = text.split(TIMESTAMP_RE).map((chunk, i) => {
    if (i % 2 === 0) return chunk; // plain text

    const [ms, ...coords] = chunk.split(",");
    const formatted = msToTime(ms);
    const coordText = coords.length ? ` (${coords.join(",")})` : "";
    const hrefSuffix = coords.length ? `-(${coords.join(",")})` : "";
    const link = `osu://edit/${formatted}${hrefSuffix}`;

    return (
      <a key={i} href={link} className="text-small-bold flex">
        <div className="hoverable-neo-box px-1 bg-neo-blue mr-0.5">
          {formatted + coordText}
        </div>
      </a>
    );
  });

  return (
    <div className="flex flex-wrap gap-1 text-small items-center">{parts}</div>
  );
}
