import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface WeightSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  description?: string;
  icon?: React.ReactNode;
}

export function WeightSlider({ label, value, onChange, description, icon }: WeightSliderProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              {icon}
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-foreground">{label}</p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-primary font-mono">{value}%</span>
        </div>
      </div>
      <Slider
        value={[value]}
        onValueChange={(vals) => onChange(vals[0])}
        max={100}
        min={0}
        step={5}
        className={cn("w-full")}
      />
    </div>
  );
}
