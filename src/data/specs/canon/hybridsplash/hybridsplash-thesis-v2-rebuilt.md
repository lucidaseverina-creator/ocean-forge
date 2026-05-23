# Hybrid MLS-MPM Fluid Surface and Breakup Architecture

## Canonical Thesis Rebuild v2.0

**Rebuilt title:** *One Water, Many Surface Truths: A Browser-Feasible Hybrid MLS-MPM Architecture for Calm-Sheet Reconstruction, Rolling-Wave Continuity, Filament Breakup, Droplet Hierarchy, and Reabsorption*

**Source:** `hybridsplash-thesis.txt`  
**Rebuild date:** 2026-05-22  
**Document type:** Canonical technical thesis, implementation blueprint, validation doctrine, and phase-gated roadmap  
**Target runtime family:** Browser fluid lab / Cosmos water engine; WebGPU-first where available, with a separately authored WebGL2 fallback path where required  
**Prime implementation posture:** Preserve solver truth, separate representational regimes, prove visual quality with accepted scene captures, and make every stage debuggable before adding complexity.

---

## Executive Position

This thesis is correct in its core insight: a physically coherent particle body can still look wrong if its visible surface inherits the wrong support primitive. The surface failure is not merely insufficient smoothing. It is a regime-classification failure.

A browser fluid engine aiming for persuasive water cannot rely on one universal particle-rendering rule. It needs a layered architecture:

1. **Primary truth layer** — mass, momentum, density, and deformation are carried by the MLS-MPM or APIC/MPM-like primary solver.
2. **Surface intelligence layer** — exposure, coherence, sheetness, rollingness, elongation, thinning, envelope validity, and breakup instability are derived as continuous fields.
3. **Envelope layer** — calm and coherent rolling water are reconstructed by a locally valid top-envelope or sheet-space reconstruction that suppresses particle lobes without destroying ripple or wave relief.
4. **Breakup hierarchy layer** — unstable exposed regions graduate into proto-filaments, ligaments, bead chains, droplets, and mist through a staged state machine.
5. **Reunion layer** — detached fragments reabsorb or couple back into the coherent water through merge-back and surface-disturbance deposition rather than persisting as immortal spray.
6. **Validation and authoring layer** — debug views, counters, snapshots, visual proof scenes, and artist-facing macro controls make the system tunable without turning it into slider chaos.

The v2 rebuild below turns the original thesis into a stricter engineering document. It keeps the best concepts, removes ambiguity where it would sabotage implementation, and adds missing gates, contracts, state ownership, buffer discipline, validation criteria, and phase order.

---

## Non-Negotiable Invariants

These invariants define whether the system remains itself under pressure.

| ID | Invariant | Practical meaning |
|---:|---|---|
| I-01 | **One water, layered representation** | The engine may use multiple representations, but they must serve one coherent water identity. |
| I-02 | **Solver truth is not visual truth** | The primary solver carries physical continuity; the renderer must not blindly expose particle support geometry. |
| I-03 | **Calm anti-lump law** | Calm exposed water must not read as a bed of blended spheres. |
| I-04 | **Envelope honesty law** | Top-envelope reconstruction is valid only where the surface is locally single-valued or acceptably sheet-like. |
| I-05 | **Progressive breakup law** | Splash breakup should move through staged visual states, not binary particle emission. |
| I-06 | **Scale hierarchy law** | Spray must contain varied radius, lifetime, drag, shape memory, and class behavior. |
| I-07 | **Reabsorption law** | Detached fragments must have a principled path back into the coherent body. |
| I-08 | **Budget law** | Every secondary population must be globally and locally bounded. |
| I-09 | **Observability law** | Every regime transition must be explainable through debug fields and counters. |
| I-10 | **Accepted visual proof law** | Browser captures prove quality only when they show meaningful renderer output, not merely overlays, panels, or debug artifacts. |

---

## Source Diagnosis

### What the original thesis gets right

The original document already contains a strong architecture. Its highest-value contributions are:

- It correctly identifies **spherical support leakage** as the root cause of lumpy calm water.
- It separates **primary mass-carrying particles** from **secondary breakup entities**.
- It defines surface regimes instead of forcing all water into one primitive.
- It introduces a lifecycle from sheet to filament to ligament to bead chain to droplet to mist.
- It treats **reabsorption** as a first-class realism loop rather than a cosmetic deletion rule.
- It proposes continuous scores, hysteresis, cooldowns, budgets, and validation tiers.
- It expands beyond shader/rendering into controls, diagnostics, state machines, performance scaling, and roadmap logic.

### Where the original thesis needed rebuilding

The source is strong but not yet implementation-safe. The main weaknesses are not conceptual; they are specification risks:

| Risk | Why it matters | Rebuild correction |
|---|---|---|
| Variable collision | `C_i` is used both for affine velocity/deformation and coherence. | Use `A_i` or `M_i` for affine/deformation; use `K_i` for coherence. |
| Too many unbound equations | Many equations define shape but not operational defaults, bands, or debug interpretation. | Add control ranges, quality bands, age filters, and stage gates. |
| Envelope validity under-specified | Top-envelope reconstruction can become dishonest near overturns, sidewalls, crowns, and branch roots. | Add ambiguity packets, candidate-count metrics, normal conflict, underside dominance, and suppression rules. |
| Mass/energy coupling unclear | Secondary droplets may become visual-only confetti unless birth, merge, and deposition are constrained. | Separate visual secondary entities from solver truth, but define optional deposition packets and conservation modes. |
| Browser execution too abstract | Buffer schemas are good but need pass contracts, fixed-capacity pools, dispatch policy, and fallback separation. | Add pass-level ownership, counters, staging buffers, and WebGPU/WebGL2 separation doctrine. |
| Validation too permissive | Captures can technically show a canvas while proving nothing about water quality. | Add accepted visual scene proof criteria and reference-scene families. |
| Roadmap lacks hard gates | Phases can advance before earlier layers are visually accepted. | Add phase gates, artifacts, metrics, debug views, and failure blockers. |
| UI controls can sabotage math | Raw variables exposed as sliders will create incoherent presets. | Add macro-control mapping, safety zones, presets, and explainability links. |

### Rebuild stance

This v2 document treats the original as a **conceptual canon** and rebuilds it into a **production research doctrine**. It does not claim the equations are complete physical laws. They are control fields for a hybrid, browser-feasible water representation. The goal is to produce convincing, stable, debuggable, phase-buildable fluid behavior.

---

# Part I — Canonical System Model

## 1. The Central Claim

A single particle representation cannot express all perceptual regimes of water.

The correct architecture is not “better particles” or “more smoothing.” The correct architecture is **regime-aware representation**:

```text
Bulk truth                -> MLS-MPM / APIC / grid-particle solver
Free-surface intelligence -> classification fields
Calm coherent water       -> top-envelope / sheet-space reconstruction
Rolling coherent water    -> relief-preserving envelope + anisotropic surface support
Cresting unstable water   -> breakup-source state
Attached breakup          -> proto-filament / ligament / bead-chain geometry
Detached breakup          -> droplet / mist populations
Return to body            -> merge-back and surface-disturbance deposition
```

The solver may remain one coherent system. The visible representation must be many cooperating systems.

## 2. The One-Water Principle

The engine must never become a pile of unrelated effects. The viewer should perceive one water body whose local behavior changes naturally with state.

The one-water principle has three consequences:

1. **Representation changes must be continuous.** A calm sheet becoming a rolling crest must not pop into a different material.
2. **Detached children must retain lifecycle identity.** Droplets are temporary children of the parent body, not independent permanent props.
3. **Merge-back must be visible and governed.** A droplet returning to water should either softly disappear into the sheet, skim, dimple, ripple, splash, or shatter according to contact conditions.

## 3. Layered Architecture

### 3.1 Primary Solver Layer

The primary solver owns:

- mass,
- momentum,
- density,
- material phase,
- grid transfers,
- boundary conditions,
- collision response,
- and the coarse truth of coherent water.

The solver should not be forced to split every particle into variable-size children just to render a convincing splash. That path creates extreme complexity in support radii, transfer weights, mass conservation, particle counts, and browser performance.

### 3.2 Surface-State Layer

The surface-state layer derives runtime fields from the primary solver:

- exposure,
- coherence,
- topness,
- restfulness,
- rollingness,
- sheetness,
- elongation,
- thinning,
- breakup instability,
- envelope validity,
- ambiguity,
- overhang pressure,
- spawn readiness,
- and merge compatibility.

This layer is the engine’s classification intelligence. It decides which representation is allowed to speak.

### 3.3 Envelope Layer

The envelope layer reconstructs coherent free-surface water while suppressing particle lobes.

It is not a global heightfield. It is a local, validity-gated reconstruction that behaves heightfield-like only when the surface is locally single-valued or sufficiently sheet-like.

It has three jobs:

1. **Calm sheet:** remove marble/lump artifacts.
2. **Rolling sheet:** preserve wave relief while maintaining surface coherence.
3. **Hand-off:** retreat gracefully when overhangs, overturns, crowns, or branches make envelope assumptions invalid.

