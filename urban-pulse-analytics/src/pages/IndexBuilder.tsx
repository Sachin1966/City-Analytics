import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GlobalFilters } from "@/components/analytics/GlobalFilters";
import { WeightSlider } from "@/components/ui/WeightSlider";
import { MiniKPI } from "@/components/analytics/MiniKPI";
import { RankingShift } from "@/components/analytics/RankingShift";
import { BreakdownChart } from "@/components/analytics/BreakdownChart";
import { InsightChip } from "@/components/analytics/InsightChip";
import { RadarChart } from "@/components/charts/RadarChart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  Shield,
  Leaf,
  Train,
  Briefcase,
  Heart,
  RotateCcw,
  Download,
  Play,
} from "lucide-react";
import { useFilters } from "@/contexts/FilterContext";
import { cn } from "@/lib/utils";

interface WeightConfig {
  affordability: number;
  safety: number;
  environment: number;
  mobility: number;
  income: number;
  healthcare: number;
}

const defaultWeights: WeightConfig = {
  affordability: 20,
  safety: 20,
  environment: 15,
  mobility: 15,
  income: 15,
  healthcare: 15,
};

const weightIcons = {
  affordability: DollarSign,
  safety: Shield,
  environment: Leaf,
  mobility: Train,
  income: Briefcase,
  healthcare: Heart,
};

