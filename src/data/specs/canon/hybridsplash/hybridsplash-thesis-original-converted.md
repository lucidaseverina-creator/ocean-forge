# Hybrid MLS-MPM Fluid Surface and Breakup Thesis

## Working Title

**From Spherical Supports to Adaptive Surface Regimes:** A Thesis on Calm-Sheet Reconstruction, Filament Breakup, Droplet Hierarchy, and Reabsorption in a Browser-Based Hybrid MLS-MPM Fluid System

---

## Status

**Document Type:** Living thesis / master design document
**Purpose:** Canonical theory, architecture, and implementation blueprint
**Development Mode:** Incremental refinement in canvas
**Scope:** Browser-based hybrid MLS-MPM fluid rendering and breakup system with calm-sheet smoothing, rolling-wave continuity, filament hierarchy, droplet fragmentation, and reabsorption

---

# 0. Preface

This document is the canonical working thesis for a browser-based hybrid fluid system built around MLS-MPM simulation, adaptive surface reconstruction, and a layered breakup hierarchy.

The document exists to solve a specific realism failure that appears in particle-based fluid surface rendering: a fluid body may be simulated as a coherent continuous material, yet the visible surface still reveals the rounded support of its particles. At rest, or under slow wave motion, this causes the surface to appear lumpy rather than smooth. During splashes and ejection events, a second realism failure emerges: the visible particles remain too uniform in size and too primitive in breakup behavior, producing spray that lacks scale hierarchy, ligament evolution, and convincing re-merging with the parent body.

This thesis proposes that these failures are not best solved by one global particle representation. Instead, they require a **multi-regime surface and breakup architecture** in which coherent sheet water, rolling wave skin, stretched filaments, ligaments, bead chains, droplets, mist, and reabsorption are treated as related but distinct representational states.

The aim is not merely to render fluid, but to create a system that behaves like fluid across multiple perceptual regimes while remaining computationally viable in the browser.

---

# 1. Abstract

This thesis presents a hybrid approach to browser-based fluid representation in which an MLS-MPM bulk solver is coupled to an adaptive surface and breakup system. The central insight is that the visible surface of fluid must not be represented by one static support shape. Calm exposed water, rolling waves, cresting flow, stretched filaments, breaking ligaments, droplets, and mist all demand different geometric and temporal treatment.

The first core problem addressed is **calm-surface lumpiness**. In many particle-driven rendering systems, the surface reads as an aggregate of spheres or sphere-like supports even when the underlying fluid should appear smooth. The thesis argues that calm exposed water should transition away from sphere-led support and toward a **sheet or top-envelope regime**, approaching a heightfield-like reconstruction wherever the surface remains locally single-valued.

The second core problem addressed is **uniform splash fragmentation**. A convincing splash cannot remain a cloud of equal-sized particles. Instead, exposed unstable regions must progress through a breakup hierarchy: coherent sheet, proto-filament, ligament, bead chain, droplets, and mist. These fragments must then reabsorb into the parent body when they re-enter dense coherent fluid.

The proposed system therefore separates the fluid into two cooperating populations: **primary particles**, which remain the mass-carrying truth of the MLS-MPM body, and **secondary breakup entities**, which provide visually and dynamically rich representation of filamentation, droplet formation, spray, and reabsorption. The architecture is designed for browser execution and can be built incrementally in a modern GPU pipeline.

---

# 2. Problem Statement

## 2.1 Calm-Surface Failure

When the visible surface of fluid is reconstructed from overlapping spherical particle supports, the surface remains visibly lumpy even if the fluid is nearly at rest. This produces the same perceptual problem as coating a packed bed of marbles with a thin layer of slime: the material reads as continuous, but its support geometry still telegraphs through the surface.

This is not fundamentally a failure of fluid identity. It is a failure of **surface support representation**.

The fluid may be coherent. The rendered surface may still be wrong.

## 2.2 Splash Fragmentation Failure

When exposed fluid separates during breaching, sloshing, cresting, or impact, a second realism failure appears. The fluid often breaks into visible particles that are:

* too uniform in size,
* too static in shape,
* too immediate in separation,
* too poor at forming ligaments and bead chains,
* and too permanent once detached.

A physically persuasive fluid must exhibit **breakup hierarchy** and **temporal progression**:

* stretching before snapping,
* thinning before droplet detachment,
* bead-chain formation before full separation,
* and reabsorption when secondary fragments re-enter the bulk body.

## 2.3 Core Thesis Claim

A single particle representation cannot optimally express all fluid regimes. The fluid must instead be represented through **multiple adaptive states** governed by exposure, coherence, elongation, thinning, breakup instability, and reabsorption potential.

---

# 3. Design Goals

The system aims to satisfy the following goals simultaneously:

1. **Smooth calm water:** Near-rest exposed fluid should read as a smooth coherent sheet, not as overlapped spheres.
2. **Wave and ripple continuity:** Rolling waves and ripples should remain continuous and detail-rich without collapsing into flat plasticity.
3. **Progressive breakup:** Cresting and stretching water should evolve through a staged breakup hierarchy, not binary emission.
4. **Scale hierarchy:** Splash particles must vary in size and evolve through thinning, necking, and detachment.
5. **Temporal elegance:** Elongation should precede fragmentation; fragmentation should precede mist.
6. **Reabsorption:** Detached fragments should not remain permanent confetti. They must rejoin the coherent body when conditions warrant.
7. **Computational viability:** The architecture must remain practical for browser-based GPU implementation.
8. **Modular evolution:** The system must be buildable in phases, allowing incremental visual and architectural improvement.

---

# 4. First Principles

## 4.1 One Fluid, Many Regimes

Fluid is a continuous material, but the *best visible representation* of fluid changes depending on local state.

The same water body may contain, simultaneously:

* buried bulk mass,
* calm coherent sheet,
* rolling wave skin,
* cresting ejection,
* stretched filament,
* unstable ligament,
* bead chain,
* detached droplets,
* and airborne mist.

The solver may remain one system. The representation cannot.

## 4.2 The Surface Is Not the Bulk

The bulk solver carries mass and momentum. The visible surface carries shape, continuity, breakup cues, and perceptual realism.

A coherent surface should not be forced to inherit the same visual primitive as detached spray.

## 4.3 Surface Regime Validity

A heightfield-like or top-envelope reconstruction is valid only where the surface is locally single-valued. Overturning waves, strong overhangs, detached ligaments, and fully separated droplets cannot be represented correctly by a heightfield.

Therefore, heightfield behavior must be **adaptive and local**, not global.

## 4.4 Breakup Is Hierarchical

A splash does not instantaneously transform from bulk fluid to equal-size droplets. The process is staged:

* sheet deformation,
* branch formation,
* thinning,
* necking,
* beading,
* detachment,
* micro-fragmentation,
* re-merging.

This thesis treats that progression as a formal runtime hierarchy.

---

# 5. System Overview

The proposed system contains two principal populations.

## 5.1 Primary Population: Core MLS-MPM Particles

These remain the principal mass-carrying truth of the fluid body. They are responsible for:

* bulk motion,
* momentum transport,
* coherent sheet body,
* parent mass source for breakup,
* and the large-scale continuity of the fluid.

Primary particles should not, in the first implementation, be aggressively split into variable-size solver particles. That would create excessive complexity in support radii, transfer weights, mass conservation, and particle-count growth.

## 5.2 Secondary Population: Breakup Entities

These are transient entities driven by exposed unstable primary fluid regions. They include:

* proto-filaments,
* ligaments,
* bead chains,
* droplets,
* and mist.

They are not the fundamental truth of the fluid body. They are the dynamic representational layer that makes breakup visually and temporally persuasive.

## 5.3 Surface Envelope Layer

A third conceptual layer sits over both populations: the **surface envelope**.

This layer reconstructs calm and rolling coherent water in a way that is no longer bound to naive spherical support. In calm regions it may approach a local heightfield or top-envelope reconstruction. In more active coherent regions it may use anisotropic support. In breakup regions it yields to filament and droplet representation.

---

# 6. Surface Regimes

## 6.1 Bulk Interior

Fluid not directly exposed to air remains bulk interior. It contributes to the coherent body but does not require direct stylized surface treatment.

## 6.2 Calm Sheet

Calm sheet is exposed fluid in the near-rest or low-wave regime. It is characterized by:

* low speed,
* low vertical aggression,
* high coherence,
* and strong local continuity.

This regime should be rendered using a strongly smoothed envelope, approaching a top-surface or local heightfield representation while preserving ripples.

## 6.3 Rolling Sheet

Rolling sheet is coherent exposed fluid with more motion than calm sheet, but without true breakup. It is characterized by:

* moderate speed,
* coherent wave skin,
* crest formation without full fragmentation,
* and surface detail that remains continuous.

This regime should remain smoother than sphere-led particles but less flattened than calm sheet.

## 6.4 Breakup Source

Breakup source is an exposed coherent region whose local state indicates imminent or active fragmentation. It supplies the parent conditions for the secondary hierarchy.

---

# 7. Breakup Hierarchy

## 7.1 Proto-Filament

A proto-filament is the first coherent stretched branch emerging from an exposed unstable region. It remains continuous and attached to the parent fluid body.

It marks the transition from surface deformation to branch formation.

## 7.2 Ligament

A ligament is a thin unstable fluid thread. It is still continuous but increasingly prone to thinning, oscillation, and necking.

Ligaments must appear as thin coherent structures before they become beads or droplets.

## 7.3 Bead Chain

A bead chain is a necking ligament whose thickness oscillations have created alternating thick and thin regions. It remains partially connected but is no longer a smooth continuous thread.

This stage is critical to realism because it bridges the gap between fluid thread and detached droplets.

## 7.4 Droplets

Droplets are detached child fragments. They may be stratified into macro-droplets, standard droplets, and micro-droplets.

Droplets should vary in radius and lifetime. They may remain slightly stretched if fast, but are no longer continuous with the parent body.

## 7.5 Mist

Mist is the finest breakup population. It is typically short-lived, highly numerous, and primarily visual. It represents the high-frequency terminal haze of violent breakup.

## 7.6 Reabsorption

Secondary fragments that re-enter dense coherent fluid should not persist indefinitely. They must collapse back into the parent body through a formal reabsorption process.

This closes the lifecycle of breakup and prevents the simulation from devolving into permanent fine confetti.

---

# 8. Governing Quantities

The architecture is driven by a set of continuous scores rather than brittle binary tests.

## 8.1 Exposure

A measure of whether a local region is truly free-surface or strongly buried.

## 8.2 Coherence

A measure of how strongly the local material remains part of a continuous body.

## 8.3 Elongation

A measure of how stretched the local motion or support has become.

## 8.4 Thinning

A measure of narrowing or loss of support width in a branch-like region.

## 8.5 Breakup Instability

A compound measure representing the tendency of a local exposed region to progress into breakup.

## 8.6 Breakup Age

A time-integrated measure that prevents chatter by requiring instability to persist over time.

## 8.7 Reabsorption Potential

A measure of whether a detached fragment is likely to merge back into the coherent fluid body.

---

# 9. Runtime State Machine

The high-level progression is:

* Bulk Interior
* Calm Sheet
* Rolling Sheet
* Breakup Source
* Proto-Filament
* Ligament
* Bead Chain
* Droplet
* Mist
* Reabsorption

This is not strictly linear; regions and entities may move backward or forward depending on evolving conditions. A rolling sheet may settle into calm sheet. A proto-filament may briefly re-stabilize. A droplet may reattach to the coherent body.

The runtime system therefore uses a **state machine with hysteresis** rather than one-directional irreversible transitions.

---

# 10. Surface Reconstruction Thesis

## 10.1 Why Sphere-Led Surface Fails

A surface reconstructed from spherical supports carries visible lobes, especially at rest or slow motion. Even if the fluid visually blends into one body, the eye reads the support geometry.

Therefore, calm and wave-sheet water must not remain fully sphere-led.

## 10.2 Adaptive Calm-Sheet Reconstruction

Where exposed fluid remains locally single-valued, the visible surface should be reconstructed as a top envelope or heightfield-like surface. This does not imply converting the whole fluid into a heightfield. It means locally favoring a sheet-valid reconstruction wherever the geometry permits it.

## 10.3 Rolling-Wave Reconstruction

Where the surface remains coherent but active, the envelope should remain smooth while allowing stronger wave relief, directional bias, and less aggressive flattening.

## 10.4 Breakup Regime Hand-Off

Where coherence falls and breakup instability rises, the smooth sheet envelope should yield to filament and droplet representation rather than forcing non-heightfield phenomena into a heightfield abstraction.

---

# 11. Data Model Thesis

A robust implementation requires the solver truth, surface classification, and breakup population to remain distinct.

## 11.1 Primary Surface-State Record

Each primary particle or fluid region should maintain derived attributes such as:

* state flags,
* exposure,
* coherence,
* sheetness,
* rollingness,
* elongation,
* thinning,
* breakup instability,
* breakup age,
* support radius,
* and top-envelope weight.

## 11.2 Filament Record

Each secondary filament entity should carry:

* position,
* velocity,
* tangent,
* thickness,
* age,
* lifetime,
* instability,
* thinning,
* attachment,
* necking signal,
* parent reference,
* and state classification.

## 11.3 Droplet Record

Each secondary droplet should carry:

* position,
* velocity,
* radius,
* age,
* lifetime,
* drag,
* wetness,
* reabsorption progress,
* visual stretch,
* and droplet class.

---

# 12. Pass-Level Architecture

The architecture should be built around the following conceptual passes.

## 12.1 Bulk Simulation Pass

The existing MLS-MPM simulation updates the primary fluid body.

## 12.2 Surface Classification Pass

This pass derives surface-state quantities from the current fluid state.

## 12.3 Sheet Envelope Pass

This pass reconstructs the calm and rolling sheet envelope.

## 12.4 Breakup Spawn Pass

This pass identifies breakup sources and emits or updates proto-filaments.

## 12.5 Filament Update Pass

This pass advances proto-filaments, ligaments, and bead-chain states.

## 12.6 Droplet Emission Pass

This pass converts unstable ligaments or bead chains into detached droplets.

## 12.7 Spray Update Pass

This pass advances detached droplets and mist.

## 12.8 Reabsorption Pass

This pass tests detached fragments against the coherent fluid body and merges them back where appropriate.

## 12.9 Composite Render Pass

This pass merges the sheet envelope, rolling surface, filaments, droplets, and mist into the final rendered fluid.

---

# 13. Reabsorption Thesis

Reabsorption is not a cosmetic afterthought. It is one of the most important realism loops in the system.

A detached fragment should be considered a temporary representational branch of the parent fluid, not permanent independent matter. Once it re-enters dense coherent water under suitable relative motion and contact conditions, it should cease to exist as a separate spray entity.

This has three benefits:

1. It preserves fluid identity.
2. It prevents exponential clutter.
3. It restores believable lifecycle continuity.

---

# 14. Visual Laws

The architecture should obey the following laws.

## Law 1

Calm water must not be represented primarily by rounded particle supports.

## Law 2

Rolling waves must remain coherent before they fragment.

## Law 3

Breakup must be progressive: sheet to filament to ligament to bead chain to droplets to mist.

## Law 4

Droplet scale must vary.

## Law 5

Elongation must precede fragmentation.

## Law 6

Only exposed unstable regions should fragment.

## Law 7

Detached fragments must reabsorb when they return to coherent fluid.

## Law 8

The system must remain computationally bounded and phase-buildable in browser execution.

---

# 15. Incremental Build Roadmap

## Phase I — Canonical Classification

Implement only the surface-state logic:

* bulk,
* calm sheet,
* rolling sheet,
* breakup source.

No secondary breakup entities yet.

## Phase II — Calm-Sheet Envelope

Implement top-envelope / heightfield-like calm reconstruction and rolling-sheet continuity.

This phase targets the lumpy-at-rest failure directly.

## Phase III — Proto-Filament Layer

Introduce attached stretched branches without droplet detachment.

## Phase IV — Ligament Dynamics

Add thinning, instability aging, and narrow thread behavior.

## Phase V — Bead-Chain Stage

Add necking and pearl-chain formation.

## Phase VI — Detached Droplets

Add variable-radius droplets with ballistic behavior.

## Phase VII — Mist

Add finest spray layer for violent breakup events.

## Phase VIII — Reabsorption

Add coherent-body merge-back for detached fragments.

## Phase IX — Refinement and Tuning

Tune thresholds, transitions, shape laws, and rendering balance across all states.

---

# 16. Open Research Questions

1. What is the most efficient local criterion for determining when a calm surface can safely become heightfield-like?
2. How should the top-envelope blend behave near cresting zones where the geometry is transitioning away from single-valued validity?
3. What is the best cheap browser-friendly approximation of ligament necking and bead-chain formation?
4. How should the droplet radius hierarchy be distributed for maximum realism without excessive secondary population count?
5. What is the most convincing reabsorption visual cue when droplets rejoin the sheet?
6. How should the existing elongation system feed the proto-filament and ligament stages?
7. How much breakup logic should remain visual-only versus coupled back into the fluid response?

---

# 17. Glossary

## Bulk Interior

Fluid not directly exposed to air and not requiring explicit breakup representation.

## Calm Sheet

Exposed coherent fluid in a near-rest or ripple-dominant regime.

## Rolling Sheet

Exposed coherent fluid in a wave-dominant but non-breaking regime.

## Breakup Source

An exposed unstable region likely to emit secondary breakup structures.

## Proto-Filament

The first stretched coherent branch emerging from exposed unstable fluid.

## Ligament

A thin unstable fluid thread that remains continuous but is nearing breakup.

## Bead Chain

A necked ligament with alternating thick and thin segments.

## Droplet

A detached child fragment of the parent fluid body.

## Mist

The finest high-frequency population of fragmented spray.

## Reabsorption

The process by which detached fragments merge back into the coherent body.

## Top Envelope

A local upper-surface reconstruction valid in single-valued coherent regions.

---

# 18. Closing Position of This First Draft

This thesis begins from a deceptively simple observation: a fluid can be continuous in simulation yet wrong in appearance because the visible surface still reveals the support primitive of its particles. Once that is understood, the path forward becomes clear.

The problem is not merely smoothing. The problem is that fluid lives in multiple regimes, and each regime demands its own representational truth.

Calm sheet water must become a smooth envelope. Rolling waves must remain coherent without looking spherical. Breaking crests must stretch before they snap. Ligaments must neck before they detach. Detached droplets must vary in size. Mist must be ephemeral. Everything that leaves the parent body must be able to return.

The fluid must not be one visual creature pretending to be all others.

It must be a hierarchy.

---

# 19. Next Expansion Targets

The next sections to build in detail are:

1. **Formal mathematics of exposure, coherence, elongation, thinning, and breakup instability**
2. **Detailed runtime state machine with hysteresis and thresholds**
3. **Data structures and buffer layouts for browser GPU implementation**
4. **Sheet-envelope reconstruction theory and variants**
5. **Filament, ligament, and bead-chain geometry synthesis**
6. **Droplet emission, motion, and reabsorption rules**
7. **Pass ordering, scheduling, and performance strategy**
8. **Aesthetic control model and artist-facing parameterization**








# Section 19. Formal State Mathematics

This section turns the thesis from architecture into runtime doctrine. The quantities defined here are not claimed as perfect first-principles continuum laws. They are operational state variables designed to classify fluid behavior, drive transitions, stabilize the hierarchy, and produce believable results in a browser-constrained system.

The philosophy is simple: the bulk solver remains the mass-and-momentum truth, while the visible surface and breakup system are governed by a structured set of derived fields.

19.1 Core Notation

For each primary particle i, assume the system has or can derive:

x_i: position

v_i: velocity

C_i: affine velocity field or local deformation carrier

rho_i: density estimate

N(i): local support neighborhood

Let up = (0,1,0) unless a different sheet-frame normal is preferred.

Let phi(x) be a support or density-like field reconstructed from particles, the density grid, or a hybrid accumulation scheme.

Let gradPhi(x) be its gradient.

Let S_i = 0.5 * (C_i + transpose(C_i)) be the symmetric strain-like component of C_i.

Let normF(M) denote Frobenius norm.

Throughout this section:

saturate(x) = clamp(x, 0, 1)

smooth(a,b,x) means a smooth 0-to-1 threshold over [a,b]

19.2 Derived Local Measurements
19.2.1 Speed

speed_i = length(v_i)

speedN_i = saturate((speed_i - speed0) / (speed1 - speed0))

This is the simplest motion cue. It is necessary, but not sufficient, for breakup logic.

19.2.2 Vertical Aggression

The system needs to distinguish ordinary wave motion from ballistic or ejective motion.

upAgg_i = saturate((max(0, dot(v_i, up)) - up0) / (up1 - up0))

High upAgg_i means the local motion is leaving calm-sheet or rolling-wave validity.

19.2.3 Strain Magnitude

strain_i = normF(S_i)

strainN_i = saturate((strain_i - strain0) / (strain1 - strain0))

This gives a compact deformation cue. Calm coherent water should usually have lower strain than filament-forming or violently fragmenting regions.

19.2.4 Support Score

Define a neighborhood support score:

support_i = sum over j in N(i) of w_ij

Normalize it:

supportN_i = saturate((support_i - support0) / (support1 - support0))

High support usually means buried or strongly coherent fluid. Low support suggests exposure, thinning, or detachment.

19.2.5 Surface Normal Estimate

Where phi is well behaved:

n_i = -normalize(gradPhi(x_i))

with a small epsilon in practice.

Define upward-facing tendency:

topness_i = saturate(dot(n_i, up))

This helps distinguish the exposed upper sheet from side structures or underside geometry.

19.2.6 Thickness Estimate

The system needs a local thickness or width proxy. Depending on implementation stage, this may come from:

a support-width estimate from local covariance

thickness sampled from the density grid

top-to-bottom envelope thickness

filament-local radius in the secondary system

Call the primary local thickness estimate thick_i.

Normalize inverse thickness as a thinning score:

thin_i = 1 - saturate((thick_i - thick0) / (thick1 - thick0))

High thin_i means the region is narrowing toward breakup.

19.3 Exposure

Exposure measures whether a local region should be treated as free surface instead of buried interior.

This must be continuous, not binary.

19.3.1 Support-Based Exposure

exposureSupport_i = 1 - supportN_i

19.3.2 Top-Biased Exposure

exposureTop_i = topness_i

19.3.3 Combined Exposure

E_i = saturate(aE * exposureSupport_i + bE * exposureTop_i + cE * exposureDensity_i)

If density-side exposure is not yet implemented, the system can begin with support plus top-bias.

19.3.4 Interpretation

E_i near 0: buried interior

E_i near 1: strongly exposed free surface

Exposure is a gatekeeper. Regions with low exposure should not enter the breakup hierarchy.

19.4 Coherence

Coherence measures how strongly the local region still belongs to one continuous fluid body.

This is crucial because exposure alone does not tell the story. Calm sheet water is exposed and coherent. A detached droplet is exposed and weakly coherent relative to the parent body.

19.4.1 Support Coherence

cohSupport_i = supportN_i

19.4.2 Density Coherence

cohDensity_i = saturate((rho_i - rho0) / (rho1 - rho0))

19.4.3 Velocity Continuity

Define a directional continuity term using neighboring velocity alignment:

cohVel_i = average over j in N(i) of ((1 + dot(vhat_i, vhat_j)) * 0.5)

where vhat is a normalized velocity direction when speed is above a small threshold.

19.4.4 Combined Coherence

C_i = saturate(aC * cohSupport_i + bC * cohDensity_i + cC * cohVel_i)

19.4.5 Interpretation

high C_i: coherent sheet, rolling wave, bulk body

medium C_i: cresting branch, proto-filament, ligament precursor

low C_i: detached droplets, mist, strongly fragmented spray

19.5 Restfulness and Wave Validity

The thesis needs a formal distinction between calm coherent wave motion and actual breakup conditions.

19.5.1 Restfulness

Define restfulness as high when motion is calm, deformation is low, and ballistic upward aggression is low:

R_i = (1 - speedN_i)^pS * (1 - strainN_i)^pStrain * (1 - upAgg_i)^pUp

This is a compact score for whether the region is calm enough to support the sheet regime.

19.5.2 Wave Validity

Define wave-valid motion as exposed, coherent, non-ballistic motion that is not yet breaking apart:

W_i = E_i * C_i * (1 - upAgg_i) * (1 - B_i)

where B_i is breakup instability defined later.

Wave-validity is the quantity that justifies using a smooth coherent top-envelope representation instead of fragmentation logic.

19.6 Sheetness and Rollingness

The architecture needs at least two coherent-surface regime scores.

19.6.1 Sheetness

Sheetness should be high for exposed, coherent, calm, upward-facing water:

Sheet_i = E_i^qE * C_i^qC * R_i^qR * topness_i^qTop

This expresses how strongly the region belongs to the calm-sheet regime.

19.6.2 Rollingness

Rollingness should be high for exposed, coherent water that is active but not breaking:

Roll_i = E_i^rE * C_i^rC * speedN_i^rSpeed * (1 - upAgg_i)^rUp * (1 - B_i)^rBreak

19.6.3 Interpretation

high Sheet_i, low Roll_i: calm sheet

moderate Sheet_i, high Roll_i: rolling coherent wave skin

low Sheet_i, low Roll_i, high breakup: fragmentation regime

19.7 Elongation

Elongation measures the tendency to form a trail, branch, or filament.

It must not depend on speed alone.

19.7.1 Motion Contribution

elongSpeed_i = speedN_i

19.7.2 Strain Contribution

elongStrain_i = strainN_i

19.7.3 Anisotropy Contribution

If local covariance or directional support eigenvalues are available, define an anisotropy score. If the local support covariance has eigenvalues lam1 >= lam2 >= lam3, a simple anisotropy score is:

anis_i = saturate((lam1 - lam2) / (lam1 + eps))

19.7.4 Combined Elongation

L_i = saturate(aL * elongSpeed_i + bL * elongStrain_i + cL * anis_i)

High L_i means the local region is becoming branch-like or trail-like.

19.8 Thinning

Thinning measures whether a coherent structure is narrowing toward breakup.

19.8.1 Instantaneous Thinning

T_i = thin_i

19.8.2 Thinning Age

A transient narrow state should not instantly trigger fragmentation. Therefore define a time-integrated thinning age:

dThinAge_i/dt = kThin * max(0, T_i - T_enter) - dThin * ThinAge_i

This allows the system to reward persistent thinning and suppress chatter.

19.9 Breakup Instability

Breakup instability is the master signal that drives transition from coherent sheet to filament hierarchy.

A good breakup metric should:

require exposure

increase with elongation

increase with thinning

increase as coherence falls

increase with ballistic or ejective motion

avoid firing on one-frame noise

19.9.1 Instantaneous Breakup Instability

Binst_i = E_i^bE * L_i^bL * T_i^bT * (1 - C_i)^bC * upAgg_i^bUp

This multiplicative structure is intentional. If exposure is low, or coherence is still very high, breakup should stay suppressed.

19.9.2 Breakup Age

dBreakAge_i/dt = kBreak * max(0, Binst_i - B_enter) - dBreak * BreakAge_i

19.9.3 Effective Breakup Instability

B_i = saturate(mB * Binst_i + nB * BreakAge_i)

19.9.4 Interpretation

low B_i: coherent sheet or rolling water

medium B_i: proto-filament candidate

high B_i: ligament, bead-chain, and droplet-spawn regime

19.10 Top-Envelope Validity

The visible surface should only be treated as heightfield-like where that assumption is locally valid.

Define top-envelope validity as:

Venv_i = Sheet_i + kRoll * Roll_i - kBreak * B_i - kOver * Overhang_i

Then clamp:

VenvN_i = saturate(Venv_i)

Overhang_i is a penalty term for regions that are becoming multi-valued, inverted, or underside-dominant. In early versions it may be approximated from conflicting normals, underside exposure, or extreme local vertical inversion.

High VenvN_i means the surface may safely favor a top-envelope or heightfield-like reconstruction.

19.11 Proto-Filament Potential

A region becomes a proto-filament source when it is exposed, elongated, thinning, and no longer best represented as calm or rolling sheet.

Pproto_i = E_i^pE * L_i^pL * T_i^pT * (1 - Sheet_i)^pSheet * (1 - C_i + epsC)^pC

A particle or local region becomes a proto-filament candidate when:

Pproto_i > PprotoEnter

with hysteresis, spawn budgets, and cooldowns.

19.12 Secondary-Entity Dynamics

Once the system enters the secondary breakup hierarchy, the mathematics shifts from particle-local classification to branch-local evolution.

Let a filament or ligament segment k carry:

x_k: position

v_k: velocity

t_k: tangent

r_k: thickness or local radius

age_k: age

attach_k: attachment to parent body

I_k: instability

neck_k: necking signal

19.12.1 Filament Thinning

A simple phenomenological thinning law is:

dr_k/dt = -lambdaR * I_k * r_k + lambdaM * mergeSupport_k

In free-flight thinning, mergeSupport_k may be zero.

19.12.2 Attachment Decay

dAttach_k/dt = -lambdaA * I_k * attach_k

Low attachment means the structure is nearing full detachment.

19.12.3 Necking Signal

A lightweight necking proxy can be:

neck_k = saturate(aN * I_k + bN / (r_k + eps) + cN * age_k)

This is not a literal capillary PDE. It is a practical control metric for the onset of bead-chain behavior.

19.12.4 Bead Readiness

Qbead_k = neck_k * (1 - attach_k)^qA * I_k^qI

High Qbead_k means the ligament should begin synthesizing bead-chain geometry or emitting bead precursors.

19.13 Droplet Detachment

Detached droplets should emerge from local bead maxima, neck collapse, and sufficient separation readiness.

For bead candidate m with bead radius rb_m, neck radius rn_m, separation impulse J_m, and attachment attach_m, define:

Detach_m = saturate(aD * (1 - rn_m / (rb_m + eps)) + bD * J_m + cD * (1 - attach_m))

A droplet detaches when:

Detach_m > DetachEnter

subject to spawn budget and lifetime policy.

19.13.1 Droplet Radius Distribution

Droplet radii must vary.

A simple rule is:

rd ~ D(mean = kR * rb_m, spread = sR * rb_m)

clamped to:

rMin <= rd <= rMax

The exact distribution can be log-normal, truncated normal, or artist-shaped. The critical point is that splash beads must not collapse to one uniform size.

19.14 Mist Potential

Mist represents the finest terminal breakup population.

A practical mist potential for detached fragment d is:

Mist_d = saturate(aM * 1/(rd + eps) + bM * impactEnergy_d + cM * instability_d)

Mist emission occurs only when this exceeds threshold and the per-frame mist budget permits it.

Mist should be sparse, short-lived, and biased toward violent small-scale breakup, not sprayed everywhere like a nervous lawn sprinkler.

19.15 Reabsorption Potential

A detached fragment should reabsorb when it re-enters dense coherent fluid under compatible relative motion.

For detached fragment f:

vf: fragment velocity

vbulk(xf): nearby bulk-fluid velocity sampled from the coherent body

phi(xf): local density/support field at the fragment position

Define relative speed:

dv_f = length(vf - vbulk(xf))

Define merge-velocity compatibility:

Umerge_f = 1 - saturate((dv_f - u0) / (u1 - u0))

Define density-contact score:

Kmerge_f = saturate((phi(xf) - phi0) / (phi1 - phi0))

Define downward-entry preference:

Zmerge_f = saturate((-dot(vf, up) - z0) / (z1 - z0))

Then:

Rmerge_f = Kmerge_f^rK * Umerge_f^rU * (deltaZ + Zmerge_f)^rZ

where deltaZ permits sideways or non-downward reabsorption when appropriate.

19.15.1 Reabsorption Age

To avoid ugly instant pop-delete on first contact:

dMergeAge_f/dt = kMerge * max(0, Rmerge_f - RmergeEnter) - dMerge * MergeAge_f

Once MergeAge_f exceeds threshold, the fragment is merged back into the coherent body and removed from the secondary system.

19.16 Hysteresis and State Stability

The whole architecture depends on hysteresis. Without it, the fluid will flicker between states like a haunted spreadsheet.

Every major transition should use some combination of:

separate enter and exit thresholds

age accumulators

cooldown timers

spawn budgets

decay memory

19.16.1 Generic Hysteretic Transition

For any state-driving score X, use:

X_enter for entering a state

X_exit for leaving it

require X_enter > X_exit

Then:

enter only if X > X_enter for sufficient age

remain while X > X_exit

exit only if X < X_exit persistently

This prevents threshold chatter and stabilizes the whole hierarchy.

19.17 Canonical State Bands

The following state bands define the conceptual operating zones.

19.17.1 Bulk Interior

E_i < Ebulk

19.17.2 Calm Sheet

E_i > Esheet

C_i > Csheet

Sheet_i > SheetEnter

B_i < Bsheet

and typically:

VenvN_i > VenvEnter

19.17.3 Rolling Sheet

E_i > Eroll

C_i > Croll

Roll_i > RollEnter

B_i < Broll

19.17.4 Proto-Filament Source

E_i > Eproto

L_i > Lproto

T_i > Tproto

B_i > Bproto

19.17.5 Ligament

For secondary segment k:

r_k < rLig

I_k > ILig

attach_k > attachMin

19.17.6 Bead Chain

Qbead_k > QbeadEnter

19.17.7 Droplet

Detach_m > DetachEnter

19.17.8 Mist

Mist_d > MistEnter

19.17.9 Reabsorption

MergeAge_f > MergeAgeEnter

19.18 Artist-Facing Control Space

A real build needs a compact control surface, not a raw altar of variables.

The most important high-level controls are:

calm-sheet flattening

rolling-sheet flattening

top-envelope bias

breakup sensitivity

filament taper rate

ligament instability gain

bead-chain bias

droplet radius range

mist aggressiveness

reabsorption speed

The mathematics above should map to these controls in a principled way.

19.19 Interpretation Layer

These equations are best understood as a governing control-field system.

They are not a claim that calm-sheet reconstruction, filament formation, bead-chain emergence, or mist emission are being solved from a complete capillary continuum model. They are a disciplined hybrid layer designed to make the fluid behave plausibly, beautifully, and stably in browser execution.

This thesis does not require purity theater. It requires a correct hierarchy of behaviors, stable state transitions, and enough structure that the system can be tuned without collapsing into threshold soup.










# Section 20. Detailed Runtime State Machine

## Purpose

This document expands the thesis into an explicit runtime state machine for the hybrid MLS-MPM fluid surface and breakup system. It defines:

* the state domains,
* the transition rules,
* the hysteresis structure,
* the cooldown and budget mechanisms,
* the relationship between primary and secondary populations,
* and the logic required to prevent threshold chatter, runaway spawning, and visual incoherence.

This section should be understood as the bridge between theory and implementation. It is the layer where derived quantities such as exposure, coherence, sheetness, rollingness, elongation, thinning, breakup instability, and reabsorption potential become operational decisions.

---

# 20.1. Runtime Philosophy

The system is not governed by one monolithic state. It is governed by two linked state domains:

1. **Primary fluid states** for the mass-carrying MLS-MPM body
2. **Secondary breakup states** for transient filament, droplet, and mist populations

The primary state machine determines how coherent fluid should be represented and when it becomes a breakup source. The secondary state machine governs the lifecycle of fragments once breakup begins.

The state machine must obey five core requirements:

1. **Continuity** — coherent water must remain coherent until sufficient evidence for breakup accumulates.
2. **Hysteresis** — state transitions must not flicker under noisy thresholds.
3. **Budget control** — breakup spawning must remain bounded.
4. **Reversibility where appropriate** — calm water may become rolling water and settle again; proto-filaments may briefly re-stabilize.
5. **Irreversibility where appropriate** — certain detached states should not unrealistically snap backward into earlier branch states without passing through merge-back logic.

---

# 20.2. State Domains

## 20.2.1. Primary Domain

The primary domain acts on fluid regions or primary particles. Its canonical states are:

* `P_BULK`
* `P_SHEET_CALM`
* `P_SHEET_ROLLING`
* `P_BREAKUP_SOURCE`

These states classify the coherent body.

## 20.2.2. Secondary Domain

The secondary domain acts on spawned breakup entities. Its canonical states are:

* `S_PROTO_FILAMENT`
* `S_LIGAMENT`
* `S_BEAD_CHAIN`
* `S_DROPLET_MACRO`
* `S_DROPLET_STD`
* `S_DROPLET_MICRO`
* `S_MIST`
* `S_REABSORBING`
* `S_DEAD`

These states classify the detached or semi-detached hierarchy.

---

# 20.3. Primary State Definitions

## 20.3.1. `P_BULK`

This state represents fluid that is not significantly exposed to air or not meaningful as a distinct visible surface regime.

### Required character

* low exposure
* high burial or strong support
* no immediate breakup relevance

### Visual meaning

This state contributes to the fluid body but is not itself a direct candidate for calm-sheet flattening or breakup spawning.

---

## 20.3.2. `P_SHEET_CALM`

This state represents exposed coherent fluid whose motion remains calm enough to justify strong surface-envelope treatment.

### Required character

* high exposure
* high coherence
* high sheetness
* low breakup instability
* high top-envelope validity

### Visual meaning

The surface may strongly favor flattening, top-envelope reconstruction, and ripple-preserving smoothing.

---

## 20.3.3. `P_SHEET_ROLLING`

This state represents exposed coherent wave skin with more active motion than calm sheet but without true fragmentation.

### Required character

* high exposure
* high coherence
* rollingness above threshold
* breakup instability still below fragmentation threshold

### Visual meaning

The surface remains coherent and smooth but permits stronger relief, directional bias, and reduced flattening.

---

## 20.3.4. `P_BREAKUP_SOURCE`

This state represents exposed coherent or semi-coherent fluid that has accumulated sufficient evidence to act as a parent source for secondary breakup entities.

### Required character

* high exposure
* sufficient elongation
* sufficient thinning
* sustained breakup instability

### Visual meaning

This state is the hand-off zone between coherent surface representation and explicit breakup hierarchy.

---

# 20.4. Secondary State Definitions

## 20.4.1. `S_PROTO_FILAMENT`

A newly spawned attached or near-attached branch emerging from a breakup source.

### Required character

* still continuous
* still visibly branch-like
* not yet necked into beads
* attachment still significant

### Visual meaning

Tapered stretched branch or streak.

---

## 20.4.2. `S_LIGAMENT`

A thinner and more unstable thread than the proto-filament.

### Required character

* thinning increasing
* instability increasing
* still continuous enough to remain branch-like

### Visual meaning

Narrow unstable filament with strong taper and imminent necking.

---

## 20.4.3. `S_BEAD_CHAIN`

A ligament whose necking signal has crossed threshold and now exhibits alternating thick and thin structure.

### Required character

