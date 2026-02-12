import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { OceanParams } from "@/types/ocean-params";

const vertexShader = `
  uniform float uTime;
  uniform float uAmplitude;
  uniform float uFrequency;
  uniform float uSteepness;
  uniform float uSpeed;
  uniform float uDirection;
  uniform int uNumWaves;
  uniform float uCapillaryScale;
  uniform float uCapillaryIntensity;
  uniform float uWindDirection;
  
  varying vec3 vWorldPosition;
  varying vec3 vNormal;
  varying vec2 vUv;
  varying float vFoamFactor;
  varying float vHeight;
  varying vec3 vViewDir;

  #define PI 3.14159265359

  vec3 gerstnerWave(vec2 pos, float amp, float freq, float steep, vec2 dir, float phase, float t) {
    float k = freq * 2.0 * PI;
    float c = sqrt(9.81 / k); // deep water dispersion
    float d = dot(dir, pos);
    float f = k * d - c * t * phase;
    float a = steep / k;
    
    return vec3(
      dir.x * a * cos(f),
      amp * sin(f),
      dir.y * a * cos(f)
    );
  }

  void main() {
    vUv = uv;
    vec3 pos = position;
    
    float dirRad = uDirection * PI / 180.0;
    vec2 mainDir = normalize(vec2(cos(dirRad), sin(dirRad)));
    
    vec3 displacement = vec3(0.0);
    vec3 tangent = vec3(1.0, 0.0, 0.0);
    vec3 binormal = vec3(0.0, 0.0, 1.0);
    
    // Multi-octave Gerstner waves
    for (int i = 0; i < 8; i++) {
      if (i >= uNumWaves) break;
      
      float fi = float(i);
      float freqMult = pow(1.18, fi);
      float ampMult = pow(0.82, fi);
      float angle = dirRad + (fi - float(uNumWaves) * 0.5) * 0.35;
      vec2 dir = normalize(vec2(cos(angle), sin(angle)));
      
      float freq = uFrequency * freqMult;
      float amp = uAmplitude * ampMult;
      float steep = uSteepness * ampMult;
      float phase = uSpeed * (1.0 + fi * 0.1);
      
      float k = freq * 2.0 * PI;
      float c = sqrt(9.81 / k);
      float d = dot(dir, pos.xz);
      float f = k * d - c * uTime * phase;
      float a = steep / k;
      
      displacement.x += dir.x * a * cos(f);
      displacement.y += amp * sin(f);
      displacement.z += dir.y * a * cos(f);
      
      // Accumulate tangent/binormal for normal calculation
      tangent += vec3(
        -dir.x * dir.x * steep * sin(f),
        dir.x * freq * amp * cos(f),
        -dir.x * dir.y * steep * sin(f)
      );
      binormal += vec3(
        -dir.x * dir.y * steep * sin(f),
        dir.y * freq * amp * cos(f),
        -dir.y * dir.y * steep * sin(f)
      );
    }
    
    // Capillary ripples (L0 normal perturbation)
    float capWindRad = uWindDirection * PI / 180.0;
    vec2 capDir = vec2(cos(capWindRad), sin(capWindRad));
    float capRipple = sin(dot(pos.xz + displacement.xz, capDir) * uCapillaryScale + uTime * 3.0) * uCapillaryIntensity * 0.05;
    displacement.y += capRipple;
    
    pos += displacement;
    
    vNormal = normalize(cross(binormal, tangent));
    vWorldPosition = (modelMatrix * vec4(pos, 1.0)).xyz;
    vHeight = displacement.y;
    vFoamFactor = max(0.0, displacement.y / (uAmplitude * 0.8) - 0.3) + pow(max(0.0, dot(tangent, binormal)), 2.0) * 0.5;
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    vViewDir = -normalize(mvPosition.xyz);
    
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform vec3 uSunDirection;
  uniform float uSunIntensity;
  uniform float uSkyIntensity;
  uniform float uAmbientIntensity;
  
  uniform float uAbsorptionR;
  uniform float uAbsorptionG;
  uniform float uAbsorptionB;
  uniform float uScattering;
  uniform float uTurbidity;
  uniform float uFresnelPower;
  uniform float uIOR;
  
  uniform float uFoamThreshold;
  uniform float uFoamCoverage;
  uniform float uFoamIntensity;
  
  uniform vec3 uShallowColor;
  uniform vec3 uDeepColor;
  uniform float uWaterDepth;
  
  varying vec3 vWorldPosition;
  varying vec3 vNormal;
  varying vec2 vUv;
  varying float vFoamFactor;
  varying float vHeight;
  varying vec3 vViewDir;

  #define PI 3.14159265359

  // Schlick Fresnel
  float fresnel(vec3 viewDir, vec3 normal, float power) {
    float f0 = pow((1.0 - uIOR) / (1.0 + uIOR), 2.0);
    return f0 + (1.0 - f0) * pow(1.0 - max(dot(viewDir, normal), 0.0), power);
  }

  // Simple sky color
  vec3 getSkyColor(vec3 dir) {
    float y = max(dir.y, 0.0);
    vec3 horizon = vec3(0.6, 0.7, 0.8);
    vec3 zenith = vec3(0.15, 0.3, 0.6);
    return mix(horizon, zenith, pow(y, 0.5)) * uSkyIntensity;
  }

  void main() {
    vec3 N = normalize(vNormal);
    vec3 V = normalize(vViewDir);
    vec3 L = normalize(uSunDirection);
    vec3 H = normalize(L + V);
    
    // Fresnel
    float F = fresnel(V, N, uFresnelPower);
    
    // Reflection (sky)
    vec3 reflDir = reflect(-V, N);
    vec3 reflection = getSkyColor(reflDir);
    
    // Sun specular (GGX-like)
    float NdotH = max(dot(N, H), 0.0);
    float spec = pow(NdotH, 256.0) * uSunIntensity;
    vec3 sunColor = vec3(1.0, 0.95, 0.8);
    vec3 specular = sunColor * spec;
    
    // Water body color (Beer-Lambert absorption)
    float depth = max(uWaterDepth * (1.0 - (vHeight + 1.0) * 0.1), 0.1);
    vec3 absorption = vec3(
      exp(-uAbsorptionR * depth),
      exp(-uAbsorptionG * depth),
      exp(-uAbsorptionB * depth)
    );
    
    // Depth-based color
    float depthFactor = clamp(depth / uWaterDepth, 0.0, 1.0);
    vec3 waterColor = mix(uShallowColor, uDeepColor, depthFactor) * absorption;
    
    // Scattering (subsurface)
    float NdotL = max(dot(N, L), 0.0);
    float subsurface = pow(max(dot(V, -L + N * 0.3), 0.0), 3.0) * uScattering;
    vec3 scatterColor = vec3(0.0, 0.6, 0.5) * subsurface;
    
    // Turbidity
    waterColor = mix(waterColor, vec3(0.3, 0.35, 0.2), uTurbidity * 0.5);
    
    // Combine refracted + reflected
    vec3 refracted = waterColor + scatterColor;
    vec3 color = mix(refracted, reflection, F) + specular;
    
    // Ambient
    color += waterColor * uAmbientIntensity;
    
    // Foam
    float foam = smoothstep(uFoamThreshold, uFoamThreshold + 0.3, vFoamFactor) * uFoamCoverage;
    // Animated foam noise
    float foamNoise = fract(sin(dot(vWorldPosition.xz * 3.0 + uTime * 0.2, vec2(12.9898, 78.233))) * 43758.5453);
    foam *= (0.7 + 0.3 * foamNoise);
    vec3 foamColor = vec3(0.9, 0.95, 1.0) * uFoamIntensity;
    color = mix(color, foamColor, foam);
    
    // Tone mapping (ACES-like)
    color = color / (color + vec3(1.0));
    color = pow(color, vec3(1.0 / 2.2));
    
    gl_FragColor = vec4(color, 0.95);
  }
`;

