# ProFlow HyperReal Ocean — The Definitive Specification

> **Codename:** ProFlow Continuum  
> **Revision:** DEFINITIVE v5.0  
> **Date:** 2026-02-15  
> **Lead Architect:** Braden + AI Orchestration  
> **Lineage:** Synthesized from 9 UltimateSplash proposals (V1–V9), 13 HyperRealOcean variants, 7 WebGPU drafts, GPT 5.2 meta-analysis, ULTIMATE_PROPOSAL v2.0, Validated Build Plan v3.0, OCEAN_SIMULATION_ENCYCLOPEDIA (Parts A–K), and the full ProFlow codebase (1265+ files, 45+ engines).  
> **Architecture Spine:** V8 orchestration + V6 physics/stability + V9 implementation gotchas + V2 performance budget + V7 scope discipline.  
> **Authority:** This document supersedes ALL prior specifications. Where any prior document contradicts this one, this one wins.

---

## Table of Contents

| §  | Section | Purpose |
|----|---------|---------|
| I | [Vision & North Star](#i-vision--north-star) | Why this exists |
| II | [The Three Tests](#ii-the-three-tests) | When we ship |
| III | [Hard Constraints (C1–C12)](#iii-hard-constraints-c1c12) | What cannot be bent |
| IV | [Data Contract](#iv-data-contract) | The typed ABI everything depends on |
| V | [System Architecture](#v-system-architecture) | How it's wired together |
| VI | [Compute Pipeline (P01–P05)](#vi-compute-pipeline) | The simulation engine |
| VII | [Particle System & Phase FSM](#vii-particle-system--phase-fsm) | The heart — spawn, ride, break, fall |
| VIII | [Rendering — One Water](#viii-rendering--one-water) | The seam killer |
| IX | [Performance Governor](#ix-performance-governor) | Adaptive quality management |
| X | [Development Gates & Build Order](#x-development-gates--build-order) | What to build, when, and why |
| XI | [Validation, Debug & Red Team](#xi-validation-debug--red-team) | How to verify correctness |
| XII | [Physics Reference](#xii-physics-reference) | Governing equations |
| XIII | [Scope Guardrails](#xiii-scope-guardrails) | What does NOT belong |
| XIV | [Evolution Path](#xiv-evolution-path) | Post-ship phases |
| XV | [Implementation Reference](#xv-implementation-reference) | Repo, versions, constants, Leva |
| XVI | [Appendices](#xvi-appendices) | Glossary, cross-ref, decisions, attribution |

---

# I. Vision & North Star

## I.1 The Problem

Every real-time water system in existence — Unreal WaveWorks, Sea of Thieves, NVIDIA Flow, Crest, offline Houdini FLIP — makes the same fatal compromise: **the moment water breaks, it stops being water.** It becomes particles pasted onto a surface. Two rendering systems. A visible seam. The spray doesn't remember it was once part of a wave crest.

This is not a rendering problem. It is an **identity** problem. The optical properties diverge at the fracture boundary — different Fresnel, different absorption, different tint. Two waters. The seam is not geometric. It is photometric.

## I.2 The Thesis

This compromise is no longer necessary in 2026. WebGPU compute shaders provide GPU-side particle simulation without CPU readback. Zero-copy `StorageBufferAttribute` eliminates the compute→render copy. Shared optical models — one file, one import, one water — kill the photometric seam.

We build **continuous water**: from spectral ocean at the horizon to the individual droplet falling from a crest, with no seam, no identity change, no "effect" boundary.

## I.3 The One Sentence (100% Consensus — V1–V9)

> **A wave crest rises, thins into a translucent sheet, stretches into ligaments, tears into droplets, those droplets fall back, create ring waves, and entrain foam — and at no point does the visual identity of "water" change.**

Every subsystem, every constraint, every pass, every line of shader code exists to serve this sentence.

## I.4 The Seam Truth (GPT 5.2)

Many systems fail not because particles are "bad," but because optical identity changes at the fracture boundary. **Shared optics is the fix.** If ocean mesh and spray particles import identical Fresnel, absorption, and scatter constants, the seam disappears regardless of rendering technique.

---

# II. The Three Tests

The system ships when — and only when — it passes all three. Everything else is negotiable. These are not.

| Test | Procedure | Pass Condition | Failure Mode | What It Proves |
|------|-----------|----------------|--------------|----------------|
| **Orbit** | Orbit camera 360° around breaking wave at 5 m | At no angle can you identify where "ocean" ends and "effect" begins | Two rendering systems with visible boundary | Seam elimination via shared optics + depth compositing |
| **Slow-Mo** | Play breaking at 0.25× speed | Continuous progression: sheet → ligaments → droplets → arcs → re-entry → ring waves. **NOT** particles appearing/disappearing. | Particle pop-in/out. No intermediate states. Confetti. | Physics progression via ride window + phase FSM |
| **Horizon** | Camera at 500 m altitude | Seamless tiling, natural foam streaks, zero computational artifacts | Visible repetition, grid edges, particle pop-in | Scale stability + LOD + foam advection correctness |

**Orbit Test lighting requirement:** Must pass under noon sun, golden hour, AND overcast.

---

# III. Hard Constraints (C1–C12)

These cannot be bent. Each exists because violating it destroyed one or more prior attempts across 20+ proposals and 7 WebGPU drafts.

## Platform

### C1: WebGPU-First *(100% consensus)*

WebGPU is the engine. WebGL2 is a degraded fallback — separate codepath, reduced feature set. The compute pipeline cannot be expressed in WebGL2. Treating WebGL2 as equal leads to lowest-common-denominator design.

### C2: No Cross-API Mixing *(100% consensus)*

One backend per session. Boot into WebGPU or WebGL2. Never both. **`forceWebGL: true` on `WebGPURenderer` is FORBIDDEN** — use a completely separate `WebGLRenderer`.

```typescript
// CORRECT
if (hasWebGPU) {
    this.renderer = new WebGPURenderer({ canvas, antialias: true });
    await this.renderer.init();
    this.isWebGPU = true;
} else {
    this.renderer = new WebGLRenderer({ canvas, antialias: true });
    this.isWebGPU = false;
}
```

## Performance

### C3: No GPU Readbacks in Hot Path *(100% consensus)*

Zero `readBuffer()`, `readTexture()`, `gl.readPixels()`, or synchronous fence operations in the render loop. Debug/telemetry readbacks: throttled ≤2 Hz, opt-in, async with two-frame delay. **The #1 performance killer in every failed water engine.**

### C4: No Per-Frame Allocations *(100% consensus)*

All textures, buffers, render targets created at initialization. No `new Float32Array()`, no `createTexture()`, no `createBuffer()` in the animate loop. Resources pooled, pre-allocated, reused via ping-pong. The GC must never touch the hot path. *Exception: resize events.*

## Simulation

### C5: Atomic-Free Crest Spawning *(100% consensus)*

Crest detection writes a **mask texture**; dead particles respawn by sampling it. Each particle independently checks the mask — no coordination, no atomics, no append buffer. Works on every GPU. *Exception: MLS-MPM P2G (Phase 2) uses fixed-point atomics for grid scatter — explicitly permitted.*

### C6: Deterministic Ping-Pong *(100% consensus)*

Foam, coupling feedback, crest EMA, and any advected quantity use strict double-buffering. Frame N: read A → write B. Frame N+1: read B → write A. Two separate compute nodes created at init. No "read + write same buffer" hacks.

### C10: Genesis Before Feedback *(8/9 consensus, V7 divergence resolved)*

Particles must spawn ON the wave surface with wave-inherited velocity (Gates 2.5/2.6) **before** any ride window tuning (2.7), **before** any phase transition tuning (2.8), **before** any coupling feedback (3.1). Prevents "tuning in the dark."

> *V7 defines C10 as "Shared optics." Resolution: shared optics is correct but belongs in rendering. C10 = Genesis before feedback.*

## Rendering & Integration

### C7: Zero-Copy Particle Rendering *(100% consensus)*

Particle data lives in `StorageBufferAttribute`. Compute writes, vertex reads directly. No CPU involvement. No copies. The core WebGPU performance advantage.

### C8: React / three.js Integration Resolved *(100% consensus)*

| Approach | When | Key |
|----------|------|-----|
| **A: R3F Canvas + async gl factory** | Post-Gate 3.0 | `gl={async (props) => { const r = new WebGPURenderer(props); await r.init(); return r; }}` |
| **B: React UI + vanilla three.js** | **Day 1 (recommended)** | `ref` to OceanEngine + telemetry callback; your own frame loop |

### C9: Instanced Billboard Quads *(100% consensus)*

WebGPU point sprite size limits make `gl_PointSize` unreliable. All spray/sheet/droplet particles render as instanced camera-facing quads with per-instance size, elongation, and opacity.

## Best Practice (V6)

### C11: No Implicit Format Conversions

All texture formats explicitly declared and matched between creation, bind group layout, and shader. Mismatched formats cause silent corruption on some GPUs.

### C12: Deterministic Frame Ordering

Compute passes execute in declared order with implicit barriers between `encoder.end()` / `encoder.beginComputePass()`. Sequential passes are the synchronization primitive.

---

# IV. Data Contract

The single source of truth for all inter-pass data. The velocity packing fix (GPT 5.2 Contradiction C) is the most critical correction in the entire specification.

## IV.1 Texture ABI (v3.0 Corrected)

> **MANDATORY FIX:** Store full surface-plane velocity `(vel.x, vel.z)` in velocityTex. Prior versions dropped `vel.z` — breaks foam advection, particle comovement, and diagonal crest transport.

| Texture | Format | .x | .y | .z | .w | Ping-Pong |
|---------|--------|----|----|----|----|-----------|
| `heightTex` | RGBA32F 256² | disp.x | disp.y (η) | disp.z | **vel.y** | No |
| `normalTex` | RGBA32F 256² | N.x | N.y | N.z | **steepness** | No |
| `velocityTex` | RGBA32F 256² | **vel.x** | **vel.z** | curvature (κ) | reserved | No |
| `crestMaskTex` | RGBA32F 256² | intensity | breakType | crestAngle | steepExcess | Yes (EMA) |
| `foamTexA/B` | RGBA32F 512² | density | age | — | — | Yes |
| `couplingTexA/B` | RGBA32F 256² | Δη | Δη̇ | Δfoam | energy | Yes (gated) |

### Corrected textureStore Output (P01)

```
textureStore(heightTex,   ivec2(ix,iy), vec4(disp.x, disp.y, disp.z, vel.y));
textureStore(normalTex,   ivec2(ix,iy), vec4(norm.x, norm.y, norm.z, steep));
textureStore(velocityTex, ivec2(ix,iy), vec4(vel.x,  vel.z,  curv,   0.0));
```

### Downstream Impact

| Consumer | What Changed |
|----------|-------------|
| P02 CrestMask | Vertical velocity: **heightTex.w** (was velocityTex.y). Steepness: **normalTex.w** (was velocityTex.w). |
| P03 FoamCompute | Semi-Lagrangian trace-back: **velocityTex.xy** = (vel.x, vel.z) — both horizontal |
| P04 ParticleSim | Co-movement: **velocityTex.xy**. Vertical velocity: **heightTex.w** |

## IV.2 Particle Buffers (32K × vec4, Zero-Copy)

| Buffer | .x | .y | .z | .w |
|--------|----|----|----|----|
| `positionBuf` | world x | world y | world z | phase (0–5) |
| `dataBuf` | velocity x | velocity y | velocity z | age (seconds) |
| `renderBuf` | size | alpha | thickness | elongation |

## IV.3 Spectrum Buffer

```
waveBuf: vec4 × MAX_WAVES × 2
  [i×2+0]: (dirX, dirZ, amplitude, frequency)
  [i×2+1]: (phase, Q, reserved, reserved)
```

## IV.4 Memory Budget

| Resource | Memory |
|----------|--------|
| Wave textures (3 × RGBA32F × 256²) | 3 MB |
| Crest mask (×2 ping-pong) | 2 MB |
| Foam (×2 ping-pong, 512²) | 8 MB |
| Coupling (×2 ping-pong) | 2 MB |
| Particle buffers (3 × vec4 × 32K) | 1.5 MB |
| waveBuf (vec4 × 96) | <1 KB |
| **Total** | **~16.5 MB** |

---

# V. System Architecture

## V.1 Topology

```
┌──────────────────────────────────────────────────────────────────────────┐
│                          React Application Layer                          │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────────────────┐  │
│   │ Leva     │  │ PerfHUD  │  │ Debug    │  │ Validation Scene       │  │
│   │ Controls │  │ Overlay  │  │ Views    │  │ Selector               │  │
│   └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬──────────────────┘  │
│        └──────────────┴────────────┴────────────────┘                    │
│                       │ ref + telemetry callback                          │
├───────────────────────▼──────────────────────────────────────────────────┤
│                     OceanEngine (owns everything below)                   │
│                                                                          │
│  ┌─── COMPUTE (5 sequential dispatches, ORDER INVARIANT) ─────────────┐  │
│  │  P01 WaveField → P02 CrestMask → P03 Foam → P04 Particles → P05   │  │
│  │   (Gerstner)    (EMA+smooth)    (ping-pong)  (FSM+ride)    (gated) │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌─── RENDER ─────────────────────────────────────────────────────────┐  │
│  │  R01 Ocean Mesh (opaque, depth write ON)                           │  │
│  │  R02 Spray Billboards (transparent, additive, depth write OFF)     │  │
│  │  R03 Sky Dome                                                     │  │
│  │  R04 Debug Overlay (opt-in)                                        │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌─── SERVICES ───────────────────────────────────────────────────────┐  │
│  │  PassRegistry  │  ResourcePool  │  Governor  │  Telemetry           │  │
│  └────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────┘
```

## V.2 Pass Registry

| ID | Name | Type | Res | Cost | Governor Fallback |
|----|------|------|-----|------|-------------------|
| P01 | WaveFieldCompute | compute | 256² | 0.8 ms | 128² |
| P02 | CrestMaskDetect | compute | 256² | 0.3 ms | 128² |
| P03 | FoamCompute | compute | 512² | 0.5 ms | 256² |
| P04 | ParticleSim | compute | 32K | 2.0 ms | 16K → 8K |
| P05 | CouplingFeedback | compute | 256² | 0.3 ms | DISABLE |
| R01–R04 | Render passes | render | screen | ~2.0 ms | LOD/toggle |
| | **Grand total** | | | **~5.9 ms** | **10.7 ms headroom at 60 fps** |

**Workgroup convention:** 2D textures: `[16, 16, 1]`. Particles: `[256, 1, 1]`.

## V.3 Init Order (Load-Bearing)

```
 1. navigator.gpu check → choose backend
 2. Create renderer (WebGPURenderer OR separate WebGLRenderer)
 3. await renderer.init()              ← CRITICAL: before ANY resource creation
 4. OrbitControls
 5. ResourcePool.allocateAll()         ← C4: ALL textures + buffers at this moment
 6. WaveCompute(pool)
 7. CrestDetect(pool)
 8. FoamCompute(pool)                  ← creates BOTH ping-pong nodes
 9. ParticleSim(pool)
10. CouplingBridge(pool)
11. PassRegistry.register([P01..P05])
12. Governor(passRegistry, degradeLadder)
13. OceanMesh, SprayRenderer, Sky      ← scene objects
14. Resize handler
```

## V.4 Animate Loop

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
        this.tickWebGLFallback(time);  // C2: never both
    }

    renderer.render(scene, camera);
    governor.update(performance.now() - t0);
    emitTelemetry();
}
```

---

# VI. Compute Pipeline

## VI.1 P01: Wave Field Computation

**Approach:** Multi-component Gerstner summation. Single compute dispatch.

**Why Gerstner (Day 1), not FFT:** FFT requires multiple passes (butterfly, IFFT, permutation), twiddle textures, sync. Gerstner is one dispatch, identical visual quality for 16–48 components, trivially parallel, exact analytical derivatives. **FFT is Phase 2** — same output contract, drop-in replacement.

### Equations (V6 physics-corrected)

```
Displacement:
  x  = x₀ − Σᵢ Qᵢ Aᵢ Dᵢₓ cos(θᵢ)
  y  =      Σᵢ Aᵢ sin(θᵢ)
  z  = z₀ − Σᵢ Qᵢ Aᵢ Dᵢz cos(θᵢ)
  θᵢ = kᵢ(Dᵢ · x₀) − ωᵢt + φᵢ

Velocity (time derivative):
  vₓ  = Σᵢ Qᵢ Aᵢ Dᵢₓ ωᵢ sin(θᵢ)
  v_y = Σᵢ Aᵢ ωᵢ cos(θᵢ)
  v_z = Σᵢ Qᵢ Aᵢ Dᵢz ωᵢ sin(θᵢ)

Normal (approximate, drops Q² terms):
  N ≈ normalize(−Σ kᵢAᵢDᵢₓcos(θ), 1 − Σ Qᵢkᵢ²Aᵢsin(θ), −Σ kᵢAᵢDᵢzcos(θ))

Steepness:  S = Σᵢ kᵢ Aᵢ Qᵢ |cos(θᵢ)|        (≥1 → breaking)
Curvature:  κ = −Σᵢ kᵢ² Aᵢ sin(θᵢ)
Dispersion: ω² = gk  (deep water)
Q:          min(choppiness / (k × A × N), 1.0)
```

### Spectrum Generation (CPU, at init or wind change)

JONSWAP spectral density with directional cos²ˢ spreading, stratified frequency sampling, deterministic seeded RNG (same seed = same ocean).

---

## VI.2 P02: Crest Mask Detection

### ⚑ Gem 2: Crest Detection Must Be Temporally Stable and Atomic-Free

V6's EMA + ping-pong crest textures is the correct pattern. Single-frame detection causes flicker (crests appear/disappear randomly). EMA smoothing + 3×3 spatial averaging stabilizes the mask. V6 caught the illegal read/write-to-same-texture bug — crest needs ping-pong like foam.

### Logic

```
steepExcess = smoothstep(crestThreshold, crestThreshold+0.3, steepness)
isRising    = smoothstep(0, 0.5, vertVel)              ← heightTex.w
curveFactor = smoothstep(0.5, 2.0, curvature)           ← velocityTex.z
intensity   = steepExcess × isRising × (curveFactor×0.5 + 0.5)

plungeScore = curvature × max(0, vertVel)               // Iribarren proxy
breakType   = smoothstep(0, 5.0, plungeScore)           // 0=spilling, 1=plunging
crestAngle  = atan2(gradZ, gradX)                        // height finite differences
```

**Output:** `crestMaskTex` — (intensity, breakType, crestAngle, steepnessExcess)

---

## VI.3 P03: Foam Compute (Deterministic Ping-Pong)

**C6 compliance:** Two StorageTextures, two compute nodes at init, XOR toggle each frame.

### Per-Texel Logic

1. **Advection:** Semi-Lagrangian trace-back by `velocityTex.xy` = `(vel.x, vel.z)` — **both** horizontal components
2. **Decay:** `tau = mix(tauYoung, tauOld, smoothstep(0, 5, age))` → `decayed = foam × (1 − dt/tau)`
3. **Injection:** `crestMask.x × foamInjectGain`
4. **Stretch dissipation:** `stretchDecay = clamp(1 − |vel|×0.1, 0.8, 1.0)`

---

## VI.4 P04: Particle Simulation

*See [§VII](#vii-particle-system--phase-fsm) for full specification.*

---

## VI.5 P05: Coupling Feedback (GATED)

**Default: DISABLED.** Enabled only after Gate 3.0 passes. See [§IX.3](#ix3-coupling-stability-protocol) for activation protocol.

### ⚑ Gem 3: Coupling Must Be Runaway-Safe by Design

Triple safety (per-texel clamp + temporal smoothing + global energy cap) is the difference between "cool demo" and "production system that doesn't explode at storm settings."

| Safety | Mechanism |
|--------|-----------|
| **Per-texel clamp** | No single texel > MAX_IMPULSE |
| **Temporal smoothing** | New feedback blended with previous (alpha = 0.3) |
| **Global energy cap** | Hierarchical mip chain reduction over .w channel; if total > cap, scale all. **No readback — GPU-side only.** |

---

# VII. Particle System & Phase FSM

This is the heart of the system. 32K particles, each independently executing a finite state machine.

## VII.1 Phase State Machine

```
DEAD (0) ──── [crest mask sampling] ────→ RIDING (1)
  ▲                                            │
  │          [ride window forces: attach,       │
  │           co-move, lift, damp × rideAlpha]  │
  │                                            │
  │           age > rideDuration    OR          │
  │           |gap| > detachDist    OR          │
  │           κ < kappaDetachThresh             │
  │                                            ▼
  │                                       SHEET (2)
  │                                            │
  │           We < weCritSheet    OR            │
  │           age > maxSheetAge                 │
  │                                            ▼
  │                                      LIGAMENT (3)
  │                                            │
  │           age > ligamentDuration            │
  │                                            ▼
  │                                       DROPLET (4)
  │                              ╱                    ╲
  │                  y > surface+thresh            ballistic
  │                       ▼                           │
  │                   SPRAY (5)                       │
  │                       │                           │
  │               re-enters surface                   │
  └──────────── DEAD (FEEDBACK_ELIGIBLE) ◄────────────┘
```

| Phase | Value | Entry | Exit | Physics |
|-------|-------|-------|------|---------|
| DEAD | 0 | Spawn or recycle | Crest mask sample > threshold | — |
| RIDING | 1 | Crest spawn | age/gap/curvature detach | Attach, co-move, lift, damp |
| SHEET | 2 | RIDING exit | Weber or age | Gravity, thickness decay |
| LIGAMENT | 3 | SHEET breakup | age > ligDuration | Elongation, pinch |
| DROPLET | 4 | LIGAMENT pinch | y vs surface | Ballistic + drag |
| SPRAY | 5 | DROPLET above surface | re-entry or age | Ballistic + wind drag |

**Target phase distribution during active break:** ~40% sheet, ~25% ligament, ~35% droplet.

---

## VII.2 Spawning (C5: Atomic-Free)

Dead particles sample crest mask at deterministic pseudo-random UV `(particleIndex + time hash)`. Probabilistic accept: `roll < intensity × spawnRate`.

**Genesis (C10):**
- **Position:** ON the wave surface at sample location
- **Velocity:** INHERITED from wave at that location (both horizontal + vertical)

### ⚑ Gem 4: Compute Shaders Need Manual Bilinear Sampling

StorageTexture has no sampler. `textureLoad()` returns point samples. When particles sample wavefields at non-integer coordinates, **manual bilinear interpolation is mandatory** — not optional.

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

---

## VII.3 Ride Window Forces

### ⚑ Gem 1: Ride Window is the Critical Realism Gate

The difference between "water" and "confetti" is the RIDING phase force model. Without F_attach + F_comove + F_lift + damping, particles scatter instantly on spawn. With them, sheets track crests cinematically. **Sprint 1 is make-or-break.**

| Force | Equation | Purpose |
|-------|----------|---------|
| **F_attach** | `gap × kAttach × rideAlpha` along normal | Soft spring to wave surface |
| **F_comove** | `(targetVel − vel) × comoveGain × rideAlpha` | Bias velocity toward wave motion |
| **F_lift** | `max(0, κ − κ_thresh) × liftGain` upward | Curvature-driven throw (plunging) |
| **F_damp** | `−(vel − targetVel) × dampCoeff × rideAlpha` | Oscillation suppression |

**rideAlpha** = `1 − age/rideDuration` — decays linearly over ride window.

### Detach Conditions (any triggers exit)

- `rideTimer > rideDuration` — time expired
- `|gap| > detachDist` — particle drifted from surface
- `curvature < kappaDetachThresh` — crest passed; let go

### No Velocity Discontinuity Rule

At detach: particle **keeps** current velocity + smooth lift boost. Never instant swap. Prevents the jarring "pop" at transition.

### Parameters (Leva-Tunable)

| Parameter | Default | Range | Effect |
|-----------|---------|-------|--------|
| rideDuration | 0.4 s | 0.1–2.0 | How long sheet tracks crest |
| kAttach | 200 | 50–500 | Spring stiffness |
| comoveGain | 15 | 5–50 | Velocity bias |
| liftGain | 5.0 | 1–20 | Curvature throw |
| dampCoeff | 10 | 2–50 | Damping |
| detachDist | 0.3 m | 0.05–1.0 | Max gap |
| kappaLiftThresh | 1.5 | 0.5–5.0 | Lift onset |
| kappaDetachThresh | 0.2 | 0–1.0 | Detach trigger |
| crestBoost | 0.3 | 0.1–1.0 | Spawn velocity multiplier |

### Anti-Cues for Ride Window

| Visual Problem | Cause | Fix |
|----------------|-------|-----|
| Particles float above crest | kAttach too low | Increase kAttach |
| Particles slide backward off crest | comoveGain too low | Increase comoveGain |
| Instant confetti on spawn | Ride window not applied | Check RIDING code path (code bug) |
| Particles welded forever | rideDuration too high / detach never triggers | Lower rideDuration; check detach conditions |
| Velocity discontinuity at detach | Instant velocity swap | Keep vel + smooth lift boost |

---

## VII.4 Phase Transitions

**SHEET:** Gravity + thickness decay. Weber-like breakup: `We = ρ·v²·L/σ` (V6 dimensionally correct). If `We < weCritSheet` → LIGAMENT. Sheet should break within ~0.8 s of detach.

**LIGAMENT:** Elongation increases (`+= dt × 0.5; clamp 1.0–4.0`). After `ligamentDuration` → DROPLET. Jitter velocity at pinch-off for varied trajectories.

**DROPLET:** Ballistic + mild air drag (`vel *= 0.998`). If `height > surface + sprayThreshold` → SPRAY. If re-enters surface → DEAD with FEEDBACK_ELIGIBLE.

**SPRAY:** Ballistic + sphere drag + wind. `F_drag = −0.5 × ρ_air × C_d × |v_rel| × v_rel / mass`. Re-entry → DEAD with FEEDBACK_ELIGIBLE.

### Anti-Cues for Phase Transitions

| Visual Problem | Cause | Fix |
|----------------|-------|-----|
| Popcorn (instant breakup) | No sheet phase or We_crit too high | Ensure SHEET phase exists; tune We_crit |
| Goo (never breaks) | We_crit too low | Raise weCritSheet |
| Dust (no ligament) | Scatter too fast | Ensure connected sheet for ≥2 frames |

---

# VIII. Rendering — One Water

## VIII.1 Shared Optics

### ⚑ Gem 5: Shared Optics is the Seam Killer

One file (`sharedOptics.ts`). One import. Both ocean mesh AND spray billboards use identical Fresnel, absorption, scatter, tint. If they diverge under ANY camera angle, the seam reappears. This is the Orbit Test dependency.

```typescript
// sharedOptics.ts — THE file. One water.
export const WATER_IOR     = 1.333;
export const WATER_F0      = 0.02;    // ((1-IOR)/(1+IOR))²
export const DEEP_COLOR    = [0.0, 0.05, 0.15];
export const SHALLOW_COLOR = [0.0, 0.15, 0.25];
export const FOAM_COLOR    = [0.85, 0.88, 0.92];
export const SSS_TINT      = [0.1, 0.4, 0.35];
export const ABSORPTION    = [0.45, 0.09, 0.06];   // per meter (Beer-Lambert)
export const SCATTER_COLOR = [0.02, 0.08, 0.12];

// TSL Fresnel:    F = F0 + (1−F0)(1−N·V)⁵
// TSL Absorption: color × exp(−absorption × pathLength)
```

## VIII.2 Render Pipeline

| Pass | Purpose | Depth | Blend |
|------|---------|-------|-------|
| **R01 Ocean Mesh** | Displaced vertices, shared optics material | Write ON | Opaque |
| **R02 Spray Billboards** | Instanced quads from particle buffers | Write OFF, Test ON | Additive |
| **R03 Sky Dome** | Procedural environment | — | Behind |
| **R04 Debug Overlay** | Opt-in fullscreen quad | — | Overlay |

### R01 Details
- **Vertex:** Displace from heightTex
- **Normal:** From normalTex (analytical)
- **Color:** Fresnel + absorption + foam overlay + SSS
- **Roughness:** 0.05 (water) → 0.6 (foam patches)

### R02 Details
- **Geometry:** `InstancedMesh` with `PlaneGeometry(1,1)` — camera-facing
- **Per-instance:** Position from positionBuf, size/alpha/elongation from renderBuf (C7: zero-copy)
- **Dead particles:** Moved to `(0, −1000, 0)`
- **Shape:** Soft circle via `smoothstep(0.5, 0.3, dist)`

## VIII.3 Screen-Space Fluid (Phase 2 — Post-Gate 4.0)

Billboards + shared optics pass the Orbit Test at 5 m if spawn density, ride window, and depth test are correct. Screen-space fluid is Hero Shot Mode. Architecture supports drop-in: depth splat → bilateral smooth → normal reconstruction → composite.

---

# IX. Performance Governor

## IX.1 Degrade Ladder (Canonical Order)

Degrade in this order. **Restore in REVERSE order.** Hysteresis prevents thrashing.

| Step | Action | Save | Impact |
|------|--------|------|--------|
| 1 | Particles 32K → 16K | 1.0 ms | Low |
| 2 | Particles 16K → 8K | 0.5 ms | Medium |
| 3 | Foam 512² → 256² | 0.3 ms | Low |
| 4 | Reduce crest smoothing | — | Low |
| 5 | Disable coupling | 0.3 ms | Medium |
| 6 | Disable screen-space fluid | — | Medium |
| 7 | Disable breakers (P02+P04 off) | 2.3 ms | **High (last resort)** |

## IX.2 Logic

```
Degrade: p95 frametime > 16.6 ms × 1.3
Restore: p95 frametime < 16.6 ms × 0.8 for 120 frames (~2 s)
Smoothing: Exponential moving average (not raw)
```

## IX.3 Coupling Stability Protocol

| Step | Action | Duration | Verify |
|------|--------|----------|--------|
| 1 | Foam deposition only | 60 s | No foam runaway |
| 2 | Ring waves gain=0.1 | 60 s | No oscillation |
| 3 | Gain → 0.5 | 60 s | Stable |
| 4 | Gain = 1.0, storm | 60 s | Bounded |
| 5 | If any step fails | — | Freeze at previous |

---

# X. Development Gates & Build Order

## X.1 Current Status

| Gate | Status |
|------|--------|
| W0–W3: Infrastructure | ✅ Complete |
| 2.5: Genesis Position | ✅ Complete |
| 2.6: Genesis Velocity | ✅ Complete |
| **2.7: Ride Window** | 🔴 **Current Blocker** |

## X.2 Gate Definitions

| Gate | Name | Definition of Done |
|------|------|-------------------|
| **2.7** | **Ride Window** | Sheet tracks crest ≥0.3 s. Smooth detach. No confetti. Side camera, 0.25×. |
| 2.8 | Phase Transitions | Sheet→lig→drop visible at 0.25×. ≥2 ligament frames. Histogram ~40/25/35. |
| 3.0 | Seam Elimination | Orbit Test passes at noon, golden hour, AND overcast. |
| 3.1 | Coupling | Ring waves. Foam deposit. No runaway 60 s storm. Protocol complete. |
| 4.0 | Perf No-Stall | 60 fps sustained. p99 < 16.6 ms. Governor tested. Zero readbacks. |

## X.3 Rules

```
No gate N+1 work until gate N passes.
Coupling tuning FORBIDDEN until 2.7 + 2.8 + 3.0 pass.
```

## X.4 Sprint Plan

| Sprint | Gate | Duration | Critical Note |
|--------|------|----------|---------------|
| **1** | **2.7 Ride Window** | **5 days** | **MAKE-OR-BREAK. This is where "confetti" becomes "water."** |
| 2 | 2.8 Phase Transitions | 4 days | Slow-Mo Test validation |
| 3 | 3.0 Seam Elimination | 3 days | Orbit Test under 3 lighting conditions |
| 4 | 3.1 Coupling | 3 days | 5-step stability protocol |
| 5 | 4.0 Perf / Governor | 2 days | Storm scene stress test |
| | | **~17 days** | |

## X.5 Ride Window Tuning Protocol (Sprint 1)

1. Start defaults: rideDuration=0.4, kAttach=200, comoveGain=15, liftGain=5
2. Run Ride Window validation scene at 0.25× speed
3. Braden evaluates: "Does the sheet track the crest? How long? Is detach smooth?"
4. Adjust **one parameter at a time** (isolate variables)
5. Iterate until sheet visibly rides crest ≥0.3 s with smooth detach
6. Record final tuned values as new defaults

---

# XI. Validation, Debug & Red Team

## XI.1 Validation Scenes

| Scene | Camera | Settings | Validates |
|-------|--------|----------|-----------|
| **Cinematic Breaker** | (15,5,20) → origin | wind 12, chop 1.5, waves 32, seed 42 | Gates 2.7, 2.8, 3.0 |
| **Mid Storm** | (40,20,50) → origin | wind 20, chop 2.0, waves 48, seed 137 | Gate 4.0 |
| **Far Horizon** | (0,8,150) → origin | wind 8, chop 1.0, waves 24, seed 7 | Horizon Test |
| **Genesis Verify** | Freeze at t₀ | — | Particles on surface |
| **Ride Window** | Side view, 0.25× | rideDuration 0.4 | Sheet tracks crest |
| **Seam Test** | Orbit 360° at 5 m | — | Noon, golden hour, overcast |

## XI.2 Debug Views (GPU-Only, Zero Readback)

| Key | View | Shows |
|-----|------|-------|
| F1 | Height Map | Displacement gradient |
| F2 | Normal Map | RGB normals |
| F3 | Crest Mask | Red heat intensity |
| F4 | Steepness | normalTex.w gradient |
| F5 | Foam Density | White overlay |
| F6 | Particle Phase | RIDING=green, SHEET=cyan, LIGAMENT=yellow, DROPLET=red, SPRAY=white |
| F7 | Ride Timer | Green→red age gradient (detached=gray) |
| F8 | Pass Timing | Per-pass costs + governor state |

## XI.3 PerfHUD

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

## XI.4 Red-Team Checklist (Pre-Ship)

| # | Check | Method |
|---|-------|--------|
| 1 | velocityTex stores (vel.x, vel.z) not (vel.x, vel.y) | Inspect textureStore in P01 |
| 2 | heightTex.w = vel.y; normalTex.w = steepness | Inspect textureStore in P01 |
| 3 | Foam advection uses velocityTex.xy as (vel.x, vel.z) | Check P03 trace-back |
| 4 | No readBuffer/mapAsync in animate | `grep -r "readBuffer\|mapAsync" src/` |
| 5 | No createTexture/createBuffer in animate | `grep` hot path |
| 6 | No new Float32Array in animate | `grep` hot path |
| 7 | Crest uses mask texture, no atomics | No `atomicAdd` in spawn path |
| 8 | Foam has two textures with XOR toggle | foamA, foamB verified |
| 9 | Crest uses EMA + ping-pong (V6) | crestTexA, crestTexB |
| 10 | Coupling gated — P05 disabled until 3.1 | passRegistry check |
| 11 | Shared optics — one import for both materials | sharedOptics.ts verified |
| 12 | Billboard quads, not points | InstancedMesh + PlaneGeometry |
| 13 | Zero-copy particle rendering | StorageBufferAttribute |
| 14 | Pass order P01→P02→P03→P04→P05 | No reorder in animate |
| 15 | Governor restores in REVERSE degrade order | Each step has restore() |
| 16 | Manual bilinear helper for particle sampling | bilinearHelper.ts used |
| 17 | No forceWebGL: true | Separate WebGLRenderer |
| 18 | Deterministic seed for spectrum | Same seed = same ocean |
| 19 | ResourcePool.allocateAll() at init | No lazy allocation |
| 20 | C11: All texture formats explicitly matched | No implicit conversions |

---

# XII. Physics Reference

## XII.1 Governing Equations

| Equation | Formula |
|----------|---------|
| Deep-water dispersion | ω² = gk; c = √(g/k) |
| Finite depth | ω² = gk·tanh(kd) |
| Capillary-gravity | ω² = gk + (σ/ρ)k³ |
| JONSWAP spectrum | S(ω) = (αg²/ω⁵)·exp(−5/4·(ωp/ω)⁴)·γ^r |
| Directional spread | cos²ˢ(θ/2); s = 6–16 |
| Weber number | We = ρ·v²·L/σ; sheet crit ~12 |
| Fresnel (Schlick) | F = F₀ + (1−F₀)(1−N·V)⁵; F₀ ≈ 0.02 |
| Beer-Lambert | I = I₀·exp(−α·d) |
| Monahan whitecap | W = 3.84×10⁻⁶·U₁₀^3.41 |
| Iribarren | ξ = tan(β)/√(H/L); <0.5 spill, 0.5–3.3 plunge |

## XII.2 Physical Constants

| Constant | Value |
|----------|-------|
| g | 9.81 m/s² |
| ρ_water | 1000 kg/m³ |
| ρ_air | 1.225 kg/m³ |
| σ (surface tension) | 0.073 N/m |
| C_d (sphere drag) | 0.44 |

---

# XIII. Scope Guardrails

### ⚑ Gem 6: Scope Guardrails Prevent the Project from Eating Itself

V7's exclusion list is a survival manual. Without explicit exclusions, every cool idea blocks shipping.

| Feature | Why Excluded | Risk |
|---------|--------------|------|
| Bubble plume simulation | Not visible in Three Tests | Months of scope creep |
| God ray post-processing | Polish, not water | Distraction from core gates |
| Nearshore bathymetry | Requires terrain system | Dependency blocker |
| Surface tension CSF | MLS-MPM complexity | Tuning nightmare |
| Rayleigh-Plateau pinch-off | Research physics | Over-engineering |
| Multi-cascade FFT | Phase 2 feature | Blocks shipping |
| Screen-space fluid for MVP | Post-Gate 4.0 | Billboards pass Orbit at 5 m |

**Philosophy:** Ship minimum that passes Three Tests. Architecture supports all. They're not Gate 1–4.

---

# XIV. Evolution Path

| Phase | Feature | Integration |
|-------|---------|-------------|
| 2.1 | FFT spectral ocean | Replace P01. Same output contract. |
| 2.2 | SWE heightfield dynamics | Object wakes. Feeds crestMask. |
| 2.3 | Screen-space fluid | Between R01 and R02. |
| 3.0 | MLS-MPM detail sim | Replace/enhance P04. Same buffers. |
| 3.1 | Underwater optics | Post-process. Shared optics. |
| 3.2 | Caustics | Compute pass. Reads heightMap. |
| 4.0 | Multi-domain SWE | Nested heightfields. |
| 5.0 | Object physics (hulls) | Buoyancy. Reads heightMap. |

---

# XV. Implementation Reference

## XV.1 Repository Structure

```
hyper-real-ocean/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── index.html
└── src/
    ├── main.tsx                     # React entry
    ├── App.tsx                      # Canvas + UI bridge
    ├── OceanEngine.ts               # Core orchestrator
    ├── types.ts                     # Interfaces
    ├── constants.ts                 # Single source of truth
    │
    ├── compute/
    │   ├── WaveCompute.ts           # P01: Gerstner
    │   ├── CrestDetect.ts           # P02: EMA + ping-pong
    │   ├── FoamCompute.ts           # P03: Ping-pong
    │   ├── ParticleSim.ts           # P04: FSM + ride + phases
    │   ├── CouplingBridge.ts        # P05: Gated
    │   ├── spectrum.ts              # JONSWAP (CPU, init)
    │   └── bilinearHelper.ts        # Manual bilinear (Gem 4)
    │
    ├── render/
    │   ├── OceanMesh.ts             # R01
    │   ├── SprayRenderer.ts         # R02: Billboard quads
    │   ├── WaterMaterial.ts         # TSL node material
    │   ├── sharedOptics.ts          # Gem 5: ONE FILE
    │   ├── Sky.ts                   # R03
    │   └── DebugViews.ts            # R04
    │
    ├── services/
    │   ├── PassRegistry.ts
    │   ├── ResourcePool.ts
    │   └── Governor.ts
    │
    ├── ui/
    │   ├── Controls.tsx             # Leva
    │   ├── PerfHUD.tsx
    │   └── DebugOverlay.tsx
    │
    └── scenes/
        └── presets.ts               # Validation configs
```

## XV.2 Version Pinning

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
// vite.config.ts aliases
resolve: {
    alias: {
        'three/webgpu': 'three/build/three.webgpu.js',
        'three/tsl': 'three/build/three.tsl.js',
    }
}
```

## XV.3 Constants (Single Source of Truth)

```typescript
// ═══ RESOLUTION ═══
export const WAVE_TEX_SIZE         = 256;
export const FOAM_TEX_SIZE         = 512;
export const COUPLING_TEX_SIZE     = 256;
export const MAX_PARTICLES         = 32768;
export const MAX_PARTICLES_WEBGL   = 8192;
export const MAX_WAVE_COMPONENTS   = 48;

// ═══ PHASES ═══
export const PHASE_DEAD = 0, PHASE_RIDING = 1, PHASE_SHEET = 2;
export const PHASE_LIGAMENT = 3, PHASE_DROPLET = 4, PHASE_SPRAY = 5;

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
export const GRAVITY = 9.81;
export const RHO_WATER = 1000;
export const RHO_AIR = 1.225;
export const SIGMA_WATER = 0.073;
export const CD_SPHERE = 0.44;

// ═══ OPTICS (SHARED) ═══
export const WATER_IOR = 1.333;
export const WATER_F0 = 0.02;
export const ABSORPTION = [0.45, 0.09, 0.06] as const;
export const SCATTER_COLOR = [0.02, 0.08, 0.12] as const;

// ═══ GOVERNOR ═══
export const GOVERNOR_TARGET_MS    = 16.6;
export const GOVERNOR_DEGRADE_RATIO = 1.3;
export const GOVERNOR_RESTORE_RATIO = 0.8;
export const GOVERNOR_RESTORE_FRAMES = 120;
```

## XV.4 Leva Control Panel

```
Presets       │ scene: [cinematic-breaker, mid-storm, far-horizon]
Ocean         │ windSpeed [1,25], windDirection [-π,π], choppiness [0.1,3],
              │ waveCount [8,48], tileSize [50,500]
Breakers      │ enableBreakers, crestThreshold [0.1,1.5], maxParticles [8K–64K]
Ride Window   │ rideDuration, kAttach, comoveGain, liftGain, dampCoeff,
              │ detachDist, kappaLiftThresh, kappaDetachThresh, crestBoost
Phase Trans   │ enablePhaseTransitions, weCritSheet, weCritLigament,
              │ ligamentDuration, dropletJitter
Foam          │ enableFoam, foamInjectGain, foamDecayYoung, foamDecayOld
Coupling      │ enableCoupling (default OFF), feedbackGain, impactGain
Debug         │ debugView [none/F1..F8], showPerfHUD, timeScale [0.1,2]
Seed          │ seed [0,9999], regenerate button
```

---

# XVI. Appendices

## A. Glossary

| Term | Definition |
|------|------------|
| **Genesis** | Particle spawn ON surface + inherited velocity (Gates 2.5, 2.6) |
| **Ride Window** | RIDING phase: attach + co-move + lift forces (Gate 2.7) |
| **Crest Mask** | P02 output; .x = intensity. Particles sample to respawn (C5) |
| **Ping-Pong** | Read A→write B, next frame B→A (C6) |
| **Zero-Copy** | Same GPU buffer for compute + render (C7) |
| **Shared Optics** | One file for ALL water optical constants (Gem 5) |
| **Gated** | Feature disabled until gate passes. P05 until 3.1. |
| **One Water** | No visible seam. Orbit Test. |
| **rideAlpha** | 1 − age/rideDuration. Ride force decay factor. |
| **We** | Weber: ρ·v²·L/σ. Breakup criterion. |
| **κ** | Curvature: −Σ k²·A·sin(θ). Lift/detach driver. |
| **FEEDBACK_ELIGIBLE** | Sentinel on re-entry; triggers coupling. |
| **Gem** | GPT 5.2 term for critical preserved insight. |

## B. Cross-Reference Matrix

| Phenomenon | Pass | Constraint | Gate | Gem |
|------------|------|------------|------|-----|
| Crest detection | P02 | C5 | W1 | 2 (EMA) |
| Foam advection | P03 | C6 | W2 | — |
| Particle spawn | P04 | C5, C10 | 2.5, 2.6 | — |
| Ride window | P04 | C10 | **2.7** | **1** |
| Phase transitions | P04 | — | 2.8 | — |
| Seam elimination | R01+R02 | Shared optics | 3.0 | **5** |
| Coupling | P05 | C10 (gated) | 3.1 | **3** |
| Off-grid sampling | P04 | — | — | **4** |
| Scope control | — | — | — | **6** |

## C. Decision Log

| Decision | Chosen | Rejected | Why |
|----------|--------|----------|-----|
| Wave model (Day 1) | Gerstner | FFT | Single dispatch; FFT = Phase 2 |
| Crest spawn | Mask texture | Atomic append | C5: TSL constrains atomics |
| Foam | Ping-pong A↔B | Single buffer | C6: nondeterminism |
| Particle render | Instanced quads | Point sprites | C9: gl_PointSize unreliable |
| Integration | React UI + three.js | R3F-only (Day 1) | C8: maximum control |
| Coupling | Gated, off default | Always on | C10: runaway risk |
| WebGL2 fallback | Separate WebGLRenderer | forceWebGL | C2: slower, confusing |
| C10 definition | Genesis before feedback | Shared optics (V7) | Genesis ordering prevents dark tuning |
| SSF for Gate 3.0 | Post-Gate 4.0 | Required for 3.0 | Billboards pass Orbit at 5 m |
| Weber formula | ρ·v²·L/σ (V6) | vel²×thickness | Dimensionally correct |
| Crest temporal | EMA + ping-pong (V6) | Single-frame | Reduces flicker |

## D. Source Attribution

| Concept | Source |
|---------|--------|
| One Sentence, Three Tests | V1–V9 (100%) |
| C1–C10 | V1–V9; C11/C12 from V6 |
| Gem 1 (Ride Window) | V1, V6, V8 |
| Gem 2 (Crest EMA) | V6 |
| Gem 3 (Triple Safety) | V6 |
| Gem 4 (Bilinear) | V9 |
| Gem 5 (Shared Optics) | V7 |
| Gem 6 (Scope) | V7 |
| Velocity packing fix | GPT 5.2 Contradiction C |
| R3F async gl | GPT 5.2 Contradiction B |
| Architecture spine | V8 base + V6 physics + V9 gotchas + V2 budget + V7 scope |

## E. Agent Orchestration Protocol

**Agent** writes code. **Braden** evaluates visually. **This document** is the spec.

### Per-Gate Protocol

1. Agent reads spec + relevant section
2. Agent implements deliverables
3. Agent produces validation scene
4. Braden evaluates visually
5. Fail → describe problem → agent adjusts → goto 3
6. Pass → mark complete → next gate

### Gate Handoff Packet

```
Gate:           [ID]
Status:         IN PROGRESS
Prerequisites:  [completed gates]
Deliverables:   [numbered list]
Validation:     [scene name]
Pass Condition: [one sentence from §X]
Key Files:      [list]
```

---

> *This document is the single source of truth for the ProFlow HyperReal Ocean system. All implementation decisions defer to this spec. All visual decisions defer to Braden. WebGPU is the engine. The crest becomes a sheet. The sheet remembers it was water. **One water.***