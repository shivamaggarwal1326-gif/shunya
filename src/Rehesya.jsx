import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

// ─────────────────────────────────────────────────────────────────────
// REHESYA STATE MACHINE
//
//  "idle"      → No question released, no pending pass.
//               Rehesya orbits. Button: "Release a question"
//
//  "traveling" → X released a question. It's with Y or Z.
//               Rehesya FADES + DISAPPEARS. Button DISAPPEARS.
//               Nothing Rehesya-visible for X.
//
//  "answer"    → Someone else's question arrived in X's orbit.
//               Rehesya APPEARS (wandering). Button: "Answer the Universe"
//               (X answers Y's question. Independent of X's own chain.)
//
//  "answered"  → Z answered X's question. Answers arrived.
//               Rehesya REAPPEARS (glowing gold). Button: "Universe has answered"
//               X clicks → sees Z's answer → beautiful reveal.
//
// Note: "answer" and "answered" can overlap — X may have both.
// Priority: "answered" > "answer" > "traveling" > "idle"
// ─────────────────────────────────────────────────────────────────────

const REHESYA_QUESTIONS = [
  "What are you carrying right now that nobody knows about?",
  "What would you do tomorrow if you were not afraid?",
  "What part of yourself have you been hiding from the world?",
  "What do you know about life that took you years to learn?",
  "What is something you have never said out loud to anyone?",
  "What does your heart want that your mind keeps arguing with?",
  "What would you forgive yourself for if you believed you deserved it?",
  "What are you waiting for before you let yourself be happy?",
  "What truth about yourself are you still afraid to admit?",
  "When did you last feel completely, utterly yourself?",
  "What is the most honest thing you could say about your life right now?",
  "What are you pretending is fine that has never been fine?",
  "What would you do if you knew nobody would ever judge you for it?",
  "What does love mean to you right now — really?",
  "What part of you is asking to be seen?",
  "What would change if you stopped waiting for permission?",
  "What have you been saying you'll do 'someday' that needs to be today?",
  "What are you most grateful for that you've never said out loud?",
];

// ─────────────────────────────────────────────────────────────────────
// MASTER HOOK — single source of truth for Rehesya state
// ─────────────────────────────────────────────────────────────────────
export function useRehesyaState(user) {
  const [state, setState] = useState("idle"); // idle | traveling | answer | answered
  const [pendingPass, setPendingPass] = useState(null);  // stranger's question for X to answer
  const [myAnswers, setMyAnswers] = useState([]);         // answers to X's own question
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    refresh();

    // Listen for new passes arriving for this user
    const passChannel = supabase
      .channel("rehesya-pass-" + user.id)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "rehesya_passes",
        filter: `holder_id=eq.${user.id}`,
      }, () => refresh())
      .subscribe();

    // Listen for answers to X's own question
    const answerChannel = supabase
      .channel("rehesya-answer-" + user.id)
      .on("postgres_changes", {
        event: "UPDATE", schema: "public", table: "rehesya_passes",
      }, () => refresh())
      .subscribe();

    return () => {
      supabase.removeChannel(passChannel);
      supabase.removeChannel(answerChannel);
    };
  }, [user?.id]);

  const refresh = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Check for a pending pass (stranger's question to answer)
      const { data: passData } = await supabase
        .from("rehesya_passes")
        .select("id, chain_id, pass_order, rehesya_chains(question, asker_id)")
        .eq("holder_id", user.id)
        .is("answered_at", null)
        .is("skipped", null)
        .order("created_at", { ascending: true })
        .limit(1)
        .single();

      const pass = passData ? {
        id: passData.id,
        chain_id: passData.chain_id,
        question: passData.rehesya_chains?.question,
        pass_order: passData.pass_order,
      } : null;
      setPendingPass(pass);

      // 2. Check X's own chains for active/answered status
      const { data: myChains } = await supabase
        .from("rehesya_chains")
        .select("id, question")
        .eq("asker_id", user.id);

      if (!myChains || myChains.length === 0) {
        // No question ever released
        setState(pass ? "answer" : "idle");
        setLoading(false);
        return;
      }

      const chainIds = myChains.map(c => c.id);

      // Get all passes for X's chains
      const { data: allPasses } = await supabase
        .from("rehesya_passes")
        .select("id, answer, answered_at, skipped, chain_id, holder_id")
        .in("chain_id", chainIds);

      const answers = (allPasses || [])
        .filter(p => p.answer)
        .map(p => ({
          ...p,
          question: myChains.find(c => c.id === p.chain_id)?.question,
        }));

      const stillTraveling = (allPasses || [])
        .some(p => !p.answered_at && !p.skipped);

      setMyAnswers(answers);

      // Determine state — priority order
      if (answers.length > 0) {
        setState("answered"); // Universe has answered — highest priority
      } else if (pass) {
        setState("answer");   // A stranger's question is here
      } else if (stillTraveling) {
        setState("traveling"); // My question is still out there
      } else {
        setState("idle");
      }

    } catch (err) {
      console.error("Rehesya state error:", err);
      setState("idle");
    }
    setLoading(false);
  };

  return { state, pendingPass, myAnswers, loading, refresh };
}

