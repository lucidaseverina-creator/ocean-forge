import { useRef } from "react";
import { clamp, getNested, setNested } from "./_shared";
import type { OceanParams } from "@/types/ocean-params";

interface Props {
  params: OceanParams;
  onChange: (p: OceanParams) => void;
}

/** Drag-the-sun on a sky dome (azimuth = horizontal, elevation = vertical). */
export function LightingGizmo({ params, onChange }: Props) {
  const W = 320, H = 200;
  const ref = useRef<SVGSVGElement>(null);
  const az = getNested(params, "lighting.sunAzimuth");
  const el = getNested(params, "lighting.sunElevation");
  const intensity = getNested(params, "lighting.sunIntensity");

  // Map az (0..360) → x; el (-10..90) → y inverted
  const sx = (az / 360) * W;
  const sy = H - ((el + 10) / 100) * H;

  const onDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    const move = (ev: PointerEvent) => {
      if (!ref.current) return;
      const r = ref.current.getBoundingClientRect();
      const x = clamp((ev.clientX - r.left) / r.width, 0, 1);
      const y = clamp((ev.clientY - r.top) / r.height, 0, 1);
      let np = setNested(params, "lighting.sunAzimuth", x * 360);
      np = setNested(np, "lighting.sunElevation", (1 - y) * 100 - 10);
      onChange(np);
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const skyHue = clamp(220 - (el / 90) * 40, 180, 230);
  return (
    <div className="editor-canvas p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Sun Position</span>
        <span className="text-[10px] font-mono text-primary">az {az.toFixed(0)}° · el {el.toFixed(0)}°</span>
      </div>
      <svg ref={ref} viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none touch-none">
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={`hsl(${skyHue} 60% ${20 + el / 4}%)`} />
            <stop offset="100%" stopColor={`hsl(${skyHue - 20} 30% 8%)`} />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width={W} height={H} fill="url(#sky)" rx="6" />
        {/* horizon */}
        <line x1="0" x2={W} y1={H * 0.9} y2={H * 0.9} stroke="hsl(var(--muted-foreground))" strokeOpacity="0.4" />
        {/* cardinal markers */}
        {["N", "E", "S", "W"].map((c, i) => (
          <text key={c} x={(i / 4) * W + W / 8} y={H - 4} fontSize="9" textAnchor="middle"
                fontFamily="JetBrains Mono" fill="hsl(var(--muted-foreground))">{c}</text>
        ))}
        {/* sun */}
        <g onPointerDown={onDown} style={{ cursor: "grab" }}>
          <circle cx={sx} cy={sy} r={20} fill={`hsl(50 100% 70% / ${0.15 + intensity * 0.1})`} />
          <circle cx={sx} cy={sy} r={10} fill="hsl(48 100% 70%)" stroke="hsl(40 100% 50%)" strokeWidth={1.5} />
        </g>
      </svg>
    </div>
  );
}