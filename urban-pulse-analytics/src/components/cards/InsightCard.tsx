import { LucideIcon, Lightbulb, AlertTriangle, TrendingUp, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type InsightType = "insight" | "warning" | "trend" | "info";

interface InsightCardProps {
  title: string;
  description: string;
  type?: InsightType;
  metric?: string;
  source?: string;
}

const typeConfig: Record<InsightType, { icon: LucideIcon; borderColor: string; iconBg: string }> = {
  insight: {
    icon: Lightbulb,
    borderColor: "border-l-accent",
    iconBg: "bg-accent/10 text-accent",
  },
  warning: {
    icon: AlertTriangle,
    borderColor: "border-l-warning",
    iconBg: "bg-warning/10 text-warning",
  },
  trend: {
    icon: TrendingUp,
    borderColor: "border-l-success",
    iconBg: "bg-success/10 text-success",
  },
  info: {
    icon: Info,
    borderColor: "border-l-info",
    iconBg: "bg-info/10 text-info",
  },
};

export function InsightCard({
  title,
  description,
  type = "insight",
  metric,
  source,
}: InsightCardProps) {
  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div className={cn("analytics-card p-5 border-l-4", config.borderColor)}>
      <div className="flex items-start gap-4">
        <div className={cn("rounded-lg p-2", config.iconBg)}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 space-y-1">
          <h4 className="font-semibold text-foreground">{title}</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
          {(metric || source) && (
            <div className="flex items-center gap-3 pt-2">
              {metric && (
                <span className="text-xs font-medium text-primary">{metric}</span>
              )}
              {source && (
                <span className="text-xs text-muted-foreground">Source: {source}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
