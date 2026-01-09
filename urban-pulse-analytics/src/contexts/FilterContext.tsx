import { createContext, useContext, useState, ReactNode, useMemo, useCallback, useEffect } from "react";
import { api } from "@/lib/api";
import { City } from "@/types/analytics";

export type Region = "all" | "europe" | "asia-pacific" | "americas" | "middle-east";
export type IncomeTier = "all" | "high" | "medium" | "low";
export type Year = "2020" | "2021" | "2022" | "2023" | "2024" | "2025";

interface FilterState {
  year: Year;
  region: Region;
  incomeTier: IncomeTier;
  selectedCities: string[];
  sortBy: string;
  sortOrder: "asc" | "desc";
}

interface FilterContextType extends FilterState {
  setYear: (year: Year) => void;
  setRegion: (region: Region) => void;
  setIncomeTier: (tier: IncomeTier) => void;
  setSelectedCities: (cities: string[]) => void;
  toggleCity: (city: string) => void;
  setSortBy: (field: string) => void;
  toggleSortOrder: () => void;
  resetFilters: () => void;
  filteredCities: City[];
  cities: City[]; // Added to expose raw data for debug
  loading: boolean;
  error: string | null;
}

const defaultFilters: FilterState = {
  year: "2025",
  region: "all",
  incomeTier: "all",
  selectedCities: [],
  sortBy: "qolIndex",
  sortOrder: "desc",
};

const getRegion = (country: string): Region => {
  if (!country) return "all"; // or 'other' but filtering logic expects region enum
  const c = country.toLowerCase().trim();

  if (["united arab emirates", "uae", "saudi arabia", "qatar", "kuwait", "bahrain", "oman", "israel", "jordan", "lebanon", "turkey", "egypt"].some(x => c.includes(x))) return "middle-east";
  if (["united states", "usa", "canada", "mexico", "brazil", "argentina", "chile", "peru", "colombia"].some(x => c.includes(x))) return "americas";
  if (["china", "japan", "india", "singapore", "thailand", "vietnam", "indonesia", "malaysia", "south korea", "australia", "new zealand"].some(x => c.includes(x))) return "asia-pacific";
  if (["uk", "united kingdom", "germany", "france", "italy", "spain", "switzerland", "netherlands", "sweden", "norway", "denmark", "austria", "belgium", "ireland", "poland", "czech republic", "portugal", "greece", "russia"].some(x => c.includes(x))) return "europe";

  return "all"; // Default fallback (prevents exclusion if not matched, but effectively hides it from specific region filters)
};

const getIncomeTier = (salary: number): IncomeTier => {
  if (salary >= 6000) return "high";
  if (salary >= 4000) return "medium";
  return "low";
};

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await api.getCities();
        setCities(data);
        setError(null);
      } catch (err) {
        console.error("Failed to load cities config:", err);
        setError("Failed to load city data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const setYear = useCallback((year: Year) => {
    setFilters((prev) => ({ ...prev, year }));
  }, []);

  const setRegion = useCallback((region: Region) => {
    setFilters((prev) => ({ ...prev, region }));
  }, []);

  const setIncomeTier = useCallback((incomeTier: IncomeTier) => {
    setFilters((prev) => ({ ...prev, incomeTier }));
  }, []);

  const setSelectedCities = useCallback((selectedCities: string[]) => {
    setFilters((prev) => ({ ...prev, selectedCities }));
  }, []);

  const toggleCity = useCallback((city: string) => {
    setFilters((prev) => ({
      ...prev,
      selectedCities: prev.selectedCities.includes(city)
        ? prev.selectedCities.filter((c) => c !== city)
        : [...prev.selectedCities, city],
    }));
  }, []);

  const setSortBy = useCallback((sortBy: string) => {
    setFilters((prev) => ({
      ...prev,
      sortBy,
      sortOrder: prev.sortBy === sortBy ? (prev.sortOrder === "asc" ? "desc" : "asc") : "desc",
    }));
  }, []);

  const toggleSortOrder = useCallback(() => {
    setFilters((prev) => ({
      ...prev,
      sortOrder: prev.sortOrder === "asc" ? "desc" : "asc",
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const filteredCities = useMemo(() => {
    let result = [...cities];

    // Filter by region
    if (filters.region !== "all") {
      result = result.filter((city) => getRegion(city.country) === filters.region);
    }

    // Filter by income tier
    if (filters.incomeTier !== "all") {
      result = result.filter((city) => getIncomeTier(city.avgSalary) === filters.incomeTier);
    }

    // Sort
    result.sort((a, b) => {
      const aVal = a[filters.sortBy as keyof typeof a] as number;
      const bVal = b[filters.sortBy as keyof typeof b] as number;
      return filters.sortOrder === "desc" ? bVal - aVal : aVal - bVal;
    });

    return result;
  }, [filters.region, filters.incomeTier, filters.sortBy, filters.sortOrder, cities]);

  const value: FilterContextType = {
    ...filters,
    setYear,
    setRegion,
    setIncomeTier,
    setSelectedCities,
    toggleCity,
    setSortBy,
    toggleSortOrder,
    resetFilters,
    filteredCities,
    cities,
    loading,
    error,
  };

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
}

export function useFilters() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error("useFilters must be used within a FilterProvider");
  }
  return context;
}
