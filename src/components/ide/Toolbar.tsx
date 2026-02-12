import { Play, Pause, RotateCcw, Camera, Download, Settings, Maximize2 } from "lucide-react";
import { useState } from "react";
import type { OceanParams } from "@/types/ocean-params";
import { defaultOceanParams } from "@/types/ocean-params";

interface ToolbarProps {
  params: OceanParams;
  onReset: () => void;
  onTogglePlay: () => void;
  isPlaying: boolean;
}

export function Toolbar({ onReset, onTogglePlay, isPlaying }: ToolbarProps) {
  return (
    <div className="h-9 bg-panel-header border-b border-border flex items-center px-2 gap-1">
      <div className="flex items-center gap-0.5">
        <ToolbarButton icon={isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />} label={isPlaying ? "Pause" : "Play"} onClick={onTogglePlay} active={isPlaying} />
        <ToolbarButton icon={<RotateCcw className="h-3.5 w-3.5" />} label="Reset" onClick={onReset} />
      </div>
      <div className="h-4 w-px bg-border mx-1" />
      <div className="flex items-center gap-0.5">
        <ToolbarButton icon={<Camera className="h-3.5 w-3.5" />} label="Screenshot" />
        <ToolbarButton icon={<Download className="h-3.5 w-3.5" />} label="Export" />
      </div>
      <div className="flex-1" />
      <span className="text-[10px] font-mono text-muted-foreground mr-2">
        Water Encyclopedia Engine
      </span>
      <ToolbarButton icon={<Settings className="h-3.5 w-3.5" />} label="Settings" />
    </div>
  );
}

function ToolbarButton({
  icon,
  label,
  onClick,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`p-1.5 rounded-sm transition-colors ${
        active
          ? "bg-primary/20 text-primary"
          : "text-muted-foreground hover:text-foreground hover:bg-panel-hover"
      }`}
    >
      {icon}
    </button>
  );
}
