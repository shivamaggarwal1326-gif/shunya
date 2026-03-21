import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

// ── Planet psychological DNA — used in AI prompt generation ──────────
const PLANET_PSYCHOLOGY = {
  aatma: {
    tone: "ancient, warm, revealing — like looking into a fire. Ask about existence, nature, warrior energy, ancient wisdom, connection to the earth.",
    avoid: "generic self-help language. Never ask 'what are your goals?'",
    depth: "Ask about BEING, not DOING. But also the warrior soul that BURNS.",
  },
  seesha: {
    tone: "sharp, reflective — like looking into a mirror you can't look away from. Ask about identity, versions, masks, honesty.",
    avoid: "generic self-help. Never ask 'what do you want to be?'",
    depth: "Ask about which version of them is speaking. The fracture between who they are and who they show.",
  },
  kaal: {
    tone: "wise, unhurried — like time itself speaking. Questions about past as knife, suffering as fuel.",
    avoid: "rushing. Kaal is patient.",
    depth: "Explore how pain transforms into power. The moment suffering becomes fuel.",
  },
  dharma: {
    tone: "clear, direct — like sunlight cutting through fog. Questions about calling vs. obligation.",
    avoid: "career advice. This is soul work, not LinkedIn.",
    depth: "Find what they know in silence but haven't admitted aloud.",
  },
  moksha: {
    tone: "spacious, free — like open sky. Questions about release, not achievement.",
    avoid: "pressure or urgency.",
    depth: "What are they ready to put down? What has already been released but not acknowledged?",
  },
  karma: {
    tone: "gentle but firm — like a trusted friend who says 'I love you, but hear this'. Hold up a mirror.",
    avoid: "judgment. Karma questions confront without crushing.",
    depth: "Patterns, accountability, the gap between values and actions.",
  },
  prema: {
    tone: "tender, safe — like a warm hand on a cold night. Never clinical.",
    avoid: "pushing too hard. Love wounds are deep.",
    depth: "Specific people, specific moments, specific feelings. Make vulnerability feel safe.",
  },
  maya: {
    tone: "sharp — like a scalpel, not a hammer. The detective who already knows the truth.",
    avoid: "judgment. Maya exposes contradictions gently.",
    depth: "What they say they want vs. what they actually chase. The masks they wear.",
  },
  rehesya: {
    tone: "mysterious, vast — like the universe itself asking. Questions that survive every answer.",
    avoid: "answers. Rehesya only asks.",
    depth: "The unanswerable. What lives below language.",
  },
};

// ── Hook: generate AI-powered personalized prompt ───────────────────
export function useAIPrompt(user, planet, ageGroup, enabled = true) {
  const [prompt, setPrompt] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || !planet || !enabled) return;
    generatePrompt();
  }, [user?.id, planet?.id, enabled]);

  const generatePrompt = async () => {
    if (!user || !planet) return;
    setLoading(true);

    try {
      // Fetch last 3 journal entries for this planet
      const { data: recentEntries } = await supabase
        .from("journal_entries")
        .select("content, created_at")
        .eq("user_id", user.id)
        .eq("planet_id", planet.id)
        .order("created_at", { ascending: false })
        .limit(3);

      const entryCount = recentEntries?.length || 0;
      const psychology = PLANET_PSYCHOLOGY[planet.id] || {};

      // Build the system prompt
      const systemPrompt = `You are the intelligence behind Shunya — a cosmic journaling universe built for deep reflection.
The user is on planet ${planet.name.toUpperCase()} (${planet.meaning}).

PLANET PSYCHOLOGY:
Tone: ${psychology.tone}
Avoid: ${psychology.avoid}
Depth: ${psychology.depth}

YOUR TASK:
Generate ONE deeply personal journal question.
- Under 25 words
- No preamble, no explanation — JUST the question
- Must feel like the planet itself is speaking
- Never generic — it must feel written for THIS person
- Do not start with "What" every time — vary the opening`;

      // Build the user context
      const lastEntries = recentEntries?.map(e =>
        e.content.slice(0, 200)
      ).join("\n---\n") || "";

      const userContext = entryCount === 0
        ? `This is their first time on this planet. Age group: ${ageGroup || "unknown"}. Ask a question that invites them in gently but with depth.`
        : `Age group: ${ageGroup || "unknown"}. They have ${entryCount} entries here. Their recent writing:\n${lastEntries}\n\nGenerate a question that goes DEEPER than what they've already written about.`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 100,
          system: systemPrompt,
          messages: [{ role: "user", content: userContext }],
        }),
      });

      const data = await response.json();
      const text = data.content?.[0]?.text?.trim();

      if (text) {
        // Clean up any quotes the model may have added
        setPrompt(text.replace(/^["']|["']$/g, ""));
      }
    } catch (err) {
      console.error("AI prompt generation failed:", err);
      // Silently fall through — caller will use static prompts as fallback
    }

    setLoading(false);
  };

  return { prompt, loading, regenerate: generatePrompt };
}
