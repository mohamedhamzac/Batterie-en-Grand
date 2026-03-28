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

function applyTheme(theme) {
  const isDarkTheme = theme === "dark";

  document.documentElement.classList.toggle("theme-dark", isDarkTheme);

  if (themeLightButton && themeDarkButton) {
    themeLightButton.setAttribute("aria-pressed", String(!isDarkTheme));
    themeDarkButton.setAttribute("aria-pressed", String(isDarkTheme));
  }
}

function toggleTheme() {
  const nextTheme = document.documentElement.classList.contains("theme-dark") ? "light" : "dark";
  applyTheme(nextTheme);
  saveTheme(nextTheme);
}

function updateFullscreenHint() {
  if (!fullscreenHint) {
    return;
  }

  fullscreenHint.textContent = document.fullscreenElement
    ? "Cliquer pour quitter plein écran"
    : "Cliquer pour plein écran";
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
const timezoneSelect = document.getElementById("timezoneSelect");
const controlsPanel = document.querySelector(".controls-panel");
const rightBubbles = document.getElementById("rightBubbles");
const THEME_STORAGE_KEY = "batterie-en-grand-theme";
const TIMEZONE_STORAGE_KEY = "batterie-en-grand-timezone";
const WORLD_TIME_ZONE = "UTC";
const WORLD_TIME_API_ORIGIN = "https://worldtimeapi.org";
const WORLD_TIME_API_URL = "https://worldtimeapi.org/api/timezone/Etc/UTC";

const countries = [
  { name: "Heure mondiale (UTC)", zone: WORLD_TIME_ZONE },
  { name: "Afghanistan", zone: "Asia/Kabul" },
  { name: "Afrique du Sud", zone: "Africa/Johannesburg" },
  { name: "Albanie", zone: "Europe/Tirane" },
  { name: "Algerie", zone: "Africa/Algiers" },
  { name: "Allemagne", zone: "Europe/Berlin" },
  { name: "Andorre", zone: "Europe/Andorra" },
  { name: "Angola", zone: "Africa/Luanda" },
  { name: "Arabie saoudite", zone: "Asia/Riyadh" },
  { name: "Argentine", zone: "America/Argentina/Buenos_Aires" },
  { name: "Armenie", zone: "Asia/Yerevan" },
  { name: "Australie", zone: "Australia/Sydney" },
  { name: "Autriche", zone: "Europe/Vienna" },
  { name: "Azerbaidjan", zone: "Asia/Baku" },
  { name: "Bahrein", zone: "Asia/Bahrain" },
  { name: "Bangladesh", zone: "Asia/Dhaka" },
  { name: "Belgique", zone: "Europe/Brussels" },
  { name: "Benin", zone: "Africa/Porto-Novo" },
  { name: "Bielorussie", zone: "Europe/Minsk" },
  { name: "Bolivie", zone: "America/La_Paz" },
  { name: "Bosnie-Herzegovine", zone: "Europe/Sarajevo" },
  { name: "Botswana", zone: "Africa/Gaborone" },
  { name: "Bresil", zone: "America/Sao_Paulo" },
  { name: "Bulgarie", zone: "Europe/Sofia" },
  { name: "Burkina Faso", zone: "Africa/Ouagadougou" },
  { name: "Cambodge", zone: "Asia/Phnom_Penh" },
  { name: "Cameroun", zone: "Africa/Douala" },
  { name: "Canada", zone: "America/Toronto" },
  { name: "Chili", zone: "America/Santiago" },
  { name: "Chine", zone: "Asia/Shanghai" },
  { name: "Chypre", zone: "Asia/Nicosia" },
  { name: "Colombie", zone: "America/Bogota" },
  { name: "Coree du Nord", zone: "Asia/Pyongyang" },
  { name: "Coree du Sud", zone: "Asia/Seoul" },
  { name: "Costa Rica", zone: "America/Costa_Rica" },
  { name: "Cote d'Ivoire", zone: "Africa/Abidjan" },
  { name: "Croatie", zone: "Europe/Zagreb" },
  { name: "Cuba", zone: "America/Havana" },
  { name: "Danemark", zone: "Europe/Copenhagen" },
  { name: "Egypte", zone: "Africa/Cairo" },
  { name: "Emirats arabes unis", zone: "Asia/Dubai" },
  { name: "Equateur", zone: "America/Guayaquil" },
  { name: "Espagne", zone: "Europe/Madrid" },
  { name: "Estonie", zone: "Europe/Tallinn" },
  { name: "Etats-Unis", zone: "America/New_York" },
  { name: "Ethiopie", zone: "Africa/Addis_Ababa" },
  { name: "Finlande", zone: "Europe/Helsinki" },
  { name: "France", zone: "Europe/Paris" },
  { name: "Gabon", zone: "Africa/Libreville" },
  { name: "Georgie", zone: "Asia/Tbilisi" },
  { name: "Ghana", zone: "Africa/Accra" },
  { name: "Grece", zone: "Europe/Athens" },
  { name: "Guatemala", zone: "America/Guatemala" },
  { name: "Guinee", zone: "Africa/Conakry" },
  { name: "Haiti", zone: "America/Port-au-Prince" },
  { name: "Honduras", zone: "America/Tegucigalpa" },
  { name: "Hongrie", zone: "Europe/Budapest" },
  { name: "Inde", zone: "Asia/Kolkata" },
  { name: "Indonesie", zone: "Asia/Jakarta" },
  { name: "Irak", zone: "Asia/Baghdad" },
  { name: "Iran", zone: "Asia/Tehran" },
  { name: "Irlande", zone: "Europe/Dublin" },
  { name: "Islande", zone: "Atlantic/Reykjavik" },
  { name: "Israel", zone: "Asia/Jerusalem" },
  { name: "Italie", zone: "Europe/Rome" },
  { name: "Jamaïque", zone: "America/Jamaica" },
  { name: "Japon", zone: "Asia/Tokyo" },
  { name: "Jordanie", zone: "Asia/Amman" },
  { name: "Kazakhstan", zone: "Asia/Almaty" },
  { name: "Kenya", zone: "Africa/Nairobi" },
  { name: "Koweit", zone: "Asia/Kuwait" },
  { name: "Laos", zone: "Asia/Vientiane" },
  { name: "Lettonie", zone: "Europe/Riga" },
  { name: "Liban", zone: "Asia/Beirut" },
  { name: "Libye", zone: "Africa/Tripoli" },
  { name: "Lituanie", zone: "Europe/Vilnius" },
  { name: "Luxembourg", zone: "Europe/Luxembourg" },
  { name: "Madagascar", zone: "Indian/Antananarivo" },
  { name: "Malaisie", zone: "Asia/Kuala_Lumpur" },
  { name: "Mali", zone: "Africa/Bamako" },
  { name: "Maroc", zone: "Africa/Casablanca" },
  { name: "Mexique", zone: "America/Mexico_City" },
  { name: "Monaco", zone: "Europe/Monaco" },
  { name: "Mongolie", zone: "Asia/Ulaanbaatar" },
  { name: "Mozambique", zone: "Africa/Maputo" },
  { name: "Namibie", zone: "Africa/Windhoek" },
  { name: "Nepal", zone: "Asia/Kathmandu" },
  { name: "Niger", zone: "Africa/Niamey" },
  { name: "Nigeria", zone: "Africa/Lagos" },
  { name: "Norvege", zone: "Europe/Oslo" },
  { name: "Nouvelle-Zelande", zone: "Pacific/Auckland" },
  { name: "Oman", zone: "Asia/Muscat" },
  { name: "Ouganda", zone: "Africa/Kampala" },
  { name: "Pakistan", zone: "Asia/Karachi" },
  { name: "Panama", zone: "America/Panama" },
  { name: "Paraguay", zone: "America/Asuncion" },
  { name: "Pays-Bas", zone: "Europe/Amsterdam" },
  { name: "Perou", zone: "America/Lima" },
  { name: "Philippines", zone: "Asia/Manila" },
  { name: "Pologne", zone: "Europe/Warsaw" },
  { name: "Portugal", zone: "Europe/Lisbon" },
  { name: "Qatar", zone: "Asia/Qatar" },
  { name: "Republique tcheque", zone: "Europe/Prague" },
  { name: "Republique dominicaine", zone: "America/Santo_Domingo" },
  { name: "Roumanie", zone: "Europe/Bucharest" },
  { name: "Royaume-Uni", zone: "Europe/London" },
  { name: "Russie", zone: "Europe/Moscow" },
  { name: "Rwanda", zone: "Africa/Kigali" },
  { name: "Senegal", zone: "Africa/Dakar" },
  { name: "Serbie", zone: "Europe/Belgrade" },
  { name: "Singapour", zone: "Asia/Singapore" },
  { name: "Slovaquie", zone: "Europe/Bratislava" },
  { name: "Slovenie", zone: "Europe/Ljubljana" },
  { name: "Somalie", zone: "Africa/Mogadishu" },
  { name: "Soudan", zone: "Africa/Khartoum" },
  { name: "Sri Lanka", zone: "Asia/Colombo" },
  { name: "Suede", zone: "Europe/Stockholm" },
  { name: "Suisse", zone: "Europe/Zurich" },
  { name: "Syrie", zone: "Asia/Damascus" },
  { name: "Taiwan", zone: "Asia/Taipei" },
  { name: "Tanzanie", zone: "Africa/Dar_es_Salaam" },
  { name: "Tchad", zone: "Africa/Ndjamena" },
  { name: "Thailande", zone: "Asia/Bangkok" },
  { name: "Tunisie", zone: "Africa/Tunis" },
  { name: "Turquie", zone: "Europe/Istanbul" },
  { name: "Ukraine", zone: "Europe/Kyiv" },
  { name: "Uruguay", zone: "America/Montevideo" },
  { name: "Venezuela", zone: "America/Caracas" },
  { name: "Vietnam", zone: "Asia/Ho_Chi_Minh" },
  { name: "Yemen", zone: "Asia/Aden" },
  { name: "Zambie", zone: "Africa/Lusaka" },
  { name: "Zimbabwe", zone: "Africa/Harare" }
];

const storedTimezone = getStoredTimezone();
let activeCountry = countries.find(country => country.zone === storedTimezone) ||
  countries.find(country => country.zone === WORLD_TIME_ZONE) ||
  countries[0];

let activeZone = activeCountry.zone;
let clockTimerId;
let syncedUtcMs = null;
let syncedAtPerfMs = 0;
let syncRequest = null;
let cursorHideTimerId = null;
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

function getBatteryColor(level) {
  if (level >= 80) return "#22c55e";
  if (level >= 50) return "#facc15";
  if (level > 35) return "#fb923c";
  if (level >= 15) return "#dc2626";
  return "#7f1d1d";
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
});

