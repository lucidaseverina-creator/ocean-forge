import {
  Waves, Wind, Droplets, Sun, Eye, Sparkles, Layers, Zap, Activity,
  Cloud, Mountain, Palette, CloudRain, SlidersHorizontal, Timer,
} from "lucide-react";
import { ParamSection } from "./ParamSection";
import { ParamSlider } from "./ParamSlider";
import { sections, paramDefs } from "@/data/param-definitions";
import type { OceanParams } from "@/types/ocean-params";

const iconMap: Record<string, React.ReactNode> = {
  Waves: <Waves className="h-3.5 w-3.5" />,
  Wind: <Wind className="h-3.5 w-3.5" />,
  Droplets: <Droplets className="h-3.5 w-3.5" />,
  Sun: <Sun className="h-3.5 w-3.5" />,
  Eye: <Eye className="h-3.5 w-3.5" />,
  Sparkles: <Sparkles className="h-3.5 w-3.5" />,
  Layers: <Layers className="h-3.5 w-3.5" />,
  Zap: <Zap className="h-3.5 w-3.5" />,
  Activity: <Activity className="h-3.5 w-3.5" />,
  Cloud: <Cloud className="h-3.5 w-3.5" />,
  Mountain: <Mountain className="h-3.5 w-3.5" />,
  Palette: <Palette className="h-3.5 w-3.5" />,
  CloudRain: <CloudRain className="h-3.5 w-3.5" />,
  SlidersHorizontal: <SlidersHorizontal className="h-3.5 w-3.5" />,
  Timer: <Timer className="h-3.5 w-3.5" />,
};

interface ParameterPanelProps {
  params: OceanParams;
  onChange: (params: OceanParams) => void;
}

function getNestedValue(obj: any, path: string): number {
  const parts = path.split(".");
  let val = obj;
  for (const p of parts) val = val[p];
  return val as number;
}

function setNestedValue(obj: any, path: string, value: number): any {
  const parts = path.split(".");
  if (parts.length === 1) return { ...obj, [parts[0]]: value };
  return { ...obj, [parts[0]]: setNestedValue(obj[parts[0]], parts.slice(1).join("."), value) };
}

export function ParameterPanel({ params, onChange }: ParameterPanelProps) {
  const handleChange = (key: string, value: number) => {
    onChange(setNestedValue(params, key, value));
  };

  // Group param defs by section
  const grouped = new Map<string, typeof paramDefs>();
  for (const def of paramDefs) {
    if (!grouped.has(def.section)) grouped.set(def.section, []);
    grouped.get(def.section)!.push(def);
  }

  const totalParams = paramDefs.length;

  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <div className="px-3 py-2 bg-panel-header border-b border-border flex items-center justify-between">
        <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-primary text-glow">
          Inspector
        </h2>
        <span className="text-[9px] font-mono text-muted-foreground">
          {totalParams} params
        </span>
      </div>

      {sections.map((sec) => {
        const defs = grouped.get(sec.id);
        if (!defs || defs.length === 0) return null;
        return (
          <ParamSection
            key={sec.id}
            title={sec.title}
            icon={iconMap[sec.icon]}
            badge={`${defs.length}`}
            defaultOpen={sec.defaultOpen ?? false}
          >
            {defs.map((def) => (
              <ParamSlider
                key={def.key}
                label={def.label}
                value={getNestedValue(params, def.key)}
                min={def.min}
                max={def.max}
                step={def.step}
                unit={def.unit}
                onChange={(v) => handleChange(def.key, v)}
              />
            ))}
          </ParamSection>
        );
      })}
    </div>
  );
}
