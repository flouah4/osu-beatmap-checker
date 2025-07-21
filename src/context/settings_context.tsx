import { createContext, useContext, useState } from "react";

const SettingsContext = createContext(null);

export function useSettings() {
  return useContext(SettingsContext);
}

export function SettingsProvider({ children }) {
  const [showOkChecks, setShowOkChecks] = useState<boolean>(
    localStorage.getItem("show_ok_checks") === "true"
  );

  function toggleShowOkChecks() {
    localStorage.setItem("show_ok_checks", showOkChecks ? "false" : "true");
    setShowOkChecks((prev) => !prev);
  }

  return (
    <SettingsContext.Provider value={{ showOkChecks, toggleShowOkChecks }}>
      {children}
    </SettingsContext.Provider>
  );
}
