export function formatDate(isoDate) {
  const date = new Date(isoDate);
  return date.toLocaleDateString("de-DE", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  });
}

export function formatDayLabel(isoDate) {
  const date = new Date(isoDate);

  // Return two-letter German weekday abbreviation (Mo, Di, Mi, Do, Fr, Sa, So)
  const days = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
  return days[date.getDay()];
}

export function formatHourLabel(isoDate) {
  const h = new Date(isoDate).getHours();
  return String(h).padStart(2, "0") + "h";
}

export function formatDayNumber(isoDate) {
  const date = new Date(isoDate);
  return `${date.getDate()}.`;
}

export function getWindDirectionArrow(degrees) {
  const normalizedDegrees = ((degrees % 360) + 360) % 360;

  return {
    transform: `rotate(${normalizedDegrees}deg)`,
  };
}

export function formatLocationLabel(location) {
  const region = [location.admin1, location.country].filter(Boolean).join(", ");

  return region ? `${location.name} (${region})` : location.name;
}

export function formatLocationTitle(location) {
  const region = [location.admin1, location.country].filter(Boolean).join(", ");

  return region ? `${location.name} - ${region}` : location.name;
}
