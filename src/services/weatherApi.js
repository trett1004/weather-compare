import {
  FORECAST_URL,
  GEOCODE_URL,
  MOCK_WEATHER_LOCATION,
  WEATHER_ICONS,
} from "../constants";

const PREVIEW_WEATHER_CODES = Object.keys(WEATHER_ICONS).map(Number);

function padNumber(value) {
  return value.toString().padStart(2, "0");
}

function formatMockTime(date) {
  return `${date.getFullYear()}-${padNumber(date.getMonth() + 1)}-${padNumber(date.getDate())}T${padNumber(date.getHours())}:00`;
}

function getMockPrecipitation(weatherCode, hourIndex) {
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(weatherCode)) {
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
      "temperature_2m,precipitation,weathercode,windspeed_10m,windgusts_10m,winddirection_10m",
    daily: "sunrise,sunset",
    wind_speed_unit: "kn",
    timezone: "auto",
    forecast_days: "5",
  });

  const response = await fetch(`${FORECAST_URL}?${params.toString()}`);

  if (!response.ok) {
    throw new Error("Forecast fehlgeschlagen");
  }

  return response.json();
}
