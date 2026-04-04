export const oceanVertexShader = /* glsl */ `
precision highp float;

uniform float uTime;

// Wave group arrays [primarySwell, secondarySwell, windSea, chop]
uniform float uWGEnabled[4];
uniform float uWGAmp[4];
uniform float uWGFreq[4];
uniform float uWGSteep[4];
uniform float uWGDir[4];
uniform float uWGSpeed[4];
uniform float uWGSpread[4];
uniform float uWGPhase[4];
uniform float uWGNumWaves[4];
uniform float uWGFreqSpread[4];
uniform float uWGAmpDecay[4];

// Global wave
uniform float uChoppiness;
uniform float uGlobalAmp;
uniform float uPeakSharp;
uniform float uNonlinearity;

// Wind
uniform float uWindSpeed;
uniform float uWindDir;
uniform float uGustIntensity;
uniform float uGustFreq;
uniform float uTurbulence;

// FBM detail
uniform float uFBMOctaves;
uniform float uFBMAmp;
uniform float uFBMFreq;
uniform float uFBMLacunarity;
uniform float uFBMGain;
uniform float uDomainWarp;
uniform float uWarpStrength;
uniform float uWarpFreq;

// Capillary
uniform float uCapScale;
uniform float uCapIntensity;
uniform float uCapWindAlign;
uniform float uCapDamping;
uniform float uCapFreqs[4];
uniform float uCapAmps[4];
uniform float uCapSpeed;

// Rain
uniform float uRainIntensity;
uniform float uRainDropScale;
uniform float uRainRippleIntensity;
uniform float uRainRippleScale;

// Foam computation
uniform float uJacobianThreshold;

varying vec3 vWorldPos;
varying vec3 vNormal;
varying float vFoamFactor;
varying float vHeight;
varying float vJacobian;
varying float vSteepness;
varying vec2 vUV;

#define PI 3.14159265359
#define TAU 6.28318530718
#define G 9.81

// ——— Hash functions ———
float hash11(float p) {
  p = fract(p * 0.1031);
  p *= p + 33.33;
  p *= p + p;
  return fract(p);
}

float hash21(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

vec2 hash22(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.xx + p3.yz) * p3.zy);
}

// ——— Simplex noise ———
vec3 mod289v3(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289v2(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289v3(((x * 34.0) + 10.0) * x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                      -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289v2(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m; m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

// ——— FBM with domain warping ———
float fbm(vec2 p, float octaves) {
  float value = 0.0;
  float amp = uFBMAmp;
  float freq = uFBMFreq;
  
  if (uDomainWarp > 0.01) {
    vec2 warp = vec2(
      snoise(p * uWarpFreq + uTime * 0.03),
      snoise(p * uWarpFreq + vec2(5.2, 1.3) + uTime * 0.03)
    );
    p += warp * uWarpStrength * uDomainWarp;
  }
  
  for (float i = 0.0; i < 8.0; i++) {
    if (i >= octaves) break;
    value += amp * snoise(p * freq + uTime * 0.05 * (i + 1.0));
    freq *= uFBMLacunarity;
    amp *= uFBMGain;
  }
  return value;
}

// ——— Gerstner wave with proper physics ———
// Returns: xyz = displacement, w = unused
// Also accumulates tangent/bitangent via out params
struct WaveResult {
  vec3 disp;
  float jacobian;
  float steepness;
};

void main() {
  vec3 pos = position;
  vec2 xz = pos.xy; // PlaneGeometry XY, rotated -PI/2 around X
  vUV = xz / 200.0 + 0.5;

  float windRad = uWindDir * PI / 180.0;

  // Gust modulation — slow, natural variation
  float gustMod = 1.0 + uGustIntensity * 0.5 * (
    sin(uTime * uGustFreq * 0.7) * 0.6 +
    sin(uTime * uGustFreq * 1.3 + 2.1) * 0.4
  );

  vec3 totalDisp = vec3(0.0);
  // Analytical normal via tangent/bitangent
  vec3 T = vec3(1.0, 0.0, 0.0); // dP/dx
  vec3 B = vec3(0.0, 0.0, 1.0); // dP/dz
  float maxH = 0.001;
  float jacobianAccum = 0.0;
  float steepnessAccum = 0.0;
  int totalWaveCount = 0;

  // ═══ Process 4 wave groups ═══
  for (int g = 0; g < 4; g++) {
    if (uWGEnabled[g] < 0.5) continue;
    
    float groupDir = uWGDir[g] * PI / 180.0;
    float groupAmp = uWGAmp[g] * uGlobalAmp;
    float groupFreq = uWGFreq[g];
    float groupSteep = uWGSteep[g];
    float groupSpeed = uWGSpeed[g];
    float spreadAngle = uWGSpread[g] * PI / 180.0;
    float phaseOff = uWGPhase[g];
    int nWaves = int(uWGNumWaves[g]);
    float freqSpread = uWGFreqSpread[g];
    float ampDecay = uWGAmpDecay[g];
    
    // Wind coupling for wind-sea and chop groups
    float windCoupling = (g >= 2) ? gustMod : 1.0;
    
    for (int w = 0; w < 8; w++) {
      if (w >= nWaves) break;
      totalWaveCount++;
      
      // Deterministic pseudo-random per wave
      float seed = float(g) * 17.31 + float(w) * 7.919;
      float randAngle = (hash11(seed) - 0.5) * 2.0 * spreadAngle;
      float randPhase = hash11(seed + 137.0) * TAU;
      float randAmpVar = 0.7 + 0.6 * hash11(seed + 251.0); // amplitude variation
      
      float angle = groupDir + randAngle;
      vec2 dir = vec2(cos(angle), sin(angle));
      
      // Frequency cascade with slight randomization
      float fMul = pow(freqSpread, float(w));
      float f = groupFreq * fMul * (0.9 + 0.2 * hash11(seed + 400.0));
      float a = groupAmp * pow(ampDecay, float(w)) * windCoupling * randAmpVar;
      
      // Peak sharpening: emphasize dominant waves
      float peakFactor = exp(-0.5 * pow(float(w) / max(float(nWaves) * 0.3, 1.0), 2.0) * (uPeakSharp - 1.0));
      a *= mix(1.0, peakFactor, clamp(uPeakSharp - 1.0, 0.0, 1.0));
      
      // Wavenumber and deep-water dispersion
      float k = TAU * f;
      float omega = sqrt(G * k);
      float phase = dot(dir, xz) * k - omega * uTime * groupSpeed + phaseOff + randPhase;
      
      // Steepness Q factor — THE critical constraint
      // Q = steepness / (k * A * N) — must stay well under 1/N to prevent looping
      float Q = groupSteep * uChoppiness;
      // Normalize by total contribution to prevent looping
      Q = Q / (k * a * float(nWaves) + 0.001);
      // Hard clamp — never allow Q that would cause surface folding
      Q = clamp(Q, 0.0, 1.0 / (float(nWaves) + 0.001));
      Q = min(Q, 0.28); // absolute safety cap
      
      float sinP = sin(phase);
      float cosP = cos(phase);
      
      // Nonlinearity: sharpen crests, flatten troughs (Stokes-like)
      float heightVal = a * sinP;
      float nl = uNonlinearity;
      if (nl > 0.01) {
        // Second-order Stokes correction
        float stokes2 = 0.5 * k * a * sinP * sinP;
        heightVal = a * sinP + nl * a * stokes2;
      }
      
      // Gerstner horizontal displacement
      totalDisp.x -= Q * a * dir.x * cosP;
      totalDisp.y += heightVal;
      totalDisp.z -= Q * a * dir.y * cosP;
      
      // Analytical tangent/bitangent for normal computation
      float WA = k * a;
      T.x -= Q * dir.x * dir.x * WA * sinP;
      T.y += dir.x * WA * cosP;
      T.z -= Q * dir.x * dir.y * WA * sinP;
      
      B.x -= Q * dir.x * dir.y * WA * sinP;
      B.y += dir.y * WA * cosP;
      B.z -= Q * dir.y * dir.y * WA * sinP;
      
      // Jacobian for foam detection
      float Jxx = 1.0 - Q * dir.x * dir.x * WA * sinP;
      float Jzz = 1.0 - Q * dir.y * dir.y * WA * sinP;
      float Jxz = -Q * dir.x * dir.y * WA * sinP;
      float J = Jxx * Jzz - Jxz * Jxz;
      jacobianAccum += (1.0 - J); // foam where J < 1
      
      steepnessAccum += WA * abs(cosP);
      maxH += a;
    }
  }

  // ═══ FBM noise — adds organic randomness ═══
  float fbmVal = fbm(xz * 0.015 + totalDisp.xz * 0.02, uFBMOctaves);
  totalDisp.y += fbmVal;
  
  // FBM gradient for normal perturbation
  float eps = 0.8;
  float fbmDx = fbm((xz + vec2(eps, 0.0)) * 0.015, max(uFBMOctaves - 1.0, 1.0))
              - fbm((xz - vec2(eps, 0.0)) * 0.015, max(uFBMOctaves - 1.0, 1.0));
  float fbmDz = fbm((xz + vec2(0.0, eps)) * 0.015, max(uFBMOctaves - 1.0, 1.0))
              - fbm((xz - vec2(0.0, eps)) * 0.015, max(uFBMOctaves - 1.0, 1.0));
  T.y += fbmDx / (2.0 * eps);
  B.y += fbmDz / (2.0 * eps);

  // ═══ Capillary micro-ripples ═══
  for (int i = 0; i < 4; i++) {
    float capAngle = windRad + float(i) * PI * 0.25 * (1.0 + uCapWindAlign)
                   + hash11(float(i) * 5.7 + 3.1) * PI * (1.0 - uCapWindAlign);
    vec2 dir = vec2(cos(capAngle), sin(capAngle));
    float f = uCapScale * uCapFreqs[i];
    float a = uCapIntensity * uCapAmps[i] * pow(uCapDamping, float(i));
    float k = TAU * f;
    float omega = sqrt(G * k + 0.074 / 1000.0 * k * k * k); // capillary-gravity dispersion
    float phase = dot(dir, xz + totalDisp.xz * 0.05) * k - omega * uTime * uCapSpeed;
    float sinP = sin(phase);
    float cosP = cos(phase);
    
    totalDisp.y += a * sinP;
    float WA = k * a;
    T.y += dir.x * WA * cosP;
    B.y += dir.y * WA * cosP;
  }

  // ═══ Rain ripples ═══
  if (uRainIntensity > 0.01) {
    for (int i = 0; i < 8; i++) {
      float timeSlot = floor(uTime * 2.0 + float(i) * 0.37);
      vec2 center = hash22(vec2(float(i) * 1.7 + 0.3, timeSlot)) * 160.0 - 80.0;
      float dist = length(xz - center);
      float rippleAge = fract(uTime * 2.0 + float(i) * 0.37);
      float radius = rippleAge * uRainRippleScale;
      float ringWidth = 1.5 + rippleAge * 2.0;
      float ring = exp(-pow(dist - radius, 2.0) / ringWidth) * (1.0 - rippleAge);
      ring *= exp(-dist * 0.05); // distance attenuation
      totalDisp.y += ring * uRainRippleIntensity * uRainIntensity * 0.03;
    }
  }

  // ═══ Apply displacement ═══
  // PlaneGeometry is in XY, rotated -PI/2 around X to become XZ
  // So: local X = world X, local Y = world Z, local Z = -world Y
  pos.x += totalDisp.x;
  pos.y += totalDisp.z;
  pos.z -= totalDisp.y;

  // ═══ Compute normal from cross(B, T) ═══
  vec3 waveN = normalize(cross(B, T));
  // Ensure normal faces upward (in wave space Y = up)
  if (waveN.y < 0.0) waveN = -waveN;
  // Transform from wave space (X, Y-up, Z) to local space (X, Y, -Z)
  vec3 localN = vec3(waveN.x, waveN.z, -waveN.y);
  vNormal = normalize((modelMatrix * vec4(localN, 0.0)).xyz);
  vWorldPos = (modelMatrix * vec4(pos, 1.0)).xyz;
  vHeight = totalDisp.y;

  // ═══ Foam from Jacobian + height + steepness ═══
  float heightRatio = totalDisp.y / (maxH + 0.001);
  float slopeMag = length(vec2(T.y, B.y));
  float jacobianFoam = smoothstep(uJacobianThreshold, uJacobianThreshold + 0.4, jacobianAccum);
  float crestFoam = smoothstep(0.4, 0.9, heightRatio) * 0.4;
  float slopeFoam = smoothstep(0.3, 1.5, slopeMag) * 0.3;
  vFoamFactor = crestFoam + slopeFoam + jacobianFoam * 0.6;
  vJacobian = jacobianAccum;
  vSteepness = steepnessAccum / float(max(totalWaveCount, 1));

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;
