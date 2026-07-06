import {
  FORECAST_URL,
  GEOCODE_URL,
  MOCK_WEATHER_LOCATION,
  WEATHER_ICONS,
  DEFAULT_WEATHER_MODEL,
} from "../constants";

const PREVIEW_WEATHER_CODES = Object.keys(WEATHER_ICONS).map(Number);

function padNumber(value) {
  return value.toString().padStart(2, "0");
}

function formatMockTime(date) {
  return `${date.getFullYear()}-${padNumber(date.getMonth() + 1)}-${padNumber(date.getDate())}T${padNumber(date.getHours())}:00`;
}

function getMockPrecipitation(weatherCode, hourIndex) {
  if (
    [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(weatherCode)
  ) {
    return Number(((hourIndex % 4) * 0.4 + 0.2).toFixed(1));
  }

  if ([71, 73, 75, 77, 85, 86, 95, 96, 99].includes(weatherCode)) {
    return Number(((hourIndex % 3) * 0.3 + 0.1).toFixed(1));
  }

  return 0;
}

function buildMockForecast() {
  const totalHours = 5 * 24;
  const start = new Date();
  start.setMinutes(0, 0, 0);
  start.setHours(0);

  const hourly = {
    time: [],
    weathercode: [],
    temperature_2m: [],
    precipitation: [],
    windspeed_10m: [],
    windgusts_10m: [],
    winddirection_10m: [],
  };

  for (let hourIndex = 0; hourIndex < totalHours; hourIndex += 1) {
    const date = new Date(start);
    date.setHours(start.getHours() + hourIndex);

    const codeIndex = Math.floor(hourIndex / 3) % PREVIEW_WEATHER_CODES.length;
    const weatherCode = PREVIEW_WEATHER_CODES[codeIndex];
    const windSpeed = 4 + ((codeIndex * 2) % 24);

    hourly.time.push(formatMockTime(date));
    hourly.weathercode.push(weatherCode);
    hourly.temperature_2m.push(8 + (codeIndex % 18));
    hourly.precipitation.push(getMockPrecipitation(weatherCode, hourIndex));
    hourly.windspeed_10m.push(windSpeed);
    hourly.windgusts_10m.push(windSpeed + 4 + (codeIndex % 5));
    hourly.winddirection_10m.push((codeIndex * 32) % 360);
  }

  const daily = {
    time: [],
    sunrise: [],
    sunset: [],
  };

  for (let dayIndex = 0; dayIndex < 5; dayIndex += 1) {
    const date = new Date(start);
    date.setDate(start.getDate() + dayIndex);
    const dateStr = `${date.getFullYear()}-${padNumber(date.getMonth() + 1)}-${padNumber(date.getDate())}`;
    daily.time.push(dateStr);
    daily.sunrise.push(`${dateStr}T06:00`);
    daily.sunset.push(`${dateStr}T20:00`);
  }

  return { hourly, daily };
}

export async function searchLocations(query) {
  const url = `${GEOCODE_URL}?name=${encodeURIComponent(query)}&count=6&language=de&format=json`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Geocoding fehlgeschlagen");
  }

  const data = await response.json();

  return (data.results || []).map((result) => ({
    name: result.name,
    admin1: result.admin1 || "",
    country: result.country || "",
    lat: result.latitude,
    lon: result.longitude,
    id: `${result.latitude}-${result.longitude}`,
  }));
}

export async function fetchForecast(lat, lon) {
  if (lat === MOCK_WEATHER_LOCATION.lat && lon === MOCK_WEATHER_LOCATION.lon) {
    return buildMockForecast();
  }

  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    hourly:
      "temperature_2m,precipitation,weathercode,windspeed_10m,wind_gusts_10m,winddirection_10m",
    daily: "sunrise,sunset",
    wind_speed_unit: "kn",
    timezone: "auto",
    forecast_days: "7",
    models: DEFAULT_WEATHER_MODEL,
  });

  const response = await fetch(`${FORECAST_URL}?${params.toString()}`);

  if (!response.ok) {
    throw new Error("Forecast fehlgeschlagen");
  }

  const json = await response.json();

  // Normalize hourly keys to expected names used by the UI.
  // Some Open-Meteo endpoints / models may expose slightly different names.
  if (json && json.hourly) {
    const h = json.hourly;
    // helper to copy from fallback keys
    function ensure(key, ...candidates) {
      if (h[key] === undefined || h[key] === null) {
        for (const c of candidates) {
          if (h[c] !== undefined) {
            h[key] = h[c];
            break;
          }
        }
      }
    }

    ensure("temperature_2m", "temperature2m", "temp_2m");
    ensure("precipitation", "precipitation_sum", "rain", "precip");
    ensure("weathercode", "weather_code", "weathercode_2m");
    ensure("windspeed_10m", "wind_speed_10m", "windspeed10m");
    ensure("windgusts_10m", "wind_gusts_10m", "windgusts10m");
    ensure("winddirection_10m", "wind_direction_10m", "winddirection10m");

    // Log keys for debugging when things are missing in the UI
    try {
      // eslint-disable-next-line no-console
      console.debug("forecast hourly keys:", Object.keys(h));

      const summary = [
        "temperature_2m",
        "precipitation",
        "weathercode",
        "windspeed_10m",
        "windgusts_10m",
        "winddirection_10m",
      ].map((k) => [k, Array.isArray(h[k]) ? h[k].slice(0, 3) : h[k]]);
      // eslint-disable-next-line no-console
      console.debug("forecast sample:", summary);
    } catch (err) {
      // ignore logging errors
    }
    // If wind gusts are missing or all null, synthesize approximate gusts
    try {
      const gusts = h.windgusts_10m;
      const speeds = h.windspeed_10m;
      const hasValidGusts =
        Array.isArray(gusts) &&
        gusts.some((v) => typeof v === "number" && Number.isFinite(v));
      if (!hasValidGusts && Array.isArray(speeds)) {
        // approximate gusts as a factor of wind speed (typical factor between 1.2-1.6)
        const factor = 1.4;
        h.windgusts_10m = speeds.map((s) =>
          typeof s === "number" && Number.isFinite(s)
            ? Number((s * factor).toFixed(1))
            : null,
        );
        // eslint-disable-next-line no-console
        console.debug(
          "synthesized windgusts_10m from windspeed_10m using factor",
          factor,
        );
      }
    } catch (err) {
      // ignore
    }
  }

  return json;
}
