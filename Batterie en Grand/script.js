function toggleFullscreen() {
  removeHashFromUrl();

  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}

function removeHashFromUrl() {
  if (!window.location.hash) {
    return;
  }

  history.replaceState(null, "", window.location.pathname + window.location.search);
}

function getStoredTheme() {
  try {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    return storedTheme === "dark" || storedTheme === "light" ? storedTheme : null;
  } catch {
    return null;
  }
}

function saveTheme(theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Ignore localStorage failures and keep the current theme for the session.
  }
}

function getStoredTimezone() {
  try {
    const storedTimezone = localStorage.getItem(TIMEZONE_STORAGE_KEY);
    return countries.some(country => country.zone === storedTimezone) ? storedTimezone : null;
  } catch {
    return null;
  }
}

function saveTimezone(zone) {
  try {
    localStorage.setItem(TIMEZONE_STORAGE_KEY, zone);
  } catch {
    // Ignore localStorage failures and keep the current timezone for the session.
  }
}

function getSystemTheme() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getPreferredTheme() {
  return getStoredTheme() || getSystemTheme();
}

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

function mixColors(colorA, colorB, weight = 0.5) {
  const start = hexToRgb(colorA);
  const end = hexToRgb(colorB);

  return {
    r: Math.round(start.r + (end.r - start.r) * weight),
    g: Math.round(start.g + (end.g - start.g) * weight),
    b: Math.round(start.b + (end.b - start.b) * weight)
  };
}

