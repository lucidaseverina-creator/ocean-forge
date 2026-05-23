import { useMemo, useRef } from "react";
import { useDrag, clamp, getNested, setNested } from "./_shared";
import type { OceanParams } from "@/types/ocean-params";

interface Props {
  prefix: string; // e.g. "windSea"
  params: OceanParams;
  onChange: (p: OceanParams) => void;
}

/**
 * Draw the wave PROFILE and let user grab handles for:
 *  - amplitude (crest height)
 *  - crestSharpness (crest curvature)
 *  - frontSteepness (left face)
 *  - rearSteepness  (right face)
 *  - troughFlatness (trough widening)
 *  - asymmetry      (horizontal lean / plunging)
 */
export function WaveShapeEditor({ prefix, params, onChange }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const W = 360, H = 160, PAD = 16;
  const cx = W / 2, baseY = H - PAD - 10;

  const amp = getNested(params, `${prefix}.amplitude`);          // 0..8 m
  const ampMax = 8;
  const crestSharp = getNested(params, `${prefix}.crestSharpness`); // 0.3..4
  const frontSteep = getNested(params, `${prefix}.frontSteepness`); // 0..2.5
  const rearSteep = getNested(params, `${prefix}.rearSteepness`);   // 0..2.5
  const troughFlat = getNested(params, `${prefix}.troughFlatness`); // 0..1
  const asym = getNested(params, `${prefix}.asymmetry`);            // -1..1

  const ampNorm = clamp(amp / ampMax, 0, 1);
  const peakY = baseY - ampNorm * (baseY - PAD - 12);
  const peakX = cx + asym * 60;

  // Build path
  const path = useMemo(() => {
    const pts: string[] = [];
    const N = 96;
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const x = PAD + t * (W - PAD * 2);
      const u = (x - peakX) / ((W - PAD * 2) / 2);
      // piecewise face stretching
      const face = u < 0 ? Math.min(1, -u * (1 / Math.max(0.05, 1 - frontSteep / 3))) : Math.min(1, u * (1 / Math.max(0.05, 1 - rearSteep / 3)));
      const base = Math.cos(face * Math.PI);
      // crest sharpening + trough flattening
      const shaped = Math.sign(base) * Math.pow(Math.abs(base), 1 / Math.max(0.2, crestSharp));
      const flat = base < 0 ? shaped * (1 - troughFlat * 0.6) : shaped;
      const y = baseY - ((flat + 1) / 2) * (baseY - peakY);
      pts.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return pts.join(" ");
  }, [peakX, peakY, frontSteep, rearSteep, crestSharp, troughFlat, baseY]);

  // Drag handles
  const peakDrag = useDrag((dx, dy) => {
    const newAmp = clamp(ampNorm - dy / (baseY - PAD - 12), 0, 1) * ampMax;
    const newAsym = clamp(asym + dx / 80, -1, 1);
    let np = setNested(params, `${prefix}.amplitude`, newAmp);
    np = setNested(np, `${prefix}.asymmetry`, newAsym);
    onChange(np);
  });

  const frontDrag = useDrag((dx) => {
    onChange(setNested(params, `${prefix}.frontSteepness`, clamp(frontSteep + dx / 80, 0, 2.5)));
  });
  const rearDrag = useDrag((dx) => {
    onChange(setNested(params, `${prefix}.rearSteepness`, clamp(rearSteep - dx / 80, 0, 2.5)));
  });
  const crestDrag = useDrag((_dx, dy) => {
    onChange(setNested(params, `${prefix}.crestSharpness`, clamp(crestSharp - dy / 40, 0.3, 4)));
  });
  const troughDrag = useDrag((_dx, dy) => {
    onChange(setNested(params, `${prefix}.troughFlatness`, clamp(troughFlat + dy / 80, 0, 1)));
  });

  return (
    <div className="editor-canvas p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Wave Profile</span>
        <span className="text-[10px] font-mono text-primary">{prefix}</span>
      </div>
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none touch-none">
        {/* still-water reference line */}
        <line x1={PAD} x2={W - PAD} y1={baseY - ((baseY - peakY) / 2)} y2={baseY - ((baseY - peakY) / 2)}
              stroke="hsl(var(--muted-foreground))" strokeDasharray="2 3" strokeOpacity="0.35" />
        {/* base line (trough floor) */}
        <line x1={PAD} x2={W - PAD} y1={baseY} y2={baseY} stroke="hsl(var(--border))" />
        {/* filled wave */}
        <path d={`${path} L ${W - PAD},${H} L ${PAD},${H} Z`} fill="hsl(var(--primary) / 0.12)" />
        {/* wave stroke */}
        <path d={path} stroke="hsl(var(--primary))" strokeWidth="2" fill="none" />
        {/* handles */}
        <Handle x={peakX} y={peakY} label="A" {...peakDrag} />
        <Handle x={peakX - 50} y={baseY - ((baseY - peakY) * 0.35)} label="F" {...frontDrag} variant="muted" />
        <Handle x={peakX + 50} y={baseY - ((baseY - peakY) * 0.35)} label="R" {...rearDrag} variant="muted" />
        <Handle x={peakX} y={peakY - 14} label="S" {...crestDrag} variant="muted" />
        <Handle x={peakX + 120} y={baseY - 4} label="T" {...troughDrag} variant="muted" />
      </svg>
      <div className="mt-2 grid grid-cols-3 gap-1 text-[9px] font-mono text-muted-foreground">
        <span>A drag = amplitude / lean</span>
        <span>F/R = face steepness</span>
        <span>S = crest sharp · T = trough</span>
      </div>
    </div>
  );
}

function Handle({ x, y, label, onPointerDown, variant = "primary" }: {
  x: number; y: number; label: string;
  onPointerDown: (e: React.PointerEvent) => void;
  variant?: "primary" | "muted";
}) {
  const fill = variant === "primary" ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))";
  return (
    <g onPointerDown={onPointerDown} style={{ cursor: "grab" }}>
      <circle cx={x} cy={y} r={8} fill="hsl(var(--background))" stroke={fill} strokeWidth={1.5} />
      <circle cx={x} cy={y} r={3} fill={fill} />
      <text x={x} y={y - 12} fontSize="8" fontFamily="JetBrains Mono" textAnchor="middle" fill={fill}>{label}</text>
    </g>
  );
}