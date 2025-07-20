import { createContext, useContext, useState } from "react";

const SettingsContext = createContext(null);

export function useSettings() {
  return useContext(SettingsContext);
}

export function SettingsProvider({ children }) {
  const [showOkChecks, setShowOkChecks] = useState<boolean>(
    // localStorage.getItem("show_ok_checks") === "true"
    true
  );

  function toggleSetShowOkChecks() {
    localStorage.setItem("show_ok_checks", showOkChecks ? "false" : "true");
    setShowOkChecks((prev) => !prev);
  }

  return (
    <SettingsContext.Provider value={{ showOkChecks, toggleSetShowOkChecks }}>
      {children}
    </SettingsContext.Provider>
  );
}
