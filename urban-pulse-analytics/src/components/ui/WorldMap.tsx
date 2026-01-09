import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

interface CityMarker {
  name: string;
  x: number;
  y: number;
  qolIndex: number;
}

interface WorldMapProps {
  cities: CityMarker[];
  className?: string;
}

function getMarkerColor(qolIndex: number): string {
  if (qolIndex >= 80) return "bg-success";
  if (qolIndex >= 60) return "bg-chart-2";
  if (qolIndex >= 40) return "bg-warning";
  return "bg-destructive";
}

export function WorldMap({ cities, className }: WorldMapProps) {
  // Spatial Filtering to prevent congestion
  const visibleCities = useMemo(() => {
    // Sort by "Importance" (here approximated by QoL or just data order) so we keep significant ones
    // We'll prioritize highlighting extremes (very good or very bad) and some middle ground.
    const sorted = [...cities].sort((a, b) => b.qolIndex - a.qolIndex);

    const kept: CityMarker[] = [];
    const minDistance = 2.5; // Minimum distance in % (0-100 scale). Increase to reduce simple clutter.

    for (const city of sorted) {
      // Check distance to all already kept cities
      const isTooClose = kept.some(existing => {
        const dx = existing.x - city.x;
        const dy = existing.y - city.y;
        return (dx * dx + dy * dy) < (minDistance * minDistance);
      });

      if (!isTooClose) {
        kept.push(city);
      }

      // Safety Cap: Don't render more than 250 dots to ensure neatness
      if (kept.length >= 250) break;
    }

    return kept;
  }, [cities]);

  return (
    <div className={cn("map-container relative h-[450px] w-full rounded-xl border border-border bg-slate-50 dark:bg-slate-900/50 overflow-hidden shadow-sm", className)}>
      <div className="absolute top-4 left-4 z-10 text-xs font-medium text-muted-foreground bg-white/50 dark:bg-black/50 px-2 py-1 rounded backdrop-blur-sm">
        Displaying {visibleCities.length} representative cities (filtered for clarity)
      </div>

      {/* Basic Map Background */}
      <svg
        viewBox="0 0 100 50"
        className="absolute inset-0 h-full w-full opacity-30 pointer-events-none"
        preserveAspectRatio="none"
      >
        {/* Abstract World Shape for context - extremely simplified */}
        <path d="M10,10 Q20,5 30,10 T50,15 T80,10 V40 H10 Z" fill="hsl(var(--primary))" opacity="0.05" />
      </svg>

      {/* Grid Lines for "Technical" feel */}
      <div className="absolute inset-0"
        style={{
          backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)',
          backgroundSize: '10% 20%'
        }}>
      </div>

      {/* Render Cities */}
      {visibleCities.map((city) => (
        <div
          key={city.name}
          className="absolute group"
          style={{
            left: `${city.x}%`,
            top: `${city.y}%`,
            transform: "translate(-50%, -50%)",
          }}
        >
          {/* Dot - smaller and cleaner */}
          <div
            className={cn(
              "h-2 w-2 rounded-full transition-all duration-300 group-hover:scale-150 group-hover:ring-2 ring-offset-1 ring-offset-background",
              getMarkerColor(city.qolIndex)
            )}
          />

          {/* Subtle Glow for High QoL */}
          {city.qolIndex > 80 && (
            <div className={cn("absolute inset-0 -z-10 animate-pulse opacity-50 blur-[2px]", getMarkerColor(city.qolIndex))} />
          )}

          {/* Tooltip on Hover */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-20">
            <div className="bg-popover text-popover-foreground text-[10px] px-2 py-1 rounded shadow-md border border-border whitespace-nowrap">
              <span className="font-bold">{city.name}</span> <span className="opacity-75">({city.qolIndex.toFixed(0)})</span>
            </div>
          </div>
        </div>
      ))}

      {/* Disclaimer */}
      <div className="absolute bottom-2 left-2 text-[10px] text-muted-foreground opacity-50">
        * Map uses approximate projected coordinates
      </div>
    </div>
  );
}
