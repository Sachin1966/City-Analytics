import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis,
  Legend,
} from "recharts";

interface ScatterDataPoint {
  name: string;
  x: number;
  y: number;
  z?: number;
}

interface ScatterPlotChartProps {
  data: { name: string; data: ScatterDataPoint[]; color: string }[];
  title: string;
  xAxisLabel: string;
  yAxisLabel: string;
}

export function ScatterPlotChart({ data, title, xAxisLabel, yAxisLabel }: ScatterPlotChartProps) {
  return (
    <div className="chart-container">
      <h3 className="mb-4 text-lg font-semibold text-foreground">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            type="number"
            dataKey="x"
            name={xAxisLabel}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            axisLine={{ stroke: "hsl(var(--border))" }}
            label={{
              value: xAxisLabel,
              position: "bottom",
              offset: 20,
              fill: "hsl(var(--muted-foreground))",
              fontSize: 12,
            }}
          />
          <YAxis
            type="number"
            dataKey="y"
            name={yAxisLabel}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            axisLine={{ stroke: "hsl(var(--border))" }}
            label={{
              value: yAxisLabel,
              angle: -90,
              position: "insideLeft",
              fill: "hsl(var(--muted-foreground))",
              fontSize: 12,
            }}
          />
          <ZAxis range={[60, 400]} />
          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              boxShadow: "var(--shadow-lg)",
            }}
            formatter={(value: number, name: string) => [value.toFixed(1), name]}
          />
          <Legend
            wrapperStyle={{ paddingTop: 20 }}
            formatter={(value) => (
              <span className="text-sm text-foreground">{value}</span>
            )}
          />
          {data.map((series) => (
            <Scatter
              key={series.name}
              name={series.name}
              data={series.data}
              fill={series.color}
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
