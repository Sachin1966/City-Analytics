import { cn } from "@/lib/utils";

interface CorrelationData {
  metrics: string[];
  values: number[][];
}

interface CorrelationHeatmapProps {
  data: CorrelationData;
  title: string;
}

function getCorrelationColor(value: number): string {
  if (value >= 0.7) return "bg-success/80";
  if (value >= 0.4) return "bg-success/50";
  if (value >= 0.1) return "bg-success/20";
  if (value >= -0.1) return "bg-muted";
  if (value >= -0.4) return "bg-destructive/20";
  if (value >= -0.7) return "bg-destructive/50";
  return "bg-destructive/80";
}

function getTextColor(value: number): string {
  if (Math.abs(value) >= 0.5) return "text-white";
  return "text-foreground";
}

export function CorrelationHeatmap({ data, title }: CorrelationHeatmapProps) {
  return (
    <div className="chart-container">
      <h3 className="mb-4 text-lg font-semibold text-foreground">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="p-2 text-xs font-medium text-muted-foreground" />
              {data.metrics.map((metric) => (
                <th
                  key={metric}
                  className="p-2 text-xs font-medium text-muted-foreground whitespace-nowrap"
                  style={{ writingMode: "vertical-lr", transform: "rotate(180deg)" }}
                >
                  {metric}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.metrics.map((rowMetric, rowIndex) => (
              <tr key={rowMetric}>
                <td className="p-2 text-xs font-medium text-muted-foreground whitespace-nowrap">
                  {rowMetric}
                </td>
                {data.values[rowIndex].map((value, colIndex) => (
                  <td key={colIndex} className="p-1">
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded text-xs font-mono font-medium transition-all hover:scale-110",
                        getCorrelationColor(value),
                        getTextColor(value)
                      )}
                      title={`${rowMetric} vs ${data.metrics[colIndex]}: ${value.toFixed(2)}`}
                    >
                      {value.toFixed(2)}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-4">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-destructive/80" />
          <span className="text-xs text-muted-foreground">Strong Negative</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-muted" />
          <span className="text-xs text-muted-foreground">Neutral</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-success/80" />
          <span className="text-xs text-muted-foreground">Strong Positive</span>
        </div>
      </div>
    </div>
  );
}
