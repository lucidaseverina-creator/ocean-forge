export const oceanVertexShader = /* glsl */ `
precision highp float;

#define NGROUPS 8
#define MAX_SUBWAVES 8

uniform float uTime;

// Wave group arrays — 8 groups
uniform float uWGEnabled[NGROUPS];
uniform float uWGAmp[NGROUPS];
uniform float uWGFreq[NGROUPS];
uniform float uWGSteep[NGROUPS];
uniform float uWGDir[NGROUPS];
uniform float uWGSpeed[NGROUPS];
uniform float uWGSpread[NGROUPS];
uniform float uWGPhase[NGROUPS];
uniform float uWGNumWaves[NGROUPS];
uniform float uWGFreqSpread[NGROUPS];
uniform float uWGAmpDecay[NGROUPS];

// Shape & spectrum arrays
uniform float uWGSpectrum[NGROUPS];      // 0..7
uniform float uWGPeakEnh[NGROUPS];       // JONSWAP gamma
uniform float uWGSpecWidth[NGROUPS];     // sigma
uniform float uWGFetch[NGROUPS];
uniform float uWGFront[NGROUPS];         // front steepness
uniform float uWGRear[NGROUPS];          // rear steepness
uniform float uWGCrestSharp[NGROUPS];
uniform float uWGTroughFlat[NGROUPS];
uniform float uWGAsym[NGROUPS];
uniform float uWGDirExp[NGROUPS];
uniform float uWGFreqJit[NGROUPS];
uniform float uWGAmpJit[NGROUPS];
uniform float uWGDirJit[NGROUPS];
uniform float uWGPhaseJit[NGROUPS];
uniform float uWGSpatJit[NGROUPS];
uniform float uWGSpatJitScale[NGROUPS];
uniform float uWGAge[NGROUPS];
uniform float uWGGroupSpeed[NGROUPS];
uniform float uWGObliquity[NGROUPS];
uniform float uWGWLMin[NGROUPS];
uniform float uWGWLMax[NGROUPS];

// Global wave
uniform float uChoppiness;
uniform float uGlobalAmp;
uniform float uPeakSharp;
uniform float uNonlinearity;
uniform float uAntiGridJitter;
uniform float uAntiGridScale;
uniform float uSpectrumBlend;
uniform float uStokes3;
uniform float uSwellAging;
uniform float uCrestRounding;

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

// Foam
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

// ── Spectral amplitude shaping ─────────────────────────────────
// Returns amplitude weight 0..1+ given normalized frequency f/fp
float spectrumWeight(int mode, float fRel, float gamma, float sigma, float age) {
  // fRel = f / fpeak; weight ~ S(f) normalized to peak=1
  if (mode == 0) {
    // Mono / passthrough — pure decay
    return 1.0;
  }
  if (mode == 1) {
    // Pierson-Moskowitz: S(f) = α g² f⁻⁵ exp(-1.25 (fp/f)⁴)
    if (fRel <= 0.001) return 0.0;
    float w = pow(fRel, -5.0) * exp(-1.25 * pow(1.0 / fRel, 4.0));
    // normalize: peak of PM in fRel is at fRel=1 => exp(-1.25)
    float peak = exp(-1.25);
    return clamp(w / (peak + 1e-6), 0.0, 1.5);
  }
  if (mode == 2) {
    // JONSWAP = PM × γ^r where r = exp(-(f-fp)²/(2σ²fp²))
    if (fRel <= 0.001) return 0.0;
    float pm = pow(fRel, -5.0) * exp(-1.25 * pow(1.0 / fRel, 4.0));
    float sg = (fRel <= 1.0) ? 0.07 : 0.09;
    sg = mix(sg, sigma, 0.5);
    float r = exp(-pow(fRel - 1.0, 2.0) / (2.0 * sg * sg + 1e-6));
    float w = pm * pow(gamma, r);
    float peak = exp(-1.25) * gamma;
    return clamp(w / (peak + 1e-6), 0.0, 1.8);
  }
  if (mode == 3) {
    // Gaussian narrow-band swell
    return exp(-pow((fRel - 1.0) / max(sigma, 0.02), 2.0));
  }
  if (mode == 4) {
    // TMA (shallow water JONSWAP modifier — approximated)
    if (fRel <= 0.001) return 0.0;
    float pm = pow(fRel, -5.0) * exp(-1.25 * pow(1.0 / fRel, 4.0));
    float sg = (fRel <= 1.0) ? 0.07 : 0.09;
    float r = exp(-pow(fRel - 1.0, 2.0) / (2.0 * sg * sg + 1e-6));
    float jonswap = pm * pow(gamma, r);
    // shallow correction kitaigorodskii ~ tanh-like
    float phi = tanh(2.0 * fRel) * tanh(2.0 * fRel);
    float peak = exp(-1.25) * gamma;
    return clamp(jonswap * phi / (peak + 1e-6), 0.0, 1.8);
  }
  if (mode == 5) {
    // Ochi-Hubble bimodal — single mode lobe
    float lobe1 = exp(-pow((fRel - 1.0) / max(sigma, 0.05), 2.0));
    float lobe2 = 0.5 * exp(-pow((fRel - 1.7) / max(sigma * 1.6, 0.08), 2.0));
    return lobe1 + lobe2;
  }
  if (mode == 6) {
    // Donelan-Banner (young wind sea) — sharper peak, broader tail
    if (fRel <= 0.001) return 0.0;
    float w = pow(fRel, -4.0) * exp(-pow(1.0 / fRel, 4.0));
    float sg = 0.08 + 0.05 * age;
    float r = exp(-pow(fRel - 1.0, 2.0) / (2.0 * sg * sg));
    float g2 = 1.7 + 6.0 * (1.0 - age);
    float peak = exp(-1.0) * g2;
    return clamp(w * pow(g2, r) / (peak + 1e-6), 0.0, 1.8);
  }
  // mode 7: power law
  return pow(max(fRel, 0.05), -2.5);
}

// cos^N directional spreading
float dirSpread(float dAngle, float N) {
  float c = cos(dAngle * 0.5);
  return pow(max(c, 0.0), max(N, 0.5));
}

void main() {
  vec3 pos = position;
  vec2 xz = pos.xy;
  vUV = xz / 200.0 + 0.5;

  float windRad = uWindDir * PI / 180.0;

  float gustMod = 1.0 + uGustIntensity * 0.5 * (
    sin(uTime * uGustFreq * 0.7) * 0.6 +
    sin(uTime * uGustFreq * 1.3 + 2.1) * 0.4
  );

  vec3 totalDisp = vec3(0.0);
  vec3 T = vec3(1.0, 0.0, 0.0);
  vec3 B = vec3(0.0, 0.0, 1.0);
  float maxH = 0.001;
  float jacobianAccum = 0.0;
  float steepnessAccum = 0.0;
  int totalWaveCount = 0;

  // ═══ Process 8 wave groups ═══
  for (int g = 0; g < NGROUPS; g++) {
    if (uWGEnabled[g] < 0.5) continue;

    float groupDir = uWGDir[g] * PI / 180.0;
    float groupAmp = uWGAmp[g] * uGlobalAmp;
    float groupFreq = uWGFreq[g];
    float groupSteep = uWGSteep[g];
    float groupSpeed = uWGSpeed[g] * uWGGroupSpeed[g];
    float spreadAngle = uWGSpread[g] * PI / 180.0;
    float phaseOff = uWGPhase[g];
    int nWaves = int(uWGNumWaves[g]);
    float freqSpread = uWGFreqSpread[g];
    float ampDecay = uWGAmpDecay[g];

    int spectrum = int(uWGSpectrum[g] + 0.5);
    float gamma = uWGPeakEnh[g];
    float sigma = uWGSpecWidth[g];
    float front = uWGFront[g];
    float rear = uWGRear[g];
    float crestSharp = uWGCrestSharp[g];
    float troughFlat = uWGTroughFlat[g];
    float asym = uWGAsym[g];
    float dirExp = uWGDirExp[g];
    float freqJit = uWGFreqJit[g];
    float ampJit = uWGAmpJit[g];
    float dirJit = uWGDirJit[g];
    float phaseJit = uWGPhaseJit[g];
    float spatJit = uWGSpatJit[g];
    float spatScale = uWGSpatJitScale[g];
    float age = mix(uWGAge[g], 1.0, 0.0) * uSwellAging;

    float windCoupling = (g >= 4) ? gustMod : 1.0;

    // ── Per-group spatial domain warp to break the grid ──
    vec2 groupXZ = xz;
    if (spatJit > 0.01 || uAntiGridJitter > 0.01) {
      float sj = max(spatJit, uAntiGridJitter);
      float ss = mix(spatScale, uAntiGridScale, 0.5);
      vec2 warp = vec2(
        snoise(xz * ss + float(g) * 13.7),
        snoise(xz * ss + float(g) * 13.7 + vec2(7.3, 2.1))
      );
      // animate warp slowly so grid doesn't reappear stationary
      vec2 warp2 = vec2(
        snoise(xz * ss * 0.5 + uTime * 0.04 + float(g) * 4.1),
        snoise(xz * ss * 0.5 + uTime * 0.04 + float(g) * 4.1 + vec2(3.3, 5.5))
      );
      groupXZ += (warp + 0.5 * warp2) * sj * 6.0;
    }

    for (int w = 0; w < MAX_SUBWAVES; w++) {
      if (w >= nWaves) break;
      totalWaveCount++;

      float seed = float(g) * 17.31 + float(w) * 7.919;
      float jitter1 = hash11(seed) - 0.5;
      float jitter2 = hash11(seed + 137.0);
      float jitter3 = hash11(seed + 251.0) - 0.5;
      float jitter4 = hash11(seed + 400.0) - 0.5;

      // Direction with spread + per-wave jitter (breaks parallel rows)
      float spreadFrac = (float(w) + 0.5) / float(nWaves) - 0.5;
      float baseSpread = spreadFrac * 2.0 * spreadAngle;
      float angle = groupDir + baseSpread + jitter1 * spreadAngle * 0.6
                    + jitter3 * dirJit * spreadAngle * 1.5;
      vec2 dir = vec2(cos(angle), sin(angle));

      // Frequency with cascade + jitter
      float fMul = pow(freqSpread, float(w));
      float fJ = 1.0 + jitter4 * freqJit * 0.6;
      float f = groupFreq * fMul * fJ;

      // Wavelength override
      if (uWGWLMin[g] > 0.001 && uWGWLMax[g] > 0.001) {
        float wl = mix(uWGWLMax[g], uWGWLMin[g], float(w) / float(max(nWaves - 1, 1)));
        f = 1.0 / max(wl, 0.5);
      }

      // Spectrum amplitude weighting
      float fRel = f / max(groupFreq, 0.001);
      float specW = spectrumWeight(spectrum, fRel, gamma, sigma, age);
      float decayW = pow(ampDecay, float(w));
      float ampWeight = mix(decayW, specW * decayW, uSpectrumBlend);

      // Per-wave amplitude jitter
      float ampJ = 1.0 + (hash11(seed + 311.0) - 0.5) * ampJit;
      float a = groupAmp * ampWeight * windCoupling * ampJ;

      // Directional spreading attenuation (cos^N)
      float dirAtten = dirSpread(baseSpread, dirExp);
      a *= mix(1.0, dirAtten, 0.7);

      // Peak sharpening (global)
      float peakFactor = exp(-0.5 * pow(float(w) / max(float(nWaves) * 0.3, 1.0), 2.0)
                             * (uPeakSharp - 1.0));
      a *= mix(1.0, peakFactor, clamp(uPeakSharp - 1.0, 0.0, 1.0));

      // Wavenumber + dispersion
      float k = TAU * f;
      float omega = sqrt(G * k);

      // Phase + per-wave phase jitter
      float randPhase = jitter2 * TAU * phaseJit;
      float phase = dot(dir, groupXZ) * k - omega * uTime * groupSpeed
                    + phaseOff + randPhase;

      // Steepness Q factor — protective
      float Q = groupSteep * uChoppiness / (k * a * float(nWaves) + 0.001);
      Q = clamp(Q, 0.0, 1.0 / (float(nWaves) + 0.001));
      Q = min(Q, 0.28);

      float sinP = sin(phase);
      float cosP = cos(phase);

      // ── Asymmetric crest shape (front/rear) ──
      // Map sinP through a trochoid-like shaping:
      // crest sharper, trough flatter, with front/rear asymmetry on cosP
      float shapedSin = sinP;
      // crest sharpening: pow on positive lobe, flatten negative
      if (shapedSin > 0.0) {
        shapedSin = pow(shapedSin, max(1.0 / max(crestSharp, 0.1), 0.2));
      } else {
        // trough flattening
        float t = -shapedSin;
        t = mix(t, t * t, troughFlat);
        shapedSin = -t;
      }
      // mature swells round the crest
      shapedSin = mix(shapedSin, sin(phase), uCrestRounding * (1.0 - age));

      // Front/rear asymmetric horizontal push
      // front face (cosP > 0 => moving toward observer): use front steepness
      float dirFactor = (cosP >= 0.0) ? front : rear;
      float Qd = Q * dirFactor * (1.0 + asym * cosP);

      float heightVal = a * shapedSin;

      // 2nd-order Stokes
      float nl = uNonlinearity;
      if (nl > 0.01) {
        float stokes2 = 0.5 * k * a * sinP * sinP;
        heightVal += nl * a * stokes2;
      }
      // 3rd-order Stokes (sharper crests)
      if (uStokes3 > 0.001) {
        heightVal += uStokes3 * a * (k * a) * (k * a) * sinP * (1.0 - 0.5 * cosP * cosP);
      }

      // Gerstner horizontal displacement (asymmetric)
      totalDisp.x -= Qd * a * dir.x * cosP;
      totalDisp.y += heightVal;
      totalDisp.z -= Qd * a * dir.y * cosP;

      // Tangent / bitangent
      float WA = k * a;
      T.x -= Qd * dir.x * dir.x * WA * sinP;
      T.y += dir.x * WA * cosP;
      T.z -= Qd * dir.x * dir.y * WA * sinP;

      B.x -= Qd * dir.x * dir.y * WA * sinP;
      B.y += dir.y * WA * cosP;
      B.z -= Qd * dir.y * dir.y * WA * sinP;

      // Jacobian for foam
      float Jxx = 1.0 - Qd * dir.x * dir.x * WA * sinP;
      float Jzz = 1.0 - Qd * dir.y * dir.y * WA * sinP;
      float Jxz = -Qd * dir.x * dir.y * WA * sinP;
      float J = Jxx * Jzz - Jxz * Jxz;
      jacobianAccum += (1.0 - J);

      steepnessAccum += WA * abs(cosP);
      maxH += a;
    }
  }

  // FBM
  float fbmVal = fbm(xz * 0.015 + totalDisp.xz * 0.02, uFBMOctaves);
  totalDisp.y += fbmVal;
  float eps = 0.8;
  float fbmDx = fbm((xz + vec2(eps, 0.0)) * 0.015, max(uFBMOctaves - 1.0, 1.0))
              - fbm((xz - vec2(eps, 0.0)) * 0.015, max(uFBMOctaves - 1.0, 1.0));
  float fbmDz = fbm((xz + vec2(0.0, eps)) * 0.015, max(uFBMOctaves - 1.0, 1.0))
              - fbm((xz - vec2(0.0, eps)) * 0.015, max(uFBMOctaves - 1.0, 1.0));
  T.y += fbmDx / (2.0 * eps);
  B.y += fbmDz / (2.0 * eps);

  // Capillary
  for (int i = 0; i < 4; i++) {
    float capAngle = windRad + float(i) * PI * 0.25 * (1.0 + uCapWindAlign)
                   + hash11(float(i) * 5.7 + 3.1) * PI * (1.0 - uCapWindAlign);
    vec2 dir = vec2(cos(capAngle), sin(capAngle));
    float f = uCapScale * uCapFreqs[i];
    float a = uCapIntensity * uCapAmps[i] * pow(uCapDamping, float(i));
    float k = TAU * f;
    float omega = sqrt(G * k + 0.074 / 1000.0 * k * k * k);
    float phase = dot(dir, xz + totalDisp.xz * 0.05) * k - omega * uTime * uCapSpeed;
    float sinP = sin(phase);
    float cosP = cos(phase);
    totalDisp.y += a * sinP;
    float WA = k * a;
    T.y += dir.x * WA * cosP;
    B.y += dir.y * WA * cosP;
  }

  // Rain
  if (uRainIntensity > 0.01) {
    for (int i = 0; i < 8; i++) {
      float timeSlot = floor(uTime * 2.0 + float(i) * 0.37);
      vec2 center = hash22(vec2(float(i) * 1.7 + 0.3, timeSlot)) * 160.0 - 80.0;
      float dist = length(xz - center);
      float rippleAge = fract(uTime * 2.0 + float(i) * 0.37);
      float radius = rippleAge * uRainRippleScale;
      float ringWidth = 1.5 + rippleAge * 2.0;
      float ring = exp(-pow(dist - radius, 2.0) / ringWidth) * (1.0 - rippleAge);
      ring *= exp(-dist * 0.05);
      totalDisp.y += ring * uRainRippleIntensity * uRainIntensity * 0.03;
    }
  }

  pos.x += totalDisp.x;
  pos.y += totalDisp.z;
  pos.z -= totalDisp.y;

  vec3 waveN = normalize(cross(B, T));
  if (waveN.y < 0.0) waveN = -waveN;
  vec3 localN = vec3(waveN.x, waveN.z, -waveN.y);
  vNormal = normalize((modelMatrix * vec4(localN, 0.0)).xyz);
  vWorldPos = (modelMatrix * vec4(pos, 1.0)).xyz;
  vHeight = totalDisp.y;

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
