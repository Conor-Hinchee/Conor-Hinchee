(() => {
  var e = function () {
    document.documentElement.classList.add("dark"),
      localStorage.setItem("theme", "dark");
  };
  "dark" !== localStorage.getItem("theme")
    ? "light" !== localStorage.getItem("theme") &&
      window.matchMedia &&
      !localStorage.getItem("theme") &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
      ? e()
      : (document.documentElement.classList.remove("dark"),
        localStorage.setItem("theme", "light"))
    : e();
})();
