
const THEME_STORAGE_KEY = "batterie-en-grand-theme";
const TIMEZONE_STORAGE_KEY = "batterie-en-grand-timezone";
const CUSTOMIZATION_STORAGE_KEY = "batterie-en-grand-customization";
const WORLD_TIME_ZONE = "UTC";
const WORLD_TIME_API_URL = "https://worldtimeapi.org/api/timezone/Etc/UTC";
const CURSOR_HIDE_DELAY_MS = 2500;
const HISTORY_LIMIT = 100;
const WARNING_MESSAGES = ["SEUIL CRITIQUE", "BATTERIE FAIBLE", "RECHARGEZ L'APPAREIL", "ATTENTION"];
const WEEKDAY_NAMES = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
const MONTH_NAMES = ["janvier", "fevrier", "mars", "avril", "mai", "juin", "juillet", "aout", "septembre", "octobre", "novembre", "decembre"];
const DEFAULT_CUSTOMIZATION = Object.freeze({
  backgroundLight: "#dbeafe", backgroundDark: "#020617", panelLight: "#ffffff", panelDark: "#0f172a",
  timezoneMenuBackground: "#ffffff", timezoneMenuText: "#0f172a", timezoneMenuHighlight: "#dbeafe",
  dateColor: "#2563eb", clockLabelColor: "#1d4ed8", clockTimeColor: "#0f172a",
  manualTime: "", brandTextColor: "#0f172a", brandIconColor: "#0f172a",
  percentColor: "#0f172a", percentChargingColor: "#22c55e", brandText: "Batterie en Grand", brandIcon: "",
  chargingActiveColor: "#22c55e", chargingIdleColor: "#9ca3af", chargingTextColor: "#ffffff", batteryShellColor: "#0f172a", chargingIcon: "⚡",
  levelHighColor: "#22c55e", levelMediumColor: "#facc15", levelWarningColor: "#fb923c", levelLowColor: "#dc2626", levelCriticalColor: "#7f1d1d", criticalThreshold: 15
});

const ids = name => document.getElementById(name);
const clockDate = ids("clockDate");
const clockTime = ids("clockTime");
const clockLabel = ids("clockLabel");
const fullscreenHint = ids("fullscreenHint");
const themeSwitch = ids("themeSwitch");
const themeLightButton = ids("themeLightButton");
const themeDarkButton = ids("themeDarkButton");
const paletteButton = ids("paletteButton");
const palettePanel = ids("palettePanel");
const undoButton = ids("undoButton");
const redoButton = ids("redoButton");
const resetPaletteButton = ids("resetPaletteButton");
const resetManualTimeButton = ids("resetManualTimeButton");
const timezoneToggle = ids("timezoneToggle");
const timezoneDropdown = ids("timezoneDropdown");
const timezoneSelectedLabel = ids("timezoneSelectedLabel");
const timezoneSearchInput = ids("timezoneSearchInput");
const timezoneResults = ids("timezoneResults");
const percent = ids("percent");
const leftFill = ids("leftFill");
const rightFill = ids("rightFill");
const bolt = ids("bolt");
const rightBubbles = ids("rightBubbles");
const warningOverlay = ids("warningOverlay");
const brandMark = document.querySelector(".brand-mark");
const brandLogoGlyph = ids("brandLogoGlyph");
const brandLogoText = ids("brandLogoText");
const controlsPanel = document.querySelector(".controls-panel");
const levelLowColorLabel = ids("levelLowColorLabel");
const levelCriticalColorLabel = ids("levelCriticalColorLabel");

const inputNames = [
  "backgroundLightInput","backgroundDarkInput","panelLightInput","panelDarkInput","timezoneMenuBackgroundInput","timezoneMenuTextInput","timezoneMenuHighlightInput","dateColorInput","clockLabelColorInput","clockTimeColorInput","manualTimeInput","brandTextColorInput","brandIconColorInput","percentColorInput","percentChargingColorInput","brandTextInput","brandIconInput","chargingActiveColorInput","chargingIdleColorInput","chargingTextColorInput","batteryShellColorInput","chargingIconInput","levelHighColorInput","levelMediumColorInput","levelWarningColorInput","levelLowColorInput","levelCriticalColorInput","criticalThresholdInput"
];
const inputs = Object.fromEntries(inputNames.map(name => [name, ids(name)]));

let syncRequest = null;
let syncedUtcMs = null;
let syncedAtPerfMs = 0;
let clockTimerId = null;
let cursorHideTimerId = null;
let batterySnapshot = null;
let undoStack = [];
let redoStack = [];
let timezoneSearchQuery = "";
let criticalAlertActive = false;
let criticalWarningIntervalId = null;
let criticalWarningStopTimeoutId = null;
let filteredTimezones = [];

