import { useState } from "react";
import { sections, paramDefs } from "@/data/param-definitions";
import { defaultOceanParams, type OceanParams } from "@/types/ocean-params";
import { sectionEditors } from "@/components/visual-editors/registry";
import { ParamSlider } from "./ParamSlider";
import { useStudio } from "@/state/studio-store";
import { getEncyclopediaEntry } from "@/data/encyclopedia";
import { BookOpen, Eye, Sliders } from "lucide-react";

function setNestedValue(obj: any, path: string, value: number): any {
  const parts = path.split(".");
  if (parts.length === 1) return { ...obj, [parts[0]]: value };
  return { ...obj, [parts[0]]: setNestedValue(obj[parts[0]] ?? {}, parts.slice(1).join("."), value) };
}
function getNestedValue(obj: any, path: string): number {
  const parts = path.split(".");
  let v = obj;
  for (const p of parts) { if (v == null) return 0; v = v[p]; }
  return typeof v === "number" ? v : 0;
}

interface Props {
  params: OceanParams;
  onChange: (p: OceanParams) => void;
}

export function SectionView({ params, onChange }: Props) {
  const activeSection = useStudio(s => s.activeSection);
  const openEncyclopedia = useStudio(s => s.openEncyclopedia);
  const [tab, setTab] = useState<"visual" | "numeric">("visual");

  const sec = sections.find(s => s.id === activeSection) ?? sections[0];
  const defs = paramDefs.filter(d => d.section === sec.id);
  const sectionEntry = getEncyclopediaEntry(`section.${sec.id}`);
  const editors = sectionEditors[sec.id] ?? [];

  // defensive merge so visual editors never blow up on missing sub-fields
  const safeParams: OceanParams = { ...defaultOceanParams, ...params } as OceanParams;
  for (const key of Object.keys(defaultOceanParams) as (keyof OceanParams)[]) {
    const dv = (defaultOceanParams as any)[key];
    const cv = (params as any)?.[key];
    if (dv && typeof dv === "object") (safeParams as any)[key] = { ...dv, ...(cv ?? {}) };
  }

  return (
    <div className="h-full flex flex-col">
      <div className="px-3 py-2 bg-panel-header border-b border-border flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary">
            {sec.badge ?? sec.id.toUpperCase()}
          </span>
          <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-primary text-glow truncate">
            {sec.title}
          </h2>
        </div>
        <span className="text-[9px] font-mono text-muted-foreground shrink-0">{defs.length}</span>
      </div>

      {sectionEntry && (
        <div className="px-3 py-2 border-b border-border bg-panel-bg/50 shrink-0">
          <p className="text-[10px] font-mono text-muted-foreground leading-relaxed">{sectionEntry.short}</p>
          <button
            onClick={() => openEncyclopedia(`section.${sec.id}`)}
            className="mt-1.5 flex items-center gap-1 text-[10px] font-mono text-primary hover:text-primary/80 transition-colors"
          >
            <BookOpen className="h-2.5 w-2.5" /> Read full entry
          </button>
        </div>
      )}

      {/* Visual / Numeric tab strip — skeuomorphic chassis */}
      <div className="px-2 py-1.5 border-b border-border shrink-0 skeuo-chassis">
        <div className="grid grid-cols-2 gap-1">
          <button
            onClick={() => setTab("visual")}
            disabled={!editors.length}
            className={`flex items-center justify-center gap-1.5 py-1 text-[10px] font-mono uppercase tracking-wider rounded-sm transition-all ${
              tab === "visual"
                ? "skeuo-puck text-primary"
                : "text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
            }`}
          >
            <Eye className="h-3 w-3" /> Visual {editors.length ? `(${editors.length})` : "—"}
          </button>
          <button
            onClick={() => setTab("numeric")}
            className={`flex items-center justify-center gap-1.5 py-1 text-[10px] font-mono uppercase tracking-wider rounded-sm transition-all ${
              tab === "numeric" ? "skeuo-puck text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sliders className="h-3 w-3" /> Numeric ({defs.length})
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {tab === "visual" && editors.length > 0 && (
          <div className="px-3 py-3 space-y-3">
            {editors.map((e, i) => (
              <div key={i}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="h-1.5 w-1.5 rounded-full skeuo-led" />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-secondary-foreground">{e.title}</span>
                </div>
                {e.render(safeParams, onChange)}
              </div>
            ))}
          </div>
        )}

        {tab === "visual" && editors.length === 0 && (
          <div className="py-12 px-4 text-center space-y-2">
            <div className="text-xs font-mono text-muted-foreground">No visual editor yet for this section.</div>
            <button onClick={() => setTab("numeric")} className="text-[10px] font-mono text-primary hover:underline">
              Switch to Numeric →
            </button>
          </div>
        )}

        {tab === "numeric" && (
          <div className="px-3 py-2 space-y-0.5">
            {defs.length === 0 && (
              <div className="py-8 text-center text-xs font-mono text-muted-foreground">No parameters.</div>
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
                onChange={(v) => onChange(setNestedValue(params, def.key, v))}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}