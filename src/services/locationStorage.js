import { STORAGE_KEY } from "../constants";

export function getSavedLocations() {
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

export function saveLocations(locations) {
  const persistedLocations = locations.filter((location) => !location.isMock);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(persistedLocations));
}
