export interface City {
  name: string;
  country: string;
  qolIndex: number;
  rank: number;
  change: number;
  highlights: string[];
  costOfLiving: number;
  avgSalary: number;
  rentIndex: number;
  pollutionIndex: number;
  crimeIndex: number;
  transportScore: number;
  healthcareScore: number;
}

export interface MapCity {
  name: string;
  x: number;
  y: number;
  qolIndex: number;
}

export interface TrendData {
  year: string;
  [city: string]: number | string;
}

export interface RadarMetric {
  metric: string;
  [city: string]: number | string;
}

export interface Insight {
  title: string;
  description: string;
  type: "trend" | "warning" | "insight" | "info";
  metric: string;
  source: string;
}

export interface DataSource {
  name: string;
  type: string;
  freshness: string;
  completeness: number;
  reliability: number;
}

export interface ScatterPoint {
  name: string;
  x: number;
  y: number;
  z: number;
}

export interface ScatterSeries {
  name: string;
  color: string;
  data: ScatterPoint[];
}

export interface CorrelationData {
  metrics: string[];
  values: number[][];
}
