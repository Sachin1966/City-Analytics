import { LucideIcon, TrendingUp, TrendingDown, AlertTriangle, Info, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type InsightType = "positive" | "negative" | "warning" | "info" | "highlight";

interface InsightChipProps {
  text: string;
  type?: InsightType;
  icon?: LucideIcon;
  onClick?: () => void;
  className?: string;
}

const typeConfig: Record<InsightType, { icon: LucideIcon; bg: string; text: string; border: string }> = {
  positive: {
    icon: TrendingUp,
    bg: "bg-success/10",
    text: "text-success",
    border: "border-success/30",
  },
  negative: {
    icon: TrendingDown,
    bg: "bg-destructive/10",
    text: "text-destructive",
    border: "border-destructive/30",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-warning/10",
    text: "text-warning",
    border: "border-warning/30",
  },
  info: {
    icon: Info,
    bg: "bg-info/10",
    text: "text-info",
    border: "border-info/30",
  },
  highlight: {
    icon: Sparkles,
    bg: "bg-primary/10",
    text: "text-primary",
    border: "border-primary/30",
  },
};

export function InsightChip({ text, type = "info", icon, onClick, className }: InsightChipProps) {
  const config = typeConfig[type];
  const Icon = icon || config.icon;

  return (
    <div
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all",
        config.bg,
        config.text,
        config.border,
        onClick && "cursor-pointer hover:opacity-80",
        className
      )}
    >
      <Icon className="h-3 w-3" />
      <span>{text}</span>
    </div>
  );
}
