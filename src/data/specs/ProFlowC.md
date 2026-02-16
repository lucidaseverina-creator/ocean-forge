# ProFlow HyperReal Ocean — The Definitive Specification

> **Codename:** ProFlow Continuum  
> **Revision:** MASTERCLASS v5.0  
> **Date:** 2026-02-15  
> **Authority:** This document supersedes ALL prior specifications. Where any prior document conflicts, this one wins.  
> **Consolidated Spine:** V8 orchestration + V6 physics/stability + V9 implementation gotchas + V2 perf budget + V7 scope discipline + GPT 5.2 meta-analysis corrections.

---

## How to Read This Document

This specification is organized as a **dependency chain** — each section builds on the previous. The ordering is:

1. **Why** we're building this (Vision, Tests)
2. **What** we cannot violate (Constraints)
3. **What** the data looks like (Contracts)
4. **How** the system is structured (Architecture)
5. **How** each subsystem works (Passes, Particles, Rendering)
6. **How** we keep it fast (Governor)
7. **How** we build it (Gates, Sprints)
8. **How** we verify it works (Debug, Red-Team)
9. **What** we don't build (Exclusions, Evolution)
10. **Reference** material (Physics, Constants, Glossary)

Every section references constraints by ID (C1–C12), gems by number (Gem 1–6), and gates by code (W0–4.0).

---

## Table of Contents

