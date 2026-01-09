import { cn } from "@/lib/utils";

interface GaugeChartProps {
  value: number;
  max?: number;
  title: string;
  subtitle?: string;
  thresholds?: { low: number; medium: number; high: number };
  className?: string;
  invert?: boolean;
}

export function GaugeChart({
  value,
  max = 100,
  title,
  subtitle,
  thresholds = { low: 30, medium: 50, high: 70 },
  className,
  invert = false,
}: GaugeChartProps) {
  const percentage = (value / max) * 100;
  const angle = (percentage / 100) * 180;

  const getColor = () => {
    if (invert) {
      if (percentage >= thresholds.high) return "text-success";
      if (percentage >= thresholds.medium) return "text-warning";
      return "text-destructive";
    }
    // Default (High = Bad)
    if (percentage >= thresholds.high) return "text-destructive";
    if (percentage >= thresholds.medium) return "text-warning";
    return "text-success";
  };

  const getLabel = () => {
    if (invert) {
      if (percentage >= thresholds.high) return "Healthy";
      if (percentage >= thresholds.medium) return "Moderate";
      return "Critical";
    }
    // Default (High = Bad)
    if (percentage >= thresholds.high) return "Critical";
    if (percentage >= thresholds.medium) return "Elevated";
    return "Healthy";
  };

  return (
    <div className={cn("analytics-card p-4 flex flex-col items-center", className)}>
      <div className="relative w-32 h-16 mb-2">
        {/* Background arc */}
        <svg viewBox="0 0 100 50" className="w-full h-full">
          <path
            d="M 5 50 A 45 45 0 0 1 95 50"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="8"
            strokeLinecap="round"
          />
          {/* Value arc */}
          <path
            d="M 5 50 A 45 45 0 0 1 95 50"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${(angle / 180) * 141.37} 141.37`}
            className={getColor()}
          />
        </svg>
        {/* Needle */}
        <div
          className="absolute bottom-0 left-1/2 w-0.5 h-10 bg-foreground origin-bottom transition-transform duration-500"
          style={{ transform: `translateX(-50%) rotate(${angle - 90}deg)` }}
        />
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3 h-3 rounded-full bg-foreground" />
      </div>

      <div className="text-center">
        <p className={cn("text-2xl font-bold font-mono", getColor())}>{value}%</p>
        <p className="text-xs font-medium text-muted-foreground">{title}</p>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        <span
          className={cn(
            "inline-block mt-2 px-2 py-0.5 rounded text-xs font-medium",
            percentage >= thresholds.high
              ? "bg-destructive/10 text-destructive"
              : percentage >= thresholds.medium
                ? "bg-warning/10 text-warning"
                : "bg-success/10 text-success"
          )}
        >
          {getLabel()}
        </span>
      </div>
    </div>
  );
}