* high necking readiness
* attachment reduced but not necessarily zero
* local bead structure available or synthesizable

### Visual meaning

Pearl-chain structure bridging thread and droplets.

---

## 20.4.4. `S_DROPLET_MACRO`

A detached large droplet, typically emitted from a major bead or violent snap.

## 20.4.5. `S_DROPLET_STD`

A normal detached droplet.

## 20.4.6. `S_DROPLET_MICRO`

A small detached droplet approaching mist scale.

### Shared character

* detached
* ballistic or drag-driven
* reabsorption candidate on fluid contact

---

## 20.4.7. `S_MIST`

The smallest spray population.

### Required character

* very small scale
* short lifetime
* high event-count but low individual importance

### Visual meaning

Soft, ephemeral terminal spray.

---

## 20.4.8. `S_REABSORBING`

A temporary merge-back state for fragments that have contacted coherent fluid and are accumulating merge age.

### Required character

* contact with coherent fluid field
* sufficient merge compatibility
* no immediate bounce-back into free spray

### Visual meaning

The fragment is no longer a free independent entity, but not yet removed.

---

## 20.4.9. `S_DEAD`

Terminal state for expired or fully merged secondary entities.

---

# 20.5. Primary Transition Logic

This section defines the primary-domain transitions using explicit enter and exit rules.

## 20.5.1. `P_BULK -> P_SHEET_CALM`

Enter calm sheet when:

* `E > E_sheet_enter`
* `C > C_sheet_enter`
* `Sheet > Sheet_enter`
* `B < B_sheet_enter`
* `Venv > Venv_enter`
* and conditions persist for `t_sheet_enter`

Exit condition back toward bulk:

* `E < E_sheet_exit`
* or `C < C_sheet_exit`
* persisting for `t_sheet_exit`

Constraint:
`E_sheet_enter > E_sheet_exit`, `C_sheet_enter > C_sheet_exit`

This creates hysteresis and prevents flicker when the surface hovers near exposure thresholds.

---

## 20.5.2. `P_SHEET_CALM -> P_SHEET_ROLLING`

Enter rolling sheet when:

* `Roll > Roll_enter`
* `speedN > speed_roll_enter`
* `B < B_roll_cap`
* and `upAgg < up_roll_cap`
* persisting for `t_roll_enter`

Exit back to calm sheet when:

* `Roll < Roll_exit`
* or `R > Rest_recover_enter`
* persisting for `t_roll_exit`

This allows ordinary wave motion to move between calm and rolling regimes without falsely becoming breakup.

---

## 20.5.3. `P_SHEET_ROLLING -> P_BREAKUP_SOURCE`

Enter breakup source when:

* `E > E_break_enter`
* `L > L_break_enter`
* `T > T_break_enter`
* `B > B_break_enter`
* and `BreakAge > BreakAge_enter`
* optionally with `Pproto > Pproto_enter`

Exit back to rolling sheet when:

* `B < B_break_exit`
* and `L < L_break_exit`
* and `T < T_break_exit`
* persisting for `t_break_exit`

This is the crucial gate between coherent wave behavior and explicit fragmentation.

---

## 20.5.4. `P_SHEET_CALM -> P_BREAKUP_SOURCE`

This path should be rare but legal.

Direct calm-sheet to breakup-source transition is allowed when a localized violent event occurs, such as:

* sudden impact
* sudden upward impulse
* strong local ejection

Required condition:

* `impactEvent = true` or `upAgg > up_break_direct`
* plus `B > B_break_direct`
* plus short persistence or explicit impulse event latch

This prevents the architecture from being unrealistically forced through a long rolling phase when the water is abruptly disturbed.

---

## 20.5.5. `P_BREAKUP_SOURCE -> P_SHEET_ROLLING`

If breakup conditions relax before substantial secondary spawning occurs, the source may return to coherent wave behavior.

Enter rolling recovery when:

* `B < B_recover_enter`
* `C > C_recover_enter`
* `L < L_recover_enter`
* `T < T_recover_enter`
* and no active spawn latch remains

This prevents every temporary crest from becoming a permanent fragment factory.

---

## 20.5.6. `P_BREAKUP_SOURCE -> P_BULK`

This should be unusual. It occurs when the region ceases to be meaningfully exposed.

Required condition:

* `E < E_bulk_return`
* persisting for `t_bulk_return`

---

# 20.6. Secondary Transition Logic

## 20.6.1. Spawn Rule: `P_BREAKUP_SOURCE -> S_PROTO_FILAMENT`

Spawning a proto-filament is not automatic for every breakup-source particle. A source must satisfy both state validity and spawn policy.

### Spawn validity

* `Pproto > Pproto_spawn`
* `BreakAge > BreakAge_spawn`
* `cooldownPrimary <= 0`

### Spawn policy

* within frame spawn budget
* within local density of active secondary entities
* within visibility/importance budget if desired

### Spawn result

* create a proto-filament entity
* initialize tangent from local flow direction or dominant anisotropy axis
* initialize thickness from parent support scale
* initialize attachment high
* initialize instability from local `B`

Then set parent source cooldown.

---

## 20.6.2. `S_PROTO_FILAMENT -> S_LIGAMENT`

Enter ligament when:

* `thinSeg > thin_lig_enter`
* `instability > inst_lig_enter`
* `age > age_lig_enter`
* `attach > attach_lig_min`

Exit back to proto-filament when:

* `thinSeg < thin_lig_exit`
* and `instability < inst_lig_exit`
* persisting for `t_lig_exit`

This limited reversibility is allowed because early branches may briefly re-stabilize.

---

## 20.6.3. `S_LIGAMENT -> S_BEAD_CHAIN`

Enter bead-chain when:

* `neck > neck_bead_enter`
* `Qbead > Qbead_enter`
* `age > age_bead_enter`

Exit back to ligament only if:

* `neck < neck_bead_exit`
* `Qbead < Qbead_exit`
* and no detached children have yet been emitted

Once repeated detachment has begun, full reversal should usually be suppressed.

---

## 20.6.4. `S_BEAD_CHAIN -> S_DROPLET_*`

Detachment occurs at one or more bead candidates when:

* `Detach > Detach_enter`
* local neck collapse criterion satisfied
* detach cooldown <= 0
* droplet spawn budget available

The emitted droplet class depends on radius:

* `r >= r_macro_min` -> `S_DROPLET_MACRO`
* `r_micro_max < r < r_macro_min` -> `S_DROPLET_STD`
* `r <= r_micro_max` -> `S_DROPLET_MICRO`

The parent bead-chain may remain alive after partial droplet emission.

This is important. Real breakup is often progressive, not one-frame total annihilation.

---

## 20.6.5. `S_LIGAMENT -> S_DROPLET_*` (direct snap)

Direct ligament-to-droplet transition is allowed when:

* `instability > inst_snap_enter`
* `attach < attach_snap_max`
* `thinSeg > thin_snap_enter`
* or a violent impulse event occurs

This handles fast snaps where bead-chain visualization is too brief or too fine to justify a long intermediate stage.

---

## 20.6.6. `S_DROPLET_MICRO -> S_MIST`

Enter mist when:

* `Mist > Mist_enter`
* and either high impact energy or very small radius is present
* and mist budget is available

This can occur either by converting micro-droplets into mist entities or by emitting mist from them while killing or shrinking the parent.

---

## 20.6.7. `S_DROPLET_* -> S_REABSORBING`

Enter reabsorbing state when:

* `Rmerge > Rmerge_enter`
* `MergeAge` begins accumulating
* local coherent-fluid contact is present

Exit back to free droplet when:

* contact is lost
* or `Rmerge < Rmerge_exit`
* before merge age threshold completes

This prevents droplets from instantly disappearing the moment they graze the parent surface.

---

## 20.6.8. `S_REABSORBING -> S_DEAD`

When:

* `MergeAge > MergeAge_enter`

At this point the fragment is considered merged back into the coherent body. The system should optionally deposit visual or momentum cues into the main fluid representation before removing the entity.

---

## 20.6.9. Lifetime Death

Any secondary entity may transition to `S_DEAD` if:

* `age > lifetime`
* entity leaves relevant bounds
* contribution falls below visibility threshold
* or explicit culling is required by budget policy

Mist especially should be aggressively lifetime-bounded.

---

# 20.7. Hysteresis Structure

Hysteresis is not optional. It is a first-class stabilizer.

## 20.7.1. Entry/Exit Threshold Pairs

Every state-driving quantity should use paired thresholds:

* `enter`
* `exit`

with:

* `enter > exit` for positive-going activation
* `enter < exit` for negative-going deactivation where appropriate

Examples:

* `Sheet_enter`, `Sheet_exit`
* `Break_enter`, `Break_exit`
* `Qbead_enter`, `Qbead_exit`
* `Rmerge_enter`, `Rmerge_exit`

This prevents state thrashing when a value hovers near threshold.

---

## 20.7.2. Age Accumulators

Entry into important states should usually require persistence.

Canonical accumulators:

* `BreakAge`
* `ThinAge`
* `MergeAge`
* optional `NeckAge`

Generic form:

`dAge/dt = kEnter * max(0, X - X_enter) - kDecay * Age`

A state becomes active only when `Age > Age_enter`.

This provides temporal memory and suppresses one-frame noise.

---

## 20.7.3. Cooldowns

Cooldowns prevent repeated instant respawn or rapid oscillation.

Recommended cooldowns:

* `cooldownPrimarySpawn`
* `cooldownDetach`
* `cooldownMerge`
* `cooldownMist`

Example rule:

After a breakup source spawns a proto-filament, set `cooldownPrimarySpawn = t_spawn_cd`. While this cooldown is positive, the same source cannot spawn again.

This stops pathological particle machine-gunning.

---

## 20.7.4. Latches

Some events should be latched for a short time even if the raw driving score falls immediately.

Useful latches:

* impact latch
* detach latch
* merge-contact latch

An impact latch is especially useful for direct calm-sheet to breakup-source transitions caused by strong collisions.

---

# 20.8. Spawn Budgets and Population Control

The breakup hierarchy must remain bounded.

## 20.8.1. Global Budgets

Recommended per-frame or rolling budgets:

* `maxProtoPerFrame`
* `maxLigamentsActive`
* `maxDropletsPerFrame`
* `maxDropletsActive`
* `maxMistPerFrame`
* `maxMistActive`

## 20.8.2. Local Density Limits

In addition to global budgets, each local region should have a cap on active secondary entities.

This prevents overpopulation of breakup structures in one crest region.

## 20.8.3. Priority Ranking

When more candidates exist than budget permits, rank them by a priority score such as:

`Priority = w1 * B + w2 * exposure + w3 * elongation + w4 * viewImportance + w5 * eventImportance`

This ensures the most important breakup events survive budget pressure.

---

# 20.9. State Ownership and Parent-Child Relationships

Secondary entities should retain a notion of parentage.

## 20.9.1. Parent Source Reference

Each secondary entity should store:

* parent primary id or region id
* parent spawn time or generation id
* optional chain id for grouped branch systems

## 20.9.2. Ownership Use Cases

Parentage is useful for:

* preventing duplicate local spawning
* reabsorption attribution
* visual coherence of branch families
* debugging lineage

## 20.9.3. Ownership Decay

Once a droplet has existed long enough or moved far enough from the source, parent identity may matter less. At that point the entity may become effectively independent except for merge-back logic.

---

# 20.10. Reversibility and Irreversibility Rules

Not all state transitions should be equally reversible.

## 20.10.1. Reversible Zones

These transitions should be allowed to reverse:

* `P_SHEET_CALM <-> P_SHEET_ROLLING`
* `P_SHEET_ROLLING <-> P_BREAKUP_SOURCE` if fragmentation has not meaningfully spawned
* `S_PROTO_FILAMENT <-> S_LIGAMENT` in early branch life
* `S_DROPLET_* <-> S_REABSORBING` while merge is incomplete

## 20.10.2. Weakly Reversible Zones

These transitions may reverse only in limited cases:

* `S_LIGAMENT <-> S_BEAD_CHAIN` before significant detachment

## 20.10.3. Irreversible Zones

These transitions should generally be treated as one-way:

* `S_BEAD_CHAIN -> detached droplet emission` once multiple detachments have occurred
* `S_REABSORBING -> S_DEAD`
* `S_DEAD` to anything else

This preserves believable lifecycle progression.

---

# 20.11. Canonical Update Order

The state machine should be evaluated in a stable order each frame or simulation step.

## 20.11.1. Primary Update Order

1. compute derived state quantities for primaries
2. update primary age accumulators
3. resolve primary state transitions
4. determine breakup-source candidates
5. enforce primary spawn cooldowns and budgets

## 20.11.2. Secondary Update Order

1. update existing secondary kinematics
2. update secondary state quantities
3. update thinning, necking, and merge accumulators
4. resolve secondary state transitions
5. emit droplets or mist subject to budgets
6. update reabsorption states
7. cull dead entities

This order prevents contradictory evaluation where a newly spawned entity is instantly reclassified multiple times in one frame.

---

# 20.12. Canonical Transition Table

## Primary Domain

* `P_BULK -> P_SHEET_CALM`
* `P_SHEET_CALM -> P_BULK`
* `P_SHEET_CALM -> P_SHEET_ROLLING`
* `P_SHEET_ROLLING -> P_SHEET_CALM`
* `P_SHEET_ROLLING -> P_BREAKUP_SOURCE`
* `P_SHEET_CALM -> P_BREAKUP_SOURCE` (rare direct event path)
* `P_BREAKUP_SOURCE -> P_SHEET_ROLLING`
* `P_BREAKUP_SOURCE -> P_BULK` (rare burial path)

## Secondary Domain

* `spawn -> S_PROTO_FILAMENT`
* `S_PROTO_FILAMENT -> S_LIGAMENT`
* `S_LIGAMENT -> S_PROTO_FILAMENT` (limited)
* `S_LIGAMENT -> S_BEAD_CHAIN`
* `S_BEAD_CHAIN -> S_LIGAMENT` (limited, pre-detach only)
* `S_BEAD_CHAIN -> S_DROPLET_*`
* `S_LIGAMENT -> S_DROPLET_*` (direct snap)
* `S_DROPLET_MICRO -> S_MIST`
* `S_DROPLET_* -> S_REABSORBING`
* `S_REABSORBING -> S_DEAD`
* `any secondary -> S_DEAD` by lifetime or cull

---

# 20.13. Failure Modes This State Machine Prevents

This explicit structure exists to prevent common catastrophic behaviors.

## 20.13.1. Threshold Flicker

Without hysteresis, the fluid chatters between calm sheet, rolling sheet, and breakup-source states.

## 20.13.2. Spawn Machine-Gunning

Without cooldowns and budgets, one crest emits absurd numbers of secondary entities.

## 20.13.3. Fake Binary Splashing

Without intermediate filament and bead-chain states, breakup jumps directly from coherent surface to equal-size droplets.

## 20.13.4. Immortal Spray Confetti

Without reabsorption and lifetime death, the scene fills with permanent tiny fragments.

## 20.13.5. Unrealistic Forced Irreversibility

Without limited reversibility, small wave crests cannot calm back down and every disturbance becomes catastrophic.

---

# 20.14. Operational Summary

The runtime state machine can be summarized as follows:

1. Classify coherent fluid into bulk, calm sheet, rolling sheet, or breakup source.
2. Require exposure, elongation, thinning, and persistent breakup evidence before spawning secondary branches.
3. Evolve secondary branches from proto-filament to ligament to bead-chain.
4. Emit droplets progressively rather than all at once.
5. Convert only the smallest and most violent terminal fragments into mist.
6. Merge detached fragments back into the coherent body through an explicit reabsorbing state.
7. Bound everything with hysteresis, cooldowns, spawn budgets, and lifetime rules.

This transforms the hierarchy from a poetic idea into an executable behavioral doctrine.

---

# 20.15. Next Expansion Targets After Section 20

The strongest next sections to build are:

1. **GPU data structures, buffer schemas, and bind-group architecture**
2. **Sheet-envelope reconstruction theory and top-envelope extraction**
3. **Filament and bead-chain geometry synthesis**
4. **Droplet ballistic motion, drag, and merge-back deposition**
5. **Budgeting, scheduling, diagnostics, and visual debugging tools**




# Section 21. GPU Data Model and Pipeline Architecture

## Purpose

This document expands the thesis into an implementation-oriented GPU architecture for the hybrid MLS-MPM fluid surface and breakup system.

The goal of this section is to define a browser-feasible data model and pass architecture for:

* the primary MLS-MPM fluid body,
* the derived surface-state layer,
* the calm-sheet and rolling-sheet envelope system,
* the secondary breakup hierarchy,
* and the diagnostic and budgeting infrastructure required to keep the system stable.

This section does not yet prescribe final WGSL code. Instead, it defines the conceptual storage layout, buffer responsibilities, bind-group boundaries, and frame-step ordering that a production implementation can use as a canonical reference.

---

# 21.1. Architectural Philosophy

The GPU architecture must satisfy four competing demands:

1. **Continuity with the existing MLS-MPM solver**
2. **Separation of truth from representation**
3. **Bounded secondary complexity**
4. **Browser viability under real memory and dispatch constraints**

The most important design decision is this:

**The primary solver data and the secondary breakup data must remain distinct.**

The bulk fluid particles remain the mass-and-momentum truth. The surface-state system remains a derived classification layer. The breakup hierarchy remains a bounded transient population. This separation is what prevents the entire engine from collapsing into one giant shape-shifting particle soup.

---

# 21.2. High-Level GPU Domains

The implementation is divided into five major GPU domains.

## 21.2.1. Primary Solver Domain

This domain stores and updates the core MLS-MPM body.

Responsibilities:

* primary particle state
* grid transfer
* density and pressure-related intermediate data
* any existing APIC / MLS-MPM structures

## 21.2.2. Surface-State Domain

This domain derives classification and surface-driving quantities from the primary fluid.

Responsibilities:

* exposure
* coherence
* sheetness
* rollingness
* elongation
* thinning
* breakup instability
* breakup age
* envelope validity
* flags for breakup-source candidacy

## 21.2.3. Envelope Domain

This domain supports calm-sheet and rolling-sheet reconstruction.

Responsibilities:

* top-envelope extraction
* sheet smoothing fields
* rolling surface shaping fields
* optional thickness and normal support layers

## 21.2.4. Secondary Breakup Domain

This domain stores and updates transient breakup structures.

Responsibilities:

* proto-filaments
* ligaments
* bead chains
* droplets
* mist
* reabsorbing entities
* spawn and death control

## 21.2.5. Control and Diagnostics Domain

This domain stores counters, budgets, indirect arguments, debug state, and statistics.

Responsibilities:

* active counts
* append allocators
* per-frame budgets
* pass dispatch arguments
* debug visualization state
* profiling-friendly counters

---

# 21.3. Population Model

The runtime system operates on three principal populations.

## 21.3.1. Population A — Primary Particles

These are the solver particles.

They represent:

* bulk fluid mass
* coherent sheet source material
* the parent source for breakup

They should remain fixed-format and relatively stable in count.

## 21.3.2. Population B — Derived Surface States

These are not independent physical particles. They are per-primary or per-region metadata records.

They represent:

* how a primary region should be interpreted visually
* whether the region is calm sheet, rolling sheet, or breakup source
* whether the local surface may become top-envelope driven

## 21.3.3. Population C — Secondary Breakup Entities

These are transient dynamic entities.

They represent:

* branches
* ligaments
* bead chains
* droplets
* mist
* reabsorbing fragments

They must be strongly budgeted and lifetime-controlled.

---

# 21.4. Core Buffer Taxonomy

The GPU architecture should be described in terms of canonical buffer families.

## 21.4.1. Primary Particle Buffers

These already exist in some form in the current solver and remain the core truth.

Recommended conceptual fields:

* position
* velocity
* affine field
* density
* material or phase flags if needed later

### Canonical record

```text
PrimaryParticle
- position : vec4
- velocity : vec4
- affine0  : vec4
- affine1  : vec4
- affine2  : vec4
- density  : float
- padding / future fields
```

In practice, this may remain split across multiple buffers if the current solver already uses separate layouts for performance or compatibility reasons.

---

## 21.4.2. Primary Surface-State Buffer

This is the most important new derived buffer.

Each primary particle or primary-surface representative should have a corresponding derived state record.

### Canonical record

```text
PrimarySurfaceState
- stateFlags         : uint
- exposure           : float
- coherence          : float
- sheetness          : float
- rollingness        : float
- elongation         : float
- thinning           : float
- breakupInstability : float
- breakupAge         : float
- envelopeValidity   : float
- topness            : float
- supportRadius      : float
- spawnCooldown      : float
- reserved           : float
```

### Role

This buffer decouples classification from solver truth. It lets the implementation compute and evolve surface logic without mutating the core fluid particle format.

---

## 21.4.3. Envelope Support Buffers

These buffers support calm-sheet and rolling-sheet reconstruction.

Depending on implementation strategy, they may be stored as textures, linear storage buffers, or both.

### Candidate fields

* envelope height
* envelope confidence
* envelope thickness
* envelope normal
* envelope smoothing weight
* rolling-shape bias

### Canonical layout options

#### Option A — 2.5D sheet-space grid

A sheet-aligned grid storing top-envelope values.

#### Option B — 3D sparse or dense volume support

A volumetric representation storing upper-envelope candidates and thickness information.

#### Option C — Screen-independent projected support atlas

A domain-specific atlas for local calm-sheet reconstruction.

The choice depends on how global or local the calm-sheet reconstruction becomes. For early versions, a structured grid is the least insane starting point.

---

## 21.4.4. Secondary Filament Buffer

This buffer stores proto-filaments, ligaments, and bead-chain carriers.

### Canonical record

```text
SecondaryFilament
- position        : vec4
- velocity        : vec4
- tangent         : vec4
- thickness       : float
- age             : float
- lifetime        : float
- instability     : float
- necking         : float
- attachment      : float
- stateFlags      : uint
- parentId        : uint
- chainId         : uint
- cooldown        : float
- alive           : uint
- reserved
```

### Notes

* `stateFlags` encode proto-filament, ligament, or bead-chain mode.
* `parentId` links back to the source region or primary particle group.
* `chainId` allows multiple segments to be grouped visually or diagnostically.

---

## 21.4.5. Secondary Droplet Buffer

This buffer stores macro-droplets, standard droplets, and micro-droplets.

### Canonical record

```text
SecondaryDroplet
- position        : vec4
- velocity        : vec4
- radius          : float
- age             : float
- lifetime        : float
- drag            : float
- wetness         : float
- mergePotential  : float
- mergeAge        : float
- visualStretch   : float
- stateFlags      : uint
- parentId        : uint
- cooldown        : float
- alive           : uint
- reserved
```

### Notes

This buffer handles detached fragments that are still individually important.

---

## 21.4.6. Secondary Mist Buffer

Mist should not be forced into the exact same cost structure as large droplets.

### Canonical record

```text
SecondaryMist
- position       : vec4
- velocity       : vec4
- scale          : float
- age            : float
- lifetime       : float
- opacity        : float
- drag           : float
- stateFlags     : uint
- parentId       : uint
- alive          : uint
- reserved
```

Mist must be cheap, short-lived, and highly budgeted.

---

## 21.4.7. Counter and Allocator Buffers

These buffers are essential for safe append-style spawning.

### Required counters

* active filament count
* active droplet count
* active mist count
* emitted filament count this frame
* emitted droplet count this frame
* emitted mist count this frame
* dead-count or recycle-count if using free lists

### Canonical control record

```text
PopulationCounters
- activeFilaments
- activeDroplets
- activeMist
- emittedFilamentsFrame
- emittedDropletsFrame
- emittedMistFrame
- recycledFilaments
- recycledDroplets
- recycledMist
```

These may be split if alignment or indirect-dispatch usage demands it.

---

## 21.4.8. Budget Buffer

This buffer stores adjustable limits.

### Canonical record

```text
BudgetConfig
- maxFilamentsActive
- maxDropletsActive
- maxMistActive
- maxFilamentsPerFrame
- maxDropletsPerFrame
- maxMistPerFrame
- maxLocalChildrenPerSource
- maxChainSegments
```

This lets the CPU or UI update budgets without recompiling logic.

---

## 21.4.9. Indirect Dispatch / Draw Argument Buffers

If the implementation uses indirect dispatch or draw for variable-size populations, separate argument buffers should be maintained for:

* filament update dispatch
* droplet update dispatch
* mist update dispatch
* filament render draw
* droplet render draw
* mist render draw

These buffers allow the pipeline to scale work to the active population rather than dispatching maximum-capacity work every frame.

---

## 21.4.10. Debug and Statistics Buffers

A hybrid system this complex needs explicit observability.

Recommended diagnostic storage:

* count per primary state
* count per secondary state
* spawn rejection reasons
* reabsorption success count
* average breakup instability
* average envelope validity
* overflow or budget-hit counts
* debug-selected source lineage

Without this, tuning becomes ritual sacrifice.

---

# 21.5. Texture and Grid Resources

Not every derived field belongs in a linear buffer. Some belong in textures or structured grids.

## 21.5.1. Density Grid

This already exists conceptually in the current design and remains a major shared resource.

Uses:

* exposure estimation
* coherence support
* surface normal estimation
* reabsorption testing
* envelope extraction

## 21.5.2. Envelope Grid / Texture

This stores the calm-sheet or rolling-sheet reconstruction support.

Possible fields:

* top height
* lower height or thickness
* confidence
* smoothing weight
* normal support

## 21.5.3. Thickness / Support Atlas

A separate atlas may be used if local surface thickness and support width need to be sampled efficiently without overloading the density grid.

## 21.5.4. Optional Lineage / ID Texture

For advanced debugging or view-dependent rendering, a texture or buffer storing source IDs or local family IDs may be useful.

---

# 21.6. Structure-of-Arrays vs Array-of-Structures

This architecture can be implemented with either AoS or SoA layouts, but the recommended strategy is **hybrid**.

## 21.6.1. Use AoS when

* records are small and always accessed together
* logic is easier to maintain that way
* alignment cost is acceptable

## 21.6.2. Use SoA when

* only a few fields are touched in hot loops
* render and update passes use different subsets
* bandwidth matters more than convenience

## 21.6.3. Recommended approach

* primary solver data: preserve whatever layout is already optimal in the MLS-MPM path
* primary surface-state data: AoS at first, possibly split later if profiling demands it
* secondary droplets and mist: often better as AoS initially for sanity
* counters and budgets: compact dedicated control buffers

The first implementation should optimize for **clarity plus reasonable alignment**, not maximum premature cleverness.

---

# 21.7. Double Buffering and Ping-Pong Policy

Not all populations require the same buffering strategy.

## 21.7.1. Primary Solver Buffers

These likely already use a solver-specific update scheme. Keep that architecture intact unless there is a compelling reason to refactor it.

## 21.7.2. Primary Surface-State Buffer

This can usually be rewritten fresh each frame from the current solver state.

That means full ping-pong is not always necessary. A single writable state buffer may suffice if no pass needs the previous-frame classification after update.

## 21.7.3. Secondary Populations

Secondary entities usually benefit from ping-pong or staged append/update patterns.

Recommended pattern:

* input active buffer
* output updated buffer
* append new children into a fresh append region or separate spawn buffer
* compact or merge after update

If full ping-pong is too expensive, an in-place update plus alive-flag compaction pass may also work, but it must be handled carefully.

---

# 21.8. State Flags and Bitfields

State should be represented with explicit flags rather than vague numeric magic.

## 21.8.1. Primary Flags

Recommended flags:

* `PRIMARY_BULK`
* `PRIMARY_SHEET_CALM`
* `PRIMARY_SHEET_ROLLING`
* `PRIMARY_BREAKUP_SOURCE`
* `PRIMARY_CAN_SPAWN`
* `PRIMARY_ENVELOPE_VALID`
* `PRIMARY_DEBUG_SELECTED`

## 21.8.2. Secondary Flags

Recommended flags:

* `SEC_PROTO`
* `SEC_LIGAMENT`
* `SEC_BEAD_CHAIN`
* `SEC_DROPLET_MACRO`
* `SEC_DROPLET_STD`
* `SEC_DROPLET_MICRO`
* `SEC_MIST`
* `SEC_REABSORBING`
* `SEC_ALIVE`
* `SEC_PENDING_KILL`

## 21.8.3. Why flags matter

Flags allow:

* efficient filtering in update passes
* diagnostic coloring
* multi-condition rendering
* future extension without fragile enum breakage

---

# 21.9. Bind-Group Architecture

The bind-group architecture should reflect domain separation.

A practical organization is as follows.

## 21.9.1. Group A — Global Uniforms / Frame Config

Contains:

* time step
* simulation constants
* budgets
* thresholds
* camera-independent control values
* debug toggles

## 21.9.2. Group B — Primary Solver Resources

Contains:

* primary particle buffers
* grid buffers
* density intermediates
* solver-only state

## 21.9.3. Group C — Derived Surface-State Resources

Contains:

* primary surface-state buffer
* envelope support textures / buffers
* any support-field sampling resources used for classification

## 21.9.4. Group D — Secondary Breakup Resources

Contains:

* filament buffer(s)
* droplet buffer(s)
* mist buffer(s)
* counters / allocators
* indirect args if grouped here

## 21.9.5. Group E — Debug / Diagnostics

Contains:

* statistics buffers
* debug visualization toggles
* selection and lineage data

This grouping reduces pass confusion and makes future modularization easier.

---

# 21.10. Pass Ownership Model

Each major pass should have a clear ownership boundary.

## 21.10.1. Solver Passes own

* primary particle truth
* grid and density truth
* material transport

## 21.10.2. Surface Classification Pass owns

* derived primary surface-state output
* breakup-source flags
* envelope-valid flags

## 21.10.3. Envelope Pass owns

* calm-sheet support fields
* rolling-sheet shaping fields
* top-envelope confidence

## 21.10.4. Breakup Spawn Pass owns

* creating secondary proto-filaments
* enforcing source cooldown and spawn budget

## 21.10.5. Secondary Update Passes own

* filament evolution
* bead readiness
* droplet motion
* mist motion
* reabsorbing-state advancement

## 21.10.6. Composite Render Pass owns

* reading all final visible populations
* blending sheet envelope with breakup entities
* final visual arbitration between coherent and fragmented regimes

This ownership model prevents two passes from silently fighting over the same conceptual truth.

---

# 21.11. Canonical Frame Graph

The GPU pipeline should follow a stable high-level order.

## 21.11.1. Stage 1 — Solve Primary Fluid

* update primary particles
* update grid
* compute density-related fields

## 21.11.2. Stage 2 — Derive Surface State

* compute exposure
  n- compute coherence
* compute sheetness, rollingness, elongation, thinning
* compute breakup instability and age
* update primary flags

## 21.11.3. Stage 3 — Build Envelope Fields

* derive top-envelope support
* compute envelope confidence
* compute thickness or support atlas if needed

## 21.11.4. Stage 4 — Spawn Breakup Entities

* evaluate primary breakup sources
* allocate proto-filament entities
* apply budgets and source cooldowns

## 21.11.5. Stage 5 — Update Secondary Entities

* update filaments
* update ligament / bead-chain evolution
* emit droplets
* update droplets
* emit or update mist
* update reabsorbing entities

## 21.11.6. Stage 6 — Compact / Count / Prepare Render

* compact dead entities if needed
* write indirect args
* update statistics

## 21.11.7. Stage 7 — Composite Final Fluid

* render coherent sheet envelope
* render rolling sheet support
* render filaments
* render droplets
* render mist
* blend final output

This ordering should remain stable unless profiling proves a different arrangement materially better.

---

# 21.12. Allocation Strategy

The architecture should avoid per-frame CPU-managed dynamic memory churn.

## 21.12.1. Fixed-Capacity Pools

Recommended for:

* filaments
* droplets
* mist

Each population gets a maximum capacity and an active count.

## 21.12.2. Append + Compact Model

Recommended workflow:

1. append new entities into spare capacity
2. mark dead entities
3. compact periodically or every frame depending on cost

## 21.12.3. Free-List Variant

If compaction becomes too expensive, use a free-list allocator for recycled indices.

This is more complex but can reduce bandwidth in high-churn scenes.

## 21.12.4. Early Recommendation

Start with fixed-capacity pools and simple compaction. The architecture is already complicated enough without adding allocator wizardry on day one.

---

# 21.13. Locality and Parent Grouping

Secondary entities should preserve locality information.

## 21.13.1. Parent linkage

Each spawned entity should know:

* source primary id or source region id
* generation count
* optional chain group id

## 21.13.2. Why this matters

This supports:

* source cooldown enforcement
* family-based rendering tweaks
* family-based debugging
* local spawn density caps
* more believable grouped reabsorption behavior

---

# 21.14. Render Data Extraction Strategy

Not every simulation buffer is directly render-friendly.

A small extraction or staging layer may be useful.

## 21.14.1. Coherent Surface Render Inputs

Need:

* envelope field
* thickness support
* normal support
* confidence weights

## 21.14.2. Breakup Render Inputs

Need:

* filament positions, tangents, thickness
* droplet positions, radii, visual stretch
* mist positions, scales, opacity

## 21.14.3. Recommendation

If render shaders need much less data than update shaders, create packed render views of the active populations. This can improve bandwidth and simplify shader inputs.

---

# 21.15. Diagnostics and Developer Visibility

This architecture is too rich to tune blindly.

## 21.15.1. Mandatory debug views

* primary state coloring
* exposure heatmap
* coherence heatmap
* breakup instability heatmap
* envelope-validity heatmap
* filament state coloring
* bead readiness coloring
* merge potential coloring

## 21.15.2. Mandatory counts

* primaries by state
* active filaments by state
* active droplets by class
* active mist count
* spawn attempts
* spawn rejects by reason
* merge successes
* merge failures
* budget hits per frame

## 21.15.3. Why this matters

Without explicit diagnostics, the implementation will produce mystery behavior and the tuning process will devolve into staring at water like it insulted your family.

---

# 21.16. Memory Pressure and Browser Viability

Browser execution imposes hard realism constraints on this architecture.

## 21.16.1. Practical rules

* keep primary truth separate and compact
* keep secondary populations capped
* keep mist especially cheap
* avoid duplicating large buffers without reason
* prefer reusing support fields already built for the solver when possible

## 21.16.2. Recommended scalability tiers

### Tier A — Minimal

* primary solver
* primary surface-state buffer
* calm-sheet envelope
* no secondary breakup yet

### Tier B — Intermediate

* add proto-filaments and limited droplets
* no mist or only very cheap mist

### Tier C — Full hybrid

* full primary state layer
* envelope system
* filaments, bead chains, droplets, mist, reabsorption, diagnostics

The engine should be able to degrade gracefully by disabling later tiers first.

---

# 21.17. Implementation Guidance

The recommended order of implementation is:

1. primary surface-state buffer
2. envelope support resources
3. counters and budget buffers
4. proto-filament pool
5. droplet pool
6. mist pool
7. compaction / indirect args
8. debug statistics

This order ensures the system gains observability before it gains too much dynamic complexity.

---

# 21.18. Closing Position of Section 21

The central claim of this section is simple:

**A successful hybrid MLS-MPM fluid architecture requires a strict separation between solver truth, derived surface meaning, and bounded secondary breakup populations.**

Once that separation is respected, the system becomes tractable.

The core fluid remains stable. The surface becomes classifiable. The breakup hierarchy becomes manageable. Budgets become enforceable. Rendering becomes modular. Debugging becomes possible.

Without this separation, the engine becomes a swamp of ad hoc buffers and mystical shader side effects.

With it, the system becomes buildable.

---

# 21.19. Next Expansion Targets After Section 21












# Section 22. Sheet-Envelope Reconstruction and Top-Envelope Extraction

## Purpose

This document expands the thesis into the theory and architecture of calm-sheet and rolling-sheet surface reconstruction.

The purpose of this section is to answer the central anti-lump question of the project:

**How can a particle-based hybrid MLS-MPM fluid render as a smooth, coherent, ripple-capable water sheet when calm or wave-valid, without forcing the entire fluid into a heightfield abstraction that breaks under cresting, overturn, and fragmentation?**

This section defines the conceptual and practical basis for a sheet-envelope layer that sits above raw particle support and below full breakup representation. It explains when a region is allowed to become envelope-driven, how the envelope should be extracted, how ripple and wave detail should be preserved, and how the system should hand off to non-envelope modes when the local geometry becomes invalid for a single-valued surface.

---

# 22.1. Core Thesis of the Envelope Layer

The calm-surface lumpiness problem is not fundamentally a failure of fluid simulation. It is a failure of visible support geometry.

When the rendered surface is reconstructed from rounded particle supports, the surface reveals lobes even when the fluid body is coherent and near rest. This creates the marble-under-slime look: continuity in material identity, but discontinuity in visible support shape.

The envelope layer exists to break that dependency.

The envelope should not replace the fluid everywhere. It should replace sphere-led support only where the surface is locally valid as a coherent sheet.

That leads to the core thesis of this section:

**The visible surface should become envelope-driven wherever the fluid is exposed, coherent, and locally single-valued, and should revert to non-envelope support wherever cresting, overhang, breakup, or detached geometry makes a top-envelope interpretation invalid.**

---

# 22.2. The Envelope Layer in the Full Architecture

The sheet-envelope layer sits between two other truths.

## 22.2.1. Below It: The Bulk Solver

The MLS-MPM body remains the mass-and-momentum truth.

The envelope is not allowed to invent fluid mass arbitrarily. It derives its structure from the primary body and its support fields.

## 22.2.2. Above It: Final Visible Surface

The final visible surface is a composite of:

* calm-sheet envelope,
* rolling-sheet envelope,
* filament and breakup geometry,
* detached droplets,
* and mist.

The envelope is therefore one representation layer, not the whole rendered fluid.

## 22.2.3. Beside It: Breakup Hierarchy

The breakup hierarchy is not an alternative formulation of the envelope. It is the envelope’s neighbor and successor when sheet validity fails.

The envelope handles coherence.
The breakup hierarchy handles fragmentation.

---

# 22.3. What the Envelope Must Achieve

A successful envelope layer must satisfy all of the following.

## 22.3.1. Kill Visible Particle Lobes

At or near rest, it must suppress the sphere-led or lobe-led appearance of individual supports.

## 22.3.2. Preserve Ripples

The solution must not flatten the water into dead plastic. Fine wavelets and ripples must survive where the local motion still belongs to coherent sheet behavior.

## 22.3.3. Preserve Rolling Relief

As wave motion increases, the envelope must still carry meaningful surface relief and directional shape.

## 22.3.4. Avoid Invalid Heightfield Assumptions

The envelope must know when not to act like a heightfield. Overturning crests, side walls, overhangs, and breakup branches are not valid top-envelope regions.

## 22.3.5. Hand Off Gracefully

