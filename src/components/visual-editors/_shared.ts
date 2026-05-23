import { useCallback, useEffect, useRef } from "react";

export function useDrag(onMove: (dx: number, dy: number, ev: PointerEvent) => void, onEnd?: () => void) {
  const start = useRef<{ x: number; y: number } | null>(null);
  const onMoveRef = useRef(onMove);
  const onEndRef = useRef(onEnd);
  onMoveRef.current = onMove;
  onEndRef.current = onEnd;

  const onDown = useCallback((e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    start.current = { x: e.clientX, y: e.clientY };
    e.preventDefault();
  }, []);

  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (!start.current) return;
      const dx = e.clientX - start.current.x;
      const dy = e.clientY - start.current.y;
      onMoveRef.current(dx, dy, e);
    };
    const up = () => {
      if (start.current) {
        start.current = null;
        onEndRef.current?.();
      }
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, []);

  return { onPointerDown: onDown };
}

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function getNested(obj: any, path: string): number {
  const parts = path.split(".");
  let v: any = obj;
  for (const p of parts) { if (v == null) return 0; v = v[p]; }
  return typeof v === "number" ? v : 0;
}

export function setNested<T>(obj: T, path: string, value: number): T {
  const parts = path.split(".");
  if (parts.length === 1) return { ...(obj as any), [parts[0]]: value };
  return { ...(obj as any), [parts[0]]: setNested((obj as any)[parts[0]] ?? {}, parts.slice(1).join("."), value) };
}