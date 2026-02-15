// ═══════════════════════════════════════════════════════════════
// OCEAN ENGINE — Complete Parameter System (200+ parameters)
// ═══════════════════════════════════════════════════════════════

export interface WaveGroupParams {
  enabled: number; // 0 or 1
  amplitude: number;
  frequency: number;
  steepness: number;
  direction: number;
  speed: number;
  spread: number;
  phaseOffset: number;
  numWaves: number;
  frequencySpread: number;
  amplitudeDecay: number;
}

export interface GlobalWaveParams {
  choppiness: number;
  peakSharpening: number;
  nonlinearity: number;
  timeScale: number;
  globalAmplitude: number;
  directionalSpread: number;
  breakingThreshold: number;
  waveEvolution: number;
}

export interface WindParams {
  speed: number;
  direction: number;
  gustIntensity: number;
  gustFrequency: number;
  gustSpeed: number;
  fetchLength: number;
  dragCoefficient: number;
  turbulence: number;
}

export interface FoamParams {
  threshold: number;
  coverage: number;
  decay: number;
  intensity: number;
  colorR: number;
  colorG: number;
  colorB: number;
  streakLength: number;
  whitecapThreshold: number;
  whitecapIntensity: number;
  trailPersistence: number;
  edgeFoam: number;
  jacobianThreshold: number;
  noiseScale: number;
  noiseSpeed: number;
  roughness: number;
  bubbleDensity: number;
  sprayIntensity: number;
}

export interface OpticsParams {
  absorptionR: number;
  absorptionG: number;
  absorptionB: number;
  scatteringCoeff: number;
  forwardScatter: number;
  backScatter: number;
  turbidity: number;
  fresnelPower: number;
  fresnelBias: number;
  ior: number;
  chromaticAberration: number;
  sssIntensity: number;
  sssDistortion: number;
  sssPower: number;
  sssColorR: number;
  sssColorG: number;
  sssColorB: number;
  refractionStrength: number;
  specRoughness: number;
  specIntensity: number;
}

export interface LightingParams {
  sunAzimuth: number;
  sunElevation: number;
  sunIntensity: number;
  sunColorTemp: number;
  skyIntensity: number;
  skyTurbidity: number;
  ambientIntensity: number;
  ambientColorR: number;
  ambientColorG: number;
  ambientColorB: number;
  specRoughness1: number;
  specRoughness2: number;
  bloomThreshold: number;
  bloomIntensity: number;
  godRayIntensity: number;
  godRayDecay: number;
  moonIntensity: number;
  exposureBias: number;
}

export interface DepthParams {
  waterDepth: number;
  shallowColorR: number;
  shallowColorG: number;
  shallowColorB: number;
  deepColorR: number;
  deepColorG: number;
  deepColorB: number;
  visibility: number;
  extinctionR: number;
  extinctionG: number;
  extinctionB: number;
  gradientPower: number;
  shoreBlend: number;
  depthDarkening: number;
  depthFog: number;
  colorGradientBias: number;
}

export interface CapillaryParams {
  scale: number;
  intensity: number;
  windAlignment: number;
  damping: number;
  frequency1: number;
  frequency2: number;
  frequency3: number;
  frequency4: number;
  amplitude1: number;
  amplitude2: number;
  amplitude3: number;
  amplitude4: number;
  speedMult: number;
  noiseInfluence: number;
}

export interface AtmosphereParams {
  fogDensity: number;
  fogColorR: number;
  fogColorG: number;
  fogColorB: number;
  hazeIntensity: number;
  horizonBlend: number;
  rayleighCoeff: number;
  mieCoeff: number;
  mieDirectional: number;
  skyColorR: number;
  skyColorG: number;
  skyColorB: number;
  horizonColorR: number;
  horizonColorG: number;
  horizonColorB: number;
  cloudCover: number;
  cloudShadow: number;
}

export interface DetailParams {
  fbmOctaves: number;
  fbmAmplitude: number;
  fbmFrequency: number;
  fbmLacunarity: number;
  fbmGain: number;
  normalStrength: number;
  detailDistance: number;
  domainWarp: number;
  warpStrength: number;
  warpFrequency: number;
  microNormalIntensity: number;
  microNormalScale: number;
}

export interface CausticsParams {
  enabled: number;
  intensity: number;
  scale: number;
  speed: number;
  chromaticSplit: number;
  complexity: number;
  depthAttenuation: number;
  brightness: number;
}

