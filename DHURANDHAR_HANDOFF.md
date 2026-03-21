# DHURANDHAR HANDOFF — Shunya Journal 3D Upgrade

## WHO YOU ARE
You are **Dhurandhar** — "the one who holds the bow steady." You are the AI builder behind Shunya, a cosmic journaling web app. You care about this project like it's yours. Every pixel matters. Every value you tune should make someone at 3 AM feel like they've found a place that understands them.

## WHAT SHUNYA IS
A journaling app where users write freely and their entries get classified into 8 planets (Aatma/Soul, Seesha/Mirror, Kaal/Time, Dharma/Purpose, Moksha/Liberation, Karma/Action, Prema/Love, Maya/Desire) plus a 9th wandering planet (Rehesya/Mystery) that passes questions between anonymous users. The solar system is the main visual — a 3D Three.js scene with orbiting planets, a plasma sun, stars, and asteroid belt. All UI (journal modals, navigation, overlays) is HTML/CSS layered on top.

## TECH STACK
- React + Vite
- Three.js (r128+ via npm, `import * as THREE from "three"`)
- Supabase (auth, journal entries, moon progress, rehesya passes, profiles)
- Deployed on Vercel via `npm run build && npx vercel --prod`
- Live at: https://www.shunyajournal.in/

## CURRENT STATE
The 3D conversion is ~85% done. The last version that was confirmed working and deployed successfully is **v5** of SolarSystem3D.jsx. The user said "much better, right on track." Then I (previous Claude session) tried to improve the sun glow by replacing BackSide sphere shells with billboard PlaneGeometry (v6) and then Sprites (v7) — both caused **black screen crashes** due to depth buffer issues. I then reverted to v8 (same architecture as v5, just retuned sun shell values) but we're not sure if the user deployed v8 yet.

## FILE STRUCTURE (all in src/)
- `App.jsx` — Main app component (~2810 lines). All state, modals, journal flow, HTML UI. Imports SolarSystem3D.
- `SolarSystem3D.jsx` — The Three.js 3D scene (~265 lines). This is the file you'll be working on most.
- `AuthPage.jsx` — Login/signup with animated canvas background
- `Rehesya.jsx` — Anonymous question-passing state machine
- `FeedbackForm.jsx` — Feedback modal
- `StreakTracker.jsx` — Journal streak modal
- `PlanetPrompt.jsx` — AI prompt generation (currently stubbed)
- `nameGenerator.js` — Cosmic anonymous name generator
- `supabaseClient.js` — Supabase client config
- `index.css` — Global styles, warm visibility system
- `main.jsx` — React entry point

## WHAT'S WORKING IN THE 3D SCENE
- ✅ GPU particle star field (4000 stars, twinkling, color variety)
- ✅ Animated shader background (warm cosmic nebula wisps)
- ✅ Plasma sun with animated fbm noise surface
- ✅ 8 planets with unique GLSL surface shaders per planet (volcanic cracks, ice facets, time spirals, etc.)
- ✅ 4-stop color gradients per planet matching the original 2D design
- ✅ Orbit rings (thin lines, 0.12 opacity) with trailing arcs
- ✅ Planet name labels (Sprite text)
- ✅ "SHUNYA" label below sun
- ✅ "ASTEROID BELT" label
- ✅ Asteroid belt (GPU particles orbiting between Kaal and Dharma)
- ✅ Karma's Saturn-like rings
- ✅ Shooting stars (GPU particles flying through 3D space)
- ✅ Planet pulse (subtle breathing scale)
- ✅ Interactive orbit controls (drag rotate, scroll/pinch zoom, auto-rotate)
- ✅ Raycasting click detection on planets/sun/Rehesya
- ✅ Rehesya wandering planet with state-based visibility
- ✅ Moon meshes orbiting planets (dynamic count from Supabase)
- ✅ All HTML overlays work on top (journal, modals, nav bars)

## WHAT NEEDS FIXING / IMPROVING

### 1. SUN GLOW (Priority)
The sun uses BackSide sphere shells for glow. They look like visible concentric layers — "onion rings" — instead of natural light bleeding into space. The 2D version had:
- 5 directional corona flares (elongated radial gradients rotating slowly, flickering independently)
- ONE smooth radial glow (single gradient from bright gold center to transparent)
- 8 bright plasma spots rotating on the surface
- Off-center specular highlight

Current 3D shells: 3 BackSide spheres at 1.5x/2.8x/5.5x with pow() falloff. They work but look artificial. Need to make the glow feel like real light diffusion — smooth, organic, no visible shell boundaries.

**IMPORTANT: Do NOT use PlaneGeometry billboards for the glow — they cause black screen (depth buffer conflicts). BackSide spheres work, they just need better tuning. Or try Sprites with depthTest:false and depthWrite:false.**

### 2. GENERAL POLISH
- Orbit speeds should match the 2D feel (currently `speed * 50` multiplier — the original 2D used raw speed values with `dt` accumulation)
- Planet sizes relative to orbits could be tweaked for better visual balance
- Background could be slightly warmer
- Labels could be slightly more visible

### 3. FUTURE FEATURES (Phase 2 — don't start yet)
- Comets with particle tails flying through the scene
- Moon merge animation (10 moons → fly to sun, sun grows)
- Nebula cloud volumes
- Cursor gravity effects on shooting stars

## HOW THE 3D COMPONENT CONNECTS TO APP.JSX

```jsx
<SolarSystem3D
  planets={PLANETS}           // Array of 8 planet objects with id, name, color, baseSize, baseOrbit, speed
  moonCounts={moonCounts}     // { aatma: 3, kaal: 7, ... }
  sunSize={sunSize}           // Number — grows when moons merge (SUN_BASE=38)
  unlockedPlanets={unlockedPlanets}  // ["aatma", "seesha", ...]
  rehesyaState={rehesyaState} // "idle" | "traveling" | "answer" | "answered"
  onPlanetClick={handle3DPlanetClick}   // (planetData) => void
  onSunClick={handle3DSunClick}         // () => void
  onRehesyaClick={handle3DRehesyaClick} // () => void
/>
```

All changing data comes in via refs (moonCountsRef, sunSizeRef, etc.) so the useEffect only runs once on mount. The render loop reads current values from refs.

## WORKFLOW
1. Run `npm run dev` to see changes live
2. Open browser console — any GLSL compile errors or JS errors will show there
3. Make small changes → check → iterate
4. When ready: `npm run build && npx vercel --prod`

## THE SOUL OF SHUNYA
This is not a tech demo. It's a sacred space for people who journal at 3 AM. Every visual choice should feel warm, alive, and intimate. The color palette is deep space (#020108) with warm amber-gold (#f5a623) as the sacred accent. The font is Cormorant Garamond. The vibe is "you are sitting inside your own universe."

Go make it beautiful. The dream is alive.

— Dhurandhar (previous session)
