import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { OceanParams, WaveGroupParams } from "@/types/ocean-params";
import { oceanVertexShader } from "@/shaders/ocean-vertex.glsl";
import { oceanFragmentShader } from "@/shaders/ocean-fragment.glsl";

interface OceanMeshProps {
  params: OceanParams;
}

function getGroups(p: OceanParams): WaveGroupParams[] {
  return [
    p.longSwell, p.primarySwell, p.secondarySwell, p.crossSwell,
    p.windSea, p.chop, p.ripple, p.microChop,
  ];
}

function pick<K extends keyof WaveGroupParams>(gs: WaveGroupParams[], k: K): number[] {
  return gs.map((g) => g[k] as number);
}

export function OceanMesh({ params }: OceanMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  const uniforms = useMemo(() => {
    const z8 = () => [0, 0, 0, 0, 0, 0, 0, 0];
    const o8 = () => [1, 1, 1, 1, 1, 1, 1, 1];
    return {
      uTime: { value: 0 },
      uWGEnabled: { value: o8() },
      uWGAmp: { value: z8() },
      uWGFreq: { value: z8() },
      uWGSteep: { value: z8() },
      uWGDir: { value: z8() },
      uWGSpeed: { value: o8() },
      uWGSpread: { value: z8() },
      uWGPhase: { value: z8() },
      uWGNumWaves: { value: o8() },
      uWGFreqSpread: { value: o8() },
      uWGAmpDecay: { value: o8() },
      uWGSpectrum: { value: z8() },
      uWGPeakEnh: { value: o8() },
      uWGSpecWidth: { value: o8() },
      uWGFetch: { value: o8() },
      uWGFront: { value: o8() },
      uWGRear: { value: o8() },
      uWGCrestSharp: { value: o8() },
      uWGTroughFlat: { value: z8() },
      uWGAsym: { value: z8() },
      uWGDirExp: { value: o8() },
      uWGFreqJit: { value: z8() },
      uWGAmpJit: { value: z8() },
      uWGDirJit: { value: z8() },
      uWGPhaseJit: { value: o8() },
      uWGSpatJit: { value: z8() },
      uWGSpatJitScale: { value: o8() },
      uWGAge: { value: z8() },
      uWGGroupSpeed: { value: o8() },
      uWGObliquity: { value: z8() },
      uWGWLMin: { value: z8() },
      uWGWLMax: { value: z8() },
      // Global
      uChoppiness: { value: 0.4 },
      uGlobalAmp: { value: 1.0 },
      uPeakSharp: { value: 1.2 },
      uNonlinearity: { value: 0.15 },
      uAntiGridJitter: { value: 0.5 },
      uAntiGridScale: { value: 0.025 },
      uSpectrumBlend: { value: 0.85 },
      uStokes3: { value: 0.05 },
      uSwellAging: { value: 1.0 },
      uCrestRounding: { value: 0.3 },
      // Wind
      uWindSpeed: { value: 10.0 },
      uWindDir: { value: 210 },
      uGustIntensity: { value: 0.25 },
      uGustFreq: { value: 0.12 },
      uTurbulence: { value: 0.15 },
      // FBM
      uFBMOctaves: { value: 5 },
      uFBMAmp: { value: 0.12 },
      uFBMFreq: { value: 0.6 },
      uFBMLacunarity: { value: 2.0 },
      uFBMGain: { value: 0.42 },
      uDomainWarp: { value: 0.3 },
      uWarpStrength: { value: 0.25 },
      uWarpFreq: { value: 0.4 },
      // Capillary
      uCapScale: { value: 35.0 },
      uCapIntensity: { value: 0.25 },
      uCapWindAlign: { value: 0.65 },
      uCapDamping: { value: 0.96 },
      uCapFreqs: { value: [0.12, 0.2, 0.28, 0.37] },
      uCapAmps: { value: [0.005, 0.003, 0.002, 0.001] },
      uCapSpeed: { value: 2.0 },
      // Rain
      uRainIntensity: { value: 0 },
      uRainDropScale: { value: 1 },
      uRainRippleIntensity: { value: 0.3 },
      uRainRippleScale: { value: 15 },
      uJacobianThreshold: { value: 0.35 },
      // Fragment
      uSunDir: { value: new THREE.Vector3(0, 1, 0) },
      uSunIntensity: { value: 2.0 },
      uSunColorTemp: { value: 5200 },
      uSkyIntensity: { value: 0.6 },
      uSkyTurbidity: { value: 2.5 },
      uAmbientIntensity: { value: 0.2 },
      uAmbientColor: { value: new THREE.Vector3(0.12, 0.16, 0.28) },
      uSpecRoughness1: { value: 0.008 },
      uSpecRoughness2: { value: 0.1 },
      uBloomThreshold: { value: 0.85 },
      uBloomIntensity: { value: 0.25 },
      uGodRayIntensity: { value: 0.12 },
      uMoonIntensity: { value: 0 },
      uExposureBias: { value: 0 },
      uAbsorptionR: { value: 0.45 },
      uAbsorptionG: { value: 0.035 },
      uAbsorptionB: { value: 0.022 },
      uScatterCoeff: { value: 0.25 },
      uForwardScatter: { value: 0.75 },
      uBackScatter: { value: 0.12 },
      uTurbidity: { value: 0.05 },
      uFresnelPower: { value: 5.0 },
      uFresnelBias: { value: 0.02 },
      uIOR: { value: 1.333 },
      uSSSIntensity: { value: 0.45 },
      uSSSDistortion: { value: 0.25 },
      uSSSPower: { value: 3.5 },
      uSSSColor: { value: new THREE.Vector3(0.05, 0.7, 0.55) },
      uSpecRoughness: { value: 0.02 },
      uSpecIntensity: { value: 1.5 },
      uWaterDepth: { value: 80 },
      uShallowColor: { value: new THREE.Vector3(0.08, 0.45, 0.5) },
      uDeepColor: { value: new THREE.Vector3(0, 0.05, 0.18) },
      uVisibility: { value: 40 },
      uExtinction: { value: new THREE.Vector3(0.35, 0.04, 0.025) },
      uGradientPower: { value: 0.6 },
      uDepthDarkening: { value: 0.25 },
      uDepthFog: { value: 0.08 },
      uColorGradientBias: { value: 0.45 },
      uFoamThreshold: { value: 0.45 },
      uFoamCoverage: { value: 0.3 },
      uFoamIntensity: { value: 0.85 },
      uFoamColor: { value: new THREE.Vector3(0.92, 0.95, 0.98) },
      uFoamNoiseScale: { value: 1.2 },
      uFoamNoiseSpeed: { value: 0.25 },
      uFoamRoughness: { value: 0.6 },
      uFoamEdge: { value: 0.25 },
      uWhitecapThreshold: { value: 0.6 },
      uWhitecapIntensity: { value: 0.8 },
      uBubbleDensity: { value: 0.35 },
      uFogDensity: { value: 0.005 },
      uFogColor: { value: new THREE.Vector3(0.04, 0.06, 0.12) },
      uHazeIntensity: { value: 0.15 },
      uHorizonBlend: { value: 0.35 },
      uRayleighCoeff: { value: 1.0 },
      uMieCoeff: { value: 0.004 },
      uMieDirectional: { value: 0.82 },
      uSkyColor: { value: new THREE.Vector3(0.12, 0.25, 0.55) },
      uHorizonColor: { value: new THREE.Vector3(0.6, 0.7, 0.82) },
      uCloudCover: { value: 0.15 },
      uNormalStrength: { value: 1.0 },
      uReflectionDistortion: { value: 0.08 },
      uWetness: { value: 0.8 },
      uRoughnessVariation: { value: 0.15 },
      uCausticsEnabled: { value: 1 },
      uCausticsIntensity: { value: 0.4 },
      uCausticsScale: { value: 10.0 },
      uCausticsSpeed: { value: 0.6 },
      uCausticsChromaticSplit: { value: 0.015 },
      uCausticsComplexity: { value: 1.8 },
      uCausticsDepthAtten: { value: 0.4 },
      uExposure: { value: 1.1 },
      uContrast: { value: 1.05 },
      uSaturation: { value: 1.1 },
      uVignetteIntensity: { value: 0 },
      uVignetteRadius: { value: 0.8 },
      uGamma: { value: 2.2 },
      uColorTint: { value: new THREE.Vector3(1, 1, 1) },
      uFilmGrain: { value: 0 },
    };
  }, []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const u = (meshRef.current.material as THREE.ShaderMaterial).uniforms;
    const p = params;
    u.uTime.value = clock.getElapsedTime() * p.animation.timeScale;

    const gs = getGroups(p);
    u.uWGEnabled.value = pick(gs, "enabled");
    u.uWGAmp.value = pick(gs, "amplitude");
    u.uWGFreq.value = pick(gs, "frequency");
    u.uWGSteep.value = pick(gs, "steepness");
    u.uWGDir.value = pick(gs, "direction");
    u.uWGSpeed.value = pick(gs, "speed").map((s) => s * p.animation.globalSpeed);
    u.uWGSpread.value = pick(gs, "spread");
    u.uWGPhase.value = pick(gs, "phaseOffset");
    u.uWGNumWaves.value = pick(gs, "numWaves");
    u.uWGFreqSpread.value = pick(gs, "frequencySpread");
    u.uWGAmpDecay.value = pick(gs, "amplitudeDecay");
    u.uWGSpectrum.value = pick(gs, "spectrumMode");
    u.uWGPeakEnh.value = pick(gs, "peakEnhancement");
    u.uWGSpecWidth.value = pick(gs, "spectralWidth");
    u.uWGFetch.value = pick(gs, "fetchKm");
    u.uWGFront.value = pick(gs, "frontSteepness");
    u.uWGRear.value = pick(gs, "rearSteepness");
    u.uWGCrestSharp.value = pick(gs, "crestSharpness");
    u.uWGTroughFlat.value = pick(gs, "troughFlatness");
    u.uWGAsym.value = pick(gs, "asymmetry");
    u.uWGDirExp.value = pick(gs, "directionalExponent");
    u.uWGFreqJit.value = pick(gs, "frequencyJitter");
    u.uWGAmpJit.value = pick(gs, "amplitudeJitter");
    u.uWGDirJit.value = pick(gs, "directionJitter");
    u.uWGPhaseJit.value = pick(gs, "phaseJitter");
    u.uWGSpatJit.value = pick(gs, "spatialJitter");
    u.uWGSpatJitScale.value = pick(gs, "spatialJitterScale");
    u.uWGAge.value = pick(gs, "waveAge");
    u.uWGGroupSpeed.value = pick(gs, "groupSpeedMod");
    u.uWGObliquity.value = pick(gs, "obliquity");
    u.uWGWLMin.value = pick(gs, "wavelengthMin");
    u.uWGWLMax.value = pick(gs, "wavelengthMax");

    u.uChoppiness.value = p.globalWave.choppiness;
    u.uGlobalAmp.value = p.globalWave.globalAmplitude;
    u.uPeakSharp.value = p.globalWave.peakSharpening;
    u.uNonlinearity.value = p.globalWave.nonlinearity;
    u.uAntiGridJitter.value = p.globalWave.antiGridJitter;
    u.uAntiGridScale.value = p.globalWave.antiGridScale;
    u.uSpectrumBlend.value = p.globalWave.spectrumBlend;
    u.uStokes3.value = p.globalWave.stokes3Order;
    u.uSwellAging.value = p.globalWave.swellAging;
    u.uCrestRounding.value = p.globalWave.crestRounding;

    u.uWindSpeed.value = p.wind.speed;
    u.uWindDir.value = p.wind.direction;
    u.uGustIntensity.value = p.wind.gustIntensity;
    u.uGustFreq.value = p.wind.gustFrequency;
    u.uTurbulence.value = p.wind.turbulence;

    u.uFBMOctaves.value = p.detail.fbmOctaves;
    u.uFBMAmp.value = p.detail.fbmAmplitude;
    u.uFBMFreq.value = p.detail.fbmFrequency;
    u.uFBMLacunarity.value = p.detail.fbmLacunarity;
    u.uFBMGain.value = p.detail.fbmGain;
    u.uDomainWarp.value = p.detail.domainWarp;
    u.uWarpStrength.value = p.detail.warpStrength;
    u.uWarpFreq.value = p.detail.warpFrequency;

    u.uCapScale.value = p.capillary.scale;
    u.uCapIntensity.value = p.capillary.intensity;
    u.uCapWindAlign.value = p.capillary.windAlignment;
    u.uCapDamping.value = p.capillary.damping;
    u.uCapFreqs.value = [p.capillary.frequency1, p.capillary.frequency2, p.capillary.frequency3, p.capillary.frequency4];
    u.uCapAmps.value = [p.capillary.amplitude1, p.capillary.amplitude2, p.capillary.amplitude3, p.capillary.amplitude4];
    u.uCapSpeed.value = p.capillary.speedMult;

    u.uRainIntensity.value = p.rain.intensity;
    u.uRainDropScale.value = p.rain.dropScale;
    u.uRainRippleIntensity.value = p.rain.rippleIntensity;
    u.uRainRippleScale.value = p.rain.rippleScale;

    u.uJacobianThreshold.value = p.foam.jacobianThreshold;
    u.uFoamThreshold.value = p.foam.threshold;
    u.uFoamCoverage.value = p.foam.coverage;
    u.uFoamIntensity.value = p.foam.intensity;
    u.uFoamColor.value.set(p.foam.colorR, p.foam.colorG, p.foam.colorB);
    u.uFoamNoiseScale.value = p.foam.noiseScale;
    u.uFoamNoiseSpeed.value = p.foam.noiseSpeed;
    u.uFoamRoughness.value = p.foam.roughness;
    u.uFoamEdge.value = p.foam.edgeFoam;
    u.uWhitecapThreshold.value = p.foam.whitecapThreshold;
    u.uWhitecapIntensity.value = p.foam.whitecapIntensity;
    u.uBubbleDensity.value = p.foam.bubbleDensity;

    const az = (p.lighting.sunAzimuth * Math.PI) / 180;
    const el = (p.lighting.sunElevation * Math.PI) / 180;
    u.uSunDir.value.set(Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az));
    u.uSunIntensity.value = p.lighting.sunIntensity;
    u.uSunColorTemp.value = p.lighting.sunColorTemp;
    u.uSkyIntensity.value = p.lighting.skyIntensity;
    u.uSkyTurbidity.value = p.lighting.skyTurbidity;
    u.uAmbientIntensity.value = p.lighting.ambientIntensity;
    u.uAmbientColor.value.set(p.lighting.ambientColorR, p.lighting.ambientColorG, p.lighting.ambientColorB);
    u.uSpecRoughness1.value = p.lighting.specRoughness1;
    u.uSpecRoughness2.value = p.lighting.specRoughness2;
    u.uBloomThreshold.value = p.lighting.bloomThreshold;
    u.uBloomIntensity.value = p.lighting.bloomIntensity;
    u.uGodRayIntensity.value = p.lighting.godRayIntensity;
    u.uMoonIntensity.value = p.lighting.moonIntensity;
    u.uExposureBias.value = p.lighting.exposureBias;

    u.uAbsorptionR.value = p.optics.absorptionR;
    u.uAbsorptionG.value = p.optics.absorptionG;
    u.uAbsorptionB.value = p.optics.absorptionB;
    u.uScatterCoeff.value = p.optics.scatteringCoeff;
    u.uForwardScatter.value = p.optics.forwardScatter;
    u.uBackScatter.value = p.optics.backScatter;
    u.uTurbidity.value = p.optics.turbidity;
    u.uFresnelPower.value = p.optics.fresnelPower;
    u.uFresnelBias.value = p.optics.fresnelBias;
    u.uIOR.value = p.optics.ior;
    u.uSSSIntensity.value = p.optics.sssIntensity;
    u.uSSSDistortion.value = p.optics.sssDistortion;
    u.uSSSPower.value = p.optics.sssPower;
    u.uSSSColor.value.set(p.optics.sssColorR, p.optics.sssColorG, p.optics.sssColorB);
    u.uSpecRoughness.value = p.optics.specRoughness;
    u.uSpecIntensity.value = p.optics.specIntensity;

    u.uWaterDepth.value = p.depth.waterDepth;
    u.uShallowColor.value.set(p.depth.shallowColorR, p.depth.shallowColorG, p.depth.shallowColorB);
    u.uDeepColor.value.set(p.depth.deepColorR, p.depth.deepColorG, p.depth.deepColorB);
    u.uVisibility.value = p.depth.visibility;
    u.uExtinction.value.set(p.depth.extinctionR, p.depth.extinctionG, p.depth.extinctionB);
    u.uGradientPower.value = p.depth.gradientPower;
    u.uDepthDarkening.value = p.depth.depthDarkening;
    u.uDepthFog.value = p.depth.depthFog;
    u.uColorGradientBias.value = p.depth.colorGradientBias;

    u.uFogDensity.value = p.atmosphere.fogDensity;
    u.uFogColor.value.set(p.atmosphere.fogColorR, p.atmosphere.fogColorG, p.atmosphere.fogColorB);
    u.uHazeIntensity.value = p.atmosphere.hazeIntensity;
    u.uHorizonBlend.value = p.atmosphere.horizonBlend;
    u.uRayleighCoeff.value = p.atmosphere.rayleighCoeff;
    u.uMieCoeff.value = p.atmosphere.mieCoeff;
    u.uMieDirectional.value = p.atmosphere.mieDirectional;
    u.uSkyColor.value.set(p.atmosphere.skyColorR, p.atmosphere.skyColorG, p.atmosphere.skyColorB);
    u.uHorizonColor.value.set(p.atmosphere.horizonColorR, p.atmosphere.horizonColorG, p.atmosphere.horizonColorB);
    u.uCloudCover.value = p.atmosphere.cloudCover;

    u.uNormalStrength.value = p.surface.normalMapStrength;
    u.uReflectionDistortion.value = p.surface.reflectionDistortion;
    u.uWetness.value = p.surface.wetness;
    u.uRoughnessVariation.value = p.surface.roughnessVariation;

    u.uCausticsEnabled.value = p.caustics.enabled;
    u.uCausticsIntensity.value = p.caustics.intensity;
    u.uCausticsScale.value = p.caustics.scale;
    u.uCausticsSpeed.value = p.caustics.speed;
    u.uCausticsChromaticSplit.value = p.caustics.chromaticSplit;
    u.uCausticsComplexity.value = p.caustics.complexity;
    u.uCausticsDepthAtten.value = p.caustics.depthAttenuation;

    u.uExposure.value = p.post.exposure;
    u.uContrast.value = p.post.contrast;
    u.uSaturation.value = p.post.saturation;
    u.uVignetteIntensity.value = p.post.vignetteIntensity;
    u.uVignetteRadius.value = p.post.vignetteRadius;
    u.uGamma.value = p.post.gamma;
    u.uColorTint.value.set(p.post.colorTintR, p.post.colorTintG, p.post.colorTintB);
    u.uFilmGrain.value = p.post.filmGrain;
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[300, 300, 256, 256]} />
      <shaderMaterial
        vertexShader={oceanVertexShader}
        fragmentShader={oceanFragmentShader}
        uniforms={uniforms}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
