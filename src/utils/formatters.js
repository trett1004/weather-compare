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

  return date.toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
  });
}

export function formatHourLabel(isoDate) {
  return new Date(isoDate).getHours().toString();
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
