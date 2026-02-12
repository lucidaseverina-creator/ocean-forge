export interface WaveParams {
  amplitude: number;
  frequency: number;
  steepness: number;
  direction: number;
  speed: number;
  numWaves: number;
}

export interface WindParams {
  speed: number;
  direction: number;
  gustIntensity: number;
  fetchLength: number;
}

export interface FoamParams {
  threshold: number;
  coverage: number;
  decay: number;
  intensity: number;
  streakLength: number;
}

export interface OpticsParams {
  absorptionR: number;
  absorptionG: number;
  absorptionB: number;
  scattering: number;
  turbidity: number;
  fresnelPower: number;
  ior: number;
}

export interface LightingParams {
  sunAzimuth: number;
  sunElevation: number;
  sunIntensity: number;
  skyIntensity: number;
  ambientIntensity: number;
}

export interface CapillaryParams {
  scale: number;
  intensity: number;
  windAlignment: number;
  damping: number;
}

export interface DepthParams {
  waterDepth: number;
  shallowColor: [number, number, number];
  deepColor: [number, number, number];
  visibility: number;
}

export interface CausticsParams {
  intensity: number;
  scale: number;
  speed: number;
  enabled: boolean;
}

export interface OceanParams {
  waves: WaveParams;
  wind: WindParams;
  foam: FoamParams;
  optics: OpticsParams;
  lighting: LightingParams;
  capillary: CapillaryParams;
  depth: DepthParams;
  caustics: CausticsParams;
}

export const defaultOceanParams: OceanParams = {
  waves: {
    amplitude: 1.0,
    frequency: 0.8,
    steepness: 0.4,
    direction: 45,
    speed: 1.0,
    numWaves: 6,
  },
  wind: {
    speed: 8.0,
    direction: 45,
    gustIntensity: 0.3,
    fetchLength: 100,
  },
  foam: {
    threshold: 0.6,
    coverage: 0.3,
    decay: 0.95,
    intensity: 0.8,
    streakLength: 2.0,
  },
  optics: {
    absorptionR: 0.45,
    absorptionG: 0.029,
    absorptionB: 0.018,
    scattering: 0.15,
    turbidity: 0.1,
    fresnelPower: 5.0,
    ior: 1.333,
  },
  lighting: {
    sunAzimuth: 180,
    sunElevation: 35,
    sunIntensity: 1.5,
    skyIntensity: 0.4,
    ambientIntensity: 0.15,
  },
  capillary: {
    scale: 40.0,
    intensity: 0.3,
    windAlignment: 0.7,
    damping: 0.98,
  },
  depth: {
    waterDepth: 50,
    shallowColor: [0.1, 0.6, 0.6],
    deepColor: [0.0, 0.1, 0.3],
    visibility: 30,
  },
  caustics: {
    intensity: 0.5,
    scale: 8.0,
    speed: 0.8,
    enabled: true,
  },
};
