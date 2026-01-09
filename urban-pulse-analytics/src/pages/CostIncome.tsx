import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GlobalFilters } from "@/components/analytics/GlobalFilters";
import { GaugeChart } from "@/components/analytics/GaugeChart";
import { BreakdownChart } from "@/components/analytics/BreakdownChart";
import { SortableTable } from "@/components/analytics/SortableTable";
import { MiniKPI } from "@/components/analytics/MiniKPI";
import { InsightChip } from "@/components/analytics/InsightChip";
import { ScatterPlotChart } from "@/components/charts/ScatterPlotChart";
import { useFilters } from "@/contexts/FilterContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DollarSign, Home, TrendingUp, AlertTriangle, Percent, Building2, Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

// Note: Cost Breakdown is estimated as per-city breakdown is not yet available in current API
const globalCostBreakdown = [
  { name: "Housing", value: 42, color: "hsl(var(--chart-1))" },
  { name: "Food", value: 18, color: "hsl(var(--chart-2))" },
  { name: "Transport", value: 15, color: "hsl(var(--chart-3))" },
  { name: "Utilities", value: 12, color: "hsl(var(--chart-4))" },
  { name: "Healthcare", value: 8, color: "hsl(var(--chart-5))" },
  { name: "Other", value: 5, color: "hsl(var(--muted-foreground))" },
];

