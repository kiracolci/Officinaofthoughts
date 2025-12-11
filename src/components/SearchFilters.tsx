import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import "./SearchFilters.css";

interface SearchFiltersProps {
  selectedYear?: number;
  selectedCourt?: string;
  onYearChange: (year: number | undefined) => void;
  onCourtChange: (court: string | undefined) => void;
}

export function SearchFilters({
  selectedYear,
  selectedCourt,
  onYearChange,
  onCourtChange,
}: SearchFiltersProps) {
  
  const years = useQuery(api.cases.getYears);
  const courts = useQuery(api.cases.getCourts);

  return (
    <div className="search-filters">
      <div className="filter-group">
        <label className="filter-label">Year</label>
        <select
          value={selectedYear || ""}
          onChange={(e) =>
            onYearChange(e.target.value ? parseInt(e.target.value) : undefined)
          }
          className="filter-select"
        >
          <option value="">All years</option>
          {years?.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label className="filter-label">Court</label>
        <select
          value={selectedCourt || ""}
          onChange={(e) => onCourtChange(e.target.value || undefined)}
          className="filter-select"
        >
          <option value="">All courts</option>
          {courts?.map((court) => (
            <option key={court} value={court}>
              {court}
            </option>
          ))}
        </select>
      </div>

      {(selectedYear || selectedCourt) && (
        <div className="clear-filters-container">
          <button
            onClick={() => {
              onYearChange(undefined);
              onCourtChange(undefined);
            }}
            className="clear-filters-button"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
