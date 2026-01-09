import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  accentColor?: "primary" | "success" | "warning" | "info";
}

export function KPICard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  trend = "neutral",
  accentColor = "primary",
}: KPICardProps) {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  
  const accentStyles = {
    primary: "before:bg-primary",
    success: "before:bg-success",
    warning: "before:bg-warning",
    info: "before:bg-info",
  };

  const iconBgStyles = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    info: "bg-info/10 text-info",
  };

  return (
    <div className={cn("kpi-card", accentStyles[accentColor])}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight text-foreground">{value}</p>
        </div>
        <div className={cn("rounded-lg p-2.5", iconBgStyles[accentColor])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      {(change !== undefined || changeLabel) && (
        <div className="mt-4 flex items-center gap-2">
          <div
            className={cn(
              "metric-badge",
              trend === "up" && "metric-badge-positive",
              trend === "down" && "metric-badge-negative",
              trend === "neutral" && "metric-badge-neutral"
            )}
          >
            <TrendIcon className="h-3 w-3" />
            {change !== undefined && <span>{change > 0 ? "+" : ""}{change}%</span>}
          </div>
          {changeLabel && (
            <span className="text-xs text-muted-foreground">{changeLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}
