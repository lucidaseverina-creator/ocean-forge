# OPUS Visual Editor Canon

**Author:** Opus (Claude 4.5) · Consolidated from OPUS Architecture, OPUS Settings Canon, Ocean/Unified Wave docs, Encyclopedia sources  
**Status:** 🎯 **CANONICAL** – Single source of truth for all visual editors across OPUS ULTIMATE EARTH and Ocean/Unified Wave lineage  
**Date:** 2026-01-31  
**Version:** 1.1  
**Purpose:** Consolidate every visual editor type, rationale, implementation status, and design rule into one perfected reference. No limits—all resources included.

---

## Table of Contents

1. [Prime Directive & Vision](#1-prime-directive--vision)
2. [Scope: All Pages, All Domains](#2-scope-all-pages-all-domains)
3. [Universal Visual Editor Types (10)](#3-universal-visual-editor-types-10)
4. [Ocean / Unified Wave Visual Editor Inventory](#4-ocean--unified-wave-visual-editor-inventory)
   - [4.1 Where the code lives (exact paths)](#41-where-the-code-lives-exact-paths)
   - [4.2 Rationale and functionality (deep dive)](#42-rationale-and-functionality-deep-dive)
5. [Connected Visual Editors Design](#5-connected-visual-editors-design)
6. [Three-Layer UI Architecture](#6-three-layer-ui-architecture)
7. [Design Principles & ROM Zones](#7-design-principles--rom-zones)
8. [Mandatory Components & Checklist](#8-mandatory-components--checklist)
9. [Component Hierarchy & File Structure](#9-component-hierarchy--file-structure)
10. [Implementation Status: OPUS vs Ocean](#10-implementation-status-opus-vs-ocean)
    - [10.1 Quick reference: Universal type → Ocean implementation file](#101-quick-reference-universal-type--ocean-implementation-file)
11. [References & Cross-Links](#11-references--cross-links)

---

## 1. Prime Directive & Vision

### The Prime Directive

**NEVER BUILD GENERIC SLIDER/INPUT SETTINGS PANELS.**

Every parameter control in OPUS ULTIMATE EARTH (and the Ocean/Unified Wave lineage) must be a **visual authoring instrument**: the user manipulates the actual visual representation, not abstract numbers.

### Why This Exists

This canon exists because Braden held the project to a higher standard. When implementations defaulted to basic number inputs and sliders, the standard became: **OPUS demands visual instruments—not generic controls.** The document codifies that so it is never forgotten.

### Vision in One Sentence

**Transform every complex parameter into intuitive visual manipulation:** see the physics → drag the shape → watch it respond.

### What's FORBIDDEN ❌

```tsx
// NEVER DO THIS
<input type="range" value={amplitude} onChange={...} />
<input type="number" value={steepness} onChange={...} />
<label>Amplitude</label>
```

### What's REQUIRED ✅

```tsx
// ALWAYS DO THIS – visual editor that shows the actual phenomenon
<ProfileEditor value={waveProfile} onChange={setWaveProfile} label="Wave Shape" romZones={WAVE_ROM_ZONES} />
// or
<WaveShapeEditor amplitude={amplitude} steepness={steepness} onAmplitudeChange={...} onSteepnessChange={...} />
```

### Creative Expression, Not Data Entry

When an artist adjusts wave amplitude by **dragging the wave peak**, they see what they're doing, feel the parameter, and understand the relationship (shape = setting). When they type "0.45" into a number box, they guess, wait, and struggle. **Visual editing is the minimum standard, not a luxury.**

---

## 2. Scope: All Pages, All Domains

This architecture applies to **every page** of OPUS ULTIMATE EARTH and to the Ocean/Unified Wave app family:

| Page / App | Primary visual editor use cases |
|------------|---------------------------------|
| **Water Editor** | Waves, caustics, foam, sphere physics, lighting, pool |
| **Earth Studio** | Atmosphere, stars, moon, clouds, terrain, volumetrics |
| **Procedural Planets** | Terrain, tectonics, mountains, biomes, erosion |
| **Vegetation Studio** | Trees, foliage, grass, distribution |
| **Geology Studio** | Rocks, boulders, erosion, terrain detail |
| **Wildlife** | Rigging, ROM, support polygon, animation |
| **Ocean / Unified Wave** | Wave shape, foam envelope, splash arc, buoyancy, breach zone, wind, caustics, bubbles, turbulence, material, sand ripples, Lucid 3D effects |

---

## 3. Universal Visual Editor Types (10)

These **10 universal types** are the canonical set. Every domain-specific editor (e.g. WaveShapeEditor, BreachZoneEditor) should map conceptually to one or a composition of these types.

| # | Type | Purpose | Key use cases across pages |
|---|------|---------|----------------------------|
| 1 | **GradientEditor** | Value varying across a range or dimension | Water depth color, foam falloff; sky gradient; altitude biome; density falloff; weight along limb |
| 2 | **CurveEditor** | Relationship between two variables, modulation over time | Wave amplitude falloff, foam curve; sun intensity vs time; erosion vs slope; branch taper; ROM falloff, easing |
| 3 | **PolarEditor / CompassEditor** | Direction (angle + optional magnitude) | Wind direction; sun azimuth; erosion direction; growth bias; facing direction |
| 4 | **ProfileEditor** | Cross-section shapes, silhouettes, waveforms | Wave shape, shore profile; mountain silhouette; ridge profile; trunk taper; erosion channel |
| 5 | **DistributionEditor / NoiseEditor** | Spatial patterns, density maps, procedural noise | Foam distribution; cloud/star density; biome boundaries; tree placement; rock scatter; cloud/terrain noise |
| 6 | **RangeEditor** | Min/max pairs with safety zones | Wave height range, foam threshold; altitude clamp; biome elevation; tree height; ROM limits |
| 7 | **HemisphereEditor** | Sky/celestial positioning (azimuth + altitude) | Sun/moon position; primary star; light direction |
| 8 | **ColorEditor** | Color with physical meaning (e.g. temperature) | Water absorption, foam tint; sky/atmosphere; biome/rock tints; leaf color |
| 9 | **LayerStackEditor** | Stacked effects, compositing, multi-layer systems | Wave layers, foam layers; atmosphere/cloud layers; terrain height layers; canopy/undergrowth |
| 10 | **NoiseEditor** | Procedural noise patterns, texture generation | Wave/foam turbulence; cloud/terrain noise; height/biome noise; distribution; rock surface, cracks |

### Universal Type → Domain Editor Mapping (Ocean/Unified)

| Universal type | Ocean/Unified wave examples |
|----------------|-----------------------------|
| ProfileEditor | WaveShapeEditor, SandRidgeProfileEditor, FoamEnvelopeEditor (envelope curve) |
| CurveEditor | CurveParameterEditor, BuoyancyCurveEditor, BounceAngleCurveEditor, SkimLiftCurveEditor |
| PolarEditor | WindDirectionEditor |
| HemisphereEditor | LightingOrbitalEditor (sun/moon on sky dome) |
| GradientEditor | GradientEditor (depth color, sky gradient), FoamColorEditor |
| RangeEditor | (Dual-handle sliders with ROM zones in any editor) |
| NoiseEditor | NoiseGeneratorEditor, TurbulencePatternEditor, VolumetricCloudEditor (FBM) |
| ColorEditor | Material color, directional color, physical Kelvin (ColorEditor) |
| LayerStackEditor | Gerstner stack, foam layers, cloud layers |
| Specialized (composition) | BreachZoneEditor (sphere + heatmap), SplashArcEditor (arc + physics), ForceBalanceEditor (vectors), CausticsPatternEditor (ray diagram) |

---

## 4. Ocean / Unified Wave Visual Editor Inventory

Consolidated from **VISUAL_EDITORS_MASTER_LIST** (Ocean Sim / water-showcase-unified lineage). Total: **49 editors** (44 complete, 5 planned in that codebase). These represent the vast docs and actual builds from the ocean/unified wave sim.

### Water Physics (16)

| Editor | Features / purpose | Status (in Ocean lineage) |
|--------|--------------------|----------------------------|
| WaveShapeEditor | Peak height, steepness, wavelength; direct manipulation of wave shape | ✅ Complete |
| FoamEnvelopeEditor | Decay curve, strength; bezier envelope | ✅ Complete |
| SplashArcEditor | Trajectory, speed, gravity; parabolic arc with drag points | ✅ Complete |
| BuoyancyCurveEditor | Submerged fraction → force curve; physics response | ✅ Complete |
| WindDirectionEditor | Compass, gust visualization; 360° direction | ✅ Complete |
| ForceBalanceEditor | 3D force vectors (gravity, buoyancy, drag) | ✅ Complete |
| BreachZoneEditor | Splash origin heatmap on sphere | ✅ Complete |
| PlaningSkimEnvelopeEditor | Planing gates, trajectory; 3-tab (planing/bounce/trajectory) | ✅ Complete |
| WetnessFlowEditor | Drip paths, accumulation, gravity flow | ✅ Complete |
| CausticsPatternEditor | Ray refraction, Snell's law, dispersion | ✅ Complete |
| VolumetricCloudEditor | Density curve, FBM preview, god rays | ✅ Complete |
| BubbleLifecycleEditor | Spawn, rise, pop lifecycle | ✅ Complete |
| TurbulencePatternEditor | Vector field, wall effects | ✅ Complete |
| MaterialPropertiesEditor | Fresnel curve, IOR refraction diagram | ✅ Complete |
| LightingOrbitalEditor | Sun position, color temp, shadows | ✅ Complete |
| WakePatternEditor | V-wake, Kelvin angle, spray | ✅ Complete |

### Sand Simulation (4)

| Editor | Features | Status |
|--------|----------|--------|
| SandRidgeProfileEditor | Cross-section height/wavelength, stoss/slip faces | ✅ Complete |
| SandGrainSparkleEditor | Sparkle, SSS | ✅ Complete |
| SandBranchingEditor | Y-junction, phase-slip, probability graph | ✅ Complete |
| SandWindFlowEditor | Wind direction + flow deformation preview | ✅ Complete |

### Curve-Based & Procedural (7)

| Editor | Features | Status |
|--------|----------|--------|
| SkimLiftCurveEditor | Lift/drag vs speed, physics visualization | ✅ Complete |
| CurveParameterEditor | Dynamic bezier parameters | ✅ Complete |
| BounceAngleCurveEditor | Speed-dependent bounce | ✅ Complete |
| SpringDamperEditor | Mass-spring-damper simulation | ✅ Complete |
| NoiseGeneratorEditor | Perlin, Simplex, Worley, FBM | ✅ Complete |
| GradientEditor | Linear, radial, conic color gradients | ✅ Complete |
| VisualEditorsShowcaseDrawer | Unified gallery of all editors | ✅ Complete |

### Lucid 3D Effects (17)

FireEffectEditor, ClothSimEditor, EnergyEffectEditor, SDFCombinerEditor, ExplosionEffectEditor, FluidSimEditor, AtmosphereEditor, RopeCableEditor, SoftBodyEditor, MagicEffectsEditor, TransformGizmoEditor, SDFBooleanEditor, SnapAlignEditor, ParticleTrailEditor, ScreenSpaceFluidEditor, UVMappingEditor, MeshMorphEditor — all ✅ Complete in that codebase.

### Hybrid / MLS-MPM (3)

| Editor | Purpose | Status |
|--------|---------|--------|
| MLSMPMParticleEditor | Particle physics, spawn patterns, stiffness/viscosity | ✅ Complete |
| CouplingZoneEditor | Zone placement, blend regions, auto-detection | ✅ Complete |
| FluidRenderEditor | Fluid color, Fresnel, absorption, specular | ✅ Complete |

### Rationale Behind Ocean/Unified Editors

- **Wave shape:** Users need to *see* the wave and drag peak/sides; amplitude/steepness/wavelength are derived.
- **Foam envelope:** Foam decay over time/lifecycle is a curve—bezier is the natural representation.
- **Splash arc:** Trajectory is spatial; editing an arc in 2D/3D views matches mental model.
- **Buoyancy curve:** Submerged fraction → force is a physical relationship; curve editor shows cause-effect.
- **Wind direction:** Compass matches real-world intuition; strength can be radius or separate slider.
- **Breach zone:** Where splash originates on the sphere is a 2D heatmap on a 3D object—direct manipulation.
- **ROM zones:** Every numeric range shows comfort (green), strain (yellow), danger (red) so users stay in safe operating envelope.

### 4.1 Where the code lives (exact paths)

**OPUS ULTIMATE EARTH** (universal types + showcase):

| Location | Contents |
|----------|----------|
| `ProEarth/GPTworking/opus-ultimate-earth/src/components/visualEditors/` | GradientEditor, CurveEditor, PolarEditor, HemisphereEditor, ProfileEditor, RangeEditor, ColorEditor, LayerStackEditor, NoiseEditor, WaveShapeEditor; base/VisualEditorBase.tsx |
| `ProEarth/GPTworking/opus-ultimate-earth/src/pages/VisualEditorShowcase.tsx` | Interactive demo of all 9 universal editors |
| `ProEarth/GPTworking/opus-ultimate-earth/src/components/drawers/` | Premium drawers (Wave, Lighting, Earth Studio, Procedural Planets, Vegetation, Geology, Wildlife) that consume the universal editors |

**Ocean / Unified Wave** (water-showcase-unified – actual builds with vast docs lineage):

| Location | Contents |
|----------|----------|
| `ProEarth/GPTworking/Pool_ocean/water-showcase-unified/src/components/visualEditors/` | **50+ editor components**: WaveShapeEditor, FoamEnvelopeEditor, SplashArcEditor, BuoyancyCurveEditor, WindDirectionEditor, ForceBalanceEditor, BreachZoneEditor, PlaningSkimEnvelopeEditor, WetnessFlowEditor, CausticsPatternEditor, VolumetricCloudEditor, BubbleLifecycleEditor, TurbulencePatternEditor, MaterialPropertiesEditor, LightingOrbitalEditor, WakePatternEditor; SandRidgeProfileEditor, SandGrainSparkleEditor, SandBranchingEditor, SandWindFlowEditor; CurveParameterEditor, BounceAngleCurveEditor, SkimLiftCurveEditor, SpringDamperEditor, NoiseGeneratorEditor, GradientEditor; FireEffectEditor, ClothSimEditor, AtmosphereEditor, RopeCableEditor, SoftBodyEditor, MagicEffectsEditor, TransformGizmoEditor, SDFBooleanEditor, SnapAlignEditor, ParticleTrailEditor, ScreenSpaceFluidEditor, UVMappingEditor, MeshMorphEditor, EnergyEffectEditor, ExplosionEffectEditor, FluidSimEditor, SDFCombinerEditor; MLSMPMParticleEditor, CouplingZoneEditor, FluidRenderEditor; VisualEditorStack |
| `ProEarth/GPTworking/Pool_ocean/water-showcase-unified/src/components/drawers/` | VisualEditorsDrawer, VisualEditorsShowcaseDrawer, WaveSettingsDrawer, FoamSettingsDrawer, SpherePhysicsDrawer, SplashSettingsDrawer, CausticsSettingsDrawer, LightingSettingsDrawer, HybridOceanDrawer, LeftGraphDrawer, etc. |
| `ProEarth/GPTworking/Pool_ocean/water-showcase-unified/Documentation/` | VISUAL_EDITORS_MASTER_LIST.md, CONNECTED_VISUAL_EDITORS_DESIGN.md |

**Oceansim docs (encyclopedia & monoliths):**

| Location | Contents |
|----------|----------|
| `oceansim/docs/VISUAL_EDITORS_MASTER_LIST.md` | 49 editors, WebGPU/MLS-MPM/Hybrid Breaker, status, design principles |
| `oceansim/docs/CONNECTED_VISUAL_EDITORS_DESIGN.md` | Node graph + visual editors, connection types, layout modes |
| `oceansim/docs/ENCYCLOPEDIA/sources/oceansim_app_docs/SETTINGS_ARCHITECTURE.md` | Settings categorization; sliders vs visual (bezier/diagram) editors |
| `oceansim/docs/codebase/OPUS_WAVES_CODEBASE_MONOLITH.md` | Codebase monolith reference for wave/opus-waves systems |

### 4.2 Rationale and functionality (deep dive)

**Water physics (16 editors).** These editors exist because wave, foam, splash, and sphere behavior are *spatial and temporal*: users think in terms of shape, trajectory, and force balance, not raw numbers. WaveShapeEditor lets artists drag the wave peak and flanks so amplitude and wavelength emerge from the gesture. FoamEnvelopeEditor encodes foam decay as a bezier curve so “how much foam over time” is visible and editable. SplashArcEditor shows the parabolic arc of spray so gravity, speed, and spread are manipulated in the same space where the effect appears. BuoyancyCurveEditor plots submerged fraction vs force so physics-inclined users see cause–effect; WindDirectionEditor uses a compass so direction and strength match real-world intuition. BreachZoneEditor puts a heatmap on the sphere so “where splash comes from” is direct manipulation. ROM zones (comfort/strain/danger) keep users inside safe operating envelopes without trial-and-error.

**Sand simulation (4 editors).** Sand ripples have ridge profiles, branching patterns, sparkle, and wind-driven flow. SandRidgeProfileEditor exposes cross-section shape (stoss/slip faces) so ridge geometry is visual. SandBranchingEditor shows Y-junctions and phase-slip so branching logic is inspectable. SandGrainSparkleEditor and SandWindFlowEditor tie appearance and transport to the same visual language as water (curves, direction, distribution).

**Curve-based & procedural (7 editors).** Many parameters are *relationships*, not scalars: bounce angle vs speed, skim lift vs velocity, spring–damper response. CurveParameterEditor, BounceAngleCurveEditor, SkimLiftCurveEditor, and SpringDamperEditor make these relationships editable as curves with immediate feedback. NoiseGeneratorEditor and GradientEditor provide procedural and color gradients used across water, foam, clouds, and terrain. VisualEditorsShowcaseDrawer is the unified gallery that exposes all editors in one place for discovery and consistency.

**Lucid 3D effects (17 editors).** Fire, cloth, rope, soft body, SDF, particles, transform, UV, mesh morph, etc. Each editor maps a domain (e.g. cloth pins and wind, SDF boolean ops) to direct manipulation and live preview so artists tune effects in the same mental space as the result. They share the same design language: draggable handles, ROM feedback where applicable, and no “apply” for basic edits.

**Hybrid MLS-MPM (3 editors).** MLSMPMParticleEditor, CouplingZoneEditor, and FluidRenderEditor support the hybrid heightfield + particle breaker system. They control particle behavior, near-field/far-field coupling zones, and fluid rendering (Fresnel, absorption, specular) so the entire pipeline is tunable through visual instruments rather than raw parameters.

---

## 5. Connected Visual Editors Design

From **CONNECTED_VISUAL_EDITORS_DESIGN**: unified system where **node graph (left)** and **visual editors (right)** work together; selecting nodes surfaces 2–3 connected editors; editing one updates connected parameters in real time.

### Connection Types

| Type | Meaning | Visual |
|------|---------|--------|
| **drives** | A directly controls B (e.g. wind → waves) | ──────▶ |
| **modulates** | A scales/modifies B (e.g. wetness → drip rate) | ─ ─ ─ ▶ |
| **gates** | A enables/disables B (e.g. wind > 0 → whitecaps) | ━━━━━▶ |
| **couples** | A and B affect each other (e.g. buoyancy ↔ drag) | ◀──────▶ |
| **sequences** | A happens before B (e.g. splash → foam → dissipate) | ●────● |
| **blends** | A and B combine into C (e.g. multiple waves → height) | blend |

### Layout Modes

1. **Cascade (default):** Editor 1 (input) → Editor 2 (process) → Editor 3 (output).
2. **Orthogonal (3D params):** Top / Front / Side / 3D view—drag in any view updates all.
3. **Envelope (time-based):** Spawn → Rise → Pop (or similar lifecycle) with unified timeline.
4. **Relationship (bidirectional):** Two editors linked (e.g. Buoyancy ↔ Drag) with equilibrium readout.

### Node Graph → Editor Selection

When user selects a node in the left drawer graph, the right drawer shows:

- **Primary:** Editor for the selected node.
- **Upstream:** Editor for the most influential input (one dependency).
- **Downstream:** Editor for the most affected output (one dependent).

Capped at 2–3 editors visible at once to avoid clutter.

---

## 6. Three-Layer UI Architecture

Every settings drawer in OPUS ULTIMATE EARTH follows this structure (from **OPUS_VISUAL_SETTINGS_CANON**).

### Layer 1: Right icon bar (main category)

- Icons: Waves, Caustics, Lighting, Engine, etc. (page-specific).
- Click opens the drawer for that category.

### Layer 2: Drawer header icon bar (sub-category)

- Example (Waves): [Gerstner] [Procedural] [Wind] [Whitecaps].
- Click shows the visual editor for that sub-category.

### Layer 3: Visual editor (primary interface)

- **Primary content** is the visual editor (gradient, curve, profile, hemisphere, etc.).
- No "Apply" for basic changes—live preview.
- ROM zone feedback (comfort/strain/danger) where applicable.

### Layer 4: Advanced numeric (collapsible, hidden by default)

- ▼ Advanced Settings [collapsed by default].
- Numeric inputs only for edge cases and power users.

### Footer

- Short hint, e.g. "Drag shapes directly · Changes sync live".

---

## 7. Design Principles & ROM Zones

### Direct Manipulation

Users drag **the actual thing**: wave shape, gradient stops, sun on hemisphere, distribution paint—not abstract handles disconnected from the phenomenon.

### ROM Zones (Range of Motion)

Every numeric range should show:

- **Green (Comfort):** Values that work well.
- **Yellow (Strain):** Values that work but may cause issues.
- **Red (Danger):** Values that will break or destabilize.

Editors receive optional `romZones: ROMZone[]` (start, end, type, label) and render background bands + optional legend.

### Live Preview

Every change must immediately reflect in:

- The mini-preview inside the editor.
- The main viewport when applicable.
- No "Apply" for basic edits.

### Context-Aware Labels

Axis labels, units, and presets match the domain: e.g. "Amplitude (m)", "Period (s)" for waves; "Temperature (K)" for lighting; "Height (m)", "Slope (°)" for terrain.

### Presets + Custom

- Physical presets (real-world values).
- Artistic presets (stylized looks).
- Custom with full control.
- Save custom as new preset where applicable.

### Keyboard & Mouse

- Drag = coarse; Shift+Drag = fine.
- Double-click = reset to default.
- Arrow keys = nudge; Tab into field = type exact value.

### Technical Interface (shared)

```typescript
interface VisualEditorProps<T> {
  value: T;
  onChange: (value: T) => void;
  onPreview?: (value: T) => void;
  disabled?: boolean;
  compact?: boolean;  // drawer vs full panel
  label?: string;
  helpText?: string;
  romZones?: ROMZone[];
  presets?: EditorPreset[];
}
```

---

## 8. Mandatory Components & Checklist

Every visual editor **must** include:

1. **Draggable control points** (or equivalent direct manipulation)—adequate hit targets (e.g. 8–10px), cursor feedback (grab/grabbing).
2. **ROM zone feedback** for bounded parameters (color bands or legend: Comfort / Strain / Danger).
3. **Live value display** (current values at control points or in a footer).
4. **Help/hint text** (e.g. "Drag peak = amplitude; drag sides = wavelength").

Before shipping any new settings panel:

- [ ] Layer 1: Opens from right icon bar?
- [ ] Layer 2: Icon sub-navigation in drawer header?
- [ ] Layer 3: Visual editor as **primary** interface?
- [ ] Draggable: Can users drag to adjust?
- [ ] ROM zones: Color feedback for safety where applicable?
- [ ] Live values: Current values displayed?
- [ ] Help text: Drag instructions shown?
- [ ] Layer 4: Numeric inputs hidden by default?
- [ ] Styling: Consistent dark theme (e.g. #0a0a15, #1a1a2e)?

**If any of these are missing, the panel is not complete.**

---

## 9. Component Hierarchy & File Structure

### Hierarchy

```
VisualEditor (base)
├── GradientEditor
├── CurveEditor
├── PolarEditor
│   └── HemisphereEditor (variant)
├── ProfileEditor
├── DistributionEditor  (often implemented as NoiseEditor + threshold)
├── RangeEditor
├── ColorEditor
├── LayerStackEditor
└── NoiseEditor
```

Domain-specific editors (WaveShapeEditor, BreachZoneEditor, etc.) are **compositions** or **specializations** of these types for a given app (e.g. Ocean/Unified Wave).

### OPUS ULTIMATE EARTH file structure (current)

```
src/components/visualEditors/
├── index.ts
├── base/
│   └── VisualEditorBase.tsx
├── gradient/
│   └── GradientEditor.tsx
├── CurveEditor.tsx
├── polar/
│   └── PolarEditor.tsx
├── hemisphere/
│   └── HemisphereEditor.tsx
├── profile/
│   └── ProfileEditor.tsx
├── range/
│   └── RangeEditor.tsx
├── color/
│   └── ColorEditor.tsx
├── layers/
│   └── LayerStackEditor.tsx
├── noise/
│   └── NoiseEditor.tsx
└── WaveShapeEditor.tsx
```

---

## 10. Implementation Status: OPUS vs Ocean

### OPUS ULTIMATE EARTH (opus-ultimate-earth)

| Universal type | Component | Status |
|----------------|-----------|--------|
| GradientEditor | GradientEditor | ✅ Complete |
| CurveEditor | CurveEditor | ✅ Complete |
| PolarEditor | PolarEditor | ✅ Complete |
| HemisphereEditor | HemisphereEditor | ✅ Complete |
| ProfileEditor | ProfileEditor | ✅ Complete |
| RangeEditor | RangeEditor | ✅ Complete |
| ColorEditor | ColorEditor | ✅ Complete (Kelvin support) |
| LayerStackEditor | LayerStackEditor | ✅ Complete |
| NoiseEditor | NoiseEditor | ✅ Complete |
| Wave shape (domain) | WaveShapeEditor | ✅ Present (legacy/specialized) |

**Premium drawers using these:** WaveSettingsDrawerPremium, LightingSettingsDrawerPremium; Earth Studio (Atmosphere, Stars, Moon, Clouds); Procedural Planets (Terrain, Biomes, etc.); Vegetation, Geology, Wildlife drawers. **VisualEditorShowcase** page demos all 9 universal editors.

### Ocean / Unified Wave (water-showcase-unified, oceansim)

- **49 editors** in master list: 44 complete, 5 planned.
- Includes Water Physics (16), Sand (4), Curve-Based (7), Lucid 3D (17), Hybrid MLS-MPM (3).
- Full-screen simulation pages (Fluid, Cloth, Combined) and Hybrid Breaker system with dedicated editors.
- **Reference code:** `oceansim/water-showcase-unified`, `oceansim/copyunifiedwaves/water-showcase-unified`, `ProEarth/GPTworking/Pool_ocean/water-showcase-unified`.

### Convergence

- OPUS ULTIMATE EARTH standardizes on the **10 universal types** and uses them across all six pages.
- Ocean/Unified Wave provides the **detailed inventory and rationale** for 49 domain editors; when porting or adding new drawers, map each to the universal type(s) and follow this canon.

### 10.1 Quick reference: Universal type → Ocean implementation file

When porting from Ocean/Unified Wave to OPUS or adding a new domain editor, use this mapping. Each Ocean editor is a **concrete implementation** of one or more universal types.

| Universal type | Ocean/Unified Wave component (file in `.../visualEditors/`) |
|----------------|----------------------------------------------------------------|
| **ProfileEditor** | WaveShapeEditor.tsx, FoamEnvelopeEditor.tsx (envelope curve), SandRidgeProfileEditor.tsx |
| **CurveEditor** | CurveParameterEditor.tsx, BuoyancyCurveEditor.tsx, BounceAngleCurveEditor.tsx, SkimLiftCurveEditor.tsx, SpringDamperEditor.tsx |
| **PolarEditor** | WindDirectionEditor.tsx |
| **HemisphereEditor** | LightingOrbitalEditor.tsx |
| **GradientEditor** | GradientEditor.tsx |
| **RangeEditor** | (Dual-handle + ROM zones used inside other editors) |
| **NoiseEditor** | NoiseGeneratorEditor.tsx, TurbulencePatternEditor.tsx, VolumetricCloudEditor.tsx (FBM) |
| **ColorEditor** | (Material color, Kelvin in LightingOrbitalEditor; dedicated in OPUS) |
| **LayerStackEditor** | (Gerstner/foam layers in drawers; dedicated in OPUS) |
| **Specialized (composition)** | BreachZoneEditor.tsx, SplashArcEditor.tsx, ForceBalanceEditor.tsx, CausticsPatternEditor.tsx, PlaningSkimEnvelopeEditor.tsx, WetnessFlowEditor.tsx, BubbleLifecycleEditor.tsx, MaterialPropertiesEditor.tsx, WakePatternEditor.tsx; MLSMPMParticleEditor.tsx, CouplingZoneEditor.tsx, FluidRenderEditor.tsx |

---

## 11. References & Cross-Links

| Document | Location | Role |
|----------|----------|------|
| **OPUS Visual Editor Architecture** | `earthdocs/OPUS_VISUAL_EDITOR_ARCHITECTURE.md` | Master design for 10 universal types, scope, implementation status (OPUS). |
| **OPUS Visual Settings Canon** | `earthdocs/OPUS_VISUAL_SETTINGS_CANON.md` | Prime directive, three-layer architecture, forbidden/required, mandatory components. |
| **VISUAL_EDITORS_MASTER_LIST** | `oceansim/docs/VISUAL_EDITORS_MASTER_LIST.md`, `ProEarth/GPTworking/Pool_ocean/water-showcase-unified/Documentation/VISUAL_EDITORS_MASTER_LIST.md` | 49 editors (water/sand/Lucid 3D/curve/hybrid), WebGPU/MLS-MPM/Hybrid Breaker, status, design principles. |
| **CONNECTED_VISUAL_EDITORS_DESIGN** | `ProEarth/GPTworking/Pool_ocean/water-showcase-unified/Documentation/CONNECTED_VISUAL_EDITORS_DESIGN.md`, `oceansim/docs/CONNECTED_VISUAL_EDITORS_DESIGN.md` | Node graph + visual editors, cascade/orthogonal/envelope/relationship, connection types, layout modes. |
| **SETTINGS_ARCHITECTURE** | `oceansim/docs/ENCYCLOPEDIA/sources/oceansim_app_docs/SETTINGS_ARCHITECTURE.md` | Settings categorization; basic sliders vs advanced bezier/diagram (visual) editors. |
| **OPUS WAVES / Codebase monoliths** | `oceansim/docs/codebase/OPUS_WAVES_CODEBASE_MONOLITH.md`, `oceansim/docs/ENCYCLOPEDIA/sources/codebase/OPUS_WAVES_CODEBASE_MONOLITH.md` | Wave/opus-waves codebase reference. |
| **OPUS ULTIMATE EARTH Doc Index** | `earthdocs/OPUS_ULTIMATE_EARTH_DOC_INDEX.md` | Index entry for Visual Editor Architecture and this canon. |
| **OPUS ULTIMATE EARTH Master Plan** | `earthdocs/OPUS_ULTIMATE_EARTH_MASTER_PLAN.md` | Right drawer per page, data flow, LOD, tech stack. |

---

**This canon is the single consolidated reference for visual editor design, rationale, and implementation across OPUS ULTIMATE EARTH and the Ocean/Unified Wave lineage. Use it to align all new and existing visual editors to one standard.**

*Canon v1.1 · 2026-01-31 · Code locations, rationale deep dive, Universal→Ocean mapping; all resources consolidated.*
