(function initThemeBeforePaint() {
  const themeStorageKey = "batterie-en-grand-theme";
  const customizationStorageKey = "batterie-en-grand-customization";
  const defaults = {
    backgroundLight: "#dbeafe",
    backgroundDark: "#020617",
    panelLight: "#ffffff",
    panelDark: "#0f172a",
    timezoneMenuBackground: "#ffffff",
    timezoneMenuText: "#0f172a",
    timezoneMenuHighlight: "#dbeafe",
    brandTextColor: "#0f172a",
    brandIconColor: "#0f172a",
    dateColor: "#2563eb",
    clockLabelColor: "#1d4ed8",
    clockTimeColor: "#0f172a"
  };

  function isHexColor(value) {
    return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value);
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
    const storedTheme = localStorage.getItem(themeStorageKey);
    const storedCustomization = JSON.parse(localStorage.getItem(customizationStorageKey) || "null");
    const prefersDarkTheme = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const resolvedTheme = storedTheme === "dark" || storedTheme === "light"
      ? storedTheme
      : (prefersDarkTheme ? "dark" : "light");
    const isDarkTheme = resolvedTheme === "dark";
    const background = isDarkTheme
      ? (isHexColor(storedCustomization?.backgroundDark) ? storedCustomization.backgroundDark : defaults.backgroundDark)
      : (isHexColor(storedCustomization?.backgroundLight) ? storedCustomization.backgroundLight : defaults.backgroundLight);
    const panelColor = isDarkTheme
      ? (isHexColor(storedCustomization?.panelDark) ? storedCustomization.panelDark : defaults.panelDark)
      : (isHexColor(storedCustomization?.panelLight) ? storedCustomization.panelLight : defaults.panelLight);
    const brandTextColor = isHexColor(storedCustomization?.brandTextColor) && storedCustomization.brandTextColor !== defaults.brandTextColor
      ? storedCustomization.brandTextColor
      : (isDarkTheme ? "#ffffff" : "#0f172a");
    const brandIconColor = isHexColor(storedCustomization?.brandIconColor) && storedCustomization.brandIconColor !== defaults.brandIconColor
      ? storedCustomization.brandIconColor
      : (isDarkTheme ? "#ffffff" : "#0f172a");
    const timezoneMenuBackground = isHexColor(storedCustomization?.timezoneMenuBackground) && storedCustomization.timezoneMenuBackground !== defaults.timezoneMenuBackground
      ? withAlpha(storedCustomization.timezoneMenuBackground, isDarkTheme ? 0.92 : 0.96)
      : (isDarkTheme ? "rgba(15, 23, 42, 0.88)" : "rgba(255, 255, 255, 0.92)");
    const timezoneMenuText = isHexColor(storedCustomization?.timezoneMenuText) && storedCustomization.timezoneMenuText !== defaults.timezoneMenuText
      ? storedCustomization.timezoneMenuText
      : (isDarkTheme ? "#ffffff" : "#0f172a");
    const timezoneMenuHighlight = isHexColor(storedCustomization?.timezoneMenuHighlight) && storedCustomization.timezoneMenuHighlight !== defaults.timezoneMenuHighlight
      ? withAlpha(storedCustomization.timezoneMenuHighlight, isDarkTheme ? 0.4 : 0.72)
      : "rgba(56, 189, 248, 0.24)";
    const clockLabelColor = isHexColor(storedCustomization?.clockLabelColor) && storedCustomization.clockLabelColor !== defaults.clockLabelColor
      ? storedCustomization.clockLabelColor
      : (isDarkTheme ? "rgba(255, 255, 255, 0.6)" : "rgba(30, 64, 175, 0.95)");
    const clockTimeColor = isHexColor(storedCustomization?.clockTimeColor) && storedCustomization.clockTimeColor !== defaults.clockTimeColor
      ? storedCustomization.clockTimeColor
      : (isDarkTheme ? "#ffffff" : "#0f172a");

    document.documentElement.classList.toggle("theme-dark", isDarkTheme);

    const gradient = isDarkTheme
      ? (
        background === defaults.backgroundDark
          ? { start: "#020617", mid: "#020617", end: "#000000" }
          : {
              start: rgbToHex(mixColors(background, "#0f172a", 0.3)),
              mid: background,
              end: rgbToHex(mixColors(background, "#000000", 0.7))
            }
      )
      : (
        background === defaults.backgroundLight
          ? { start: "#eff6ff", mid: "#dbeafe", end: "#bfdbfe" }
          : {
              start: rgbToHex(mixColors(background, "#ffffff", 0.46)),
              mid: background,
              end: rgbToHex(mixColors(background, "#93c5fd", 0.45))
            }
      );

    document.documentElement.style.setProperty(
      "--bg-main",
      `radial-gradient(circle at top, ${gradient.start}, ${gradient.mid} 52%, ${gradient.end} 100%)`
    );
    document.documentElement.style.setProperty("--bg-solid", gradient.mid);
    document.documentElement.style.setProperty("--panel-bg", withAlpha(panelColor, isDarkTheme ? 0.34 : 0.82));
    document.documentElement.style.setProperty("--panel-border", isDarkTheme ? withAlpha(defaults.panelLight, 0.14) : withAlpha(defaults.panelDark, 0.15));
    document.documentElement.style.setProperty("--timezone-menu-bg", timezoneMenuBackground);
    document.documentElement.style.setProperty("--timezone-menu-text", timezoneMenuText);
    document.documentElement.style.setProperty("--timezone-menu-highlight", timezoneMenuHighlight);
    document.documentElement.style.setProperty("--brand-text", brandTextColor);
    document.documentElement.style.setProperty("--brand-icon", brandIconColor);
    document.documentElement.style.setProperty("--date-color", isDarkTheme ? "#ffffff" : "#0f172a");
    document.documentElement.style.setProperty("--clock-label-color", clockLabelColor);
    document.documentElement.style.setProperty("--clock-time-color", clockTimeColor);
    document.documentElement.style.setProperty("--clock-glow", `0 0 16px ${withAlpha(clockTimeColor, isDarkTheme ? 0.28 : 0.16)}`);
  } catch {
    document.documentElement.classList.toggle(
      "theme-dark",
      window.matchMedia("(prefers-color-scheme: dark)").matches
    );
  }
})();