When sheet validity fails, the representation must fade toward non-envelope support or explicit breakup representation without popping.

## 22.3.6. Remain Browser-Feasible

The extraction and update logic must remain bounded and practical for browser GPU execution.

---

# 22.4. Envelope Regimes

The sheet-envelope layer should not be monolithic. It must support at least two envelope regimes.

## 22.4.1. Calm Envelope

This is the strongest envelope mode.

### Character

* exposed
* coherent
* near-rest or ripple-dominant
* highly top-valid
* very low breakup pressure

### Visual goal

* strongly suppress particle lobes
* appear smooth and coherent
* preserve subtle ripple modulation
* behave almost like a top-surface field

## 22.4.2. Rolling Envelope

This is the more dynamic envelope mode.

### Character

* exposed
* coherent
* wave-active but still single-valued enough
* not strongly breaking

### Visual goal

* remain smooth and coherent
* preserve rolling wave relief
* allow directional shaping and more curvature
* reduce flattening compared with calm mode

## 22.4.3. Envelope-Invalid Region

This is where the envelope must weaken or switch off.

### Character

* overhang or multi-valued structure
* underside dominance
* crest ejection
* proto-filament or breakup-source behavior
* detached fragments

### Visual goal

* stop pretending the surface is a valid top field
* hand off to particle, filament, or droplet representation

---

# 22.5. Validity Conditions for Envelope Use

The envelope should exist only where the local region satisfies envelope-valid conditions.

A region becomes envelope-valid when it is:

1. sufficiently exposed,
2. sufficiently coherent,
3. sufficiently top-facing,
4. sufficiently low in breakup instability,
5. and sufficiently single-valued in the local surface sense.

This can be summarized as an envelope-validity doctrine:

* exposed enough to matter visually,
* coherent enough to behave like one sheet,
* calm or rolling enough to remain unbroken,
* and geometrically simple enough to permit a top-like reconstruction.

---

# 22.6. Envelope Validity Signals

The system should derive envelope validity from several signals rather than one brittle threshold.

## 22.6.1. Exposure Signal

A buried region should not drive the envelope.

High exposure is a necessary but not sufficient condition.

## 22.6.2. Coherence Signal

A region may be exposed but already fragmenting. The envelope should prefer exposed regions that remain strongly coherent.

## 22.6.3. Topness Signal

The envelope is fundamentally a surface-envelope concept. It is therefore biased toward upper coherent skin and away from side or underside geometry.

## 22.6.4. Breakup Suppression Signal

High breakup instability should suppress envelope confidence.

The more the region wants to become a filament or spray source, the less the system should force it into a smooth top-surface abstraction.

## 22.6.5. Overhang or Multi-Valuedness Signal

The strongest envelope killer is the breakdown of local single-valued surface validity.

The system should explicitly penalize regions that exhibit:

* conflicting normals,
* underside exposure,
* strong vertical inversion,
* or multiple strong support layers in one local column or support neighborhood.

---

# 22.7. The Single-Valuedness Problem

This is one of the deepest conceptual constraints in the entire architecture.

A top-envelope or heightfield-like reconstruction only makes sense where the surface is locally single-valued.

That means for a local horizontal neighborhood, there should be one dominant visible top surface rather than multiple competing layers.

## 22.7.1. Single-Valued Regions

These include:

* calm pools
* small ripples
* rolling wave faces before overturn
* sloshing sheets without overhang

## 22.7.2. Multi-Valued Regions

These include:

* overturning crests
* folding sheets
* underside curls
* splashing arcs passing over parent water
* stacked spray-support layers

## 22.7.3. Design Consequence

The envelope layer must not insist on top-surface dominance where the geometry no longer supports it.

This is why the envelope must be adaptive and local rather than global and dogmatic.

---

# 22.8. Families of Envelope Extraction

There is more than one way to construct the envelope. This section defines the main families.

## 22.8.1. Top-Support Envelope

This method identifies the highest coherent support in a local region and treats it as the visible sheet.

### Advantages

* conceptually simple
* directly targets calm top skin
* efficient on grid-like support domains

### Risks

* can become too binary if confidence is weak
* can fail in ambiguous crest zones

## 22.8.2. Density-Field Isosurface Envelope

This method extracts a coherent visible surface from a density-like field and then biases it toward top-envelope behavior when validity is high.

### Advantages

* more volumetric continuity
* may integrate well with existing density-grid resources

### Risks

* may still inherit lobe noise unless smoothed intelligently
* full volumetric extraction can be expensive

## 22.8.3. Projected Sheet Envelope

This method reconstructs a local or global height-like field in a sheet-aligned space.

### Advantages

* naturally suited to calm coherent water
* can support strong anti-lump smoothing

### Risks

* fails hard if applied where the surface is not actually sheet-valid

## 22.8.4. Hybrid Envelope

This is the recommended thesis direction.

The system should combine:

* top-envelope bias,
* density/support confidence,
* and adaptive validity weighting.

That lets the surface behave heightfield-like when appropriate without becoming enslaved to a global heightfield model.

---

# 22.9. Canonical Envelope Pipeline

The recommended envelope pipeline consists of five conceptual stages.

## 22.9.1. Stage A — Candidate Support Accumulation

The system gathers the support data from which the envelope will be extracted.

Possible sources:

* density grid
* support field splats
* local top-support samples
* thickness field
* local normals or gradient field

The purpose of this stage is to build a support representation rich enough to infer a visible top surface.

## 22.9.2. Stage B — Envelope Candidate Extraction

The system identifies one or more possible top-surface candidates.

Examples:

* highest coherent support per local column
* strongest top-facing visible support
* dominant top isosurface crossing

At this stage, the result is not yet trusted. It is only a candidate.

## 22.9.3. Stage C — Confidence and Validity Evaluation

The system computes envelope confidence.

Important signals:

* exposure
* coherence
* topness
* thickness support
* absence of overhang evidence
* low breakup instability

This stage determines whether the candidate is allowed to influence the visible surface strongly, weakly, or not at all.

## 22.9.4. Stage D — Envelope Shaping and Smoothing

The system smooths, biases, or filters the candidate envelope according to regime.

For calm envelope:

* stronger smoothing
* stronger lobe suppression
* gentle ripple preservation

For rolling envelope:

* weaker smoothing
* more relief preservation
* stronger directional continuity

## 22.9.5. Stage E — Surface Arbitration

The system blends between:

* envelope-driven surface,
* raw or anisotropic particle support,
* and breakup representations.

This arbitration is where the final visible surface is decided.

---

# 22.10. Envelope Confidence

Envelope confidence is the key scalar that prevents the layer from becoming a blunt instrument.

The envelope should not simply exist or not exist. It should exist with confidence.

## 22.10.1. High Confidence

Meaning:

* calm or rolling coherent top skin
* little evidence of multi-valuedness
* breakup suppressed

Effect:

* strong envelope control
* strong lobe suppression
* stronger smoothing allowed

## 22.10.2. Medium Confidence

Meaning:

* still coherent, but more energetic or ambiguous
* possible cresting or shape variation

Effect:

* envelope contributes significantly
* but shares authority with particle or anisotropic support

## 22.10.3. Low Confidence

Meaning:

* geometry ambiguous
* breakup rising
* overhang risk or side-wall dominance

Effect:

* envelope influence weakens
* representation hands off toward other modes

---

# 22.11. The Anti-Lump Requirement

This is the visual heart of the entire section.

The envelope must destroy visible particle lobes without destroying the water’s living detail.

That means the smoothing doctrine cannot simply be “blur harder.”

A good anti-lump policy must:

1. suppress local support bumps associated with individual rounded particles,
2. preserve coherent low-amplitude wave structure,
3. preserve genuine rolling relief,
4. preserve motion-driven asymmetry where appropriate,
5. and avoid temporal shimmer.

This means the envelope filter should be **structure-aware**, not merely isotropic blur.

---

# 22.12. Smoothing Doctrine

The smoothing stage should be regime-dependent.

## 22.12.1. Calm-Sheet Smoothing

This regime may use stronger smoothing because the water is near rest or ripple-dominant.

### Desired behavior

* aggressively reduce lobe noise
* retain broad curvature
* preserve fine ripples above a minimum significance threshold
* avoid staircase or plateau artifacts

## 22.12.2. Rolling-Sheet Smoothing

This regime must be more conservative.

### Desired behavior

* suppress rounded support artifacts
* preserve wave peaks and troughs
* preserve directional motion cues
* avoid over-flattening dynamic relief

## 22.12.3. Breakup-Adjacent Smoothing

Where breakup is rising but the envelope still contributes, smoothing must weaken.

### Desired behavior

* do not falsely weld the surface into a plastic membrane
* allow crest sharpening
* prepare the hand-off to breakup or non-envelope rendering

---

# 22.13. Ripple Preservation

A fluid surface that becomes perfectly smooth under calm-sheet logic is not realistic. It becomes dead.

The envelope must preserve ripple-scale motion that remains coherent and physically meaningful.

## 22.13.1. Ripple vs Lump Distinction

The system must distinguish between:

* support-induced lump noise,
* and actual low-amplitude coherent ripple signal.

This is a foundational perceptual problem.

## 22.13.2. Practical Strategy

The best general strategy is not to preserve all high-frequency variation. It is to preserve **coherent high-frequency variation**.

That means ripple preservation should be stronger where variation is:

* temporally stable,
* directionally coherent,
* and supported by neighboring motion rather than isolated support bumps.

## 22.13.3. Consequence

The envelope smoother should be guided by coherence and wave-validity, not only by curvature magnitude.

---

# 22.14. Rolling-Wave Relief Preservation

Rolling sheet water must remain visibly alive.

The envelope is not a flattening machine. It is a support-transformation layer.

This means the rolling envelope must preserve:

* crest and trough structure,
* directional tilt,
* forward face and trailing face asymmetry,
* and wave grouping.

Any envelope implementation that kills these will solve lumps by murdering the water.

That is not success. That is a crime scene.

---

# 22.15. Overhang Detection and Envelope Suppression

The envelope layer needs an explicit concept of invalid geometry.

## 22.15.1. Why Overhang Matters

The moment the surface folds over, curls, or creates multiple visible support layers, a top-envelope interpretation becomes unreliable or outright wrong.

## 22.15.2. Practical Overhang Signals

Candidate signals include:

* multiple strong support peaks along a local column,
* opposing normals in a local neighborhood,
* underside-facing normals becoming dominant,
* strong vertical inversion,
* rising breakup instability in tandem with reduced coherence,
* or explicit crest-curl events.

## 22.15.3. Response

When overhang or multi-valuedness is detected:

* lower envelope confidence,
* reduce smoothing authority,
* reduce top-envelope blending,
* and hand off toward anisotropic support or breakup representation.

This suppression should be graded, not binary, unless the invalidity is overwhelming.

---

# 22.16. Arbitration Between Envelope and Non-Envelope Modes

The final visible surface should be chosen through arbitration, not regime dictatorship.

## 22.16.1. Envelope-Dominant Arbitration

Used when:

* envelope confidence high
* breakup low
* top validity strong

Effect:

* calm or rolling sheet surface is mostly envelope-driven

## 22.16.2. Shared Arbitration

Used when:

* envelope confidence moderate
* cresting or shape ambiguity rising
* still some coherent top-surface behavior present

Effect:

* visible surface blends envelope support with anisotropic or particle support

## 22.16.3. Envelope-Suppressed Arbitration

Used when:

* breakup high
* overhang strong
* detached structures present
* top-envelope validity weak

Effect:

* envelope fades out
* other representations take over

This graded arbitration is what prevents abrupt popping between calm water and breakup states.

---

# 22.17. Temporal Stability of the Envelope

A beautiful envelope that shimmers, pops, or jitters is still a failure.

## 22.17.1. Required Stability Features

The envelope must resist:

* frame-to-frame support jitter,
* sudden confidence oscillation,
* flip-flopping between envelope and non-envelope dominance,
* and ripple erasure under transient noise.

## 22.17.2. Required Tools

The system should use:

* hysteresis in envelope validity,
* temporal smoothing of confidence,
* age accumulators where necessary,
* and stable neighborhood logic.

## 22.17.3. Principle

A coherent water sheet should not behave like a nervous spreadsheet cell.

---

# 22.18. Candidate Implementation Strategies

This section does not lock the project to one strategy, but it defines the most viable options.

## 22.18.1. Grid-Driven Top Envelope

Use a structured field over world or sheet-aligned space.

### Pipeline

* accumulate support into grid
* identify top coherent layer
* smooth by regime
* sample in final render

### Strengths

* simple
* directly supports height-like reconstruction
* efficient for calm regions

### Weaknesses

* can struggle with steep local detail if too coarse
* must suppress invalid regions carefully

## 22.18.2. Density-Isosurface With Envelope Bias

Use a density field as the volumetric source and bias its visible reconstruction toward top-envelope dominance where valid.

### Strengths

* good volumetric continuity
* reuses density-grid resources

### Weaknesses

* may require more expensive field processing
* must be controlled carefully to avoid reintroducing lobe structure

## 22.18.3. Hybrid Support Envelope

Use both local top support and density-based continuity.

### Strengths

* most flexible
* best fit for adaptive validity doctrine
* strongest thesis alignment

### Weaknesses

* more complex to tune
* requires careful confidence logic

This is the recommended long-term strategy.

---

# 22.19. Relationship to Existing Elongation Logic

The envelope layer and the elongation system must not fight each other.

## 22.19.1. Coherent Surface Use

Where the fluid remains coherent and sheet-valid, the envelope should dominate visible support shaping.

## 22.19.2. Transitional Use

Where the fluid is beginning to stretch, the rolling envelope may still contribute while elongation begins to bias shape.

## 22.19.3. Breakup Use

Once proto-filament or stronger breakup behavior emerges, elongation and the breakup hierarchy take over, and the envelope recedes.

This preserves one unified visual story:

* calm sheet becomes smooth envelope,
* active sheet becomes rolling envelope,
* stretching sheet becomes branch-like,
* branch-like structure becomes breakup hierarchy.

---

# 22.20. Diagnostics for the Envelope Layer

This layer requires explicit observability.

## 22.20.1. Required Debug Views

* envelope confidence heatmap
* topness heatmap
* overhang penalty heatmap
* envelope validity heatmap
* smooth-vs-detail preservation view
* ripple-preservation mask
* arbitration weight view

## 22.20.2. Required Failure Diagnostics

The implementation should be able to reveal:

* where envelope confidence is being lost,
* where invalid overhang suppression is firing,
* where ripple detail is being over-killed,
* where lobe suppression is failing,
* and where arbitration is causing visible popping.

Without this, tuning the layer becomes a foggy séance.

---

# 22.21. Failure Modes This Section Exists to Prevent

## 22.21.1. Plastic Calm Water

Too much smoothing turns the surface into dead plastic.

## 22.21.2. Persistent Marble Lobes

Too little envelope authority leaves the original support geometry visible.

## 22.21.3. False Heightfield Overreach

Applying top-envelope logic into curls, overhangs, and breakup zones creates visibly wrong geometry.

## 22.21.4. Crest Welding

Over-smoothing in rolling or crest-adjacent zones makes dynamic water feel glued together.

## 22.21.5. Temporal Pop

Weak temporal stability causes the envelope to shimmer, pulse, or switch off abruptly.

---

# 22.22. Operational Summary

The sheet-envelope layer exists to transform exposed coherent water from particle-led support to surface-led support.

It does this by:

1. evaluating whether a region is exposed, coherent, and top-valid,
2. extracting a top-support or density-supported envelope candidate,
3. assigning confidence to that envelope,
4. smoothing it according to regime,
5. preserving ripple and rolling-wave structure,
6. suppressing it where overhang or breakup invalidates the top-envelope assumption,
7. and arbitrating it against non-envelope and breakup representations.

This is the layer that actually solves the lumpiness problem without pretending the whole fluid is always a heightfield.

---

# 22.23. Next Expansion Targets After Section 22








# Section 23. Envelope Mathematics and Arbitration

## Purpose

This document formalizes the sheet-envelope layer introduced in Section 22. Its role is to define the mathematical control fields that determine:

* when a region is allowed to become envelope-driven,
* how strongly the envelope is trusted,
* how aggressively the envelope may smooth or flatten local support,
* how ripple and rolling-wave detail are preserved,
* how overhang and multi-valued structure suppress the envelope,
* and how the final visible surface is arbitrated between envelope, non-envelope support, and breakup representations.

This section is not a claim that the surface is being solved from a complete continuum free-surface theory. It is a disciplined control-field formalization for a hybrid browser-based fluid architecture.

---

# 23.1. Core Variables and Dependencies

The envelope layer depends on previously defined runtime quantities.

For each primary surface sample or primary particle `i`, assume the system has access to:

* `E_i` : exposure
* `C_i` : coherence
* `R_i` : restfulness
* `Sheet_i` : calm-sheet regime score
* `Roll_i` : rolling-sheet regime score
* `L_i` : elongation
* `T_i` : thinning
* `B_i` : effective breakup instability
* `topness_i` : upward-facing tendency
* `phi(x_i)` : support or density field
* `gradPhi(x_i)` : local gradient if available
* `Overhang_i` : overhang or multi-valuedness penalty
* `Wave_i` : wave-validity score if separately maintained

The envelope mathematics does not require every quantity on day one. The implementation may begin with a subset and progressively refine the model.

---

# 23.2. Envelope Eligibility

Before the system decides how strongly to use the envelope, it must decide whether a region is even eligible for envelope participation.

A simple eligibility mask can be written as:

`EligibleEnv_i = step(E_i - E_env_min) * step(C_i - C_env_min)`

where `step(x)` is 1 when `x >= 0` and 0 otherwise.

This is only a coarse gate. The real control comes from continuous confidence and arbitration weights, but eligibility avoids wasting envelope logic on buried or fully incoherent regions.

---

# 23.3. Envelope Validity

Envelope validity expresses whether the local surface can plausibly be treated as a coherent top-envelope rather than a raw lobe field or a fragmentation zone.

## 23.3.1. Base Validity

Define a base validity score:

`Vbase_i = E_i^aE * C_i^aC * topness_i^aTop * (1 - B_i)^aB`

Interpretation:

* higher exposure improves validity,
* higher coherence improves validity,
* stronger upward-facing character improves validity,
* stronger breakup suppresses validity.

This is the core “can this still be treated as a coherent visible sheet?” score.

## 23.3.2. Wave-Compatible Validity

A region may still be valid as an envelope even when it is not fully calm. To capture rolling coherent water, define:

`Vwave_i = Roll_i^bRoll * C_i^bC * E_i^bE * (1 - B_i)^bB`

This term allows rolling sheet water to retain envelope participation without being incorrectly forced into the calm-sheet bucket.

## 23.3.3. Combined Validity Before Overhang Suppression

`Vpre_i = saturate(kCalm * Vbase_i + kRoll * Vwave_i)`

This produces a first-pass continuous estimate of how valid the region is for envelope use before geometry-invalidating penalties are applied.

---

# 23.4. Overhang and Multi-Valuedness Penalty

The envelope must lose authority where the surface is no longer locally single-valued.

## 23.4.1. Conceptual Role

The overhang penalty is the main mathematical mechanism preventing the envelope from pretending that a curl, fold, or stacked support layer is still a simple top surface.

## 23.4.2. Generic Penalty Form

Let `Overhang_i` be a penalty term in `[0,1]`, where 0 means no evidence of invalidity and 1 means strong multi-valued or underside-dominant structure.

Then:

`Venv_i = Vpre_i * (1 - Overhang_i)^kOver`

This is the final envelope validity score before temporal stabilization.

## 23.4.3. Sources of `Overhang_i`

The implementation may estimate `Overhang_i` from one or more of the following:

* multiple strong support peaks in a local column,
* strong disagreement in neighboring normals,
* underside-facing dominance,
* vertical inversion events,
* curl or crest-fold diagnostics,
* or a high breakup-plus-low-topness combination.

A practical hybrid estimate could be:

`Overhang_i = saturate(aO * multiPeak_i + bO * normalConflict_i + cO * underside_i + dO * inversion_i)`

The exact composition can evolve as diagnostics improve.

---

# 23.5. Envelope Confidence

Envelope validity is about geometric and state plausibility. Envelope confidence is about how strongly the system should trust and use the envelope in final surface construction.

Confidence should be more conservative than validity.

## 23.5.1. Raw Confidence

Define raw envelope confidence:

`ConfRaw_i = Venv_i^cV * (Sheet_i + kRollConf * Roll_i)^cSheet * (1 - L_i)^cL`

Interpretation:

* higher validity increases confidence,
* calm or rolling-sheet membership increases confidence,
* strong elongation suppresses confidence, because trail-like regions are beginning to belong to branch logic instead.

## 23.5.2. Breakup-Weighted Confidence Suppression

Even if a region is exposed and top-facing, breakup pressure should weaken envelope trust.

`ConfBreak_i = ConfRaw_i * (1 - B_i)^cBreak`

## 23.5.3. Temporal Confidence Filtering

To avoid shimmer and rapid arbitration flicker, confidence should be temporally filtered:

`Conf_i(t) = mix(Conf_i(t-1), ConfBreak_i, alphaConf)`

where `alphaConf` may itself depend on state. Calm regions can afford slower changes; violent regions may require faster response.

## 23.5.4. Confidence Hysteresis

For some decisions, confidence should also have explicit enter and exit thresholds:

* `Conf_enter`
* `Conf_exit`

with `Conf_enter > Conf_exit`

This helps stabilize mode changes such as “envelope-dominant” versus “shared arbitration.”

---

# 23.6. Calm-Envelope Weight and Rolling-Envelope Weight

The envelope layer should distinguish between calm and rolling authority.

## 23.6.1. Calm Weight

`Wcalm_i = Conf_i * Sheet_i^wSheet * R_i^wRest`

This weight is highest where the water is calm, exposed, coherent, and strongly valid for top-envelope use.

## 23.6.2. Rolling Weight

`Wroll_i = Conf_i * Roll_i^wRoll * (1 - R_i)^wActive * (1 - B_i)^wBreak`

This weight is highest where the water is still coherent and envelope-valid, but actively rolling rather than calm.

## 23.6.3. Normalized Envelope Regime Split

To avoid both weights independently rising without control, define:

`WenvTotal_i = Wcalm_i + Wroll_i + eps`

`WcalmN_i = Wcalm_i / WenvTotal_i`

`WrollN_i = Wroll_i / WenvTotal_i`

These normalized weights determine what flavor of envelope shaping should dominate.

---

# 23.7. Envelope Smoothing Authority

The system needs a mathematical way to decide how much smoothing authority the envelope is allowed to exercise.

This is where the anti-lump doctrine becomes concrete.

## 23.7.1. Base Smoothing Authority

`SmoothAuthBase_i = Conf_i^sConf * (1 - B_i)^sBreak`

This says: the more we trust the envelope, and the less breakup is present, the more smoothing authority the envelope may claim.

## 23.7.2. Calm-Weighted Smoothing Authority

`SmoothCalm_i = SmoothAuthBase_i * WcalmN_i^sCalm`

Calm water should permit stronger lobe suppression.

## 23.7.3. Rolling-Weighted Smoothing Authority

`SmoothRoll_i = SmoothAuthBase_i * WrollN_i^sRoll`

Rolling water should permit weaker smoothing and stronger relief preservation.

## 23.7.4. Total Smoothing Authority

`SmoothAuth_i = saturate(kSmoothCalm * SmoothCalm_i + kSmoothRoll * SmoothRoll_i)`

with `kSmoothCalm > kSmoothRoll` in most cases.

This is the main control scalar for “how hard may we suppress lobe-like structure here?”

---

# 23.8. Ripple Preservation Weight

A successful envelope system must distinguish coherent ripple detail from support-lobe noise.

## 23.8.1. Desired Behavior

Ripple preservation should be high when local variation is:

* coherent,
* wave-valid,
* temporally stable,
* and not obviously tied to isolated rounded supports.

## 23.8.2. Ripple-Preservation Weight

Define:

`Wripple_i = Wave_i^rWave * C_i^rC * (1 - Overhang_i)^rOver * (1 - B_i)^rBreak`

This encourages coherent high-frequency structure to survive where the water is still behaving like a legitimate sheet.

## 23.8.3. Ripple vs Lump Arbitration

The system should conceptually split high-frequency variation into two competing hypotheses:

* coherent ripple content,
* support-lobe noise.

A practical control field for that distinction can be:

`LobeNoise_i = SmoothAuth_i * (1 - Wripple_i)`

Interpretation:

* if smoothing authority is high and ripple preservation is low, local fine-scale variation is probably noise-like and may be strongly suppressed,
* if ripple preservation is high, smoothing must back off even when envelope authority is high.

This is the heart of anti-lump without anti-water murder.

---

# 23.9. Rolling-Relief Preservation Weight

Rolling coherent waves need a dedicated relief-preservation term.

## 23.9.1. Relief Preservation

Define:

`Wrelief_i = WrollN_i^pRoll * C_i^pC * (1 - B_i)^pBreak`

This term ensures that rolling coherent water retains meaningful crest-and-trough structure even while lobe artifacts are suppressed.

## 23.9.2. Interaction with Smoothing

A simple way to combine relief preservation with smoothing is:

`SmoothEffective_i = SmoothAuth_i * (1 - kRelief * Wrelief_i)`

where `kRelief` controls how strongly rolling relief pushes back against flattening.

This gives the desired outcome:

* calm water: stronger smoothing
* rolling water: smoother than particle lobes, but not flattened into dead plastic

---

# 23.10. Envelope Shape Bias

The envelope does not merely decide whether it exists. It also decides what shape behavior it should prefer.

## 23.10.1. Flattening Bias

A flattening bias controls how strongly the envelope pulls the surface toward a smooth top field.

`FlatBias_i = saturate(kFlatCalm * WcalmN_i + kFlatRoll * WrollN_i)`

with `kFlatCalm > kFlatRoll`.

## 23.10.2. Directional Continuity Bias

Rolling waves need directionality. Define:

`DirBias_i = WrollN_i * C_i * Wave_i`

This weight can guide anisotropic smoothing or directional continuity filters in the final implementation.

## 23.10.3. Crest-Proximity Bias

If the implementation maintains a crest or steepness diagnostic, define:

`CrestBias_i = Crest_i * WrollN_i * (1 - B_i)`

This allows the rolling envelope to preserve more aggressive structure near active but still coherent crests.

---

# 23.11. Envelope Surface Candidate Weight

The system may have more than one candidate for the visible surface.

Candidate families include:

* top-support envelope candidate,
* density-isosurface envelope candidate,
* anisotropic particle-support candidate,
* breakup candidate.

The first arbitration happens inside the envelope family itself.

## 23.11.1. Top-Support Candidate Weight

`Wtop_i = Conf_i * topness_i^tTop * (1 - Overhang_i)^tOver`

## 23.11.2. Density-Continuity Candidate Weight

`Wdens_i = Conf_i * C_i^tC * E_i^tE`

## 23.11.3. Internal Envelope Blend

Normalize:

`WenvCand_i = Wtop_i + Wdens_i + eps`

`WtopN_i = Wtop_i / WenvCand_i`

`WdensN_i = Wdens_i / WenvCand_i`

This allows the implementation to combine top-dominant and continuity-dominant envelope contributions instead of hard-switching between them.

---

# 23.12. Final Arbitration Weights

Now we define the final visible authority split between envelope, non-envelope coherent support, and breakup representation.

## 23.12.1. Envelope Authority

`Aenv_i = Conf_i * (1 - B_i)^aBreakEnv * (1 - Overhang_i)^aOverEnv`

## 23.12.2. Non-Envelope Coherent Support Authority

This is the fallback authority for coherent water where the envelope contributes only partially.

`Anon_i = C_i^aCNon * E_i^aENon * (1 - Aenv_i)`

This represents anisotropic or particle-like support that still belongs to the coherent body.

## 23.12.3. Breakup Authority

`Abreak_i = B_i^aBreak * (1 - C_i + epsC)^aIncoh`

This represents the claim of proto-filament, ligament, droplet, or other breakup representations.

## 23.12.4. Normalize Final Arbitration

`Atotal_i = Aenv_i + Anon_i + Abreak_i + eps`

`AenvN_i = Aenv_i / Atotal_i`

`AnonN_i = Anon_i / Atotal_i`

`AbreakN_i = Abreak_i / Atotal_i`

These normalized weights are the canonical final representation weights.

Interpretation:

* `AenvN_i` high: envelope dominates
* `AnonN_i` high: coherent but non-envelope support dominates
* `AbreakN_i` high: fragmentation representation dominates

---

# 23.13. Envelope-Dominant, Shared, and Suppressed Bands

For debugging and mode interpretation, define three operational bands.

## 23.13.1. Envelope-Dominant

When:

`AenvN_i > AenvDominantEnter`

Interpretation:
The visible surface should behave primarily as an envelope-driven coherent sheet.

## 23.13.2. Shared Arbitration

When:

`AenvN_i` and `AnonN_i` are both significant, with `AbreakN_i` still below fragmentation dominance.

Interpretation:
The visible surface is in a transitional coherent state where envelope and non-envelope support both matter.

## 23.13.3. Envelope-Suppressed

When:

`AbreakN_i > AbreakDominantEnter`

or

`AenvN_i < AenvSuppressedExit`

Interpretation:
The envelope should retreat and allow fragmentation or non-envelope coherent support to dominate.

These bands are useful for debug coloring and tuning, even if the renderer uses continuous weights internally.

---

# 23.14. Temporal Stabilization of Arbitration

The final arbitration weights should not flicker frame to frame.

## 23.14.1. Weight Filtering

For each authority weight:

`A_x_i(t) = mix(A_x_i(t-1), A_x_i(raw), alphaAx)`

for `x in {env, non, break}`.

## 23.14.2. Confidence-Dependent Response Speed

Calm coherent water may use slower response to avoid shimmer. Violent breakup zones may require faster response.

A practical scheme is:

`alphaAx = mix(alphaSlow, alphaFast, B_i)`

This means:

* low breakup: stable slow updates
* high breakup: quicker adaptation

## 23.14.3. Hysteretic Mode Flags

Even when continuous weights are used for rendering, mode flags for debugging and special-case logic should use enter/exit hysteresis.

This prevents the diagnostic state machine from chattering while the underlying weights remain continuous.

---

# 23.15. Envelope Failure Penalty Bundle

For debugging and tuning, it is useful to define a combined envelope failure score.

`FailEnv_i = saturate(kOverFail * Overhang_i + kBreakFail * B_i + kIncohFail * (1 - C_i) + kLowTopFail * (1 - topness_i))`

This score does not directly drive all behavior, but it is extremely useful as a diagnostic summary of “why is the envelope losing authority here?”

---

# 23.16. Canonical Interpretation Examples

## 23.16.1. Calm Pool

Expected:

* `E` moderate to high
* `C` high
* `R` high
* `Sheet` high
* `B` low
* `Overhang` near zero

Result:

* `Conf` high
* `Wcalm` high
* `SmoothEffective` high
* `Wripple` moderate to high
* `AenvN` dominant

The visible surface becomes strongly envelope-driven and lobe suppression is aggressive but still ripple-aware.

## 23.16.2. Rolling Wave Face

Expected:

* `E` high
* `C` high
* `Roll` high
* `B` low to moderate
* `Overhang` low

Result:

* `Conf` still strong
* `Wroll` dominant
* `Wrelief` high
* `SmoothEffective` moderate rather than maximal
* `AenvN` still strong, but less absolute than in calm water

The visible surface remains coherent and smooth but retains energetic rolling relief.

## 23.16.3. Crest Near Breakup

Expected:

* `E` high
* `C` dropping
* `L` rising
* `T` rising
* `B` rising
* `Overhang` beginning to rise

Result:

* `Conf` falling
* `AenvN` weakening
* `AnonN` and `AbreakN` rising
* smoothing authority fading
* envelope authority handing off gracefully

This is the desired transition zone from sheet to fragmentation.

## 23.16.4. Detached Ligament or Droplet Zone

Expected:

* `C` low relative to parent body
* `B` high or already realized as breakup state
* `Overhang` not especially relevant because envelope eligibility should already be weak

Result:

* `AenvN` near zero
* `AbreakN` dominant

The envelope must not try to babysit detached geometry.

---

# 23.17. Minimal Starting Subset

The full formalization is powerful, but the implementation can begin with a stripped-down subset.

A practical minimum viable model is:

`Venv = E * C * topness * (1 - B)`

`Conf = Venv * (Sheet + kRoll * Roll) * (1 - L)`

`SmoothAuth = Conf * (1 - B)`

`Wripple = Wave * C * (1 - B)`

`Aenv = Conf * (1 - Overhang)`

`Anon = C * E * (1 - Aenv)`

`Abreak = B * (1 - C + eps)`

then normalize `{Aenv, Anon, Abreak}`.

This stripped version is a perfectly respectable starting point before the full cathedral of weights and exponents is built.

---

# 23.18. Diagnostics and Debug Views

The mathematics in this section should be observable directly.

## Required debug views

* `Venv` heatmap
* `Conf` heatmap
* `SmoothEffective` heatmap
* `Wripple` heatmap
* `Wrelief` heatmap
* `Overhang` heatmap
* `AenvN / AnonN / AbreakN` arbitration visualization
* `FailEnv` diagnostic view

Without these, tuning this system will become an argument with invisible ghosts.

---

# 23.19. Closing Position of Section 23

The mathematics in this section give the sheet-envelope layer a formal control language.

They specify:

* when the envelope is valid,
* when it is trusted,
* how much smoothing authority it has,
* how ripples push back against smoothing,
* how rolling-wave relief is preserved,
* how overhang and breakup suppress the envelope,
* and how final surface authority is divided between envelope, coherent non-envelope support, and breakup representation.

This turns the anti-lump doctrine into a concrete arbitration system.

The surface is no longer a single representation pretending to fit every regime. It becomes a negotiated outcome between multiple legitimate claims.

That is the correct way to make the fluid look alive without looking spherical.

---

# 23.20. Next Expansion Targets After Section 23




# Section 24. Top-Envelope Extraction Algorithms and Field Representations

## Purpose

This document turns the envelope doctrine and arbitration mathematics into concrete extraction strategies.

The central question of this section is:

**Given particle support, density fields, surface-state classification, and envelope validity signals, how should the system actually construct a usable top-envelope field for calm-sheet and rolling-sheet water in a browser-feasible way?**

This section defines the candidate field representations, extraction families, confidence models, blending strategies, and implementation tradeoffs for building the visible coherent sheet surface. It does not yet hard-lock the project to one algorithm, but it does establish a ranked set of viable approaches and a recommended implementation path.

---

# 24.1. Core Design Constraint

The top-envelope is not allowed to be a fake global heightfield pasted over the fluid.

It must satisfy three constraints simultaneously:

1. **derive from the actual fluid body** rather than inventing unsupported geometry,
2. **behave like a top-surface field only where local validity permits**, and
3. **hand off gracefully where the geometry becomes multi-valued, cresting, overhanging, or fragmenting**.

This means the correct design target is not “build a heightfield.”

The correct design target is:

**build an adaptive top-envelope representation whose authority varies continuously with local surface validity.**

---

# 24.2. What the Extraction Layer Must Output

A usable envelope extractor should produce more than just one height value.

At minimum, the envelope system should be able to output:

* top-surface candidate position or height,
* confidence or authority,
* local thickness or support width,
* normal or normal support estimate,
* smoothing authority,
* ripple-preservation weight,
* and optional source lineage or dominant-support ID.

The final renderer and arbitration system need this richer packet of information to decide how strongly the envelope should influence the final visible surface.

---

# 24.3. Extraction Domain Choices

The first major choice is the domain in which the envelope is represented.

## 24.3.1. World-Aligned Planar Grid

The simplest option is a world-space or simulation-space horizontal grid.

### Representation

Each cell stores one or more envelope quantities for a local `(x,z)` region.

### Strengths

* conceptually simple
* efficient
* easy to update incrementally
* naturally aligned with calm-sheet interpretation

### Weaknesses

* assumes a preferred up direction
* less natural for steep side walls or non-horizontal coherent sheets
* may require large grids for high spatial detail

### Best use

* calm pools
* broad water sheets
* sloshing bodies where the dominant surface is largely horizontal

---

## 24.3.2. Sheet-Aligned Local Grid

Instead of world-up only, a local sheet frame may be used in regions where the fluid has a dominant coherent orientation.

### Representation

Local neighborhoods build envelope fields in a frame aligned with the estimated local sheet normal.

### Strengths

* better for sloped or locally tilted coherent surfaces
* more flexible than a global world-up grid

### Weaknesses

* significantly more complex
* difficult to maintain continuity across regions
* harder to make stable in real time

### Best use

* later research stage
* localized advanced coherent-surface modules

This is powerful but not the first browser-friendly path.

---

## 24.3.3. Dense 3D Volume Field

The envelope may be extracted from a dense volumetric support field.

### Representation

A 3D grid stores support or density. The envelope is derived from that field.

### Strengths

* rich volumetric continuity
* naturally supports thickness and multiple support cues
* can reuse density-grid infrastructure

### Weaknesses

* more memory-heavy
* more bandwidth-heavy
* must still solve the top-surface selection problem

### Best use

* when a density volume already exists and is central to the rendering architecture

---

## 24.3.4. Sparse Column Representation

Instead of storing a full dense grid, the system may store only the dominant local top-surface information per column or tile.

### Representation

Each logical column or tile stores candidate top support peaks, confidence, and related metadata.

### Strengths

* cheaper than full dense volume
* directly aligned with top-envelope logic

### Weaknesses

* weaker volumetric richness
* can become brittle in ambiguous regions

### Best use

* mid-complexity systems focused strongly on calm-sheet extraction

---

## 24.3.5. Hybrid Field Representation

This is the recommended long-term architecture.

Use:

* a structured top-envelope grid or atlas for dominant coherent surface position,
* plus a density/support field for confidence, thickness, and arbitration support.

This gives the envelope a clean visible target without forcing all reasoning into one impoverished representation.

---

# 24.4. Extraction Families

This section defines the main algorithmic families for building the top envelope.

## 24.4.1. Highest-Coherent-Support Extraction

This is the most literal top-envelope strategy.

### Method

For each local column or sample region:

1. gather support contributions,
2. identify coherent support peaks,
3. choose the highest sufficiently coherent peak as the envelope candidate.

### Strengths

* directly matches the visual idea of the “top skin”
* easy to reason about
* efficient in structured grids

### Weaknesses

* can be fragile in ambiguous crest regions
* can flicker if coherence estimation is weak
* can become too binary if not confidence-weighted

### Verdict

Excellent early implementation path if paired with confidence and temporal stabilization.

---

## 24.4.2. Upper-Isosurface Crossing Extraction