export default function IndexBuilder() {
  const { filteredCities } = useFilters();
  const [weights, setWeights] = useState<WeightConfig>(defaultWeights);

  const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);

  const updateWeight = (key: keyof WeightConfig, value: number) => {
    setWeights((prev) => ({ ...prev, [key]: value }));
  };

  const resetWeights = () => setWeights(defaultWeights);

  // Calculate custom QoL scores using Dynamic Min-Max Normalization
  const rankedCities = useMemo(() => {
    if (!filteredCities.length) return [];

    // 1. Calculate Extents (Min/Max) for all metrics across the CURRENT dataset
    const stats = {
      cost: { min: Infinity, max: -Infinity },
      safety: { min: Infinity, max: -Infinity }, // Inverse (Crime Index)
      environment: { min: Infinity, max: -Infinity }, // Inverse (Pollution)
      mobility: { min: Infinity, max: -Infinity },
      income: { min: Infinity, max: -Infinity },
      healthcare: { min: Infinity, max: -Infinity },
    };

    filteredCities.forEach(c => {
      stats.cost.min = Math.min(stats.cost.min, c.costOfLiving);
      stats.cost.max = Math.max(stats.cost.max, c.costOfLiving);

      stats.safety.min = Math.min(stats.safety.min, c.crimeIndex);
      stats.safety.max = Math.max(stats.safety.max, c.crimeIndex);

      stats.environment.min = Math.min(stats.environment.min, c.pollutionIndex);
      stats.environment.max = Math.max(stats.environment.max, c.pollutionIndex);

      stats.mobility.min = Math.min(stats.mobility.min, c.transportScore);
      stats.mobility.max = Math.max(stats.mobility.max, c.transportScore);

      stats.income.min = Math.min(stats.income.min, c.avgSalary);
      stats.income.max = Math.max(stats.income.max, c.avgSalary);

      stats.healthcare.min = Math.min(stats.healthcare.min, c.healthcareScore);
      stats.healthcare.max = Math.max(stats.healthcare.max, c.healthcareScore);
    });

    // Helper for normalization: (Value - Min) / (Max - Min) * 100
    // For Inverse metrics (Cost, Crime, Pollution): 100 - Score
    const normalize = (val: number, min: number, max: number, inverse = false) => {
      if (max === min) return 100; // Single item or zero variance
      const score = ((val - min) / (max - min)) * 100;
      return inverse ? 100 - score : score;
    };

    return filteredCities
      .map((city) => {
        // Calculate Normalized Scores (0-100 relative to this dataset)
        const scores = {
          affordability: normalize(city.costOfLiving, stats.cost.min, stats.cost.max, true), // Lower Cost = Better
          safety: normalize(city.crimeIndex, stats.safety.min, stats.safety.max, true), // Lower Crime = Better
          environment: normalize(city.pollutionIndex, stats.environment.min, stats.environment.max, true), // Lower Pollution = Better
          mobility: normalize(city.transportScore, stats.mobility.min, stats.mobility.max, false),
          income: normalize(city.avgSalary, stats.income.min, stats.income.max, false),
          healthcare: normalize(city.healthcareScore, stats.healthcare.min, stats.healthcare.max, false),
        };

        const customScore =
          (scores.affordability * weights.affordability +
            scores.safety * weights.safety +
            scores.environment * weights.environment +
            scores.mobility * weights.mobility +
            scores.income * weights.income +
            scores.healthcare * weights.healthcare) /
          totalWeight;

        return {
          ...city,
          customScore: Math.round(customScore * 10) / 10,
          scores,
          originalRank: city.rank,
        };
      })
      .sort((a, b) => b.customScore - a.customScore)
      .map((city, idx) => ({
        ...city,
        currentRank: idx + 1,
        previousRank: city.originalRank,
      }));
  }, [filteredCities, weights, totalWeight]);

  // Radar data for top 3
  const radarData = useMemo(() => {
    const top3 = rankedCities.slice(0, 3);
    return [
      { metric: "Affordability", ...Object.fromEntries(top3.map((c) => [c.name, Math.round(c.scores.affordability)])) },
      { metric: "Safety", ...Object.fromEntries(top3.map((c) => [c.name, Math.round(c.scores.safety)])) },
      { metric: "Environment", ...Object.fromEntries(top3.map((c) => [c.name, Math.round(c.scores.environment)])) },
      { metric: "Mobility", ...Object.fromEntries(top3.map((c) => [c.name, Math.round(c.scores.mobility)])) },
      { metric: "Income", ...Object.fromEntries(top3.map((c) => [c.name, Math.round(c.scores.income)])) },
      { metric: "Healthcare", ...Object.fromEntries(top3.map((c) => [c.name, Math.round(c.scores.healthcare)])) },
    ];
  }, [rankedCities]);

  const radarCities = rankedCities.slice(0, 3).map((c, i) => ({
    name: c.name,
    color: `hsl(var(--chart-${i + 1}))`,
  }));

  // Contribution breakdown for #1 city
  const topCity = rankedCities[0];
  const contributionData = topCity
    ? [
      { name: "Affordability", value: Math.round((topCity.scores.affordability * weights.affordability) / totalWeight) },
      { name: "Safety", value: Math.round((topCity.scores.safety * weights.safety) / totalWeight) },
      { name: "Environment", value: Math.round((topCity.scores.environment * weights.environment) / totalWeight) },
      { name: "Mobility", value: Math.round((topCity.scores.mobility * weights.mobility) / totalWeight) },
      { name: "Income", value: Math.round((topCity.scores.income * weights.income) / totalWeight) },
      { name: "Healthcare", value: Math.round((topCity.scores.healthcare * weights.healthcare) / totalWeight) },
    ]
    : [];

  return (
    <DashboardLayout title="QoL Index Builder" subtitle="Customize index weights & analyze sensitivity">
      <GlobalFilters />

      {/* Top KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <MiniKPI label="Top City" value={topCity?.name || "—"} icon={Play} trend="up" size="lg" />
        <MiniKPI label="Top Score" value={topCity?.customScore || 0} change={topCity ? topCity.customScore - topCity.qolIndex : 0} size="lg" />
        <MiniKPI label="Cities Analyzed" value={rankedCities.length} size="lg" />
        <MiniKPI label="Weight Total" value={`${totalWeight}%`} trend={totalWeight === 100 ? "up" : "down"} size="lg" />
        <MiniKPI label="Rank Changes" value={rankedCities.filter((c) => c.currentRank !== c.previousRank).length} size="lg" />
      </div>

      {/* Insight Chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        {rankedCities[0]?.currentRank !== rankedCities[0]?.previousRank && (
          <InsightChip text={`${rankedCities[0]?.name} moves to #1 with new weights`} type="highlight" />
        )}
        <InsightChip text={`Safety weight at ${weights.safety}% — high impact`} type="info" />
        {totalWeight !== 100 && <InsightChip text="Weights don't sum to 100%" type="warning" />}
      </div>

      {/* Main Analytics Grid */}
      <div className="grid lg:grid-cols-4 gap-6 mb-6">
        {/* Weight Sliders */}
        <div className="lg:col-span-1 analytics-card p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-foreground">Index Weights</h4>
            <div className="flex items-center gap-2">
              <Badge variant={totalWeight === 100 ? "default" : "destructive"} className="text-xs">
                {totalWeight}%
              </Badge>
              <Button variant="ghost" size="sm" onClick={resetWeights} className="h-6 w-6 p-0">
                <RotateCcw className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {(Object.keys(weights) as Array<keyof WeightConfig>).map((key) => {
              const Icon = weightIcons[key];
              return (
                <WeightSlider
                  key={key}
                  label={key.charAt(0).toUpperCase() + key.slice(1)}
                  value={weights[key]}
                  onChange={(v) => updateWeight(key, v)}
                  icon={<Icon className="h-3 w-3" />}
                />
              );
            })}
          </div>
        </div>

        {/* Radar Chart */}
        <div className="lg:col-span-2">
          <RadarChart data={radarData} cities={radarCities} title="Top 3 Cities Comparison" />
        </div>

        {/* Contribution Breakdown */}
        <div className="lg:col-span-1 space-y-4">
          <BreakdownChart
            data={contributionData}
            title={`${topCity?.name || "Top City"} Score Breakdown`}
            subtitle="Contribution by dimension"
            layout="vertical"
          />
          <RankingShift
            data={rankedCities.slice(0, 5).map((c) => ({
              name: c.name,
              currentRank: c.currentRank,
              previousRank: c.previousRank,
              score: c.customScore,
            }))}
            title="Ranking Shifts"
          />
        </div>
      </div>

      {/* Full Rankings Table */}
      <div className="analytics-card p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold text-foreground">Custom Rankings</h4>
          <Button variant="outline" size="sm" className="h-7 text-xs">
            <Download className="h-3 w-3 mr-1" />
            Export
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
          {rankedCities.map((city, idx) => (
            <div
              key={city.name}
              className={cn(
                "p-3 rounded-lg text-center transition-all",
                idx === 0 ? "bg-success/10 border border-success/20" : "bg-muted/50 hover:bg-muted"
              )}
            >
              <span
                className={cn(
                  "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold mb-2",
                  idx === 0 ? "bg-success text-success-foreground" : "bg-muted-foreground/20 text-muted-foreground"
                )}
              >
                {idx + 1}
              </span>
              <p className="text-sm font-medium text-foreground truncate">{city.name}</p>
              <p className="text-lg font-bold font-mono text-foreground">{city.customScore}</p>
              {city.currentRank !== city.previousRank && (
                <span
                  className={cn(
                    "text-xs font-mono",
                    city.currentRank < city.previousRank ? "text-success" : "text-destructive"
                  )}
                >
                  {city.currentRank < city.previousRank ? "↑" : "↓"}
                  {Math.abs(city.currentRank - city.previousRank)}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
