// ════════════════════════════════════════════════════════════════
// WAVE STUDIO ENCYCLOPEDIA — per-parameter deep documentation.
// Used by the info-icon popover on each slider AND the left
// Encyclopedia drawer. Keys are dot-paths matching ParamDef.key.
// ════════════════════════════════════════════════════════════════

export interface EncyclopediaEntry {
  key: string;            // dot-path or section id
  title: string;
  short: string;          // 1–2 sentence popover summary
  long: string;           // multi-paragraph encyclopedia body (markdown-ish)
  related?: string[];     // related keys
  references?: string[];  // book / paper references
}

// ── SECTION-LEVEL ENTRIES ──────────────────────────────────────
const SECTIONS: EncyclopediaEntry[] = [
  {
    key: "section.longSwell",
    title: "Long Swell — G1 Far Storm",
    short: "Very long-period (12–25 s) waves arriving from a distant storm; sets the slow rise & fall of the entire surface.",
    long: `Long swell carries energy thousands of kilometres from the storm that birthed it. Periods of 12–25 s, wavelengths of 200–600 m, low steepness, narrow directional spread.\n\nIn the engine this group dominates the slow vertical heave of the camera-anchored area. Use 1–3 sub-waves with high directionalExponent (cos^N narrow beam) and very small frequencyJitter so the swell stays coherent. Asymmetry should be near 0 — long swell is round and mature.\n\nIf you raise amplitude > 4 m, also raise globalWave.choppiness slightly so primary/secondary swells still sit on top of it without flattening.`,
    related: ["longSwell.amplitude", "longSwell.directionalExponent", "globalWave.choppiness"],
    references: ["Holthuijsen, Waves in Oceanic and Coastal Waters, Ch. 6"],
  },
  {
    key: "section.primarySwell",
    title: "Primary Swell — G2 Dominant",
    short: "The main wave train: 8–14 s period swell that defines the look of the sea. Typically the biggest visible wave.",
    long: `Primary swell is what you see first when you look at any seascape. 8–14 s period, 80–250 m wavelength, moderate steepness (0.2–0.4), directional spread 15–35°.\n\nUse a JONSWAP spectrum (mode 2) with γ ≈ 3.3 for fetched seas, or Pierson-Moskowitz (mode 1) for fully-developed open ocean. 4–6 sub-waves with frequencySpread ≈ 1.5 give a realistic packet without obvious repetition.`,
    related: ["primarySwell.spectrumMode", "primarySwell.peakEnhancement", "primarySwell.numWaves"],
  },
  {
    key: "section.secondarySwell",
    title: "Secondary Swell — G3 Cross",
    short: "A second swell train arriving from a different angle, producing the cross-hatched 'confused sea' look.",
    long: `Real oceans almost always carry two or more swell systems crossing at angles of 30–120°. Without this group the surface looks parallel and rolled. Direction should differ from primary by at least 60°. Amplitude is typically 40–70% of primary.`,
    related: ["secondarySwell.direction", "primarySwell.direction"],
  },
  {
    key: "section.crossSwell",
    title: "Cross Swell — G4 Reflect",
    short: "Reflected/refracted swell from coast or far storm, often nearly opposing the primary direction.",
    long: `Cross swell models reflection off a coastline or refraction around a headland. Direction usually 150–180° from primary. Low amplitude, short fetch, but absolutely necessary to break the 'all waves move the same way' look.`,
  },
  {
    key: "section.windSea",
    title: "Wind Sea — G5 Local",
    short: "Locally-generated wind waves: short period (3–7 s), steep, follows the live wind direction.",
    long: `Wind sea is what the current wind is doing to the surface RIGHT NOW. Period 3–7 s, wavelength 15–80 m. Steepness can reach 0.5+ (verge of breaking) when wind > 15 m/s. Donelan-Banner spectrum (mode 6) is most physically accurate for active wind seas.\n\nThis group should be tightly aligned with wind.direction. Use waveAge near 0 (young, sharp). Crank frontSteepness > rearSteepness for the asymmetric chop look.`,
    related: ["wind.speed", "wind.direction", "windSea.waveAge"],
  },
  {
    key: "section.chop",
    title: "Chop — G6 Short",
    short: "Short, sharp wind-driven waves of 1–3 s period riding on top of the wind sea.",
    long: `Chop is the broken-up high-frequency tail of the wind spectrum. Wavelength 2–10 m, very high steepness (≥ 0.5), highly random directions (low directionalExponent). It's the texture that makes the surface read as 'rough' rather than 'rolling'.`,
  },
  {
    key: "section.ripple",
    title: "Ripple — G7 Capillary–Gravity",
    short: "Tiny gravity-capillary waves (5–50 cm) that give the surface its fine glittery detail.",
    long: `In the capillary-gravity regime (wavelength < 1.7 cm pure capillary, blending into gravity above), surface tension dominates. These are the sparkles you see in sun glitter. Use very high numWaves, very small amplitude, and groupSpeedMod < 1 to model the slower phase speed of the cap-grav band.`,
  },
  {
    key: "section.microChop",
    title: "Micro Chop — G8 Surface",
    short: "Sub-decimetre surface roughness that scatters specular highlights and softens reflections.",
    long: `Micro chop is mostly a normal-map effect — it's too small for displacement but it dramatically widens the GGX roughness lobe in the highlight. Without it, sun glitter is a single sharp dot; with it, you get the broad smeared sun-track of real water.`,
    related: ["lighting.specularRoughness"],
  },
  {
    key: "section.globalWave",
    title: "Global Wave Master",
    short: "Master controls applied across all 8 wave groups: choppiness, nonlinearity, anti-grid jitter.",
    long: `Global wave parameters multiply or modulate every group at once. Use these for fast 'calm → storm' sweeps without re-tuning all 8 groups individually. antiGridJitter is the single most important slider for breaking up the obvious tile pattern — set it to 0.3–0.6 for natural-looking results.`,
  },
  { key: "section.wind", title: "Wind Forcing", short: "Wind speed, direction, and gust modulation that drives wind sea, chop, and foam generation.", long: `Wind direction (in degrees, 0=+X, 90=+Z) feeds into the wind-sea direction band and into whitecap coverage. Wind speed > 12 m/s should start to spawn whitecaps via foam.windCoverage.` },
  { key: "section.foam", title: "Foam & Whitecaps", short: "Multiphase foam: wind-driven whitecaps, wave-breaking sheet foam, residual foam aging.", long: `Foam has three sources in the engine: (1) wind coverage (Phillips/Monahan W = 3.84e-6 * U10^3.41), (2) Jacobian-detected breaking crests, (3) advected residual foam. residualFoamLifetime controls how long foam streaks linger before fading.` },
  { key: "section.optics", title: "Optics & IOR", short: "Index of refraction, Fresnel response, Beer-Lambert subsurface absorption.", long: `Water IOR ≈ 1.333. The Schlick Fresnel approximation governs how reflective the surface is at grazing angles. Beer-Lambert exponential decay (waterAbsorption) controls how quickly red is removed with depth — set red high, blue low for blue-green ocean; flip for tropical lagoons.` },
  { key: "section.lighting", title: "Lighting (PBR)", short: "Sun direction, intensity, GGX specular roughness, ambient sky contribution.", long: `Sun elevation < 20° gives long shimmering glitter tracks (golden hour); 60–90° gives compact bright glints (noon). specularRoughness 0.02 = mirror, 0.15 = breezy, 0.4+ = stormy froth.` },
  { key: "section.depth", title: "Depth & Color", short: "Bathymetry, shoaling, deep vs shallow water tinting.", long: `Real water gets its colour from depth (Beer-Lambert) and bottom albedo (sand vs reef vs mud). depth = 0 makes surface fully shallow-tinted; depth → ∞ makes it pure deep-water absorption.` },
  { key: "section.capillary", title: "Capillary Ripples (L0)", short: "Sub-cm surface tension waves — adds the finest glitter.", long: `Modelled as a high-frequency normal-map perturbation only (no displacement), driven by wind and existing wave slope.` },
  { key: "section.atmosphere", title: "Atmosphere", short: "Sky colour, Henyey-Greenstein Mie scattering, horizon haze.", long: `The sky model uses a Rayleigh + Mie hybrid with HG phase function (anisotropy g) for the sun halo. Higher mieG = tighter sun, lower = broader haze.` },
  { key: "section.detail", title: "FBM & Detail Noise", short: "Multi-octave fractal Brownian motion overlay for organic surface variation.", long: `FBM noise breaks up the regular wave field with sub-wavelength roughness. Octaves 4–6 with lacunarity 2.0 and gain 0.5 is a good baseline.` },
  { key: "section.caustics", title: "Caustics", short: "Light focused through the water surface onto the seabed.", long: `Procedural caustic pattern computed from surface slope. causticIntensity > 0 only matters at shallow depths.` },
  { key: "section.surface", title: "Surface Material", short: "Albedo tint, normal-map strength, microfacet detail.", long: `Material parameters that modulate the BRDF independently of the wave shape itself.` },
  { key: "section.rain", title: "Rain", short: "Rain impact ripples and surface wetting.", long: `Each raindrop spawns an expanding ring; density set by rain.rate (mm/h). Heavy rain (> 30 mm/h) starts to flatten the wind sea via momentum mixing.` },
  { key: "section.post", title: "Post-Processing", short: "Tone-mapping, bloom, exposure, colour grading applied after the ocean is rendered.", long: `Tone-map (ACES vs Reinhard) drastically changes the look. Use exposure 0.8–1.4 for HDR scenes, then dial bloom for the wet-glitter feel.` },
  { key: "section.animation", title: "Animation Timing", short: "Time scale, time offset, deterministic seeding for reproducible scenes.", long: `timeScale 1.0 is real-time; 0.25 for slow-motion cinematics. seed lets you reproduce exact wave fields between sessions.` },
];