This strategy treats the support or density field as a continuous scalar field and identifies the uppermost meaningful isosurface crossing.

### Method

For each column or ray:

1. sample the field from above downward,
2. locate the first robust crossing of a support threshold,
3. refine the crossing position,
4. assign confidence based on local support and continuity.

### Strengths

* more continuous than hard top-peak picking
* integrates naturally with density-grid fields
* can produce smoother envelope geometry

### Weaknesses

* choice of threshold matters enormously
* noisy support fields can create false crossings
* may still inherit lobe structure if not filtered carefully

### Verdict

Strong choice when a density-grid path already exists.

---

## 24.4.3. Support-Peak Clustering Extraction

This strategy explicitly identifies multiple candidate peaks per local column or region and then ranks them.

### Method

1. detect local support maxima,
2. cluster maxima into candidate layers,
3. score each candidate by topness, coherence, and continuity,
4. select the dominant candidate or blend if ambiguity is modest.

### Strengths

* best conceptual handling of ambiguous regions
* naturally supports overhang detection
* can explicitly expose multi-valued structure

### Weaknesses

* more expensive
* more parameters to tune
* more complicated to stabilize temporally

### Verdict

Very powerful for later refinement and diagnostics.

---

## 24.4.4. Envelope-from-Projected-Particles Extraction

This strategy projects coherent exposed particle support into a top-envelope domain.

### Method

1. classify primary particles by envelope validity,
2. project valid particles into a sheet-space grid,
3. accumulate height/support candidates,
4. compute weighted top estimate and confidence.

### Strengths

* direct connection to particle truth
* easy to bias by surface-state scores
* can be implemented without full volumetric field processing

### Weaknesses

* still depends on support accumulation quality
* may alias if the target grid is too coarse

### Verdict

Excellent practical path, especially in early integration with the existing particle system.

---

## 24.4.5. Hybrid Multi-Source Extraction

This is the thesis-preferred direction.

### Method

Build the envelope candidate using both:

* projected particle-derived top support,
* and density/support-field continuity cues.

Then arbitrate internally based on confidence.

### Strengths

* strongest robustness
* best alignment with Section 23 arbitration logic
* supports graceful confidence weighting

### Weaknesses

* more complicated
* requires multiple data products to be healthy

### Verdict

Best long-term architecture.

---

# 24.5. Canonical Envelope Data Packet

Regardless of extraction family, the system should produce a canonical envelope packet per sample cell, tile, or surface query.

## 24.5.1. Recommended fields

```text
EnvelopeSample
- topHeight
- lowerHeight or thickness
- confidence
- validity
- smoothingAuthority
- rippleWeight
- reliefWeight
- normalEstimate
- topCandidateWeight
- densityCandidateWeight
- overhangPenalty
- breakupPenalty
- dominantSourceId (optional)
```

This packet gives downstream passes enough information to reconstruct, smooth, arbitrate, and debug the coherent surface.

---

# 24.6. Candidate Extraction Pipeline

A practical extraction system should follow a stable multi-stage process.

## 24.6.1. Stage A — Domain Preparation

Choose the extraction domain:

* world grid,
* sheet-aligned grid,
* column structure,
* or hybrid field domain.

This decision should be explicit, because every later stage depends on it.

## 24.6.2. Stage B — Support Accumulation

Accumulate candidate support into the domain.

Possible accumulated quantities:

* total support strength,
* highest support height,
* top-facing support weight,
* density threshold crossings,
* thickness span,
* candidate count per column,
* support variance or ambiguity.

## 24.6.3. Stage C — Candidate Identification

Identify possible envelope candidates.

Possible outputs:

* topmost coherent peak,
* strongest coherent peak,
* first robust upper crossing,
* multiple ranked candidates.

## 24.6.4. Stage D — Confidence Assembly

For each candidate, compute:

* envelope validity,
* confidence,
* overhang penalty,
* breakup suppression,
* and arbitration readiness.

## 24.6.5. Stage E — Spatial Smoothing

Apply regime-aware smoothing to the candidate field.

## 24.6.6. Stage F — Temporal Stabilization

Blend the candidate and confidence with prior state to reduce jitter.

## 24.6.7. Stage G — Final Packet Output

Write the final envelope packet for use by the surface compositor.

---

# 24.7. Top-Support Column Extraction

This is the most important concrete family for early implementation.

## 24.7.1. Column Model

For each logical `(x,z)` cell or tile:

* gather all coherent-support contributions,
* sort or rank by height,
* compute one or more candidate peaks.

## 24.7.2. Dominant Candidate Selection

A candidate peak should not win merely because it is highest. It should win because it is the **highest sufficiently coherent top-valid peak**.

A canonical candidate score may be:

`ScoreTop = aH * normalizedHeight + bC * coherence + cTop * topness + dConf * localSupport - eBreak * breakup - fOver * overhangEvidence`

The selected candidate is the highest-scoring valid top-support peak.

## 24.7.3. Ambiguity Handling

If the best and second-best peaks are too close in score, the system should:

* reduce envelope confidence,
* raise ambiguity or overhang penalty,
* and weaken envelope authority in arbitration.

This prevents false certainty in multi-layer regions.

---

# 24.8. Upper-Isosurface Extraction

This is the strongest density-grid-based strategy.

## 24.8.1. Column or Ray Sampling

For each local sample column:

1. sample `phi` from above downward,
2. identify threshold crossings,
3. keep the first robust crossing that satisfies local support and coherence tests.

## 24.8.2. Crossing Refinement

The crossing position should be refined rather than snapped to voxel resolution.

Possible refinement methods:

* linear interpolation between samples,
* local quadratic fit,
* or short local binary refinement.

## 24.8.3. Robustness Rules

The system should reject weak crossings if:

* support confidence is too low,
* topness is too low,
* overhang evidence is too high,
* breakup instability is too high.

## 24.8.4. Advantage

This method naturally reuses the density-grid path already central to the architecture.

---

# 24.9. Thickness Extraction

The envelope should not only know where the top is. It should know how much support exists beneath it.

## 24.9.1. Why thickness matters

Thickness helps the system:

* distinguish true sheet support from weak noise,
* estimate thinning,
* support ripple preservation,
* and decide whether a candidate is robust enough to dominate the visible surface.

## 24.9.2. Thickness strategies

### Column span thickness

Distance between the upper and lower coherent support crossings.

### Support-integral thickness

Integral of support along the local vertical column.

### Local covariance width

Width estimated from neighboring support distribution.

## 24.9.3. Recommendation

For an early envelope system, upper/lower coherent crossing span is the cleanest useful thickness metric if a density or support field is already available.

---

# 24.10. Normal Extraction

The envelope needs a normal estimate both for rendering and for validity diagnostics.

## 24.10.1. Candidate sources

* gradient of the support/density field,
* gradient of the final envelope field,
* local fit to neighborhood surface samples,
* or a weighted blend of these.

## 24.10.2. Recommended doctrine

Use field-gradient normals for coarse support and envelope-gradient normals for final visible shaping. This helps decouple support interpretation from final smoothed presentation.

## 24.10.3. Normal confidence

Normals should be treated as lower-confidence in ambiguous or low-support regions. That uncertainty should feed overhang and arbitration diagnostics.

---

# 24.11. Confidence Assembly at Extraction Time

Section 23 defined the envelope confidence mathematics. This section defines where the inputs come from during extraction.

For each candidate, extraction should gather:

* support strength,
* topness,
* local continuity,
* thickness,
* ambiguity count,
* overhang evidence,
* breakup suppression state,
* temporal stability cue.

A candidate that is merely high is not necessarily trustworthy. A candidate must also be well-supported, geometrically simple, and coherently connected.

---

# 24.12. Multi-Candidate Policy

A robust envelope system should not assume one local candidate is always sufficient.

## 24.12.1. Single-Candidate policy

Fastest and simplest:

* choose one best candidate,
* write one envelope packet.

Good for early implementation.

## 24.12.2. Dual-Candidate policy

Store:

* best candidate,
* second-best candidate,
* ambiguity score.

This is a strong middle ground because it gives the system explicit awareness of local multi-valued competition.

## 24.12.3. Full Multi-Peak policy

Store multiple ranked peaks per column or tile.

Most expressive, but more expensive.

## 24.12.4. Recommendation

Start with dual-candidate policy. It gives a huge boost to diagnostics and overhang suppression without exploding complexity.

---

# 24.13. Spatial Filtering of the Envelope Field

After extraction, the raw envelope field must be spatially stabilized and shaped.

## 24.13.1. Do not use blind blur

A uniform blur will indeed kill lumps, but it will also smear ripples, weld crest edges, and produce sleepy plastic soup.

## 24.13.2. Filter must respect

* regime weights,
* smoothing authority,
* ripple-preservation weight,
* rolling-relief weight,
* overhang penalty,
* confidence.

## 24.13.3. Practical filter families

### Weighted local smoothing

Smooth only where confidence is high and breakup is low.

### Bilateral-like smoothing

Preserve discontinuities or steep surface transitions while reducing noise.

### Directionally biased smoothing

Favor smoothing along coherent wave directions rather than equally in all directions.

### Multi-pass calm/rolling filter

Use stronger filtering for calm envelope, weaker for rolling envelope.

This section defines the need. A later section can formalize the exact kernel operators.

---

# 24.14. Temporal Filtering of the Envelope Field

Spatial extraction alone is not enough. The envelope must also remain temporally stable.

## 24.14.1. Temporal requirements

The field must resist:

* one-frame height pop,
* candidate swapping,
* support jitter,
* confidence shimmer.

## 24.14.2. Practical temporal fields to filter

* top height,
* confidence,
* thickness,
* normal estimate,
* ambiguity score.

## 24.14.3. Adaptive temporal response

Temporal blending should be:

* slower in calm coherent water,
* faster near active rolling or breakup-adjacent zones.

This follows the same principle used in the arbitration system: calm water deserves temporal dignity; violent water deserves responsiveness.

---

# 24.15. Hand-Off Logic to Non-Envelope Modes

The envelope must weaken gracefully when it becomes invalid.

## 24.15.1. Hand-off triggers

* confidence collapse,
* overhang growth,
* breakup instability rise,
* candidate ambiguity rise,
* loss of topness,
* or secondary breakup activation.

## 24.15.2. Hand-off behavior

When these occur, the system should:

* lower envelope authority,
* lower smoothing authority,
* reduce flattening bias,
* and increase coherent non-envelope or breakup authority.

## 24.15.3. Important principle

The envelope should fail gracefully, not catastrophically.

A good hand-off is a fade of authority, not a visible snapping of geometry.

---

# 24.16. Recommended Early Implementation Path

This section now commits to a practical first extraction architecture.

## 24.16.1. Phase A — Grid-Based Dual-Candidate Top Envelope

Use:

* a world-aligned or fluid-domain horizontal grid,
* projected coherent-support accumulation,
* top-support candidate extraction,
* second-best candidate storage,
* confidence and ambiguity assembly,
* regime-aware smoothing,
* and temporal stabilization.

### Why this path wins early

* simple enough for browser implementation,
* directly targets the lumpy calm-surface problem,
* integrates well with the existing coherent-surface doctrine,
* and creates a strong diagnostic foundation.

## 24.16.2. Phase B — Hybridize with Density-Field Crossings

Once the grid-based path is stable, augment it with:

* upper-isosurface crossing support,
* column-span thickness,
* and density-based continuity confidence.

This makes the envelope less brittle and more volumetrically grounded.

## 24.16.3. Phase C — Advanced Ambiguity and Overhang Handling

Add:

* multi-peak reasoning,
* explicit overhang suppression,
* local directional filtering,
* and tighter hand-off logic to breakup.

This is the road from good to god-tier.

---

# 24.17. Recommended Canonical Extraction Packet for Phase A

For an early browser-feasible implementation, each envelope cell should store at least:

```text
EnvelopeCell
- topHeightPrimary
- topHeightSecondary
- confidencePrimary
- confidenceSecondary
- ambiguity
- thickness
- normalEstimate
- smoothingAuthority
- rippleWeight
- reliefWeight
- overhangPenalty
- envelopeAuthority
```

This packet is enough to support:

* anti-lump smoothing,
* ambiguity-aware suppression,
* rolling relief preservation,
* and final arbitration.

---

# 24.18. Failure Modes This Section Exists to Prevent

## 24.18.1. Heightfield Dogmatism

Treating the whole fluid as one global heightfield produces wrong geometry in curls, splashes, and overhangs.

## 24.18.2. Binary Top Selection

Choosing the highest support without confidence and ambiguity logic creates flicker and wrong dominance in crest zones.

## 24.18.3. Confidence Blindness

An envelope extractor that cannot express uncertainty will be wrong with great confidence, which is the most dangerous kind of wrong.

## 24.18.4. Lobe-Killing via Stupid Blur

Blind blurring kills both lumps and the water’s life.

## 24.18.5. Abrupt Envelope Collapse

Without hand-off logic, the coherent surface pops visibly when transitioning into breakup.

---

# 24.19. Closing Position of Section 24

The central claim of this section is that top-envelope extraction should be treated as an adaptive candidate-selection problem, not as a naive heightfield bake.

A strong implementation should:

* accumulate support in a structured domain,
* identify one or more coherent top candidates,
* measure confidence and ambiguity,
* derive thickness and normals,
* apply regime-aware spatial and temporal stabilization,
* and output a rich envelope packet that can participate in final arbitration.

The recommended early path is a dual-candidate grid-based top-support extractor, later hybridized with density-field crossing logic.

That path is browser-feasible, thesis-aligned, and directly useful against the lumpy-at-rest failure.

---





# Section 25. Filament, Ligament, and Bead-Chain Geometry Synthesis

## Purpose

This document turns the breakup hierarchy from a state-machine concept into a concrete geometry doctrine.

The central question of this section is:

**Once coherent sheet water stops being well represented by the envelope, how should the system synthesize the visible geometry of proto-filaments, ligaments, and bead chains so that stretching, thinning, necking, and breakup read as fluid rather than as uniform particles or arbitrary ribbons?**

This section defines the representational goals, geometric primitives, continuity rules, taper laws, necking behavior, bead formation logic, rendering options, and implementation pathways for the branch-like stages of the breakup hierarchy.

---

# 25.1. Core Thesis of Branch Geometry

A fluid branch is not just a fast particle trail.

A successful branch representation must express:

* directional continuity,
* narrowing thickness,
* parent attachment,
* temporal persistence,
* local instability,
* neck formation,
* partial detachment,
* and progressive transition into droplets.

This means the branch hierarchy cannot be rendered convincingly as:

* raw same-size particles,
* one blunt cylinder per frame,
* or a pure billboard streak with no thickness evolution.

The correct target is a **dynamic branch geometry system** in which proto-filaments, ligaments, and bead chains are distinct but related geometric states.

---

# 25.2. The Three Core Branch Regimes

## 25.2.1. Proto-Filament

This is the first visible branch-like extension emerging from coherent sheet breakup.

### Character

* attached to parent body
* visibly stretched
* still smooth and continuous
* not yet strongly necked
* thickness still relatively stable

### Visual identity

A tapered fluid branch that still reads as one continuous coherent thread.

---

## 25.2.2. Ligament

This is a thinner, more unstable branch.

### Character

* stronger thinning
* stronger taper
* stronger local instability
* still continuous but nearing breakup

### Visual identity

A narrow unstable thread whose geometry suggests imminent necking and detachment.

---

## 25.2.3. Bead Chain

This is the necked stage bridging ligament and detached droplets.

### Character

* alternating thick and thin regions
* partial continuity still present
* local nodes becoming droplet precursors
* not yet fully disintegrated

### Visual identity

A string-of-pearls structure with fluid necks connecting bead nodes.

---

# 25.3. What the Geometry Must Accomplish

A branch geometry system must satisfy the following.

## 25.3.1. Preserve Continuity

Proto-filaments and ligaments must read as physically continuous before they detach.

## 25.3.2. Support Taper

The branch should narrow meaningfully under stretching and instability.

## 25.3.3. Support Parent Attachment

The branch root should remain visually connected to the source body until detachment logic says otherwise.

## 25.3.4. Express Instability

Geometry should gradually reveal thinning, oscillation, and necking before detachment occurs.

## 25.3.5. Avoid Uniformity

Branches must not devolve into evenly spaced, same-radius beads or identical tube segments.

## 25.3.6. Support Partial Breakup

A bead chain must be able to emit some droplets while the remaining structure persists.

## 25.3.7. Stay Browser-Feasible

The representation must be bounded, compact, and practical under GPU budget constraints.

---

# 25.4. Geometric Primitives Available to the System

Several primitive families are available for branch construction.

## 25.4.1. Particle Chains

The simplest option is a chain of point-like or sphere-like supports.

### Strengths

* easy to derive from existing particle data
* naturally compatible with droplet transition

### Weaknesses

* too lumpy unless heavily shaped
* poor continuity without strong interpolation
* weak visual quality in proto-filament and ligament stages

### Verdict

Useful as a data substrate, but rarely sufficient as the final branch geometry.

---

## 25.4.2. Tube or Capsule Chains

The branch is represented as connected capsules or tube segments.

### Strengths

* naturally continuous
* easy to taper
* easy to neck
* good for proto-filament and ligament stages

### Weaknesses

* can look too rigid if segmentation is coarse
* can become too mechanical if radius law is oversimplified

### Verdict

Strong practical baseline.

---

## 25.4.3. Implicit Blobby Field

Represent the branch as an implicit field built from segment or node supports.

### Strengths

* smooth continuity
* natural blending between branch and bead states
* good for fluid-like visual transitions

### Weaknesses

* more expensive to evaluate
* can become too mushy without careful field shaping

### Verdict

Excellent long-term direction when paired with bounded evaluation domains.

---

## 25.4.4. Ribbon-Like Geometry

Represent the branch as a camera-independent or camera-oriented ribbon.

### Strengths

* cheap
* expressive for long trails

### Weaknesses

* poor true cross-sectional volume
* weaker for bead-chain transition
* can look stylized rather than fluid-realistic

### Verdict

Useful as a fallback or auxiliary representation, not the main thesis path.

---

## 25.4.5. Hybrid Segment-Implicit Representation

Represent the branch as a skeletal chain of segments or nodes, but render it through a smoothly blended implicit or pseudo-implicit surface.

### Strengths

* strong continuity
* good taper control
* smooth transition into bead chain
* thesis-aligned visual richness

### Weaknesses

* more complex to build
* requires good field tuning

### Verdict

This is the preferred long-term target.

---

# 25.5. Canonical Branch Data Model

Branch geometry should not be inferred from raw state alone at render time. It needs a dedicated synthesis-friendly record.

## 25.5.1. Segment-Oriented Record

```text
BranchSegment
- position
- velocity
- tangent
- radius
- age
- lifetime
- attachment
- instability
- necking
- taperBias
- parentId
- chainId
- stateFlags
- alive
```

This is the core structural record for proto-filament and ligament stages.

## 25.5.2. Optional Node-Augmented Record

For bead-chain stages, the system may also maintain explicit bead nodes.

```text
BeadNode
- position
- velocity
- radius
- neckLeft
- neckRight
- detachReadiness
- parentChainId
- alive
```

This is not mandatory for the earliest implementation, but it becomes useful when bead chains need strong local control.

---

# 25.6. Branch Skeleton Construction

Before the branch can be rendered, it needs a skeleton or ordering structure.

## 25.6.1. Source-Anchored Skeleton

Each new branch begins from a parent source point or region.

The first segment should store:

* source position,
* source tangent estimate,
* source thickness estimate,
* and source attachment weight.

## 25.6.2. Segment Ordering

Segments in a chain must have a stable order from root to tip.

This can be established through:

* spawn ordering,
* parent-child linkage,
* or geometric nearest-forward continuation along tangent.

## 25.6.3. Root and Tip Semantics

The geometry system should know which end is the root and which is the tip.

This matters for:

* tapering,
* parent blending,
* neck placement,
* and droplet detachment.

---

# 25.7. Tangent Frame Doctrine

Every branch-like stage requires a local orientation frame.

## 25.7.1. Tangent

The primary axis of the branch should follow:

* filtered velocity direction,
* dominant local anisotropy axis,
* or chain direction derived from neighboring segments.

A stable tangent is essential. Without it, branch geometry twists into nonsense.

## 25.7.2. Normal and Binormal

A full frame may be built using:

* previous-frame frame transport,
* a stable reference-up fallback,
* or local Frenet-like approximations where curvature is well behaved.

## 25.7.3. Stability Requirement

The tangent frame should minimize sudden flips. Branches that rotate erratically frame-to-frame will shimmer and collapse visually.

Parallel transport style frame update is generally preferable to naïve Frenet behavior in noisy discrete systems.

---

# 25.8. Radius Law and Taper Doctrine

Branch geometry lives or dies on radius behavior.

## 25.8.1. Radius Is Not Constant

A branch should almost never have perfectly constant radius from root to tip.

## 25.8.2. Proto-Filament Radius Law

Proto-filaments should taper gently.

### Desired profile

* thicker near root
* gradually narrowing toward tip
* no strong necking yet

### Canonical profile

A simple root-to-tip taper function such as:

`r(s) = rRoot * (1 - kProto * s^pProto)`

where `s` is normalized arclength from root to tip.

## 25.8.3. Ligament Radius Law

Ligaments should taper more aggressively and respond more strongly to instability.

### Canonical profile

`r(s) = rRoot * (1 - kLig * s^pLig) * (1 - inst * kInst)`

This should remain clamped above a minimal nonzero radius until necking logic takes over.

## 25.8.4. Bead-Chain Radius Law

Bead chains require a modulated radius field:

`r(s) = rBase(s) * beadMod(s)`

where `beadMod(s)` alternates between node bulges and neck constrictions.

This is the core shift from continuous branch to pearl-chain behavior.

---

# 25.9. Necking Doctrine

Necking is not just smaller radius. It is a structured alternation between thicker and thinner regions.

## 25.9.1. What necking must express

* increasing instability
* local constriction between bead-like masses
* readiness for detachment

## 25.9.2. Continuous Neck Field

A branch can maintain a scalar neck field along arclength:

`N(s)` in `[0,1]`

where:

* 0 means no necking
* 1 means extreme necking / near snap

## 25.9.3. Geometry modulation by necking

A practical modulation law is:

`beadMod(s) = 1 + aBead * nodePattern(s) - aNeck * neckPattern(s)`

where the patterns produce alternating bulges and constrictions.

## 25.9.4. Irregularity

The bead and neck patterns must not be perfectly periodic. Real breakup looks organic, not like factory-made jewelry.

Introduce controlled variation through:

* instability-weighted spacing variation,
* thickness-weighted amplitude variation,
* age-based asymmetry,
* or parent-driven phase offsets.

---

# 25.10. Bead Node Synthesis

At the bead-chain stage, the system must begin identifying explicit bead-like masses.

## 25.10.1. Implicit bead policy

One option is to keep the chain continuous and let the field renderer visually create bead-like bulges.

### Strengths

* simpler data model
* smooth appearance

### Weaknesses

* weaker detachment control
* harder to assign droplet children precisely

## 25.10.2. Explicit bead policy

A stronger approach is to identify explicit bead centers and radii along the chain.

### Strengths

* clear droplet precursors
* easier partial detachment logic
* easier diagnostics

### Weaknesses

* more state to maintain

## 25.10.3. Recommendation

Use implicit bead shaping early, then add explicit bead nodes once detachment logic is mature enough to justify them.

---

# 25.11. Parent-Body Attachment Geometry

A branch should not visually detach from the sheet too early.

## 25.11.1. Root blending

The root should blend smoothly into the parent surface.

Possible mechanisms:

* radius widening near root,
* support blending into envelope authority,
* implicit field merge at the root zone,
* or explicit root mask widening.

## 25.11.2. Attachment decay

As attachment drops, the root blend should narrow and become more thread-like.

## 25.11.3. Final detachment

When attachment falls below threshold, the branch root should stop reading as welded to the parent and instead read as separated or nearly separated.

This transition is crucial. If it is abrupt, the branch will pop. If it never happens, the branch looks glued on.

---

# 25.12. Branch Continuity Rules

The system should enforce continuity rules to keep branch geometry believable.

## 25.12.1. Positional continuity

Neighboring segments should not jump apart unless actual breakup occurs.

## 25.12.2. Radius continuity

Radius should evolve smoothly except at deliberate necking zones.

## 25.12.3. Tangent continuity

Neighboring segment tangents should remain reasonably aligned unless instability specifically creates kinks.

## 25.12.4. Temporal continuity

All of the above should evolve smoothly over time. This is a fluid branch, not an animated necklace being teleported around.

---

# 25.13. Proto-Filament Geometry Policy

Proto-filaments are the least broken branch stage.

## 25.13.1. Geometry rules

* strong continuity
* gentle taper
* little or no necking
* thick enough to still read as a coherent branch
* root strongly blended into parent body

## 25.13.2. Visual result

A smooth, stretched branch that still feels like surface water being pulled outward, not yet a detached spray thread.

---

# 25.14. Ligament Geometry Policy

Ligaments are the unstable thread stage.

## 25.14.1. Geometry rules

* stronger taper
* stronger thinning
* moderate necking onset
* weaker parent blending than proto-filaments
* greater curvature and local instability permitted

## 25.14.2. Visual result

A narrow thread under tension, visibly preparing to break.

---

# 25.15. Bead-Chain Geometry Policy

Bead chains are the transitional pre-droplet structure.

## 25.15.1. Geometry rules

* alternating bulges and necks
* irregular spacing
* irregular bead size
* partial continuity maintained
* individual bead nodes beginning to dominate local mass perception

## 25.15.2. Visual result

A string-of-pearls stage that convincingly bridges continuous thread and detached droplets.

---

# 25.16. Partial Breakup Doctrine

A bead chain should not necessarily die all at once.

## 25.16.1. Partial emission

Some beads may detach while others remain connected.

## 25.16.2. Residual structure

After emission:

* the remaining branch may still exist,
* necks may reconfigure,
* and the chain may persist briefly before further breakup.

## 25.16.3. Why this matters

This is one of the most important anti-fake rules in the whole hierarchy.

Real breakup is often progressive. One-frame total disintegration looks synthetic.

---

# 25.17. Geometry Synthesis Families

This section defines the main concrete rendering/synthesis strategies.

## 25.17.1. Segment Capsule Chain

Represent the branch as connected capsules or swept spheres along the chain.

### Strengths

* easy to implement
* easy to taper
* easy to merge into beads later

### Weaknesses

* can look mechanical if segmentation is coarse

### Verdict

Excellent first implementation.

---

## 25.17.2. Implicit Segment Field

Each segment contributes a smooth field. The visible surface is the isosurface of the combined field.

### Strengths

* fluid-like continuity
* smooth branch-to-bead transition
* strong thesis alignment

### Weaknesses

* more expensive
* more tuning required

### Verdict

Preferred long-term rendering strategy.

---

## 25.17.3. Node-Segment Hybrid

Use explicit bead nodes and connecting neck segments.

### Strengths

* very strong detachment control
* useful for bead-chain stage

### Weaknesses

* more state machinery
* more bookkeeping

### Verdict

Best when the system reaches mature droplet emission.

---

# 25.18. Recommended Implementation Path

## 25.18.1. Phase A — Segment Capsule Chain

Start with:

* ordered branch segments,
* tangent-based oriented capsule chain,
* root-to-tip taper,
* no explicit bead nodes yet,
* necking represented as radius modulation.

This gets proto-filament and ligament visuals working quickly.

## 25.18.2. Phase B — Implicit or Pseudo-Implicit Surface

Upgrade the segment chain into a more fluid-like smooth field evaluation for better continuity and root blending.

## 25.18.3. Phase C — Explicit Bead Synthesis

Add:

* bead candidates,
* neck metrics,
* partial detachment,
* residual chain persistence.

This turns the ligament-to-droplet path into something genuinely persuasive.

---

# 25.19. Geometry Packet for Rendering

A render-friendly branch packet should expose:

```text
RenderedBranchSegment
- position
- tangent
- radius
- taperWeight
- neckWeight
- attachmentWeight
- instabilityWeight
- stateFlags
- chainId
```

For bead-rich stages, optionally:

```text
RenderedBeadNode
- position
- radius
- detachReadiness
- neckLeft
- neckRight
- chainId
```

This allows the render path to remain focused on geometry and shading rather than deep simulation interpretation.

---

# 25.20. Diagnostics for Branch Geometry

This system must be observable.

## 25.20.1. Required debug views

* proto / ligament / bead-chain coloring
* radius profile view
* taper profile view
* necking heatmap
* attachment heatmap
* detachment readiness heatmap
* chain lineage coloring
* root-blend strength view

## 25.20.2. Required failure diagnostics

The engine should reveal:

* where taper is too weak,
* where branches are too uniform,
* where necking is too periodic,
* where roots remain glued too long,
* where branches snap too early,
* and where bead chains fail to persist long enough to read visually.

Without these views, tuning branch geometry becomes blind sculpture.

---

# 25.21. Failure Modes This Section Exists to Prevent

## 25.21.1. Fast-Particle Trail Syndrome

A branch rendered only as speed-stretched particles looks like a stylized trail, not fluid breakup.

## 25.21.2. Equal-Radius Tube Syndrome

A constant-radius branch looks artificial and dead.

## 25.21.3. Necklace Syndrome

Perfectly periodic bead chains look manufactured.

## 25.21.4. Glue-Root Syndrome

If the root never visually detaches, the branch feels welded to the parent surface.

## 25.21.5. Snap-Pop Syndrome

If necking and detachment happen too abruptly, breakup looks like particles toggling states instead of fluid evolving.

---

# 25.22. Closing Position of Section 25

The central claim of this section is that branch stages require their own geometry doctrine.

Proto-filaments, ligaments, and bead chains are not just different names for fast particles. They are different geometric states with different taper laws, necking behavior, attachment rules, and rendering requirements.

A successful implementation should:

* build ordered branch skeletons,
* maintain stable tangent frames,
* synthesize radius and taper along arclength,
* introduce necking progressively,
* allow bead-like bulges to emerge,
* support partial detachment,
* and preserve root continuity until attachment genuinely fails.

The recommended early path is a tapering segment-capsule chain, later upgraded into implicit field rendering and explicit bead synthesis.

That path turns the breakup hierarchy from abstract classification into visible fluid branch behavior.

---







# Section 26. Droplet Motion, Drag, Splash Impact, and Merge-Back Deposition

## Purpose

This document defines the lifecycle of detached droplet populations after they emerge from filaments, ligaments, and bead chains.

The central question of this section is:

**Once the branch hierarchy emits detached droplets, how should those droplets move, deform, collide perceptually with the parent body, fragment further if necessary, and finally merge back into the coherent fluid without looking like immortal tiny spheres or disappearing with ugly pop logic?**

This section establishes the representational and dynamic doctrine for macro-droplets, standard droplets, micro-droplets, and mist-adjacent fragments. It covers motion, drag, ballistic evolution, visual shape bias, impact response, secondary shatter, merge-back conditions, deposition behavior, and failure modes.

---

# 26.1. Core Thesis of Detached Droplet Behavior

A detached droplet is not just a small escaped particle.

Once a fragment leaves the coherent branch hierarchy, it enters a different regime of motion and representation. It is no longer a continuous sheet or ligament. But it is also not a permanent independent object. It is a **temporary detached child of the parent fluid body**.

That means a successful droplet system must express all of the following:

* flight or near-flight motion,
* size-dependent response,
* drag and damping,
* impact meaning,
* possible secondary shatter or misting,
* merge-back eligibility,
* and visual reintegration into the coherent body.

The key philosophical point is this:

**Droplets are temporary detached representatives of the fluid, not a second permanent fluid species.**

That is why reabsorption and merge-back deposition are fundamental rather than optional.

---

# 26.2. Droplet Classes

The detached population should not be one undifferentiated cloud.

## 26.2.1. Macro-Droplet

This is a relatively large detached fragment.

### Character

* clearly visible mass
* meaningful ballistic arc
* may remain slightly stretched in motion
* likely to produce visible re-entry or splash response

### Visual role

This is the large bead or child lump emitted from a major bead-chain node or violent ligament snap.

---

## 26.2.2. Standard Droplet

This is the normal detached splash bead.

### Character

* medium scale
* individually meaningful but less dominant than macro-droplets
* still worth explicit trajectory and merge-back logic

### Visual role

This is the everyday splash child population.

---

## 26.2.3. Micro-Droplet

This is a small detached fragment approaching mist scale.

### Character

* short lifetime
* strongly affected by drag
* may convert to mist or disappear into a fine spray layer
* may still merge back if it reconnects quickly

### Visual role

This is the fine end of explicit detached beads before true mist.

---

## 26.2.4. Mist-Adjacent Fragment

This is not yet full mist, but is no longer a strongly volumetric droplet.

### Character

* tiny scale
* mostly visual significance
* often created by violent impact or late-stage shatter

### Visual role

This class bridges explicit micro-droplets and mist emission.

---

# 26.3. What the Droplet System Must Achieve

A detached droplet system must satisfy the following.

## 26.3.1. Preserve Scale Hierarchy

Droplets must vary in radius and not collapse into one same-size bead language.

## 26.3.2. Preserve Motion Hierarchy

Large droplets should feel heavy and ballistic. Small droplets should feel drag-sensitive and more transient.

## 26.3.3. Preserve Visual Life

Fast droplets may remain slightly stretched or asymmetrical rather than instantly becoming perfect spheres.

## 26.3.4. Support Secondary Events

Impact, grazing re-entry, and violent micro-shatter must be possible where appropriate.

## 26.3.5. Support Merge-Back

Detached fragments must return to the coherent fluid body when local conditions justify reintegration.

## 26.3.6. Remain Bounded

The entire droplet regime must remain budgeted, compact, and controllable in browser execution.

---

# 26.4. Canonical Droplet Data Record

A detached droplet requires more than position and velocity.

## 26.4.1. Recommended record

```text
DetachedDroplet
- position
- velocity
- radius
- age
- lifetime
- dragCoeff
- wetness
- visualStretch
- mergePotential
- mergeAge
- impactEnergy
- classFlags
- parentId
- sourceChainId
- cooldown
- alive
```

## 26.4.2. Why these fields matter

* `radius` controls scale hierarchy
* `dragCoeff` controls size-dependent flight feel
* `wetness` supports shading and merge-back styling
* `visualStretch` supports velocity-shaped rendering
* `mergePotential` and `mergeAge` support explicit reintegration
* `impactEnergy` supports bounce, shatter, or mist emission
* `parentId` and `sourceChainId` preserve lineage

---

# 26.5. Droplet Birth Conditions

Droplets are born from detachment events in the branch hierarchy.

## 26.5.1. Main sources

* bead-chain node detachment
* direct ligament snap
* violent crest ejection
* impact-driven secondary emission

## 26.5.2. Birth packet

At birth, a droplet should inherit:

* parent position or bead position,
* parent velocity,
* local tangent or separation direction,
* initial radius,
* local instability or event energy,
* and parent identity.

## 26.5.3. Initial velocity doctrine

The initial droplet velocity should not be a random spray direction unless the event truly warrants it.

A good initial rule is a weighted blend of:

* local parent branch velocity,
* local tangent direction,
* neck-release separation impulse,
* and any event-specific impact or recoil impulse.

This preserves the narrative continuity of the breakup event.

---

# 26.6. Ballistic Motion Doctrine

Detached droplets enter a motion regime that is far more ballistic than coherent-sheet water.

## 26.6.1. Base motion

At minimum, droplets should respond to:

* gravity,
* drag,
* optional ambient wind or flow field,
* and optional coupling to the underlying fluid velocity field during near-contact.

## 26.6.2. Class-dependent behavior

### Macro-droplets

* lower drag influence relative to mass
* stronger inertial continuity
* longer arc persistence

### Standard droplets

* moderate drag
* moderate ballistic visibility

### Micro-droplets

* stronger drag
* shorter ballistic coherence
* more likely to fade into mist or merge quickly

## 26.6.3. Principle

Detached droplets should not all move like identical beads in a vacuum. Their motion must carry scale-dependent character.

---

# 26.7. Drag Doctrine

Drag is essential because pure ballistic motion makes small droplets look too heavy and too artificial.

## 26.7.1. Role of drag

Drag provides:

* scale differentiation,
* damping of micro-droplets,
* more believable spray arcs,
* and a path from explicit droplets toward mist-like behavior.

## 26.7.2. Conceptual law

Drag influence should increase as droplet radius decreases.

A practical doctrine is:

* macro-droplet: weak to moderate drag
* standard droplet: moderate drag
* micro-droplet: strong drag

## 26.7.3. Implementation note

The drag model does not need to be physically exact. It must produce convincing hierarchy and temporal evolution.

A well-tuned phenomenological drag is vastly better than no drag and infinitely cheaper than ritual aerodynamic overfitting.

---

# 26.8. Visual Shape Bias During Flight

A detached droplet is not always best represented as a perfect sphere.

## 26.8.1. Fast-flight stretch

When velocity is high, the droplet may remain slightly elongated or asymmetric.

### Why

This preserves continuity with the branch it came from and prevents abrupt shape collapse at detachment.

## 26.8.2. Relaxation toward roundness

As speed drops, the droplet should visually relax toward a more compact rounded form.

## 26.8.3. Class sensitivity

Macro-droplets can tolerate more visible shape persistence.
Micro-droplets should usually become small compact points quickly unless stylized otherwise.

## 26.8.4. Thesis rule

Visual stretch should be a decaying consequence of motion history, not a fixed shape class.

---

# 26.9. Lifetime Doctrine

Detached droplets should not live forever.

## 26.9.1. Lifetime controls

Each droplet should have a finite lifetime influenced by:

* class,
* radius,
* energy,
* and visibility importance.

## 26.9.2. Why lifetime matters

Lifetime rules prevent:

* immortal confetti,
* runaway population build-up,
* and budget starvation by irrelevant fragments.

## 26.9.3. Principle

Larger droplets may live longer. Smaller droplets should either merge back, convert to mist, or die quietly under strict policy.

---

# 26.10. Impact Doctrine

Impact is one of the most important moments in the droplet lifecycle.

A detached child striking the parent body or another coherent fluid region should not simply vanish or bounce arbitrarily. It must produce a meaningful response.

## 26.10.1. Types of impact

### Direct re-entry

Droplet descends into coherent body and is likely to merge.

### Grazing impact

Droplet skims or glances across the surface.

### Violent impact

Droplet hits with enough energy to produce a local splash, shatter, or mist event.

### Near-miss / no-impact

Droplet passes nearby but does not strongly interact.

## 26.10.2. Impact diagnostics

The system should estimate:

* impact speed,
* relative speed to local fluid,
* entry angle,
* local fluid coherence,
* local envelope validity,
* and droplet radius.

