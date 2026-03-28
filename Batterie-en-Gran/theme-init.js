(function initThemeBeforePaint() {
  const storageKey = "batterie-en-grand-theme";

  try {
    const storedTheme = localStorage.getItem(storageKey);
    const prefersDarkTheme = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const resolvedTheme = storedTheme === "dark" || storedTheme === "light"
      ? storedTheme
      : (prefersDarkTheme ? "dark" : "light");

    document.documentElement.classList.toggle("theme-dark", resolvedTheme === "dark");
  } catch {
    document.documentElement.classList.toggle(
      "theme-dark",
      window.matchMedia("(prefers-color-scheme: dark)").matches
    );
  }
})();