interface OceanMeshProps {
  params: OceanParams;
}

export function OceanMesh({ params }: OceanMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const sunDirection = useMemo(() => {
    const azRad = (params.lighting.sunAzimuth * Math.PI) / 180;
    const elRad = (params.lighting.sunElevation * Math.PI) / 180;
    return new THREE.Vector3(
      Math.cos(elRad) * Math.sin(azRad),
      Math.sin(elRad),
      Math.cos(elRad) * Math.cos(azRad)
    );
  }, [params.lighting.sunAzimuth, params.lighting.sunElevation]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAmplitude: { value: params.waves.amplitude },
      uFrequency: { value: params.waves.frequency },
      uSteepness: { value: params.waves.steepness },
      uSpeed: { value: params.waves.speed },
      uDirection: { value: params.waves.direction },
      uNumWaves: { value: params.waves.numWaves },
      uCapillaryScale: { value: params.capillary.scale },
      uCapillaryIntensity: { value: params.capillary.intensity },
      uWindDirection: { value: params.wind.direction },
      uSunDirection: { value: sunDirection },
      uSunIntensity: { value: params.lighting.sunIntensity },
      uSkyIntensity: { value: params.lighting.skyIntensity },
      uAmbientIntensity: { value: params.lighting.ambientIntensity },
      uAbsorptionR: { value: params.optics.absorptionR },
      uAbsorptionG: { value: params.optics.absorptionG },
      uAbsorptionB: { value: params.optics.absorptionB },
      uScattering: { value: params.optics.scattering },
      uTurbidity: { value: params.optics.turbidity },
      uFresnelPower: { value: params.optics.fresnelPower },
      uIOR: { value: params.optics.ior },
      uFoamThreshold: { value: params.foam.threshold },
      uFoamCoverage: { value: params.foam.coverage },
      uFoamIntensity: { value: params.foam.intensity },
      uShallowColor: { value: new THREE.Vector3(...params.depth.shallowColor) },
      uDeepColor: { value: new THREE.Vector3(...params.depth.deepColor) },
      uWaterDepth: { value: params.depth.waterDepth },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material as THREE.ShaderMaterial;
    mat.uniforms.uTime.value = clock.getElapsedTime();
    mat.uniforms.uAmplitude.value = params.waves.amplitude;
    mat.uniforms.uFrequency.value = params.waves.frequency;
    mat.uniforms.uSteepness.value = params.waves.steepness;
    mat.uniforms.uSpeed.value = params.waves.speed;
    mat.uniforms.uDirection.value = params.waves.direction;
    mat.uniforms.uNumWaves.value = params.waves.numWaves;
    mat.uniforms.uCapillaryScale.value = params.capillary.scale;
    mat.uniforms.uCapillaryIntensity.value = params.capillary.intensity;
    mat.uniforms.uWindDirection.value = params.wind.direction;
    
    const azRad = (params.lighting.sunAzimuth * Math.PI) / 180;
    const elRad = (params.lighting.sunElevation * Math.PI) / 180;
    mat.uniforms.uSunDirection.value.set(
      Math.cos(elRad) * Math.sin(azRad),
      Math.sin(elRad),
      Math.cos(elRad) * Math.cos(azRad)
    );
    mat.uniforms.uSunIntensity.value = params.lighting.sunIntensity;
    mat.uniforms.uSkyIntensity.value = params.lighting.skyIntensity;
    mat.uniforms.uAmbientIntensity.value = params.lighting.ambientIntensity;
    mat.uniforms.uAbsorptionR.value = params.optics.absorptionR;
    mat.uniforms.uAbsorptionG.value = params.optics.absorptionG;
    mat.uniforms.uAbsorptionB.value = params.optics.absorptionB;
    mat.uniforms.uScattering.value = params.optics.scattering;
    mat.uniforms.uTurbidity.value = params.optics.turbidity;
    mat.uniforms.uFresnelPower.value = params.optics.fresnelPower;
    mat.uniforms.uIOR.value = params.optics.ior;
    mat.uniforms.uFoamThreshold.value = params.foam.threshold;
    mat.uniforms.uFoamCoverage.value = params.foam.coverage;
    mat.uniforms.uFoamIntensity.value = params.foam.intensity;
    mat.uniforms.uShallowColor.value.set(...params.depth.shallowColor);
    mat.uniforms.uDeepColor.value.set(...params.depth.deepColor);
    mat.uniforms.uWaterDepth.value = params.depth.waterDepth;
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[100, 100, 256, 256]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
