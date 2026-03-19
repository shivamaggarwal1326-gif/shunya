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
  const [step, setStep] = useState(0); // 0=rating, 1=feedback, 2=suggestions, 3=done
  const [rating, setRating] = useState(null);
  const [text, setText] = useState("");
  const [category, setCategory] = useState("general");
  const [selectedSuggestions, setSelectedSuggestions] = useState([]);
  const [customSuggestion, setCustomSuggestion] = useState("");
  const [saving, setSaving] = useState(false);
  const [textFocused, setTextFocused] = useState(false);

  const MAX_CHARS = 500;

  const categories = [
    { id: "feeling", label: "How it feels" },
    { id: "feature", label: "Something missing" },
    { id: "bug", label: "Something broken" },
    { id: "general", label: "Just a thought" },
  ];

  const ratingLabels = ["", "Distant", "Uncertain", "Present", "Moved", "Transformed"];
  const ratingColors = ["", "#a78bfa", "#4ecdc4", "#f5a623", "#f093fb", "#ffd700"];
  const ratingSubtitles = ["", "Something felt off", "Not sure how I feel", "I was here, fully", "It moved something in me", "I am not the same"];

  const toggleSuggestion = (s) => {
    setSelectedSuggestions(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    );
  };

  const handleSubmit = async () => {
    setSaving(true);
    const allSuggestions = [
      ...selectedSuggestions,
      ...(customSuggestion.trim() ? [customSuggestion.trim()] : [])
    ];
    try {
      await supabase.from("feedback").insert({
        user_id: user?.id || null,
        rating,
        category,
        content: text.trim() || "(no text)",
        suggestions: allSuggestions.length > 0 ? allSuggestions : null,
        created_at: new Date().toISOString(),
      });
    } catch (err) {
      // Silent fail
    }
    setSaving(false);
    setStep(3);
  };

  const charCount = text.length;
  const charPercent = (charCount / MAX_CHARS) * 100;
  const charColor = charPercent > 90 ? "#ff6b6b" : charPercent > 70 ? "#f5a623" : "rgba(255,255,255,0.2)";

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(0,0,0,0.78)", backdropFilter: "blur(14px)",
      animation: "overlayIn 0.5s cubic-bezier(0.16,1,0.3,1)",
      padding: mobile ? "16px" : 0,
    }}>
      <div style={{
        width: mobile ? "100%" : 520,
        maxHeight: mobile ? "92vh" : "88vh",
        overflowY: "auto",
        background: "rgba(6,4,18,0.97)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 24,
        padding: mobile ? "32px 22px 28px" : "44px 40px",
        position: "relative",
        boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
      }}>

        {/* Close */}
        <button onClick={onClose} style={{
          position: "sticky", top: 0, float: "right",
          background: "none", border: "none",
          color: "rgba(255,255,255,0.25)", fontSize: 18,
          cursor: "pointer", lineHeight: 1, zIndex: 10,
          marginBottom: -24,
        }}>✕</button>

        {/* Progress dots */}
        {step < 3 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 28 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: i === step ? 22 : 7, height: 7, borderRadius: 4,
                background: i === step
                  ? (rating ? ratingColors[rating] : "#f5a623")
                  : i < step ? "rgba(245,166,35,0.25)" : "rgba(255,255,255,0.08)",
                transition: "all 0.35s ease",
                boxShadow: i === step && rating ? `0 0 8px ${ratingColors[rating]}55` : "none",
              }} />
            ))}
          </div>
        )}

        {/* ── STEP 0: Rating ── */}
        {step === 0 && (
          <>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <div style={{ color: "#f5a623", fontSize: 22, marginBottom: 14 }}>✦</div>
              <h2 style={{ color: "rgba(255,255,255,0.85)", fontSize: mobile ? 18 : 22, fontWeight: 300, letterSpacing: 4, fontFamily: "Georgia,serif", marginBottom: 8 }}>
                How did Shunya feel?
              </h2>
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, letterSpacing: 2, fontFamily: "Georgia,serif" }}>
                Be honest. This is sacred space.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[1,2,3,4,5].map(n => (
                <button key={n} onClick={() => { setRating(n); setStep(1); }} style={{
                  padding: "14px 20px",
                  background: "rgba(255,255,255,0.02)",
                  border: `1px solid rgba(255,255,255,0.07)`,
                  borderRadius: 14, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  transition: "all 0.2s",
                }}>
                  <div style={{ textAlign: "left" }}>
                    <span style={{ color: "rgba(255,255,255,0.75)", fontSize: 14, fontFamily: "Georgia,serif", letterSpacing: 1, display: "block" }}>
                      {ratingLabels[n]}
                    </span>
                    <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 10, fontFamily: "Georgia,serif", letterSpacing: 0.5 }}>
                      {ratingSubtitles[n]}
                    </span>
                  </div>
                  <span style={{ display: "flex", gap: 4 }}>
                    {Array.from({length: 5}).map((_,i) => (
                      <div key={i} style={{
                        width: 7, height: 7, borderRadius: "50%",
                        background: i < n ? ratingColors[n] : "rgba(255,255,255,0.08)",
                        boxShadow: i < n ? `0 0 4px ${ratingColors[n]}88` : "none",
                        transition: "all 0.2s",
                      }} />
                    ))}
                  </span>
                </button>
              ))}
            </div>
          </>
        )}

        {/* ── STEP 1: Feedback Box ── */}
        {step === 1 && (
          <>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{
                width: 10, height: 10, borderRadius: "50%",
                background: ratingColors[rating],
                margin: "0 auto 14px",
                boxShadow: `0 0 12px ${ratingColors[rating]}88`,
              }} />
              <h2 style={{ color: "rgba(255,255,255,0.85)", fontSize: mobile ? 17 : 21, fontWeight: 300, letterSpacing: 3, fontFamily: "Georgia,serif", marginBottom: 6 }}>
                Tell us more
              </h2>
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, letterSpacing: 1.5, fontFamily: "Georgia,serif" }}>
                Your words shape Shunya's future
              </p>
            </div>

            {/* Category chips */}
            <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
              {categories.map(c => (
                <button key={c.id} onClick={() => setCategory(c.id)} style={{
                  padding: "7px 14px",
                  background: category === c.id ? "rgba(245,166,35,0.12)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${category === c.id ? "rgba(245,166,35,0.3)" : "rgba(255,255,255,0.07)"}`,
                  borderRadius: 8, cursor: "pointer",
                  color: category === c.id ? "#f5a623" : "rgba(255,255,255,0.35)",
                  fontSize: 11, fontFamily: "Georgia,serif", letterSpacing: 1,
                  transition: "all 0.2s",
                }}>{c.label}</button>
              ))}
            </div>

            {/* ── THE FEEDBACK BOX ── */}
            <div style={{
              position: "relative",
              background: textFocused ? "rgba(245,166,35,0.03)" : "rgba(255,255,255,0.02)",
              border: `1px solid ${textFocused ? "rgba(245,166,35,0.25)" : "rgba(255,255,255,0.08)"}`,
              borderRadius: 16,
              transition: "all 0.3s ease",
              boxShadow: textFocused ? "0 0 20px rgba(245,166,35,0.06), inset 0 0 20px rgba(245,166,35,0.02)" : "none",
              marginBottom: 6,
            }}>
              {/* Label inside box */}
              <div style={{
                padding: "14px 18px 0",
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <div style={{
                  width: 5, height: 5, borderRadius: "50%",
                  background: ratingColors[rating],
                  boxShadow: `0 0 6px ${ratingColors[rating]}`,
                }} />
                <span style={{
                  color: "rgba(255,255,255,0.2)", fontSize: 9,
                  letterSpacing: 3, fontFamily: "Georgia,serif",
                  textTransform: "uppercase",
                }}>Your feedback</span>
              </div>

              <textarea
                value={text}
                onChange={e => { if (e.target.value.length <= MAX_CHARS) setText(e.target.value); }}
                onFocus={() => setTextFocused(true)}
                onBlur={() => setTextFocused(false)}
                placeholder="Write freely — there are no wrong answers here..."
                autoFocus
                style={{
                  width: "100%",
                  height: mobile ? 130 : 160,
                  padding: "12px 18px 14px",
                  background: "transparent",
                  border: "none",
                  color: "rgba(255,255,255,0.8)",
                  fontSize: mobile ? 14 : 15, lineHeight: 1.9,
                  resize: "none", outline: "none",
                  fontFamily: "Georgia,serif",
                  boxSizing: "border-box", letterSpacing: 0.3,
                }}
              />

              {/* Bottom bar — char count + progress */}
              <div style={{
                padding: "10px 18px",
                borderTop: "1px solid rgba(255,255,255,0.04)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                {/* Mini progress bar */}
                <div style={{ flex: 1, height: 2, background: "rgba(255,255,255,0.05)", borderRadius: 2, marginRight: 12 }}>
                  <div style={{
                    height: "100%", borderRadius: 2,
                    width: `${Math.min(charPercent, 100)}%`,
                    background: charColor,
                    transition: "width 0.2s ease, background 0.3s ease",
                  }} />
                </div>
                <span style={{
                  color: charColor, fontSize: 10,
                  fontFamily: "Georgia,serif", letterSpacing: 1,
                  transition: "color 0.3s",
                  minWidth: 48, textAlign: "right",
                }}>
                  {charCount} / {MAX_CHARS}
                </span>
              </div>
            </div>

            {/* Subtle hint */}
            {text.length === 0 && (
              <p style={{
                color: "rgba(255,255,255,0.12)", fontSize: 10,
                fontFamily: "Georgia,serif", letterSpacing: 1,
                marginBottom: 16, paddingLeft: 4,
                fontStyle: "italic",
              }}>Even one sentence matters.</p>
            )}
            {text.length > 0 && text.length < 20 && (
              <p style={{
                color: "rgba(255,255,255,0.15)", fontSize: 10,
                fontFamily: "Georgia,serif", letterSpacing: 1,
                marginBottom: 16, paddingLeft: 4,
                fontStyle: "italic",
              }}>Keep going...</p>
            )}
            {text.length >= 20 && (
              <p style={{
                color: `${ratingColors[rating]}55`, fontSize: 10,
                fontFamily: "Georgia,serif", letterSpacing: 1,
                marginBottom: 16, paddingLeft: 4,
              }}>✓ That's something real.</p>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
              <button onClick={() => setStep(0)} style={{
                flex: 1, padding: "13px",
                background: "transparent", border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 12, cursor: "pointer",
                color: "rgba(255,255,255,0.3)", fontSize: 13, fontFamily: "Georgia,serif",
              }}>← Back</button>
              <button onClick={() => setStep(2)} style={{
                flex: 2, padding: "13px",
                background: "linear-gradient(135deg, rgba(245,166,35,0.2), rgba(245,166,35,0.1))",
                border: "1px solid rgba(245,166,35,0.25)",
                borderRadius: 12, cursor: "pointer",
                color: "#f5a623", fontSize: 13, fontFamily: "Georgia,serif", letterSpacing: 1.5,
                transition: "all 0.3s",
              }}>Next → Suggestions</button>
            </div>
            <button onClick={handleSubmit} disabled={saving} style={{
              width: "100%", marginTop: 10, padding: "11px",
              background: "transparent", border: "none",
              cursor: "pointer",
              color: "rgba(255,255,255,0.18)", fontSize: 11, fontFamily: "Georgia,serif", letterSpacing: 1,
            }}>Skip suggestions & send</button>
          </>
        )}

        {/* ── STEP 2: Suggestions ── */}
        {step === 2 && (
          <>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ color: "#f5a623", fontSize: 20, marginBottom: 12 }}>✦</div>
              <h2 style={{ color: "rgba(255,255,255,0.8)", fontSize: mobile ? 17 : 20, fontWeight: 300, letterSpacing: 3, fontFamily: "Georgia,serif", marginBottom: 6 }}>
                What would make Shunya better?
              </h2>
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, letterSpacing: 1.5, fontFamily: "Georgia,serif" }}>
                Pick any that feel right. Add your own.
              </p>
            </div>

            {/* Suggestion chips */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
              {SUGGESTIONS.map(s => {
                const selected = selectedSuggestions.includes(s);
                return (
                  <button key={s} onClick={() => toggleSuggestion(s)} style={{
                    padding: "8px 14px",
                    background: selected ? "rgba(245,166,35,0.12)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${selected ? "rgba(245,166,35,0.35)" : "rgba(255,255,255,0.07)"}`,
                    borderRadius: 20, cursor: "pointer",
                    color: selected ? "#f5a623" : "rgba(255,255,255,0.4)",
                    fontSize: mobile ? 11 : 12,
                    fontFamily: "Georgia,serif",
                    transition: "all 0.18s",
                    textAlign: "left",
                  }}>{selected ? "✓ " : ""}{s}</button>
                );
              })}
            </div>

            {/* Custom suggestion input */}
            <input
              value={customSuggestion}
              onChange={e => setCustomSuggestion(e.target.value)}
              placeholder="Something else on your mind..."
              style={{
                width: "100%", padding: "14px 16px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12,
                color: "rgba(255,255,255,0.7)",
                fontSize: 13, outline: "none",
                fontFamily: "Georgia,serif", letterSpacing: 0.3,
                boxSizing: "border-box", marginBottom: 16,
              }}
            />

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setStep(1)} style={{
                flex: 1, padding: "13px",
                background: "transparent", border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 12, cursor: "pointer",
                color: "rgba(255,255,255,0.3)", fontSize: 13, fontFamily: "Georgia,serif",
              }}>← Back</button>
              <button onClick={handleSubmit} disabled={saving} style={{
                flex: 2, padding: "13px",
                background: "linear-gradient(135deg, #f5a623, #d4900e)",
                border: "none", borderRadius: 12, cursor: "pointer",
                color: "#000", fontSize: 13, fontWeight: 700,
                fontFamily: "Georgia,serif", letterSpacing: 1.5,
                transition: "all 0.3s", opacity: saving ? 0.6 : 1,
              }}>{saving ? "..." : "✦ Send"}</button>
            </div>
          </>
        )}

        {/* ── STEP 3: Done ── */}
        {step === 3 && (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <div style={{ color: "#f5a623", fontSize: 36, marginBottom: 20 }}>✦</div>
            <h2 style={{ color: "#f5a623", fontSize: mobile ? 20 : 24, fontWeight: 300, letterSpacing: 4, fontFamily: "Georgia,serif", marginBottom: 12 }}>
              Received
            </h2>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, lineHeight: 2, fontFamily: "Georgia,serif", maxWidth: 300, margin: "0 auto 28px" }}>
              Every word you share helps Shunya become more of what it was always meant to be.
            </p>
            {text.length > 0 && (
              <div style={{
                padding: "14px 20px", marginBottom: 20,
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: 14, maxWidth: 320, margin: "0 auto 20px",
              }}>
                <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 12, fontFamily: "Georgia,serif", fontStyle: "italic", lineHeight: 1.8 }}>
                  "{text.length > 80 ? text.substring(0, 80) + "..." : text}"
                </p>
              </div>
            )}
            {selectedSuggestions.length > 0 && (
              <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 11, letterSpacing: 1.5, marginBottom: 28, fontFamily: "Georgia,serif" }}>
                {selectedSuggestions.length} suggestion{selectedSuggestions.length > 1 ? "s" : ""} noted ✓
              </p>
            )}
            <button onClick={onClose} style={{
              padding: "12px 32px",
              background: "rgba(245,166,35,0.1)", border: "1px solid rgba(245,166,35,0.2)",
              borderRadius: 12, cursor: "pointer",
              color: "#f5a623", fontSize: 13, fontFamily: "Georgia,serif", letterSpacing: 2,
            }}>Return to Universe</button>
          </div>
        )}
      </div>
    </div>
  );
}
