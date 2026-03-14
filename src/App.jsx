import { useEffect, useRef, useState } from "react";
import { supabase } from "./supabaseClient";
import AuthPage from "./AuthPage";

// ─── Constants ───
const PLANETS = [
  {
    id: "aatma", name: "AATMA", meaning: "The Soul · आत्मा",
    color: "#f5a623", glow: "rgba(245,166,35,0.4)", baseSize: 18, baseOrbit: 140, speed: 0.0005,
    description: "Aatma is the eternal soul — the part of you that existed before your name, your wounds, and your achievements. It is not your personality. It is not your story. It is the awareness behind all of it.",
    howItLives: "When you sit in silence and feel something ancient — something that was here before your first memory — that is Aatma. Journal here when you want to speak from beyond identity.",
    journalPrompt: "What truth would remain if everything about your life was stripped away?"
  },
  {
    id: "pranaa", name: "PRANAA", meaning: "The Life Force · प्राण",
    color: "#4ecdc4", glow: "rgba(78,205,196,0.4)", baseSize: 15, baseOrbit: 190, speed: 0.0004,
    description: "Pranaa is the breath that moves through you — the invisible force that keeps you alive without asking permission. It is energy itself. Not the kind you drink coffee for. The kind that animates your entire being.",
    howItLives: "When you feel alive — truly, electrically alive — that is Pranaa. When you feel drained, disconnected, heavy — Pranaa is asking for attention. Journal here about your energy, your body, your aliveness.",
    journalPrompt: "Where in your body do you feel the most alive right now? Where do you feel nothing?"
  },
  {
    id: "kaal", name: "KAAL", meaning: "Time · काल",
    color: "#a78bfa", glow: "rgba(167,139,250,0.4)", baseSize: 20, baseOrbit: 245, speed: 0.00035,
    description: "Kaal is time — not the clock on your wall but the deeper rhythm that governs birth, death, seasons, and everything in between. Kaal does not rush. Kaal does not wait. It simply moves.",
    howItLives: "When you feel anxious about the future or trapped in the past — that is your relationship with Kaal. Journal here when time feels heavy, when you want to process what was or prepare for what is coming.",
    journalPrompt: "What moment in your past still holds power over your present?"
  },
  {
    id: "dharma", name: "DHARMA", meaning: "Purpose · धर्म",
    color: "#f093fb", glow: "rgba(240,147,251,0.4)", baseSize: 16, baseOrbit: 300, speed: 0.0003,
    description: "Dharma is your sacred duty — the thing you were put here to do. Not your job title. Not what society expects. The deep, quiet calling that only you can hear when everything else goes silent.",
    howItLives: "When you feel lost, purposeless, or stuck in a life that does not feel like yours — Dharma is calling. Journal here when you want to explore what you are truly meant to do.",
    journalPrompt: "If money and judgment did not exist, what would you spend your life doing?"
  },
  {
    id: "moksha", name: "MOKSHA", meaning: "Liberation · मोक्ष",
    color: "#ffd700", glow: "rgba(255,215,0,0.4)", baseSize: 14, baseOrbit: 355, speed: 0.00025,
    description: "Moksha is the ultimate freedom — liberation from the cycles of suffering, attachment, and repetition. It is not an escape from life but a deeper entrance into it, free from chains.",
    howItLives: "When you want to send a message to your future self — when you want to set something free — Moksha is where you go. Messages here can be locked and revealed later.",
    journalPrompt: "What would you tell yourself one year from today?"
  },
  {
    id: "karma", name: "KARMA", meaning: "Action · कर्म",
    color: "#ff6b6b", glow: "rgba(255,107,107,0.4)", baseSize: 17, baseOrbit: 405, speed: 0.0002,
    description: "Karma is not punishment. It is the simple truth that every action creates a ripple. What you do, what you say, what you think — it all echoes forward. Karma is the universe keeping a ledger.",
    howItLives: "When you feel guilt, pride, consequence, or the weight of choices — that is Karma speaking. Journal here to process your actions and their echoes.",
    journalPrompt: "What is one action from this week that will ripple into your future?"
  },
  {
    id: "akasha", name: "AKASHA", meaning: "Space · आकाश",
    color: "#74b9ff", glow: "rgba(116,185,255,0.4)", baseSize: 19, baseOrbit: 455, speed: 0.00015,
    description: "Akasha is the infinite space — the ether that holds everything and nothing. It is the canvas on which the universe paints. Without Akasha, there is no room for anything to exist.",
    howItLives: "When you feel overwhelmed, cluttered, suffocated — Akasha is asking you to create space. Journal here when you need room to breathe, to think, to simply be.",
    journalPrompt: "What are you holding onto that no longer deserves space in your life?"
  },
  {
    id: "maya", name: "MAYA", meaning: "Illusion · माया",
    color: "#fd79a8", glow: "rgba(253,121,168,0.4)", baseSize: 13, baseOrbit: 500, speed: 0.0001,
    description: "Maya is the grand illusion — the veil that makes you believe the temporary is permanent, the material is everything, and the ego is who you truly are. Maya is not evil. It is the game.",
    howItLives: "When you catch yourself chasing something hollow, believing a lie you told yourself, or living someone else's life — that is Maya. Journal here to see through the illusion.",
    journalPrompt: "What story have you been telling yourself that is not actually true?"
  }
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
  const getScale = () => {
    const w = window.innerWidth;
    if (w < 768) return w / 580; // Mobile: scale based on width, spread planets out more
    return Math.min(w, window.innerHeight) / 1100; // Desktop: use smaller dimension
  };
  const scaleRef = useRef(getScale());
  const animFrameRef = useRef(null);
  const shootingStarsRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const timeRef = useRef(0);

  useEffect(() => {
    const h = () => { setMobile(window.innerWidth < 768); scaleRef.current = getScale(); };
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
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

  const handleAuth = (authUser, name) => { setUser(authUser); setAnonymousName(name); loadUserData(authUser); };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null); setAnonymousName(""); setMoonCounts({}); setSunSize(SUN_BASE_SIZE); setStarsCollected(0);
  };

  const saveJournalEntry = async () => {
    if (!journalText.trim() || !selectedPlanet || !user) return;
    setSaving(true);
    const { error } = await supabase.from("journal_entries").insert({ user_id: user.id, planet_id: selectedPlanet.id, content: journalText });
    if (error) { alert("Failed to save: " + error.message); setSaving(false); return; }
    const currentCount = moonCounts[selectedPlanet.id] || 0;
    const newCount = currentCount + 1;
    await supabase.from("moon_progress").update({ moon_count: newCount >= 10 ? 0 : newCount }).eq("user_id", user.id).eq("planet_id", selectedPlanet.id);
    if (newCount >= 10) {
      const newSunMult = (sunSize / SUN_BASE_SIZE) + 0.1;
      const { data: pd } = await supabase.from("profiles").select("total_merges").eq("id", user.id).single();
      await supabase.from("profiles").update({ sun_size: newSunMult, total_merges: (pd?.total_merges || 0) + 1 }).eq("id", user.id);
      setSunSize(SUN_BASE_SIZE * newSunMult); setMoonCounts((p) => ({ ...p, [selectedPlanet.id]: 0 }));
    } else { setMoonCounts((p) => ({ ...p, [selectedPlanet.id]: newCount })); }
    setJournalText(""); setSaving(false);
  };

  const loadPastEntries = async (planetId) => {
    const { data } = await supabase.from("journal_entries").select("*").eq("user_id", user.id).eq("planet_id", planetId).order("created_at", { ascending: false });
    setPastEntries(data || []); setShowPastEntries(true);
  };

  const collectStar = async () => {
    const n = starsCollected + 1; setStarsCollected(n);
    await supabase.from("profiles").update({ stars_collected: n }).eq("id", user.id);
  };

  useEffect(() => {
    if (!user) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; scaleRef.current = getScale(); };
    resize(); window.addEventListener("resize", resize);

    const bgStars = Array.from({ length: 200 }, () => ({
      x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight,
      r: Math.random() * 1.5 + 0.5, twinkle: Math.random() * Math.PI * 2, speed: Math.random() * 0.02 + 0.01,
    }));

    const spawnShootingStar = () => {
      shootingStarsRef.current.push({
        x: Math.random() * canvas.width, y: Math.random() * canvas.height * 0.5,
        vx: (Math.random() - 0.3) * 6, vy: Math.random() * 3 + 2,
        life: 1, size: Math.random() * 2 + 1, caught: false, slowing: false,
      });
    };
    const shootingInterval = setInterval(spawnShootingStar, 3000);

    const handleMouse = (e) => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
    const handleTouchMove = (e) => { if (e.touches.length > 0) mouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; };
    window.addEventListener("mousemove", handleMouse);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    const handleInteraction = (mx, my) => {
      const cx = canvas.width / 2; const cy = canvas.height / 2; const scale = scaleRef.current;
      const ellipseRatio = canvas.width < 768 ? 0.65 : 0.4;
      shootingStarsRef.current.forEach((star) => { const d = Math.hypot(star.x - mx, star.y - my); if (d < 40 && star.slowing) { star.caught = true; collectStar(); } });
      const t = timeRef.current;
      PLANETS.forEach((planet) => {
        const angle = t * planet.speed; const orbit = planet.baseOrbit * scale;
        const size = Math.max(planet.baseSize * scale, 12);
        const px = cx + Math.cos(angle) * orbit; const py = cy + Math.sin(angle) * orbit * ellipseRatio;
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
      const w = canvas.width; const h = canvas.height;
      const cx = w / 2; const cy = h / 2;
      const scale = scaleRef.current;
      const ellipseRatio = w < 768 ? 0.65 : 0.4; // Taller orbits on mobile
      timeRef.current += 16;

      ctx.fillStyle = "#000005"; ctx.fillRect(0, 0, w, h);

      bgStars.forEach((s) => {
        s.twinkle += s.speed; const alpha = 0.3 + Math.sin(s.twinkle) * 0.3;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${alpha})`; ctx.fill();
      });

      PLANETS.forEach((planet) => {
        const orbit = planet.baseOrbit * scale;
        ctx.beginPath(); ctx.ellipse(cx, cy, orbit, orbit * ellipseRatio, 0, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255,255,255,0.05)"; ctx.lineWidth = 1; ctx.stroke();
      });

      const currentSunSize = sunSize * scale;
      const sunGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, currentSunSize * 3);
      sunGlow.addColorStop(0, "rgba(245,166,35,0.6)"); sunGlow.addColorStop(0.5, "rgba(245,166,35,0.1)"); sunGlow.addColorStop(1, "transparent");
      ctx.fillStyle = sunGlow; ctx.fillRect(cx - currentSunSize * 3, cy - currentSunSize * 3, currentSunSize * 6, currentSunSize * 6);

      const sunGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, currentSunSize);
      sunGrad.addColorStop(0, "#fff8e7"); sunGrad.addColorStop(0.5, "#f5a623"); sunGrad.addColorStop(1, "#e8912d");
      ctx.beginPath(); ctx.arc(cx, cy, currentSunSize, 0, Math.PI * 2); ctx.fillStyle = sunGrad; ctx.fill();

      ctx.fillStyle = "rgba(255,255,255,0.8)"; ctx.font = `${Math.max(9, 11 * scale)}px Georgia`; ctx.textAlign = "center";
      ctx.fillText("SHUNYA", cx, cy + currentSunSize + 16);

      const t = timeRef.current;
      PLANETS.forEach((planet) => {
        const angle = t * planet.speed; const orbit = planet.baseOrbit * scale;
        const size = Math.max(planet.baseSize * scale, 8);
        const px = cx + Math.cos(angle) * orbit; const py = cy + Math.sin(angle) * orbit * ellipseRatio;

        const glow = ctx.createRadialGradient(px, py, 0, px, py, size * 3);
        glow.addColorStop(0, planet.glow); glow.addColorStop(1, "transparent");
        ctx.fillStyle = glow; ctx.fillRect(px - size * 3, py - size * 3, size * 6, size * 6);

        ctx.beginPath(); ctx.arc(px, py, size, 0, Math.PI * 2); ctx.fillStyle = planet.color; ctx.fill();

        ctx.fillStyle = "rgba(255,255,255,0.6)"; ctx.font = `${Math.max(7, 9 * scale)}px Georgia`; ctx.textAlign = "center";
        ctx.fillText(planet.name, px, py + size + 14);

        const mCount = moonCounts[planet.id] || 0;
        for (let i = 0; i < mCount; i++) {
          const moonAngle = t * 0.002 + (i * Math.PI * 2) / Math.max(mCount, 1);
          const moonDist = size + 8 + i * 2.5;
          const mmx = px + Math.cos(moonAngle) * moonDist; const mmy = py + Math.sin(moonAngle) * moonDist * 0.6;
          ctx.beginPath(); ctx.arc(mmx, mmy, Math.max(1.5, 2.5 * scale), 0, Math.PI * 2);
          ctx.fillStyle = "rgba(255,255,255,0.7)"; ctx.fill();
        }
      });

      const mouse = mouseRef.current;
      shootingStarsRef.current = shootingStarsRef.current.filter((s) => {
        if (s.caught) return false;
        const dist = Math.hypot(s.x - mouse.x, s.y - mouse.y);
        s.slowing = dist < 100; const speedMult = s.slowing ? Math.max(0.05, dist / 100) : 1;
        s.x += s.vx * speedMult; s.y += s.vy * speedMult;
        s.life -= s.slowing ? 0.002 : 0.008;
        if (s.life <= 0 || s.x < -50 || s.x > w + 50 || s.y > h + 50) return false;

        const trailGrad = ctx.createLinearGradient(s.x - s.vx * 8, s.y - s.vy * 8, s.x, s.y);
        trailGrad.addColorStop(0, "transparent"); trailGrad.addColorStop(1, `rgba(255,255,255,${s.life * 0.6})`);
        ctx.beginPath(); ctx.moveTo(s.x - s.vx * 8, s.y - s.vy * 8); ctx.lineTo(s.x, s.y);
        ctx.strokeStyle = trailGrad; ctx.lineWidth = s.size; ctx.stroke();

        ctx.beginPath(); ctx.arc(s.x, s.y, s.size + (s.slowing ? 2 : 0), 0, Math.PI * 2);
        ctx.fillStyle = s.slowing ? `rgba(255,215,0,${s.life})` : `rgba(255,255,255,${s.life})`; ctx.fill();
        return true;
      });

      animFrameRef.current = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(animFrameRef.current); clearInterval(shootingInterval);
      window.removeEventListener("resize", resize); window.removeEventListener("mousemove", handleMouse);
      window.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("click", handleClick); canvas.removeEventListener("touchstart", handleTap);
    };
  }, [user, moonCounts, sunSize]);

  if (checkingAuth) return (
    <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "rgba(255,255,255,0.3)", fontFamily: "Georgia", letterSpacing: "4px" }}>SHUNYA</p>
    </div>
  );

  if (!user) return <AuthPage onAuth={handleAuth} />;

  const panelStyle = mobile ? {
    position: "absolute", bottom: 0, left: 0, right: 0, height: "70vh",
    background: "rgba(0,0,0,0.92)", backdropFilter: "blur(30px)",
    borderTop: "1px solid rgba(255,255,255,0.08)", borderRadius: "24px 24px 0 0",
    padding: "28px 24px", overflowY: "auto", zIndex: 20, animation: "slideUp 0.3s ease",
  } : {
    position: "absolute", top: 0, right: 0, width: "420px", height: "100vh",
    background: "rgba(0,0,0,0.85)", backdropFilter: "blur(30px)",
    borderLeft: "1px solid rgba(255,255,255,0.06)",
    padding: "40px 32px", overflowY: "auto", zIndex: 20, animation: "fadeIn 0.3s ease",
  };

  const handleBarStyle = mobile ? { width: 40, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.15)", margin: "0 auto 20px" } : { display: "none" };

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden", background: "#000", fontFamily: "Georgia, serif" }}>
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0 }} />

      {!mobile && (
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

      {mobile && (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 10, padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 70%, transparent 100%)" }}>
          <span style={{ color: "#f5a623", fontSize: 14, letterSpacing: 4, fontWeight: 300 }}>SHUNYA</span>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: "rgba(255,215,0,0.8)", fontSize: 11 }}>★ {starsCollected}</span>
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{anonymousName}</span>
            <button onClick={handleLogout} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "4px 10px", color: "rgba(255,255,255,0.4)", fontSize: 10, cursor: "pointer" }}>EXIT</button>
          </div>
        </div>
      )}

      {selectedPlanet && !journalOpen && !showPastEntries && (
        <div style={panelStyle}>
          <div style={handleBarStyle} />
          <button onClick={() => setSelectedPlanet(null)} style={styles.closeBtn}>✕</button>
          <h2 style={{ color: selectedPlanet.color, fontSize: mobile ? 22 : 28, letterSpacing: mobile ? 4 : 6, fontWeight: 300, marginBottom: 4 }}>{selectedPlanet.name}</h2>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: mobile ? 12 : 13, letterSpacing: 2, marginBottom: mobile ? 20 : 28 }}>{selectedPlanet.meaning}</p>
          <h4 style={styles.sectionTitle}>What it is</h4>
          <p style={{ ...styles.sectionText, fontSize: mobile ? 13 : 14 }}>{selectedPlanet.description}</p>
          <h4 style={styles.sectionTitle}>How it lives in you</h4>
          <p style={{ ...styles.sectionText, fontSize: mobile ? 13 : 14 }}>{selectedPlanet.howItLives}</p>
          <div style={{ margin: mobile ? "20px 0" : "28px 0", display: "flex", gap: mobile ? 6 : 8, justifyContent: "center" }}>
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} style={{ width: mobile ? 10 : 12, height: mobile ? 10 : 12, borderRadius: "50%", background: i < (moonCounts[selectedPlanet.id] || 0) ? selectedPlanet.color : "rgba(255,255,255,0.1)", border: `1px solid ${i < (moonCounts[selectedPlanet.id] || 0) ? selectedPlanet.color : "rgba(255,255,255,0.15)"}`, transition: "all 0.3s" }} />
            ))}
          </div>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, textAlign: "center", marginBottom: mobile ? 16 : 24 }}>{moonCounts[selectedPlanet.id] || 0} / 10 moons</p>
          <button onClick={() => setJournalOpen(true)} style={{ ...styles.goldButton, background: `linear-gradient(135deg, ${selectedPlanet.color}, ${selectedPlanet.color}dd)` }}>Start Journaling</button>
          <button onClick={() => loadPastEntries(selectedPlanet.id)} style={styles.ghostButton}>View Past Entries</button>
        </div>
      )}

      {selectedPlanet && journalOpen && (
        <div style={panelStyle}>
          <div style={handleBarStyle} />
          <button onClick={() => setJournalOpen(false)} style={styles.closeBtn}>← Back</button>
          <h3 style={{ color: selectedPlanet.color, fontSize: mobile ? 16 : 18, letterSpacing: mobile ? 3 : 4, fontWeight: 300, marginBottom: 8 }}>{selectedPlanet.name}</h3>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: mobile ? 12 : 13, fontStyle: "italic", marginBottom: mobile ? 16 : 24, lineHeight: 1.6 }}>{selectedPlanet.journalPrompt}</p>
          <textarea value={journalText} onChange={(e) => setJournalText(e.target.value)} placeholder="Write what your soul needs to say..." style={{ ...styles.textarea, height: mobile ? "150px" : "200px", fontSize: mobile ? 14 : 15 }} />
          <button onClick={saveJournalEntry} disabled={saving || !journalText.trim()} style={{ ...styles.goldButton, background: `linear-gradient(135deg, ${selectedPlanet.color}, ${selectedPlanet.color}dd)`, opacity: saving || !journalText.trim() ? 0.5 : 1 }}>{saving ? "Inscribing..." : "✦ Inscribe"}</button>
        </div>
      )}

      {selectedPlanet && showPastEntries && (
        <div style={panelStyle}>
          <div style={handleBarStyle} />
          <button onClick={() => setShowPastEntries(false)} style={styles.closeBtn}>← Back</button>
          <h3 style={{ color: selectedPlanet.color, fontSize: mobile ? 16 : 18, letterSpacing: mobile ? 3 : 4, fontWeight: 300, marginBottom: mobile ? 16 : 24 }}>Past Reflections</h3>
          {pastEntries.length === 0 ? (
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 14, textAlign: "center", marginTop: 40 }}>No entries yet. Begin your journey.</p>
          ) : (
            <div style={{ overflowY: "auto", maxHeight: mobile ? "45vh" : "60vh" }}>
              {pastEntries.map((entry) => (
                <div key={entry.id} style={styles.entryCard}>
                  <p style={{ color: "rgba(255,255,255,0.7)", fontSize: mobile ? 13 : 14, lineHeight: 1.7, marginBottom: 8 }}>{entry.content}</p>
                  <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 11 }}>{new Date(entry.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { transform: scale(1); opacity: 0.6; } 50% { transform: scale(1.1); opacity: 1; } }
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

const styles = {
  closeBtn: { background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 14, cursor: "pointer", marginBottom: 20, letterSpacing: 1, fontFamily: "Georgia, serif" },
  sectionTitle: { color: "rgba(255,255,255,0.5)", fontSize: 11, letterSpacing: 3, textTransform: "uppercase", marginBottom: 8, fontWeight: 400 },
  sectionText: { color: "rgba(255,255,255,0.65)", fontSize: 14, lineHeight: 1.8, marginBottom: 20 },
  goldButton: { width: "100%", padding: "16px", border: "none", borderRadius: "12px", color: "#000", fontSize: 14, fontWeight: 700, cursor: "pointer", letterSpacing: 1, fontFamily: "Georgia, serif" },
  ghostButton: { width: "100%", padding: "14px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "rgba(255,255,255,0.4)", fontSize: 13, cursor: "pointer", letterSpacing: 1, marginTop: 12, fontFamily: "Georgia, serif" },
  textarea: { width: "100%", height: "200px", padding: "18px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", color: "#fff", fontSize: 15, lineHeight: 1.8, resize: "none", outline: "none", marginBottom: 20, fontFamily: "Georgia, serif", boxSizing: "border-box" },
  entryCard: { padding: "18px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", marginBottom: 12 },
};
