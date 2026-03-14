import { useState } from "react";
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
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const [selectedMood, setSelectedMood] = useState(null);

  const moods = [
    { label: "Lost", sub: "not sure where life is going", planet: "dharma", planetName: "DHARMA", planetColor: "#f093fb", message: "Dharma is waiting to help you find your path" },
    { label: "Heartbroken", sub: "aching, missing someone", planet: "prema", planetName: "PREMA", planetColor: "#e8a0bf", message: "Prema holds space for your heart" },
    { label: "Anxious", sub: "worried about what is coming", planet: "kaal", planetName: "KAAL", planetColor: "#a78bfa", message: "Kaal is ready to sit with you in the uncertainty" },
    { label: "Empty", sub: "disconnected, running on autopilot", planet: "pranaa", planetName: "PRANAA", planetColor: "#4ecdc4", message: "Pranaa wants to help you feel alive again" },
    { label: "Questioning", sub: "who am I, really", planet: "aatma", planetName: "AATMA", planetColor: "#e07840", message: "Aatma has been waiting for you to ask" },
    { label: "Stuck", sub: "repeating the same patterns", planet: "karma", planetName: "KARMA", planetColor: "#ff6b6b", message: "Karma is ready to break the cycle with you" },
    { label: "Unseen", sub: "hiding behind a version of myself", planet: "maya", planetName: "MAYA", planetColor: "#fd79a8", message: "Maya will help you see through the illusion" },
    { label: "Ready", sub: "ready to let something go", planet: "moksha", planetName: "MOKSHA", planetColor: "#ffd700", message: "Moksha has been saving a space just for you" },
    { label: "Curious", sub: "just here to explore", planet: null, planetName: null, planetColor: "#f5a623", message: "Your universe is waiting — explore freely" },
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
    const planets = ["aatma", "pranaa", "kaal", "dharma", "moksha", "karma", "prema", "maya"];
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

  const mobile = typeof window !== "undefined" && window.innerWidth < 768;

  const onboardingScreens = [
    { title: "What is Shunya?", content: "Shunya is not zero.\n\nIt came as a 3 AM thought — a feeling that was nothing, yet held everything within it. Zero, yet infinite. Empty, yet full of possibility.\n\nAt Shunya, everything is still possible.", icon: "✦" },
    { title: "Your Universe", content: "You are looking at your inner solar system — 8 planets, each representing a different part of who you are.\n\nAatma is your soul. Pranaa is your life force. Kaal is your relationship with time. Dharma is your purpose. Moksha is your freedom. Karma is your actions. Prema is your love. Maya is your illusions.\n\nTap any planet to enter its world.", icon: "🪐" },
    { title: "Moons & Your Core", content: "Every time you journal, a moon is born — orbiting the planet you wrote on.\n\nAfter 10 moons, they are pulled toward your Sun — Shunya, your core. The Sun grows brighter and larger.\n\nThe more you reflect, the stronger your core becomes. This is healing made visible.", icon: "🌙" },
    { title: "Catch the Stars", content: "Shooting stars fly through your universe. Move your cursor close — they slow down, pulled by your gravity.\n\nGet close enough and you catch them. Stars are your rewards.\n\nOn Moksha, you can send sealed messages to your future self. On Dharma, you can commit to purpose with a to-do list.\n\nYour universe is alive. Explore it.", icon: "🌠" },
  ];

  // ─── Cinematic Onboarding ───
  if (showOnboarding && revealName) {
    const screen = onboardingScreens[onboardingStep];
    const isLast = onboardingStep === onboardingScreens.length - 1;
    return (
      <div style={{ minHeight: "100vh", background: "radial-gradient(ellipse at center, #0a0a1a 0%, #000000 70%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Georgia', serif", position: "relative", padding: mobile ? "40px 28px" : "40px" }}>
        <div style={{ position: "absolute", top: mobile ? 24 : 36, display: "flex", gap: 8 }}>
          {onboardingScreens.map((_, i) => (<div key={i} style={{ width: i === onboardingStep ? 24 : 8, height: 8, borderRadius: 4, background: i === onboardingStep ? "rgba(245,166,35,0.8)" : i < onboardingStep ? "rgba(245,166,35,0.3)" : "rgba(255,255,255,0.1)", transition: "all 0.4s ease" }} />))}
        </div>
        <button onClick={() => onAuth(authUser, revealName)} style={{ position: "absolute", top: mobile ? 20 : 32, right: mobile ? 20 : 32, background: "none", border: "none", color: "rgba(255,255,255,0.25)", fontSize: 12, cursor: "pointer", letterSpacing: 2, fontFamily: "Georgia, serif" }}>SKIP</button>
        <div key={onboardingStep} style={{ maxWidth: 520, textAlign: "center", animation: "onboardFadeIn 0.6s ease" }}>
          <span style={{ fontSize: mobile ? 36 : 48, display: "block", marginBottom: mobile ? 20 : 28 }}>{screen.icon}</span>
          <h1 style={{ color: "#f5a623", fontSize: mobile ? 24 : 34, letterSpacing: mobile ? 3 : 6, fontWeight: 300, marginBottom: mobile ? 16 : 24 }}>{screen.title}</h1>
          <div style={{ color: "rgba(255,255,255,0.55)", fontSize: mobile ? 14 : 16, lineHeight: 2, whiteSpace: "pre-line" }}>{screen.content}</div>
        </div>
        <div style={{ position: "absolute", bottom: mobile ? 36 : 48, display: "flex", gap: 16, alignItems: "center" }}>
          {onboardingStep > 0 && (<button onClick={() => setOnboardingStep((s) => s - 1)} style={{ padding: "12px 28px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "rgba(255,255,255,0.4)", fontSize: 14, cursor: "pointer", fontFamily: "Georgia, serif", letterSpacing: 1 }}>Back</button>)}
          <button onClick={() => { if (isLast) { setShowMoodSelector(true); setShowOnboarding(false); } else { setOnboardingStep((s) => s + 1); } }} style={{ padding: "14px 36px", background: isLast ? "linear-gradient(135deg, #f5a623, #e8912d)" : "rgba(255,255,255,0.06)", border: isLast ? "none" : "1px solid rgba(255,255,255,0.12)", borderRadius: 12, color: isLast ? "#000" : "rgba(255,255,255,0.7)", fontSize: mobile ? 14 : 15, fontWeight: isLast ? 700 : 400, cursor: "pointer", fontFamily: "Georgia, serif", letterSpacing: isLast ? 1.5 : 1, boxShadow: isLast ? "0 4px 20px rgba(245,166,35,0.3)" : "none" }}>{isLast ? "✦ Enter Your Universe" : "Next"}</button>
        </div>
        <style>{`@keyframes onboardFadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      </div>
    );
  }

  // ─── Mood Selector ───
  if (showMoodSelector && revealName) {
    return (
      <div style={{ minHeight: "100vh", background: "radial-gradient(ellipse at center, #0a0a1a 0%, #000000 70%)", display: "flex", flexDirection: "column", alignItems: "center", fontFamily: "'Georgia', serif", position: "relative", padding: mobile ? "40px 20px" : "50px 40px", overflowY: "auto" }}>
        <button onClick={() => onAuth(authUser, revealName)} style={{ position: "absolute", top: mobile ? 20 : 32, right: mobile ? 20 : 32, background: "none", border: "none", color: "rgba(255,255,255,0.25)", fontSize: 12, cursor: "pointer", letterSpacing: 2, fontFamily: "Georgia, serif" }}>SKIP</button>
        <div style={{ textAlign: "center", marginBottom: mobile ? 24 : 36, marginTop: mobile ? 20 : 0 }}>
          <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 11, letterSpacing: 3, textTransform: "uppercase", marginBottom: 16 }}>Now that you know what Shunya is</p>
          <h1 style={{ color: "rgba(255,255,255,0.85)", fontSize: mobile ? 22 : 32, fontWeight: 300, letterSpacing: mobile ? 2 : 4, marginBottom: 10 }}>How are you feeling right now?</h1>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: mobile ? 12 : 14, lineHeight: 1.7 }}>Let us take the first step together.</p>
        </div>
        {selectedMood ? (
          <div style={{ animation: "onboardFadeIn 0.5s ease", textAlign: "center", maxWidth: 440, marginTop: mobile ? 20 : 40 }}>
            <div style={{ width: 16, height: 16, borderRadius: "50%", margin: "0 auto 20px", background: selectedMood.planetColor, boxShadow: `0 0 20px ${selectedMood.planetColor}66` }} />
            <p style={{ color: selectedMood.planetColor, fontSize: mobile ? 16 : 20, fontStyle: "italic", lineHeight: 1.8, marginBottom: 28, fontFamily: "Georgia, serif" }}>{selectedMood.message}</p>
            <button onClick={() => onAuth(authUser, revealName, selectedMood.planet)} style={{ padding: mobile ? "16px 40px" : "18px 48px", background: `linear-gradient(135deg, ${selectedMood.planetColor}, ${selectedMood.planetColor}cc)`, border: "none", borderRadius: 14, cursor: "pointer", color: "#000", fontSize: mobile ? 15 : 16, fontWeight: 700, fontFamily: "Georgia, serif", letterSpacing: 1.5, boxShadow: `0 4px 24px ${selectedMood.planetColor}44` }}>{selectedMood.planetName ? `✦ Go to ${selectedMood.planetName}` : "✦ Enter Your Universe"}</button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: mobile ? 10 : 14, maxWidth: 500, width: "100%" }}>
            {moods.map((mood) => (
              <button key={mood.label} onClick={() => setSelectedMood(mood)} style={{ padding: mobile ? "18px 8px" : "22px 12px", background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, transition: "all 0.25s ease" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: mood.planetColor, boxShadow: `0 0 8px ${mood.planetColor}44` }} />
                <span style={{ color: "rgba(255,255,255,0.75)", fontSize: mobile ? 13 : 14, fontFamily: "Georgia, serif", letterSpacing: 1 }}>{mood.label}</span>
                <span style={{ color: "rgba(255,255,255,0.2)", fontSize: mobile ? 9 : 10, lineHeight: 1.4, textAlign: "center" }}>{mood.sub}</span>
              </button>
            ))}
          </div>
        )}
        <style>{`@keyframes onboardFadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      </div>
    );
  }

  // ─── Name Reveal ───
  if (revealName) {
    return (
      <div style={{ minHeight: "100vh", background: "radial-gradient(ellipse at center, #0a0a1a 0%, #000000 70%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Georgia', serif", position: "relative", animation: "authFadeIn 1s ease" }}>
        <div style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(245,166,35,0.3), transparent 70%)", filter: "blur(60px)", animation: "authPulse 2s ease-in-out infinite" }} />
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, letterSpacing: 4, textTransform: "uppercase", marginBottom: 16, zIndex: 2, animation: "authFadeIn 1.5s ease" }}>The universe has named you</p>
        <h1 style={{ color: "#f5a623", fontSize: mobile ? 32 : 42, fontWeight: 300, letterSpacing: 6, zIndex: 2, animation: "authFadeIn 2.5s ease", textShadow: "0 0 40px rgba(245,166,35,0.5)" }}>{revealName}</h1>
        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 14, marginTop: 24, maxWidth: 400, lineHeight: 1.7, textAlign: "center", zIndex: 2, animation: "authFadeIn 3s ease" }}>This is your identity in Shunya. No one will ever know who you are.</p>
      </div>
    );
  }

  // ─── Auth Form ───
  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(ellipse at 30% 20%, rgba(15,8,40,0.8) 0%, #000000 50%, rgba(5,2,15,1) 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Georgia', serif", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(1px 1px at 15% 25%, rgba(255,255,255,0.3), transparent), radial-gradient(1px 1px at 45% 65%, rgba(255,255,255,0.2), transparent), radial-gradient(1px 1px at 65% 15%, rgba(255,255,255,0.3), transparent), radial-gradient(1.5px 1.5px at 85% 45%, rgba(255,255,255,0.2), transparent), radial-gradient(1.5px 1.5px at 10% 80%, rgba(255,255,255,0.4), transparent), radial-gradient(1px 1px at 75% 85%, rgba(255,255,255,0.3), transparent)", backgroundSize: "250px 250px" }} />
      <div style={{ position: "absolute", width: "50%", height: "50%", top: "10%", left: "-10%", background: "radial-gradient(circle, rgba(80,20,130,0.15) 0%, transparent 70%)", filter: "blur(80px)" }} />
      <div style={{ position: "absolute", width: "40%", height: "40%", bottom: "5%", right: "-5%", background: "radial-gradient(circle, rgba(40,50,120,0.12) 0%, transparent 70%)", filter: "blur(60px)" }} />

      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 28, padding: mobile ? "40px 28px" : "52px 44px", width: 400, maxWidth: "92vw", backdropFilter: "blur(24px)", textAlign: "center", position: "relative", zIndex: 2, boxShadow: "0 20px 60px rgba(0,0,0,0.4)", animation: "authFadeIn 0.8s ease" }}>
        <h1 style={{ color: "#f5a623", fontSize: mobile ? 28 : 34, letterSpacing: 12, marginBottom: 4, fontWeight: 300 }}>SHUNYA</h1>
        <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 11, letterSpacing: 4, marginBottom: 6, textTransform: "uppercase" }}>For your 3 AM thoughts</p>
        <div style={{ width: 40, height: 1, margin: "0 auto 32px", background: "linear-gradient(90deg, transparent, rgba(245,166,35,0.3), transparent)" }} />

        <div style={{ display: "flex", marginBottom: 28, borderRadius: 14, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>
          <button onClick={() => { setMode("login"); setError(""); }} style={{ flex: 1, padding: 13, background: mode === "login" ? "rgba(245,166,35,0.12)" : "transparent", border: "none", color: mode === "login" ? "#f5a623" : "rgba(255,255,255,0.35)", fontSize: 13, cursor: "pointer", letterSpacing: 2, textTransform: "uppercase", fontFamily: "Georgia, serif", fontWeight: mode === "login" ? 600 : 400, transition: "all 0.3s" }}>Enter</button>
          <button onClick={() => { setMode("signup"); setError(""); }} style={{ flex: 1, padding: 13, background: mode === "signup" ? "rgba(245,166,35,0.12)" : "transparent", border: "none", color: mode === "signup" ? "#f5a623" : "rgba(255,255,255,0.35)", fontSize: 13, cursor: "pointer", letterSpacing: 2, textTransform: "uppercase", fontFamily: "Georgia, serif", fontWeight: mode === "signup" ? 600 : 400, transition: "all 0.3s" }}>Begin</button>
        </div>

        <input type="text" placeholder={mode === "signup" ? "Choose a username" : "Your username"} value={username} onChange={(e) => setUsername(e.target.value.replace(/\s/g, ""))} autoComplete="username" style={{ width: "100%", padding: "15px 18px", marginBottom: 14, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, color: "#fff", fontSize: 15, outline: "none", boxSizing: "border-box", fontFamily: "Georgia, serif", letterSpacing: 0.5 }} />

        {mode === "signup" && username.length > 0 && (
          <p style={{ color: validateUsername(username) ? "rgba(255,107,107,0.6)" : "rgba(78,205,196,0.5)", fontSize: 11, marginTop: -8, marginBottom: 12, textAlign: "left", paddingLeft: 4 }}>{validateUsername(username) || "✓ Looks good"}</p>
        )}

        <input type="password" placeholder={mode === "signup" ? "Create a password" : "Your password"} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === "signup" ? "new-password" : "current-password"} onKeyDown={(e) => { if (e.key === "Enter") { mode === "signup" ? handleSignup() : handleLogin(); } }} style={{ width: "100%", padding: "15px 18px", marginBottom: 6, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, color: "#fff", fontSize: 15, outline: "none", boxSizing: "border-box", fontFamily: "Georgia, serif", letterSpacing: 0.5 }} />

        {error && <p style={{ color: "#ff6b6b", fontSize: 12, marginTop: 10, marginBottom: 4, lineHeight: 1.5 }}>{error}</p>}

        <button onClick={mode === "signup" ? handleSignup : handleLogin} disabled={loading} style={{ width: "100%", padding: 16, background: "linear-gradient(135deg, #f5a623, #e8912d)", border: "none", borderRadius: 14, color: "#000", fontSize: 15, fontWeight: 700, cursor: "pointer", letterSpacing: 1.5, marginTop: 16, fontFamily: "Georgia, serif", boxShadow: "0 4px 20px rgba(245,166,35,0.2)", transition: "all 0.3s", opacity: loading ? 0.7 : 1 }}>{loading ? "..." : mode === "signup" ? "✦ Receive Your Cosmic Name" : "✦ Enter Shunya"}</button>

        {mode === "signup" && (
          <div style={{ marginTop: 20 }}>
            <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 11, lineHeight: 1.7 }}>Your username is private — only you use it to log in.</p>
            <p style={{ color: "rgba(255,255,255,0.15)", fontSize: 10, lineHeight: 1.6, marginTop: 8 }}>Use something memorable: your initials, a word that means something to you, or just keep it simple. No email needed. No data collected. Just you and your universe.</p>
            <p style={{ color: "rgba(255,107,107,0.35)", fontSize: 10, marginTop: 10, lineHeight: 1.5 }}>Remember your password — there is no recovery option. Write it down somewhere safe.</p>
          </div>
        )}
        {mode === "login" && (
          <p style={{ color: "rgba(255,255,255,0.15)", fontSize: 11, marginTop: 16, lineHeight: 1.6 }}>Enter with the username and password you created.</p>
        )}
      </div>

      <style>{`
        @keyframes authFadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes authPulse { 0%, 100% { opacity: 0.5; transform: scale(1); } 50% { opacity: 1; transform: scale(1.1); } }
        input::placeholder { color: rgba(255,255,255,0.2); }
      `}</style>
    </div>
  );
}
