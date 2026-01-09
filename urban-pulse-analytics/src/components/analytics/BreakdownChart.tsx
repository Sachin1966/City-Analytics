import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { cn } from "@/lib/utils";

interface BreakdownItem {
  name: string;
  value: number;
  color?: string;
}

interface BreakdownChartProps {
  data: BreakdownItem[];
  title: string;
  subtitle?: string;
  layout?: "horizontal" | "vertical";
  className?: string;
  showValues?: boolean;
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export function BreakdownChart({
  data,
  title,
  subtitle,
  layout = "horizontal",
  className,
  showValues = true,
}: BreakdownChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value));

  return (
    <div className={cn("analytics-card p-4", className)}>
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>

      {layout === "horizontal" ? (
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 0, right: 20 }}>
              <XAxis type="number" domain={[0, maxValue * 1.1]} hide />
              <YAxis
                type="category"
                dataKey="name"
                width={80}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
              />
              <Bar dataKey="value" radius={4} barSize={20}>
                {data.map((entry, index) => (
                  <Cell key={entry.name} fill={entry.color || COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={item.name}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-foreground">{item.name}</span>
                {showValues && (
                  <span className="text-xs font-mono text-muted-foreground">{item.value}</span>
                )}
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(item.value / maxValue) * 100}%`,
                    backgroundColor: item.color || COLORS[index % COLORS.length],
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
