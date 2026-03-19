import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

export default function StreakTracker({ user, mobile, onClose }) {
  const [streak, setStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [totalDays, setTotalDays] = useState(0);
  const [recentDays, setRecentDays] = useState([]); // last 7 days with/without entry
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadStreakData();
  }, [user]);

  const loadStreakData = async () => {
    try {
      const { data } = await supabase
        .from("journal_entries")
        .select("created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!data || data.length === 0) { setLoading(false); return; }

      // Get unique days (in local date string)
      const daySet = new Set(data.map(e => new Date(e.created_at).toDateString()));
      const days = Array.from(daySet).map(d => new Date(d)).sort((a,b) => b-a);

      setTotalDays(days.length);

      // Calculate current streak
      let cur = 0;
      const today = new Date(); today.setHours(0,0,0,0);
      const yesterday = new Date(today); yesterday.setDate(today.getDate()-1);

      // Start from today or yesterday
      let checkDate = new Date(today);
      const hasToday = days.some(d => { const dd = new Date(d); dd.setHours(0,0,0,0); return dd.getTime() === today.getTime(); });
      if (!hasToday) {
        const hasYesterday = days.some(d => { const dd = new Date(d); dd.setHours(0,0,0,0); return dd.getTime() === yesterday.getTime(); });
        if (!hasYesterday) { setStreak(0); }
        else { checkDate = new Date(yesterday); }
      }

      // Count back
      while (true) {
        const found = days.some(d => { const dd = new Date(d); dd.setHours(0,0,0,0); return dd.getTime() === checkDate.getTime(); });
        if (!found) break;
        cur++;
        checkDate.setDate(checkDate.getDate()-1);
      }
      setStreak(cur);

      // Longest streak
      let longest = 0, running = 1;
      for (let i = 1; i < days.length; i++) {
        const diff = (days[i-1] - days[i]) / (1000*60*60*24);
        if (Math.round(diff) === 1) { running++; longest = Math.max(longest, running); }
        else { running = 1; }
      }
      if (days.length > 0) longest = Math.max(longest, running);
      setLongestStreak(longest);

      // Last 7 days visual
      const last7 = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today); d.setDate(today.getDate()-i);
        const hasEntry = days.some(day => { const dd = new Date(day); dd.setHours(0,0,0,0); return dd.getTime() === d.getTime(); });
        last7.push({ date: d, hasEntry, isToday: i === 0 });
      }
      setRecentDays(last7);

    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const dayLabels = ["S","M","T","W","T","F","S"];

  if (loading) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(0,0,0,0.75)", backdropFilter: "blur(12px)",
      animation: "overlayIn 0.5s cubic-bezier(0.16,1,0.3,1)",
    }}>
      <div style={{
        width: mobile ? "88vw" : 420,
        background: "rgba(6,4,18,0.96)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 24,
        padding: mobile ? "36px 24px" : "48px 40px",
        position: "relative",
        boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
      }}>
        <button onClick={onClose} style={{
          position: "absolute", top: 18, right: 18,
          background: "none", border: "none",
          color: "rgba(255,255,255,0.25)", fontSize: 18, cursor: "pointer",
        }}>✕</button>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontSize: 28, marginBottom: 14 }}>
            {streak >= 7 ? "🔥" : streak >= 3 ? "✦" : "○"}
          </div>
          <h2 style={{ color: "rgba(255,255,255,0.85)", fontSize: mobile ? 18 : 22, fontWeight: 300, letterSpacing: 4, fontFamily: "Georgia,serif", marginBottom: 6 }}>
            Your Continuity
          </h2>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, letterSpacing: 2, fontFamily: "Georgia,serif" }}>
            Every day you return, your universe grows
          </p>
        </div>

        {/* Current streak — big number */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{
            fontSize: mobile ? 64 : 80, fontWeight: 300, lineHeight: 1,
            fontFamily: "Georgia,serif",
            color: streak >= 7 ? "#ffd700" : streak >= 3 ? "#f5a623" : "rgba(255,255,255,0.5)",
            textShadow: streak >= 3 ? `0 0 40px ${streak >= 7 ? "rgba(255,215,0,0.4)" : "rgba(245,166,35,0.3)"}` : "none",
          }}>{streak}</div>
          <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 10, letterSpacing: 4, marginTop: 8, fontFamily: "Georgia,serif" }}>
            {streak === 1 ? "DAY STREAK" : "DAYS IN A ROW"}
          </div>
        </div>

        {/* Last 7 days */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 10, letterSpacing: 3, textAlign: "center", marginBottom: 14, fontFamily: "Georgia,serif" }}>LAST 7 DAYS</p>
          <div style={{ display: "flex", justifyContent: "center", gap: mobile ? 8 : 12 }}>
            {recentDays.map((day, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{
                  width: mobile ? 32 : 36, height: mobile ? 32 : 36, borderRadius: "50%",
                  background: day.hasEntry
                    ? "radial-gradient(circle, rgba(255,255,255,0.85), rgba(200,200,200,0.5))"
                    : "rgba(255,255,255,0.04)",
                  border: day.isToday
                    ? "1px solid rgba(245,166,35,0.4)"
                    : day.hasEntry ? "1px solid rgba(255,255,255,0.15)" : "1px solid rgba(255,255,255,0.06)",
                  boxShadow: day.hasEntry ? "0 0 8px rgba(255,255,255,0.15)" : "none",
                  transition: "all 0.3s",
                }} />
                <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 9, fontFamily: "Georgia,serif" }}>
                  {dayLabels[day.date.getDay()]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", justifyContent: "center", gap: mobile ? 24 : 36, borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 24 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ color: "#f5a623", fontSize: mobile ? 22 : 28, fontWeight: 300, fontFamily: "Georgia,serif" }}>{longestStreak}</div>
            <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 9, letterSpacing: 2, marginTop: 4, fontFamily: "Georgia,serif" }}>LONGEST</div>
          </div>
          <div style={{ width: 1, background: "rgba(255,255,255,0.05)" }} />
          <div style={{ textAlign: "center" }}>
            <div style={{ color: "#f5a623", fontSize: mobile ? 22 : 28, fontWeight: 300, fontFamily: "Georgia,serif" }}>{totalDays}</div>
            <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 9, letterSpacing: 2, marginTop: 4, fontFamily: "Georgia,serif" }}>TOTAL DAYS</div>
          </div>
        </div>

        {/* Gentle encouragement */}
        <p style={{
          color: "rgba(255,255,255,0.2)", fontSize: 12, textAlign: "center",
          fontFamily: "Georgia,serif", fontStyle: "italic", lineHeight: 1.8,
          marginTop: 24,
        }}>
          {streak === 0 ? "Every journey begins with a single word." :
           streak < 3 ? "You've begun. That is everything." :
           streak < 7 ? "You are building something real." :
           streak < 14 ? "Your consistency is becoming a practice." :
           "You are someone who shows up for themselves."}
        </p>
      </div>
    </div>
  );
}
