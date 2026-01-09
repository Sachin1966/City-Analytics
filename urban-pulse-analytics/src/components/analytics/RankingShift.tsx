import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface CityRank {
  name: string;
  currentRank: number;
  previousRank: number;
  score: number;
}

interface RankingShiftProps {
  data: CityRank[];
  title: string;
  className?: string;
}

export function RankingShift({ data, title, className }: RankingShiftProps) {
  const getChange = (current: number, previous: number) => previous - current;

  return (
    <div className={cn("analytics-card p-4", className)}>
      <h4 className="text-sm font-semibold text-foreground mb-3">{title}</h4>
      
      <div className="space-y-2">
        {data.map((city, idx) => {
          const change = getChange(city.currentRank, city.previousRank);
          return (
            <div
              key={city.name}
              className={cn(
                "flex items-center gap-3 p-2 rounded-lg transition-all",
                idx === 0 ? "bg-success/10" : "bg-muted/30 hover:bg-muted/50"
              )}
            >
              <span
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded text-xs font-bold",
                  idx === 0 ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"
                )}
              >
                {city.currentRank}
              </span>

              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground truncate">{city.name}</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-muted-foreground">{city.score}</span>
                
                <div
                  className={cn(
                    "flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium",
                    change > 0
                      ? "bg-success/10 text-success"
                      : change < 0
                      ? "bg-destructive/10 text-destructive"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {change > 0 ? (
                    <>
                      <ArrowUp className="h-3 w-3" />
                      {change}
                    </>
                  ) : change < 0 ? (
                    <>
                      <ArrowDown className="h-3 w-3" />
                      {Math.abs(change)}
                    </>
                  ) : (
                    <Minus className="h-3 w-3" />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
