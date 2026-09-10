// THIS IS A BLOCKING SCRIPT ANYTHING ADDED HERE WILL ADD TO THE PAGE LOAD TIME
import { setDefaultConsent } from "./consent.js";

// Consent defaults must be in the dataLayer before GTM loads.
setDefaultConsent();

const useDarkMode = () => {
  document.documentElement.classList.add("dark");
  // localStorage.setItem("theme", "dark");
};

const useLightMode = () => {
  document.documentElement.classList.remove("dark");
  // localStorage.setItem("theme", "light");
};

const updateBgGrid = (theme) => {
  const targets = [
    document.querySelector("main"),
    document.querySelector("footer")
  ].filter(Boolean);

  if (!targets.length) return;

  targets.forEach((element) => {
    if (theme === "dark") {
      if (element.classList.contains("bgGridWhite")) {
        element.classList.replace("bgGridWhite", "bgGridDark");
      }
    } else {
      if (element.classList.contains("bgGridDark")) {
        element.classList.replace("bgGridDark", "bgGridWhite");
      }
    }
  });
};

const getOSPreference = () => {
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const watchOSTheme = () => {
  window
    .matchMedia?.("(prefers-color-scheme: dark)")
    .addEventListener("change", (e) => {
      if (!localStorage.getItem("theme")) {
        if (e.matches) {
          useDarkMode();
          updateBgGrid("dark");
        } else {
          useLightMode();
          updateBgGrid("light");
        }
      }
    });
};

const initTheme = () => {
  try {
    let currentTheme = "light";
    
    if (localStorage.getItem("theme") === "dark") {
      useDarkMode();
      currentTheme = "dark";
    } else if (localStorage.getItem("theme") === "light") {
      useLightMode();
      currentTheme = "light";
    } else if (window.matchMedia && !localStorage.getItem("theme")) {
      const osPreference = getOSPreference();
      if (osPreference === "dark") {
        useDarkMode();
        currentTheme = "dark";
      } else {
        useLightMode();
        currentTheme = "light";
      }
    }
    
    // Update bgGrid after DOM is ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => updateBgGrid(currentTheme));
    } else {
      updateBgGrid(currentTheme);
    }
  } catch (e) {
    console.error("Error initializing theme:", e);
    useLightMode();
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => updateBgGrid("light"));
    } else {
      updateBgGrid("light");
    }
  }
};

initTheme();
watchOSTheme();
