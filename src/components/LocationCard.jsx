import { useEffect, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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

export function LocationCard({
  location,
  onRemove,
  weatherModel,
  windUnit,
  onWindUnitToggle,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: location.id });

  const dragStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    position: "relative",
    zIndex: isDragging ? 1 : undefined,
  };
  const [forecastState, setForecastState] = useState({
    status: "loading",
    data: null,
  });

  useEffect(() => {
    let isCancelled = false;

    async function loadForecast() {
      setForecastState({ status: "loading", data: null });

      try {
        const data = await fetchForecast(
          location.lat,
          location.lon,
          weatherModel,
        );

        if (!isCancelled) {
          setForecastState({ status: "ready", data });
        }
      } catch {
        if (!isCancelled) {
          setForecastState({ status: "error", data: null });
        }
      }
    }

    loadForecast();

    return () => {
      isCancelled = true;
    };
  }, [location.lat, location.lon, weatherModel]);

  return (
    <section
      ref={setNodeRef}
      style={dragStyle}
      className="location-card full-bleed"
    >
      <div className="card-content">
        <div className="card-header">
          <button
            className="drag-handle"
            type="button"
            aria-label="Ziehen zum Sortieren"
            {...attributes}
            {...listeners}
          >
            ⠿
          </button>
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
              windUnit={windUnit}
              onWindUnitToggle={onWindUnitToggle}
            />
          </>
        )}
      </div>
    </section>
  );
}
