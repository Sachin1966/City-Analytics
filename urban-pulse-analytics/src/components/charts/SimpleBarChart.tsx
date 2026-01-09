import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

interface SimpleBarChartProps {
    data: any[];
    title: string;
    xKey: string;
    barKeys: { key: string; name: string; color: string }[];
    yAxisLabel?: string;
}

export function SimpleBarChart({
    data,
    title,
    xKey,
    barKeys,
    yAxisLabel,
}: SimpleBarChartProps) {
    return (
        <div className="chart-container">
            <h3 className="mb-4 text-lg font-semibold text-foreground">{title}</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart
                    data={data}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis
                        dataKey={xKey}
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                        axisLine={{ stroke: "hsl(var(--border))" }}
                    />
                    <YAxis
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                        axisLine={{ stroke: "hsl(var(--border))" }}
                        label={
                            yAxisLabel
                                ? {
                                    value: yAxisLabel,
                                    angle: -90,
                                    position: "insideLeft",
                                    fill: "hsl(var(--muted-foreground))",
                                    fontSize: 12,
                                }
                                : undefined
                        }
                    />
                    <Tooltip
                        cursor={{ fill: "hsl(var(--muted)/0.3)" }}
                        contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                            boxShadow: "var(--shadow-lg)",
                        }}
                        labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
                        itemStyle={{ color: "hsl(var(--muted-foreground))" }}
                    />
                    <Legend
                        wrapperStyle={{ paddingTop: 20 }}
                        formatter={(value) => (
                            <span className="text-sm text-foreground">{value}</span>
                        )}
                    />
                    {barKeys.map((bar) => (
                        <Bar
                            key={bar.key}
                            dataKey={bar.key}
                            name={bar.name}
                            fill={bar.color}
                            radius={[4, 4, 0, 0]}
                            maxBarSize={50}
                        />
                    ))}
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
