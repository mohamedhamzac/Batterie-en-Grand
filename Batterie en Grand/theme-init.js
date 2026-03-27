const THEME_STORAGE_KEY = "batterie-en-grand-theme";

try {
  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  const resolvedTheme = storedTheme === "dark" || storedTheme === "light"
    ? storedTheme
    : (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

  document.documentElement.classList.toggle("theme-dark", resolvedTheme === "dark");
  document.documentElement.classList.toggle("theme-light", resolvedTheme === "light");
} catch {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.classList.toggle("theme-dark", prefersDark);
  document.documentElement.classList.toggle("theme-light", !prefersDark);
}