function rgbToHex({ r, g, b }) {
  const toHex = value => value.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function withAlpha(hexColor, alpha) {
  const { r, g, b } = hexToRgb(hexColor);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function updateFullscreenHint() {
  if (!fullscreenHint) {
    return;
  }

  fullscreenHint.textContent = document.fullscreenElement
    ? "Cliquer pour quitter plein écran"
    : "Cliquer pour plein écran";
}

function detectDeviceType() {
  const userAgent = navigator.userAgent || "";
  const hasCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const shortestSide = Math.min(window.innerWidth, window.innerHeight);
  const longestSide = Math.max(window.innerWidth, window.innerHeight);
  const isTabletUserAgent = /iPad|Tablet|PlayBook|Silk/i.test(userAgent);
  const isMobileUserAgent = /Android|iPhone|iPod|IEMobile|Opera Mini|Windows Phone/i.test(userAgent);

  if (isTabletUserAgent || (hasCoarsePointer && shortestSide >= 700 && longestSide >= 900)) {
    return "tablet";
  }

  if (isMobileUserAgent || (hasCoarsePointer && shortestSide < 700)) {
    return "mobile";
  }

  return "desktop";
}

function applyDeviceLayout() {
  const deviceType = detectDeviceType();

  document.body.dataset.device = deviceType;
  document.body.classList.toggle("device-mobile", deviceType === "mobile");
  document.body.classList.toggle("device-tablet", deviceType === "tablet");
  document.body.classList.toggle("device-desktop", deviceType === "desktop");
}

function setBatteryAvailability(hasBattery) {
  document.body.classList.toggle("no-battery", !hasBattery);
}

function clearCursorHideTimer() {
  if (cursorHideTimerId) {
    clearTimeout(cursorHideTimerId);
    cursorHideTimerId = null;
  }
}

function setCursorVisible() {
  document.body.classList.remove("fullscreen-idle");
}

function scheduleCursorHide() {
  clearCursorHideTimer();

  if (!document.fullscreenElement) {
    setCursorVisible();
    return;
  }

  cursorHideTimerId = setTimeout(() => {
    if (document.fullscreenElement) {
      document.body.classList.add("fullscreen-idle");
    }
  }, CURSOR_HIDE_DELAY_MS);
}

function refreshCursorVisibility() {
  setCursorVisible();
  scheduleCursorHide();
}

const clockTime = document.getElementById("clockTime");
const clockLabel = document.getElementById("clockLabel");
const fullscreenHint = document.getElementById("fullscreenHint");
const themeSwitch = document.getElementById("themeSwitch");
const themeLightButton = document.getElementById("themeLightButton");
const themeDarkButton = document.getElementById("themeDarkButton");
const paletteButton = document.getElementById("paletteButton");
const palettePanel = document.getElementById("palettePanel");
const undoButton = document.getElementById("undoButton");
const redoButton = document.getElementById("redoButton");
const resetPaletteButton = document.getElementById("resetPaletteButton");
const backgroundLightInput = document.getElementById("backgroundLightInput");
const backgroundDarkInput = document.getElementById("backgroundDarkInput");
const textLightInput = document.getElementById("textLightInput");
const textDarkInput = document.getElementById("textDarkInput");
const brandTextInput = document.getElementById("brandTextInput");
const brandIconInput = document.getElementById("brandIconInput");
const chargingColorInput = document.getElementById("chargingColorInput");
const chargingIconInput = document.getElementById("chargingIconInput");
const levelHighColorInput = document.getElementById("levelHighColorInput");
const levelMediumColorInput = document.getElementById("levelMediumColorInput");
const levelWarningColorInput = document.getElementById("levelWarningColorInput");
const levelLowColorInput = document.getElementById("levelLowColorInput");
const levelCriticalColorInput = document.getElementById("levelCriticalColorInput");
const criticalThresholdInput = document.getElementById("criticalThresholdInput");
const levelLowColorLabel = document.getElementById("levelLowColorLabel");
const levelCriticalColorLabel = document.getElementById("levelCriticalColorLabel");
const brandMark = document.querySelector(".brand-mark");
const brandLogoGlyph = document.getElementById("brandLogoGlyph");
const brandLogoText = document.getElementById("brandLogoText");
const timezoneSelect = document.getElementById("timezoneSelect");
const controlsPanel = document.querySelector(".controls-panel");
const rightBubbles = document.getElementById("rightBubbles");
const percent = document.getElementById("percent");
const leftFill = document.getElementById("leftFill");
const rightFill = document.getElementById("rightFill");
const bolt = document.getElementById("bolt");
const THEME_STORAGE_KEY = "batterie-en-grand-theme";
const TIMEZONE_STORAGE_KEY = "batterie-en-grand-timezone";
const CUSTOMIZATION_STORAGE_KEY = "batterie-en-grand-customization";
const WORLD_TIME_ZONE = "UTC";
const WORLD_TIME_API_ORIGIN = "https://worldtimeapi.org";
const WORLD_TIME_API_URL = "https://worldtimeapi.org/api/timezone/Etc/UTC";
const HISTORY_LIMIT = 100;
const DEFAULT_CUSTOMIZATION = Object.freeze({
  backgroundLight: "#dbeafe",
  backgroundDark: "#020617",
  textLight: "#0f172a",
  textDark: "#ffffff",
  brandText: "Batterie en Grand",
  brandIcon: "",
  chargingColor: "#22c55e",
  chargingIcon: "⚡",
  levelHighColor: "#22c55e",
  levelMediumColor: "#facc15",
  levelWarningColor: "#fb923c",
  levelLowColor: "#dc2626",
  levelCriticalColor: "#7f1d1d",
  criticalThreshold: 15
});

const countries = [
  { name: "Heure mondiale (UTC)", zone: WORLD_TIME_ZONE },
  { name: "Afghanistan", zone: "Asia/Kabul" },
  { name: "Afrique du Sud", zone: "Africa/Johannesburg" },
  { name: "Albanie", zone: "Europe/Tirane" },
  { name: "Algérie", zone: "Africa/Algiers" },
  { name: "Allemagne", zone: "Europe/Berlin" },
  { name: "Andorre", zone: "Europe/Andorra" },
  { name: "Angola", zone: "Africa/Luanda" },
  { name: "Antigua-et-Barbuda", zone: "America/Antigua" },
  { name: "Arabie saoudite", zone: "Asia/Riyadh" },
  { name: "Argentine", zone: "America/Argentina/Buenos_Aires" },
  { name: "Arménie", zone: "Asia/Yerevan" },
  { name: "Australie", zone: "Australia/Sydney" },
  { name: "Autriche", zone: "Europe/Vienna" },
  { name: "Azerbaïdjan", zone: "Asia/Baku" },
  { name: "Bahamas", zone: "America/Nassau" },
  { name: "Bahreïn", zone: "Asia/Bahrain" },
  { name: "Bangladesh", zone: "Asia/Dhaka" },
  { name: "Barbade", zone: "America/Barbados" },
  { name: "Belgique", zone: "Europe/Brussels" },
  { name: "Belize", zone: "America/Belize" },
  { name: "Bénin", zone: "Africa/Porto-Novo" },
  { name: "Bhoutan", zone: "Asia/Thimphu" },
  { name: "Biélorussie", zone: "Europe/Minsk" },
  { name: "Birmanie", zone: "Asia/Yangon" },
  { name: "Bolivie", zone: "America/La_Paz" },
  { name: "Bosnie-Herzégovine", zone: "Europe/Sarajevo" },
  { name: "Botswana", zone: "Africa/Gaborone" },
  { name: "Brésil", zone: "America/Sao_Paulo" },
  { name: "Brunei", zone: "Asia/Brunei" },
  { name: "Bulgarie", zone: "Europe/Sofia" },
  { name: "Burkina Faso", zone: "Africa/Ouagadougou" },
  { name: "Burundi", zone: "Africa/Bujumbura" },
  { name: "Cambodge", zone: "Asia/Phnom_Penh" },
  { name: "Cameroun", zone: "Africa/Douala" },
  { name: "Canada", zone: "America/Toronto" },
  { name: "Cap-Vert", zone: "Atlantic/Cape_Verde" },
  { name: "Chili", zone: "America/Santiago" },
  { name: "Chine", zone: "Asia/Shanghai" },
  { name: "Chypre", zone: "Asia/Nicosia" },
  { name: "Colombie", zone: "America/Bogota" },
  { name: "Comores", zone: "Indian/Comoro" },
  { name: "Congo", zone: "Africa/Brazzaville" },
  { name: "Corée du Nord", zone: "Asia/Pyongyang" },
  { name: "Corée du Sud", zone: "Asia/Seoul" },
  { name: "Costa Rica", zone: "America/Costa_Rica" },
  { name: "Côte d'Ivoire", zone: "Africa/Abidjan" },
  { name: "Croatie", zone: "Europe/Zagreb" },
  { name: "Cuba", zone: "America/Havana" },
  { name: "Danemark", zone: "Europe/Copenhagen" },
  { name: "Djibouti", zone: "Africa/Djibouti" },
  { name: "Dominique", zone: "America/Dominica" },
  { name: "Égypte", zone: "Africa/Cairo" },
  { name: "Émirats arabes unis", zone: "Asia/Dubai" },
  { name: "Équateur", zone: "America/Guayaquil" },
  { name: "Érythrée", zone: "Africa/Asmara" },
  { name: "Espagne", zone: "Europe/Madrid" },
  { name: "Estonie", zone: "Europe/Tallinn" },
  { name: "Eswatini", zone: "Africa/Mbabane" },
  { name: "États-Unis", zone: "America/New_York" },
  { name: "Éthiopie", zone: "Africa/Addis_Ababa" },
  { name: "Fidji", zone: "Pacific/Fiji" },
  { name: "Finlande", zone: "Europe/Helsinki" },
  { name: "France", zone: "Europe/Paris" },
  { name: "Gabon", zone: "Africa/Libreville" },
  { name: "Gambie", zone: "Africa/Banjul" },
  { name: "Géorgie", zone: "Asia/Tbilisi" },
  { name: "Ghana", zone: "Africa/Accra" },
  { name: "Grèce", zone: "Europe/Athens" },
  { name: "Grenade", zone: "America/Grenada" },
  { name: "Guatemala", zone: "America/Guatemala" },
  { name: "Guinée", zone: "Africa/Conakry" },
  { name: "Guinée-Bissau", zone: "Africa/Bissau" },
  { name: "Guinée équatoriale", zone: "Africa/Malabo" },
  { name: "Guyana", zone: "America/Guyana" },
  { name: "Haïti", zone: "America/Port-au-Prince" },
  { name: "Honduras", zone: "America/Tegucigalpa" },
  { name: "Hongrie", zone: "Europe/Budapest" },
  { name: "Îles Marshall", zone: "Pacific/Majuro" },
  { name: "Îles Salomon", zone: "Pacific/Guadalcanal" },
  { name: "Inde", zone: "Asia/Kolkata" },
  { name: "Indonésie", zone: "Asia/Jakarta" },
  { name: "Irak", zone: "Asia/Baghdad" },
  { name: "Iran", zone: "Asia/Tehran" },
  { name: "Irlande", zone: "Europe/Dublin" },
  { name: "Islande", zone: "Atlantic/Reykjavik" },
  { name: "Israël", zone: "Asia/Jerusalem" },
  { name: "Italie", zone: "Europe/Rome" },
  { name: "Jamaïque", zone: "America/Jamaica" },
  { name: "Japon", zone: "Asia/Tokyo" },
  { name: "Jordanie", zone: "Asia/Amman" },
  { name: "Kazakhstan", zone: "Asia/Almaty" },
  { name: "Kenya", zone: "Africa/Nairobi" },
  { name: "Kirghizistan", zone: "Asia/Bishkek" },
  { name: "Kiribati", zone: "Pacific/Tarawa" },
  { name: "Kosovo", zone: "Europe/Belgrade" },
  { name: "Koweït", zone: "Asia/Kuwait" },
  { name: "Laos", zone: "Asia/Vientiane" },
  { name: "Lesotho", zone: "Africa/Maseru" },
  { name: "Lettonie", zone: "Europe/Riga" },
  { name: "Liban", zone: "Asia/Beirut" },
  { name: "Libéria", zone: "Africa/Monrovia" },
  { name: "Libye", zone: "Africa/Tripoli" },
  { name: "Liechtenstein", zone: "Europe/Vaduz" },
  { name: "Lituanie", zone: "Europe/Vilnius" },
  { name: "Luxembourg", zone: "Europe/Luxembourg" },
  { name: "Macédoine du Nord", zone: "Europe/Skopje" },
  { name: "Madagascar", zone: "Indian/Antananarivo" },
  { name: "Malaisie", zone: "Asia/Kuala_Lumpur" },
  { name: "Malawi", zone: "Africa/Blantyre" },
  { name: "Maldives", zone: "Indian/Maldives" },
  { name: "Mali", zone: "Africa/Bamako" },
  { name: "Malte", zone: "Europe/Malta" },
  { name: "Maroc", zone: "Africa/Casablanca" },
  { name: "Maurice", zone: "Indian/Mauritius" },
  { name: "Mauritanie", zone: "Africa/Nouakchott" },
  { name: "Mexique", zone: "America/Mexico_City" },
  { name: "Micronésie", zone: "Pacific/Pohnpei" },
  { name: "Moldavie", zone: "Europe/Chisinau" },
  { name: "Monaco", zone: "Europe/Monaco" },
  { name: "Mongolie", zone: "Asia/Ulaanbaatar" },
  { name: "Monténégro", zone: "Europe/Podgorica" },
  { name: "Mozambique", zone: "Africa/Maputo" },
  { name: "Namibie", zone: "Africa/Windhoek" },
  { name: "Nauru", zone: "Pacific/Nauru" },
  { name: "Népal", zone: "Asia/Kathmandu" },
  { name: "Nicaragua", zone: "America/Managua" },
  { name: "Niger", zone: "Africa/Niamey" },
  { name: "Nigeria", zone: "Africa/Lagos" },
  { name: "Norvège", zone: "Europe/Oslo" },
  { name: "Nouvelle-Zélande", zone: "Pacific/Auckland" },
  { name: "Oman", zone: "Asia/Muscat" },
  { name: "Ouganda", zone: "Africa/Kampala" },
  { name: "Ouzbékistan", zone: "Asia/Tashkent" },
  { name: "Pakistan", zone: "Asia/Karachi" },
  { name: "Palaos", zone: "Pacific/Palau" },
  { name: "Palestine", zone: "Asia/Gaza" },
  { name: "Panama", zone: "America/Panama" },
  { name: "Papouasie-Nouvelle-Guinée", zone: "Pacific/Port_Moresby" },
  { name: "Paraguay", zone: "America/Asuncion" },
  { name: "Pays-Bas", zone: "Europe/Amsterdam" },
  { name: "Pérou", zone: "America/Lima" },
  { name: "Philippines", zone: "Asia/Manila" },
  { name: "Pologne", zone: "Europe/Warsaw" },
  { name: "Portugal", zone: "Europe/Lisbon" },
  { name: "Qatar", zone: "Asia/Qatar" },
  { name: "République centrafricaine", zone: "Africa/Bangui" },
  { name: "République démocratique du Congo", zone: "Africa/Kinshasa" },
  { name: "République dominicaine", zone: "America/Santo_Domingo" },
  { name: "République tchèque", zone: "Europe/Prague" },
  { name: "Roumanie", zone: "Europe/Bucharest" },
  { name: "Royaume-Uni", zone: "Europe/London" },
  { name: "Russie", zone: "Europe/Moscow" },
  { name: "Rwanda", zone: "Africa/Kigali" },
  { name: "Saint-Christophe-et-Niévès", zone: "America/St_Kitts" },
  { name: "Saint-Marin", zone: "Europe/San_Marino" },
  { name: "Saint-Vincent-et-les-Grenadines", zone: "America/St_Vincent" },
  { name: "Sainte-Lucie", zone: "America/St_Lucia" },
  { name: "Salvador", zone: "America/El_Salvador" },
  { name: "Samoa", zone: "Pacific/Apia" },
  { name: "São Tomé-et-Principe", zone: "Africa/Sao_Tome" },
  { name: "Sénégal", zone: "Africa/Dakar" },
  { name: "Serbie", zone: "Europe/Belgrade" },
  { name: "Seychelles", zone: "Indian/Mahe" },
  { name: "Sierra Leone", zone: "Africa/Freetown" },
  { name: "Singapour", zone: "Asia/Singapore" },
  { name: "Slovaquie", zone: "Europe/Bratislava" },
  { name: "Slovénie", zone: "Europe/Ljubljana" },
  { name: "Somalie", zone: "Africa/Mogadishu" },
  { name: "Soudan", zone: "Africa/Khartoum" },
  { name: "Soudan du Sud", zone: "Africa/Juba" },
  { name: "Sri Lanka", zone: "Asia/Colombo" },
  { name: "Suède", zone: "Europe/Stockholm" },
  { name: "Suisse", zone: "Europe/Zurich" },
  { name: "Suriname", zone: "America/Paramaribo" },
  { name: "Syrie", zone: "Asia/Damascus" },
  { name: "Tadjikistan", zone: "Asia/Dushanbe" },
  { name: "Taïwan", zone: "Asia/Taipei" },
  { name: "Tanzanie", zone: "Africa/Dar_es_Salaam" },
  { name: "Tchad", zone: "Africa/Ndjamena" },
  { name: "Thaïlande", zone: "Asia/Bangkok" },
  { name: "Timor oriental", zone: "Asia/Dili" },
  { name: "Togo", zone: "Africa/Lome" },
  { name: "Tonga", zone: "Pacific/Tongatapu" },
  { name: "Trinité-et-Tobago", zone: "America/Port_of_Spain" },
  { name: "Tunisie", zone: "Africa/Tunis" },
  { name: "Turkménistan", zone: "Asia/Ashgabat" },
  { name: "Turquie", zone: "Europe/Istanbul" },
  { name: "Tuvalu", zone: "Pacific/Funafuti" },
  { name: "Ukraine", zone: "Europe/Kyiv" },
  { name: "Uruguay", zone: "America/Montevideo" },
  { name: "Vanuatu", zone: "Pacific/Efate" },
  { name: "Vatican", zone: "Europe/Vatican" },
  { name: "Venezuela", zone: "America/Caracas" },
  { name: "Vietnam", zone: "Asia/Ho_Chi_Minh" },
  { name: "Yémen", zone: "Asia/Aden" },
  { name: "Zambie", zone: "Africa/Lusaka" },
  { name: "Zimbabwe", zone: "Africa/Harare" }
];

const storedTimezone = getStoredTimezone();
const storedCustomization = getStoredCustomization();
let activeCountry = countries.find(country => country.zone === storedTimezone) ||
  countries.find(country => country.zone === WORLD_TIME_ZONE) ||
  countries[0];

let activeZone = activeCountry.zone;
let activeCustomization = storedCustomization;
let undoStack = [];
let redoStack = [];
let clockTimerId;
let syncedUtcMs = null;
let syncedAtPerfMs = 0;
let syncRequest = null;
let cursorHideTimerId = null;
let batterySnapshot = null;
const CURSOR_HIDE_DELAY_MS = 2500;

function getClockLabel(countryName) {
  if (activeZone === WORLD_TIME_ZONE) {
    return "HEURE MONDIALE - UTC";
  }

  return `HEURE ACTUELLE - ${countryName.toUpperCase()}`;
}

function getCurrentReferenceDate() {
  if (syncedUtcMs !== null) {
    const elapsedMs = performance.now() - syncedAtPerfMs;
    return new Date(syncedUtcMs + elapsedMs);
  }

  return new Date();
}

function getUtcOffsetLabel(zone) {
  if (zone === WORLD_TIME_ZONE) {
    return "UTC+0";
  }

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    timeZoneName: "shortOffset"
  }).formatToParts(getCurrentReferenceDate());

  const zoneNamePart = parts.find(part => part.type === "timeZoneName")?.value || "GMT+0";
  return zoneNamePart.replace("GMT", "UTC");
}