These diagnostics determine whether the event becomes merge-back, rebound-like continuation, shatter, or simple dissipation.

---

# 26.11. Merge-Back Entry Conditions

A detached fragment should begin merge-back only when it is genuinely reconnecting with coherent fluid.

## 26.11.1. Required cues

* contact with dense or coherent fluid support
* merge-compatible relative velocity
* plausible entry geometry
* nontrivial local fluid authority

## 26.11.2. Why not instant merge on touch?

Because a droplet may:

* skim the surface,
* bounce visually,
* produce a tiny surface dimple,
* or briefly re-emerge.

Immediate pop-delete on first overlap looks fake and cruel.

## 26.11.3. Merge-back philosophy

Merge-back should be a short, explicit transitional process, not an invisible boolean switch.

---

# 26.12. Reabsorbing State Doctrine

A droplet that satisfies merge-entry conditions should enter an explicit reabsorbing regime.

## 26.12.1. Reabsorbing state meaning

The droplet is no longer fully free, but is not yet dead.

It is being visually and dynamically reintegrated into the coherent body.

## 26.12.2. Reabsorbing behavior

During this phase, the droplet may:

* lose independent visual stretch,
* reduce visible radius,
* transfer momentum or visual weight into the surface,
* and fade its detached identity.

## 26.12.3. Completion

Once merge age exceeds threshold, the droplet transitions to dead or merged-out state.

---

# 26.13. Merge-Back Deposition

This is one of the most important ideas in the whole section.

Reabsorption should not merely kill the droplet. It should **deposit something back into the coherent fluid representation**.

## 26.13.1. Possible deposited quantities

* local momentum cue
* local thickness reinforcement
* local ripple impulse
* local splash impulse
* wetness or specular disturbance cue

## 26.13.2. Why deposition matters

Without deposition, merge-back becomes visually empty. The droplet disappears, but the parent fluid shows no sign that reunion happened.

That breaks the illusion of fluid identity.

## 26.13.3. Recommended minimal policy

At minimum, merge-back should deposit:

* a local surface disturbance magnitude,
* and a local momentum-weighted or thickness-weighted contribution.

Even a lightweight deposition policy massively improves realism.

---

# 26.14. Impact Shatter and Secondary Emission

Not every droplet that hits the parent body should simply merge. Violent impacts may emit children.

## 26.14.1. Secondary outcomes

A sufficiently energetic impact may:

* emit micro-droplets,
* emit mist,
* create a transient crown-like splash cue,
* or split the droplet into finer descendants.

## 26.14.2. When to allow this

Only under controlled conditions such as:

* high impact energy,
* sufficiently small or unstable parent fragment,
* and available spawn budget.

## 26.14.3. Anti-chaos rule

Do not let every re-entry become a tiny fireworks show. That way lies absurdity.

Violent secondary emission should be reserved for genuinely energetic events.

---

# 26.15. Grazing and Skimming Doctrine

Some droplets do not cleanly merge or shatter. They skim.

## 26.15.1. Skim behavior

A skim event may:

* briefly contact the coherent surface,
* shed some velocity,
* alter visual stretch,
* and continue with modified trajectory.

## 26.15.2. Why this matters

Without skim behavior, every near-contact event becomes either no-op or pop-merge. That kills nuance.

## 26.15.3. Practical use

A grazing mode can be implemented as a short-lived state or simply as a contact response modifier before final merge-back or continued flight.

---

# 26.16. Secondary Conversion to Mist

Micro-droplets or violent impact fragments may convert into mist.

## 26.16.1. Conversion conditions

* very small radius
* high impact or shatter energy
* high drag sensitivity
* low long-term significance

## 26.16.2. Why convert?

Because some fragments stop being meaningfully volumetric droplets and become part of the fine spray haze instead.

## 26.16.3. Principle

Mist conversion should be selective and budgeted, not the automatic fate of every small droplet.

---

# 26.17. Class-Specific Doctrine Summary

## 26.17.1. Macro-Droplets

* longer visible lifetime
* lower drag influence
* stronger ballistic identity
* stronger visible merge-back cue
* larger impact authority

## 26.17.2. Standard Droplets

* moderate drag
* moderate ballistic identity
* common merge-back path
* occasional shatter under strong impact

## 26.17.3. Micro-Droplets

* stronger drag
* short lifetime
* likely mist conversion or quiet merge-back
* low individual importance, high aggregate importance

---

# 26.18. Render Doctrine for Detached Droplets

A droplet render system should reflect both class and motion state.

## 26.18.1. Render inputs

A droplet render packet should provide:

```text
RenderedDroplet
- position
- radius
- velocityDir
- visualStretch
- wetness
- classFlags
- mergeWeight
- impactWeight
```

## 26.18.2. Shape policy

* fast macro-droplets: slightly stretched or asymmetric
* slow macro-droplets: rounder but still volumetric
* standard droplets: mostly compact, sometimes stretched
* micro-droplets: tiny points/splats unless emphasized

## 26.18.3. Merge-back rendering

As merge-back progresses, the droplet should not merely fade out. It should visually cede identity to the parent surface.

That may mean:

* shrinking detached silhouette,
* increasing surface-coupled disturbance,
* and reducing isolated specular identity.

---

# 26.19. Recommended Implementation Path

## 26.19.1. Phase A — Ballistic Droplets with Drag and Merge State

Start with:

* variable-radius droplets
* size-dependent drag
* visual stretch from velocity
* explicit reabsorbing state
* merge age
* simple deposition cue

This already solves a shocking amount of fake-bead ugliness.

## 26.19.2. Phase B — Impact Classification

Add:

* direct re-entry,
* grazing skim,
* violent impact classification,
* and conditional secondary emission.

## 26.19.3. Phase C — Advanced Shatter and Mist Conversion

Add:

* micro-shatter,
* mist conversion,
* richer deposition logic,
* and view-aware or importance-aware culling.

This is where the detached lifecycle becomes truly lush instead of merely competent.

---

# 26.20. Diagnostics for Droplet Lifecycle

This system must be observable.

## 26.20.1. Required debug views

* droplet class coloring
* drag strength heatmap
* merge potential heatmap
* merge age heatmap
* impact energy heatmap
* shatter eligibility heatmap
* skim vs merge vs shatter classification view
* parent lineage coloring

## 26.20.2. Required counters

* births by source type
* alive counts by droplet class
* merge attempts
* successful merges
* shatter events
* mist conversions
* lifetime deaths
* budget rejects

Without these counters, the detached lifecycle becomes folklore rather than engineering.

---

# 26.21. Failure Modes This Section Exists to Prevent

## 26.21.1. Immortal Bead Syndrome

Detached droplets remain forever and accumulate as scene garbage.

## 26.21.2. Vacuum-Bead Motion

All droplets move like dragless marbles regardless of size.

## 26.21.3. Instant Sphere Collapse

A newly detached fragment instantly loses all shape continuity and becomes a perfect little pellet.

## 26.21.4. Pop-Delete Merge

Droplets disappear the instant they touch the parent body with no reabsorption process.

## 26.21.5. Empty Reunion Syndrome

Droplets merge back but deposit no visible or dynamic effect into the coherent fluid.

## 26.21.6. Universal Fireworks Syndrome

Every impact shatters into more droplets and mist, turning the system into a pathological sparkle machine.

---

# 26.22. Closing Position of Section 26

The central claim of this section is that detached droplets require a full lifecycle doctrine.

They are not just tiny particles after breakup. They are temporary detached children of the parent fluid body, each with:

* class-dependent motion,
* class-dependent drag,
* decaying visual shape memory,
* possible impact or skim events,
* explicit merge-back eligibility,
* and deposition into the coherent surface when reabsorbed.

A successful implementation should:

* preserve size hierarchy,
* preserve motion hierarchy,
* avoid immortal confetti,
* allow selective shatter and mist conversion,
* and make re-entry feel like reunion rather than deletion.

That is what turns detached droplets from cheap spray beads into fluid children with a real lifecycle.

---







# Section 27. Directional Filtering Operators and Envelope Smoothing Kernels

## Purpose

This document defines the filtering doctrine for the sheet-envelope layer.

The central question of this section is:

**How should the system smooth the envelope strongly enough to eliminate particle-lobe artifacts, while still preserving coherent ripples, rolling-wave relief, crest energy, and temporal stability?**

This section formalizes the filtering side of the anti-lump architecture. It identifies the kinds of noise the envelope must remove, the kinds of structure it must preserve, the kernel families available to the system, the role of directionality and regime weighting, the dangers of naïve blurring, and a recommended staged implementation path for browser execution.

This section sits downstream of envelope extraction and upstream of final coherent-surface arbitration.

---

# 27.1. Core Thesis of Envelope Filtering

The envelope filter is not a blur pass.

It is a **structure-selective surface authority operator**.

Its purpose is not merely to reduce high-frequency variation. Its purpose is to distinguish between:

* support-induced lobe noise,
* coherent ripple content,
* rolling-wave relief,
* crest-adjacent sharpening,
* and invalid or multi-valued transitions.

A useful filter must therefore answer two questions at every local sample:

1. **What variation should be suppressed?**
2. **What variation must survive?**

This is the central anti-lump challenge.

---

# 27.2. What the Filter Must Remove

The envelope filter exists to suppress specific classes of bad structure.

## 27.2.1. Particle-Lobe Noise

This is the main target.

The visible surface inherits rounded micro-bulges from overlapping particle supports. These bulges are not meaningful water structure. They are support artifacts.

## 27.2.2. Single-Frame Support Jitter

Some local variation is not even stable lobe structure. It is frame-to-frame micro-jitter in which the dominant support configuration changes slightly.

This must be damped aggressively in calm coherent water.

## 27.2.3. Weak Ambiguous Peaks

If the extractor is seeing multiple weak candidate peaks, some of that apparent detail is not trustworthy and should not dominate the final coherent surface.

---

# 27.3. What the Filter Must Preserve

The same filter must also preserve specific classes of good structure.

## 27.3.1. Ripple Content

Low-amplitude coherent wavelets and ripples should survive when they are temporally and spatially meaningful.

## 27.3.2. Rolling-Wave Relief

The filter must preserve large-scale crest and trough structure, directional wave shape, and coherent rolling energy.

## 27.3.3. Crest Sharpness Near Transition

As the coherent sheet approaches breakup, the filter must weaken enough that crest energy is not welded into a dull membrane.

## 27.3.4. Large-Scale Curvature

Calm pools and broad bulges still have meaningful large-scale curvature. Anti-lump filtering must not flatten all curvature into a pancake.

---

# 27.4. Regime-Dependent Filtering Requirement

The filter must behave differently in different coherent-surface regimes.

## 27.4.1. Calm-Sheet Regime

### Desired behavior

* strong lobe suppression
* strong temporal stabilization
* broad curvature preserved
* ripple content preserved if coherent
* minimal artificial plasticity

### Consequence

This regime can tolerate the strongest smoothing authority.

---

## 27.4.2. Rolling-Sheet Regime

### Desired behavior

* moderate lobe suppression
* lower smoothing authority than calm regime
* stronger relief preservation
* stronger directional continuity

### Consequence

Rolling sheet should remain smooth, but visibly alive.

---

## 27.4.3. Breakup-Adjacent Regime

### Desired behavior

* rapidly weakening smoothing authority
* crest sharpening permitted
* top-envelope confidence may still contribute, but filtering should not weld geometry that wants to fragment

### Consequence

Filtering authority must degrade continuously as breakup and overhang pressure rise.

---

# 27.5. Inputs to the Filtering System

The filtering system should not operate on raw height alone.

A robust filter should consume a packet that includes at minimum:

* envelope height or top-surface candidate
* envelope confidence
* smoothing authority
* ripple-preservation weight
* rolling-relief preservation weight
* overhang penalty
* ambiguity score
* breakup instability
* calm vs rolling regime weights
* optional dominant direction or tangent field
* optional normal field or local slope magnitude

The filter is therefore best understood as a **guided operator**, not an unguided blur.

---

# 27.6. Filter Families Available to the System

Several families of operators are viable.

## 27.6.1. Isotropic Weighted Averaging

The simplest family is local weighted averaging in a fixed neighborhood.

### Strengths

* easy to implement
* fast
* good as a baseline

### Weaknesses

* blurs in all directions equally
* prone to killing coherent ripple structure
* poor near sharp rolling features

### Verdict

Useful only as a minimum baseline or subcomponent.

---

## 27.6.2. Bilateral-Like Filtering

This family weights neighbors not just by spatial distance but also by surface similarity, confidence, or local gradient agreement.

### Strengths

* better preservation of meaningful shape changes
* suppresses noise while respecting stronger structural transitions
* good fit for envelope confidence weighting

### Weaknesses

* more expensive than plain averaging
* still limited if directionality is ignored

### Verdict

Strong practical choice for early serious implementation.

---

## 27.6.3. Directionally Biased Filtering

This family smooths more strongly in some directions than others.

### Strengths

* preserves wave-aligned or crest-aligned structure
* reduces lobe noise without erasing directional relief
* strong match for rolling-sheet water

### Weaknesses

* requires a stable direction field
* more difficult to tune

### Verdict

Essential for high-quality rolling-surface behavior.

---

## 27.6.4. Multi-Pass Regime Filter

This family applies different operators or strengths depending on regime masks.

### Strengths

* directly aligned with calm vs rolling logic
* clear implementation pathway
* easy to stage incrementally

### Weaknesses

* requires clean regime weights and stable arbitration

### Verdict

Recommended implementation doctrine.

---

## 27.6.5. Anisotropic Diffusion-Like Filtering

This family smooths adaptively based on local structure and gradient behavior.

### Strengths

* potentially excellent at preserving meaningful detail while removing noise
* strong theoretical fit

### Weaknesses

* more expensive
* more subtle to stabilize
* easier to over-engineer into a browser regret machine

### Verdict

A valuable advanced path, but not the first implementation.

---

# 27.7. Canonical Filtering Decomposition

A robust implementation should conceptually decompose the filter into three factors.

## 27.7.1. Spatial Proximity Weight

How close is the neighbor sample?

## 27.7.2. Structural Compatibility Weight

How compatible is the neighbor with the current sample in terms of confidence, surface value, slope, or support meaning?

## 27.7.3. Regime Authority Weight

How much authority does the system have to smooth at all, given calmness, rollingness, breakup pressure, and ripple preservation?

The final filter weight for a sample pair should be a product or controlled blend of these factors.

---

# 27.8. Spatial Kernel Families

## 27.8.1. Compact Radial Kernel

A standard local kernel over a small neighborhood.

### Strengths

* simple
* bounded work

### Weaknesses

* isotropic by default

### Best use

Base neighborhood accumulation for calm smoothing.

---

## 27.8.2. Elliptical Kernel

A kernel with different radii along two principal directions.

### Strengths

* supports directional smoothing
* excellent for rolling-wave surfaces

### Weaknesses

* requires direction estimation

### Best use

Rolling-envelope directional smoothing.

---

## 27.8.3. Tilt-Aware Projected Kernel

A kernel aligned to local surface tangent space or local dominant flow direction.

### Strengths

* respects local surface orientation
* potentially stronger preservation of coherent wave structure

### Weaknesses

* more unstable if orientation estimates are noisy

### Best use

Later refinement when direction fields are trustworthy.

---

# 27.9. Structural Compatibility Terms

The filter should resist smoothing across incompatible samples.

## 27.9.1. Height Compatibility

Samples whose envelope heights differ too much may not belong to the same coherent local structure.

This suggests a height-compatibility term that weakens smoothing across large value jumps.

## 27.9.2. Confidence Compatibility

Samples with low confidence or conflicting candidate status should contribute less authority to one another.

This helps prevent ambiguous cells from destabilizing stable coherent regions.

## 27.9.3. Normal or Slope Compatibility

Large disagreement in local normal or slope can indicate a meaningful structure boundary or onset of invalid geometry.

The filter should weaken across such boundaries.

## 27.9.4. Breakup Compatibility

Samples with strong breakup pressure should not strongly influence calm-sheet smoothing.

Breakup-adjacent regions should be allowed to decouple from strongly smoothed calm zones.

---

# 27.10. Regime Authority Terms

This is where the filter becomes thesis-aligned instead of generic.

## 27.10.1. Smoothing Authority

The primary scalar controlling how much smoothing may happen at all is the smoothing authority from the envelope mathematics.

This should be highest in calm, coherent, high-confidence envelope regions.

## 27.10.2. Ripple Preservation

Ripple preservation must directly push back against smoothing when coherent high-frequency structure is present.

## 27.10.3. Relief Preservation

Rolling-relief preservation must directly push back against flattening in active wave zones.

## 27.10.4. Overhang Suppression

As overhang or ambiguity rises, envelope filtering authority must fall rather than aggressively forcing a fake top sheet.

---

# 27.11. Canonical Filter Weight Form

A practical conceptual filter weight for sample `j` influencing sample `i` can be written as:

`W_ij = Wspace_ij * Wheight_ij * Wconf_ij * Wnormal_ij * Wregime_i * WcompatBreak_ij`

where:

* `Wspace_ij` is spatial proximity
* `Wheight_ij` is height or value compatibility
* `Wconf_ij` is confidence compatibility
* `Wnormal_ij` is slope or normal compatibility
* `Wregime_i` is local smoothing authority
* `WcompatBreak_ij` suppresses smoothing across breakup-disagreeing samples

This is not yet a final code formula. It is the correct structural template.

---

# 27.12. Calm-Sheet Filtering Policy

Calm water deserves the strongest anti-lump treatment.

## 27.12.1. Kernel behavior

* broader support radius
* stronger smoothing authority
* stronger temporal blending
* strong rejection of weak ambiguous peaks

## 27.12.2. Preservation behavior

* preserve broad curvature
* preserve coherent ripple detail if ripple-preservation weight is high
* suppress isolated bumps aggressively

## 27.12.3. Failure risk

If calm filtering is too weak, the surface stays marbly.

If calm filtering is too strong, the surface becomes dead and plasticky.

So the operator must be aggressively selective, not merely aggressive.

---

# 27.13. Rolling-Sheet Filtering Policy

Rolling coherent waves require directional mercy.

## 27.13.1. Kernel behavior

* narrower effective smoothing than calm regime
* directional or anisotropic support preferred
* stronger slope and relief preservation

## 27.13.2. Preservation behavior

* preserve crest/trough structure
* preserve directional wave grouping
* preserve face asymmetry where possible

## 27.13.3. Failure risk

If rolling filtering behaves like calm filtering, wave faces collapse into sleepy plastic forms.

This must be avoided at all costs.

---

# 27.14. Direction Fields for Anisotropic Filtering

Directional filtering requires a stable direction field.

## 27.14.1. Candidate sources

Possible direction sources include:

* local surface tangent from envelope gradient
* dominant flow direction from velocity field
* dominant anisotropy axis from support covariance
* crest tangent or wave-front tangent from neighboring surface structure

## 27.14.2. Recommended doctrine

For early implementation, the safest directional guide is usually a filtered projection of local flow or surface tangent, because it is already close to the visible rolling behavior.

## 27.14.3. Stability rule

The direction field must be temporally smoothed or hysteretically stabilized. A noisy direction field will make anisotropic filtering shimmer and rotate unpredictably.

---

# 27.15. Directional Smoothing Patterns

Once a stable direction field exists, the filter can distinguish between smoothing:

* along the dominant direction,
* across the dominant direction,
* or in a mixed elliptical footprint.

## 27.15.1. Along-direction smoothing

Useful for preserving elongated wave coherence while reducing small-scale noise.

## 27.15.2. Cross-direction smoothing

Useful for lobe suppression, but dangerous if overused because it can flatten crest relief.

## 27.15.3. Elliptical policy

A good rolling filter often uses an elliptical footprint with stronger smoothing along coherence direction and weaker smoothing across it.

This preserves wave identity while still cleaning support artifacts.

---

# 27.16. Multi-Scale Filtering Doctrine

Not all unwanted structure lives at one scale.

## 27.16.1. Why multi-scale matters

Particle-lobe noise is often small-scale.
Broad coherent curvature is large-scale.
Ripples may live between these scales.

A single-pass operator may confuse them.

## 27.16.2. Recommended doctrine

Use at least a conceptual two-scale separation:

* small-scale suppression of support-lobe noise
* large-scale preservation of coherent curvature and rolling relief

## 27.16.3. Later refinement

A multi-band or scale-aware operator can improve results significantly once the baseline system is stable.

---

# 27.17. Temporal Filtering Doctrine

Spatial filtering alone is insufficient. Temporal filtering is part of the anti-lump system.

## 27.17.1. What temporal filtering should stabilize

* envelope height
* confidence
* smoothing authority
* direction field
* arbitration weights

## 27.17.2. Calm temporal policy

Calm coherent water should update slowly enough to suppress shimmer.

## 27.17.3. Rolling temporal policy

Rolling coherent water should still be stabilized, but not so heavily that wave motion becomes laggy or syrupy.

## 27.17.4. Breakup-adjacent policy

Near breakup, temporal inertia should weaken so the system can hand off quickly instead of dragging the envelope through a delayed fake coherence phase.

---

# 27.18. Confidence-Aware Filtering

Low-confidence samples should not dominate neighborhood smoothing.

## 27.18.1. Why

If ambiguous or invalid cells are allowed to influence confident coherent regions equally, the filter will spread uncertainty outward.

## 27.18.2. Policy

Use confidence not just as an output, but as a gating factor inside the filter weights.

This means low-confidence cells can still receive smoothing from strong neighbors, but should contribute less authority back.

This asymmetry is extremely useful.

---

# 27.19. Ambiguity-Aware Filtering

If extraction produced multiple competing candidates, the filter must not pretend the best candidate is fully trustworthy.

## 27.19.1. Ambiguity penalty

High ambiguity should reduce:

* smoothing authority
* confidence propagation
* top-envelope dominance

## 27.19.2. Interpretation

Ambiguity is not just a diagnostic. It is an active control term that keeps the filter honest near multi-valued regions.

---

# 27.20. Overhang-Aware Filtering

The filter must explicitly weaken near invalid top-surface geometry.

## 27.20.1. Policy

As overhang penalty rises:

* reduce envelope smoothing radius
* reduce flattening bias
* reduce confidence influence
* increase hand-off readiness to non-envelope or breakup representations

## 27.20.2. Principle

Do not let the filter try to rescue geometry that is no longer valid for top-envelope treatment.

That is the exact path to fake crest welding.

---

# 27.21. Filter Output Packet

After filtering, the system should output a coherent packet for final surface arbitration.

## 27.21.1. Recommended fields

```text
FilteredEnvelopeSample
- filteredHeight
- filteredNormal
- filteredThickness
- filteredConfidence
- filteredSmoothingAuthority
- ripplePreservationWeight
- reliefPreservationWeight
- ambiguity
- overhangPenalty
- arbitrationWeights
```

This packet becomes the coherent-surface truth that the final compositor reads.

---

# 27.22. Recommended Implementation Path

## 27.22.1. Phase A — Confidence-Weighted Bilateral Calm Filter

Start with:

* local height-compatible smoothing
* confidence weighting
* calm vs rolling strength split
* temporal stabilization

This alone can solve a large portion of the lumpy-at-rest problem.

## 27.22.2. Phase B — Directional Rolling Filter

Add:

* stable direction field
* elliptical kernel or directional neighborhood
* relief-preservation weighting

This is where rolling coherent water stops looking overly blurred.

## 27.22.3. Phase C — Ambiguity and Overhang-Aware Operator

Add:

* explicit ambiguity suppression
* overhang-aware weakening
* breakup-adjacent filter fade

This is where the filter stops being merely good and starts being correct.

## 27.22.4. Phase D — Multi-Scale Refinement

Add:

* scale-aware smoothing
* improved ripple discrimination
* specialized crest-adjacent handling

This is the route to premium quality once the basic architecture is stable.

---

# 27.23. Diagnostics for Filtering

This system must be directly observable.

## 27.23.1. Required debug views

* raw vs filtered envelope comparison
* smoothing authority heatmap
* ripple-preservation heatmap
* relief-preservation heatmap
* direction field visualization
* ambiguity heatmap
* overhang penalty heatmap
* filter-radius or kernel-shape visualization

## 27.23.2. Required failure diagnostics

The engine should reveal:

* where lobe noise survives,
* where ripples are being over-killed,
* where rolling waves are being flattened too much,
* where overhang suppression is failing,
* and where temporal lag is making the surface feel syrupy.

Without these diagnostics, filtering becomes aesthetic guesswork with a math costume.

---

# 27.24. Failure Modes This Section Exists to Prevent

## 27.24.1. Blur Soup

A naive blur kills both lumps and life.

## 27.24.2. Crest Welding

Over-smoothing near energetic rolling or breakup-adjacent regions glues dynamic water into fake coherence.

## 27.24.3. Shimmer Field

Weak temporal stability causes envelope filtering to flicker or crawl frame to frame.

## 27.24.4. Directional Chaos

A noisy direction field makes anisotropic filtering unstable and visually twitchy.

## 27.24.5. Confidence Blindness

If the filter ignores confidence and ambiguity, invalid regions contaminate valid ones.

---

# 27.25. Closing Position of Section 27

The central claim of this section is that envelope filtering must be a guided, regime-aware, directionally selective structure operator.

It must not merely smooth the surface. It must decide, sample by sample, how much local structure is noise, how much is coherent ripple, how much is rolling relief, and how much is too ambiguous or invalid to treat as top-envelope truth.

A successful implementation should:

* weight filtering by confidence and smoothing authority,
* preserve ripple and relief through explicit control weights,
* use stronger filtering in calm coherent regions,
* use directional filtering in rolling regimes,
* weaken gracefully near breakup and overhang,
* and stabilize the entire result temporally.

That is the correct way to kill particle lobes without killing the water.

---







# Section 28. Overhang Diagnostics and Ambiguity Handling

## Purpose

This document defines the diagnostic and control framework that keeps the sheet-envelope system honest when the fluid surface is no longer locally single-valued.

The central question of this section is:

**How should the system detect, quantify, and respond to overhangs, folds, multi-layer support, underside dominance, and candidate ambiguity so that the envelope does not falsely impose a top-surface interpretation where the geometry has already become invalid for that model?**

This section gives the anti-lump architecture one of its most important guardrails. Without a robust overhang and ambiguity framework, the envelope layer becomes overconfident, and the result is fake crest welding, false heightfield dominance, and incorrect arbitration in the exact regions where the water is becoming most visually interesting.

---

# 28.1. Core Thesis of Overhang and Ambiguity Handling

The envelope layer is only correct where a coherent top-surface interpretation remains locally valid.

As soon as the water begins to:

* fold,
* curl,
* overturn,
* produce stacked support layers,
* or enter ambiguity about which support should be treated as the visible coherent top skin,

the envelope must lose authority.

That means the system needs two distinct but related concepts:

## 28.1.1. Overhang

A geometric invalidity in which the surface is no longer well represented as a single-valued top-envelope field.

## 28.1.2. Ambiguity

An uncertainty or competition among candidate top-surface interpretations, even if the geometry is not yet fully invalid.

The system must be able to distinguish these, because ambiguity is not always full failure, but it is always a warning.

---

# 28.2. Why This Section Exists

Without explicit overhang and ambiguity logic, the envelope system tends to make the same category of mistake over and over again:

* it sees a locally strong candidate,
* it assumes the candidate is the coherent top surface,
* and it smooths or flattens the region as though the topology were still simple.

This is exactly how good anti-lump logic turns into bad anti-fluid logic.

The role of this section is therefore not merely diagnostic. It is protective.

It exists to stop the envelope from lying.

---

# 28.3. Envelope Failure Modes Caused by Missing Diagnostics

If the system cannot reason about overhang and ambiguity, several failure modes appear.

## 28.3.1. Crest Welding

A curling or folding crest is falsely smoothed into one coherent membrane.

## 28.3.2. False Top Dominance

The system chooses the wrong support layer as the visible top envelope and suppresses the actually visible or dynamically meaningful geometry.

## 28.3.3. Multi-Layer Collapse

Two or more locally valid support layers are incorrectly collapsed into one overconfident surface.

## 28.3.4. Surface Pop

The envelope remains overconfident until the last possible moment and then collapses abruptly when the geometry becomes too contradictory to ignore.

## 28.3.5. Breakup Delay

The system continues treating a region as envelope-valid even though it should already be handing authority to branch or breakup logic.

---

# 28.4. Core Diagnostic Categories

The system should reason about at least five distinct diagnostic categories.

## 28.4.1. Candidate Ambiguity

Multiple candidate top surfaces are competing, and the system is not justified in strongly trusting one without penalty.

## 28.4.2. Multi-Layer Support

The local support field contains more than one meaningful layer or peak, suggesting stacked geometry or folded surface structure.

## 28.4.3. Normal Conflict

Local normals or gradient directions disagree strongly enough that a simple coherent top surface is suspect.

## 28.4.4. Underside Dominance

A substantial local region is dominated by underside-facing geometry rather than top-facing coherent skin.

## 28.4.5. Vertical Inversion / Curl Signal

The geometry shows signs of folding, turning over, or forming a crest whose local topology is ceasing to be top-envelope valid.

These categories need not be perfectly orthogonal. They are different lenses on the same local failure of top-surface simplicity.

---

# 28.5. Candidate Ambiguity

Ambiguity is the soft warning state before full invalidity.

## 28.5.1. Definition

Candidate ambiguity exists when two or more local support candidates compete strongly enough that the system cannot confidently declare one to be the dominant coherent top surface.

## 28.5.2. Why ambiguity matters

The envelope does not need to be completely wrong to become dangerous. It only needs to be too certain in a region where the truth is contested.

Ambiguity therefore acts as a confidence suppressor and a smoothing suppressor.

## 28.5.3. Candidate competition doctrine

A candidate should not win merely because it is slightly higher than another. It should win because it is sufficiently more coherent, more top-valid, and less breakup-adjacent.

If two candidates score similarly, the system should not fully trust either.

---

# 28.6. Ambiguity Metrics

The extractor or candidate-ranking stage should expose enough information to quantify ambiguity.

## 28.6.1. Best-vs-second-best gap

The simplest ambiguity metric is the normalized gap between the best candidate score and the second-best candidate score.

Conceptually:

`Amb_gap = 1 - saturate((bestScore - secondScore - gap0) / (gap1 - gap0))`

Interpretation:

* large score gap -> low ambiguity
* small score gap -> high ambiguity

## 28.6.2. Candidate count pressure

If many candidates exist in one local column or tile, ambiguity should rise even if the best candidate still technically wins.

Conceptually:

`Amb_count = saturate((candidateCount - count0) / (count1 - count0))`

## 28.6.3. Candidate height separation ambiguity

If candidates are separated vertically but remain similarly plausible, ambiguity rises because the system is seeing stacked meaningful support layers.

A height-separation metric helps distinguish true multi-layer geometry from a single broad noisy peak.

## 28.6.4. Combined ambiguity

A practical ambiguity score may combine:

* best-vs-second gap
* candidate count
* candidate height separation
* confidence disagreement

The point is not one perfect formula. The point is to make candidate uncertainty explicit instead of letting it hide inside the extractor.

---

# 28.7. Multi-Layer Support Diagnostics

Multi-layer support is a stronger signal than ambiguity alone.

## 28.7.1. Definition

Multi-layer support exists when the local support field contains multiple strong support layers or peaks that are not plausibly just noise around one coherent surface.

## 28.7.2. Why this matters

A multi-layer field often indicates:

* folding sheet water,
* a crest overhanging the body beneath it,
* detached splash arcs above a parent sheet,
* or other topological complexity that invalidates a simple top envelope.

## 28.7.3. Detection doctrine

The system should count or score distinct support peaks or robust threshold crossings in a local column, volume slice, or neighborhood.

If more than one strong candidate survives support, topness, and coherence gating, multi-layer penalty should rise.

---

# 28.8. Normal Conflict Diagnostics

Normal disagreement is one of the most useful and most intuitive invalidity cues.

## 28.8.1. Definition

Normal conflict exists when neighboring samples that would otherwise contribute to one coherent envelope strongly disagree in surface orientation.

## 28.8.2. Why this matters

A simple top-envelope interpretation assumes directional coherence of the visible surface. If the local normals strongly oppose each other, one of the following is usually happening:

* a curl or fold is forming,
* the region contains stacked support,
* or the extractor is attempting to unify geometry that should be separated.

## 28.8.3. Practical forms

Normal conflict may be estimated from:

* variance of local normal directions,
* low dot-product agreement with the dominant normal,
* disagreement between support-gradient normal and filtered-envelope normal,
* or disagreement between neighboring candidate normals.

This diagnostic is especially powerful near cresting and rolling transitions.

---

# 28.9. Underside Dominance Diagnostics

A top-envelope should not retain authority where underside-facing geometry is dominant.

## 28.9.1. Definition

Underside dominance exists when a substantial fraction of local support is associated with normals or gradients that face downward or otherwise contradict the expected top-surface direction.

## 28.9.2. Why this matters

Underside dominance is one of the clearest signs that the local surface is no longer a simple top sheet.

## 28.9.3. Detection doctrine

A practical system can estimate underside dominance by measuring:

* fraction of local support with negative up-facing tendency,
* candidate normal orientation disagreement,
* or dominance of non-top-facing peaks.

This metric should heavily penalize envelope confidence.

---

# 28.10. Vertical Inversion and Curl Diagnostics

Overturning geometry often reveals itself through vertical inversion and crest-curl signals before the topology is fully detached.

## 28.10.1. Vertical inversion

Vertical inversion exists when local structure that previously behaved as a top surface begins to turn, fold, or reverse in a way inconsistent with a single-valued envelope.

## 28.10.2. Curl signal

A curl signal may be inferred from:

* increasing normal rotation across the local neighborhood,
* rising overhang tendency combined with elevated rollingness,
* high exposure plus falling topness,
* or crest-local curvature patterns.

## 28.10.3. Why this matters

This is often the earliest warning that a wave face is becoming a crest that should stop receiving strong top-envelope authority.

---

# 28.11. Canonical Overhang Penalty Construction

The architecture needs one practical scalar that summarizes geometric invalidity pressure.

Call it `OverhangPenalty`.

## 28.11.1. Required contributors

A practical overhang penalty should rise with:

* multi-layer support
* normal conflict
* underside dominance
* vertical inversion / curl
* and optionally breakup-adjacent invalidity

## 28.11.2. Canonical form

Conceptually:

`OverhangPenalty = saturate(wMulti * MultiLayer + wNorm * NormalConflict + wUnder * Underside + wCurl * Curl + wBreak * BreakAdjInvalidity)`

This does not need to be interpreted as a physical law. It is a geometry-validity control field.

## 28.11.3. Interpretation

* near 0: geometry is locally top-envelope friendly
* moderate: geometry is becoming suspicious or ambiguous
* high: geometry should strongly suppress envelope authority

---

# 28.12. Relationship Between Ambiguity and Overhang

Ambiguity and overhang are related but not identical.

## 28.12.1. Ambiguity as uncertainty

Ambiguity means the system is not sure which candidate should dominate.

## 28.12.2. Overhang as invalidity

n
Overhang means a simple top-envelope interpretation is likely no longer trustworthy at all.

## 28.12.3. Practical consequence

Ambiguity should usually:

* reduce confidence,
* reduce smoothing authority,
* and weaken envelope dominance.

Overhang should do all of those more strongly and also accelerate hand-off to non-envelope or breakup modes.

---

# 28.13. Diagnostic Response Doctrine

Once ambiguity or overhang rises, the system must respond systematically.

## 28.13.1. Confidence suppression

Ambiguous or overhang-prone regions should lose envelope confidence.

## 28.13.2. Smoothing suppression

The system should reduce flattening and smoothing authority in these regions. It must not try to iron invalid geometry into fake coherence.

## 28.13.3. Arbitration shift

As ambiguity and overhang rise, final surface authority should shift away from envelope and toward:

* coherent non-envelope support,
* branch geometry,
* or breakup representation.

## 28.13.4. Temporal honesty

The system should begin weakening envelope authority before catastrophic failure, not after. This makes hand-off graceful instead of abrupt.

---

# 28.14. Ambiguity-Aware Envelope Extraction Policy

The extractor itself should be ambiguity-aware, not just the downstream arbitration stage.

## 28.14.1. Candidate retention

If ambiguity is modest but not extreme, the extractor should keep the secondary candidate and expose ambiguity to later stages rather than pretending certainty.

## 28.14.2. Confidence penalty

The best candidate’s confidence should be penalized when competition is strong.

## 28.14.3. Multi-candidate persistence

Temporally, the extractor should track if candidate competition is stable over time. Repeated ambiguity is stronger evidence than one noisy frame.

This makes the extractor less fragile and the envelope less arrogant.

---

# 28.15. Overhang-Aware Filtering Policy

Directional filtering and smoothing must explicitly consume ambiguity and overhang diagnostics.

## 28.15.1. Why

If a region is ambiguous or overhung, aggressive smoothing does not solve the problem. It hides it badly.

## 28.15.2. Filter response

As ambiguity rises:

* reduce confidence propagation
* reduce smoothing authority
* narrow the effective filter footprint

As overhang rises:

* sharply reduce envelope smoothing radius
* suppress flattening bias
* raise hand-off readiness

## 28.15.3. Desired result

The envelope should become more cautious exactly where its assumptions are beginning to fail.

---

# 28.16. Breakup-Coupled Invalidity

Overhang and ambiguity are not purely geometric. They are often coupled to breakup onset.

## 28.16.1. Joint warning state

When the following rise together:

* ambiguity
* overhang penalty
* elongation
* thinning
* breakup instability

then the system should strongly suspect imminent exit from the envelope regime.

## 28.16.2. Consequence

This combined pattern should:

* suppress envelope confidence,
* reduce smoothing authority,
* and raise breakup authority more aggressively than any single scalar alone.

This is one of the most important bridges between the coherent-surface system and the branch hierarchy.

---

# 28.17. Temporal Stabilization of Invalidity Diagnostics

Even invalidity signals need temporal discipline.

## 28.17.1. Why

If overhang penalty and ambiguity flicker wildly from frame to frame, the envelope will wobble between authority and suppression, creating visible pop and shimmer.

## 28.17.2. Recommended tools

* temporal filtering of ambiguity
* temporal filtering of overhang penalty
* enter/exit hysteresis for “invalid enough” states
* candidate persistence counters
* curl event latches for violent crest events

## 28.17.3. Principle

The system should become uncertain smoothly, not chaotically.

---

# 28.18. Canonical Diagnostic Packet

A strong implementation should expose the following per extraction cell or relevant surface sample:

```text
EnvelopeInvalidityPacket
- ambiguity
- candidateCount
- bestScore
- secondScore
- multiLayerPenalty
- normalConflict
- undersidePenalty
- curlPenalty
- overhangPenalty
- breakupCoupledInvalidity
- temporalInvalidityWeight
```