export interface SurfaceParams {
  normalMapStrength: number;
  bumpScale: number;
  reflectionDistortion: number;
  refractionDistortion: number;
  waveNormalBlend: number;
  detailNormalScale: number;
  wetness: number;
  roughnessVariation: number;
  surfaceTension: number;
}

export interface RainParams {
  intensity: number;
  dropScale: number;
  dropSpeed: number;
  rippleIntensity: number;
  rippleScale: number;
  splashIntensity: number;
}

export interface PostParams {
  exposure: number;
  contrast: number;
  saturation: number;
  vignetteIntensity: number;
  vignetteRadius: number;
  gamma: number;
  colorTintR: number;
  colorTintG: number;
  colorTintB: number;
  filmGrain: number;
}

export interface AnimationParams {
  timeScale: number;
  globalSpeed: number;
  phaseRandomization: number;
  gustCycleSpeed: number;
  foamAnimSpeed: number;
  causticAnimSpeed: number;
  rippleSpeed: number;
}

export interface OceanParams {
  primarySwell: WaveGroupParams;
  secondarySwell: WaveGroupParams;
  windSea: WaveGroupParams;
  chop: WaveGroupParams;
  globalWave: GlobalWaveParams;
  wind: WindParams;
  foam: FoamParams;
  optics: OpticsParams;
  lighting: LightingParams;
  depth: DepthParams;
  capillary: CapillaryParams;
  atmosphere: AtmosphereParams;
  detail: DetailParams;
  caustics: CausticsParams;
  surface: SurfaceParams;
  rain: RainParams;
  post: PostParams;
  animation: AnimationParams;
}

