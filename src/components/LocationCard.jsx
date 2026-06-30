import React, { useEffect, useState } from "react";
import { fetchForecast } from "../services/weatherApi";
import { formatLocationTitle } from "../utils/formatters";
import { ForecastTable } from "./ForecastTable";

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
    <section className="location-card">
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
        <ForecastTable daily={forecastState.data.daily} />
      )}
    </section>
  );
}