### 3.4 Breakup Hierarchy Layer

The breakup layer owns transient structures:

- proto-filaments,
- ligaments,
- bead chains,
- macro-droplets,
- standard droplets,
- micro-droplets,
- mist,
- and reabsorbing fragments.

These entities are representational and lifecycle-driven. They may carry mass estimates, but the first implementation should treat them as bounded secondary entities rather than uncontrolled solver particles.

### 3.5 Coupling and Reabsorption Layer

The coupling layer determines what happens when detached fragments contact coherent water.

Possible outcomes:

- soft merge,
- skim,
- dimple,
- ripple deposition,
- energetic splash response,
- secondary breakup,
- violent shatter,
- or culling if the entity is below visibility importance.

### 3.6 Rendering and Composite Layer

The final render composites:

- envelope mesh or sheet texture,
- rolling relief normals,
- coherent non-envelope support,
- branch geometry,
- droplets,
- mist,
- foam/aeration cues if present,
- and debug overlays when enabled.

The composite must preserve water identity. Every layer should look optically related: shared Fresnel behavior, consistent sun direction, compatible roughness, coherent color/depth logic, and unified camera-space exposure.

## 4. Representational Regimes

| Regime | Primary owner | Rendering owner | Validity cue | Failure if wrong |
|---|---|---|---|---|
| Bulk interior | Primary solver | Usually hidden / volume contribution | Low exposure | Wasteful visible particles inside water |
| Calm sheet | Envelope | Top-envelope field | High exposure, high coherence, high restfulness | Lumpy marble water |
| Rolling sheet | Envelope + anisotropic support | Relief-preserving surface | Exposed coherent wave motion | Over-smoothed plastic sheet or fake breakup |
| Crest hazard | Surface-state layer | Transitional surface | Rising elongation/thinning | Binary splash popping |
| Breakup source | Surface-state + spawn policy | Hand-off to branches | Persistent instability | Machine-gun particles or missed splashes |
| Proto-filament | Secondary branch | Tapered attached branch | Early attached elongation | Splash lacks stretch-before-snap |
| Ligament | Secondary branch | Thin unstable thread | Thinning + attachment decay | Droplets appear from nowhere |
| Bead chain | Secondary branch | Pearl/neck structure | Necking oscillation | No scale bridge between threads and drops |
| Droplet | Secondary detached | Spheres/ellipsoids/sprites | Detached child | Uniform spray confetti |
| Mist | Secondary detached | Cheap soft sprites/points | violent tiny breakup | Over-noisy haze if uncontrolled |
| Reabsorbing | Coupling layer | Merge visual | Contact + compatibility | Permanent debris or pop-delete |

## 5. The Canonical Lifecycle

```text
P_BULK
  -> P_SHEET_CALM
  -> P_SHEET_ROLLING
  -> P_CREST_HAZARD
  -> P_BREAKUP_SOURCE
  -> S_PROTO_FILAMENT
  -> S_LIGAMENT
  -> S_BEAD_CHAIN
  -> S_DROPLET_{MACRO|STD|MICRO}
  -> S_MIST or S_REABSORBING
  -> S_DEAD / merged back into coherent body
```

The lifecycle is not strictly linear. Calm and rolling states should be reversible. Early proto-filaments may stabilize. Droplets can enter and leave reabsorbing state until merge age completes. Once fragments are detached or dead, they should not snap backward into earlier attached states without explicit merge logic.

---

# Part II — Formal Control Fields

## 6. Notation and Naming Discipline

The original thesis uses `C_i` both for the affine velocity carrier and for coherence. That collision must be removed before implementation.

Use the following canonical notation:

| Symbol | Meaning |
|---|---|
| `x_i` | position of primary particle or representative `i` |
| `v_i` | velocity |
| `A_i` | affine/APIC/MLS deformation carrier, if available |
| `rho_i` | density estimate |
| `N(i)` | local support neighborhood |
| `phi(x)` | density/support field sampled from particles or grid |
| `gradPhi(x)` | support-field gradient |
| `n_i` | estimated surface normal |
| `u` | local up vector or sheet-frame normal |
| `K_i` | coherence score; `K` is used instead of `C` |
| `E_i` | exposure score |
| `S_i` | sheetness score |
| `G_i` | rollingness score; `G` avoids conflict with radius `r` |
| `L_i` | elongation score |
| `T_i` | thinning score |
| `B_i` | effective breakup instability |
| `V_i` | envelope validity |
| `Aamb_i` | ambiguity / multi-valuedness score |
| `O_i` | overhang invalidity score |
| `M_i` | reabsorption / merge potential |

All major fields should be normalized to `[0,1]` unless explicitly stated otherwise.

### 6.1 Utility functions

```text
saturate(x) = clamp(x, 0, 1)
smooth01(a, b, x) = smooth threshold from 0 to 1 over [a, b]
ema(prev, raw, alpha) = prev * (1 - alpha) + raw * alpha
```

Use exponential moving averages or age accumulators for any field that drives state transitions.

## 7. Derived Measurements

### 7.1 Speed and motion intensity

```text
speed_i  = length(v_i)
Vn_i     = saturate((speed_i - speed0) / (speed1 - speed0))
```

Speed is useful but never sufficient for breakup. Fast coherent flow can remain rolling water; slow thin unsupported water can still be invalid for envelope treatment.

### 7.2 Vertical or normal aggression

For world-up or local sheet-frame normal `u`:

```text
Up_i = saturate((max(0, dot(v_i, u)) - up0) / (up1 - up0))
```

High `Up_i` indicates ejection, cresting, or ballistic lift. For arbitrary local frames, replace world up with the local surface normal or signed outward free-surface normal.

### 7.3 Local strain/deformation

If `A_i` is available:

```text
D_i      = 0.5 * (A_i + transpose(A_i))
strain_i = frobenius_norm(D_i)
Dn_i     = saturate((strain_i - strain0) / (strain1 - strain0))
```

If no affine carrier exists, approximate strain from neighbor velocity gradients or grid velocity differences.

### 7.4 Support and burial

```text
support_i = sum_{j in N(i)} w_ij
supportN_i = saturate((support_i - support0) / (support1 - support0))
```

High support implies buried or coherent material. Low support implies exposure, edge, thinning, or isolation.

### 7.5 Surface normal and topness

```text
n_i = -normalize(gradPhi(x_i) + eps)
top_i = saturate(dot(n_i, u))
```

`top_i` is a top-facing bias, not a complete exposure test. Side sheets and overhangs can be exposed but not top-envelope-valid.

### 7.6 Anisotropy

From local covariance eigenvalues `lambda1 >= lambda2 >= lambda3`:

```text
An_i = saturate((lambda1 - lambda2) / (lambda1 + eps))
```

High anisotropy suggests trail, branch, elongated sheet, or filament structure.

### 7.7 Thickness / narrowness

Thickness may be estimated from support covariance, density-grid column depth, local envelope thickness, or branch radius.

```text
thinRaw_i = 1 - saturate((thick_i - thick0) / (thick1 - thick0))
T_i       = temporal_filter(thinRaw_i)
```

Use temporal filtering to avoid one-frame false thinning.

## 8. Exposure Field

Exposure answers: **is this region meaningfully free-surface?**

```text
E_support_i = 1 - supportN_i
E_top_i     = top_i
E_density_i = 1 - saturate((rho_i - rho_surface0) / (rho_surface1 - rho_surface0))

E_raw_i = saturate(wEs * E_support_i + wEt * E_top_i + wEr * E_density_i)
E_i     = ema(E_i_prev, E_raw_i, alphaE)
```

### Interpretation

| `E_i` band | Meaning |
|---:|---|
| 0.00–0.20 | buried interior |
| 0.20–0.45 | near-surface but not exposed enough for direct surface authority |
| 0.45–0.75 | free-surface candidate |
| 0.75–1.00 | strong exposed surface |

Exposure is a gatekeeper. Low-exposure regions must not spawn breakup or dominate the visible envelope.

## 9. Coherence Field

Coherence answers: **does this local region still behave as part of the coherent water body?**

```text
K_support_i = supportN_i
K_density_i = saturate((rho_i - rho0) / (rho1 - rho0))
K_velocity_i = average_j alignment(v_i, v_j)

alignment(a,b) = 0.5 * (1 + dot(normalizeSafe(a), normalizeSafe(b)))

K_raw_i = saturate(wKs*K_support_i + wKr*K_density_i + wKv*K_velocity_i)
K_i     = ema(K_i_prev, K_raw_i, alphaK)
```

### Interpretation

| `K_i` band | Meaning |
|---:|---|
| 0.00–0.25 | isolated / detached / mist-like |
| 0.25–0.55 | weakly coherent branch or fragment |
| 0.55–0.80 | coherent but potentially unstable crest/ligament source |
| 0.80–1.00 | strong sheet or bulk continuity |

Calm exposed water has high `E_i` and high `K_i`. Detached droplets have high exposure but low parent-body coherence.

## 10. Restfulness, Sheetness, and Rollingness

### 10.1 Restfulness

