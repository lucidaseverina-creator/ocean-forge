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

// ——— Simplex-like noise for FBM ———
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x * 34.0) + 10.0) * x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                      -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
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
  
  // Domain warp
  if (uDomainWarp > 0.01) {
    vec2 warp = vec2(
      snoise(p * uWarpFreq + uTime * 0.05),
      snoise(p * uWarpFreq + vec2(5.2, 1.3) + uTime * 0.05)
    );
    p += warp * uWarpStrength * uDomainWarp;
  }
  
  for (float i = 0.0; i < 8.0; i++) {
    if (i >= octaves) break;
    value += amp * snoise(p * freq + uTime * 0.1 * (i + 1.0));
    freq *= uFBMLacunarity;
    amp *= uFBMGain;
  }
  return value;
}

void main() {
  vec3 pos = position;
  vec2 xz = pos.xy; // PlaneGeometry XY, rotated -PI/2 around X
  vUV = xz / 150.0 + 0.5;

  float windRad = uWindDir * PI / 180.0;

  // Gust modulation
  float gustMod = 1.0 + uGustIntensity * sin(uTime * uGustFreq * TAU) * 0.5;

  vec3 totalDisp = vec3(0.0);
  vec3 T = vec3(1.0, 0.0, 0.0);
  vec3 B = vec3(0.0, 0.0, 1.0);
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
    
    // Wind coupling for wind-sea and chop groups (g >= 2)
    float windCoupling = (g >= 2) ? gustMod : 1.0;
    
    for (int w = 0; w < 8; w++) {
      if (w >= nWaves) break;
      totalWaveCount++;
      
      // Pseudo-random direction offset within spread
      float seed = float(g) * 13.37 + float(w) * 7.13;
      float randAngle = (hash11(seed) - 0.5) * 2.0 * spreadAngle;
      float randPhase = hash11(seed + 100.0) * TAU;
      
      float angle = groupDir + randAngle;
      vec2 dir = vec2(cos(angle), sin(angle));
      
      // Frequency cascade
      float f = groupFreq * pow(freqSpread, float(w));
      float a = groupAmp * pow(ampDecay, float(w)) * windCoupling;
      
      // Apply peak sharpening (sharpen primary waves, soften higher freq)
      a *= mix(1.0, pow(ampDecay, float(w) * 0.5), uPeakSharp - 1.0);
      
      float k = TAU * f;
      float omega = sqrt(9.81 * k); // Deep-water dispersion
      float phase = dot(dir, xz) * k - omega * uTime * groupSpeed + phaseOff + randPhase;
      
      // Steepness (Q factor) — prevent looping
      float Q = groupSteep * uChoppiness / (k * a * float(nWaves) + 0.001);
      Q = clamp(Q, 0.0, 0.35);
      
      float sinP = sin(phase);
      float cosP = cos(phase);
      
      // Nonlinearity: sharpen crests, flatten troughs
      float nl = uNonlinearity;
      float heightVal = a * sinP;
      if (nl > 0.01) {
        heightVal = a * (sinP + nl * sinP * abs(sinP));
      }
      
      totalDisp.x += Q * a * dir.x * cosP;
      totalDisp.y += heightVal;
      totalDisp.z += Q * a * dir.y * cosP;
      
      // Tangent/Bitangent accumulation for normals
      float WA = k * a;
      T.x -= Q * dir.x * dir.x * WA * sinP;
      T.y += dir.x * WA * cosP;
      T.z -= Q * dir.x * dir.y * WA * sinP;
      
      B.x -= Q * dir.x * dir.y * WA * sinP;
      B.y += dir.y * WA * cosP;
      B.z -= Q * dir.y * dir.y * WA * sinP;
      
      // Jacobian determinant components for foam
      jacobianAccum += Q * dir.x * dir.x * WA * sinP;
      jacobianAccum += Q * dir.y * dir.y * WA * sinP;
      steepnessAccum += WA * abs(cosP);
      
      maxH += a;
    }
  }

  // ═══ FBM noise displacement ═══
  float fbmDisp = fbm(xz * 0.02 + totalDisp.xz * 0.05, uFBMOctaves);
  totalDisp.y += fbmDisp;
  
  // Perturb tangent/bitangent with FBM gradient (finite differences)
  float eps = 0.5;
  float fbmDx = fbm((xz + vec2(eps, 0.0)) * 0.02, uFBMOctaves) - fbm((xz - vec2(eps, 0.0)) * 0.02, uFBMOctaves);
  float fbmDz = fbm((xz + vec2(0.0, eps)) * 0.02, uFBMOctaves) - fbm((xz - vec2(0.0, eps)) * 0.02, uFBMOctaves);
  T.y += fbmDx / (2.0 * eps);
  B.y += fbmDz / (2.0 * eps);

  // ═══ Capillary micro-ripples ═══
  for (int i = 0; i < 4; i++) {
    float capAngle = windRad + float(i) * PI * 0.5 * uCapWindAlign + hash11(float(i) * 3.7) * PI * (1.0 - uCapWindAlign);
    vec2 dir = vec2(cos(capAngle), sin(capAngle));
    float f = uCapScale * uCapFreqs[i];
    float a = uCapIntensity * uCapAmps[i] * pow(uCapDamping, float(i));
    float k = TAU * f;
    float omega = sqrt(9.81 * k);
    float phase = dot(dir, xz + totalDisp.xz * 0.1) * k - omega * uTime * uCapSpeed;
    float sinP = sin(phase);
    float cosP = cos(phase);
    
    totalDisp.y += a * sinP;
    float WA = k * a;
    T.y += dir.x * WA * cosP;
    B.y += dir.y * WA * cosP;
  }

  // ═══ Rain ripples ═══
  if (uRainIntensity > 0.01) {
    for (int i = 0; i < 6; i++) {
      vec2 center = hash22(vec2(float(i) * 1.7, floor(uTime * uRainDropScale + float(i) * 0.3))) * 150.0 - 75.0;
      float dist = length(xz - center);
      float rippleTime = fract(uTime * uRainDropScale * 0.5 + hash11(float(i) * 2.3));
      float radius = rippleTime * uRainRippleScale;
      float ringWidth = 2.0;
      float ring = exp(-pow(dist - radius, 2.0) / ringWidth) * (1.0 - rippleTime);
      totalDisp.y += ring * uRainRippleIntensity * uRainIntensity * 0.05;
    }
  }

  // ═══ Apply displacement to local-space coords ═══
  pos.x += totalDisp.x;
  pos.y += totalDisp.z;
  pos.z -= totalDisp.y;

  // ═══ Compute normal ═══
  vec3 waveN = normalize(cross(B, T));
  waveN = faceforward(waveN, vec3(0.0, -1.0, 0.0), waveN);
  vec3 localN = vec3(waveN.x, waveN.z, -waveN.y);
  vNormal = normalize((modelMatrix * vec4(localN, 0.0)).xyz);
  vWorldPos = (modelMatrix * vec4(pos, 1.0)).xyz;
  vHeight = totalDisp.y;

  // ═══ Foam factor from Jacobian + height + slope ═══
  float heightRatio = totalDisp.y / (maxH + 0.001);
  float slopeMag = length(vec2(T.y, B.y));
  float jacobianFoam = smoothstep(uJacobianThreshold, uJacobianThreshold + 0.3, jacobianAccum * 0.5);
  vFoamFactor = smoothstep(0.25, 0.8, heightRatio) * 0.6 + slopeMag * 0.3 + jacobianFoam * 0.5;
  vJacobian = jacobianAccum;
  vSteepness = steepnessAccum / float(max(totalWaveCount, 1));

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;
