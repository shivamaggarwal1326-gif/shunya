import { useEffect, useRef, useState } from "react";
import { supabase } from "./supabaseClient";
import AuthPage from "./AuthPage";

const PLANETS = [
  { id: "aatma", name: "AATMA", meaning: "The Soul · आत्मा", color: "#f5a623", glow: "rgba(245,166,35,0.4)", baseSize: 18, baseOrbit: 140, speed: 0.0005,
    description: "Aatma is the eternal soul — the part of you that existed before your name, your wounds, and your achievements. It is not your personality. It is not your story. It is the awareness behind all of it.",
    howItLives: "When you sit in silence and feel something ancient — something that was here before your first memory — that is Aatma. Journal here when you want to speak from beyond identity.",
    journalPrompt: "What truth would remain if everything about your life was stripped away?" },
  { id: "pranaa", name: "PRANAA", meaning: "The Life Force · प्राण", color: "#4ecdc4", glow: "rgba(78,205,196,0.4)", baseSize: 15, baseOrbit: 190, speed: 0.0004,
    description: "Pranaa is the breath that moves through you — the invisible force that keeps you alive without asking permission. It is energy itself. Not the kind you drink coffee for. The kind that animates your entire being.",
    howItLives: "When you feel alive — truly, electrically alive — that is Pranaa. When you feel drained, disconnected, heavy — Pranaa is asking for attention. Journal here about your energy, your body, your aliveness.",
    journalPrompt: "Where in your body do you feel the most alive right now? Where do you feel nothing?" },
  { id: "kaal", name: "KAAL", meaning: "Time · काल", color: "#a78bfa", glow: "rgba(167,139,250,0.4)", baseSize: 20, baseOrbit: 245, speed: 0.00035,
    description: "Kaal is time — not the clock on your wall but the deeper rhythm that governs birth, death, seasons, and everything in between. Kaal does not rush. Kaal does not wait. It simply moves.",
    howItLives: "When you feel anxious about the future or trapped in the past — that is your relationship with Kaal. Journal here when time feels heavy, when you want to process what was or prepare for what is coming.",
    journalPrompt: "What moment in your past still holds power over your present?" },
  { id: "dharma", name: "DHARMA", meaning: "Purpose · धर्म", color: "#f093fb", glow: "rgba(240,147,251,0.4)", baseSize: 16, baseOrbit: 300, speed: 0.0003,
    description: "Dharma is your sacred duty — the thing you were put here to do. Not your job title. Not what society expects. The deep, quiet calling that only you can hear when everything else goes silent.",
    howItLives: "When you feel lost, purposeless, or stuck in a life that does not feel like yours — Dharma is calling. Journal here when you want to explore what you are truly meant to do.",
    journalPrompt: "If money and judgment did not exist, what would you spend your life doing?" },
  { id: "moksha", name: "MOKSHA", meaning: "Liberation · मोक्ष", color: "#ffd700", glow: "rgba(255,215,0,0.4)", baseSize: 14, baseOrbit: 355, speed: 0.00025,
    description: "Moksha is the ultimate freedom — liberation from the cycles of suffering, attachment, and repetition. It is not an escape from life but a deeper entrance into it, free from chains.",
    howItLives: "When you want to send a message to your future self — when you want to set something free — Moksha is where you go. Messages here can be locked and revealed later.",
    journalPrompt: "What would you tell yourself one year from today?" },
  { id: "karma", name: "KARMA", meaning: "Action · कर्म", color: "#ff6b6b", glow: "rgba(255,107,107,0.4)", baseSize: 17, baseOrbit: 405, speed: 0.0002,
    description: "Karma is not punishment. It is the simple truth that every action creates a ripple. What you do, what you say, what you think — it all echoes forward. Karma is the universe keeping a ledger.",
    howItLives: "When you feel guilt, pride, consequence, or the weight of choices — that is Karma speaking. Journal here to process your actions and their echoes.",
    journalPrompt: "What is one action from this week that will ripple into your future?" },
  { id: "akasha", name: "AKASHA", meaning: "Space · आकाश", color: "#74b9ff", glow: "rgba(116,185,255,0.4)", baseSize: 19, baseOrbit: 455, speed: 0.00015,
    description: "Akasha is the infinite space — the ether that holds everything and nothing. It is the canvas on which the universe paints. Without Akasha, there is no room for anything to exist.",
    howItLives: "When you feel overwhelmed, cluttered, suffocated — Akasha is asking you to create space. Journal here when you need room to breathe, to think, to simply be.",
    journalPrompt: "What are you holding onto that no longer deserves space in your life?" },
  { id: "maya", name: "MAYA", meaning: "Illusion · माया", color: "#fd79a8", glow: "rgba(253,121,168,0.4)", baseSize: 13, baseOrbit: 500, speed: 0.0001,
    description: "Maya is the grand illusion — the veil that makes you believe the temporary is permanent, the material is everything, and the ego is who you truly are. Maya is not evil. It is the game.",
    howItLives: "When you catch yourself chasing something hollow, believing a lie you told yourself, or living someone else's life — that is Maya. Journal here to see through the illusion.",
    journalPrompt: "What story have you been telling yourself that is not actually true?" }
];

