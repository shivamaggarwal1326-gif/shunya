import { useEffect, useRef, useState } from "react";
import { supabase } from "./supabaseClient";
import AuthPage from "./AuthPage";

const PLANETS = [
  { id: "aatma", name: "AATMA", meaning: "The Soul · आत्मा", color: "#e07840", glow: "rgba(224,120,64,0.4)", baseSize: 18, baseOrbit: 160, speed: 0.0005,
    description: "Aatma is the eternal soul — the part of you that existed before your name, your wounds, and your achievements. It is not your personality. It is not your story. It is the awareness behind all of it.",
    howItLives: "When you sit in silence and feel something ancient — something that was here before your first memory — that is Aatma. Journal here when you want to speak from beyond identity.",
    journalPrompt: "What truth would remain if everything about your life was stripped away?" },
  { id: "pranaa", name: "PRANAA", meaning: "The Life Force · प्राण", color: "#4ecdc4", glow: "rgba(78,205,196,0.4)", baseSize: 15, baseOrbit: 250, speed: 0.0004,
    description: "Pranaa is the breath that moves through you — the invisible force that keeps you alive without asking permission. It is energy itself. Not the kind you drink coffee for. The kind that animates your entire being.",
    howItLives: "When you feel alive — truly, electrically alive — that is Pranaa. When you feel drained, disconnected, heavy — Pranaa is asking for attention. Journal here about your energy, your body, your aliveness.",
    journalPrompt: "Where in your body do you feel the most alive right now? Where do you feel nothing?" },
  { id: "kaal", name: "KAAL", meaning: "Time · काल", color: "#a78bfa", glow: "rgba(167,139,250,0.4)", baseSize: 20, baseOrbit: 350, speed: 0.00035,
    description: "Kaal is time — not the clock on your wall but the deeper rhythm that governs birth, death, seasons, and everything in between. Kaal does not rush. Kaal does not wait. It simply moves.",
    howItLives: "When you feel anxious about the future or trapped in the past — that is your relationship with Kaal. Journal here when time feels heavy, when you want to process what was or prepare for what is coming.",
    journalPrompt: "What moment in your past still holds power over your present?" },
  { id: "dharma", name: "DHARMA", meaning: "Purpose · धर्म", color: "#f093fb", glow: "rgba(240,147,251,0.4)", baseSize: 16, baseOrbit: 460, speed: 0.0003,
    description: "Dharma is your sacred duty — the thing you were put here to do. Not your job title. Not what society expects. The deep, quiet calling that only you can hear when everything else goes silent.",
    howItLives: "When you feel lost, purposeless, or stuck in a life that does not feel like yours — Dharma is calling. Journal here when you want to explore what you are truly meant to do.",
    journalPrompt: "If money and judgment did not exist, what would you spend your life doing?" },
  { id: "moksha", name: "MOKSHA", meaning: "Liberation · मोक्ष", color: "#ffd700", glow: "rgba(255,215,0,0.4)", baseSize: 14, baseOrbit: 570, speed: 0.00025,
    description: "Moksha is the ultimate freedom — liberation from the cycles of suffering, attachment, and repetition. It is not an escape from life but a deeper entrance into it, free from chains.",
    howItLives: "When you want to send a message to your future self — when you want to set something free — Moksha is where you go. Messages here can be locked and revealed later.",
    journalPrompt: "What would you tell yourself one year from today?" },
  { id: "karma", name: "KARMA", meaning: "Action · कर्म", color: "#ff6b6b", glow: "rgba(255,107,107,0.4)", baseSize: 17, baseOrbit: 690, speed: 0.0002,
    description: "Karma is not punishment. It is the simple truth that every action creates a ripple. What you do, what you say, what you think — it all echoes forward. Karma is the universe keeping a ledger.",
    howItLives: "When you feel guilt, pride, consequence, or the weight of choices — that is Karma speaking. Journal here to process your actions and their echoes.",
    journalPrompt: "What is one action from this week that will ripple into your future?" },
  { id: "akasha", name: "AKASHA", meaning: "Space · आकाश", color: "#74b9ff", glow: "rgba(116,185,255,0.4)", baseSize: 19, baseOrbit: 820, speed: 0.00015,
    description: "Akasha is the infinite space — the ether that holds everything and nothing. It is the canvas on which the universe paints. Without Akasha, there is no room for anything to exist.",
    howItLives: "When you feel overwhelmed, cluttered, suffocated — Akasha is asking you to create space. Journal here when you need room to breathe, to think, to simply be.",
    journalPrompt: "What are you holding onto that no longer deserves space in your life?" },
  { id: "maya", name: "MAYA", meaning: "Illusion · माया", color: "#fd79a8", glow: "rgba(253,121,168,0.4)", baseSize: 13, baseOrbit: 950, speed: 0.0001,
    description: "Maya is the grand illusion — the veil that makes you believe the temporary is permanent, the material is everything, and the ego is who you truly are. Maya is not evil. It is the game.",
    howItLives: "When you catch yourself chasing something hollow, believing a lie you told yourself, or living someone else's life — that is Maya. Journal here to see through the illusion.",
    journalPrompt: "What story have you been telling yourself that is not actually true?" }
];

