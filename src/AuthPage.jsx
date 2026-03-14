import { useState } from "react";
import { supabase } from "./supabaseClient";
import { generateAnonymousName, generateAvatarSeed } from "./nameGenerator";

export default function AuthPage({ onAuth }) {
  const [mode, setMode] = useState("login"); // login or signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [revealName, setRevealName] = useState(null);

  const handleSignup = async () => {
    setLoading(true);
    setError("");

    // 1. Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // 2. Generate anonymous name
    const anonymousName = generateAnonymousName();
    const avatarSeed = generateAvatarSeed();

    // 3. Create profile
    const { error: profileError } = await supabase.from("profiles").insert({
      id: authData.user.id,
      anonymous_name: anonymousName,
      avatar_seed: avatarSeed,
    });

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    // 4. Initialize moon progress for all planets
    const planets = ["aatma", "pranaa", "kaal", "dharma", "moksha", "karma", "akasha", "maya"];
    const moonRows = planets.map((p) => ({
      user_id: authData.user.id,
      planet_id: p,
      moon_count: 0,
    }));

    await supabase.from("moon_progress").insert(moonRows);

    // 5. Reveal the cosmic name with animation
    setRevealName(anonymousName);
    setTimeout(() => {
      onAuth(authData.user, anonymousName);
    }, 3500);
  };

  const handleLogin = async () => {
    setLoading(true);
    setError("");

    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      setError(loginError.message);
      setLoading(false);
      return;
    }

    // Fetch profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("anonymous_name")
      .eq("id", data.user.id)
      .single();

    onAuth(data.user, profile?.anonymous_name || "Cosmic Wanderer");
  };

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
      {/* Background stars */}
      <div style={styles.starsLayer} />

      <div style={styles.card}>
        <h1 style={styles.logo}>SHUNYA</h1>
        <p style={styles.tagline}>Journey Within</p>

        <div style={styles.tabs}>
          <button
            onClick={() => { setMode("login"); setError(""); }}
            style={mode === "login" ? styles.activeTab : styles.tab}
          >
            Enter
          </button>
          <button
            onClick={() => { setMode("signup"); setError(""); }}
            style={mode === "signup" ? styles.activeTab : styles.tab}
          >
            Begin
          </button>
        </div>

        <input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />
        <input
          type="password"
          placeholder={mode === "signup" ? "Create a password" : "Your password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />

        {error && <p style={styles.error}>{error}</p>}

        <button
          onClick={mode === "signup" ? handleSignup : handleLogin}
          disabled={loading}
          style={styles.button}
        >
          {loading ? "..." : mode === "signup" ? "✦ Receive Your Cosmic Name" : "✦ Enter Shunya"}
        </button>

        {mode === "signup" && (
          <p style={styles.note}>
            Your real identity stays hidden forever. You'll receive an anonymous cosmic name.
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Styles ───
const styles = {
  container: {
    minHeight: "100vh",
    background: "radial-gradient(ellipse at center, #0a0a1a 0%, #000000 70%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Georgia', serif",
    position: "relative",
    overflow: "hidden",
  },
  starsLayer: {
    position: "absolute",
    inset: 0,
    background: "radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,0.3), transparent), radial-gradient(1px 1px at 40% 70%, rgba(255,255,255,0.2), transparent), radial-gradient(1px 1px at 60% 20%, rgba(255,255,255,0.3), transparent), radial-gradient(1px 1px at 80% 50%, rgba(255,255,255,0.2), transparent), radial-gradient(1.5px 1.5px at 10% 80%, rgba(255,255,255,0.4), transparent), radial-gradient(1.5px 1.5px at 70% 90%, rgba(255,255,255,0.3), transparent), radial-gradient(1px 1px at 90% 10%, rgba(255,255,255,0.2), transparent)",
    backgroundSize: "250px 250px",
    animation: "twinkle 4s ease-in-out infinite alternate",
  },
  card: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "24px",
    padding: "48px 40px",
    width: "380px",
    maxWidth: "90vw",
    backdropFilter: "blur(20px)",
    textAlign: "center",
    position: "relative",
    zIndex: 2,
  },
  logo: {
    color: "#f5a623",
    fontSize: "32px",
    letterSpacing: "12px",
    marginBottom: "4px",
    fontWeight: 300,
  },
  tagline: {
    color: "rgba(255,255,255,0.3)",
    fontSize: "13px",
    letterSpacing: "4px",
    marginBottom: "36px",
    textTransform: "uppercase",
  },
  tabs: {
    display: "flex",
    gap: "0",
    marginBottom: "28px",
    borderRadius: "12px",
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  tab: {
    flex: 1,
    padding: "12px",
    background: "transparent",
    border: "none",
    color: "rgba(255,255,255,0.4)",
    fontSize: "14px",
    cursor: "pointer",
    letterSpacing: "2px",
    textTransform: "uppercase",
    transition: "all 0.3s",
  },
  activeTab: {
    flex: 1,
    padding: "12px",
    background: "rgba(245,166,35,0.15)",
    border: "none",
    color: "#f5a623",
    fontSize: "14px",
    cursor: "pointer",
    letterSpacing: "2px",
    textTransform: "uppercase",
    fontWeight: 600,
  },
  input: {
    width: "100%",
    padding: "14px 18px",
    marginBottom: "14px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "12px",
    color: "#fff",
    fontSize: "15px",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "'Georgia', serif",
  },
  button: {
    width: "100%",
    padding: "16px",
    background: "linear-gradient(135deg, #f5a623, #e8912d)",
    border: "none",
    borderRadius: "12px",
    color: "#000",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
    letterSpacing: "1px",
    marginTop: "8px",
    fontFamily: "'Georgia', serif",
  },
  error: {
    color: "#ff6b6b",
    fontSize: "13px",
    marginBottom: "8px",
  },
  note: {
    color: "rgba(255,255,255,0.3)",
    fontSize: "12px",
    marginTop: "20px",
    lineHeight: 1.6,
  },
  // Reveal screen
  revealContainer: {
    minHeight: "100vh",
    background: "radial-gradient(ellipse at center, #0a0a1a 0%, #000000 70%)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Georgia', serif",
    position: "relative",
    animation: "fadeIn 1s ease",
  },
  revealGlow: {
    position: "absolute",
    width: "300px",
    height: "300px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(245,166,35,0.3), transparent 70%)",
    filter: "blur(60px)",
    animation: "pulse 2s ease-in-out infinite",
  },
  revealLabel: {
    color: "rgba(255,255,255,0.4)",
    fontSize: "14px",
    letterSpacing: "4px",
    textTransform: "uppercase",
    marginBottom: "16px",
    zIndex: 2,
    animation: "fadeIn 1.5s ease",
  },
  revealName: {
    color: "#f5a623",
    fontSize: "42px",
    fontWeight: 300,
    letterSpacing: "6px",
    zIndex: 2,
    animation: "fadeIn 2.5s ease",
    textShadow: "0 0 40px rgba(245,166,35,0.5)",
  },
  revealSub: {
    color: "rgba(255,255,255,0.3)",
    fontSize: "14px",
    marginTop: "24px",
    maxWidth: "400px",
    lineHeight: 1.7,
    textAlign: "center",
    zIndex: 2,
    animation: "fadeIn 3s ease",
  },
};