const SUN_BASE_SIZE = 50;

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
    if (profile) { setAnonymousName(profile.anonymous_name); setSunSize(SUN_BASE_SIZE * profile.sun_size); setStarsCollected(profile.stars_collected); }
    const { data: moons } = await supabase.from("moon_progress").select("*").eq("user_id", authUser.id);
    if (moons) { const c = {}; moons.forEach((m) => (c[m.planet_id] = m.moon_count)); setMoonCounts(c); }
    setUser(authUser); setCheckingAuth(false);
  };

  const handleAuth = (u, n) => { setUser(u); setAnonymousName(n); loadUserData(u); };
  const handleLogout = async () => { await supabase.auth.signOut(); setUser(null); setAnonymousName(""); setMoonCounts({}); setSunSize(SUN_BASE_SIZE); setStarsCollected(0); };

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

  const collectStar = async () => { const n = starsCollected + 1; setStarsCollected(n); await supabase.from("profiles").update({ stars_collected: n }).eq("id", user.id); };

  // ─── Canvas Animation (unchanged) ───
  useEffect(() => {
    if (!user) return;
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; scaleRef.current = getScale(); };
    resize(); window.addEventListener("resize", resize);

    const bgStars = Array.from({ length: 200 }, () => ({
      x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight,
      r: Math.random() * 1.5 + 0.5, twinkle: Math.random() * Math.PI * 2, speed: Math.random() * 0.02 + 0.01,
    }));

    const spawnShootingStar = () => {
      shootingStarsRef.current.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height * 0.5,
        vx: (Math.random() - 0.3) * 6, vy: Math.random() * 3 + 2, life: 1, size: Math.random() * 2 + 1, caught: false, slowing: false });
    };
    const shootingInterval = setInterval(spawnShootingStar, 3000);

    const handleMouse = (e) => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
    const handleTouchMove = (e) => { if (e.touches.length > 0) mouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; };
    window.addEventListener("mousemove", handleMouse);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    const handleInteraction = (mx, my) => {
      const cx = canvas.width / 2; const cy = canvas.height / 2; const scale = scaleRef.current;
      const eR = canvas.width < 768 ? 0.65 : 0.4;
      shootingStarsRef.current.forEach((star) => { const d = Math.hypot(star.x - mx, star.y - my); if (d < 40 && star.slowing) { star.caught = true; collectStar(); } });
      const t = timeRef.current;
      PLANETS.forEach((planet) => {
        const angle = t * planet.speed; const orbit = planet.baseOrbit * scale;
        const size = Math.max(planet.baseSize * scale, 12);
        const px = cx + Math.cos(angle) * orbit; const py = cy + Math.sin(angle) * orbit * eR;
        const dist = Math.hypot(px - mx, py - my);
        const hitR = window.innerWidth < 768 ? Math.max(size + 22, 32) : size + 15;
        if (dist < hitR) { setSelectedPlanet(planet); setJournalOpen(false); setShowPastEntries(false); }
      });
    };

    const handleClick = (e) => handleInteraction(e.clientX, e.clientY);
    const handleTap = (e) => { if (e.touches.length > 0) { e.preventDefault(); handleInteraction(e.touches[0].clientX, e.touches[0].clientY); } };
    canvas.addEventListener("click", handleClick);
    canvas.addEventListener("touchstart", handleTap, { passive: false });

    const render = () => {
      const w = canvas.width; const h = canvas.height; const cx = w / 2; const cy = h / 2;
      const scale = scaleRef.current; const eR = w < 768 ? 0.65 : 0.4;
      timeRef.current += 16;
      ctx.fillStyle = "#000005"; ctx.fillRect(0, 0, w, h);

      bgStars.forEach((s) => { s.twinkle += s.speed; const a = 0.3 + Math.sin(s.twinkle) * 0.3; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fillStyle = `rgba(255,255,255,${a})`; ctx.fill(); });

      PLANETS.forEach((p) => { const o = p.baseOrbit * scale; ctx.beginPath(); ctx.ellipse(cx, cy, o, o * eR, 0, 0, Math.PI * 2); ctx.strokeStyle = "rgba(255,255,255,0.05)"; ctx.lineWidth = 1; ctx.stroke(); });

      const csz = sunSize * scale;
      const sg = ctx.createRadialGradient(cx, cy, 0, cx, cy, csz * 3);
      sg.addColorStop(0, "rgba(245,166,35,0.6)"); sg.addColorStop(0.5, "rgba(245,166,35,0.1)"); sg.addColorStop(1, "transparent");
      ctx.fillStyle = sg; ctx.fillRect(cx - csz * 3, cy - csz * 3, csz * 6, csz * 6);
      const sg2 = ctx.createRadialGradient(cx, cy, 0, cx, cy, csz);
      sg2.addColorStop(0, "#fff8e7"); sg2.addColorStop(0.5, "#f5a623"); sg2.addColorStop(1, "#e8912d");
      ctx.beginPath(); ctx.arc(cx, cy, csz, 0, Math.PI * 2); ctx.fillStyle = sg2; ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.8)"; ctx.font = `${Math.max(9, 11 * scale)}px Georgia`; ctx.textAlign = "center";
      ctx.fillText("SHUNYA", cx, cy + csz + 16);

      const t = timeRef.current;
      PLANETS.forEach((p) => {
        const angle = t * p.speed; const orbit = p.baseOrbit * scale; const size = Math.max(p.baseSize * scale, 8);
        const px = cx + Math.cos(angle) * orbit; const py = cy + Math.sin(angle) * orbit * eR;
        const gl = ctx.createRadialGradient(px, py, 0, px, py, size * 3);
        gl.addColorStop(0, p.glow); gl.addColorStop(1, "transparent"); ctx.fillStyle = gl;
        ctx.fillRect(px - size * 3, py - size * 3, size * 6, size * 6);
        ctx.beginPath(); ctx.arc(px, py, size, 0, Math.PI * 2); ctx.fillStyle = p.color; ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.6)"; ctx.font = `${Math.max(7, 9 * scale)}px Georgia`; ctx.textAlign = "center";
        ctx.fillText(p.name, px, py + size + 14);
        const mc = moonCounts[p.id] || 0;
        for (let i = 0; i < mc; i++) {
          const ma = t * 0.002 + (i * Math.PI * 2) / Math.max(mc, 1); const md = size + 8 + i * 2.5;
          const mmx = px + Math.cos(ma) * md; const mmy = py + Math.sin(ma) * md * 0.6;
          ctx.beginPath(); ctx.arc(mmx, mmy, Math.max(1.5, 2.5 * scale), 0, Math.PI * 2); ctx.fillStyle = "rgba(255,255,255,0.7)"; ctx.fill();
        }
      });

      const mouse = mouseRef.current;
      shootingStarsRef.current = shootingStarsRef.current.filter((s) => {
        if (s.caught) return false;
        const dist = Math.hypot(s.x - mouse.x, s.y - mouse.y);
        s.slowing = dist < 100; const sm = s.slowing ? Math.max(0.05, dist / 100) : 1;
        s.x += s.vx * sm; s.y += s.vy * sm; s.life -= s.slowing ? 0.002 : 0.008;
        if (s.life <= 0 || s.x < -50 || s.x > w + 50 || s.y > h + 50) return false;
        const tg = ctx.createLinearGradient(s.x - s.vx * 8, s.y - s.vy * 8, s.x, s.y);
        tg.addColorStop(0, "transparent"); tg.addColorStop(1, `rgba(255,255,255,${s.life * 0.6})`);
        ctx.beginPath(); ctx.moveTo(s.x - s.vx * 8, s.y - s.vy * 8); ctx.lineTo(s.x, s.y);
        ctx.strokeStyle = tg; ctx.lineWidth = s.size; ctx.stroke();
        ctx.beginPath(); ctx.arc(s.x, s.y, s.size + (s.slowing ? 2 : 0), 0, Math.PI * 2);
        ctx.fillStyle = s.slowing ? `rgba(255,215,0,${s.life})` : `rgba(255,255,255,${s.life})`; ctx.fill();
        return true;
      });

      animFrameRef.current = requestAnimationFrame(render);
    };
    render();

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
    <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden", background: "#000", fontFamily: "Georgia, serif" }}>
      {/* Canvas — always runs, gets blurred when overlay is open */}
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, transition: "filter 0.5s ease", filter: hasOverlay ? "blur(8px) brightness(0.4)" : "none" }} />

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
          animation: "overlayIn 0.5s ease",
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
          animation: "overlayIn 0.4s ease",
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
          animation: "overlayIn 0.4s ease", overflowY: "auto",
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
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
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
