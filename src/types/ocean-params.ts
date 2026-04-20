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
  // ── Spectrum & shape (advanced) ────────────────────────────
  spectrumMode: number;        // 0=Mono, 1=Pierson-Moskowitz, 2=JONSWAP, 3=Gaussian, 4=TMA, 5=Ochi-Hubble, 6=Donelan-Banner, 7=Power
  peakEnhancement: number;     // JONSWAP gamma (1..7)
  spectralWidth: number;       // sigma for Gaussian / Ochi
  fetchKm: number;             // wind fetch (km) for PM/JONSWAP
  frontSteepness: number;      // 0..2 — sharpness of leading face
  rearSteepness: number;       // 0..2 — sharpness of trailing face
  crestSharpness: number;      // 1=sine, >1 sharpens crests, <1 rounds
  troughFlatness: number;      // 0..1 flattens troughs (Stokes-like)
  asymmetry: number;           // -1..1 horizontal lean (plunging)
  directionalExponent: number; // cos^N spreading; higher=narrower beam
  frequencyJitter: number;     // 0..1 per sub-wave freq noise
  amplitudeJitter: number;     // 0..1 per sub-wave amp noise
  directionJitter: number;     // 0..1 per sub-wave dir noise (radians scale)
  phaseJitter: number;         // 0..1 random phase mix
  spatialJitter: number;       // 0..1 break grid via domain warp on wave coords
  spatialJitterScale: number;  // scale of the spatial warp noise
  waveAge: number;             // 0=young/sharp, 1=mature/round
  groupSpeedMod: number;       // dispersion modifier (deep=1, shallow<1)
  obliquity: number;           // skews crest lines for plunging breakers
  wavelengthMin: number;       // m — overrides freq if >0
  wavelengthMax: number;       // m — overrides freq if >0
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
  antiGridJitter: number;       // global break-the-grid intensity
  antiGridScale: number;
  spectrumBlend: number;        // 0..1 blend mono vs spectrum amplitudes
  stokes3Order: number;         // 3rd-order Stokes amount
  swellAging: number;           // global age multiplier
  crestRounding: number;        // global mature-swell rounding
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
  longSwell: WaveGroupParams;
  primarySwell: WaveGroupParams;
  secondarySwell: WaveGroupParams;
  crossSwell: WaveGroupParams;
  windSea: WaveGroupParams;
  chop: WaveGroupParams;
  ripple: WaveGroupParams;
  microChop: WaveGroupParams;
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
    frequency: 0.12,
    steepness: 0.15,
    direction: 225,
    speed: 0.8,
    spread: 35,
    phaseOffset: 0,
    numWaves: 6,
    frequencySpread: 1.25,
    amplitudeDecay: 0.78,
  },
  secondarySwell: {
    enabled: 1,
    amplitude: 0.6,
    frequency: 0.18,
    steepness: 0.12,
    direction: 310,
    speed: 0.7,
    spread: 45,
    phaseOffset: 1.8,
    numWaves: 5,
    frequencySpread: 1.35,
    amplitudeDecay: 0.7,
  },
  windSea: {
    enabled: 1,
    amplitude: 0.3,
    frequency: 0.45,
    steepness: 0.1,
    direction: 200,
    speed: 1.1,
    spread: 65,
    phaseOffset: 3.2,
    numWaves: 7,
    frequencySpread: 1.45,
    amplitudeDecay: 0.62,
  },
  chop: {
    enabled: 1,
    amplitude: 0.1,
    frequency: 1.2,
    steepness: 0.06,
    direction: 190,
    speed: 1.4,
    spread: 100,
    phaseOffset: 5.0,
    numWaves: 8,
    frequencySpread: 1.55,
    amplitudeDecay: 0.5,
  },
  globalWave: {
    choppiness: 0.4,
    peakSharpening: 1.2,
    nonlinearity: 0.15,
    timeScale: 1.0,
    globalAmplitude: 1.0,
    directionalSpread: 1.0,
    breakingThreshold: 0.85,
    waveEvolution: 0.1,
  },
  wind: {
    speed: 10.0,
    direction: 210,
    gustIntensity: 0.25,
    gustFrequency: 0.12,
    gustSpeed: 2.0,
    fetchLength: 200,
    dragCoefficient: 0.0015,
    turbulence: 0.15,
  },
  foam: {
    threshold: 0.45,
    coverage: 0.3,
    decay: 0.96,
    intensity: 0.85,
    colorR: 0.92,
    colorG: 0.95,
    colorB: 0.98,
    streakLength: 2.5,
    whitecapThreshold: 0.6,
    whitecapIntensity: 0.8,
    trailPersistence: 0.8,
    edgeFoam: 0.25,
    jacobianThreshold: 0.35,
    noiseScale: 1.2,
    noiseSpeed: 0.25,
    roughness: 0.6,
    bubbleDensity: 0.35,
    sprayIntensity: 0.2,
  },
  optics: {
    absorptionR: 0.45,
    absorptionG: 0.035,
    absorptionB: 0.022,
    scatteringCoeff: 0.25,
    forwardScatter: 0.75,
    backScatter: 0.12,
    turbidity: 0.05,
    fresnelPower: 5.0,
    fresnelBias: 0.02,
    ior: 1.333,
    chromaticAberration: 0.01,
    sssIntensity: 0.45,
    sssDistortion: 0.25,
    sssPower: 3.5,
    sssColorR: 0.05,
    sssColorG: 0.7,
    sssColorB: 0.55,
    refractionStrength: 0.1,
    specRoughness: 0.02,
    specIntensity: 1.5,
  },
  lighting: {
    sunAzimuth: 220,
    sunElevation: 25,
    sunIntensity: 2.0,
    sunColorTemp: 5200,
    skyIntensity: 0.6,
    skyTurbidity: 2.5,
    ambientIntensity: 0.2,
    ambientColorR: 0.12,
    ambientColorG: 0.16,
    ambientColorB: 0.28,
    specRoughness1: 0.008,
    specRoughness2: 0.1,
    bloomThreshold: 0.85,
    bloomIntensity: 0.25,
    godRayIntensity: 0.12,
    godRayDecay: 0.96,
    moonIntensity: 0.0,
    exposureBias: 0.0,
  },
  depth: {
    waterDepth: 80,
    shallowColorR: 0.08,
    shallowColorG: 0.45,
    shallowColorB: 0.5,
    deepColorR: 0.0,
    deepColorG: 0.05,
    deepColorB: 0.18,
    visibility: 40,
    extinctionR: 0.35,
    extinctionG: 0.04,
    extinctionB: 0.025,
    gradientPower: 0.6,
    shoreBlend: 5.0,
    depthDarkening: 0.25,
    depthFog: 0.08,
    colorGradientBias: 0.45,
  },
  capillary: {
    scale: 35.0,
    intensity: 0.25,
    windAlignment: 0.65,
    damping: 0.96,
    frequency1: 0.12,
    frequency2: 0.2,
    frequency3: 0.28,
    frequency4: 0.37,
    amplitude1: 0.005,
    amplitude2: 0.003,
    amplitude3: 0.002,
    amplitude4: 0.001,
    speedMult: 2.0,
    noiseInfluence: 0.1,
  },
  atmosphere: {
    fogDensity: 0.005,
    fogColorR: 0.04,
    fogColorG: 0.06,
    fogColorB: 0.12,
    hazeIntensity: 0.15,
    horizonBlend: 0.35,
    rayleighCoeff: 1.0,
    mieCoeff: 0.004,
    mieDirectional: 0.82,
    skyColorR: 0.12,
    skyColorG: 0.25,
    skyColorB: 0.55,
    horizonColorR: 0.6,
    horizonColorG: 0.7,
    horizonColorB: 0.82,
    cloudCover: 0.15,
    cloudShadow: 0.3,
  },
  detail: {
    fbmOctaves: 5,
    fbmAmplitude: 0.12,
    fbmFrequency: 0.6,
    fbmLacunarity: 2.0,
    fbmGain: 0.42,
    normalStrength: 1.0,
    detailDistance: 80,
    domainWarp: 0.3,
    warpStrength: 0.25,
    warpFrequency: 0.4,
    microNormalIntensity: 0.4,
    microNormalScale: 8.0,
  },
  caustics: {
    enabled: 1,
    intensity: 0.4,
    scale: 10.0,
    speed: 0.6,
    chromaticSplit: 0.015,
    complexity: 1.8,
    depthAttenuation: 0.4,
    brightness: 1.0,
  },
  surface: {
    normalMapStrength: 1.0,
    bumpScale: 1.0,
    reflectionDistortion: 0.08,
    refractionDistortion: 0.05,
    waveNormalBlend: 0.5,
    detailNormalScale: 4.0,
    wetness: 0.8,
    roughnessVariation: 0.15,
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
    exposure: 1.1,
    contrast: 1.05,
    saturation: 1.1,
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