This packet should be accessible to:

* extraction
* filtering
* arbitration
* debugging

Without this packet, the system cannot reason clearly about its own uncertainty.

---

# 28.19. Visual Debug Doctrine

This section is unusually dependent on observability.

## 28.19.1. Required debug views

* ambiguity heatmap
* candidate-count visualization
* best-vs-second-score gap heatmap
* multi-layer support heatmap
* normal conflict heatmap
* underside dominance heatmap
* curl / inversion heatmap
* final overhang penalty heatmap
* envelope invalidity composite view

## 28.19.2. Why this matters

Overhang failure is often misdiagnosed as filtering failure or extraction failure when it is actually uncertainty being ignored.

The only antidote is explicit visibility into the invalidity field.

---

# 28.20. Failure Modes This Section Exists to Prevent

## 28.20.1. False Certainty

The extractor chooses one candidate with high confidence in a region that is actually contested.

## 28.20.2. Crest Welding

The envelope smooths a folding crest into fake coherence.

## 28.20.3. Ambiguity Blindness

The system hides candidate competition instead of surfacing it as a control term.

## 28.20.4. Invalidity Pop

The envelope stays dominant too long and then collapses suddenly.

## 28.20.5. Breakup Delay

The system waits too long to hand off authority away from the envelope in regions that are already effectively branch-like.

---

# 28.21. Recommended Implementation Path

## 28.21.1. Phase A — Dual-Candidate Ambiguity

Start with:

* best and second-best candidate scores
* candidate-count tracking
* ambiguity score from gap and count
* confidence suppression from ambiguity

This already gives the envelope system much-needed humility.

## 28.21.2. Phase B — Multi-Layer and Normal Conflict Diagnostics

Add:

* multi-layer support metric
* normal conflict metric
* combined overhang penalty

This gives the system genuine geometric self-awareness.

## 28.21.3. Phase C — Curl and Breakup-Coupled Invalidity

Add:

* vertical inversion or crest-curl diagnostics
* invalidity latches near violent crest events
* stronger coupling to breakup authority

This is where the envelope becomes behaviorally honest near the most important transition zones.

---

# 28.22. Closing Position of Section 28

The central claim of this section is that the envelope layer must know when its own assumptions are failing.

It must not only extract a top surface. It must diagnose when the geometry is becoming contested, folded, multi-layered, underside-dominant, or breakup-adjacent.

A successful implementation should:

* quantify candidate ambiguity,
* detect multi-layer support,
* measure normal conflict,
* detect underside and curl-like invalidity,
* combine them into an overhang penalty,
* and use that information to suppress confidence, reduce smoothing authority, and accelerate hand-off away from the envelope.

That is how the system avoids false coherence and remains visually honest when the water begins to do beautiful, ugly, topology-breaking things.

---






# Section 29. Branch-to-Droplet Detachment Mathematics and Spawn Policy

## Purpose

This document defines the mathematical and policy framework for converting branch-stage breakup structures into detached droplet populations.

The central question of this section is:

**Given a proto-filament, ligament, or bead-chain structure with evolving thickness, instability, attachment, and necking, when should the system actually emit detached droplets, how many should it emit, what size should they be, what velocity should they inherit, and how should that emission be budgeted and staged so that breakup reads as progressive fluid detachment rather than binary particle popping?**

This section is the exact bridge between Section 25 branch geometry and Section 26 detached droplet lifecycle. It formalizes detachment readiness, bead-node release, spawn quantity control, radius hierarchy, inherited motion, budget policy, cooldowns, and partial breakup behavior.

---

# 29.1. Core Thesis of Detachment

Detachment is not a boolean event.

A convincing breakup system does not simply ask:

* “is the branch broken?”

It asks a richer set of questions:

* how necked is the structure?
* how thin is the local support?
* how much attachment remains?
* how strong is the separation impulse?
* how much instability has persisted over time?
* how much of the chain should detach now versus remain connected?
* how many children can be emitted within budget?

The branch-to-droplet transition must therefore be treated as a **progressive release process** rather than a one-step toggle.

---

# 29.2. The Detachment Problem in the Full Hierarchy

Detachment occurs after coherent-surface logic has already yielded authority to branch geometry.

The sequence is conceptually:

* coherent sheet
* proto-filament
* ligament
* bead chain
* detached droplets

But this sequence is not perfectly rigid.

A violent ligament may snap directly into droplets.
A bead chain may partially emit only some children.
A proto-filament may fail to detach and instead re-stabilize.

This means the detachment model must support both:

* canonical staged breakup,
* and rare direct snap paths.

---

# 29.3. What the Detachment System Must Achieve

A robust detachment policy must satisfy the following.

## 29.3.1. Progressive release

The system must support partial detachment rather than one-frame total annihilation.

## 29.3.2. Radius hierarchy

Emitted droplets must inherit meaningful size differences rather than collapsing to one constant radius.

## 29.3.3. Velocity continuity

Child droplets must inherit motion that makes sense relative to the parent branch.

## 29.3.4. Budgeted spawning

Detachment must respect both global and local spawn budgets.

## 29.3.5. Residual branch persistence

The remaining chain or ligament must be allowed to persist and continue evolving after partial emission.

## 29.3.6. State honesty

The detachment system must not emit children from branch states that are insufficiently necked, insufficiently unstable, or still strongly attached without good reason.

---

# 29.4. Canonical Branch Inputs

A detachment decision must be driven by explicit branch-state quantities rather than vague vibes.

For a branch segment, bead node, or local branch arclength sample, the system should have access to some subset of:

* radius or thickness
* thinning score
* instability score
* necking score
* attachment weight
* branch age
* breakup age
* local tangent
* local velocity
* root-to-tip coordinate
* local bead readiness
* parent branch state
* local curvature or separation tendency

These quantities together define whether the local structure is merely thin, or whether it is genuinely ready to release detached children.

---

# 29.5. Detachment Regimes

Detachment logic should differ across branch stages.

## 29.5.1. Proto-Filament Detachment

Proto-filaments should rarely emit children directly.

### Allowed only when

* instability becomes extreme very quickly
* attachment collapses unusually fast
* or an external violent impulse forces direct snap behavior

### Thesis role

This is an exceptional path, not the default.

---

## 29.5.2. Ligament Detachment

Ligaments may emit children through direct snap when necking has not yet matured into a clear bead chain but the thread has become too unstable to remain continuous.

### Thesis role

This is the common fast-break path.

---

## 29.5.3. Bead-Chain Detachment

This is the preferred canonical release path.

### Behavior

* local bead nodes become droplet precursors
* necks collapse progressively
* some beads detach while others remain connected

### Thesis role

This is the most visually persuasive detachment mode because it preserves the bridge between continuous thread and detached droplets.

---

# 29.6. Detachment Readiness

The core scalar of this section is **detachment readiness**.

This quantity measures how justified the system is in releasing a detached child from a local branch region.

## 29.6.1. Intuition

Detachment readiness should rise when:

* necking is strong,
* attachment is weak,
* instability is high,
* local radius is low enough to justify release,
* and a separation impulse or separation tendency is present.

## 29.6.2. Generic readiness form

A conceptual generic form is:

`DetachReady = f(necking, instability, thinning, attachment, separationImpulse, age)`

where the exact function is tuned for stage and implementation style.

---

# 29.7. Ligament-Level Detachment Mathematics

Before explicit bead nodes exist, a ligament may still need a direct-snap detachment path.

## 29.7.1. Ligament snap readiness

A practical ligament snap metric may grow with:

* instability
* thinning
* low attachment
* branch age beyond minimum maturity

Conceptually:

`DetachLig = Inst^aI * Thin^aT * (1 - Attach)^aA * Mature^aM`

where `Mature` is a maturity gate rising after a minimum age or minimum sustained instability.

## 29.7.2. Use case

If `DetachLig` crosses threshold before bead structure is strong enough, direct ligament snap emission may occur.

## 29.7.3. Policy

This path should emit fewer, more energetic children than canonical bead-chain release and should usually leave a weakened residual branch unless the ligament is effectively destroyed.

---

# 29.8. Bead-Chain Detachment Mathematics

This is the canonical release model.

## 29.8.1. Local bead candidate

Each bead candidate `m` should provide:

* bead radius `rb_m`
* left neck radius `rnL_m`
* right neck radius `rnR_m`
* attachment `attach_m`
* local branch velocity `vb_m`
* local tangent `tb_m`
* local instability `inst_m`
* local bead maturity `mature_m`

## 29.8.2. Neck collapse score

A basic neck-collapse term may be built from the stronger or weaker of the neighboring neck contractions.

Example conceptual terms:

`CollapseL = 1 - rnL_m / (rb_m + eps)`

`CollapseR = 1 - rnR_m / (rb_m + eps)`

Then combine into a neck-collapse score such as:

`Collapse_m = max(CollapseL, CollapseR)`

or a weighted average if dual-neck release is desired.

## 29.8.3. Bead detachment readiness

A canonical bead-node detachment readiness can then be expressed as:

`DetachBead_m = Collapse_m^bC * inst_m^bI * (1 - attach_m)^bA * mature_m^bM * Sep_m^bS`

where `Sep_m` is a local separation-impulse or separation-tendency cue.

This is the fundamental release score for bead-driven droplet emission.

---

# 29.9. Separation Impulse Doctrine

Detachment is not only about local neck collapse. It also depends on whether the local motion supports separation.

## 29.9.1. Separation tendency

A bead or ligament region is more likely to detach when neighboring motion or local momentum is trying to pull it away from the parent chain.

## 29.9.2. Possible cues

Useful separation cues include:

* velocity difference across a neck
* outward motion along branch tangent
* local curvature-driven divergence
* branch-tip recoil
* impact-driven shock or impulse

## 29.9.3. Policy

A fully necked region with no real separation tendency may still linger as a nearly detached bead. That is often desirable.

This is why neck collapse alone should not force immediate emission unless the system intentionally chooses a harsher direct-release style.

---

# 29.10. Maturity and Temporal Persistence

The detachment system must not emit children from every one-frame thin region.

## 29.10.1. Why maturity matters

If the system reacts instantly to transient necking or instability, the breakup becomes noisy and synthetic.

## 29.10.2. Maturity doctrine

A branch region should gain maturity through:

* sustained instability
* sustained thinning
* sustained necking
* or age beyond a minimum threshold

## 29.10.3. Canonical maturity gate

A simple maturity gate may be an age-like accumulator:

`dMature/dt = kMature * max(0, RawDetachSignal - enterThreshold) - dMature * Mature`

This gives the release system memory and prevents threshold chatter.

---

# 29.11. Partial Detachment Policy

One of the most important laws of breakup realism is that not every eligible node should detach at once.

## 29.11.1. Why

Instant total emission creates:

* particle pop behavior
* loss of branch continuity
* and synthetic sprinkler aesthetics

## 29.11.2. Policy

Even if several local bead nodes exceed release threshold, the system should choose a subset according to:

* readiness rank
* spacing constraints
* local budget
* and chain continuity needs

## 29.11.3. Consequence

A bead chain may survive several frames while progressively shedding children.

This is exactly what makes the system feel fluid instead of pre-baked.

---

# 29.12. Spawn Selection Policy

If multiple candidates are ready, the system must decide which ones actually emit children.

## 29.12.1. Candidate ranking

Each candidate may receive a spawn priority such as:

`SpawnPriority = wD * DetachReady + wE * eventEnergy + wV * visibility + wT * tipBias`

where `tipBias` may favor release from more detached or distal parts of the chain.

## 29.12.2. Spacing rule

The system should usually suppress detachment of neighboring candidates that are too close along the same chain in the same frame.

This prevents local overpopulation and maintains readable residual structure.

## 29.12.3. Local cap

Each chain or source region should have a local max-children-per-frame cap.

This is as much an aesthetic law as a budget law.

---

# 29.13. Child Count Policy

Detachment does not always produce exactly one child.

## 29.13.1. Canonical bead release

The most common default is one bead node -> one detached droplet.

## 29.13.2. Direct snap release

A violent ligament snap may produce:

* one major child,
* several smaller children,
* or one droplet plus mist-adjacent fine fragments.

## 29.13.3. Recommended doctrine

For early implementation:

* bead release: one child per selected bead
* ligament snap: one or at most a few children per snap event

Avoid overcomplicating the first pass with heavy multiplet spawning. That way lies combinatorial goblinry.

---

# 29.14. Child Radius Policy

Radius assignment is one of the most important realism levers.

## 29.14.1. Bead-derived radius

For bead release, the emitted droplet radius should be derived from bead radius with controlled variation.

Conceptually:

`rd = clamp(kR * rb * jitter, rMin, rMax)`

where `jitter` is a bounded variation factor.

## 29.14.2. Snap-derived radius

For direct ligament snap, child size should depend on:

* local branch thickness
* instability
* event violence
* optional distribution policy

This often yields one medium or large child plus optional finer fragments.

## 29.14.3. Hierarchy law

The system must protect radius variation. Uniform child size destroys splash realism faster than almost any other shortcut.

---

# 29.15. Child Velocity Inheritance

A detached child must inherit motion that tells the truth about its origin.

## 29.15.1. Primary influences

A child droplet’s initial velocity should blend:

* local branch velocity
* local tangent direction
* separation impulse direction
* and optional event recoil or impact impulse

## 29.15.2. Bead-release doctrine

A bead child should usually inherit the motion of its node plus a modest release impulse away from the collapsing neck or parent chain.

## 29.15.3. Ligament-snap doctrine

A direct snap child may inherit a stronger release impulse or a wider velocity distribution, especially near violent events.

## 29.15.4. Principle

Child velocity should feel like the continuation of parent motion, not a random spray lottery unless the event is truly chaotic.

---

# 29.16. Residual Branch Update After Emission

Detachment must not only spawn children. It must also modify the surviving branch.

## 29.16.1. Required updates

After emission, the parent branch may need to:

* reduce local mass or radius
* modify neck structure
* update attachment locally
* increase local instability or reduce it depending on release mode
* update bead occupancy or bead-node state

## 29.16.2. Why this matters

If the branch does not change after emitting a child, it looks like a magical infinite dispenser.

The parent structure must visibly pay for release.

---

# 29.17. Cooldowns and Anti-Spam Policy

A source that just emitted a child should not instantly emit again without restraint.

## 29.17.1. Cooldown layers

Recommended cooldowns:

* per-bead cooldown
* per-chain local cooldown
* per-source cooldown

## 29.17.2. Why multiple layers help

They prevent:

* rapid duplicate emission from one bead
* chain-wide machine-gunning
* and runaway source spam under noisy thresholds

## 29.17.3. Principle

Cooldown is not merely a performance hack. It is a realism tool.

---

# 29.18. Global and Local Spawn Budgets

The detach system must obey bounded population policy.

## 29.18.1. Global budgets

Examples:

* max detached children per frame
* max detached droplets active
* max micro-child spawns per violent event

## 29.18.2. Local budgets

Examples:

* max emissions per chain per frame
* max emissions per source region
* max emissions per local spatial bin

## 29.18.3. Consequence

When budget is exhausted, the system should either:

* defer emission,
* suppress low-priority candidates,
* or degrade to cheaper representation such as mist hints or retained branch persistence.

This keeps the architecture graceful under pressure instead of exploding or freezing visually.

---

# 29.19. Direct-Snap vs Canonical Release

The system should explicitly distinguish two high-level detachment styles.

## 29.19.1. Canonical release

The preferred path:

* branch -> bead-chain -> partial bead emission -> detached droplets

### Benefits

* strongest visual continuity
* best realism
* clearest relation between necking and release

## 29.19.2. Direct snap

The emergency or violent path:

* ligament -> detached child or children

### Benefits

* handles fast violent events
* avoids forcing every break through a fully legible bead phase

### Cost

* weaker continuity if overused

## 29.19.3. Doctrine

Use canonical release by default. Use direct snap when event violence or short-lived instability justifies it.

---

# 29.20. Detachment State Transitions

The detachment model should be explicit about how branch states produce children.

## 29.20.1. Proto-filament

Usually no release.
Exceptional violent event path only.

## 29.20.2. Ligament

May:

* continue thinning
* become bead chain
* or direct-snap into detached children

## 29.20.3. Bead chain

May:

* persist intact
* emit one or more selected children
* partially survive after emission
* collapse into residual ligament
* or fully die if continuity is exhausted

This is the operational bridge between geometry and population spawning.

---

# 29.21. Recommended Early Implementation Path

## 29.21.1. Phase A — Thresholded Bead Release

Start with:

* bead readiness scalar
* detachment readiness threshold
* one selected bead -> one child droplet
* local cooldown
* residual branch radius reduction

This is already enough to produce far better breakup than uniform particle ejection.

## 29.21.2. Phase B — Partial Multi-Candidate Release

Add:

* ranked candidate selection
* spacing constraints
* multiple children per chain over time
* explicit chain-local budgets

This makes release look progressive instead of binary.

## 29.21.3. Phase C — Direct Snap and Violent Event Logic

Add:

* direct ligament snap path
* violent-event radius distributions
* optional micro-child emission
* stronger coupling to impact or external impulse events

This fills in the high-energy edge cases.

---

# 29.22. Diagnostics for Detachment

This section requires strong observability.

## 29.22.1. Required debug views

* detachment readiness heatmap
* neck collapse heatmap
* attachment heatmap
* maturity heatmap
* spawn priority heatmap
* cooldown visualization
* emitted child radius view
* parent-child lineage view

## 29.22.2. Required counters

* detachment attempts by source state
* successful emissions by source state
* direct-snap count
* bead-release count
* budget rejects
* cooldown rejects
* average children per chain
* residual-chain survival count

These are the metrics that separate a tuned detachment system from a superstitious one.

---

# 29.23. Failure Modes This Section Exists to Prevent

## 29.23.1. Binary Pop Breakup

The entire branch disappears into detached children in one frame.

## 29.23.2. Same-Size Child Syndrome

Every detached child has roughly the same radius.

## 29.23.3. Spray Lottery Velocity

Children inherit random motion unrelated to the parent branch.

## 29.23.4. Infinite Dispenser Branches

A branch emits children without visibly paying structural cost.

## 29.23.5. Machine-Gun Emission

One source emits too many children too quickly because thresholds are noisy and cooldown is weak.

## 29.23.6. Premature Release

Children detach before necking, instability, or attachment decay have meaningfully matured.

---

# 29.24. Closing Position of Section 29

The central claim of this section is that branch-to-droplet conversion must be treated as a staged, budgeted, readiness-driven release process.

A successful implementation should:

* compute local detachment readiness from necking, instability, thinning, attachment, separation tendency, and maturity,
* support canonical bead-driven release as the default path,
* support direct ligament snap as an exceptional or violent path,
* rank and space candidate emissions,
* assign child radius and velocity in continuity with parent branch structure,
* modify the surviving branch after emission,
* and enforce cooldown and budget policy at multiple levels.

That is how the breakup hierarchy produces detached children that feel born from fluid structure instead of toggled into existence by a particle vending machine.

---




# Section 30. Coupling Between Detached Droplets and Coherent-Surface Disturbances

## Purpose

This document defines the coupling rules between detached droplets and the coherent fluid surface.

The central question of this section is:

**When detached droplets approach, contact, skim, strike, merge into, or re-enter the coherent fluid body, how should those events feed back into the envelope layer, rolling-sheet representation, branch hierarchy, and local disturbance fields so that reunion is visible, meaningful, and dynamically coherent rather than a silent delete or a chaotic overreaction?**

This section bridges Section 26 droplet lifecycle with the coherent-surface system. It formalizes the doctrine of droplet-to-surface interaction, including contact classification, local disturbance deposition, skim behavior, dimple and ripple generation, merge-back reinforcement, violent impact response, and the control rules that prevent every contact from becoming either visually empty or absurdly explosive.

---

# 30.1. Core Thesis of Droplet-Surface Coupling

A detached droplet should not re-enter the fluid world as though it were colliding with a generic plane.

It is not an alien object. It is a temporary child of the same fluid body returning to its parent medium.

That means droplet-surface interaction must satisfy three simultaneous truths:

1. **continuity of identity** — the droplet belongs to the same larger fluid body,
2. **local consequence** — the contact must visibly affect the coherent surface,
3. **bounded realism** — not every touch deserves a full secondary splash event.

The central thesis is therefore:

**Droplet-surface contact should be modeled as a graded deposition and disturbance process whose outcome depends on class, speed, angle, local coherence, local envelope validity, and event energy.**

---

# 30.2. Why This Section Matters

Without a proper coupling doctrine, detached droplets fail in one of two opposite directions.

## 30.2.1. Empty Reunion

The droplet touches the coherent surface and simply disappears. The parent fluid shows no sign that contact occurred.

This breaks fluid identity.

## 30.2.2. Universal Fireworks

Every contact generates an overblown splash, secondary spray, or violent impulse regardless of droplet size or impact conditions.

This breaks plausibility and budget control.

## 30.2.3. The correct middle path

Most contacts should sit between those extremes:

* some should dimple and merge quietly,
* some should skim and continue,
* some should add a visible local ripple,
* and only some should trigger stronger local splash or secondary breakup.

---

# 30.3. Contact Regimes

Droplet-surface interactions should be classified into a small but expressive set of regimes.

## 30.3.1. Soft Merge Contact

### Character

* low or moderate relative speed
* compatible entry angle
* strong local coherent-fluid support
* low violence

### Outcome

* droplet enters reabsorbing state
* local dimple or thickness reinforcement
* local momentum or ripple cue
* no strong secondary emission

---

## 30.3.2. Grazing Skim Contact

### Character

* shallow angle
* glancing contact
* partial momentum exchange
* insufficient commitment to immediate merge

### Outcome

* droplet trajectory modified
* some local surface disturbance deposited
* droplet may continue in altered state
* possible later merge or secondary contact

---

## 30.3.3. Energetic Re-entry Contact

### Character

* moderate to high impact energy
* coherent surface still present
* local merge possible but not visually trivial

### Outcome

* stronger dimple or depression
* stronger ripple impulse
* local surface thickening or splash cue
* possible quick merge-back after brief reabsorbing state

---

## 30.3.4. Violent Impact Contact

### Character

* high impact energy
* steep entry or strong relative speed
* possibly low local surface coherence or high dynamic tension

### Outcome

* strong disturbance
* possible secondary micro-droplets or mist
* possible local crown or splash cue
* only selectively allowed under budget and class constraints

---

## 30.3.5. Miss / Near-Contact

### Character

* close approach without meaningful fluid interaction

### Outcome

* no merge-back
* no major disturbance
* optional aerodynamic or visual coupling only

---

# 30.4. Contact Inputs

A robust coupling decision should use more than world-space collision alone.

For a droplet `d` interacting with coherent fluid region `s`, the system should ideally know:

* droplet position and velocity
* droplet radius and class
* droplet age and merge state
* local coherent-fluid velocity
* local envelope authority
* local envelope normal
* local coherence
* local ripple / rolling regime weights
* local thickness or density support
* local breakup pressure
* local surface slope or curvature

This allows the system to classify contact by actual fluid context rather than by geometry alone.

---

# 30.5. Relative Motion Doctrine

The most important contact quantity is not absolute droplet speed. It is relative motion between droplet and local coherent surface.

## 30.5.1. Relative velocity

A droplet entering a region of fluid moving similarly to itself may merge quietly even at nontrivial absolute speed.

## 30.5.2. Relative normal speed

The component of relative motion along the local surface normal is especially important.

* low normal approach favors skim or quiet merge
* high normal approach favors dimple, strong impulse, or violent impact classification

## 30.5.3. Relative tangential speed

Tangential motion helps distinguish skim behavior from direct plunge behavior.

This is one of the key axes of contact classification.

---

# 30.6. Entry Angle Doctrine

A droplet does not interact the same way when descending almost straight down as when it glances across the surface.

## 30.6.1. Normal-dominant entry

More likely to create:

* dimple,
* plunge-style merge,
* stronger local disturbance,
* or violent impact if energy is high.

## 30.6.2. Tangential-dominant entry

More likely to create:

* skim,
* streaked local ripple,
* delayed merge,
* or small velocity redirection.

## 30.6.3. Practical role

Entry angle should directly affect:

* merge probability,
* disturbance footprint shape,
* and secondary emission eligibility.

---

# 30.7. Local Surface Authority as a Coupling Modifier

Detached droplets should interact differently depending on the state of the local coherent surface.

## 30.7.1. High envelope authority region

A calm or rolling coherent sheet can absorb droplet contact in a relatively unified way.

Likely outcomes:

* smooth dimple
* coherent ripple
* clean merge-back

## 30.7.2. Low envelope authority but coherent non-envelope region

A more dynamic or ambiguous coherent surface may still absorb the droplet, but the disturbance may be rougher or more anisotropic.

## 30.7.3. Breakup-adjacent region

If the local surface is already near fragmentation, droplet impact may more easily contribute to secondary disturbance or trigger localized branch behavior.

This is where coupling becomes most interesting and most dangerous.

---

# 30.8. Disturbance Taxonomy

A droplet should deposit one or more classes of surface disturbance.

## 30.8.1. Height / envelope disturbance

A local upward or downward perturbation of the coherent surface representation.

Typical examples:

* dimple on entry
* rebound-like uplift after impact
* ripple seed in calm water

## 30.8.2. Thickness disturbance

A temporary local reinforcement or redistribution of support thickness.

This is especially useful during merge-back to make the reunion feel materially real.

## 30.8.3. Momentum disturbance

A local impulse to the coherent surface velocity or branch-coupled motion field.

This helps contact matter dynamically, not just visually.

## 30.8.4. Ripple disturbance

A structured wavelet or radial / directional disturbance seeded into the coherent surface.

## 30.8.5. Breakup disturbance

A contact may locally raise breakup pressure or surface instability if the event is strong and the region is already vulnerable.

This should be used sparingly and only where justified.

---

# 30.9. Deposition Packet Doctrine

The coupling layer should create a canonical deposition packet rather than letting every contact directly mutate arbitrary state.

## 30.9.1. Recommended deposition packet

```text
SurfaceDepositionEvent
- position
- radius
- normalImpulse
- tangentialImpulse
- heightDelta
- thicknessDelta
- rippleStrength
- rippleDirection
- breakupDelta
- mergeWeight
- eventTypeFlags
- sourceDropletId
- sourceClassFlags
```

This packet can then be consumed by:

* envelope disturbance pass
* ripple generation pass
* local momentum or surface-response pass
* breakup-coupling pass
* diagnostics

This is much cleaner than letting every droplet directly scribble on half the pipeline.

---

# 30.10. Soft Merge Doctrine

Soft merge is the most common reunion case for moderate droplets returning to calm or rolling coherent water.

## 30.10.1. Desired behavior

* droplet enters reabsorbing state
* local dimple or compression cue appears
* local ripple or subtle wavelet may be seeded
* detached identity fades over merge age
* no violent secondary spray

## 30.10.2. Why it matters

This is the most important antidote to pop-delete merge logic.

The droplet should visibly become surface again.

---

# 30.11. Skim Doctrine

Some droplets should not commit immediately to merge. They should skim.

## 30.11.1. Character

* shallow approach angle
* high tangential component
* insufficient normal commitment for instant merge

## 30.11.2. Desired effects

* small surface streak or elongated ripple cue
* momentum loss or redirection
* optional repeated contact attempts
* later merge or re-flight

## 30.11.3. Thesis role

Skimming adds nuance and prevents the system from forcing all contact into binary merge-or-miss behavior.

---

# 30.12. Dimple and Ripple Generation

A returning droplet should often disturb the coherent surface even when merge is soft.

## 30.12.1. Dimple

A local depression-like cue at the impact point.

Best for:

* moderate normal entry
* visible but not violent contact
* coherent calm or rolling surface

## 30.12.2. Ripple seed

A local wave impulse that propagates or informs the surface-response layer.

Best for:

* calm coherent water
* lower-energy impacts
* visible reunion without splash chaos

## 30.12.3. Directional ripple

For skimming or directional contact, the ripple should not be purely radial. It should carry directional bias aligned with tangential momentum.

---

# 30.13. Energetic Contact Doctrine

Not all merge-like events are quiet.

## 30.13.1. When contact is energetic but not catastrophic

The system should produce:

* stronger dimple or displacement
* stronger momentum deposition
* stronger ripple response
* fast but visible merge-back

## 30.13.2. Why this matters

This prevents the contact taxonomy from having only two moods:

* silent merge
* full fireworks

There is a rich middle regime, and it matters a lot.

---

# 30.14. Violent Contact Doctrine

Violent contact is the high-energy edge case.

## 30.14.1. Eligible outcomes

* secondary micro-droplets
* mist generation
* strong local breakup disturbance
* visible crown or upward response cue

## 30.14.2. Restrictions

Violent outcomes should require:

* sufficient impact energy
* sufficient local vulnerability
* available event budget
* and class-appropriate source conditions

## 30.14.3. Anti-chaos rule

Do not allow every large droplet to create a miniature apocalypse. Violent contact should remain exceptional and earned.

---

# 30.15. Merge-Back Reinforcement of the Coherent Surface

When a droplet merges back, the coherent fluid should be locally reinforced.

## 30.15.1. Reinforcement forms

Merge-back may reinforce:

* envelope confidence locally
* local surface thickness
* local support continuity
* local wetness or specular continuity

## 30.15.2. Why reinforcement matters

If reunion only removes the droplet without restoring anything to the coherent surface, the overall fluid loses perceptual continuity.

The parent should become more itself again.

---

# 30.16. Coupling to Breakup Pressure

Droplet contact may also affect local breakup readiness.

## 30.16.1. Quiet contact

Should usually not increase breakup pressure significantly.

## 30.16.2. Energetic or violent contact

May locally increase:

* instability
* crest tension
* branch spawning readiness
* or secondary disturbance fields

## 30.16.3. Doctrine

This coupling should be asymmetric and cautious. Otherwise droplets become generic chaos multipliers.

The correct effect is local encouragement where vulnerability already exists, not spontaneous nonsense everywhere.

---

# 30.17. Merge-Weight and Disturbance-Weight

The system should distinguish between:

* how much the droplet is being absorbed,
* and how much disturbance it injects into the coherent surface.

These are related, but not identical.

## 30.17.1. Merge weight

High when:

* coherent support strong
* relative motion compatible
* droplet class suitable for merge

## 30.17.2. Disturbance weight

High when:

* impact energy high
* radius significant
* normal approach significant
* local surface authority strong enough to visibly carry the response

## 30.17.3. Consequence

A droplet may merge strongly but disturb only modestly, or disturb strongly before completing merge.

This distinction gives the system nuance.

---

# 30.18. Contact Event Classification Pipeline

A practical coupling system should classify each meaningful contact through a stable sequence.

## 30.18.1. Stage A — Contact candidate detection

Determine whether the droplet is near enough to coherent fluid for meaningful interaction.

## 30.18.2. Stage B — Local context sampling

Sample:

* local envelope authority
* local normal
* local coherent velocity
* local thickness/support
* local breakup vulnerability

## 30.18.3. Stage C — Relative-motion analysis

Compute:

* relative speed
* relative normal speed
* tangential speed
* entry angle

## 30.18.4. Stage D — Event classification

Classify as:

* soft merge
* skim
* energetic re-entry
* violent impact
* or no meaningful event

## 30.18.5. Stage E — Deposition generation

Emit a deposition packet with appropriate weights.

## 30.18.6. Stage F — Droplet state update

Update droplet into:

* reabsorbing
* continued flight
* shatter/mist conversion
* or dead

This pipeline keeps contact handling orderly instead of turning it into scattered conditionals across the engine.

---

# 30.19. Locality and Footprint Doctrine

Not every contact should disturb the surface with the same spatial footprint.

## 30.19.1. Small soft merge footprint

Use for:

* micro-droplets
* quiet contacts
* calm water

## 30.19.2. Wider ripple footprint

Use for:

* calm but visible impacts
* larger droplets
* soft radial or directional propagation

## 30.19.3. Sharp local footprint

Use for:

* energetic impacts
* localized surface displacement
* branch-adjacent violent events

The footprint should scale with droplet radius, event type, and local regime.

---

# 30.20. Recommended Early Implementation Path

## 30.20.1. Phase A — Merge and Dimple Deposition

Start with:

* soft merge classification
* explicit reabsorbing state
* local dimple or height disturbance
* local thickness and momentum deposition

This alone makes merge-back visibly meaningful.

## 30.20.2. Phase B — Skim and Ripple Disturbance

Add:

* skim classification
* directional ripple seeds
* tangential momentum deposition
* continued flight after shallow contact

This adds a huge amount of nuance.

## 30.20.3. Phase C — Energetic and Violent Contact

Add:

* energetic re-entry class
* violent impact class
* micro-child or mist emission gates
* local breakup-coupled disturbance

This fills in the high-energy edge cases.

---

# 30.21. Diagnostics for Droplet-Surface Coupling

This section requires unusually strong observability.

## 30.21.1. Required debug views

* contact class coloring
* merge-weight heatmap
* disturbance-weight heatmap
* dimple / ripple deposition view
* local breakup-coupled disturbance heatmap
* skim trajectory debug view
* source-droplet lineage overlay

## 30.21.2. Required counters

* soft merges
* skim contacts
* energetic re-entries
* violent impacts
* merge completions
* deposition events by type
* secondary emissions from impact
* no-op contact rejections

These are the counters that tell you whether reunion logic is elegant or insane.

---

# 30.22. Failure Modes This Section Exists to Prevent

## 30.22.1. Silent Merge Syndrome

Droplets disappear into the coherent body without leaving any visible or dynamic trace.

## 30.22.2. Universal Splash Syndrome

Every contact generates exaggerated disturbance or secondary spray.

## 30.22.3. Plane-Collision Syndrome

Droplets interact as though they struck a rigid plane rather than a living coherent fluid surface.

## 30.22.4. No Skim Nuance

All shallow contacts are forced into either merge or miss.

## 30.22.5. Empty Reintegration

The droplet merges but the coherent surface is not perceptually reinforced.

---

# 30.23. Closing Position of Section 30

The central claim of this section is that detached droplets must couple back into the coherent surface through a graded contact-and-deposition doctrine.

A successful implementation should:

* classify contacts by relative speed, entry angle, class, and local coherent-surface context,
* distinguish merge weight from disturbance weight,
* generate deposition packets rather than ad hoc side effects,
* support soft merge, skim, energetic re-entry, and violent impact as distinct outcomes,
* reinforce the coherent surface when reunion occurs,
* and only selectively raise breakup authority when the local event truly justifies it.

That is how reunion becomes visible, meaningful, and fluid-like rather than a silent deletion or a chaos grenade.

---






# Section 31. Debug Visualization and Tuning Methodology for Breakup Populations

## Purpose

This document defines the observability, debugging, and tuning methodology required to make the hybrid MLS-MPM fluid surface and breakup architecture buildable in practice.

The central question of this section is:

**Given a fluid system composed of coherent-surface regimes, envelope arbitration, overhang diagnostics, branch geometry, droplet lifecycles, merge-back deposition, and multiple bounded secondary populations, how should the engine expose its internal state so that failures can be diagnosed systematically and tuning can be performed scientifically rather than aesthetically guessing at moving water?**

This section formalizes the debugging doctrine for the project. It defines the required visualization layers, counters, lineage tools, parameter workflows, scene-isolation strategy, snapshot strategy, tuning loops, failure triage methodology, and test harness philosophy necessary to prevent the system from degenerating into expensive fluid mysticism.

---

# 31.1. Core Thesis of Debuggability

A system this rich cannot be tuned by beauty alone.

A human may look at a frame and say:

* “the crest looks welded,”
* “the bead chain popped too early,”
* “the merge-back feels empty,”
* or “the calm water still looks marbly,”

but those judgments are not enough to fix the underlying problem.

The engine must be able to answer:

* which regime was active,
* which weights dominated,
* which candidates were suppressed,
* which thresholds were crossed,
* which budgets rejected events,
* and which quantities were responsible for the visible failure.

The core thesis of this section is therefore:

**Every visually important regime transition in the fluid architecture must have a corresponding debug representation, counter trail, and tuning pathway.**

Without that, the project becomes an argument with water instead of an engineering system.

---

# 31.2. Why the Hybrid Architecture Demands Strong Observability

This architecture contains multiple layers that can each fail differently:

* primary solver motion,
* surface-state classification,
* envelope extraction,
* envelope filtering,
* overhang suppression,
* branch synthesis,
* bead readiness,
* droplet detachment,
* droplet lifecycle,
* reabsorbing state,
* merge-back deposition,
* and final visual arbitration.

A visible artifact may originate from any one of them or from the interaction between several.

For example:

* a fake welded crest may be caused by envelope confidence being too high,
* or by overhang penalty being too weak,
* or by smoothing authority ignoring breakup pressure,
* or by branch authority arriving too late,
* or by a direction field causing the filter to iron across a curl.

This means the system requires **layer-separated visibility**.

---

# 31.3. Debugging Philosophy

The project should adopt the following debugging philosophy.

## 31.3.1. Show internal truth, not just final beauty

A beautiful final render can hide deep structural wrongness. Debug tools must expose the internal state directly.

## 31.3.2. Make transitions inspectable

The most important moments are transitions:

* calm to rolling,
* rolling to breakup source,
* ligament to bead chain,
* bead to droplet,
* droplet to reabsorbing,
* envelope-dominant to breakup-dominant.

Each of these should be explicitly inspectable.

## 31.3.3. Separate diagnosis from taste

Not every ugly frame is caused by the same kind of wrongness. The system should help the user distinguish:

* parameter mis-tuning,
* algorithmic weakness,
* state misclassification,
* bad extraction confidence,
* or budget starvation.

## 31.3.4. Prefer concrete signals over narrative excuses

If the engine cannot show *why* a branch detached, it is not ready to be trusted.

---

# 31.4. Debug Domain Decomposition

The debugging system should be organized into domains matching the architecture.

## 31.4.1. Primary State Domain

Covers:

* bulk
* calm sheet
* rolling sheet
* breakup source

## 31.4.2. Envelope Domain

Covers:

* envelope validity
* confidence
* smoothing authority
* ripple preservation
* relief preservation
* arbitration weights

## 31.4.3. Invalidity Domain

Covers:

* ambiguity
* multi-layer support
* normal conflict
* underside dominance
* curl or inversion
* final overhang penalty

## 31.4.4. Branch Domain

Covers:

* proto-filaments
* ligaments
* bead chains
* taper
* necking
* attachment
* detachment readiness

## 31.4.5. Detached Population Domain

Covers:

* droplet classes
* drag
* impact energy
* merge potential
* merge age
* skim state
* shatter eligibility

