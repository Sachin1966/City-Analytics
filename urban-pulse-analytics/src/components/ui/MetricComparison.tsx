import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MetricComparisonProps {
  label: string;
  cities: {
    name: string;
    value: number | string;
    isHighlighted?: boolean;
  }[];
  unit?: string;
  higherIsBetter?: boolean;
}

export function MetricComparison({
  label,
  cities,
  unit = "",
  higherIsBetter = true,
}: MetricComparisonProps) {
  const numericValues = cities
    .map((c) => (typeof c.value === "number" ? c.value : parseFloat(c.value as string)))
    .filter((v) => !isNaN(v));
  
  const maxValue = Math.max(...numericValues);
  const minValue = Math.min(...numericValues);

  const getBestValue = () => (higherIsBetter ? maxValue : minValue);

  return (
    <div className="analytics-card p-5">
      <h4 className="text-sm font-medium text-muted-foreground mb-4">{label}</h4>
      <div className="space-y-4">
        {cities.map((city) => {
          const numericValue = typeof city.value === "number" ? city.value : parseFloat(city.value as string);
          const isBest = numericValue === getBestValue();
          const percentage = maxValue > 0 ? (numericValue / maxValue) * 100 : 0;

          return (
            <div key={city.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{city.name}</span>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-lg font-bold font-mono",
                    isBest ? "text-success" : "text-foreground"
                  )}>
                    {city.value}{unit}
                  </span>
                  {isBest && (
                    <span className="metric-badge metric-badge-positive">
                      {higherIsBetter ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      Best
                    </span>
                  )}
                </div>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    isBest
                      ? "bg-gradient-to-r from-success to-success/70"
                      : "bg-gradient-to-r from-primary to-primary/70"
                  )}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
