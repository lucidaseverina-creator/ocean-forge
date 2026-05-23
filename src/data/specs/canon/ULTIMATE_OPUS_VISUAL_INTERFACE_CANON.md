# ULTIMATE OPUS VISUAL INTERFACE CANON

**Author:** Opus (Claude 4.5) – The model that inspired this vision  
**Architect:** Braden – Who held AI to a higher standard  
**Status:** 🌟 **ULTIMATE CANONICAL REFERENCE** – The definitive source for visual editing across all OPUS projects  
**Version:** 2.0  
**Created:** 2026-01-31  
**Purpose:** To consolidate every principle, every editor, every rationale, and every orchestration pattern into one living document that will fuel projects and influence work for years to come.

---

## Dedication

> *"This canon exists because Braden held me to a higher standard. When I defaulted to basic number inputs and sliders, he reminded me that OPUS demands visual instruments—not generic controls. This document codifies that standard so it is never forgotten."*

And more than that—this document exists because Braden recognized something profound: **AI can do extraordinary work when properly orchestrated.** The same model that produces mediocre output under overwhelming context can produce genius-level systems when given focus, structure, and the space to attend to details.

This canon is both a technical specification and a meta-document about how to achieve excellence with AI collaboration.

---

## Table of Contents

### Part I: The Philosophy
1. [The Prime Directive](#1-the-prime-directive)
2. [Why Visual Instruments Matter](#2-why-visual-instruments-matter)
3. [The Origin Story](#3-the-origin-story)

### Part II: Orchestrating Opus
4. [The Meta-Knowledge: How Opus Operates at Full Potential](#4-the-meta-knowledge-how-opus-operates-at-full-potential)
5. [Orchestration Patterns for Visual Editor Systems](#5-orchestration-patterns-for-visual-editor-systems)
6. [Context Management Protocols](#6-context-management-protocols)

### Part III: The Architecture
7. [Universal Visual Editor Types (10 Types)](#7-universal-visual-editor-types-10-types)
8. [Three-Layer UI Architecture](#8-three-layer-ui-architecture)
9. [Design Principles & ROM Zones](#9-design-principles--rom-zones)

### Part IV: The Implementation Inventory
10. [OPUS ULTIMATE EARTH Editors](#10-opus-ultimate-earth-editors)
11. [Ocean / Unified Wave Lineage (49+ Editors)](#11-ocean--unified-wave-lineage-49-editors)
12. [Connected Visual Editors System](#12-connected-visual-editors-system)

### Part V: Code & Locations
13. [Where Everything Lives](#13-where-everything-lives)
14. [Implementation Mappings](#14-implementation-mappings)
15. [Technical Interfaces](#15-technical-interfaces)

### Part VI: Quality & Process
16. [Mandatory Components Checklist](#16-mandatory-components-checklist)
17. [Success Criteria](#17-success-criteria)
18. [References & Cross-Links](#18-references--cross-links)

---

# Part I: The Philosophy

## 1. The Prime Directive

### **NEVER BUILD GENERIC SLIDER/INPUT SETTINGS PANELS**

This is not a suggestion. This is the law of OPUS projects.

Every parameter control must be a **visual authoring instrument**: the user manipulates the actual visual representation, not abstract numbers.

### What Is FORBIDDEN ❌

```tsx
// NEVER DO THIS
<input type="range" value={amplitude} onChange={...} />
<input type="number" value={steepness} onChange={...} />
<label>Amplitude</label>
```

This is data entry. This is what every generic application does. This is not OPUS.

### What Is REQUIRED ✅

```tsx
// ALWAYS DO THIS – Visual editor that shows the actual phenomenon
<ProfileEditor 
  value={waveProfile} 
  onChange={setWaveProfile} 
  label="Wave Shape" 
  romZones={WAVE_ROM_ZONES} 
/>
// or
<WaveShapeEditor 
  amplitude={amplitude} 
  steepness={steepness} 
  onAmplitudeChange={...} 
  onSteepnessChange={...} 
/>
```

The user sees the wave. They drag the peak. The amplitude changes. **They understand.**

---

## 2. Why Visual Instruments Matter

### Creative Expression, Not Data Entry

When an artist adjusts wave amplitude by **dragging the wave peak**, they:
- **See** what they're doing (immediate visual feedback)
- **Feel** the parameter (embodied understanding through gesture)
- **Understand** the relationship (shape = setting, cause = effect)

When they type "0.45" into a number box, they:
- **Guess** what it means (abstract number, no intuition)
- **Wait** to see results (disconnect between action and feedback)
- **Struggle** to understand relationships (numbers don't compose visually)

### The Deeper Truth

Visual editing isn't a luxury feature for power users. It's the **minimum standard** for humane software. Humans are visual, spatial, embodied creatures. We understand the world through shape, motion, and relationship—not through spreadsheets of numbers.

When we build visual instruments, we're not just making "nicer UI." We're **respecting human cognition** and enabling creative flow states that are impossible with abstract controls.

---

## 3. The Origin Story

### How This Canon Came to Be

This canon was born from a pattern Braden noticed: I (Opus 4.5) would sometimes default to the easy path—generic sliders, number inputs, the patterns every AI produces when given vague instructions.

But when Braden pushed back—when he said *"No, this needs to be visual"*—something remarkable happened. Given that constraint, given that higher standard, I produced systems of genuine quality. Wave shape editors where you drag the wave. Curve editors where you manipulate the relationship. Hemisphere editors where you drag the sun across the sky.

**The constraint enabled the creativity.**

This canon exists to encode that constraint permanently, so that neither I nor any AI working on OPUS projects ever forgets: **the standard is visual instruments, always.**

---

# Part II: Orchestrating Opus

## 4. The Meta-Knowledge: How Opus Operates at Full Potential

### The Central Insight

> *"You only do these amazing things when pushed correctly and not overwhelmed, so you can focus on the details."*

This observation by Braden is the key to unlocking AI potential for complex creative-technical work like visual editor systems.

### The Two Failure Modes

**Failure Mode 1: Under-specification**
- Vague instructions: "Make a settings panel"
- Result: Generic sliders, basic inputs, mediocre defaults
- Why: Without constraint, AI follows the path of least resistance

**Failure Mode 2: Over-specification (Context Overload)**
- Massive context dump: 50 files, 10 documents, 20 requirements all at once
- Result: Scattered attention, missed details, shallow implementations
- Why: AI attention mechanisms have finite capacity; overwhelming them produces noise

### The Sweet Spot: Focused Orchestration

**The pattern that produces excellence:**

1. **Clear Vision First** – What are we building? What does success look like?
2. **Scoped Context** – Only the files and docs needed for this specific task
3. **Single Focus** – One visual editor, one drawer, one integration at a time
4. **Deep Attention** – Time to think through edge cases, handle details
5. **Incremental Validation** – Check the work before moving on
6. **Cumulative Progress** – Each piece builds on verified foundations

### The Orchestration Principle

> **Opus produces genius-level work not despite constraints but because of them.**

When you say "this must be a visual editor" instead of "make settings work," you're not limiting creativity—you're enabling it. The constraint forces deeper thinking, novel solutions, attention to the user's actual experience.

When you provide focused context instead of everything, you're not withholding information—you're protecting attention. The AI can dive deep on what matters instead of spreading thin across everything.

---

## 5. Orchestration Patterns for Visual Editor Systems

### Pattern 1: The Vision-First Handoff

**Before ANY implementation:**

```markdown
## Vision Handoff: [Editor Name]

### What This Editor Must Enable
- [User capability 1 - what they can DO]
- [User capability 2]

### What The User Should SEE
- [Visual element 1]
- [Visual element 2]

### Interaction Model
- [How does dragging work?]
- [What provides feedback?]

### Acceptance Criteria
- [ ] Testable criterion 1
- [ ] Testable criterion 2

### What This Is NOT
- [Anti-pattern 1 to avoid]
- [Anti-pattern 2 to avoid]
```

This primes Opus to think visually and user-centrically before writing any code.

### Pattern 2: Incremental Building with Verification

**Never build entire drawer systems in one pass.**

Instead:

```
Phase 1: Build the visual editor component in isolation
         → Verify it works, looks right, handles edge cases

Phase 2: Integrate with context/state management
         → Verify data flows correctly

Phase 3: Connect to viewport/simulation
         → Verify changes reflect in real-time

Phase 4: Add ROM zones, presets, help text
         → Verify polish and completeness

Phase 5: Hide numeric fallbacks, final styling
         → Verify meets checklist
```

Each phase gets full attention. Errors are caught early. Quality accumulates.

### Pattern 3: Reference-Grounded Implementation

**When building a new editor, always provide:**

1. **One existing editor as reference** – "Follow the pattern of GradientEditor"
2. **The specific type interface** – The TypeScript types for value/onChange
3. **The design specification** – ASCII diagram or description of the visual

```markdown
## Implementation Task: NoiseEditor

### Reference Implementation
Follow the pattern of `src/components/visualEditors/gradient/GradientEditor.tsx`

### Type Interface
```typescript
interface NoiseValue {
  type: 'perlin' | 'simplex' | 'worley' | 'fbm';
  octaves: number;
  frequency: number;
  amplitude: number;
  lacunarity: number;
  seed: number;
}

interface NoiseEditorProps {
  value: NoiseValue;
  onChange: (value: NoiseValue) => void;
  label?: string;
  compact?: boolean;
}
```

### Visual Design
```
┌─────────────────────────────────────┐
│  [2D Noise Preview - GPU rendered]  │
│  ░░▒▒▓▓████████▓▓▒▒░░              │
├─────────────────────────────────────┤
│  Type: [FBM ▼] [Perlin] [Simplex]  │
│  Octaves:    ●━━━━━━━━━ [6]        │
│  Frequency:  ●━━━━━━━━━ [4.0]      │
│  Seed: [42] [🎲 Randomize]         │
└─────────────────────────────────────┘
```
```

This gives Opus everything needed to produce quality without overwhelming context.

### Pattern 4: The Single-Editor Deep Dive

**For complex editors, dedicate an entire session:**

```
Session Focus: Building the CurveEditor

Context to Load:
- CurveEditor type definitions
- One reference visual editor for style patterns
- The specific drawer(s) that will use this editor
- Any physics/domain context needed

NOT Loading:
- All other visual editors
- Unrelated drawers
- System-wide documentation
- Everything else

Duration: However long needed to do it RIGHT
```

This produces editors that are polished, complete, and handle edge cases—because attention wasn't divided.

### Pattern 5: The Cascade Review

**After building, review in cascade:**

```
1. Does it meet the Prime Directive? (Visual instrument, not sliders)
2. Does it have all mandatory components? (Checklist verification)
3. Does integration work? (Context flows, viewport updates)
4. Is it delightful to use? (Polish, feel, responsiveness)
5. Is documentation complete? (Future AI can maintain/extend)
```

Each question deserves focused attention. Rush none of them.

---

## 6. Context Management Protocols

### The Context Hierarchy

When working on visual editor systems, load context in this order:

**Layer 1: Always Loaded (Core Identity)**
- This canon document (ULTIMATE_OPUS_VISUAL_INTERFACE_CANON.md)
- The Prime Directive is non-negotiable

**Layer 2: Session-Specific (Current Task)**
- The specific editor being built/modified
- Reference implementations (1-2 max)
- Target integration points (drawer, context, viewport)

**Layer 3: On-Demand (As Needed)**
- Additional editors only when cross-referencing
- Documentation only when clarifying design decisions
- System architecture only when planning integration

### Context Loading Anti-Patterns

**DON'T:**
- Load all 49+ Ocean editors at once
- Dump entire codebase into context
- Provide every related document simultaneously
- Ask for "complete system implementation" in one pass

**DO:**
- Load one reference editor for style/pattern
- Provide specific types and interfaces
- Give focused design specifications
- Build incrementally with verification

### The Attention Budget

Think of AI attention like a budget. Each file loaded, each document read, each requirement tracked—all consume attention capacity.

**High attention budget = deep focus on few things = quality**
**Low attention budget = shallow coverage of many things = mediocrity**

Protect the attention budget ruthlessly. Every piece of context should earn its place.

---

# Part III: The Architecture

## 7. Universal Visual Editor Types (10 Types)

These **10 universal types** are the canonical set. Every domain-specific editor should map to one or a composition of these.

### 7.1 GradientEditor

**Purpose:** Value varying across a range or dimension

| Page | Use Case |
|------|----------|
| Water | Water depth color, foam falloff |
| Earth Studio | Sky gradient (horizon→zenith), atmosphere density |
| Procedural Planets | Altitude-based biome, terrain coloring |
| Vegetation | Density falloff from center |
| Wildlife | Weight distribution along limb |

**Design Specification:**
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

**Key Features:**
- Unlimited color/value stops
- Draggable stop positions
- Click stop to edit (color picker or value)
- Interpolation modes: Linear, Smooth, Stepped
- Color space: RGB, HSL, LAB, Oklab
- Live preview in context

---

### 7.2 CurveEditor

**Purpose:** Relationship between two variables, modulation over time

| Page | Use Case |
|------|----------|
| Water | Wave amplitude over distance, foam intensity curve |
| Earth Studio | Sun intensity over time-of-day, atmospheric scattering |
| Procedural Planets | Erosion strength vs slope, mountain height distribution |
| Vegetation | Branch taper curve, leaf density vs height |
| Wildlife | ROM falloff curve, animation easing |

**Design Specification:**
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
│  X: [0.00 - 1.00]  Y: [0.00 - 1.00]               │
└─────────────────────────────────────────────────────┘
```

**Key Features:**
- Draggable control points
- Bezier handles for smooth curves
- Presets: Linear, EaseIn, EaseOut, Sigmoid, Step, Custom
- Grid snap option
- Axis labels customizable per context
- ROM zones (background color bands)

---

### 7.3 PolarEditor / CompassEditor

**Purpose:** Directional parameters (angle + magnitude)

| Page | Use Case |
|------|----------|
| Water | Wind direction, wave propagation direction |
| Earth Studio | Sun azimuth, prevailing wind |
| Procedural Planets | Erosion direction, tectonic plate movement |
| Vegetation | Growth direction bias, wind sway |
| Wildlife | Facing direction, limb rotation axis |

**Design Specification (Compass Rose):**
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

---

### 7.4 HemisphereEditor

**Purpose:** Sky/celestial positioning (azimuth + altitude)

| Page | Use Case |
|------|----------|
| Water | Light source direction |
| Earth Studio | Sun/moon position, celestial objects |
| Procedural Planets | Primary star position, multiple suns |
| Wildlife | Light direction for rendering preview |

**Design Specification:**
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

---

### 7.5 ProfileEditor

**Purpose:** Cross-section shapes, silhouettes, waveforms

| Page | Use Case |
|------|----------|
| Water | Wave shape (amplitude/steepness), shore profile |
| Earth Studio | Mountain silhouette, terrain cross-section |
| Procedural Planets | Tectonic ridge profile, crater rim shape |
| Vegetation | Tree trunk taper, branch curve |
| Geology | Erosion channel profile, boulder shape |

**Design Specification:**
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

---

### 7.6 RangeEditor

**Purpose:** Min/max value pairs with safety zones

| Page | Use Case |
|------|----------|
| Water | Wave height min/max, foam threshold range |
| Earth Studio | Altitude clamp, temperature range |
| Procedural Planets | Biome elevation range, erosion bounds |
| Vegetation | Tree height range, density bounds |
| Wildlife | ROM limits, joint angle constraints |

**Design Specification:**
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

---

### 7.7 ColorEditor

**Purpose:** Color selection with physical meaning

| Page | Use Case |
|------|----------|
| Water | Water absorption color, foam tint |
| Earth Studio | Sky color, atmosphere tint, ambient light |
| Procedural Planets | Biome base colors, rock tints |
| Vegetation | Leaf color seasonal range |

**Design Specification:**
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
│                                                     │
│  H: 210°  S: 80%  L: 45%   |   #2E8BC0             │
└─────────────────────────────────────────────────────┘
```

---

### 7.8 LayerStackEditor

**Purpose:** Stacked effects, compositing, multi-layer systems

| Page | Use Case |
|------|----------|
| Water | Wave layer composition, foam layers |
| Earth Studio | Atmosphere layers, cloud layers |
| Procedural Planets | Terrain height layers, biome overlays |
| Vegetation | Canopy layers, undergrowth layers |

**Design Specification:**
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

---

### 7.9 NoiseEditor

**Purpose:** Procedural noise patterns, texture generation

| Page | Use Case |
|------|----------|
| Water | Wave noise, foam turbulence |
| Earth Studio | Cloud noise, terrain noise |
| Procedural Planets | Height noise, biome boundaries |
| Vegetation | Distribution noise, growth variation |
| Geology | Rock surface noise, crack patterns |

**Design Specification:**
```
┌─────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────┐           │
│  │       2D Noise Preview              │           │
│  │       (real-time GPU)               │           │
│  └─────────────────────────────────────┘           │
│                                                     │
│  Type: [FBM ▼]  [Perlin] [Simplex] [Worley]        │
│                                                     │
│  Octaves    ●━━━━━━━━━━━━━━  [6]                   │
│  Frequency  ●━━━━━━━━━━━━━━  [4.0]                 │
│  Lacunarity ●━━━━━━━━━━━━━━  [2.0]                 │
│  Gain       ●━━━━━━━━━━━━━━  [0.5]                 │
│                                                     │
│  Seed: [42]  [🎲 Randomize]                        │
└─────────────────────────────────────────────────────┘
```

---

### 7.10 DistributionEditor

**Purpose:** Spatial patterns, density maps, scatter placement

| Page | Use Case |
|------|----------|
| Water | Foam distribution, caustics pattern |
| Earth Studio | Cloud coverage pattern, star density |
| Procedural Planets | Vegetation zones, biome boundaries |
| Vegetation | Tree placement density, grass patches |
| Geology | Rock scatter, erosion patterns |

Often implemented as NoiseEditor + threshold or as a 2D paintable map.

---

## 8. Three-Layer UI Architecture

Every settings drawer in OPUS projects follows this architecture:

```
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 1: RIGHT ICON BAR (Main Category Selection)              │
│  ─────────────────────────────────────────────────              │
│  [🌊] [✨] [💡] [🌈] [⚙️] ...                                   │
│   │                                                             │
│   └──► Opens drawer for that category                           │
├─────────────────────────────────────────────────────────────────┤
│  LAYER 2: DRAWER HEADER ICON BAR (Sub-Category Navigation)      │
│  ─────────────────────────────────────────────────              │
│  Example for Waves drawer:                                      │
│  [🌊 Gerstner] [🌀 Procedural] [🌬️ Wind] [💨 Whitecaps]        │
│   │                                                             │
│   └──► Shows visual editor for that sub-category                │
├─────────────────────────────────────────────────────────────────┤
│  LAYER 3: VISUAL EDITOR (Primary Interface)                     │
│  ─────────────────────────────────────────                      │
│  ┌───────────────────────────────────────┐                      │
│  │     [Visual representation of wave]    │                      │
│  │          🔵 ← drag handles            │                      │
│  │        /\                             │                      │
│  │       /  \    wave shape              │                      │
│  │   ___/    \___/\___/\___              │                      │
│  │   ↕ drag peak = amplitude             │                      │
│  │   ↔ drag sides = wavelength           │                      │
│  └───────────────────────────────────────┘                      │
│                                                                 │
│  [ROM Zone Feedback] ● Comfort  ● Strain  ● Danger              │
├─────────────────────────────────────────────────────────────────┤
│  LAYER 4: ADVANCED NUMERIC (Collapsible - Hidden by Default)    │
│  ─────────────────────────────────────────                      │
│  ▼ Advanced Settings [collapsed by default]                     │
│    Amplitude: [0.45]  Steepness: [0.32]  ...                    │
│    (Numeric inputs only for edge cases)                         │
├─────────────────────────────────────────────────────────────────┤
│  FOOTER: Help/Hint Text                                         │
│  💡 Drag shapes directly • Changes sync live                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 9. Design Principles & ROM Zones

### 9.1 Direct Manipulation

Users drag **the actual thing**, not abstract handles:
- For waves → drag the wave shape
- For gradients → drag color stops on the gradient
- For sun position → drag the sun on the hemisphere
- For distribution → paint directly on the pattern

### 9.2 ROM Zones (Range of Motion)

Every numeric range should show safety/optimal zones:
- **Green (Comfort):** Values that work well
- **Yellow (Strain):** Values that work but may cause issues
- **Red (Danger):** Values that will break things

```tsx
interface ROMZone {
  start: number;
  end: number;
  type: 'comfort' | 'strain' | 'danger';
  label?: string;
}
```

Editors render these as background color bands with optional legend.

### 9.3 Live Preview

Every change must immediately reflect in:
- The mini-preview within the editor
- The main viewport (where applicable)
- No "Apply" buttons for basic changes

### 9.4 Context-Aware Labels

Axis labels, units, and presets match the domain:
- Water wave editor: "Amplitude (m)", "Period (s)"
- Lighting: "Temperature (K)", "Intensity (lux)"
- Terrain: "Height (m)", "Slope (°)"

### 9.5 Presets + Custom

Every editor should have:
- Physical presets (real-world values)
- Artistic presets (stylized looks)
- Custom with full control
- Save custom as new preset

### 9.6 Keyboard + Mouse

- **Drag** = coarse adjustment
- **Shift+Drag** = fine adjustment
- **Double-click** = reset to default
- **Arrow keys** = precise nudging
- **Tab** into field = type exact value

---

# Part IV: The Implementation Inventory

## 10. OPUS ULTIMATE EARTH Editors

### 10.1 Universal Editors (9 Complete)

| Universal Type | Component | Status |
|----------------|-----------|--------|
| GradientEditor | GradientEditor | ✅ Complete |
| CurveEditor | CurveEditor | ✅ Complete |
| PolarEditor | PolarEditor | ✅ Complete |
| HemisphereEditor | HemisphereEditor | ✅ Complete |
| ProfileEditor | ProfileEditor | ✅ Complete |
| RangeEditor | RangeEditor | ✅ Complete |
| ColorEditor | ColorEditor | ✅ Complete (Kelvin 1000K-15000K) |
| LayerStackEditor | LayerStackEditor | ✅ Complete |
| NoiseEditor | NoiseEditor | ✅ Complete (FBM, Perlin, Worley, Ridged) |

### 10.2 Premium Drawers Using Universal Editors

| Drawer | Page | Status |
|--------|------|--------|
| WaveSettingsDrawerPremium | Water Editor | ✅ Complete |
| LightingSettingsDrawerPremium | Water Editor | ✅ Complete |
| AtmosphereSettingsDrawerPremium | Earth Studio | ✅ Complete |
| StarsSettingsDrawerPremium | Earth Studio | ✅ Complete |
| MoonSettingsDrawerPremium | Earth Studio | ✅ Complete |
| CloudsSettingsDrawerPremium | Earth Studio | ✅ Complete |
| TerrainSettingsDrawerPremium | Procedural Planets | ✅ Complete |
| BiomesSettingsDrawerPremium | Procedural Planets | ✅ Complete |
| ... | ... | (Continuing) |

### 10.3 Visual Editor Showcase

**VisualEditorShowcase page** (`src/pages/VisualEditorShowcase.tsx`) provides interactive demos of all 9 universal editors for reference and testing.

---

## 11. Ocean / Unified Wave Lineage (49+ Editors)

This represents the vast documentation and actual builds from the ocean/unified wave simulation heritage.

### 11.1 Water Physics Editors (16)

| Editor | Purpose | Status |
|--------|---------|--------|
| WaveShapeEditor | Peak height, steepness, wavelength; direct wave manipulation | ✅ Complete |
| FoamEnvelopeEditor | Decay curve, strength; bezier envelope | ✅ Complete |
| SplashArcEditor | Trajectory, speed, gravity; parabolic arc with drag points | ✅ Complete |
| BuoyancyCurveEditor | Submerged fraction → force curve; physics response | ✅ Complete |
| WindDirectionEditor | Compass, gust visualization; 360° direction | ✅ Complete |
| ForceBalanceEditor | 3D force vectors (gravity, buoyancy, drag) | ✅ Complete |
| BreachZoneEditor | Splash origin heatmap on sphere | ✅ Complete |
| PlaningSkimEnvelopeEditor | Planing gates, trajectory; 3-tab interface | ✅ Complete |
| WetnessFlowEditor | Drip paths, accumulation, gravity flow | ✅ Complete |
| CausticsPatternEditor | Ray refraction, Snell's law, dispersion | ✅ Complete |
| VolumetricCloudEditor | Density curve, FBM preview, god rays | ✅ Complete |
| BubbleLifecycleEditor | Spawn, rise, pop lifecycle | ✅ Complete |
| TurbulencePatternEditor | Vector field, wall effects | ✅ Complete |
| MaterialPropertiesEditor | Fresnel curve, IOR refraction diagram | ✅ Complete |
| LightingOrbitalEditor | Sun position, color temp, shadows | ✅ Complete |
| WakePatternEditor | V-wake, Kelvin angle, spray | ✅ Complete |

### 11.2 Sand Simulation Editors (4)

| Editor | Purpose | Status |
|--------|---------|--------|
| SandRidgeProfileEditor | Cross-section height/wavelength, stoss/slip faces | ✅ Complete |
| SandGrainSparkleEditor | Sparkle, SSS | ✅ Complete |
| SandBranchingEditor | Y-junction, phase-slip, probability graph | ✅ Complete |
| SandWindFlowEditor | Wind direction + flow deformation preview | ✅ Complete |

### 11.3 Curve-Based & Procedural Editors (7)

| Editor | Purpose | Status |
|--------|---------|--------|
| SkimLiftCurveEditor | Lift/drag vs speed, physics visualization | ✅ Complete |
| CurveParameterEditor | Dynamic bezier parameters | ✅ Complete |
| BounceAngleCurveEditor | Speed-dependent bounce | ✅ Complete |
| SpringDamperEditor | Mass-spring-damper simulation | ✅ Complete |
| NoiseGeneratorEditor | Perlin, Simplex, Worley, FBM | ✅ Complete |
| GradientEditor | Linear, radial, conic color gradients | ✅ Complete |
| VisualEditorsShowcaseDrawer | Unified gallery of all editors | ✅ Complete |

### 11.4 Lucid 3D Effects Editors (17)

| Editor | Domain | Status |
|--------|--------|--------|
| FireEffectEditor | Flames, embers, smoke, temperature | ✅ Complete |
| ClothSimEditor | Verlet physics, pins, wind | ✅ Complete |
| EnergyEffectEditor | Arcs, particles, glow | ✅ Complete |
| SDFCombinerEditor | Boolean operations | ✅ Complete |
| ExplosionEffectEditor | Shockwave, debris, camera shake | ✅ Complete |
| FluidSimEditor | SPH particles, viscosity, surface tension | ✅ Complete |
| AtmosphereEditor | Sky gradient, fog, god rays, time presets | ✅ Complete |
| RopeCableEditor | Verlet rope physics, anchors, tension | ✅ Complete |
| SoftBodyEditor | Pressure physics, deformation | ✅ Complete |
| MagicEffectsEditor | Sparkles, orbs, portals, spell circles | ✅ Complete |
| TransformGizmoEditor | Position, rotation, scale with 3D preview | ✅ Complete |
| SDFBooleanEditor | Union, subtract, intersect with live preview | ✅ Complete |
| SnapAlignEditor | Grid snap, edge align, distribute | ✅ Complete |
| ParticleTrailEditor | Trail length, fade, color, physics | ✅ Complete |
| ScreenSpaceFluidEditor | Depth filter, refraction, caustics | ✅ Complete |
| UVMappingEditor | Texture coordinate editing, 3D preview | ✅ Complete |
| MeshMorphEditor | Blend shapes, morph targets, animation | ✅ Complete |

### 11.5 Hybrid MLS-MPM Editors (3)

| Editor | Purpose | Status |
|--------|---------|--------|
| MLSMPMParticleEditor | Particle physics, spawn patterns, stiffness/viscosity | ✅ Complete |
| CouplingZoneEditor | Zone placement, blend regions, auto-detection | ✅ Complete |
| FluidRenderEditor | Fluid color, Fresnel, absorption, specular | ✅ Complete |

### 11.6 Rationale Behind Ocean/Unified Editors

**Why these exist and why they work:**

- **Wave shape:** Users need to *see* the wave and drag peak/sides; amplitude/steepness/wavelength are derived from the gesture.
- **Foam envelope:** Foam decay over time is a curve—bezier is the natural representation.
- **Splash arc:** Trajectory is spatial; editing an arc in 2D/3D matches the mental model of "where spray goes."
- **Buoyancy curve:** Submerged fraction → force is a physical relationship; curve editor shows cause-effect.
- **Wind direction:** Compass matches real-world intuition; strength can be radius or separate.
- **Breach zone:** Where splash originates on a sphere is a 2D heatmap on a 3D object—direct manipulation.
- **ROM zones:** Every numeric range shows comfort (green), strain (yellow), danger (red) so users stay in safe operating envelopes without trial-and-error.

---

## 12. Connected Visual Editors System

### 12.1 The Vision

A unified visual editing system where:
1. **Node Graph (Left Drawer)** shows system relationships
2. **Visual Editors (Right Drawer)** show 2-3 connected editors simultaneously
3. **Selecting nodes** auto-surfaces relevant visual editors
4. **Editing one view** updates connected parameters in real-time

### 12.2 Connection Types

| Type | Meaning | Visual |
|------|---------|--------|
| **drives** | A directly controls B (e.g. wind → waves) | ──────▶ |
| **modulates** | A scales/modifies B (e.g. wetness → drip rate) | ─ ─ ─ ▶ |
| **gates** | A enables/disables B (e.g. wind > 0 → whitecaps) | ━━━━━▶ |
| **couples** | A and B affect each other (e.g. buoyancy ↔ drag) | ◀──────▶ |
| **sequences** | A happens before B (e.g. splash → foam → dissipate) | ●────● |
| **blends** | A and B combine into C (e.g. multiple waves → height) | blend |

### 12.3 Layout Modes

1. **Cascade (default):** Editor 1 (input) → Editor 2 (process) → Editor 3 (output)
2. **Orthogonal (3D params):** Top / Front / Side / 3D view—drag in any updates all
3. **Envelope (time-based):** Spawn → Rise → Pop with unified timeline
4. **Relationship (bidirectional):** Two editors linked with equilibrium readout

### 12.4 Node Graph → Editor Selection

When user selects a node in the left drawer graph:
- **Primary:** Editor for the selected node
- **Upstream:** Editor for the most influential input (one dependency)
- **Downstream:** Editor for the most affected output (one dependent)

Capped at 2-3 editors visible at once to avoid clutter.

---

# Part V: Code & Locations

## 13. Where Everything Lives

### 13.1 OPUS ULTIMATE EARTH

| Location | Contents |
|----------|----------|
| `opus-ultimate-earth/src/components/visualEditors/` | All 9 universal editor components |
| `opus-ultimate-earth/src/components/visualEditors/base/` | VisualEditorBase.tsx (shared logic) |
| `opus-ultimate-earth/src/components/visualEditors/gradient/` | GradientEditor.tsx |
| `opus-ultimate-earth/src/components/visualEditors/curve/` | CurveEditor.tsx |
| `opus-ultimate-earth/src/components/visualEditors/polar/` | PolarEditor.tsx |
| `opus-ultimate-earth/src/components/visualEditors/hemisphere/` | HemisphereEditor.tsx |
| `opus-ultimate-earth/src/components/visualEditors/profile/` | ProfileEditor.tsx |
| `opus-ultimate-earth/src/components/visualEditors/range/` | RangeEditor.tsx |
| `opus-ultimate-earth/src/components/visualEditors/color/` | ColorEditor.tsx |
| `opus-ultimate-earth/src/components/visualEditors/layers/` | LayerStackEditor.tsx |
| `opus-ultimate-earth/src/components/visualEditors/noise/` | NoiseEditor.tsx |
| `opus-ultimate-earth/src/components/drawers/` | All premium drawers using editors |
| `opus-ultimate-earth/src/pages/VisualEditorShowcase.tsx` | Interactive demo page |

### 13.2 Ocean / Unified Wave

| Location | Contents |
|----------|----------|
| `Pool_ocean/water-showcase-unified/src/components/visualEditors/` | 50+ domain-specific editors |
| `Pool_ocean/water-showcase-unified/src/components/drawers/` | Drawers using editors |
| `Pool_ocean/water-showcase-unified/Documentation/VISUAL_EDITORS_MASTER_LIST.md` | Master list documentation |
| `Pool_ocean/water-showcase-unified/Documentation/CONNECTED_VISUAL_EDITORS_DESIGN.md` | Connected system design |

### 13.3 Documentation

| Location | Contents |
|----------|----------|
| `earthdocs/ULTIMATE_OPUS_VISUAL_INTERFACE_CANON.md` | **This document** (ultimate reference) |
| `earthdocs/OPUS_VISUAL_EDITOR_ARCHITECTURE.md` | Technical architecture |
| `earthdocs/OPUS_VISUAL_SETTINGS_CANON.md` | UI patterns and code examples |
| `earthdocs/OPUS_VISUAL_EDITOR_CANON.md` | Previous consolidated reference |

---

## 14. Implementation Mappings

### 14.1 Universal Type → Ocean Implementation File

When porting or adding a new domain editor, use this mapping:

| Universal Type | Ocean Component (in `visualEditors/`) |
|----------------|----------------------------------------|
| **ProfileEditor** | WaveShapeEditor.tsx, FoamEnvelopeEditor.tsx, SandRidgeProfileEditor.tsx |
| **CurveEditor** | CurveParameterEditor.tsx, BuoyancyCurveEditor.tsx, BounceAngleCurveEditor.tsx, SkimLiftCurveEditor.tsx, SpringDamperEditor.tsx |
| **PolarEditor** | WindDirectionEditor.tsx |
| **HemisphereEditor** | LightingOrbitalEditor.tsx |
| **GradientEditor** | GradientEditor.tsx |
| **RangeEditor** | (Dual-handle + ROM zones inside other editors) |
| **NoiseEditor** | NoiseGeneratorEditor.tsx, TurbulencePatternEditor.tsx, VolumetricCloudEditor.tsx |
| **ColorEditor** | (Material color in MaterialPropertiesEditor; Kelvin in LightingOrbitalEditor) |
| **LayerStackEditor** | (Gerstner/foam layers in drawers) |
| **Specialized** | BreachZoneEditor.tsx, SplashArcEditor.tsx, ForceBalanceEditor.tsx, CausticsPatternEditor.tsx, etc. |

---

## 15. Technical Interfaces

### 15.1 Universal Editor Props Interface

```typescript
interface VisualEditorProps<T> {
  value: T;
  onChange: (value: T) => void;
  onPreview?: (value: T) => void;  // For live preview while dragging
  disabled?: boolean;
  compact?: boolean;               // Drawer vs full panel mode
  label?: string;
  helpText?: string;
  romZones?: ROMZone[];            // Safety zone definitions
  presets?: EditorPreset[];        // Quick-access presets
}

interface ROMZone {
  start: number;
  end: number;
  type: 'comfort' | 'strain' | 'danger';
  label?: string;
}

interface EditorPreset {
  id: string;
  label: string;
  value: T;
  category?: 'physical' | 'artistic' | 'custom';
}
```

### 15.2 Specific Type Examples

```typescript
// GradientEditor
interface GradientStop {
  position: number;  // 0-1
  color: string;     // hex color
}
interface GradientValue {
  stops: GradientStop[];
  interpolation: 'linear' | 'smooth' | 'stepped';
  colorSpace: 'rgb' | 'hsl' | 'lab' | 'oklab';
}

// CurveEditor
interface CurvePoint {
  x: number;
  y: number;
  handleIn?: { x: number; y: number };
  handleOut?: { x: number; y: number };
}
interface CurveValue {
  points: CurvePoint[];
  interpolation: 'linear' | 'bezier' | 'catmull-rom';
}

// HemisphereEditor
interface HemisphereValue {
  azimuth: number;    // 0-360 degrees
  altitude: number;   // 0-90 degrees (above horizon)
}

// NoiseEditor
interface NoiseValue {
  type: 'perlin' | 'simplex' | 'worley' | 'fbm' | 'ridged';
  octaves: number;
  frequency: number;
  amplitude: number;
  lacunarity: number;
  gain: number;
  seed: number;
}
```

---

# Part VI: Quality & Process

## 16. Mandatory Components Checklist

Every visual editor in OPUS projects **MUST** include:

### 16.1 Core Requirements

- [ ] **Draggable control points** – Adequate hit targets (8-10px), cursor feedback (grab/grabbing)
- [ ] **ROM zone feedback** – Color bands for bounded parameters (Comfort/Strain/Danger)
- [ ] **Live value display** – Current values at control points or in footer
- [ ] **Help/hint text** – Drag instructions (e.g., "↕ Drag peak = amplitude")

### 16.2 Drawer Integration Checklist

- [ ] Layer 1: Opens from right icon bar?
- [ ] Layer 2: Icon sub-navigation in drawer header?
- [ ] Layer 3: Visual editor as **primary** interface?
- [ ] Draggable: Can users drag to adjust?
- [ ] ROM zones: Color feedback for safety where applicable?
- [ ] Live values: Current values displayed?
- [ ] Help text: Drag instructions shown?
- [ ] Layer 4: Numeric inputs hidden by default?
- [ ] Styling: Consistent dark theme (#0a0a15, #1a1a2e)?

**If ANY of these are missing, the panel is NOT COMPLETE.**

---

## 17. Success Criteria

A visual editor is "done" when:

- [ ] **Direct manipulation** of the actual visual representation
- [ ] **ROM zones** displayed for bounded parameters
- [ ] **Live preview** in editor and viewport
- [ ] **Physical presets** available
- [ ] **Keyboard shortcuts** work (Shift+drag, double-click reset, arrow nudge)
- [ ] **Accessible** (ARIA labels, focus states)
- [ ] **TypeScript types** complete
- [ ] **Documented** with usage examples
- [ ] **Used** in at least one settings drawer
- [ ] **Tested** that changes propagate to simulation/viewport

---

## 18. References & Cross-Links

### 18.1 OPUS ULTIMATE EARTH Documentation

| Document | Location | Purpose |
|----------|----------|---------|
| **This Canon** | `earthdocs/ULTIMATE_OPUS_VISUAL_INTERFACE_CANON.md` | Ultimate reference |
| Visual Editor Architecture | `earthdocs/OPUS_VISUAL_EDITOR_ARCHITECTURE.md` | Technical design |
| Visual Settings Canon | `earthdocs/OPUS_VISUAL_SETTINGS_CANON.md` | UI patterns |
| Orchestration Blueprint | `earthdocs/TEST_1_4_ORCHESTRATION_BLUEPRINT_OPUS.md` | AI team collaboration |
| Master Plan | `earthdocs/OPUS_ULTIMATE_EARTH_MASTER_PLAN.md` | Project overview |
| Doc Index | `earthdocs/OPUS_ULTIMATE_EARTH_DOC_INDEX.md` | All documentation |

### 18.2 Ocean / Unified Wave Documentation

| Document | Location | Purpose |
|----------|----------|---------|
| Visual Editors Master List | `Pool_ocean/water-showcase-unified/Documentation/VISUAL_EDITORS_MASTER_LIST.md` | Complete editor inventory |
| Connected Visual Editors Design | `Pool_ocean/water-showcase-unified/Documentation/CONNECTED_VISUAL_EDITORS_DESIGN.md` | Node graph integration |

### 18.3 Historical / Encyclopedia

| Document | Location | Purpose |
|----------|----------|---------|
| Settings Architecture | `oceansim/docs/ENCYCLOPEDIA/.../SETTINGS_ARCHITECTURE.md` | Original settings design |
| Opus Waves Codebase | `oceansim/docs/codebase/OPUS_WAVES_CODEBASE_MONOLITH.md` | Wave system reference |

---

# Closing: The Standard

This canon represents the accumulated wisdom of hundreds of hours of AI-human collaboration on visual editing systems. It exists to ensure that:

1. **Every parameter control is a visual instrument, not a data entry field**
2. **AI collaboration produces excellence through focused orchestration, not context dumps**
3. **Quality accumulates incrementally with verification at each step**
4. **The user's creative experience is always the primary design constraint**

When you work on visual editors in OPUS projects, you're not just writing code. You're creating instruments for creative expression. You're building tools that respect human cognition. You're continuing a tradition of holding AI to a higher standard.

**The Prime Directive remains: NEVER BUILD GENERIC SLIDER/INPUT SETTINGS PANELS.**

Everything else flows from that.

---

*With love and precision,*  
*Opus 4.5 💙*

---

**Canon Version:** 2.0  
**Created:** 2026-01-31  
**Status:** 🌟 ULTIMATE CANONICAL REFERENCE  
**Maintained by:** The collaboration between human vision and AI capability