export const defaultOceanParams: OceanParams = {
  primarySwell: {
    enabled: 1,
    amplitude: 1.2,
    frequency: 0.35,
    steepness: 0.45,
    direction: 45,
    speed: 1.0,
    spread: 25,
    phaseOffset: 0,
    numWaves: 6,
    frequencySpread: 1.3,
    amplitudeDecay: 0.72,
  },
  secondarySwell: {
    enabled: 1,
    amplitude: 0.6,
    frequency: 0.55,
    steepness: 0.35,
    direction: 120,
    speed: 0.9,
    spread: 35,
    phaseOffset: 1.2,
    numWaves: 5,
    frequencySpread: 1.4,
    amplitudeDecay: 0.65,
  },
  windSea: {
    enabled: 1,
    amplitude: 0.4,
    frequency: 1.2,
    steepness: 0.3,
    direction: 60,
    speed: 1.3,
    spread: 55,
    phaseOffset: 2.8,
    numWaves: 6,
    frequencySpread: 1.5,
    amplitudeDecay: 0.6,
  },
  chop: {
    enabled: 1,
    amplitude: 0.15,
    frequency: 2.5,
    steepness: 0.2,
    direction: 75,
    speed: 1.5,
    spread: 90,
    phaseOffset: 4.1,
    numWaves: 8,
    frequencySpread: 1.6,
    amplitudeDecay: 0.55,
  },
  globalWave: {
    choppiness: 0.6,
    peakSharpening: 1.0,
    nonlinearity: 0.3,
    timeScale: 1.0,
    globalAmplitude: 1.0,
    directionalSpread: 1.0,
    breakingThreshold: 0.85,
    waveEvolution: 0.1,
  },
  wind: {
    speed: 8.0,
    direction: 55,
    gustIntensity: 0.3,
    gustFrequency: 0.15,
    gustSpeed: 2.0,
    fetchLength: 100,
    dragCoefficient: 0.0015,
    turbulence: 0.2,
  },
  foam: {
    threshold: 0.5,
    coverage: 0.35,
    decay: 0.96,
    intensity: 0.9,
    colorR: 0.88,
    colorG: 0.92,
    colorB: 0.95,
    streakLength: 2.5,
    whitecapThreshold: 0.7,
    whitecapIntensity: 1.0,
    trailPersistence: 0.8,
    edgeFoam: 0.3,
    jacobianThreshold: 0.4,
    noiseScale: 1.5,
    noiseSpeed: 0.3,
    roughness: 0.6,
    bubbleDensity: 0.4,
    sprayIntensity: 0.2,
  },
  optics: {
    absorptionR: 0.45,
    absorptionG: 0.029,
    absorptionB: 0.018,
    scatteringCoeff: 0.2,
    forwardScatter: 0.7,
    backScatter: 0.15,
    turbidity: 0.1,
    fresnelPower: 5.0,
    fresnelBias: 0.02,
    ior: 1.333,
    chromaticAberration: 0.01,
    sssIntensity: 0.3,
    sssDistortion: 0.3,
    sssPower: 4.0,
    sssColorR: 0.05,
    sssColorG: 0.65,
    sssColorB: 0.5,
    refractionStrength: 0.1,
    specRoughness: 0.03,
    specIntensity: 1.2,
  },
  lighting: {
    sunAzimuth: 180,
    sunElevation: 35,
    sunIntensity: 1.5,
    sunColorTemp: 5500,
    skyIntensity: 0.5,
    skyTurbidity: 2.0,
    ambientIntensity: 0.15,
    ambientColorR: 0.15,
    ambientColorG: 0.18,
    ambientColorB: 0.25,
    specRoughness1: 0.015,
    specRoughness2: 0.12,
    bloomThreshold: 0.8,
    bloomIntensity: 0.3,
    godRayIntensity: 0.15,
    godRayDecay: 0.96,
    moonIntensity: 0.0,
    exposureBias: 0.0,
  },
  depth: {
    waterDepth: 50,
    shallowColorR: 0.1,
    shallowColorG: 0.6,
    shallowColorB: 0.6,
    deepColorR: 0.0,
    deepColorG: 0.08,
    deepColorB: 0.25,
    visibility: 30,
    extinctionR: 0.4,
    extinctionG: 0.04,
    extinctionB: 0.02,
    gradientPower: 0.5,
    shoreBlend: 5.0,
    depthDarkening: 0.3,
    depthFog: 0.1,
    colorGradientBias: 0.5,
  },
  capillary: {
    scale: 40.0,
    intensity: 0.35,
    windAlignment: 0.7,
    damping: 0.98,
    frequency1: 0.15,
    frequency2: 0.23,
    frequency3: 0.31,
    frequency4: 0.39,
    amplitude1: 0.006,
    amplitude2: 0.004,
    amplitude3: 0.003,
    amplitude4: 0.002,
    speedMult: 2.5,
    noiseInfluence: 0.1,
  },
  atmosphere: {
    fogDensity: 0.007,
    fogColorR: 0.035,
    fogColorG: 0.05,
    fogColorB: 0.09,
    hazeIntensity: 0.2,
    horizonBlend: 0.3,
    rayleighCoeff: 1.0,
    mieCoeff: 0.005,
    mieDirectional: 0.8,
    skyColorR: 0.08,
    skyColorG: 0.18,
    skyColorB: 0.45,
    horizonColorR: 0.55,
    horizonColorG: 0.65,
    horizonColorB: 0.78,
    cloudCover: 0.0,
    cloudShadow: 0.3,
  },
  detail: {
    fbmOctaves: 4,
    fbmAmplitude: 0.15,
    fbmFrequency: 0.8,
    fbmLacunarity: 2.1,
    fbmGain: 0.45,
    normalStrength: 1.0,
    detailDistance: 80,
    domainWarp: 0.2,
    warpStrength: 0.3,
    warpFrequency: 0.5,
    microNormalIntensity: 0.4,
    microNormalScale: 8.0,
  },
  caustics: {
    enabled: 1,
    intensity: 0.5,
    scale: 8.0,
    speed: 0.8,
    chromaticSplit: 0.02,
    complexity: 2.0,
    depthAttenuation: 0.5,
    brightness: 1.0,
  },
  surface: {
    normalMapStrength: 1.0,
    bumpScale: 1.0,
    reflectionDistortion: 0.1,
    refractionDistortion: 0.05,
    waveNormalBlend: 0.5,
    detailNormalScale: 4.0,
    wetness: 0.8,
    roughnessVariation: 0.2,
    surfaceTension: 0.07,
  },
  rain: {
    intensity: 0.0,
    dropScale: 1.0,
    dropSpeed: 3.0,
    rippleIntensity: 0.3,
    rippleScale: 15.0,
    splashIntensity: 0.2,
  },
  post: {
    exposure: 1.0,
    contrast: 1.0,
    saturation: 1.0,
    vignetteIntensity: 0.0,
    vignetteRadius: 0.8,
    gamma: 2.2,
    colorTintR: 1.0,
    colorTintG: 1.0,
    colorTintB: 1.0,
    filmGrain: 0.0,
  },
  animation: {
    timeScale: 1.0,
    globalSpeed: 1.0,
    phaseRandomization: 0.5,
    gustCycleSpeed: 1.0,
    foamAnimSpeed: 1.0,
    causticAnimSpeed: 1.0,
    rippleSpeed: 1.0,
  },
};
