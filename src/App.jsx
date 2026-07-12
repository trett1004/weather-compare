import { useEffect, useState } from "react";
import {
  DEFAULT_WEATHER_MODEL,
  MAX_LOCATIONS,
  MOCK_WEATHER_LOCATION,
} from "./constants";
import { LocationList } from "./components/LocationList";
import { SearchSection } from "./components/SearchSection";
import { getSavedLocations, saveLocations } from "./services/locationStorage";

export default function App() {
  const [locations, setLocations] = useState(() => getSavedLocations());
  const [hint, setHint] = useState("");
  const [weatherModel, setWeatherModel] = useState(DEFAULT_WEATHER_MODEL);

  useEffect(() => {
    saveLocations(locations);
  }, [locations]);

  useEffect(() => {
    if (!hint) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setHint("");
    }, 3000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [hint]);

  function handleAddLocation(location) {
    if (locations.length >= MAX_LOCATIONS) {
      setHint(
        `Maximal ${MAX_LOCATIONS} Orte erlaubt. Bitte zuerst einen entfernen.`,
      );
      return;
    }

    if (locations.some((savedLocation) => savedLocation.id === location.id)) {
      setHint("Dieser Ort ist bereits gespeichert.");
      return;
    }

    setLocations((currentLocations) => [...currentLocations, location]);
  }

  function handleRemoveLocation(locationId) {
    setLocations((currentLocations) =>
      currentLocations.filter((location) => location.id !== locationId),
    );
  }

  return (
    <>
      <SearchSection
        onAddLocation={handleAddLocation}
        onAddPreview={() => handleAddLocation(MOCK_WEATHER_LOCATION)}
        hint={hint}
        weatherModel={weatherModel}
        onModelChange={setWeatherModel}
      />
      <LocationList
        locations={locations}
        onRemoveLocation={handleRemoveLocation}
        weatherModel={weatherModel}
      />
      <footer className="site-footer">
        <a href="/impressum">Impressum</a>
        <a href="/datenschutz">Datenschutz</a>
      </footer>
    </>
  );
}
