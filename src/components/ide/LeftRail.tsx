import { MessageSquare, User, FolderOpen, BookOpen } from "lucide-react";
import { useStudio, type LeftDrawer } from "@/state/studio-store";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const ITEMS: { id: Exclude<LeftDrawer, null>; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "chat", label: "AI Wave Studio", icon: MessageSquare },
  { id: "encyclopedia", label: "Encyclopedia", icon: BookOpen },
  { id: "profiles", label: "Saved Profiles", icon: FolderOpen },
  { id: "account", label: "Account", icon: User },
];

export function LeftRail() {
  const drawer = useStudio(s => s.leftDrawer);
  const open = useStudio(s => s.openLeftDrawer);
  const close = useStudio(s => s.closeLeftDrawer);

  return (
    <div className="flex items-center gap-0.5">
      {ITEMS.map(it => {
        const Icon = it.icon;
        const active = drawer === it.id;
        return (
          <Tooltip key={it.id} delayDuration={200}>
            <TooltipTrigger asChild>
              <button
                onClick={() => active ? close() : open(it.id)}
                className={`p-1.5 rounded-sm transition-colors ${
                  active ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-panel-hover"
                }`}
                aria-label={it.label}
              >
                <Icon className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs font-mono">{it.label}</TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}