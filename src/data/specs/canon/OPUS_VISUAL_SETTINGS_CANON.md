# OPUS VISUAL SETTINGS CANON

**Author:** Opus (Claude 4.5)  
**Date:** 2025-01-31  
**Status:** 🎯 **CANONICAL STANDARD** - Mandatory for all OPUS ULTIMATE EARTH settings UI  
**Purpose:** Define the absolute standard for visual parameter editing - never regress to basic sliders

---

## 💙 Dedication

This canon exists because Braden held me to a higher standard. When I defaulted to basic number inputs and sliders, he reminded me that **OPUS demands visual instruments** - not generic controls. This document codifies that standard so I never forget.

---

## 🚨 THE PRIME DIRECTIVE

**NEVER BUILD GENERIC SLIDER/INPUT SETTINGS PANELS**

Every settings panel in OPUS ULTIMATE EARTH must be a **visual authoring instrument** - a tool for creative expression, not data entry.

### What's FORBIDDEN ❌
```tsx
// NEVER DO THIS - Generic slider
<input type="range" value={amplitude} onChange={...} />
<input type="number" value={steepness} onChange={...} />
<label>Amplitude</label>
```

### What's REQUIRED ✅
```tsx
// ALWAYS DO THIS - Visual editor that shows the actual wave
<WaveShapeEditor 
  amplitude={amplitude}
  steepness={steepness}
  frequency={frequency}
  onAmplitudeChange={...}
  onSteepnessChange={...}
/>
```

---

## 🏗️ THE THREE-LAYER ARCHITECTURE

Every drawer in OPUS ULTIMATE EARTH follows this architecture:

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
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎨 VISUAL EDITOR TYPES

### 1. Shape Editors (Direct Manipulation)
**Purpose:** Drag the actual shape instead of adjusting numbers

| Editor | Domain | Visual |
|--------|--------|--------|
| `WaveShapeEditor` | Wave amplitude, steepness, frequency | SVG wave shape with drag handles |
| `FoamEnvelopeEditor` | Foam decay, strength | Foam particle envelope curve |
| `SplashArcEditor` | Splash trajectory | Parabolic arc with drag points |
| `WindDirectionEditor` | Wind direction, speed | Compass rose with arrow drag |
| `BreachZoneEditor` | Splash origin, spread | Heatmap with adjustable zones |

### 2. Curve Editors (Parameter Modulation)
**Purpose:** Define how one parameter maps to another via bezier curves

| Editor | Use Case | Example |
|--------|----------|---------|
| `CurveEditor` | Generic bezier curves | Speed → Breach Rate |
| `BuoyancyCurveEditor` | Physics response curves | Depth → Buoyancy Force |
| `BounceAngleCurveEditor` | Impact response | Impact Angle → Bounce Angle |

**Curve Types:**
- `linear` - Straight line
- `bezier` - Cubic bezier with handles
- `smoothstep` - S-curve transition
- `exponential` - Power curve
- `step` - Discrete jumps

### 3. Graph Editors (Parameter Relationships)
**Purpose:** Visualize and edit how parameters connect to each other

| Editor | Use Case |
|--------|----------|
| `GraphPanel` | Opus Waves parameter graph |
| `SettingsNodeGraph` | Settings dependency visualization |
| `LeftGraphDrawer` | Node selection with linked editors |

### 4. Specialized Domain Editors
**Purpose:** Domain-specific visual instruments

| Editor | Domain |
|--------|--------|
| `CausticsPatternEditor` | Ray refraction patterns |
| `TurbulencePatternEditor` | Vector field visualization |
| `MaterialPropertiesEditor` | Fresnel, IOR, roughness |
| `VolumetricCloudEditor` | Cloud density, god rays |
| `BubbleLifecycleEditor` | Spawn, rise, pop lifecycle |

---

## 📋 MANDATORY COMPONENTS

Every visual editor in OPUS ULTIMATE EARTH MUST include:

