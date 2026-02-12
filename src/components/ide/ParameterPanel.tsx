import { Waves, Wind, Droplets, Sun, Eye, Sparkles, Layers, Zap } from "lucide-react";
import { ParamSection } from "./ParamSection";
import { ParamSlider } from "./ParamSlider";
import type { OceanParams } from "@/types/ocean-params";

interface ParameterPanelProps {
  params: OceanParams;
  onChange: (params: OceanParams) => void;
}

export function ParameterPanel({ params, onChange }: ParameterPanelProps) {
  const update = <K extends keyof OceanParams>(
    section: K,
    key: keyof OceanParams[K],
    value: number
  ) => {
    onChange({
      ...params,
      [section]: {
        ...params[section],
        [key]: value,
      },
    });
  };

  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <div className="px-3 py-2 bg-panel-header border-b border-border">
        <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-primary text-glow">
          Inspector
        </h2>
      </div>

      <ParamSection title="Waves" icon={<Waves className="h-3.5 w-3.5" />} badge="L1 Gerstner">
        <ParamSlider label="Amplitude" value={params.waves.amplitude} min={0} max={5} step={0.05} unit="m" onChange={(v) => update("waves", "amplitude", v)} />
        <ParamSlider label="Frequency" value={params.waves.frequency} min={0.1} max={3} step={0.05} unit="Hz" onChange={(v) => update("waves", "frequency", v)} />
        <ParamSlider label="Steepness" value={params.waves.steepness} min={0} max={1} step={0.01} onChange={(v) => update("waves", "steepness", v)} />
        <ParamSlider label="Direction" value={params.waves.direction} min={0} max={360} step={1} unit="°" onChange={(v) => update("waves", "direction", v)} />
        <ParamSlider label="Speed" value={params.waves.speed} min={0.1} max={5} step={0.1} onChange={(v) => update("waves", "speed", v)} />
        <ParamSlider label="Num Waves" value={params.waves.numWaves} min={1} max={8} step={1} onChange={(v) => update("waves", "numWaves", v)} />
      </ParamSection>

      <ParamSection title="Wind" icon={<Wind className="h-3.5 w-3.5" />} badge="Forcing">
        <ParamSlider label="Speed" value={params.wind.speed} min={0} max={30} step={0.5} unit="m/s" onChange={(v) => update("wind", "speed", v)} />
        <ParamSlider label="Direction" value={params.wind.direction} min={0} max={360} step={1} unit="°" onChange={(v) => update("wind", "direction", v)} />
        <ParamSlider label="Gust Intensity" value={params.wind.gustIntensity} min={0} max={1} step={0.01} onChange={(v) => update("wind", "gustIntensity", v)} />
        <ParamSlider label="Fetch Length" value={params.wind.fetchLength} min={1} max={500} step={5} unit="km" onChange={(v) => update("wind", "fetchLength", v)} />
      </ParamSection>

      <ParamSection title="Foam" icon={<Droplets className="h-3.5 w-3.5" />} badge="Multiphase">
        <ParamSlider label="Threshold" value={params.foam.threshold} min={0} max={2} step={0.01} onChange={(v) => update("foam", "threshold", v)} />
        <ParamSlider label="Coverage" value={params.foam.coverage} min={0} max={1} step={0.01} onChange={(v) => update("foam", "coverage", v)} />
        <ParamSlider label="Decay" value={params.foam.decay} min={0.8} max={1} step={0.005} onChange={(v) => update("foam", "decay", v)} />
        <ParamSlider label="Intensity" value={params.foam.intensity} min={0} max={2} step={0.01} onChange={(v) => update("foam", "intensity", v)} />
        <ParamSlider label="Streak Length" value={params.foam.streakLength} min={0} max={10} step={0.1} onChange={(v) => update("foam", "streakLength", v)} />
      </ParamSection>

      <ParamSection title="Optics" icon={<Eye className="h-3.5 w-3.5" />} badge="Beer-Lambert" defaultOpen={false}>
        <ParamSlider label="Absorption R" value={params.optics.absorptionR} min={0} max={1} step={0.005} onChange={(v) => update("optics", "absorptionR", v)} />
        <ParamSlider label="Absorption G" value={params.optics.absorptionG} min={0} max={1} step={0.005} onChange={(v) => update("optics", "absorptionG", v)} />
        <ParamSlider label="Absorption B" value={params.optics.absorptionB} min={0} max={1} step={0.005} onChange={(v) => update("optics", "absorptionB", v)} />
        <ParamSlider label="Scattering" value={params.optics.scattering} min={0} max={1} step={0.01} onChange={(v) => update("optics", "scattering", v)} />
        <ParamSlider label="Turbidity" value={params.optics.turbidity} min={0} max={1} step={0.01} onChange={(v) => update("optics", "turbidity", v)} />
        <ParamSlider label="Fresnel Pow" value={params.optics.fresnelPower} min={1} max={10} step={0.1} onChange={(v) => update("optics", "fresnelPower", v)} />
        <ParamSlider label="IOR" value={params.optics.ior} min={1.0} max={2.0} step={0.001} onChange={(v) => update("optics", "ior", v)} />
      </ParamSection>

      <ParamSection title="Lighting" icon={<Sun className="h-3.5 w-3.5" />} badge="Environment">
        <ParamSlider label="Sun Azimuth" value={params.lighting.sunAzimuth} min={0} max={360} step={1} unit="°" onChange={(v) => update("lighting", "sunAzimuth", v)} />
        <ParamSlider label="Sun Elevation" value={params.lighting.sunElevation} min={-10} max={90} step={1} unit="°" onChange={(v) => update("lighting", "sunElevation", v)} />
        <ParamSlider label="Sun Intensity" value={params.lighting.sunIntensity} min={0} max={5} step={0.05} onChange={(v) => update("lighting", "sunIntensity", v)} />
        <ParamSlider label="Sky Intensity" value={params.lighting.skyIntensity} min={0} max={2} step={0.05} onChange={(v) => update("lighting", "skyIntensity", v)} />
        <ParamSlider label="Ambient" value={params.lighting.ambientIntensity} min={0} max={1} step={0.01} onChange={(v) => update("lighting", "ambientIntensity", v)} />
      </ParamSection>

      <ParamSection title="Capillary" icon={<Sparkles className="h-3.5 w-3.5" />} badge="L0 Micro" defaultOpen={false}>
        <ParamSlider label="Scale" value={params.capillary.scale} min={1} max={100} step={1} onChange={(v) => update("capillary", "scale", v)} />
        <ParamSlider label="Intensity" value={params.capillary.intensity} min={0} max={1} step={0.01} onChange={(v) => update("capillary", "intensity", v)} />
        <ParamSlider label="Wind Align" value={params.capillary.windAlignment} min={0} max={1} step={0.01} onChange={(v) => update("capillary", "windAlignment", v)} />
        <ParamSlider label="Damping" value={params.capillary.damping} min={0.9} max={1} step={0.005} onChange={(v) => update("capillary", "damping", v)} />
      </ParamSection>

      <ParamSection title="Depth" icon={<Layers className="h-3.5 w-3.5" />} badge="Bathymetry" defaultOpen={false}>
        <ParamSlider label="Water Depth" value={params.depth.waterDepth} min={1} max={200} step={1} unit="m" onChange={(v) => update("depth", "waterDepth", v)} />
        <ParamSlider label="Visibility" value={params.depth.visibility} min={1} max={100} step={1} unit="m" onChange={(v) => update("depth", "visibility", v)} />
      </ParamSection>

      <ParamSection title="Caustics" icon={<Zap className="h-3.5 w-3.5" />} badge="Vol VI" defaultOpen={false}>
        <ParamSlider label="Intensity" value={params.caustics.intensity} min={0} max={2} step={0.01} onChange={(v) => update("caustics", "intensity", v)} />
        <ParamSlider label="Scale" value={params.caustics.scale} min={1} max={30} step={0.5} onChange={(v) => update("caustics", "scale", v)} />
        <ParamSlider label="Speed" value={params.caustics.speed} min={0} max={3} step={0.05} onChange={(v) => update("caustics", "speed", v)} />
      </ParamSection>
    </div>
  );
}