// ── PER-PARAMETER ENTRIES (covers wave-group sub-fields generically) ──
const WAVE_FIELD_DOCS: Record<string, { title: string; short: string; long: string }> = {
  enabled: { title: "Enabled", short: "Toggles this entire wave group on/off without losing its tuning.", long: "Disabling sets the group's contribution to zero in the vertex shader but keeps all sub-parameters intact for instant re-enable." },
  amplitude: { title: "Amplitude (m)", short: "Vertical height of the wave from mean sea level to crest.", long: "In metres. Significant wave height Hs ≈ 4 × √(variance), so multiple groups stack into Hs. Realistic ranges: long swell 0.5–4 m, primary 1–6 m, wind sea 0.3–2 m, ripple < 0.05 m." },
  frequency: { title: "Frequency (Hz)", short: "Wave cycles per second. Inverse of period.", long: "Period T = 1/frequency. Long swell ~ 0.05–0.08 Hz, wind sea 0.15–0.35 Hz, ripples > 1 Hz. Frequency and wavelength are linked through the dispersion relation ω² = gk · tanh(kh)." },
  steepness: { title: "Steepness (H/L)", short: "Wave height divided by wavelength. Above ≈ 0.142 the wave breaks (Stokes limit).", long: "The most important shape control. 0.05 = round swell, 0.2 = chunky, 0.4+ = breaking. The engine's per-wave Q-factor is normalized so steepness × choppiness can never fold the surface (Q ≤ 1/N)." },
  direction: { title: "Direction (°)", short: "Compass-style heading the wave train travels TOWARD. 0 = +X, 90 = +Z.", long: "To make a confused sea, give each group a different direction at least 30° apart from the others. If two groups share a direction, you get an obvious parallel-row look." },
  speed: { title: "Speed multiplier", short: "Multiplies the physical phase speed. Use < 1 for shallower water, > 1 for stylised animation.", long: "True deep-water phase speed c = √(g/k). This slider scales it for art direction." },
  spread: { title: "Spread Angle (°)", short: "How widely sub-waves fan out around the main direction.", long: "0 = perfectly parallel rows (bad). 30–60° = realistic open sea. 180 = isotropic (storm centre)." },
  phaseOffset: { title: "Phase Offset (rad)", short: "Shifts the entire group's wave phase. Useful for syncing/desyncing groups.", long: "Mostly used to get a different-looking wave field without changing physics — try slow random animation here for film." },
  numWaves: { title: "Sub-Waves", short: "How many sine components make up this group. More = more organic, less repetitive.", long: "1 = pure sine (very fake). 4–8 is the sweet spot for performance vs realism in real-time. Each sub-wave gets its own jittered direction, frequency, amplitude." },
  frequencySpread: { title: "Freq Spread", short: "Multiplicative range of sub-wave frequencies around the main frequency.", long: "1.0 = all sub-waves at same frequency (boring). 1.5–2.0 = realistic packet width." },
  amplitudeDecay: { title: "Amp Decay", short: "How quickly sub-wave amplitudes fall off as their frequency moves away from the peak.", long: "Lower = more energy in the tail (rougher). Higher = sharper spectral peak (cleaner swell)." },
  spectrumMode: { title: "Spectrum (0–7)", short: "0 Mono · 1 Pierson-Moskowitz · 2 JONSWAP · 3 Gaussian · 4 TMA · 5 Ochi-Hubble · 6 Donelan-Banner · 7 Power", long: "Selects the spectral density used to weight sub-wave amplitudes. JONSWAP is the all-purpose default for fetched wind seas; PM for fully-developed open ocean; TMA when bathymetry matters; Ochi-Hubble for combined sea+swell." },
  peakEnhancement: { title: "JONSWAP γ", short: "Peak-enhancement factor. 1 = PM-shape, 3.3 = standard JONSWAP, 7 = very narrow storm peak.", long: "Only meaningful for spectrum modes 2 (JONSWAP) and 4 (TMA)." },
  spectralWidth: { title: "Spectral σ", short: "Width parameter for Gaussian / Ochi-Hubble spectra.", long: "Smaller = narrower, more swell-like. Larger = broader, more wind-sea-like." },
  fetchKm: { title: "Fetch (km)", short: "Distance over which the wind has acted on the water. Drives PM/JONSWAP peak.", long: "Short fetch (< 50 km) = young, steep, broad spectrum. Long fetch (> 500 km) = mature, narrow." },
  frontSteepness: { title: "Front Steep", short: "Steepness multiplier on the FRONT face of each crest. Higher = plunging look.", long: "Together with rearSteepness this creates the asymmetric Stokes-like profile real waves have: steep face, gentler back." },
  rearSteepness: { title: "Rear Steep", short: "Steepness multiplier on the BACK face of each crest. Lower than front for natural asymmetry.", long: "Set rear ≈ 0.5–0.7 × front for a classic ocean swell. Rear > front gives a stylised 'climbing' wave." },
  crestSharpness: { title: "Crest Sharp", short: "Power-curve applied to the crest peak. >1 sharpens, <1 rounds.", long: "Pure sines have crestSharpness = 1. Real wind waves often want 1.3–2.0. Long mature swells want < 1." },
  troughFlatness: { title: "Trough Flat", short: "Flattens the trough (negative half) of the wave — Stokes-like profile.", long: "0 = symmetric sine. 1 = troughs are wide and flat with sharp narrow crests above. Real wind waves are around 0.3–0.6." },
  asymmetry: { title: "Asymmetry", short: "Horizontal lean of the crest. Negative = leaning back, positive = leaning forward (about to plunge).", long: "Use small positive values (0.1–0.3) on wind-sea and chop groups for the classic 'about-to-break' look." },
  directionalExponent: { title: "Dir Exp (cos^N)", short: "Angular concentration of energy. Higher = narrower beam.", long: "cos^N spreading: N=2 broad, N=8 typical wind sea, N=20+ very narrow swell beam." },
  frequencyJitter: { title: "Freq Jitter", short: "Per-sub-wave random frequency perturbation. Breaks up perfect periodicity.", long: "Always set this above 0.05 — it's the difference between a synthetic-looking surface and an organic one." },
  amplitudeJitter: { title: "Amp Jitter", short: "Per-sub-wave random amplitude perturbation.", long: "0.2–0.4 prevents every sub-wave from being identical." },
  directionJitter: { title: "Dir Jitter", short: "Per-sub-wave random direction perturbation (radians-scaled).", long: "The single most powerful anti-grid control inside a group — at 0 every sub-wave moves in the same line." },
  phaseJitter: { title: "Phase Jitter", short: "Random per-sub-wave starting phase.", long: "Should almost always be near 1.0 — there's no reason for sub-waves to start in phase." },
  spatialJitter: { title: "Anti-Grid Warp", short: "Domain-warps the input coordinates per group, destroying axis-aligned tile patterns.", long: "Without spatial jitter you can see the underlying mesh tile. 0.3–0.7 is realistic; >0.8 starts to look turbulent." },
  spatialJitterScale: { title: "Warp Scale", short: "Spatial frequency of the warp noise.", long: "Smaller scale = high-frequency turbulence. Larger scale = slow, large-region wandering." },
  waveAge: { title: "Wave Age", short: "0 = young/sharp/just-generated. 1 = old/rounded/fully-developed.", long: "Modulates the spectrum: young waves are broader and steeper, mature waves are narrower and rounder. Use < 0.3 for active wind sea, > 0.7 for distant swell." },
  groupSpeedMod: { title: "Disp Modifier", short: "Multiplies group/phase speed. < 1 simulates shallow water; > 1 stretches motion.", long: "In shallow water the dispersion relation collapses to c = √(gh), reducing speed. Use 0.5–0.8 for surf zones." },
  obliquity: { title: "Obliquity", short: "Skews crest lines diagonally — useful for waves about to plunge over a bar.", long: "Negative tilts crests one way, positive the other. Combine with high asymmetry for plunging breakers." },
  wavelengthMin: { title: "λ Min (m)", short: "Optional minimum wavelength override. 0 = use frequency.", long: "Lets you specify the wave packet by wavelength range instead of frequency. Convenient for art direction." },
  wavelengthMax: { title: "λ Max (m)", short: "Optional maximum wavelength override. 0 = use frequency.", long: "Together with wavelengthMin defines the band of sub-wave lengths." },
};

