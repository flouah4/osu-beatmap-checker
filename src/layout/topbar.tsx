import { APP_VERSION } from "../data/version";
import settingsSvg from "../assets/settings.svg";
import minusSvg from "../assets/minus.svg";
import xSvg from "../assets/x.svg";
import { useModal } from "../context/modal_context";
import { SettingsModal } from "../components/modals/settings_modal";

export function Topbar() {
  const { setModal } = useModal();

  function openSettingsModal() {
    setModal(<SettingsModal />);
  }
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
        onClick={openSettingsModal}
        className="bg-neo-green px-4 flex items-center justify-center cursor-pointer"
      >
        <div className="min-w-6 min-h-6">
          <img src={settingsSvg} />
        </div>
      </div>
      <div
        onClick={minimize}
        className="bg-neo-yellow px-4 flex items-center justify-center cursor-pointer"
      >
        <div className="min-w-6 min-h-6">
          <img src={minusSvg} />
        </div>
      </div>
      <div
        onClick={close}
        className="bg-neo-red px-4 flex items-center justify-center cursor-pointer"
      >
        <div className="min-w-6 min-h-6">
          <img src={xSvg} />
        </div>
      </div>
    </div>
  );
}