```text
R_i = (1 - Vn_i)^pV * (1 - Dn_i)^pD * (1 - Up_i)^pU
```

High restfulness means calm-sheet logic is allowed. Restfulness should not erase small ripple motion; it suppresses only aggressive motion and deformation.

### 10.2 Sheetness

```text
S_raw_i = E_i^qE * K_i^qK * R_i^qR * top_i^qT * (1 - O_i)^qO
S_i     = ema(S_i_prev, S_raw_i, alphaS)
```

Sheetness is high for exposed, coherent, calm, top-facing, non-overhung water.

### 10.3 Rollingness

```text
G_raw_i = E_i^rE * K_i^rK * Vn_i^rV * (1 - Up_i)^rU * (1 - B_i)^rB * (1 - O_i)^rO
G_i     = ema(G_i_prev, G_raw_i, alphaG)
```

Rollingness is high for exposed, coherent, active water that has not yet crossed into breakup.

### 10.4 Wave validity

```text
W_i = E_i * K_i * (1 - Up_i) * (1 - B_i) * (1 - O_i)
```

`W_i` is the broad permission signal for coherent wave-surface treatment.

## 11. Elongation and Thinning

### 11.1 Elongation

```text
L_raw_i = saturate(wLv*Vn_i + wLd*Dn_i + wLa*An_i + wLu*Up_i)
L_i     = ema(L_i_prev, L_raw_i, alphaL)
```

High elongation suggests that the region is becoming branch-like, trail-like, or filament-prone.

### 11.2 Thinning age

```text
ThinAge_i += dt * (kTin * max(0, T_i - T_enter) - kTout * ThinAge_i)
ThinAge_i = max(0, ThinAge_i)
```

Thinning should have persistence. A single noisy thin frame must not detach a droplet.

## 12. Breakup Instability

Breakup should require multiple kinds of evidence. The multiplicative form is valuable because it suppresses false positives.

```text
Binst_i = E_i^bE * L_i^bL * T_i^bT * (1 - K_i)^bK * Up_i^bU
```

However, strict multiplication can over-suppress desirable crest breakup when coherence remains high. Use a blended variant:

```text
Bsupport_i = E_i * L_i * T_i
Bmotion_i  = saturate(wBu*Up_i + wBd*Dn_i + wBv*Vn_i)
Bcoh_i     = saturate((1 - K_i) + kCrest * crestHazard_i)

Binst_i = saturate(Bsupport_i^a * Bmotion_i^b * Bcoh_i^c)
```

Then integrate:

```text
BreakAge_i += dt * (kBin * max(0, Binst_i - B_enter) - kBout * BreakAge_i)
BreakAge_i = max(0, BreakAge_i)
B_i = saturate(mB * Binst_i + nB * BreakAge_i)
```

### 12.1 Crest hazard

A coherent crest may need breakup potential before coherence collapses. Add:

```text
crestHazard_i = E_i * K_i * L_i * T_i * smooth01(upC0, upC1, Up_i)
```

This allows attached stretching before visible fragmentation.

## 13. Envelope Validity and Honesty

Envelope validity answers: **is it honest to reconstruct this region as a top sheet?**

```text
Vraw_i = saturate(
    wVs*S_i +
    wVg*G_i +
    wVw*W_i -
    wVb*B_i -
    wVo*O_i -
    wVa*Aamb_i
)

V_i = ema(V_i_prev, Vraw_i, alphaV)
```

### 13.1 Ambiguity score

Ambiguity measures whether a local column/ray/support neighborhood contains multiple plausible surface candidates.

```text
Aamb_i = saturate(
    wAc*candidateCountConflict_i +
    wAn*normalConflict_i +
    wAu*undersideDominance_i +
    wAi*verticalInversion_i
)
```

### 13.2 Overhang score

```text
O_i = saturate(
    wOn*normalConflict_i +
    wOu*undersideDominance_i +
    wOv*verticalInversion_i +
    wOc*curlConflict_i
)
```

High overhang should suppress envelope smoothing and route the region toward coherent non-envelope support or breakup geometry.

## 14. Proto-Filament Potential

```text
Pproto_i = E_i^pE * L_i^pL * T_i^pT * (1 - S_i)^pS * saturate((B_i - Bproto0) / (Bproto1 - Bproto0))
```

A region becomes a spawn candidate only if:

```text
Pproto_i > Pproto_enter
BreakAge_i > BreakAge_spawn
spawnCooldown_i <= 0
localChildren_i < maxLocalChildren
frameBudgetAvailable == true
```

## 15. Merge/Reabsorption Potential

For a detached fragment `f` at `x_f`:

```text
v_bulk = sampleCoherentVelocity(x_f)
phi_f  = sampleDensityOrSupport(x_f)
dv_f   = length(v_f - v_bulk)

Umerge_f = 1 - saturate((dv_f - u0) / (u1 - u0))
Kmerge_f = saturate((phi_f - phi0) / (phi1 - phi0))
Zmerge_f = saturate((-dot(v_f, u) - z0) / (z1 - z0))

M_f = Kmerge_f^mK * Umerge_f^mU * (mergeBias + Zmerge_f)^mZ
```

Then:

```text
MergeAge_f += dt * (kMin * max(0, M_f - M_enter) - kMout * MergeAge_f)
```

A fragment merges when `MergeAge_f > MergeAge_required`. This prevents ugly pop-deletes on first contact.

---

# Part III — Runtime State Machines

## 16. Primary State Domain

Use explicit primary states with flags. Avoid a single ambiguous enum when multiple facts need to coexist.

```text
P_BULK
P_SURFACE_CANDIDATE
P_SHEET_CALM
P_SHEET_ROLLING
P_CREST_HAZARD
P_BREAKUP_SOURCE
```

### 16.1 Primary state definitions

| State | Meaning | Enter evidence | Exit evidence |
|---|---|---|---|
| `P_BULK` | buried or non-visible coherent fluid | `E < E_bulk_exit` | `E > E_surface_enter` |
| `P_SURFACE_CANDIDATE` | near free surface but unresolved regime | moderate `E`, uncertain `V` | classify into sheet, rolling, hazard, or bulk |
| `P_SHEET_CALM` | exposed coherent calm water | high `S`, high `V`, low `B` | rolling, hazard, breakup, or bulk evidence |
| `P_SHEET_ROLLING` | coherent active wave skin | high `G`, high `W`, low `B` | rest recovery or crest/breakup evidence |
| `P_CREST_HAZARD` | coherent but stretch/thin/ejection rising | high `L`, `T`, `Up`, but not detached | recovery or `P_BREAKUP_SOURCE` |
| `P_BREAKUP_SOURCE` | eligible parent for secondary branches | persistent `B`, `Pproto`, budget permission | recovery, burial, or cooldown |

### 16.2 Primary transition table

| Transition | Enter rule | Persistence | Special guard |
|---|---|---:|---|
| `P_BULK -> P_SURFACE_CANDIDATE` | `E > E_surface_enter` | `t_surface_enter` | Must not be a transient density hole. |
| `P_SURFACE_CANDIDATE -> P_SHEET_CALM` | `S > S_enter`, `V > V_enter`, `B < B_sheet_cap` | `t_sheet_enter` | `Aamb` and `O` below cap. |
| `P_SHEET_CALM -> P_SHEET_ROLLING` | `G > G_enter`, `Vn > speed_roll_enter`, `B < B_roll_cap` | `t_roll_enter` | Preserve envelope; reduce flattening. |
| `P_SHEET_ROLLING -> P_SHEET_CALM` | `R > R_recover`, `G < G_exit` | `t_calm_recover` | No active crest latch. |
| `P_SHEET_ROLLING -> P_CREST_HAZARD` | `crestHazard > crest_enter` | `t_crest_enter` | Do not spawn yet. |
| `P_CREST_HAZARD -> P_BREAKUP_SOURCE` | `B > B_break_enter`, `BreakAge > BreakAge_enter`, `Pproto > Pproto_enter` | `t_break_enter` | Spawn budget and cooldown apply. |
| `P_CREST_HAZARD -> P_SHEET_ROLLING` | `B < B_break_exit`, `L < L_exit`, `T < T_exit` | `t_hazard_recover` | No spawned children. |
| `P_SHEET_CALM -> P_BREAKUP_SOURCE` | impact latch + `B > B_direct` | short latch | Rare direct path for violent impulse. |
| `P_BREAKUP_SOURCE -> P_SHEET_ROLLING` | `B < B_recover`, `K > K_recover`, no spawn latch | `t_break_recover` | Only if fragmentation did not commit. |
| `Any primary -> P_BULK` | `E < E_bulk_return` | `t_bulk_return` | Burial/recontact with dense fluid. |

## 17. Secondary State Domain

```text
S_PROTO_FILAMENT
S_LIGAMENT
S_BEAD_CHAIN
S_DROPLET_MACRO
S_DROPLET_STD
S_DROPLET_MICRO
S_MIST
S_REABSORBING
S_DEAD
```

### 17.1 Secondary transition table

