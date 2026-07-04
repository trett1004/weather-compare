import React from "react";
import { WEATHER_ICONS } from "../constants";
import {
  formatDayLabel,
  formatHourLabel,
  getWindDirectionArrow,
} from "../utils/formatters";

function sampleForecastColumns(hourly) {
  return hourly.time
    .map((time, index) => ({
      time,
      weatherCode: hourly.weathercode[index],
      temperature: hourly.temperature_2m[index],
      precipitation: hourly.precipitation[index],
      windSpeed: hourly.windspeed_10m[index],
      windGust: hourly.windgusts_10m[index],
      windDirection: hourly.winddirection_10m[index],
    }))
    .filter((_, index) => index % 3 === 0);
}

function groupColumnsByDay(columns) {
  return columns.reduce((groups, column) => {
    const dayKey = column.time.slice(0, 10);
    const currentGroup = groups[groups.length - 1];

    if (!currentGroup || currentGroup.dayKey !== dayKey) {
      groups.push({
        dayKey,
        label: formatDayLabel(column.time),
        columns: [column],
      });
      return groups;
    }

    currentGroup.columns.push(column);
    return groups;
  }, []);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function interpolateColor(
  value,
  min,
  max,
  startHue,
  endHue,
  saturation,
  lightness,
) {
  const ratio = max === min ? 0 : clamp((value - min) / (max - min), 0, 1);
  const hue = startHue + (endHue - startHue) * ratio;

  return `hsl(${hue} ${saturation}% ${lightness}%)`;
}

function getTemperatureColor(value) {
  return interpolateColor(value, -10, 35, 210, 8, 75, 61);
}

function getPrecipitationColor(value) {
  return interpolateColor(value, 0, 10, 196, 230, 78, 66);
}

function getWindSpeedColor(value) {
  if (value < 5) {
    return "#f3f4f7";
  }

  if (value <= 7) {
    return "#b8e7ff";
  }

  if (value <= 10) {
    return "#43d8df";
  }

  if (value <= 13) {
    return "#68d34f";
  }

  if (value <= 16) {
    return "#b8df3f";
  }

  if (value <= 20) {
    return "#f0d13b";
  }

  if (value <= 24) {
    return "#f4a13a";
  }

  if (value <= 28) {
    return "#eb6648";
  }

  return "#9b63cf";
}

function formatMetric(value, unit, digits = 0) {
  return `${value.toFixed(digits)}${unit}`;
}

function hasMetricValue(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function greyClouds(svg) {
  return svg.replace(/#F3F7FE/gi, "#9FA3AD").replace(/#E6EFFC/gi, "#8D919B");
}

function isDaytime(time, daily) {
  if (!daily || !daily.time || !daily.sunrise || !daily.sunset) {
    return true;
  }
  const day = time.slice(0, 10);
  const dayIndex = daily.time.indexOf(day);
  if (dayIndex === -1) {
    return true;
  }
  return time >= daily.sunrise[dayIndex] && time < daily.sunset[dayIndex];
}

export function ForecastTable({ hourly, daily }) {
  const columns = sampleForecastColumns(hourly);
  const dayGroups = groupColumnsByDay(columns);

  return (
    <div className="forecast-table-wrap">
      <table className="forecast-table">
        <thead>
          <tr className="row-day-group">
            <th className="row-label-header"></th>
            {dayGroups.map((group) => (
              <th key={group.dayKey} colSpan={group.columns.length}>
                {group.label}
              </th>
            ))}
          </tr>
          <tr className="row-hours">
            <th className="row-label-header">Stunden</th>
            {columns.map((column) => (
              <th key={`${column.time}-hour`}>
                {formatHourLabel(column.time)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="row-icon">
            <th className="row-label">Wetter</th>
            {columns.map((column) => {
              const weather = WEATHER_ICONS[column.weatherCode];
              const isDay = isDaytime(column.time, daily);
              const icon = weather
                ? isDay
                  ? weather.dayIcon
                  : weather.nightIcon
                : "❓";
              const description = weather
                ? weather.description
                : "unknown weather";
              return (
                <td key={`${column.time}-weather`}>
                  <span
                    className="weather-icon"
                    title={description}
                    aria-label={description}
                  >
                    {typeof icon === "string" &&
                    icon.trimStart().startsWith("<svg") ? (
                      <span
                        className="weather-icon-image"
                        dangerouslySetInnerHTML={{ __html: greyClouds(icon) }}
                      />
                    ) : (
                      icon
                    )}
                  </span>
                </td>
              );
            })}
          </tr>
          <tr className="row-temp">
            <th className="row-label">Temperatur [°C]</th>
            {columns.map((column) => (
              <td key={`${column.time}-temp`}>
                {hasMetricValue(column.temperature) ? (
                  <span
                    className="metric-badge"
                    style={{
                      backgroundColor: getTemperatureColor(column.temperature),
                    }}
                  >
                    {formatMetric(column.temperature, "°", 0)}
                  </span>
                ) : (
                  <span className="plain-metric">-</span>
                )}
              </td>
            ))}
          </tr>
          <tr className="row-rain">
            <th className="row-label">Regen [mm]</th>
            {columns.map((column) => (
              <td key={`${column.time}-rain`}>
                {hasMetricValue(column.precipitation) &&
                column.precipitation > 0 ? (
                  <span
                    className="metric-badge"
                    style={{
                      backgroundColor: getPrecipitationColor(
                        column.precipitation,
                      ),
                    }}
                  >
                    {formatMetric(column.precipitation, "", 1)}
                  </span>
                ) : (
                  <span className="plain-metric">-</span>
                )}
              </td>
            ))}
          </tr>
          <tr className="row-wind">
            <th className="row-label">Wind [kn]</th>
            {columns.map((column) => (
              <td key={`${column.time}-wind`}>
                {hasMetricValue(column.windSpeed) ? (
                  <span
                    className="metric-badge"
                    style={{
                      backgroundColor: getWindSpeedColor(column.windSpeed),
                    }}
                  >
                    {formatMetric(column.windSpeed, "", 0)}
                  </span>
                ) : (
                  <span className="plain-metric">-</span>
                )}
              </td>
            ))}
          </tr>
          <tr className="row-gusts">
            <th className="row-label">Böen [kn]</th>
            {columns.map((column) => (
              <td key={`${column.time}-gusts`}>
                {hasMetricValue(column.windGust) ? (
                  <span
                    className="metric-badge"
                    style={{
                      backgroundColor: getWindSpeedColor(column.windGust),
                    }}
                  >
                    {formatMetric(column.windGust, "", 0)}
                  </span>
                ) : (
                  <span className="plain-metric">-</span>
                )}
              </td>
            ))}
          </tr>
          <tr className="row-direction">
            <th className="row-label">Windrichtung</th>
            {columns.map((column) => (
              <td key={`${column.time}-direction`}>
                {hasMetricValue(column.windDirection) ? (
                  <span className="wind-direction-badge">
                    <span
                      className="wind-direction-arrow"
                      style={getWindDirectionArrow(column.windDirection)}
                    >
                      ↑
                    </span>
                  </span>
                ) : (
                  <span className="plain-metric">-</span>
                )}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