function renderTimezoneOptions() {
  timezoneSelect.innerHTML = "";

  countries.forEach(country => {
    const option = document.createElement("option");
    option.value = country.zone;
    option.textContent = `${country.name} - ${getUtcOffsetLabel(country.zone)}`;

    if (country.zone === activeZone) {
      option.selected = true;
    }

    timezoneSelect.appendChild(option);
  });
}

function formatTime(zone) {
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: zone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).format(getCurrentReferenceDate());
}

function updateClock() {
  clockTime.textContent = formatTime(activeZone);
  clockLabel.textContent = getClockLabel(activeCountry.name);
}

async function fetchWorldTime() {
  const requestUrl = new URL(WORLD_TIME_API_URL);

  if (requestUrl.origin !== WORLD_TIME_API_ORIGIN || requestUrl.protocol !== "https:") {
    throw new Error("Blocked unexpected world time API origin");
  }

  const abortController = new AbortController();
  const timeoutId = setTimeout(() => abortController.abort(), 5000);

  try {
    const response = await fetch(requestUrl.toString(), {
      cache: "no-store",
      credentials: "omit",
      mode: "cors",
      redirect: "error",
      referrerPolicy: "no-referrer",
      signal: abortController.signal
    });

    if (!response.ok) {
      throw new Error(`World time sync failed: ${response.status}`);
    }

    return response.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

async function syncTimeFromWorldService() {
  if (syncRequest) {
    return syncRequest;
  }

  syncRequest = fetchWorldTime()
    .then(data => {
      const utcDateTime = data.utc_datetime || data.datetime;
      const parsedUtcMs = Date.parse(utcDateTime);

      if (Number.isNaN(parsedUtcMs)) {
        throw new Error("World time sync returned an invalid datetime");
      }

      syncedUtcMs = parsedUtcMs;
      syncedAtPerfMs = performance.now();
      renderTimezoneOptions();
      updateClock();
    })
    .catch(() => {
      if (syncedUtcMs === null) {
        updateClock();
      }
    })
    .finally(() => {
      syncRequest = null;
    });

  return syncRequest;
}

function syncClock() {
  updateClock();
  clearTimeout(clockTimerId);

  const delayBeforeNextTick = 1000 - (Date.now() % 1000);
  clockTimerId = setTimeout(syncClock, delayBeforeNextTick);
}

function getStoredCustomization() {
  try {
    return sanitizeCustomization(JSON.parse(localStorage.getItem(CUSTOMIZATION_STORAGE_KEY) || "null"));
  } catch {
    return cloneCustomization(DEFAULT_CUSTOMIZATION);
  }
}

function saveCustomization(customization) {
  try {
    localStorage.setItem(CUSTOMIZATION_STORAGE_KEY, JSON.stringify(customization));
  } catch {
    // Ignore localStorage failures and keep the current customization for the session.
  }
}

function cloneCustomization(customization) {
  return JSON.parse(JSON.stringify(customization));
}

function areCustomizationsEqual(first, second) {
  return JSON.stringify(first) === JSON.stringify(second);
}

function sanitizeOptionalText(value, maxLength = 4) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function sanitizeRequiredText(value, fallback, maxLength = 40) {
  const sanitizedValue = sanitizeOptionalText(value, maxLength);
  return sanitizedValue || fallback;
}

function sanitizeCustomization(customization) {
  const source = customization || {};

  return {
    backgroundLight: isHexColor(source.backgroundLight) ? source.backgroundLight : DEFAULT_CUSTOMIZATION.backgroundLight,
    backgroundDark: isHexColor(source.backgroundDark) ? source.backgroundDark : DEFAULT_CUSTOMIZATION.backgroundDark,
    textLight: isHexColor(source.textLight) ? source.textLight : DEFAULT_CUSTOMIZATION.textLight,
    textDark: isHexColor(source.textDark) ? source.textDark : DEFAULT_CUSTOMIZATION.textDark,
    brandText: sanitizeRequiredText(source.brandText, DEFAULT_CUSTOMIZATION.brandText, 40),
    brandIcon: sanitizeOptionalText(source.brandIcon, 4),
    chargingColor: isHexColor(source.chargingColor) ? source.chargingColor : DEFAULT_CUSTOMIZATION.chargingColor,
    chargingIcon: sanitizeRequiredText(source.chargingIcon, DEFAULT_CUSTOMIZATION.chargingIcon, 4),
    levelHighColor: isHexColor(source.levelHighColor) ? source.levelHighColor : DEFAULT_CUSTOMIZATION.levelHighColor,
    levelMediumColor: isHexColor(source.levelMediumColor) ? source.levelMediumColor : DEFAULT_CUSTOMIZATION.levelMediumColor,
    levelWarningColor: isHexColor(source.levelWarningColor) ? source.levelWarningColor : DEFAULT_CUSTOMIZATION.levelWarningColor,
    levelLowColor: isHexColor(source.levelLowColor) ? source.levelLowColor : DEFAULT_CUSTOMIZATION.levelLowColor,
    levelCriticalColor: isHexColor(source.levelCriticalColor) ? source.levelCriticalColor : DEFAULT_CUSTOMIZATION.levelCriticalColor,
    criticalThreshold: clamp(Number.parseInt(source.criticalThreshold, 10) || DEFAULT_CUSTOMIZATION.criticalThreshold, 1, 99)
  };
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function setRootVariable(name, value) {
  document.documentElement.style.setProperty(name, value);
}

function buildGradient(theme, customization) {
  if (theme === "dark") {
    if (customization.backgroundDark === DEFAULT_CUSTOMIZATION.backgroundDark) {
      return { start: "#020617", mid: "#020617", end: "#000000" };
    }

    return {
      start: rgbToHex(mixColors(customization.backgroundDark, "#0f172a", 0.3)),
      mid: customization.backgroundDark,
      end: rgbToHex(mixColors(customization.backgroundDark, "#000000", 0.7))
    };
  }

  if (customization.backgroundLight === DEFAULT_CUSTOMIZATION.backgroundLight) {
    return { start: "#eff6ff", mid: "#dbeafe", end: "#bfdbfe" };
  }

  return {
    start: rgbToHex(mixColors(customization.backgroundLight, "#ffffff", 0.46)),
    mid: customization.backgroundLight,
    end: rgbToHex(mixColors(customization.backgroundLight, "#93c5fd", 0.45))
  };
}

function updateHistoryButtons() {
  undoButton.disabled = undoStack.length === 0;
  redoButton.disabled = redoStack.length === 0;
}

function updateThresholdLabels(customization) {
  levelLowColorLabel.textContent = `${customization.criticalThreshold}% et +`;
  levelCriticalColorLabel.textContent = `Moins de ${customization.criticalThreshold}%`;
}

function syncInputsWithCustomization(customization) {
  backgroundLightInput.value = customization.backgroundLight;
  backgroundDarkInput.value = customization.backgroundDark;
  textLightInput.value = customization.textLight;
  textDarkInput.value = customization.textDark;
  brandTextInput.value = customization.brandText;
  brandIconInput.value = customization.brandIcon;
  chargingColorInput.value = customization.chargingColor;
  chargingIconInput.value = customization.chargingIcon;
  levelHighColorInput.value = customization.levelHighColor;
  levelMediumColorInput.value = customization.levelMediumColor;
  levelWarningColorInput.value = customization.levelWarningColor;
  levelLowColorInput.value = customization.levelLowColor;
  levelCriticalColorInput.value = customization.levelCriticalColor;
  criticalThresholdInput.value = String(customization.criticalThreshold);
}

function readCustomizationFromInputs() {
  return sanitizeCustomization({
    backgroundLight: backgroundLightInput.value,
    backgroundDark: backgroundDarkInput.value,
    textLight: textLightInput.value,
    textDark: textDarkInput.value,
    brandText: brandTextInput.value,
    brandIcon: brandIconInput.value,
    chargingColor: chargingColorInput.value,
    chargingIcon: chargingIconInput.value,
    levelHighColor: levelHighColorInput.value,
    levelMediumColor: levelMediumColorInput.value,
    levelWarningColor: levelWarningColorInput.value,
    levelLowColor: levelLowColorInput.value,
    levelCriticalColor: levelCriticalColorInput.value,
    criticalThreshold: criticalThresholdInput.value
  });
}

function applyCustomization(customization, syncInputs = true) {
  const resolvedCustomization = sanitizeCustomization(customization);
  const currentTheme = document.documentElement.classList.contains("theme-dark") ? "dark" : "light";
  const gradient = buildGradient(currentTheme, resolvedCustomization);
  const mainTextColor = currentTheme === "dark" ? resolvedCustomization.textDark : resolvedCustomization.textLight;
  const mutedTextColor = withAlpha(mainTextColor, currentTheme === "dark" ? 0.6 : 0.78);

  activeCustomization = resolvedCustomization;

  setRootVariable("--bg-main", `radial-gradient(circle at top, ${gradient.start}, ${gradient.mid} 52%, ${gradient.end} 100%)`);
  setRootVariable("--bg-solid", gradient.mid);
  setRootVariable("--text-main", mainTextColor);
  setRootVariable("--brand-text", mainTextColor);
  setRootVariable("--text-muted", mutedTextColor);
  setRootVariable("--hint-color", mutedTextColor);
  setRootVariable("--accent-main", mainTextColor);
  setRootVariable("--accent-soft", withAlpha(mainTextColor, 0.16));
  setRootVariable("--clock-glow", `0 0 16px ${withAlpha(mainTextColor, currentTheme === "dark" ? 0.28 : 0.16)}`);
  setRootVariable("--brand-shadow", `drop-shadow(0 0 16px ${withAlpha(resolvedCustomization.chargingColor, currentTheme === "dark" ? 0.2 : 0.34)})`);
  setRootVariable("--battery-critical", resolvedCustomization.levelCriticalColor);
  setRootVariable("--battery-critical-glow", withAlpha(resolvedCustomization.levelCriticalColor, 0.9));

  brandLogoText.textContent = resolvedCustomization.brandText;
  brandLogoGlyph.textContent = resolvedCustomization.brandIcon;
  brandMark.classList.toggle("has-custom-icon", resolvedCustomization.brandIcon !== "");
  bolt.textContent = resolvedCustomization.chargingIcon;

  updateThresholdLabels(resolvedCustomization);
  updateHistoryButtons();

  if (syncInputs) {
    syncInputsWithCustomization(resolvedCustomization);
  }

  if (batterySnapshot) {
    updateBatteryDisplay(batterySnapshot);
  }
}

function applyTheme(theme) {
  const isDarkTheme = theme === "dark";

  document.documentElement.classList.toggle("theme-dark", isDarkTheme);
  themeLightButton.setAttribute("aria-pressed", String(!isDarkTheme));
  themeDarkButton.setAttribute("aria-pressed", String(isDarkTheme));
  applyCustomization(activeCustomization);
}

function pushUndoState(previousCustomization) {
  const snapshot = cloneCustomization(previousCustomization);

  if (undoStack.length > 0 && areCustomizationsEqual(undoStack[undoStack.length - 1], snapshot)) {
    return;
  }

  undoStack.push(snapshot);
  if (undoStack.length > HISTORY_LIMIT) {
    undoStack.shift();
  }
  redoStack = [];
}

function commitCustomization(nextCustomization, shouldRecordHistory = true) {
  const resolvedCustomization = sanitizeCustomization(nextCustomization);

  if (shouldRecordHistory && !areCustomizationsEqual(activeCustomization, resolvedCustomization)) {
    pushUndoState(activeCustomization);
  }

  applyCustomization(resolvedCustomization);
  saveCustomization(resolvedCustomization);
}

function undoCustomization() {
  if (undoStack.length === 0) {
    return;
  }

  redoStack.push(cloneCustomization(activeCustomization));
  const previousCustomization = undoStack.pop();
  applyCustomization(previousCustomization);
  saveCustomization(previousCustomization);
}

function redoCustomization() {
  if (redoStack.length === 0) {
    return;
  }

  undoStack.push(cloneCustomization(activeCustomization));
  const nextCustomization = redoStack.pop();
  applyCustomization(nextCustomization);
  saveCustomization(nextCustomization);
}

function resetCustomization() {
  if (areCustomizationsEqual(activeCustomization, DEFAULT_CUSTOMIZATION)) {
    return;
  }

  pushUndoState(activeCustomization);
  applyCustomization(DEFAULT_CUSTOMIZATION);
  saveCustomization(DEFAULT_CUSTOMIZATION);
}

function setPalettePanelOpen(isOpen) {
  paletteButton.setAttribute("aria-expanded", String(isOpen));
  palettePanel.classList.toggle("is-open", isOpen);
  palettePanel.setAttribute("aria-hidden", String(!isOpen));
}

function getBatteryColor(level) {
  if (level >= 80) return activeCustomization.levelHighColor;
  if (level >= 50) return activeCustomization.levelMediumColor;
  if (level > 35) return activeCustomization.levelWarningColor;
  if (level >= activeCustomization.criticalThreshold) return activeCustomization.levelLowColor;
  return activeCustomization.levelCriticalColor;
}

function updateBatteryDisplay(snapshot) {
  const level = Math.round(snapshot.level * 100);
  const batteryColor = getBatteryColor(level);

  percent.textContent = `${level}%`;

  if (snapshot.charging) {
    leftFill.style.background = activeCustomization.chargingColor;
    bolt.style.display = "flex";
    percent.style.color = activeCustomization.chargingColor;
    percent.classList.remove("low-battery-alert");
  } else {
    leftFill.style.background = "#9ca3af";
    bolt.style.display = "none";
    percent.style.color = batteryColor;
    percent.classList.toggle("low-battery-alert", level < activeCustomization.criticalThreshold);
  }

  rightFill.style.height = `${level}%`;
  rightFill.style.background = batteryColor;
  rightBubbles.style.setProperty("--bubble-color", batteryColor);
}

timezoneSelect.addEventListener("change", event => {
  activeCountry = countries.find(country => country.zone === event.target.value) || countries[0];
  activeZone = activeCountry.zone;
  saveTimezone(activeZone);
  updateClock();
  setTimeout(() => {
    timezoneSelect.blur();
    document.body.focus();
  }, 0);
});

["pointerdown", "mousedown", "click", "touchstart"].forEach(eventName => {
  controlsPanel.addEventListener(eventName, event => {
    event.stopPropagation();
  });
  themeSwitch.addEventListener(eventName, event => {
    event.stopPropagation();
  });

  paletteButton.addEventListener(eventName, event => {
    event.stopPropagation();
  });

  palettePanel.addEventListener(eventName, event => {
    event.stopPropagation();
  });
});

themeLightButton.addEventListener("click", () => {
  applyTheme("light");
  saveTheme("light");
});

themeDarkButton.addEventListener("click", () => {
  applyTheme("dark");
  saveTheme("dark");
});

paletteButton.addEventListener("click", () => {
  const isOpen = paletteButton.getAttribute("aria-expanded") === "true";
  setPalettePanelOpen(!isOpen);
});

[
  backgroundLightInput,
  backgroundDarkInput,
  textLightInput,
  textDarkInput,
  brandTextInput,
  brandIconInput,
  chargingColorInput,
  chargingIconInput,
  levelHighColorInput,
  levelMediumColorInput,
  levelWarningColorInput,
  levelLowColorInput,
  levelCriticalColorInput,
  criticalThresholdInput
].forEach(input => {
  input.addEventListener("input", () => {
    commitCustomization(readCustomizationFromInputs());
  });
});

undoButton.addEventListener("click", undoCustomization);
redoButton.addEventListener("click", redoCustomization);
resetPaletteButton.addEventListener("click", resetCustomization);

document.body.addEventListener("click", event => {
  if (
    event.target.closest(".timezone-picker") ||
    event.target.closest(".palette-panel") ||
    event.target.closest(".palette-button") ||
    event.target.closest(".theme-controls")
  ) {
    return;
  }

  setPalettePanelOpen(false);
  toggleFullscreen();
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    setPalettePanelOpen(false);
  }

  if ((event.ctrlKey || event.metaKey) && !event.shiftKey && event.key.toLowerCase() === "z") {
    event.preventDefault();
    undoCustomization();
  }

  if (
    (event.ctrlKey || event.metaKey) &&
    (event.key.toLowerCase() === "y" || (event.shiftKey && event.key.toLowerCase() === "z"))
  ) {
    event.preventDefault();
    redoCustomization();
  }
});

document.addEventListener("fullscreenchange", () => {
  removeHashFromUrl();
  updateFullscreenHint();
  refreshCursorVisibility();
});
document.addEventListener("DOMContentLoaded", removeHashFromUrl);
window.addEventListener("load", removeHashFromUrl);
window.addEventListener("pageshow", removeHashFromUrl);
window.addEventListener("hashchange", removeHashFromUrl);
window.addEventListener("popstate", removeHashFromUrl);
window.addEventListener("resize", applyDeviceLayout);
window.addEventListener("orientationchange", applyDeviceLayout);
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
  if (getStoredTheme()) {
    return;
  }

  applyTheme(getSystemTheme());
});
["mousemove", "mousedown", "pointerdown", "pointermove", "touchstart", "keydown"].forEach(eventName => {
  document.addEventListener(eventName, refreshCursorVisibility, { passive: true });
});

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

for (let index = 0; index < 6; index += 1) {
  const bubble = document.createElement("span");
  bubble.className = "battery-bubble";
  rightBubbles.appendChild(bubble);
}

if ("getBattery" in navigator) {
  navigator.getBattery().then(battery => {
    setBatteryAvailability(true);

    function updateBattery() {
      batterySnapshot = battery;
      updateBatteryDisplay(batterySnapshot);
    }

    updateBattery();
    battery.addEventListener("levelchange", updateBattery);
    battery.addEventListener("chargingchange", updateBattery);
  }).catch(() => {
    setBatteryAvailability(false);
  });
} else {
  setBatteryAvailability(false);
}
