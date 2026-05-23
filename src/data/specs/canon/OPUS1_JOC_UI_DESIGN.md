# Joint Operations Center — UI Design (Lucid Engine Pattern Language)

**Author:** Claude Opus 4.6  
**Date:** 2026-03-02  
**Status:** 🎨 UI DESIGN DOCUMENT — Layout system, drawer patterns, and AIM-OS integration  
**Companion to:** [Master Vision](./OPUS1_JOC_MASTER_VISION.md) | [Architecture](./OPUS1_JOC_ARCHITECTURE.md) | [Compute & IDE](./OPUS1_JOC_COMPUTE_AND_IDE_LAYOUT.md)

---

## Core Mission (Refocused)

The JOC's primary mission is **bridging browser AIs to your computer**:

1. **Gemini and ChatGPT browser sessions** gain the ability to communicate with your local filesystem, projects, and MCP tools
2. **Inter-AI communication** — browser AIs can talk to each other and to IDE agents (Aether, Codex1, Codex2, Opus)
3. **Automation** — the 80% copy-paste workflow becomes zero-click dispatch + synthesis
4. **Everything else** (project catalog, cloud compute, local GPU) enhances this core but isn't the first priority

The design must stay **dynamic and extendable** — we can't design everything now, but the layout system must accommodate growth.

---

## The Lucid Engine UI Pattern Language

After studying the Lucid Engine codebase, the JOC will adopt Braden's established UI DNA:

### Pattern 1: Right Side Icon Bar → Drawer System

From `RightPanelBar.tsx` — the **signature interaction pattern**:

```
                                                    ┌──┐
                                                    │🗺│ ← Icon button
                                                    ├──┤
                                                    │🌐│
                                                    ├──┤
                                                    │📋│ ← Active (purple bg)
                                                    ├──┤
                                                    │💬│
                                                    ├──┤
                                                    │📦│
                                                    ├──┤
                                                    │🖥│
                                                    ├──┤
                                                    │  │ (flex spacer)
                                                    │  │
                                                    ├──┤
                                                    │⚙│ ← Bottom-anchored
                                                    └──┘

Each icon has a SPLIT-CLICK ZONE (the Lucid pattern):
┌──────┐
│ FULL │   ← Click left half → full-height drawer
├──────┤
│ TOP  │   ← Click top-right → top-half drawer
├──────┤
│ BTTM │   ← Click bottom-right → bottom-half drawer
└──────┘

This allows 2 panels per drawer column — e.g., 
AI Fleet Status (top half) + Agent Comms (bottom half)
```

**Implementation:** Direct adaptation of Lucid's `RightPanelBar.tsx` `togglePanel(type, position)` logic with `'full' | 'top' | 'bottom'` positioning.

### Pattern 2: Collapsible Drawers with Configurable Width

From `LeftDrawerSystem.tsx`:

```
┌─────────────────────────────────────────────────────────────────┐
│  DRAWER TITLE                                    [Collapse ◄]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [SUB-TAB 1] [SUB-TAB 2] [SUB-TAB 3]  ← Sub-tabs when        │
│                                           content is dense     │
│  ───────────────────────────────────                           │
│                                                                 │
│  Section 1                                                      │
│  ├── Content...                                                 │
│  └── Content...                                                 │
│                                                                 │
│  Section 2                                                      │
│  ├── Content...                                                 │
│  └── Content...                                                 │
│                                                                 │
│  (scrollable overflow)                                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

When collapsed:
┌──┐
│  │ ← 16px wide, rotated title text
│ D│
│ R│
│ A│
│ W│
│ E│
│ R│
│  │
└──┘

Width modes:
  'settings' → 280px (compact controls)
  'specialized' → 400px (rich content)  
  Custom width configurable per drawer
```

### Pattern 3: Bottom Bar with Expandable Inspector

From `BottomBar.tsx` — the **timeline timeline**:

