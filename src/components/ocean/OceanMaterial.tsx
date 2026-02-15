import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { OceanParams } from "@/types/ocean-params";
import { oceanVertexShader } from "@/shaders/ocean-vertex.glsl";
import { oceanFragmentShader } from "@/shaders/ocean-fragment.glsl";

interface OceanMeshProps {
  params: OceanParams;
}

function getWaveGroupArrays(p: OceanParams) {
  const groups = [p.primarySwell, p.secondarySwell, p.windSea, p.chop];
  return {
    enabled: groups.map((g) => g.enabled),
    amp: groups.map((g) => g.amplitude),
    freq: groups.map((g) => g.frequency),
    steep: groups.map((g) => g.steepness),
    dir: groups.map((g) => g.direction),
    speed: groups.map((g) => g.speed),
    spread: groups.map((g) => g.spread),
    phase: groups.map((g) => g.phaseOffset),
    numWaves: groups.map((g) => g.numWaves),
    freqSpread: groups.map((g) => g.frequencySpread),
    ampDecay: groups.map((g) => g.amplitudeDecay),
  };
}

export function OceanMesh({ params }: OceanMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      // Wave groups
      uWGEnabled: { value: [1, 1, 1, 1] },
      uWGAmp: { value: [1, 0.5, 0.3, 0.1] },
      uWGFreq: { value: [0.3, 0.5, 1.0, 2.0] },
      uWGSteep: { value: [0.4, 0.3, 0.25, 0.2] },
      uWGDir: { value: [45, 120, 60, 75] },
      uWGSpeed: { value: [1, 0.9, 1.3, 1.5] },
      uWGSpread: { value: [25, 35, 55, 90] },
      uWGPhase: { value: [0, 1.2, 2.8, 4.1] },
      uWGNumWaves: { value: [6, 5, 6, 8] },
      uWGFreqSpread: { value: [1.3, 1.4, 1.5, 1.6] },
      uWGAmpDecay: { value: [0.72, 0.65, 0.6, 0.55] },
      // Global wave
      uChoppiness: { value: 0.6 },
      uGlobalAmp: { value: 1.0 },
      uPeakSharp: { value: 1.0 },
      uNonlinearity: { value: 0.3 },
      // Wind
      uWindSpeed: { value: 8.0 },
      uWindDir: { value: 55 },
      uGustIntensity: { value: 0.3 },
      uGustFreq: { value: 0.15 },
      uTurbulence: { value: 0.2 },
      // FBM
      uFBMOctaves: { value: 4.0 },
      uFBMAmp: { value: 0.15 },
      uFBMFreq: { value: 0.8 },
      uFBMLacunarity: { value: 2.1 },
      uFBMGain: { value: 0.45 },
      uDomainWarp: { value: 0.2 },
      uWarpStrength: { value: 0.3 },
      uWarpFreq: { value: 0.5 },
      // Capillary
      uCapScale: { value: 40.0 },
      uCapIntensity: { value: 0.35 },
      uCapWindAlign: { value: 0.7 },
      uCapDamping: { value: 0.98 },
      uCapFreqs: { value: [0.15, 0.23, 0.31, 0.39] },
      uCapAmps: { value: [0.006, 0.004, 0.003, 0.002] },
      uCapSpeed: { value: 2.5 },
      // Rain
      uRainIntensity: { value: 0.0 },
      uRainDropScale: { value: 1.0 },
      uRainRippleIntensity: { value: 0.3 },
      uRainRippleScale: { value: 15.0 },
      // Foam Jacobian
      uJacobianThreshold: { value: 0.4 },
      // Fragment uniforms
      uSunDir: { value: new THREE.Vector3(0, 1, 0) },
      uSunIntensity: { value: 1.5 },
      uSunColorTemp: { value: 5500 },
      uSkyIntensity: { value: 0.5 },
      uSkyTurbidity: { value: 2.0 },
      uAmbientIntensity: { value: 0.15 },
      uAmbientColor: { value: new THREE.Vector3(0.15, 0.18, 0.25) },
      uSpecRoughness1: { value: 0.015 },
      uSpecRoughness2: { value: 0.12 },
      uBloomThreshold: { value: 0.8 },
      uBloomIntensity: { value: 0.3 },
      uGodRayIntensity: { value: 0.15 },
      uMoonIntensity: { value: 0.0 },
      uExposureBias: { value: 0.0 },
      // Optics
      uAbsorptionR: { value: 0.45 },
      uAbsorptionG: { value: 0.029 },
      uAbsorptionB: { value: 0.018 },
      uScatterCoeff: { value: 0.2 },
      uForwardScatter: { value: 0.7 },
      uBackScatter: { value: 0.15 },
      uTurbidity: { value: 0.1 },
      uFresnelPower: { value: 5.0 },
      uFresnelBias: { value: 0.02 },
      uIOR: { value: 1.333 },
      uSSSIntensity: { value: 0.3 },
      uSSSDistortion: { value: 0.3 },
      uSSSPower: { value: 4.0 },
      uSSSColor: { value: new THREE.Vector3(0.05, 0.65, 0.5) },
      uSpecRoughness: { value: 0.03 },
      uSpecIntensity: { value: 1.2 },
      // Depth
      uWaterDepth: { value: 50 },
      uShallowColor: { value: new THREE.Vector3(0.1, 0.6, 0.6) },
      uDeepColor: { value: new THREE.Vector3(0, 0.08, 0.25) },
      uVisibility: { value: 30 },
      uExtinction: { value: new THREE.Vector3(0.4, 0.04, 0.02) },
      uGradientPower: { value: 0.5 },
      uDepthDarkening: { value: 0.3 },
      uDepthFog: { value: 0.1 },
      uColorGradientBias: { value: 0.5 },
      // Foam
      uFoamThreshold: { value: 0.5 },
      uFoamCoverage: { value: 0.35 },
      uFoamIntensity: { value: 0.9 },
      uFoamColor: { value: new THREE.Vector3(0.88, 0.92, 0.95) },
      uFoamNoiseScale: { value: 1.5 },
      uFoamNoiseSpeed: { value: 0.3 },
      uFoamRoughness: { value: 0.6 },
      uFoamEdge: { value: 0.3 },
      uWhitecapThreshold: { value: 0.7 },
      uWhitecapIntensity: { value: 1.0 },
      uBubbleDensity: { value: 0.4 },
      // Atmosphere
      uFogDensity: { value: 0.007 },
      uFogColor: { value: new THREE.Vector3(0.035, 0.05, 0.09) },
      uHazeIntensity: { value: 0.2 },
      uHorizonBlend: { value: 0.3 },
      uRayleighCoeff: { value: 1.0 },
      uMieCoeff: { value: 0.005 },
      uMieDirectional: { value: 0.8 },
      uSkyColor: { value: new THREE.Vector3(0.08, 0.18, 0.45) },
      uHorizonColor: { value: new THREE.Vector3(0.55, 0.65, 0.78) },
      uCloudCover: { value: 0.0 },
      // Surface
      uNormalStrength: { value: 1.0 },
      uReflectionDistortion: { value: 0.1 },
      uWetness: { value: 0.8 },
      uRoughnessVariation: { value: 0.2 },
      // Caustics
      uCausticsEnabled: { value: 1.0 },
      uCausticsIntensity: { value: 0.5 },
      uCausticsScale: { value: 8.0 },
      uCausticsSpeed: { value: 0.8 },
      uCausticsChromaticSplit: { value: 0.02 },
      uCausticsComplexity: { value: 2.0 },
      uCausticsDepthAtten: { value: 0.5 },
      // Post
      uExposure: { value: 1.0 },
      uContrast: { value: 1.0 },
      uSaturation: { value: 1.0 },
      uVignetteIntensity: { value: 0.0 },
      uVignetteRadius: { value: 0.8 },
      uGamma: { value: 2.2 },
      uColorTint: { value: new THREE.Vector3(1, 1, 1) },
      uFilmGrain: { value: 0.0 },
    }),
    []
  );

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const u = (meshRef.current.material as THREE.ShaderMaterial).uniforms;
    const p = params;

    u.uTime.value = clock.getElapsedTime() * p.animation.timeScale;

    // Wave groups
    const wg = getWaveGroupArrays(p);
    u.uWGEnabled.value = wg.enabled;
    u.uWGAmp.value = wg.amp;
    u.uWGFreq.value = wg.freq;
    u.uWGSteep.value = wg.steep;
    u.uWGDir.value = wg.dir;
    u.uWGSpeed.value = wg.speed.map((s) => s * p.animation.globalSpeed);
    u.uWGSpread.value = wg.spread;
    u.uWGPhase.value = wg.phase;
    u.uWGNumWaves.value = wg.numWaves;
    u.uWGFreqSpread.value = wg.freqSpread;
    u.uWGAmpDecay.value = wg.ampDecay;

    // Global
    u.uChoppiness.value = p.globalWave.choppiness;
    u.uGlobalAmp.value = p.globalWave.globalAmplitude;
    u.uPeakSharp.value = p.globalWave.peakSharpening;
    u.uNonlinearity.value = p.globalWave.nonlinearity;

    // Wind
    u.uWindSpeed.value = p.wind.speed;
    u.uWindDir.value = p.wind.direction;
    u.uGustIntensity.value = p.wind.gustIntensity;
    u.uGustFreq.value = p.wind.gustFrequency;
    u.uTurbulence.value = p.wind.turbulence;

    // FBM
    u.uFBMOctaves.value = p.detail.fbmOctaves;
    u.uFBMAmp.value = p.detail.fbmAmplitude;
    u.uFBMFreq.value = p.detail.fbmFrequency;
    u.uFBMLacunarity.value = p.detail.fbmLacunarity;
    u.uFBMGain.value = p.detail.fbmGain;
    u.uDomainWarp.value = p.detail.domainWarp;
    u.uWarpStrength.value = p.detail.warpStrength;
    u.uWarpFreq.value = p.detail.warpFrequency;

    // Capillary
    u.uCapScale.value = p.capillary.scale;
    u.uCapIntensity.value = p.capillary.intensity;
    u.uCapWindAlign.value = p.capillary.windAlignment;
    u.uCapDamping.value = p.capillary.damping;
    u.uCapFreqs.value = [p.capillary.frequency1, p.capillary.frequency2, p.capillary.frequency3, p.capillary.frequency4];
    u.uCapAmps.value = [p.capillary.amplitude1, p.capillary.amplitude2, p.capillary.amplitude3, p.capillary.amplitude4];
    u.uCapSpeed.value = p.capillary.speedMult;

    // Rain
    u.uRainIntensity.value = p.rain.intensity;
    u.uRainDropScale.value = p.rain.dropScale;
    u.uRainRippleIntensity.value = p.rain.rippleIntensity;
    u.uRainRippleScale.value = p.rain.rippleScale;

    // Foam
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

    // Lighting
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

    // Optics
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

    // Depth
    u.uWaterDepth.value = p.depth.waterDepth;
    u.uShallowColor.value.set(p.depth.shallowColorR, p.depth.shallowColorG, p.depth.shallowColorB);
    u.uDeepColor.value.set(p.depth.deepColorR, p.depth.deepColorG, p.depth.deepColorB);
    u.uVisibility.value = p.depth.visibility;
    u.uExtinction.value.set(p.depth.extinctionR, p.depth.extinctionG, p.depth.extinctionB);
    u.uGradientPower.value = p.depth.gradientPower;
    u.uDepthDarkening.value = p.depth.depthDarkening;
    u.uDepthFog.value = p.depth.depthFog;
    u.uColorGradientBias.value = p.depth.colorGradientBias;

    // Atmosphere
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

    // Surface
    u.uNormalStrength.value = p.surface.normalMapStrength;
    u.uReflectionDistortion.value = p.surface.reflectionDistortion;
    u.uWetness.value = p.surface.wetness;
    u.uRoughnessVariation.value = p.surface.roughnessVariation;

    // Caustics
    u.uCausticsEnabled.value = p.caustics.enabled;
    u.uCausticsIntensity.value = p.caustics.intensity;
    u.uCausticsScale.value = p.caustics.scale;
    u.uCausticsSpeed.value = p.caustics.speed;
    u.uCausticsChromaticSplit.value = p.caustics.chromaticSplit;
    u.uCausticsComplexity.value = p.caustics.complexity;
    u.uCausticsDepthAtten.value = p.caustics.depthAttenuation;

    // Post
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
      <planeGeometry args={[200, 200, 300, 300]} />
      <shaderMaterial
        vertexShader={oceanVertexShader}
        fragmentShader={oceanFragmentShader}
        uniforms={uniforms}
        side={THREE.FrontSide}
      />
    </mesh>
  );
}
