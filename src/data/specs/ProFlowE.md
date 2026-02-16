# ProFlow HyperReal Ocean — The Definitive Specification

> **Codename:** ProFlow Continuum  
> **Revision:** MASTERCLASS v5.0 — The Final Synthesis  
> **Date:** 2026-02-15  
> **Lead Architect:** AI-Orchestrated, Human-Validated  
> **Lineage:** Synthesized from 9 UltimateSplash proposals (V1–V9), 13 HyperRealOcean variants, 7 WebGPU drafts, GPT 5.2 meta-analysis, ULTIMATE_PROPOSAL v2.0, Validated Build Plan v3.0, OCEAN_SIMULATION_ENCYCLOPEDIA (Parts A–K), and the full ProFlow codebase (1265+ files, 45+ engines).  
> **Consolidated Spine:** V8 orchestration + V6 physics/stability + V9 implementation gotchas + V2 performance budget + V7 scope discipline.  
> **Authority:** This document supersedes ALL prior specifications. Where any prior document conflicts, this one wins.

---

## How to Read This Document

This specification is organized in **dependency order** — each section builds on the previous. The first three sections (Vision, Tests, Constraints) define *what* we're building and *what we cannot violate*. Sections IV–V define the data and architecture *skeleton*. Sections VI–IX fill in the *muscle* (compute, particles, rendering, coupling). Sections X–XI define the *nervous system* (governor, services). Section XII is the *build plan*. Sections XIII–XIV are *quality assurance*. Sections XV–XVI are *boundaries and future*. The appendices are *reference material*.

**For the coding agent:** Start at §XII (Development Gates). Read the current gate's definition of done, then read the referenced sections for implementation detail.

**For the visual validator (Braden):** Start at §II (The Three Tests) and §XIV.3 (Anti-Cue Catalog). These define what "right" and "wrong" look like.

---

## Table of Contents

