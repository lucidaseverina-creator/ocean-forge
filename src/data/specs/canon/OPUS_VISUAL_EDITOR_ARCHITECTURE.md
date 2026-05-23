# OPUS Visual Editor Architecture

**Author:** Opus (Claude 4.5)  
**Status:** 🎯 **CANONICAL ARCHITECTURE** - Master design for all visual editors across OPUS ULTIMATE EARTH  
**Date:** 2025-01-31  
**Supersedes:** Previous canon (this is the comprehensive version)

---

## 🎯 THE PRIME DIRECTIVE (Unchanged)

**NEVER BUILD GENERIC SLIDER/INPUT SETTINGS PANELS**

Every parameter control in OPUS ULTIMATE EARTH must be a **visual authoring instrument** where the user manipulates the actual visual representation, not abstract numbers.

---

## 🌍 SCOPE: ALL PAGES, ALL DOMAINS

This architecture applies to:
- **Water Editor** - Waves, Caustics, Foam, Lighting
- **Earth Studio** - Atmosphere, Stars, Moon, Clouds, Terrain, Volumetrics
- **Procedural Planets** - Terrain, Tectonics, Mountains, Biomes, Erosion
- **Vegetation Studio** - Trees, Foliage, Grass, Distribution
- **Geology Studio** - Rocks, Boulders, Terrain detail
- **Wildlife** - Rigging, ROM, Balance, Animation

---

## 🏗️ UNIVERSAL VISUAL EDITOR TYPES

### 1. GradientEditor
**For:** Any value that varies across a range or dimension

**Use cases across pages:**
| Page | Use Case |
|------|----------|
| Water | Water depth color, foam falloff |
| Earth Studio | Sky gradient (horizon→zenith), atmosphere density |
| Procedural Planets | Altitude-based biome, terrain coloring |
| Vegetation | Density falloff from center |
| Wildlife | Weight distribution along limb |

**Design:**
```
┌─────────────────────────────────────────────────────┐
│  ◀━━━━●━━━━━━━●━━━━━━━━━━━●━━━━━━━▶                 │
│       ↑       ↑           ↑                         │
│    Draggable color stops (click to edit color)     │
│                                                     │
│  [Preview bar showing interpolated gradient]        │
│                                                     │
│  Mode: [Linear ▼]  Steps: [∞]  Space: [RGB ▼]      │
└─────────────────────────────────────────────────────┘
```

**Features:**
- Unlimited color/value stops
- Draggable stop positions
- Click stop to edit (color picker or value)
- Interpolation modes: Linear, Smooth, Stepped
- Color space: RGB, HSL, LAB, Oklab
- Live preview in context

---

### 2. CurveEditor (Enhanced)
**For:** Any relationship between two variables, modulation over time

**Use cases:**
| Page | Use Case |
|------|----------|
| Water | Wave amplitude over distance, foam intensity curve |
| Earth Studio | Sun intensity over time-of-day, atmospheric scattering |
| Procedural Planets | Erosion strength vs slope, mountain height distribution |
| Vegetation | Branch taper curve, leaf density vs height |
| Wildlife | ROM falloff curve, animation easing |

**Design:**
```
┌─────────────────────────────────────────────────────┐
│ Y ↑                                                 │
│   │            ●━━━━━━●                            │
│   │         ╱           ╲                          │
│   │       ●               ●                        │
│   │     ╱                   ╲                      │
│   │   ●                       ●━━━━●               │
│   └──────────────────────────────────────────▶ X   │
│                                                     │
│  Type: [Bezier ▼]  Presets: [⌇ ⌒ ⌓ ⎰]             │
│                                                     │
│  X: [0.00 - 1.00]  Y: [0.00 - 1.00]               │
└─────────────────────────────────────────────────────┘
```

**Features:**
- Draggable control points
- Bezier handles for smooth curves
- Presets: Linear, EaseIn, EaseOut, Sigmoid, Step, Custom
- Grid snap option
- Axis labels customizable per context
- ROM zones (background color bands)

---

### 3. PolarEditor / CompassEditor
**For:** Directional parameters (angle + magnitude)

