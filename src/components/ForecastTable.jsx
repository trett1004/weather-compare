import React, { useRef, useState, useEffect, useId } from "react";
import { WEATHER_ICONS } from "../constants";
import {
  formatDayLabel,
  formatHourLabel,
  getWindDirectionArrow,
} from "../utils/formatters";
import { formatDayNumber } from "../utils/formatters";

function sampleForecastColumns(hourly) {
  return (
    hourly.time
      .map((time, index) => ({
        time,
        weatherCode: hourly.weathercode[index],
        temperature: hourly.temperature_2m[index],
        precipitation: hourly.precipitation[index],
        windSpeed: hourly.windspeed_10m[index],
        windGust: hourly.windgusts_10m[index],
        windDirection: hourly.winddirection_10m[index],
      }))
      // select every 3rd hour but starting at 02:00 (hours: 02,05,08,...,23)
      .filter((col) => {
        const hour = new Date(col.time).getHours();
        return hour % 3 === 2; // 2,5,8,...,23
      })
  );
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
  if (value < 4) {
    return "#f3f4f7";
  }

  // if (value <= 7) {
  //   return "#b8e7ff";
  // }

  if (value <= 7) {
    return "#b8e7ff";
  }
  //if (value <= 13) {
  //return "#b8df3f";
  //}

  if (value <= 9) {
    return "#68d34f";
  }

  if (value <= 13) {
    return "#f0d13b";
  }

  if (value <= 15) {
    return "#f4a13a";
  }

  if (value <= 20) {
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
  return svg.replace(/#F3F7FE/gi, "#dadee8").replace(/#E6EFFC/gi, "#b8bdcb");
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

export function ForecastTable({
  hourly,
  daily,
  windUnit = "ms",
  onWindUnitToggle,
}) {
  const toDisplay = (kn) =>
    windUnit === "ms" ? (kn * 0.514444).toFixed(0) : kn.toFixed(0);
  const unitLabel = windUnit === "ms" ? "m/s" : "kn";
  const columns = sampleForecastColumns(hourly);
  const dayGroups = groupColumnsByDay(columns);
  // drag-to-scroll refs/state
  const wrapRef = useRef(null);
  const isDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const instanceId = useId();
  const programmaticScrollRef = useRef(false);
  // build a map from dayKey -> parity (0 or 1) to alternate header backgrounds per day
  const dayParity = dayGroups.reduce((acc, group, idx) => {
    acc[group.dayKey] = idx % 2;
    return acc;
  }, {});

  function handleMouseDown(e) {
    const wrap = wrapRef.current;
    if (!wrap) return;
    isDownRef.current = true;
    setIsDragging(true);
    startXRef.current = e.pageX - wrap.offsetLeft;
    scrollLeftRef.current = wrap.scrollLeft;
  }

  function handleMouseMove(e) {
    const wrap = wrapRef.current;
    if (!wrap || !isDownRef.current) return;
    e.preventDefault();
    const x = e.pageX - wrap.offsetLeft;
    const walk = x - startXRef.current;
    wrap.scrollLeft = scrollLeftRef.current - walk;
  }

  function handleMouseUp() {
    isDownRef.current = false;
    setIsDragging(false);
  }

  function handleScroll() {
    const wrap = wrapRef.current;
    if (!wrap) return;
    // if this scroll was caused programmatically during sync, ignore broadcasting
    if (programmaticScrollRef.current) {
      programmaticScrollRef.current = false;
      return;
    }
    window.dispatchEvent(
      new CustomEvent("forecast-scroll", {
        detail: { id: instanceId, left: wrap.scrollLeft },
      }),
    );
  }

  function handleTouchStart(e) {
    const wrap = wrapRef.current;
    if (!wrap) return;
    isDownRef.current = true;
    setIsDragging(true);
    startXRef.current = e.touches[0].pageX - wrap.offsetLeft;
    scrollLeftRef.current = wrap.scrollLeft;
  }

  function handleTouchMove(e) {
    const wrap = wrapRef.current;
    if (!wrap || !isDownRef.current) return;
    const x = e.touches[0].pageX - wrap.offsetLeft;
    const walk = x - startXRef.current;
    wrap.scrollLeft = scrollLeftRef.current - walk;
  }

  useEffect(() => {
    function onBroadcast(e) {
      const wrap = wrapRef.current;
      if (!wrap) return;
      const { id, left } = e.detail || {};
      if (id === instanceId) return;
      // apply scroll programmatically and mark so we don't rebroadcast
      programmaticScrollRef.current = true;
      wrap.scrollLeft = left;
    }

    window.addEventListener("forecast-scroll", onBroadcast);
    return () => window.removeEventListener("forecast-scroll", onBroadcast);
  }, [instanceId]);

  return (
    <div
      ref={wrapRef}
      className={`forecast-table-wrap ${isDragging ? "dragging" : ""}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseUp}
      onScroll={handleScroll}
    >
      <table className="forecast-table fill">
        <thead>
          <tr className="row-hours">
            <th className="row-label-header">Stunden</th>
            {columns.map((column) => {
              const dayKey = column.time.slice(0, 10);
              const parity = dayParity[dayKey] || 0;
              const dayLabel = formatDayLabel(column.time);
              const dateLabel = formatDayNumber(column.time);
              return (
                <th key={`${column.time}-header`}>
                  <div className={`header-stack ${parity ? "alt" : ""}`}>
                    <div className="header-day">{dayLabel}</div>
                    <div className="header-date">{dateLabel}</div>
                    <div className="header-hour">
                      {formatHourLabel(column.time)}
                    </div>
                  </div>
                </th>
              );
            })}
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
                      color: getPrecipitationColor(column.precipitation),
                      background: "transparent",
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
            <th
              className="row-label row-label-toggle"
              onClick={onWindUnitToggle}
              title="Einheit wechseln"
            >
              Wind [{unitLabel}]
            </th>
            {columns.map((column) => (
              <td key={`${column.time}-wind`}>
                {hasMetricValue(column.windSpeed) ? (
                  <span
                    className="metric-badge"
                    style={{
                      backgroundColor: getWindSpeedColor(
                        Math.round(column.windSpeed * 0.514444),
                      ),
                    }}
                  >
                    {toDisplay(column.windSpeed)}
                  </span>
                ) : (
                  <span className="plain-metric">-</span>
                )}
              </td>
            ))}
          </tr>
          <tr className="row-gusts">
            <th
              className="row-label row-label-toggle"
              onClick={onWindUnitToggle}
              title="Einheit wechseln"
            >
              Böen [{unitLabel}]
            </th>
            {columns.map((column) => (
              <td key={`${column.time}-gusts`}>
                {hasMetricValue(column.windGust) ? (
                  <span
                    className="metric-badge"
                    style={{
                      backgroundColor: getWindSpeedColor(
                        Math.round(column.windGust * 0.514444),
                      ),
                    }}
                  >
                    {toDisplay(column.windGust)}
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
