import { useMemo } from "react";
import { useDrag, clamp, getNested, setNested } from "./_shared";
import type { OceanParams } from "@/types/ocean-params";

const MODES = [
  { id: 0, name: "Mono",      desc: "Single frequency" },
  { id: 1, name: "P-M",       desc: "Pierson-Moskowitz" },
  { id: 2, name: "JONSWAP",   desc: "Peak-enhanced JONSWAP" },
  { id: 3, name: "Gaussian",  desc: "Gaussian band" },
  { id: 4, name: "TMA",       desc: "Shallow-water TMA" },
  { id: 5, name: "Ochi",      desc: "Ochi-Hubble bimodal" },
  { id: 6, name: "Donelan",   desc: "Donelan-Banner" },
  { id: 7, name: "Power",     desc: "Power-law tail" },
];

interface Props {
  prefix: string;
  params: OceanParams;
  onChange: (p: OceanParams) => void;
}

export function SpectrumEditor({ prefix, params, onChange }: Props) {
  const W = 360, H = 140, PAD = 18;
  const mode = Math.round(getNested(params, `${prefix}.spectrumMode`));
  const peakFreq = getNested(params, `${prefix}.frequency`);   // peak ω
  const gamma = getNested(params, `${prefix}.peakEnhancement`); // 1..7
  const sigma = getNested(params, `${prefix}.spectralWidth`);   // 0.01..0.5

  const fmin = 0.05, fmax = 4.0;
  const peakX = PAD + ((peakFreq - fmin) / (fmax - fmin)) * (W - PAD * 2);

  const points = useMemo(() => {
    const N = 140;
    const arr: { x: number; y: number; w: number }[] = [];
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const w = fmin + t * (fmax - fmin);
      let s = 0;
      const r = w / Math.max(0.01, peakFreq);
      // PM-ish base
      const pm = (1 / (w * w * w * w * w)) * Math.exp(-1.25 / Math.pow(r, 4));
      // JONSWAP peak enhancement
      const sigW = w <= peakFreq ? 0.07 : 0.09;
      const j = Math.pow(gamma, Math.exp(-Math.pow((w - peakFreq), 2) / (2 * sigW * sigW * peakFreq * peakFreq)));
      // Gaussian
      const g = Math.exp(-Math.pow((w - peakFreq) / Math.max(0.01, sigma * peakFreq), 2));
      // Power-tail
      const pw = Math.pow(r, -5) * (r > 1 ? 1 : 0.2);
      switch (mode) {
        case 0: s = Math.exp(-Math.pow((w - peakFreq) * 20, 2)); break; // Mono
        case 1: s = pm; break;
        case 2: s = pm * j; break;          // JONSWAP
        case 3: s = g; break;
        case 4: s = pm * (r < 1 ? 0.5 + 0.5 * r : 1); break; // TMA shallow
        case 5: s = g * 0.7 + Math.exp(-Math.pow((w - peakFreq * 1.6) / Math.max(0.05, sigma * peakFreq), 2)) * 0.5;
                break;
        case 6: s = pm * Math.pow(j, 1.2); break;
        case 7: s = pw; break;
        default: s = pm;
      }
      arr.push({ x: PAD + t * (W - PAD * 2), y: 0, w });
    }
    // normalise
    let max = 0;
    const raw: number[] = [];
    for (let i = 0; i < arr.length; i++) {
      const a = arr[i];
      const w = a.w;
      const r = w / Math.max(0.01, peakFreq);
      const pm = (1 / (w * w * w * w * w)) * Math.exp(-1.25 / Math.pow(r, 4));
      const sigW = w <= peakFreq ? 0.07 : 0.09;
      const j = Math.pow(gamma, Math.exp(-Math.pow((w - peakFreq), 2) / (2 * sigW * sigW * peakFreq * peakFreq)));
      const g = Math.exp(-Math.pow((w - peakFreq) / Math.max(0.01, sigma * peakFreq), 2));
      const pw = Math.pow(r, -5) * (r > 1 ? 1 : 0.2);
      let s = 0;
      switch (mode) {
        case 0: s = Math.exp(-Math.pow((w - peakFreq) * 20, 2)); break;
        case 1: s = pm; break;
        case 2: s = pm * j; break;
        case 3: s = g; break;
        case 4: s = pm * (r < 1 ? 0.5 + 0.5 * r : 1); break;
        case 5: s = g * 0.7 + Math.exp(-Math.pow((w - peakFreq * 1.6) / Math.max(0.05, sigma * peakFreq), 2)) * 0.5; break;
        case 6: s = pm * Math.pow(j, 1.2); break;
        case 7: s = pw; break;
      }
      raw.push(s);
      if (s > max) max = s;
    }
    for (let i = 0; i < arr.length; i++) {
      arr[i].y = H - PAD - (raw[i] / (max || 1)) * (H - PAD * 2);
    }
    return arr;
  }, [mode, peakFreq, gamma, sigma]);

  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

  const peakDrag = useDrag((dx, dy) => {
    const ratio = dx / (W - PAD * 2);
    const newFreq = clamp(peakFreq + ratio * (fmax - fmin), 0.05, fmax);
    const newGamma = clamp(gamma - dy / 30, 1, 7);
    let np = setNested(params, `${prefix}.frequency`, newFreq);
    np = setNested(np, `${prefix}.peakEnhancement`, newGamma);
    onChange(np);
  });

  const widthDrag = useDrag((dx) => {
    onChange(setNested(params, `${prefix}.spectralWidth`, clamp(sigma + dx / 400, 0.01, 0.5)));
  });

  return (
    <div className="editor-canvas p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Energy Spectrum S(ω)</span>
        <span className="text-[10px] font-mono text-primary">{MODES[mode]?.name ?? "?"}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none touch-none">
        {/* grid */}
        {[0.25, 0.5, 0.75].map(t => (
          <line key={t} x1={PAD} x2={W - PAD} y1={PAD + t * (H - PAD * 2)} y2={PAD + t * (H - PAD * 2)}
                stroke="hsl(var(--border))" strokeOpacity="0.4" />
        ))}
        <line x1={PAD} x2={W - PAD} y1={H - PAD} y2={H - PAD} stroke="hsl(var(--muted-foreground))" />
        <path d={`${path} L ${W - PAD},${H - PAD} L ${PAD},${H - PAD} Z`} fill="hsl(var(--primary) / 0.18)" />
        <path d={path} stroke="hsl(var(--primary))" strokeWidth={1.6} fill="none" />
        {/* peak handle */}
        <g onPointerDown={peakDrag.onPointerDown} style={{ cursor: "grab" }}>
          <line x1={peakX} x2={peakX} y1={PAD} y2={H - PAD} stroke="hsl(var(--accent))" strokeOpacity="0.35" />
          <circle cx={peakX} cy={PAD + 6} r={6} fill="hsl(var(--background))" stroke="hsl(var(--primary))" strokeWidth={1.5} />
          <text x={peakX} y={PAD + 3} fontSize="7" textAnchor="middle" fill="hsl(var(--primary))" fontFamily="JetBrains Mono">γ {gamma.toFixed(1)}</text>
        </g>
        {/* width handle */}
        <g onPointerDown={widthDrag.onPointerDown} style={{ cursor: "ew-resize" }}>
          <rect x={peakX + 20} y={H - PAD - 12} width={14} height={10} rx={2}
                fill="hsl(var(--muted))" stroke="hsl(var(--muted-foreground))" />
          <text x={peakX + 27} y={H - PAD - 4} fontSize="7" textAnchor="middle" fill="hsl(var(--muted-foreground))" fontFamily="JetBrains Mono">σ</text>
        </g>
      </svg>
      <div className="mt-2 grid grid-cols-4 gap-1">
        {MODES.map(m => (
          <button key={m.id}
            onClick={() => onChange(setNested(params, `${prefix}.spectrumMode`, m.id))}
            title={m.desc}
            className={`px-1 py-0.5 text-[9px] font-mono rounded-sm transition-colors ${
              mode === m.id ? "skeuo-chassis text-primary" : "bg-muted/40 text-muted-foreground hover:text-foreground"
            }`}>{m.name}</button>
        ))}
      </div>
    </div>
  );
}