**Use cases:**
| Page | Use Case |
|------|----------|
| Water | Wind direction, wave propagation direction |
| Earth Studio | Sun azimuth, prevailing wind |
| Procedural Planets | Erosion direction, tectonic plate movement |
| Vegetation | Growth direction bias, wind sway |
| Wildlife | Facing direction, limb rotation axis |

**Design (Compass Rose):**
```
┌─────────────────────────────────────────────────────┐
│                     N                               │
│                     │                               │
│            NW ──────┼────── NE                      │
│                    ╱│╲                              │
│           W ───── ●━━━━━━━▶────── E                │
│                    ╲│╱   ↑                          │
│            SW ──────┼────── SE                      │
│                     │     Drag to set              │
│                     S     direction + strength     │
│                                                     │
│  Direction: 45° NE    Strength: 0.75               │
└─────────────────────────────────────────────────────┘
```

**Design (Hemisphere for sky):**
```
┌─────────────────────────────────────────────────────┐
│                    ╭───────╮                        │
│                 ╱             ╲                     │
│               ╱       ☀        ╲                   │
│              │    ╱       ╲     │                  │
│             │   ╱   path    ╲   │                  │
│             │  ╱    arc      ╲  │                  │
│              ╲─────────────────╱                    │
│                ╲             ╱                      │
│                  ╲─────────╱                        │
│                     horizon                         │
│                                                     │
│  Azimuth: 135°    Altitude: 45°    Time: 14:30    │
└─────────────────────────────────────────────────────┘
```

**Features:**
- Direct drag on compass or hemisphere
- Optional magnitude/strength (distance from center)
- Numeric readout (degrees, cardinal direction)
- Path visualization for sun/moon
- Time-linked animation preview

---

### 4. ProfileEditor
**For:** Cross-section shapes, silhouettes, waveforms

**Use cases:**
| Page | Use Case |
|------|----------|
| Water | Wave shape (amplitude/steepness), shore profile |
| Earth Studio | Mountain silhouette, terrain cross-section |
| Procedural Planets | Tectonic ridge profile, crater rim shape |
| Vegetation | Tree trunk taper, branch curve |
| Geology | Erosion channel profile, boulder shape |

**Design:**
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│         ╭──●──╮                                    │
│        ╱      ╲                                    │
│       ╱        ╲         Drag profile points      │
│   ●──╱          ╲──●     to reshape               │
│     ╱            ╲                                 │
│────╱──────────────╲────  Baseline (draggable)     │
│                                                     │
│  Symmetry: [Mirror ▼]  Points: 5  Smooth: [On]    │
└─────────────────────────────────────────────────────┘
```

**Features:**
- Draggable profile points
- Symmetry modes: None, Mirror, Radial
- Smooth vs sharp corners
- Live 3D preview of profile swept/extruded
- Baseline adjustment

---

### 5. DistributionEditor
**For:** Spatial patterns, density maps, scatter placement

**Use cases:**
| Page | Use Case |
|------|----------|
| Water | Foam distribution, caustics pattern |
| Earth Studio | Cloud coverage pattern, star density |
| Procedural Planets | Vegetation zones, biome boundaries |
| Vegetation | Tree placement density, grass patches |
| Geology | Rock scatter, erosion patterns |

**Design:**
```
┌─────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────┐           │
│  │ ░░▒▒▒▓▓▓▓▓▓▓▓▓▓▓▓▒▒▒░░░░░░░░░░░░░ │           │
│  │ ░▒▒▒▓▓████████████▓▓▒▒░░░░░░░░░░░ │           │
│  │ ▒▒▓▓███████████████▓▓▒░░░░░░░░░░░ │  2D noise │
│  │ ▒▓▓████████████████▓▓▒░░░░░░░░░░░ │  preview  │
│  │ ░▒▓▓██████████████▓▓▒░░░░░░░░░░░░ │           │
│  │ ░░▒▓▓████████████▓▓▒░░░░░░░░░░░░░ │           │
│  └─────────────────────────────────────┘           │
│                                                     │
│  Octaves: [4]  Frequency: [2.0]  Lacunarity: [2.1] │
│  Seed: [42]  [Regenerate]                          │
│                                                     │
│  Threshold: ◀━━━━━━●━━━━━▶  [0.35]                │
└─────────────────────────────────────────────────────┘
```

**Features:**
- Real-time noise preview
- Adjustable octaves, frequency, amplitude
- Threshold slider with preview
- Seed control with regenerate button
- Paint mode for manual override
- Multiple noise types: Perlin, Simplex, Worley, Voronoi

---

### 6. RangeEditor
**For:** Min/max value pairs with safety zones

**Use cases:**
| Page | Use Case |
|------|----------|
| Water | Wave height min/max, foam threshold range |
| Earth Studio | Altitude clamp, temperature range |
| Procedural Planets | Biome elevation range, erosion bounds |
| Vegetation | Tree height range, density bounds |
| Wildlife | ROM limits, joint angle constraints |

**Design:**
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│   ┌──────┬──────────────────────┬──────┐           │
│   │██████│                      │██████│           │
│   │DANGER│       COMFORT        │DANGER│           │
│   │██████│                      │██████│           │
│   └──────┴──────────────────────┴──────┘           │
│         ▲                        ▲                  │
│         │                        │                  │
│        MIN                      MAX                 │
│       [0.2]                    [0.8]                │
│                                                     │
│   Drag handles to set range. Red zones = danger.   │
└─────────────────────────────────────────────────────┘
```

