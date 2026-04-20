import { useEffect, useMemo, useState } from "react";
import { useStudio } from "@/state/studio-store";
import { sections } from "@/data/param-definitions";
import { getAllEncyclopediaSections, getEncyclopediaForSection, getEncyclopediaEntry } from "@/data/encyclopedia";
import { ChevronRight, Search, X } from "lucide-react";

export function EncyclopediaDrawer() {
  const target = useStudio(s => s.encyclopediaTarget);
  const close = useStudio(s => s.closeLeftDrawer);
  const [q, setQ] = useState("");
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (target) setActive(target);
    else if (!active) setActive("section.longSwell");
  }, [target]);

  const sectionEntries = getAllEncyclopediaSections();
  const activeEntry = active ? getEncyclopediaEntry(active) : null;
  const activeSectionId = active?.startsWith("section.") ? active.replace("section.", "") : active?.split(".")[0];
  const childEntries = useMemo(() => {
    if (!activeSectionId) return [];
    return getEncyclopediaForSection(activeSectionId);
  }, [activeSectionId]);

  const filtered = q
    ? [
        ...sectionEntries.filter(e => e.title.toLowerCase().includes(q.toLowerCase())),
        ...childEntries.filter(e => e.title.toLowerCase().includes(q.toLowerCase())),
      ]
    : null;

  return (
    <div className="h-full flex flex-col bg-panel-bg">
      <div className="px-3 py-2 bg-panel-header border-b border-border flex items-center justify-between">
        <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-primary text-glow">Encyclopedia</h2>
        <button onClick={close} className="text-muted-foreground hover:text-foreground"><X className="h-3.5 w-3.5" /></button>
      </div>
      <div className="px-3 py-2 border-b border-border">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          <input
            value={q} onChange={e => setQ(e.target.value)}
            placeholder="Search parameters…"
            className="w-full pl-7 pr-2 py-1 text-xs font-mono bg-muted rounded-sm border border-border outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="flex-1 grid grid-cols-[180px_1fr] overflow-hidden">
        <div className="border-r border-border overflow-y-auto scrollbar-thin">
          {(filtered ?? sectionEntries).map(s => (
            <button
              key={s.key}
              onClick={() => setActive(s.key)}
              className={`w-full text-left px-3 py-1.5 text-xs font-mono hover:bg-panel-hover flex items-center gap-1 ${active === s.key ? "bg-primary/10 text-primary" : "text-secondary-foreground"}`}
            >
              <ChevronRight className="h-2.5 w-2.5 shrink-0" />
              <span className="truncate">{s.title}</span>
            </button>
          ))}
        </div>

        <div className="overflow-y-auto scrollbar-thin">
          {activeEntry ? (
            <div className="p-4 space-y-3">
              <h3 className="text-sm font-mono font-bold text-primary text-glow">{activeEntry.title}</h3>
              <p className="text-xs text-secondary-foreground italic">{activeEntry.short}</p>
              <div className="text-xs text-foreground leading-relaxed whitespace-pre-line font-mono">
                {activeEntry.long}
              </div>
              {activeEntry.references && (
                <div className="pt-2 border-t border-border">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1">References</div>
                  {activeEntry.references.map((r, i) => (
                    <div key={i} className="text-[10px] font-mono text-muted-foreground">• {r}</div>
                  ))}
                </div>
              )}

              {active?.startsWith("section.") && childEntries.length > 0 && (
                <div className="pt-3 border-t border-border">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">Parameters in this section</div>
                  <div className="space-y-1">
                    {childEntries.map(c => (
                      <button key={c.key} onClick={() => setActive(c.key)}
                        className="w-full text-left px-2 py-1 text-[11px] font-mono hover:bg-panel-hover rounded-sm">
                        <span className="text-primary">{c.title}</span>
                        <span className="block text-muted-foreground text-[10px] truncate">{c.short}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 text-xs font-mono text-muted-foreground">Select an entry.</div>
          )}
        </div>
      </div>
    </div>
  );
}