## 31.4.6. Coupling Domain

Covers:

* deposition packets
* disturbance strength
* merge-back reinforcement
* local breakup-coupled disturbances

This decomposition prevents the debug system from becoming one giant color vomit pass with no semantics.

---

# 31.5. Primary Visualization Modes

The engine should provide direct visual modes for the primary coherent-fluid classification.

## 31.5.1. State coloring

Each primary particle or surface sample should be colorized by:

* bulk
* calm sheet
* rolling sheet
* breakup source

This gives immediate visibility into whether the architecture is classifying coherent water correctly.

## 31.5.2. Exposure heatmap

A heatmap for exposure reveals whether buried fluid is being wrongly considered surface or vice versa.

## 31.5.3. Coherence heatmap

A coherence view reveals whether the system understands continuous surface regions correctly.

## 31.5.4. Breakup instability heatmap

This shows where the engine believes fragmentation wants to occur.

Without this view, branch spawning bugs become folklore.

---

# 31.6. Envelope Visualization Modes

The envelope layer needs unusually rich diagnostics.

## 31.6.1. Raw candidate view

Show the extracted envelope candidate before filtering.

## 31.6.2. Filtered envelope view

Show the envelope after filtering.

## 31.6.3. Raw-vs-filtered comparison mode

A direct before/after mode is essential for seeing whether the filter is killing lobes or killing life.

## 31.6.4. Envelope confidence heatmap

Shows how strongly the system trusts the envelope locally.

## 31.6.5. Smoothing authority heatmap

Shows where the envelope is allowed to actively suppress support structure.

## 31.6.6. Ripple-preservation heatmap

Shows where coherent high-frequency detail is protected.

## 31.6.7. Relief-preservation heatmap

Shows where rolling-wave relief is being protected from flattening.

## 31.6.8. Arbitration visualization

A view that encodes envelope, coherent non-envelope, and breakup authority in distinct channels.

This is one of the most important views in the entire system.

---

# 31.7. Invalidity and Honesty Visualization Modes

The envelope must show when it is losing honesty.

## 31.7.1. Ambiguity heatmap

Shows where candidate competition is strong.

## 31.7.2. Candidate count visualization

Shows how many meaningful candidates survive in each local region.

## 31.7.3. Best-vs-second score gap

Shows where the extractor is only weakly certain.

## 31.7.4. Multi-layer support heatmap

Shows regions with stacked meaningful support.

## 31.7.5. Normal conflict heatmap

Shows where the local geometry is fighting top-envelope assumptions.

## 31.7.6. Underside dominance heatmap

Shows where underside-facing structure is becoming important.

## 31.7.7. Curl or inversion heatmap

Shows likely crest turnover or local topological invalidity.

## 31.7.8. Final overhang penalty view

Shows the scalar that actually suppresses envelope authority.

This is the “stop lying” view.

---

# 31.8. Branch Geometry Visualization Modes

Branches need their own explicit observability.

## 31.8.1. Branch state coloring

Color proto-filament, ligament, and bead-chain states distinctly.

## 31.8.2. Radius profile view

Visualize local radius along branch arclength.

## 31.8.3. Taper view

Visualize taper strength or taper bias.

## 31.8.4. Necking heatmap

Show where the branch is constricting.

## 31.8.5. Attachment heatmap

Show how strongly each part of the branch remains connected to the parent body.

## 31.8.6. Detachment readiness heatmap

Show where the system believes release is becoming justified.

## 31.8.7. Root-blend view

Show the strength of parent-body attachment and root visual blending.

These modes let the user see whether the branch hierarchy is evolving fluidly or behaving like a decorative necklace generator.

---

# 31.9. Detached Population Visualization Modes

Detached populations need lifecycle visibility.

## 31.9.1. Droplet class coloring

Distinct coloring for:

* macro-droplet
* standard droplet
* micro-droplet
* mist-adjacent fragment
* reabsorbing fragment

## 31.9.2. Drag heatmap

Shows drag influence per droplet.

## 31.9.3. Visual stretch heatmap

Shows shape-memory or velocity-stretch state.

## 31.9.4. Impact energy heatmap

Shows which droplets are candidates for stronger contact response.

## 31.9.5. Merge potential heatmap

Shows readiness for reabsorption.

## 31.9.6. Merge age heatmap

Shows how far along reabsorbing droplets are.

## 31.9.7. Skim / merge / violent-contact class view

Shows how the contact classifier is interpreting droplet-surface events.

---

# 31.10. Coupling and Deposition Visualization Modes

Reunion events should be directly inspectable.

## 31.10.1. Deposition event markers

Display where droplets create deposition packets.

## 31.10.2. Disturbance type coloring

Color-code:

* dimple deposition
* ripple deposition
* momentum deposition
* thickness reinforcement
* breakup-coupled disturbance

## 31.10.3. Merge-back reinforcement view

Show where the coherent surface is being reinforced by returning droplets.

## 31.10.4. Disturbance footprint view

Show the actual local footprint of impact or merge-back influence.

Without this, contact feedback becomes invisible magic.

---

# 31.11. Counter and Statistics Doctrine

A mature system must expose counters, not just pretty overlays.

## 31.11.1. Primary counters

Track:

* count in bulk
* count in calm sheet
* count in rolling sheet
* count in breakup source

## 31.11.2. Envelope counters

Track:

* average envelope confidence
* average smoothing authority
* average ambiguity
* average overhang penalty
* fraction of surface that is envelope-dominant

## 31.11.3. Branch counters

n
Track:

* active proto-filaments
* active ligaments
* active bead chains
* average attachment
* average necking
* average detachment readiness
* branch deaths by reason

## 31.11.4. Detached counters

Track:

* alive droplets by class
* births by source type
* merges completed
* skim events
* violent impacts
* mist conversions
* lifetime deaths

## 31.11.5. Budget counters

Track:

* budget hits per frame
* rejected spawns by reason
* cooldown rejections
* local-cap rejections
* deferred emissions

These counters convert the engine from a visual toy into an instrumented system.

---

# 31.12. Event-Lineage Doctrine

This architecture benefits enormously from lineage visibility.

## 31.12.1. Why lineage matters

If a droplet looks wrong, the user should be able to ask:

* which branch emitted it?
* which source region emitted that branch?
* which state transitions preceded the emission?
* which merge-back event consumed it?

## 31.12.2. Required lineage identifiers

At minimum, the system should expose:

* source region id
* chain id
* branch id
* droplet parent id
* merge-back event id

## 31.12.3. Debug use

Lineage overlays allow a specific ugly event to be traced backward through the hierarchy.

This is one of the most powerful debugging tools in the whole system.

---

# 31.13. Snapshot Doctrine

Complex fluid debugging needs frozen inspectable states.

## 31.13.1. Snapshot content

A useful snapshot should capture:

* frame index or sim time
* camera pose
* main view render
* active debug mode render
* key counters
* key thresholds and parameter settings
* selection context if an entity or region is highlighted

## 31.13.2. Why snapshots matter

If the user can freeze a specific bad crest, bad merge-back, or ugly branch breakup and examine the exact state packet, tuning becomes dramatically easier.

## 31.13.3. Comparative snapshots

The system should support before/after comparisons under parameter changes or algorithm changes.

This is critical for disciplined iteration.

---

# 31.14. Scenario-Based Tuning Doctrine

The system should not be tuned only in one giant chaotic scene.

Instead, tuning should be organized by scenario families.

## 31.14.1. Calm sheet scenario

Focus:

* anti-lump smoothing
* ripple preservation
* temporal stability

## 31.14.2. Rolling-wave scenario

Focus:

* relief preservation
* crest honesty
* envelope authority
* overhang suppression timing

## 31.14.3. Branch emission scenario

Focus:

* branch birth
* taper
* necking
* bead-chain progression
* detachment pacing

## 31.14.4. Droplet lifecycle scenario

Focus:

* class hierarchy
* drag
* visual stretch
* impact classification
* merge-back timing

## 31.14.5. Stress scenario

Focus:

* budget pressure
* rejection policies
* degradation grace
* pathological event storms

This scenario-based doctrine prevents cross-contamination of tuning goals.

---

# 31.15. Tuning Workflow

A disciplined tuning workflow should proceed in a fixed order.

## 31.15.1. Stage 1 — Confirm classification truth

Before tuning looks, verify that the system is classifying states correctly.

## 31.15.2. Stage 2 — Confirm authority truth

Verify that envelope, non-envelope, and breakup authority weights behave correctly.

## 31.15.3. Stage 3 — Confirm geometry truth

Verify branch taper, necking, bead readiness, and detachment readiness.

## 31.15.4. Stage 4 — Confirm lifecycle truth

Verify droplet birth, drag, skim, merge, and death behavior.

## 31.15.5. Stage 5 — Only then tune beauty

Only after the logic is right should the final look be tuned aggressively.

This is how you avoid polishing the wrong lie.

---

# 31.16. Parameter Sweep Doctrine

Some parameters should be tuned by controlled sweep rather than intuition.

## 31.16.1. Good sweep candidates

* smoothing authority gain
* ripple preservation bias
* overhang suppression weights
* bead detachment threshold
* droplet drag scaling
* merge-back entry threshold
* disturbance footprint size

## 31.16.2. Sweep policy

Use a controlled benchmark scene, vary one or two parameters at a time, and compare:

* debug views
* counters
* snapshots
* and final beauty

## 31.16.3. Why this matters

Water is extremely good at making nonsense look plausible for a moment. Sweeps prevent being seduced by lucky artifacts.

---

# 31.17. Failure Triage Methodology

When a visible failure appears, the system should help determine which layer is responsible.

## 31.17.1. Example: welded crest

Check in order:

1. overhang penalty
2. ambiguity
3. envelope confidence
4. smoothing authority
5. breakup authority
6. branch birth timing

## 31.17.2. Example: ugly bead pop

Check in order:

1. necking score
2. detachment readiness
3. maturity gate
4. cooldown
5. child radius distribution
6. residual branch update

## 31.17.3. Example: empty merge-back

Check in order:

1. merge potential
2. merge age
3. deposition packet emission
4. disturbance footprint
5. coherent-surface reinforcement

This triage doctrine is how the engine becomes explainable.

---

# 31.18. Recommended Debug UI Structure

The debug UI should mirror the architecture.

## 31.18.1. Core panels

* Primary States
* Envelope and Filtering
* Invalidity and Overhang
* Branch Geometry
* Detached Populations
* Coupling and Merge-Back
* Budgets and Performance
* Snapshots and Comparison

## 31.18.2. Selection panel

A selected entity or region should reveal:

* current state
* recent transition history
* parent and child lineage
* relevant scalar values
* active cooldowns or latches

## 31.18.3. Time controls

The user should be able to:

* pause
* step frame-by-frame
* slow motion
* scrub recent captured history if available

Without time control, many breakup events are too brief to inspect properly.

---

# 31.19. Performance-Aware Debugging

Debug views must not destroy the system so badly that they become misleading.

## 31.19.1. Lightweight always-on signals

Examples:

* counters
* selected-entity overlays
* simplified heatmaps

## 31.19.2. Heavy inspection modes

Examples:

* lineage overlays on many entities
* raw candidate visualization
* multi-layer support diagnostics
* rich deposition packet rendering

These may need to be opt-in or throttled.

## 31.19.3. Principle

A debug system that changes the simulation too much is lying in a new way.

---

# 31.20. Canonical Debug Packet Philosophy

The system should aim to expose canonical packets rather than forcing every shader or pass to invent its own diagnostics.

Examples:

* `PrimaryStateDebugPacket`
* `EnvelopeDebugPacket`
* `InvalidityDebugPacket`
* `BranchDebugPacket`
* `DropletLifecycleDebugPacket`
* `SurfaceDepositionDebugPacket`

This makes both UI integration and tooling much cleaner.

---

# 31.21. Failure Modes This Section Exists to Prevent

## 31.21.1. Water Mysticism

The user knows the water looks wrong but cannot tell which subsystem is lying.

## 31.21.2. Beauty-First Misdiagnosis

The user tweaks aesthetic parameters to hide a classification or authority bug.

## 31.21.3. Invisible Budget Starvation

The breakup system looks weak because budgets or cooldowns are silently suppressing events.

## 31.21.4. Lineage Blindness

A bad droplet or branch cannot be traced back to its parent decision.

## 31.21.5. Unreproducible Tuning

The user cannot compare states rigorously because the engine lacks snapshots and structured comparison.

---

# 31.22. Recommended Implementation Path

## 31.22.1. Phase A — Essential Heatmaps and Counters

Start with:

* primary state coloring
* envelope confidence
* smoothing authority
* breakup instability
* branch state coloring
* droplet class coloring
* key counters

This already creates basic visibility.

## 31.22.2. Phase B — Invalidity and Branch Lifecycle Diagnostics

Add:

* ambiguity and overhang views
* necking and detachment readiness
* merge potential and merge age
* deposition event markers

This makes the architecture explainable.

## 31.22.3. Phase C — Lineage, Snapshots, and Comparative Tuning

Add:

* parent-child lineage views
* frozen snapshots
* side-by-side before/after comparison
* parameter sweep workflows

This is where the engine becomes a true research instrument.

---

# 31.23. Closing Position of Section 31

The central claim of this section is that a hybrid fluid architecture of this complexity requires a first-class observability doctrine.

A successful implementation should:

* expose every major regime as a debug view,
* expose counters and rejection reasons,
* preserve lineage across breakup and merge-back,
* support snapshots and controlled comparisons,
* organize tuning by scenario rather than by chaos,
* and give the user a method for triaging visible failures back to the subsystem that caused them.

That is how the project stops being a beautiful mystery and becomes an actual instrument for designing fluid behavior.

---










# Section 32. Validation Methodology for Calm-Sheet Realism, Rolling-Wave Preservation, and Breakup Quality

## Purpose

This document defines the validation doctrine for the hybrid MLS-MPM fluid surface and breakup architecture.

The central question of this section is:

**How should the system be tested, measured, compared, and judged so that improvements in calm-sheet smoothness, rolling-wave fidelity, breakup hierarchy, droplet lifecycle, and merge-back behavior are demonstrated systematically rather than inferred from isolated pretty frames?**

This section turns the project into a research instrument. It defines validation goals, test categories, scenario families, quantitative and qualitative metrics, failure signatures, benchmarking methodology, comparison protocol, and the relationship between debug data and final visual judgment.

The aim is not fake objectivity theater. The aim is disciplined progress.

---

# 32.1. Core Thesis of Validation

A fluid system this rich must be validated on multiple axes at once.

A change can improve one regime while quietly harming another.

For example:

* stronger calm-sheet smoothing may reduce lumpy rest states while destroying ripple fidelity,
* stronger overhang suppression may protect crest honesty while suppressing valid rolling-sheet regions too early,
* richer bead-chain logic may improve breakup beauty while exhausting budgets and starving downstream droplets,
* faster merge-back may reduce confetti while making reunion visually empty.

The core thesis of this section is therefore:

**Validation must be multi-regime, multi-metric, scenario-based, and comparison-driven.**

A single “looks better” judgment is never enough.

---

# 32.2. Why Validation Must Be Regime-Specific

The architecture is built around multiple representational regimes. That means validation must also be regime-specific.

The same test cannot adequately judge:

* calm-sheet anti-lump performance,
* rolling-wave relief preservation,
* crest honesty under overhang pressure,
* branch progression into bead chains,
* droplet lifecycle quality,
* and merge-back plausibility.

Each of these demands different evidence.

This is why the validation doctrine is organized around families of scenes and metrics rather than one universal score.

---

# 32.3. Validation Categories

The full validation framework should be divided into at least six categories.

## 32.3.1. Calm-Sheet Realism

Focus:

* lobe suppression
* smooth coherent surface quality
* ripple preservation
* temporal stability at or near rest

## 32.3.2. Rolling-Wave Preservation

Focus:

* relief preservation
* directional coherence
* crest integrity before breakup
* avoidance of plastic flattening

## 32.3.3. Envelope Honesty and Invalidity Handling

Focus:

* ambiguity handling
* overhang suppression timing
* graceful hand-off to non-envelope or breakup representation
* absence of crest welding

## 32.3.4. Breakup Hierarchy Quality

Focus:

* proto-filament birth
* ligament taper and thinning
* bead-chain progression
* progressive rather than binary detachment

## 32.3.5. Detached Lifecycle Quality

Focus:

* droplet size hierarchy
* motion hierarchy
* drag behavior
* skim, impact, and merge-back behavior
* avoidance of immortal confetti

## 32.3.6. System-Level Stability and Boundedness

Focus:

* budget stability
* cooldown sanity
* absence of runaway secondary populations
* graceful degradation under stress

---

# 32.4. Validation Principles

The system should obey the following principles during evaluation.

## 32.4.1. Validate mechanisms, not just images

A frame can look acceptable for the wrong reasons.

Validation must inspect both:

* the visible result,
* and the internal regime / authority / lifecycle signals that produced it.

## 32.4.2. Separate local success from global success

A crest may look beautiful while the surrounding sheet is misclassified, or a calm pool may look excellent while breakup timing is broken.

## 32.4.3. Prefer repeated scenario evidence over one lucky shot

Any fluid system can occasionally produce a gorgeous accident. Validation should prefer repeatability across controlled scenarios.

## 32.4.4. Compare against prior states

Validation is most powerful when it compares:

* before vs after parameter changes,
* before vs after algorithmic changes,
* low-tier vs high-tier modes,
* and scenario-specific baselines.

---

# 32.5. Benchmark Scene Families

Validation should use a stable family of benchmark scenes rather than ad hoc chaos.

## 32.5.1. Calm Basin Scene

A mostly still or slowly settling body of water.

### Validates

* anti-lump behavior
* ripple preservation
* temporal stability
* absence of support marbling

### Failure signatures

* visible grape-lobe texture
* over-flattened plastic surface
* shimmer or crawl under stillness

---

## 32.5.2. Gentle Ripple Scene

A controlled small-amplitude ripple field over coherent water.

### Validates

* distinction between ripple and lobe noise
* coherent high-frequency preservation
* envelope smoothing authority balance

### Failure signatures

* ripple death
* false lobe survival
* temporal aliasing in wavelets

---

## 32.5.3. Rolling Wave Scene

A wave-dominant but non-breaking coherent surface.

### Validates

* relief preservation
* directional filtering quality
* rolling-sheet authority
* avoidance of envelope overreach

### Failure signatures

* sleepy plastic waves
* crest dulling
* directional chaos

---

## 32.5.4. Crest Transition Scene

A wave approaching overturn or breakup.

### Validates

* overhang diagnostics
* ambiguity growth
* graceful hand-off from envelope to breakup
* crest honesty

### Failure signatures

* crest welding
* abrupt authority pop
* breakup delayed too long

---

## 32.5.5. Branch Birth Scene

A controlled ejection or crest region that should produce proto-filaments.

### Validates

* branch initiation timing
* attachment quality
* taper onset
* state transitions from coherent source to branch

### Failure signatures

* no branch despite strong breakup pressure
* instant particle spray instead of branch birth
* branches appearing detached too early

---

## 32.5.6. Ligament and Bead-Chain Scene

A setup that encourages clear branch thinning and necking.

### Validates

* ligament taper
* necking development
* bead irregularity
* persistence before detachment

### Failure signatures

* constant-radius threads
* instant droplet pop without bead stage
* mechanical necklace periodicity

---

## 32.5.7. Droplet Flight Scene

Detached droplets traveling through space with no immediate recontact.

### Validates

* class-dependent drag
* class-dependent visual stretch
* radius hierarchy
* lifetime discipline

### Failure signatures

* all droplets moving like identical marbles
* no size hierarchy
* visual stretch collapsing instantly

---

## 32.5.8. Re-entry and Merge Scene

Droplets falling back into calm and rolling coherent water.

### Validates

* contact classification
* merge-back timing
* dimple and ripple deposition
* quiet reunion plausibility

### Failure signatures

* pop-delete merge
* silent merge with no consequence
* universal violent reaction

---

## 32.5.9. Violent Impact Scene

A higher-energy droplet or fragment re-entry case.

### Validates

* energetic re-entry logic
* selective violent response
* controlled micro-emission or mist conversion
* boundedness under intense events

### Failure signatures

* no visible escalation when justified
* or universal fireworks when not justified

---

## 32.5.10. Stress and Saturation Scene

A deliberately difficult scene with many branches, droplets, and contacts.

### Validates

* budgets
* cooldowns
* culling policy
* graceful degradation
* stability under population pressure

### Failure signatures

* runaway populations
* starvation of important events
* hard collapse of visual quality

---

# 32.6. Metric Types

The validation framework should combine quantitative and qualitative metrics.

## 32.6.1. Quantitative metrics

These are directly measured from the simulation and debug fields.

## 32.6.2. Qualitative metrics

These are human-judged visual metrics that remain necessary because fluid beauty is not reducible to one scalar.

## 32.6.3. Comparative metrics

These compare one version or parameter set against another.

The project needs all three. Pure quantification is too blind. Pure taste is too sloppy.

---

# 32.7. Calm-Sheet Metrics

The calm regime needs dedicated anti-lump metrics.

## 32.7.1. Lobe Residual Metric

Measure how much fine-scale lobe-like variation remains relative to the filtered or expected calm envelope.

A practical version may estimate local height variance after removing broad curvature.

### Desired trend

Lower than sphere-led baseline, but not driven to zero if real ripples exist.

## 32.7.2. Ripple Preservation Metric

Measure how much coherent ripple structure survives when ripple input exists.

This should not simply count high-frequency variation. It should emphasize variation that is temporally stable and wave-valid.

## 32.7.3. Temporal Quietness Metric

Measure frame-to-frame jitter of calm surface height, normal, or specular motion in low-motion conditions.

### Desired trend

Low shimmer without syrupy lag.

## 32.7.4. Plasticity Penalty

A qualitative or semi-quantitative metric indicating when smoothing has gone too far and killed the living texture of water.

---

# 32.8. Rolling-Wave Metrics

Rolling water needs different success criteria.

## 32.8.1. Relief Preservation Metric

Measure whether crest-trough amplitude and meaningful curvature survive filtering.

## 32.8.2. Directional Coherence Metric

Measure consistency of wave direction and support of directional smoothing.

## 32.8.3. Crest Sharpness Preservation Metric

Measure whether crest regions remain visibly energetic without being artificially sharpened or dulled.

## 32.8.4. Rolling Plasticity Penalty

A qualitative or semi-quantitative indicator for overly softened rolling waves.

This penalty should be high when the water looks like inflated plastic instead of moving liquid.

---

# 32.9. Envelope Honesty Metrics

These metrics determine whether the envelope is knowing when to back off.

## 32.9.1. Ambiguity Exposure Metric

Measure how often ambiguity is present in difficult scenes and whether the system actually reflects it in confidence suppression.

## 32.9.2. Overhang Suppression Timing Metric

Measure when envelope authority begins to fall relative to the onset of curl or multi-valued geometry.

### Desired behavior

Suppression should begin early enough to avoid welding, but not so early that valid rolling surfaces lose authority prematurely.

## 32.9.3. Authority Transition Smoothness Metric

Measure the temporal smoothness of envelope-to-breakup or envelope-to-non-envelope transitions.

### Failure signature

Abrupt authority collapse or flicker at crest transitions.

---

# 32.10. Branch Quality Metrics

Branch stages need metrics beyond “did branches appear?”

## 32.10.1. Branch Birth Timing Metric

Measure whether proto-filaments appear in the right regions and at the right stage of instability.

## 32.10.2. Taper Quality Metric

Measure whether branch radius changes plausibly from root to tip.

A trivial constant-radius branch should score poorly.

## 32.10.3. Necking Progression Metric

Measure whether necking develops progressively rather than appearing instantaneously.

## 32.10.4. Bead Irregularity Metric

Measure variation in bead spacing and bead size.

The point is to penalize factory-necklace behavior.

## 32.10.5. Partial Detachment Persistence Metric

Measure whether residual structure survives after some children emit.

A system that always annihilates the full chain after first release should score poorly.

---

# 32.11. Detached Population Metrics

Detached children need their own lifecycle metrics.

## 32.11.1. Radius Diversity Metric

Measure the spread and hierarchy of droplet radii by class and event type.

## 32.11.2. Motion Hierarchy Metric

Measure class-dependent differences in drag response and ballistic persistence.

## 32.11.3. Shape-Memory Persistence Metric

Measure whether detached droplets retain velocity-related visual stretch long enough to preserve continuity but not so long that they remain cartoonishly elongated.

## 32.11.4. Confetti Penalty

Measure the accumulation of low-value detached fragments over time.

This is the anti-immortal-spray metric.

---

# 32.12. Merge-Back and Reunion Metrics

A merge system needs explicit validation.

## 32.12.1. Merge Success Rate

Measure how many droplets that plausibly should merge actually enter and complete reabsorption.

## 32.12.2. Merge Timing Metric

Measure delay between first meaningful contact and completed merge.

### Failure extremes

* too short: pop-delete merge
* too long: awkward zombie droplet hanging on the surface

## 32.12.3. Reunion Visibility Metric

Measure whether merge-back deposits a visible or dynamically meaningful disturbance.

This may be partly qualitative.

## 32.12.4. Empty Merge Penalty

A specific penalty for droplets that complete merge with no meaningful surface consequence.

---

# 32.13. Contact and Impact Metrics

Contact classification must also be validated.

## 32.13.1. Contact Class Distribution

Measure distribution of:

* soft merge
* skim
* energetic re-entry
* violent impact

across scenario families.

This helps detect if the classifier is collapsing most events into one class.

## 32.13.2. Skim Plausibility Metric

Measure whether shallow-angle contacts actually produce skim behavior at a sensible rate.

## 32.13.3. Violent-Impact Restraint Metric

Measure whether violent outcomes remain selective rather than ubiquitous.

---

# 32.14. Budget and Stability Metrics

The system must also be validated as an engine, not just as a beauty machine.

## 32.14.1. Active Population Stability

Measure active counts of branches, droplets, and mist over time.

## 32.14.2. Budget Hit Rate

Measure how often global and local budgets reject or defer events.

## 32.14.3. Cooldown Rejection Rate

High rejection rates may indicate either healthy spam control or a system whose thresholds are too noisy.

## 32.14.4. Graceful Degradation Metric

Under stress scenarios, measure whether the system degrades smoothly or collapses into obvious starvation or chaos.

---

# 32.15. Qualitative Review Rubric

Some of the most important judgments are still visual. They should be structured rather than vague.

A reviewer should evaluate each benchmark scene on a fixed rubric such as:

* calm-sheet smoothness
* ripple believability
* rolling-wave vitality
* crest honesty
* branch readability
* bead-chain plausibility
* droplet scale richness
* merge-back satisfaction
* overall temporal stability

A low-dimensional rubric is far better than “looks kind of better, I guess.”

---

# 32.16. A/B Comparison Doctrine

A major goal of validation is comparison.

## 32.16.1. Compare by scenario, not by memory

The engine should compare candidate versions under identical benchmark scenes and camera states.

## 32.16.2. Compare debug state as well as final render

An algorithm that looks better but only because it is suppressing branch birth incorrectly must be caught.

## 32.16.3. Snapshot pairs

Each validation run should preferably generate:

* final beauty snapshot
* selected debug overlays
* key counters
* parameter manifest

This makes comparisons reproducible rather than emotional.

---

# 32.17. Ground-Truth and Reference Philosophy

True physical ground truth is not always available or practical for this browser-first architecture. But references still matter.

## 32.17.1. Reference types

Useful references include:

* real fluid footage
* higher-quality offline fluid renders
* controlled physical intuition scenes
* internal prior best versions

## 32.17.2. Role of reference

Reference should be used to anchor expectations for:

* rest-state smoothness
* rolling-wave vitality
* branch progression
* droplet scale hierarchy
* reunion plausibility

The goal is not perfect imitation. The goal is disciplined resemblance in the relevant perceptual regimes.

---

# 32.18. Validation Workflow

The project should adopt a repeatable validation workflow.

## 32.18.1. Step 1 — choose benchmark family

Do not tune against random chaos.

## 32.18.2. Step 2 — freeze camera and scenario parameters

Make the comparison reproducible.

## 32.18.3. Step 3 — capture final and debug views

At minimum capture the views relevant to the subsystem under investigation.

## 32.18.4. Step 4 — record counters and parameter manifest

Without this, comparisons decay into vibes.

## 32.18.5. Step 5 — score quantitative and qualitative metrics

Even if some metrics are approximate, consistency matters.

## 32.18.6. Step 6 — compare to previous accepted baseline

Always compare against something explicit.

---

# 32.19. Failure-Triage Through Validation

Validation must help identify *why* a test failed.

## 32.19.1. Example: calm pool still looks marbly

Check:

1. lobe residual metric
2. smoothing authority
3. ripple-preservation weight
4. confidence
5. raw-vs-filtered envelope comparison

## 32.19.2. Example: rolling wave looks too dull

Check:

1. relief-preservation metric
2. rolling envelope weight
3. directional filter behavior
4. overhang penalty timing
5. arbitration weights

## 32.19.3. Example: breakup still looks like particles popping

Check:

1. branch birth timing
2. taper quality
3. necking progression
4. detachment readiness
5. child radius diversity
6. partial-detachment persistence

Validation is most useful when it points toward the likely guilty layer.

---

# 32.20. Acceptance Bands Rather Than Absolute Perfection

The goal of validation is not to demand mythical perfection.

It is to define acceptance bands for each scenario family.

Examples:

* calm-sheet shimmer below a tolerable threshold
* ripple preservation above a useful threshold
* crest welding frequency below a target rate
* droplet radius diversity above a minimum richness threshold
* confetti penalty below a budget-safe band

Acceptance-band thinking is far more realistic and useful than pretending a single perfect scalar exists.

---

# 32.21. Validation Tiers

Validation should support quality tiers just as the runtime does.

## 32.21.1. Tier A — Minimal

Validate:

* calm-sheet smoothing
* rolling-wave preservation basics
* early branch birth

## 32.21.2. Tier B — Intermediate

Validate:

* ligament and bead-chain progression
* detached class hierarchy
* merge-back basics

## 32.21.3. Tier C — Full Hybrid

Validate:

* all scenario families
* all coupling modes
* stress behavior
* snapshot comparison workflow
* long-horizon confetti and budget stability

This lets the validation doctrine evolve with the engine.

---

# 32.22. Failure Modes This Section Exists to Prevent

## 32.22.1. Pretty Regression

A change looks more cinematic in one frame but regresses calm-sheet realism, breakup honesty, or merge-back quality elsewhere.

## 32.22.2. One-Scene Overfitting

The system becomes tuned to one showcase scene while breaking in the rest of the regime space.

## 32.22.3. Metric Blindness

The team stares only at beauty frames and misses the state or authority failures causing them.

## 32.22.4. Quantification Theater

The team invents metrics that sound scientific but do not actually correlate with visible correctness.

## 32.22.5. No Baseline Discipline

The team cannot tell whether the system improved because comparisons are not reproducible.

---

# 32.23. Recommended Implementation Path

## 32.23.1. Phase A — Benchmark Families and Snapshot Protocol

Start with:

* calm basin
* rolling wave
* crest transition
* branch birth
* re-entry scene

and capture:

* final frame
* one or two key debug views
* counters
* parameter manifest

## 32.23.2. Phase B — Quantitative Core Metrics

Add:

* lobe residual
* relief preservation
* ambiguity / overhang timing
* radius diversity
* merge completion timing
* confetti penalty

## 32.23.3. Phase C — Acceptance Bands and A/B Automation

Add:

* scenario-specific pass/fail bands
* baseline comparison automation
* low/high tier validation splits

This is where the project becomes a disciplined research loop rather than a mood board.

---

# 32.24. Closing Position of Section 32

The central claim of this section is that a hybrid fluid system must prove its value regime by regime.

A successful validation doctrine should:

* evaluate calm-sheet realism separately from rolling-wave preservation,
* evaluate envelope honesty separately from breakup beauty,
* evaluate detached lifecycles separately from merge-back satisfaction,
* stress-test boundedness and degradation,
* and compare all of the above against explicit scene baselines and parameter manifests.

That is how the project avoids becoming an ever-more-elaborate machine for producing seductive but untrustworthy water.

---






# Section 33. Artist-Facing Control Mapping for Envelope Honesty, Breakup Sensitivity, and Merge-Back Behavior

## Purpose

This document defines the artist-facing control doctrine for the hybrid MLS-MPM fluid surface and breakup architecture.

The central question of this section is:

**How should the system expose control over envelope honesty, calm-sheet smoothing, rolling-wave preservation, breakup sensitivity, branch progression, droplet lifecycle, and merge-back behavior in a way that remains visually intuitive, expressive, and safe, rather than collapsing into a shrine of obscure thresholds, hidden coupling, and generic sliders?**

This section translates the internal architecture into a humane authoring surface. It does not replace the deep parameter system. Instead, it defines the mapping layer that converts the engine’s internal control fields into visual instruments, grouped macros, regime-aware editor clusters, and safe high-level controls.

The purpose is not to hide complexity. The purpose is to make complexity steerable.

---

# 33.1. Core Thesis of Artist-Facing Control

A sophisticated fluid system does not become usable by exposing every scalar directly.

If the user is forced to tune:

* raw ambiguity thresholds,
* overhang penalty weights,
* bead maturity gates,
* directional smoothing coefficients,
* merge-age gain,
* and budget caps

as unrelated controls, the result is not expressive freedom. It is cognitive sabotage.

The artist-facing control layer must therefore obey three laws:

1. **Control must be visual whenever possible.**
2. **Controls must be grouped by phenomenon, not by implementation accident.**
3. **Unsafe or deeply coupled internals must be wrapped in intelligible higher-level behavior controls.**

The thesis position is simple:

**The engine should expose fluid behavior as visual authoring instruments and regime-level control surfaces, not as a spreadsheet of detached implementation scalars.**

---

# 33.2. Relationship to the Internal Architecture

The internal system already contains rich state fields:

* exposure
* coherence
* sheetness
* rollingness
* smoothing authority
* ambiguity
* overhang penalty
* breakup instability
* detachment readiness
* merge potential
* disturbance deposition

These internal fields are correct for runtime logic, but they are not automatically correct for human control.

The control layer must therefore sit between:

## 33.2.1. Internal runtime truth

The low-level fields and thresholds that govern behavior.

## 33.2.2. Artist-facing intent

The desired creative outcomes, such as:

* “make the calm water smoother, but keep ripples alive”
* “let wave crests hold together longer before breaking”
* “make breakup more stringy before droplets appear”
* “make re-entry feel softer and more liquid”

The mapping layer exists to translate between those worlds.

---

# 33.3. Prime Directive for Control Design

The artist-facing layer must reject generic parameter panels.

The control surface should prefer:

* direct visual manipulation,
* phenomenon-based groupings,
* contextual presets,
* and safe macro controls.

What must be avoided:

* endless raw sliders,
* unrelated threshold piles,
* unlabeled internal jargon,
* and controls that expose numeric freedom without visual meaning.

This section therefore assumes that the preferred user experience is built from **visual instruments first, advanced numeric controls second, hidden internals last**.

---

# 33.4. Control Layers

The control architecture should be layered.

## 33.4.1. Layer A — Visual Authoring Instruments

These are the primary interaction surfaces.

Examples:

* a calm-sheet profile editor showing surface smoothness vs retained ripple energy
* a wave-preservation editor showing rolling relief protection across crest and trough
* a breakup progression editor showing sheet → filament → bead → droplet timing as a visual curve
* a merge-back editor showing quiet reunion vs sharp impact behavior as a visual response graph

These should be the default controls for most users.

---

## 33.4.2. Layer B — Regime-Level Macro Controls

These are compact high-level controls for behavior families.

Examples:

* Calm Surface Discipline
* Rolling Relief Protection
* Crest Honesty
* Breakup Stringiness
* Bead Persistence
* Droplet Scale Richness
* Reunion Softness
* Impact Violence

These macros should move multiple internal parameters together in a controlled way.

---

## 33.4.3. Layer C — Advanced Structured Controls

These are for expert users who want direct access to key sub-behaviors, but still in grouped and interpretable form.

Examples:

* ambiguity suppression curve
* overhang sensitivity profile
* bead-chain detachment spacing rule
* droplet drag response by class
* deposition footprint mapping

These should be grouped by subsystem and visually represented wherever possible.

---

## 33.4.4. Layer D — Hidden Raw Implementation Scalars

These are not the normal artist-facing surface.

They may exist for engineering, debugging, or experimental tuning, but they should not define the primary UI identity of the system.

This is the difference between a professional creative instrument and a fluid debugging spreadsheet with delusions of grandeur.

---

# 33.5. Control Domains

Artist-facing controls should be grouped by visible fluid phenomena, not by arbitrary internal modules.

The major control domains should be:

## 33.5.1. Calm Surface

Controls how exposed coherent near-rest water suppresses lobes and preserves gentle ripple structure.

## 33.5.2. Rolling Waves

Controls how active coherent water preserves relief, crest vitality, and directional identity.

## 33.5.3. Envelope Honesty

Controls how cautious or aggressive the envelope is near ambiguity, overhang, and invalid geometry.

## 33.5.4. Breakup Onset

Controls when coherent surface yields to branch logic.

## 33.5.5. Branch Behavior

Controls filament birth, taper, necking, bead persistence, and release pacing.

## 33.5.6. Detached Spray

Controls droplet scale hierarchy, drag, stretch persistence, and lifetime behavior.

## 33.5.7. Reunion and Impact

Controls skim, merge-back softness, dimple strength, ripple deposition, and violent re-entry behavior.

This grouping matches the way artists think about fluid events.

---

# 33.6. Macro Control Philosophy

Each domain should expose a small number of powerful macros rather than a hundred tiny knobs.

## 33.6.1. Good macro qualities

A good macro:

* corresponds to a visible phenomenon
* affects a coherent set of internal variables
* has a predictable direction of effect
* does not secretly sabotage unrelated regimes
* and can be explained in plain language

## 33.6.2. Bad macro qualities

A bad macro:

* mixes unrelated systems
* produces contradictory side effects
* is named after implementation jargon rather than visible behavior
* or changes too many hidden things with no debug transparency

The artist must feel like they are steering water behavior, not bribing a bureaucracy of thresholds.

---

# 33.7. Calm Surface Control Mapping

The calm-surface domain should expose controls that directly answer the lumpy-at-rest problem.

## 33.7.1. Primary macro: Calm Smoothness

### User meaning

How strongly calm exposed water suppresses particle-lobe artifacts.

### Internal mapping

This may influence:

* envelope smoothing authority in calm regimes
* confidence-weighted filtering strength
* lobe-noise suppression gain
* temporal stabilization strength for calm surfaces

### Important guardrail

