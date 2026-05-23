# HybridSplash Thesis — Analysis and Rebuild Report

**Source:** `hybridsplash-thesis.txt`  
**Rebuilt artifact:** `hybridsplash-thesis-v2-rebuilt.md`  
**Date:** 2026-05-22

---

## 1. Source Coverage Map

| Source range | Original emphasis | Rebuild location |
|---|---|---|
| 0–18 | Preface, abstract, problem statement, visual laws, roadmap | Executive Position, Invariants, Source Diagnosis |
| 19 | Formal state mathematics | Part II — Formal Control Fields |
| 20 | Detailed runtime state machine | Part III — Runtime State Machines |
| 21 | GPU data model and pipeline | Part VI — GPU and Browser Pipeline |
| 22–24 | Sheet envelope, arbitration, extraction | Part IV — Envelope Reconstruction |
| 25 | Filament/ligament/bead geometry | Part V — Breakup Geometry |
| 26 | Droplet lifecycle and merge-back | Part V — Detached Lifecycle and Reabsorption |
| 27–28 | Filtering, overhang, ambiguity | Part IV — Filtering and Envelope Honesty |
| 29–30 | Detachment and droplet-surface coupling | Part V — Detachment, Contact, Deposition |
| 31–32 | Debug and validation | Part VII — Developer Lab, Diagnostics, Validation |
| 33 | Artist-facing controls | Part VIII — Artist-Facing Control and Presets |
| 34 | Performance scaling | Part VI and Part IX — Quality Tiers and Roadmap |
| Master Index | Planned sections 35–39 | Phase roadmap and validation/productization gates |

---

## 2. Highest-Value Rebuild Changes

1. **Resolved notation collision:** coherence is now `K_i`; affine/deformation carrier remains `A_i`.
2. **Added crest hazard state:** coherent crests can become dangerous before coherence collapses.
3. **Separated proof types:** `overlay_capture`, `scene_capture`, `accepted_visual_scene_proof`, and `debug_diagnostic_capture`.
4. **Added rejection reasons:** spawn failures become debuggable rather than mysterious.
5. **Added conservation modes:** visual-only, approximate budgeted, and coupled secondary behavior are explicitly labeled.
6. **Added envelope packet:** top height alone is insufficient; confidence, ambiguity, overhang, smoothing authority, and source ID are part of the truth.
7. **Added phase gates:** each implementation phase now has artifacts and exit criteria.
8. **Added developer-lab doctrine:** pause-by-default, seed lock, camera presets, snapshots, debug overlays.
9. **Added WebGPU/WebGL2 separation:** shared conceptual architecture, separate runtime plumbing.
10. **Added one-water invariant:** prevents the system from degenerating into unrelated effects.

---

## 3. Immediate Recommended Build Packets

### Packet A — Classification Truth Lab

**Goal:** Build `PrimarySurfaceState` fields and state overlays.  
**Exit:** calm/rolling/breakup-source classification visibly separates in controlled test scenes.

### Packet B — Calm Anti-Lump Envelope

**Goal:** Implement Phase A top-envelope grid and calm smoothing.  
**Exit:** accepted visual scene proof showing calm water no longer reads as spherical particle support.

### Packet C — Envelope Honesty Diagnostics

**Goal:** Add ambiguity, candidate-count, normal conflict, and overhang suppression.  
**Exit:** crown/overhang scene refuses false top-envelope smoothing.

### Packet D — Proto-Filament Skeletons

**Goal:** Add bounded secondary filament pool with stretch-before-snap visuals.  
**Exit:** crest test shows attached branches before droplet detachment.

### Packet E — Droplet Reabsorption Lab

**Goal:** Implement merge potential, merge age, and deposition packets.  
**Exit:** re-entry test shows merge/dimple/ripple without pop-delete.

---

## 4. Blockers to Avoid

- Do not implement full droplet/mist richness before calm anti-lump is visually accepted.
- Do not claim visual success from overlay-only screenshots.
- Do not expose raw equation constants as the main UI.
- Do not let secondary entities spawn without local and global caps.
- Do not let top-envelope smoothing run through overhangs, crowns, or detached branches.
- Do not silently mix WebGPU and WebGL2 runtime resources; separate builds are safer.

---

## 5. Final Assessment

The original thesis is conceptually strong and unusually complete. The rebuild makes it more executable by introducing sharper naming, stricter gates, stronger debug/proof doctrine, explicit browser pipeline separation, and phase-specific acceptance criteria.

The next practical move is not more theory. It is **Phase 1 classification truth**, followed by **Phase 2 calm anti-lump envelope proof**.