// Legacy hooks for backward compatibility
export function useRehesya(user) {
  const { pendingPass, loading, refresh } = useRehesyaState(user);
  return { pendingPass, loading, refresh };
}
export function useRehesyaActive(user) {
  const { state, myAnswers } = useRehesyaState(user);
  return {
    hasActiveQuestion: state === "traveling",
    activeAnswerCount: myAnswers.length,
    newAnswers: state === "answered",
    refresh: () => {},
  };
}

// ─────────────────────────────────────────────────────────────────────
// PASS TO NEXT USER — shared utility
// ─────────────────────────────────────────────────────────────────────
async function passToNextUser(chainId, currentUserId) {
  const { data: chain } = await supabase
    .from("rehesya_chains").select("asker_id").eq("id", chainId).single();

  const { data: recentPasses } = await supabase
    .from("rehesya_passes").select("holder_id")
    .eq("chain_id", chainId).order("created_at", { ascending: false }).limit(6);

  const excludeIds = [
    currentUserId, chain?.asker_id,
    ...(recentPasses?.map(p => p.holder_id) || [])
  ].filter(Boolean);

  // Build exclusion string safely
  const exclusionStr = excludeIds.map(id => `"${id}"`).join(",");
  const { data: profiles } = await supabase
    .from("profiles").select("id")
    .not("id", "in", `(${exclusionStr})`).limit(30);

  if (!profiles || profiles.length === 0) return;
  const next = profiles[Math.floor(Math.random() * profiles.length)];

  const { data: lastPass } = await supabase
    .from("rehesya_passes").select("pass_order")
    .eq("chain_id", chainId).order("pass_order", { ascending: false }).limit(1).single();

  await supabase.from("rehesya_passes").insert({
    chain_id: chainId,
    holder_id: next.id,
    pass_order: (lastPass?.pass_order || 0) + 1,
    created_at: new Date().toISOString(),
  });
}