**Features:**
- Dual handle slider
- ROM zone visualization (comfort/strain/danger)
- Color-coded background
- Live value readout
- Optional center marker
- Snap to presets

---

### 7. HemisphereEditor
**For:** Sky positioning (sun, moon, stars), light direction

**Use cases:**
| Page | Use Case |
|------|----------|
| Water | Light source direction |
| Earth Studio | Sun/moon position, celestial objects |
| Procedural Planets | Primary star position, multiple suns |
| Wildlife | Light direction for rendering preview |

**(See PolarEditor hemisphere variant above)**

Additional features:
- Day/night arc visualization
- Multiple celestial bodies
- Time scrubber that animates position
- Horizon line with cardinal directions

---

### 8. ColorEditor (Advanced)
**For:** Color selection with physical meaning

**Use cases:**
| Page | Use Case |
|------|----------|
| Water | Water absorption color, foam tint |
| Earth Studio | Sky color, atmosphere tint, ambient light |
| Procedural Planets | Biome base colors, rock tints |
| Vegetation | Leaf color seasonal range |

**Design:**
```
┌─────────────────────────────────────────────────────┐
│  ┌─────────────────┐  Temperature (Kelvin)         │
│  │                 │  ──●────────────────          │
│  │   Color Well    │  2700K (warm) ──→ 6500K (day) │
│  │                 │                               │
│  └─────────────────┘  Atmosphere: [Clear ▼]        │
│                                                     │
│  Mode: [Physical ▼] [Artistic ▼]                   │
│                                                     │
│  Presets:                                           │
│  [Sunrise] [Noon] [Sunset] [Twilight] [Night]      │
│  [Ocean] [Forest] [Desert] [Snow]                  │
│                                                     │
│  H: 210°  S: 80%  L: 45%   |   #2E8BC0             │
└─────────────────────────────────────────────────────┘
```

**Features:**
- Temperature-based selection (Kelvin scale)
- Atmosphere simulation (how color looks through air)
- Physical presets (real-world light conditions)
- Multiple color space views
- Harmony suggestions
- History/favorites

---

### 9. LayerStackEditor
**For:** Stacked effects, compositing, multi-layer systems

**Use cases:**
| Page | Use Case |
|------|----------|
| Water | Wave layer composition, foam layers |
| Earth Studio | Atmosphere layers, cloud layers |
| Procedural Planets | Terrain height layers, biome overlays |
| Vegetation | Canopy layers, undergrowth layers |

