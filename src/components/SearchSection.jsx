import React, { useEffect, useRef, useState } from "react";
import { searchLocations } from "../services/weatherApi";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { SearchResults } from "./SearchResults";

export function SearchSection({ onAddLocation, hint }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);
  const debouncedQuery = useDebouncedValue(query.trim(), 300);

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults([]);
      setIsOpen(false);
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
      } catch (error) {
        console.error(error);

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
          results={results}
          isVisible={isOpen}
          onSelect={handleSelect}
        />
      </div>
      <p className="hint">{hint}</p>
    </header>
  );
}
