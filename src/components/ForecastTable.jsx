import React from "react";
import { WEATHER_ICONS } from "../constants";
import { formatDate } from "../utils/formatters";

export function ForecastTable({ daily }) {
  return (
    <div className="forecast-table-wrap">
      <table className="forecast-table">
        <thead>
          <tr className="row-date">
            <th></th>
            {daily.time.map((value) => (
              <th key={value}>{formatDate(value)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="row-icon">
            <td>Wetter</td>
            {daily.weathercode.map((code, index) => (
              <td key={`${daily.time[index]}-weather`}>
                {WEATHER_ICONS[code] || "❓"}
              </td>
            ))}
          </tr>
          <tr className="row-temp">
            <td>Temp C</td>
            {daily.temperature_2m_max.map((maxTemperature, index) => (
              <td key={`${daily.time[index]}-temp`}>
                <span className="tmax">{Math.round(maxTemperature)}°</span>
                <span className="tmin">
                  {Math.round(daily.temperature_2m_min[index])}°
                </span>
              </td>
            ))}
          </tr>
          <tr className="row-rain">
            <td>Regen mm</td>
            {daily.precipitation_sum.map((precipitation, index) => (
              <td key={`${daily.time[index]}-rain`}>
                {precipitation > 0 ? precipitation.toFixed(1) : "-"}
              </td>
            ))}
          </tr>
          <tr className="row-wind">
            <td>Wind km/h</td>
            {daily.windspeed_10m_max.map((windSpeed, index) => (
              <td key={`${daily.time[index]}-wind`}>{Math.round(windSpeed)}</td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