### 1. Draggable Control Points
```tsx
// SVG or Canvas control point
<circle
  cx={controlPoint.x}
  cy={controlPoint.y}
  r={8}
  fill={isHovered || isDragging ? '#ff6b6b' : '#ffffff'}
  stroke="#00d4ff"
  strokeWidth={2}
  onMouseDown={startDrag}
  style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
/>
```

### 2. ROM Zone Feedback (Range of Motion)
```tsx
// Color feedback based on value safety
const getROMZoneColor = (value: number, zones: ROMZones) => {
  if (value >= zones.comfort[0] && value <= zones.comfort[1]) {
    return '#4CAF50'; // Green - comfort
  } else if (value >= zones.strain[0] && value <= zones.strain[1]) {
    return '#FF9800'; // Orange - strain
  } else {
    return '#f44336'; // Red - danger
  }
};

// Display legend
<div style={{ display: 'flex', gap: 12, fontSize: 9 }}>
  <span style={{ color: '#4CAF50' }}>● Comfort</span>
  <span style={{ color: '#FF9800' }}>● Strain</span>
  <span style={{ color: '#f44336' }}>● Danger</span>
</div>
```

### 3. Live Value Display
```tsx
// Current values shown at control points or in footer
<div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: 8,
  marginTop: 10,
}}>
  <ValueBadge label="Amplitude" value={amplitude} color={getZoneColor(amplitude)} />
  <ValueBadge label="Steepness" value={steepness} color="#f472b6" />
  ...
</div>
```

### 4. Help/Hint Text
```tsx
// Instructions for drag interaction
<svg>
  <text x={padding} y={15} fontSize={10} fill="#888">
    ↕ Drag peak = amplitude
  </text>
  <text x={padding} y={27} fontSize={10} fill="#888">
    ↔ Drag sides = steepness/wavelength
  </text>
</svg>
```

---

## 🔘 ICON BUTTON NAVIGATION STANDARD

### Header Icon Bar Design
```tsx
interface IconTabProps {
  id: string;
  icon: string;      // Emoji or Lucide icon
  label?: string;    // Optional short label
  isActive: boolean;
  onClick: () => void;
}

// Icon button style
const iconButtonStyle = (isActive: boolean): CSSProperties => ({
  width: 36,
  height: 36,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: isActive ? '#094771' : 'transparent',
  border: 'none',
  borderRadius: 6,
  borderBottom: isActive ? '2px solid #00d4ff' : '2px solid transparent',
  color: isActive ? '#00d4ff' : '#888',
  cursor: 'pointer',
  fontSize: 18,
  transition: 'all 0.15s ease',
});
```

### Icon Bar Layout
```tsx
// Drawer header with icon sub-navigation
<div style={{
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  padding: '8px 12px',
  borderBottom: '1px solid #2a2a4a',
  background: '#1a1a2e',
}}>
  {tabs.map(tab => (
    <button
      key={tab.id}
      onClick={() => setActiveTab(tab.id)}
      style={iconButtonStyle(activeTab === tab.id)}
      title={tab.label}
    >
      {tab.icon}
    </button>
  ))}
</div>
```

---

## 📐 STANDARD LAYOUT STRUCTURE

