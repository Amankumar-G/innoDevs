import React, { createContext, useState, useContext } from "react";

const ToggleContext = createContext();

export function ToggleProvider({ children }) {
    const [toggleDarkMode, setToggleDarkMode] = useState(true);
  
    return (
      <ToggleContext.Provider value={{ toggleDarkMode, setToggleDarkMode }}>
        {children}
      </ToggleContext.Provider>
    );
}

export function useToggle() {
    return useContext(ToggleContext);
}
