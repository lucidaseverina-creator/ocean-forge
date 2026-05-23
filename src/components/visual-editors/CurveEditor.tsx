import { useMemo, useRef, useState } from "react";
import { clamp } from "./_shared";

export interface CurvePoint { x: number; y: number; }

interface Props {
  points: CurvePoint[];
  onChange: (pts: CurvePoint[]) => void;
  label?: string;
}

export function CurveEditor({ points, onChange, label }: Props) {
  const W = 360, H = 160, PAD = 14;
  const ref = useRef<SVGSVGElement>(null);
  const [drag, setDrag] = useState<number | null>(null);

  const toScreen = (p: CurvePoint) => ({ x: PAD + p.x * (W - PAD * 2), y: H - PAD - p.y * (H - PAD * 2) });

  const path = useMemo(() => {
    const sorted = [...points].sort((a, b) => a.x - b.x);
    if (!sorted.length) return "";
    const s = sorted.map(toScreen);
    let d = `M ${s[0].x},${s[0].y}`;
    for (let i = 1; i < s.length; i++) {
      const p0 = s[i - 1], p1 = s[i];
      const mx = (p0.x + p1.x) / 2;
      d += ` C ${mx},${p0.y} ${mx},${p1.y} ${p1.x},${p1.y}`;
    }
    return d;
  }, [points]);

  const onMove = (e: React.PointerEvent) => {
    if (drag == null || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = clamp((e.clientX - r.left - PAD * (r.width / W)) / (r.width - PAD * 2 * (r.width / W)), 0, 1);
    const y = clamp(1 - (e.clientY - r.top - PAD * (r.height / H)) / (r.height - PAD * 2 * (r.height / H)), 0, 1);
    onChange(points.map((p, i) => i === drag ? { x, y } : p));
  };

  const addPoint = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = clamp((e.clientX - r.left - PAD * (r.width / W)) / (r.width - PAD * 2 * (r.width / W)), 0, 1);
    const y = clamp(1 - (e.clientY - r.top - PAD * (r.height / H)) / (r.height - PAD * 2 * (r.height / H)), 0, 1);
    onChange([...points, { x, y }]);
  };

  return (
    <div className="editor-canvas p-3" onPointerMove={onMove} onPointerUp={() => setDrag(null)}>
      {label && <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">{label}</div>}
      <svg ref={ref} viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none touch-none" onDoubleClick={addPoint}>
        {[0.25, 0.5, 0.75].map(t => (
          <g key={t} stroke="hsl(var(--border))" strokeOpacity="0.4">
            <line x1={PAD + t * (W - PAD * 2)} x2={PAD + t * (W - PAD * 2)} y1={PAD} y2={H - PAD} />
            <line x1={PAD} x2={W - PAD} y1={PAD + t * (H - PAD * 2)} y2={PAD + t * (H - PAD * 2)} />
          </g>
        ))}
        <rect x={PAD} y={PAD} width={W - PAD * 2} height={H - PAD * 2} fill="none" stroke="hsl(var(--border))" />
        <path d={path} stroke="hsl(var(--primary))" strokeWidth={2} fill="none" />
        {points.map((p, i) => {
          const s = toScreen(p);
          return (
            <g key={i} onPointerDown={(e) => { (e.target as Element).setPointerCapture?.(e.pointerId); setDrag(i); }}
               onDoubleClick={(e) => { e.stopPropagation(); if (points.length > 2) onChange(points.filter((_, idx) => idx !== i)); }}
               style={{ cursor: "grab" }}>
              <circle cx={s.x} cy={s.y} r={6} fill="hsl(var(--background))" stroke="hsl(var(--primary))" strokeWidth={1.5} />
              <circle cx={s.x} cy={s.y} r={2.5} fill="hsl(var(--primary))" />
            </g>
          );
        })}
      </svg>
      <div className="text-[9px] font-mono text-muted-foreground mt-1">Double-click to add · drag to move · double-click point to remove</div>
    </div>
  );
}