import { APP_VERSION } from "../data/version";

export function Topbar() {
  function openUrl(url: string) {
    (window as any).api.link.open(url);
  }
  function minimize() {
    (window as any).api.window.minimize();
  }
  function close() {
    (window as any).api.window.close();
  }

  return (
    <div className="flex border-b-4 divide-x-4">
      <div className="drag bg-neo-blue px-4 py-2 flex items-center justify-between w-full">
        <p>
          <span className="text-title">Beatmap Checker</span>{" "}
          <span className="text-small-bold">by</span>{" "}
          <span
            onClick={() => openUrl("https://osu.ppy.sh/users/8030129")}
            className="text-small-bold underline cursor-pointer no-drag"
          >
            flouah
          </span>
        </p>
        <p className="text-small-bold">{APP_VERSION}</p>
      </div>
      <div
        onClick={minimize}
        className="bg-neo-yellow px-4 flex items-center justify-center cursor-pointer"
      >
        <svg
          width="24"
          height="25"
          viewBox="0 0 24 25"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5 12.5H19"
            stroke="#614054"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div
        onClick={close}
        className="bg-neo-red px-4 flex items-center justify-center cursor-pointer"
      >
        <svg
          width="24"
          height="25"
          viewBox="0 0 24 25"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M18 6.5L6 18.5"
            stroke="#614054"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M6 6.5L18 18.5"
            stroke="#614054"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}
