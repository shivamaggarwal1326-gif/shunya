import { useState } from "react";
import { supabase } from "./supabaseClient";
import { generateAnonymousName, generateAvatarSeed } from "./nameGenerator";

export default function AuthPage({ onAuth, onSignupStart }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
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

  const handleSignup = async () => {
    setLoading(true);
    setError("");
    if (onSignupStart) onSignupStart(); // Tell App.jsx not to auto-login
    const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
    if (authError) { setError(authError.message); setLoading(false); return; }

    const anonymousName = generateAnonymousName();
    const avatarSeed = generateAvatarSeed();
    const { error: profileError } = await supabase.from("profiles").insert({
      id: authData.user.id, anonymous_name: anonymousName, avatar_seed: avatarSeed,
    });
    if (profileError) { setError(profileError.message); setLoading(false); return; }

    const planets = ["aatma", "pranaa", "kaal", "dharma", "moksha", "karma", "prema", "maya"];
    await supabase.from("moon_progress").insert(planets.map((p) => ({ user_id: authData.user.id, planet_id: p, moon_count: 0 })));

    setAuthUser(authData.user);
    setRevealName(anonymousName);
    // After name reveal animation, show onboarding
    setTimeout(() => setShowOnboarding(true), 3500);
  };

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
    if (loginError) { setError(loginError.message); setLoading(false); return; }
    const { data: profile } = await supabase.from("profiles").select("anonymous_name").eq("id", data.user.id).single();
    onAuth(data.user, profile?.anonymous_name || "Cosmic Wanderer");
  };

  const mobile = typeof window !== "undefined" && window.innerWidth < 768;

  // ─── Onboarding Screens ───
  const onboardingScreens = [
    {
      title: "What is Shunya?",
      content: "Shunya is not zero.\n\nIt came as a 3 AM thought — a feeling that was nothing, yet held everything within it. Zero, yet infinite. Empty, yet full of possibility.\n\nAt Shunya, everything is still possible.",
      icon: "✦",
    },
    {
      title: "Your Universe",
      content: "You are looking at your inner solar system — 8 planets, each representing a different part of who you are.\n\nAatma is your soul. Pranaa is your life force. Kaal is your relationship with time. Dharma is your purpose. Moksha is your freedom. Karma is your actions. Prema is your love. Maya is your illusions.\n\nTap any planet to enter its world.",
      icon: "🪐",
    },
    {
      title: "Moons & Your Core",
      content: "Every time you journal, a moon is born — orbiting the planet you wrote on.\n\nAfter 10 moons, they are pulled toward your Sun — Shunya, your core. The Sun grows brighter and larger.\n\nThe more you reflect, the stronger your core becomes. This is healing made visible.",
      icon: "🌙",
    },
    {
      title: "Catch the Stars",
      content: "Shooting stars fly through your universe. Move your cursor close — they slow down, pulled by your gravity.\n\nGet close enough and you catch them. Stars are your rewards.\n\nOn Moksha, you can send sealed messages to your future self. On Dharma, you can commit to purpose with a to-do list.\n\nYour universe is alive. Explore it.",
      icon: "🌠",
    },
  ];

  // ─── Cinematic Onboarding ───
  if (showOnboarding && revealName) {
    const screen = onboardingScreens[onboardingStep];
    const isLast = onboardingStep === onboardingScreens.length - 1;

    return (
      <div style={{
        minHeight: "100vh",
        background: "radial-gradient(ellipse at center, #0a0a1a 0%, #000000 70%)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        fontFamily: "'Georgia', serif", position: "relative", padding: mobile ? "40px 28px" : "40px",
      }}>
        {/* Step indicator */}
        <div style={{ position: "absolute", top: mobile ? 24 : 36, display: "flex", gap: 8 }}>
          {onboardingScreens.map((_, i) => (
            <div key={i} style={{
              width: i === onboardingStep ? 24 : 8, height: 8, borderRadius: 4,
              background: i === onboardingStep ? "rgba(245,166,35,0.8)" : i < onboardingStep ? "rgba(245,166,35,0.3)" : "rgba(255,255,255,0.1)",
              transition: "all 0.4s ease",
            }} />
          ))}
        </div>

        {/* Skip button */}
        <button onClick={() => onAuth(authUser, revealName)} style={{
          position: "absolute", top: mobile ? 20 : 32, right: mobile ? 20 : 32,
          background: "none", border: "none", color: "rgba(255,255,255,0.25)",
          fontSize: 12, cursor: "pointer", letterSpacing: 2, fontFamily: "Georgia, serif",
        }}>SKIP</button>

        {/* Content */}
        <div key={onboardingStep} style={{
          maxWidth: 520, textAlign: "center",
          animation: "onboardFadeIn 0.6s ease",
        }}>
          <span style={{ fontSize: mobile ? 36 : 48, display: "block", marginBottom: mobile ? 20 : 28 }}>{screen.icon}</span>

          <h1 style={{
            color: "#f5a623", fontSize: mobile ? 24 : 34,
            letterSpacing: mobile ? 3 : 6, fontWeight: 300, marginBottom: mobile ? 16 : 24,
          }}>{screen.title}</h1>

          <div style={{ color: "rgba(255,255,255,0.55)", fontSize: mobile ? 14 : 16, lineHeight: 2, whiteSpace: "pre-line" }}>
            {screen.content}
          </div>
        </div>

        {/* Navigation */}
        <div style={{
          position: "absolute", bottom: mobile ? 36 : 48,
          display: "flex", gap: 16, alignItems: "center",
        }}>
          {onboardingStep > 0 && (
            <button onClick={() => setOnboardingStep((s) => s - 1)} style={{
              padding: "12px 28px", background: "transparent",
              border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12,
              color: "rgba(255,255,255,0.4)", fontSize: 14, cursor: "pointer",
              fontFamily: "Georgia, serif", letterSpacing: 1,
            }}>Back</button>
          )}

          <button onClick={() => {
            if (isLast) { setShowMoodSelector(true); setShowOnboarding(false); }
            else { setOnboardingStep((s) => s + 1); }
          }} style={{
            padding: "14px 36px",
            background: isLast ? "linear-gradient(135deg, #f5a623, #e8912d)" : "rgba(255,255,255,0.06)",
            border: isLast ? "none" : "1px solid rgba(255,255,255,0.12)",
            borderRadius: 12,
            color: isLast ? "#000" : "rgba(255,255,255,0.7)",
            fontSize: mobile ? 14 : 15, fontWeight: isLast ? 700 : 400, cursor: "pointer",
            fontFamily: "Georgia, serif", letterSpacing: isLast ? 1.5 : 1,
            boxShadow: isLast ? "0 4px 20px rgba(245,166,35,0.3)" : "none",
          }}>{isLast ? "✦ Enter Your Universe" : "Next"}</button>
        </div>

        <style>{`
          @keyframes onboardFadeIn {
            from { opacity: 0; transform: translateY(15px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    );
  }

  // ─── Mood Selector — "How are you feeling?" ───
  if (showMoodSelector && revealName) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "radial-gradient(ellipse at center, #0a0a1a 0%, #000000 70%)",
        display: "flex", flexDirection: "column", alignItems: "center",
        fontFamily: "'Georgia', serif", position: "relative",
        padding: mobile ? "40px 20px" : "50px 40px",
        overflowY: "auto",
      }}>
        {/* Skip */}
        <button onClick={() => onAuth(authUser, revealName)} style={{
          position: "absolute", top: mobile ? 20 : 32, right: mobile ? 20 : 32,
          background: "none", border: "none", color: "rgba(255,255,255,0.25)",
          fontSize: 12, cursor: "pointer", letterSpacing: 2, fontFamily: "Georgia, serif",
        }}>SKIP</button>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: mobile ? 24 : 36, marginTop: mobile ? 20 : 0 }}>
          <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 11, letterSpacing: 3, textTransform: "uppercase", marginBottom: 16 }}>
            Now that you know what Shunya is
          </p>
          <h1 style={{ color: "rgba(255,255,255,0.85)", fontSize: mobile ? 22 : 32, fontWeight: 300, letterSpacing: mobile ? 2 : 4, marginBottom: 10 }}>
            How are you feeling right now?
          </h1>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: mobile ? 12 : 14, lineHeight: 1.7 }}>
            Let us take the first step together.
          </p>
        </div>

        {/* Selected mood result */}
        {selectedMood ? (
          <div style={{
            animation: "onboardFadeIn 0.5s ease",
            textAlign: "center", maxWidth: 440, marginTop: mobile ? 20 : 40,
          }}>
            {/* Planet color dot */}
            <div style={{
              width: 16, height: 16, borderRadius: "50%", margin: "0 auto 20px",
              background: selectedMood.planetColor, boxShadow: `0 0 20px ${selectedMood.planetColor}66`,
            }} />
            <p style={{
              color: selectedMood.planetColor, fontSize: mobile ? 16 : 20,
              fontStyle: "italic", lineHeight: 1.8, marginBottom: 28,
              fontFamily: "Georgia, serif",
            }}>{selectedMood.message}</p>

            <button onClick={() => {
              onAuth(authUser, revealName, selectedMood.planet);
            }} style={{
              padding: mobile ? "16px 40px" : "18px 48px",
              background: `linear-gradient(135deg, ${selectedMood.planetColor}, ${selectedMood.planetColor}cc)`,
              border: "none", borderRadius: 14, cursor: "pointer",
              color: "#000", fontSize: mobile ? 15 : 16, fontWeight: 700,
              fontFamily: "Georgia, serif", letterSpacing: 1.5,
              boxShadow: `0 4px 24px ${selectedMood.planetColor}44`,
            }}>{selectedMood.planetName ? `✦ Go to ${selectedMood.planetName}` : "✦ Enter Your Universe"}</button>
          </div>
        ) : (
          /* Mood grid */
          <div style={{
            display: "grid",
            gridTemplateColumns: mobile ? "repeat(3, 1fr)" : "repeat(3, 1fr)",
            gap: mobile ? 10 : 14,
            maxWidth: 500, width: "100%",
          }}>
            {moods.map((mood) => (
              <button key={mood.label} onClick={() => setSelectedMood(mood)} style={{
                padding: mobile ? "18px 8px" : "22px 12px",
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 16, cursor: "pointer",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                transition: "all 0.25s ease",
              }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: mood.planetColor, boxShadow: `0 0 8px ${mood.planetColor}44` }} />
                <span style={{ color: "rgba(255,255,255,0.75)", fontSize: mobile ? 13 : 14, fontFamily: "Georgia, serif", letterSpacing: 1 }}>{mood.label}</span>
                <span style={{ color: "rgba(255,255,255,0.2)", fontSize: mobile ? 9 : 10, lineHeight: 1.4, textAlign: "center" }}>{mood.sub}</span>
              </button>
            ))}
          </div>
        )}

        <style>{`
          @keyframes onboardFadeIn {
            from { opacity: 0; transform: translateY(15px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    );
  }

  // ─── Name Reveal Animation ───
  if (revealName) {
    return (
      <div style={styles.revealContainer}>
        <div style={styles.revealGlow} />
        <p style={styles.revealLabel}>The universe has named you</p>
        <h1 style={styles.revealName}>{revealName}</h1>
        <p style={styles.revealSub}>This is your identity in Shunya. No one will ever know who you are.</p>
      </div>
    );
  }

  // ─── Auth Form ───
  return (
    <div style={styles.container}>
      <div style={styles.starsLayer} />

      <div style={styles.card}>
        <h1 style={styles.logo}>SHUNYA</h1>
        <p style={styles.tagline}>Journey Within</p>

        <div style={styles.tabs}>
          <button onClick={() => { setMode("login"); setError(""); }} style={mode === "login" ? styles.activeTab : styles.tab}>Enter</button>
          <button onClick={() => { setMode("signup"); setError(""); }} style={mode === "signup" ? styles.activeTab : styles.tab}>Begin</button>
        </div>

        <input type="email" placeholder={mode === "signup" ? "Recovery email (private, never shared)" : "Your email"} value={email} onChange={(e) => setEmail(e.target.value)} style={styles.input} />
        <input type="password" placeholder={mode === "signup" ? "Create a password" : "Your password"} value={password} onChange={(e) => setPassword(e.target.value)} style={styles.input} />

        {error && <p style={styles.error}>{error}</p>}

        <button onClick={mode === "signup" ? handleSignup : handleLogin} disabled={loading} style={styles.button}>
          {loading ? "..." : mode === "signup" ? "✦ Receive Your Cosmic Name" : "✦ Enter Shunya"}
        </button>

        {mode === "signup" && (
          <p style={styles.note}>Your email is only used for password recovery and receiving sealed Moksha messages. It is never visible to anyone — not even us. You will be known only by your cosmic name.</p>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "radial-gradient(ellipse at center, #0a0a1a 0%, #000000 70%)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "'Georgia', serif", position: "relative", overflow: "hidden",
  },
  starsLayer: {
    position: "absolute", inset: 0,
    background: "radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,0.3), transparent), radial-gradient(1px 1px at 40% 70%, rgba(255,255,255,0.2), transparent), radial-gradient(1px 1px at 60% 20%, rgba(255,255,255,0.3), transparent), radial-gradient(1px 1px at 80% 50%, rgba(255,255,255,0.2), transparent), radial-gradient(1.5px 1.5px at 10% 80%, rgba(255,255,255,0.4), transparent), radial-gradient(1.5px 1.5px at 70% 90%, rgba(255,255,255,0.3), transparent), radial-gradient(1px 1px at 90% 10%, rgba(255,255,255,0.2), transparent)",
    backgroundSize: "250px 250px",
  },
  card: {
    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "24px", padding: "48px 40px", width: "380px", maxWidth: "90vw",
    backdropFilter: "blur(20px)", textAlign: "center", position: "relative", zIndex: 2,
  },
  logo: { color: "#f5a623", fontSize: "32px", letterSpacing: "12px", marginBottom: "4px", fontWeight: 300 },
  tagline: { color: "rgba(255,255,255,0.3)", fontSize: "13px", letterSpacing: "4px", marginBottom: "36px", textTransform: "uppercase" },
  tabs: { display: "flex", gap: "0", marginBottom: "28px", borderRadius: "12px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)" },
  tab: { flex: 1, padding: "12px", background: "transparent", border: "none", color: "rgba(255,255,255,0.4)", fontSize: "14px", cursor: "pointer", letterSpacing: "2px", textTransform: "uppercase", transition: "all 0.3s" },
  activeTab: { flex: 1, padding: "12px", background: "rgba(245,166,35,0.15)", border: "none", color: "#f5a623", fontSize: "14px", cursor: "pointer", letterSpacing: "2px", textTransform: "uppercase", fontWeight: 600 },
  input: { width: "100%", padding: "14px 18px", marginBottom: "14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff", fontSize: "15px", outline: "none", boxSizing: "border-box", fontFamily: "'Georgia', serif" },
  button: { width: "100%", padding: "16px", background: "linear-gradient(135deg, #f5a623, #e8912d)", border: "none", borderRadius: "12px", color: "#000", fontSize: "15px", fontWeight: 700, cursor: "pointer", letterSpacing: "1px", marginTop: "8px", fontFamily: "'Georgia', serif" },
  error: { color: "#ff6b6b", fontSize: "13px", marginBottom: "8px" },
  note: { color: "rgba(255,255,255,0.3)", fontSize: "12px", marginTop: "20px", lineHeight: 1.6 },
  revealContainer: { minHeight: "100vh", background: "radial-gradient(ellipse at center, #0a0a1a 0%, #000000 70%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Georgia', serif", position: "relative", animation: "fadeIn 1s ease" },
  revealGlow: { position: "absolute", width: "300px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle, rgba(245,166,35,0.3), transparent 70%)", filter: "blur(60px)", animation: "pulse 2s ease-in-out infinite" },
  revealLabel: { color: "rgba(255,255,255,0.4)", fontSize: "14px", letterSpacing: "4px", textTransform: "uppercase", marginBottom: "16px", zIndex: 2, animation: "fadeIn 1.5s ease" },
  revealName: { color: "#f5a623", fontSize: "42px", fontWeight: 300, letterSpacing: "6px", zIndex: 2, animation: "fadeIn 2.5s ease", textShadow: "0 0 40px rgba(245,166,35,0.5)" },
  revealSub: { color: "rgba(255,255,255,0.3)", fontSize: "14px", marginTop: "24px", maxWidth: "400px", lineHeight: 1.7, textAlign: "center", zIndex: 2, animation: "fadeIn 3s ease" },
};
