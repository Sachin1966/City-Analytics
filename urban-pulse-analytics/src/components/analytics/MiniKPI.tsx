import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface MiniKPIProps {
  label: string;
  value: string | number;
  change?: number;
  icon?: LucideIcon;
  trend?: "up" | "down" | "neutral";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  active?: boolean;
}

export function MiniKPI({
  label,
  value,
  change,
  icon: Icon,
  trend,
  size = "md",
  onClick,
  active,
}: MiniKPIProps) {
  const getTrendIcon = () => {
    if (!trend && change === undefined) return null;
    const actualTrend = trend || (change && change > 0 ? "up" : change && change < 0 ? "down" : "neutral");

    switch (actualTrend) {
      case "up":
        return <TrendingUp className="h-3 w-3 text-success" />;
      case "down":
        return <TrendingDown className="h-3 w-3 text-destructive" />;
      default:
        return <Minus className="h-3 w-3 text-muted-foreground" />;
    }
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "analytics-card p-3 transition-all",
        onClick && "cursor-pointer hover:border-primary/50",
        active && "border-primary bg-primary/5",
        size === "sm" && "p-2",
        size === "lg" && "p-4"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className={cn(
            "text-muted-foreground truncate",
            size === "sm" ? "text-[10px]" : "text-xs"
          )}>
            {label}
          </p>
          <p className={cn(
            "font-bold font-mono text-foreground mt-0.5",
            size === "sm" ? "text-sm" : size === "lg" ? "text-xl" : "text-lg"
          )}>
            {value}
          </p>
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-1">
              {getTrendIcon()}
              <span className={cn(
                "text-xs font-mono",
                change > 0 ? "text-success" : change < 0 ? "text-destructive" : "text-muted-foreground"
              )}>
                {change > 0 ? "+" : ""}{change}%
              </span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={cn(
            "flex items-center justify-center rounded-lg bg-primary/10",
            size === "sm" ? "h-6 w-6" : size === "lg" ? "h-10 w-10" : "h-8 w-8"
          )}>
            <Icon className={cn(
              "text-primary",
              size === "sm" ? "h-3 w-3" : size === "lg" ? "h-5 w-5" : "h-4 w-4"
            )} />
          </div>
        )}
      </div>
    </div>
  );
}
