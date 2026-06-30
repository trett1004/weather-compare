import React from "react";
import { formatLocationLabel } from "../utils/formatters";

export function SearchResults({ results, isVisible, onSelect }) {
  if (!isVisible || results.length === 0) {
    return null;
  }

  return (
    <ul className="search-results" role="listbox">
      {results.map((result) => (
        <li key={result.id}>
          <button
            className="search-result-button"
            type="button"
            onClick={() => onSelect(result)}
          >
            {formatLocationLabel(result)}
          </button>
        </li>
      ))}
    </ul>
  );
}