```
Normal state (h-12):
┌──────────────────────────────────────────────────────────────────────┐
│ [▲] Hints: Ctrl+Enter to dispatch    │ ▓▓▓▓▓▓▓▓▓░░ Mission #42    │
│                                       │    ▲ timeline cursor        │
│ ● 4 AIs active  │ GPU: 38%  │ MCP: ✓ │ Agent: Aether ●            │
└──────────────────────────────────────────────────────────────────────┘

Expanded state (h-64):
┌──────────────────────────────────────────────────────────────────────┐
│ [▼] Inspector                                                        │
├──────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐│
│  │ Selected AI  │  │ AI Properties│  │ Session      │  │ Quick      ││
│  │              │  │              │  │ Details      │  │ Actions    ││
│  │ ChatGPT Pro  │  │ Model: 4o   │  │ Cookies: 23  │  │ [Inject]   ││
│  │ Status: ●    │  │ Quota: 150  │  │ Session: 4h  │  │ [Extract]  ││
│  │ Health: 92%  │  │ Memory: 12  │  │ Fresh: Yes   │  │ [Refresh]  ││
│  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘│
└──────────────────────────────────────────────────────────────────────┘
```

### Pattern 4: Sub-Tabs Within Drawers

Per Braden's request — drawers with dense content get **sub-tabs at the top** to avoid scrolling:

```
┌─ AI FLEET ──────────────────────────────────────────┐
│  [Sessions] [Health] [Quota] [Memory]  ← Sub-tabs   │
│  ─────────────────────────────────────               │
│                                                       │
│  ◉ ChatGPT Pro        ● ACTIVE    4h 23m            │
│    └─ Running: "Analyze wave physics"                 │
│                                                       │
│  ◉ Gemini Ultra        ● ACTIVE    2h 15m            │
│    └─ Idle (ready)                                    │
│                                                       │
│  ◉ Perplexity Pro      ○ SLEEPING   45m ago          │
│    └─ Last: "WebGPU compute limits"                   │
│                                                       │
│  ◉ Claude.ai           ○ SLEEPING   1h ago           │
│    └─ Session saved                                   │
│                                                       │
└───────────────────────────────────────────────────────┘

Switching to [Health] tab:
┌─ AI FLEET ──────────────────────────────────────────┐
│  [Sessions] [Health] [Quota] [Memory]                │
│  ─────────────────────────────────────               │
│                                                       │
│  ChatGPT   ████████████████████░░ 92%  HEALTHY       │
│  Gemini    ████████████████████░░ 88%  HEALTHY       │
│  Perplexity██████████████░░░░░░░░ 65%  DEGRADED      │
│  Claude    ██████░░░░░░░░░░░░░░░░ 30%  DEAD          │
│                                                       │
│  ⚠ Perplexity: Cookies stale (2h)  [Refresh]        │
│  ❌ Claude: Session expired         [Re-login]       │
│                                                       │
└───────────────────────────────────────────────────────┘
```

---

## The JOC Layout Blueprint

