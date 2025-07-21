import { useSettings } from "../../context/settings_context";
import { CloseModalButton } from "../buttons/close_modal_button";
import { Toggle } from "../toggles/toggle";

export function SettingsModal() {
  const { showOkChecks, toggleShowOkChecks } = useSettings();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-4">
          <p className="text-regular">Hide checks which are fine</p>
          <Toggle onClick={toggleShowOkChecks} isToggled={!showOkChecks} />
        </div>
      </div>
      <div className="flex justify-end w-full">
        <CloseModalButton className="hoverable-neo-box bg-neo-purple px-4 py-2 text-small-bold w-fit cursor-pointer">
          Save and close
        </CloseModalButton>
      </div>
    </div>
  );
}