function removeHashFromUrl() { if (window.location.hash) history.replaceState(null, "", window.location.pathname + window.location.search); }
function clamp(v, min, max) { return Math.min(max, Math.max(min, v)); }
function isHexColor(v) { return /^#[0-9a-f]{6}$/i.test(v || ""); }
function hexToRgb(hex) { const n = hex.replace("#", ""); return { r: parseInt(n.slice(0, 2), 16), g: parseInt(n.slice(2, 4), 16), b: parseInt(n.slice(4, 6), 16) }; }
function rgbToHex({ r, g, b }) { const h = v => v.toString(16).padStart(2, "0"); return `#${h(r)}${h(g)}${h(b)}`; }
function withAlpha(hex, a) { const { r, g, b } = hexToRgb(hex); return `rgba(${r}, ${g}, ${b}, ${a})`; }
function mixColors(a, b, w) { const s = hexToRgb(a); const e = hexToRgb(b); return { r: Math.round(s.r + (e.r - s.r) * w), g: Math.round(s.g + (e.g - s.g) * w), b: Math.round(s.b + (e.b - s.b) * w) }; }
function setRootVariable(name, value) { document.documentElement.style.setProperty(name, value); }
function getStoredTheme() { try { const t = localStorage.getItem(THEME_STORAGE_KEY); return t === "dark" || t === "light" ? t : null; } catch { return null; } }
function saveTheme(theme) { try { localStorage.setItem(THEME_STORAGE_KEY, theme); } catch {} }
function getSystemTheme() { return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"; }
function getPreferredTheme() { return getStoredTheme() || getSystemTheme(); }
function saveTimezone(zone) { try { localStorage.setItem(TIMEZONE_STORAGE_KEY, zone); } catch {} }
function getStoredTimezone() { try { return localStorage.getItem(TIMEZONE_STORAGE_KEY); } catch { return null; } }
function cloneCustomization(c) { return JSON.parse(JSON.stringify(c)); }
function areCustomizationsEqual(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
function sanitizeOptionalText(v, max = 80) { return typeof v === "string" ? v.trim().slice(0, max) : ""; }
function sanitizeRequiredText(v, fallback, max = 80) { return sanitizeOptionalText(v, max) || fallback; }
function getActiveFullscreenElement() {
  return document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement || null;
}
function updateFullscreenHint() { fullscreenHint.textContent = getActiveFullscreenElement() ? "Quitter le plein écran" : "Cliquer pour plein écran"; }
function toggleFullscreen() {
  removeHashFromUrl();

  if (getActiveFullscreenElement()) {
    const exitFullscreen =
      document.exitFullscreen ||
      document.webkitExitFullscreen ||
      document.msExitFullscreen;

    if (typeof exitFullscreen === "function") {
      Promise.resolve(exitFullscreen.call(document)).catch(() => {});
    }
    return;
  }

  const root = document.documentElement;
  const requestFullscreen =
    root.requestFullscreen ||
    root.webkitRequestFullscreen ||
    root.msRequestFullscreen;

  if (typeof requestFullscreen === "function") {
    Promise.resolve(requestFullscreen.call(root)).catch(() => {});
  }
}
function setCursorVisible() { document.body.classList.remove("fullscreen-idle"); }
function clearCursorHideTimer() { if (cursorHideTimerId) { clearTimeout(cursorHideTimerId); cursorHideTimerId = null; } }
function scheduleCursorHide() { clearCursorHideTimer(); if (!getActiveFullscreenElement()) return setCursorVisible(); cursorHideTimerId = setTimeout(() => { if (getActiveFullscreenElement()) document.body.classList.add("fullscreen-idle"); }, CURSOR_HIDE_DELAY_MS); }
function refreshCursorVisibility() { setCursorVisible(); scheduleCursorHide(); }
function detectDeviceType() { const ua = navigator.userAgent || ""; const coarse = window.matchMedia("(pointer: coarse)").matches; const short = Math.min(window.innerWidth, window.innerHeight); const long = Math.max(window.innerWidth, window.innerHeight); if (/iPad|Tablet|PlayBook|Silk/i.test(ua) || (coarse && short >= 700 && long >= 900)) return "tablet"; if (/Android|iPhone|iPod|IEMobile|Opera Mini|Windows Phone/i.test(ua) || (coarse && short < 700)) return "mobile"; return "desktop"; }
function applyDeviceLayout() { const t = detectDeviceType(); document.body.dataset.device = t; document.body.classList.toggle("device-mobile", t === "mobile"); document.body.classList.toggle("device-tablet", t === "tablet"); document.body.classList.toggle("device-desktop", t === "desktop"); }
function setBatteryAvailability(hasBattery) { document.body.classList.toggle("no-battery", !hasBattery); }
function getCurrentReferenceDate() { return syncedUtcMs !== null ? new Date(syncedUtcMs + (performance.now() - syncedAtPerfMs)) : new Date(); }
function parseManualTime(v) { const m = (v || "").match(/^(\d{2}):(\d{2})(?::(\d{2}))?$/); return m ? { hour: clamp(+m[1], 0, 23), minute: clamp(+m[2], 0, 59), second: clamp(+(m[3] || 0), 0, 59) } : null; }
function formatHms(parts) { const p = n => String(n).padStart(2, "0"); return `${p(parts.hour)}:${p(parts.minute)}:${p(parts.second)}`; }
function sanitizeManualTime(v) { const parts = parseManualTime(v); return parts ? formatHms(parts) : ""; }
function getOffsetLabel(zone) { if (zone === WORLD_TIME_ZONE) return "UTC+0"; const parts = new Intl.DateTimeFormat("en-US", { timeZone: zone, timeZoneName: "shortOffset" }).formatToParts(getCurrentReferenceDate()); return (parts.find(p => p.type === "timeZoneName")?.value || "GMT+0").replace("GMT", "UTC"); }
function prettifyZone(zone) { return zone === WORLD_TIME_ZONE ? "Heure mondiale (UTC)" : zone.split("/").pop().replaceAll("_", " "); }
function getAllTimezones() { const zones = typeof Intl.supportedValuesOf === "function" ? Intl.supportedValuesOf("timeZone") : ["Europe/Paris", "Europe/London", "America/New_York", "Asia/Tokyo"]; return [{ name: "Heure mondiale (UTC)", zone: WORLD_TIME_ZONE }, ...zones.map(zone => ({ name: prettifyZone(zone), zone }))]; }
const timezones = getAllTimezones();
let activeZone = timezones.some(z => z.zone === getStoredTimezone()) ? getStoredTimezone() : WORLD_TIME_ZONE;
let activeCustomization = getStoredCustomization();
function sanitizeCustomization(source) {
  source = source || {};
  return {
    backgroundLight: isHexColor(source.backgroundLight) ? source.backgroundLight : DEFAULT_CUSTOMIZATION.backgroundLight,
    backgroundDark: isHexColor(source.backgroundDark) ? source.backgroundDark : DEFAULT_CUSTOMIZATION.backgroundDark,
    panelLight: isHexColor(source.panelLight) ? source.panelLight : DEFAULT_CUSTOMIZATION.panelLight,
    panelDark: isHexColor(source.panelDark) ? source.panelDark : DEFAULT_CUSTOMIZATION.panelDark,
    timezoneMenuBackground: isHexColor(source.timezoneMenuBackground) ? source.timezoneMenuBackground : DEFAULT_CUSTOMIZATION.timezoneMenuBackground,
    timezoneMenuText: isHexColor(source.timezoneMenuText) ? source.timezoneMenuText : DEFAULT_CUSTOMIZATION.timezoneMenuText,
    timezoneMenuHighlight: isHexColor(source.timezoneMenuHighlight) ? source.timezoneMenuHighlight : DEFAULT_CUSTOMIZATION.timezoneMenuHighlight,
    dateColor: isHexColor(source.dateColor) ? source.dateColor : DEFAULT_CUSTOMIZATION.dateColor,
    clockLabelColor: isHexColor(source.clockLabelColor) ? source.clockLabelColor : DEFAULT_CUSTOMIZATION.clockLabelColor,
    clockTimeColor: isHexColor(source.clockTimeColor) ? source.clockTimeColor : DEFAULT_CUSTOMIZATION.clockTimeColor,
    manualTime: sanitizeManualTime(source.manualTime),
    brandTextColor: isHexColor(source.brandTextColor) ? source.brandTextColor : DEFAULT_CUSTOMIZATION.brandTextColor,
    brandIconColor: isHexColor(source.brandIconColor) ? source.brandIconColor : DEFAULT_CUSTOMIZATION.brandIconColor,
    percentColor: isHexColor(source.percentColor) ? source.percentColor : DEFAULT_CUSTOMIZATION.percentColor,
    percentChargingColor: isHexColor(source.percentChargingColor) ? source.percentChargingColor : DEFAULT_CUSTOMIZATION.percentChargingColor,
    brandText: sanitizeRequiredText(source.brandText, DEFAULT_CUSTOMIZATION.brandText),
    brandIcon: sanitizeOptionalText(source.brandIcon),
    chargingActiveColor: isHexColor(source.chargingActiveColor) ? source.chargingActiveColor : DEFAULT_CUSTOMIZATION.chargingActiveColor,
    chargingIdleColor: isHexColor(source.chargingIdleColor) ? source.chargingIdleColor : DEFAULT_CUSTOMIZATION.chargingIdleColor,
    chargingTextColor: isHexColor(source.chargingTextColor) ? source.chargingTextColor : DEFAULT_CUSTOMIZATION.chargingTextColor,
    batteryShellColor: isHexColor(source.batteryShellColor) ? source.batteryShellColor : DEFAULT_CUSTOMIZATION.batteryShellColor,
    chargingIcon: sanitizeRequiredText(source.chargingIcon, DEFAULT_CUSTOMIZATION.chargingIcon),
    levelHighColor: isHexColor(source.levelHighColor) ? source.levelHighColor : DEFAULT_CUSTOMIZATION.levelHighColor,
    levelMediumColor: isHexColor(source.levelMediumColor) ? source.levelMediumColor : DEFAULT_CUSTOMIZATION.levelMediumColor,
    levelWarningColor: isHexColor(source.levelWarningColor) ? source.levelWarningColor : DEFAULT_CUSTOMIZATION.levelWarningColor,
    levelLowColor: isHexColor(source.levelLowColor) ? source.levelLowColor : DEFAULT_CUSTOMIZATION.levelLowColor,
    levelCriticalColor: isHexColor(source.levelCriticalColor) ? source.levelCriticalColor : DEFAULT_CUSTOMIZATION.levelCriticalColor,
    criticalThreshold: clamp(parseInt(source.criticalThreshold, 10) || DEFAULT_CUSTOMIZATION.criticalThreshold, 1, 99)
  };
}
function getStoredCustomization() { try { return sanitizeCustomization(JSON.parse(localStorage.getItem(CUSTOMIZATION_STORAGE_KEY) || "null")); } catch { return cloneCustomization(DEFAULT_CUSTOMIZATION); } }
function saveCustomization(c) { try { localStorage.setItem(CUSTOMIZATION_STORAGE_KEY, JSON.stringify(c)); } catch {} }
function pushUndoState(prev) { const snap = cloneCustomization(prev); if (!undoStack.length || !areCustomizationsEqual(undoStack.at(-1), snap)) undoStack.push(snap); if (undoStack.length > HISTORY_LIMIT) undoStack.shift(); redoStack = []; }
function updateHistoryButtons() { undoButton.disabled = !undoStack.length; redoButton.disabled = !redoStack.length; }
function syncInputsWithCustomization(c) { Object.entries({ backgroundLightInput: c.backgroundLight, backgroundDarkInput: c.backgroundDark, panelLightInput: c.panelLight, panelDarkInput: c.panelDark, timezoneMenuBackgroundInput: c.timezoneMenuBackground, timezoneMenuTextInput: c.timezoneMenuText, timezoneMenuHighlightInput: c.timezoneMenuHighlight, dateColorInput: c.dateColor, clockLabelColorInput: c.clockLabelColor, clockTimeColorInput: c.clockTimeColor, manualTimeInput: c.manualTime, brandTextColorInput: c.brandTextColor, brandIconColorInput: c.brandIconColor, percentColorInput: c.percentColor, percentChargingColorInput: c.percentChargingColor, brandTextInput: c.brandText, brandIconInput: c.brandIcon, chargingActiveColorInput: c.chargingActiveColor, chargingIdleColorInput: c.chargingIdleColor, chargingTextColorInput: c.chargingTextColor, batteryShellColorInput: c.batteryShellColor, chargingIconInput: c.chargingIcon, levelHighColorInput: c.levelHighColor, levelMediumColorInput: c.levelMediumColor, levelWarningColorInput: c.levelWarningColor, levelLowColorInput: c.levelLowColor, levelCriticalColorInput: c.levelCriticalColor, criticalThresholdInput: String(c.criticalThreshold) }).forEach(([key, value]) => { inputs[key].value = value; }); }
function readCustomizationFromInputs() { const raw = {}; inputNames.forEach(name => raw[name.replace(/Input$/, "")] = inputs[name].value); raw.backgroundLight = inputs.backgroundLightInput.value; raw.backgroundDark = inputs.backgroundDarkInput.value; raw.panelLight = inputs.panelLightInput.value; raw.panelDark = inputs.panelDarkInput.value; raw.timezoneMenuBackground = inputs.timezoneMenuBackgroundInput.value; raw.timezoneMenuText = inputs.timezoneMenuTextInput.value; raw.timezoneMenuHighlight = inputs.timezoneMenuHighlightInput.value; raw.dateColor = inputs.dateColorInput.value; raw.clockLabelColor = inputs.clockLabelColorInput.value; raw.clockTimeColor = inputs.clockTimeColorInput.value; raw.manualTime = inputs.manualTimeInput.value; raw.brandTextColor = inputs.brandTextColorInput.value; raw.brandIconColor = inputs.brandIconColorInput.value; raw.percentColor = inputs.percentColorInput.value; raw.percentChargingColor = inputs.percentChargingColorInput.value; raw.brandText = inputs.brandTextInput.value; raw.brandIcon = inputs.brandIconInput.value; raw.chargingActiveColor = inputs.chargingActiveColorInput.value; raw.chargingIdleColor = inputs.chargingIdleColorInput.value; raw.chargingTextColor = inputs.chargingTextColorInput.value; raw.batteryShellColor = inputs.batteryShellColorInput.value; raw.chargingIcon = inputs.chargingIconInput.value; raw.levelHighColor = inputs.levelHighColorInput.value; raw.levelMediumColor = inputs.levelMediumColorInput.value; raw.levelWarningColor = inputs.levelWarningColorInput.value; raw.levelLowColor = inputs.levelLowColorInput.value; raw.levelCriticalColor = inputs.levelCriticalColorInput.value; raw.criticalThreshold = inputs.criticalThresholdInput.value; return sanitizeCustomization(raw); }
function fitTextToBounds(el, max, min) { if (!el) return; el.style.fontSize = `${max}px`; if (!el.textContent.trim()) return; let size = max; while (size > min && (el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight)) { size -= 1; el.style.fontSize = `${size}px`; } }
function applyTextSizing() { fitTextToBounds(brandLogoGlyph, 34, 8); fitTextToBounds(bolt, 36, 9); }
function buildGradient(theme, c) { return theme === "dark" ? { start: rgbToHex(mixColors(c.backgroundDark, "#0f172a", 0.24)), mid: c.backgroundDark, end: rgbToHex(mixColors(c.backgroundDark, "#000000", 0.7)) } : { start: rgbToHex(mixColors(c.backgroundLight, "#ffffff", 0.42)), mid: c.backgroundLight, end: rgbToHex(mixColors(c.backgroundLight, "#93c5fd", 0.38)) }; }
function applyCustomization(customization, syncInputs = true) {
  const c = sanitizeCustomization(customization);
  const dark = document.documentElement.classList.contains("theme-dark");
  const gradient = buildGradient(dark ? "dark" : "light", c);
  const panelColor = dark ? c.panelDark : c.panelLight;
  activeCustomization = c;
  setRootVariable("--bg-main", `radial-gradient(circle at top, ${gradient.start}, ${gradient.mid} 52%, ${gradient.end} 100%)`);
  setRootVariable("--bg-solid", gradient.mid);
  setRootVariable("--panel-bg", withAlpha(panelColor, dark ? 0.34 : 0.82));
  setRootVariable("--panel-border", dark ? withAlpha(c.panelLight, 0.14) : withAlpha(c.panelDark, 0.15));
  setRootVariable("--panel-shadow", dark ? `0 12px 30px ${withAlpha("#000000", 0.28)}` : `0 12px 30px ${withAlpha(c.backgroundDark, 0.18)}`);
  setRootVariable("--timezone-menu-bg", withAlpha(c.timezoneMenuBackground, dark ? 0.92 : 0.96));
  setRootVariable("--timezone-menu-text", c.timezoneMenuText);
  setRootVariable("--timezone-menu-highlight", withAlpha(c.timezoneMenuHighlight, dark ? 0.4 : 0.72));
  setRootVariable("--brand-text", c.brandTextColor);
  setRootVariable("--brand-icon", c.brandIconColor);
  setRootVariable("--date-color", dark ? "#ffffff" : "#000000");
  setRootVariable("--clock-label-color", c.clockLabelColor);
  setRootVariable("--clock-time-color", c.clockTimeColor);
  setRootVariable("--percent-color", c.percentColor);
  setRootVariable("--percent-charging-color", c.percentChargingColor);
  setRootVariable("--charging-active", c.chargingActiveColor);
  setRootVariable("--charging-idle", c.chargingIdleColor);
  setRootVariable("--charging-text-color", c.chargingTextColor);
  setRootVariable("--battery-shell", c.batteryShellColor);
  setRootVariable("--battery-critical", c.levelCriticalColor);
  setRootVariable("--battery-critical-glow", withAlpha(c.levelCriticalColor, 0.9));
  setRootVariable("--brand-shadow", `drop-shadow(0 0 16px ${withAlpha(c.chargingActiveColor, dark ? 0.2 : 0.34)})`);
  setRootVariable("--clock-glow", `0 0 16px ${withAlpha(c.clockTimeColor, dark ? 0.24 : 0.16)}`);
  brandLogoText.textContent = c.brandText;
  brandLogoGlyph.textContent = c.brandIcon;
  brandMark.classList.toggle("has-custom-icon", c.brandIcon !== "");
  bolt.textContent = c.chargingIcon;
  levelLowColorLabel.textContent = `${c.criticalThreshold}% et +`;
  levelCriticalColorLabel.textContent = `Moins de ${c.criticalThreshold}%`;
  if (syncInputs) syncInputsWithCustomization(c);
  updateHistoryButtons();
  updateClock();
  applyTextSizing();
  if (batterySnapshot) updateBatteryDisplay(batterySnapshot);
}
function commitCustomization(next, shouldRecord = true) { const c = sanitizeCustomization(next); if (shouldRecord && !areCustomizationsEqual(activeCustomization, c)) pushUndoState(activeCustomization); applyCustomization(c); saveCustomization(c); }
function undoCustomization() { if (!undoStack.length) return; redoStack.push(cloneCustomization(activeCustomization)); const prev = undoStack.pop(); applyCustomization(prev); saveCustomization(prev); }
function redoCustomization() { if (!redoStack.length) return; undoStack.push(cloneCustomization(activeCustomization)); const next = redoStack.pop(); applyCustomization(next); saveCustomization(next); }
function resetCustomization() { if (!areCustomizationsEqual(activeCustomization, DEFAULT_CUSTOMIZATION)) { pushUndoState(activeCustomization); applyCustomization(DEFAULT_CUSTOMIZATION); saveCustomization(DEFAULT_CUSTOMIZATION); } }
function setPalettePanelOpen(open) { paletteButton.setAttribute("aria-expanded", String(open)); palettePanel.classList.toggle("is-open", open); palettePanel.setAttribute("aria-hidden", String(!open)); }
function setTimezoneDropdownOpen(open) {
  timezoneToggle.setAttribute("aria-expanded", String(open));
  timezoneDropdown.classList.toggle("is-open", open);
  timezoneDropdown.setAttribute("aria-hidden", String(!open));
  if (open) {
    setTimeout(() => timezoneSearchInput.focus(), 0);
  }
}
function applyTheme(theme) { document.documentElement.classList.toggle("theme-dark", theme === "dark"); themeLightButton.setAttribute("aria-pressed", String(theme !== "dark")); themeDarkButton.setAttribute("aria-pressed", String(theme === "dark")); applyCustomization(activeCustomization); }
function getZoneDateParts(zone) { const parts = new Intl.DateTimeFormat("en-CA", { timeZone: zone === WORLD_TIME_ZONE ? "UTC" : zone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" }).formatToParts(getCurrentReferenceDate()); const val = t => parts.find(p => p.type === t)?.value || "00"; return { year: +val("year"), month: +val("month"), day: +val("day"), hour: +val("hour"), minute: +val("minute"), second: +val("second") }; }
function getDisplayParts() { const p = getZoneDateParts(activeZone); const manual = parseManualTime(activeCustomization.manualTime); return manual ? { ...p, ...manual } : p; }
function formatDateParts(parts) { const weekday = WEEKDAY_NAMES[new Date(Date.UTC(parts.year, parts.month - 1, parts.day)).getUTCDay()]; const label = `${weekday} ${parts.day} ${MONTH_NAMES[parts.month - 1]} ${parts.year}`; return label.charAt(0).toUpperCase() + label.slice(1); }
function updateClock() { const parts = getDisplayParts(); clockDate.textContent = formatDateParts(parts); clockTime.textContent = formatHms(parts); clockLabel.textContent = activeZone === WORLD_TIME_ZONE ? "HEURE MONDIALE - UTC" : `HEURE ACTUELLE - ${prettifyZone(activeZone).toUpperCase()}`; }
async function syncTimeFromWorldService() { if (syncRequest) return syncRequest; syncRequest = fetch(WORLD_TIME_API_URL, { cache: "no-store", credentials: "omit", mode: "cors", redirect: "error", referrerPolicy: "no-referrer" }).then(r => r.ok ? r.json() : Promise.reject()).then(data => { const ms = Date.parse(data.utc_datetime || data.datetime); if (!Number.isNaN(ms)) { syncedUtcMs = ms; syncedAtPerfMs = performance.now(); renderTimezoneOptions(); updateClock(); } }).catch(() => { if (syncedUtcMs === null) updateClock(); }).finally(() => { syncRequest = null; }); return syncRequest; }
function syncClock() { updateClock(); clearTimeout(clockTimerId); clockTimerId = setTimeout(syncClock, 1000 - (Date.now() % 1000)); }
function getFilteredTimezones() { const q = timezoneSearchQuery.trim().toLowerCase(); return timezones.filter(({ name, zone }) => !q || `${name} ${zone} ${getOffsetLabel(zone)}`.toLowerCase().includes(q)); }
function renderTimezoneOptions() {
  filteredTimezones = getFilteredTimezones();
  timezoneSelectedLabel.textContent = `${prettifyZone(activeZone)} - ${getOffsetLabel(activeZone)}`;
  timezoneResults.innerHTML = "";

  if (!filteredTimezones.length) {
    const empty = document.createElement("div");
    empty.className = "timezone-empty";
    empty.textContent = "Aucun fuseau trouvé";
    timezoneResults.appendChild(empty);
    return;
  }

  filteredTimezones.forEach(item => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "timezone-result";
    button.textContent = `${item.name} - ${getOffsetLabel(item.zone)}`;
    button.dataset.zone = item.zone;
    button.classList.toggle("is-active", item.zone === activeZone);
    timezoneResults.appendChild(button);
  });
}
function getBatteryColor(level) { if (level >= 80) return activeCustomization.levelHighColor; if (level >= 50) return activeCustomization.levelMediumColor; if (level >= 35) return activeCustomization.levelWarningColor; if (level >= activeCustomization.criticalThreshold) return activeCustomization.levelLowColor; return activeCustomization.levelCriticalColor; }
function clearCriticalWarnings() {
  warningOverlay.innerHTML = "";
  warningOverlay.setAttribute("aria-hidden", "true");
  if (criticalWarningIntervalId) { clearInterval(criticalWarningIntervalId); criticalWarningIntervalId = null; }
  if (criticalWarningStopTimeoutId) { clearTimeout(criticalWarningStopTimeoutId); criticalWarningStopTimeoutId = null; }
}
function spawnCriticalWarning() {
  const chip = document.createElement("div");
  chip.className = "warning-chip";
  chip.textContent = WARNING_MESSAGES[Math.floor(Math.random() * WARNING_MESSAGES.length)];
  chip.style.left = `${8 + Math.random() * 74}%`;
  chip.style.top = `${10 + Math.random() * 72}%`;
  chip.style.transform = `rotate(${Math.round(Math.random() * 24 - 12)}deg)`;
  warningOverlay.appendChild(chip);
  warningOverlay.setAttribute("aria-hidden", "false");
  setTimeout(() => { chip.remove(); if (!warningOverlay.children.length && !criticalAlertActive) warningOverlay.setAttribute("aria-hidden", "true"); }, 2600);
}
function startCriticalWarningVisuals(durationMs) {
  clearCriticalWarnings();
  criticalAlertActive = true;
  spawnCriticalWarning();
  criticalWarningIntervalId = setInterval(spawnCriticalWarning, 420);
  criticalWarningStopTimeoutId = setTimeout(() => { criticalAlertActive = false; if (criticalWarningIntervalId) { clearInterval(criticalWarningIntervalId); criticalWarningIntervalId = null; } }, durationMs);
}
function announceCriticalBattery() {
  const message = "Attention vous avez atteint le seuil critique de la batterie, nous vous prions de bien vouloir recharger votre appareil";
  if (!("speechSynthesis" in window)) return startCriticalWarningVisuals(4500);
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(message);
  utterance.lang = "fr-FR";
  utterance.rate = 0.94;
  utterance.onstart = () => startCriticalWarningVisuals(Math.max(message.length * 70, 5000));
  utterance.onend = utterance.onerror = () => { criticalAlertActive = false; };
  window.speechSynthesis.speak(utterance);
}
function updateCriticalAlertState(snapshot, level) {
  const critical = !snapshot.charging && level < activeCustomization.criticalThreshold;
  if (critical && !criticalAlertActive) return announceCriticalBattery();
  if (!critical) { criticalAlertActive = false; clearCriticalWarnings(); if ("speechSynthesis" in window) window.speechSynthesis.cancel(); }
}
function updateBatteryDisplay(snapshot) {
  const level = Math.round(snapshot.level * 100);
  const batteryColor = getBatteryColor(level);
  percent.textContent = `${level}%`;
  if (snapshot.charging) {
    leftFill.style.background = activeCustomization.chargingActiveColor;
    bolt.style.display = "flex";
    percent.style.color = activeCustomization.percentChargingColor;
    percent.classList.remove("low-battery-alert");
  } else {
    leftFill.style.background = activeCustomization.chargingIdleColor;
    bolt.style.display = activeCustomization.chargingIcon ? "flex" : "none";
    percent.style.color = activeCustomization.percentColor;
    percent.classList.toggle("low-battery-alert", level < activeCustomization.criticalThreshold);
  }
  bolt.style.color = activeCustomization.chargingTextColor;
  rightFill.style.height = `${level}%`;
  rightFill.style.background = batteryColor;
  rightBubbles.style.setProperty("--bubble-color", batteryColor);
  updateCriticalAlertState(snapshot, level);
}

[timezoneToggle, timezoneDropdown, timezoneSearchInput, timezoneResults, controlsPanel, themeSwitch, paletteButton, palettePanel, fullscreenHint].forEach(el => {
  ["pointerdown", "mousedown", "click", "touchstart"].forEach(name => el?.addEventListener(name, event => event.stopPropagation()));
});
timezoneSearchInput.addEventListener("input", event => { timezoneSearchQuery = event.target.value; renderTimezoneOptions(); });
timezoneToggle.addEventListener("click", () => setTimezoneDropdownOpen(timezoneToggle.getAttribute("aria-expanded") !== "true"));
timezoneResults.addEventListener("click", event => {
  const button = event.target.closest(".timezone-result");
  if (!button) return;
  activeZone = button.dataset.zone;
  saveTimezone(activeZone);
  renderTimezoneOptions();
  updateClock();
  setTimezoneDropdownOpen(false);
});
themeLightButton.addEventListener("click", () => { applyTheme("light"); saveTheme("light"); });
themeDarkButton.addEventListener("click", () => { applyTheme("dark"); saveTheme("dark"); });
paletteButton.addEventListener("click", () => setPalettePanelOpen(paletteButton.getAttribute("aria-expanded") !== "true"));
fullscreenHint.addEventListener("click", toggleFullscreen);
inputNames.forEach(name => inputs[name].addEventListener("input", () => commitCustomization(readCustomizationFromInputs())));
resetManualTimeButton.addEventListener("click", () => commitCustomization({ ...activeCustomization, manualTime: "" }));
undoButton.addEventListener("click", undoCustomization);
redoButton.addEventListener("click", redoCustomization);
resetPaletteButton.addEventListener("click", resetCustomization);
document.body.addEventListener("click", event => {
  if (event.target.closest(".timezone-combobox, .palette-panel, .palette-button, .theme-controls, .hint-button")) return;
  setPalettePanelOpen(false);
  setTimezoneDropdownOpen(false);
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape") { setPalettePanelOpen(false); setTimezoneDropdownOpen(false); }
  if ((event.ctrlKey || event.metaKey) && !event.shiftKey && event.key.toLowerCase() === "z") { event.preventDefault(); undoCustomization(); }
  if ((event.ctrlKey || event.metaKey) && (event.key.toLowerCase() === "y" || (event.shiftKey && event.key.toLowerCase() === "z"))) { event.preventDefault(); redoCustomization(); }
});
["fullscreenchange", "webkitfullscreenchange", "msfullscreenchange"].forEach(eventName => {
  document.addEventListener(eventName, () => { removeHashFromUrl(); updateFullscreenHint(); refreshCursorVisibility(); });
});
document.addEventListener("DOMContentLoaded", removeHashFromUrl);
window.addEventListener("load", removeHashFromUrl);
window.addEventListener("pageshow", removeHashFromUrl);
window.addEventListener("hashchange", removeHashFromUrl);
window.addEventListener("popstate", removeHashFromUrl);
window.addEventListener("resize", () => { applyDeviceLayout(); applyTextSizing(); });
window.addEventListener("orientationchange", () => { applyDeviceLayout(); applyTextSizing(); });
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => { if (!getStoredTheme()) applyTheme(getSystemTheme()); });
["mousemove", "mousedown", "pointerdown", "pointermove", "touchstart", "keydown"].forEach(name => document.addEventListener(name, refreshCursorVisibility, { passive: true }));

applyDeviceLayout();
renderTimezoneOptions();
applyTheme(getPreferredTheme());
setPalettePanelOpen(false);
removeHashFromUrl();
updateFullscreenHint();
syncTimeFromWorldService();
setInterval(syncTimeFromWorldService, 60000);
syncClock();
scheduleCursorHide();
for (let i = 0; i < 6; i += 1) { const bubble = document.createElement("span"); bubble.className = "battery-bubble"; rightBubbles.appendChild(bubble); }
if ("getBattery" in navigator) {
  navigator.getBattery().then(battery => {
    setBatteryAvailability(true);
    const updateBattery = () => { batterySnapshot = battery; updateBatteryDisplay(batterySnapshot); };
    updateBattery();
    battery.addEventListener("levelchange", updateBattery);
    battery.addEventListener("chargingchange", updateBattery);
  }).catch(() => setBatteryAvailability(false));
} else {
  setBatteryAvailability(false);
}