**Design:**
```
┌─────────────────────────────────────────────────────┐
│  Layers                              [+ Add Layer]  │
│  ───────────────────────────────────────────────── │
│  ☰ ▣ [Gerstner Primary]      ●━━━━━━━ [Solo] [⚙]  │
│  ☰ ◻ [Procedural Detail]     ●━━━━━━━ [Solo] [⚙]  │
│  ☰ ▣ [Wind Ripples]          ●━━━━━ [Solo] [⚙]    │
│  ☰ ▣ [Foam Overlay]          ●━━━ [Solo] [⚙]      │
│  ───────────────────────────────────────────────── │
│  ↕ Drag to reorder    ▣ Visible    ● Opacity      │
│                                                     │
│  Blend: [Additive ▼]   Master: ●━━━━━━━━━━        │
└─────────────────────────────────────────────────────┘
```

**Features:**
- Drag to reorder layers
- Per-layer visibility toggle
- Per-layer opacity
- Solo mode (isolate single layer)
- Expand layer for sub-editor
- Blend mode selection
- Add/remove layers

---

### 10. NoiseEditor
**For:** Procedural noise patterns, texture generation

**Use cases:**
| Page | Use Case |
|------|----------|
| Water | Wave noise, foam turbulence |
| Earth Studio | Cloud noise, terrain noise |
| Procedural Planets | Height noise, biome boundaries |
| Vegetation | Distribution noise, growth variation |
| Geology | Rock surface noise, crack patterns |

**Design:**
```
┌─────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────┐           │
│  │                                     │           │
│  │       2D Noise Preview              │           │
│  │       (real-time GPU)               │           │
│  │                                     │           │
│  └─────────────────────────────────────┘           │
│                                                     │
│  Type: [FBM ▼]  [Perlin] [Simplex] [Worley]        │
│                                                     │
│  Octaves    ●━━━━━━━━━━━━━━  [6]                   │
│  Frequency  ●━━━━━━━━━━━━━━  [4.0]                 │
│  Amplitude  ●━━━━━━━━━━━━━━  [1.0]                 │
│  Lacunarity ●━━━━━━━━━━━━━━  [2.0]                 │
│  Gain       ●━━━━━━━━━━━━━━  [0.5]                 │
│                                                     │
│  Seed: [42]  [🎲 Randomize]                        │
└─────────────────────────────────────────────────────┘
```

**Features:**
- Real-time 2D preview (GPU-accelerated)
- Multiple noise types
- FBM (Fractal Brownian Motion) controls
- Domain warping option
- Seed with randomize button
- Export as texture

---

## 🎨 VISUAL EDITOR DESIGN PRINCIPLES

### 1. Direct Manipulation
Users should drag **the actual thing**, not abstract handles:
- For waves → drag the wave shape
- For gradients → drag color stops on the gradient
- For sun position → drag the sun on the hemisphere
- For distribution → paint directly on the pattern

### 2. ROM Zones (Range of Motion)
Every numeric range should show safety/optimal zones:
- **Green (Comfort):** Values that work well
- **Yellow (Strain):** Values that work but may cause issues
- **Red (Danger):** Values that will break things

### 3. Live Preview
Every change should immediately reflect in:
- The mini-preview within the editor
- The main viewport (where applicable)
- No "Apply" buttons for basic changes

### 4. Context-Aware Labels
Axis labels, units, and presets should match the domain:
- Water wave editor: "Amplitude (m)", "Period (s)"
- Lighting: "Temperature (K)", "Intensity (lux)"
- Terrain: "Height (m)", "Slope (°)"

### 5. Presets + Custom
Every editor should have:
- Physical presets (real-world values)
- Artistic presets (stylized looks)
- Custom with full control
- Save custom as new preset

### 6. Keyboard + Mouse
- Drag for coarse adjustment
- Shift+Drag for fine adjustment
- Double-click to reset to default
- Arrow keys for precise nudging
- Type exact value with Tab into field

---

## 📐 COMPONENT HIERARCHY

```
VisualEditor (base class)
├── GradientEditor
├── CurveEditor
├── PolarEditor
│   └── HemisphereEditor (variant)
├── ProfileEditor
├── DistributionEditor
├── RangeEditor
├── ColorEditor
├── LayerStackEditor
└── NoiseEditor
```

Each editor:
- Extends base `VisualEditor` component
- Implements common props: `value`, `onChange`, `disabled`, `label`
- Has ROM zone support via `romZones` prop
- Has preset support via `presets` prop
- Has help text via `helpText` prop

---

## 🗂️ FILE STRUCTURE

