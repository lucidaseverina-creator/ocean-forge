import { useState, type ReactNode } from "react";
import { ChevronRight } from "lucide-react";

interface ParamSectionProps {
  title: string;
  icon?: ReactNode;
  badge?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

export function ParamSection({ title, icon, badge, defaultOpen = true, children }: ParamSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-3 py-2 bg-panel-header hover:bg-panel-hover transition-colors text-left"
      >
        <ChevronRight
          className={`h-3 w-3 text-muted-foreground transition-transform duration-200 ${open ? "rotate-90" : ""}`}
        />
        {icon && <span className="text-primary">{icon}</span>}
        <span className="text-xs font-mono font-semibold uppercase tracking-wider text-secondary-foreground">
          {title}
        </span>
        {badge && (
          <span className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
            {badge}
          </span>
        )}
      </button>
      {open && (
        <div className="px-3 py-2 space-y-0.5">
          {children}
        </div>
      )}
    </div>
  );
}
