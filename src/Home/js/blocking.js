// THIS IS A BLOCKING SCRIPT ANYTHING ADDED HERE WILL ADD TO THE PAGE LOAD TIME
const useDarkMode = () => {
  document.documentElement.classList.add("dark");
  // localStorage.setItem("theme", "dark");
};

const useLightMode = () => {
  document.documentElement.classList.remove("dark");
  // localStorage.setItem("theme", "light");
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
        e.matches ? useDarkMode() : useLightMode();
      }
    });
};

const initTheme = () => {
  try {
    if (localStorage.getItem("theme") === "dark") {
      useDarkMode();
      return;
    }

    if (localStorage.getItem("theme") === "light") {
      useLightMode();
      return;
    }

    if (window.matchMedia && !localStorage.getItem("theme")) {
      const osPreference = getOSPreference();
      if (osPreference === "dark") {
        useDarkMode();
        return;
      }

      useLightMode();
    }
  } catch (e) {
    console.error("Error initializing theme:", e);
    useLightMode();
  }
};

initTheme();
watchOSTheme();