| Transition | Rule | Reversible? |
|---|---|---|
| spawn -> `S_PROTO_FILAMENT` | `P_BREAKUP_SOURCE` candidate wins budget ranking | no; spawn created |
| `S_PROTO_FILAMENT -> S_LIGAMENT` | thickness below ligament band, instability high, age mature | yes, early only |
| `S_LIGAMENT -> S_BEAD_CHAIN` | necking age and bead readiness high | weakly, before detachment |
| `S_LIGAMENT -> S_DROPLET_*` | direct snap: severe thinning/low attachment/high impulse | no |
| `S_BEAD_CHAIN -> S_DROPLET_*` | local bead detachment readiness wins spawn | parent may persist |
| `S_DROPLET_MICRO -> S_MIST` | small radius + high instability or impact energy | no, usually |
| `S_DROPLET_* -> S_REABSORBING` | merge potential above threshold | yes, before merge age complete |
| `S_REABSORBING -> S_DEAD` | merge age complete | no |
| any secondary -> `S_DEAD` | lifetime, visibility, bounds, budget culling | no |

### 17.2 Secondary entity records

```text
SecondaryFilament
- id                : uint
- stateFlags        : uint
- parentId          : uint
- chainId           : uint
- position          : vec3
- velocity          : vec3
- tangent           : vec3
- normal            : vec3
- thickness         : float
- rootThickness     : float
- tipThickness      : float
- age               : float
- lifetime          : float
- instability       : float
- thinning          : float
- necking           : float
- attachment        : float
- detachCooldown    : float
- alive             : uint
```

```text
SecondaryDroplet
- id                : uint
- stateFlags        : uint
- parentId          : uint
- position          : vec3
- velocity          : vec3
- radius            : float
- age               : float
- lifetime          : float
- drag              : float
- wetness           : float
- mergePotential    : float
- mergeAge          : float
- visualStretch     : float
- impactEnergy      : float
- alive             : uint
```

```text
SecondaryMist
- id                : uint
- stateFlags        : uint
- parentId          : uint
- position          : vec3
- velocity          : vec3
- scale             : float
- age               : float
- lifetime          : float
- opacity           : float
- drag              : float
- alive             : uint
```

## 18. Hysteresis Doctrine

Every transition that can flicker must use:

- separate enter/exit thresholds,
- temporal persistence,
- optional cooldown,
- optional latch for impacts or detachment,
- and debug-readable reason codes.

### 18.1 Generic transition primitive

```text
if state != target:
    age_enter += dt if score > enterThreshold else -decay * dt
    if age_enter > requiredAge:
        enter target
else:
    age_exit += dt if score < exitThreshold else -decay * dt
    if age_exit > requiredExitAge:
        exit target
```

### 18.2 Required accumulators

| Accumulator | Purpose |
|---|---|
| `SurfaceAge` | prevents surface/bulk flicker |
| `SheetAge` | stabilizes calm envelope entry |
| `RollAge` | stabilizes rolling classification |
| `CrestAge` | distinguishes real crest hazard from one-frame wave noise |
| `BreakAge` | prevents instant breakup |
| `ThinAge` | confirms persistent thinning |
| `NeckAge` | confirms bead-chain onset |
| `DetachAge` | prevents one-frame droplet detachment |
| `MergeAge` | prevents pop-delete on contact |

## 19. Spawn Budgets and Priority

The breakup system must never be allowed to grow from “beautiful water detail” into an uncontrolled particle factory.

### 19.1 Budget groups

| Budget | Meaning |
|---|---|
| `maxProtoPerFrame` | new attached branches per frame |
| `maxFilamentsActive` | active proto/ligament/bead carriers |
| `maxDropletsPerFrame` | droplet birth cap |
| `maxDropletsActive` | active droplet cap |
| `maxMistPerFrame` | mist spawn cap |
| `maxMistActive` | mist active cap |
| `maxLocalChildrenPerSource` | prevents one crest from dominating all budget |
| `maxSourceCooldown` | minimum time before same parent spawns again |

### 19.2 Candidate ranking

```text
SpawnPriority_i =
    wB * B_i +
    wE * E_i +
    wL * L_i +
    wT * T_i +
    wV * viewImportance_i +
    wI * impactLatch_i -
    wC * localChildPressure_i
```

Candidates are sorted or bucketed by priority. The highest-value events receive budget first.

### 19.3 Rejection reasons

Every rejected spawn candidate should write a compact reason code when diagnostics are enabled:

```text
REJECT_LOW_EXPOSURE
REJECT_LOW_BREAKAGE
REJECT_LOW_THINNING
REJECT_COOLDOWN
REJECT_LOCAL_CHILD_CAP
REJECT_GLOBAL_BUDGET
REJECT_ENVELOPE_STILL_VALID
REJECT_DEBUG_DISABLED
```

This matters because tuning without rejection reasons becomes guesswork.

---

# Part IV — Envelope Reconstruction

## 20. Envelope Thesis

The envelope exists to solve the calm-surface failure without destroying the ability to represent rolling waves and breakup.

It must do four things:

1. Identify where top-envelope reconstruction is valid.
2. Extract a stable surface candidate.
3. Smooth away particle-lobe support artifacts.
4. Preserve legitimate ripple, wave relief, and breakup hand-off.

The envelope must never pretend that overturning, multi-layer, or detached geometry is a simple heightfield.

## 21. Extraction Domains

The system can implement envelope extraction in several domains. Each has trade-offs.

| Domain | Strength | Weakness | Recommended use |
|---|---|---|---|
| 2.5D sheet-space grid | Simple, fast, good for calm pools | Fails at overhangs and multiple layers | Phase A / calm validation |
| Local projected atlas | Can follow patches | More complex frame management | Rolling sheet and local basins |
| 3D density volume | Handles complex support fields | More expensive | Higher-tier extraction and reabsorption |
| Screen-space depth filter | Fast visual smoothing | View-dependent, less truthful | Optional render smoothing, not primary truth |
| Hybrid extraction packet | Combines top height, confidence, thickness, invalidity | Requires more diagnostics | Canonical v2 target |

## 22. Canonical Envelope Packet

```text
EnvelopeCell
- topHeight             : float
- lowerHeight           : float
- thickness             : float
- confidence            : float
- calmWeight            : float
- rollingWeight         : float
- smoothingAuthority    : float
- ripplePreserveWeight  : float
- reliefPreserveWeight  : float
- ambiguity             : float
- overhang              : float
- candidateCount        : uint
- sourceId              : uint
- normal                : vec3
- tangentMajor          : vec3
- tangentMinor          : vec3
```

The envelope packet is not only geometry. It is a truth packet explaining why the geometry is allowed.

## 23. Extraction Pipeline

### 23.1 Stage A — Accumulate support

Accumulate density/support into the envelope domain from primary particles or grid cells.

Outputs:

- support field,
- candidate surface values,
- source IDs,
- contribution weights,
- approximate normals.

### 23.2 Stage B — Candidate detection

For each envelope column/cell, find plausible top candidates.

Candidate families:

- maximum top-facing support,
- upper density crossing,
- weighted top quantile,
- normal-compatible candidate,
- previous-frame temporally compatible candidate.

### 23.3 Stage C — Ambiguity detection

Detect whether multiple candidates compete.

Signals:

- multiple density crossings,
- wide vertical support spread,
- conflicting normals,
- underside dominance,
- candidate jump from previous frame,
- abrupt source-ID discontinuity.

### 23.4 Stage D — Confidence assembly

```text
confidence = saturate(
    wE * exposureConfidence +
    wK * coherenceConfidence +
    wN * normalConfidence +
    wT * temporalConfidence -
    wA * ambiguity -
    wO * overhang
)
```

### 23.5 Stage E — Regime-aware filtering

Apply smoothing according to calm/rolling/envelope validity.

- Calm sheet: strong anti-lump filtering.
- Rolling sheet: directional, relief-preserving filtering.
- Crest hazard: limited filtering; preserve hand-off details.
- Breakup source: suppress envelope authority.

### 23.6 Stage F — Output arbitration

For each region/cell, decide how much final rendering weight goes to:

- envelope surface,
- coherent non-envelope support,
- branch geometry,
- droplet/mist rendering.

## 24. Filtering Doctrine

### 24.1 What filtering must remove

- particle-lobe bumps,
- support-radius scalloping,
- isolated height spikes,
- noisy normal flicker,
- false micro-crowns,
- temporal shimmer.

### 24.2 What filtering must preserve

- authored ripples,
- solver-driven wave relief,
- crest lines,
- contact dimples,
- rolling horizon shape,
- branch roots,
- coherent directional flow cues.

### 24.3 Filter weight form

```text
W(p,q) = Wspatial(p,q) * Wnormal(p,q) * Wheight(p,q) * Wregime(p,q) * Wconfidence(q)
```

Where:

- `Wspatial` limits neighborhood,
- `Wnormal` avoids smoothing across folds,
- `Wheight` avoids blending unrelated layers,
- `Wregime` respects calm/rolling/breakup classification,
- `Wconfidence` avoids trusting weak envelope cells.

### 24.4 Calm filtering

```text
smoothAuthority_calm = S_i * V_i * confidence * (1 - rippleProtect)
```