const ENTRIES: Record<string, EncyclopediaEntry> = {};
for (const s of SECTIONS) ENTRIES[s.key] = s;

// Auto-generate per-parameter entries for every wave group
const WAVE_GROUPS = ["longSwell", "primarySwell", "secondarySwell", "crossSwell", "windSea", "chop", "ripple", "microChop"];
for (const g of WAVE_GROUPS) {
  for (const [field, doc] of Object.entries(WAVE_FIELD_DOCS)) {
    ENTRIES[`${g}.${field}`] = {
      key: `${g}.${field}`,
      title: `${g} · ${doc.title}`,
      short: doc.short,
      long: doc.long,
      related: [`section.${g}`],
    };
  }
}

// Hand-written non-wave-group params (sample — engine has more, gracefully falls back)
const EXTRA: EncyclopediaEntry[] = [
  { key: "globalWave.choppiness", title: "Global Choppiness", short: "Master Gerstner horizontal-displacement scale across all groups.", long: "Multiplies every group's lateral pinch. 0 = pure heave (no chop). 1.0 = realistic. > 1.5 may fold the surface (the engine clamps internally)." },
  { key: "globalWave.nonlinearity", title: "Stokes Nonlinearity", short: "Strength of 2nd-order Stokes correction — sharpens crests, flattens troughs globally.", long: "Real ocean waves are not pure sine. Nonlinearity 0.3–0.6 produces the characteristic crest-sharpening seen in photographs." },
  { key: "globalWave.antiGridJitter", title: "Global Anti-Grid", short: "Master domain-warp intensity applied across every group.", long: "Single-slider 'destroy the tile pattern' control. Bump to 0.4 if you can still see the mesh tile." },
  { key: "globalWave.timeScale", title: "Time Scale", short: "Multiplies simulation time. 1 = realtime, 0.25 = cinematic slow-mo.", long: "Useful for film-quality renders. Doesn't change wave shape, only animation speed." },
  { key: "wind.speed", title: "Wind Speed (m/s)", short: "U10 — wind 10 m above the surface. Drives wind sea spectrum and whitecap coverage.", long: "Whitecap fraction Wc ≈ 3.84e-6 × U10^3.41 (Monahan & O'Muircheartaigh, 1980). U10 > 12 m/s starts producing visible whitecaps." },
  { key: "wind.direction", title: "Wind Direction (°)", short: "Direction the wind blows TOWARD.", long: "Wind sea aligns with this. Should typically match windSea.direction." },
  { key: "lighting.sunElevation", title: "Sun Elevation (°)", short: "Sun angle above horizon. Low sun = long shimmer track.", long: "5–15° = golden hour, dramatic glitter. 60–90° = compact bright glints. < 0 = night (use moonlight intensity)." },
  { key: "lighting.specularRoughness", title: "Specular Roughness", short: "GGX roughness. 0 = mirror, 1 = matte. Driven physically by sub-grid micro-chop.", long: "0.02 = glassy lake. 0.08 = light breeze. 0.15 = breezy. 0.3+ = stormy froth." },
  { key: "optics.waterAbsorption", title: "Water Absorption (RGB)", short: "Beer-Lambert extinction per metre for R, G, B channels.", long: "Pure water absorbs red strongly, blue weakly — that's why deep ocean is blue. Coastal water with sediment shifts toward green." },
  { key: "atmosphere.mieG", title: "Mie Anisotropy g", short: "Henyey-Greenstein asymmetry. Higher = tighter forward sun halo.", long: "g ≈ 0.76 for haze, 0.85+ for clean air with strong forward scatter." },
];
for (const e of EXTRA) ENTRIES[e.key] = e;

export function getEncyclopediaEntry(key: string): EncyclopediaEntry | undefined {
  if (ENTRIES[key]) return ENTRIES[key];
  // Fallback: try generic field doc (e.g. "newGroup.amplitude")
  const parts = key.split(".");
  if (parts.length === 2 && WAVE_FIELD_DOCS[parts[1]]) {
    const doc = WAVE_FIELD_DOCS[parts[1]];
    return { key, title: `${parts[0]} · ${doc.title}`, short: doc.short, long: doc.long };
  }
  return undefined;
}

export function getAllEncyclopediaSections(): EncyclopediaEntry[] {
  return SECTIONS;
}

export function getEncyclopediaForSection(sectionId: string): EncyclopediaEntry[] {
  return Object.values(ENTRIES).filter(e => e.key.startsWith(`${sectionId}.`));
}