// ─────────────────────────────────────────────────────────────────────
// REHESYA RELEASE — user releases their own question
// On success: planet + button fade away (handled in App.jsx canvas)
// ─────────────────────────────────────────────────────────────────────
export function RehesyaRelease({ user, onClose, onReleased, mobile }) {
  const [question, setQuestion] = useState("");
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleRelease = async () => {
    const q = selectedPreset || question.trim();
    if (!q) return;
    setSending(true);
    try {
      const { data: chain, error } = await supabase
        .from("rehesya_chains")
        .insert({ asker_id: user.id, question: q, created_at: new Date().toISOString() })
        .select().single();
      if (error) throw error;

      const { data: profiles } = await supabase
        .from("profiles").select("id").neq("id", user.id).limit(30);

      if (profiles && profiles.length > 0) {
        const recipient = profiles[Math.floor(Math.random() * profiles.length)];
        await supabase.from("rehesya_passes").insert({
          chain_id: chain.id, holder_id: recipient.id,
          pass_order: 0, created_at: new Date().toISOString(),
        });
      }
      setSent(true);
      setTimeout(() => { onReleased?.(); onClose?.(); }, 2800);
    } catch (err) {
      console.error("Release failed:", err);
      setSending(false);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(0,0,0,0.82)", backdropFilter: "blur(16px)",
      animation: "overlayIn 0.6s cubic-bezier(0.16,1,0.3,1)",
      padding: mobile ? "16px" : 0,
    }}>
      <div style={{
        width: mobile ? "100%" : 520,
        maxHeight: mobile ? "92vh" : "86vh",
        overflowY: "auto",
        background: "rgba(4,2,14,0.97)",
        border: "1px solid rgba(56,189,248,0.12)",
        borderRadius: 24,
        padding: mobile ? "36px 22px" : "48px 44px",
        position: "relative",
        boxShadow: "0 0 80px rgba(56,189,248,0.05), 0 32px 80px rgba(0,0,0,0.7)",
      }}>
        <button onClick={onClose} style={{
          position: "absolute", top: 18, right: 18,
          background: "none", border: "none",
          color: "rgba(255,255,255,0.2)", fontSize: 18, cursor: "pointer",
        }}>✕</button>

        {!sent ? (
          <>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{
                width: mobile ? 48 : 60, height: mobile ? 48 : 60,
                borderRadius: "50%", margin: "0 auto 16px",
                background: "radial-gradient(circle at 38% 38%, rgba(255,255,255,0.1), #38bdf8cc 45%, #0c4a6e 100%)",
                boxShadow: "0 0 30px rgba(56,189,248,0.2)",
                animation: "planetPulse 5s ease-in-out infinite",
              }} />
              <h2 style={{ color: "#38bdf8", fontSize: mobile ? 18 : 22, fontWeight: 300, letterSpacing: 5, fontFamily: "Georgia,serif", marginBottom: 10 }}>
                Release a Question
              </h2>
              <p style={{ color: "rgba(255,255,255,0.25)", fontSize: mobile ? 11 : 12, letterSpacing: 1.5, fontFamily: "Georgia,serif", lineHeight: 1.9 }}>
                Your question travels anonymously.<br/>
                Rehesya will leave your orbit when you release it.<br/>
                It returns when a stranger has answered.
              </p>
            </div>

            <p style={{ color: "rgba(255,255,255,0.18)", fontSize: 10, letterSpacing: 3, marginBottom: 10, fontFamily: "Georgia,serif" }}>
              CHOOSE OR WRITE YOUR OWN
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 18, maxHeight: 220, overflowY: "auto" }}>
              {REHESYA_QUESTIONS.map((q, i) => (
                <button key={i} onClick={() => { setSelectedPreset(q); setQuestion(""); }} style={{
                  padding: "11px 16px", textAlign: "left",
                  background: selectedPreset === q ? "rgba(56,189,248,0.1)" : "rgba(255,255,255,0.02)",
                  border: `1px solid ${selectedPreset === q ? "rgba(56,189,248,0.3)" : "rgba(255,255,255,0.06)"}`,
                  borderRadius: 12, cursor: "pointer",
                  color: selectedPreset === q ? "#38bdf8" : "rgba(255,255,255,0.4)",
                  fontSize: mobile ? 12 : 13, fontFamily: "Georgia,serif",
                  fontStyle: "italic", lineHeight: 1.6, transition: "all 0.18s",
                }}>{selectedPreset === q ? "✓ " : ""}{q}</button>
              ))}
            </div>

            <div style={{ height: 1, background: "rgba(255,255,255,0.05)", marginBottom: 16 }} />
            <textarea
              value={question}
              onChange={e => { setQuestion(e.target.value); setSelectedPreset(null); }}
              placeholder="Or ask something from your own heart..."
              style={{
                width: "100%", height: mobile ? 80 : 100,
                padding: "14px 16px",
                background: "rgba(56,189,248,0.02)",
                border: `1px solid ${question ? "rgba(56,189,248,0.2)" : "rgba(255,255,255,0.06)"}`,
                borderRadius: 12,
                color: "rgba(220,240,255,0.8)",
                fontSize: mobile ? 14 : 15, lineHeight: 1.8,
                resize: "none", outline: "none",
                fontFamily: "Georgia,serif", letterSpacing: 0.3,
                boxSizing: "border-box", marginBottom: 18,
              }}
            />

            <button onClick={handleRelease} disabled={sending || (!selectedPreset && !question.trim())} style={{
              width: "100%", padding: mobile ? "15px" : "17px",
              background: (selectedPreset || question.trim())
                ? "linear-gradient(135deg, rgba(56,189,248,0.2), rgba(56,189,248,0.1))"
                : "rgba(255,255,255,0.03)",
              border: `1px solid ${(selectedPreset || question.trim()) ? "rgba(56,189,248,0.3)" : "rgba(255,255,255,0.06)"}`,
              borderRadius: 14, cursor: "pointer",
              color: (selectedPreset || question.trim()) ? "#38bdf8" : "rgba(255,255,255,0.15)",
              fontSize: mobile ? 13 : 15, fontFamily: "Georgia,serif",
              letterSpacing: 2.5, transition: "all 0.3s",
              opacity: sending ? 0.7 : 1,
            }}>
              {sending ? "Releasing..." : "✦ Release into the Universe"}
            </button>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "28px 0" }}>
            <div style={{
              width: 56, height: 56, borderRadius: "50%", margin: "0 auto 22px",
              background: "radial-gradient(circle at 38% 38%, rgba(255,255,255,0.1), #38bdf8cc 45%, #0c4a6e 100%)",
              boxShadow: "0 0 40px rgba(56,189,248,0.3)",
              animation: "rehesyaFadeOut 2.8s ease-in forwards",
            }} />
            <h2 style={{ color: "#38bdf8", fontSize: mobile ? 20 : 24, fontWeight: 300, letterSpacing: 4, fontFamily: "Georgia,serif", marginBottom: 12 }}>
              Released
            </h2>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 14, lineHeight: 2, fontFamily: "Georgia,serif", maxWidth: 300, margin: "0 auto" }}>
              Rehesya is leaving your orbit.<br/>
              It will return when the universe answers.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// REHESYA PANEL — "Answer the Universe" (stranger's question)
