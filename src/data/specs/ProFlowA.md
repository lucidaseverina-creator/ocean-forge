# ProFlow HyperReal Ocean — The Definitive Specification

> **Codename:** ProFlow Continuum  
> **Revision:** DEFINITIVE v5.0 — Masterclass Synthesis  
> **Date:** 2026-02-15  
> **Authority:** This document supersedes ALL prior specifications. Where any prior document contradicts this one, this one wins.  
> **Synthesized from:** 9 UltimateSplash proposals (V1–V9), 13 HyperRealOcean variants, 7 WebGPU drafts, GPT 5.2 meta-analysis, ULTIMATE_PROPOSAL v2.0, Validated Build Plan v3.0, OCEAN_SIMULATION_ENCYCLOPEDIA (Parts A–K), and the full ProFlow codebase.  
> **Architecture spine:** V8 orchestration × V6 physics/stability × V9 implementation gotchas × V2 perf budget × V7 scope discipline.

---

## Table of Contents

| Part | Section | Purpose |
|------|---------|---------|
| **PART A** | [I. Vision & North Star](#i-vision--north-star) | Why this exists |
| | [II. The Three Tests](#ii-the-three-tests) | When we ship |
| **PART B** | [III. Hard Constraints (C1–C12)](#iii-hard-constraints-c1c12) | What cannot be bent |
| **PART C** | [IV. Data Contract](#iv-data-contract) | The typed ABI between all passes |
| **PART D** | [V. System Architecture](#v-system-architecture) | The engine topology |
| | [VI. Compute Pipeline (P01–P05)](#vi-compute-pipeline-p01p05) | Wave → Crest → Foam → Particle → Coupling |
| | [VII. Particle System & Phase FSM](#vii-particle-system--phase-fsm) | The heart: spawn, ride, break, fall, re-enter |
| | [VIII. Rendering — One Water](#viii-rendering--one-water) | Shared optics, mesh, spray, composite |
| | [IX. Services Layer](#ix-services-layer) | Governor, registry, pool, telemetry |
| **PART E** | [X. Development Gates & Build Order](#x-development-gates--build-order) | What to build, in what order |
| | [XI. Validation & Debug Tooling](#xi-validation--debug-tooling) | How to verify each gate |
| | [XII. Red-Team Checklist](#xii-red-team-checklist) | Pre-ship verification |
| **PART F** | [XIII. Physics & Equations Reference](#xiii-physics--equations-reference) | The math |
| | [XIV. Scope Guardrails](#xiv-scope-guardrails) | What does NOT belong |
| | [XV. Evolution Path](#xv-evolution-path) | Post-ship phases |
| **PART G** | [XVI. Implementation Reference](#xvi-implementation-reference) | Repo, constants, versions, Leva, glossary |

---

# PART A — THE MISSION

---

## I. Vision & North Star

### I.1 The Problem

Every real-time water system in existence — Unreal WaveWorks, Sea of Thieves, NVIDIA Flow, Crest, offline Houdini FLIP — makes the same fatal compromise: **the moment water breaks, it stops being water.** It becomes particles pasted onto a surface. Two separate rendering systems with a visible seam. The spray doesn't remember it was once part of a wave crest.

This is not a rendering problem. It is an **identity** problem. The optical properties diverge at the fracture boundary — different Fresnel, different absorption, different tint. Two waters. The seam is not geometric. It is photometric.

### I.2 The Thesis

This compromise is no longer necessary in 2026. WebGPU compute shaders provide GPU-side particle simulation without CPU readback. Zero-copy `StorageBufferAttribute` eliminates the compute→render copy. Screen-space fluid rendering can smooth particle boundaries. And shared optical models — one file, one import, one water — kill the photometric seam.

We build **continuous water**: from spectral ocean at the horizon to the individual droplet falling from a crest, with no seam, no identity change, no "effect" boundary.

### I.3 The One Sentence (100% Consensus V1–V9)

> **A wave crest rises, thins into a translucent sheet, stretches into ligaments, tears into droplets, those droplets fall back, create ring waves, and entrain foam — and at no point does the visual identity of "water" change.**

This is the non-negotiable design north star. Every subsystem, every constraint, every pass, every line of shader code exists to serve it. If you enforce this sentence, feature creep self-deletes.

### I.4 The Seam Truth (GPT 5.2)

Many systems fail not because particles are "bad," but because optical identity changes at the fracture boundary. Shared optics is the fix. If ocean mesh and spray particles import identical Fresnel, absorption, and scatter constants, the seam disappears regardless of rendering technique.

---

## II. The Three Tests

The system ships when — and only when — it passes all three. Everything else is negotiable. These are not.

| Test | Procedure | Pass Condition | What It Proves |
|------|-----------|----------------|----------------|
| **Orbit** | Camera 360° orbit at 5 m around breaking wave | Cannot identify where "ocean" ends and "spray" begins. One water. Must pass at noon, golden hour, AND overcast. | Seam elimination via shared optics + depth compositing |
| **Slow-Mo** | Play breaking at 0.25× speed | Visible continuous progression: sheet → elongating ligaments → pinching droplets → ballistic arcs → re-entry → ring waves. **NOT:** particles appearing, animating, disappearing. | Physics progression via ride window + phase FSM |
| **Horizon** | Camera at 500 m altitude | Seamless tiling, natural foam streaks, no computational artifacts (grid boundaries, particle regions, spawn zones) | Scale stability + LOD + foam advection correctness |

---

# PART B — THE LAWS

---

## III. Hard Constraints (C1–C12)

These rules cannot be bent. Every one exists because violating it destroyed prior attempts across 20+ proposals and 7 WebGPU drafts.

### Platform

| ID | Name | Rule | Violation Consequence |
|----|------|------|----------------------|
| **C1** | WebGPU-First | WebGPU is the engine; WebGL2 is a degraded fallback with separate codepath. Not "WebGPU optional." | LCD design; compute pipeline impossible in WebGL2 |
| **C2** | No API Mixing | One backend per session. **`forceWebGL: true` on WebGPURenderer is FORBIDDEN.** Use separate `WebGLRenderer`. | Copies, readbacks, instability, slower than native |

```typescript
// CORRECT (C2)
if (hasWebGPU) {
    this.renderer = new WebGPURenderer({ canvas, antialias: true });
    await this.renderer.init();
    this.isWebGPU = true;
} else {
    this.renderer = new WebGLRenderer({ canvas, antialias: true });
    this.isWebGPU = false;
}
// FORBIDDEN: new WebGPURenderer({ forceWebGL: true })
```

### Performance

| ID | Name | Rule | Violation Consequence |
|----|------|------|----------------------|
| **C3** | No Readbacks | Zero `readBuffer()`, `readTexture()`, `readPixels()` in render loop. Debug: ≤2 Hz, opt-in, async, 2-frame delay. | 10–100× frame spike. #1 perf killer. |
| **C4** | No Per-Frame Alloc | All resources at init. No `new Float32Array()`, `createTexture()`, `createBuffer()` in animate. Exception: resize. | GC stalls destroy frame pacing. |

### Simulation

| ID | Name | Rule | Violation Consequence |
|----|------|------|----------------------|
| **C5** | Atomic-Free Crest | Crest mask texture; dead particles sample it independently. No atomics, no append buffer. Exception: MLS-MPM P2G fixed-point atomics (Phase 2 only). | GPU variance, sync bugs, TSL incompatibility |
| **C6** | Ping-Pong | ALL advected fields (foam, coupling, crest EMA) use strict A↔B double-buffering. Two compute nodes at init, XOR toggle. | Nondeterminism, uncalibratable artifacts |
| **C10** | Genesis First | Spawn ON surface + inherit velocity (2.5/2.6) → ride window (2.7) → phase tuning (2.8) → coupling (3.1). This ordering is non-negotiable. | Tuning gains on wrong inputs ("tuning in the dark") |

### Rendering & Integration

| ID | Name | Rule | Violation Consequence |
|----|------|------|----------------------|
| **C7** | Zero-Copy | `StorageBufferAttribute`: compute writes, vertex reads, same GPU buffer. No CPU, no copies. | Losing core WebGPU advantage |
| **C8** | Integration Resolved | Choose ONE: (A) R3F + async `gl` factory, or (B) React UI + vanilla three.js. Commit. Recommend B Day 1. | Ambiguity leads to broken init patterns |
| **C9** | Billboard Quads | Instanced `PlaneGeometry(1,1)` quads. No `gl_PointSize`. Per-instance size, elongation, opacity. | WebGPU point sprite limits; unreliable sizing |

### Best Practices (V6)

| ID | Name | Rule | Violation Consequence |
|----|------|------|----------------------|
| **C11** | Format Matching | All texture formats explicit between creation, bind group, and shader. | Silent GPU corruption |
| **C12** | Frame Ordering | Sequential compute passes with implicit barriers. No intra-pass parallelism assumptions. | Race conditions, nondeterminism |

---

# PART C — THE DATA

---

## IV. Data Contract

This is the single source of truth for all inter-pass data. **The velocity packing fix (GPT 5.2 Contradiction C) is the most critical correction in the entire specification.**

### IV.1 Textures (v3.0 CORRECTED)

> ⚠️ **MANDATORY FIX:** Store both horizontal velocity components `(vel.x, vel.z)` in velocityTex. Prior versions dropped `vel.z` — this breaks foam advection, particle comovement, and diagonal crest transport.

| Texture | Format | .x | .y | .z | .w | Ping-Pong |
|---------|--------|----|----|----|----|-----------|
| `heightTex` | RGBA32F 256² | disp.x | disp.y (η) | disp.z | **vel.y** | No |
| `normalTex` | RGBA32F 256² | N.x | N.y | N.z | **steepness** | No |
| `velocityTex` | RGBA32F 256² | **vel.x** | **vel.z** | curvature (κ) | reserved | No |
| `crestMaskTex` | RGBA32F 256² | intensity | breakType | crestAngle | steepExcess | Yes (EMA) |
| `foamTexA/B` | RGBA32F 512² | density | age | — | — | Yes |
| `couplingTexA/B` | RGBA32F 256² | Δη | Δη̇ | Δfoam | energy | Yes (gated) |

### IV.2 Particle Buffers (32K × vec4, Zero-Copy)

| Buffer | .x | .y | .z | .w |
|--------|----|----|----|----|
| `positionBuf` | world X | world Y | world Z | phase (0–5) |
| `dataBuf` | velocity X | velocity Y | velocity Z | age (seconds) |
| `renderBuf` | size (m) | alpha | thickness | elongation |

### IV.3 Wave Spectrum Buffer

```
waveBuf: vec4 × MAX_WAVE_COMPONENTS × 2
  [i×2+0]: (dirX, dirZ, amplitude, frequency)
  [i×2+1]: (phase, Q_steepness, reserved, reserved)
```

### IV.4 Downstream Impact of Velocity Fix

Every consumer must read the corrected channels:

| Consumer | Field | Source (CORRECTED) |
|----------|-------|--------------------|
| P02 — vertical velocity | `heightTex.w` | (was velocityTex.y) |
| P02 — steepness | `normalTex.w` | (was velocityTex.w) |
| P02 — curvature | `velocityTex.z` | (unchanged) |
| P03 — advection velocity | `velocityTex.xy` = (vel.x, vel.z) | Both horizontal |
| P04 — co-movement | `velocityTex.xy` = (vel.x, vel.z) | Both horizontal |
| P04 — vertical velocity | `heightTex.w` | For ride window |

### IV.5 Memory Budget

| Resource | Memory |
|----------|--------|
| Wave textures (3 × RGBA32F × 256²) | 3 MB |
| Crest mask (1–2 × RGBA32F × 256²) | 1–2 MB |
| Foam A+B (2 × RGBA32F × 512²) | 8 MB |
| Coupling A+B (2 × RGBA32F × 256²) | 2 MB |
| Particle buffers (3 × vec4 × 32K) | 1.5 MB |
| Wave spectrum (<1 KB) | ~0 |
| **Total** | **~16 MB** |

---

# PART D — THE ENGINE

---

## V. System Architecture

### V.1 Topology

```
┌─────────────────────────────────────────────────────────────────────┐
│                       React Application Layer                        │
│   Leva Controls  │  PerfHUD  │  Debug Views  │  Scene Selector       │
│                      │ ref + telemetry callback                      │
├──────────────────────▼──────────────────────────────────────────────┤
│                    OceanEngine (owns everything)                     │
│                                                                      │
│  ┌── COMPUTE (sequential, C12 ordering) ─────────────────────────┐  │
│  │  P01 WaveField → P02 CrestMask → P03 Foam → P04 Particle     │  │
│  │                                                 ↓             │  │
│  │                                     P05 Coupling [GATED]      │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌── RENDER ─────────────────────────────────────────────────────┐  │
│  │  R01 Ocean Mesh (opaque, depth ON)                             │  │
│  │  R02 Spray Billboards (transparent, additive, depth OFF)       │  │
│  │  R03 Sky Dome │ R04 Debug Overlay (opt-in)                     │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌── SERVICES ───────────────────────────────────────────────────┐  │
│  │  PassRegistry │ ResourcePool │ Governor │ Telemetry             │  │
│  └───────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```

### V.2 Pass Registry & Budget

| ID | Name | Type | Resolution | Est. Cost | Governor Fallback |
|----|------|------|------------|-----------|-------------------|
| P01 | WaveFieldCompute | compute | 256² | 0.8 ms | 128² |
| P02 | CrestMaskDetect | compute | 256² | 0.3 ms | 128² |
| P03 | FoamCompute | compute | 512² | 0.5 ms | 256² |
| P04 | ParticleSim | compute | 32K | 2.0 ms | 16K→8K |
| P05 | CouplingFeedback | compute | 256² | 0.3 ms | DISABLE |
| R01–R04 | Render passes | render | screen | ~2.0 ms | LOD/cap/toggle |
| | **TOTAL** | | | **~5.9 ms** | **10.7 ms headroom @ 60fps** |

**Workgroups:** 2D textures `[16,16,1]`. Particles `[256,1,1]`.

### V.3 Init Flow (Load-Bearing Order)

```
1.  navigator.gpu check → select backend
2.  Create renderer (WebGPU OR WebGL — NEVER forceWebGL)     [C2]
3.  await renderer.init()    ← CRITICAL: before ANY resource creation
4.  OrbitControls
5.  ResourcePool.allocateAll()                                [C4]
6.  WaveCompute(pool) → CrestDetect(pool) → FoamCompute(pool)
    → ParticleSim(pool) → CouplingBridge(pool)
7.  PassRegistry.register([P01..P05, R01..R04])
8.  Governor(passRegistry, degradeLadder)
9.  OceanMesh + SprayRenderer + Sky → scene
10. Resize handler
```

### V.4 Animate Loop

```typescript
animate(time: number) {
    const dt = Math.min((time - this.lastTime) / 1000, 0.05);
    const t0 = performance.now();

    if (this.isWebGPU) {
        // Sequential compute — ORDER IS LAW (C12)
        if (registry.isEnabled('P01')) renderer.compute(waveCompute.getNode());
        if (registry.isEnabled('P02')) renderer.compute(crestDetect.getNode());
        if (registry.isEnabled('P03')) renderer.compute(foamCompute.tick());     // ping-pong
        if (registry.isEnabled('P04')) renderer.compute(particleSim.getNode());
        if (registry.isEnabled('P05')) renderer.compute(couplingBridge.tick());   // gated
    } else {
        this.tickWebGLFallback(time);   // C2: never both
    }

    renderer.render(scene, camera);
    governor.update(performance.now() - t0);
    emitTelemetry();
}
```

---

## VI. Compute Pipeline (P01–P05)

### VI.1 P01: Wave Field — Gerstner Summation

**Why Gerstner over FFT:** Single dispatch. Identical visual quality for 16–48 components. Exact analytical normals and curvature. FFT is Phase 2 — same output contract.

**Equations (V6 physics-corrected):**

```
Displacement:   x  = x₀ − Σᵢ Qᵢ Aᵢ Dᵢₓ cos(θᵢ)
                y  =      Σᵢ Aᵢ sin(θᵢ)
                z  = z₀ − Σᵢ Qᵢ Aᵢ Dᵢz cos(θᵢ)
                θᵢ = kᵢ(Dᵢ · x₀) − ωᵢt + φᵢ

Velocity:       vₓ = Σᵢ Qᵢ Aᵢ Dᵢₓ ωᵢ sin(θᵢ)
                vy = Σᵢ Aᵢ ωᵢ cos(θᵢ)
                vz = Σᵢ Qᵢ Aᵢ Dᵢz ωᵢ sin(θᵢ)

Normal:         N ≈ normalize(−Σ kᵢAᵢDᵢₓcos θ, 1 − Σ Qᵢkᵢ²Aᵢsin θ, −Σ kᵢAᵢDᵢzcos θ)
Steepness:      S = Σᵢ kᵢ Aᵢ Qᵢ |cos θᵢ|        (≥1 → breaking)
Curvature:      κ = −Σᵢ kᵢ² Aᵢ sin θᵢ
Dispersion:     ω² = gk   |   Q = min(choppiness / (k × A × N), 1.0)
```

**Output (CORRECTED textureStore):**
```
textureStore(heightTex,   ix, iy, vec4(disp.x, disp.y, disp.z, vel.y));
textureStore(normalTex,   ix, iy, vec4(norm.x, norm.y, norm.z, steep));
textureStore(velocityTex, ix, iy, vec4(vel.x, vel.z, curv, 0.0));
```

**Spectrum:** JONSWAP density × cos²ˢ directional spreading × stratified frequency sampling. CPU at init. Deterministic seeded RNG.

### VI.2 P02: Crest Mask Detection

```
steepExcess = smoothstep(crestThreshold, crestThreshold + 0.3, steepness)
isRising    = smoothstep(0, 0.5, heightTex.w)              // vertical velocity
curveFactor = smoothstep(0.5, 2.0, velocityTex.z)          // curvature
intensity   = steepExcess × isRising × (curveFactor × 0.5 + 0.5)

plungeScore = curvature × max(0, vertVel)                  // Iribarren proxy
breakType   = smoothstep(0, 5.0, plungeScore)              // 0=spilling, 1=plunging
crestAngle  = atan2(gradZ, gradX) / (2π) + 0.5
```

**V6 Enhancements (Gem 2):** EMA hysteresis (reduces flicker) + 3×3 spatial smoothing + ping-pong crest textures (V6 caught read/write-to-same-texture bug).

### VI.3 P03: Foam Compute (C6 Ping-Pong)

Two StorageTextures (foamA, foamB). Two compute nodes at init. XOR toggle per frame.

```
1. ADVECT:   trace-back by velocityTex.xy = (vel.x, vel.z) — BOTH horizontal
2. DECAY:    tau = mix(tauYoung, tauOld, smoothstep(0, 5, age)); foam *= exp(-dt/tau)
3. INJECT:   crestMask.x × foamInjectGain
4. STRETCH:  stretchDecay = clamp(1 - |vel|×0.1, 0.8, 1)
5. OUTPUT:   newDensity = clamp(max(decayed × stretchDecay, injection), 0, 1)
```

### VI.4 P04: Particle Simulation

*Full deep dive in [§VII](#vii-particle-system--phase-fsm).*

### VI.5 P05: Coupling Feedback (GATED — Gem 3)

**Default OFF.** Enabled only after Gate 3.0 (seam elimination). See [§IX.3](#ix3-coupling-feedback-protocol) for triple safety and stability protocol.

---

## VII. Particle System & Phase FSM

This is the heart of the system. 32K particles, each independently executing a finite state machine.

### VII.1 Phase State Machine

```
DEAD (0) ──[crest mask sampling]──→ RIDING (1)
  ▲                                      │
  │          ride window forces:         │ detach: age OR gap OR κ drop
  │          attach, comove, lift        │
  │                                      ▼
  │                                 SHEET (2)
  │                                      │ We < We_crit OR age > max
  │                                      ▼
  │                                LIGAMENT (3)
  │                                      │ age > ligamentDuration
  │                                      ▼
  │                                 DROPLET (4)
  │                                 ╱          ╲
  │                   y > surf+thresh      ballistic/re-entry
  │                        ▼                     │
  │                    SPRAY (5)                  │
  │                        │ re-entry             │
  └──── FEEDBACK_ELIGIBLE ─┴──────────────────────┘
                    → DEAD
```

| Phase | Val | Entry | Exit | Physics |
|-------|-----|-------|------|---------|
| DEAD | 0 | Spawn/recycle | Crest mask > threshold | — |
| RIDING | 1 | Crest spawn | age OR gap OR κ | Attach, co-move, lift, damp |
| SHEET | 2 | Ride exit | We < We_crit OR age | Gravity, thickness decay |
| LIGAMENT | 3 | Sheet We breakup | age > ligDuration | Elongation, pinch |
| DROPLET | 4 | Ligament pinch | y > surf→SPRAY; y < surf→DEAD | Ballistic + drag |
| SPRAY | 5 | Above surface | y < surf→DEAD; age > 8→DEAD | Ballistic + wind drag |

**Target phase histogram during active break:** ~40% sheet, ~25% ligament, ~35% droplet/spray.

### VII.2 Spawning (C5: Atomic-Free)

Dead particles sample crest mask at deterministic pseudo-random UV `(particleIndex + time hash)`. Probabilistic accept: `roll < intensity × spawnRate`.

**Genesis (C10):** Position ON wave surface. Velocity INHERITED from wave field.

### VII.3 Manual Bilinear Sampling (Gem 4 — NOT OPTIONAL)

StorageTexture has no sampler. `textureLoad()` returns point samples. Particles sampling wavefields off-texel **must** use manual bilinear interpolation:

```
bilinearLoad(tex, uv, texSize):
  fx = uv.x × texSize;  fy = uv.y × texSize
  ix0 = floor(fx);       iy0 = floor(fy)
  s00 = textureLoad(tex, ivec2(ix0,   iy0))
  s10 = textureLoad(tex, ivec2(ix0+1, iy0))
  s01 = textureLoad(tex, ivec2(ix0,   iy0+1))
  s11 = textureLoad(tex, ivec2(ix0+1, iy0+1))
  return mix(mix(s00, s10, fract(fx)), mix(s01, s11, fract(fx)), fract(fy))
```

Lives in `compute/bilinearHelper.ts`. Imported by ParticleSim.

### VII.4 Ride Window Forces (Gem 1 — THE Critical Visual Gate)

The difference between "water" and "confetti." **This is where cinematic believability is won or lost.**

| Force | Equation | Purpose |
|-------|----------|---------|
| **F_attach** | `gap.negate() × kAttach × rideAlpha` along normal | Soft spring toward wave surface |
| **F_comove** | `(targetVel − vel) × comoveGain × rideAlpha` | Bias velocity toward wave motion |
| **F_lift** | `max(0, κ − κ_thresh) × liftGain` upward | Curvature-driven throw (plunging) |
| **F_damp** | `−dampCoeff × (vel − targetVel) × rideAlpha` | Oscillation suppression |

**rideAlpha** = `1 − age / rideDuration` — decays linearly over ride window.

**Detach conditions (any triggers exit):**
- `age > rideDuration`
- `|gap| > detachDist`
- `curvature < kappaDetachThresh`

**No Velocity Discontinuity Rule:** At detach, particle KEEPS current velocity + smooth lift boost. Never instant swap.

| Parameter | Default | Range | Effect |
|-----------|---------|-------|--------|
| rideDuration | 0.4 s | 0.1–2.0 | How long sheet tracks crest |
| kAttach | 200 | 50–500 | Spring stiffness to surface |
| comoveGain | 15 | 5–50 | Velocity bias toward wave |
| liftGain | 5.0 | 1–20 | Curvature throw strength |
| dampCoeff | 10 | 2–50 | Oscillation damping |
| detachDist | 0.3 m | 0.05–1.0 | Max gap before forced detach |
| kappaLiftThresh | 1.5 | 0.5–5.0 | Curvature onset for lift |
| kappaDetachThresh | 0.2 | 0–1.0 | Curvature drop = detach |
| crestBoost | 0.3 | 0.1–1.0 | Spawn velocity multiplier |

### VII.5 Phase Transitions

**SHEET:** Gravity. Thickness decay: `dτ/dt = −τ × stretchRate`. Weber breakup: `We = ρ·v²·τ/σ` (V6 dimensionally correct). If `We < weCritSheet` → LIGAMENT. Sheet should break within ~0.8 s.

**LIGAMENT:** Elongation increases over time. After `ligamentDuration` → DROPLET. Velocity jitter at pinch-off for varied trajectories.

**DROPLET:** Ballistic + mild drag (`vel *= 0.998`). If `y > surface + sprayThreshold` → SPRAY. If `y < surface` → DEAD (FEEDBACK_ELIGIBLE).

**SPRAY:** Sphere drag: `F = −0.5 × ρ_air × C_d × |v_rel| × v_rel / mass`. Wind profile. Re-entry → DEAD (FEEDBACK_ELIGIBLE).

---

## VIII. Rendering — One Water

### VIII.1 Shared Optics (Gem 5 — The Seam Killer)

**Both ocean mesh AND spray billboards import `sharedOptics.ts`.** Identical Fresnel, absorption, scatter, tint. One file. One import. One water. If they diverge under ANY angle, the seam reappears. The Orbit Test depends on this.

```typescript
// sharedOptics.ts — THE FILE. ONE WATER.

export const WATER_IOR     = 1.333;
export const WATER_F0      = 0.02;   // ((1-IOR)/(1+IOR))²

export const DEEP_COLOR    = [0.0, 0.05, 0.15];
export const SHALLOW_COLOR = [0.0, 0.15, 0.25];
export const FOAM_COLOR    = [0.85, 0.88, 0.92];
export const SSS_TINT      = [0.1, 0.4, 0.35];

export const ABSORPTION    = [0.45, 0.09, 0.06];   // per meter (Beer-Lambert)
export const SCATTER_COLOR = [0.02, 0.08, 0.12];

// TSL Fresnel: F = F0 + (1-F0)(1-N·V)^5
// TSL Absorption: color × exp(-absorption × pathLength)
```

### VIII.2 Render Pipeline

| Pass | Purpose | Depth | Blend |
|------|---------|-------|-------|
| **R01 Ocean Mesh** | Displaced vertices from heightTex. Shared optics. Foam overlay. | Write ON | Opaque |
| **R02 Spray Billboards** | Instanced quads from particle buffers. Shared optics. | Write OFF, Test ON | Additive |
| **R03 Sky Dome** | Procedural environment | — | Behind |
| **R04 Debug Overlay** | Opt-in fullscreen quad | — | Overlay |

**R01 Material:** Fresnel + absorption + foam overlay + SSS. Roughness: 0.05 (water) → 0.6 (foam).

**R02 Billboards:** Camera-facing quads via viewMatrix. Phase-dependent appearance. Dead particles at `y = -1000`. Soft circle shape via UV distance.

### VIII.3 Screen-Space Fluid (Phase 2 — Post-Gate 4.0)

Billboards + shared optics pass the Orbit Test at 5 m if spawn density, ride window, and depth test are correct. SSF (depth splat → bilateral → normals → composite) is Hero Shot Mode — architecture slot reserved between R01 and R02.

---

## IX. Services Layer

### IX.1 PassRegistry

Central list of all compute/render passes. Enable/disable, cost tracking, dependency awareness. Governor calls `disable()`/`enable()` on passes. **No hidden passes.**

### IX.2 ResourcePool

Pre-allocates ALL textures and buffers at init (C4). Exposes typed getters. Manages ping-pong indices. No per-frame allocation. `allocateAll(isWebGPU)` at init.

### IX.3 Coupling Feedback Protocol

**Runaway Prevention — Triple Safety (Gem 3):**

| Safety | Mechanism |
|--------|-----------|
| 1. Per-texel clamp | No texel > MAX_IMPULSE |
| 2. Temporal smoothing | New feedback blended α=0.3 with previous |
| 3. Global energy cap | Hierarchical mip reduction over .w channel → scale if > cap. **No readback.** |

**Stability Protocol (5-Step Escalation):**

| Step | Action | Duration | Pass |
|------|--------|----------|------|
| 1 | Foam deposition only | 60 s | No foam runaway |
| 2 | Ring waves gain=0.1 | 60 s | No oscillation |
| 3 | Gain → 0.5 | 60 s | Stable |
| 4 | Gain → 1.0, storm | 60 s | Bounded |
| 5 | If any fails | — | Freeze at previous, investigate |

### IX.4 Governor — Degrade Ladder

Degrade in this order. **Restore in REVERSE.** Hysteresis prevents thrashing.

| Step | Action | Save | Impact |
|------|--------|------|--------|
| 1 | Particles 32K→16K→8K | 1.0–1.5 ms | Low–Med |
| 2 | Foam 512²→256² | 0.3 ms | Low |
| 3 | Reduce crest smoothing | — | Low |
| 4 | Disable coupling | 0.3 ms | Med |
| 5 | Disable SSF (if on) | — | Med |
| 6 | Disable breakers (P02+P04 off) | 2.3 ms | **High** |

```
Degrade:  p95 frametime > 16.6 ms × 1.3
Restore:  p95 < 16.6 ms × 0.8 for 120+ frames (~2 s)
Smoothing: Exponential average, not raw values
```

---

# PART E — THE BUILD

---

## X. Development Gates & Build Order

### X.1 Current State

| Gate | Status |
|------|--------|
| W0: WebGPU Lifecycle | ✅ Done |
| W1: Crest Mask Debug | ✅ Done |
| W2: Foam Ping-Pong | ✅ Done |
| W3: Billboard Render | ✅ Done |
| 2.5: Genesis Position | ✅ Done |
| 2.6: Genesis Velocity | ✅ Done |
| **2.7: Ride Window** | **🔴 CURRENT BLOCKER** |

### X.2 Gate Definitions

| Gate | Name | Definition of Done |
|------|------|-------------------|
| **2.7** | **Ride Window** | Sheet rides crest ≥0.3 s. Soft attach, co-move, smooth lift. No confetti. Side camera 0.25× passes. |
| 2.8 | Phase Transitions | Sheet→ligament→droplet visible at 0.25×. ≥2 distinct ligament frames. Phase histogram ~40/25/35. |
| 3.0 | Seam Elimination | Orbit Test: cannot find seam at noon, golden hour, AND overcast. |
| 3.1 | Coupling Feedback | Ring waves visible. Foam deposit. No runaway in 60 s storm. Stability protocol passes all 5 steps. |
| 4.0 | Perf No-Stall | 60 fps sustained. p99 < 16.6 ms. Governor degrades/restores smoothly. Zero blocking readbacks. |

### X.3 Advancement Rules

```
2.5 → 2.6 → 2.7 → 2.8 → 3.0 → 3.1 → 4.0

No gate N+1 work until gate N passes.
Coupling tuning (3.1) FORBIDDEN until 2.7 + 2.8 visually pass.
```

### X.4 Sprint Plan

| Sprint | Gate | Days | Focus | Criticality |
|--------|------|------|-------|-------------|
| **1** | **2.7** | **5** | **Ride window: F_attach + F_comove + F_lift + detach** | **MAKE-OR-BREAK** |
| 2 | 2.8 | 4 | Phase transitions visible at 0.25× | High |
| 3 | 3.0 | 3 | Shared optics, seam elimination | High |
| 4 | 3.1 | 3 | Coupling with triple safety + protocol | Medium |
| 5 | 4.0 | 2 | Governor, perf validation, stress test | Medium |
| | **Total** | **~17** | | |

### X.5 Ride Window Tuning Protocol (Sprint 1)

1. Start with defaults: rideDuration=0.4, kAttach=200, comoveGain=15, liftGain=5
2. Run Ride Window validation scene at 0.25× speed
3. Braden evaluates: "Does the sheet track the crest? How long? Is detach smooth?"
4. Adjust **one parameter at a time** — isolate variables
5. Iterate until sheet visibly rides crest ≥0.3 s with smooth detach
6. Record final values as new defaults

---

## XI. Validation & Debug Tooling

### XI.1 Debug Views (GPU-Only, Zero Readback)

| Key | View | Shows |
|-----|------|-------|
| F1 | Height Map | Wave displacement (blue→white) |
| F2 | Normal Map | Surface normals → RGB |
| F3 | Crest Mask | Break intensity (red heat) |
| F4 | Steepness | normalTex.w gradient |
| F5 | Foam Density | White overlay |
| F6 | Particle Phase | RIDING=green, SHEET=cyan, LIGAMENT=yellow, DROPLET=red, SPRAY=white |
| F7 | Ride Timer | Age as green→red (detached=gray) |
| F8 | Pass Timing | Per-pass costs + governor state |

### XI.2 Validation Scenes (Deterministic Seeds)

| Scene | Camera | Settings | Validates |
|-------|--------|----------|-----------|
| **Cinematic Breaker** | (15,5,20) → origin | wind 12, chop 1.5, 32 waves, seed 42 | Gates 2.7, 2.8, 3.0 |
| **Mid Storm** | (40,20,50) → origin | wind 20, chop 2.0, 48 waves, seed 137 | Gate 4.0 (perf) |
| **Far Horizon** | (0,8,150) → origin | wind 8, chop 1.0, 24 waves, seed 7 | Horizon Test |
| **Genesis Verify** | Freeze at t₀ | — | Particles on surface, velocity correct |
| **Ride Window** | Side view, 0.25× | rideDuration 0.4 | Sheet tracks crest, smooth detach |
| **Seam Test** | Orbit 360° at 5 m | — | No boundary: noon, golden hour, overcast |

### XI.3 Anti-Cue Catalog

| Visual Problem | Likely Cause | Fix |
|----------------|-------------|-----|
| Particles float above crest | kAttach too low | ↑ kAttach |
| Slide backward off crest | comoveGain too low | ↑ comoveGain |
| Instant confetti on spawn | Ride window not applied | Code bug — check RIDING path |
| Welded forever to crest | rideDuration too high | ↓ rideDuration, check detach |
| Visible seam at boundary | Separate optics | Verify sharedOptics.ts import |
| Foam pulsing / crawling | Non-ping-pong foam | Verify A↔B toggle |
| Grid edges at horizon | Tile/resolution mismatch | Adjust tileSize, LOD |
| Velocity pop at detach | Instant velocity swap | Smooth eject: keep vel + lift |
| Over-cohesion (goo) | weCritSheet too high | ↓ weCritSheet, break within 0.8 s |
| Under-cohesion (dust) | Scatter immediately | Ensure ≥2 sheet frames at spawn |
| Foam one-directional | vel.z dropped | **Apply velocity packing fix** |

### XI.4 PerfHUD

```
┌──────────────────────────────────────┐
│  PERF HUD                           │
│  Frame: 5.2ms  ■■■░░░░░░░  60 FPS  │
│  Compute: 3.8ms (P01:0.8 P02:0.3   │
│           P03:0.5 P04:2.0 P05:off)  │
│  Render: 1.8ms                       │
│  Particles: 24,391 / 32,768         │
│  Governor: FULL ●  Backend: WebGPU  │
└──────────────────────────────────────┘
```

---

## XII. Red-Team Checklist

Pre-ship verification. Every item must pass.

| # | Check | Method |
|---|-------|--------|
| 1 | velocityTex = (vel.x, vel.z, κ, 0) | Inspect textureStore in WaveCompute |
| 2 | heightTex.w = vel.y | Inspect textureStore |
| 3 | normalTex.w = steepness | Inspect textureStore |
| 4 | Foam advection uses velocityTex.xy | Check FoamCompute trace-back |
| 5 | No readBuffer/mapAsync in animate | `grep -r "readBuffer\|mapAsync" src/` |
| 6 | No createTexture/createBuffer in animate | `grep` hot path |
| 7 | No new Float32Array in animate | `grep` hot path |
| 8 | Crest: mask texture, no atomics | No `atomicAdd` in spawn |
| 9 | Foam: two textures, XOR toggle | foamA, foamB verified |
| 10 | Crest: EMA + ping-pong (V6) | crestA, crestB verified |
| 11 | Coupling: P05 disabled by default | Registry check |
| 12 | Shared optics: one import | Both materials import sharedOptics.ts |
| 13 | Billboard quads, not points | InstancedMesh + PlaneGeometry |
| 14 | Zero-copy rendering | StorageBufferAttribute |
| 15 | Pass order P01→P02→P03→P04→P05 | No reorder in animate |
| 16 | Governor restores in REVERSE | Each step has restore() |
| 17 | Manual bilinear helper used | bilinearHelper.ts in ParticleSim |
| 18 | No forceWebGL on WebGPURenderer | Separate WebGLRenderer |
| 19 | Deterministic seed | Same seed = same ocean |
| 20 | Resource pool: allocateAll() at init | No lazy alloc |
| 21 | C11: explicit texture formats | No implicit conversions |
| 22 | C12: sequential passes | No parallel assumptions |

---

# PART F — THE SCIENCE

---

## XIII. Physics & Equations Reference

### XIII.1 Wave Physics

| Equation | Formula |
|----------|---------|
| Deep-water dispersion | ω² = gk; c = √(g/k) |
| Finite depth | ω² = gk·tanh(kd) |
| Capillary-gravity | ω² = gk + (σ/ρ)k³ |
| Gerstner Q | min(choppiness / (k·A·N), 1.0) |
| JONSWAP | S(ω) = (αg²/ω⁵)·exp(−5/4·(ωp/ω)⁴)·γʳ |
| PM peak | ωp = g / (1.026 × U₁₀) |
| Directional spread | cos²ˢ(θ/2), s = 6–16 |
| Monahan whitecap | W = 3.84×10⁻⁶ · U₁₀^3.41 |

### XIII.2 Breakup Physics

| Quantity | Formula | Threshold |
|----------|---------|-----------|
| Weber (sheet) | We = ρ·v²·L/σ | ~12 → break |
| Weber (ligament) | same | ~40 → Rayleigh-Plateau |
| Iribarren | ξ = tan β / √(H/L) | <0.5 spill; 0.5–3.3 plunge; >3.3 surge |
| Steepness | Σ k·A·Q·\|cos θ\| | ≥1 → breaking |

### XIII.3 Optics

| Property | Value |
|----------|-------|
| IOR | 1.333 |
| F₀ (Schlick) | ~0.02 |
| Fresnel | F₀ + (1−F₀)(1−N·V)⁵ |
| Absorption (per m) | [0.45, 0.09, 0.06] |
| Beer-Lambert | I = I₀ · exp(−α·d) |

### XIII.4 Physical Constants

| Constant | Value |
|----------|-------|
| g | 9.81 m/s² |
| ρ_water | 1000 kg/m³ |
| ρ_air | 1.225 kg/m³ |
| σ (surface tension) | 0.073 N/m |
| C_d (sphere) | 0.44 |

---

## XIV. Scope Guardrails (Gem 6)

**These features DO NOT BELONG in the MVP.** Including any will block shipping. The architecture supports all of them — they are simply not Gate 1–4.

| Feature | Why Excluded |
|---------|-------------|
| Bubble plume simulation | Not visible in Three Tests |
| God ray post-processing | Rendering polish, not water identity |
| Nearshore bathymetry | Requires terrain system |
| Surface tension CSF model | MLS-MPM complexity, marginal gain |
| Rayleigh-Plateau pinch-off | Research physics for visual heuristic |
| Phenomenon Cards as build artifacts | Process overhead |
| 14-texture atlas | Premature optimization |
| Multi-resolution cascade FFT | Phase 2, not Day 1 |
| Screen-space fluid for MVP | Billboards pass Orbit at 5 m |
| SSR (screen-space reflections) | Polish, not core |

**Philosophy:** Ship minimum that passes Three Tests. Then iterate.

---

## XV. Evolution Path

| Phase | Feature | Integration Point |
|-------|---------|-------------------|
| 2.1 | FFT spectral ocean | Replace P01. Same output contract. |
| 2.2 | SWE heightfield dynamics | Object wakes. Feeds crestMask. |
| 2.3 | Screen-space fluid | Depth splat → bilateral → normals → composite. |
| 3.0 | MLS-MPM detail sim | Replace/enhance P04. Same buffers. |
| 3.1 | Underwater optics | Post-process. Shared optics. |
| 3.2 | Caustics | Compute pass. Reads heightMap. |
| 4.0 | Multi-domain SWE | Nested heightfields. |
| 5.0 | Object physics | Buoyancy. Reads heightMap. |

---

# PART G — THE IMPLEMENTATION

---

## XVI. Implementation Reference

### XVI.1 Repository Structure

```
hyper-real-ocean/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── index.html
└── src/
    ├── main.tsx                      # React entry point
    ├── App.tsx                       # Canvas + UI bridge (Approach B)
    ├── OceanEngine.ts                # Core orchestrator
    ├── types.ts                      # OceanSettings, OceanTelemetry, PassDescriptor
    ├── constants.ts                  # Single source of truth
    │
    ├── compute/
    │   ├── WaveCompute.ts            # P01: Gerstner wave field
    │   ├── CrestDetect.ts            # P02: Crest mask (EMA + ping-pong)
    │   ├── FoamCompute.ts            # P03: Foam advection (ping-pong)
    │   ├── ParticleSim.ts            # P04: FSM + ride window + phases
    │   ├── CouplingBridge.ts         # P05: Feedback (gated)
    │   ├── spectrum.ts               # JONSWAP generation (CPU, at init)
    │   └── bilinearHelper.ts         # Manual bilinear for StorageTexture
    │
    ├── render/
    │   ├── OceanMesh.ts              # R01: Displaced mesh
    │   ├── SprayRenderer.ts          # R02: Instanced billboard quads
    │   ├── WaterMaterial.ts          # TSL node material
    │   ├── sharedOptics.ts           # ONE FILE — IOR, Fresnel, absorption
    │   ├── Sky.ts                    # R03: Procedural sky dome
    │   └── DebugViews.ts             # R04: Fullscreen debug overlays
    │
    ├── services/
    │   ├── PassRegistry.ts           # Enable/disable/cost tracking
    │   ├── ResourcePool.ts           # Pre-allocate all resources
    │   └── Governor.ts               # Degrade ladder, restore, hysteresis
    │
    ├── ui/
    │   ├── Controls.tsx              # Leva panels
    │   ├── PerfHUD.tsx               # Performance overlay
    │   └── DebugOverlay.tsx          # Debug view selector
    │
    └── scenes/
        └── presets.ts                # Validation scene definitions
```

### XVI.2 Version Pinning

```json
{
    "three": "^0.172.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@react-three/fiber": "^9.0.0",
    "leva": "^0.9.35",
    "vite": "^6.0.0",
    "typescript": "^5.8.0"
}
```

```typescript
// vite.config.ts — required aliases
resolve: {
    alias: {
        'three/webgpu': 'three/build/three.webgpu.js',
        'three/tsl': 'three/build/three.tsl.js',
    }
}
```

### XVI.3 Constants (Single Source of Truth)

```typescript
// constants.ts

// ═══ RESOLUTION ═══
export const WAVE_TEX_SIZE         = 256;
export const FOAM_TEX_SIZE         = 512;
export const COUPLING_TEX_SIZE     = 256;
export const MAX_PARTICLES         = 32768;
export const MAX_PARTICLES_WEBGL   = 8192;
export const MAX_WAVE_COMPONENTS   = 48;

// ═══ PHASES ═══
export const PHASE_DEAD            = 0;
export const PHASE_RIDING          = 1;
export const PHASE_SHEET           = 2;
export const PHASE_LIGAMENT        = 3;
export const PHASE_DROPLET         = 4;
export const PHASE_SPRAY           = 5;

// ═══ RIDE WINDOW ═══
export const RIDE_DURATION         = 0.4;
export const K_ATTACH              = 200;
export const COMOVE_GAIN           = 15;
export const LIFT_GAIN             = 5.0;
export const DAMP_COEFF            = 10;
export const DETACH_DIST           = 0.3;
export const KAPPA_LIFT_THRESH     = 1.5;
export const KAPPA_DETACH_THRESH   = 0.2;
export const CREST_BOOST           = 0.3;

// ═══ PHASE TRANSITION ═══
export const WE_CRIT_SHEET         = 0.5;
export const WE_CRIT_LIGAMENT      = 40;
export const LIGAMENT_DURATION     = 1.0;
export const DROPLET_JITTER        = 0.5;
export const SPRAY_THRESHOLD       = 0.5;

// ═══ FOAM ═══
export const FOAM_INJECT_GAIN      = 0.8;
export const TAU_FOAM_YOUNG        = 2.0;
export const TAU_FOAM_OLD          = 8.0;

// ═══ COUPLING SAFETY ═══
export const FEEDBACK_GAIN         = 0.5;
export const IMPACT_GAIN           = 0.01;
export const MAX_IMPULSE           = 0.5;
export const COUPLING_ALPHA        = 0.3;
export const GLOBAL_ENERGY_CAP     = 1000;

// ═══ PHYSICS ═══
export const GRAVITY               = 9.81;
export const RHO_WATER             = 1000;
export const RHO_AIR               = 1.225;
export const CD_SPHERE             = 0.44;
export const SIGMA_WATER           = 0.073;

// ═══ OPTICS (SHARED — ONE WATER) ═══
export const WATER_IOR             = 1.333;
export const WATER_F0              = 0.02;
export const ABSORPTION            = [0.45, 0.09, 0.06] as const;
export const SCATTER_COLOR         = [0.02, 0.08, 0.12] as const;

// ═══ GOVERNOR ═══
export const GOVERNOR_TARGET_MS    = 16.6;
export const GOVERNOR_DEGRADE_RATIO = 1.3;
export const GOVERNOR_RESTORE_RATIO = 0.8;
export const GOVERNOR_RESTORE_FRAMES = 120;
```

### XVI.4 Leva Control Panel

```
Presets       │ scene: [cinematic-breaker, mid-storm, far-horizon]
Ocean         │ windSpeed [1,25], windDirection [-π,π], choppiness [0.1,3],
              │ waveCount [8,48], tileSize [50,500]
Breakers      │ enableBreakers, crestThreshold [0.1,1.5], maxParticles [8K-64K]
Ride Window   │ rideDuration, kAttach, comoveGain, liftGain, dampCoeff,
              │ detachDist, kappaLiftThresh, kappaDetachThresh, crestBoost
Phase Trans.  │ enablePhaseTransitions, weCritSheet, ligamentDuration, dropletJitter
Foam          │ enableFoam, foamInjectGain, foamDecayYoung, foamDecayOld
Coupling      │ enableCoupling [default: false], feedbackGain, impactGain
Debug         │ debugView [F1-F8], showPerfHUD, timeScale [0.1,2]
Seed          │ seed [0,9999], regenerate button
```

### XVI.5 Glossary

| Term | Definition |
|------|------------|
| **Genesis** | Particle spawn ON wave surface with inherited velocity (C10, Gates 2.5–2.6) |
| **Ride Window** | RIDING phase: F_attach + F_comove + F_lift forces track crest (Gate 2.7) |
| **Crest Mask** | P02 output; .x = break intensity. Particles sample to respawn (C5: atomic-free) |
| **Ping-Pong** | Read A → write B; next frame read B → write A. Deterministic (C6) |
| **Zero-Copy** | Same GPU buffer for compute write and vertex read (C7) |
| **Shared Optics** | `sharedOptics.ts` — one file for ocean + spray optical constants (Gem 5) |
| **Gated** | Feature disabled until specific gate passes. P05 gated until 3.1 |
| **Governor** | p95 frametime → ordered degrade ladder with reverse restore |
| **One Water** | No visible seam between ocean and spray. The Orbit Test |
| **Tuning in the Dark** | Adjusting gains when Genesis input is wrong. C10 prevents |
| **FEEDBACK_ELIGIBLE** | Sentinel on particle re-entry; triggers coupling write |
| **rideAlpha** | `1 − age/rideDuration` — decays ride forces over time |
| **We** | Weber number: ρ·v²·L/σ — breakup criterion |
| **κ** | Curvature: −Σ k²·A·sin θ — drives lift and break type |
| **EMA** | Exponential moving average — temporal crest smoothing (V6) |

### XVI.6 The Six Gems (Preserved Insights)

| Gem | Insight | Source | Where Applied |
|-----|---------|--------|---------------|
| **1** | Ride window is the critical realism gate | V1, V6, V8 | §VII.4 — Sprint 1 is make-or-break |
| **2** | Crest detection must be temporally stable and atomic-free | V6 | §VI.2 — EMA + ping-pong |
| **3** | Coupling must be runaway-safe by design | V6 | §IX.3 — Triple safety |
| **4** | Compute shaders need manual bilinear sampling | V9 | §VII.3 — bilinearHelper.ts |
| **5** | Shared optics is the seam killer | V7 | §VIII.1 — sharedOptics.ts |
| **6** | Scope guardrails prevent the project from eating itself | V7 | §XIV — Explicit exclusions |

### XVI.7 Agent Orchestration Protocol

**Agent role:** Writes code, implements gates, iterates on feedback, reads this spec.

**Braden role:** Runs builds, evaluates visually, provides artistic direction.

**Per-gate protocol:**
1. Agent reads this spec + relevant section for current gate
2. Agent implements deliverables
3. Agent produces validation scene for that gate
4. Braden runs it, evaluates visually
5. If fail → Agent adjusts (one param at a time) → goto 3
6. If pass → Mark complete → Next gate

### XVI.8 Source Attribution Spine

| Layer | Source | Contribution |
|-------|--------|-------------|
| **Base** | V8 | Gates, definitions of done, build order, pass contracts |
| **Physics** | V6 | Weber correction, ride forces, EMA crest, runaway prevention, MLS-MPM spec |
| **Gotchas** | V9 | Manual bilinear, depth compositing, governor bugs, coordinate clamping |
| **Budget** | V2 | Performance budget, sprint schedule, time/cost realism |
| **Scope** | V7 | Exclusions verbatim, "what does NOT belong" |
| **Fixes** | GPT 5.2 | Velocity packing, R3F async gl, forceWebGL prohibition |

---

> *This document is the single source of truth for the ProFlow HyperReal Ocean system. All implementation decisions defer to this spec. All visual decisions defer to Braden. WebGPU is the engine. The crest becomes a sheet. **One water.***