const SUN_BASE_SIZE = 42;

export default function App() {
  const canvasRef = useRef(null);
  const [user, setUser] = useState(null);
  const [anonymousName, setAnonymousName] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [journalOpen, setJournalOpen] = useState(false);
  const [journalText, setJournalText] = useState("");
  const [saving, setSaving] = useState(false);
  const [moonCounts, setMoonCounts] = useState({});
  const [sunSize, setSunSize] = useState(SUN_BASE_SIZE);
  const [starsCollected, setStarsCollected] = useState(0);
  const starsRef = useRef(0);
  const [cursorBlink, setCursorBlink] = useState(false);
  const [pastEntries, setPastEntries] = useState([]);
  const [showPastEntries, setShowPastEntries] = useState(false);
  const [mobile, setMobile] = useState(window.innerWidth < 768);
  const getScale = () => { const w = window.innerWidth; return w < 768 ? w / 580 : Math.min(w, window.innerHeight) / 1100; };
  const scaleRef = useRef(getScale());
  const animFrameRef = useRef(null);
  const shootingStarsRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const timeRef = useRef(0);

  useEffect(() => {
    const h = () => { setMobile(window.innerWidth < 768); scaleRef.current = getScale(); };
    window.addEventListener("resize", h); return () => window.removeEventListener("resize", h);
  }, []);

  // Disable pinch zoom
  useEffect(() => {
    const meta = document.querySelector('meta[name="viewport"]');
    if (meta) meta.setAttribute("content", "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no");
    else {
      const m = document.createElement("meta"); m.name = "viewport";
      m.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no";
      document.head.appendChild(m);
    }
    // Prevent zoom gestures
    const preventZoom = (e) => { if (e.touches && e.touches.length > 1) e.preventDefault(); };
    document.addEventListener("touchmove", preventZoom, { passive: false });
    return () => document.removeEventListener("touchmove", preventZoom);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) loadUserData(session.user); else setCheckingAuth(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) { setUser(null); setAnonymousName(""); }
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const loadUserData = async (authUser) => {
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", authUser.id).single();
    if (profile) { setAnonymousName(profile.anonymous_name); setSunSize(SUN_BASE_SIZE * profile.sun_size); setStarsCollected(profile.stars_collected); starsRef.current = profile.stars_collected; }
    const { data: moons } = await supabase.from("moon_progress").select("*").eq("user_id", authUser.id);
    if (moons) { const c = {}; moons.forEach((m) => (c[m.planet_id] = m.moon_count)); setMoonCounts(c); }
    setUser(authUser); setCheckingAuth(false);
  };

  const handleAuth = (u, n) => { setUser(u); setAnonymousName(n); loadUserData(u); };
  const handleLogout = async () => { await supabase.auth.signOut(); setUser(null); setAnonymousName(""); setMoonCounts({}); setSunSize(SUN_BASE_SIZE); setStarsCollected(0); starsRef.current = 0; };

  const saveJournalEntry = async () => {
    if (!journalText.trim() || !selectedPlanet || !user) return;
    setSaving(true);
    const { error } = await supabase.from("journal_entries").insert({ user_id: user.id, planet_id: selectedPlanet.id, content: journalText });
    if (error) { alert("Failed to save: " + error.message); setSaving(false); return; }
    const cur = moonCounts[selectedPlanet.id] || 0; const next = cur + 1;
    await supabase.from("moon_progress").update({ moon_count: next >= 10 ? 0 : next }).eq("user_id", user.id).eq("planet_id", selectedPlanet.id);
    if (next >= 10) {
      const mult = (sunSize / SUN_BASE_SIZE) + 0.1;
      const { data: pd } = await supabase.from("profiles").select("total_merges").eq("id", user.id).single();
      await supabase.from("profiles").update({ sun_size: mult, total_merges: (pd?.total_merges || 0) + 1 }).eq("id", user.id);
      setSunSize(SUN_BASE_SIZE * mult); setMoonCounts((p) => ({ ...p, [selectedPlanet.id]: 0 }));
    } else { setMoonCounts((p) => ({ ...p, [selectedPlanet.id]: next })); }
    setJournalText(""); setSaving(false);
  };

  const loadPastEntries = async (pid) => {
    const { data } = await supabase.from("journal_entries").select("*").eq("user_id", user.id).eq("planet_id", pid).order("created_at", { ascending: false });
    setPastEntries(data || []); setShowPastEntries(true);
  };

  const collectStar = async () => {
    starsRef.current += 1;
    const n = starsRef.current;
    setStarsCollected(n);
    setCursorBlink(true);
    setTimeout(() => setCursorBlink(false), 400);
    await supabase.from("profiles").update({ stars_collected: n }).eq("id", user.id);
  };

  // ─── Canvas Animation ───
  useEffect(() => {
    if (!user) return;
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.scale(dpr, dpr);
      scaleRef.current = getScale();
    };
    resize(); window.addEventListener("resize", resize);

    // Cursor trail particles
    const cursorTrail = [];

    const bgStars = Array.from({ length: 200 }, () => ({
      x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight,
      r: Math.random() * 1.5 + 0.5, twinkle: Math.random() * Math.PI * 2, speed: Math.random() * 0.02 + 0.01,
    }));

    const spawnShootingStar = () => {
      shootingStarsRef.current.push({ x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight * 0.5,
        vx: (Math.random() - 0.3) * 6, vy: Math.random() * 3 + 2, life: 1, size: Math.random() * 2 + 1, caught: false, slowing: false });
    };
    const shootingInterval = setInterval(spawnShootingStar, 3000);

    // Smooth cursor position (the actual cursor lerps toward this)
    const cursorTarget = { x: 0, y: 0 };
    const cursorSmooth = { x: 0, y: 0 };
    let lastFrameTime = performance.now();

    const handleMouse = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      cursorTarget.x = e.clientX;
      cursorTarget.y = e.clientY;
    };
    const handleTouchMove = (e) => {
      if (e.touches.length > 0) {
        mouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        cursorTrail.push({ x: e.touches[0].clientX, y: e.touches[0].clientY, life: 1, size: Math.random() * 8 + 4 });
        if (cursorTrail.length > 30) cursorTrail.shift();
      }
    };
    window.addEventListener("mousemove", handleMouse);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    const handleInteraction = (mx, my) => {
      const w = window.innerWidth; const h = window.innerHeight;
      const cx = w < 768 ? w / 2 : w * 0.55; const cy = h / 2; const scale = scaleRef.current;
      const eR = w < 768 ? 0.65 : 0.4;
      shootingStarsRef.current.forEach((star) => { const d = Math.hypot(star.x - mx, star.y - my); if (d < 50) { star.caught = true; collectStar(); } });
      const t = timeRef.current;
      PLANETS.forEach((planet) => {
        const angle = t * planet.speed; const orbit = planet.baseOrbit * scale;
        const size = Math.max(planet.baseSize * scale, 12);
        const px = cx + Math.cos(angle) * orbit; const py = cy + Math.sin(angle) * orbit * eR;
        const dist = Math.hypot(px - mx, py - my);
        const hitR = w < 768 ? Math.max(size + 22, 32) : size + 15;
        if (dist < hitR) { setSelectedPlanet(planet); setJournalOpen(false); setShowPastEntries(false); }
      });
    };

    const handleClick = (e) => handleInteraction(e.clientX, e.clientY);
    const handleTap = (e) => { if (e.touches.length > 0) { e.preventDefault(); handleInteraction(e.touches[0].clientX, e.touches[0].clientY); } };
    canvas.addEventListener("click", handleClick);
    canvas.addEventListener("touchstart", handleTap, { passive: false });

    const render = (now) => {
      const dt = Math.min(now - lastFrameTime, 50); // cap at 50ms to avoid jumps
      lastFrameTime = now;
      const w = window.innerWidth; const h = window.innerHeight;
      // Offset sun to the right on desktop so outer planets orbit through the left edge
      const cx = w < 768 ? w / 2 : w * 0.55;
      const cy = h / 2;
      const scale = scaleRef.current; const eR = w < 768 ? 0.65 : 0.4;
      timeRef.current += dt;

      // Smooth cursor interpolation (lerp)
      cursorSmooth.x += (cursorTarget.x - cursorSmooth.x) * 0.18;
      cursorSmooth.y += (cursorTarget.y - cursorSmooth.y) * 0.18;
      const cursorEl = document.getElementById("shunya-cursor");
      if (cursorEl) { cursorEl.style.left = cursorSmooth.x + "px"; cursorEl.style.top = cursorSmooth.y + "px"; }

      // Spawn trail particles in render loop for consistent spacing
      if (Math.abs(cursorTarget.x - (cursorTrail.length > 0 ? cursorTrail[cursorTrail.length - 1].x : 0)) > 3 ||
          Math.abs(cursorTarget.y - (cursorTrail.length > 0 ? cursorTrail[cursorTrail.length - 1].y : 0)) > 3) {
        cursorTrail.push({ x: cursorSmooth.x, y: cursorSmooth.y, life: 1, size: Math.random() * 6 + 3 });
        if (cursorTrail.length > 25) cursorTrail.shift();
      }

      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // ─── Deep space background with nebula ───
      ctx.fillStyle = "#05020e"; ctx.fillRect(0, 0, w, h);

      // Nebula clouds (static positioned, subtle)
      const drawNebula = (nx, ny, radius, r, g, b, alpha) => {
        const nb = ctx.createRadialGradient(nx, ny, 0, nx, ny, radius);
        nb.addColorStop(0, `rgba(${r},${g},${b},${alpha})`);
        nb.addColorStop(0.4, `rgba(${r},${g},${b},${alpha * 0.4})`);
        nb.addColorStop(1, "transparent");
        ctx.fillStyle = nb;
        ctx.fillRect(nx - radius, ny - radius, radius * 2, radius * 2);
      };
      // Purple nebula clusters
      drawNebula(w * 0.15, h * 0.2, w * 0.35, 88, 28, 135, 0.06);
      drawNebula(w * 0.82, h * 0.7, w * 0.3, 67, 20, 110, 0.05);
      drawNebula(w * 0.5, h * 0.85, w * 0.4, 100, 40, 150, 0.04);
      // Blue-purple wisps
      drawNebula(w * 0.7, h * 0.15, w * 0.25, 40, 50, 120, 0.05);
      drawNebula(w * 0.25, h * 0.65, w * 0.2, 60, 30, 100, 0.04);
      // Warm accent near sun
      drawNebula(cx, cy, w * 0.15, 120, 60, 20, 0.03);

      bgStars.forEach((s) => { s.twinkle += s.speed; const a = 0.3 + Math.sin(s.twinkle) * 0.3; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fillStyle = `rgba(255,255,255,${a})`; ctx.fill(); });

      PLANETS.forEach((p) => { const o = p.baseOrbit * scale; ctx.beginPath(); ctx.ellipse(cx, cy, o, o * eR, 0, 0, Math.PI * 2); ctx.strokeStyle = "rgba(255,255,255,0.04)"; ctx.lineWidth = 1; ctx.stroke(); });

      const csz = sunSize * scale;
      const sg = ctx.createRadialGradient(cx, cy, 0, cx, cy, csz * 3);
      sg.addColorStop(0, "rgba(245,166,35,0.6)"); sg.addColorStop(0.5, "rgba(245,166,35,0.1)"); sg.addColorStop(1, "transparent");
      ctx.fillStyle = sg; ctx.fillRect(cx - csz * 3, cy - csz * 3, csz * 6, csz * 6);
      const sg2 = ctx.createRadialGradient(cx, cy, 0, cx, cy, csz);
      sg2.addColorStop(0, "#fff8e7"); sg2.addColorStop(0.5, "#f5a623"); sg2.addColorStop(1, "#e8912d");
      ctx.beginPath(); ctx.arc(cx, cy, csz, 0, Math.PI * 2); ctx.fillStyle = sg2; ctx.fill();
      ctx.fillStyle = "rgba(245,166,35,0.8)"; ctx.font = `${Math.max(9, 11 * scale)}px Georgia`; ctx.textAlign = "center";
      ctx.fillText("SHUNYA", cx, cy + csz + 16);

      const t = timeRef.current;
      PLANETS.forEach((p) => {
        const angle = t * p.speed; const orbit = p.baseOrbit * scale; const size = Math.max(p.baseSize * scale, w < 768 ? 12 : 10);
        const px = cx + Math.cos(angle) * orbit; const py = cy + Math.sin(angle) * orbit * eR;
        const pulseSize = size * (1 + Math.sin(t * 0.001 + p.baseOrbit) * 0.06);
        const glowRadius = pulseSize * (3.5 + Math.sin(t * 0.0015 + p.baseOrbit) * 1);

        // Rotation angle for this planet (each spins at different speed)
        const spinSpeed = 0.0008 + p.baseOrbit * 0.0000005;
        const spinAngle = t * spinSpeed;
        const hlOffsetX = Math.cos(spinAngle) * size * 0.3;
        const hlOffsetY = Math.sin(spinAngle) * size * 0.15; // flatter because we see it from above

        // Outer glow
        const gl = ctx.createRadialGradient(px, py, 0, px, py, glowRadius);
        gl.addColorStop(0, p.glow); gl.addColorStop(0.5, p.glow.replace("0.4", "0.08")); gl.addColorStop(1, "transparent");
        ctx.fillStyle = gl; ctx.fillRect(px - glowRadius, py - glowRadius, glowRadius * 2, glowRadius * 2);

        // Shadow underneath
        ctx.beginPath(); ctx.ellipse(px + 2, py + size + 4, size * 0.7, size * 0.15, 0, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,0,0,0.25)"; ctx.fill();

        // Planet base body (darker side)
        const darkSide = ctx.createRadialGradient(px + hlOffsetX * 0.5, py + hlOffsetY * 0.5, size * 0.3, px, py, pulseSize);
        darkSide.addColorStop(0, p.color); darkSide.addColorStop(1, p.color + "55");
        ctx.beginPath(); ctx.arc(px, py, pulseSize, 0, Math.PI * 2); ctx.fillStyle = darkSide; ctx.fill();

        // Terminator line effect (day/night boundary that rotates)
        ctx.save();
        ctx.beginPath(); ctx.arc(px, py, pulseSize, 0, Math.PI * 2); ctx.clip();
        const termX = px + hlOffsetX * 2;
        const termGrad = ctx.createLinearGradient(termX - size, py, termX + size, py);
        termGrad.addColorStop(0, "rgba(0,0,0,0.25)");
        termGrad.addColorStop(0.45, "rgba(0,0,0,0.08)");
        termGrad.addColorStop(0.55, "transparent");
        termGrad.addColorStop(1, "transparent");
        ctx.fillStyle = termGrad;
        ctx.fillRect(px - pulseSize, py - pulseSize, pulseSize * 2, pulseSize * 2);
        ctx.restore();

        // Specular highlight (moves with rotation)
        const specX = px - hlOffsetX * 0.8;
        const specY = py - size * 0.25 + hlOffsetY * 0.5;
        const hl = ctx.createRadialGradient(specX, specY, 0, specX, specY, size * 0.7);
        hl.addColorStop(0, "rgba(255,255,255,0.4)");
        hl.addColorStop(0.3, "rgba(255,255,255,0.12)");
        hl.addColorStop(1, "transparent");
        ctx.beginPath(); ctx.arc(px, py, pulseSize, 0, Math.PI * 2); ctx.fillStyle = hl; ctx.fill();

        // Subtle equator band (surface detail)
        ctx.save();
        ctx.beginPath(); ctx.arc(px, py, pulseSize, 0, Math.PI * 2); ctx.clip();
        ctx.beginPath(); ctx.ellipse(px, py, pulseSize * 0.95, pulseSize * 0.12, spinAngle * 0.3, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,255,255,0.06)`;
        ctx.lineWidth = 1; ctx.stroke();
        ctx.restore();

        // Rim light (atmosphere edge glow)
        const rim = ctx.createRadialGradient(px, py, pulseSize * 0.85, px, py, pulseSize * 1.05);
        rim.addColorStop(0, "transparent");
        rim.addColorStop(0.7, p.color + "15");
        rim.addColorStop(1, p.color + "08");
        ctx.beginPath(); ctx.arc(px, py, pulseSize * 1.05, 0, Math.PI * 2); ctx.fillStyle = rim; ctx.fill();

        // Planet name — colored to match planet
        ctx.fillStyle = p.color; ctx.font = `${Math.max(8, 10 * scale)}px Georgia`; ctx.textAlign = "center";
        ctx.globalAlpha = 0.8; ctx.fillText(p.name, px, py + size + 16); ctx.globalAlpha = 1.0;

        const mc = moonCounts[p.id] || 0;
        for (let i = 0; i < mc; i++) {
          const ma = t * 0.002 + (i * Math.PI * 2) / Math.max(mc, 1); const md = size + 10 + i * 3;
          const mmx = px + Math.cos(ma) * md; const mmy = py + Math.sin(ma) * md * 0.6;
          // Moon glow
          const mg = ctx.createRadialGradient(mmx, mmy, 0, mmx, mmy, Math.max(3, 5 * scale));
          mg.addColorStop(0, "rgba(255,255,255,0.5)"); mg.addColorStop(1, "transparent");
          ctx.fillStyle = mg; ctx.fillRect(mmx - 5 * scale, mmy - 5 * scale, 10 * scale, 10 * scale);
          ctx.beginPath(); ctx.arc(mmx, mmy, Math.max(1.5, 2.5 * scale), 0, Math.PI * 2); ctx.fillStyle = "rgba(255,255,255,0.8)"; ctx.fill();
        }
      });

      const mouse = mouseRef.current;
      shootingStarsRef.current = shootingStarsRef.current.filter((s) => {
        if (s.caught) return false;
        const dist = Math.hypot(s.x - mouse.x, s.y - mouse.y);
        s.slowing = dist < 140;

        if (s.slowing) {
          // Gravitational pull toward cursor (black hole effect)
          const pullStrength = Math.max(0, 1 - dist / 140) * 1.5;
          const angle = Math.atan2(mouse.y - s.y, mouse.x - s.x);
          s.vx += Math.cos(angle) * pullStrength;
          s.vy += Math.sin(angle) * pullStrength;
          // Slow down
          s.vx *= 0.95;
          s.vy *= 0.95;
        }

        s.x += s.vx; s.y += s.vy;
        s.life -= s.slowing ? 0.001 : 0.008;
        if (s.life <= 0 || s.x < -50 || s.x > w + 50 || s.y > h + 50) return false;

        // Catch when very close
        if (dist < 30) { s.caught = true; collectStar(); return false; }

        // Trail
        const trailLen = s.slowing ? 4 : 8;
        const tg = ctx.createLinearGradient(s.x - s.vx * trailLen, s.y - s.vy * trailLen, s.x, s.y);
        tg.addColorStop(0, "transparent"); tg.addColorStop(1, s.slowing ? `rgba(255,200,50,${s.life * 0.7})` : `rgba(255,255,255,${s.life * 0.6})`);
        ctx.beginPath(); ctx.moveTo(s.x - s.vx * trailLen, s.y - s.vy * trailLen); ctx.lineTo(s.x, s.y);
        ctx.strokeStyle = tg; ctx.lineWidth = s.size; ctx.stroke();

        // Star head — grows and glows golden when being pulled
        const headSize = s.slowing ? s.size + 3 + (1 - dist / 140) * 3 : s.size;
        if (s.slowing) {
          // Golden glow halo
          const halo = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, headSize * 3);
          halo.addColorStop(0, `rgba(255,200,50,${s.life * 0.3})`); halo.addColorStop(1, "transparent");
          ctx.fillStyle = halo; ctx.fillRect(s.x - headSize * 3, s.y - headSize * 3, headSize * 6, headSize * 6);
        }
        ctx.beginPath(); ctx.arc(s.x, s.y, headSize, 0, Math.PI * 2);
        ctx.fillStyle = s.slowing ? `rgba(255,215,0,${s.life})` : `rgba(255,255,255,${s.life})`; ctx.fill();
        return true;
      });

      // ─── Black hole gravitational trail ───
      for (let i = cursorTrail.length - 1; i >= 0; i--) {
        const p = cursorTrail[i];
        p.life -= 0.022;
        if (p.life <= 0) { cursorTrail.splice(i, 1); continue; }
        const radius = p.size * (2 - p.life * 0.8);
        // Dark core with purple-orange accretion edge
        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
        grd.addColorStop(0, `rgba(0, 0, 0, ${p.life * 0.25})`);
        grd.addColorStop(0.4, `rgba(80, 20, 120, ${p.life * 0.15})`);
        grd.addColorStop(0.7, `rgba(147, 51, 234, ${p.life * 0.08})`);
        grd.addColorStop(1, "transparent");
        ctx.fillStyle = grd;
        ctx.fillRect(p.x - radius, p.y - radius, radius * 2, radius * 2);
      }

      ctx.restore();
      animFrameRef.current = requestAnimationFrame(render);
    };
    render(performance.now());

    return () => { cancelAnimationFrame(animFrameRef.current); clearInterval(shootingInterval); window.removeEventListener("resize", resize); window.removeEventListener("mousemove", handleMouse); window.removeEventListener("touchmove", handleTouchMove); canvas.removeEventListener("click", handleClick); canvas.removeEventListener("touchstart", handleTap); };
  }, [user, moonCounts, sunSize]);

  // ─── Screens ───
  if (checkingAuth) return (
    <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "rgba(255,255,255,0.3)", fontFamily: "Georgia", letterSpacing: "4px" }}>SHUNYA</p>
    </div>
  );
  if (!user) return <AuthPage onAuth={handleAuth} />;

  // ─── Overlay: determines what's shown over the solar system ───
  const hasOverlay = selectedPlanet !== null;

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden", background: "#000", fontFamily: "Georgia, serif", cursor: "none" }}>
      {/* Custom black hole cursor */}
      {!mobile && (
        <div id="shunya-cursor" style={{
          position: "fixed", pointerEvents: "none", zIndex: 9999,
          width: cursorBlink ? 54 : 46, height: cursorBlink ? 54 : 46, borderRadius: "50%",
          background: cursorBlink
            ? "radial-gradient(circle, transparent 0%, transparent 28%, rgba(255,200,50,0.35) 38%, rgba(255,170,30,0.2) 50%, rgba(147,51,234,0.15) 65%, transparent 80%)"
            : "radial-gradient(circle, transparent 0%, transparent 30%, rgba(200,160,255,0.18) 40%, rgba(147,51,234,0.15) 52%, rgba(100,40,160,0.08) 65%, transparent 80%)",
          boxShadow: cursorBlink
            ? "0 0 15px rgba(255,215,0,0.5), 0 0 35px rgba(255,180,50,0.25), 0 0 60px rgba(147,51,234,0.15), inset 0 0 15px rgba(255,200,50,0.15)"
            : "0 0 12px rgba(147,51,234,0.25), 0 0 30px rgba(100,40,160,0.12), 0 0 50px rgba(80,20,120,0.08), inset 0 0 12px rgba(100,60,180,0.06)",
          border: cursorBlink ? "2px solid rgba(255,215,0,0.55)" : "1.5px solid rgba(200,180,240,0.2)",
          transform: "translate(-50%, -50%)",
          left: 0, top: 0,
          willChange: "transform, left, top",
          transition: "width 0.2s ease, height 0.2s ease, box-shadow 0.25s ease, border 0.2s ease, background 0.25s ease",
        }}>
          {/* Inner accretion ring */}
          <div style={{
            position: "absolute", inset: "20%", borderRadius: "50%",
            border: cursorBlink ? "1px solid rgba(255,200,50,0.4)" : "1px solid rgba(180,150,230,0.15)",
            transition: "border 0.2s ease",
          }} />
        </div>
      )}
      {/* Canvas — always runs, gets blurred when overlay is open */}
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, transition: "filter 0.7s cubic-bezier(0.16, 1, 0.3, 1)", filter: hasOverlay ? "blur(10px) brightness(0.35)" : "none" }} />

      {/* Top bar — Desktop */}
      {!mobile && !hasOverlay && (
        <>
          <div style={{ position: "absolute", top: 20, left: 24, zIndex: 10, display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ color: "#f5a623", fontSize: 18, letterSpacing: 6, fontWeight: 300 }}>SHUNYA</span>
            <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 11, letterSpacing: 2 }}>Journey Within</span>
          </div>
          <div style={{ position: "absolute", top: 20, right: 24, zIndex: 10, display: "flex", alignItems: "center", gap: 20 }}>
            <span style={{ color: "rgba(255,215,0,0.8)", fontSize: 13 }}>★ {starsCollected}</span>
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, letterSpacing: 1 }}>{anonymousName}</span>
            <button onClick={handleLogout} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "6px 14px", color: "rgba(255,255,255,0.4)", fontSize: 11, cursor: "pointer", letterSpacing: 1 }}>EXIT</button>
          </div>
        </>
      )}

      {/* Top bar — Mobile */}
      {mobile && !hasOverlay && (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 10, padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 70%, transparent 100%)" }}>
          <span style={{ color: "#f5a623", fontSize: 14, letterSpacing: 4, fontWeight: 300 }}>SHUNYA</span>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: "rgba(255,215,0,0.8)", fontSize: 11 }}>★ {starsCollected}</span>
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{anonymousName}</span>
            <button onClick={handleLogout} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "4px 10px", color: "rgba(255,255,255,0.4)", fontSize: 10, cursor: "pointer" }}>EXIT</button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* PLANET DESCRIPTION — Full screen overlay (UPDATE 1)   */}
      {/* ═══════════════════════════════════════════════════════ */}
      {selectedPlanet && !journalOpen && !showPastEntries && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 20,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: mobile ? "60px 28px 40px" : "60px 40px",
          animation: "overlayIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
          overflowY: "auto",
        }}>
          {/* Close button */}
          <button onClick={() => setSelectedPlanet(null)} style={{
            position: "absolute", top: mobile ? 20 : 30, right: mobile ? 20 : 30,
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "50%", width: 40, height: 40, color: "rgba(255,255,255,0.5)",
            fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 25,
          }}>✕</button>

          {/* Planet glow circle */}
          <div style={{
            width: mobile ? 100 : 140, height: mobile ? 100 : 140, borderRadius: "50%",
            background: `radial-gradient(circle, ${selectedPlanet.color}, ${selectedPlanet.color}44 60%, transparent 70%)`,
            boxShadow: `0 0 60px ${selectedPlanet.color}66, 0 0 120px ${selectedPlanet.color}33`,
            marginBottom: mobile ? 20 : 28,
            animation: "planetPulse 3s ease-in-out infinite",
          }} />

          {/* Planet name */}
          <h1 style={{
            color: selectedPlanet.color, fontSize: mobile ? 28 : 42,
            letterSpacing: mobile ? 6 : 12, fontWeight: 300, marginBottom: 6, textAlign: "center",
          }}>{selectedPlanet.name}</h1>
          <p style={{
            color: "rgba(255,255,255,0.35)", fontSize: mobile ? 12 : 14,
            letterSpacing: 3, marginBottom: mobile ? 24 : 36, textAlign: "center",
          }}>{selectedPlanet.meaning}</p>

          {/* Description */}
          <div style={{ maxWidth: 560, textAlign: "center" }}>
            <h4 style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, letterSpacing: 3, textTransform: "uppercase", marginBottom: 10, fontWeight: 400 }}>What it is</h4>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: mobile ? 13 : 15, lineHeight: 1.9, marginBottom: mobile ? 20 : 28 }}>{selectedPlanet.description}</p>

            <h4 style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, letterSpacing: 3, textTransform: "uppercase", marginBottom: 10, fontWeight: 400 }}>How it lives in you</h4>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: mobile ? 13 : 15, lineHeight: 1.9, marginBottom: mobile ? 20 : 28 }}>{selectedPlanet.howItLives}</p>
          </div>

          {/* Moon progress */}
          <div style={{ display: "flex", gap: mobile ? 6 : 8, marginBottom: 8 }}>
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} style={{
                width: mobile ? 10 : 12, height: mobile ? 10 : 12, borderRadius: "50%",
                background: i < (moonCounts[selectedPlanet.id] || 0) ? selectedPlanet.color : "rgba(255,255,255,0.1)",
                border: `1px solid ${i < (moonCounts[selectedPlanet.id] || 0) ? selectedPlanet.color : "rgba(255,255,255,0.15)"}`,
                transition: "all 0.3s"
              }} />
            ))}
          </div>
          <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 11, marginBottom: mobile ? 20 : 28 }}>
            {moonCounts[selectedPlanet.id] || 0} / 10 moons
          </p>

          {/* Action buttons — pinned at bottom feel */}
          <div style={{ width: "100%", maxWidth: 400 }}>
            <button onClick={() => setJournalOpen(true)} style={{
              width: "100%", padding: mobile ? "15px" : "18px", border: "none", borderRadius: 14,
              background: `linear-gradient(135deg, ${selectedPlanet.color}, ${selectedPlanet.color}cc)`,
              color: "#000", fontSize: mobile ? 14 : 15, fontWeight: 700, cursor: "pointer",
              letterSpacing: 1, fontFamily: "Georgia, serif",
              boxShadow: `0 4px 24px ${selectedPlanet.color}44`,
            }}>✦ Start Journaling</button>
            <button onClick={() => loadPastEntries(selectedPlanet.id)} style={{
              width: "100%", padding: mobile ? "13px" : "15px", background: "transparent",
              border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14,
              color: "rgba(255,255,255,0.4)", fontSize: 13, cursor: "pointer",
              letterSpacing: 1, marginTop: 12, fontFamily: "Georgia, serif",
            }}>View Past Entries</button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════ */}
      {/* JOURNAL — Full screen overlay           */}
      {/* ═══════════════════════════════════════ */}
      {selectedPlanet && journalOpen && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 20,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: mobile ? "60px 28px 40px" : "60px 40px",
          animation: "overlayIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        }}>
          <button onClick={() => setJournalOpen(false)} style={{
            position: "absolute", top: mobile ? 20 : 30, left: mobile ? 20 : 30,
            background: "none", border: "none", color: "rgba(255,255,255,0.4)",
            fontSize: 14, cursor: "pointer", letterSpacing: 1, fontFamily: "Georgia, serif",
          }}>← Back</button>

          <h2 style={{ color: selectedPlanet.color, fontSize: mobile ? 22 : 32, letterSpacing: mobile ? 4 : 8, fontWeight: 300, marginBottom: 8 }}>{selectedPlanet.name}</h2>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: mobile ? 12 : 14, fontStyle: "italic", marginBottom: mobile ? 24 : 32, lineHeight: 1.7, textAlign: "center", maxWidth: 500 }}>
            {selectedPlanet.journalPrompt}
          </p>

          <textarea value={journalText} onChange={(e) => setJournalText(e.target.value)} placeholder="Write what your soul needs to say..."
            style={{
              width: "100%", maxWidth: 500, height: mobile ? "180px" : "220px", padding: 20,
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 14, color: "#fff", fontSize: mobile ? 14 : 16, lineHeight: 1.9,
              resize: "none", outline: "none", fontFamily: "Georgia, serif", boxSizing: "border-box",
            }} />

          <button onClick={saveJournalEntry} disabled={saving || !journalText.trim()} style={{
            width: "100%", maxWidth: 500, padding: mobile ? "15px" : "18px", border: "none", borderRadius: 14,
            background: `linear-gradient(135deg, ${selectedPlanet.color}, ${selectedPlanet.color}cc)`,
            color: "#000", fontSize: mobile ? 14 : 15, fontWeight: 700, cursor: "pointer",
            letterSpacing: 1, fontFamily: "Georgia, serif", marginTop: 20,
            opacity: saving || !journalText.trim() ? 0.5 : 1,
            boxShadow: `0 4px 24px ${selectedPlanet.color}44`,
          }}>{saving ? "Inscribing..." : "✦ Inscribe"}</button>
        </div>
      )}

      {/* ═══════════════════════════════════════ */}
      {/* PAST ENTRIES — Full screen overlay       */}
      {/* ═══════════════════════════════════════ */}
      {selectedPlanet && showPastEntries && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 20,
          display: "flex", flexDirection: "column", alignItems: "center",
          padding: mobile ? "60px 24px 40px" : "60px 40px",
          animation: "overlayIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)", overflowY: "auto",
        }}>
          <button onClick={() => setShowPastEntries(false)} style={{
            position: "absolute", top: mobile ? 20 : 30, left: mobile ? 20 : 30,
            background: "none", border: "none", color: "rgba(255,255,255,0.4)",
            fontSize: 14, cursor: "pointer", letterSpacing: 1, fontFamily: "Georgia, serif",
          }}>← Back</button>

          <h2 style={{ color: selectedPlanet.color, fontSize: mobile ? 20 : 28, letterSpacing: mobile ? 4 : 8, fontWeight: 300, marginBottom: mobile ? 20 : 32 }}>Past Reflections</h2>

          {pastEntries.length === 0 ? (
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 14, marginTop: 40 }}>No entries yet. Begin your journey.</p>
          ) : (
            <div style={{ width: "100%", maxWidth: 500 }}>
              {pastEntries.map((entry) => (
                <div key={entry.id} style={{
                  padding: mobile ? "16px" : "20px", background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, marginBottom: 12,
                }}>
                  <p style={{ color: "rgba(255,255,255,0.7)", fontSize: mobile ? 13 : 14, lineHeight: 1.8, marginBottom: 8 }}>{entry.content}</p>
                  <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 11 }}>
                    {new Date(entry.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── CSS ─── */}
      <style>{`
        @keyframes overlayIn {
          from { opacity: 0; transform: scale(0.92) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes planetPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 60px currentColor; }
          50% { transform: scale(1.05); box-shadow: 0 0 90px currentColor; }
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { margin: 0; overflow: hidden; touch-action: none; -webkit-overflow-scrolling: touch; }
        textarea::placeholder { color: rgba(255,255,255,0.2); }
        input::placeholder { color: rgba(255,255,255,0.2); }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
      `}</style>
    </div>
  );
}
