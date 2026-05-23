import { useCallback, useRef, useState } from "react";
import { clamp } from "./_shared";

export interface GradientStop { pos: number; color: string; }

interface Props {
  stops: GradientStop[];
  onChange: (stops: GradientStop[]) => void;
  height?: number;
  label?: string;
}

export function GradientEditor({ stops, onChange, height = 36, label }: Props) {
  const barRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<number | null>(null);

  const cssGrad = `linear-gradient(90deg, ${[...stops].sort((a, b) => a.pos - b.pos).map(s => `${s.color} ${s.pos * 100}%`).join(", ")})`;

  const onPointerDown = useCallback((i: number) => (e: React.PointerEvent) => {
    e.stopPropagation();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    setDrag(i);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (drag == null || !barRef.current) return;
    const r = barRef.current.getBoundingClientRect();
    const p = clamp((e.clientX - r.left) / r.width, 0, 1);
    onChange(stops.map((s, i) => i === drag ? { ...s, pos: p } : s));
  }, [drag, stops, onChange]);

  const onPointerUp = useCallback(() => setDrag(null), []);

  const addStop = (e: React.MouseEvent) => {
    if (!barRef.current) return;
    const r = barRef.current.getBoundingClientRect();
    const p = clamp((e.clientX - r.left) / r.width, 0, 1);
    onChange([...stops, { pos: p, color: stops[stops.length - 1]?.color ?? "#ffffff" }]);
  };

  const removeStop = (i: number) => {
    if (stops.length <= 2) return;
    onChange(stops.filter((_, idx) => idx !== i));
  };

  return (
    <div className="editor-canvas p-3" onPointerMove={onPointerMove} onPointerUp={onPointerUp}>
      {label && <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">{label}</div>}
      <div
        ref={barRef}
        onDoubleClick={addStop}
        className="relative w-full rounded-md border border-border cursor-copy"
        style={{ height, background: cssGrad, boxShadow: "inset 0 1px 3px hsl(0 0% 0% / 0.6)" }}
      >
        {stops.map((s, i) => (
          <div key={i}
            onPointerDown={onPointerDown(i)}
            onDoubleClick={(e) => { e.stopPropagation(); removeStop(i); }}
            className="absolute top-0 -translate-x-1/2 -translate-y-1 h-[calc(100%+8px)] flex flex-col items-center"
            style={{ left: `${s.pos * 100}%` }}
            title={`${s.color} @ ${(s.pos * 100).toFixed(0)}%`}
          >
            <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-b-[6px] border-l-transparent border-r-transparent border-b-primary" />
            <div className="w-3 h-full skeuo-puck rounded-sm border border-background" style={{ background: s.color }} />
            <input type="color" value={s.color}
              onChange={(e) => onChange(stops.map((x, idx) => idx === i ? { ...x, color: e.target.value } : x))}
              className="absolute inset-0 opacity-0 cursor-pointer" />
          </div>
        ))}
      </div>
      <div className="mt-2 text-[9px] font-mono text-muted-foreground">Double-click bar to add · drag handle · double-click handle to remove · click swatch to recolor</div>
    </div>
  );
}