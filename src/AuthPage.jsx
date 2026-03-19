import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabaseClient";
import { generateAnonymousName, generateAvatarSeed } from "./nameGenerator";

export default function AuthPage({ onAuth, onSignupStart }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [revealName, setRevealName] = useState(null);
  const [authUser, setAuthUser] = useState(null);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [tick, setTick] = useState(0);
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const timeRef = useRef(0);

  const mobile = typeof window !== "undefined" && window.innerWidth < 768;

  // ─── Animated canvas background ───
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    // Stars
    const stars = Array.from({ length: 280 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.4 + 0.3,
      twinkle: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.015 + 0.005,
      color: Math.random() > 0.85 ? `rgba(245,166,35,` : Math.random() > 0.7 ? `rgba(167,139,250,` : `rgba(255,255,255,`,
    }));

    // Orbiting particles around center
    const particles = Array.from({ length: 60 }, (_, i) => ({
      angle: (i / 60) * Math.PI * 2,
      radius: 180 + Math.random() * 260,
      speed: (0.0002 + Math.random() * 0.0003) * (Math.random() > 0.5 ? 1 : -1),
      size: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.4 + 0.1,
      color: Math.random() > 0.6 ? "245,166,35" : Math.random() > 0.5 ? "167,139,250" : "255,255,255",
    }));

    // Shooting stars
    const shooters = [];
    const spawnShooter = () => {
      shooters.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight * 0.5,
        vx: (Math.random() - 0.3) * 5,
        vy: Math.random() * 2.5 + 1,
        life: 1,
        size: Math.random() * 1.5 + 0.5,
      });
    };
    const shootInterval = setInterval(spawnShooter, 2500);

    const render = (now) => {
      timeRef.current = now * 0.001;
      const t = timeRef.current;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const cx = w / 2;
      const cy = h / 2;

      ctx.fillStyle = "#02010a";
      ctx.fillRect(0, 0, w, h);

      // Deep nebula layers
      const drawNeb = (x, y, r, col, alpha) => {
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, `rgba(${col},${alpha})`);
        g.addColorStop(0.4, `rgba(${col},${alpha * 0.4})`);
        g.addColorStop(1, "transparent");
        ctx.fillStyle = g;
        ctx.fillRect(x - r, y - r, r * 2, r * 2);
      };

      drawNeb(cx * 0.3, cy * 0.4, w * 0.45, "80,20,140", 0.22 + Math.sin(t * 0.3) * 0.04);
      drawNeb(cx * 1.7, cy * 1.6, w * 0.4, "30,50,140", 0.18 + Math.sin(t * 0.25) * 0.03);
      drawNeb(cx, cy, w * 0.3, "140,60,20", 0.12 + Math.sin(t * 0.4) * 0.03);
      drawNeb(cx * 0.6, cy * 1.4, w * 0.25, "100,30,160", 0.14);
      drawNeb(cx * 1.5, cy * 0.3, w * 0.2, "40,80,160", 0.12);

      // Central golden aura — the sacred core
      const auraSize = (mobile ? 160 : 220) + Math.sin(t * 0.8) * 15;
      const aura = ctx.createRadialGradient(cx, cy, 0, cx, cy, auraSize);
      aura.addColorStop(0, `rgba(245,166,35,${0.08 + Math.sin(t * 0.6) * 0.03})`);
      aura.addColorStop(0.4, `rgba(245,166,35,${0.04 + Math.sin(t * 0.5) * 0.02})`);
      aura.addColorStop(0.7, `rgba(180,100,20,0.02)`);
      aura.addColorStop(1, "transparent");
      ctx.fillStyle = aura;
      ctx.fillRect(cx - auraSize, cy - auraSize, auraSize * 2, auraSize * 2);

      // Stars
      stars.forEach(s => {
        s.twinkle += s.speed;
        const a = 0.25 + Math.sin(s.twinkle) * 0.25;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `${s.color}${a})`;
        ctx.fill();
      });

      // Orbiting particles
      particles.forEach(p => {
        p.angle += p.speed;
        const px = cx + Math.cos(p.angle) * p.radius * (mobile ? 0.6 : 1);
        const py = cy + Math.sin(p.angle) * p.radius * (mobile ? 0.35 : 0.4);
        const alpha = p.opacity * (0.7 + Math.sin(p.angle * 3 + t) * 0.3);
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color},${alpha})`;
        ctx.fill();
      });

      // Shooting stars
      for (let i = shooters.length - 1; i >= 0; i--) {
        const s = shooters[i];
        s.x += s.vx; s.y += s.vy; s.life -= 0.012;
        if (s.life <= 0) { shooters.splice(i, 1); continue; }
        const tg = ctx.createLinearGradient(s.x - s.vx * 8, s.y - s.vy * 8, s.x, s.y);
        tg.addColorStop(0, "transparent");
        tg.addColorStop(1, `rgba(255,255,255,${s.life * 0.7})`);
        ctx.beginPath();
        ctx.moveTo(s.x - s.vx * 8, s.y - s.vy * 8);
        ctx.lineTo(s.x, s.y);
        ctx.strokeStyle = tg;
        ctx.lineWidth = s.size;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${s.life})`;
        ctx.fill();
      }

      // Sacred geometry rings
      for (let ring = 0; ring < 3; ring++) {
        const rRadius = (mobile ? 90 : 130) + ring * (mobile ? 55 : 75);
        const rAlpha = (0.04 - ring * 0.01) + Math.sin(t * 0.4 + ring) * 0.015;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rRadius, rRadius * (mobile ? 0.35 : 0.38), 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(245,166,35,${rAlpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      animRef.current = requestAnimationFrame(render);
    };
    animRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animRef.current);
      clearInterval(shootInterval);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const moods = [
    { label: "Lost", sub: "not sure where life is going", planet: "dharma", planetColor: "#f093fb" },
    { label: "Heartbroken", sub: "aching, missing someone", planet: "prema", planetColor: "#e8a0bf" },
    { label: "Anxious", sub: "worried about what is coming", planet: "kaal", planetColor: "#a78bfa" },
    { label: "Torn", sub: "between versions of yourself", planet: "seesha", planetColor: "#7dd3fc" },
    { label: "Questioning", sub: "who am I, really", planet: "aatma", planetColor: "#e07840" },
    { label: "Stuck", sub: "repeating the same patterns", planet: "karma", planetColor: "#ff6b6b" },
    { label: "Unseen", sub: "hiding behind a version of myself", planet: "maya", planetColor: "#fd79a8" },
    { label: "Ready", sub: "ready to let something go", planet: "moksha", planetColor: "#ffd700" },
    { label: "Curious", sub: "just here to explore", planet: null, planetColor: "#f5a623" },
  ];

  const toEmail = (u) => `${u.toLowerCase().trim()}@shunyajournal.in`;

  const validateUsername = (u) => {
    if (u.length < 3) return "Username must be at least 3 characters";
    if (u.length > 20) return "Username must be under 20 characters";
    if (!/^[a-zA-Z0-9._]+$/.test(u)) return "Only letters, numbers, dots and underscores";
    return null;
  };

  const handleSignup = async () => {
    const valError = validateUsername(username);
    if (valError) { setError(valError); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true); setError("");
    if (onSignupStart) onSignupStart();
    const { data: authData, error: authError } = await supabase.auth.signUp({ email: toEmail(username), password });
    if (authError) {
      setError(authError.message.includes("already registered") ? "This username is already taken. Try another one." : authError.message);
      setLoading(false); return;
    }
    const anonymousName = generateAnonymousName();
    const avatarSeed = generateAvatarSeed();
    const { error: profileError } = await supabase.from("profiles").insert({ id: authData.user.id, anonymous_name: anonymousName, avatar_seed: avatarSeed });
    if (profileError) { setError(profileError.message); setLoading(false); return; }
    const planets = ["aatma", "seesha", "kaal", "dharma", "moksha", "karma", "prema", "maya"];
    await supabase.from("moon_progress").insert(planets.map((p) => ({ user_id: authData.user.id, planet_id: p, moon_count: 0 })));
    setAuthUser(authData.user); setRevealName(anonymousName);
    setTimeout(() => setShowOnboarding(true), 3500);
  };

  const handleLogin = async () => {
    if (!username.trim() || !password) { setError("Enter your username and password"); return; }
    setLoading(true); setError("");
    const { data, error: loginError } = await supabase.auth.signInWithPassword({ email: toEmail(username), password });
    if (loginError) { setError(loginError.message.includes("Invalid login") ? "Wrong username or password" : loginError.message); setLoading(false); return; }
    const { data: profile } = await supabase.from("profiles").select("anonymous_name").eq("id", data.user.id).single();
    onAuth(data.user, profile?.anonymous_name || "Cosmic Wanderer");
  };

  const onboardingScreens = [
    { title: "What is Shunya?", content: "Shunya is not zero.\n\nIt came as a 3 AM thought — a feeling that was nothing, yet held everything within it. Zero, yet infinite. Empty, yet full of possibility.\n\nAt Shunya, everything is still possible.", icon: "✦", color: "#f5a623" },
    { title: "Your Universe", content: "You are looking at your inner solar system — 8 planets, each representing a different part of who you are.\n\nEach planet holds a different part of you — your soul, your mirror, your time, your purpose, your freedom, your choices, your love, your hunger.\n\nJournal freely. The universe decides where your words belong.", icon: "🪐", color: "#a78bfa" },
    { title: "Moons & Your Core", content: "Every time you journal, a moon is born — orbiting the planet you wrote on.\n\nAfter 10 moons, they are pulled toward your Sun — Shunya, your core. The Sun grows brighter and larger.\n\nThe more you reflect, the stronger your core becomes. This is healing made visible.", icon: "🌙", color: "#4ecdc4" },
    { title: "Catch the Stars", content: "Shooting stars fly through your universe. Move your cursor close — they slow down, pulled by your gravity.\n\nGet close enough and you catch them.\n\nOn Moksha, you can send sealed messages to your future self. On Dharma, you can commit to purpose.\n\nYour universe is alive. Explore it.", icon: "🌠", color: "#ffd700" },
  ];

  // ─── Cinematic Name Reveal ───
  if (revealName && !showOnboarding) {
    return (
      <div style={{ minHeight: "100vh", background: "#02010a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif", position: "relative", overflow: "hidden" }}>
        <canvas ref={canvasRef} style={{ position: "absolute", inset: 0 }} />
        <div style={{ position: "relative", zIndex: 2, textAlign: "center", padding: mobile ? "0 32px" : 0, animation: "nameReveal 1s cubic-bezier(0.16,1,0.3,1)" }}>
          <p style={{ color: "rgba(255,255,255,0.25)", fontSize: mobile ? 10 : 12, letterSpacing: 5, marginBottom: 32, fontFamily: "Georgia,serif" }}>THE UNIVERSE NAMES YOU</p>
          <div style={{
            width: mobile ? 80 : 100, height: mobile ? 80 : 100, borderRadius: "50%",
            background: "radial-gradient(circle at 38% 38%, rgba(255,255,255,0.9), #f5a623 40%, #c4700a 80%)",
            boxShadow: "0 0 60px rgba(245,166,35,0.5), 0 0 120px rgba(245,166,35,0.2)",
            margin: "0 auto 32px",
            animation: "planetAppear 1.5s cubic-bezier(0.16,1,0.3,1)",
          }} />
          <h1 style={{ color: "#f5a623", fontSize: mobile ? 28 : 40, fontWeight: 300, letterSpacing: mobile ? 4 : 8, marginBottom: 16, textShadow: "0 0 40px rgba(245,166,35,0.5)" }}>
            {revealName}
          </h1>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: mobile ? 12 : 14, letterSpacing: 2, lineHeight: 2, maxWidth: 340, margin: "0 auto" }}>
            This is who you are in the universe.<br/>No one else will know this name.
          </p>
        </div>
        <style>{`
          @keyframes nameReveal { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes planetAppear { from { opacity: 0; transform: scale(0.3); } to { opacity: 1; transform: scale(1); } }
        `}</style>
      </div>
    );
  }

  // ─── Cinematic Onboarding ───
  if (showOnboarding && revealName) {
    const screen = onboardingScreens[onboardingStep];
    const isLast = onboardingStep === onboardingScreens.length - 1;
    return (
      <div style={{ minHeight: "100vh", background: "#02010a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif", position: "relative", padding: mobile ? "40px 28px" : "40px", overflow: "hidden" }}>
        <canvas ref={canvasRef} style={{ position: "absolute", inset: 0 }} />

        {/* Progress dots */}
        <div style={{ position: "absolute", top: mobile ? 28 : 40, display: "flex", gap: 10, zIndex: 2 }}>
          {onboardingScreens.map((_, i) => (
            <div key={i} style={{
              width: i === onboardingStep ? 28 : 8, height: 8, borderRadius: 4,
              background: i === onboardingStep ? screen.color : i < onboardingStep ? "rgba(245,166,35,0.3)" : "rgba(255,255,255,0.08)",
              transition: "all 0.4s ease",
              boxShadow: i === onboardingStep ? `0 0 10px ${screen.color}66` : "none",
            }} />
          ))}
        </div>

        <button onClick={() => onAuth(authUser, revealName, null, true)} style={{
          position: "absolute", top: mobile ? 24 : 36, right: mobile ? 20 : 36,
          background: "none", border: "none", color: "rgba(255,255,255,0.2)",
          fontSize: 11, cursor: "pointer", letterSpacing: 3, fontFamily: "Georgia, serif", zIndex: 2,
        }}>SKIP</button>

        <div key={onboardingStep} style={{ maxWidth: 540, textAlign: "center", position: "relative", zIndex: 2, animation: "onboardIn 0.7s cubic-bezier(0.16,1,0.3,1)" }}>
          {/* Icon with glow */}
          <div style={{
            fontSize: mobile ? 44 : 56, display: "block", marginBottom: mobile ? 24 : 32,
            filter: `drop-shadow(0 0 20px ${screen.color}66)`,
          }}>{screen.icon}</div>

          {/* Sacred line above title */}
          <div style={{ width: 40, height: 1, margin: "0 auto 20px", background: `linear-gradient(90deg, transparent, ${screen.color}88, transparent)` }} />

          <h2 style={{
            color: screen.color, fontSize: mobile ? 20 : 26,
            fontWeight: 300, letterSpacing: mobile ? 4 : 7,
            marginBottom: mobile ? 20 : 28,
            textShadow: `0 0 30px ${screen.color}44`,
          }}>{screen.title}</h2>

          <p style={{
            color: "rgba(255,255,255,0.55)", fontSize: mobile ? 14 : 16,
            lineHeight: 2.2, whiteSpace: "pre-line", fontStyle: "italic",
            marginBottom: mobile ? 36 : 48,
          }}>{screen.content}</p>

          <button onClick={() => {
            if (isLast) onAuth(authUser, revealName, null, true);
            else setOnboardingStep(s => s + 1);
          }} style={{
            padding: mobile ? "14px 36px" : "16px 48px",
            background: `linear-gradient(135deg, ${screen.color}33, ${screen.color}18)`,
            border: `1px solid ${screen.color}44`,
            borderRadius: 14, cursor: "pointer",
            color: screen.color, fontSize: mobile ? 13 : 14,
            letterSpacing: 3, fontFamily: "Georgia, serif",
            transition: "all 0.3s",
            boxShadow: `0 0 20px ${screen.color}22`,
          }}>
            {isLast ? "✦ Enter Your Universe" : "Continue →"}
          </button>
        </div>

        <style>{`
          @keyframes onboardIn {
            from { opacity: 0; transform: translateY(16px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}</style>
      </div>
    );
  }

  // ─── Main Auth Page ───
  return (
    <div style={{ minHeight: "100vh", background: "#02010a", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif", position: "relative", overflow: "hidden" }}>

      {/* Animated canvas */}
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0 }} />

      {/* Left side — Sanskrit/cosmic text decoration (desktop only) */}
      {!mobile && (
        <>
          <div style={{
            position: "absolute", left: 48, top: "50%", transform: "translateY(-50%)",
            display: "flex", flexDirection: "column", gap: 28, zIndex: 1,
          }}>
            {["आत्मा", "प्राण", "काल", "धर्म"].map((s, i) => (
              <span key={i} style={{
                color: "rgba(245,166,35,0.08)", fontSize: 18, letterSpacing: 4,
                fontFamily: "Georgia, serif", writingMode: "vertical-rl",
                animation: `fadeFloat ${3 + i * 0.5}s ease-in-out infinite alternate`,
                animationDelay: `${i * 0.4}s`,
              }}>{s}</span>
            ))}
          </div>
          <div style={{
            position: "absolute", right: 48, top: "50%", transform: "translateY(-50%)",
            display: "flex", flexDirection: "column", gap: 28, zIndex: 1,
          }}>
            {["मोक्ष", "कर्म", "प्रेम", "माया"].map((s, i) => (
              <span key={i} style={{
                color: "rgba(167,139,250,0.08)", fontSize: 18, letterSpacing: 4,
                fontFamily: "Georgia, serif", writingMode: "vertical-rl",
                animation: `fadeFloat ${3 + i * 0.5}s ease-in-out infinite alternate`,
                animationDelay: `${i * 0.3}s`,
              }}>{s}</span>
            ))}
          </div>
        </>
      )}

      {/* Central form */}
      <div style={{
        textAlign: "center", position: "relative", zIndex: 2,
        width: mobile ? "88vw" : 400,
        animation: "authEntrance 1.2s cubic-bezier(0.16,1,0.3,1)",
      }}>

        {/* Top ornament */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 8 }}>
          <div style={{ width: mobile ? 30 : 50, height: 1, background: "linear-gradient(90deg, transparent, rgba(245,166,35,0.4))" }} />
          <span style={{ color: "rgba(245,166,35,0.5)", fontSize: 10 }}>✦</span>
          <div style={{ width: mobile ? 30 : 50, height: 1, background: "linear-gradient(90deg, rgba(245,166,35,0.4), transparent)" }} />
        </div>

        {/* Logo */}
        <h1 style={{
          color: "#f5a623", fontSize: mobile ? 52 : 72,
          letterSpacing: mobile ? 16 : 26, marginBottom: 10, fontWeight: 400,
          textShadow: "0 0 40px rgba(245,166,35,0.9), 0 0 80px rgba(245,166,35,0.5), 0 0 160px rgba(245,166,35,0.2)",
          animation: "logoGlow 3s ease-in-out infinite alternate",
        }}>SHUNYA</h1>

        <p style={{
          color: "rgba(255,255,255,0.65)", fontSize: mobile ? 11 : 13,
          letterSpacing: mobile ? 5 : 8, marginBottom: 6,
          animation: "authEntrance 1.4s cubic-bezier(0.16,1,0.3,1)",
        }}>FOR YOUR 3 AM THOUGHTS</p>

        {/* Sanskrit subtitle */}
        <p style={{
          color: "rgba(245,166,35,0.75)", fontSize: mobile ? 15 : 18,
          letterSpacing: 2, marginBottom: mobile ? 32 : 44,
          fontStyle: "italic", fontFamily: "Georgia, serif",
          textShadow: "0 0 20px rgba(245,166,35,0.35)",
          animation: "authEntrance 1.6s cubic-bezier(0.16,1,0.3,1) 0.3s both",
        }}>शून्य — the void that holds everything</p>

        {/* Divider with ornament */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: mobile ? 28 : 36 }}>
          <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06))" }} />
          <div style={{ display: "flex", gap: 6 }}>
            {["#e07840","#4ecdc4","#a78bfa","#f093fb","#ffd700","#ff6b6b","#e8a0bf","#fd79a8"].map((c, i) => (
              <div key={i} style={{
                width: 4, height: 4, borderRadius: "50%", background: c,
                boxShadow: `0 0 4px ${c}88`,
                animation: `dotPulse ${1.5 + i * 0.15}s ease-in-out infinite alternate`,
                animationDelay: `${i * 0.1}s`,
              }} />
            ))}
          </div>
          <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(255,255,255,0.06), transparent)" }} />
        </div>

        {/* Mode toggle */}
        <div style={{ display: "flex", justifyContent: "center", gap: mobile ? 24 : 36, marginBottom: mobile ? 28 : 36 }}>
          {["login", "signup"].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(""); }} style={{
              background: "none", border: "none", cursor: "pointer",
              fontFamily: "Georgia, serif",
              color: mode === m ? "#fff" : "rgba(255,255,255,0.25)",
              fontSize: mobile ? 11 : 13, letterSpacing: 3, fontWeight: 400,
              paddingBottom: 10, transition: "all 0.3s",
              borderBottom: mode === m ? "1px solid #f5a623" : "1px solid transparent",
              textShadow: mode === m ? "0 0 20px rgba(245,166,35,0.3)" : "none",
            }}>
              {m === "login" ? "LOG IN" : "CREATE ACCOUNT"}
            </button>
          ))}
        </div>

        {/* Inputs */}
        <input
          type="text"
          placeholder={mode === "signup" ? "Choose a username" : "Username"}
          value={username}
          onChange={(e) => setUsername(e.target.value.replace(/\s/g, ""))}
          autoComplete="username"
          style={{
            width: "100%", padding: mobile ? "15px 20px" : "17px 24px",
            marginBottom: 12,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 14, color: "rgba(255,255,255,0.9)",
            fontSize: mobile ? 15 : 16, outline: "none",
            boxSizing: "border-box", fontFamily: "Georgia, serif",
            letterSpacing: 1, textAlign: "center",
            transition: "all 0.3s",
          }}
        />

        {mode === "signup" && username.length > 0 && (
          <p style={{
            color: validateUsername(username) ? "rgba(255,107,107,0.7)" : "rgba(78,205,196,0.6)",
            fontSize: 11, marginTop: -4, marginBottom: 10, letterSpacing: 0.5,
          }}>{validateUsername(username) || "✓ Looks good"}</p>
        )}

        <input
          type="password"
          placeholder={mode === "signup" ? "Create a password (6+ chars)" : "Password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          onKeyDown={(e) => { if (e.key === "Enter") { mode === "signup" ? handleSignup() : handleLogin(); } }}
          style={{
            width: "100%", padding: mobile ? "15px 20px" : "17px 24px",
            marginBottom: 8,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 14, color: "rgba(255,255,255,0.9)",
            fontSize: mobile ? 15 : 16, outline: "none",
            boxSizing: "border-box", fontFamily: "Georgia, serif",
            letterSpacing: 1, textAlign: "center",
            transition: "all 0.3s",
          }}
        />

        {error && (
          <p style={{
            color: "rgba(255,107,107,0.85)", fontSize: 12,
            marginTop: 10, lineHeight: 1.6, letterSpacing: 0.3,
          }}>{error}</p>
        )}

        {/* CTA Button */}
        <button
          onClick={mode === "signup" ? handleSignup : handleLogin}
          disabled={loading}
          style={{
            width: "100%", padding: mobile ? "17px" : "20px",
            background: loading
              ? "rgba(245,166,35,0.1)"
              : "linear-gradient(135deg, #f5a623 0%, #e8920a 50%, #d4800a 100%)",
            border: loading ? "1px solid rgba(245,166,35,0.2)" : "none",
            borderRadius: 14, color: loading ? "rgba(245,166,35,0.4)" : "#0a0600",
            fontSize: mobile ? 13 : 14, fontWeight: 700, cursor: loading ? "default" : "pointer",
            letterSpacing: 3, marginTop: mobile ? 18 : 24,
            fontFamily: "Georgia, serif", transition: "all 0.3s",
            boxShadow: loading ? "none" : "0 4px 30px rgba(245,166,35,0.3), 0 1px 0 rgba(255,255,255,0.15) inset",
          }}
        >
          {loading ? "✦ ..." : mode === "signup" ? "✦ RECEIVE YOUR COSMIC NAME" : "✦ ENTER SHUNYA"}
        </button>

        {/* Hints */}
        {mode === "signup" && (
          <div style={{ marginTop: mobile ? 24 : 32 }}>
            <p style={{ color: "rgba(255,255,255,0.25)", fontSize: mobile ? 10 : 11, lineHeight: 1.9, maxWidth: 340, margin: "0 auto", letterSpacing: 0.3 }}>
              No email. No real name. Just a username only you know.
            </p>
            <p style={{ color: "rgba(255,80,80,0.9)", fontSize: mobile ? 11 : 12, marginTop: 14, lineHeight: 1.7, fontWeight: 700, letterSpacing: 0.5, padding: "10px 14px", background: "rgba(255,60,60,0.08)", border: "1px solid rgba(255,80,80,0.2)", borderRadius: 10 }}>
              ⚠ Passwords are not recoverable at the moment — please write it somewhere safe before continuing.
            </p>
          </div>
        )}
        {mode === "login" && (
          <p style={{ color: "rgba(255,255,255,0.2)", fontSize: mobile ? 10 : 11, marginTop: mobile ? 24 : 32, lineHeight: 1.7, letterSpacing: 0.3 }}>
            Use the username and password you created when you signed up.
          </p>
        )}

        {/* Bottom ornament */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: mobile ? 32 : 44 }}>
          <div style={{ width: mobile ? 20 : 36, height: 1, background: "linear-gradient(90deg, transparent, rgba(245,166,35,0.15))" }} />
          <span style={{ color: "rgba(245,166,35,0.15)", fontSize: 9, letterSpacing: 4 }}>SHUNYA</span>
          <div style={{ width: mobile ? 20 : 36, height: 1, background: "linear-gradient(90deg, rgba(245,166,35,0.15), transparent)" }} />
        </div>
      </div>

      <style>{`
        @keyframes authEntrance {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes logoGlow {
          from { text-shadow: 0 0 40px rgba(245,166,35,0.3), 0 0 80px rgba(245,166,35,0.1); }
          to { text-shadow: 0 0 70px rgba(245,166,35,0.55), 0 0 140px rgba(245,166,35,0.2); }
        }
        @keyframes fadeFloat {
          from { opacity: 0.05; transform: translateY(0); }
          to { opacity: 0.12; transform: translateY(-8px); }
        }
        @keyframes dotPulse {
          from { opacity: 0.4; transform: scale(1); }
          to { opacity: 1; transform: scale(1.3); }
        }
        input::placeholder { color: rgba(255,255,255,0.2); }
        input:focus {
          border-color: rgba(245,166,35,0.35) !important;
          background: rgba(245,166,35,0.04) !important;
          box-shadow: 0 0 20px rgba(245,166,35,0.08);
        }
      `}</style>
    </div>
  );
}