This macro must be counterbalanced by ripple-preservation behavior so it does not simply flatten the water into dead plastic.

---

## 33.7.2. Primary macro: Ripple Preservation

### User meaning

How much coherent small-scale wave detail survives in calm and lightly active water.

### Internal mapping

This may influence:

* ripple-preservation weights
* smoothing suppression for coherent high-frequency structure
* temporal retention of small-scale envelope variation

### Important guardrail

Increasing ripple preservation must not simply reintroduce support lobes. It should privilege coherent ripple content, not generic fine noise.

---

## 33.7.3. Visual instrument suggestion

A dedicated calm-surface editor could show:

* a miniature water profile before/after smoothing,
* a visible lobe-noise overlay,
* and a coherent ripple overlay.

The user drags a balance point between:

* “glassier calm sheet”
* and “more retained micro-wave life.”

That is far better than two unlabeled sliders fighting in the dark.

---

# 33.8. Rolling-Wave Control Mapping

Rolling water requires a different control language.

## 33.8.1. Primary macro: Rolling Relief Preservation

### User meaning

How strongly active coherent waves retain crest/trough structure and directional vitality.

### Internal mapping

This may influence:

* rolling-relief preservation weight
* directional filter anisotropy
* reduced flattening bias in rolling regimes
* crest-adjacent smoothing suppression

---

## 33.8.2. Primary macro: Crest Discipline

### User meaning

How long coherent crests are allowed to remain envelope-dominant before breakup or invalidity suppression takes over.

### Internal mapping

This may influence:

* envelope authority near crest regions
* overhang suppression onset timing
* breakup-adjacent confidence reduction
* crest-transition arbitration thresholds

### Guardrail

This must not simply delay all breakup. It should specifically control the coherent-to-transition grace window.

---

## 33.8.3. Visual instrument suggestion

A rolling-wave editor could show:

* a wave face profile,
* a crest region,
* and a shaded transition band showing where envelope authority gives way to breakup or non-envelope support.

The user manipulates how “strong but honest” the crest remains before it starts to fold or break.

---

# 33.9. Envelope Honesty Control Mapping

The system needs explicit artist-facing control over how aggressively or cautiously the envelope claims authority.

## 33.9.1. Primary macro: Envelope Honesty

### User meaning

How quickly the coherent surface representation backs off when ambiguity, overhang, or topological complexity grows.

### Internal mapping

This may influence:

* ambiguity penalty gain
* overhang penalty gain
* confidence suppression under candidate competition
* hand-off timing to non-envelope or breakup authority

### Extremes

* low honesty: envelope stays bold longer, risks false coherence
* high honesty: envelope becomes cautious earlier, risks giving up too soon

This is one of the most important artist-facing controls in the whole architecture.

---

## 33.9.2. Secondary macro: Ambiguity Tolerance

### User meaning

How willing the system is to keep trusting a top-envelope candidate when nearby support layers compete.

### Internal mapping

This may influence:

* best-vs-second candidate gap thresholds
* candidate-count pressure weighting
* secondary-candidate persistence behavior

### Use case

Useful for tuning the line between “gracefully persistent top surface” and “confident nonsense.”

---

## 33.9.3. Visual instrument suggestion

A dedicated honesty editor could show:

* a local support column with multiple candidate peaks,
* an ambiguity meter,
* and a visible authority falloff curve.

This makes envelope humility something the user can actually see and shape.

---

# 33.10. Breakup Onset Control Mapping

The moment coherent fluid yields to branch behavior must be steerable in high-level terms.

## 33.10.1. Primary macro: Breakup Sensitivity

### User meaning

How readily exposed unstable coherent water begins transitioning into branch or spray behavior.

### Internal mapping

This may influence:

* breakup instability thresholds
* breakup age accumulation gain
* proto-filament potential thresholds
* breakup-source entry thresholds

### Guardrail

This macro must be region-aware. It should not make calm water randomly fragile.

---

## 33.10.2. Primary macro: Stringiness

### User meaning

How strongly breakup prefers elongated branch stages before droplet release.

### Internal mapping

This may influence:

* proto-filament and ligament persistence
* branch taper and thinning dynamics
* bead maturity timing
* direct-snap suppression

High stringiness means breakup wants to become branches first. Low stringiness means breakup becomes droplets more directly.

---

## 33.10.3. Visual instrument suggestion

A breakup progression editor could show a left-to-right visual chain:

sheet -> filament -> ligament -> bead -> droplet

The user adjusts how long the system dwells in each stage before moving on.

That is vastly more intelligible than editing five separate thresholds by name.

---

# 33.11. Branch Behavior Control Mapping

Branch stages need their own expressive surface.

## 33.11.1. Primary macro: Branch Taper

### User meaning

How quickly branch radius falls from root to tip.

### Internal mapping

This may influence:

* proto-filament radius law
* ligament taper gain
* instability-weighted taper amplification

---

## 33.11.2. Primary macro: Necking Strength

### User meaning

How strongly unstable branches develop visible constrictions before release.

### Internal mapping

This may influence:

* necking signal gain
* bead-modulation amplitude
* bead-chain readiness timing

---

## 33.11.3. Primary macro: Bead Persistence

### User meaning

How long bead-like structures remain visible before releasing detached children.

### Internal mapping

This may influence:

* bead maturity requirement
* detachment readiness threshold
* partial-detachment pacing
* residual-chain persistence after release

This control is essential for avoiding instant particle pop behavior.

---

## 33.11.4. Visual instrument suggestion

A branch editor could show:

* a root-to-tip branch profile,
* visible necking zones,
* and detachable bead nodes.

The user drags the taper curve and bead emphasis directly on the branch silhouette.

---

# 33.12. Detached Spray Control Mapping

Detached children require a compact but expressive control surface.

## 33.12.1. Primary macro: Droplet Scale Richness

### User meaning

How much radius hierarchy exists among emitted detached children.

### Internal mapping

This may influence:

* child-radius distribution width
* class split proportions
* violent-event secondary child variance

---

## 33.12.2. Primary macro: Air Resistance

### User meaning

How strongly detached children slow and damp in flight.

### Internal mapping

This may influence:

* class-dependent drag curves
* micro-droplet lifetime compression
* mist-conversion tendency under high drag

---

## 33.12.3. Primary macro: Shape Memory

### User meaning

How long droplets retain stretch or asymmetry inherited from their parent motion.

### Internal mapping

This may influence:

* visual-stretch decay rate
* class-dependent shape relaxation timing

This is a beautiful control because it directly affects continuity between branch release and detached flight.

---

## 33.12.4. Visual instrument suggestion

A detached-spray editor could show:

* droplets of varying size on a motion arc,
* drag trails,
* and before/after shape memory relax curves.

This makes scale and motion hierarchy perceptible at authoring time.

---

# 33.13. Reunion and Merge-Back Control Mapping

Reunion is one of the most emotionally satisfying parts of the whole architecture, so it deserves its own control language.

## 33.13.1. Primary macro: Reunion Softness

### User meaning

How gently detached droplets are reabsorbed into the coherent surface.

### Internal mapping

This may influence:

* merge-entry tolerance
* merge-age timing
* dimple strength under soft contact
* detached-identity fade behavior during reabsorption

High softness means graceful liquid reunion. Low softness means more abrupt, sharper reintegration.

---

## 33.13.2. Primary macro: Impact Violence

### User meaning

How readily strong re-entry events produce energetic disturbance, micro-emission, or breakup-coupled effects.

### Internal mapping

This may influence:

* energetic and violent contact thresholds
* disturbance weights
* violent impact emission gates
* local breakup-coupled deposition

### Guardrail

This control must remain budget-aware and not convert every reunion into fireworks.

---

## 33.13.3. Primary macro: Surface Response Strength

### User meaning

How much visible dimple, ripple, and local disturbance the coherent surface expresses when contacted by detached droplets.

### Internal mapping

This may influence:

* deposition packet amplitude
* ripple seed strength
* dimple depth or height-delta scale
* local thickness reinforcement magnitude

This is the control that prevents empty reunion syndrome.

---

## 33.13.4. Visual instrument suggestion

A merge-back editor could show:

* a falling droplet,
* a coherent surface patch,
* and a response graph or animated profile for:

  * skim,
  * soft merge,
  * energetic re-entry.

The user can directly tune whether reunion feels like a kiss, a dimple, or a slap.

---

# 33.14. Coupled Macro Doctrine

Some high-level controls should intentionally move multiple domains together.

## 33.14.1. Cinematic Liquidity

A global macro that might:

* increase calm smoothness slightly
* increase rolling relief protection
* increase stringiness
* increase shape memory slightly
* increase reunion softness

This creates a more graceful, expressive liquid feel.

## 33.14.2. Violent Ocean Energy

A global macro that might:

* reduce envelope patience near crests
* increase breakup sensitivity
* increase direct-snap allowance
* increase impact violence
* reduce merge softness slightly

This creates a more explosive aggressive fluid personality.

## 33.14.3. Important warning

Coupled macros must be transparent. The user should be able to inspect what they are influencing, or they become superstition machines.

---

# 33.15. Preset Doctrine

The system should support presets at the phenomenon level.

## 33.15.1. Preset categories

Useful preset groups include:

* Calm glassy water
* Soft rippled basin
* Energetic wind chop
* Rolling storm swell
* Stringy splash breakup
* Pearl-rich detachment
* Gentle reunion
* Violent impact splash

## 33.15.2. Preset philosophy

Presets should not merely change numbers. They should express behavioral intentions and be mapped through the macro layer.

This keeps presets interpretable and easier to extend.

---

# 33.16. Range-of-Motion and Safety Zones

Because the internal system contains many coupled parameters, artist-facing controls should expose safe operating zones.

## 33.16.1. Why safety zones matter

Some behaviors can be tuned into self-defeating regions, such as:

* too much calm smoothing -> plastic sheet
* too much ripple preservation -> lobe revival
* too much breakup sensitivity -> incoherent spray chaos
* too much reunion softness -> weak visible impact identity

## 33.16.2. Control doctrine

Visual instruments should show:

* comfort zone
* strain zone
* danger zone

where appropriate.

This is especially important for high-level macros that map to many internals.

---

# 33.17. Control Transparency and Explainability

A macro control should not feel magical in the bad sense.

## 33.17.1. Minimum explainability

For any major macro, the UI should be able to communicate:

* what visible behavior it changes
* which regime it primarily affects
* whether it tends to make the system softer, more honest, more violent, more stringy, and so on

## 33.17.2. Advanced explainability

In advanced mode, the UI may reveal the major internal quantities influenced by the control.

This is especially useful for expert users and debugging.

---

# 33.18. Preserving the Prime Directive in UI Structure

The control architecture should be embodied in the UI structure itself.

## 33.18.1. Recommended UI doctrine

* right bar or primary category selection for major fluid domains
* drawer-level icon bar for coherent surface / breakup / detached / reunion subdomains
* visual editor as the main interaction surface
* numeric fallbacks hidden in advanced sections

## 33.18.2. Why this matters

If the UI defaults to raw sliders and only offers visual editors as optional embellishments, the architecture has already betrayed its own thesis.

The visual instrument must be primary.

---

# 33.19. Diagnostics-Aware Control Design

Artist-facing controls should integrate with the observability system rather than living separately from it.

## 33.19.1. Control + debug linkage

When a user adjusts:

* Envelope Honesty,
* Breakup Sensitivity,
* Bead Persistence,
* or Reunion Softness,

the corresponding debug fields should be easy to surface.

This creates a powerful loop between artistic intention and internal truth.

## 33.19.2. Why this matters

The system should let users learn the fluid, not merely poke it.

---

# 33.20. Recommended Implementation Path

## 33.20.1. Phase A — Macro Layer Over Existing Architecture

Start with a small set of visible behavior macros:

* Calm Smoothness
* Ripple Preservation
* Rolling Relief Preservation
* Envelope Honesty
* Breakup Sensitivity
* Stringiness
* Bead Persistence
* Droplet Scale Richness
* Reunion Softness
* Surface Response Strength

These macros map to grouped internal parameters.

This alone makes the architecture drastically more steerable.

## 33.20.2. Phase B — Visual Editors for Key Domains

Add dedicated visual instruments for:

* calm-sheet shaping
* crest transition honesty
* breakup progression
* branch taper and bead persistence
* reunion response

This is where the system starts becoming a true creative instrument rather than a macro wrapper.

## 33.20.3. Phase C — Presets, ROM Zones, and Advanced Explainability

Add:

* curated presets
* safe zone visualization
* advanced parameter reveal
* debug-linked control explanation

This creates a full authoring ecosystem.

---

# 33.21. Failure Modes This Section Exists to Prevent

## 33.21.1. Threshold Shrine Syndrome

The artist is forced to tune a forest of raw internal scalars with no visible semantic grouping.

## 33.21.2. Generic Slider Regression

The UI abandons visual instruments and falls back to generic control panels.

## 33.21.3. Macro Mystery Syndrome

High-level controls move hidden internals in ways the user cannot understand or debug.

## 33.21.4. Cross-Regime Sabotage

A control intended for one regime quietly breaks another because the mapping layer is not disciplined.

## 33.21.5. Beauty Without Steering

The engine can produce gorgeous results, but the user cannot intentionally author them with confidence.

---

# 33.22. Closing Position of Section 33

The central claim of this section is that the internal sophistication of the hybrid fluid architecture must be translated into a humane, visual, phenomenon-based control surface.

A successful implementation should:

* expose behavior by visible regime rather than raw implementation accident,
* prefer visual instruments over generic sliders,
* wrap deep parameter couplings in intelligible macros,
* preserve safety zones and explainability,
* and give artists direct control over the most important phenomena:
  calm smoothness, ripple life, rolling relief, envelope honesty, breakup pacing, droplet richness, and reunion behavior.

That is how the system becomes not just a powerful fluid engine, but an actual creative instrument.

---





# Section 34. Performance Scaling Strategy Across Low, Medium, and High Quality Tiers

## Purpose

This document defines the performance-scaling doctrine for the hybrid MLS-MPM fluid surface and breakup architecture.

The central question of this section is:

**How should the system scale across low, medium, and high quality tiers so that calm-sheet realism, rolling-wave coherence, breakup hierarchy, detached lifecycles, and merge-back behavior degrade gracefully under constrained hardware and frame budgets rather than collapsing into accidental quality loss, feature starvation, or incoherent visual lies?**

This section formalizes the engine’s runtime survival strategy. It defines which subsystems are foundational, which are optional or refinable, how quality tiers should be structured, what must never be sacrificed, what may be simplified, and how budgets should shift under real-world browser constraints.

The goal is not merely to run everywhere. The goal is to remain *honest and beautiful within budget*.

---

# 34.1. Core Thesis of Performance Scaling

A hybrid fluid architecture of this complexity cannot treat performance scaling as an afterthought.

If the system simply disables features ad hoc under pressure, it will produce:

* calm water that regresses into visible marbles,
* rolling water that turns into plastic blur,
* breakup that devolves into generic particles,
* reunion that becomes pop-delete,
* and debug states that no longer correspond to what the runtime is actually doing.

The core thesis of this section is therefore:

**Performance scaling must preserve representational honesty first, visual richness second, and micro-detail last.**

In other words:

* the engine may simplify,
* it may coarsen,
* it may cap,
* it may substitute,
* but it must not casually lie about the fluid’s regime logic.

---

# 34.2. Performance Philosophy

The engine should adopt the following performance philosophy.

## 34.2.1. Preserve core behavior before decorative richness

If forced to choose, preserve:

* correct regime transitions,
* envelope honesty,
* progressive breakup logic,
* and meaningful merge-back,

before preserving:

* extra spray counts,
* richer mist halos,
* finer bead irregularity,
* or luxurious filtering passes.

## 34.2.2. Degrade progressively, not catastrophically

A tier reduction should soften behavior and reduce richness, not make the fluid suddenly betray its own thesis.

## 34.2.3. Maintain continuity of meaning across tiers

A calm sheet should still read as a calm sheet.
A ligament should still read as a ligament.
A merge-back should still read as reunion.

The details may simplify, but the semantic structure should survive.

## 34.2.4. Budget by regime importance

Not every regime deserves equal spending all the time.

The system should prioritize:

* what is most visible,
* what is most semantically critical,
* and what would look most wrong if degraded poorly.

---

# 34.3. Non-Negotiable Invariants Across All Tiers

Some truths must survive all performance levels.

## 34.3.1. Calm-sheet anti-lump doctrine

Even at low quality, calm coherent water must not collapse fully back into naive sphere-led marbling.

The implementation may become coarser, but the thesis must survive.

## 34.3.2. Envelope honesty doctrine

Even at lower tiers, the system must still know when the envelope is no longer trustworthy.

Overhang and ambiguity handling may become cheaper, but not absent.

## 34.3.3. Progressive breakup doctrine

Even if branch richness is reduced, breakup must not jump straight from coherent sheet to uniform bead soup everywhere.

## 34.3.4. Merge-back existence

Even simplified tiers must retain explicit reabsorption rather than reverting to immortal confetti or silent delete.

## 34.3.5. Debug-truth alignment

If the engine claims it is in a certain tier, debug outputs and behavior must reflect that actual tier logic.

A low-tier runtime pretending to run high-tier logic is a debugging betrayal.

---

# 34.4. Tier Architecture Overview

The system should expose at least three canonical quality tiers.

## 34.4.1. Low Tier

Goal:

* preserve architectural truth
* maintain calm-sheet readability
* maintain basic breakup progression
* keep detached lifecycle bounded
* remain viable on constrained hardware

This tier is about survival with dignity.

---

## 34.4.2. Medium Tier

Goal:

* preserve the main expressive structure of all major regimes
* restore richer filtering, branch shaping, and detached behavior
* remain broadly practical for typical capable desktop and mid-range systems

This is the main balanced tier.

---

## 34.4.3. High Tier

Goal:

* unlock full hybrid richness
* allow stronger ambiguity handling, better filtering, richer branch geometry, finer detached hierarchy, and more luxurious coupling behavior

This tier is where the system becomes most fully itself.

---

# 34.5. Tiering by Subsystem

The engine should not scale by one global “quality number” alone. It should scale each subsystem in a controlled way.

The major subsystems are:

* coherent surface classification
* envelope extraction
* envelope filtering
* invalidity handling
* branch synthesis
* detached droplet lifecycle
* coupling and deposition
* diagnostics

Each of these needs a tier-specific doctrine.

---

# 34.6. Primary Solver Scaling

The core MLS-MPM solver is the foundation. It should be scaled carefully.

## 34.6.1. What may scale

* grid resolution
* particle count
* update frequency for secondary passes relative to solver step
* support-field resolution used downstream

## 34.6.2. What must remain meaningful

Even when solver resolution drops, the downstream representation system must still be able to infer:

* exposure,
* coherence,
* and broad regime state

with enough stability to maintain the thesis.

## 34.6.3. Performance doctrine

Lower tiers may reduce simulation richness, but should compensate by preserving representational logic as best as possible rather than giving up entirely.

---

# 34.7. Surface-State Classification Scaling

Classification is foundational and relatively cheap compared with some luxury rendering behaviors.

## 34.7.1. Low tier

Keep:

* bulk / calm / rolling / breakup-source classification
* simplified exposure
* simplified coherence
* simplified breakup instability

Drop or simplify:

* finer secondary contributors
* elaborate multi-signal blending if too expensive

## 34.7.2. Medium tier

Restore:

* better coherence estimation
* stronger breakup-age logic
* more stable regime separation

## 34.7.3. High tier

Use:

* full multi-signal classification
* more robust temporal accumulators
* higher-quality confidence integration

### Principle

Classification should degrade in richness, not disappear.

---

# 34.8. Envelope Extraction Scaling

Envelope extraction is one of the most important places to scale intelligently.

## 34.8.1. Low tier

Use:

* coarse world-aligned grid
* single or dual top candidates
* simplified confidence
* reduced thickness sophistication

Avoid:

* expensive multi-peak reasoning
* full volumetric luxury extraction

### Key requirement

Still suppress calm-sheet marbling in a believable way.

---

## 34.8.2. Medium tier

Use:

* higher-resolution grid
* dual-candidate policy
* better ambiguity tracking
* better thickness estimation

## 34.8.3. High tier

Use:

* hybrid top-support plus density-informed extraction
* richer ambiguity and multi-layer reasoning
* more robust confidence assembly

### Principle

The envelope may become less detailed at low tiers, but it must not become conceptually dishonest.

---

# 34.9. Envelope Filtering Scaling

Filtering is a luxury-rich subsystem, but also crucial for anti-lump success.

## 34.9.1. Low tier

Use:

* confidence-weighted local smoothing
* calm vs rolling strength split
* basic temporal stabilization

Avoid:

* expensive anisotropic multi-pass directional filtering if necessary

### Important note

Low-tier filtering should still be guided, not blind blur.

---

## 34.9.2. Medium tier

Add:

* better bilateral-like compatibility
* modest directional filtering
* stronger relief-preservation weighting

## 34.9.3. High tier

Add:

* directional or elliptical kernels
* stronger ambiguity/overhang-aware filtering
* multi-scale or regime-specialized refinement

### Principle

The first thing to cut is luxurious refinement, not structural guidance.

---

# 34.10. Invalidity and Overhang Scaling

The envelope’s honesty layer must survive all tiers, but at varying richness.

## 34.10.1. Low tier

Keep:

* basic ambiguity penalty
* basic overhang suppression
* envelope-confidence reduction near suspicious geometry

Possible simplifications:

* fewer diagnostic contributors
* simpler candidate-gap logic
* reduced curl sophistication

## 34.10.2. Medium tier

Add:

* dual-candidate ambiguity
* normal conflict
* stronger multi-layer cues

## 34.10.3. High tier

Add:

* richer ambiguity packet
* curl / inversion logic
* stronger breakup-coupled invalidity reasoning

### Principle

What must never happen is full deletion of invalidity handling at low tier. That would make the envelope confident and cheap in exactly the wrong way.

---

# 34.11. Branch Geometry Scaling

Branch richness is one of the clearest scaling domains.

## 34.11.1. Low tier

Use:

* simpler proto-filament and ligament geometry
* fewer active branches
* simpler taper law
* implicit bead stage may be minimal or stylized

Still preserve:

* visible branch birth
* root-to-tip narrowing
* some staged progression before detached droplets

## 34.11.2. Medium tier

Use:

* stronger taper
* visible necking
* partial bead-chain persistence
* moderate branch counts

## 34.11.3. High tier

Use:

* richer segment or implicit field rendering
* stronger irregularity
* longer bead persistence where justified
* higher active chain richness

### Principle

Branch richness can be reduced, but branch semantics should remain.

---

# 34.12. Detachment and Child Spawn Scaling

Spawn logic is a major budget vector.

## 34.12.1. Low tier

Use:

* fewer detached children per event
* stronger prioritization
* simpler child-radius distribution
* reduced micro-child emission

Still preserve:

* size variation
* partial release where feasible
* non-binary detachment in important events

## 34.12.2. Medium tier

Use:

* broader child radius hierarchy
* richer partial release
* stronger residual branch persistence

## 34.12.3. High tier

Use:

* richer bead-driven detachment
* better local spacing rules
* more nuanced direct-snap edge cases

### Principle

The first thing to trim is event count, not event logic.

---

# 34.13. Detached Population Scaling

Detached children can dominate cost if unmanaged.

## 34.13.1. Low tier

Use:

* stricter active count caps
* shorter lifetimes for low-importance micro-droplets
* stronger drag or faster decay for fine fragments
* simpler shape-memory behavior

Still preserve:

* class distinction
* merge-back state
* basic motion hierarchy

## 34.13.2. Medium tier

Use:

* better class-specific drag
* better visual stretch persistence
* more generous active counts

## 34.13.3. High tier

Use:

* full detached hierarchy
* more refined mist-adjacent behavior
* richer contact classification
* longer visible trajectories for meaningful fragments

### Principle

Low tier should simplify detached richness, not convert all spray into generic identical dots.

---

# 34.14. Merge-Back and Coupling Scaling

Reunion behavior should survive all tiers.

## 34.14.1. Low tier

Keep:

* explicit reabsorbing state
* simple merge timing
* basic dimple or surface-response deposition

Drop or simplify:

* richer skim nuance
* violent-impact micro-emission except for major events
* luxurious disturbance footprints

## 34.14.2. Medium tier

Add:

* skim behavior
* stronger ripple deposition distinctions
* better local response shaping

## 34.14.3. High tier

Add:

* richer energetic re-entry taxonomy
* localized breakup-coupled disturbance
* finer merge-back reinforcement behavior

### Principle

Even low-tier reunion must still feel like reunion, not silent deletion.

---

# 34.15. Mist Scaling

Mist is the most obvious luxury subsystem.

## 34.15.1. Low tier

Use:

* minimal or heavily capped mist
* only the most important violent events produce visible mist
* very short lifetimes

## 34.15.2. Medium tier

Use:

* moderate mist support
* selective violent-event bias

## 34.15.3. High tier

Use:

* richer mist population
* better class transitions from micro-droplets
* stronger atmospheric integration if desired

### Principle

Mist is the first subsystem that may be aggressively reduced under pressure, because losing mist is less damaging than losing honest coherent-surface behavior.

---

# 34.16. Diagnostics Scaling

Debugging also needs a tier doctrine.

## 34.16.1. Low tier runtime, high debug truth

Even if runtime visuals are reduced, debug views should still expose the actual logic in play.

## 34.16.2. Lightweight always-on diagnostics

Keep:

* counters
* key heatmaps
* selected-entity inspection

## 34.16.3. Heavy diagnostics

Multi-layer overlays, lineage views, and expensive debug rendering may be optional or paused-only under constrained budgets.

### Principle

Performance scaling must not make the system impossible to understand.

---

# 34.17. Tier-Specific Canonical Profiles

The engine should expose explicit named tier profiles rather than vague quality percentages.

## 34.17.1. Low Tier Profile — Survive with Honesty

Characteristics:

* coarse but real calm-sheet envelope
* simplified rolling preservation
* simplified invalidity handling
* reduced branch richness
* strong droplet caps
* minimal mist
* explicit merge-back retained

This tier should still feel like the same architecture, just leaner.

---

## 34.17.2. Medium Tier Profile — Balanced Fluid Instrument

Characteristics:

* robust calm-sheet anti-lump behavior
* visible rolling-wave vitality
* meaningful overhang handling
* staged branch progression
* rich enough detached hierarchy
* merge-back with visible consequence

This should be the main production target for most capable systems.

---

## 34.17.3. High Tier Profile — Full Hybrid Behavior

Characteristics:

* strongest envelope richness
* best invalidity honesty
* richest directional filtering
* most convincing branch and bead behavior
* fullest detached lifecycle
* richest coupling and reunion nuance

This is the flagship tier.

---

# 34.18. Dynamic Tier Adaptation

Static tier selection may not always be sufficient.

## 34.18.1. Why dynamic adaptation matters

Fluid scenes can vary wildly in complexity over time.

A calm basin and a violent splash storm do not deserve the same budget behavior.

## 34.18.2. Safe dynamic adaptation targets

The safest things to scale dynamically are:

* active detached count caps
* mist density
* branch spawn budgets
* expensive filter refinement passes
* debug richness

## 34.18.3. Unsafe dynamic adaptation targets

Avoid dynamically toggling foundational semantics such as:

* removing merge-back altogether
* disabling invalidity suppression
* eliminating calm-sheet envelope logic mid-scene

That creates visible truth discontinuities.

### Principle

Dynamic adaptation may reduce richness, but it should not mutate the architecture’s meaning in real time.

---

# 34.19. Priority Ladder Under Budget Stress

When the engine is under pressure, it should degrade in a controlled order.

## 34.19.1. Preserve first

1. primary solver coherence
2. basic state classification
3. calm-sheet anti-lump envelope
4. basic invalidity honesty
5. explicit merge-back existence

## 34.19.2. Reduce next

6. luxury filtering refinement
7. branch richness and long bead persistence
8. detached child count richness
9. mist density and long-tail micro behavior
10. advanced coupling nuance

This ladder should be explicit in the engine design.

---

# 34.20. Quality-Tier Mapping to Artist Controls

Artist-facing controls should remain semantically stable across tiers.

## 34.20.1. Why this matters

If “Reunion Softness” means one thing on high tier and something incoherent on low tier, the control surface becomes dishonest.

## 34.20.2. Doctrine

A macro should keep the same visible intention across tiers, even if the underlying implementation becomes simpler.

Example:

* on high tier, `Reunion Softness` may adjust multiple nuanced merge-back behaviors,
* on low tier, it may mainly influence merge timing and dimple strength,

but in both cases it should still mean *how gently droplets rejoin the coherent surface*.

---

# 34.21. Validation Per Tier

Each quality tier should have its own validation expectations.

## 34.21.1. Low tier acceptance

Must prove:

* calm water still avoids obvious marbling
* rolling water remains coherent
* breakup is still staged enough to avoid pure particle popping
* merge-back still exists and is visible

## 34.21.2. Medium tier acceptance

Must prove:

* strong balance of realism and boundedness
* convincing mainline behavior across all major scenario families

## 34.21.3. High tier acceptance

Must prove:

* richest detail without sacrificing honesty or stability
* graceful behavior in all benchmark families including difficult edge cases

This prevents low-tier mode from being treated as a dumping ground for broken simplifications.

---

# 34.22. Canonical Tier Matrix

A useful implementation aid is a tier matrix showing what each level preserves.

## 34.22.1. Example matrix categories

* calm-sheet envelope resolution
* envelope candidate count
* invalidity richness
* filter type
* directional filtering
* branch geometry fidelity
* bead persistence
* child spawn richness
* detached class richness
* mist richness
* merge-back nuance
* coupling richness
* diagnostics richness

This matrix should be explicit and user-visible in advanced tooling.

---

# 34.23. Failure Modes This Section Exists to Prevent

## 34.23.1. Accidental Quality Loss

A tier change silently disables the very behavior that makes the system believable.

## 34.23.2. Low-Tier Dishonesty

The engine runs cheaply but violates its own representational logic.

## 34.23.3. Richness-First Regression

The engine spends budget on mist and extra droplets while calm-sheet realism or merge-back meaning quietly collapses.

## 34.23.4. Dynamic Thrash

Adaptive quality changes cause visible popping or semantic inconsistency across frames.

## 34.23.5. Control Incoherence Across Tiers

Artist-facing macros stop meaning the same thing when the quality level changes.

---

# 34.24. Recommended Implementation Path

## 34.24.1. Phase A — Explicit Low / Medium / High Profiles

Start by defining three canonical profiles with explicit subsystem rules.

Do not start with a vague scalar quality number.

## 34.24.2. Phase B — Budget Ladder and Stress Policy

Implement the budget-priority ladder and ensure the engine degrades in the intended order under stress.

## 34.24.3. Phase C — Dynamic Richness Scaling

Add dynamic adaptation only for non-foundational richness domains such as:

* mist density
* detached count richness
* expensive filter refinement

## 34.24.4. Phase D — Tier Validation Automation

Add automated or semi-automated validation of each canonical tier against benchmark scenes.

This ensures performance scaling remains an engineered doctrine rather than an accumulation of desperate compromises.

---

# 34.25. Closing Position of Section 34

The central claim of this section is that performance scaling must preserve semantic truth before visual luxury.

A successful implementation should:

* define explicit low, medium, and high quality profiles,
* preserve calm-sheet anti-lump behavior across all tiers,
* preserve envelope honesty across all tiers,
* preserve staged breakup and explicit merge-back across all tiers,
* reduce richness in a controlled priority order,
* and keep artist-facing meanings stable even when the implementation under the hood becomes leaner.

That is how the architecture remains itself under pressure instead of becoming a cheaper, less honest impostor.

---






# Master Index — Extended Thesis Structure
## Arc I — Governing Theory and Surface Intelligence
19. Formal State Mathematics — Planned / drafted conceptually

Defines the mathematical language of the whole system: exposure, coherence, restfulness, sheetness, rollingness, elongation, thinning, breakup instability, maturity, and reabsorption potential.
This is the section that turns the architecture from good fluid philosophy into actual control-field doctrine.

20. Detailed Runtime State Machine — Built

Defines the explicit state machine for primary and secondary populations.
Covers state transitions, hysteresis, cooldowns, reversibility rules, budgets, and update ordering so the system behaves like staged fluid logic rather than threshold soup.

21. GPU Data Model and Pipeline Architecture — Built

Defines the actual buffer families, population domains, bind-group logic, counters, allocators, frame graph, and GPU ownership boundaries.
This is the “how the beast is wired” section.

22. Sheet-Envelope Reconstruction and Top-Envelope Extraction — Built

Defines why the envelope exists, when it is valid, how calm and rolling coherent water should be reconstructed, and how the system hands off when the surface stops being top-envelope-valid.
This is the anti-lump doctrine in conceptual form.

23. Envelope Mathematics and Arbitration — Built

Formalizes envelope validity, confidence, smoothing authority, ripple preservation, relief preservation, overhang suppression, and final arbitration between envelope, coherent non-envelope support, and breakup.
This is the math skeleton of the envelope layer.

24. Top-Envelope Extraction Algorithms and Field Representations — Built

Defines actual extraction strategies: top-support, density crossing, dual-candidate policy, ambiguity-aware extraction, thickness extraction, normal extraction, and envelope packet design.
This is the “how do we actually build the coherent top surface?” section.

## Arc II — Breakup Geometry and Detached Lifecycle
25. Filament, Ligament, and Bead-Chain Geometry Synthesis — Built

Defines the geometry doctrine for proto-filaments, ligaments, and bead chains.
Covers skeleton construction, tangent frames, taper, necking, bead emergence, root blending, partial persistence, and render-friendly branch packets.

26. Droplet Motion, Drag, Impact, and Merge-Back Deposition — Built

Defines the detached child lifecycle after release.
Covers droplet classes, size hierarchy, drag, flight, visual shape memory, impact categories, merge-back states, shatter, mist conversion, and deposition back into the coherent surface.

27. Directional Filtering Operators and Envelope Smoothing Kernels — Built

Defines the actual filtering doctrine that kills particle lobes without killing ripple life or rolling-wave relief.
Covers guided filtering, directional kernels, regime-aware smoothing, temporal stabilization, and confidence-aware filtering.

28. Overhang Diagnostics and Ambiguity Handling — Built

Defines how the envelope knows when to stop pretending the surface is locally single-valued.
Covers ambiguity, multi-layer support, normal conflict, underside dominance, curl/inversion, overhang penalty construction, and honest hand-off away from the envelope.

29. Branch-to-Droplet Detachment Mathematics and Spawn Policy — Built

Defines the exact bridge between branch geometry and detached droplets.
Covers detachment readiness, neck collapse, maturity, partial release, child-radius policy, inherited velocity, residual branch persistence, cooldowns, and spawn budgets.

30. Coupling Between Detached Droplets and Coherent-Surface Disturbances — Built

Defines how detached droplets talk back to the coherent surface when they skim, merge, or slam into it.
Covers dimple generation, ripple deposition, skim logic, merge-back reinforcement, energetic re-entry, violent contact, and deposition packets.

## Arc III — Instrumentation, Validation, and Human Control
31. Debug Visualization and Tuning Methodology for Breakup Populations — Built

Defines the observability doctrine for the whole architecture.
Covers heatmaps, state coloring, counters, lineage tracking, snapshots, scenario-based tuning, parameter sweeps, and failure-triage workflows.

32. Validation Methodology for Calm-Sheet Realism, Rolling-Wave Preservation, and Breakup Quality — Built

Defines how the system proves it is improving rather than merely becoming more elaborate.
Covers benchmark scene families, regime-specific metrics, qualitative rubrics, A/B comparison doctrine, acceptance bands, and validation tiers.

33. Artist-Facing Control Mapping for Envelope Honesty, Breakup Sensitivity, and Merge-Back Behavior — Built

Defines the humane control surface for the system.
Covers visual-instrument-first authoring, macro controls by phenomenon, safe ranges, presets, explainability, and regime-based control grouping.

34. Performance Scaling Strategy Across Low, Medium, and High Quality Tiers — Built

Defines how the architecture survives under budget without betraying its own meaning.
Covers non-negotiable invariants, subsystem-by-subsystem scaling, low/medium/high tier doctrine, dynamic adaptation boundaries, and quality-stable control meaning.

## Arc IV — Next Planned Sections

These are the strongest logical next chapters after the current built arc.

35. Experimental Benchmark Scenes and Diagnostic Test Scenarios — Planned

Would define the canonical scene library for testing: calm basins, ripple fields, rolling-wave scenes, crest-transition scenes, branch-birth setups, bead-chain setups, droplet re-entry scenes, violent impact scenes, and stress tests.
This becomes the laboratory of the thesis.

36. Snapshot Protocol and Reproducible Comparison Methodology — Planned

Would formalize how snapshots are captured, compared, labeled, and replayed.
Covers camera/state capture, parameter manifests, debug overlays, comparison pairs, freeze-frame analysis, and reproducible regression hunting.

37. Research Roadmap for Phase-Gated Implementation and Evaluation — Planned

Would turn the thesis into an execution roadmap.
Covers implementation order, milestone gates, what must be proven before the next layer is unlocked, and how to move from early anti-lump wins to full hybrid breakup without losing the plot.

38. Canonical Visual-Editing UI Architecture for the Fluid System — Planned

Would define the actual editor experience for authoring this system in a high-end visual tool.
Covers panel architecture, visual instruments, regime editors, debug-linked controls, snapshots, comparisons, and how the UI should embody the thesis instead of collapsing into slider hell.

39. Shipping Strategy for Browser Deployment, Presets, and Quality Negotiation — Planned

Would define how this becomes a real browser product.
Covers presets, auto-tier negotiation, runtime capability detection, progressive enablement, safe defaults, deployment modes, and how to preserve thesis integrity in production.

Condensed Roadmap View
Theory spine

19 → 24
Build the math, state logic, GPU model, envelope theory, arbitration, and extraction.

Breakup spine

25 → 30
Build branch geometry, detached lifecycle, filtering, invalidity honesty, detachment, and droplet-surface coupling.

Systemization spine

31 → 34
Build debugging, validation, artist control, and performance scaling.

Research + product spine

35 → 39
Build benchmark labs, reproducibility, roadmap execution, editor architecture, and shipping doctrine.

Recommended order from here

If you want the most powerful continuation path, I’d do:

35 — Experimental benchmark scenes and diagnostic test scenarios

36 — Snapshot protocol and reproducible comparison methodology

37 — Research roadmap for phase-gated implementation and evaluation

38 — Canonical visual-editing UI architecture for the fluid system

39 — Shipping strategy for browser deployment, presets, and quality negotiation

That order turns the thesis from a brilliant architecture into a research instrument, then into an authoring system, then into a deployable product doctrine.














