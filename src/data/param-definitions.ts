import type { LucideIcon } from "lucide-react";

export interface ParamDef {
  section: string;
  subSection?: string;
  key: string; // dot-path like "primarySwell.amplitude"
  label: string;
  min: number;
  max: number;
  step: number;
  unit?: string;
}

export interface SectionDef {
  id: string;
  title: string;
  icon: string; // lucide icon name
  badge?: string;
  defaultOpen?: boolean;
}

export const sections: SectionDef[] = [
  { id: "primarySwell", title: "Primary Swell", icon: "Waves", badge: "Group 1", defaultOpen: true },
  { id: "secondarySwell", title: "Secondary Swell", icon: "Waves", badge: "Group 2" },
  { id: "windSea", title: "Wind Sea", icon: "Wind", badge: "Group 3" },
  { id: "chop", title: "Zap", icon: "Zap", badge: "Group 4" },
  { id: "globalWave", title: "Global Wave", icon: "Activity", badge: "Master" },
  { id: "wind", title: "Wind Forcing", icon: "Wind", badge: "Environment" },
  { id: "foam", title: "Foam & Whitecaps", icon: "Droplets", badge: "Multiphase" },
  { id: "optics", title: "Optics & IOR", icon: "Eye", badge: "Beer-Lambert" },
  { id: "lighting", title: "Lighting", icon: "Sun", badge: "PBR" },
  { id: "depth", title: "Depth & Color", icon: "Layers", badge: "Bathymetry" },
  { id: "capillary", title: "Capillary Ripples", icon: "Sparkles", badge: "L0 Micro" },
  { id: "atmosphere", title: "Atmosphere", icon: "Cloud", badge: "Scattering" },
  { id: "detail", title: "FBM & Detail", icon: "Mountain", badge: "Noise" },
  { id: "caustics", title: "Caustics", icon: "Zap", badge: "Vol VI" },
  { id: "surface", title: "Surface", icon: "Palette", badge: "Material" },
  { id: "rain", title: "Rain", icon: "CloudRain", badge: "Weather" },
  { id: "post", title: "Post-Processing", icon: "SlidersHorizontal", badge: "Grade" },
  { id: "animation", title: "Animation", icon: "Timer", badge: "Timing" },
];

// Helper to create wave group params
function waveGroupParams(prefix: string): ParamDef[] {
  return [
    { section: prefix, key: `${prefix}.enabled`, label: "Enabled", min: 0, max: 1, step: 1 },
    { section: prefix, key: `${prefix}.amplitude`, label: "Amplitude", min: 0, max: 8, step: 0.05, unit: "m" },
    { section: prefix, key: `${prefix}.frequency`, label: "Frequency", min: 0.01, max: 5, step: 0.01, unit: "Hz" },
    { section: prefix, key: `${prefix}.steepness`, label: "Steepness", min: 0, max: 1, step: 0.01 },
    { section: prefix, key: `${prefix}.direction`, label: "Direction", min: 0, max: 360, step: 1, unit: "°" },
    { section: prefix, key: `${prefix}.speed`, label: "Speed", min: 0.1, max: 5, step: 0.05 },
    { section: prefix, key: `${prefix}.spread`, label: "Spread Angle", min: 0, max: 180, step: 1, unit: "°" },
    { section: prefix, key: `${prefix}.phaseOffset`, label: "Phase Offset", min: 0, max: 6.28, step: 0.01, unit: "rad" },
    { section: prefix, key: `${prefix}.numWaves`, label: "Sub-Waves", min: 1, max: 8, step: 1 },
    { section: prefix, key: `${prefix}.frequencySpread`, label: "Freq Spread", min: 1.0, max: 3.0, step: 0.05 },
    { section: prefix, key: `${prefix}.amplitudeDecay`, label: "Amp Decay", min: 0.1, max: 1.0, step: 0.01 },
  ];
}

