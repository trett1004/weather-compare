import { LocationCard } from "./LocationCard";

export function LocationList({
  locations,
  onRemoveLocation,
  weatherModel,
  windUnit,
  onWindUnitToggle,
}) {
  if (locations.length === 0) {
    return (
      <main className="locations-container empty-state">
        <p>Suche nach einem Ort, um den Forecast zu vergleichen.</p>
      </main>
    );
  }

  return (
    <main className="locations-container">
      {locations.map((location) => (
        <LocationCard
          key={location.id}
          location={location}
          onRemove={onRemoveLocation}
          weatherModel={weatherModel}
          windUnit={windUnit}
          onWindUnitToggle={onWindUnitToggle}
        />
      ))}
    </main>
  );
}
