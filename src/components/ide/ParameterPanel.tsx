import {
  Waves, Wind, Droplets, Sun, Eye, Sparkles, Layers, Zap, Activity,
  Cloud, Mountain, Palette, CloudRain, SlidersHorizontal, Timer,
} from "lucide-react";
import { ParamSlider } from "./ParamSlider";
import { sections, paramDefs } from "@/data/param-definitions";
import { defaultOceanParams, type OceanParams } from "@/types/ocean-params";
import { useStudio } from "@/state/studio-store";
import { getEncyclopediaEntry } from "@/data/encyclopedia";
import { BookOpen } from "lucide-react";

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
  for (const p of parts) {
    if (val == null) return 0;
    val = val[p];
  }
  return (typeof val === "number" ? val : 0);
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
  const activeSection = useStudio(s => s.activeSection);
  const openEncyclopedia = useStudio(s => s.openEncyclopedia);

  // Defensive: ensure all wave groups + sub-fields exist (covers HMR / migrations)
  const safeParams: OceanParams = { ...defaultOceanParams, ...params } as OceanParams;
  for (const key of Object.keys(defaultOceanParams) as (keyof OceanParams)[]) {
    const def = (defaultOceanParams as any)[key];
    const cur = (params as any)?.[key];
    if (def && typeof def === "object") {
      (safeParams as any)[key] = { ...def, ...(cur ?? {}) };
    }
  }

  const sec = sections.find(s => s.id === activeSection) ?? sections[0];
  const defs = paramDefs.filter(d => d.section === sec.id);
  const sectionEntry = getEncyclopediaEntry(`section.${sec.id}`);

  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <div className="px-3 py-2 bg-panel-header border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary">
            {sec.badge ?? sec.id.toUpperCase()}
          </span>
          <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-primary text-glow truncate">
            {sec.title}
          </h2>
        </div>
        <span className="text-[9px] font-mono text-muted-foreground shrink-0">
          {defs.length}
        </span>
      </div>

      {sectionEntry && (
        <div className="px-3 py-2 border-b border-border bg-panel-bg/50">
          <p className="text-[10px] font-mono text-muted-foreground leading-relaxed">
            {sectionEntry.short}
          </p>
          <button
            onClick={() => openEncyclopedia(`section.${sec.id}`)}
            className="mt-1.5 flex items-center gap-1 text-[10px] font-mono text-primary hover:text-primary/80 transition-colors"
          >
            <BookOpen className="h-2.5 w-2.5" />
            Read full entry
          </button>
        </div>
      )}

      <div className="px-3 py-2 space-y-0.5">
        {defs.length === 0 && (
          <div className="py-8 text-center text-xs font-mono text-muted-foreground">
            No parameters in this section yet.
          </div>
        )}
        {defs.map((def) => (
          <ParamSlider
            key={def.key}
            paramKey={def.key}
            label={def.label}
            value={getNestedValue(safeParams, def.key)}
            min={def.min}
            max={def.max}
            step={def.step}
            unit={def.unit}
            onChange={(v) => handleChange(def.key, v)}
          />
        ))}
      </div>
    </div>
  );
}
