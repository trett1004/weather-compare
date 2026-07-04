import clearDayIcon from "@meteocons/svg-static/fill/clear-day.svg?raw";
import clearNightIcon from "@meteocons/svg-static/fill/clear-night.svg?raw";
import mostlyClearDayIcon from "@meteocons/svg-static/fill/mostly-clear-day.svg?raw";
import mostlyClearNightIcon from "@meteocons/svg-static/fill/mostly-clear-night.svg?raw";
import partlyCloudyDayIcon from "@meteocons/svg-static/fill/partly-cloudy-day.svg?raw";
import partlyCloudyNightIcon from "@meteocons/svg-static/fill/partly-cloudy-night.svg?raw";
import overcastDayIcon from "@meteocons/svg-static/fill/overcast-day.svg?raw";
import overcastNightIcon from "@meteocons/svg-static/fill/overcast-night.svg?raw";
import fogIcon from "@meteocons/svg-static/fill/fog.svg?raw";
import partlyCloudyDayDrizzleIcon from "@meteocons/svg-static/fill/partly-cloudy-day-drizzle.svg?raw";
import partlyCloudyNightDrizzleIcon from "@meteocons/svg-static/fill/partly-cloudy-night-drizzle.svg?raw";
import overcastDayDrizzleIcon from "@meteocons/svg-static/fill/overcast-day-drizzle.svg?raw";
import overcastNightDrizzleIcon from "@meteocons/svg-static/fill/overcast-night-drizzle.svg?raw";
import extremeDayDrizzleIcon from "@meteocons/svg-static/fill/extreme-day-drizzle.svg?raw";
import extremeNightDrizzleIcon from "@meteocons/svg-static/fill/extreme-night-drizzle.svg?raw";
import mostlyClearDayRainIcon from "@meteocons/svg-static/fill/mostly-clear-day-rain.svg?raw";
import mostlyClearNightRainIcon from "@meteocons/svg-static/fill/mostly-clear-night-rain.svg?raw";
import overcastDayRainIcon from "@meteocons/svg-static/fill/overcast-day-rain.svg?raw";
import overcastNightRainIcon from "@meteocons/svg-static/fill/overcast-night-rain.svg?raw";
import extremeDayRainIcon from "@meteocons/svg-static/fill/extreme-day-rain.svg?raw";
import extremeNightRainIcon from "@meteocons/svg-static/fill/extreme-night-rain.svg?raw";
import partlyCloudyDaySleetIcon from "@meteocons/svg-static/fill/partly-cloudy-day-sleet.svg?raw";
import partlyCloudyNightSleetIcon from "@meteocons/svg-static/fill/partly-cloudy-night-sleet.svg?raw";
import overcastDaySleetIcon from "@meteocons/svg-static/fill/overcast-day-sleet.svg?raw";
import overcastNightSleetIcon from "@meteocons/svg-static/fill/overcast-night-sleet.svg?raw";
import mostlyClearDaySnowIcon from "@meteocons/svg-static/fill/mostly-clear-day-snow.svg?raw";
import mostlyClearNightSnowIcon from "@meteocons/svg-static/fill/mostly-clear-night-snow.svg?raw";
import overcastDaySnowIcon from "@meteocons/svg-static/fill/overcast-day-snow.svg?raw";
import overcastNightSnowIcon from "@meteocons/svg-static/fill/overcast-night-snow.svg?raw";
import extremeDaySnowIcon from "@meteocons/svg-static/fill/extreme-day-snow.svg?raw";
import extremeNightSnowIcon from "@meteocons/svg-static/fill/extreme-night-snow.svg?raw";
import snowflakeIcon from "@meteocons/svg-static/fill/snowflake.svg?raw";
import partlyCloudyDayRainIcon from "@meteocons/svg-static/fill/partly-cloudy-day-rain.svg?raw";
import partlyCloudyNightRainIcon from "@meteocons/svg-static/fill/partly-cloudy-night-rain.svg?raw";
import partlyCloudyDaySnowIcon from "@meteocons/svg-static/fill/partly-cloudy-day-snow.svg?raw";
import partlyCloudyNightSnowIcon from "@meteocons/svg-static/fill/partly-cloudy-night-snow.svg?raw";
import thunderstormsDayIcon from "@meteocons/svg-static/fill/thunderstorms-day.svg?raw";
import thunderstormsNightIcon from "@meteocons/svg-static/fill/thunderstorms-night.svg?raw";
import thunderstormsDayHailIcon from "@meteocons/svg-static/fill/thunderstorms-day-hail.svg?raw";
import thunderstormsNightHailIcon from "@meteocons/svg-static/fill/thunderstorms-night-hail.svg?raw";
import thunderstormsExtremeDayHailIcon from "@meteocons/svg-static/fill/thunderstorms-extreme-day-hail.svg?raw";
import thunderstormsExtremeNightHailIcon from "@meteocons/svg-static/fill/thunderstorms-extreme-night-hail.svg?raw";