- [Part I — Vision & Acceptance Criteria](#part-i--vision--acceptance-criteria)
- [Part II — Hard Constraints (C1–C12)](#part-ii--hard-constraints-c1c12)
- [Part III — Data Contract (The Typed ABI)](#part-iii--data-contract-the-typed-abi)
- [Part IV — System Architecture](#part-iv--system-architecture)
- [Part V — Compute Pipeline (P01–P05)](#part-v--compute-pipeline-p01p05)
- [Part VI — Particle System & Phase FSM](#part-vi--particle-system--phase-fsm)
- [Part VII — Rendering Pipeline — One Water](#part-vii--rendering-pipeline--one-water)
- [Part VIII — Performance Governance](#part-viii--performance-governance)
- [Part IX — Development Gates & Build Order](#part-ix--development-gates--build-order)
- [Part X — Validation, Debug & Red-Team](#part-x--validation-debug--red-team)
- [Part XI — Scope Guardrails & Evolution](#part-xi--scope-guardrails--evolution)
- [Part XII — Reference Appendices](#part-xii--reference-appendices)

---

# Part I — Vision & Acceptance Criteria

## I.1 The Problem

Every real-time water system in existence — Unreal WaveWorks, Sea of Thieves, NVIDIA Flow, Crest, even offline Houdini FLIP — makes the same fatal compromise: **the moment water breaks, it stops being water.** It becomes particles pasted onto a surface. Two separate rendering systems with a visible seam. The spray doesn't remember it was once part of a wave crest.

This is not a rendering problem. It is an **identity** problem. The optical properties diverge at the fracture boundary — different Fresnel, different absorption, different tint. Two waters. The seam is not geometric. It is photometric.

## I.2 The Thesis

This compromise is no longer necessary in 2026. WebGPU compute shaders provide GPU-side particle simulation without CPU readback. Zero-copy `StorageBufferAttribute` eliminates the compute→render copy. Screen-space fluid rendering can smooth particle boundaries. And shared optical models — one file, one import, one water — kill the photometric seam.

We build **continuous water**: from the spectral ocean at the horizon to the individual droplet falling from a crest, with no seam, no identity change, no "effect" boundary.

## I.3 The One Sentence (100% Consensus — V1–V9)

> **A wave crest rises, thins into a translucent sheet, stretches into ligaments, tears into droplets, those droplets fall back, create ring waves, and entrain foam — and at no point does the visual identity of "water" change.**

This sentence is the non-negotiable design north star. Every subsystem, every constraint, every pass, every line of shader code exists to serve it.

## I.4 The Seam Truth

Many systems fail not because particles are "bad," but because optical identity changes at the fracture boundary. NVIDIA Flow, Sea of Thieves — ocean and spray use different Fresnel/absorption/tint. **Shared optics is the fix.** If ocean mesh and spray particles import identical Fresnel, absorption, and scatter constants, the seam disappears regardless of rendering technique.

## I.5 The Three Acceptance Tests

The system ships when — and only when — it passes all three. Everything else is negotiable. These are not.

### The Orbit Test
| Field | Value |
|---|---|
| **Procedure** | Orbit camera 360° around a breaking wave at 5 m distance |
| **Pass** | At no angle can you identify where "the ocean" ends and "the effect" begins. One water. |
| **Fail** | Two separate rendering systems with a visible boundary, color shift, or reflection break |
| **Lighting** | Must pass under noon sun, golden hour, AND overcast |
| **What It Proves** | Seam elimination via shared optics + depth compositing |

### The Slow-Mo Test
| Field | Value |
|---|---|
| **Procedure** | Play breaking sequence at 0.25× speed |
| **Pass** | Visible continuous progression: sheet → elongating ligaments → pinching droplets → ballistic arcs → surface re-entry → ring waves. NOT: particles appearing, animating, disappearing. |
| **Fail** | Particle pop-in/pop-out. No intermediate states. Confetti. |
| **What It Proves** | Physics progression via ride window + phase FSM |

### The Horizon Test
| Field | Value |
|---|---|
| **Procedure** | Camera at 500 m altitude |
| **Pass** | Seamless tiling, natural foam streaks, no computational artifacts (grid boundaries, spawn zones, particle regions) |
| **Fail** | Visible repetition, grid edges, particle pop-in at distance |
| **What It Proves** | Scale stability + LOD + foam advection correctness |

---

# Part II — Hard Constraints (C1–C12)

These rules cannot be bent. They emerge from hard-won lessons across 20+ proposals, 7 WebGPU drafts, and GPT 5.2's exhaustive cross-analysis. Every one exists because violating it destroyed prior attempts.

## Platform

### C1: WebGPU-First *(100% Consensus)*
WebGPU is the primary, preferred, fully-featured path. Not "WebGPU optional." Not "WebGL2 with WebGPU acceleration." **WebGPU is the engine.** WebGL2 is a degraded fallback — clearly labeled, separate codepath, reduced feature set. The compute pipeline (P01–P05) cannot be expressed in WebGL2. Treating WebGL2 as equal leads to lowest-common-denominator design.

### C2: No Cross-API Mixing at Runtime *(100% Consensus)*
One backend active per session. You boot into WebGPU or WebGL2. Never both in the same frame. Never both in the same session. Cross-API resource sharing devolves into copies, readbacks, and instability.

**CRITICAL:** `forceWebGL: true` on `WebGPURenderer` is **FORBIDDEN**. It creates a WebGL context through WebGPU's abstraction layer — slower than native `WebGLRenderer` and confusing for debugging. Use a completely **separate** `WebGLRenderer`.

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
// FORBIDDEN — never do this
this.renderer = new WebGPURenderer({ canvas, forceWebGL: true });
```

## Performance

### C3: No GPU Readbacks in Hot Path *(100% Consensus)*
Zero `readBuffer()`, `readTexture()`, `gl.readPixels()`, or synchronous fence operations in the render loop. Debug/telemetry readbacks: throttled ≤2 Hz, opt-in only, async with two-frame delay (V9 addition). **This is the #1 performance killer in every failed water engine.**

### C4: No Per-Frame Allocations *(100% Consensus)*
All textures, buffers, and render targets created at initialization. No `new Float32Array()`, no `createTexture()`, no `createBuffer()` in the animate loop. Resources are pooled, pre-allocated, and reused via ping-pong swaps. The garbage collector must never touch the hot path. **Exception:** Resize events may trigger controlled reallocation (V2, V4).

## Simulation

### C5: Atomic-Free Crest Spawning *(100% Consensus)*
TSL and many WebGPU shader toolchains constrain atomics and append buffers. Crest detection writes a **mask texture**; dead particles respawn by sampling it. Each particle independently checks the mask — no coordination, no atomics, no append buffer. Works on every GPU. Mandatory.

**Exception:** MLS-MPM P2G (Phase 2) uses fixed-point atomics for grid scatter — explicitly permitted. C5 applies to spawn logic only.

### C6: Deterministic Ping-Pong for All Advected Fields *(100% Consensus)*
Foam, coupling feedback, crest EMA, and any advected quantity use strict double-buffering:
- Frame N: read A → write B
- Frame N+1: read B → write A

Two separate compute nodes created at init, alternated each frame via XOR toggle. No "read + write same buffer" hacks. Prevents nondeterministic artifacts; makes calibration reproducible.

### C10: Genesis Before Feedback *(8/9 Consensus)*
Particles must spawn ON the wave surface with wave-inherited velocity (Gates 2.5/2.6) before any ride window tuning (2.7), before any phase transition tuning (2.8), before any coupling feedback (3.1). This ordering is non-negotiable. It prevents "tuning in the dark" — adjusting gains on a system whose input is wrong.

> **V7 Divergence Resolved:** V7 defines C10 as "Shared optics." Shared optics is correct but belongs in rendering. Adopt Genesis before feedback as C10. Shared optics is an implicit Orbit Test requirement treated in Part VII.

## Rendering & Integration

### C7: Zero-Copy Particle Rendering *(100% Consensus)*
Particle data lives in `StorageBufferAttribute`. Compute shaders write it; vertex shaders read it directly. No CPU involvement. No copies. The same GPU buffer serves both simulation and rendering. This is the core WebGPU performance advantage.

### C8: React / three.js Integration Resolved *(100% Consensus)*
`WebGPURenderer.init()` is async. This was the #1 integration trap across all 7 drafts. Two valid architectures exist — **choose one, commit:**

| Approach | When to Use | Key Requirement |
|---|---|---|
| **A: R3F Canvas + async gl factory** | Want R3F ecosystem, declarative scene | `gl={async (props) => { const r = new WebGPURenderer(props); await r.init(); return r; }}` |
| **B: React UI + vanilla three.js** | Want maximum control, **recommended Day 1** | `ref` to OceanEngine + telemetry callback; your own frame loop |

**Recommendation:** Start with Approach B. Migrate to A after Gate 3.0 if R3F benefits are needed.

### C9: Instanced Billboard Quads for Spray *(100% Consensus)*
WebGPU point sprite size limits make `gl_PointSize` unreliable. All spray/sheet/droplet particles render as instanced camera-facing quads with per-instance size, elongation, and opacity. Hard requirement.

## Best Practices *(V6)*

### C11: No Implicit Format Conversions
All texture formats explicitly declared and matched between creation, bind group layout, and shader declarations. Mismatched formats cause silent corruption on some GPUs.

### C12: Deterministic Frame Ordering
Compute passes execute in declared registry order with implicit barriers between `encoder.end()` / `encoder.beginComputePass()` boundaries. No assumptions about intra-pass parallelism. Sequential passes are the synchronization primitive.

## Constraint Quick Reference

| Group | ID | Name | One-Line |
|---|---|---|---|
| Platform | C1 | WebGPU-First | WebGPU is the engine; WebGL2 is degraded fallback |
| Platform | C2 | No API Mixing | One backend per session. No `forceWebGL`. |
| Performance | C3 | No Readbacks | Zero readbacks in hot path. Debug ≤2 Hz. |
| Performance | C4 | No Per-Frame Alloc | All resources at init. GC never touches hot path. |
| Simulation | C5 | Atomic-Free Crest | Mask texture. No atomics for spawn. |
| Simulation | C6 | Ping-Pong | Strict A↔B for all temporal fields. |
| Simulation | C10 | Genesis First | Spawn correct before tuning anything. |
| Rendering | C7 | Zero-Copy | StorageBufferAttribute compute→vertex. |
| Rendering | C8 | Integration Resolved | Committed approach. No ambiguity. |
| Rendering | C9 | Billboard Quads | No gl_PointSize. Instanced quads. |
| Quality | C11 | Format Matching | Explicit formats everywhere. |
| Quality | C12 | Frame Ordering | Sequential passes. No parallel assumptions. |

---

# Part III — Data Contract (The Typed ABI)

This is the single source of truth for all inter-pass data. **The GPT 5.2 velocity packing fix is the most critical correction in the entire specification.** Every consumer must use the corrected channels.

## III.1 Texture Contract

> **⚠ MANDATORY FIX (v3.0):** Store full surface-plane velocity `(vel.x, vel.z)` in velocityTex. Prior versions dropped `vel.z` — this breaks foam advection, particle comovement, and diagonal crest transport.

| Texture | Format | Size | .x | .y | .z | .w | Ping-Pong |
|---|---|---|---|---|---|---|---|
| **heightTex** | RGBA32F | 256² | disp.x | disp.y (η) | disp.z | **vel.y** | No |
| **normalTex** | RGBA32F | 256² | N.x | N.y | N.z | **steepness** | No |
| **velocityTex** | RGBA32F | 256² | **vel.x** | **vel.z** | curvature (κ) | reserved | No |
| **crestMaskTex** | RGBA32F | 256² | intensity | breakType | crestAngle | steepExcess | Yes (EMA) |
| **foamTexA/B** | RGBA32F | 512² | density | age | — | — | Yes |
| **couplingTexA/B** | RGBA32F | 256² | Δη | Δη̇ | Δfoam | energy | Yes (gated) |

### Downstream Impact of Velocity Fix

| Consumer | What It Reads | Where From |
|---|---|---|
| P02 CrestMask — vertical velocity | `heightTex.w` | *(was velocityTex.y — CHANGED)* |
| P02 CrestMask — steepness | `normalTex.w` | *(was velocityTex.w — CHANGED)* |
| P02 CrestMask — curvature | `velocityTex.z` | *(unchanged)* |
| P03 Foam — horizontal advection | `velocityTex.xy` = (vel.x, vel.z) | **Both** horizontal components |
| P04 Particles — co-movement | `velocityTex.xy` = (vel.x, vel.z) | **Both** horizontal components |
| P04 Particles — vertical velocity | `heightTex.w` | For ride window attachment |

## III.2 Particle Buffer Contract (32K × vec4)

| Buffer | .x | .y | .z | .w |
|---|---|---|---|---|
| **positionBuf** | world x | world y | world z | phase (0–5) |
| **dataBuf** | velocity x | velocity y | velocity z | age (seconds) |
| **renderBuf** | visual size | alpha | thickness | elongation |

## III.3 Spectrum Buffer

```
waveBuf: vec4 × (MAX_WAVE_COMPONENTS × 2)
  [i*2+0]: (dirX, dirZ, amplitude, frequency)
  [i*2+1]: (phase, Q_steepness, reserved, reserved)
```

## III.4 Memory Budget

| Resource | Memory |
|---|---|
| heightTex + normalTex + velocityTex (256² × RGBA32F × 3) | 3 MB |
| crestMaskTex (×2 for EMA ping-pong) | 2 MB |
| foamTexA + foamTexB (512² × 2) | 8 MB |
| couplingTexA + couplingTexB (256² × 2) | 2 MB |
| positionBuf + dataBuf + renderBuf (vec4 × 32K × 3) | 1.5 MB |
| waveBuf (vec4 × 96) | <1 KB |
| **Total** | **~16.5 MB** |

Lean. Fits on any discrete GPU. All allocated at init. No mid-frame allocations.

---

# Part IV — System Architecture

## IV.1 Topology

```
┌────────────────────────────────────────────────────────────────────────┐
│                       React Application Layer                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────────────┐  │
│  │ Leva     │  │ PerfHUD  │  │ Debug    │  │ Validation Scene      │  │
│  │ Controls │  │ Overlay  │  │ Views    │  │ Selector              │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬────────────────┘  │
│       └──────────────┴────────────┴────────────────┘                   │
│                      │ ref + telemetry callback                        │
├──────────────────────▼─────────────────────────────────────────────────┤
│                   OceanEngine (owns everything below)                   │
│                                                                        │
│  ┌── COMPUTE (5 sequential dispatches — ORDER IS LAW) ──────────────┐  │
│  │  P01: WaveField → P02: CrestMask → P03: Foam (ping-pong)         │  │
│  │       → P04: ParticleSim → P05: Coupling [GATED — OFF]           │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌── RENDER ─────────────────────────────────────────────────────────┐  │
│  │  R01: Ocean Mesh (opaque, depth write ON)                         │  │
│  │  R02: Spray Billboards (transparent, additive, depth write OFF)   │  │
│  │  R03: Sky Dome (procedural)                                       │  │
│  │  R04: Debug Overlay (opt-in)                                      │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌── SERVICES ───────────────────────────────────────────────────────┐  │
│  │  PassRegistry  │  ResourcePool  │  Governor  │  Telemetry          │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

## IV.2 Pass Registry

| ID | Name | Type | Res | Est. Cost | Governor Fallback |
|---|---|---|---|---|---|
| P01 | WaveFieldCompute | compute | 256² | ~0.8 ms | 128² |
| P02 | CrestMaskDetect | compute | 256² | ~0.3 ms | 128² |
| P03 | FoamCompute | compute | 512² | ~0.5 ms | 256² |
| P04 | ParticleSim | compute | 32K | ~2.0 ms | 16K → 8K |
| P05 | CouplingFeedback | compute | 256² | ~0.3 ms | DISABLE |
| **Compute Total** | | | | **~3.9 ms** | |
| **Render Total** | | | | **~2.0 ms** | |
| **Grand Total** | | | | **~5.9 ms** | **10.7 ms headroom at 60fps** |

**Pass execution order is invariant:** P01 → P02 → P03 → P04 → P05. Each reads outputs from the previous.
**Workgroup convention:** 2D textures `[16, 16, 1]`, particles `[256, 1, 1]`.

## IV.3 Init Order (Load-Bearing — Misordering Causes Silent Failures)

```
1.  navigator.gpu check → choose backend
2.  Create renderer (WebGPURenderer OR separate WebGLRenderer — NEVER forceWebGL)
3.  await renderer.init()           ← CRITICAL: before ANY resource creation
4.  OrbitControls creation
5.  ResourcePool.allocateAll()      ← ALL textures, ALL buffers, this moment (C4)
6.  WaveCompute(pool, waveBuf)
7.  CrestDetect(pool)              ← creates both ping-pong nodes
8.  FoamCompute(pool)              ← creates both ping-pong nodes
9.  ParticleSim(pool)
10. CouplingBridge(pool)
11. PassRegistry.register([...])
12. Governor(passRegistry, ladder)
13. OceanMesh(pool), SprayRenderer(pool), Sky
14. Resize handler
```

## IV.4 Animate Loop

```typescript
private animate(time: number) {
    const dt = Math.min((time - this.lastTime) / 1000, 0.05);
    this.lastTime = time;
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

## IV.5 Service Layer

| Service | Role |
|---|---|
| **PassRegistry** | Central list of all compute/render passes. Enable/disable toggles. Cost tracking. Governor toggles passes for degradation. No hidden passes. |
| **ResourcePool** | Pre-allocates ALL textures and buffers at init. No lazy allocation. No per-frame creation. Ping-pong management. |
| **Governor** | Monitors p95 frame time. Degrades quality in ordered steps. Restores in **reverse** order. Hysteresis prevents thrashing. |
| **Telemetry** | FPS, frame time, compute time, particle count, governor level. CPU-side `performance.now()` timing. No readbacks (C3). |

---

# Part V — Compute Pipeline (P01–P05)

## V.1 P01: Wave Field Computation

### Approach: Multi-Component Gerstner Summation (Single Dispatch)

**Why Gerstner over FFT for Day 1:** FFT requires multiple passes (butterfly, IFFT, permutation), twiddle textures, synchronization. Gerstner is one dispatch, identical visual quality for 16–48 components, trivially parallel per texel, with exact analytical normals and curvature. **FFT is the Phase 2 evolution** — same output contract.

### Governing Equations (V6 Physics-Corrected)

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

Steepness: S = Σᵢ kᵢ Aᵢ Qᵢ |cos(θᵢ)|    (≥1 indicates breaking)
Curvature: κ = −Σᵢ kᵢ² Aᵢ sin(θᵢ)
Dispersion: ω² = gk   (deep water)
Q: min(choppiness / (k × A × N), 1.0)
```

### Output (CORRECTED v3.0 Packing)

```
textureStore(heightTex,   ix, iy, vec4(disp.x, disp.y, disp.z, vel.y));
textureStore(normalTex,   ix, iy, vec4(norm.x, norm.y, norm.z, steep));
textureStore(velocityTex, ix, iy, vec4(vel.x,  vel.z,  curv,   0.0));
```

### Spectrum Generation (CPU, at init or wind change)

JONSWAP spectral density with directional cos²ˢ spreading, stratified frequency sampling. Pierson-Moskowitz peak: `ωp = g / (1.026 × windSpeed)`. Seeded RNG for determinism (same seed = same ocean). 16–48 components typical.

---

## V.2 P02: Crest Mask Detection (Gem 2)

### Logic

```
steepExcess = smoothstep(crestThreshold, crestThreshold + 0.3, steepness)
isRising    = smoothstep(0, 0.5, vertVel)              ← from heightTex.w
curveFactor = smoothstep(0.5, 2.0, curvature)           ← from velocityTex.z
intensity   = steepExcess × isRising × (curveFactor × 0.5 + 0.5)

plungeScore = curvature × max(0, vertVel)               // Iribarren proxy
breakType   = smoothstep(0, 5.0, plungeScore)           // 0=spilling, 1=plunging
crestAngle  = atan2(gradZ, gradX) / (2π) + 0.5          // height finite differences
```

### V6 Enhancements (Adopted — Gem 2)

- **EMA temporal smoothing:** Reduces single-frame flicker. `crestNew = mix(crestPrev, crestRaw, 0.3)`
- **3×3 neighborhood spatial smoothing:** Stabilizes spawn distribution
- **Ping-pong crest textures:** V6 caught the illegal read/write-to-same-texture bug — crest needs A↔B like foam

---

## V.3 P03: Foam Compute (Deterministic Ping-Pong — C6)

Two `StorageTextures` (foamA, foamB). Two compute nodes at init. XOR toggle each frame.

### Per-Texel Logic

```
1. ADVECTION: Semi-Lagrangian trace-back by (vel.x, vel.z)
   srcUV = clamp(uv − velocityTex.xy × dt × advectScale, 0, 1)

2. DECAY: Age-dependent tau
   tau = mix(TAU_YOUNG, TAU_OLD, smoothstep(0, 5, foamAge))
   decayed = advected.x × (1 − dt/tau)

3. INJECTION: crestMask.x × foamInjectGain

4. STRETCH DISSIPATION: stretchDecay = clamp(1 − |velocity| × 0.1, 0.8, 1)

5. FINAL: newDensity = clamp(max(decayed × stretchDecay, injection), 0, 1)
```

**Critical:** Semi-Lagrangian MUST use **both** horizontal velocity components `velocityTex.xy = (vel.x, vel.z)`. Using only one causes foam to drift wrong on diagonal seas.

---

## V.4 P04: Particle Simulation

See **Part VI** for the full particle system specification.

---

## V.5 P05: Coupling Feedback (GATED — Gem 3)

**Default: DISABLED.** Enabled only after Gate 3.0 passes. See **§IX.3** for the 5-step stability protocol.

### Feedback Mechanism

On particle re-entry (FEEDBACK_ELIGIBLE flag):
1. **Ring wave seed:** Radial ∂η/∂t impulse at impact point
2. **Foam deposition:** Impact energy → foam injection into couplingTex.z
3. **Energy tracking:** Cumulative energy in couplingTex.w for runaway detection

### Triple Safety (Gem 3)

| Safety | Mechanism |
|---|---|
| **1. Per-texel clamp** | No single texel > MAX_IMPULSE |
| **2. Temporal smoothing** | New feedback blended with previous (α = 0.3) |
| **3. Global energy cap** | Hierarchical mip chain over .w → if total > cap, scale all. GPU-side only — **no readback** |

---

# Part VI — Particle System & Phase FSM

## VI.1 Phase State Machine (6 Phases)

```
DEAD (0) ──[crest mask sampling]──→ RIDING (1)
  ▲                                    │
  │           [ride window forces:     │
  │            attach, comove, lift]    │
  │                                    │
  │        age > rideDuration    OR    │
  │        |gap| > detachDist    OR    │
  │        curvature < κ_detach        │
  │                                    ▼
  │                               SHEET (2)
  │                                    │  We < weCritSheet OR age > maxSheetAge
  │                                    ▼
  │                              LIGAMENT (3)
  │                                    │  age > ligamentDuration
  │                                    ▼
  │                               DROPLET (4)
  │                              ╱          ╲
  │              y > surface+thresh    re-enters surface
  │                    ▼                     │
  │                SPRAY (5)                 │
  │                    │ re-enters surface   │
  └────── FEEDBACK_ELIGIBLE → DEAD ◄────────┘
```

### Full State Table

| Phase | Value | Entry | Exit | Physics |
|---|---|---|---|---|
| DEAD | 0 | Spawn or recycle | Crest mask > threshold | — |
| RIDING | 1 | Spawn from crest | Timer OR gap OR curvature | Attach, co-move, lift, damp |
| SHEET | 2 | RIDING exit | We < We_crit OR age | Gravity, thickness decay |
| LIGAMENT | 3 | SHEET breakup | age > ligamentDuration | Elongation, pinch |
| DROPLET | 4 | LIGAMENT pinch | y>surface → SPRAY; y<surface → DEAD | Ballistic, drag |
| SPRAY | 5 | DROPLET above surface | y<surface → DEAD; age>8 → DEAD | Ballistic, wind drag |

**Phase histogram during active break:** ~40% sheet, ~25% ligament, ~35% droplet/spray.

## VI.2 Spawning (C5: Atomic-Free)

Dead particles sample crest mask at deterministic pseudo-random UV `(idx + time hash)`. Probabilistic accept: `roll < intensity × spawnRate`.

**Genesis (C10):**
- **Position:** ON wave surface at sampled location
- **Velocity:** INHERITED from wave at that location (both horizontal + vertical)

## VI.3 Manual Bilinear Sampling (Gem 4 — NOT OPTIONAL)

StorageTexture has no sampler. `textureLoad()` returns point samples. When particles sample wavefields off-texel, you **MUST** implement manual bilinear interpolation:

```
bilinearLoad(tex, uv, texSize):
  fx = uv.x × texSize;  fy = uv.y × texSize
  ix0 = floor(fx);  iy0 = floor(fy)
  fx_frac = fract(fx);  fy_frac = fract(fy)

  s00 = textureLoad(tex, ivec2(ix0,     iy0))
  s10 = textureLoad(tex, ivec2(ix0 + 1, iy0))
  s01 = textureLoad(tex, ivec2(ix0,     iy0 + 1))
  s11 = textureLoad(tex, ivec2(ix0 + 1, iy0 + 1))

  return mix(mix(s00, s10, fx_frac), mix(s01, s11, fx_frac), fy_frac)
```

This lives in `compute/bilinearHelper.ts`. Without it, particle sampling has visible quantization artifacts.

## VI.4 Ride Window Forces (Gem 1 — The Critical Visual Gate)

**This is where cinematic believability is won or lost.** The difference between "water" and "confetti." Sprint 1 is make-or-break.

### Three-Force Model + Damping

| Force | Equation | Purpose |
|---|---|---|
| **F_attach** | `gap × kAttach × rideAlpha` along surface normal | Soft spring toward wave surface |
| **F_comove** | `(targetVel − vel) × comoveGain × rideAlpha` | Bias velocity toward wave motion |
| **F_lift** | `max(0, κ − κ_thresh) × liftGain` upward | Curvature-driven throw (plunging) |
| **F_damp** | `−(vel − targetVel) × dampCoeff × rideAlpha` | Oscillation suppression |

**rideAlpha** = `1 − age / rideDuration` (decays linearly over ride window)

### Detach Conditions (Any Triggers Exit)

- `rideTimer > rideDuration` — time expired
- `|gap| > detachDist` — particle drifted from surface
- `curvature < κ_detach` — crest passed; let go

### No Velocity Discontinuity Rule

At detach: particle **KEEPS** current velocity + smooth lift boost. **Never** instant swap to new velocity. This prevents the jarring "pop" at transition.

### Parameters (Leva-Tunable)

| Parameter | Default | Range | Effect |
|---|---|---|---|
| rideDuration | 0.4 s | 0.1–2.0 | How long sheet tracks crest |
| kAttach | 200 | 50–500 | Spring stiffness |
| comoveGain | 15 | 5–50 | Velocity bias |
| liftGain | 5.0 | 1–20 | Curvature throw |
| dampCoeff | 10 | 2–50 | Damping |
| detachDist | 0.3 m | 0.05–1.0 | Max gap before forced detach |
| kappaLiftThresh | 1.5 | 0.5–5.0 | Curvature for throw onset |
| kappaDetachThresh | 0.2 | 0–1.0 | Curvature drop = detach |
| crestBoost | 0.3 | 0.1–1.0 | Spawn velocity multiplier |

## VI.5 Phase Transition Physics

### SHEET (Phase 2)
- Gravity: `vel.y -= 9.81 × dt`
- Thickness decay: `thickness -= dt × 0.5; clamp(0.02, 1.0)`
- Weber breakup (V6 corrected): `We = ρ·v²·L/σ`. If `We < weCritSheet` OR `age > maxSheetAge` → LIGAMENT
- Sheet should break within ~0.8 s of detach (not goo)

### LIGAMENT (Phase 3)
- Elongation increases: `elongation += dt × 0.5; clamp(1.0, 4.0)`
- After `ligamentDuration` → DROPLET
- Jitter velocity at pinch-off for varied trajectories

### DROPLET (Phase 4)
- Ballistic + mild air drag: `vel *= 0.998`
- If `height > surface + sprayThreshold` → SPRAY
- If re-enters surface → DEAD (mark FEEDBACK_ELIGIBLE)

### SPRAY (Phase 5)
- Sphere drag: `F_drag = −0.5 × ρ_air × C_d × |v_rel| × v_rel / mass`
- Wind influence on relative velocity
- Re-entry → DEAD (mark FEEDBACK_ELIGIBLE)

---

# Part VII — Rendering Pipeline — One Water

## VII.1 Shared Optics (Gem 5 — The Seam Killer)

**Both the ocean mesh AND the spray billboards import `sharedOptics.ts`.** Identical Fresnel, absorption, scatter, tint. One file. One import. **One water.**

```typescript
// sharedOptics.ts — THE optics file. Both materials import this.

export const WATER_IOR    = 1.333;
export const WATER_F0     = 0.02;  // ((1-IOR)/(1+IOR))²

export const DEEP_COLOR   = [0.0, 0.05, 0.15];
export const SHALLOW_COLOR = [0.0, 0.15, 0.25];
export const FOAM_COLOR   = [0.85, 0.88, 0.92];
export const SSS_TINT     = [0.1, 0.4, 0.35];

export const ABSORPTION   = [0.45, 0.09, 0.06];  // per meter (Beer-Lambert)
export const SCATTER_COLOR = [0.02, 0.08, 0.12];

// Fresnel (Schlick): F = F0 + (1−F0)(1−N·V)⁵
// Absorption (Beer-Lambert): color × exp(−absorption × pathLength)
```

If ocean and spray don't share these constants, the seam will **always** reappear under some angle. The Orbit Test depends on this.

## VII.2 Render Pass Order

| Pass | Purpose | Depth | Blend |
|---|---|---|---|
| R01 Ocean Mesh | Displaced vertices from heightTex; shared optics material | Write ON | Opaque |
| R02 Spray Billboards | Instanced quads from particle buffers; shared optics | Test ON, Write OFF | Additive |
| R03 Sky Dome | Procedural or environment | — | Behind |
| R04 Debug Overlay | Opt-in fullscreen quad | — | Overlay |

## VII.3 Ocean Mesh (R01)
- **Vertex:** Displace from heightTex
- **Normal:** From normalTex (analytical)
- **Color:** Fresnel + absorption + foam overlay + SSS approximation (all from sharedOptics)
- **Foam:** Read foamTex; procedural variation; foam increases roughness (0.05 → 0.6)

## VII.4 Spray Billboards (R02)
- **Geometry:** `InstancedMesh` with `PlaneGeometry(1, 1)`, MAX_PARTICLES instances
- **Billboard:** Camera-facing via viewMatrix decomposition
- **Per-instance data:** Position from positionBuf, scale/alpha/elongation from renderBuf (C7: zero-copy)
- **Dead particles:** Moved to `(0, −1000, 0)` — off-screen
- **Phase-dependent appearance:** Sheet=translucent, Ligament=elongated, Droplet=bright, Spray=misty
- **Soft circle shape:** `smoothstep(0.5, 0.3, dist)` on UV

## VII.5 Screen-Space Fluid (Phase 2 — Post Gate 4.0)

**Resolution:** Billboards + shared optics pass the Orbit Test at 5 m if spawn density, shared optics, depth test, and ride window are all correct. SSF is Hero Shot Mode — not a blocker.

Architecture slot: depth splat → bilateral smooth → normal reconstruction → composite. Pipeline designed for drop-in.

---

# Part VIII — Performance Governance

## VIII.1 Degrade Ladder (Canonical Order)

Degrade in this order (least visual impact first). **Restore in REVERSE order.** Hysteresis prevents thrashing.

| Step | Action | Est. Save | Visual Impact |
|---|---|---|---|
| 1 | Reduce particles 32K → 16K | 1.0 ms | Low |
| 2 | Reduce particles 16K → 8K | 0.5 ms | Medium |
| 3 | Reduce foam 512² → 256² | 0.3 ms | Low |
| 4 | Reduce crest smoothing radius | — | Low |
| 5 | Disable coupling (if enabled) | 0.3 ms | Medium |
| 6 | Disable screen-space fluid (if enabled) | — | Medium |
| 7 | Disable breakers (P02 + P04 off) | 2.3 ms | **High (last resort)** |

## VIII.2 Logic

```
Degrade:  p95 frametime > 16.6 ms × 1.3  →  step down
Restore:  p95 frametime < 16.6 ms × 0.8 for 120 frames (~2 s)  →  step up (reverse order)
Smoothing: Exponential moving average, not raw values
```

**V9 bug callout:** Governor MUST restore in reverse order. Every `DegradeStep` has both `apply()` and `restore()`.

---

# Part IX — Development Gates & Build Order

## IX.1 Current State

✅ W0: WebGPU Lifecycle  |  ✅ W1: Crest Mask Debug  |  ✅ W2: Foam Ping-Pong  |  ✅ W3: Billboard Render  |  ✅ 2.5: Genesis Position  |  ✅ 2.6: Genesis Velocity

**🔴 Gate 2.7 (Ride Window) is the current active blocker.**

## IX.2 Gate Definitions

| Gate | Name | Definition of Done |
|---|---|---|
| **2.7** | **Ride Window** | Sheet rides crest ≥0.3 s. Soft attach, co-move, smooth lift. Side camera at 0.25×: sheets track then peel away. No confetti. **MAKE-OR-BREAK.** |
| **2.8** | Phase Transitions | Sheet→Lig→Drop visible at 0.25×. ≥2 distinct ligament frames. Phase histogram ~40/25/35%. |
| **3.0** | Seam Elimination | Orbit Test passes. Cannot find seam at noon, golden hour, overcast. |
| **3.1** | Coupling | Ring waves visible. Foam deposit. No runaway in 60 s storm. Stability protocol complete. |
| **4.0** | Perf No-Stall | 60 fps sustained. p99 < 16.6 ms. Governor degrades/restores smoothly. Zero readbacks confirmed. |

## IX.3 Gate Advancement Rules

```
2.5 → 2.6 → 2.7 → 2.8 → 3.0 → 3.1 → 4.0

No gate N+1 work until gate N passes.
Coupling tuning (3.1) FORBIDDEN until 2.7 + 2.8 + 3.0 visually pass.
```

## IX.4 Sprint Plan

| Sprint | Gate | Duration | Focus | Risk Level |
|---|---|---|---|---|
| **1** | **2.7** | **5 days** | Ride window forces + Leva tuning | **CRITICAL** |
| 2 | 2.8 | 4 days | Phase transitions visible in slow-mo | High |
| 3 | 3.0 | 3 days | Shared optics pass; Orbit Test | High |
| 4 | 3.1 | 3 days | Coupling + stability protocol | Medium |
| 5 | 4.0 | 2 days | Governor; perf validation | Medium |
| | | **~17 days** | | |

## IX.5 Ride Window Tuning Protocol (Sprint 1)

1. Start with defaults (rideDuration=0.4, kAttach=200, comoveGain=15, liftGain=5)
2. Run Ride Window validation scene at 0.25× speed
3. Ask Braden: "Does the sheet track the crest? How long? Is detach smooth?"
4. Adjust **one parameter at a time** (isolate variables)
5. Iterate until sheet visibly rides crest ≥0.3 s with smooth detach
6. Record final tuned values as new defaults

## IX.6 Coupling Stability Protocol (Sprint 4)

| Step | Action | Duration | Pass Condition |
|---|---|---|---|
| 1 | Enable foam deposition only | 60 s | No foam runaway |
| 2 | Enable ring waves at gain = 0.1 | 60 s | No oscillation |
| 3 | Increase gain to 0.5 | 60 s | Stable |
| 4 | Gain = 1.0, storm conditions | 60 s | Bounded energy |
| 5 | If any step fails | — | Freeze at previous gain, investigate |

---

# Part X — Validation, Debug & Red-Team

## X.1 Validation Scenes

| Scene | Camera | Settings | Validates |
|---|---|---|---|
| **Cinematic Breaker** | (15, 5, 20) → origin | wind 12, chop 1.5, 32 waves, seed 42 | Gates 2.7, 2.8, 3.0 |
| **Mid Storm** | (40, 20, 50) → origin | wind 20, chop 2.0, 48 waves, seed 137 | Gate 4.0 (perf) |
| **Far Horizon** | (0, 8, 150) → origin | wind 8, chop 1.0, 24 waves, seed 7 | Horizon Test |
| **Genesis Verify** | Freeze at t₀ | — | Particles on surface, velocity correct |
| **Ride Window** | Side view, 0.25× | rideDuration 0.4 | Sheet tracks crest, smooth detach |
| **Seam Test** | Orbit 360° at 5 m | — | No boundary: noon, golden hour, overcast |

## X.2 Debug Views (GPU-Only, Zero Readback)

| Key | View | What It Shows |
|---|---|---|
| F1 | Height Map | Wave displacement (blue→white) |
| F2 | Normal Map | Surface normals → RGB |
| F3 | Crest Mask | Break intensity (red heat) |
| F4 | Steepness | normalTex.w gradient |
| F5 | Foam Density | Foam texture (white overlay) |
| F6 | Particle Phase | RIDING=green, SHEET=cyan, LIGAMENT=yellow, DROPLET=red, SPRAY=white |
| F7 | Ride Timer | Age as green→red gradient (detached=gray) |
| F8 | Pass Timing | Per-pass estimates + governor state |

## X.3 Visual Anti-Cues

| Anti-Cue | Likely Cause | Fix |
|---|---|---|
| Particles float above crest | kAttach too low | Increase kAttach |
| Particles slide backward off crest | comoveGain too low | Increase comoveGain |
| Instant confetti on spawn | Ride window not applied | Code bug — check RIDING path |
| Particles welded forever | rideDuration too high | Reduce; check detach conditions |
| Visible seam at boundary | Separate optics | Verify sharedOptics.ts import |
| Foam pulsing / crawling | Non-ping-pong foam | Verify A↔B toggle (C6) |
| Grid boundaries at horizon | Tile/resolution mismatch | Adjust tileSize; LOD rings |
| Over-cohesion (goo) | weCritSheet too low | Sheet should break within 0.8 s |
| Under-cohesion (dust) | Scatter immediately | Connected sheet ≥2 frames |
| Velocity discontinuity at detach | Instant velocity swap | Keep vel + smooth lift boost |
| Foam drifts one direction only | vel.z dropped | Apply velocity packing fix |

## X.4 Red-Team Checklist (Pre-Ship — Every Item Must Pass)

| # | Check | Method |
|---|---|---|
| 1 | velocityTex stores (vel.x, vel.z) — NOT (vel.x, vel.y) | Inspect textureStore in WaveCompute |
| 2 | heightTex.w = vel.y; normalTex.w = steepness | Inspect textureStore |
| 3 | Foam advection uses velocityTex.xy as (vel.x, vel.z) | Check Semi-Lagrangian |
| 4 | No readBuffer/mapAsync in animate | `grep -r "readBuffer\|mapAsync" src/` |
| 5 | No createTexture/createBuffer in animate | `grep -r "createTexture\|createBuffer" src/` |
| 6 | No new Float32Array in animate | `grep -r "new Float32Array" src/` |
| 7 | Crest uses mask texture, no atomics | No `atomicAdd` in spawn path |
| 8 | Foam has two textures with XOR toggle | foamA, foamB verified |
| 9 | Crest detection uses EMA + ping-pong (V6) | crestTexA ↔ crestTexB |
| 10 | Coupling gated — P05 disabled by default | passRegistry check |
| 11 | Shared optics — one import for both materials | sharedOptics.ts verified |
| 12 | Billboard quads, not points | InstancedMesh + PlaneGeometry |
| 13 | Zero-copy particle rendering | StorageBufferAttribute |
| 14 | Pass order P01→P02→P03→P04→P05 | No reorder in animate |
| 15 | Governor restores in reverse degrade order | Each step has restore() |
| 16 | Manual bilinear helper for particle sampling | bilinearHelper.ts used |
| 17 | No forceWebGL: true | Separate WebGLRenderer |
| 18 | R3F approach committed (A or B, not both) | One pattern verified |
| 19 | Deterministic seed for spectrum | Same seed = same ocean |
| 20 | ResourcePool.allocateAll() at init | No lazy allocation |

## X.5 PerfHUD

```
┌──────────────────────────────────────┐
│  PERF HUD                           │
│  Frame: 5.2ms  ■■■░░░░░░░  60 FPS  │
│  Compute: 3.8ms (P01:0.8 P02:0.3   │
│           P03:0.5 P04:2.0 P05:off)  │
│  Render: 1.8ms                       │
│  Particles: 24,391 / 32,768         │
│  Governor: FULL ●                    │
│  Backend: WebGPU                     │
└──────────────────────────────────────┘
```

---

# Part XI — Scope Guardrails & Evolution

## XI.1 Explicit Exclusions (Gem 6 — Survival Manual)

These features DO NOT BELONG in the MVP. Including any of them will kill the project. The architecture supports all — they're just not Gate 1–4.

| Feature | Why Excluded | Risk If Included |
|---|---|---|
| Bubble plume simulation | Not visible in Three Tests | Months of work, marginal gain |
| God ray post-processing | Rendering polish, not water | Distraction from core gates |
| Nearshore bathymetry | Requires terrain system | Dependency chain blocker |
| Surface tension CSF | MLS-MPM complexity | Tuning nightmare |
| Rayleigh-Plateau pinch-off | Research physics | Over-engineering |
| Multi-cascade FFT | Phase 2, not Day 1 | Blocks shipping |
| Screen-space fluid for MVP | Post-Gate 4.0 | Billboards pass Orbit at 5 m |
| SSR / volumetric scatter | Polish | Scope creep |

**Philosophy:** Ship the minimum system that passes the Three Tests. Then iterate.

## XI.2 Evolution Path (Post Gate 4.0)

| Phase | Feature | Integration Point |
|---|---|---|
| 2.1 | FFT spectral ocean | Replace P01 Gerstner. Same output contract. |
| 2.2 | SWE heightfield dynamics | Object wakes, reflections. Feeds crestMask. |
| 2.3 | Screen-space fluid rendering | Depth splat → bilateral → normals → composite. |
| 3.0 | MLS-MPM detail simulation | Replace/enhance P04. Same particle buffers. |
| 3.1 | Underwater camera optics | Post-process. Shared optics constants. |
| 3.2 | Caustics | Separate compute pass. Reads heightMap. |
| 4.0 | Multi-domain SWE nesting | Nested heightfields at different scales. |
| 5.0 | Object physics (hulls) | Buoyancy. Reads heightMap. |

Every evolution adds passes to the registry and resources to the pool.

---

# Part XII — Reference Appendices

## A. Physics Quick Reference

| Equation | Formula |
|---|---|
| Deep-water dispersion | ω² = gk; c = √(g/k) |
| Finite depth | ω² = gk·tanh(kd) |
| Capillary-gravity | ω² = gk + (σ/ρ)k³ |
| Gerstner Q | min(choppiness / (k × A × N), 1.0) |
| JONSWAP | S(ω) = (αg²/ω⁵)·exp(−5/4·(ωp/ω)⁴)·γʳ |
| Weber number | We = ρ·v²·L/σ (sheet crit ~12; ligament ~40) |
| Fresnel (Schlick) | F = F₀ + (1−F₀)(1−N·V)⁵; F₀ ≈ 0.02 |
| Beer-Lambert | I = I₀·exp(−α·d) |
| Monahan whitecap | W = 3.84×10⁻⁶·U₁₀^3.41 |
| Iribarren | ξ = tan(β)/√(H/L); <0.5 spill, 0.5–3.3 plunge |

## B. Constants (Single Source of Truth)

```typescript
// constants.ts

// ═══ RESOLUTION ═══
export const WAVE_TEX_SIZE         = 256;
export const FOAM_TEX_SIZE         = 512;
export const COUPLING_TEX_SIZE     = 256;
export const MAX_PARTICLES         = 32768;      // WebGPU
export const MAX_PARTICLES_WEBGL   = 8192;       // WebGL2 fallback
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

// ═══ PHASE TRANSITIONS ═══
export const WE_CRIT_SHEET         = 0.5;
export const WE_CRIT_LIGAMENT      = 40;
export const LIGAMENT_DURATION     = 1.0;
export const DROPLET_JITTER        = 0.5;
export const SPRAY_THRESHOLD       = 0.5;

// ═══ FOAM ═══
export const FOAM_INJECT_GAIN      = 0.8;
export const TAU_FOAM_YOUNG        = 2.0;
export const TAU_FOAM_OLD          = 8.0;

// ═══ COUPLING ═══
export const FEEDBACK_GAIN         = 0.5;
export const IMPACT_GAIN           = 0.01;
export const MAX_IMPULSE           = 0.5;
export const COUPLING_ALPHA        = 0.3;
export const GLOBAL_ENERGY_CAP     = 1000;

// ═══ PHYSICS ═══
export const GRAVITY = 9.81;
export const RHO_WATER = 1000;
export const RHO_AIR = 1.225;
export const CD_SPHERE = 0.44;
export const SIGMA_WATER = 0.073;

// ═══ OPTICS (SHARED — ONE WATER) ═══
export const WATER_IOR = 1.333;
export const WATER_F0 = 0.02;
export const ABSORPTION = [0.45, 0.09, 0.06] as const;
export const SCATTER_COLOR = [0.02, 0.08, 0.12] as const;

// ═══ GOVERNOR ═══
export const GOVERNOR_TARGET_MS = 16.6;
export const GOVERNOR_DEGRADE_RATIO = 1.3;
export const GOVERNOR_RESTORE_RATIO = 0.8;
export const GOVERNOR_RESTORE_FRAMES = 120;
```

## C. Repository Structure

```
hyper-real-ocean/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── index.html
└── src/
    ├── main.tsx                      # React entry point
    ├── App.tsx                       # Canvas + UI overlay bridge (Approach B)
    ├── OceanEngine.ts                # Core orchestrator
    ├── types.ts                      # OceanSettings, OceanTelemetry, PassDescriptor
    ├── constants.ts                  # Single source of truth (Appendix B)
    │
    ├── compute/
    │   ├── WaveCompute.ts            # P01: Gerstner wave field
    │   ├── CrestDetect.ts            # P02: Crest mask (EMA + ping-pong)
    │   ├── FoamCompute.ts            # P03: Foam advection (ping-pong)
    │   ├── ParticleSim.ts            # P04: FSM + ride window + phases
    │   ├── CouplingBridge.ts         # P05: Feedback (gated)
    │   ├── spectrum.ts               # JONSWAP generation (CPU, at init)
    │   └── bilinearHelper.ts         # Manual bilinear (Gem 4)
    │
    ├── render/
    │   ├── OceanMesh.ts              # R01: Displaced mesh
    │   ├── SprayRenderer.ts          # R02: Instanced billboard quads
    │   ├── WaterMaterial.ts          # TSL node material
    │   ├── sharedOptics.ts           # Gem 5: ONE FILE — ONE WATER
    │   ├── Sky.ts                    # R03: Procedural sky dome
    │   └── DebugViews.ts             # R04: Fullscreen debug overlays
    │
    ├── services/
    │   ├── PassRegistry.ts           # Enable/disable/cost tracking
    │   ├── ResourcePool.ts           # Pre-allocate ALL resources (C4)
    │   └── Governor.ts               # Degrade ladder + restore + hysteresis
    │
    ├── ui/
    │   ├── Controls.tsx              # Leva panels
    │   ├── PerfHUD.tsx               # Performance overlay
    │   └── DebugOverlay.tsx          # Debug view selector
    │
    └── scenes/
        └── presets.ts                # Validation scene configs
```

## D. Version Pinning

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

**Vite aliases required:**
```typescript
resolve: {
    alias: {
        'three/webgpu': 'three/build/three.webgpu.js',
        'three/tsl': 'three/build/three.tsl.js',
    }
}
```

## E. The Six Gems — Preserved Insights

These are the load-bearing insights from GPT 5.2's cross-analysis. Each is the difference between shipping and failing.

| # | Name | Insight | Where Applied |
|---|---|---|---|
| **1** | **Ride Window** | The difference between "water" and "confetti" is the RIDING phase force model. Without F_attach + F_comove + F_lift, particles scatter instantly on spawn. | §VI.4, Gate 2.7 |
| **2** | **Temporal Crest Stability** | V6's EMA + ping-pong crest detection prevents single-frame flicker and catches the read/write-same-texture bug. | §V.2 |
| **3** | **Coupling Triple Safety** | Per-texel clamp + temporal smoothing + global energy cap prevents runaway at storm settings. GPU-side only — no readback. | §V.5, §IX.6 |
| **4** | **Manual Bilinear** | StorageTexture has no sampler. Off-grid particle queries produce stepping artifacts without manual bilinear interpolation. Not optional. | §VI.3 |
| **5** | **Shared Optics** | One file. One import. Both materials. If Fresnel/absorption/tint diverge under any angle, the seam reappears. This is the Orbit Test dependency. | §VII.1 |
| **6** | **Scope Guardrails** | V7's exclusion list is a survival manual. Without it, every cool idea becomes a feature that blocks shipping. | §XI.1 |

## F. Leva Control Panel

```
Presets       → scene: [cinematic-breaker, mid-storm, far-horizon]
Ocean         → windSpeed [1,25], windDirection [-π,π], choppiness [0.1,3],
                waveCount [8,48], tileSize [50,500]
Breakers      → enableBreakers, crestThreshold [0.1,1.5], maxParticles [8K,16K,32K,64K]
Ride Window   → rideDuration, kAttach, comoveGain, liftGain, dampCoeff,
                detachDist, kappaLiftThresh, kappaDetachThresh, crestBoost
Phase Trans   → enablePhaseTransitions, weCritSheet, ligamentDuration, dropletJitter
Foam          → enableFoam, foamInjectGain, foamDecayYoung, foamDecayOld
Coupling      → enableCoupling (DEFAULT OFF), feedbackGain, impactGain
Debug         → debugView [F1–F8], showPerfHUD, timeScale [0.1,2]
Seed          → seed [0,9999], regenerate (button)
```

## G. Agent Orchestration Protocol

### Roles
- **Agent:** Writes code, implements gates, iterates on feedback
- **Braden:** Runs builds, evaluates visually, provides artistic direction
- **This Document:** The spec. All technical decisions defer here. All visual decisions defer to Braden.

### Per-Gate Protocol
```
1. Agent reads this spec + relevant section for current gate
2. Agent implements the gate's deliverables
3. Agent produces validation scene for that gate
4. Braden runs it, evaluates visually
5. If fail → Braden describes what's wrong → Agent adjusts → goto 3
6. If pass → Mark gate complete → Proceed
```

### Gate Handoff Packet (Agent produces for each gate)
```
Gate: [ID]
Status: IN PROGRESS / COMPLETE
Prerequisites: [completed gates]
Deliverables: [numbered list]
Validation Scene: [name]
Pass Condition: [one sentence]
Key Files: [list]
```

## H. Glossary

| Term | Definition |
|---|---|
| **Genesis** | Particle spawn with position ON wave surface + velocity inherited (C10) |
| **Ride Window** | RIDING phase: F_attach + F_comove + F_lift. Gate 2.7. |
| **Crest Mask** | P02 output: .x = break intensity. Particles sample to respawn (C5). |
| **Ping-Pong** | Read A → write B; next frame read B → write A (C6). |
| **Zero-Copy** | Same GPU buffer for compute write and vertex read (C7). |
| **Shared Optics** | sharedOptics.ts — ocean + spray import same constants (Gem 5). |
| **Gated** | Feature disabled until specific gate passes. P05 gated until 3.1. |
| **Governor** | p95 frametime → ordered degrade ladder with reverse restore. |
| **One Water** | No visible seam between ocean and spray. Orbit Test. |
| **Tuning in the Dark** | Adjusting gains when Genesis input is wrong (C10 prevents). |
| **rideAlpha** | `1 − age/rideDuration` — decays ride forces over time. |
| **We** | Weber number: ρ·v²·L/σ — breakup criterion. |
| **κ** | Surface curvature — drives lift force and plunge detection. |
| **EMA** | Exponential moving average — temporal crest smoothing (V6). |
| **FEEDBACK_ELIGIBLE** | Sentinel on particle re-entry; triggers coupling write. |
| **JONSWAP** | Spectral density model for ocean wave energy distribution. |
| **TSL** | Three.js Shading Language — node-based shader authoring. |

## I. Cross-Reference Matrix

| Phenomenon | Pass | Constraint | Gate | Gem |
|---|---|---|---|---|
| Crest detection | P02 | C5 (atomic-free) | W1 | 2 (EMA) |
| Foam advection | P03 | C6 (ping-pong) | W2 | — |
| Particle spawn | P04 | C5, C10 | 2.5, 2.6 | — |
| Ride window | P04 | C10 | **2.7** | **1 (critical)** |
| Phase transitions | P04 | — | 2.8 | — |
| Seam elimination | R01 + R02 | Shared optics | 3.0 | **5 (seam killer)** |
| Coupling feedback | P05 | C10 (gated) | 3.1 | **3 (runaway safe)** |
| Off-grid sampling | P04 | — | — | **4 (bilinear)** |
| Scope control | — | — | — | **6 (guardrails)** |

## J. Source Attribution

| Concept | Primary Source |
|---|---|
| One Sentence, Three Tests | All V1–V9 (100% consensus) |
| C1–C10 | All V1–V9; C11/C12 from V6 |
| Velocity packing fix | GPT 5.2 Contradiction C |
| R3F async gl factory | GPT 5.2 Contradiction B |
| Ride window force model (Gem 1) | V1, V6, V8 |
| EMA crest + ping-pong (Gem 2) | V6 |
| Coupling triple safety (Gem 3) | V6 |
| Manual bilinear (Gem 4) | V9 |
| Shared optics (Gem 5) | V7 |
| Scope exclusions (Gem 6) | V7 |
| Gates + build order | V8 orchestration |
| Sprint schedule realism | V2 |
| Governor bugs (restore order) | V9 |
| Weber correction | V6 Changelog |
| Gerstner equations (corrected) | V6 §III.3 |

## K. Decision Log

| Decision | Chosen | Rejected | Rationale |
|---|---|---|---|
| Wave model Day 1 | Gerstner | FFT | Single dispatch; FFT Phase 2 |
| Crest spawn | Mask texture | Atomic append | TSL constrains atomics (C5) |
| Foam buffer | Ping-pong A↔B | Single read+write | Nondeterminism (C6) |
| Particle render | Instanced quads | Point sprites | gl_PointSize unreliable (C9) |
| Integration Day 1 | React UI + three.js | R3F-only | Maximum control (C8) |
| Coupling | Gated, off default | Always on | Runaway risk (C10) |
| WebGL2 fallback | Separate WebGLRenderer | forceWebGL | Cross-API overhead (C2) |
| C10 definition | Genesis before feedback | Shared optics (V7) | Ordering prevents tuning in dark |
| SSF for Gate 3.0 | Post-Gate 4.0 | Required | Billboards pass Orbit at 5 m |

---

> *This document is the single source of truth for the ProFlow HyperReal Ocean system. All implementation decisions defer to this spec. All visual decisions defer to Braden. WebGPU is the engine. The crest becomes a sheet. The sheet remembers it was water.*
>
> ***One water.***