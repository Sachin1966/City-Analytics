import { City, MapCity, TrendData, RadarMetric, Insight, DataSource, ScatterSeries, CorrelationData } from "@/types/analytics";

const API_URL = import.meta.env.VITE_API_URL || "/api";

async function fetchJson<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch ${endpoint}: ${response.statusText}`);
    }
    return response.json();
}

export const api = {
    getCities: () => fetchJson<City[]>("/cities"),
    getMapCities: () => fetchJson<MapCity[]>("/map-cities"),
    getTrends: () => fetchJson<TrendData[]>("/trends"),
    getRadarData: () => fetchJson<RadarMetric[]>("/radar"),
    getInsights: () => fetchJson<Insight[]>("/insights"),
    getDataSources: () => fetchJson<DataSource[]>("/data-sources"),
    getScatterData: () => fetchJson<ScatterSeries[]>("/scatter"),
    getCorrelationData: () => fetchJson<CorrelationData>("/correlations"),
};