export const paramDefs: ParamDef[] = [
  // ═══ Wave Groups ═══
  ...waveGroupParams("primarySwell"),
  ...waveGroupParams("secondarySwell"),
  ...waveGroupParams("windSea"),
  ...waveGroupParams("chop"),

  // ═══ Global Wave ═══
  { section: "globalWave", key: "globalWave.choppiness", label: "Choppiness", min: 0, max: 2, step: 0.01 },
  { section: "globalWave", key: "globalWave.peakSharpening", label: "Peak Sharp", min: 0.1, max: 3, step: 0.05 },
  { section: "globalWave", key: "globalWave.nonlinearity", label: "Nonlinearity", min: 0, max: 1, step: 0.01 },
  { section: "globalWave", key: "globalWave.timeScale", label: "Time Scale", min: 0.01, max: 5, step: 0.01 },
  { section: "globalWave", key: "globalWave.globalAmplitude", label: "Global Amp", min: 0, max: 5, step: 0.05 },
  { section: "globalWave", key: "globalWave.directionalSpread", label: "Dir Spread", min: 0, max: 3, step: 0.05 },
  { section: "globalWave", key: "globalWave.breakingThreshold", label: "Breaking Thr", min: 0, max: 2, step: 0.01 },
  { section: "globalWave", key: "globalWave.waveEvolution", label: "Evolution", min: 0, max: 1, step: 0.01 },

  // ═══ Wind ═══
  { section: "wind", key: "wind.speed", label: "Speed", min: 0, max: 40, step: 0.5, unit: "m/s" },
  { section: "wind", key: "wind.direction", label: "Direction", min: 0, max: 360, step: 1, unit: "°" },
  { section: "wind", key: "wind.gustIntensity", label: "Gust Intensity", min: 0, max: 1, step: 0.01 },
  { section: "wind", key: "wind.gustFrequency", label: "Gust Freq", min: 0.01, max: 2, step: 0.01, unit: "Hz" },
  { section: "wind", key: "wind.gustSpeed", label: "Gust Speed", min: 0.1, max: 10, step: 0.1 },
  { section: "wind", key: "wind.fetchLength", label: "Fetch Length", min: 1, max: 1000, step: 5, unit: "km" },
  { section: "wind", key: "wind.dragCoefficient", label: "Drag Coeff", min: 0.0001, max: 0.01, step: 0.0001 },
  { section: "wind", key: "wind.turbulence", label: "Turbulence", min: 0, max: 1, step: 0.01 },

  // ═══ Foam ═══
  { section: "foam", key: "foam.threshold", label: "Threshold", min: 0, max: 2, step: 0.01 },
  { section: "foam", key: "foam.coverage", label: "Coverage", min: 0, max: 1, step: 0.01 },
  { section: "foam", key: "foam.decay", label: "Decay", min: 0.8, max: 1, step: 0.005 },
  { section: "foam", key: "foam.intensity", label: "Intensity", min: 0, max: 3, step: 0.01 },
  { section: "foam", key: "foam.colorR", label: "Color R", min: 0, max: 1, step: 0.01 },
  { section: "foam", key: "foam.colorG", label: "Color G", min: 0, max: 1, step: 0.01 },
  { section: "foam", key: "foam.colorB", label: "Color B", min: 0, max: 1, step: 0.01 },
  { section: "foam", key: "foam.streakLength", label: "Streak Length", min: 0, max: 10, step: 0.1 },
  { section: "foam", key: "foam.whitecapThreshold", label: "Whitecap Thr", min: 0, max: 2, step: 0.01 },
  { section: "foam", key: "foam.whitecapIntensity", label: "Whitecap Int", min: 0, max: 2, step: 0.01 },
  { section: "foam", key: "foam.trailPersistence", label: "Trail Persist", min: 0, max: 1, step: 0.01 },
  { section: "foam", key: "foam.edgeFoam", label: "Edge Foam", min: 0, max: 1, step: 0.01 },
  { section: "foam", key: "foam.jacobianThreshold", label: "Jacobian Thr", min: 0, max: 2, step: 0.01 },
  { section: "foam", key: "foam.noiseScale", label: "Noise Scale", min: 0.1, max: 10, step: 0.1 },
  { section: "foam", key: "foam.noiseSpeed", label: "Noise Speed", min: 0, max: 3, step: 0.05 },
  { section: "foam", key: "foam.roughness", label: "Roughness", min: 0, max: 1, step: 0.01 },
  { section: "foam", key: "foam.bubbleDensity", label: "Bubble Density", min: 0, max: 1, step: 0.01 },
  { section: "foam", key: "foam.sprayIntensity", label: "Spray Int", min: 0, max: 1, step: 0.01 },

  // ═══ Optics ═══
  { section: "optics", key: "optics.absorptionR", label: "Absorption R", min: 0, max: 2, step: 0.005 },
  { section: "optics", key: "optics.absorptionG", label: "Absorption G", min: 0, max: 1, step: 0.005 },
  { section: "optics", key: "optics.absorptionB", label: "Absorption B", min: 0, max: 1, step: 0.005 },
  { section: "optics", key: "optics.scatteringCoeff", label: "Scatter Coeff", min: 0, max: 2, step: 0.01 },
  { section: "optics", key: "optics.forwardScatter", label: "Fwd Scatter", min: 0, max: 2, step: 0.01 },
  { section: "optics", key: "optics.backScatter", label: "Back Scatter", min: 0, max: 1, step: 0.01 },
  { section: "optics", key: "optics.turbidity", label: "Turbidity", min: 0, max: 1, step: 0.01 },
  { section: "optics", key: "optics.fresnelPower", label: "Fresnel Power", min: 1, max: 10, step: 0.1 },
  { section: "optics", key: "optics.fresnelBias", label: "Fresnel Bias", min: 0, max: 0.2, step: 0.001 },
  { section: "optics", key: "optics.ior", label: "IOR", min: 1.0, max: 2.0, step: 0.001 },
  { section: "optics", key: "optics.chromaticAberration", label: "Chromatic Ab", min: 0, max: 0.1, step: 0.001 },
  { section: "optics", key: "optics.sssIntensity", label: "SSS Intensity", min: 0, max: 2, step: 0.01 },
  { section: "optics", key: "optics.sssDistortion", label: "SSS Distortion", min: 0, max: 1, step: 0.01 },
  { section: "optics", key: "optics.sssPower", label: "SSS Power", min: 1, max: 10, step: 0.1 },
  { section: "optics", key: "optics.sssColorR", label: "SSS Color R", min: 0, max: 1, step: 0.01 },
  { section: "optics", key: "optics.sssColorG", label: "SSS Color G", min: 0, max: 1, step: 0.01 },
  { section: "optics", key: "optics.sssColorB", label: "SSS Color B", min: 0, max: 1, step: 0.01 },
  { section: "optics", key: "optics.refractionStrength", label: "Refraction", min: 0, max: 1, step: 0.01 },
  { section: "optics", key: "optics.specRoughness", label: "Spec Rough", min: 0.001, max: 0.5, step: 0.001 },
  { section: "optics", key: "optics.specIntensity", label: "Spec Intensity", min: 0, max: 5, step: 0.05 },

  // ═══ Lighting ═══
  { section: "lighting", key: "lighting.sunAzimuth", label: "Sun Azimuth", min: 0, max: 360, step: 1, unit: "°" },
  { section: "lighting", key: "lighting.sunElevation", label: "Sun Elevation", min: -10, max: 90, step: 1, unit: "°" },
  { section: "lighting", key: "lighting.sunIntensity", label: "Sun Intensity", min: 0, max: 5, step: 0.05 },
  { section: "lighting", key: "lighting.sunColorTemp", label: "Sun Color Temp", min: 2000, max: 12000, step: 100, unit: "K" },
  { section: "lighting", key: "lighting.skyIntensity", label: "Sky Intensity", min: 0, max: 3, step: 0.05 },
  { section: "lighting", key: "lighting.skyTurbidity", label: "Sky Turbidity", min: 0.5, max: 10, step: 0.1 },
  { section: "lighting", key: "lighting.ambientIntensity", label: "Ambient Int", min: 0, max: 1, step: 0.01 },
  { section: "lighting", key: "lighting.ambientColorR", label: "Ambient R", min: 0, max: 1, step: 0.01 },
  { section: "lighting", key: "lighting.ambientColorG", label: "Ambient G", min: 0, max: 1, step: 0.01 },
  { section: "lighting", key: "lighting.ambientColorB", label: "Ambient B", min: 0, max: 1, step: 0.01 },
  { section: "lighting", key: "lighting.specRoughness1", label: "Spec Rough 1", min: 0.001, max: 0.2, step: 0.001 },
  { section: "lighting", key: "lighting.specRoughness2", label: "Spec Rough 2", min: 0.01, max: 0.5, step: 0.005 },
  { section: "lighting", key: "lighting.bloomThreshold", label: "Bloom Thr", min: 0, max: 3, step: 0.01 },
  { section: "lighting", key: "lighting.bloomIntensity", label: "Bloom Int", min: 0, max: 2, step: 0.01 },
  { section: "lighting", key: "lighting.godRayIntensity", label: "God Rays", min: 0, max: 1, step: 0.01 },
  { section: "lighting", key: "lighting.godRayDecay", label: "Ray Decay", min: 0.8, max: 1, step: 0.005 },
  { section: "lighting", key: "lighting.moonIntensity", label: "Moon Int", min: 0, max: 2, step: 0.01 },
  { section: "lighting", key: "lighting.exposureBias", label: "Exposure Bias", min: -3, max: 3, step: 0.05, unit: "EV" },

  // ═══ Depth ═══
  { section: "depth", key: "depth.waterDepth", label: "Water Depth", min: 1, max: 500, step: 1, unit: "m" },
  { section: "depth", key: "depth.shallowColorR", label: "Shallow R", min: 0, max: 1, step: 0.01 },
  { section: "depth", key: "depth.shallowColorG", label: "Shallow G", min: 0, max: 1, step: 0.01 },
  { section: "depth", key: "depth.shallowColorB", label: "Shallow B", min: 0, max: 1, step: 0.01 },
  { section: "depth", key: "depth.deepColorR", label: "Deep R", min: 0, max: 1, step: 0.01 },
  { section: "depth", key: "depth.deepColorG", label: "Deep G", min: 0, max: 1, step: 0.01 },
  { section: "depth", key: "depth.deepColorB", label: "Deep B", min: 0, max: 1, step: 0.01 },
  { section: "depth", key: "depth.visibility", label: "Visibility", min: 1, max: 200, step: 1, unit: "m" },
  { section: "depth", key: "depth.extinctionR", label: "Extinction R", min: 0, max: 2, step: 0.01 },
  { section: "depth", key: "depth.extinctionG", label: "Extinction G", min: 0, max: 1, step: 0.01 },
  { section: "depth", key: "depth.extinctionB", label: "Extinction B", min: 0, max: 1, step: 0.01 },
  { section: "depth", key: "depth.gradientPower", label: "Gradient Pow", min: 0.1, max: 3, step: 0.05 },
  { section: "depth", key: "depth.shoreBlend", label: "Shore Blend", min: 0, max: 20, step: 0.5, unit: "m" },
  { section: "depth", key: "depth.depthDarkening", label: "Depth Dark", min: 0, max: 1, step: 0.01 },
  { section: "depth", key: "depth.depthFog", label: "Depth Fog", min: 0, max: 1, step: 0.01 },
  { section: "depth", key: "depth.colorGradientBias", label: "Color Bias", min: 0, max: 1, step: 0.01 },

  // ═══ Capillary ═══
  { section: "capillary", key: "capillary.scale", label: "Scale", min: 1, max: 200, step: 1 },
  { section: "capillary", key: "capillary.intensity", label: "Intensity", min: 0, max: 2, step: 0.01 },
  { section: "capillary", key: "capillary.windAlignment", label: "Wind Align", min: 0, max: 1, step: 0.01 },
  { section: "capillary", key: "capillary.damping", label: "Damping", min: 0.5, max: 1, step: 0.005 },
  { section: "capillary", key: "capillary.frequency1", label: "Freq 1", min: 0.01, max: 1, step: 0.01 },
  { section: "capillary", key: "capillary.frequency2", label: "Freq 2", min: 0.01, max: 1, step: 0.01 },
  { section: "capillary", key: "capillary.frequency3", label: "Freq 3", min: 0.01, max: 1, step: 0.01 },
  { section: "capillary", key: "capillary.frequency4", label: "Freq 4", min: 0.01, max: 1, step: 0.01 },
  { section: "capillary", key: "capillary.amplitude1", label: "Amp 1", min: 0, max: 0.05, step: 0.001 },
  { section: "capillary", key: "capillary.amplitude2", label: "Amp 2", min: 0, max: 0.05, step: 0.001 },
  { section: "capillary", key: "capillary.amplitude3", label: "Amp 3", min: 0, max: 0.05, step: 0.001 },
  { section: "capillary", key: "capillary.amplitude4", label: "Amp 4", min: 0, max: 0.05, step: 0.001 },
  { section: "capillary", key: "capillary.speedMult", label: "Speed Mult", min: 0.1, max: 10, step: 0.1 },
  { section: "capillary", key: "capillary.noiseInfluence", label: "Noise Infl", min: 0, max: 1, step: 0.01 },

  // ═══ Atmosphere ═══
  { section: "atmosphere", key: "atmosphere.fogDensity", label: "Fog Density", min: 0, max: 0.05, step: 0.001 },
  { section: "atmosphere", key: "atmosphere.fogColorR", label: "Fog R", min: 0, max: 0.5, step: 0.005 },
  { section: "atmosphere", key: "atmosphere.fogColorG", label: "Fog G", min: 0, max: 0.5, step: 0.005 },
  { section: "atmosphere", key: "atmosphere.fogColorB", label: "Fog B", min: 0, max: 0.5, step: 0.005 },
  { section: "atmosphere", key: "atmosphere.hazeIntensity", label: "Haze Int", min: 0, max: 1, step: 0.01 },
  { section: "atmosphere", key: "atmosphere.horizonBlend", label: "Horizon Blend", min: 0, max: 1, step: 0.01 },
  { section: "atmosphere", key: "atmosphere.rayleighCoeff", label: "Rayleigh", min: 0, max: 3, step: 0.05 },
  { section: "atmosphere", key: "atmosphere.mieCoeff", label: "Mie Coeff", min: 0, max: 0.05, step: 0.001 },
  { section: "atmosphere", key: "atmosphere.mieDirectional", label: "Mie Dir", min: 0, max: 1, step: 0.01 },
  { section: "atmosphere", key: "atmosphere.skyColorR", label: "Sky R", min: 0, max: 1, step: 0.01 },
  { section: "atmosphere", key: "atmosphere.skyColorG", label: "Sky G", min: 0, max: 1, step: 0.01 },
  { section: "atmosphere", key: "atmosphere.skyColorB", label: "Sky B", min: 0, max: 1, step: 0.01 },
  { section: "atmosphere", key: "atmosphere.horizonColorR", label: "Horizon R", min: 0, max: 1, step: 0.01 },
  { section: "atmosphere", key: "atmosphere.horizonColorG", label: "Horizon G", min: 0, max: 1, step: 0.01 },
  { section: "atmosphere", key: "atmosphere.horizonColorB", label: "Horizon B", min: 0, max: 1, step: 0.01 },
  { section: "atmosphere", key: "atmosphere.cloudCover", label: "Cloud Cover", min: 0, max: 1, step: 0.01 },
  { section: "atmosphere", key: "atmosphere.cloudShadow", label: "Cloud Shadow", min: 0, max: 1, step: 0.01 },

  // ═══ Detail / FBM ═══
  { section: "detail", key: "detail.fbmOctaves", label: "FBM Octaves", min: 0, max: 8, step: 1 },
  { section: "detail", key: "detail.fbmAmplitude", label: "FBM Amplitude", min: 0, max: 2, step: 0.01 },
  { section: "detail", key: "detail.fbmFrequency", label: "FBM Frequency", min: 0.1, max: 5, step: 0.05 },
  { section: "detail", key: "detail.fbmLacunarity", label: "Lacunarity", min: 1, max: 4, step: 0.05 },
  { section: "detail", key: "detail.fbmGain", label: "Gain", min: 0.1, max: 0.9, step: 0.01 },
  { section: "detail", key: "detail.normalStrength", label: "Normal Str", min: 0, max: 3, step: 0.05 },
  { section: "detail", key: "detail.detailDistance", label: "Detail Dist", min: 10, max: 200, step: 5, unit: "m" },
  { section: "detail", key: "detail.domainWarp", label: "Domain Warp", min: 0, max: 1, step: 0.01 },
  { section: "detail", key: "detail.warpStrength", label: "Warp Str", min: 0, max: 2, step: 0.01 },
  { section: "detail", key: "detail.warpFrequency", label: "Warp Freq", min: 0.1, max: 3, step: 0.05 },
  { section: "detail", key: "detail.microNormalIntensity", label: "Micro Normal", min: 0, max: 1, step: 0.01 },
  { section: "detail", key: "detail.microNormalScale", label: "Micro Scale", min: 1, max: 30, step: 0.5 },

  // ═══ Caustics ═══
  { section: "caustics", key: "caustics.enabled", label: "Enabled", min: 0, max: 1, step: 1 },
  { section: "caustics", key: "caustics.intensity", label: "Intensity", min: 0, max: 3, step: 0.01 },
  { section: "caustics", key: "caustics.scale", label: "Scale", min: 1, max: 50, step: 0.5 },
  { section: "caustics", key: "caustics.speed", label: "Speed", min: 0, max: 5, step: 0.05 },
  { section: "caustics", key: "caustics.chromaticSplit", label: "Chromatic", min: 0, max: 0.2, step: 0.005 },
  { section: "caustics", key: "caustics.complexity", label: "Complexity", min: 0.5, max: 5, step: 0.1 },
  { section: "caustics", key: "caustics.depthAttenuation", label: "Depth Atten", min: 0, max: 2, step: 0.01 },
  { section: "caustics", key: "caustics.brightness", label: "Brightness", min: 0, max: 3, step: 0.05 },

  // ═══ Surface ═══
  { section: "surface", key: "surface.normalMapStrength", label: "Normal Str", min: 0, max: 3, step: 0.05 },
  { section: "surface", key: "surface.bumpScale", label: "Bump Scale", min: 0, max: 5, step: 0.05 },
  { section: "surface", key: "surface.reflectionDistortion", label: "Refl Distort", min: 0, max: 0.5, step: 0.005 },
  { section: "surface", key: "surface.refractionDistortion", label: "Refr Distort", min: 0, max: 0.5, step: 0.005 },
  { section: "surface", key: "surface.waveNormalBlend", label: "Wave N Blend", min: 0, max: 1, step: 0.01 },
  { section: "surface", key: "surface.detailNormalScale", label: "Detail N Sc", min: 0.5, max: 20, step: 0.5 },
  { section: "surface", key: "surface.wetness", label: "Wetness", min: 0, max: 1, step: 0.01 },
  { section: "surface", key: "surface.roughnessVariation", label: "Rough Var", min: 0, max: 1, step: 0.01 },
  { section: "surface", key: "surface.surfaceTension", label: "Surface Tens", min: 0, max: 0.2, step: 0.005 },

  // ═══ Rain ═══
  { section: "rain", key: "rain.intensity", label: "Intensity", min: 0, max: 1, step: 0.01 },
  { section: "rain", key: "rain.dropScale", label: "Drop Scale", min: 0.1, max: 5, step: 0.1 },
  { section: "rain", key: "rain.dropSpeed", label: "Drop Speed", min: 0.5, max: 10, step: 0.1 },
  { section: "rain", key: "rain.rippleIntensity", label: "Ripple Int", min: 0, max: 1, step: 0.01 },
  { section: "rain", key: "rain.rippleScale", label: "Ripple Scale", min: 1, max: 50, step: 1 },
  { section: "rain", key: "rain.splashIntensity", label: "Splash Int", min: 0, max: 1, step: 0.01 },

  // ═══ Post-Processing ═══
  { section: "post", key: "post.exposure", label: "Exposure", min: 0.1, max: 5, step: 0.05 },
  { section: "post", key: "post.contrast", label: "Contrast", min: 0.5, max: 2, step: 0.01 },
  { section: "post", key: "post.saturation", label: "Saturation", min: 0, max: 2, step: 0.01 },
  { section: "post", key: "post.vignetteIntensity", label: "Vignette Int", min: 0, max: 1, step: 0.01 },
  { section: "post", key: "post.vignetteRadius", label: "Vignette Rad", min: 0.3, max: 1, step: 0.01 },
  { section: "post", key: "post.gamma", label: "Gamma", min: 1.0, max: 3.0, step: 0.05 },
  { section: "post", key: "post.colorTintR", label: "Tint R", min: 0, max: 2, step: 0.01 },
  { section: "post", key: "post.colorTintG", label: "Tint G", min: 0, max: 2, step: 0.01 },
  { section: "post", key: "post.colorTintB", label: "Tint B", min: 0, max: 2, step: 0.01 },
  { section: "post", key: "post.filmGrain", label: "Film Grain", min: 0, max: 1, step: 0.01 },

  // ═══ Animation ═══
  { section: "animation", key: "animation.timeScale", label: "Time Scale", min: 0, max: 5, step: 0.01 },
  { section: "animation", key: "animation.globalSpeed", label: "Global Speed", min: 0, max: 5, step: 0.05 },
  { section: "animation", key: "animation.phaseRandomization", label: "Phase Rand", min: 0, max: 1, step: 0.01 },
  { section: "animation", key: "animation.gustCycleSpeed", label: "Gust Cycle", min: 0.1, max: 5, step: 0.1 },
  { section: "animation", key: "animation.foamAnimSpeed", label: "Foam Speed", min: 0, max: 3, step: 0.05 },
  { section: "animation", key: "animation.causticAnimSpeed", label: "Caustic Speed", min: 0, max: 3, step: 0.05 },
  { section: "animation", key: "animation.rippleSpeed", label: "Ripple Speed", min: 0, max: 3, step: 0.05 },
];
