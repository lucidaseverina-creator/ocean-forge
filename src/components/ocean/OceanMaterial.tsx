import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { OceanParams } from "@/types/ocean-params";

const vertexShader = `
  precision highp float;
  uniform float uTime;
  uniform float uAmplitude;
  uniform float uFrequency;
  uniform float uSteepness;
  uniform float uSpeed;
  uniform float uDirection;
  uniform float uCapillaryScale;
  uniform float uCapillaryIntensity;
  uniform float uWindDir;
  uniform float uWindSpeed;

  varying vec3 vWorldPos;
  varying vec3 vNormal;
  varying float vFoamFactor;
  varying float vHeight;

  #define PI 3.14159265359

  // Pre-defined wave table: direction angle (rad), frequency multiplier, amplitude multiplier
  // 12 waves with very deliberate angular spread
  const int NUM_WAVES = 12;
  
  void main() {
    vec3 pos = position;
    // PlaneGeometry is XY; we rotate -PI/2 around X to lay flat.
    // So sample waves using pos.xy (which becomes xz after rotation).
    vec2 xz = pos.xy;

    float baseDir = uDirection * PI / 180.0;
    float windRad = uWindDir * PI / 180.0;

    // Explicitly define 12 waves with diverse directions
    // [angle_offset, freq_mult, amp_mult, speed_mult]
    // Swell: 4 waves, moderate spread
    // Cross swell: 3 waves, ~90 degrees off
    // Wind chop: 5 waves, high freq, all directions
    
    float angles[12];
    float freqs[12];
    float amps[12];
    float speeds[12];
    
    // Primary swell
    angles[0] = baseDir;
    angles[1] = baseDir + 0.35;
    angles[2] = baseDir - 0.25;
    angles[3] = baseDir + 0.7;
    
    // Cross swell  
    angles[4] = baseDir + 1.2;
    angles[5] = baseDir + 1.8;
    angles[6] = baseDir - 1.4;
    
    // Wind chop (varied directions)
    angles[7] = windRad + 0.0;
    angles[8] = windRad + 1.05;
    angles[9] = windRad - 0.9;
    angles[10] = windRad + 2.1;
    angles[11] = windRad - 1.7;
    
    // Swell: low freq, high amp
    freqs[0] = 0.3; freqs[1] = 0.45; freqs[2] = 0.55; freqs[3] = 0.7;
    amps[0] = 1.0;  amps[1] = 0.7;  amps[2] = 0.5;  amps[3] = 0.35;
    speeds[0] = 1.0; speeds[1] = 0.9; speeds[2] = 1.1; speeds[3] = 0.85;
    
    // Cross swell: medium freq, medium amp
    freqs[4] = 0.6; freqs[5] = 0.9; freqs[6] = 0.75;
    amps[4] = 0.4;  amps[5] = 0.25; amps[6] = 0.3;
    speeds[4] = 0.95; speeds[5] = 1.05; speeds[6] = 0.9;
    
    // Wind chop: high freq, low amp, wind-scaled
    float windScale = clamp(uWindSpeed / 10.0, 0.1, 2.0);
    freqs[7] = 1.5; freqs[8] = 2.2; freqs[9] = 1.8; freqs[10] = 2.8; freqs[11] = 3.2;
    amps[7] = 0.12 * windScale; amps[8] = 0.08 * windScale; amps[9] = 0.1 * windScale;
    amps[10] = 0.06 * windScale; amps[11] = 0.04 * windScale;
    speeds[7] = 1.3; speeds[8] = 1.5; speeds[9] = 1.2; speeds[10] = 1.6; speeds[11] = 1.4;

    vec3 totalDisp = vec3(0.0);
    vec3 T = vec3(1.0, 0.0, 0.0);
    vec3 B = vec3(0.0, 0.0, 1.0);
    float maxH = 0.0;

    for (int i = 0; i < NUM_WAVES; i++) {
      vec2 dir = vec2(cos(angles[i]), sin(angles[i]));
      float f = uFrequency * freqs[i];
      float a = uAmplitude * amps[i];
      float k = 2.0 * PI * f;
      float omega = sqrt(9.81 * k); // deep-water dispersion
      float phase = dot(dir, xz) * k - omega * uTime * uSpeed * speeds[i];
      float Q = uSteepness / (k * a * float(NUM_WAVES) * 0.25 + 0.001);
      Q = min(Q, 1.0); // clamp to prevent looping

      float sinP = sin(phase);
      float cosP = cos(phase);

      totalDisp.x += Q * a * dir.x * cosP;
      totalDisp.y += a * sinP;
      totalDisp.z += Q * a * dir.y * cosP;

      float WA = k * a;
      T.x -= Q * dir.x * dir.x * WA * sinP;
      T.y += dir.x * WA * cosP;
      T.z -= Q * dir.x * dir.y * WA * sinP;

      B.x -= Q * dir.x * dir.y * WA * sinP;
      B.y += dir.y * WA * cosP;
      B.z -= Q * dir.y * dir.y * WA * sinP;

      maxH += a;
    }

    // Capillary micro-ripples (4 directions, very fast, tiny amp)
    float capAngles[4];
    capAngles[0] = windRad;
    capAngles[1] = windRad + 1.57;
    capAngles[2] = windRad + 0.78;
    capAngles[3] = windRad - 0.78;
    
    for (int i = 0; i < 4; i++) {
      vec2 dir = vec2(cos(capAngles[i]), sin(capAngles[i]));
      float f = uCapillaryScale * (0.15 + float(i) * 0.08);
      float a = uCapillaryIntensity * 0.006 / (1.0 + float(i) * 0.5);
      float k = 2.0 * PI * f;
      float omega = sqrt(9.81 * k);
      float phase = dot(dir, xz + vec2(totalDisp.x, totalDisp.y) * 0.1) * k - omega * uTime * 2.5;
      float sinP = sin(phase);
      float cosP = cos(phase);
      
      totalDisp.y += a * sinP;
      float WA = k * a;
      T.y += dir.x * WA * cosP;
      B.y += dir.y * WA * cosP;
    }

    // PlaneGeometry is XY, rotation -PI/2 around X maps:
    // local X → world X, local Y → world Z, local -Z → world Y (up)
    // Gerstner wave space: X = horiz1, Y = height, Z = horiz2
    // Map to local: localX = waveX, localY = waveZ, localZ = -waveY
    pos.x += totalDisp.x;
    pos.y += totalDisp.z;
    pos.z -= totalDisp.y; // height goes into -Z (becomes +Y after rotation)

    // Remap normal from wave space (Y-up) to local space
    vec3 waveN = normalize(cross(B, T));
    waveN = faceforward(waveN, vec3(0.0, -1.0, 0.0), waveN);
    vec3 localN = vec3(waveN.x, waveN.z, -waveN.y);
    vNormal = normalize((modelMatrix * vec4(localN, 0.0)).xyz);
    vWorldPos = (modelMatrix * vec4(pos, 1.0)).xyz;
    vHeight = totalDisp.y;

    float heightRatio = totalDisp.y / (maxH + 0.001);
    float slopeMag = length(vec2(T.y, B.y));
    vFoamFactor = smoothstep(0.3, 0.85, heightRatio) * 0.8 + slopeMag * 0.4;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = `
  precision highp float;
  uniform float uTime;
  uniform vec3 uSunDir;
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

  varying vec3 vWorldPos;
  varying vec3 vNormal;
  varying float vFoamFactor;
  varying float vHeight;

  #define PI 3.14159265359

  float hash21(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  float voronoiFoam(vec2 uv) {
    vec2 i = floor(uv);
    vec2 f = fract(uv);
    float d = 1.0;
    for (int x = -1; x <= 1; x++) {
      for (int y = -1; y <= 1; y++) {
        vec2 nb = vec2(float(x), float(y));
        vec2 pt = vec2(hash21(i + nb), hash21(i + nb + 100.0));
        pt = 0.5 + 0.5 * sin(uTime * 0.3 + 6.283 * pt);
        d = min(d, length(nb + pt - f));
      }
    }
    return 1.0 - smoothstep(0.0, 0.35, d);
  }

  float fresnel(vec3 V, vec3 N, float power) {
    float f0 = pow((1.0 - uIOR) / (1.0 + uIOR), 2.0);
    return f0 + (1.0 - f0) * pow(clamp(1.0 - max(dot(V, N), 0.0), 0.0, 1.0), power);
  }

  vec3 getSkyColor(vec3 dir) {
    float y = max(dir.y, 0.0);
    vec3 horizon = vec3(0.55, 0.65, 0.78);
    vec3 zenith = vec3(0.08, 0.18, 0.45);
    vec3 sky = mix(horizon, zenith, pow(y, 0.4));
    float sunDot = max(dot(dir, normalize(uSunDir)), 0.0);
    sky += vec3(1.0, 0.9, 0.7) * pow(sunDot, 128.0) * 3.0;
    sky += vec3(1.0, 0.85, 0.6) * pow(sunDot, 12.0) * 0.4;
    return sky * uSkyIntensity;
  }

  float ggx(float NdotH, float r) {
    float a2 = r * r * r * r;
    float d = NdotH * NdotH * (a2 - 1.0) + 1.0;
    return a2 / (PI * d * d + 0.0001);
  }

  void main() {
    vec3 N = normalize(vNormal);
    vec3 V = normalize(cameraPosition - vWorldPos);
    vec3 L = normalize(uSunDir);
    vec3 H = normalize(L + V);
    vec3 R = reflect(-V, N);

    float F = fresnel(V, N, uFresnelPower);
    vec3 reflection = getSkyColor(R);

    float NdotH = max(dot(N, H), 0.0);
    vec3 sunCol = vec3(1.0, 0.95, 0.85);
    vec3 spec = sunCol * (ggx(NdotH, 0.015) + ggx(NdotH, 0.12) * 0.3) * uSunIntensity;

    float depth = max(uWaterDepth * 0.5 - vHeight * 2.0, 0.5);
    vec3 absorp = vec3(exp(-uAbsorptionR * depth), exp(-uAbsorptionG * depth), exp(-uAbsorptionB * depth));
    float df = clamp(depth / uWaterDepth, 0.0, 1.0);
    vec3 waterCol = mix(uShallowColor, uDeepColor, pow(df, 0.5)) * absorp;

    float NdotL = max(dot(N, L), 0.0);
    float sss = pow(clamp(dot(V, -L + N * 0.4), 0.0, 1.0), 4.0) * uScattering;
    float hScat = smoothstep(0.0, 1.0, vHeight * 0.5 + 0.5) * uScattering * 0.4;
    vec3 scatter = vec3(0.05, 0.65, 0.5) * (sss + hScat);

    waterCol = mix(waterCol, vec3(0.22, 0.28, 0.16), uTurbidity * 0.6);
    vec3 refracted = waterCol + scatter + waterCol * NdotL * 0.15;
    vec3 color = mix(refracted, reflection, F) + spec;
    color += waterCol * uAmbientIntensity;

    // Foam
    float foamMask = smoothstep(uFoamThreshold, uFoamThreshold + 0.2, vFoamFactor) * uFoamCoverage;
    float ft1 = voronoiFoam(vWorldPos.xz * 1.2 + uTime * 0.04);
    float ft2 = voronoiFoam(vWorldPos.xz * 2.5 - uTime * 0.06);
    float foam = foamMask * mix(ft1, ft2, 0.35);
    vec3 foamCol = vec3(0.85, 0.9, 0.95) * uFoamIntensity * (0.7 + NdotL * 0.3);
    color = mix(color, foamCol, clamp(foam, 0.0, 1.0));

    // Distance fog
    float dist = length(vWorldPos - cameraPosition);
    color = mix(color, vec3(0.035, 0.05, 0.09), 1.0 - exp(-dist * 0.007));

    // ACES tonemap
    color = color * (2.51 * color + 0.03) / (color * (2.43 * color + 0.59) + 0.14);
    color = pow(clamp(color, 0.0, 1.0), vec3(1.0 / 2.2));

    gl_FragColor = vec4(color, 1.0);
  }
`;

interface OceanMeshProps {
  params: OceanParams;
}

export function OceanMesh({ params }: OceanMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAmplitude: { value: params.waves.amplitude },
      uFrequency: { value: params.waves.frequency },
      uSteepness: { value: params.waves.steepness },
      uSpeed: { value: params.waves.speed },
      uDirection: { value: params.waves.direction },
      uCapillaryScale: { value: params.capillary.scale },
      uCapillaryIntensity: { value: params.capillary.intensity },
      uWindDir: { value: params.wind.direction },
      uWindSpeed: { value: params.wind.speed },
      uSunDir: { value: new THREE.Vector3(0, 1, 0) },
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
    const u = (meshRef.current.material as THREE.ShaderMaterial).uniforms;
    u.uTime.value = clock.getElapsedTime();
    u.uAmplitude.value = params.waves.amplitude;
    u.uFrequency.value = params.waves.frequency;
    u.uSteepness.value = params.waves.steepness;
    u.uSpeed.value = params.waves.speed;
    u.uDirection.value = params.waves.direction;
    u.uCapillaryScale.value = params.capillary.scale;
    u.uCapillaryIntensity.value = params.capillary.intensity;
    u.uWindDir.value = params.wind.direction;
    u.uWindSpeed.value = params.wind.speed;
    const az = (params.lighting.sunAzimuth * Math.PI) / 180;
    const el = (params.lighting.sunElevation * Math.PI) / 180;
    u.uSunDir.value.set(Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az));
    u.uSunIntensity.value = params.lighting.sunIntensity;
    u.uSkyIntensity.value = params.lighting.skyIntensity;
    u.uAmbientIntensity.value = params.lighting.ambientIntensity;
    u.uAbsorptionR.value = params.optics.absorptionR;
    u.uAbsorptionG.value = params.optics.absorptionG;
    u.uAbsorptionB.value = params.optics.absorptionB;
    u.uScattering.value = params.optics.scattering;
    u.uTurbidity.value = params.optics.turbidity;
    u.uFresnelPower.value = params.optics.fresnelPower;
    u.uIOR.value = params.optics.ior;
    u.uFoamThreshold.value = params.foam.threshold;
    u.uFoamCoverage.value = params.foam.coverage;
    u.uFoamIntensity.value = params.foam.intensity;
    u.uShallowColor.value.set(...params.depth.shallowColor);
    u.uDeepColor.value.set(...params.depth.deepColor);
    u.uWaterDepth.value = params.depth.waterDepth;
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[150, 150, 256, 256]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        side={THREE.FrontSide}
      />
    </mesh>
  );
}