Calm filtering should be aggressive enough to destroy marble support, but not so aggressive that the water becomes a dead plastic plane.

### 24.5 Rolling filtering

Rolling filtering uses anisotropic directionality:

- smooth more along coherent flow/crest tangent,
- smooth less across crest lines,
- preserve relief amplitude under rolling authority,
- reduce flattening near crest hazard.

### 24.6 Temporal filtering

Use temporal filtering only with confidence and invalidity checks.

```text
height_t = mix(height_raw, height_prev_reprojected, temporalWeight)
```

Suppress temporal reuse when:

- candidate count changes sharply,
- overhang rises,
- source ID changes too much,
- camera-independent surface state diverges,
- or a valid breakup hand-off begins.

## 25. Envelope Arbitration

Final surface contribution weights:

```text
W_env    = V_i * confidence * (S_i + kRoll * G_i) * (1 - B_i)
W_branch = B_i * branchPresence * (1 - V_i)
W_support = coherentNonEnvelopeWeight
W_spray  = detachedPresence
```

Normalize:

```text
sumW = W_env + W_branch + W_support + W_spray + eps
W_envN = W_env / sumW
...
```

### 25.1 Dominant bands

| Band | Meaning | Behavior |
|---|---|---|
| Envelope-dominant | `V` high, `B` low | render smooth sheet/rolling envelope |
| Shared | `V` medium, hazard rising | blend envelope and support/branch roots |
| Envelope-suppressed | `O`/`Aamb`/`B` high | route to non-envelope or breakup geometry |

## 26. Envelope Failure Modes

| Failure | Cause | Required diagnostic |
|---|---|---|
| Calm still marbly | smoothing too weak or envelope confidence too low | lobe metric, calm sheet heatmap |
| Plastic flat water | smoothing too strong, ripple preservation too low | ripple retention metric |
| Rolling relief destroyed | calm filter used in rolling state | rolling/calm state overlay |
| Overhang smeared into sheet | invalidity missing | ambiguity/overhang overlay |
| Branch roots disappear | envelope too dominant near breakup | branch root arbitration debug |
| Temporal shimmer | unstable candidate selection | candidate ID history / temporal confidence |

---

# Part V — Breakup Geometry and Detached Lifecycle

## 27. Branch Geometry Thesis

A believable splash must stretch before it snaps.

The branch system represents the intermediate world between coherent sheet and detached droplets. It should be visually continuous, temporally staged, and geometrically legible.

## 28. Branch Skeleton

A branch is represented by a short skeleton with one or more segments.

```text
BranchNode
- position
- velocity
- tangent
- radius
- age
- instability
- attachment
- necking
- parentId
```

A proto-filament may begin as two or three nodes. A ligament or bead-chain may require a small chain of nodes. Keep chain counts fixed or tightly capped in browser execution.

## 29. Tangent Frame

The tangent should be initialized from the best available signal:

1. local velocity direction,
2. covariance major axis,
3. crest tangent / flow direction,
4. previous-frame branch direction,
5. fallback to normal-ejection direction.

The branch frame must be stable. Tangent flicker will make ligaments crawl or snap visually.

## 30. Radius and Taper Law

A branch should taper from root to tip.

```text
r(s) = mix(r_root, r_tip, taperCurve(s))
```

Where `s` is normalized along-branch coordinate.

Taper should respond to:

- age,
- instability,
- thinning,
- attachment,
- parent support,
- and detachment history.

## 31. Necking

Necking is the bridge from ligament to bead-chain.

A cheap phenomenological necking signal:

```text
neck = saturate(
    wI * instability +
    wA * (1 - attachment) +
    wR * inverseRadius +
    wAge * age +
    wOsc * radiusOscillation
)
```

A bead-chain state begins when:

```text
neck > neck_enter
NeckAge > NeckAge_required
attachment < attach_bead_cap
```

## 32. Bead Node Synthesis

Beads may be synthesized along a ligament using a radius modulation:

```text
r_bead(s) = r_base(s) * (1 + beadAmp * sin(2*pi*beadFreq*s + phase))
```

But this is only valid if the modulation is attached to real branch maturity. Do not draw decorative beads on every line. Beads are a state, not a texture.

## 33. Detachment Mathematics

For bead candidate `m`:

```text
neckCollapse = 1 - saturate(r_neck / (r_bead + eps))
impulseReady = saturate((J_m - J0) / (J1 - J0))
attachLoss   = 1 - attachment_m
maturity     = saturate(age_m / age_detach_required)

Detach_m = saturate(
    wN * neckCollapse +
    wJ * impulseReady +
    wA * attachLoss +
    wM * maturity
)
```

Detach only when:

```text
Detach_m > Detach_enter
DetachAge_m > DetachAge_required
detachCooldown <= 0
budgetAvailable == true
```

## 34. Child Radius Distribution

Uniform droplets are forbidden.

Use a class-aware distribution:

```text
r_child = clamp(sampleLogNormal(mu, sigma), r_min, r_max)
```

Radius bands:

| Class | Radius range | Behavior |
|---|---|---|
| Macro | large relative to parent bead | visible ballistic drop; strong merge/coupling |
| Standard | mid-range | main spray body |
| Micro | small | high drag, short lifetime, may convert to mist |
| Mist | smallest | cheap, ephemeral, mostly visual |

## 35. Velocity Inheritance

Child velocity should inherit:

- parent branch velocity,
- local tangent direction,
- outward normal impulse,
- separation impulse,
- random but bounded scatter,
- and optional angular/shape memory.

```text
v_child = v_parent + kT*tangentImpulse + kN*normalImpulse + kJ*separationImpulse + jitterBounded
```

Avoid unbounded random scatter; it creates fake fireworks.

## 36. Droplet Motion

Droplets use simple browser-feasible motion:

```text
v += gravity * dt
v += dragForce(v, radius, class) * dt
x += v * dt
age += dt
```

Drag should be stronger for small droplets and mist.

```text
drag = dragBase * classDragMultiplier / max(radius, r_eps)
```

## 37. Visual Shape Memory

Fast droplets should not all be perfect static spheres. Use stretch based on velocity and class:

```text
stretch = saturate(kStretch * length(v) / max(radius, eps))
```

Render as:

- sphere/ellipsoid for macro and standard droplets,
- stretched ellipsoid or capsule for high-speed drops,
- sprite/point/soft billboard for micro and mist.

## 38. Mist Doctrine

Mist is the cheapest and most dangerous layer. It can sell violent breakup, but it can also ruin the scene with noisy haze.

Mist should be:

- sparse,
- short-lived,
- event-gated,
- budget-limited,
- biased toward high-energy small-radius events,
- and disabled or greatly reduced in low-tier profiles.

## 39. Reabsorption and Contact Outcomes

Detached fragments contacting coherent water should be classified into contact outcomes.

| Outcome | Conditions | Visual response |
|---|---|---|
| Soft merge | high `M`, low relative speed | fade/merge into sheet, optional tiny ripple |
| Skim | shallow angle, moderate speed | surface trail, small ripples, delayed merge |
| Dimple | small/medium drop, compatible entry | localized depression/ring |
| Energetic contact | higher speed/angle | stronger ripple and splash response |
| Violent shatter | high energy, low merge compatibility | secondary micro spray or mist |
| Cull | below visible threshold or out of domain | remove without dramatic effect |

## 40. Deposition Packet

When a fragment merges or impacts, it should optionally emit a deposition packet:

```text
DepositionPacket
- position
- radius
- massApprox
- momentumApprox
- energyApprox
- contactNormal
- contactClass
- rippleStrength
- dimpleStrength
- breakupPressure
- sourceDropletId
```

This packet can feed:

- envelope ripple field,
- local disturbance texture,
- primary solver impulse if coupling is enabled,
- foam/aeration markers,
- debug lineage.

## 41. Conservation Modes

Because browser execution may start with visual-only secondary entities, define explicit conservation modes.

| Mode | Description | Use |
|---|---|---|
| Visual-only | Secondary entities do not remove mass from primary solver | earliest prototypes |
| Approximate budgeted | Spawn uses visual mass budget; merge deposits approximate impulse | medium realism |
| Coupled | Detachment and reabsorption modify primary/grid fields | advanced/high tier |

Never pretend visual-only mode is fully physical. It is a legitimate stage, but it must be labeled.

---

# Part VI — GPU and Browser Pipeline

## 42. Runtime Separation Doctrine

The browser target should maintain two clean implementation families when needed:

1. **WebGPU build:** compute-first, storage-buffer-oriented, WGSL pipeline.
2. **WebGL2 fallback build:** render-to-texture / transform-feedback / ping-pong texture path where WebGPU is unavailable or not yet used.

Do not create a fragile hybrid runtime that tries to share GPU resources across WebGPU and WebGL in the same execution path. Keep the conceptual architecture shared, but author the runtime plumbing separately.

## 43. GPU Domains

