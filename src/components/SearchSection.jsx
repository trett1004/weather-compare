import { useEffect, useRef, useState } from "react";
import { searchLocations } from "../services/weatherApi";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { SearchResults } from "./SearchResults";
import { WEATHER_MODELS } from "../constants";

export function SearchSection({
  onAddLocation,
  hint,
  weatherModel,
  onModelChange,
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);
  const debouncedQuery = useDebouncedValue(query.trim(), 300);

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      return undefined;
    }

    let isCancelled = false;

    async function runSearch() {
      try {
        const nextResults = await searchLocations(debouncedQuery);

        if (!isCancelled) {
          setResults(nextResults);
          setIsOpen(nextResults.length > 0);
        }
      } catch {
        if (!isCancelled) {
          setResults([]);
          setIsOpen(false);
        }
      }
    }

    runSearch();

    return () => {
      isCancelled = true;
    };
  }, [debouncedQuery]);

  useEffect(() => {
    function handleDocumentClick(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("click", handleDocumentClick);

    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, []);

  function handleSelect(location) {
    onAddLocation(location);
    setQuery("");
    setResults([]);
    setIsOpen(false);
  }

  const activeResults = debouncedQuery.length >= 2 ? results : [];
  const isDropdownOpen = debouncedQuery.length >= 2 && isOpen;

  return (
    <header className="page-header">
      <h1>Weather Forecast Europe</h1>
      <div className="search-wrap" ref={wrapperRef}>
        <input
          id="search-input"
          type="text"
          placeholder="Ort suchen, z.B. Berlin..."
          autoComplete="off"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            if (!isOpen) {
              setIsOpen(true);
            }
          }}
        />
        <SearchResults
          results={activeResults}
          isVisible={isDropdownOpen}
          onSelect={handleSelect}
        />
      </div>
      <select
        className="model-select"
        value={weatherModel}
        onChange={(event) => onModelChange(event.target.value)}
        aria-label="Wettermodell auswählen"
      >
        {Object.entries(WEATHER_MODELS).map(([id, { label }]) => (
          <option key={id} value={id}>
            {label}
          </option>
        ))}
      </select>
      <p className="hint">{hint}</p>
    </header>
  );
}
