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

// ——— Voronoi foam texture ———
float voronoiFoam(vec2 uv) {
  vec2 i = floor(uv);
  vec2 f = fract(uv);
  float d = 1.0;
  for (int x = -1; x <= 1; x++) {
    for (int y = -1; y <= 1; y++) {
      vec2 nb = vec2(float(x), float(y));
      vec2 pt = vec2(hash21(i + nb), hash21(i + nb + 100.0));
      pt = 0.5 + 0.5 * sin(uTime * uFoamNoiseSpeed + 6.283 * pt);
      d = min(d, length(nb + pt - f));
    }
  }
  return 1.0 - smoothstep(0.0, 0.35, d);
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

#define TAU 6.28318530718

// ——— Color temperature to RGB (approximate) ———
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

// ——— Fresnel (Schlick) ———
float fresnel(vec3 V, vec3 N) {
  float f0 = pow((1.0 - uIOR) / (1.0 + uIOR), 2.0);
  f0 = max(f0, uFresnelBias);
  return f0 + (1.0 - f0) * pow(clamp(1.0 - max(dot(V, N), 0.0), 0.0, 1.0), uFresnelPower);
}

// ——— Sky model ———
vec3 getSkyColor(vec3 dir) {
  float y = max(dir.y, 0.0);
  vec3 sky = mix(uHorizonColor, uSkyColor, pow(y, 0.4 / max(uSkyTurbidity * 0.5, 0.1)));
  
  // Sun
  vec3 sunCol = colorTemp(uSunColorTemp);
  float sunDot = max(dot(dir, normalize(uSunDir)), 0.0);
  sky += sunCol * pow(sunDot, 256.0) * 4.0 * uSunIntensity;
  sky += sunCol * pow(sunDot, 16.0) * 0.5 * uSunIntensity;
  
  // Mie scattering halo
  sky += vec3(1.0, 0.9, 0.7) * pow(sunDot, 4.0) * uMieCoeff * 20.0;
  
  // Rayleigh bluing
  sky *= mix(vec3(1.0), vec3(0.7, 0.8, 1.0), uRayleighCoeff * (1.0 - y) * 0.3);
  
  // Moon
  if (uMoonIntensity > 0.01) {
    vec3 moonDir = normalize(vec3(-uSunDir.x, max(uSunDir.y * 0.3, 0.1), -uSunDir.z));
    float moonDot = max(dot(dir, moonDir), 0.0);
    sky += vec3(0.6, 0.65, 0.8) * pow(moonDot, 128.0) * uMoonIntensity;
  }
  
  // Cloud approximation
  if (uCloudCover > 0.01) {
    float cloudPattern = smoothstep(0.4, 0.6, 
      hash21(dir.xz * 3.0 + uTime * 0.001) * 0.5 + 
      hash21(dir.xz * 7.0 - uTime * 0.002) * 0.3 +
      hash21(dir.xz * 13.0) * 0.2
    );
    sky = mix(sky, vec3(0.8, 0.82, 0.85) * uSkyIntensity, cloudPattern * uCloudCover * (1.0 - pow(y, 0.3)));
  }
  
  return sky * uSkyIntensity;
}

// ——— GGX NDF ———
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

  // ═══ Fresnel ═══
  float F = fresnel(V, N);

  // ═══ Reflection ═══
  vec3 distortedR = normalize(R + N * uReflectionDistortion);
  vec3 reflection = getSkyColor(distortedR);

  // ═══ Specular: dual-lobe GGX ═══
  float NdotH = max(dot(N, H), 0.0);
  float NdotL = max(dot(N, L), 0.0);
  vec3 sunCol = colorTemp(uSunColorTemp);
  float spec1 = ggx(NdotH, uSpecRoughness1);
  float spec2 = ggx(NdotH, uSpecRoughness2);
  vec3 spec = sunCol * (spec1 + spec2 * 0.25) * uSpecIntensity * uSunIntensity;

  // ═══ Water body color with Beer-Lambert ═══
  float depth = max(uWaterDepth * 0.5 - vHeight * 2.0, 0.5);
  vec3 absorption = vec3(
    exp(-uAbsorptionR * depth * uExtinction.r),
    exp(-uAbsorptionG * depth * uExtinction.g),
    exp(-uAbsorptionB * depth * uExtinction.b)
  );
  float df = clamp(depth / uWaterDepth, 0.0, 1.0);
  df = pow(df, uGradientPower);
  df = mix(df, df * df, uColorGradientBias);
  vec3 waterCol = mix(uShallowColor, uDeepColor, df) * absorption;
  waterCol *= 1.0 - uDepthDarkening * df;

  // ═══ Subsurface scattering ═══
  float sssForward = pow(clamp(dot(V, -L + N * uSSSDistortion), 0.0, 1.0), uSSSPower);
  float sssBack = pow(clamp(dot(-V, -L + N * 0.2), 0.0, 1.0), uSSSPower * 0.5) * uBackScatter;
  float hScat = smoothstep(0.0, 1.0, vHeight * 0.5 + 0.5) * uForwardScatter * 0.4;
  vec3 scatter = uSSSColor * (sssForward * uForwardScatter + sssBack + hScat) * uSSSIntensity * uScatterCoeff;

  // ═══ Turbidity ═══
  waterCol = mix(waterCol, vec3(0.22, 0.28, 0.16), uTurbidity * 0.6);
  
  // ═══ Caustics ═══
  if (uCausticsEnabled > 0.5) {
    float caustDepth = exp(-depth * uCausticsDepthAtten * 0.1);
    vec2 caustUV = vWorldPos.xz / uCausticsScale;
    float c1 = cellNoise(caustUV + uTime * uCausticsSpeed * 0.1);
    float c2 = cellNoise(caustUV * 1.4 - uTime * uCausticsSpeed * 0.07);
    float caustic = pow(c1 * c2, uCausticsComplexity) * uCausticsIntensity * caustDepth;
    
    // Chromatic split
    float cr = pow(cellNoise(caustUV + vec2(uCausticsChromaticSplit, 0.0) + uTime * uCausticsSpeed * 0.1) * c2, uCausticsComplexity);
    float cb = pow(cellNoise(caustUV - vec2(uCausticsChromaticSplit, 0.0) + uTime * uCausticsSpeed * 0.1) * c2, uCausticsComplexity);
    vec3 caustColor = vec3(cr, caustic, cb) * uCausticsIntensity * caustDepth;
    waterCol += caustColor * 0.3;
  }

  // ═══ Combine refracted color ═══
  vec3 refracted = waterCol + scatter + waterCol * NdotL * 0.15;
  refracted += uAmbientColor * uAmbientIntensity * waterCol;

  // ═══ Combine reflection + refraction ═══
  vec3 color = mix(refracted, reflection, F) + spec;

  // ═══ Foam ═══
  float foamMask = smoothstep(uFoamThreshold, uFoamThreshold + 0.2, vFoamFactor) * uFoamCoverage;
  
  // Whitecap foam from Jacobian
  float whitecap = smoothstep(uWhitecapThreshold, uWhitecapThreshold + 0.15, vJacobian * 0.3) * uWhitecapIntensity;
  foamMask = max(foamMask, whitecap);
  
  // Edge foam
  foamMask += smoothstep(0.7, 1.0, vSteepness) * uFoamEdge * 0.5;
  
  // Foam texture
  float ft1 = voronoiFoam(vWorldPos.xz * uFoamNoiseScale * 0.8);
  float ft2 = voronoiFoam(vWorldPos.xz * uFoamNoiseScale * 2.0 - uTime * 0.06);
  float ft3 = voronoiFoam(vWorldPos.xz * uFoamNoiseScale * 4.0 + uTime * 0.04);
  float foam = foamMask * (ft1 * 0.4 + ft2 * 0.35 + ft3 * 0.25);
  
  // Bubble detail
  float bubbles = voronoiFoam(vWorldPos.xz * uFoamNoiseScale * 6.0 + uTime * 0.1) * uBubbleDensity;
  foam += foamMask * bubbles * 0.15;
  
  vec3 foamCol = uFoamColor * uFoamIntensity * (0.6 + NdotL * 0.4);
  foamCol *= 1.0 + uWetness * 0.2 * (1.0 - foam);
  color = mix(color, foamCol, clamp(foam, 0.0, 1.0));

  // ═══ God rays ═══
  if (uGodRayIntensity > 0.01) {
    float godRay = pow(max(dot(V, L), 0.0), 8.0) * uGodRayIntensity;
    color += sunCol * godRay * 0.1;
  }

  // ═══ Atmospheric fog ═══
  float dist = length(vWorldPos - cameraPosition);
  float fogFactor = 1.0 - exp(-dist * uFogDensity);
  
  // Height-based haze
  float heightFog = exp(-max(vWorldPos.y, 0.0) * 0.1) * uHazeIntensity;
  fogFactor = max(fogFactor, heightFog * 0.3);
  
  // Fog receives sun color near horizon
  vec3 fogCol = uFogColor;
  float sunFog = pow(max(dot(normalize(vWorldPos - cameraPosition), L), 0.0), 8.0);
  fogCol += sunCol * sunFog * 0.15 * uSunIntensity;
  
  color = mix(color, fogCol, clamp(fogFactor, 0.0, 1.0));

  // ═══ Depth fog ═══
  color = mix(color, uFogColor * 0.5, (1.0 - exp(-dist * uDepthFog * 0.001)) * 0.5);

  // ═══ Post-processing ═══
  // Exposure
  float exposure = uExposure * pow(2.0, uExposureBias);
  color *= exposure;
  
  // Bloom (simple threshold glow)
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
    float grain = (hash21(gl_FragCoord.xy + fract(uTime) * 100.0) - 0.5) * uFilmGrain * 0.1;
    color += grain;
  }

  // Vignette
  if (uVignetteIntensity > 0.001) {
    vec2 uv = gl_FragCoord.xy / vec2(1920.0, 1080.0); // approximate
    float vig = smoothstep(uVignetteRadius, uVignetteRadius - 0.3, length(uv - 0.5));
    color *= mix(1.0, vig, uVignetteIntensity);
  }

  gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}
`;
