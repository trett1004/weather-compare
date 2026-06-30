import { FORECAST_URL, GEOCODE_URL } from "../constants";

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
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    hourly:
      "temperature_2m,precipitation,weathercode,windspeed_10m,windgusts_10m,winddirection_10m",
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