export default function CostIncome() {
  const { filteredCities } = useFilters();
  const [highlightCity, setHighlightCity] = useState<string>("");
  const [openCombobox, setOpenCombobox] = useState(false);

  // Determine the dataset to use for KPIs
  const activeDataMode = highlightCity ? "city" : "region";



  const scatterData = useMemo(() => {
    const validCities = filteredCities.filter(c => c.avgSalary > 0);

    // Series 1: All Cities (Context)
    const contextData = validCities.map(c => ({
      name: c.name,
      x: c.avgSalary,
      y: c.rentIndex,
      z: c.qolIndex
    }));

    // Series 2: Highlighted City (if any)
    const highlightData = highlightCity
      ? contextData.filter(d => d.name === highlightCity)
      : [];

    return [
      {
        name: "Cities",
        color: "hsl(var(--muted-foreground))",
        data: contextData,
      },
      ...(highlightCity ? [{
        name: highlightCity,
        color: "hsl(var(--primary))",
        data: highlightData
      }] : [])
    ];
  }, [filteredCities, highlightCity]);

  // Heuristic: Estimate Rent $ from Rent Index (Index 100 != $100, Index 100 ~ $3500 NYC)
  // This allows us to calculate potential "Stress" (Rent as % of Salary)
  const estimateRent = (rentIndex: number) => rentIndex * 35;

  const affordabilityMetrics = useMemo(() => {
    // 1. Single City Mode
    if (highlightCity) {
      const city = filteredCities.find(c => c.name === highlightCity);
      if (city) {
        const estimatedRentCost = estimateRent(city.rentIndex);
        const stress = city.avgSalary > 0 ? (estimatedRentCost / city.avgSalary) * 100 : 0;

        return {
          avgIncomeStress: Math.round(stress),
          mostAffordable: city,
          leastAffordable: city,
          avgSalary: Math.round(city.avgSalary),
          label: `Data for ${city.name}`,
          breakdown: [
            { name: "Housing", value: Math.round(stress), color: "hsl(var(--chart-1))" },
            { name: "Disposable", value: Math.max(0, 100 - Math.round(stress)), color: "hsl(var(--chart-2))" }
          ]
        };
      }
    }

    // 2. Regional/Aggregate Mode
    if (!filteredCities.length) return { avgIncomeStress: 0, mostAffordable: null, leastAffordable: null, avgSalary: 0, label: "No Data", breakdown: [] };

    const validCities = filteredCities.filter(c => c.avgSalary > 0 && c.rentIndex > 0);

    const avgStress = validCities.reduce((sum, c) => {
      const estRent = estimateRent(c.rentIndex);
      const s = (estRent / c.avgSalary) * 100;
      return sum + s;
    }, 0) / (validCities.length || 1);

    // Heuristic Breakdown based on indices
    // We assume CoL Index matches "Daily Expenses"
    const avgCoL = validCities.reduce((s, c) => s + c.costOfLiving, 0) / (validCities.length || 1);

    // Normalize to create a pie chart distribution (Housing vs Other)
    // Very rough approximation: Housing (Stress%) vs Others (CoL scaled)
    const housingShare = avgStress;
    const otherShare = Math.min(100 - housingShare, (avgCoL / 2)); // Dynamic scaler
    const savingsShare = Math.max(0, 100 - housingShare - otherShare);

    return {
      avgIncomeStress: Math.round(avgStress),
      mostAffordable: [...validCities].sort((a, b) => a.costOfLiving - b.costOfLiving)[0],
      leastAffordable: [...validCities].sort((a, b) => b.rentIndex - a.rentIndex)[0],
      avgSalary: Math.round(validCities.reduce((sum, c) => sum + c.avgSalary, 0) / (validCities.length || 1)),
      label: `Regional Average (${filteredCities.length} cities)`,
      breakdown: [
        { name: "Housing (Est)", value: Math.round(housingShare), color: "hsl(var(--chart-1))" },
        { name: "Living Costs", value: Math.round(otherShare), color: "hsl(var(--chart-2))" },
        { name: "Potential Savings", value: Math.round(savingsShare), color: "hsl(var(--chart-3))" },
      ]
    };
  }, [filteredCities, highlightCity]);

  const outlierCities = useMemo(() => {
    return filteredCities
      .map((c) => ({
        ...c,
        stressRatio: c.avgSalary > 0 ? Math.round((estimateRent(c.rentIndex) / c.avgSalary) * 100) : 0,
      }))
      .filter((c) => c.stressRatio > 50) // Now 50% is a reasonable threshold
      .sort((a, b) => b.stressRatio - a.stressRatio);
  }, [filteredCities]);

  const tableColumns = [
    { key: "name", label: "City", align: "left" as const },
    { key: "avgSalary", label: "Avg Salary", align: "right" as const, format: (v: number) => `$${v.toLocaleString()}` },
    { key: "rentIndex", label: "Rent Index", align: "right" as const, format: (v: number) => v.toFixed(1) },
    { key: "costOfLiving", label: "Cost Index", align: "right" as const, format: (v: number) => v.toFixed(1) },
    {
      key: "stressRatio",
      label: "Stress %",
      align: "right" as const,
      format: (v: number) => `${v}%`,
    },
  ];

  const tableData = filteredCities.map((c) => ({
    ...c,
    stressRatio: c.avgSalary > 0 ? Math.round((estimateRent(c.rentIndex) / c.avgSalary) * 100) : 0,
  }));

  return (
    <DashboardLayout title="Cost vs Income Analytics" subtitle="Real-time affordability & income stress analysis">
      <GlobalFilters />

      {/* City Highlight Selector */}
      <div className="bg-muted/30 p-4 mb-6 rounded-lg border border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex flex-col">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            Drill Down Analysis
            {activeDataMode === "city" && <Badge variant="default" className="text-[10px] h-5">Single City View</Badge>}
            {activeDataMode === "region" && <Badge variant="secondary" className="text-[10px] h-5">Regional View</Badge>}
          </h3>
          <p className="text-xs text-muted-foreground">{activeDataMode === "city" ? `Showing values for ${highlightCity}` : "Showing regional averages"}</p>
        </div>
        <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openCombobox}
              className="w-[250px] justify-between text-xs bg-background"
            >
              <span className="truncate">{highlightCity ? highlightCity : "Select city to highlight..."}</span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[250px] p-0">
            <Command>
              <CommandInput placeholder="Search city..." className="h-9" />
              <CommandList>
                <CommandEmpty>No city found.</CommandEmpty>
                <CommandGroup>
                  <CommandItem onSelect={() => { setHighlightCity(""); setOpenCombobox(false); }} className="text-xs italic text-muted-foreground">
                    Clear Selection (Show Regional Avg)
                  </CommandItem>
                  {filteredCities.slice(0, 100).map((city) => (
                    <CommandItem
                      key={city.name}
                      value={city.name}
                      onSelect={(currentValue) => {
                        setHighlightCity(currentValue === highlightCity ? "" : currentValue);
                        setOpenCombobox(false);
                      }}
                      className="text-xs"
                    >
                      {city.name}
                      <Check
                        className={cn(
                          "ml-auto h-4 w-4",
                          highlightCity === city.name ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* KPI Section - Dynamic Labeling */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <MiniKPI
          label={activeDataMode === "city" ? "Monthly Salary" : "Avg Monthly Salary"}
          value={`$${affordabilityMetrics.avgSalary.toLocaleString()}`}
          icon={DollarSign}
          size="lg"
        />
        <MiniKPI
          label={activeDataMode === "city" ? "Affordability" : "Most Affordable"}
          value={activeDataMode === "city" ? (affordabilityMetrics.mostAffordable?.costOfLiving < 50 ? "Excellent" : "Moderate") : (affordabilityMetrics.mostAffordable?.name || "—")}
          icon={Building2}
          trend="up"
          size="lg"
        />
        <MiniKPI
          label={activeDataMode === "city" ? "Rent Burden" : "Highest Rent Burden"}
          value={activeDataMode === "city" ? (affordabilityMetrics.avgIncomeStress > 50 ? "High" : "Low") : (affordabilityMetrics.leastAffordable?.name || "—")}
          icon={Home}
          trend="down"
          size="lg"
        />
        <MiniKPI
          label={activeDataMode === "city" ? "Income Stress" : "Avg Income Stress"}
          value={`${affordabilityMetrics.avgIncomeStress}%`}
          icon={Percent}
          size="lg"
        />
      </div>

      {/* Dynamic Insights */}
      <div className="flex flex-wrap gap-2 mb-6">
        <InsightChip text={affordabilityMetrics.label || "Data View"} type="info" />
        {outlierCities.length > 0 && activeDataMode === "region" && (
          <InsightChip text={`${outlierCities.length} cities exceed 50% stress threshold`} type="negative" />
        )}
        {activeDataMode === "city" && outlierCities.some(c => c.name === highlightCity) && (
          <InsightChip text="This city has high income stress" type="warning" />
        )}
        {affordabilityMetrics.avgSalary > 3000 ? (
          <InsightChip text={activeDataMode === "city" ? "Strong Purchasing Power" : "Region Indicates Strong Purchasing Power"} type="positive" />
        ) : (
          <InsightChip text={activeDataMode === "city" ? "Moderate Purchasing Power" : "Region Indicates Moderate Purchasing Power"} type="warning" />
        )}
        <InsightChip text="Data reflects latest 2025 Cost of Living indices" type="info" />
      </div>

      {/* Main Analytics Grid */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Gauge Charts - Simplified to use calculated metrics */}
        <div className="lg:col-span-1 grid grid-cols-2 gap-4">
          <GaugeChart
            value={Math.min(100, affordabilityMetrics.avgIncomeStress)}
            title={activeDataMode === "city" ? "Stress Index" : "Avg Stress Index"}
            subtitle="Rent/Income Ratio"
            thresholds={{ low: 30, medium: 50, high: 70 }}
          />
          <GaugeChart
            // Using simple Rent Index Global Avg as proxy for Housing Burden if not available
            value={Math.round((affordabilityMetrics.avgIncomeStress * 0.8))}
            title="Housing Burden"
            subtitle="Est. % on Housing"
            thresholds={{ low: 30, medium: 45, high: 60 }}
          />
          <BreakdownChart
            data={affordabilityMetrics.breakdown || []}
            title={activeDataMode === "city" ? "Estimated Budget" : "Avg Budget Est."}
            subtitle={activeDataMode === "city" ? "Based on indices" : "Regional Distribution"}
            layout="vertical"
            className="col-span-2"
          />
        </div>

        {/* Scatter Plot */}
        <div className="lg:col-span-2">
          <ScatterPlotChart
            data={scatterData}
            title={highlightCity ? `Salary vs Rent: Highlighting ${highlightCity}` : "Salary vs Rent Index (All Select)"}
            xAxisLabel="Average Monthly Salary ($)"
            yAxisLabel="Rent Index"
          />
        </div>
      </div>

      {/* Outlier Detection & Full Table */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Outlier Cities */}
        <div className="analytics-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <h4 className="text-sm font-semibold text-foreground">Outlier Metrics</h4>
          </div>
          {outlierCities.length === 0 ? (
            <p className="text-xs text-muted-foreground">No critical outliers (&gt;50% stress) in current filter</p>
          ) : (
            <div className="space-y-3">
              {outlierCities.slice(0, 5).map((city) => (
                <div key={city.name} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-foreground">{city.name}</p>
                    <p className="text-xs text-muted-foreground">{city.country}</p>
                  </div>
                  <Badge
                    variant={city.stressRatio >= 70 ? "destructive" : "default"}
                  >
                    {city.stressRatio}% stress
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Full Table */}
        <div className="lg:col-span-2">
          <SortableTable columns={tableColumns} data={tableData} maxHeight="350px" />
        </div>
      </div>
    </DashboardLayout>
  );
}
