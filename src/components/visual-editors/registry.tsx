import type { OceanParams } from "@/types/ocean-params";
import { WaveShapeEditor } from "./WaveShapeEditor";
import { SpectrumEditor } from "./SpectrumEditor";
import { GradientEditor } from "./GradientEditor";
import { CurveEditor } from "./CurveEditor";
import { LightingGizmo } from "./LightingGizmo";
import { setNested, getNested } from "./_shared";

export interface EditorBlock {
  title: string;
  render: (params: OceanParams, onChange: (p: OceanParams) => void) => React.ReactNode;
}

const waveGroupBlocks = (prefix: string): EditorBlock[] => [
  {
    title: "Wave Shape",
    render: (params, onChange) => <WaveShapeEditor prefix={prefix} params={params} onChange={onChange} />,
  },
  {
    title: "Spectrum",
    render: (params, onChange) => <SpectrumEditor prefix={prefix} params={params} onChange={onChange} />,
  },
];

export const sectionEditors: Record<string, EditorBlock[]> = {
  longSwell:      waveGroupBlocks("longSwell"),
  primarySwell:   waveGroupBlocks("primarySwell"),
  secondarySwell: waveGroupBlocks("secondarySwell"),
  crossSwell:     waveGroupBlocks("crossSwell"),
  windSea:        waveGroupBlocks("windSea"),
  chop:           waveGroupBlocks("chop"),
  ripple:         waveGroupBlocks("ripple"),
  microChop:      waveGroupBlocks("microChop"),

  lighting: [
    { title: "Sun Position", render: (p, oc) => <LightingGizmo params={p} onChange={oc} /> },
    {
      title: "Ambient Color",
      render: (p, oc) => {
        const r = getNested(p, "lighting.ambientColorR");
        const g = getNested(p, "lighting.ambientColorG");
        const b = getNested(p, "lighting.ambientColorB");
        const stops = [
          { pos: 0, color: `rgb(${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(b * 255)})` },
          { pos: 1, color: "#ffffff" },
        ];
        return <GradientEditor label="Ambient ↔ Highlight" stops={stops} onChange={(s) => {
          const c = s[0].color.match(/\d+/g) ?? ["0", "0", "0"];
          let np = setNested(p, "lighting.ambientColorR", parseInt(c[0]) / 255);
          np = setNested(np, "lighting.ambientColorG", parseInt(c[1]) / 255);
          np = setNested(np, "lighting.ambientColorB", parseInt(c[2]) / 255);
          oc(np);
        }} />;
      },
    },
  ],

  optics: [
    {
      title: "Water Color (Beer-Lambert)",
      render: (p, oc) => {
        const aR = getNested(p, "optics.absorptionR");
        const aG = getNested(p, "optics.absorptionG");
        const aB = getNested(p, "optics.absorptionB");
        // map absorption to surface color (inverse-ish)
        const surface = `rgb(${Math.round((1 - Math.min(1, aR / 2)) * 200)},${Math.round((1 - Math.min(1, aG)) * 220)},${Math.round((1 - Math.min(1, aB)) * 240)})`;
        const deep = `rgb(${Math.round((1 - aR / 2) * 30)},${Math.round((1 - aG) * 70)},${Math.round((1 - aB) * 110)})`;
        const stops = [
          { pos: 0, color: surface },
          { pos: 1, color: deep },
        ];
        return <GradientEditor label="Surface → Depth" stops={stops} onChange={(s) => {
          const m = s[1].color.match(/\d+/g) ?? ["0", "0", "0"];
          const dR = parseInt(m[0]) / 255, dG = parseInt(m[1]) / 255, dB = parseInt(m[2]) / 255;
          let np = setNested(p, "optics.absorptionR", (1 - dR) * 2);
          np = setNested(np, "optics.absorptionG", 1 - dG);
          np = setNested(np, "optics.absorptionB", 1 - dB);
          oc(np);
        }} />;
      },
    },
  ],

  globalWave: [
    {
      title: "Choppiness → Nonlinearity Response",
      render: (p, oc) => (
        <CurveEditor
          label="Curve drives global wave expression"
          points={[
            { x: 0, y: getNested(p, "globalWave.choppiness") / 2 },
            { x: 0.5, y: getNested(p, "globalWave.peakSharpening") / 3 },
            { x: 1, y: getNested(p, "globalWave.nonlinearity") },
          ]}
          onChange={(pts) => {
            const s = [...pts].sort((a, b) => a.x - b.x);
            let np = setNested(p, "globalWave.choppiness", (s[0]?.y ?? 0) * 2);
            np = setNested(np, "globalWave.peakSharpening", 0.1 + (s[Math.floor(s.length / 2)]?.y ?? 0) * 2.9);
            np = setNested(np, "globalWave.nonlinearity", s[s.length - 1]?.y ?? 0);
            oc(np);
          }}
        />
      ),
    },
  ],
};