["pointerdown", "mousedown", "click", "touchstart"].forEach(eventName => {
  themeSwitch.addEventListener(eventName, event => {
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

document.body.addEventListener("click", event => {
  if (event.target.closest(".timezone-picker")) {
    return;
  }

  toggleFullscreen();
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
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
  if (getStoredTheme()) {
    return;
  }

  applyTheme(getSystemTheme());
});
["mousemove", "mousedown", "pointerdown", "pointermove", "touchstart", "keydown"].forEach(eventName => {
  document.addEventListener(eventName, refreshCursorVisibility, { passive: true });
});

renderTimezoneOptions();
applyTheme(getPreferredTheme());
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

if ('getBattery' in navigator) {
  navigator.getBattery().then(battery => {

    function updateBattery() {
      const level = Math.round(battery.level * 100);
      const percent = document.getElementById("percent");
      percent.textContent = level + "%";

      const leftFill = document.getElementById("leftFill");
      const rightFill = document.getElementById("rightFill");
      const bolt = document.getElementById("bolt");
      const batteryColor = getBatteryColor(level);

      // ===== Si ça charge =====
      if (battery.charging) {
        leftFill.style.background = "#22c55e";
        bolt.style.display = "flex";
        percent.style.color = "#22c55e";
        percent.classList.remove("low-battery-alert");
      } else {
        leftFill.style.background = "#9ca3af";
        bolt.style.display = "none";
        percent.style.color = batteryColor;
        percent.classList.toggle("low-battery-alert", level < 15);
      }

      // ===== Batterie droite =====
      rightFill.style.height = level + "%";
      rightFill.style.background = batteryColor;
      rightBubbles.style.setProperty("--bubble-color", batteryColor);
    }

    updateBattery();
    battery.addEventListener("levelchange", updateBattery);
    battery.addEventListener("chargingchange", updateBattery);
  });
} else {
  document.getElementById("percent").textContent = "Non supporté";
}
