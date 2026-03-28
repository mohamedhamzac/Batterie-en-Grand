const THEME_STORAGE_KEY = "batterie-en-grand-theme";

try {
  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
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