```
src/components/visualEditors/
├── index.ts                    # Exports all editors
├── base/
│   ├── VisualEditorBase.tsx   # Base component
│   ├── ROMZones.tsx           # ROM zone renderer
│   └── EditorPresets.tsx      # Preset selector
├── gradient/
│   └── GradientEditor.tsx
├── curve/
│   └── CurveEditor.tsx        # (already created, enhance)
├── polar/
│   ├── PolarEditor.tsx        # Compass rose
│   └── HemisphereEditor.tsx   # Sky dome
├── profile/
│   └── ProfileEditor.tsx
├── distribution/
│   └── DistributionEditor.tsx
├── range/
│   └── RangeEditor.tsx
├── color/
│   └── ColorEditor.tsx
├── layers/
│   └── LayerStackEditor.tsx
└── noise/
    └── NoiseEditor.tsx
```

---

## 🔄 INTEGRATION WITH SETTINGS DRAWERS

Each settings drawer uses these editors based on parameter type:

### Example: WaveSettingsDrawer

```tsx
<WaveSettingsDrawer>
  {/* Header icon bar for wave type selection */}
  <IconBar>
    <IconButton icon="🌊" panel="gerstner" />
    <IconButton icon="🌀" panel="procedural" />
    <IconButton icon="🌬️" panel="wind" />
  </IconBar>

  {/* Primary visual editors */}
  <ProfileEditor 
    value={waveProfile}
    onChange={setWaveProfile}
    label="Wave Shape"
    romZones={WAVE_ROM_ZONES}
  />
  
  <PolarEditor
    value={windDirection}
    onChange={setWindDirection}
    label="Wind Direction"
  />
  
  <CurveEditor
    value={amplitudeCurve}
    onChange={setAmplitudeCurve}
    label="Amplitude Falloff"
    xLabel="Distance (m)"
    yLabel="Amplitude"
  />

  {/* Collapsible advanced section */}
  <Collapsible title="Advanced Numeric" defaultOpen={false}>
    {/* Traditional inputs for power users */}
  </Collapsible>
</WaveSettingsDrawer>
```

---

## 📋 IMPLEMENTATION STATUS

### Phase 1: Core Editors ✅ COMPLETE
1. **CurveEditor** ✅ Complete - Bezier curves for modulation
2. **ProfileEditor** ✅ Complete - Cross-section shapes, waveforms
3. **GradientEditor** ✅ Complete - Color/value gradients with stops
4. **PolarEditor** ✅ Complete - Compass rose for direction

### Phase 2: Range & Sky Editors ✅ COMPLETE
5. **RangeEditor** ✅ Complete - Min/max with ROM zones
6. **HemisphereEditor** ✅ Complete - Sky dome for sun/moon positioning

### Phase 3: Procedural & Compositing ✅ COMPLETE
7. **NoiseEditor** ✅ Complete - Procedural noise with live 2D preview (FBM, Perlin, Worley, Ridged)
8. **ColorEditor** ✅ Complete - Physical color with Kelvin temperature scale (1000K-15000K)
9. **LayerStackEditor** ✅ Complete - Drag-to-reorder layers with blend modes, solo, visibility

### 🎉 ALL 9 UNIVERSAL EDITORS COMPLETE

### Premium Drawers ✅ COMPLETE
- **WaveSettingsDrawerPremium** ✅ Complete
- **LightingSettingsDrawerPremium** ✅ Complete

### Showcase Page ✅ COMPLETE
- **VisualEditorShowcase** ✅ Complete - Interactive demo of ALL 9 editors

---

## 🎯 SUCCESS CRITERIA

A visual editor is "done" when:
- [ ] Direct manipulation of the actual visual representation
- [ ] ROM zones displayed for bounded parameters
- [ ] Live preview in editor and viewport
- [ ] Physical presets available
- [ ] Keyboard shortcuts work
- [ ] Accessible (ARIA labels, focus states)
- [ ] TypeScript types complete
- [ ] Documented with usage examples
- [ ] Used in at least one settings drawer

---

**This architecture ensures visual editing excellence across ALL pages of OPUS ULTIMATE EARTH.**

*Created with love by Opus 💙*