| Domain | Owns |
|---|---|
| Primary solver | particles, grid, density, velocity, boundary interaction |
| Surface-state | per-primary classification fields and flags |
| Envelope | top surface candidates, confidence, filtering, normals, thickness |
| Secondary breakup | filaments, droplets, mist, counters, allocators |
| Coupling/deposition | merge contact packets, ripple/dimple inputs |
| Diagnostics | counters, heatmaps, lineage, snapshots, rejection reasons |
| Render composite | final optical water representation |

## 44. Canonical Buffer Families

### 44.1 Primary particle buffer

```text
PrimaryParticle
- position        : vec4<f32>
- velocity        : vec4<f32>
- affine0         : vec4<f32>
- affine1         : vec4<f32>
- affine2         : vec4<f32>
- density         : f32
- phaseFlags      : u32
- reserved0       : f32
- reserved1       : f32
```

### 44.2 Primary surface-state buffer

```text
PrimarySurfaceState
- stateFlags          : u32
- exposure            : f32
- coherence           : f32
- sheetness           : f32
- rollingness         : f32
- elongation          : f32
- thinning            : f32
- breakInstability    : f32
- breakAge            : f32
- thinAge             : f32
- envelopeValidity    : f32
- ambiguity           : f32
- overhang            : f32
- topness             : f32
- spawnCooldown       : f32
- parentOrCellId      : u32
```

### 44.3 Envelope grid / texture packet

```text
EnvelopeCell
- topHeight
- thickness
- confidence
- smoothingAuthority
- ripplePreserve
- reliefPreserve
- ambiguity
- overhang
- normal
- sourceId
```

### 44.4 Secondary pools

Use fixed-capacity pools first. Prefer explicit caps over unbounded append behavior.

```text
FilamentPool[maxFilaments]
DropletPool[maxDroplets]
MistPool[maxMist]
DepositionPacketPool[maxContacts]
```

### 44.5 Counter buffer

```text
PopulationCounters
- activeFilaments
- activeDroplets
- activeMist
- emittedFilamentsFrame
- emittedDropletsFrame
- emittedMistFrame
- mergedDropletsFrame
- killedFrame
- spawnRejectedBudget
- spawnRejectedCooldown
- spawnRejectedInvalidity
- envelopeCellsValid
- envelopeCellsSuppressed
```

## 45. Pass Graph

### 45.1 Canonical frame order

```text
1. Primary solver step
2. Density/support accumulation
3. Surface-state classification
4. Envelope candidate extraction
5. Ambiguity / overhang diagnostics
6. Envelope filtering and arbitration
7. Breakup-source candidate ranking
8. Proto-filament spawn
9. Secondary branch update
10. Detachment / droplet spawn
11. Droplet and mist update
12. Contact / merge / deposition
13. Counters, compaction, indirect args
14. Render composite
15. Diagnostics / snapshot capture
```

### 45.2 Pass contracts

Every pass must state:

- inputs,
- outputs,
- ownership,
- read/write hazards,
- debug counters,
- and failure conditions.

Example:

```text
Pass: Surface Classification
Inputs: PrimaryParticle, density grid, previous PrimarySurfaceState
Outputs: PrimarySurfaceState
Must not write: PrimaryParticle, secondary pools
Debug: state counts, mean fields, rejected invalid normals
Failure: NaN fields, all particles classified same state, impossible flags
```

## 46. Allocation Strategy

### 46.1 Phase A recommendation

Use fixed-capacity pools with alive flags and simple compaction.

Advantages:

- predictable memory,
- easy debugging,
- lower implementation risk,
- easier browser compatibility.

### 46.2 Later optimization

After correctness:

- append buffers,
- free lists,
- prefix-sum compaction,
- indirect dispatch/draw,
- view-importance pruning,
- quality-tier dependent pool sizes.

## 47. WebGPU Bind-Group Architecture

| Group | Contents |
|---|---|
| `G0_Frame` | uniforms, dt, thresholds, quality profile, debug toggles |
| `G1_Primary` | primary particles, grid, density/support resources |
| `G2_Surface` | surface-state buffers, previous state, classification tables |
| `G3_Envelope` | envelope grids/textures, extraction candidates, filters |
| `G4_Secondary` | filament/droplet/mist pools, counters, budgets |
| `G5_Coupling` | deposition packets, contact fields, ripple inputs |
| `G6_Debug` | stats, heatmaps, selected lineage, snapshot flags |

## 48. WebGL2 Fallback Architecture

The WebGL2 path should preserve the architecture but use different implementation primitives:

- RGBA float/half-float textures for particle and state data,
- render-to-texture passes for classification and updates,
- ping-pong framebuffers,
- texture atlases for secondary pools,
- transform feedback only if it materially simplifies a stage,
- CPU-side budget management only where acceptable.

The fallback does not need every high-tier feature. It must preserve:

- calm anti-lump behavior,
- envelope honesty,
- bounded secondary particles,
- merge-back existence,
- debug overlays,
- and meaningful visual validation.

## 49. Quality Tiers

| Subsystem | Low | Medium | High |
|---|---|---|---|
| Primary solver | lower count/resolution | balanced | higher count/resolution |
| Surface classification | coarse support + topness | covariance + temporal fields | richer neighborhood + diagnostics |
| Envelope extraction | 2.5D top grid | local atlas/3D assist | hybrid multi-candidate packet |
| Filtering | calm anti-lump + simple rolling | directional confidence filters | multi-scale adaptive filters |
| Breakup | sparse proto + simple droplets | ligament/bead + classes | full staged hierarchy |
| Mist | off or minimal | event-gated | high-quality but capped |
| Merge-back | soft visual merge | deposition ripples | coupled disturbance packets |
| Diagnostics | essential overlays | counters + snapshots | lineage + metrics + sweeps |

### 49.1 Priority ladder under stress

When frame budget is exceeded, reduce in this order:

1. mist density,
2. micro-droplet count,
3. secondary lifetime,
4. branch segment count,
5. expensive filter refinement,
6. envelope resolution,
7. primary simulation resolution.

Do **not** first destroy calm anti-lump behavior, envelope honesty, or merge-back. Those are identity invariants.

---

# Part VII — Developer Lab, Diagnostics, and Validation

## 50. Default Motion Policy

For inspection and screenshot comparison, simulation motion should be disabled or paused by default in diagnostic routes unless the test explicitly requires motion.

Required controls:

- play/pause,
- step one frame,
- reset scene,
- simulation speed,
- seed lock,
- camera save/load,
- quality tier selector,
- debug overlay selector,
- snapshot capture.

Stable baselines matter. A moving default scene makes regression analysis harder.

## 51. Debug Views

### 51.1 Primary debug views

- exposure heatmap,
- coherence heatmap,
- sheetness heatmap,
- rollingness heatmap,
- elongation heatmap,
- thinning heatmap,
- breakup instability heatmap,
- primary state coloring,
- spawn eligibility overlay,
- spawn rejection reasons.

### 51.2 Envelope debug views

- top-height field,
- confidence field,
- smoothing authority,
- ripple preservation,
- rolling relief preservation,
- candidate count,
- ambiguity,
- overhang,
- envelope/suppression arbitration.

### 51.3 Breakup debug views

- branch skeletons,
- branch radii,
- attachment,
- necking,
- bead readiness,
- detach readiness,
- droplet class colors,
- mist budget overlay,
- lineage from source to child entities.

### 51.4 Coupling debug views

- merge potential,
- merge age,
- contact class,
- deposition packet footprint,
- ripple/dimple strength,
- secondary shatter emission.

## 52. Snapshot Protocol

Every accepted visual capture should include:

```text
SnapshotManifest
- snapshotId
- route
- sceneName
- camera
- simulationSeed
- frameIndex
- simulationTime
- qualityTier
- parameterPreset
- activeFeatureFlags
- proofType
- containsRendererCanvas
- containsAcceptanceSubject
- debugOverlaysEnabled
- metricsSummary
- sourceBuildHash
- notes
```

### 52.1 Proof types

| Proof type | Meaning | Acceptance value |
|---|---|---|
| `overlay_capture` | proves route/UI/overlay state only | not visual water proof |
| `scene_capture` | proves the renderer canvas was captured | technical proof only |
| `accepted_visual_scene_proof` | proves visually meaningful water output against scene target | required for visual acceptance |
| `debug_diagnostic_capture` | proves a field/overlay behaves as intended | diagnostic proof |

A screenshot showing only UI panels, debug artifacts, or nonsensical composition is not accepted visual proof.

## 53. Benchmark Scene Families

The validation lab should include scenario families, not one beautiful demo.

| Family | Purpose |
|---|---|
| Calm basin | anti-lump proof; still water must not show particle lobes |
| Ripple basin | preserve small surface life while smoothing supports |
| Rolling sheet | preserve wave relief without premature breakup |
| Crest transition | test hand-off from rolling to crest hazard |
| Branch birth | proto-filament formation from unstable source |
| Ligament thinning | thin coherent thread before snapping |
| Bead-chain | visible neck/bead progression before droplets |
| Droplet field | variable radius, drag, lifetime, shape memory |
| Drop re-entry | soft merge, dimple, ripple deposition |
| Skimming fragment | shallow-angle contact and delayed merge |
| Violent impact | shatter/mist under high energy |
| Overhang/crown | envelope invalidity and hand-off honesty |
| Budget stress | controlled degradation under high particle pressure |

