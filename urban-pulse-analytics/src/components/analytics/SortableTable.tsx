import { ArrowUpDown, ArrowUp, ArrowDown, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFilters } from "@/contexts/FilterContext";
import { Badge } from "@/components/ui/badge";

interface Column {
  key: string;
  label: string;
  format?: (value: any) => string;
  align?: "left" | "center" | "right";
  highlight?: "high" | "low";
}

interface SortableTableProps {
  columns: Column[];
  data: Record<string, any>[];
  onRowClick?: (row: Record<string, any>) => void;
  maxHeight?: string;
}

export function SortableTable({ columns, data, onRowClick, maxHeight = "400px" }: SortableTableProps) {
  const { sortBy, sortOrder, setSortBy } = useFilters();

  const getSortIcon = (key: string) => {
    if (sortBy !== key) return <ArrowUpDown className="h-3 w-3 opacity-40" />;
    return sortOrder === "asc" ? (
      <ArrowUp className="h-3 w-3 text-primary" />
    ) : (
      <ArrowDown className="h-3 w-3 text-primary" />
    );
  };

  const getChangeIndicator = (value: number) => {
    if (value > 0) return <TrendingUp className="h-3 w-3 text-success inline ml-1" />;
    if (value < 0) return <TrendingDown className="h-3 w-3 text-destructive inline ml-1" />;
    return <Minus className="h-3 w-3 text-muted-foreground inline ml-1" />;
  };

  return (
    <div className="analytics-card overflow-hidden">
      <div className="overflow-auto" style={{ maxHeight }}>
        <table className="w-full text-sm">
          <thead className="bg-muted/50 sticky top-0 z-10">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">#</th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => setSortBy(col.key)}
                  className={cn(
                    "px-3 py-2 text-xs font-medium text-muted-foreground cursor-pointer hover:bg-muted transition-colors",
                    col.align === "right" && "text-right",
                    col.align === "center" && "text-center"
                  )}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {getSortIcon(col.key)}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr
                key={row.name || idx}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  "border-t border-border hover:bg-muted/30 transition-colors",
                  onRowClick && "cursor-pointer",
                  idx === 0 && "bg-success/5"
                )}
              >
                <td className="px-3 py-2">
                  <span
                    className={cn(
                      "inline-flex h-5 w-5 items-center justify-center rounded text-xs font-bold",
                      idx === 0 ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"
                    )}
                  >
                    {idx + 1}
                  </span>
                </td>
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      "px-3 py-2",
                      col.align === "right" && "text-right",
                      col.align === "center" && "text-center"
                    )}
                  >
                    {col.key === "name" ? (
                      <div>
                        <span className="font-medium text-foreground">{row.name}</span>
                        <span className="text-xs text-muted-foreground ml-2">{row.country}</span>
                      </div>
                    ) : col.key === "change" ? (
                      <span className={cn(
                        "font-mono text-xs",
                        row[col.key] > 0 ? "text-success" : row[col.key] < 0 ? "text-destructive" : "text-muted-foreground"
                      )}>
                        {row[col.key] > 0 ? "+" : ""}{col.format ? col.format(row[col.key]) : row[col.key]}
                        {getChangeIndicator(row[col.key])}
                      </span>
                    ) : col.key === "qolIndex" ? (
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${row[col.key]}%` }}
                          />
                        </div>
                        <span className="font-mono font-bold text-foreground">{row[col.key]}</span>
                      </div>
                    ) : col.highlight ? (
                      <Badge
                        variant={
                          (col.highlight === "high" && row[col.key] >= 80) ||
                          (col.highlight === "low" && row[col.key] <= 30)
                            ? "default"
                            : "secondary"
                        }
                        className="font-mono text-xs"
                      >
                        {col.format ? col.format(row[col.key]) : row[col.key]}
                      </Badge>
                    ) : (
                      <span className="font-mono text-muted-foreground">
                        {col.format ? col.format(row[col.key]) : row[col.key]}
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
