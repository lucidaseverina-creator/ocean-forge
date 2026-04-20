import { useState } from "react";
import { Info, BookOpen } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { getEncyclopediaEntry } from "@/data/encyclopedia";
import { useStudio } from "@/state/studio-store";

interface InfoPopoverProps {
  paramKey: string;
}

export function InfoPopover({ paramKey }: InfoPopoverProps) {
  const [open, setOpen] = useState(false);
  const openEncyclopedia = useStudio(s => s.openEncyclopedia);
  const entry = getEncyclopediaEntry(paramKey);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="opacity-0 group-hover:opacity-60 hover:!opacity-100 text-muted-foreground hover:text-primary transition-opacity shrink-0"
          title="What does this do?"
          aria-label="Show parameter info"
        >
          <Info className="h-3 w-3" />
        </button>
      </PopoverTrigger>
      <PopoverContent side="left" align="start" className="w-72 text-xs font-mono">
        <div className="space-y-2">
          <div className="font-semibold text-primary text-[11px] uppercase tracking-wider">
            {entry?.title ?? paramKey}
          </div>
          <p className="text-secondary-foreground leading-relaxed">
            {entry?.short ?? "No description available yet for this parameter."}
          </p>
          {entry && (
            <button
              onClick={() => { setOpen(false); openEncyclopedia(paramKey); }}
              className="w-full mt-2 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-sm bg-primary/10 hover:bg-primary/20 text-primary text-[10px] uppercase tracking-wider transition-colors"
            >
              <BookOpen className="h-3 w-3" />
              Open in Encyclopedia
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}