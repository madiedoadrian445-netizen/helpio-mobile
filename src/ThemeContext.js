// src/ThemeContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ThemeContext = createContext();

const lightTheme = {
  mode: "light",
  background: "#F9FAFF",
  card: "#FFFFFF",
  text: "#000000",
  subtleText: "#6E6E73",
  accent: "#00A6FF",
  blurTint: "light",
  pillBg: "rgba(255,255,255,0.7)",
};

const darkTheme = {
  mode: "dark",
  background: "#000000",
  card: "#1C1C1E",
  text: "#FFFFFF",
  subtleText: "#9E9E9E",
  accent: "#00A6FF",
  blurTint: "dark",
  pillBg: "rgba(40,40,40,0.7)",
};

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem("darkMode").then((value) => {
      if (value !== null) setDarkMode(JSON.parse(value));
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleTheme = () => setDarkMode((prev) => !prev);

  const theme = darkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
