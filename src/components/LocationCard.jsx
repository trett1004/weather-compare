import React, { useEffect, useState } from "react";
import { WEATHER_ICONS } from "../constants";
import { fetchForecast } from "../services/weatherApi";
import { formatLocationTitle } from "../utils/formatters";
import { ForecastTable } from "./ForecastTable";

function WeatherIconGallery() {
  const iconEntries = Object.entries(WEATHER_ICONS).map(([code, weather]) => ({
    code,
    ...weather,
  }));

  return (
    <div
      className="weather-icon-gallery"
      aria-label="Meteocons weather code preview"
    >
      {iconEntries.map((weather) => (
        <article key={weather.code} className="weather-icon-gallery-card">
          <div className="weather-icon-gallery-icons">
            <span
              className="weather-icon-gallery-image"
              dangerouslySetInnerHTML={{ __html: weather.dayIcon }}
            />
            {weather.nightIcon !== weather.dayIcon && (
              <span
                className="weather-icon-gallery-image"
                dangerouslySetInnerHTML={{ __html: weather.nightIcon }}
              />
            )}
          </div>
          <div className="weather-icon-gallery-meta">
            <strong>{weather.code}</strong>
            <span>{weather.description}</span>
          </div>
        </article>
      ))}
    </div>
  );
}

export function LocationCard({ location, onRemove }) {
  const [forecastState, setForecastState] = useState({
    status: "loading",
    data: null,
  });

  useEffect(() => {
    let isCancelled = false;

    async function loadForecast() {
      setForecastState({ status: "loading", data: null });

      try {
        const data = await fetchForecast(location.lat, location.lon);

        if (!isCancelled) {
          setForecastState({ status: "ready", data });
        }
      } catch (error) {
        console.error(error);

        if (!isCancelled) {
          setForecastState({ status: "error", data: null });
        }
      }
    }

    loadForecast();

    return () => {
      isCancelled = true;
    };
  }, [location.lat, location.lon]);

  return (
    <section className="location-card full-bleed">
      <div className="card-header">
        <h2 className="loc-name">{formatLocationTitle(location)}</h2>
        <button
          className="remove-btn"
          type="button"
          title="Entfernen"
          onClick={() => onRemove(location.id)}
        >
          ✕
        </button>
      </div>

      {forecastState.status === "loading" && (
        <p className="status-message">Lade Wetterdaten...</p>
      )}

      {forecastState.status === "error" && (
        <p className="status-message error-message">
          Wetterdaten konnten nicht geladen werden.
        </p>
      )}

      {forecastState.status === "ready" && (
        <>
          {location.isMock && <WeatherIconGallery />}
          <ForecastTable
            hourly={forecastState.data.hourly}
            daily={forecastState.data.daily}
          />
        </>
      )}
    </section>
  );
}
