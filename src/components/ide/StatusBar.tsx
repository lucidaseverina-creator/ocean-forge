import { useEffect, useState } from "react";
import { Activity, Cpu, Layers, Waves, Zap } from "lucide-react";
import type { OceanParams } from "@/types/ocean-params";
import { paramDefs } from "@/data/param-definitions";

interface StatusBarProps {
  params: OceanParams;
}

export function StatusBar({ params }: StatusBarProps) {
  const [fps, setFps] = useState(60);
  const [frameTime, setFrameTime] = useState(16.67);

  useEffect(() => {
    let lastTime = performance.now();
    let frames = 0;
    let handle: number;

    const loop = () => {
      frames++;
      const now = performance.now();
      if (now - lastTime >= 1000) {
        setFps(frames);
        setFrameTime(1000 / frames);
        frames = 0;
        lastTime = now;
      }
      handle = requestAnimationFrame(loop);
    };
    handle = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(handle);
  }, []);

  const vertCount = 301 * 301;
  const triCount = 300 * 300 * 2;
  const totalWaves = [params.primarySwell, params.secondarySwell, params.windSea, params.chop]
    .filter((g) => g.enabled > 0.5)
    .reduce((sum, g) => sum + g.numWaves, 0);

  return (
    <div className="h-6 bg-status-bar border-t border-border flex items-center px-3 gap-4 text-[10px] font-mono text-status-text select-none">
      <span className="flex items-center gap-1">
        <Activity className="h-3 w-3 text-primary" />
        {fps} FPS
      </span>
      <span className="flex items-center gap-1">
        <Cpu className="h-3 w-3" />
        {frameTime.toFixed(1)}ms
      </span>
      <span className="flex items-center gap-1">
        <Layers className="h-3 w-3" />
        {(triCount / 1000).toFixed(0)}K tris
      </span>
      <span className="flex items-center gap-1">
        <Waves className="h-3 w-3" />
        {totalWaves} waves + FBM
      </span>
      <span className="flex items-center gap-1">
        <Zap className="h-3 w-3" />
        {paramDefs.length} params
      </span>
      <span className="ml-auto flex items-center gap-1 text-primary">
        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-glow-pulse" />
        OCEAN ENGINE v2.0
      </span>
    </div>
  );
}