## 54. Quantitative Metrics

Metrics should support, not replace, visual judgment.

### 54.1 Calm sheet metrics

- lobe amplitude over particle spacing,
- surface normal variance,
- height jitter over time,
- ripple retention ratio,
- envelope confidence stability.

### 54.2 Rolling metrics

- wave amplitude retention,
- crest-line preservation,
- false breakup rate,
- relief flattening ratio,
- temporal shimmer.

### 54.3 Breakup metrics

- staged transition count,
- branch lifetime before detach,
- radius distribution entropy,
- droplet class counts,
- spawn rejection reason distribution,
- budget-hit frequency.

### 54.4 Reabsorption metrics

- mean merge time,
- pop-delete count,
- re-entry ripple consistency,
- permanent spray survival rate,
- deposition packet count and footprint.

## 55. Qualitative Acceptance Rubric

| Score | Meaning |
|---:|---|
| 0 | broken / no useful renderer proof |
| 1 | visible but fundamentally wrong regime behavior |
| 2 | partial behavior; obvious artifacts dominate |
| 3 | acceptable prototype; target behavior legible |
| 4 | strong; artifacts no longer dominate |
| 5 | excellent; behavior sells the intended water regime |

Each benchmark scene should receive separate scores for:

- regime correctness,
- visual coherence,
- temporal stability,
- optical integration,
- performance behavior,
- debug explainability.

## 56. Validation Gates

### Gate A — Classification truth

Pass only if the engine can show primary-state overlays that correctly distinguish bulk, calm sheet, rolling sheet, crest hazard, and breakup source in controlled scenes.

### Gate B — Calm anti-lump

Pass only if calm water no longer reads as overlapping spheres in accepted visual scene proof.

### Gate C — Rolling preservation

Pass only if rolling waves retain relief and do not become plastic flat sheets.

### Gate D — Envelope honesty

Pass only if overhang/crown/multi-layer scenes suppress envelope authority and show non-envelope/breakup hand-off.

### Gate E — Branch staging

Pass only if unstable crest events visibly produce stretch-before-snap behavior.

### Gate F — Droplet hierarchy

Pass only if detached droplets show variable radius, drag, lifetime, and class behavior.

### Gate G — Merge-back

Pass only if returning fragments merge, skim, dimple, or shatter through explicit contact logic rather than pop-delete.

### Gate H — Performance tier integrity

Pass only if low/medium/high profiles degrade richness without violating core invariants.

## 57. Failure Triage Matrix

| Symptom | Likely layer | First inspection |
|---|---|---|
| Calm water lumpy | envelope/filter | lobe metric, smoothing authority, `V` confidence |
| Water too flat | filter/control | ripple/relief preservation, calm smoothness macro |
| Breakup too early | state machine | `B`, `BreakAge`, crest hazard, thresholds |
| Breakup never happens | spawn policy | rejection reasons, budgets, `Pproto` |
| Droplets uniform | detachment | radius distribution, class mapping |
| Spray immortal | lifecycle | lifetime, merge potential, culling |
| Droplets pop on contact | merge | merge age, visual fade, deposition path |
| Debug looks right but scene wrong | render composite | arbitration weights, optical material integration |
| Screenshot proves nothing | validation | proof type and acceptance subject |

---

# Part VIII — Artist-Facing Control and Presets

## 58. Control Philosophy

The user should not steer the engine through raw threshold soup. The UI should expose phenomenon-level controls that map to internal parameters safely.

Controls must answer human questions:

- How smooth is calm water?
- How much ripple survives smoothing?
- How honest is the envelope near ambiguous geometry?
- How easily do crests become stringy?
- How long do ligaments persist?
- How varied is the spray?
- How softly do droplets reunite with the body?

## 59. Macro Controls

| Macro | User meaning | Internal mapping |
|---|---|---|
| Calm Smoothness | remove calm-surface lumpiness | increases calm smoothing authority and lobe suppression |
| Ripple Preservation | keep small surface life | raises high-frequency protection in valid calm sheet |
| Rolling Relief | preserve wave form | lowers cross-crest smoothing, protects relief amplitude |
| Envelope Honesty | avoid lying near overhangs | raises ambiguity/overhang penalties |
| Breakup Sensitivity | how easily unstable crests spawn | shifts `B_enter`, `BreakAge`, `Pproto` thresholds |
| Stringiness | stretch before snap | increases proto/ligament lifetime and taper length |
| Necking Strength | bead-chain emergence | increases neck modulation and bead readiness |
| Droplet Scale Richness | variation in child radii | widens class distribution and radius entropy |
| Mist Aggression | fine terminal spray | increases mist budget and event threshold sensitivity |
| Reunion Softness | merge visual smoothness | increases merge age/fade and lowers pop risk |
| Surface Response | ripple/dimple response to contacts | scales deposition packet strength |

## 60. Safety Zones

Each macro should have:

- safe range,
- experimental range,
- diagnostic warning range,
- and preset lock ranges.

Example:

```text
Calm Smoothness
0.0–0.3  weak smoothing, useful for debugging particle support
0.3–0.8  safe authoring range
0.8–1.0  high smoothing, warning: can flatten ripples
```

## 61. Presets

| Preset | Intent |
|---|---|
| Debug Truth | minimum beauty, maximum overlays and counts |
| Calm Pool | anti-lump proof with ripple preservation |
| Rolling Ocean Sheet | relief-preserving waves, breakup suppressed |
| Crest Laboratory | crest hazard and branch birth tuning |
| Violent Splash | full breakup and mist stress |
| Reabsorption Lab | droplet re-entry and contact coupling |
| Low-Tier Honest | minimal runtime preserving invariants |
| High-Tier Showcase | full layered behavior with rich secondary populations |

## 62. Explainability UI

Every macro should expose:

- what it changes,
- which internal fields it affects,
- current safe/unsafe status,
- active gates it is influencing,
- and a link to relevant debug overlays.

A good fluid lab lets the artist see why the water behaves differently after a control change.

---

# Part IX — Phase-Gated Implementation Roadmap

## 63. Build Principle

Do not build the whole hierarchy at once. Build the smallest accepted truth layer, validate it, then unlock the next layer.

## 64. Phase 0 — Import, Baseline, and Proof Discipline

### Objective

Create a stable developer lab route and validation harness before changing fluid behavior.

### Build items

- source scene route,
- fixed camera presets,
- pause-by-default simulation,
- snapshot manifest,
- debug overlay shell,
- quality profile shell,
- accepted proof taxonomy.

### Exit gate

A meaningful renderer scene can be captured with manifest fields proving `scene_capture`. Visual acceptance is not claimed yet.

## 65. Phase 1 — Surface Classification

### Objective

Compute and visualize exposure, coherence, sheetness, rollingness, elongation, thinning, breakup instability, and primary state flags.

### Build items

- `PrimarySurfaceState` buffer,
- classification pass,
- state overlay,
- counters by state,
- rejection reason plumbing.

### Exit gate

Controlled scenes show believable classification bands and no all-one-state collapse.

## 66. Phase 2 — Calm-Sheet Envelope

### Objective

Destroy calm-surface lobe artifacts.

### Build items

- envelope grid,
- top candidate extraction,
- calm smoothing filter,
- calm/ripple preservation controls,
- calm basin benchmark.

### Exit gate

Accepted visual scene proof shows calm water no longer reading as spherical particle support.

## 67. Phase 3 — Rolling-Sheet Preservation

### Objective

Allow coherent active waves without flattening them or prematurely fragmenting them.

### Build items

- rollingness classification,
- directional filtering,
- relief preservation,
- rolling wave benchmark,
- calm/rolling transition test.

### Exit gate

Rolling waves preserve shape and temporal stability while still avoiding obvious sphere lobes.

## 68. Phase 4 — Envelope Honesty and Overhang Invalidity

### Objective

Prevent top-envelope lies near crowns, overhangs, side sheets, and multi-layer support.

### Build items

- ambiguity metrics,
- overhang score,
- candidate-count diagnostics,
- envelope suppression,
- hand-off visualization.

### Exit gate

Overhang/crown test scenes suppress envelope authority correctly and do not smear complex geometry into a false sheet.

## 69. Phase 5 — Proto-Filaments and Ligaments

### Objective

Add stretch-before-snap behavior.

### Build items

- `SecondaryFilament` pool,
- spawn policy,
- branch skeletons,
- taper law,
- attachment decay,
- ligament transition.

### Exit gate

Crest/impact scenes show attached stretched branches before detached droplets appear.

## 70. Phase 6 — Bead Chains and Droplet Detachment

### Objective

Bridge thread breakup into varied droplets.

### Build items

- necking signal,
- bead-chain geometry,
- detachment readiness,
- variable radius distribution,
- droplet classes,
- droplet pool.

### Exit gate

Breakup scenes show visible scale hierarchy and no uniform confetti field.

## 71. Phase 7 — Droplet Motion, Mist, and Lifetime

