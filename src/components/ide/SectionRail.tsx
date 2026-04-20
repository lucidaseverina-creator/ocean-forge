import { Waves, Wind, Droplets, Sun, Eye, Sparkles, Layers, Zap, Activity, Cloud, Mountain, Palette, CloudRain, SlidersHorizontal, Timer } from "lucide-react";
import { sections } from "@/data/param-definitions";
import { useStudio } from "@/state/studio-store";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Waves, Wind, Droplets, Sun, Eye, Sparkles, Layers, Zap, Activity, Cloud, Mountain, Palette, CloudRain, SlidersHorizontal, Timer,
};

export function SectionRail() {
  const active = useStudio(s => s.activeSection);
  const setActive = useStudio(s => s.setActiveSection);

  return (
    <div className="w-11 shrink-0 bg-panel-header border-l border-border flex flex-col items-center py-2 gap-0.5 overflow-y-auto scrollbar-thin">
      {sections.map((sec) => {
        const Icon = ICONS[sec.icon] ?? Activity;
        const isActive = active === sec.id;
        return (
          <Tooltip key={sec.id} delayDuration={200}>
            <TooltipTrigger asChild>
              <button
                onClick={() => setActive(sec.id)}
                className={`relative w-9 h-9 flex items-center justify-center rounded-sm transition-colors ${
                  isActive
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-panel-hover"
                }`}
                aria-label={sec.title}
              >
                <Icon className="h-4 w-4" />
                {isActive && <span className="absolute left-0 top-1 bottom-1 w-0.5 bg-primary rounded-r" />}
              </button>
            </TooltipTrigger>
            <TooltipContent side="left" className="text-xs font-mono">
              <div className="font-semibold">{sec.title}</div>
              {sec.badge && <div className="text-[10px] text-muted-foreground">{sec.badge}</div>}
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}