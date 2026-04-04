export const oceanFragmentShader = /* glsl */ `
precision highp float;

uniform float uTime;

// Lighting
uniform vec3 uSunDir;
uniform float uSunIntensity;
uniform float uSunColorTemp;
uniform float uSkyIntensity;
uniform float uSkyTurbidity;
uniform float uAmbientIntensity;
uniform vec3 uAmbientColor;
uniform float uSpecRoughness1;
uniform float uSpecRoughness2;
uniform float uBloomThreshold;
uniform float uBloomIntensity;
uniform float uGodRayIntensity;
uniform float uMoonIntensity;
uniform float uExposureBias;

// Optics
uniform float uAbsorptionR;
uniform float uAbsorptionG;
uniform float uAbsorptionB;
uniform float uScatterCoeff;
uniform float uForwardScatter;
uniform float uBackScatter;
uniform float uTurbidity;
uniform float uFresnelPower;
uniform float uFresnelBias;
uniform float uIOR;
uniform float uSSSIntensity;
uniform float uSSSDistortion;
uniform float uSSSPower;
uniform vec3 uSSSColor;
uniform float uSpecRoughness;
uniform float uSpecIntensity;

// Depth
uniform float uWaterDepth;
uniform vec3 uShallowColor;
uniform vec3 uDeepColor;
uniform float uVisibility;
uniform vec3 uExtinction;
uniform float uGradientPower;
uniform float uDepthDarkening;
uniform float uDepthFog;
uniform float uColorGradientBias;

// Foam
uniform float uFoamThreshold;
uniform float uFoamCoverage;
uniform float uFoamIntensity;
uniform vec3 uFoamColor;
uniform float uFoamNoiseScale;
uniform float uFoamNoiseSpeed;
uniform float uFoamRoughness;
uniform float uFoamEdge;
uniform float uWhitecapThreshold;
uniform float uWhitecapIntensity;
uniform float uBubbleDensity;

// Atmosphere
uniform float uFogDensity;
uniform vec3 uFogColor;
uniform float uHazeIntensity;
uniform float uHorizonBlend;
uniform float uRayleighCoeff;
uniform float uMieCoeff;
uniform float uMieDirectional;
uniform vec3 uSkyColor;
uniform vec3 uHorizonColor;
uniform float uCloudCover;

// Surface
uniform float uNormalStrength;
uniform float uReflectionDistortion;
uniform float uWetness;
uniform float uRoughnessVariation;

// Caustics
uniform float uCausticsEnabled;
uniform float uCausticsIntensity;
uniform float uCausticsScale;
uniform float uCausticsSpeed;
uniform float uCausticsChromaticSplit;
uniform float uCausticsComplexity;
uniform float uCausticsDepthAtten;

// Post
uniform float uExposure;
uniform float uContrast;
uniform float uSaturation;
uniform float uVignetteIntensity;
uniform float uVignetteRadius;
uniform float uGamma;
uniform vec3 uColorTint;
uniform float uFilmGrain;

varying vec3 vWorldPos;
varying vec3 vNormal;
varying float vFoamFactor;
varying float vHeight;
varying float vJacobian;
varying float vSteepness;
varying vec2 vUV;

#define PI 3.14159265359
#define TAU 6.28318530718

// ——— Hash ———
float hash21(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float hash11(float p) {
  p = fract(p * 0.1031);
  p *= p + 33.33;
  p *= p + p;
  return fract(p);
}

// ——— Voronoi for foam texture ———
float voronoiFoam(vec2 uv) {
  vec2 i = floor(uv);
  vec2 f = fract(uv);
  float d = 1.0;
  for (int x = -1; x <= 1; x++) {
    for (int y = -1; y <= 1; y++) {
      vec2 nb = vec2(float(x), float(y));
      vec2 pt = vec2(hash21(i + nb), hash21(i + nb + 100.0));
      pt = 0.5 + 0.5 * sin(uTime * uFoamNoiseSpeed + TAU * pt);
      d = min(d, length(nb + pt - f));
    }
  }
  return 1.0 - smoothstep(0.0, 0.4, d);
}

// ——— Cellular noise for caustics ———
float cellNoise(vec2 uv) {
  vec2 i = floor(uv);
  vec2 f = fract(uv);
  float d1 = 8.0, d2 = 8.0;
  for (int x = -1; x <= 1; x++) {
    for (int y = -1; y <= 1; y++) {
      vec2 nb = vec2(float(x), float(y));
      vec2 pt = vec2(hash21(i + nb + 200.0), hash21(i + nb + 300.0));
      pt = 0.5 + 0.5 * sin(uTime * uCausticsSpeed + TAU * pt);
      float d = length(nb + pt - f);
      if (d < d1) { d2 = d1; d1 = d; }
      else if (d < d2) { d2 = d; }
    }
  }
  return d2 - d1;
}

// ——— Color temperature to RGB ———
vec3 colorTemp(float temp) {
  float t = temp / 100.0;
  vec3 col;
  if (t <= 66.0) {
    col.r = 1.0;
    col.g = clamp(0.39 * log(t) - 0.63, 0.0, 1.0);
  } else {
    col.r = clamp(1.29 * pow(t - 60.0, -0.13), 0.0, 1.0);
    col.g = clamp(1.13 * pow(t - 60.0, -0.076), 0.0, 1.0);
  }
  if (t >= 66.0) col.b = 1.0;
  else if (t <= 19.0) col.b = 0.0;
  else col.b = clamp(0.54 * log(t - 10.0) - 1.19, 0.0, 1.0);
  return col;
}

// ——— Fresnel (Schlick with roughness) ———
float fresnel(vec3 V, vec3 N) {
  float f0 = pow((1.0 - uIOR) / (1.0 + uIOR), 2.0);
  f0 = max(f0, uFresnelBias);
  float cosTheta = max(dot(V, N), 0.0);
  return f0 + (1.0 - f0) * pow(1.0 - cosTheta, uFresnelPower);
}

// ——— Physically-based sky ———
vec3 getSkyColor(vec3 dir) {
  float y = max(dir.y, 0.001);
  
  // Gradient from horizon to zenith
  float horizonFade = pow(1.0 - y, 3.0 / max(uSkyTurbidity * 0.5, 0.1));
  vec3 sky = mix(uSkyColor, uHorizonColor, horizonFade);
  
  // Rayleigh scattering — blue overhead, warm at horizon
  vec3 rayleigh = vec3(0.15, 0.35, 0.65) * uRayleighCoeff;
  sky = mix(sky, sky + rayleigh * 0.15, y);
  
  // Sun disk and glow
  vec3 sunCol = colorTemp(uSunColorTemp);
  vec3 sunDirN = normalize(uSunDir);
  float sunDot = max(dot(dir, sunDirN), 0.0);
  
  // Sharp sun disk
  sky += sunCol * pow(sunDot, 512.0) * 8.0 * uSunIntensity;
  // Sun glow / corona
  sky += sunCol * pow(sunDot, 32.0) * 0.8 * uSunIntensity;
  // Wider warm glow near sun
  sky += sunCol * pow(sunDot, 4.0) * 0.15 * uSunIntensity;
  
  // Mie scattering (forward scatter halo)
  float miePhase = (1.0 - uMieDirectional * uMieDirectional) / 
                   pow(1.0 + uMieDirectional * uMieDirectional - 2.0 * uMieDirectional * sunDot, 1.5);
  sky += vec3(1.0, 0.95, 0.85) * miePhase * uMieCoeff * 0.5;
  
  // Moon
  if (uMoonIntensity > 0.01) {
    vec3 moonDir = normalize(vec3(-sunDirN.x, max(0.15, sunDirN.y * 0.3), -sunDirN.z));
    float moonDot = max(dot(dir, moonDir), 0.0);
    sky += vec3(0.55, 0.6, 0.75) * pow(moonDot, 256.0) * uMoonIntensity * 2.0;
    sky += vec3(0.3, 0.35, 0.5) * pow(moonDot, 16.0) * uMoonIntensity * 0.3;
  }
  
  // Clouds
  if (uCloudCover > 0.01) {
    float cloudPattern = smoothstep(0.4, 0.7,
      hash21(dir.xz * 2.5 + uTime * 0.0005) * 0.5 +
      hash21(dir.xz * 6.0 - uTime * 0.001) * 0.3 +
      hash21(dir.xz * 15.0 + 7.0) * 0.2
    );
    vec3 cloudCol = mix(vec3(0.9), sunCol * 0.8, pow(max(sunDot, 0.0), 2.0) * 0.3);
    sky = mix(sky, cloudCol * uSkyIntensity, cloudPattern * uCloudCover * (1.0 - pow(y, 0.2)));
  }
  
  return sky * uSkyIntensity;
}

// ——— GGX NDF ———
float ggxNDF(float NdotH, float roughness) {
  float a = roughness * roughness;
  float a2 = a * a;
  float d = NdotH * NdotH * (a2 - 1.0) + 1.0;
  return a2 / (PI * d * d + 1e-7);
}

// ——— Smith GGX Geometry ———
float smithG(float NdotV, float NdotL, float roughness) {
  float r = roughness + 1.0;
  float k = (r * r) / 8.0;
  float gV = NdotV / (NdotV * (1.0 - k) + k);
  float gL = NdotL / (NdotL * (1.0 - k) + k);
  return gV * gL;
}

void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(cameraPosition - vWorldPos);
  vec3 L = normalize(uSunDir);
  vec3 H = normalize(L + V);
  vec3 R = reflect(-V, N);

  float NdotV = max(dot(N, V), 0.001);
  float NdotL = max(dot(N, L), 0.0);
  float NdotH = max(dot(N, H), 0.0);
  float VdotH = max(dot(V, H), 0.0);

  // ═══ Fresnel ═══
  float F = fresnel(V, N);

  // ═══ Reflection — sample sky ═══
  vec3 distortedR = normalize(R + N * uReflectionDistortion * 0.5);
  vec3 reflection = getSkyColor(distortedR);

  // ═══ Dual-lobe GGX specular ═══
  vec3 sunCol = colorTemp(uSunColorTemp);
  
  // Primary sharp specular (sun reflection on water)
  float D1 = ggxNDF(NdotH, uSpecRoughness1);
  float G1 = smithG(NdotV, NdotL, uSpecRoughness1);
  vec3 spec1 = sunCol * D1 * G1 * F / (4.0 * NdotV * NdotL + 0.001);
  
  // Secondary broad specular (sky reflection)
  float D2 = ggxNDF(NdotH, uSpecRoughness2);
  vec3 spec2 = sunCol * D2 * 0.15;
  
  vec3 spec = (spec1 + spec2) * uSpecIntensity * uSunIntensity * NdotL;

  // ═══ Water body color — Beer-Lambert absorption ═══
  float depth = max(uWaterDepth * 0.3 - vHeight * 3.0, 0.1);
  vec3 absorption = vec3(
    exp(-uAbsorptionR * depth * uExtinction.r),
    exp(-uAbsorptionG * depth * uExtinction.g),
    exp(-uAbsorptionB * depth * uExtinction.b)
  );
  
  float df = clamp(depth / uWaterDepth, 0.0, 1.0);
  df = pow(df, uGradientPower);
  df = mix(df, df * df, uColorGradientBias);
  vec3 waterCol = mix(uShallowColor, uDeepColor, df) * absorption;
  waterCol *= 1.0 - uDepthDarkening * df * 0.5;

  // ═══ Subsurface scattering ═══
  // Forward scatter — light passing through wave crests
  vec3 sssLight = L + N * uSSSDistortion;
  float sssDot = pow(clamp(dot(V, -sssLight), 0.0, 1.0), uSSSPower);
  
  // Height-dependent SSS — thin crests scatter more
  float sssHeight = smoothstep(-0.2, 0.8, vHeight * 0.3 + 0.3);
  
  // Back-scatter
  float backScatter = pow(clamp(dot(-V, -sssLight), 0.0, 1.0), uSSSPower * 0.5) * uBackScatter;
  
  vec3 sss = uSSSColor * sunCol * (
    sssDot * uForwardScatter * sssHeight +
    backScatter * 0.5
  ) * uSSSIntensity * uScatterCoeff * uSunIntensity;

  // ═══ Turbidity ═══
  waterCol = mix(waterCol, vec3(0.18, 0.22, 0.12), uTurbidity * 0.5);

  // ═══ Caustics ═══
  if (uCausticsEnabled > 0.5 && depth < uWaterDepth * 0.8) {
    float caustDepth = exp(-depth * uCausticsDepthAtten * 0.15);
    vec2 caustUV = vWorldPos.xz / uCausticsScale;
    float c1 = cellNoise(caustUV + uTime * uCausticsSpeed * 0.08);
    float c2 = cellNoise(caustUV * 1.5 - uTime * uCausticsSpeed * 0.05);
    float caustic = pow(c1 * c2, uCausticsComplexity) * uCausticsIntensity * caustDepth;
    
    // Chromatic caustics
    float cr = pow(cellNoise(caustUV + vec2(uCausticsChromaticSplit, 0.0) + uTime * uCausticsSpeed * 0.08) * c2, uCausticsComplexity);
    float cb = pow(cellNoise(caustUV - vec2(uCausticsChromaticSplit, 0.0) + uTime * uCausticsSpeed * 0.08) * c2, uCausticsComplexity);
    vec3 caustColor = vec3(cr, caustic, cb) * uCausticsIntensity * caustDepth;
    waterCol += caustColor * 0.2 * sunCol;
  }

  // ═══ Refracted color ═══
  vec3 refracted = waterCol + sss;
  // Diffuse lighting on water body
  refracted += waterCol * NdotL * sunCol * uSunIntensity * 0.1;
  // Ambient
  refracted += uAmbientColor * uAmbientIntensity * waterCol;

  // ═══ Final composite: reflection + refraction ═══
  vec3 color = mix(refracted, reflection, F) + spec;

  // ═══ Foam ═══
  float foamMask = smoothstep(uFoamThreshold, uFoamThreshold + 0.25, vFoamFactor) * uFoamCoverage;
  
  // Whitecap foam
  float whitecap = smoothstep(uWhitecapThreshold, uWhitecapThreshold + 0.2, vJacobian * 0.4) * uWhitecapIntensity;
  foamMask = max(foamMask, whitecap);
  
  // Edge/crest foam
  foamMask += smoothstep(0.6, 1.2, vSteepness) * uFoamEdge * 0.4;
  foamMask = clamp(foamMask, 0.0, 1.0);
  
  if (foamMask > 0.01) {
    // Multi-octave foam texture
    float ft1 = voronoiFoam(vWorldPos.xz * uFoamNoiseScale * 0.6);
    float ft2 = voronoiFoam(vWorldPos.xz * uFoamNoiseScale * 1.5 - uTime * 0.04);
    float ft3 = voronoiFoam(vWorldPos.xz * uFoamNoiseScale * 3.5 + uTime * 0.03);
    float foam = foamMask * (ft1 * 0.45 + ft2 * 0.35 + ft3 * 0.2);
    
    // Bubbles
    float bubbles = voronoiFoam(vWorldPos.xz * uFoamNoiseScale * 5.0 + uTime * 0.08) * uBubbleDensity;
    foam += foamMask * bubbles * 0.12;
    
    // Foam lit by sun
    vec3 foamCol = uFoamColor * uFoamIntensity * (0.5 + NdotL * 0.5) * (0.8 + uSunIntensity * 0.2);
    color = mix(color, foamCol, clamp(foam, 0.0, 1.0));
  }

  // ═══ God rays ═══
  if (uGodRayIntensity > 0.01) {
    float godRay = pow(max(dot(V, L), 0.0), 12.0) * uGodRayIntensity;
    color += sunCol * godRay * 0.08;
  }

  // ═══ Atmospheric fog ═══
  float dist = length(vWorldPos - cameraPosition);
  float fogFactor = 1.0 - exp(-dist * uFogDensity);
  
  // Height-dependent haze
  float heightFog = exp(-max(vWorldPos.y, 0.0) * 0.15) * uHazeIntensity;
  fogFactor = max(fogFactor, heightFog * 0.2);
  
  // Sun-colored fog near horizon
  vec3 viewDir = normalize(vWorldPos - cameraPosition);
  vec3 fogCol = uFogColor;
  float sunFogDot = pow(max(dot(viewDir, L), 0.0), 6.0);
  fogCol += sunCol * sunFogDot * 0.12 * uSunIntensity;
  
  // Blend in sky color at distance for continuity
  fogCol = mix(fogCol, getSkyColor(viewDir) * 0.3, clamp(fogFactor * 0.5, 0.0, 0.4));
  
  color = mix(color, fogCol, clamp(fogFactor, 0.0, 1.0));

  // ═══ Post-processing ═══
  // Exposure
  float exposure = uExposure * pow(2.0, uExposureBias);
  color *= exposure;
  
  // Bloom
  vec3 bloom = max(color - uBloomThreshold, 0.0) * uBloomIntensity;
  color += bloom;

  // ACES tonemap
  color = color * (2.51 * color + 0.03) / (color * (2.43 * color + 0.59) + 0.14);

  // Contrast
  color = mix(vec3(0.5), color, uContrast);

  // Saturation
  float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
  color = mix(vec3(luma), color, uSaturation);

  // Color tint
  color *= uColorTint;

  // Gamma
  color = pow(clamp(color, 0.0, 1.0), vec3(1.0 / uGamma));

  // Film grain
  if (uFilmGrain > 0.001) {
    float grain = (hash21(gl_FragCoord.xy + fract(uTime) * 100.0) - 0.5) * uFilmGrain * 0.08;
    color += grain;
  }

  // Vignette
  if (uVignetteIntensity > 0.001) {
    vec2 uv = gl_FragCoord.xy / vec2(1920.0, 1080.0);
    float vig = smoothstep(uVignetteRadius, uVignetteRadius - 0.35, length(uv - 0.5));
    color *= mix(1.0, vig, uVignetteIntensity);
  }

  gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}
`;