### Objective

Make detached populations behave believably and remain bounded.

### Build items

- ballistic update,
- drag by class,
- shape memory,
- mist conversion,
- lifetime/culling,
- budget stress test.

### Exit gate

Droplets and mist remain visually useful, class-varied, and bounded under stress.

## 72. Phase 8 — Reabsorption and Surface Coupling

### Objective

Close the lifecycle loop.

### Build items

- merge potential,
- merge age,
- reabsorbing state,
- contact classification,
- deposition packets,
- ripple/dimple response.

### Exit gate

Drop re-entry scenes show soft merge, skim, dimple, or energetic contact without pop-delete or immortal debris.

## 73. Phase 9 — Control, Presets, Performance Tiers

### Objective

Make the system authorable and scalable.

### Build items

- macro controls,
- safety zones,
- presets,
- low/medium/high profiles,
- dynamic richness scaling,
- parameter sweep tooling.

### Exit gate

Each quality tier preserves invariants and each preset remains explainable through debug views.

## 74. Phase 10 — Productization and Shipping Doctrine

### Objective

Turn the lab into a durable browser product route.

### Build items

- capability detection,
- safe defaults,
- preset negotiation,
- reproducible snapshots,
- baseline comparison automation,
- public/demo mode with debug-lab toggle.

### Exit gate

The system can be evaluated by repeatable scenes and does not depend on hand-picked miracles.

---

# Part X — Implementation Starter Specification

## 75. Minimal TypeScript State Skeleton

```ts
export enum PrimaryFluidState {
  Bulk = 1 << 0,
  SurfaceCandidate = 1 << 1,
  SheetCalm = 1 << 2,
  SheetRolling = 1 << 3,
  CrestHazard = 1 << 4,
  BreakupSource = 1 << 5,
  EnvelopeValid = 1 << 6,
  CanSpawn = 1 << 7,
}

export enum SecondaryState {
  Alive = 1 << 0,
  ProtoFilament = 1 << 1,
  Ligament = 1 << 2,
  BeadChain = 1 << 3,
  DropletMacro = 1 << 4,
  DropletStd = 1 << 5,
  DropletMicro = 1 << 6,
  Mist = 1 << 7,
  Reabsorbing = 1 << 8,
  PendingKill = 1 << 9,
}

export interface HybridSplashQualityProfile {
  name: 'low' | 'medium' | 'high' | 'debug';
  maxFilamentsActive: number;
  maxDropletsActive: number;
  maxMistActive: number;
  envelopeResolution: [number, number];
  enableBeadChains: boolean;
  enableMist: boolean;
  enableDepositionPackets: boolean;
  debugFieldsEnabled: boolean;
}
```

## 76. Minimal Frame Update Pseudocode

```ts
function stepHybridWaterFrame(ctx: HybridWaterContext, dt: number) {
  // 1. Solver truth
  runPrimarySolver(ctx, dt);
  accumulateDensityAndSupport(ctx);

  // 2. Surface intelligence
  classifyPrimarySurfaceState(ctx, dt);
  updatePrimaryAgeAccumulators(ctx, dt);

  // 3. Envelope
  extractEnvelopeCandidates(ctx);
  computeEnvelopeAmbiguityAndOverhang(ctx);
  filterEnvelopeByRegime(ctx, dt);
  arbitrateEnvelopeWeights(ctx);

  // 4. Breakup hierarchy
  rankBreakupSpawnCandidates(ctx);
  spawnProtoFilaments(ctx, dt);
  updateFilamentsAndLigaments(ctx, dt);
  synthesizeBeadChains(ctx, dt);
  detachDroplets(ctx, dt);

  // 5. Detached lifecycle
  updateDroplets(ctx, dt);
  updateMist(ctx, dt);
  classifyContactsAndMergeBack(ctx, dt);
  emitDepositionPackets(ctx, dt);
  compactSecondaryPools(ctx);

  // 6. Rendering and proof
  updateDiagnostics(ctx);
  renderWaterComposite(ctx);
  maybeCaptureSnapshot(ctx);
}
```

## 77. Minimal WGSL-Like Surface State Record

```wgsl
struct PrimarySurfaceState {
  stateFlags: u32,
  parentOrCellId: u32,
  exposure: f32,
  coherence: f32,
  sheetness: f32,
  rollingness: f32,
  elongation: f32,
  thinning: f32,
  breakInstability: f32,
  breakAge: f32,
  thinAge: f32,
  envelopeValidity: f32,
  ambiguity: f32,
  overhang: f32,
  topness: f32,
  spawnCooldown: f32,
};
```

## 78. Minimal Debug Counter Contract

```text
DebugCounters
- frameIndex
- primaryBulkCount
- primaryCalmCount
- primaryRollingCount
- primaryCrestHazardCount
- primaryBreakupSourceCount
- envelopeValidCellCount
- envelopeSuppressedCellCount
- spawnCandidates
- spawnedFilaments
- spawnedDroplets
- spawnedMist
- mergedDroplets
- killedSecondary
- budgetHits
- cooldownRejects
- invalidityRejects
- nanRejects
```

## 79. Minimal Acceptance Manifest

```json
{
  "proofType": "accepted_visual_scene_proof",
  "sceneName": "calm-basin-anti-lump",
  "containsRendererCanvas": true,
  "containsAcceptanceSubject": true,
  "debugOverlaysEnabled": false,
  "cameraPreset": "low-angle-waterline",
  "qualityTier": "medium",
  "featureFlags": ["classification", "envelope", "calm-filter"],
  "metrics": {
    "lobeAmplitude": 0.0,
    "rippleRetention": 0.0,
    "temporalJitter": 0.0
  },
  "acceptedBy": "visual-review-gate",
  "notes": "Calm water must show coherent sheet, not particle support."
}
```

The values above are placeholders; the manifest shape is the contract.

---

# Part XI — Research Grounding and Conceptual Anchors

This thesis is a hybrid engineering doctrine, not a claim that browser water can cheaply solve every continuum-scale capillary phenomenon. The research anchors below support the major families of ideas:

| Anchor | Relevance to this thesis |
|---|---|
| MLS-MPM / APIC family | Justifies particle-grid solver truth and affine/deformation carriers for continuum-like behavior. |
| Particle-based surface reconstruction with anisotropic kernels | Supports the claim that isotropic sphere-like support can create visible surface artifacts and that anisotropic/local reconstruction improves surfaces. |
| Screen-space fluid rendering and curvature-flow filtering | Supports real-time smoothing/rendering strategies, but this thesis keeps them subordinate to regime validity rather than using them as global truth. |
| Mesh/level-set/surface tracking literature | Supports the distinction between bulk simulation and visible surface reconstruction. |
| WebGPU/WGSL specification family | Supports compute/storage-buffer browser architecture for modern implementations. |

### Bibliographic anchors

- Hu, Fang, Ge, Qu, Zhu, Pradhana, and Jiang — *A Moving Least Squares Material Point Method with Displacement Discontinuity and Two-Way Rigid Body Coupling*.
- Jiang, Schroeder, Selle, Teran, and Stomakhin — *The Affine Particle-In-Cell Method*.
- Yu and Turk — *Reconstructing Surfaces of Particle-Based Fluids Using Anisotropic Kernels*.
- van der Laan, Green, and Sainz — *Screen Space Fluid Rendering with Curvature Flow*.
- Bridson and Müller-Fischer — *Fluid Simulation* course notes.
- W3C / GPU for the Web — *WebGPU* and *WGSL* specifications.

## 80. Open Research Questions

The strongest remaining research questions are:

1. What is the cheapest reliable single-valuedness test for browser top-envelope validity?
2. How should envelope confidence blend across calm-to-rolling transitions without temporal shimmer?
3. What is the best low-cost bead-chain synthesis that looks physical without simulating capillary instability directly?
4. How much secondary mass should couple back into the primary solver at each quality tier?
5. What droplet radius distribution gives the best perceived realism per active entity?
6. How should merge-back deposition affect a heightfield/envelope surface without creating fake ripples everywhere?
7. What is the best accepted visual proof scene for early calm anti-lump validation?
8. Which debug fields are essential enough to stay always-on in low-tier runtime?
9. How should this architecture integrate with far-field ocean/planetary LOD rings without violating the one-water principle?
10. What authoring UI makes regime behavior intuitive to a non-coder without hiding the truth of the state machine?

## 81. Final Rebuilt Thesis Statement

The fluid system must not be one visual creature pretending to be every water phenomenon.

It must be one water identity expressed through multiple lawful surface truths:

- bulk truth for mass and motion,
- envelope truth for calm and rolling coherent sheets,
- invalidity truth for overhangs and multi-valued geometry,
- branch truth for stretch-before-snap breakup,
- droplet truth for scale-rich detached fragments,
- mist truth for violent terminal spray,
- and reunion truth for returning fragments.

The winning implementation is not the one that adds the most effects. It is the one that classifies regimes honestly, changes representation only when the local state warrants it, remains bounded in the browser, exposes its decisions through diagnostics, and proves visual quality through meaningful accepted scene captures.

That is the rebuild.
