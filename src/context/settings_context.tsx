import { createContext, useContext, useState, useEffect } from "react";

const SettingsContext = createContext(null);

export function useSettings() {
  return useContext(SettingsContext);
}

export function SettingsProvider({ children }) {
  const [showOkChecks, setShowOkChecks] = useState<boolean>(
    localStorage.getItem("show_ok_checks") === "true"
  );
  const [darkMode, setDarkMode] = useState<boolean>(
    // Default to light mode (false) if no item is stored
    localStorage.getItem("dark_mode") === "true" || false 
  );

  function toggleShowOkChecks() {
    localStorage.setItem("show_ok_checks", showOkChecks ? "false" : "true");
    setShowOkChecks((prev) => !prev);
  }

  function toggleDarkMode() {
    localStorage.setItem("dark_mode", darkMode ? "false" : "true");
    setDarkMode((prev) => !prev);
  }

  // Apply theme to document body when darkMode changes
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    }
  }, [darkMode]);

  // Apply initial theme on mount
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.add('light-theme');
    }
  }, []);

  return (
    <SettingsContext.Provider value={{ showOkChecks, toggleShowOkChecks, darkMode, toggleDarkMode }}>
      {children}
    </SettingsContext.Provider>
  );
}