// ─────────────────────────────────────────────────────────────────────
export function RehesyaPanel({ user, rehesyaPass, onAnswered, onSkipped, mobile }) {
  const [answer, setAnswer] = useState("");
  const [saving, setSaving] = useState(false);
  const [departing, setDeparting] = useState(false);
  const [departMsg, setDepartMsg] = useState("");

  const handleAnswer = async () => {
    if (!answer.trim() || saving) return;
    setSaving(true);
    try {
      await supabase.from("rehesya_passes")
        .update({ answer: answer.trim(), answered_at: new Date().toISOString() })
        .eq("id", rehesyaPass.id);
      await passToNextUser(rehesyaPass.chain_id, user.id);
      setDepartMsg("Your words are traveling back to the one who asked...");
      setDeparting(true);
      setTimeout(() => onAnswered(), 2400);
    } catch (err) {
      console.error("Answer failed:", err);
      setSaving(false);
    }
  };

  const handleSkip = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await supabase.from("rehesya_passes")
        .update({ skipped: true, answered_at: new Date().toISOString() })
        .eq("id", rehesyaPass.id);
      await passToNextUser(rehesyaPass.chain_id, user.id);
      setDepartMsg("Rehesya passes on to another universe...");
      setDeparting(true);
      setTimeout(() => onSkipped(), 2400);
    } catch (err) {
      console.error("Skip failed:", err);
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 20,
      display: "flex", flexDirection: mobile ? "column" : "row",
      animation: departing ? "rehesyaDepart 2.4s ease-in forwards" : "rehesyaArrive 0.9s cubic-bezier(0.16,1,0.3,1)",
      overflow: "hidden",
    }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 30% 50%, rgba(14,8,35,1) 0%, rgba(4,2,14,1) 60%, #000 100%)" }} />
      <div style={{ position: "absolute", inset: 0, opacity: 0.3, backgroundImage: "radial-gradient(circle, rgba(56,189,248,0.07) 0.5px, transparent 0.5px)", backgroundSize: "40px 40px" }} />

      {/* LEFT: Planet */}
      <div style={{ width: mobile ? "100%" : "42%", height: mobile ? "32vh" : "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", flexShrink: 0 }}>
        <button onClick={handleSkip} disabled={saving} style={{
          position: "absolute", top: mobile ? 14 : 20, left: mobile ? 14 : 20,
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 10, padding: "7px 16px", color: "rgba(255,255,255,0.3)",
          fontSize: 12, cursor: "pointer", zIndex: 10, letterSpacing: 1, fontFamily: "Georgia,serif",
        }}>← Pass it on</button>

        <div style={{
          width: mobile ? 110 : 150, height: mobile ? 110 : 150, borderRadius: "50%",
          background: "radial-gradient(circle at 38% 38%, rgba(255,255,255,0.14), #38bdf8cc 40%, #0ea5e9aa 70%, #0c4a6e 100%)",
          boxShadow: "0 0 55px rgba(56,189,248,0.22), 0 0 110px rgba(56,189,248,0.09)",
          animation: "planetPulse 6s ease-in-out infinite", position: "relative", zIndex: 2,
        }}>
          <div style={{ position: "absolute", inset: "20%", borderRadius: "50%", border: "1px solid rgba(56,189,248,0.15)", animation: "rehesyaSpin 20s linear infinite" }} />
          <div style={{ position: "absolute", inset: "38%", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.07)", animation: "rehesyaSpin 14s linear infinite reverse" }} />
        </div>
        <div style={{ position: "absolute", top: mobile ? 20 : "30%", left: "50%", transform: "translateX(-50%)", color: "rgba(56,189,248,0.25)", fontSize: mobile ? 26 : 40, fontFamily: "Georgia,serif", fontWeight: 300, animation: "floatUpDown 4s ease-in-out infinite", pointerEvents: "none" }}>?</div>
      </div>

      {/* RIGHT: Question + Answer */}
      <div style={{ flex: 1, padding: mobile ? "20px 22px 36px" : "60px 52px", overflowY: "auto", display: "flex", flexDirection: "column", justifyContent: mobile ? "flex-start" : "center", position: "relative", zIndex: 2 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#38bdf8", boxShadow: "0 0 8px rgba(56,189,248,0.5)" }} />
          <h1 style={{ color: "#38bdf8", fontSize: mobile ? 20 : 32, letterSpacing: mobile ? 4 : 8, fontWeight: 300, fontFamily: "Georgia,serif" }}>REHESYA</h1>
        </div>
        <p style={{ color: "rgba(255,255,255,0.18)", fontSize: mobile ? 10 : 11, letterSpacing: 3, marginBottom: mobile ? 24 : 40, marginLeft: 20, fontFamily: "Georgia,serif" }}>Answer the Universe · रहस्य</p>

        <div style={{ padding: mobile ? "18px" : "26px 30px", background: "rgba(56,189,248,0.04)", border: "1px solid rgba(56,189,248,0.12)", borderRadius: 18, marginBottom: mobile ? 18 : 28 }}>
          <p style={{ color: "rgba(255,255,255,0.12)", fontSize: 10, letterSpacing: 3, marginBottom: 12, fontFamily: "Georgia,serif" }}>A STRANGER ASKS</p>
          <p style={{ color: "rgba(255,255,255,0.82)", fontSize: mobile ? 15 : 19, lineHeight: 1.9, fontFamily: "Georgia,serif", fontStyle: "italic", letterSpacing: 0.3 }}>
            "{rehesyaPass?.question}"
          </p>
        </div>

        <p style={{ color: "rgba(255,255,255,0.18)", fontSize: mobile ? 11 : 12, letterSpacing: 1, marginBottom: mobile ? 16 : 22, fontFamily: "Georgia,serif", lineHeight: 1.8 }}>
          Your answer goes back to them, anonymously. You will never know who. They will never know you.
        </p>

        <textarea
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          placeholder="Write what the universe gave you..."
          style={{
            width: "100%", height: mobile ? "180px" : "240px",
            padding: mobile ? "20px" : "28px 30px",
            background: "rgba(56,189,248,0.03)",
            border: "1px solid rgba(56,189,248,0.1)",
            borderRadius: 18,
            color: "rgba(230,245,255,0.88)",
            fontSize: mobile ? 16 : 18, lineHeight: 2.1,
            resize: "none", outline: "none", fontFamily: "Georgia,serif",
            boxSizing: "border-box", letterSpacing: 0.4, marginBottom: mobile ? 16 : 22,
            WebkitOverflowScrolling: "touch",
          }}
        />

        <div style={{ display: "flex", gap: 10, maxWidth: 420 }}>
          <button onClick={handleSkip} disabled={saving} style={{
            flex: 1, padding: mobile ? "13px" : "15px",
            background: "transparent", border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 14, cursor: "pointer",
            color: "rgba(255,255,255,0.22)", fontSize: mobile ? 12 : 13, fontFamily: "Georgia,serif", letterSpacing: 1.5,
          }}>Pass it on →</button>
          <button onClick={handleAnswer} disabled={saving || !answer.trim()} style={{
            flex: 2, padding: mobile ? "13px" : "15px",
            background: answer.trim() ? "linear-gradient(135deg, rgba(56,189,248,0.25), rgba(56,189,248,0.12))" : "rgba(255,255,255,0.03)",
            border: `1px solid ${answer.trim() ? "rgba(56,189,248,0.35)" : "rgba(255,255,255,0.06)"}`,
            borderRadius: 14, cursor: "pointer",
            color: answer.trim() ? "#38bdf8" : "rgba(255,255,255,0.15)",
            fontSize: mobile ? 12 : 13, fontFamily: "Georgia,serif", letterSpacing: 2, transition: "all 0.3s",
          }}>{saving ? "Sending..." : "✦ Answer & Pass"}</button>
        </div>

        {departing && (
          <p style={{ color: "rgba(56,189,248,0.5)", fontSize: 13, fontFamily: "Georgia,serif", fontStyle: "italic", textAlign: "center", marginTop: 28, animation: "fadeIn 0.6s ease" }}>
            {departMsg}
          </p>
        )}
      </div>

      <style>{`
        @keyframes rehesyaArrive { from { opacity:0; filter:blur(8px); } to { opacity:1; filter:blur(0px); } }
        @keyframes rehesyaDepart { 0%{opacity:1;filter:blur(0);} 60%{opacity:0.5;filter:blur(4px);} 100%{opacity:0;filter:blur(16px);} }
        @keyframes rehesyaSpin { from{transform:rotate(0deg);} to{transform:rotate(360deg);} }
        @keyframes floatUpDown { 0%,100%{transform:translateX(-50%) translateY(0);} 50%{transform:translateX(-50%) translateY(-10px);} }
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// REHESYA ANSWERS — "Universe has answered" reveal screen
// ─────────────────────────────────────────────────────────────────────
export function RehesyaAnswers({ user, answers, onClose, mobile }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(0,0,0,0.85)", backdropFilter: "blur(18px)",
      animation: "overlayIn 0.7s cubic-bezier(0.16,1,0.3,1)",
      padding: mobile ? "16px" : 0,
    }}>
      <div style={{
        width: mobile ? "100%" : 540,
        maxHeight: mobile ? "92vh" : "86vh",
        overflowY: "auto",
        background: "rgba(4,2,14,0.98)",
        border: "1px solid rgba(56,189,248,0.18)",
        borderRadius: 24,
        padding: mobile ? "40px 22px 36px" : "52px 48px",
        position: "relative",
        boxShadow: "0 0 100px rgba(56,189,248,0.1), 0 40px 80px rgba(0,0,0,0.8)",
      }}>
        <button onClick={onClose} style={{
          position: "absolute", top: 18, right: 18,
          background: "none", border: "none", color: "rgba(255,255,255,0.2)", fontSize: 18, cursor: "pointer",
        }}>✕</button>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{
            width: mobile ? 48 : 60, height: mobile ? 48 : 60, borderRadius: "50%",
            margin: "0 auto 18px",
            background: "radial-gradient(circle at 38% 38%, rgba(255,255,255,0.15), #38bdf8cc 40%, #0c4a6e 100%)",
            boxShadow: "0 0 50px rgba(56,189,248,0.4), 0 0 100px rgba(56,189,248,0.15)",
            animation: "planetPulse 4s ease-in-out infinite",
          }} />
          <h2 style={{ color: "#38bdf8", fontSize: mobile ? 20 : 26, fontWeight: 300, letterSpacing: mobile ? 3 : 5, fontFamily: "Georgia,serif", marginBottom: 10 }}>
            The Universe Answered
          </h2>
          <p style={{ color: "rgba(255,255,255,0.25)", fontSize: mobile ? 11 : 12, letterSpacing: 2, fontFamily: "Georgia,serif", lineHeight: 1.8 }}>
            A stranger, somewhere, answered your question.<br/>
            They don't know who you are. You don't know who they are.
          </p>
        </div>

        {/* Separator */}
        <div style={{ width: 60, height: 1, background: "linear-gradient(90deg, transparent, rgba(56,189,248,0.3), transparent)", margin: "0 auto 32px" }} />

        {/* Answers */}
        {!answers || answers.length === 0 ? (
          <p style={{ color: "rgba(255,255,255,0.2)", textAlign: "center", fontFamily: "Georgia,serif", fontSize: 14, fontStyle: "italic" }}>
            The universe is still composing its answer...
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {answers.map((a, i) => (
              <div key={i} style={{
                padding: mobile ? "20px 18px" : "26px 28px",
                background: "rgba(56,189,248,0.03)",
                border: "1px solid rgba(56,189,248,0.1)",
                borderRadius: 18,
                animation: `fadeIn 0.6s ease ${i * 0.15}s both`,
              }}>
                <p style={{ color: "rgba(56,189,248,0.4)", fontSize: 9, letterSpacing: 3, marginBottom: 10, fontFamily: "Georgia,serif" }}>YOU ASKED</p>
                <p style={{ color: "rgba(255,255,255,0.3)", fontSize: mobile ? 12 : 13, fontFamily: "Georgia,serif", fontStyle: "italic", lineHeight: 1.7, marginBottom: 20 }}>
                  "{a.question}"
                </p>
                <p style={{ color: "rgba(56,189,248,0.5)", fontSize: 9, letterSpacing: 3, marginBottom: 10, fontFamily: "Georgia,serif" }}>A STRANGER SAYS</p>
                <p style={{ color: "rgba(255,255,255,0.85)", fontSize: mobile ? 15 : 18, fontFamily: "Georgia,serif", lineHeight: 2, fontStyle: "italic", letterSpacing: 0.3 }}>
                  "{a.answer}"
                </p>
                <p style={{ color: "rgba(255,255,255,0.1)", fontSize: 10, marginTop: 16, fontFamily: "Georgia,serif" }}>
                  {new Date(a.answered_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
            ))}
          </div>
        )}

        <button onClick={onClose} style={{
          display: "block", margin: "32px auto 0",
          padding: "12px 32px",
          background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.2)",
          borderRadius: 12, cursor: "pointer",
          color: "#38bdf8", fontSize: 12, fontFamily: "Georgia,serif", letterSpacing: 2.5,
        }}>Return to Universe</button>
      </div>
    </div>
  );
}