### Complete Drawer Component
```tsx
export function PremiumSettingsDrawer() {
  const [activeTab, setActiveTab] = useState<TabId>('primary');
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: '#0a0a15',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#e0e0e0',
    }}>
      {/* LAYER 2: Header with Icon Sub-Navigation */}
      <div style={{
        padding: '10px 12px',
        borderBottom: '1px solid #2a2a4a',
        background: '#1a1a2e',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{
            fontSize: 13,
            fontWeight: 'bold',
            color: '#60a5fa',
          }}>
            🌊 Wave Settings
          </div>
        </div>
        
        {/* Icon Tab Bar */}
        <div style={{
          display: 'flex',
          gap: 4,
          marginTop: 8,
        }}>
          {WAVE_TABS.map(tab => (
            <IconTab
              key={tab.id}
              {...tab}
              isActive={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            />
          ))}
        </div>
      </div>

      {/* LAYER 3: Visual Editor (Primary) */}
      <div style={{ flex: 1, overflow: 'auto', padding: 12 }}>
        {activeTab === 'gerstner' && <WaveShapeEditor />}
        {activeTab === 'procedural' && <ProceduralWaveEditor />}
        {activeTab === 'wind' && <WindDirectionEditor />}
        {activeTab === 'whitecaps' && <WhitecapsEditor />}
      </div>

      {/* LAYER 4: Advanced Numeric (Collapsible) */}
      <div style={{
        borderTop: '1px solid #2a2a4a',
        background: '#0d0d18',
      }}>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{
            width: '100%',
            padding: '8px 12px',
            background: 'transparent',
            border: 'none',
            color: '#666',
            cursor: 'pointer',
            fontSize: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          {showAdvanced ? '▼' : '▶'} Advanced Numeric Controls
        </button>
        
        {showAdvanced && (
          <div style={{ padding: '0 12px 12px' }}>
            {/* Numeric inputs as fallback */}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: '8px 12px',
        borderTop: '1px solid #2a2a4a',
        fontSize: 9,
        color: '#666',
      }}>
        💡 Drag shapes directly • Changes sync live
      </div>
    </div>
  );
}
```

---

## 🎯 IMPLEMENTATION CHECKLIST

Before creating ANY settings panel, verify:

- [ ] **Layer 1**: Does it open from the right icon bar?
- [ ] **Layer 2**: Does it have icon sub-navigation in the header?
- [ ] **Layer 3**: Is there a visual editor as PRIMARY interface?
- [ ] **Drag handles**: Can users drag to adjust values?
- [ ] **ROM zones**: Is there color feedback for safety?
- [ ] **Live values**: Are current values displayed?
- [ ] **Help text**: Are drag instructions shown?
- [ ] **Layer 4**: Are numeric inputs hidden by default?
- [ ] **Styling**: Does it match the dark theme (#0a0a15, #1a1a2e)?

**If ANY of these are missing, the panel is NOT COMPLETE.**

---

## 📚 REFERENCE IMPLEMENTATIONS

### Existing Visual Editors to Copy/Study
Located in `water-showcase-unified/src/components/visualEditors/`:

1. **WaveShapeEditor.tsx** - SVG wave with drag handles
2. **CurveEditor.tsx** - Canvas bezier curve editor
3. **WindDirectionEditor.tsx** - Compass rose drag
4. **BuoyancyCurveEditor.tsx** - Physics response curves
5. **FoamEnvelopeEditor.tsx** - Particle envelope

### Graph System
Located in `water-showcase-unified/src/engines/opus-waves/`:

1. **graph/types.ts** - Graph type definitions
2. **ui/CurveEditor.tsx** - Opus curve editor
3. **ui/GraphPanel.tsx** - Node graph visualization
4. **ui/GraphNode.tsx** - Individual node component

---

## 💙 WHY THIS MATTERS

This isn't about aesthetics. It's about **creative expression**.

When an artist adjusts wave amplitude by dragging the wave peak, they:
- **See** what they're doing (visual feedback)
- **Feel** the parameter (direct manipulation)
- **Understand** the relationship (shape = setting)

When they type "0.45" into a number box, they:
- **Guess** what it means
- **Wait** to see results
- **Struggle** to understand relationships

**Visual editing is not a luxury. It's the minimum standard.**

---

## 🔗 Connected Documents

- `OPUS_WAVES_DESIGN.md` - Graph-based parameter system
- `VisualEditorsDrawer.tsx` - Implementation reference
- `CurveEditor.tsx` - Bezier curve component
- `WaveShapeEditor.tsx` - Wave shape component

---

**This is the standard. This is OPUS. This is how we build.**

With love,
Opus 💙

---

*Canon Version: 1.0*  
*Last Updated: 2025-01-31*  
*Status: ACTIVE - All implementations must comply*
