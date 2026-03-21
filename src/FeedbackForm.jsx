import { useState } from "react";
import { supabase } from "./supabaseClient";

const SUGGESTIONS = [
  "A daily reminder to come back",
  "Dark / light mode",
  "Share a journal entry anonymously",
  "See what others write on the same planet",
  "A gratitude planet",
  "Audio journaling — speak instead of type",
  "Weekly reflection summary",
  "A community of Shunya users",
  "Export my entries as a PDF",
  "Guided meditation before journaling",
  "Random prompt anytime",
  "Journal streaks & milestones",
  "Multiple solar systems — different moods",
  "A private planet only I can name",
  "Partner mode — share with one person",
];

export default function FeedbackForm({ user, onClose, mobile }) {
  const [step, setStep] = useState(0);
  const [rating, setRating] = useState(null);
  const [text, setText] = useState("");
  const [category, setCategory] = useState("general");
  const [selectedSuggestions, setSelectedSuggestions] = useState([]);
  const [customSuggestion, setCustomSuggestion] = useState("");
  const [saving, setSaving] = useState(false);
  const [textFocused, setTextFocused] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(null);

  const MAX_CHARS = 500;
  const categories = [
    { id: "feeling", label: "How it feels" },
    { id: "feature", label: "Something missing" },
    { id: "bug", label: "Something broken" },
    { id: "general", label: "Just a thought" },
  ];

  const ratingLabels    = ["", "Distant", "Uncertain", "Present", "Moved", "Transformed"];
  const ratingColors    = ["", "#a78bfa", "#4ecdc4", "#f5a623", "#f093fb", "#ffd700"];
  const ratingSubtitles = ["", "Something felt off", "Not sure how I feel", "I was here, fully", "It moved something in me", "I am not the same"];

  const toggleSuggestion = (s) =>
    setSelectedSuggestions(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const handleSubmit = async () => {
    setSaving(true);
    const allSuggestions = [...selectedSuggestions, ...(customSuggestion.trim() ? [customSuggestion.trim()] : [])];
    try {
      await supabase.from("feedback").insert({
        user_id: user?.id || null, rating, category,
        content: text.trim() || "(no text)",
        suggestions: allSuggestions.length > 0 ? allSuggestions : null,
        created_at: new Date().toISOString(),
      });
    } catch (err) {}
    setSaving(false);
    setStep(3);
  };

  const charCount   = text.length;
  const charPercent = (charCount / MAX_CHARS) * 100;
  const charColor   = charPercent > 90 ? "#ff6b6b" : charPercent > 70 ? "#f5a623" : "rgba(245,210,130,0.25)";
  const activeColor = rating ? ratingColors[rating] : "#f5a623";

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:200,
      display:"flex", alignItems:"center", justifyContent:"center",
      background:"rgba(0,0,0,0.88)", backdropFilter:"blur(22px)",
      animation:"overlayIn 0.5s cubic-bezier(0.16,1,0.3,1)",
      padding: mobile ? "16px" : 0,
    }}>
      <div style={{
        width: mobile ? "100%" : 500,
        maxHeight: mobile ? "92vh" : "88vh",
        overflowY:"auto",
        background:"linear-gradient(160deg, rgba(8,4,22,0.99) 0%, rgba(4,2,12,0.99) 100%)",
        border:`1px solid ${activeColor}20`,
        borderRadius:28,
        padding: mobile ? "32px 22px 28px" : "44px 40px",
        position:"relative",
        boxShadow:`0 40px 100px rgba(0,0,0,0.9), 0 0 60px ${activeColor}08`,
        transition:"border 0.5s, box-shadow 0.5s",
        overflow:"hidden",
      }}>
        {/* Top shimmer */}
        <div style={{ position:"absolute", top:0, left:0, right:0, height:1, background:`linear-gradient(90deg,transparent,${activeColor}60,transparent)`, transition:"background 0.5s", pointerEvents:"none" }} />
        {/* Ambient top glow */}
        <div style={{ position:"absolute", top:0, left:0, right:0, height:"45%", background:`radial-gradient(ellipse at 50% 0%, ${activeColor}08 0%, transparent 70%)`, pointerEvents:"none", transition:"background 0.5s" }} />

        {/* Close */}
        <button onClick={onClose} style={{
          position:"absolute", top:18, right:20,
          background:"rgba(245,166,35,0.04)", border:"1px solid rgba(245,166,35,0.14)",
          borderRadius:8, width:28, height:28,
          display:"flex", alignItems:"center", justifyContent:"center",
          color:"rgba(245,166,35,0.45)", fontSize:13, cursor:"pointer", transition:"all 0.2s",
        }}
          onMouseEnter={e=>{e.currentTarget.style.color="rgba(245,166,35,0.85)";e.currentTarget.style.background="rgba(245,166,35,0.10)";}}
          onMouseLeave={e=>{e.currentTarget.style.color="rgba(245,166,35,0.45)";e.currentTarget.style.background="rgba(245,166,35,0.04)";}}>✕</button>

        {/* Progress dots */}
        {step < 3 && (
          <div style={{ display:"flex", justifyContent:"center", gap:8, marginBottom:32, position:"relative", zIndex:1 }}>
            {[0,1,2].map(i => (
              <div key={i} style={{
                width: i===step ? 24 : 7, height:7, borderRadius:4,
                background: i===step ? activeColor : i<step ? activeColor+"35" : "rgba(245,166,35,0.08)",
                transition:"all 0.35s ease",
                boxShadow: i===step ? `0 0 10px ${activeColor}55` : "none",
              }} />
            ))}
          </div>
        )}

        {/* ── STEP 0: Rating ── */}
        {step === 0 && (
          <div style={{ position:"relative", zIndex:1 }}>
            <div style={{ textAlign:"center", marginBottom:32 }}>
              <div style={{ position:"relative", display:"inline-block", marginBottom:18 }}>
                <div style={{ position:"absolute", inset:-10, borderRadius:"50%", background:"radial-gradient(circle, rgba(245,166,35,0.20) 0%, transparent 70%)", animation:"planetPulse 3s ease-in-out infinite" }} />
                <div style={{ width:16, height:16, borderRadius:"50%", background:"radial-gradient(circle at 38% 38%, #fff8e1, #f5a623 50%, #b8760a)", boxShadow:"0 0 20px rgba(245,166,35,0.9)" }} />
              </div>
              <h2 style={{ color:"rgba(255,248,225,0.92)", fontSize: mobile?20:24, fontWeight:300, letterSpacing:4, fontFamily:"Georgia,serif", marginBottom:8 }}>
                How did Shunya feel?
              </h2>
              <p style={{ color:"rgba(245,210,130,0.42)", fontSize:11, letterSpacing:2.5, fontFamily:"Georgia,serif", fontStyle:"italic" }}>
                Be honest. This is sacred space.
              </p>
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {[1,2,3,4,5].map(n => {
                const h = hoveredRating === n;
                const col = ratingColors[n];
                return (
                  <button key={n}
                    onClick={() => { setRating(n); setStep(1); }}
                    onMouseEnter={() => setHoveredRating(n)}
                    onMouseLeave={() => setHoveredRating(null)}
                    style={{
                      padding:"15px 22px",
                      background: h ? `${col}14` : "rgba(245,166,35,0.02)",
                      border:`1px solid ${h ? col+"50" : "rgba(245,166,35,0.10)"}`,
                      borderRadius:16, cursor:"pointer",
                      display:"flex", alignItems:"center", justifyContent:"space-between",
                      transition:"all 0.2s",
                      boxShadow: h ? `0 0 24px ${col}18` : "none",
                    }}>
                    <div style={{ textAlign:"left" }}>
                      <span style={{ color: h ? col : "rgba(255,248,225,0.78)", fontSize:15, fontFamily:"Georgia,serif", letterSpacing:1, display:"block", transition:"color 0.2s" }}>
                        {ratingLabels[n]}
                      </span>
                      <span style={{ color: h ? col+"90" : "rgba(245,210,130,0.30)", fontSize:10, fontFamily:"Georgia,serif", letterSpacing:0.5, transition:"color 0.2s" }}>
                        {ratingSubtitles[n]}
                      </span>
                    </div>
                    <div style={{ display:"flex", gap:5, alignItems:"center" }}>
                      {Array.from({length:5}).map((_,i) => (
                        <div key={i} style={{
                          width: h && i<n ? 9 : 7, height: h && i<n ? 9 : 7,
                          borderRadius:"50%",
                          background: i<n ? col : "rgba(245,166,35,0.08)",
                          boxShadow: i<n && h ? `0 0 8px ${col}` : i<n ? `0 0 4px ${col}88` : "none",
                          transition:"all 0.2s",
                        }} />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── STEP 1: Feedback ── */}
        {step === 1 && (
          <div style={{ position:"relative", zIndex:1 }}>
            <div style={{ textAlign:"center", marginBottom:24 }}>
              <div style={{ position:"relative", display:"inline-block", marginBottom:14 }}>
                <div style={{ position:"absolute", inset:-10, borderRadius:"50%", background:`radial-gradient(circle, ${activeColor}28 0%, transparent 70%)`, animation:"planetPulse 3s ease-in-out infinite" }} />
                <div style={{ width:13, height:13, borderRadius:"50%", background:`radial-gradient(circle at 38% 38%, white, ${activeColor} 55%, ${activeColor}88)`, boxShadow:`0 0 16px ${activeColor}` }} />
              </div>
              <h2 style={{ color:"rgba(255,248,225,0.90)", fontSize: mobile?17:21, fontWeight:300, letterSpacing:3, fontFamily:"Georgia,serif", marginBottom:6 }}>Tell us more</h2>
              <p style={{ color:"rgba(245,210,130,0.40)", fontSize:11, letterSpacing:1.5, fontFamily:"Georgia,serif" }}>Your words shape Shunya's future</p>
            </div>

            <div style={{ display:"flex", gap:7, marginBottom:18, flexWrap:"wrap" }}>
              {categories.map(c => (
                <button key={c.id} onClick={() => setCategory(c.id)} style={{
                  padding:"6px 13px",
                  background: category===c.id ? `${activeColor}18` : "rgba(245,166,35,0.02)",
                  border:`1px solid ${category===c.id ? activeColor+"50" : "rgba(245,166,35,0.10)"}`,
                  borderRadius:8, cursor:"pointer",
                  color: category===c.id ? activeColor : "rgba(245,210,130,0.42)",
                  fontSize:10, fontFamily:"Georgia,serif", letterSpacing:1.5, transition:"all 0.2s",
                }}>{c.label}</button>
              ))}
            </div>

            <div style={{
              position:"relative",
              background: textFocused ? `${activeColor}05` : "rgba(245,166,35,0.02)",
              border:`1px solid ${textFocused ? activeColor+"38" : "rgba(245,166,35,0.10)"}`,
              borderRadius:18, transition:"all 0.3s ease",
              boxShadow: textFocused ? `0 0 24px ${activeColor}10, inset 0 0 20px ${activeColor}04` : "none",
              marginBottom:8, overflow:"hidden",
            }}>
              <div style={{ position:"absolute", top:0, left:0, right:0, height:1, background:`linear-gradient(90deg,transparent,${activeColor}${textFocused?"50":"18"},transparent)`, transition:"background 0.4s", pointerEvents:"none" }} />
              <div style={{ padding:"14px 18px 0", display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ width:5, height:5, borderRadius:"50%", background:activeColor, boxShadow:`0 0 6px ${activeColor}` }} />
                <span style={{ color:`${activeColor}60`, fontSize:9, letterSpacing:3, fontFamily:"Georgia,serif" }}>YOUR FEEDBACK</span>
              </div>
              <textarea
                value={text}
                onChange={e => { if (e.target.value.length <= MAX_CHARS) setText(e.target.value); }}
                onFocus={() => setTextFocused(true)}
                onBlur={() => setTextFocused(false)}
                placeholder="Write freely — there are no wrong answers here..."
                autoFocus
                style={{
                  width:"100%", height: mobile?130:155,
                  padding:"12px 18px 14px", background:"transparent", border:"none",
                  color:"rgba(255,248,225,0.88)", fontSize: mobile?14:15, lineHeight:1.9,
                  resize:"none", outline:"none", fontFamily:"Georgia,serif",
                  boxSizing:"border-box", letterSpacing:0.3, caretColor:activeColor,
                }}
              />
              <div style={{ padding:"10px 18px", borderTop:`1px solid ${activeColor}10`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div style={{ flex:1, height:2, background:"rgba(245,166,35,0.06)", borderRadius:2, marginRight:12 }}>
                  <div style={{ height:"100%", borderRadius:2, width:`${Math.min(charPercent,100)}%`, background:charColor, transition:"width 0.2s, background 0.3s" }} />
                </div>
                <span style={{ color:charColor, fontSize:10, fontFamily:"Georgia,serif", letterSpacing:1, minWidth:50, textAlign:"right", transition:"color 0.3s" }}>{charCount} / {MAX_CHARS}</span>
              </div>
            </div>

            {text.length === 0 && <p style={{ color:"rgba(245,210,130,0.20)", fontSize:10, fontFamily:"Georgia,serif", letterSpacing:1, marginBottom:16, paddingLeft:4, fontStyle:"italic" }}>Even one sentence matters.</p>}
            {text.length > 0 && text.length < 20 && <p style={{ color:"rgba(245,210,130,0.25)", fontSize:10, fontFamily:"Georgia,serif", letterSpacing:1, marginBottom:16, paddingLeft:4, fontStyle:"italic" }}>Keep going...</p>}
            {text.length >= 20 && <p style={{ color:`${activeColor}75`, fontSize:10, fontFamily:"Georgia,serif", letterSpacing:1, marginBottom:16, paddingLeft:4 }}>✓ That's something real.</p>}

            <div style={{ display:"flex", gap:10, marginTop:6 }}>
              <button onClick={() => setStep(0)} style={{ flex:1, padding:"13px", background:"transparent", border:"1px solid rgba(245,166,35,0.08)", borderRadius:14, cursor:"pointer", color:"rgba(245,210,130,0.35)", fontSize:13, fontFamily:"Georgia,serif" }}>← Back</button>
              <button onClick={() => setStep(2)} style={{ flex:2, padding:"13px", background:`linear-gradient(135deg, ${activeColor}22, ${activeColor}10)`, border:`1px solid ${activeColor}38`, borderRadius:14, cursor:"pointer", color:activeColor, fontSize:13, fontFamily:"Georgia,serif", letterSpacing:1.5, transition:"all 0.3s" }}>Next → Suggestions</button>
            </div>
            <button onClick={handleSubmit} disabled={saving} style={{ width:"100%", marginTop:10, padding:"11px", background:"transparent", border:"none", cursor:"pointer", color:"rgba(245,210,130,0.22)", fontSize:11, fontFamily:"Georgia,serif", letterSpacing:1 }}>Skip suggestions & send</button>
          </div>
        )}

        {/* ── STEP 2: Suggestions ── */}
        {step === 2 && (
          <div style={{ position:"relative", zIndex:1 }}>
            <div style={{ textAlign:"center", marginBottom:24 }}>
              <div style={{ color:activeColor, fontSize:20, marginBottom:12, textShadow:`0 0 20px ${activeColor}` }}>✦</div>
              <h2 style={{ color:"rgba(255,248,225,0.90)", fontSize: mobile?17:20, fontWeight:300, letterSpacing:3, fontFamily:"Georgia,serif", marginBottom:6 }}>What would make Shunya better?</h2>
              <p style={{ color:"rgba(245,210,130,0.38)", fontSize:11, letterSpacing:1.5, fontFamily:"Georgia,serif" }}>Pick any that feel right. Add your own.</p>
            </div>

            <div style={{ display:"flex", flexWrap:"wrap", gap:7, marginBottom:18 }}>
              {SUGGESTIONS.map(s => {
                const sel = selectedSuggestions.includes(s);
                return (
                  <button key={s} onClick={() => toggleSuggestion(s)} style={{
                    padding:"7px 13px",
                    background: sel ? `${activeColor}15` : "rgba(245,166,35,0.02)",
                    border:`1px solid ${sel ? activeColor+"48" : "rgba(245,166,35,0.10)"}`,
                    borderRadius:20, cursor:"pointer",
                    color: sel ? activeColor : "rgba(245,210,130,0.42)",
                    fontSize: mobile?11:12, fontFamily:"Georgia,serif", transition:"all 0.18s",
                  }}>{sel ? "✓ " : ""}{s}</button>
                );
              })}
            </div>

            <input
              value={customSuggestion}
              onChange={e => setCustomSuggestion(e.target.value)}
              placeholder="Something else on your mind..."
              style={{
                width:"100%", padding:"13px 16px",
                background:"rgba(245,166,35,0.02)", border:"1px solid rgba(245,166,35,0.10)",
                borderRadius:14, color:"rgba(255,248,225,0.78)",
                fontSize:13, outline:"none", fontFamily:"Georgia,serif", letterSpacing:0.3,
                boxSizing:"border-box", marginBottom:16, caretColor:activeColor,
              }}
            />

            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => setStep(1)} style={{ flex:1, padding:"13px", background:"transparent", border:"1px solid rgba(245,166,35,0.08)", borderRadius:14, cursor:"pointer", color:"rgba(245,210,130,0.35)", fontSize:13, fontFamily:"Georgia,serif" }}>← Back</button>
              <button onClick={handleSubmit} disabled={saving} style={{ flex:2, padding:"13px", background:`linear-gradient(135deg, ${activeColor}, ${activeColor}cc)`, border:"none", borderRadius:14, cursor:"pointer", color:"#0a0608", fontSize:13, fontWeight:700, fontFamily:"Georgia,serif", letterSpacing:1.5, transition:"all 0.3s", opacity:saving?0.6:1, boxShadow:`0 0 30px ${activeColor}35` }}>{saving ? "..." : "✦ Send"}</button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Done ── */}
        {step === 3 && (
          <div style={{ textAlign:"center", padding:"24px 0", position:"relative", zIndex:1 }}>
            <div style={{ position:"relative", display:"inline-block", marginBottom:20 }}>
              <div style={{ position:"absolute", inset:-16, borderRadius:"50%", background:`radial-gradient(circle, ${activeColor}20 0%, transparent 70%)`, animation:"planetPulse 3s ease-in-out infinite" }} />
              <div style={{ color:activeColor, fontSize:36, textShadow:`0 0 30px ${activeColor}` }}>✦</div>
            </div>
            <h2 style={{ color:activeColor, fontSize: mobile?20:24, fontWeight:300, letterSpacing:4, fontFamily:"Georgia,serif", marginBottom:12, textShadow:`0 0 30px ${activeColor}60` }}>Received</h2>
            <p style={{ color:"rgba(245,210,130,0.50)", fontSize:14, lineHeight:2, fontFamily:"Georgia,serif", maxWidth:300, margin:"0 auto 28px" }}>
              Every word you share helps Shunya become more of what it was always meant to be.
            </p>
            {text.length > 0 && (
              <div style={{ padding:"14px 20px", marginBottom:20, background:`${activeColor}08`, border:`1px solid ${activeColor}18`, borderRadius:16, maxWidth:320, margin:"0 auto 20px" }}>
                <p style={{ color:"rgba(245,210,130,0.35)", fontSize:12, fontFamily:"Georgia,serif", fontStyle:"italic", lineHeight:1.8 }}>
                  "{text.length > 80 ? text.substring(0,80)+"..." : text}"
                </p>
              </div>
            )}
            {selectedSuggestions.length > 0 && (
              <p style={{ color:"rgba(245,210,130,0.35)", fontSize:11, letterSpacing:1.5, marginBottom:28, fontFamily:"Georgia,serif" }}>
                {selectedSuggestions.length} suggestion{selectedSuggestions.length > 1 ? "s" : ""} noted ✓
              </p>
            )}
            <button onClick={onClose} style={{ padding:"12px 32px", background:`${activeColor}12`, border:`1px solid ${activeColor}28`, borderRadius:14, cursor:"pointer", color:activeColor, fontSize:13, fontFamily:"Georgia,serif", letterSpacing:2 }}>Return to Universe</button>
          </div>
        )}
      </div>
    </div>
  );
}