export const GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search";
export const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
export const MAX_LOCATIONS = 10;
export const STORAGE_KEY = "savedLocations";
export const MOCK_WEATHER_LOCATION = {
  id: "weather-icon-preview",
  name: "Weather Icon Preview",
  admin1: "Mock Data",
  country: "",
  lat: 999,
  lon: 999,
  isMock: true,
};

export const WEATHER_ICONS = {
  0: {
    dayIcon: clearDayIcon,
    nightIcon: clearNightIcon,
    description: "clear sky",
  },
  1: {
    dayIcon: mostlyClearDayIcon,
    nightIcon: mostlyClearNightIcon,
    description: "mainly clear",
  },
  2: {
    dayIcon: partlyCloudyDayIcon,
    nightIcon: partlyCloudyNightIcon,
    description: "partly cloudy",
  },
  3: {
    dayIcon: overcastDayIcon,
    nightIcon: overcastNightIcon,
    description: "overcast",
  },
  45: { dayIcon: fogIcon, nightIcon: fogIcon, description: "fog" },
  48: {
    dayIcon: fogIcon,
    nightIcon: fogIcon,
    description: "depositing rime fog",
  },
  51: {
    dayIcon: partlyCloudyDayDrizzleIcon,
    nightIcon: partlyCloudyNightDrizzleIcon,
    description: "light drizzle",
  },
  53: {
    dayIcon: overcastDayDrizzleIcon,
    nightIcon: overcastNightDrizzleIcon,
    description: "moderate drizzle",
  },
  55: {
    dayIcon: extremeDayDrizzleIcon,
    nightIcon: extremeNightDrizzleIcon,
    description: "dense drizzle",
  },
  56: {
    dayIcon: partlyCloudyDaySleetIcon,
    nightIcon: partlyCloudyNightSleetIcon,
    description: "light freezing drizzle",
  },
  57: {
    dayIcon: overcastDaySleetIcon,
    nightIcon: overcastNightSleetIcon,
    description: "dense freezing drizzle",
  },
  61: {
    dayIcon: mostlyClearDayRainIcon,
    nightIcon: mostlyClearNightRainIcon,
    description: "slight rain",
  },
  63: {
    dayIcon: overcastDayRainIcon,
    nightIcon: overcastNightRainIcon,
    description: "moderate rain",
  },
  65: {
    dayIcon: extremeDayRainIcon,
    nightIcon: extremeNightRainIcon,
    description: "heavy rain",
  },
  66: {
    dayIcon: partlyCloudyDaySleetIcon,
    nightIcon: partlyCloudyNightSleetIcon,
    description: "light freezing rain",
  },
  67: {
    dayIcon: overcastDaySleetIcon,
    nightIcon: overcastNightSleetIcon,
    description: "heavy freezing rain",
  },
  71: {
    dayIcon: mostlyClearDaySnowIcon,
    nightIcon: mostlyClearNightSnowIcon,
    description: "slight snowfall",
  },
  73: {
    dayIcon: overcastDaySnowIcon,
    nightIcon: overcastNightSnowIcon,
    description: "moderate snowfall",
  },
  75: {
    dayIcon: extremeDaySnowIcon,
    nightIcon: extremeNightSnowIcon,
    description: "heavy snowfall",
  },
  77: {
    dayIcon: snowflakeIcon,
    nightIcon: snowflakeIcon,
    description: "snow grains",
  },
  80: {
    dayIcon: partlyCloudyDayRainIcon,
    nightIcon: partlyCloudyNightRainIcon,
    description: "slight rain showers",
  },
  81: {
    dayIcon: overcastDayRainIcon,
    nightIcon: overcastNightRainIcon,
    description: "moderate rain showers",
  },
  82: {
    dayIcon: extremeDayRainIcon,
    nightIcon: extremeNightRainIcon,
    description: "violent rain showers",
  },
  85: {
    dayIcon: partlyCloudyDaySnowIcon,
    nightIcon: partlyCloudyNightSnowIcon,
    description: "slight snow showers",
  },
  86: {
    dayIcon: overcastDaySnowIcon,
    nightIcon: overcastNightSnowIcon,
    description: "heavy snow showers",
  },
  95: {
    dayIcon: thunderstormsDayIcon,
    nightIcon: thunderstormsNightIcon,
    description: "thunderstorm",
  },
  96: {
    dayIcon: thunderstormsDayHailIcon,
    nightIcon: thunderstormsNightHailIcon,
    description: "thunderstorm with slight hail",
  },
  99: {
    dayIcon: thunderstormsExtremeDayHailIcon,
    nightIcon: thunderstormsExtremeNightHailIcon,
    description: "thunderstorm with heavy hail",
  },
};
