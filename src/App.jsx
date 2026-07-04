import React, { useEffect, useState } from "react";
import { MAX_LOCATIONS, MOCK_WEATHER_LOCATION } from "./constants";
import { LocationList } from "./components/LocationList";
import { SearchSection } from "./components/SearchSection";
import { getSavedLocations, saveLocations } from "./services/locationStorage";

export default function App() {
  const [locations, setLocations] = useState(() => getSavedLocations());
  const [hint, setHint] = useState("");

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
      />
      <LocationList
        locations={locations}
        onRemoveLocation={handleRemoveLocation}
      />
    </>
  );
}