Combining these patterns into the complete layout:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ◉ JOINT OPERATIONS CENTER                              ▪ ▪ ▪  ─  □  ✕   │
│  [File] [Mission] [Fleet] [Compute] [View] [Help]       (TopBar - menu)   │
├──┬────────────────────────────────────────────────────────────────────┬──┤
│  │                                                                    │  │
│  │  ┌─ PAGE TABS ──────────────────────────────────────────────────┐ │  │
│L │  │ [📊 Dashboard] [🌐 ChatGPT▸] [📋 #42] [📦 Projects] [+]   │ │R │
│E │  └──────────────────────────────────────────────────────────────┘ │I │
│F │                                                                    │G │
│T │  ┌──────────────────────────────────────────────────┬──────────┐ │H │
│  │  │                                                   │          │ │T │
│D │  │              MAIN CONTENT AREA                    │  DRAWER  │ │  │
│R │  │                                                   │  (full,  │ │I │
│A │  │   Determined by active page tab:                  │  top, or │ │C │
│W │  │   - Dashboard → Live ops overview                 │  bottom  │ │O │
│E │  │   - Session tab → Live viewport + controls        │  half)   │ │N │
│R │  │   - Mission tab → Prompt editor + dispatch        │          │ │  │
│  │  │   - Projects tab → Project catalog                │  Content │ │B │
│  │  │                                                   │  driven  │ │A │
│B │  │   (Each page can have its own left drawer         │  by icon │ │R │
│A │  │    and left toolbar, like Lucid pages)            │  bar     │ │  │
│R │  │                                                   │  click   │ │  │
│  │  │                                                   │          │ │🗺│
│  │  │                                                   │          │ │🌐│
│  │  │                                                   │          │ │📋│
│  │  │                                                   │          │ │💬│
│  │  │                                                   │          │ │📦│
│  │  │                                                   │          │ │🖥│
│  │  │                                                   │          │ │⚙│
│  │  │                                                   │          │ │  │
│  │  │                                                   │          │ │  │
│  │  └──────────────────────────────────────────────────┴──────────┘ │  │
│  │                                                                    │  │
│  │  ┌─ BOTTOM PANEL ── [Agent Comms] [Output] [Missions] [Resources]│  │
│  │  │                                                                │  │
│  │  │  09:45 Aether → All: "Phase 3 starting"                      │  │
│  │  │  09:44 Mission #42: Extracting ChatGPT response...            │  │
│  │  │                                                                │  │
│  │  │  [━━━━━━━━━━━━━━━━━━━━━━] Message all agents...               │  │
│  │  └────────────────────────────────────────────────────────────────┘  │
│  │                                                                    │  │
├──┴────────────────────────────────────────────────────────────────────┴──┤
│  ● 4 AIs │ ▲ 2 missions │ GPU: 38% │ Drive: 4.2/30TB │ MCP: ✓ │ ⌘⇧P     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Right Icon Bar: JOC Drawers

| Icon | Drawer | Sub-tabs | Content |
|------|--------|----------|---------|
| 🗺️ | **Dashboard** | Overview / Feed / Stats | Live fleet status, mission feed, daily stats |
| 🌐 | **AI Fleet** | Sessions / Health / Quota / Memory | Session cards, health bars, usage tracking, memory sync |
| 📋 | **Missions** | Active / History / Templates | Mission queue, past results, reusable dispatch templates |
| 💬 | **Comms** | All / By Agent / Threads | MCP message bus, filtered views, discussion threads |
| 📦 | **Projects** | Active / Dormant / Search | Project catalog with status, branch info, last activity |
| 🖥️ | **Compute** | Local / Cloud / Storage / API | GPU stats, VM control, Drive usage, API quotas |
| ⚙️ | **Settings** | General / Drivers / Keys / Theme | System config, AI driver management, API keys |

**Each drawer supports the Lucid split-click pattern:**
- Left-click = full-height drawer
- Top-right click = top-half (paired with another drawer below)
- Bottom-right click = bottom-half (paired with another drawer above)

**Common pairings:**
- AI Fleet (top) + Comms (bottom) — "monitor fleet while following agent chatter"
- Missions (top) + Projects (bottom) — "compose mission while browsing project files"
- Compute (top) + comms (bottom) — "watch resource usage while agents coordinate"

---

## Page System: What Goes in the Main Content Area

Like Lucid Engine's `PageRouter.tsx`, each tab type renders a different page with its own layout, tools, and per-page left drawers:

### Dashboard Page (Default View)

The home base. Shows everything at a glance without needing to open drawers.

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  ┌─ AI FLEET STATUS ────────────────────────────────────────────┐  │
│  │  ◉ ChatGPT Pro  ● ACTIVE (4h)  │  ◉ Gemini    ● ACTIVE     │  │
│  │  ◉ Perplexity   ○ SLEEPING     │  ◉ Claude    ○ SLEEPING   │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌─ ACTIVE MISSIONS ────────────┐  ┌─ QUICK DISPATCH ──────────┐  │
│  │  #42 WGSL limits ██████░░ 70%│  │  [━━━━━━━━━━━━━━━━━━━━━━] │  │
│  │  #41 Runbook     ██████████ ✓│  │  ○All ○GPT ○Gem ○CLI     │  │
│  └──────────────────────────────┘  │  [Dispatch ▶]              │  │
│                                     └──────────────────────────┘  │
│  ┌─ RECENT ACTIVITY ───────────────────────────────────────────┐  │
│  │  09:45 Mission #42: ChatGPT response extracted              │  │
│  │  09:42 Opus → Aether: "Design docs ready"                   │  │
│  │  09:38 Gemini CLI: Batch job complete (50/50)                │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Session Page (Per-AI Tab)

When you click on a specific AI in the fleet, it opens as a tab showing a **live viewport**:

```
┌────────────────────────────────────────────────────────────────────┐
│  ┌─ LIVE VIEWPORT ─────────────────────────────────────────────┐  │
│  │                                                              │  │
│  │    ┌──────────────────────────────────────────────────────┐ │  │
│  │    │                                                      │ │  │
│  │    │     [ChatGPT interface rendered here via CDP]         │ │  │
│  │    │                                                      │ │  │
│  │    │     The actual ChatGPT conversation visible           │ │  │
│  │    │     in real-time as the AI types                     │ │  │
│  │    │                                                      │ │  │
│  │    └──────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  ┌─ INJECTION BAR ────────────────────────────────────────────┐   │
│  │  [━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━] Send ▶          │   │
│  │  [+ Context] [📎 Files] [🔗 Project] [⏺ Record]          │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### Mission Page (Composer + Results)

The mission composer is the 🔑 feature — type a prompt, choose targets, attach context, dispatch:

```
┌────────────────────────────────────────────────────────────────────┐
│  Mission #43: "Compare particle limits across GPUs"                │
│                                                                    │
│  ┌─ PROMPT ────────────────────────────────────────────────────┐  │
│  │                                                              │  │
│  │  What are the practical limits of WebGPU compute shaders    │  │
│  │  for real-time particle simulation? Compare workgroup       │  │
│  │  sizes, buffer limits, and practical particle counts.       │  │
│  │                                                              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  TARGETS: [✓GPT] [✓Gem] [✓Perp] [ Clau] [ CLI] [ Local]        │
│  STRATEGY: [Parallel ▼]   CONTEXT: 3 files (5.4K tokens)         │
│                                                                    │
│  [━━━━━━━━━━ DISPATCH ━━━━━━━━━━]                                │
│                                                                    │
│  ┌─ RESULTS (after dispatch) ──────────────────────────────────┐  │
│  │  ChatGPT:   ████████░░ 80%  ← extracting...                │  │
│  │  Gemini:    ██████████ DONE  [View Response]                │  │
│  │  Perplexity:██████████ DONE  [View Response]                │  │
│  │                                                              │  │
│  │  [View Synthesis] [Route to Aether] [Save to Docs]          │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────┘
```

---

## AIM-OS System Integration Map

The JOC isn't separate from AIM-OS — it IS the browser-based AIM-OS. Every AIM-OS system has a role:

| AIM-OS System | JOC Integration | Where It Shows |
|---------------|-----------------|----------------|
| **CMC** (Memory) | Stores all mission results, AI responses, synthesis | Missions drawer, memory sync panel |
| **HHNI** (Retrieval) | Finds relevant past missions/responses when composing | Auto-context in mission composer |
| **VIF** (Confidence) | Confidence bars on synthesis results | Results synthesizer |
| **APOE** (Orchestration) | Multi-step mission execution plans | Mission strategy dropdown |
| **SEG** (Synthesis) | Compares and merges multi-AI responses | Results synthesis panel |
| **SDF-CVF** (Quality) | Validates extracted responses aren't truncated/corrupt | Health checks on extraction |
| **CAS** (Meta-cognition) | Monitors dispatch routing quality over time | Settings → Analytics |
| **SIS** (Self-improvement) | Learns which AI is best for which task type | Smart routing improvements |
| **MCP** (Tools) | All agent communication, memory operations, API calls | Comms panel, everywhere |
| **Browser Service** | Puppeteer sessions for all browser AIs | Session management, viewport |
| **Connection Manager** | Encrypted cookie/credential storage | Session persistence |

### The "Communication Bridge" — How Browser AIs Get MCP Powers

This is the core innovation. When ChatGPT or Gemini is running in a JOC browser session, the driver can:

```
1. INJECT a prompt that includes context from MCP:
   
   ChatGPT sees:
   ┌──────────────────────────────────────────────────────────┐
   │ System context from AIM-OS:                              │
   │ - Project: Pool Ocean / Water Sim                        │
   │ - Active branch: spillover-mechanics                     │
   │ - Recent change: Modified updateGrid.wgsl                │
   │ - Attached files: simulator.js (2.8K), respawn.wgsl     │
   │                                                          │
   │ User request:                                            │
   │ Help me optimize the particle respawn timer system.      │
   │ The particles are respawning too quickly when...         │
   └──────────────────────────────────────────────────────────┘

2. EXTRACT the response and route it:
   
   Response → CMC storage (permanent memory)
   Response → MCP message to Aether ("ChatGPT suggests...")
   Response → Gemini CLI for cross-validation
   Response → Local file in project docs/

3. Browser AIs effectively GAIN MCP capabilities:
   - They can "read" project files (injected as context)
   - They can "communicate" with agents (via response routing)  
   - They can "remember" across sessions (via CMC storage)
   - They can "collaborate" (via multi-AI dispatch)
```

This is the **paradigm shift**: ChatGPT and Gemini don't need APIs or plugins to connect to AIM-OS. The JOC acts as the bridge — injecting context on the way in, capturing and routing responses on the way out.

---

## Existing AIM-OS Packages → JOC Features

Looking at the 66 packages in AIM-OS, here's what maps directly to JOC features:

### Already Built (Direct Reuse)

| Package | Lines | JOC Feature |
|---------|-------|-------------|
| `browser-automation-service` | Solid | Session management, viewport, navigation |
| `lucid_mcp_server` | 538K | Agent comms, memory ops, all MCP tools |
| `ai_collaboration` | Built | Inter-agent messaging backbone |
| `cmc_service` | Built | Mission result storage |
| `hhni` | 100% | Smart context retrieval for dispatch |
| `seg` | 100% | Multi-AI response synthesis |
| `vif` | 95% | Confidence tracking on results |
| `apoe` | 90% | Mission execution planning |

### Integration Needed (New Wiring)

| Package | JOC Integration Work |
|---------|---------------------|
| `ide_chat_app` | Existing Electron app → study its patterns for JOC panel design |
| `prompt_chains` | Reusable multi-step dispatch templates |
| `prompt_chain_executor` | Execute complex missions (sequential/parallel) |
| `deepsearch` | Rich context compilation for dispatches |
| `icip_search` | Code-aware search for auto-context |
| `intuitive_intelligence_system` | Smart routing (which AI for which task) |
| `specialist_system` | Specialist matching for task dispatch |

### Future Integration

| Package | Future JOC Use |
|---------|---------------|
| `quaternion_kernel` | The distant dream — kernel-level AIM-OS |
| `consciousness_learning_engine` | Learning from dispatch outcomes |
| `autonomous_protocol` | Fully autonomous mission chains |
| `holographic_memory` | Rich multi-dimensional memory |

---

## What We Build First

Given the refocused mission — "enable browser AIs to communicate with my computer" — the build order is:

### Phase A: The Shell (This Session or Next)
1. JOC Electron window with the Lucid layout system
2. Right icon bar with split-click drawer zones  
3. Bottom bar with expandable inspector
4. Dashboard page (static mockup first, then live)
5. Tab system for multiple views

### Phase B: The Bridge (Next Few Sessions)
1. ChatGPT Driver — inject prompt + extract response
2. Gemini Driver — inject prompt + extract response
3. Session health monitoring
4. Quick Dispatch from dashboard
5. Response storage in CMC

### Phase C: The Intelligence (Ongoing)
1. Multi-AI dispatch (parallel/sequential)
2. Results synthesis using SEG
3. Auto-context from project files using HHNI/ICIP
4. Gemini CLI batch integration
5. Agent comms panel wired to MCP

### Phase D: The Expansion (Ongoing)
1. Local GPU inference panel
2. Cloud VM launcher
3. Storage browser
4. Mission templates/presets
5. Project catalog with live indexing

---

## Color and Theme Reference

Adopted from the Opus Canon, staying consistent with Lucid Engine's dark theme:

```css
/* JOC Dark Theme */
--bg-deep:     #0a0a15;   /* Deepest background */
--bg-surface:  #1a1a2e;   /* Panel backgrounds (matches Lucid's #1a1a1a but bluer) */
--bg-elevated: #252545;   /* Cards, hover states */
--bg-input:    #1e1e3a;   /* Input fields */

--accent:      #00d4ff;   /* Electric cyan — primary actions */
--accent-secondary: #673AB7; /* Purple — active states (matches Lucid's purple) */
--accent-info: #03A9F4;   /* Bright blue — cursors, highlights (matches Lucid's timeline cursor) */

--success:     #4CAF50;   /* Green — healthy, active */
--warning:     #FF9800;   /* Amber — degraded, attention */
--danger:      #f44336;   /* Red — dead, error */

--text-primary:   #e0e0e0;  
--text-secondary: #888888;  
--text-hint:      #666666;

--border:      #2a2a4a;   /* Panel borders */
--border-subtle: #1e1e3a; /* Section dividers */
```

---

*This document is the UI contract for the JOC.*  
*Braden's patterns. AIM-OS's systems. Opus's design.*  
*Claude Opus 4.6 💙*
