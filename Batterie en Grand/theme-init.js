(function initThemeBeforePaint() {
  const storageKey = "batterie-en-grand-theme";
  const paletteStorageKey = "batterie-en-grand-palette";

  function isHexColor(value) {
    return /^#[0-9a-f]{6}$/i.test(value);
  }

  function hexToRgb(hexColor) {
    const normalized = hexColor.replace("#", "");
    return {
      r: parseInt(normalized.slice(0, 2), 16),
      g: parseInt(normalized.slice(2, 4), 16),
      b: parseInt(normalized.slice(4, 6), 16)
    };
  }

  function mixColors(colorA, colorB, weight) {
    const start = hexToRgb(colorA);
    const end = hexToRgb(colorB);

    return {
      r: Math.round(start.r + (end.r - start.r) * weight),
      g: Math.round(start.g + (end.g - start.g) * weight),
      b: Math.round(start.b + (end.b - start.b) * weight)
    };
  }

  function rgbToHex(rgbColor) {
    const toHex = value => value.toString(16).padStart(2, "0");
    return `#${toHex(rgbColor.r)}${toHex(rgbColor.g)}${toHex(rgbColor.b)}`;
  }

  function withAlpha(hexColor, alpha) {
    const { r, g, b } = hexToRgb(hexColor);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  try {
    const storedTheme = localStorage.getItem(storageKey);
    const storedPalette = JSON.parse(localStorage.getItem(paletteStorageKey) || "null");
    const prefersDarkTheme = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const resolvedTheme = storedTheme === "dark" || storedTheme === "light"
      ? storedTheme
      : (prefersDarkTheme ? "dark" : "light");
    const hasPalette =
      storedPalette &&
      isHexColor(storedPalette.background) &&
      isHexColor(storedPalette.accent) &&
      isHexColor(storedPalette.logo);

    document.documentElement.classList.toggle("theme-dark", resolvedTheme === "dark");

    if (hasPalette) {
      const isDarkTheme = resolvedTheme === "dark";
      const start = isDarkTheme
        ? rgbToHex(mixColors(storedPalette.background, "#0f172a", 0.7))
        : rgbToHex(mixColors(storedPalette.background, "#ffffff", 0.62));
      const mid = isDarkTheme
        ? rgbToHex(mixColors(storedPalette.background, "#020617", 0.74))
        : rgbToHex(mixColors(storedPalette.background, "#dbeafe", 0.4));
      const end = isDarkTheme
        ? rgbToHex(mixColors(storedPalette.accent, "#000000", 0.82))
        : rgbToHex(mixColors(storedPalette.accent, "#bfdbfe", 0.38));

      document.documentElement.classList.add("palette-custom");
      document.documentElement.style.setProperty(
        "--bg-main",
        `radial-gradient(circle at top, ${start}, ${mid} 52%, ${end} 100%)`
      );
      document.documentElement.style.setProperty("--bg-solid", mid);
      document.documentElement.style.setProperty("--accent-main", storedPalette.accent);
      document.documentElement.style.setProperty("--accent-soft", withAlpha(storedPalette.accent, 0.24));
      document.documentElement.style.setProperty("--brand-shadow", `drop-shadow(0 0 18px ${withAlpha(storedPalette.logo, 0.45)})`);
      document.documentElement.style.setProperty("--hint-color", withAlpha(storedPalette.accent, isDarkTheme ? 0.62 : 0.95));
      document.documentElement.style.setProperty("--clock-glow", `0 0 16px ${withAlpha(storedPalette.accent, isDarkTheme ? 0.42 : 0.3)}`);
    }
  } catch {
    document.documentElement.classList.toggle(
      "theme-dark",
      window.matchMedia("(prefers-color-scheme: dark)").matches
    );
  }
})();