| § | Section | Purpose |
|---|---------|---------|
| I | [Vision & North Star](#i-vision--north-star) | Why this exists |
| II | [The Three Acceptance Tests](#ii-the-three-acceptance-tests) | When we ship |
| III | [Hard Constraints (C1–C12)](#iii-hard-constraints-c1c12) | What we cannot violate |
| IV | [Data Contract — The Typed ABI](#iv-data-contract--the-typed-abi) | What flows between passes |
| V | [System Architecture](#v-system-architecture) | How everything connects |
| VI | [Compute Pipeline — P01 through P05](#vi-compute-pipeline--p01-through-p05) | The simulation engine |
| VII | [Particle System — Phase FSM & Ride Window](#vii-particle-system--phase-fsm--ride-window) | The heart of the system |
| VIII | [Rendering — One Water](#viii-rendering--one-water) | The seam killer |
| IX | [Coupling Feedback (Gated)](#ix-coupling-feedback-gated) | The feedback loop |
| X | [Performance Governor](#x-performance-governor) | The safety net |
| XI | [Services Layer](#xi-services-layer) | Infrastructure |
| XII | [Development Gates & Build Order](#xii-development-gates--build-order) | The build plan |
| XIII | [Validation, Debug & Calibration](#xiii-validation-debug--calibration) | How we test |
| XIV | [Red-Team Checklist & Anti-Cues](#xiv-red-team-checklist--anti-cues) | Pre-ship verification |
| XV | [Scope Guardrails — Explicit Exclusions](#xv-scope-guardrails--explicit-exclusions) | What does NOT belong |
| XVI | [Evolution Path — Post Gate 4.0](#xvi-evolution-path--post-gate-40) | The future |
| A | [Constants (Single Source of Truth)](#appendix-a--constants) | All magic numbers |
| B | [Repository Structure](#appendix-b--repository-structure) | File layout |
| C | [Physics & Equations Reference](#appendix-c--physics--equations-reference) | The math |
| D | [Leva Control Panel](#appendix-d--leva-control-panel) | UI specification |
| E | [Glossary](#appendix-e--glossary) | Terminology |
| F | [Provenance & Decision Log](#appendix-f--provenance--decision-log) | Why X over Y |

---

# I. Vision & North Star

## I.1 The Problem

Every real-time water system in existence — Unreal WaveWorks, Sea of Thieves, NVIDIA Flow, Crest, offline Houdini FLIP — makes the same fatal compromise: **the moment water breaks, it stops being water.** It becomes particles pasted onto a surface. Two separate rendering systems with a visible seam. The spray doesn't remember it was once part of a wave crest.

This is not a rendering problem. It is an **identity** problem. The optical properties diverge at the fracture boundary — different Fresnel, different absorption, different tint. Two waters. The seam is not geometric. It is photometric.

## I.2 The Thesis

This compromise is no longer necessary in 2026. WebGPU compute shaders provide GPU-side particle simulation without CPU readback. Zero-copy `StorageBufferAttribute` eliminates the compute→render copy. Screen-space fluid rendering can smooth particle boundaries. And shared optical models — one file, one import, one water — kill the photometric seam.

We build **continuous water**: from spectral ocean at the horizon to the individual droplet falling from a crest, with no seam, no identity change, no "effect" boundary.

## I.3 The One Sentence (100% Consensus — V1–V9)

> **A wave crest rises, thins into a translucent sheet, stretches into ligaments, tears into droplets, those droplets fall back, create ring waves, and entrain foam — and at no point does the visual identity of "water" change.**

This sentence is the non-negotiable design north star. Every subsystem, every constraint, every pass, every line of shader code exists to serve it.

## I.4 The Seam Truth

Many systems fail not because particles are "bad," but because optical identity changes at the fracture boundary. **Shared optics is the fix.** If ocean mesh and spray particles import identical Fresnel, absorption, and scatter constants from a single file, the seam disappears regardless of rendering technique.

---

# II. The Three Acceptance Tests

The system ships when — and only when — it passes all three tests under all specified conditions. Everything else is negotiable.

| Test | Procedure | Pass Condition | Failure Mode | What It Proves |
|------|-----------|----------------|--------------|----------------|
| **Orbit** | Orbit camera 360° around breaking wave at 5 m distance | At no angle can you identify where "the ocean" ends and "the effect" begins | Visible boundary, color shift, or reflection break at any angle | Seam elimination via shared optics + depth compositing |
| **Slow-Mo** | Play breaking sequence at 0.25× speed | Continuous progression: sheet → elongating ligaments → pinching droplets → ballistic arcs → surface re-entry → ring waves | Particles pop in/out. No intermediate states. Confetti. | Physics progression via ride window + phase FSM |
| **Horizon** | Camera at 500 m altitude | Seamless tiling, natural foam streaks, zero computational artifacts | Visible repetition, grid edges, particle pop-in at distance | Scale stability + LOD + foam advection correctness |

**Orbit Test lighting requirement:** Must pass under noon sun, golden hour, AND overcast.

---

# III. Hard Constraints (C1–C12)

These are contracts, not preferences. Every one exists because violating it has destroyed prior attempts across 20+ proposals and 7 WebGPU drafts. C1–C9: 100% consensus across V1–V9. C10: 8/9 (V7 divergence resolved). C11–C12: V6 best practices, adopted.

## Platform

### C1: WebGPU-First

WebGPU is the engine. WebGL2 is a degraded fallback — separate codepath, reduced feature set. The compute pipeline (P01–P05) cannot be expressed in WebGL2. Treating WebGL2 as equal leads to lowest-common-denominator design.

### C2: No Cross-API Mixing at Runtime

One backend per session. Boot into WebGPU or WebGL2. Never both in the same frame.

**CRITICAL:** `WebGPURenderer({ forceWebGL: true })` is **FORBIDDEN**. It creates a WebGL context through WebGPU's abstraction layer — slower than native `WebGLRenderer` and confusing for debugging. Use a completely separate `WebGLRenderer`.

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

### C3: No GPU Readbacks in the Hot Path

Zero `readBuffer()`, `readTexture()`, `gl.readPixels()`, or synchronous fence operations in the render loop. Debug readbacks: throttled ≤2 Hz, opt-in, async with two-frame delay. **The #1 performance killer in every failed water engine.**

### C4: No Per-Frame Allocations

All textures, buffers, and render targets created at initialization. No `new Float32Array()`, no `createTexture()`, no `createBuffer()` in the animate loop. The garbage collector must never touch the hot path. **Exception:** Resize events may trigger controlled reallocation.

## Simulation

### C5: Atomic-Free Crest Spawning

Crest detection writes a **mask texture**; dead particles respawn by sampling it. Each particle independently checks the mask — no coordination, no atomics, no append buffer. Works on every GPU. **Exception:** MLS-MPM P2G (Phase 2) uses fixed-point atomics for grid scatter — explicitly permitted. C5 applies to spawn logic only.

### C6: Deterministic Ping-Pong for All Advected Fields

Foam, coupling feedback, crest EMA, and any advected quantity: Frame N reads A, writes B. Frame N+1 reads B, writes A. Two separate compute nodes at init, XOR toggle each frame. No read+write-same-buffer hacks.

### C10: Genesis Before Feedback

Particles spawn ON the wave surface with wave-inherited velocity (Gates 2.5/2.6) *before* ride window tuning (2.7), *before* phase transitions (2.8), *before* coupling feedback (3.1). Prevents "tuning in the dark."

> **V7 divergence resolved:** V7 defines C10 as "Shared optics." Shared optics is correct but belongs in rendering architecture. C10 = Genesis ordering. Shared optics is an implicit Orbit Test requirement.

## Rendering & Integration

### C7: Zero-Copy Particle Rendering

Particle data lives in `StorageBufferAttribute`. Compute writes; vertex reads directly. No CPU involvement. No copies. Same GPU buffer for both. The core WebGPU performance advantage.

### C8: React / three.js Integration Resolved

`WebGPURenderer.init()` is async. Two valid architectures exist — **choose one, commit:**

| Approach | When | Key |
|----------|------|-----|
| **A: R3F Canvas + async gl factory** | Want R3F ecosystem | `gl={async (props) => { const r = new WebGPURenderer(props); await r.init(); return r; }}` |
| **B: React UI + vanilla three.js** | Maximum control, Day 1 | `ref` to OceanEngine + telemetry callback; own frame loop |

**Recommendation:** Start Approach B. Migrate to A after Gate 3.0 if needed.

### C9: Instanced Billboard Quads for Spray

WebGPU point sprite limits make `gl_PointSize` unreliable. All particles render as instanced camera-facing quads. Hard requirement.

## Best Practice (V6)

### C11: No Implicit Format Conversions

All texture formats explicitly declared and matched between creation, bind group layout, and shader.

### C12: Deterministic Frame Ordering

Compute passes execute in declared registry order. Sequential passes are the synchronization primitive.

## Quick Reference

| Group | ID | Name | One-Line |
|-------|----|------|----------|
| Platform | C1 | WebGPU-First | WebGPU is the engine; WebGL2 is degraded fallback |
| Platform | C2 | No API Mixing | One backend per session. No `forceWebGL`. |
| Performance | C3 | No Readbacks | Zero in hot path. Debug ≤2 Hz. |
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

# IV. Data Contract — The Typed ABI

This is the single source of truth for all inter-pass data. **The v3.0 velocity packing fix is incorporated — vel.z is NOT dropped.**

## IV.1 Textures

| Texture | Format | Size | .x | .y | .z | .w | Ping-Pong |
|---------|--------|------|----|----|----|----|-----------|
| **heightTex** | RGBA32F | 256² | disp.x | disp.y (η) | disp.z | **vel.y** | No |
| **normalTex** | RGBA32F | 256² | N.x | N.y | N.z | **steepness** | No |
| **velocityTex** | RGBA32F | 256² | **vel.x** | **vel.z** | curvature (κ) | reserved | No |
| **crestMaskTex** | RGBA32F | 256² | intensity | breakType | crestAngle | steepExcess | Yes (V6 EMA) |
| **foamTexA/B** | RGBA32F | 512² | density | age | — | — | Yes |
| **couplingTexA/B** | RGBA32F | 256² | Δη | Δη̇ | Δfoam | energy | Yes (gated) |

### Velocity Packing Fix (v3.0 — MANDATORY)

Prior versions stored `(vel.x, vel.y, curvature, steepness)` in velocityTex — **discarding vel.z**. This breaks foam advection and particle comovement on diagonal seas.

**Corrected textureStore output from P01:**
```
textureStore(heightTex,   ivec2(ix,iy), vec4(disp.x, disp.y, disp.z, vel.y));
textureStore(normalTex,   ivec2(ix,iy), vec4(norm.x, norm.y, norm.z, steep));
textureStore(velocityTex, ivec2(ix,iy), vec4(vel.x, vel.z, curv, 0.0));
```

### Downstream Consumer Map

| Consumer | Reads | Source (Corrected) |
|----------|-------|-------------------|
| P02 vertical velocity | `heightTex.w` | (was velocityTex.y) |
| P02 steepness | `normalTex.w` | (was velocityTex.w) |
| P02 curvature | `velocityTex.z` | (unchanged) |
| P03 foam advection | `velocityTex.xy` = (vel.x, vel.z) | Both horizontal components |
| P04 co-movement | `velocityTex.xy` = (vel.x, vel.z) | Both horizontal components |
| P04 vertical velocity | `heightTex.w` | For ride window attachment |

## IV.2 Particle Buffers (32K baseline, Zero-Copy)

| Buffer | Per-Element | .x | .y | .z | .w |
|--------|-------------|----|----|----|----|
| **positionBuf** | vec4 × 32K | world x | world y | world z | phase (0–5) |
| **dataBuf** | vec4 × 32K | vel.x | vel.y | vel.z | age (seconds) |
| **renderBuf** | vec4 × 32K | size | alpha | thickness | elongation |

## IV.3 Spectrum Buffer

```
waveBuf: vec4 × MAX_WAVE_COMPONENTS × 2
  [i*2+0]: (dirX, dirZ, amplitude, frequency)
  [i*2+1]: (phase, Q_steepness, reserved, reserved)
```

## IV.4 Memory Budget

| Resource | Memory |
|----------|--------|
| heightTex + normalTex + velocityTex (3 × RGBA32F × 256²) | 3.0 MB |
| crestMaskTex (×2 ping-pong) | 2.0 MB |
| foamTexA + foamTexB (2 × RGBA32F × 512²) | 8.0 MB |
| couplingTexA + couplingTexB (2 × RGBA32F × 256²) | 2.0 MB |
| positionBuf + dataBuf + renderBuf (3 × vec4 × 32K) | 1.5 MB |
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
│  ┌─── COMPUTE (5 sequential dispatches — ORDER IS LAW) ───────────────┐  │
│  │  P01 WaveField → P02 CrestMask → P03 Foam → P04 Particles → P05   │  │
│  │  (Gerstner)      (EMA+smooth)    (ping-pong) (FSM+ride)    (gated) │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌─── RENDER ─────────────────────────────────────────────────────────┐  │
│  │  R01 Ocean Mesh (opaque, depth write ON)                           │  │
│  │  R02 Spray Billboards (transparent, additive, depth write OFF)     │  │
│  │  R03 Sky Dome (procedural)                                         │  │
│  │  R04 Debug Overlay (opt-in)                                        │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌─── SERVICES ───────────────────────────────────────────────────────┐  │
│  │  PassRegistry  │  ResourcePool  │  Governor  │  Telemetry           │  │
│  └────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────┘
```

## V.2 Pass Registry

| ID | Name | Type | Resolution | Est. Cost | Governor Fallback |
|----|------|------|------------|-----------|-------------------|
| P01 | WaveFieldCompute | compute | 256² | ~0.8 ms | 128² |
| P02 | CrestMaskDetect | compute | 256² | ~0.3 ms | 128² |
| P03 | FoamCompute | compute | 512² | ~0.5 ms | 256² |
| P04 | ParticleSim | compute | 32K | ~2.0 ms | 16K → 8K |
| P05 | CouplingFeedback | compute | 256² | ~0.3 ms | DISABLE |
| | **Compute total** | | | **~3.9 ms** | |
| R01 | OceanMeshRender | render | screen | ~1.0 ms | LOD reduce |
| R02 | SprayBillboards | render | instanced | ~0.8 ms | particle cap |
| R03 | SkyRender | render | screen | ~0.1 ms | always on |
| R04 | DebugOverlay | render | screen | ~0.1 ms | toggle |
| | **Render total** | | | **~2.0 ms** | |
| | **Grand total** | | | **~5.9 ms** | **10.7 ms headroom @ 60fps** |

Workgroup convention: 2D textures `[16, 16, 1]`, particles `[256, 1, 1]`.

## V.3 Init Flow (Load-Bearing Order — Do Not Rearrange)

```
1.  navigator.gpu check → choose backend
2.  Create WebGPURenderer OR separate WebGLRenderer (NEVER forceWebGL)
3.  await renderer.init()              ← CRITICAL: before ANY resource creation
4.  OrbitControls
5.  ResourcePool.allocateAll()         ← ALL textures, ALL buffers (C4)
6.  WaveCompute(pool)
7.  CrestDetect(pool)
8.  FoamCompute(pool)                  ← creates BOTH ping-pong nodes at init
9.  ParticleSim(pool)
10. CouplingBridge(pool)
11. PassRegistry.register([...])
12. Governor(passRegistry, degradeLadder)
13. OceanMesh, SprayRenderer, Sky → scene.add()
14. Resize handler
```

## V.4 Animate Loop

```typescript
animate(time: number) {
    const dt = Math.min((time - this.lastTime) / 1000, 0.05);
    this.lastTime = time;
    const t0 = performance.now();

    if (this.isWebGPU) {
        // Sequential compute — C12: ORDER IS LAW
        if (registry.isEnabled('P01')) renderer.compute(waveCompute.getNode());
        if (registry.isEnabled('P02')) renderer.compute(crestDetect.getNode());
        if (registry.isEnabled('P03')) renderer.compute(foamCompute.tick());     // ping-pong
        if (registry.isEnabled('P04')) renderer.compute(particleSim.getNode());
        if (registry.isEnabled('P05')) renderer.compute(couplingBridge.tick());  // ping-pong, gated
    } else {
        this.tickWebGLFallback(time);  // C2: never both
    }

    renderer.render(scene, camera);
    governor.update(performance.now() - t0);
    emitTelemetry();
}
```

## V.5 React Integration (Approach B — Recommended Day 1)

```typescript
// App.tsx — React owns UI, three.js owns rendering
const canvasRef = useRef<HTMLCanvasElement>(null);
const engineRef = useRef<OceanEngine | null>(null);

useEffect(() => {
    const engine = new OceanEngine(canvasRef.current!);
    engineRef.current = engine;
    engine.init().then(() => { engine.start(); setReady(true); });
    return () => engine.dispose();
}, []);
```

---

# VI. Compute Pipeline — P01 through P05

## VI.1 P01: Wave Field Computation

### Why Gerstner (Not FFT) for Day 1

FFT requires multiple passes (butterfly, IFFT, permutation), twiddle textures, synchronization. Gerstner is one dispatch, identical visual quality for 16–48 components, trivial per-texel parallelism, exact analytical normals/curvature. **FFT is Phase 2** — same output contract, drop-in replacement.

### Governing Equations (V6 Physics-Corrected)

```
Displacement:
  x  = x₀ − Σᵢ Qᵢ Aᵢ Dᵢₓ cos(θᵢ)        θᵢ = kᵢ(Dᵢ · x₀) − ωᵢt + φᵢ
  y  =      Σᵢ Aᵢ sin(θᵢ)
  z  = z₀ − Σᵢ Qᵢ Aᵢ Dᵢz cos(θᵢ)

Velocity (time derivative):
  vₓ = Σᵢ Qᵢ Aᵢ Dᵢₓ ωᵢ sin(θᵢ)
  vy = Σᵢ Aᵢ ωᵢ cos(θᵢ)
  vz = Σᵢ Qᵢ Aᵢ Dᵢz ωᵢ sin(θᵢ)

Normal (approximate, drops Q² terms):
  N ≈ normalize(−Σ kᵢAᵢDᵢₓcos(θ), 1−Σ Qᵢkᵢ²Aᵢsin(θ), −Σ kᵢAᵢDᵢzcos(θ))

Steepness:   S = Σᵢ kᵢ Aᵢ Qᵢ |cos(θᵢ)|        (≥1 = breaking)
Curvature:   κ = −Σᵢ kᵢ² Aᵢ sin(θᵢ)
Dispersion:  ω² = gk  (deep water)
Q parameter: Q = min(choppiness / (k × A × N), 1.0)
```

### Spectrum Generation (CPU, at init)

JONSWAP spectral density with directional cos²ˢ spreading, stratified frequency sampling, seeded RNG for determinism. Peak frequency: `ωp = g / (1.026 × windSpeed)` (Pierson-Moskowitz). Output: `Float32Array(waveCount × 8)` → uploaded to `waveBuf`.

---

## VI.2 P02: Crest Mask Detection

### Logic

```
steepExcess = smoothstep(crestThreshold, crestThreshold+0.3, steepness)
isRising    = smoothstep(0, 0.5, vertVel)         ← heightTex.w
curveFactor = smoothstep(0.5, 2.0, curvature)     ← velocityTex.z
intensity   = steepExcess × isRising × (curveFactor × 0.5 + 0.5)

plungeScore = curvature × max(0, vertVel)          ← Iribarren proxy
breakType   = smoothstep(0, 5.0, plungeScore)      ← 0=spilling, 1=plunging
crestAngle  = atan2(gradZ, gradX) / (2π) + 0.5     ← height finite differences
```

### V6 Enhancements (Gem 2 — Adopted)

1. **EMA temporal smoothing** — prevents single-frame flicker
2. **3×3 neighborhood smoothing** — spatial stability
3. **Ping-pong crest textures** — V6 caught the illegal read/write-to-same-texture bug

---

## VI.3 P03: Foam Compute (Deterministic Ping-Pong)

Two `StorageTexture`s (foamA, foamB). Two compute nodes at init. XOR toggle each frame.

**Per-texel:**
1. **Advection:** Semi-Lagrangian trace-back by `velocityTex.xy` = `(vel.x, vel.z)` — BOTH horizontal
2. **Decay:** Age-dependent tau: `mix(tauYoung, tauOld, smoothstep(0, 5, age))`
3. **Injection:** `crestMask.x × foamInjectGain`
4. **Stretch dissipation:** `stretchDecay = clamp(1 − |vel| × 0.1, 0.8, 1)`

---

## VI.4 P04: Particle Simulation

See [§VII](#vii-particle-system--phase-fsm--ride-window) for the complete particle system specification.

---

## VI.5 P05: Coupling Feedback

See [§IX](#ix-coupling-feedback-gated) for the complete coupling specification.

---

# VII. Particle System — Phase FSM & Ride Window

This is the heart of the system. 32K particles, each independently executing a finite state machine.

## VII.1 Phase State Machine

```
DEAD (0) ──[crest mask > threshold]──→ RIDING (1)
  ▲                                        │
  │    ride window: attach + comove         │
  │    + lift + damp × rideAlpha            │
  │                                         │
  │    DETACH: age > duration               │
  │         OR |gap| > detachDist           │
  │         OR κ < κDetachThresh            │
  │                                         ▼
  │                                    SHEET (2)
  │         gravity + thickness decay        │
  │         We < weCritSheet → break         │
  │                                         ▼
  │                                  LIGAMENT (3)
  │         elongation increases             │
  │         age > ligamentDuration → pinch   │
  │                                         ▼
  │                                   DROPLET (4)
  │                              ╱               ╲
  │               y > surface+thresh          re-enters surface
  │                     ▼                           │
  │                SPRAY (5)                        │
  │                     │                           │
  │              re-enters surface                  │
  └──────── FEEDBACK_ELIGIBLE → DEAD ◄──────────────┘
```

| Phase | Value | Entry | Exit | Physics |
|-------|-------|-------|------|---------|
| DEAD | 0 | Spawn/recycle | Crest mask sample > threshold | — |
| RIDING | 1 | Spawn from crest | Timer OR gap OR curvature drop | Attach, co-move, lift, damp |
| SHEET | 2 | RIDING exit | We < We_crit OR age > 4 s | Gravity, thickness decay |
| LIGAMENT | 3 | SHEET We breakup | age > ligamentDuration | Elongation, pinch |
| DROPLET | 4 | LIGAMENT pinch | y > surface → SPRAY; y < surface → DEAD | Ballistic + drag |
| SPRAY | 5 | DROPLET above surface | y < surface → DEAD | Ballistic + wind drag |

**Target phase distribution during active break:** ~40% sheet, ~25% ligament, ~35% droplet.

## VII.2 Spawning (C5: Atomic-Free)

Dead particles sample crest mask at deterministic pseudo-random UV derived from `(particleIndex + time)` hash. Probabilistic accept: `roll < intensity × spawnRate`.

**Genesis (C10):**
- **Position:** ON the wave surface — sample heightTex at spawn UV
- **Velocity:** INHERITED from wave — velocityTex `(vel.x, vel.z)` + heightTex `.w` for vel.y

## VII.3 Manual Bilinear Sampling (Gem 4 — NOT OPTIONAL)

StorageTexture has no sampler. `textureLoad()` returns point samples. Particles sampling off-texel MUST use a manual bilinear helper:

```
bilinearLoad(tex, uv, texSize):
  fx, fy = uv × texSize
  ix0, iy0 = floor(fx), floor(fy)
  s00 = textureLoad(tex, ivec2(ix0,     iy0))
  s10 = textureLoad(tex, ivec2(ix0 + 1, iy0))
  s01 = textureLoad(tex, ivec2(ix0,     iy0 + 1))
  s11 = textureLoad(tex, ivec2(ix0 + 1, iy0 + 1))
  return mix(mix(s00, s10, fract(fx)), mix(s01, s11, fract(fx)), fract(fy))
```

Lives in `compute/bilinearHelper.ts`. Bare `textureLoad()` for off-grid queries produces visible stepping artifacts.

## VII.4 Ride Window Forces (Gem 1 — THE Critical Visual Gate)

The difference between "water" and "confetti." Sprint 1 is make-or-break.

| Force | Equation | Purpose |
|-------|----------|---------|
| **F_attach** | `gap.negate() × kAttach × rideAlpha` along normal | Spring toward wave surface |
| **F_comove** | `(targetVel − vel) × comoveGain × rideAlpha` | Bias velocity toward wave motion |
| **F_lift** | `max(0, κ − κ_thresh) × liftGain` upward | Curvature-driven throw (plunging) |
| **F_damp** | `(targetVel − vel) × dampCoeff × rideAlpha` | Oscillation suppression |

**rideAlpha** = `1 − age/rideDuration` (decays linearly over ride window)

### Detach Conditions (Any One Triggers Exit)

- `rideTimer > rideDuration` — time's up
- `|gap| > detachDist` — particle drifted from surface
- `curvature < κDetachThresh` — crest passed; let go

### No Velocity Discontinuity Rule

At detach: particle **keeps current velocity** + smooth lift boost. Never instant swap.

### Parameters (All Leva-Tunable)

| Parameter | Default | Range | Effect |
|-----------|---------|-------|--------|
| rideDuration | 0.4 s | 0.1–2.0 | Ride window length |
| kAttach | 200 | 50–500 | Spring stiffness |
| comoveGain | 15 | 5–50 | Velocity bias |
| liftGain | 5.0 | 1–20 | Curvature throw |
| dampCoeff | 10 | 2–50 | Damping |
| detachDist | 0.3 m | 0.05–1.0 | Max gap |
| kappaLiftThresh | 1.5 | 0.5–5.0 | Lift onset |
| kappaDetachThresh | 0.2 | 0–1.0 | Detach trigger |
| crestBoost | 0.3 | 0.1–1.0 | Spawn velocity multiplier |

## VII.5 Phase Transitions

**SHEET:** Gravity + thickness decay: `dτ/dt = −τ × stretchRate`. Weber breakup: `We = ρ·v²·τ/σ` (V6 corrected). If `We < weCritSheet` → LIGAMENT. Sheet should break within ~0.8 s of detach.

**LIGAMENT:** Elongation increases: `elongation += dt × 0.5`. After `ligamentDuration` → DROPLET. Jitter velocity at pinch-off for varied trajectories.

**DROPLET:** Ballistic + mild drag (`vel *= 0.998`). If `y > surface + sprayThreshold` → SPRAY. If `y < surface − 0.2` → DEAD (FEEDBACK_ELIGIBLE).

**SPRAY:** Sphere drag: `F_drag = −0.5 × ρ_air × C_d × |v_rel| × v_rel / mass`. Wind applied. Re-entry → DEAD (FEEDBACK_ELIGIBLE).

---

# VIII. Rendering — One Water

## VIII.1 Shared Optics (Gem 5 — The Seam Killer)

**Both ocean mesh and spray billboards import `sharedOptics.ts`.** One file. One import. One water. If these diverge under any angle, the Orbit Test fails.

```typescript
// sharedOptics.ts — THE file. Both WaterMaterial.ts AND SprayRenderer.ts import this.

export const WATER_IOR     = 1.333;
export const WATER_F0      = Math.pow((1 - WATER_IOR) / (1 + WATER_IOR), 2); // ~0.02
export const DEEP_COLOR    = [0.0, 0.05, 0.15];
export const SHALLOW_COLOR = [0.0, 0.15, 0.25];
export const FOAM_COLOR    = [0.85, 0.88, 0.92];
export const SSS_TINT      = [0.1, 0.4, 0.35];
export const ABSORPTION    = [0.45, 0.09, 0.06];   // per meter (Beer-Lambert)
export const SCATTER_COLOR = [0.02, 0.08, 0.12];

// Fresnel (Schlick): F = F0 + (1−F0)(1−N·V)^5
// Absorption (Beer-Lambert): color × exp(−absorption × pathLength)
```

## VIII.2 R01: Ocean Mesh

TSL `MeshStandardNodeMaterial`:
- **Vertex:** Displace from heightTex
- **Normal:** From normalTex (analytical, filtered)
- **Color:** Fresnel + depth-dependent absorption + foam overlay + SSS
- **Roughness:** 0.05 (water) → 0.6 (foam patches)
- **Depth write:** ON (opaque)

## VIII.3 R02: Spray Billboards

`InstancedMesh` + `PlaneGeometry(1,1)`, `MeshBasicNodeMaterial`, transparent:
- **Billboard:** Camera-facing via viewMatrix decomposition
- **Per-instance:** Position from positionBuf (C7), size/alpha/elongation from renderBuf
- **Dead particles:** Moved to `y = −1000`
- **Color:** Phase-dependent using shared optics constants
- **Opacity:** `renderBuf.y × smoothstep(0.5, 0.3, dist_from_center)`
- **Blend:** Additive, depth write OFF, depth test ON

## VIII.4 Screen-Space Fluid (Phase 2 — Post Gate 4.0)

Billboards + shared optics pass the Orbit Test at 5 m distance. SSF is Hero Shot Mode:
- Depth splatting → bilateral smooth → normal reconstruction → composite
- Architecture slot designed for drop-in insertion between R01 and R02

---

# IX. Coupling Feedback (Gated)

## IX.1 Activation

**Default OFF.** Only enabled after Gate 3.0 (seam elimination passes). P05 in PassRegistry starts disabled.

## IX.2 Mechanism

When particles re-enter surface (DEAD + FEEDBACK_ELIGIBLE flag):
1. **Ring wave seed:** Radial ∂η/∂t impulse at impact point
2. **Foam deposition:** Impact energy → foam injection into couplingTex.z
3. **Energy tracking:** Cumulative energy in couplingTex.w

## IX.3 Runaway Prevention — Triple Safety (Gem 3)

| Safety | Mechanism |
|--------|-----------|
| **1. Per-texel clamp** | No texel > MAX_IMPULSE |
| **2. Temporal smoothing** | New feedback blended alpha=0.3 with previous |
| **3. Global energy cap** | Hierarchical mip chain reduction on .w; if total > cap, scale all. **GPU-side only — no readback.** |

## IX.4 Stability Protocol (5-Step Escalation)

| Step | Action | Duration | Pass Condition |
|------|--------|----------|----------------|
| 1 | Foam deposition only | 60 s | No foam runaway |
| 2 | Ring waves gain=0.1 | 60 s | No oscillation |
| 3 | Gain=0.5 | 60 s | Stable |
| 4 | Gain=1.0, storm | 60 s | Bounded energy |
| 5 | If any fails | — | Freeze at previous gain |

---

# X. Performance Governor

## X.1 Degrade Ladder (Least Visual Impact First)

Degrade in this order. **Restore in REVERSE order.** Hysteresis prevents thrashing.

| Step | Action | Est. Save | Visual Impact |
|------|--------|-----------|---------------|
| 1 | Particles 32K → 16K | 1.0 ms | Low |
| 2 | Foam 512² → 256² | 0.3 ms | Low |
| 3 | Particles 16K → 8K | 0.5 ms | Medium |
| 4 | Crest smoothing radius reduced | — | Low |
| 5 | Disable coupling (if enabled) | 0.3 ms | Medium |
| 6 | Disable SSF (if enabled) | — | Medium |
| 7 | Disable breakers (P02+P04 off) | 2.3 ms | **High (last resort)** |

## X.2 Trigger Logic

```
DEGRADE:  p95 frametime > 16.6ms × 1.3 = 21.6ms
RESTORE:  p95 frametime < 16.6ms × 0.8 = 13.3ms for 120 consecutive frames (~2s)
```

Use exponential smoothing on frame time, not raw values.

---

# XI. Services Layer

| Service | Role |
|---------|------|
| **PassRegistry** | Central list of all passes. Enable/disable. Cost tracking. Governor toggles. No hidden passes. |
| **ResourcePool** | Pre-allocates ALL textures + buffers at init. `allocateAll()`. No lazy alloc. Ping-pong management. |
| **Governor** | Monitors p95 frame time. Ordered degrade ladder. Reverse restore. Hysteresis. |
| **Telemetry** | FPS, frame time, per-pass compute time, particle count, governor level. Throttled callback to React UI. No readbacks. |

---

# XII. Development Gates & Build Order

## XII.1 Current State

Gates W0–W3 and 2.5–2.6 are **DONE**. Gate 2.7 (Ride Window) is the **current active blocker**.

## XII.2 Gate Definitions

| Gate | Name | Definition of Done |
|------|------|-------------------|
| ~~W0~~ | ~~WebGPU Lifecycle~~ | ✅ Renderer init once. No fallback mixing. Banner if WebGL2. |
| ~~W1~~ | ~~Crest Mask Debug~~ | ✅ F3 overlay shows crest mask tracking steep crests. |
| ~~W2~~ | ~~Foam Ping-Pong~~ | ✅ No pulsing. F5 shows smooth evolution. 60 s stable. |
| ~~W3~~ | ~~Billboard Render~~ | ✅ Instanced quads face camera. Phase coloring (F6). |
| ~~2.5~~ | ~~Genesis Position~~ | ✅ Particles spawn ON wave surface. Freeze frame: all on surface. |
| ~~2.6~~ | ~~Genesis Velocity~~ | ✅ Spawn velocity matches wave velocity field. |
| **2.7** | **Ride Window** | **Sheet tracks crest ≥0.3 s. Smooth detach. No confetti. Side camera 0.25×.** |
| 2.8 | Phase Transitions | Sheet→Lig→Drop visible at 0.25×. Phase histogram ~40/25/35%. |
| 3.0 | Seam Elimination | Orbit Test passes at noon, golden hour, AND overcast. |
| 3.1 | Coupling Feedback | Ring waves visible. Foam deposits. No runaway (stability protocol). |
| 4.0 | Performance | 60 fps sustained. p99 < 16.6 ms. Governor tested. Zero readbacks. |

## XII.3 Advancement Rules

```
2.5 → 2.6 → 2.7 → 2.8 → 3.0 → 3.1 → 4.0

RULE 1: No gate N+1 work until gate N passes.
RULE 2: Coupling tuning (3.1) FORBIDDEN until 2.7+2.8 visually pass.
RULE 3: Each gate has a validation scene and visual test.
RULE 4: Braden validates visually. Agent iterates.
```

## XII.4 Sprint Plan

| Sprint | Gate | Duration | Focus | Criticality |
|--------|------|----------|-------|-------------|
| **1** | **2.7 Ride Window** | **5 days** | F_attach + F_comove + F_lift + detach | **MAKE-OR-BREAK** |
| 2 | 2.8 Phase Transitions | 4 days | Slow-Mo test. Visible breakup cascade. | High |
| 3 | 3.0 Seam Elimination | 3 days | Shared optics. Orbit Test. Three lightings. | High |
| 4 | 3.1 Coupling | 3 days | P05 enabled. Triple safety. Protocol. | Medium |
| 5 | 4.0 Perf / Governor | 2 days | Degrade ladder. Restore. Stress test. | Medium |
| | | **~17 days** | | |

## XII.5 Ride Window Tuning Protocol (Sprint 1)

1. Start with defaults: rideDuration=0.4, kAttach=200, comoveGain=15, liftGain=5
2. Run Ride Window validation scene at 0.25× speed
3. Ask Braden: "Does the sheet track the crest? How long? Is detach smooth?"
4. Adjust **one parameter at a time** (isolate variables)
5. Iterate until sheet visibly rides crest ≥0.3 s with smooth detach
6. Record final tuned values as new defaults

## XII.6 Agent Gate Handoff Packet (Template)

```
Gate:           [ID and Name]
Status:         IN PROGRESS
Prerequisites:  [completed gates]
Deliverables:   [numbered list]
Validation:     [scene name]
Pass Condition: [one sentence from §XII.2]
Key Files:      [files to create/modify]
Reference:      [this document, section #]
```

---

# XIII. Validation, Debug & Calibration

## XIII.1 Debug Views (GPU-Only, Zero Readback)

| Key | View | What It Shows |
|-----|------|--------------|
| F1 | Height Map | Displacement gradient (blue→white) |
| F2 | Normal Map | Surface normals as RGB |
| F3 | Crest Mask | Break intensity (red heat) |
| F4 | Steepness | normalTex.w gradient |
| F5 | Foam Density | Foam texture white overlay |
| F6 | Particle Phase | RIDING=green, SHEET=cyan, LIGAMENT=yellow, DROPLET=red, SPRAY=white |
| F7 | Ride Timer | Age as green→red gradient (detached=gray) |
| F8 | Pass Timing | Per-pass estimates + governor state |

## XIII.2 Validation Scenes (Deterministic Seeds)

| Scene | Camera | Settings | Validates |
|-------|--------|----------|-----------|
| **Cinematic Breaker** | (15,5,20)→origin | wind 12, chop 1.5, waves 32, seed 42 | Gates 2.7, 2.8, 3.0 |
| **Mid Storm** | (40,20,50)→origin | wind 20, chop 2.0, waves 48, seed 137 | Gate 4.0 (perf) |
| **Far Horizon** | (0,8,150)→origin | wind 8, chop 1.0, waves 24, seed 7 | Horizon Test |
| **Genesis Verify** | Freeze at t₀ | — | Particles on surface |
| **Ride Window** | Side view, 0.25× | rideDuration 0.4 | Sheet tracks crest |
| **Seam Test** | Orbit 360° @ 5m | — | Three lightings |

## XIII.3 PerfHUD

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

# XIV. Red-Team Checklist & Anti-Cues

## XIV.1 Pre-Ship Verification (25 Items)

| # | Check | Method |
|---|-------|--------|
| 1 | velocityTex stores (vel.x, **vel.z**) — NOT (vel.x, vel.y) | Inspect textureStore |
| 2 | heightTex.w = vel.y; normalTex.w = steepness | Inspect textureStore |
| 3 | Foam advection uses velocityTex.xy = (vel.x, vel.z) | Check Semi-Lagrangian |
| 4 | No readBuffer/mapAsync in animate | `grep -r "readBuffer\|mapAsync" src/` |
| 5 | No createTexture/createBuffer in animate | `grep -r "createTexture\|createBuffer" src/` |
| 6 | No new Float32Array in animate | `grep -r "new Float32Array" src/` |
| 7 | Crest uses mask texture, no atomics | No `atomicAdd` in spawn |
| 8 | Foam has two textures with XOR toggle | foamA, foamB verified |
| 9 | Crest has ping-pong (V6 EMA) | crestTexA, crestTexB |
| 10 | Coupling gated — P05 OFF by default | passRegistry check |
| 11 | Shared optics — one import for both materials | sharedOptics.ts verified |
| 12 | Billboard quads, not points | InstancedMesh + PlaneGeometry |
| 13 | Zero-copy particle rendering | StorageBufferAttribute |
| 14 | Pass order P01→P02→P03→P04→P05 | No reorder in animate |
| 15 | Governor restores in REVERSE degrade order | Each step has restore() |
| 16 | Manual bilinear helper used | bilinearHelper.ts exists and is called |
| 17 | No forceWebGL: true | Separate WebGLRenderer |
| 18 | R3F approach committed (A or B, not both) | One pattern verified |
| 19 | Deterministic seed for spectrum | Same seed = same ocean |
| 20 | ResourcePool.allocateAll() at init | No lazy alloc |
| 21 | C11: All texture formats explicitly matched | No implicit conversions |
| 22 | C12: Sequential passes, no parallel assumptions | Ordering verified |
| 23 | Weber number dimensionally correct (V6) | We = ρ·v²·L/σ |
| 24 | Orbit Test passes under noon, golden hour, AND overcast | Three conditions |
| 25 | Storage texture usage flags correct | STORAGE_BINDING ∣ TEXTURE_BINDING |

## XIV.2 Technical Anti-Patterns

| Anti-Pattern | Why It Kills | Detection |
|--------------|-------------|-----------|
| readBuffer in animate() | 10–100× frame spike | `grep "readBuffer\|mapAsync"` in hot path |
| createTexture in animate() | GC stalls | `grep "createTexture\|createBuffer"` in loop |
| new Float32Array in animate() | GC pressure | `grep "new Float32Array"` in loop |
| atomicAdd for crest spawn | GPU variance, sync bugs | Check spawn path for atomics |
| forceWebGL: true | Cross-API overhead | Search renderer creation |
| Coupling enabled before Gate 3.0 | Tuning in the dark | Verify P05 disabled |

## XIV.3 Visual Anti-Cue Catalog

| Anti-Cue | Likely Cause | Fix |
|----------|-------------|-----|
| Particles float above crest | kAttach too low | Increase kAttach (200→400) |
| Particles slide backward off crest | comoveGain too low | Increase comoveGain (15→30) |
| Instant confetti on spawn | Ride window not applied | Code bug — verify RIDING forces execute |
| Particles welded forever | rideDuration too high; detach never triggers | Reduce rideDuration; check detach conditions |
| Visible seam at boundary | Separate optics / different materials | Verify sharedOptics.ts imported by both |
| Foam pulsing / crawling | Non-ping-pong foam (reading+writing same tex) | Verify strict A↔B toggle (C6) |
| Grid boundaries at horizon | Tile size / resolution mismatch | Adjust tileSize; add LOD rings |
| Foam only moves one direction | vel.z dropped from velocityTex | Apply velocity packing fix (§IV.1) |
| Velocity discontinuity at detach | Instant velocity swap | Keep current velocity + smooth lift boost |
| Over-cohesion (goo) | weCritSheet too low | Sheet should break within 0.8 s of detach |
| Under-cohesion (dust) | Particles scatter immediately | Connected sheet for ≥2 frames at spawn |
| Popcorn breakup | No sheet/ligament phase or We_crit too low | Ensure SHEET phase exists; tune We_crit |
| Frozen rain (no drag) | Missing air drag in SPRAY | Add sphere drag model |
| Snow (foam everywhere) | foamInjectGain too high | Lower gain |
| Painted foam (doesn't move) | Missing advection | Check Semi-Lagrangian trace-back |

---

# XV. Scope Guardrails — Explicit Exclusions

**Gem 6 (V7): This list is a survival manual.** Including any of these features will kill the project.

| Feature | Why Excluded | Risk If Included |
|---------|--------------|------------------|
| Bubble plume simulation | Not visible in Three Tests | Months of scope creep |
| God ray post-processing | Rendering polish, not water identity | Distraction from core gates |
| Nearshore bathymetry | Requires terrain system not in scope | Dependency chain blocker |
| Surface tension CSF model | MLS-MPM complexity for marginal visual gain | Performance cost, tuning nightmare |
| Rayleigh-Plateau pinch-off | Research physics for a visual heuristic | Over-engineering |
| Phenomenon Cards as build artifacts | Process overhead for solo team | Bureaucracy |
| 14-texture atlas | Premature optimization | Complexity without identified payoff |
| Multi-resolution cascade FFT | Phase 2, not Day 1 | Blocks shipping |
| Screen-space fluid for MVP | Billboards pass Orbit at 5 m | Premature complexity |
| SSR (screen-space reflections) | Polish, not core | Scope creep |

**Philosophy:** Ship the minimum system that passes the Three Tests. Then iterate. The architecture supports all of these — they're just not Gate 1–4.

---

# XVI. Evolution Path — Post Gate 4.0

Every evolution adds passes to the registry and resources to the pool. The architecture is designed for this expansion.

| Phase | Feature | Integration Point |
|-------|---------|-------------------|
| 2.1 | FFT spectral ocean | Replace P01 Gerstner. Same output contract. |
| 2.2 | SWE heightfield dynamics | Object wakes, reflections. Feeds crestMask. |
| 2.3 | Screen-space fluid rendering | Depth splat → bilateral → normals → composite. |
| 3.0 | MLS-MPM detail simulation | Replace/enhance P04. Same particle buffers. |
| 3.1 | Underwater camera optics | Post-process. Shared optics constants. |
| 3.2 | Caustics | Separate compute pass. Reads heightMap normals. |
| 4.0 | Multi-domain SWE nesting | Nested heightfields at different scales. |
| 4.1 | 3D volumetric wind | Wind texture drives spectrum generation. |
| 5.0 | Object physics (hulls, boards) | Buoyancy. Reads heightMap. |

### Simulation Ladder (LOD Tiers)

| Tier | Name | Target GPU | Key Features |
|------|------|------------|--------------|
| L0 | Minimal | Mobile | CPU analytic, shading-only |
| L1 | Lite | Low-end laptop | CPU + simple GPU |
| L2 | Standard | Mid-range | GPU compute (Gerstner), particles |
| **L3** | **High (Day 1)** | **GTX 1070+** | **Full pipeline, 32K particles** |
| L4 | Ultra | RTX 2060+ | 512² FFT, 64K particles |
| L5 | Research | RTX 3080+ | MLS-MPM, SSF, maxed |

---

# Appendix A — Constants

```typescript
// constants.ts — SINGLE SOURCE OF TRUTH

// ═══ RESOLUTION ═══
export const WAVE_TEX_SIZE         = 256;
export const FOAM_TEX_SIZE         = 512;
export const COUPLING_TEX_SIZE     = 256;
export const MAX_PARTICLES         = 32768;
export const MAX_PARTICLES_WEBGL   = 8192;
export const MAX_WAVE_COMPONENTS   = 48;

// ═══ PHASES ═══
export const PHASE_DEAD      = 0;
export const PHASE_RIDING    = 1;
export const PHASE_SHEET     = 2;
export const PHASE_LIGAMENT  = 3;
export const PHASE_DROPLET   = 4;
export const PHASE_SPRAY     = 5;

// ═══ RIDE WINDOW ═══
export const RIDE_DURATION        = 0.4;
export const K_ATTACH             = 200;
export const COMOVE_GAIN          = 15;
export const LIFT_GAIN            = 5.0;
export const DAMP_COEFF           = 10;
export const DETACH_DIST          = 0.3;
export const KAPPA_LIFT_THRESH    = 1.5;
export const KAPPA_DETACH_THRESH  = 0.2;
export const CREST_BOOST          = 0.3;

// ═══ PHASE TRANSITIONS ═══
export const WE_CRIT_SHEET      = 0.5;
export const WE_CRIT_LIGAMENT   = 40;
export const LIGAMENT_DURATION  = 1.0;
export const DROPLET_JITTER     = 0.5;
export const SPRAY_THRESHOLD    = 0.5;

// ═══ FOAM ═══
export const FOAM_INJECT_GAIN  = 0.8;
export const TAU_FOAM_YOUNG    = 2.0;
export const TAU_FOAM_OLD      = 8.0;

// ═══ COUPLING SAFETY ═══
export const FEEDBACK_GAIN      = 0.5;
export const IMPACT_GAIN        = 0.01;
export const MAX_IMPULSE        = 0.5;
export const COUPLING_ALPHA     = 0.3;
export const GLOBAL_ENERGY_CAP  = 1000;

// ═══ PHYSICS ═══
export const GRAVITY    = 9.81;
export const RHO_WATER  = 1000;
export const RHO_AIR    = 1.225;
export const CD_SPHERE  = 0.44;
export const SIGMA      = 0.073;  // surface tension N/m

// ═══ OPTICS (SHARED — ONE WATER) ═══
export const WATER_IOR      = 1.333;
export const WATER_F0       = 0.02;
export const ABSORPTION     = [0.45, 0.09, 0.06] as const;
export const SCATTER_COLOR  = [0.02, 0.08, 0.12] as const;

// ═══ GOVERNOR ═══
export const GOVERNOR_TARGET_MS      = 16.6;
export const GOVERNOR_DEGRADE_RATIO  = 1.3;
export const GOVERNOR_RESTORE_RATIO  = 0.8;
export const GOVERNOR_RESTORE_FRAMES = 120;
```

---

# Appendix B — Repository Structure

```
hyper-real-ocean/
├── package.json
├── tsconfig.json
├── vite.config.ts                   # Aliases: three/webgpu, three/tsl
├── index.html
└── src/
    ├── main.tsx                     # React entry point
    ├── App.tsx                      # Canvas + UI overlay bridge (Approach B)
    ├── OceanEngine.ts               # Core orchestrator: init, animate, dispose
    ├── types.ts                     # OceanSettings, OceanTelemetry, PassDescriptor
    ├── constants.ts                 # Appendix A — single source of truth
    │
    ├── compute/
    │   ├── WaveCompute.ts           # P01: Gerstner wave field
    │   ├── CrestDetect.ts           # P02: Crest mask (EMA + ping-pong)
    │   ├── FoamCompute.ts           # P03: Foam advection (ping-pong)
    │   ├── ParticleSim.ts           # P04: Particle FSM + ride window + phases
    │   ├── CouplingBridge.ts        # P05: Coupling feedback (gated)
    │   ├── bilinearHelper.ts        # Manual bilinear for StorageTexture (Gem 4)
    │   └── spectrum.ts              # JONSWAP generation (CPU, at init)
    │
    ├── render/
    │   ├── OceanMesh.ts             # R01: Displaced mesh + water material
    │   ├── SprayRenderer.ts         # R02: Instanced billboard quads
    │   ├── WaterMaterial.ts         # TSL node material
    │   ├── sharedOptics.ts          # Gem 5: ONE FILE for ALL water optics
    │   ├── Sky.ts                   # R03: Procedural sky dome
    │   └── DebugViews.ts            # R04: Fullscreen debug overlays
    │
    ├── services/
    │   ├── PassRegistry.ts          # Enable/disable/cost tracking
    │   ├── ResourcePool.ts          # Pre-allocate ALL textures + buffers
    │   └── Governor.ts              # Degrade ladder, restore, hysteresis
    │
    ├── ui/
    │   ├── Controls.tsx             # Leva control panels
    │   ├── PerfHUD.tsx              # Performance overlay
    │   └── DebugOverlay.tsx         # Debug view selector
    │
    └── scenes/
        └── presets.ts               # Validation scene definitions
```

**Version pinning:**
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

**Vite aliases (required):**
```typescript
resolve: {
    alias: {
        'three/webgpu': 'three/build/three.webgpu.js',
        'three/tsl': 'three/build/three.tsl.js',
    }
}
```

---

# Appendix C — Physics & Equations Reference

| Category | Equation | Formula |
|----------|----------|---------|
| **Dispersion** | Deep-water | ω² = gk; c = √(g/k) |
| | Finite depth | ω² = gk·tanh(kd) |
| | Capillary-gravity | ω² = gk + (σ/ρ)k³ |
| **Gerstner** | Q parameter | Q = min(choppiness/(k·A·N), 1.0) |
| | Steepness | S = Σ kᵢAᵢQᵢ\|cos θᵢ\| |
| | Curvature | κ = −Σ kᵢ²Aᵢ sin θᵢ |
| **Spectral** | JONSWAP density | S(ω) = (αg²/ω⁵)·exp(−5/4·(ωp/ω)⁴)·γʳ |
| | Enhancement | r = exp(−(ω−ωp)²/(2σ²ωp²)) |
| | Spreading | D(θ) ∝ cos²ˢ(θ/2); s = 6–16 |
| | PM peak | ωp = g/(1.026·U₁₀) |
| **Breakup** | Weber number | We = ρ·v²·L/σ |
| | Sheet crit | We_crit ~ 12 |
| | Ligament crit | We_crit ~ 40 (Rayleigh-Plateau) |
| | Iribarren | ξ = tan(β)/√(H/L) |
| **Optics** | Fresnel (Schlick) | F = F₀ + (1−F₀)(1−N·V)⁵; F₀ ≈ 0.02 |
| | Beer-Lambert | I = I₀·exp(−α·d) |
| **Coverage** | Monahan whitecap | W = 3.84×10⁻⁶·U₁₀^3.41 |
| **Drag** | Sphere | F = −0.5·ρ_air·C_d·A·\|v\|·v; C_d = 0.44 |

---

# Appendix D — Leva Control Panel

```
Presets       │ scene: [cinematic-breaker, mid-storm, far-horizon]
Ocean         │ windSpeed [1,25], windDirection [-π,π], choppiness [0.1,3],
              │ waveCount [8,48], tileSize [50,500], seed [0,9999]
Breakers      │ enableBreakers, crestThreshold [0.1,1.5], maxParticles [8K-64K]
Ride Window   │ rideDuration [0.1,2], kAttach [50,500], comoveGain [5,50],
              │ liftGain [1,20], dampCoeff [2,50], detachDist [0.05,1],
              │ kappaLiftThresh [0.5,5], kappaDetachThresh [0,1], crestBoost [0.1,1]
Phase Trans.  │ enablePhaseTransitions, weCritSheet [0.1,2],
              │ weCritLigament [10,100], ligamentDuration [0.2,3], dropletJitter [0,2]
Foam          │ enableFoam, foamInjectGain [0,2], foamDecayYoung [0.5,5],
              │ foamDecayOld [2,15]
Coupling      │ enableCoupling (DEFAULT OFF), feedbackGain [0,1], impactGain [0.001,0.1]
Debug         │ debugView [none/height/normal/crest/steep/foam/phase/ride-timer],
              │ showPerfHUD, timeScale [0.1,2]
```

---

# Appendix E — Glossary

| Term | Definition |
|------|------------|
| **Genesis** | Particle spawn with position ON wave surface + velocity inherited from wave (Gates 2.5, 2.6) |
| **Ride Window** | RIDING phase: F_attach + F_comove + F_lift forces track particle to crest. Gate 2.7. |
| **rideAlpha** | `1 − age/rideDuration`. Linear decay of ride forces over time. |
| **Crest Mask** | P02 output: .x = break intensity. Particles sample to respawn (C5: atomic-free). |
| **Ping-Pong** | Double-buffer: read A → write B; next frame read B → write A (C6). |
| **Zero-Copy** | Same GPU buffer for compute write and vertex read (C7). StorageBufferAttribute. |
| **Shared Optics** | `sharedOptics.ts` — one file for ocean + spray. Seam killer. Gem 5. |
| **Gated** | Feature disabled until specific gate passes. P05 gated until Gate 3.1. |
| **Governor** | Frame-time-based quality degradation with ordered degrade ladder and reverse restore. |
| **One Water** | No visible seam between ocean mesh and spray. The goal of the Orbit Test. |
| **Tuning in the Dark** | Adjusting gains when Genesis input is wrong. C10 prevents this. |
| **FEEDBACK_ELIGIBLE** | Sentinel flag when particle re-enters surface; triggers coupling write if P05 enabled. |
| **Gem** | GPT 5.2 term for a load-bearing insight with outsized build-risk reduction. |
| **η** | Surface elevation. **η̇** = ∂η/∂t = vertical velocity. |
| **κ** | Surface curvature. Drives lift force and plunge detection. |
| **We** | Weber number: ρ·v²·L/σ. Sheet/ligament breakup criterion. |
| **ξ** | Iribarren number: tan(β)/√(H/L). Classifies break type. |
| **S** | Local steepness: Σ k·A·Q·\|cos θ\|. ≥1 indicates breaking. |
| **TSL** | Three.js Shading Language — node-based shader authoring. |
| **WGSL** | WebGPU Shading Language — the underlying shader language. |
| **EMA** | Exponential moving average — crest temporal stability (V6). |

---

# Appendix F — Provenance & Decision Log

## F.1 Architecture Spine

| Source | Contribution |
|--------|-------------|
| **V8** | Gates, definitions of done, build order, pass contracts (BASE) |
| **V6** | Physics corrections, stability patterns, Weber fix, EMA crest, MLS-MPM spec |
| **V9** | Implementation gotchas: manual bilinear, governor bugs, depth compositing |
| **V2** | Performance budget, sprint schedule, time/cost realism |
| **V7** | Scope exclusions (Gem 6), "what does NOT belong" |
| **GPT 5.2** | Contradiction resolution, velocity packing fix, R3F correction, tier ranking |

## F.2 Tier Ranking (GPT 5.2)

| Tier | Versions | Value |
|------|----------|-------|
| **A (Core)** | V8, V6, V9, V2 | Orchestration, physics, gotchas, realism |
| **B (Guard)** | V7 | Scope discipline |
| **C (Subsumed)** | V1, V3, V4, V5 | Alternate wording; covered by Tier A |

## F.3 Key Decisions

| Decision | Chosen | Rejected | Rationale |
|----------|--------|----------|-----------|
| Day 1 wave model | Gerstner | FFT | Single dispatch; FFT = Phase 2 |
| Crest spawn | Mask texture | Atomic append | C5: TSL constrains atomics |
| Foam buffering | Ping-pong A↔B | Single buffer | C6: Nondeterminism prevention |
| Particle render | Instanced quads | Point sprites | C9: gl_PointSize unreliable |
| React integration | Approach B (Day 1) | R3F only | C8: Maximum control early |
| Coupling default | Gated, off | Always on | C10: Runaway risk |
| WebGL2 fallback | Separate WebGLRenderer | forceWebGL | C2: Cross-API overhead |
| C10 definition | Genesis ordering | Shared optics (V7) | Genesis prevents tuning in dark |
| Weber formula | ρ·v²·L/σ (V6) | vel²×thickness | Dimensionally correct |
| SSF for Gate 3.0 | Post-Gate 4.0 | Required for 3.0 | Billboards pass Orbit at 5 m |

## F.4 v3.0 Corrections Applied

| Fix | Issue | Resolution |
|-----|-------|------------|
| 1 | velocityTex drops vel.z | Store (vel.x, vel.z, κ, 0) |
| 2 | R3F async gl not documented | Two valid approaches documented |
| 3 | forceWebGL used | Separate WebGLRenderer required |
| 4 | V6 EMA crest missing | Adopted: ping-pong + EMA + smoothing |
| 5 | Weber dimensionally wrong | V6 correction: We = ρ·v²·L/σ |
| 6 | Manual bilinear not elevated | Gem 4, dedicated file, checklist item |
| 7 | Governor restore order unspecified | Reverse degrade, hysteresis |

## F.5 The Six Gems (GPT 5.2 — Preserved)

| Gem | Insight | Where Applied |
|-----|---------|---------------|
| **1** | Ride window is the critical realism gate | §VII.4, Sprint 1 |
| **2** | Crest detection must be temporally stable and atomic-free | §VI.2, V6 EMA |
| **3** | Coupling feedback must be runaway-safe by design | §IX.3, Triple Safety |
| **4** | Compute shaders need manual bilinear sampling | §VII.3, bilinearHelper.ts |
| **5** | Shared optics is the seam killer | §VIII.1, sharedOptics.ts |
| **6** | Scope guardrails prevent the project from eating itself | §XV, exclusion list |

---

> *This document is the single source of truth for the ProFlow HyperReal Ocean system. All implementation decisions defer to this spec. All visual decisions defer to Braden. WebGPU is the engine. The crest becomes a sheet. The sheet remembers it was water.*
>
> ***One water.***