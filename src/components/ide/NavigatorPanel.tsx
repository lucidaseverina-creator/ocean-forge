import { useState } from "react";
import {
  ChevronRight,
  Waves,
  Droplets,
  Sun,
  Eye,
  Wind,
  Anchor,
  Sparkles,
  Layers,
  Zap,
  BookOpen,
  Cpu,
  Gauge,
} from "lucide-react";

interface TreeNode {
  label: string;
  icon: React.ReactNode;
  id: string;
  badge?: string;
  children?: TreeNode[];
}

const tree: TreeNode[] = [
  {
    label: "Vol I — Vision",
    icon: <BookOpen className="h-3.5 w-3.5" />,
    id: "vol1",
    children: [
      { label: "Sim Ladder L0–L5", icon: <Gauge className="h-3.5 w-3.5" />, id: "ladder" },
      { label: "Symbol Glossary", icon: <BookOpen className="h-3.5 w-3.5" />, id: "glossary" },
    ],
  },
  {
    label: "Vol IV — Waves",
    icon: <Waves className="h-3.5 w-3.5" />,
    id: "vol4",
    badge: "Active",
    children: [
      { label: "Dispersion", icon: <Waves className="h-3.5 w-3.5" />, id: "dispersion", badge: "L2" },
      { label: "Gerstner (L1)", icon: <Waves className="h-3.5 w-3.5" />, id: "gerstner", badge: "L1" },
      { label: "Capillary Ripples", icon: <Sparkles className="h-3.5 w-3.5" />, id: "capillary", badge: "L0" },
      { label: "Ship Wakes", icon: <Anchor className="h-3.5 w-3.5" />, id: "wakes" },
      { label: "Shoaling", icon: <Layers className="h-3.5 w-3.5" />, id: "shoaling" },
    ],
  },
  {
    label: "Vol V — Breaking",
    icon: <Droplets className="h-3.5 w-3.5" />,
    id: "vol5",
    children: [
      { label: "Crest → Sheet", icon: <Droplets className="h-3.5 w-3.5" />, id: "crest_sheet", badge: "L4" },
      { label: "Whitecaps", icon: <Wind className="h-3.5 w-3.5" />, id: "whitecaps" },
      { label: "Foam Lifecycle", icon: <Droplets className="h-3.5 w-3.5" />, id: "foam_lifecycle" },
      { label: "Spray & Mist", icon: <Droplets className="h-3.5 w-3.5" />, id: "spray" },
      { label: "Bubbles", icon: <Sparkles className="h-3.5 w-3.5" />, id: "bubbles" },
    ],
  },
  {
    label: "Vol VI — Rendering",
    icon: <Eye className="h-3.5 w-3.5" />,
    id: "vol6",
    children: [
      { label: "Fresnel & IOR", icon: <Eye className="h-3.5 w-3.5" />, id: "fresnel" },
      { label: "Beer-Lambert", icon: <Eye className="h-3.5 w-3.5" />, id: "beer_lambert" },
      { label: "Caustics", icon: <Zap className="h-3.5 w-3.5" />, id: "caustics" },
      { label: "Scattering", icon: <Sun className="h-3.5 w-3.5" />, id: "scattering" },
    ],
  },
  {
    label: "Environment",
    icon: <Sun className="h-3.5 w-3.5" />,
    id: "env",
    children: [
      { label: "Lighting", icon: <Sun className="h-3.5 w-3.5" />, id: "lighting" },
      { label: "Wind Forcing", icon: <Wind className="h-3.5 w-3.5" />, id: "wind" },
      { label: "Bathymetry", icon: <Layers className="h-3.5 w-3.5" />, id: "bathymetry" },
    ],
  },
  {
    label: "Performance",
    icon: <Cpu className="h-3.5 w-3.5" />,
    id: "perf",
    children: [
      { label: "LOD Budget", icon: <Gauge className="h-3.5 w-3.5" />, id: "lod" },
      { label: "Pass Graph", icon: <Cpu className="h-3.5 w-3.5" />, id: "passes" },
    ],
  },
];

function TreeItem({ node, depth = 0 }: { node: TreeNode; depth?: number }) {
  const [open, setOpen] = useState(node.id === "vol4");
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div>
      <button
        onClick={() => hasChildren && setOpen(!open)}
        className="w-full flex items-center gap-1.5 px-2 py-1 hover:bg-panel-hover transition-colors rounded-sm text-left group"
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        {hasChildren ? (
          <ChevronRight
            className={`h-3 w-3 text-muted-foreground transition-transform duration-150 shrink-0 ${open ? "rotate-90" : ""}`}
          />
        ) : (
          <span className="w-3 shrink-0" />
        )}
        <span className="text-muted-foreground shrink-0">{node.icon}</span>
        <span className="text-xs font-mono text-secondary-foreground truncate">{node.label}</span>
        {node.badge && (
          <span className="ml-auto text-[9px] font-mono px-1 py-0.5 rounded bg-primary/10 text-primary shrink-0">
            {node.badge}
          </span>
        )}
      </button>
      {open && node.children?.map((child) => (
        <TreeItem key={child.id} node={child} depth={depth + 1} />
      ))}
    </div>
  );
}

export function NavigatorPanel() {
  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <div className="px-3 py-2 bg-panel-header border-b border-border">
        <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-primary text-glow">
          Encyclopedia
        </h2>
      </div>
      <div className="py-1">
        {tree.map((node) => (
          <TreeItem key={node.id} node={node} />
        ))}
      </div>
    </div>
  );
}
