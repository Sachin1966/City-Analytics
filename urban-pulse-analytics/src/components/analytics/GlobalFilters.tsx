import { useFilters, Region, IncomeTier, Year } from "@/contexts/FilterContext";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Globe, DollarSign, RotateCcw } from "lucide-react";

const years: Year[] = ["2020", "2021", "2022", "2023", "2024", "2025"];
const regions: { value: Region; label: string }[] = [
  { value: "all", label: "All Regions" },
  { value: "europe", label: "Europe" },
  { value: "asia-pacific", label: "Asia-Pacific" },
  { value: "americas", label: "Americas" },
  { value: "middle-east", label: "Middle East" },
];
const incomeTiers: { value: IncomeTier; label: string }[] = [
  { value: "all", label: "All Tiers" },
  { value: "high", label: "High ($6K+)" },
  { value: "medium", label: "Medium ($4-6K)" },
  { value: "low", label: "Low (<$4K)" },
];

export function GlobalFilters() {
  const { year, region, incomeTier, setYear, setRegion, setIncomeTier, resetFilters } = useFilters();

  return (
    <div className="analytics-card p-3 mb-6 flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
        <span>Filters</span>
      </div>

      <div className="h-6 w-px bg-border" />

      <Select value={year} onValueChange={(v) => setYear(v as Year)} disabled={true}>
        <SelectTrigger className="w-[120px] h-8 text-xs opacity-50 cursor-not-allowed" title="Historical data currently unavailable (Live 2025 data only)">
          <Calendar className="h-3 w-3 mr-2" />
          <SelectValue placeholder="2025" />
        </SelectTrigger>
        <SelectContent>
          {years.map((y) => (
            <SelectItem key={y} value={y} className="text-xs">
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={region} onValueChange={(v) => setRegion(v as Region)}>
        <SelectTrigger className="w-[140px] h-8 text-xs">
          <Globe className="h-3 w-3 mr-2" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {regions.map((r) => (
            <SelectItem key={r.value} value={r.value} className="text-xs">
              {r.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={incomeTier} onValueChange={(v) => setIncomeTier(v as IncomeTier)}>
        <SelectTrigger className="w-[140px] h-8 text-xs">
          <DollarSign className="h-3 w-3 mr-2" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {incomeTiers.map((t) => (
            <SelectItem key={t.value} value={t.value} className="text-xs">
              {t.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex-1" />

      <Button variant="ghost" size="sm" onClick={resetFilters} className="h-8 text-xs">
        <RotateCcw className="h-3 w-3 mr-1" />
        Reset
      </Button>
    </div>
  );
}
