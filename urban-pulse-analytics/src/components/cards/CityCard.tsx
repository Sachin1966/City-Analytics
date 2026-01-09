import { MapPin, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface CityCardProps {
  name: string;
  country: string;
  qolIndex: number;
  rank: number;
  change: number;
  highlights: string[];
}

export function CityCard({ name, country, qolIndex, rank, change, highlights }: CityCardProps) {
  const isPositive = change >= 0;

  return (
    <div className="analytics-card p-5 hover:scale-[1.02] transition-transform cursor-pointer">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <MapPin className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{name}</h3>
            <p className="text-sm text-muted-foreground">{country}</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs text-muted-foreground">Rank</span>
          <p className="text-lg font-bold text-foreground">#{rank}</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-sm text-muted-foreground">Quality of Life Index</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-foreground">{qolIndex}</span>
            <div
              className={cn(
                "metric-badge",
                isPositive ? "metric-badge-positive" : "metric-badge-negative"
              )}
            >
              {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {isPositive ? "+" : ""}{change}%
            </div>
          </div>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-chart-2 transition-all duration-500"
            style={{ width: `${qolIndex}%` }}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {highlights.map((highlight, index) => (
          <span
            key={index}
            className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground"
          >
            {highlight}
          </span>
        ))}
      </div>
    </div>
  );
}
