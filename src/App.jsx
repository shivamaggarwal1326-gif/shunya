import { useEffect, useRef, useState } from "react";
import { supabase } from "./supabaseClient";
import AuthPage from "./AuthPage";

const PLANETS = [
  { id: "aatma", name: "AATMA", meaning: "The Soul · आत्मा", color: "#e07840", glow: "rgba(224,120,64,0.4)", baseSize: 16, baseOrbit: 150, speed: 0.0005,
    description: "Aatma is the eternal soul — the part of you that existed before your name, your wounds, and your achievements. It is not your personality. It is not your story. It is the awareness behind all of it.",
    howItLives: "When you sit in silence and feel something ancient — something that was here before your first memory — that is Aatma. Journal here when you want to speak from beyond identity." },
  { id: "pranaa", name: "PRANAA", meaning: "The Life Force · प्राण", color: "#4ecdc4", glow: "rgba(78,205,196,0.4)", baseSize: 14, baseOrbit: 280, speed: 0.0004,
    description: "Pranaa is the breath that moves through you — the invisible force that keeps you alive without asking permission. It is energy itself. Not the kind you drink coffee for. The kind that animates your entire being.",
    howItLives: "When you feel alive — truly, electrically alive — that is Pranaa. When you feel drained, disconnected, heavy — Pranaa is asking for attention. Journal here about your energy, your body, your aliveness." },
  { id: "kaal", name: "KAAL", meaning: "Time · काल", color: "#a78bfa", glow: "rgba(167,139,250,0.4)", baseSize: 18, baseOrbit: 390, speed: 0.00035,
    description: "Kaal is time — not the clock on your wall but the deeper rhythm that governs birth, death, seasons, and everything in between. Kaal does not rush. Kaal does not wait. It simply moves.",
    howItLives: "When you feel anxious about the future or trapped in the past — that is your relationship with Kaal. Journal here when time feels heavy, when you want to process what was or prepare for what is coming." },
  { id: "dharma", name: "DHARMA", meaning: "Purpose · धर्म", color: "#f093fb", glow: "rgba(240,147,251,0.4)", baseSize: 15, baseOrbit: 490, speed: 0.0003,
    description: "Dharma is your sacred duty — the thing you were put here to do. Not your job title. Not what society expects. The deep, quiet calling that only you can hear when everything else goes silent.",
    howItLives: "When you feel lost, purposeless, or stuck in a life that does not feel like yours — Dharma is calling. Journal here when you want to explore what you are truly meant to do." },
  { id: "moksha", name: "MOKSHA", meaning: "Liberation · मोक्ष", color: "#ffd700", glow: "rgba(255,215,0,0.4)", baseSize: 13, baseOrbit: 570, speed: 0.00025,
    description: "Moksha is the ultimate freedom — liberation from the cycles of suffering, attachment, and repetition. It is not an escape from life but a deeper entrance into it, free from chains.",
    howItLives: "When you want to send a message to your future self — when you want to set something free — Moksha is where you go. Messages here can be locked and revealed later." },
  { id: "karma", name: "KARMA", meaning: "Action · कर्म", color: "#ff6b6b", glow: "rgba(255,107,107,0.4)", baseSize: 16, baseOrbit: 650, speed: 0.0002,
    description: "Karma is not punishment. It is the simple truth that every action creates a ripple. What you do, what you say, what you think — it all echoes forward. Karma is the universe keeping a ledger.",
    howItLives: "When you feel guilt, pride, consequence, or the weight of choices — that is Karma speaking. Journal here to process your actions and their echoes." },
  { id: "prema", name: "PREMA", meaning: "Love · प्रेम", color: "#e8a0bf", glow: "rgba(232,160,191,0.4)", baseSize: 17, baseOrbit: 720, speed: 0.00015,
    description: "Prema is love — not the love sold in movies or reduced to Valentine's cards. It is the force that holds atoms together and makes strangers weep at sunsets. It is what you feel when words fail and the heart overflows.",
    howItLives: "When you ache for someone. When you are grateful for someone. When love has hurt you or healed you or both at once — that is Prema. Journal here about the people who have shaped your heart." },
  { id: "maya", name: "MAYA", meaning: "Illusion · माया", color: "#fd79a8", glow: "rgba(253,121,168,0.4)", baseSize: 12, baseOrbit: 780, speed: 0.00012,
    description: "Maya is the grand illusion — the veil that makes you believe the temporary is permanent, the material is everything, and the ego is who you truly are. Maya is not evil. It is the game.",
    howItLives: "When you catch yourself chasing something hollow, believing a lie you told yourself, or living someone else's life — that is Maya. Journal here to see through the illusion." }
];

// ─── 224 Age-Targeted Questions ───
const QUESTIONS = {
  aatma: {
    "16-22": ["When you are completely alone with no phone and no noise what do you feel","Who are you when nobody needs you to be anything","What do you believe about yourself that has nothing to do with what others think","What do you feel in your gut about who you actually are","If you could not define yourself by your interests or achievements who would you be","What part of you feels most real and most unseen at the same time","What do you know about yourself that you have never said out loud"],
    "23-30": ["Strip away your job your relationships your image — who are you underneath all of it","What do you come back to when everything else falls away","When do you feel most like yourself — not performing, not achieving, just being","What does your soul want that your life is not currently giving it","What would you think about all day if you had no responsibilities for a week","What do you know to be true about yourself that the world has not confirmed yet","Who are you becoming and do you recognise that person"],
    "31-45": ["What would you think about if you had nothing to distract you for an entire day","When did you last feel fully yourself — not a role, not a title, just you","What does your inner life look like compared to your outer life","What do you believe about who you are at your core","What part of yourself have you been neglecting to keep everything else running","What does your soul already know that your mind has been arguing with","Who are you when you are not being needed by anyone"],
    "45+": ["What are you finally ready to let go of","Who have you become and who did you always know you were","What does it feel like to be you right now — really","What have you learned about yourself that took a lifetime to understand","What is your soul trying to tell you in this season of your life","What do you know now about who you truly are that you could not have known at thirty","What does it mean to you to be at peace with yourself"]
  },
  pranaa: {
    "16-22": ["What are you doing when you completely forget to check your phone","When did you last feel so alive that you forgot to perform for anyone","What would you do every single day if energy was never an issue","What lights you up that you have been told is not practical","When did you last feel truly electric — what were you doing","What drains you that you keep saying yes to","If your body could speak right now what would it say it needs"],
    "23-30": ["When did you last feel genuinely excited about your own life","What are you doing when hours feel like minutes","What have you stopped doing that used to make you feel alive","What does your body know that your mind keeps overriding","When did you last feel fully present — not performing, not planning","What are you waiting for before you let yourself feel alive again","What would you do differently tomorrow if you trusted your energy"],
    "31-45": ["What part of yourself did you stop feeding because life got busy","When did you last do something purely because it felt good","What used to light you up that you have quietly abandoned","If you stripped away every obligation what would your body choose to do","What are you postponing until things calm down that may never calm down","When did you last feel like yourself — really yourself","What are you carrying that is costing you your aliveness"],
    "45+": ["What have you been saving yourself for that you keep postponing","When did you last feel so alive that time disappeared","What would you do every morning if nobody needed anything from you","What has your body been trying to tell you that you keep ignoring","What are you still waiting for permission to enjoy","If this were your last fully healthy year what would you do more of","What does being truly alive mean to you right now at this age"]
  },
  kaal: {
    "16-22": ["What are you waiting to become before you start actually living","What would you do this week if you knew you only had one year left","What are you putting off until you feel ready that you will never feel ready for","What are you doing with your time right now that you will not remember in ten years","What conversation are you avoiding that needs to happen soon","What would change if you treated today like it actually mattered","What are you waiting for that is already here if you looked for it"],
    "23-30": ["What conversation have you been postponing that needs to happen now","What are you doing in your thirties that you will regret in your forties","What have you been saying you will do someday that someday is never coming for","What would you do differently this month if you knew it was your last healthy one","What relationship are you neglecting because you assume there is still time","What does your calendar say about what you actually value versus what you say you value","What are you tolerating right now that is slowly costing you your life"],
    "31-45": ["If you found out you had one year left what would you immediately stop doing","What are you pretending still has time that does not","What would you do today if you finally accepted that time is not coming back","What have you been delaying for a more convenient moment that will not arrive","What does your use of time say about your actual priorities","What relationship deserves more of your time than you are currently giving it","What would you regret most if this year was your last healthy one"],
    "45+": ["What unlived life is still waiting inside you","What did you always mean to do that you have not done yet","What would you do in the time you have left if you stopped waiting","What are you still postponing that your body is telling you to do now","What conversation needs to happen before it is no longer possible","What part of your unlived life can still be lived if you start now","What does time mean to you now in a way it never did before"]
  },
  dharma: {
    "16-22": ["If marks money and approval did not exist what would you spend your days doing","What do you secretly think you are meant for that you have not told anyone","What would you pursue if failure was not embarrassing","What makes you angry about the world that you might be here to fix","If you could not fail what would you try","What do people ask you for help with that feels effortless to you","What would your life look like if you designed it yourself from scratch"],
    "23-30": ["Is the life you are building actually yours or did someone else design it for you","What would you do with your days if you had already proven yourself","When did you last feel like your work mattered beyond a paycheck","What are you good at that you have been undervaluing","What would you regret not trying if you looked back at thirty five","What does your gut say your purpose is even if your brain disagrees","What are you building that you actually want to live inside"],
    "31-45": ["When you are completely honest with yourself what do you know you are meant to do","What would you change about your work if you were not afraid of starting over","What legacy do you want to leave that you have not started building yet","When do you feel most useful — not busy, but genuinely useful","What would you do differently if you knew you had twenty good years left","What have you been tolerating in your work that you should have addressed years ago","If money was solved what would you spend your remaining years doing"],
    "45+": ["Looking back when were you most aligned with who you truly are","What work made you feel like yourself in a way nothing else has","What did you know you were meant to do that life interrupted","What wisdom have you earned that you have not yet passed on","What would your younger self say if they saw how you spend your days now","What is still unfinished in you that wants to be expressed","What would you do in whatever time remains if you let yourself be fully honest"]
  },
  moksha: {
    "16-22": ["What would you do tomorrow if you were not afraid of what anyone thought","What would your life look like if you stopped performing for everyone","What are you holding back about yourself because you are afraid of the reaction","What does freedom mean to you right now in your actual life","What would you say yes to if other people's opinions did not exist","What would you stop doing immediately if you gave yourself permission to stop","What would the freest version of you do differently starting tomorrow"],
    "23-30": ["What would your life look like if you stopped trying to prove something to someone","What are you chasing that is really just about earning someone's approval","What would you stop doing if you genuinely believed you were already enough","What does freedom actually look like for you in your real day to day life","What are you holding yourself back from because you do not think you deserve it yet","What would you do if you knew for certain that you were not going to be judged","What part of your life is a cage you built yourself and what would it take to open it"],
    "31-45": ["What does freedom actually mean to you and how far are you from it","What would you walk away from tomorrow if you trusted yourself completely","What are you staying in out of fear that you are calling responsibility","What would your life look like if you designed it purely around what makes you free","What have you been tolerating for so long that you have forgotten it is a choice","What would change if you gave yourself full permission to want what you actually want","What does the version of you that is truly free look like"],
    "45+": ["Have you given yourself permission to be happy yet and if not what are you waiting for","What would you finally allow yourself to enjoy if you stopped earning it first","What does liberation mean to you now that you have lived enough to know what matters","What are you still holding onto that it is time to put down","What would the rest of your life look like if you chose freedom over comfort","What do you want to feel in your final years that you are not feeling now","What would it mean to be truly free and what is one thing you could do today toward that"]
  },
  karma: {
    "16-22": ["What is something you did that you wish you could take back and why haven't you","Who did you hurt recently that you have not apologised to","What pattern keeps showing up in your friendships that comes from you","What are you doing right now that your future self will regret","What have you been blaming on others that is actually your responsibility","What would change in your life if you took full ownership of where you are","What are you doing with your time right now that you know is a waste"],
    "23-30": ["What pattern keeps showing up in your life that you know is coming from you","What are you repeatedly attracting that is a mirror of something inside you","What habit are you maintaining that contradicts everything you say you want","Who have you wronged that you have been avoiding thinking about","What would your life look like if you stopped repeating this pattern","What are you doing today that is creating the future you say you do not want","What is the one thing you know you need to stop that you keep not stopping"],
    "31-45": ["Who do you owe an apology to including yourself","What have you been doing for years that you know is not aligned with your values","What patterns from your parents have you unconsciously inherited","What does your track record say about what you actually prioritise","What would change if you fully forgave yourself for one specific thing","What are you still punishing yourself for that has already been long enough","What would you do differently if you genuinely believed you deserved good things"],
    "45+": ["What would you do differently if you could go back and can you still do it now","What have you carried for decades that was never yours to carry","Who in your life deserves more than they have received from you","What do you wish you had said to someone you can no longer say it to","What would forgiving yourself for one thing completely change right now","What pattern ends with you if you choose to end it","What do you want to make right before it is too late to make it right"]
  },
  prema: {
    "16-22": ["Who do you love right now that you have not told","What does love feel like in your body when it is real","What did love teach you that nothing else could have","Who made you feel seen for the first time and what did that change in you","What are you afraid to say to someone you care about","If you could send one honest message to someone tonight what would it say","What does love mean to you right now at this age and has it changed"],
    "23-30": ["Who have you loved the most and did they know the full depth of it","What have you learned about love that your younger self needed to hear","What are you looking for in love that you have not found yet","What pattern do you keep repeating in relationships and where did it start","Who do you miss right now that you pretend you do not","What does healthy love actually look like to you not what you were taught","What are you afraid love will cost you if you let it in completely"],
    "31-45": ["What has love cost you and was it worth it","Who in your life loves you in a way you have not fully received","What do you wish you had said to someone when you still had the chance","What does your partner or closest person need from you that you have been withholding","What did your parents teach you about love that you are still unlearning","When did you last feel truly loved not needed not wanted but loved","What would change in your closest relationship if you were fully honest for one day"],
    "45+": ["What is the greatest love story of your life and have you told it","Who loved you in a way you did not understand until much later","What do you know about love now that took you decades to learn","What love have you lost that still lives inside you","If you could say one thing to everyone you have ever loved what would it be","What does love ask of you at this stage of your life","What would you want the people you love most to know if you could not tell them tomorrow"]
  },
  maya: {
    "16-22": ["Who do you pretend to be around people whose approval you want","What do you post about yourself that is not really you","What do you believe about yourself that came from someone else's words","What would you do differently if nobody was watching your life","What are you afraid people would think if they knew the real you","What mask are you wearing so often you have almost forgotten it is a mask","What do you want that you are ashamed to admit you want"],
    "23-30": ["What belief about yourself are you carrying that was never actually yours","What version of yourself are you performing at work that is not really you","What do you want that you have been pretending you do not want","What story about your life have you been telling that is no longer true","What are you chasing that you secretly know will not make you feel complete","What would change if you stopped trying to be the person people expect","What are you hiding about yourself that would actually make people love you more"],
    "31-45": ["What are you chasing that you secretly know will not make you feel complete","What have you been performing for so long that you have forgotten who you are underneath","What do you own or pursue that is really about other people's perception of you","What would your life look like if you stopped keeping up appearances","What are you afraid would happen if people saw your actual life","What do you truly want that is different from what you have been telling yourself you want","What illusion about yourself are you finally ready to let go of"],
    "45+": ["What have you been telling yourself for years that you are finally ready to question","What image of yourself have you maintained that has cost you the most","What do you wish you had been more honest about earlier in your life","What have you been pretending is fine that has never actually been fine","What would you stop doing tomorrow if you no longer cared what anyone thought","What truth about yourself have you been avoiding that is actually freeing","What mask can you finally take off now that you have earned the right to be real"]
  }
};

// Get questions for a planet based on age group
function getQuestionsForPlanet(planetId, ageGroup) {
  const planetQs = QUESTIONS[planetId];
  if (!planetQs) return ["What is on your mind today?"];
  if (ageGroup && planetQs[ageGroup]) return planetQs[ageGroup];
  // Fallback: merge all age groups if no age set
  return Object.values(planetQs).flat();
}

const SUN_BASE_SIZE = 38;

export default function App() {
  const canvasRef = useRef(null);
  const [user, setUser] = useState(null);
  const [anonymousName, setAnonymousName] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [journalOpen, setJournalOpen] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [ageGroup, setAgeGroup] = useState(null);
  const [showAgePrompt, setShowAgePrompt] = useState(false);
  const [futureRevealDate, setFutureRevealDate] = useState(null);
  const [rocketLaunching, setRocketLaunching] = useState(false);
  const promptHistoryRef = useRef({}); // tracks last prompt index per planet
  const [journalText, setJournalText] = useState("");
  const [saving, setSaving] = useState(false);
  const [moonCounts, setMoonCounts] = useState({});
  const [sunSize, setSunSize] = useState(SUN_BASE_SIZE);
  const [starsCollected, setStarsCollected] = useState(0);
  const starsRef = useRef(0);
  const [cursorBlink, setCursorBlink] = useState(false);
  const [pastEntries, setPastEntries] = useState([]);
  const [showPastEntries, setShowPastEntries] = useState(false);
  const [selectedMoonEntry, setSelectedMoonEntry] = useState(null);
  const [dharmaTodos, setDharmaTodos] = useState([]);
  const [showDharmaTodos, setShowDharmaTodos] = useState(false);
  const [newTodoText, setNewTodoText] = useState("");
  const [newTodoPriority, setNewTodoPriority] = useState("medium");
  const [mobile, setMobile] = useState(window.innerWidth < 768);
  const getScale = () => { const w = window.innerWidth; return w < 768 ? w / 900 : Math.min(w, window.innerHeight) / 900; };
  const scaleRef = useRef(getScale());
  const animFrameRef = useRef(null);
  const shootingStarsRef = useRef([]);
  const mergingMoons = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const timeRef = useRef(0);

  useEffect(() => {
    const h = () => { setMobile(window.innerWidth < 768); scaleRef.current = getScale(); };
    window.addEventListener("resize", h); return () => window.removeEventListener("resize", h);
  }, []);

  // Disable pinch zoom
  useEffect(() => {
    const meta = document.querySelector('meta[name="viewport"]');
    if (meta) meta.setAttribute("content", "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no");
    else {
      const m = document.createElement("meta"); m.name = "viewport";
      m.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no";
      document.head.appendChild(m);
    }
    // Prevent zoom gestures
    const preventZoom = (e) => { if (e.touches && e.touches.length > 1) e.preventDefault(); };
    document.addEventListener("touchmove", preventZoom, { passive: false });
    return () => document.removeEventListener("touchmove", preventZoom);
  }, []);

  // Track if we're in the middle of signup onboarding
  const onboardingInProgress = useRef(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user && !onboardingInProgress.current) loadUserData(session.user); else setCheckingAuth(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) { setUser(null); setAnonymousName(""); }
      // Don't auto-login during onboarding
      if (session?.user && !onboardingInProgress.current && !user) {
        loadUserData(session.user);
      }
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const loadUserData = async (authUser) => {
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", authUser.id).single();
    if (profile) { setAnonymousName(profile.anonymous_name); setSunSize(SUN_BASE_SIZE * profile.sun_size); setStarsCollected(profile.stars_collected); starsRef.current = profile.stars_collected; if (profile.age_group) setAgeGroup(profile.age_group); }
    const { data: moons } = await supabase.from("moon_progress").select("*").eq("user_id", authUser.id);
    if (moons) { const c = {}; moons.forEach((m) => (c[m.planet_id] = m.moon_count)); setMoonCounts(c); }
    setUser(authUser); setCheckingAuth(false);
  };

  const handleAuth = (u, n) => { onboardingInProgress.current = false; setUser(u); setAnonymousName(n); loadUserData(u); };
  const handleLogout = async () => { await supabase.auth.signOut(); setUser(null); setAnonymousName(""); setMoonCounts({}); setSunSize(SUN_BASE_SIZE); setStarsCollected(0); starsRef.current = 0; };

  const saveJournalEntry = async () => {
    if (!journalText.trim() || !selectedPlanet || !user) return;
    setSaving(true);
    const { error } = await supabase.from("journal_entries").insert({ user_id: user.id, planet_id: selectedPlanet.id, content: journalText });
    if (error) { alert("Failed to save: " + error.message); setSaving(false); return; }
    const cur = moonCounts[selectedPlanet.id] || 0; const next = cur + 1;
    await supabase.from("moon_progress").update({ moon_count: next >= 10 ? 0 : next }).eq("user_id", user.id).eq("planet_id", selectedPlanet.id);
    if (next >= 10) {
      // Spawn merge animation — moons fly toward the sun
      const w = window.innerWidth; const h = window.innerHeight;
      const sunCx = w < 768 ? w / 2 : w * 0.55;
      const sunCy = h / 2;
      const scale = scaleRef.current;
      const eR = w < 768 ? 0.85 : 0.4;
      const t = timeRef.current;
      const pAngle = t * selectedPlanet.speed;
      const pOrbit = selectedPlanet.baseOrbit * scale;
      const planetX = sunCx + Math.cos(pAngle) * pOrbit;
      const planetY = sunCy + Math.sin(pAngle) * pOrbit * eR;
      const pSize = Math.max(selectedPlanet.baseSize * scale, 10);

      // Create 10 moon particles at different positions around the planet
      for (let i = 0; i < 10; i++) {
        const moonAngle = (i * Math.PI * 2) / 10;
        const moonDist = pSize + 10 + i * 3;
        mergingMoons.current.push({
          startX: planetX + Math.cos(moonAngle) * moonDist,
          startY: planetY + Math.sin(moonAngle) * moonDist * 0.6,
          progress: -i * 0.06, // stagger the start so they don't all fly at once
        });
      }

      const mult = (sunSize / SUN_BASE_SIZE) + 0.1;
      const { data: pd } = await supabase.from("profiles").select("total_merges").eq("id", user.id).single();
      await supabase.from("profiles").update({ sun_size: mult, total_merges: (pd?.total_merges || 0) + 1 }).eq("id", user.id);
      // Delay the sun growth so it happens AFTER moons arrive
      setTimeout(() => {
        setSunSize(SUN_BASE_SIZE * mult);
      }, 1200);
      setMoonCounts((p) => ({ ...p, [selectedPlanet.id]: 0 }));
    } else { setMoonCounts((p) => ({ ...p, [selectedPlanet.id]: next })); }
    setJournalText(""); setSaving(false);
    // Auto-return to solar system so user sees the moon + merge animation
    setJournalOpen(false);
    setSelectedPlanet(null);
    setFutureRevealDate(null);
  };

  const saveFutureMessage = async (months) => {
    if (!journalText.trim() || !selectedPlanet || !user) return;
    setSaving(true);

    // Launch rocket animation first
    setRocketLaunching(true);

    // Save in background while rocket flies
    const revealDate = new Date();
    revealDate.setMonth(revealDate.getMonth() + months);
    const { error } = await supabase.from("journal_entries").insert({
      user_id: user.id, planet_id: "moksha", content: journalText, reveal_at: revealDate.toISOString()
    });
    if (error) { alert("Failed to save: " + error.message); setSaving(false); setRocketLaunching(false); return; }

    const cur = moonCounts["moksha"] || 0; const next = cur + 1;
    await supabase.from("moon_progress").update({ moon_count: next >= 10 ? 0 : next }).eq("user_id", user.id).eq("planet_id", "moksha");
    if (next >= 10) {
      const w = window.innerWidth; const h = window.innerHeight;
      const sunCx = w < 768 ? w / 2 : w * 0.55; const sunCy = h / 2;
      const scale = scaleRef.current; const eR = w < 768 ? 0.85 : 0.4;
      const mokshaPlanet = PLANETS.find(p => p.id === "moksha");
      const t = timeRef.current;
      const pAngle = t * mokshaPlanet.speed; const pOrbit = mokshaPlanet.baseOrbit * scale;
      const planetX = sunCx + Math.cos(pAngle) * pOrbit; const planetY = sunCy + Math.sin(pAngle) * pOrbit * eR;
      const pSize = Math.max(mokshaPlanet.baseSize * scale, 10);
      for (let i = 0; i < 10; i++) {
        const moonAngle = (i * Math.PI * 2) / 10; const moonDist = pSize + 10 + i * 3;
        mergingMoons.current.push({ startX: planetX + Math.cos(moonAngle) * moonDist, startY: planetY + Math.sin(moonAngle) * moonDist * 0.6, progress: -i * 0.06 });
      }
      const mult = (sunSize / SUN_BASE_SIZE) + 0.1;
      const { data: pd } = await supabase.from("profiles").select("total_merges").eq("id", user.id).single();
      await supabase.from("profiles").update({ sun_size: mult, total_merges: (pd?.total_merges || 0) + 1 }).eq("id", user.id);
      setTimeout(() => setSunSize(SUN_BASE_SIZE * mult), 1200);
      setMoonCounts((p) => ({ ...p, moksha: 0 }));
    } else { setMoonCounts((p) => ({ ...p, moksha: next })); }

    // Wait for rocket animation to finish, then exit
    setTimeout(() => {
      setRocketLaunching(false);
      setJournalText(""); setSaving(false); setFutureRevealDate(null);
      setJournalOpen(false); setSelectedPlanet(null);
    }, 2800);
  };

  const loadPastEntries = async (pid) => {
    const { data } = await supabase.from("journal_entries").select("*").eq("user_id", user.id).eq("planet_id", pid).order("created_at", { ascending: false });
    setPastEntries(data || []); setShowPastEntries(true);
  };

  const collectStar = async () => {
    starsRef.current += 1;
    const n = starsRef.current;
    setStarsCollected(n);
    setCursorBlink(true);
    setTimeout(() => setCursorBlink(false), 400);
    await supabase.from("profiles").update({ stars_collected: n }).eq("id", user.id);
  };

  // ─── Dharma To-Do Functions ───
  const loadDharmaTodos = async () => {
    const { data } = await supabase.from("dharma_todos").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setDharmaTodos(data || []);
    setShowDharmaTodos(true);
  };

  const addDharmaTodo = async () => {
    if (!newTodoText.trim() || !user) return;
    const { data, error } = await supabase.from("dharma_todos").insert({
      user_id: user.id, content: newTodoText, priority: newTodoPriority,
    }).select().single();
    if (error) { alert("Failed: " + error.message); return; }
    setDharmaTodos((prev) => [data, ...prev]);
    setNewTodoText(""); setNewTodoPriority("medium");
  };

  const toggleDharmaTodo = async (id, completed) => {
    await supabase.from("dharma_todos").update({
      completed: !completed, completed_at: !completed ? new Date().toISOString() : null
    }).eq("id", id);
    setDharmaTodos((prev) => prev.map((t) => t.id === id ? { ...t, completed: !completed, completed_at: !completed ? new Date().toISOString() : null } : t));
  };

  const deleteDharmaTodo = async (id) => {
    await supabase.from("dharma_todos").delete().eq("id", id);
    setDharmaTodos((prev) => prev.filter((t) => t.id !== id));
  };

  // ─── Canvas Animation ───
  useEffect(() => {
    if (!user) return;
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.scale(dpr, dpr);
      scaleRef.current = getScale();
    };
    resize(); window.addEventListener("resize", resize);

    // Cursor trail particles
    const cursorTrail = [];

    const bgStars = Array.from({ length: 200 }, () => ({
      x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight,
      r: Math.random() * 1.5 + 0.5, twinkle: Math.random() * Math.PI * 2, speed: Math.random() * 0.02 + 0.01,
    }));

    const spawnShootingStar = () => {
      shootingStarsRef.current.push({ x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight * 0.5,
        vx: (Math.random() - 0.3) * 6, vy: Math.random() * 3 + 2, life: 1, size: Math.random() * 2 + 1, caught: false, slowing: false });
    };
    const shootingInterval = setInterval(spawnShootingStar, 3000);

    // Smooth cursor position (the actual cursor lerps toward this)
    const cursorTarget = { x: 0, y: 0 };
    const cursorSmooth = { x: 0, y: 0 };
    let lastFrameTime = performance.now();

    const handleMouse = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      cursorTarget.x = e.clientX;
      cursorTarget.y = e.clientY;
    };
    const handleTouchMove = (e) => {
      if (e.touches.length > 0) {
        mouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        cursorTarget.x = e.touches[0].clientX;
        cursorTarget.y = e.touches[0].clientY;
      }
    };
    window.addEventListener("mousemove", handleMouse);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    const handleInteraction = (mx, my) => {
      const w = window.innerWidth; const h = window.innerHeight;
      const cx = w < 768 ? w / 2 : w * 0.55; const cy = h / 2; const scale = scaleRef.current;
      const eR = w < 768 ? 0.85 : 0.4;
      shootingStarsRef.current.forEach((star) => { const d = Math.hypot(star.x - mx, star.y - my); if (d < 50) { star.caught = true; collectStar(); } });
      const t = timeRef.current;
      PLANETS.forEach((planet) => {
        const angle = t * planet.speed; const orbit = planet.baseOrbit * scale;
        const size = Math.max(planet.baseSize * scale, 12);
        const px = cx + Math.cos(angle) * orbit; const py = cy + Math.sin(angle) * orbit * eR;
        const dist = Math.hypot(px - mx, py - my);
        const hitR = w < 768 ? Math.max(size + 22, 32) : size + 15;
        if (dist < hitR) {
          setSelectedPlanet(planet); setJournalOpen(false); setShowPastEntries(false); setSelectedMoonEntry(null);
          // Auto-load past entries for moon display
          supabase.from("journal_entries").select("*").eq("user_id", user.id).eq("planet_id", planet.id).order("created_at", { ascending: false }).then(({ data }) => {
            setPastEntries(data || []);
          });
        }
      });
    };

    const handleClick = (e) => handleInteraction(e.clientX, e.clientY);
    const handleTap = (e) => { if (e.touches.length > 0) { e.preventDefault(); handleInteraction(e.touches[0].clientX, e.touches[0].clientY); } };
    canvas.addEventListener("click", handleClick);
    canvas.addEventListener("touchstart", handleTap, { passive: false });

    const render = (now) => {
      const dt = Math.min(now - lastFrameTime, 50); // cap at 50ms to avoid jumps
      lastFrameTime = now;
      const w = window.innerWidth; const h = window.innerHeight;
      // Offset sun to the right on desktop so outer planets orbit through the left edge
      const cx = w < 768 ? w / 2 : w * 0.55;
      const cy = h / 2;
      const scale = scaleRef.current; const eR = w < 768 ? 0.85 : 0.4;
      timeRef.current += dt;

      // Smooth cursor interpolation (lerp)
      cursorSmooth.x += (cursorTarget.x - cursorSmooth.x) * 0.35;
      cursorSmooth.y += (cursorTarget.y - cursorSmooth.y) * 0.35;
      const cursorEl = document.getElementById("shunya-cursor");
      if (cursorEl) { cursorEl.style.left = cursorSmooth.x + "px"; cursorEl.style.top = cursorSmooth.y + "px"; }

      // Spawn trail particles in render loop for consistent spacing
      if (Math.abs(cursorTarget.x - (cursorTrail.length > 0 ? cursorTrail[cursorTrail.length - 1].x : 0)) > 5 ||
          Math.abs(cursorTarget.y - (cursorTrail.length > 0 ? cursorTrail[cursorTrail.length - 1].y : 0)) > 5) {
        cursorTrail.push({ x: cursorSmooth.x, y: cursorSmooth.y, life: 1, size: Math.random() * 5 + 3 });
        if (cursorTrail.length > 15) cursorTrail.shift();
      }

      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // ─── Deep space background with nebula ───
      ctx.fillStyle = "#05020e"; ctx.fillRect(0, 0, w, h);

      // Nebula clouds (static positioned, visible)
      const drawNebula = (nx, ny, radius, r, g, b, alpha) => {
        const nb = ctx.createRadialGradient(nx, ny, 0, nx, ny, radius);
        nb.addColorStop(0, `rgba(${r},${g},${b},${alpha})`);
        nb.addColorStop(0.4, `rgba(${r},${g},${b},${alpha * 0.4})`);
        nb.addColorStop(1, "transparent");
        ctx.fillStyle = nb;
        ctx.fillRect(nx - radius, ny - radius, radius * 2, radius * 2);
      };
      // Purple nebula clusters — key clouds only for performance
      drawNebula(w * 0.12, h * 0.18, w * 0.35, 88, 28, 135, 0.14);
      drawNebula(w * 0.85, h * 0.72, w * 0.3, 67, 20, 110, 0.12);
      drawNebula(w * 0.5, h * 0.88, w * 0.35, 100, 40, 150, 0.1);
      // Blue-purple wisps
      drawNebula(w * 0.72, h * 0.12, w * 0.25, 40, 50, 120, 0.12);
      // Warm accent near sun
      drawNebula(cx, cy, w * 0.18, 120, 60, 20, 0.08);

      bgStars.forEach((s) => { s.twinkle += s.speed; const a = 0.3 + Math.sin(s.twinkle) * 0.3; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fillStyle = `rgba(255,255,255,${a})`; ctx.fill(); });

      const t_orb = timeRef.current;
      PLANETS.forEach((p) => {
        const o = p.baseOrbit * scale;
        const planetAngle = t_orb * p.speed;

        // Base orbit — white, subtle
        ctx.beginPath(); ctx.ellipse(cx, cy, o, o * eR, 0, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255,255,255,0.06)";
        ctx.lineWidth = 1; ctx.stroke();

        // Color glow arc that follows the planet — draw a gradient arc around planet's position
        const arcSpread = 0.8; // how far the color spreads along the orbit (in radians)
        const segments = 40;
        for (let s = 0; s < segments; s++) {
          const segAngle = planetAngle - arcSpread / 2 + (s / segments) * arcSpread;
          const nextAngle = planetAngle - arcSpread / 2 + ((s + 1) / segments) * arcSpread;
          const distFromCenter = Math.abs((s / segments) - 0.5) * 2; // 0 at planet, 1 at edges
          const alpha = (1 - distFromCenter * distFromCenter) * 0.35; // fade at edges

          const x1 = cx + Math.cos(segAngle) * o;
          const y1 = cy + Math.sin(segAngle) * o * eR;
          const x2 = cx + Math.cos(nextAngle) * o;
          const y2 = cy + Math.sin(nextAngle) * o * eR;

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.strokeStyle = p.color + Math.round(alpha * 255).toString(16).padStart(2, '0');
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Bright spot right at planet position on orbit
        const brightX = cx + Math.cos(planetAngle) * o;
        const brightY = cy + Math.sin(planetAngle) * o * eR;
        const brightGlow = ctx.createRadialGradient(brightX, brightY, 0, brightX, brightY, 12);
        brightGlow.addColorStop(0, p.color + "40");
        brightGlow.addColorStop(1, "transparent");
        ctx.fillStyle = brightGlow;
        ctx.fillRect(brightX - 12, brightY - 12, 24, 24);
      });

      const csz = sunSize * scale;
      const t = timeRef.current;

      // ─── FIERY SUN ───
      // Corona / outer fire halo (flickering)
      for (let f = 0; f < 5; f++) {
        const flareAngle = t * 0.0003 + f * Math.PI * 0.4;
        const flareLen = csz * (1.8 + Math.sin(t * 0.002 + f * 2.5) * 0.6);
        const flareWidth = csz * (0.3 + Math.sin(t * 0.003 + f * 1.7) * 0.15);
        const fx = cx + Math.cos(flareAngle) * csz * 0.5;
        const fy = cy + Math.sin(flareAngle) * csz * 0.5;
        const fg = ctx.createRadialGradient(fx, fy, 0, fx, fy, flareLen);
        fg.addColorStop(0, `rgba(255,200,50,${0.15 + Math.sin(t * 0.004 + f) * 0.08})`);
        fg.addColorStop(0.5, `rgba(255,120,20,${0.06 + Math.sin(t * 0.003 + f) * 0.03})`);
        fg.addColorStop(1, "transparent");
        ctx.fillStyle = fg;
        ctx.fillRect(fx - flareLen, fy - flareLen, flareLen * 2, flareLen * 2);
      }

      // Outer glow
      const sg = ctx.createRadialGradient(cx, cy, csz * 0.5, cx, cy, csz * 3.5);
      sg.addColorStop(0, "rgba(255,180,50,0.5)");
      sg.addColorStop(0.3, "rgba(255,120,20,0.15)");
      sg.addColorStop(0.6, "rgba(255,80,10,0.05)");
      sg.addColorStop(1, "transparent");
      ctx.fillStyle = sg; ctx.fillRect(cx - csz * 3.5, cy - csz * 3.5, csz * 7, csz * 7);

      // Sun body - base
      const sg2 = ctx.createRadialGradient(cx, cy, 0, cx, cy, csz);
      sg2.addColorStop(0, "#fffde8");
      sg2.addColorStop(0.25, "#ffe66d");
      sg2.addColorStop(0.5, "#f5a623");
      sg2.addColorStop(0.75, "#e8762d");
      sg2.addColorStop(1, "#c0501a");
      ctx.beginPath(); ctx.arc(cx, cy, csz, 0, Math.PI * 2); ctx.fillStyle = sg2; ctx.fill();

      // Animated plasma surface (rotating bright spots)
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, csz, 0, Math.PI * 2); ctx.clip();
      for (let s = 0; s < 8; s++) {
        const spotAngle = t * 0.0006 + s * Math.PI * 0.25;
        const spotR = csz * (0.15 + Math.sin(t * 0.002 + s * 3) * 0.08);
        const spotDist = csz * (0.3 + Math.sin(t * 0.001 + s * 1.5) * 0.25);
        const sx = cx + Math.cos(spotAngle) * spotDist;
        const sy = cy + Math.sin(spotAngle) * spotDist;
        const spotG = ctx.createRadialGradient(sx, sy, 0, sx, sy, spotR);
        spotG.addColorStop(0, `rgba(255,255,220,${0.3 + Math.sin(t * 0.003 + s) * 0.15})`);
        spotG.addColorStop(0.5, `rgba(255,200,80,${0.1 + Math.sin(t * 0.002 + s) * 0.05})`);
        spotG.addColorStop(1, "transparent");
        ctx.fillStyle = spotG;
        ctx.fillRect(sx - spotR, sy - spotR, spotR * 2, spotR * 2);
      }
      ctx.restore();

      // Specular highlight on sun
      const sunHL = ctx.createRadialGradient(cx - csz * 0.25, cy - csz * 0.25, 0, cx, cy, csz * 0.7);
      sunHL.addColorStop(0, "rgba(255,255,255,0.2)"); sunHL.addColorStop(1, "transparent");
      ctx.beginPath(); ctx.arc(cx, cy, csz, 0, Math.PI * 2); ctx.fillStyle = sunHL; ctx.fill();

      // Sun label
      ctx.fillStyle = "rgba(245,166,35,0.8)"; ctx.font = `${Math.max(9, 11 * scale)}px Georgia`; ctx.textAlign = "center";
      ctx.fillText("SHUNYA", cx, cy + csz + 18);

      // ─── MOON MERGE ANIMATION ───
      mergingMoons.current = mergingMoons.current.filter((m) => {
        m.progress += 0.012;
        if (m.progress >= 1) return false;
        const ease = 1 - Math.pow(1 - m.progress, 3); // ease-out cubic
        const mx = m.startX + (cx - m.startX) * ease;
        const my = m.startY + (cy - m.startY) * ease;
        const mSize = (1 - ease) * 3 + 1;
        const mAlpha = 1 - ease * 0.7;
        // Trail
        const trG = ctx.createRadialGradient(mx, my, 0, mx, my, mSize * 4);
        trG.addColorStop(0, `rgba(255,200,50,${mAlpha * 0.4})`); trG.addColorStop(1, "transparent");
        ctx.fillStyle = trG; ctx.fillRect(mx - mSize * 4, my - mSize * 4, mSize * 8, mSize * 8);
        // Moon body
        ctx.beginPath(); ctx.arc(mx, my, mSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${mAlpha})`; ctx.fill();
        return true;
      });
      PLANETS.forEach((p) => {
        const angle = t * p.speed; const orbit = p.baseOrbit * scale; const size = Math.max(p.baseSize * scale, w < 768 ? 14 : 10);
        const px = cx + Math.cos(angle) * orbit; const py = cy + Math.sin(angle) * orbit * eR;
        const pulseSize = size * (1 + Math.sin(t * 0.001 + p.baseOrbit) * 0.06);
        const glowRadius = pulseSize * (3.5 + Math.sin(t * 0.0015 + p.baseOrbit) * 1);

        // Rotation angle for this planet (each spins at different speed)
        const spinSpeed = 0.0008 + p.baseOrbit * 0.0000005;
        const spinAngle = t * spinSpeed;
        const hlOffsetX = Math.cos(spinAngle) * size * 0.3;
        const hlOffsetY = Math.sin(spinAngle) * size * 0.15; // flatter because we see it from above

        // Outer glow
        const gl = ctx.createRadialGradient(px, py, 0, px, py, glowRadius);
        gl.addColorStop(0, p.glow); gl.addColorStop(0.5, p.glow.replace("0.4", "0.08")); gl.addColorStop(1, "transparent");
        ctx.fillStyle = gl; ctx.fillRect(px - glowRadius, py - glowRadius, glowRadius * 2, glowRadius * 2);

        // Shadow underneath
        ctx.beginPath(); ctx.ellipse(px + 2, py + size + 4, size * 0.7, size * 0.15, 0, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,0,0,0.25)"; ctx.fill();

        // Planet base body (darker side)
        const darkSide = ctx.createRadialGradient(px + hlOffsetX * 0.5, py + hlOffsetY * 0.5, size * 0.3, px, py, pulseSize);
        darkSide.addColorStop(0, p.color); darkSide.addColorStop(1, p.color + "55");
        ctx.beginPath(); ctx.arc(px, py, pulseSize, 0, Math.PI * 2); ctx.fillStyle = darkSide; ctx.fill();

        // Terminator line effect (day/night boundary that rotates)
        ctx.save();
        ctx.beginPath(); ctx.arc(px, py, pulseSize, 0, Math.PI * 2); ctx.clip();
        const termX = px + hlOffsetX * 2;
        const termGrad = ctx.createLinearGradient(termX - size, py, termX + size, py);
        termGrad.addColorStop(0, "rgba(0,0,0,0.25)");
        termGrad.addColorStop(0.45, "rgba(0,0,0,0.08)");
        termGrad.addColorStop(0.55, "transparent");
        termGrad.addColorStop(1, "transparent");
        ctx.fillStyle = termGrad;
        ctx.fillRect(px - pulseSize, py - pulseSize, pulseSize * 2, pulseSize * 2);
        ctx.restore();

        // Specular highlight (moves with rotation)
        const specX = px - hlOffsetX * 0.8;
        const specY = py - size * 0.25 + hlOffsetY * 0.5;
        const hl = ctx.createRadialGradient(specX, specY, 0, specX, specY, size * 0.7);
        hl.addColorStop(0, "rgba(255,255,255,0.4)");
        hl.addColorStop(0.3, "rgba(255,255,255,0.12)");
        hl.addColorStop(1, "transparent");
        ctx.beginPath(); ctx.arc(px, py, pulseSize, 0, Math.PI * 2); ctx.fillStyle = hl; ctx.fill();

        // Subtle equator band (surface detail)
        ctx.save();
        ctx.beginPath(); ctx.arc(px, py, pulseSize, 0, Math.PI * 2); ctx.clip();
        ctx.beginPath(); ctx.ellipse(px, py, pulseSize * 0.95, pulseSize * 0.12, spinAngle * 0.3, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,255,255,0.06)`;
        ctx.lineWidth = 1; ctx.stroke();
        ctx.restore();

        // Rim light (atmosphere edge glow)
        const rim = ctx.createRadialGradient(px, py, pulseSize * 0.85, px, py, pulseSize * 1.05);
        rim.addColorStop(0, "transparent");
        rim.addColorStop(0.7, p.color + "15");
        rim.addColorStop(1, p.color + "08");
        ctx.beginPath(); ctx.arc(px, py, pulseSize * 1.05, 0, Math.PI * 2); ctx.fillStyle = rim; ctx.fill();

        // Planet name — colored to match planet
        ctx.fillStyle = p.color; ctx.font = `${Math.max(8, 10 * scale)}px Georgia`; ctx.textAlign = "center";
        ctx.globalAlpha = 0.8; ctx.fillText(p.name, px, py + size + 16); ctx.globalAlpha = 1.0;

        const mc = moonCounts[p.id] || 0;
        for (let i = 0; i < mc; i++) {
          const ma = t * 0.002 + (i * Math.PI * 2) / Math.max(mc, 1); const md = size + 10 + i * 3;
          const mmx = px + Math.cos(ma) * md; const mmy = py + Math.sin(ma) * md * 0.6;
          // Moon glow
          const mg = ctx.createRadialGradient(mmx, mmy, 0, mmx, mmy, Math.max(3, 5 * scale));
          mg.addColorStop(0, "rgba(255,255,255,0.5)"); mg.addColorStop(1, "transparent");
          ctx.fillStyle = mg; ctx.fillRect(mmx - 5 * scale, mmy - 5 * scale, 10 * scale, 10 * scale);
          ctx.beginPath(); ctx.arc(mmx, mmy, Math.max(1.5, 2.5 * scale), 0, Math.PI * 2); ctx.fillStyle = "rgba(255,255,255,0.8)"; ctx.fill();
        }
      });

      const mouse = mouseRef.current;
      shootingStarsRef.current = shootingStarsRef.current.filter((s) => {
        if (s.caught) return false;
        const dist = Math.hypot(s.x - mouse.x, s.y - mouse.y);
        s.slowing = dist < 140;

        if (s.slowing) {
          // Gravitational pull toward cursor (black hole effect)
          const pullStrength = Math.max(0, 1 - dist / 140) * 1.5;
          const angle = Math.atan2(mouse.y - s.y, mouse.x - s.x);
          s.vx += Math.cos(angle) * pullStrength;
          s.vy += Math.sin(angle) * pullStrength;
          // Slow down
          s.vx *= 0.95;
          s.vy *= 0.95;
        }

        s.x += s.vx; s.y += s.vy;
        s.life -= s.slowing ? 0.001 : 0.008;
        if (s.life <= 0 || s.x < -50 || s.x > w + 50 || s.y > h + 50) return false;

        // Catch when very close
        if (dist < 30) { s.caught = true; collectStar(); return false; }

        // Trail
        const trailLen = s.slowing ? 4 : 8;
        const tg = ctx.createLinearGradient(s.x - s.vx * trailLen, s.y - s.vy * trailLen, s.x, s.y);
        tg.addColorStop(0, "transparent"); tg.addColorStop(1, s.slowing ? `rgba(255,200,50,${s.life * 0.7})` : `rgba(255,255,255,${s.life * 0.6})`);
        ctx.beginPath(); ctx.moveTo(s.x - s.vx * trailLen, s.y - s.vy * trailLen); ctx.lineTo(s.x, s.y);
        ctx.strokeStyle = tg; ctx.lineWidth = s.size; ctx.stroke();

        // Star head — grows and glows golden when being pulled
        const headSize = s.slowing ? s.size + 3 + (1 - dist / 140) * 3 : s.size;
        if (s.slowing) {
          // Golden glow halo
          const halo = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, headSize * 3);
          halo.addColorStop(0, `rgba(255,200,50,${s.life * 0.3})`); halo.addColorStop(1, "transparent");
          ctx.fillStyle = halo; ctx.fillRect(s.x - headSize * 3, s.y - headSize * 3, headSize * 6, headSize * 6);
        }
        ctx.beginPath(); ctx.arc(s.x, s.y, headSize, 0, Math.PI * 2);
        ctx.fillStyle = s.slowing ? `rgba(255,215,0,${s.life})` : `rgba(255,255,255,${s.life})`; ctx.fill();
        return true;
      });

      // ─── Black hole gravitational trail ───
      for (let i = cursorTrail.length - 1; i >= 0; i--) {
        const p = cursorTrail[i];
        p.life -= 0.035;
        if (p.life <= 0) { cursorTrail.splice(i, 1); continue; }
        const radius = p.size * (2 - p.life * 0.8);
        // Dark core with purple-orange accretion edge
        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
        grd.addColorStop(0, `rgba(0, 0, 0, ${p.life * 0.25})`);
        grd.addColorStop(0.4, `rgba(80, 20, 120, ${p.life * 0.15})`);
        grd.addColorStop(0.7, `rgba(147, 51, 234, ${p.life * 0.08})`);
        grd.addColorStop(1, "transparent");
        ctx.fillStyle = grd;
        ctx.fillRect(p.x - radius, p.y - radius, radius * 2, radius * 2);
      }

      ctx.restore();
      animFrameRef.current = requestAnimationFrame(render);
    };
    render(performance.now());

    return () => { cancelAnimationFrame(animFrameRef.current); clearInterval(shootingInterval); window.removeEventListener("resize", resize); window.removeEventListener("mousemove", handleMouse); window.removeEventListener("touchmove", handleTouchMove); canvas.removeEventListener("click", handleClick); canvas.removeEventListener("touchstart", handleTap); };
  }, [user, moonCounts, sunSize]);

  // ─── Screens ───
  if (checkingAuth) return (
    <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "rgba(255,255,255,0.3)", fontFamily: "Georgia", letterSpacing: "4px" }}>SHUNYA</p>
    </div>
  );
  if (!user) return <AuthPage onAuth={handleAuth} onSignupStart={() => { onboardingInProgress.current = true; }} />;

  // ─── Overlay: determines what's shown over the solar system ───
  const hasOverlay = selectedPlanet !== null || showAgePrompt || showDharmaTodos;

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden", background: "#000", fontFamily: "Georgia, serif", cursor: "none" }}>
      {/* Custom black hole cursor */}
      {!mobile && (
        <div id="shunya-cursor" style={{
          position: "fixed", pointerEvents: "none", zIndex: 9999,
          width: cursorBlink ? 54 : 46, height: cursorBlink ? 54 : 46, borderRadius: "50%",
          background: cursorBlink
            ? "radial-gradient(circle, transparent 0%, transparent 28%, rgba(255,200,50,0.35) 38%, rgba(255,170,30,0.2) 50%, rgba(147,51,234,0.15) 65%, transparent 80%)"
            : "radial-gradient(circle, transparent 0%, transparent 30%, rgba(200,160,255,0.18) 40%, rgba(147,51,234,0.15) 52%, rgba(100,40,160,0.08) 65%, transparent 80%)",
          boxShadow: cursorBlink
            ? "0 0 15px rgba(255,215,0,0.5), 0 0 35px rgba(255,180,50,0.25), 0 0 60px rgba(147,51,234,0.15), inset 0 0 15px rgba(255,200,50,0.15)"
            : "0 0 12px rgba(147,51,234,0.25), 0 0 30px rgba(100,40,160,0.12), 0 0 50px rgba(80,20,120,0.08), inset 0 0 12px rgba(100,60,180,0.06)",
          border: cursorBlink ? "2px solid rgba(255,215,0,0.55)" : "1.5px solid rgba(200,180,240,0.2)",
          transform: "translate(-50%, -50%)",
          left: 0, top: 0,
          willChange: "transform, left, top",
          transition: "width 0.2s ease, height 0.2s ease, box-shadow 0.25s ease, border 0.2s ease, background 0.25s ease",
        }}>
          {/* Inner accretion ring */}
          <div style={{
            position: "absolute", inset: "20%", borderRadius: "50%",
            border: cursorBlink ? "1px solid rgba(255,200,50,0.4)" : "1px solid rgba(180,150,230,0.15)",
            transition: "border 0.2s ease",
          }} />
        </div>
      )}
      {/* Canvas — always runs, gets blurred when overlay is open */}
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, transition: "filter 0.7s cubic-bezier(0.16, 1, 0.3, 1)", filter: hasOverlay ? "blur(10px) brightness(0.35)" : "none" }} />

      {/* Top bar — Desktop */}
      {!mobile && !hasOverlay && (
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

      {/* Top bar — Mobile */}
      {mobile && !hasOverlay && (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 10, padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 70%, transparent 100%)" }}>
          <span style={{ color: "#f5a623", fontSize: 14, letterSpacing: 4, fontWeight: 300 }}>SHUNYA</span>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: "rgba(255,215,0,0.8)", fontSize: 11 }}>★ {starsCollected}</span>
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{anonymousName}</span>
            <button onClick={handleLogout} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "4px 10px", color: "rgba(255,255,255,0.4)", fontSize: 10, cursor: "pointer" }}>EXIT</button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* PLANET VIEW — Zoomed planet with orbiting moons        */}
      {/* ═══════════════════════════════════════════════════════ */}
      {selectedPlanet && !journalOpen && !showAgePrompt && !showDharmaTodos && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 20,
          display: "flex", flexDirection: mobile ? "column" : "row",
          animation: "overlayIn 0.7s cubic-bezier(0.16, 1, 0.3, 1)",
          overflow: "hidden",
        }}>
          {/* ── LEFT / TOP: Planet with orbiting moons ── */}
          <div style={{
            width: mobile ? "100%" : "45%",
            height: mobile ? "40vh" : "100vh",
            display: "flex", alignItems: "center", justifyContent: "center",
            position: "relative",
            flexShrink: 0,
          }}>
            {/* Planet body — large */}
            <div style={{
              width: mobile ? 140 : 200, height: mobile ? 140 : 200, borderRadius: "50%",
              background: `radial-gradient(circle at 35% 35%, rgba(255,255,255,0.2), ${selectedPlanet.color} 40%, ${selectedPlanet.color}88 80%, ${selectedPlanet.color}44 100%)`,
              boxShadow: `0 0 40px ${selectedPlanet.color}44, 0 0 80px ${selectedPlanet.color}22, 0 0 120px ${selectedPlanet.color}11, inset -8px -8px 20px rgba(0,0,0,0.3)`,
              animation: "planetPulse 4s ease-in-out infinite",
              position: "relative",
              zIndex: 2,
            }} />

            {/* Orbiting moons — each one is a past journal entry */}
            {pastEntries.slice(0, moonCounts[selectedPlanet.id] || 0).map((entry, i) => {
              const totalMoons = Math.min(pastEntries.length, moonCounts[selectedPlanet.id] || 0);
              const orbitRadius = mobile ? 100 + i * 14 : 140 + i * 18;
              const angleOffsetDeg = (i * 360) / Math.max(totalMoons, 1);
              return (
                <div key={entry.id} style={{
                  position: "absolute",
                  width: mobile ? 18 : 24, height: mobile ? 18 : 24, borderRadius: "50%",
                  background: selectedMoonEntry?.id === entry.id
                    ? `radial-gradient(circle, #fff, ${selectedPlanet.color})`
                    : `radial-gradient(circle, rgba(255,255,255,0.8), rgba(200,200,195,0.5))`,
                  boxShadow: selectedMoonEntry?.id === entry.id
                    ? `0 0 12px ${selectedPlanet.color}, 0 0 24px ${selectedPlanet.color}66`
                    : "0 0 6px rgba(255,255,255,0.2)",
                  cursor: "pointer",
                  zIndex: 3,
                  transition: "box-shadow 0.3s, background 0.3s",
                  animation: `moonOrbit${i} ${14 + i * 3}s linear infinite`,
                  border: selectedMoonEntry?.id === entry.id ? `2px solid ${selectedPlanet.color}` : "1px solid rgba(255,255,255,0.2)",
                }} onClick={() => setSelectedMoonEntry(selectedMoonEntry?.id === entry.id ? null : entry)}>
                  <style>{`
                    @keyframes moonOrbit${i} {
                      from { transform: rotate(${angleOffsetDeg}deg) translateX(${orbitRadius}px) rotate(-${angleOffsetDeg}deg); }
                      to { transform: rotate(${angleOffsetDeg + 360}deg) translateX(${orbitRadius}px) rotate(-${angleOffsetDeg + 360}deg); }
                    }
                  `}</style>
                </div>
              );
            })}

            {/* Close button — top left */}
            <button onClick={() => { setSelectedPlanet(null); setSelectedMoonEntry(null); setPastEntries([]); }} style={{
              position: "absolute", top: mobile ? 16 : 24, left: mobile ? 16 : 24,
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "50%", width: 36, height: 36, color: "rgba(255,255,255,0.5)",
              fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              zIndex: 10,
            }}>✕</button>
          </div>

          {/* ── RIGHT / BOTTOM: Description, moon entry, or buttons ── */}
          <div style={{
            flex: 1,
            padding: mobile ? "20px 24px 40px" : "60px 50px",
            overflowY: "auto",
            display: "flex", flexDirection: "column",
            justifyContent: mobile ? "flex-start" : "center",
          }}>
            {/* If a moon entry is selected — show it */}
            {selectedMoonEntry ? (
              <div style={{ animation: "fadeIn 0.3s ease" }}>
                <button onClick={() => setSelectedMoonEntry(null)} style={{
                  background: "none", border: "none", color: "rgba(255,255,255,0.4)",
                  fontSize: 13, cursor: "pointer", marginBottom: 20, letterSpacing: 1, fontFamily: "Georgia, serif",
                }}>← Back to {selectedPlanet.name}</button>

                <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>
                  {new Date(selectedMoonEntry.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                </p>
                <p style={{
                  color: "rgba(255,255,255,0.75)", fontSize: mobile ? 15 : 17,
                  lineHeight: 2, fontFamily: "Georgia, serif",
                }}>{selectedMoonEntry.content}</p>

                {selectedMoonEntry.reveal_at && new Date(selectedMoonEntry.reveal_at) > new Date() && (
                  <p style={{ color: "rgba(255,215,0,0.4)", fontSize: 12, marginTop: 20, fontStyle: "italic" }}>
                    🔒 Sealed until {new Date(selectedMoonEntry.reveal_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                )}
              </div>
            ) : (
              /* Default: Planet description + buttons */
              <div style={{ animation: "fadeIn 0.3s ease" }}>
                <h1 style={{
                  color: selectedPlanet.color, fontSize: mobile ? 26 : 40,
                  letterSpacing: mobile ? 5 : 10, fontWeight: 300, marginBottom: 6,
                }}>{selectedPlanet.name}</h1>
                <p style={{
                  color: "rgba(255,255,255,0.3)", fontSize: mobile ? 11 : 13,
                  letterSpacing: 3, marginBottom: mobile ? 20 : 32,
                }}>{selectedPlanet.meaning}</p>

                <h4 style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, letterSpacing: 3, textTransform: "uppercase", marginBottom: 8, fontWeight: 400 }}>What it is</h4>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: mobile ? 13 : 15, lineHeight: 1.9, marginBottom: mobile ? 16 : 24 }}>{selectedPlanet.description}</p>

                <h4 style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, letterSpacing: 3, textTransform: "uppercase", marginBottom: 8, fontWeight: 400 }}>How it lives in you</h4>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: mobile ? 13 : 15, lineHeight: 1.9, marginBottom: mobile ? 20 : 32 }}>{selectedPlanet.howItLives}</p>

                {/* Moon progress */}
                <div style={{ display: "flex", gap: mobile ? 6 : 8, marginBottom: 8 }}>
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} style={{
                      width: mobile ? 9 : 11, height: mobile ? 9 : 11, borderRadius: "50%",
                      background: i < (moonCounts[selectedPlanet.id] || 0) ? selectedPlanet.color : "rgba(255,255,255,0.1)",
                      border: `1px solid ${i < (moonCounts[selectedPlanet.id] || 0) ? selectedPlanet.color : "rgba(255,255,255,0.12)"}`,
                      transition: "all 0.3s"
                    }} />
                  ))}
                </div>
                <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 11, marginBottom: mobile ? 20 : 28 }}>
                  {moonCounts[selectedPlanet.id] || 0} / 10 moons · Click a moon to revisit
                </p>

                {/* Buttons — Dharma gets Journal + Commit, others just Journal */}
                <div style={{ maxWidth: 380 }}>
                  <button onClick={() => {
                    if (!ageGroup) { setShowAgePrompt(true); return; }
                    if (selectedPlanet.id === "moksha") { setCurrentPrompt(""); setJournalOpen(true); return; }
                    const prompts = getQuestionsForPlanet(selectedPlanet.id, ageGroup);
                    const lastIdx = promptHistoryRef.current[selectedPlanet.id] ?? -1;
                    let newIdx;
                    do { newIdx = Math.floor(Math.random() * prompts.length); } while (newIdx === lastIdx && prompts.length > 1);
                    promptHistoryRef.current[selectedPlanet.id] = newIdx;
                    setCurrentPrompt(prompts[newIdx]);
                    setJournalOpen(true);
                  }} style={{
                    width: "100%", padding: mobile ? "15px" : "18px", border: "none", borderRadius: 14,
                    background: `linear-gradient(135deg, ${selectedPlanet.color}, ${selectedPlanet.color}cc)`,
                    color: "#000", fontSize: mobile ? 14 : 15, fontWeight: 700, cursor: "pointer",
                    letterSpacing: 1, fontFamily: "Georgia, serif",
                    boxShadow: `0 4px 24px ${selectedPlanet.color}44`,
                  }}>✦ Start Journaling</button>

                  {/* Dharma-only: Commit button for to-do list */}
                  {selectedPlanet.id === "dharma" && (
                    <button onClick={loadDharmaTodos} style={{
                      width: "100%", padding: mobile ? "13px" : "16px", marginTop: 12,
                      background: "transparent",
                      border: `1px solid ${selectedPlanet.color}44`,
                      borderRadius: 14, cursor: "pointer",
                      color: selectedPlanet.color, fontSize: mobile ? 13 : 14,
                      fontFamily: "Georgia, serif", letterSpacing: 1.5,
                      transition: "all 0.3s",
                    }}>⚡ Commit — Purpose To-Do</button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════ */}
      {/* DHARMA COMMIT — Purpose To-Do List        */}
      {/* ═══════════════════════════════════════ */}
      {showDharmaTodos && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 22,
          display: "flex", flexDirection: "column", alignItems: "center",
          animation: "overlayIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
          overflowY: "auto", padding: mobile ? "60px 20px 40px" : "60px 40px",
        }}>
          {/* Close */}
          <button onClick={() => setShowDharmaTodos(false)} style={{
            position: "absolute", top: mobile ? 16 : 28, left: mobile ? 16 : 28,
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 10, padding: "8px 16px", color: "rgba(255,255,255,0.5)",
            fontSize: 13, cursor: "pointer", fontFamily: "Georgia, serif", letterSpacing: 1,
          }}>← Back</button>

          <div style={{ width: "100%", maxWidth: 560 }}>
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: mobile ? 24 : 36 }}>
              <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#f093fb", margin: "0 auto 14px", boxShadow: "0 0 10px rgba(240,147,251,0.4)" }} />
              <h2 style={{ color: "#f093fb", fontSize: mobile ? 22 : 30, letterSpacing: mobile ? 4 : 8, fontWeight: 300, marginBottom: 6, fontFamily: "Georgia, serif" }}>COMMIT</h2>
              <p style={{ color: "rgba(255,255,255,0.25)", fontSize: mobile ? 11 : 13, letterSpacing: 2 }}>What are you committing to your purpose?</p>
            </div>

            {/* Add new to-do */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                <input
                  value={newTodoText}
                  onChange={(e) => setNewTodoText(e.target.value)}
                  placeholder="What will you commit to?"
                  onKeyDown={(e) => { if (e.key === "Enter") addDharmaTodo(); }}
                  style={{
                    flex: 1, padding: mobile ? "14px 16px" : "16px 20px",
                    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 14, color: "rgba(255,255,255,0.85)",
                    fontSize: mobile ? 14 : 16, outline: "none", fontFamily: "Georgia, serif",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              {/* Priority selector + Add button */}
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {[
                  { label: "Low", value: "low", color: "rgba(116,185,255,0.7)" },
                  { label: "Medium", value: "medium", color: "rgba(255,215,0,0.7)" },
                  { label: "High", value: "high", color: "rgba(255,107,107,0.7)" },
                ].map((p) => (
                  <button key={p.value} onClick={() => setNewTodoPriority(p.value)} style={{
                    padding: mobile ? "8px 14px" : "8px 18px",
                    background: newTodoPriority === p.value ? "rgba(255,255,255,0.08)" : "transparent",
                    border: `1px solid ${newTodoPriority === p.value ? p.color : "rgba(255,255,255,0.06)"}`,
                    borderRadius: 10, cursor: "pointer",
                    color: newTodoPriority === p.value ? p.color : "rgba(255,255,255,0.25)",
                    fontSize: mobile ? 11 : 12, fontFamily: "Georgia, serif", letterSpacing: 1,
                    transition: "all 0.2s",
                  }}>{p.label}</button>
                ))}
                <button onClick={addDharmaTodo} disabled={!newTodoText.trim()} style={{
                  marginLeft: "auto", padding: mobile ? "8px 20px" : "8px 24px",
                  background: !newTodoText.trim() ? "rgba(255,255,255,0.04)" : "linear-gradient(135deg, #f093fb, #f093fbcc)",
                  border: "none", borderRadius: 10, cursor: "pointer",
                  color: !newTodoText.trim() ? "rgba(255,255,255,0.2)" : "#000",
                  fontSize: mobile ? 12 : 13, fontWeight: 700, fontFamily: "Georgia, serif", letterSpacing: 1,
                  transition: "all 0.3s",
                }}>+ Add</button>
              </div>
            </div>

            {/* To-do list */}
            {dharmaTodos.length === 0 ? (
              <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 14, textAlign: "center", marginTop: 40 }}>
                No commitments yet. What is your purpose asking of you?
              </p>
            ) : (
              <div>
                {/* Active todos */}
                {dharmaTodos.filter(t => !t.completed).length > 0 && (
                  <div style={{ marginBottom: 24 }}>
                    <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 10, letterSpacing: 3, textTransform: "uppercase", marginBottom: 12 }}>Active</p>
                    {dharmaTodos.filter(t => !t.completed).map((todo) => (
                      <div key={todo.id} style={{
                        display: "flex", alignItems: "flex-start", gap: 12,
                        padding: mobile ? "14px 16px" : "16px 20px",
                        background: "rgba(255,255,255,0.025)",
                        border: "1px solid rgba(255,255,255,0.05)",
                        borderRadius: 14, marginBottom: 8,
                        borderLeft: `3px solid ${todo.priority === "high" ? "rgba(255,107,107,0.6)" : todo.priority === "medium" ? "rgba(255,215,0,0.5)" : "rgba(116,185,255,0.4)"}`,
                      }}>
                        {/* Checkbox */}
                        <div onClick={() => toggleDharmaTodo(todo.id, todo.completed)} style={{
                          width: 20, height: 20, borderRadius: 6, flexShrink: 0, marginTop: 2,
                          border: "1.5px solid rgba(255,255,255,0.15)", cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          transition: "all 0.2s",
                        }} />
                        {/* Content */}
                        <div style={{ flex: 1 }}>
                          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: mobile ? 14 : 15, lineHeight: 1.6, fontFamily: "Georgia, serif" }}>{todo.content}</p>
                          <p style={{ color: "rgba(255,255,255,0.15)", fontSize: 10, marginTop: 4 }}>
                            {todo.priority.toUpperCase()} · {new Date(todo.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                          </p>
                        </div>
                        {/* Delete */}
                        <button onClick={() => deleteDharmaTodo(todo.id)} style={{
                          background: "none", border: "none", color: "rgba(255,255,255,0.12)",
                          cursor: "pointer", fontSize: 14, flexShrink: 0,
                        }}>✕</button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Completed todos */}
                {dharmaTodos.filter(t => t.completed).length > 0 && (
                  <div>
                    <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 10, letterSpacing: 3, textTransform: "uppercase", marginBottom: 12 }}>Fulfilled</p>
                    {dharmaTodos.filter(t => t.completed).map((todo) => (
                      <div key={todo.id} style={{
                        display: "flex", alignItems: "flex-start", gap: 12,
                        padding: mobile ? "12px 16px" : "14px 20px",
                        background: "rgba(255,255,255,0.015)",
                        border: "1px solid rgba(255,255,255,0.03)",
                        borderRadius: 14, marginBottom: 6,
                        opacity: 0.5,
                      }}>
                        <div onClick={() => toggleDharmaTodo(todo.id, todo.completed)} style={{
                          width: 20, height: 20, borderRadius: 6, flexShrink: 0, marginTop: 2,
                          background: "rgba(240,147,251,0.3)", border: "1.5px solid rgba(240,147,251,0.4)",
                          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                          color: "#f093fb", fontSize: 12,
                        }}>✓</div>
                        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: mobile ? 13 : 14, lineHeight: 1.6, fontFamily: "Georgia, serif", textDecoration: "line-through" }}>{todo.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════ */}
      {/* LIFE STAGE — one-time cosmic question     */}
      {/* ═══════════════════════════════════════ */}
      {showAgePrompt && selectedPlanet && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 25,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          animation: "overlayIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
        }}>
          {/* Close */}
          <button onClick={() => { setShowAgePrompt(false); }} style={{
            position: "absolute", top: mobile ? 20 : 30, right: mobile ? 20 : 30,
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "50%", width: 40, height: 40, color: "rgba(255,255,255,0.5)",
            fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          }}>✕</button>

          <div style={{ maxWidth: 440, textAlign: "center", padding: mobile ? "0 28px" : 0 }}>
            {/* Small planet dot */}
            <div style={{
              width: 12, height: 12, borderRadius: "50%", margin: "0 auto 20px",
              background: selectedPlanet.color, boxShadow: `0 0 10px ${selectedPlanet.color}44`,
            }} />

            <h2 style={{ color: "rgba(255,255,255,0.85)", fontSize: mobile ? 22 : 28, fontWeight: 300, letterSpacing: mobile ? 3 : 5, marginBottom: 12, fontFamily: "Georgia, serif" }}>
              Where are you in your journey?
            </h2>
            <p style={{ color: "rgba(255,255,255,0.25)", fontSize: mobile ? 11 : 13, marginBottom: mobile ? 32 : 44, lineHeight: 1.7 }}>
              Shunya speaks differently to different seasons of life. Choose once — it stays private forever.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { label: "The Awakening", sub: "16 – 22", value: "16-22" },
                { label: "The Search", sub: "23 – 30", value: "23-30" },
                { label: "The Becoming", sub: "31 – 45", value: "31-45" },
                { label: "The Knowing", sub: "45+", value: "45+" },
              ].map((opt) => (
                <button key={opt.value} onClick={async () => {
                  setAgeGroup(opt.value);
                  setShowAgePrompt(false);
                  await supabase.from("profiles").update({ age_group: opt.value }).eq("id", user.id);
                  const prompts = getQuestionsForPlanet(selectedPlanet.id, opt.value);
                  const idx = Math.floor(Math.random() * prompts.length);
                  promptHistoryRef.current[selectedPlanet.id] = idx;
                  setCurrentPrompt(prompts[idx]);
                  setJournalOpen(true);
                }} style={{
                  padding: mobile ? "16px 20px" : "18px 24px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 16, cursor: "pointer",
                  fontFamily: "Georgia, serif",
                  transition: "all 0.25s ease",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                  <span style={{ color: "rgba(255,255,255,0.75)", fontSize: mobile ? 15 : 17, letterSpacing: 1.5 }}>{opt.label}</span>
                  <span style={{ color: "rgba(255,255,255,0.25)", fontSize: mobile ? 11 : 12, letterSpacing: 1 }}>{opt.sub}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════ */}
      {/* JOURNAL — Moon surface themed overlay    */}
      {/* ═══════════════════════════════════════ */}
      {selectedPlanet && journalOpen && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 20,
          display: "flex", justifyContent: "center",
          animation: "overlayIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
          overflowY: "auto",
        }}>
          {/* Moon surface — darker base for better text contrast */}
          <div style={{
            position: "absolute", inset: 0, zIndex: -3,
            background: `
              radial-gradient(ellipse at 65% 25%, #706e6a 0%, #555350 10%, #3e3c3a 25%, #2c2b29 45%, #201f1e 65%, #161515 85%, #0e0e0d 100%)
            `,
          }} />

          {/* Color variation patches — slight warm/cool zones like real moon maria */}
          <div style={{
            position: "absolute", inset: 0, zIndex: -3,
            backgroundImage: `
              radial-gradient(ellipse at 30% 40%, rgba(90,85,75,0.15) 0%, transparent 30%),
              radial-gradient(ellipse at 70% 70%, rgba(70,75,80,0.12) 0%, transparent 25%),
              radial-gradient(ellipse at 50% 20%, rgba(95,90,82,0.1) 0%, transparent 20%)
            `,
          }} />

          {/* Large impact craters — deep shadows with graduated edges */}
          <div style={{
            position: "absolute", inset: 0, zIndex: -2,
            backgroundImage: `
              radial-gradient(ellipse at 10% 15%, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.35) 2.5%, rgba(0,0,0,0.15) 4.5%, rgba(0,0,0,0.05) 6%, transparent 7.5%),
              radial-gradient(ellipse at 80% 10%, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.25) 3.5%, rgba(0,0,0,0.08) 5.5%, transparent 7%),
              radial-gradient(ellipse at 30% 78%, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.35) 4%, rgba(0,0,0,0.12) 7%, transparent 10%),
              radial-gradient(ellipse at 90% 55%, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 2.5%, rgba(0,0,0,0.06) 4%, transparent 5.5%),
              radial-gradient(ellipse at 52% 92%, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.25) 3.5%, rgba(0,0,0,0.08) 5.5%, transparent 7.5%),
              radial-gradient(ellipse at 18% 50%, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.15) 2.5%, transparent 4.5%),
              radial-gradient(ellipse at 68% 30%, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.28) 5%, rgba(0,0,0,0.1) 8%, transparent 11%),
              radial-gradient(ellipse at 45% 50%, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.12) 2%, transparent 3.5%)
            `,
            backgroundSize: "100% 100%",
          }} />

          {/* Crater rim highlights — bright edges where sunlight catches raised rims */}
          <div style={{
            position: "absolute", inset: 0, zIndex: -2,
            backgroundImage: `
              radial-gradient(ellipse at 9% 13%, transparent 5.5%, rgba(170,168,160,0.14) 6%, rgba(170,168,160,0.06) 6.8%, transparent 8%),
              radial-gradient(ellipse at 79% 8%, transparent 5.5%, rgba(160,158,150,0.12) 6.2%, rgba(160,158,150,0.04) 7%, transparent 8.5%),
              radial-gradient(ellipse at 29% 76%, transparent 7.5%, rgba(155,153,145,0.16) 8.2%, rgba(155,153,145,0.06) 9.2%, transparent 11%),
              radial-gradient(ellipse at 67% 28%, transparent 9%, rgba(165,163,155,0.13) 9.8%, rgba(165,163,155,0.05) 10.8%, transparent 12.5%),
              radial-gradient(ellipse at 51% 90%, transparent 5.5%, rgba(150,148,140,0.11) 6.2%, transparent 7.5%)
            `,
            backgroundSize: "100% 100%",
          }} />

          {/* Medium crater field — scattered mid-size impacts */}
          <div style={{
            position: "absolute", inset: 0, zIndex: -2, opacity: 0.8,
            backgroundImage: `
              radial-gradient(circle at 25% 30%, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.12) 9px, rgba(110,108,102,0.06) 11px, transparent 13px),
              radial-gradient(circle at 72% 22%, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0.09) 7px, transparent 10px),
              radial-gradient(circle at 48% 68%, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.15) 11px, rgba(95,93,88,0.05) 14px, transparent 16px),
              radial-gradient(circle at 13% 72%, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0.07) 6px, transparent 9px),
              radial-gradient(circle at 85% 48%, rgba(0,0,0,0.32) 0%, rgba(0,0,0,0.11) 8px, transparent 11px),
              radial-gradient(circle at 38% 12%, rgba(0,0,0,0.24) 0%, rgba(0,0,0,0.08) 6px, transparent 8px),
              radial-gradient(circle at 94% 82%, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0.09) 7px, transparent 10px),
              radial-gradient(circle at 58% 88%, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0.07) 5px, transparent 7px)
            `,
            backgroundSize: "280px 280px",
          }} />

          {/* Small crater scatter — tiny pockmarks */}
          <div style={{
            position: "absolute", inset: 0, zIndex: -2, opacity: 0.6,
            backgroundImage: `
              radial-gradient(circle, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.1) 2px, rgba(90,88,83,0.05) 3px, transparent 4px),
              radial-gradient(circle, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.06) 1.5px, transparent 3px)
            `,
            backgroundSize: "35px 35px, 55px 55px",
            backgroundPosition: "0 0, 18px 18px",
          }} />

          {/* Fine grain regolith — the dusty rocky surface texture */}
          <div style={{
            position: "absolute", inset: 0, zIndex: -1, opacity: 0.2,
            backgroundImage: `
              radial-gradient(circle, rgba(0,0,0,0.5) 0.4px, transparent 0.4px),
              radial-gradient(circle, rgba(140,138,130,0.3) 0.3px, transparent 0.3px),
              radial-gradient(circle, rgba(0,0,0,0.3) 0.6px, transparent 0.6px)
            `,
            backgroundSize: "6px 6px, 10px 10px, 15px 15px",
            backgroundPosition: "0 0, 3px 3px, 7px 7px",
          }} />

          {/* Harsh directional sunlight — strong light from upper right */}
          <div style={{
            position: "absolute", inset: 0, zIndex: -1,
            background: "linear-gradient(140deg, rgba(200,198,190,0.14) 0%, rgba(160,158,150,0.06) 20%, transparent 40%, rgba(0,0,0,0.12) 80%, rgba(0,0,0,0.2) 100%)",
          }} />

          {/* Content */}
          <div style={{
            width: "100%", maxWidth: mobile ? "100%" : 820,
            minHeight: "100vh",
            padding: mobile ? "70px 20px 40px" : "80px 50px 60px",
            display: "flex", flexDirection: "column", alignItems: "center",
            position: "relative",
          }}>
            {/* Back button */}
            <button onClick={() => setJournalOpen(false)} style={{
              position: "fixed", top: mobile ? 16 : 28, left: mobile ? 16 : 28,
              background: "rgba(30,30,28,0.6)", border: "1px solid rgba(80,80,75,0.3)",
              borderRadius: 10, padding: "8px 18px",
              color: "rgba(180,178,170,0.7)", fontSize: 13, cursor: "pointer",
              letterSpacing: 1, fontFamily: "Georgia, serif",
              backdropFilter: "blur(10px)", zIndex: 25,
            }}>← Back</button>

            {/* Planet indicator */}
            <div style={{
              width: mobile ? 14 : 18, height: mobile ? 14 : 18, borderRadius: "50%",
              background: selectedPlanet.color, marginBottom: 14,
              boxShadow: `0 0 12px ${selectedPlanet.color}55, 0 2px 6px rgba(0,0,0,0.4)`,
            }} />

            {/* Planet name — colored to match the planet */}
            <h2 style={{
              color: selectedPlanet.color, fontSize: mobile ? 22 : 34,
              letterSpacing: mobile ? 5 : 10, fontWeight: 300, marginBottom: 8,
              textShadow: `0 2px 8px ${selectedPlanet.color}33, 0 1px 3px rgba(0,0,0,0.5)`,
            }}>{selectedPlanet.name}</h2>

            {/* Prompt — Moksha has none, others show rotating question */}
            {selectedPlanet.id === "moksha" ? (
              <p style={{
                color: "rgba(200,195,180,0.45)", fontSize: mobile ? 12 : 15,
                fontStyle: "italic", marginBottom: mobile ? 24 : 36,
                lineHeight: 1.9, textAlign: "center", maxWidth: 560,
              }}>Moksha asks nothing of you. Write freely — to yourself, to the universe, or to who you will become.</p>
            ) : (
              <p style={{
                color: "rgba(160,158,150,0.5)", fontSize: mobile ? 12 : 15,
                fontStyle: "italic", marginBottom: mobile ? 24 : 36,
                lineHeight: 1.9, textAlign: "center", maxWidth: 560,
              }}>"{currentPrompt}"</p>
            )}

            {/* Divider — crack in surface */}
            <div style={{
              width: 60, height: 1, marginBottom: mobile ? 20 : 28,
              background: "linear-gradient(90deg, transparent, rgba(120,118,110,0.3), transparent)",
            }} />

            {/* Textarea */}
            <textarea
              value={journalText}
              onChange={(e) => setJournalText(e.target.value)}
              placeholder={selectedPlanet.id === "moksha" ? "Write to your future self..." : "Write what your soul needs to say..."}
              style={{
                width: "100%", height: mobile ? "300px" : "420px",
                padding: mobile ? "24px" : "36px",
                background: "rgba(0,0,0,0.25)",
                border: "1px solid rgba(150,148,140,0.12)",
                borderRadius: 22,
                color: "rgba(220,218,210,0.92)",
                fontSize: mobile ? 16 : 19, lineHeight: 2.2,
                resize: "none", outline: "none", fontFamily: "Georgia, serif",
                boxSizing: "border-box", letterSpacing: 0.4,
                boxShadow: "inset 0 4px 16px rgba(0,0,0,0.25), inset 0 -1px 0 rgba(140,140,135,0.06)",
              }}
            />

            {/* Moon progress */}
            <div style={{ display: "flex", gap: mobile ? 8 : 10, marginTop: 24, marginBottom: 8 }}>
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} style={{
                  width: mobile ? 9 : 11, height: mobile ? 9 : 11, borderRadius: "50%",
                  background: i < (moonCounts[selectedPlanet.id] || 0) ? "rgba(200,198,190,0.7)" : "rgba(100,100,95,0.2)",
                  border: `1px solid ${i < (moonCounts[selectedPlanet.id] || 0) ? "rgba(200,198,190,0.35)" : "rgba(100,100,95,0.15)"}`,
                  transition: "all 0.3s",
                  boxShadow: i < (moonCounts[selectedPlanet.id] || 0) ? "0 1px 4px rgba(0,0,0,0.3)" : "none",
                }} />
              ))}
            </div>
            <p style={{ color: "rgba(150,148,140,0.35)", fontSize: 11, marginBottom: mobile ? 20 : 28 }}>
              {moonCounts[selectedPlanet.id] || 0} / 10 moons until merge
            </p>

            {/* Buttons — Moksha gets Inscribe + Send to Future Self, others just Inscribe */}
            {selectedPlanet.id === "moksha" ? (
              <div style={{ width: "100%", maxWidth: 400 }}>
                {/* Inscribe normally */}
                <button onClick={saveJournalEntry} disabled={saving || !journalText.trim()} style={{
                  width: "100%", padding: mobile ? "16px" : "20px", border: "none", borderRadius: 16,
                  background: saving || !journalText.trim() ? "rgba(80,80,75,0.15)" : "linear-gradient(135deg, #ffd700, #f0c800cc)",
                  color: saving || !journalText.trim() ? "rgba(150,148,140,0.3)" : "#1a1510",
                  fontSize: mobile ? 15 : 17, fontWeight: 700, cursor: "pointer",
                  letterSpacing: 2, fontFamily: "Georgia, serif",
                  boxShadow: saving || !journalText.trim() ? "inset 0 1px 4px rgba(0,0,0,0.2)" : "0 4px 20px rgba(255,215,0,0.2), 0 2px 8px rgba(0,0,0,0.3)",
                  transition: "all 0.3s ease",
                }}>{saving ? "Inscribing..." : "✦ Inscribe"}</button>

                {/* Future self time options */}
                {!futureRevealDate ? (
                  <button onClick={() => setFutureRevealDate("choosing")} disabled={!journalText.trim()} style={{
                    width: "100%", padding: mobile ? "14px" : "18px", marginTop: 12,
                    background: "transparent",
                    border: `1px solid ${!journalText.trim() ? "rgba(100,100,95,0.1)" : "rgba(255,215,0,0.2)"}`,
                    borderRadius: 16, cursor: "pointer",
                    color: !journalText.trim() ? "rgba(150,148,140,0.2)" : "rgba(255,215,0,0.6)",
                    fontSize: mobile ? 13 : 15, fontFamily: "Georgia, serif", letterSpacing: 1.5,
                    transition: "all 0.3s ease",
                  }}>⟳ Send to Future Self</button>
                ) : (
                  <div style={{ marginTop: 16 }}>
                    <p style={{ color: "rgba(200,198,190,0.4)", fontSize: 12, textAlign: "center", marginBottom: 12, letterSpacing: 1 }}>
                      When should your future self receive this?
                    </p>
                    <div style={{ display: "flex", gap: 10 }}>
                      {[
                        { label: "1 Month", months: 1 },
                        { label: "6 Months", months: 6 },
                        { label: "1 Year", months: 12 },
                      ].map((opt) => (
                        <button key={opt.months} onClick={() => saveFutureMessage(opt.months)} disabled={saving} style={{
                          flex: 1, padding: mobile ? "12px 8px" : "14px",
                          background: "rgba(255,215,0,0.08)", border: "1px solid rgba(255,215,0,0.15)",
                          borderRadius: 12, cursor: "pointer",
                          color: "rgba(255,215,0,0.7)", fontSize: mobile ? 12 : 13,
                          fontFamily: "Georgia, serif", letterSpacing: 1,
                          transition: "all 0.2s",
                        }}>{saving ? "..." : opt.label}</button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={saveJournalEntry} disabled={saving || !journalText.trim()} style={{
                width: "100%", maxWidth: 400,
                padding: mobile ? "16px" : "20px", border: "none", borderRadius: 16,
                background: saving || !journalText.trim() ? "rgba(80,80,75,0.15)" : `linear-gradient(135deg, ${selectedPlanet.color}, ${selectedPlanet.color}cc)`,
                color: saving || !journalText.trim() ? "rgba(150,148,140,0.3)" : "#1a1510",
                fontSize: mobile ? 15 : 17, fontWeight: 700, cursor: "pointer",
                letterSpacing: 2, fontFamily: "Georgia, serif",
                boxShadow: saving || !journalText.trim() ? "inset 0 1px 4px rgba(0,0,0,0.2)" : `0 4px 20px ${selectedPlanet.color}33, 0 2px 8px rgba(0,0,0,0.3)`,
                transition: "all 0.3s ease",
              }}>{saving ? "Inscribing..." : "✦ Inscribe"}</button>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════ */}
      {/* ROCKET LAUNCH — Moksha future message      */}
      {/* ═══════════════════════════════════════ */}
      {rocketLaunching && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 30,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          background: "rgba(0,0,0,0.85)",
          animation: "fadeIn 0.3s ease",
        }}>
          {/* Rocket */}
          <div style={{
            animation: "rocketLaunch 2.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards",
            display: "flex", flexDirection: "column", alignItems: "center",
          }}>
            {/* Rocket body */}
            <div style={{ fontSize: 48, lineHeight: 1 }}>🚀</div>
            {/* Flame trail */}
            <div style={{
              width: 4, background: "linear-gradient(to bottom, #ffd700, #ff6b35, #ff4444, transparent)",
              animation: "flameTrail 2.5s ease forwards",
              borderRadius: 4,
            }} />
          </div>

          {/* Message */}
          <p style={{
            color: "rgba(255,215,0,0.6)", fontSize: mobile ? 14 : 18,
            fontFamily: "Georgia, serif", letterSpacing: 2, marginTop: 40,
            animation: "fadeIn 1s ease 0.5s both",
          }}>Your message is on its way to the future...</p>
          <p style={{
            color: "rgba(255,255,255,0.25)", fontSize: mobile ? 11 : 13,
            fontFamily: "Georgia, serif", letterSpacing: 1, marginTop: 12,
            animation: "fadeIn 1s ease 1.2s both",
          }}>It will find you when the time is right.</p>
        </div>
      )}

      {/* ═══════════════════════════════════════ */}
      {/* PAST ENTRIES — Full screen overlay       */}
      {/* ═══════════════════════════════════════ */}
      {selectedPlanet && showPastEntries && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 20,
          display: "flex", flexDirection: "column", alignItems: "center",
          padding: mobile ? "60px 24px 40px" : "60px 40px",
          animation: "overlayIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)", overflowY: "auto",
        }}>
          <button onClick={() => setShowPastEntries(false)} style={{
            position: "absolute", top: mobile ? 20 : 30, left: mobile ? 20 : 30,
            background: "none", border: "none", color: "rgba(255,255,255,0.4)",
            fontSize: 14, cursor: "pointer", letterSpacing: 1, fontFamily: "Georgia, serif",
          }}>← Back</button>

          <h2 style={{ color: selectedPlanet.color, fontSize: mobile ? 20 : 28, letterSpacing: mobile ? 4 : 8, fontWeight: 300, marginBottom: mobile ? 20 : 32 }}>Past Reflections</h2>

          {pastEntries.length === 0 ? (
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 14, marginTop: 40 }}>No entries yet. Begin your journey.</p>
          ) : (
            <div style={{ width: "100%", maxWidth: 500 }}>
              {pastEntries.map((entry) => (
                <div key={entry.id} style={{
                  padding: mobile ? "16px" : "20px", background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, marginBottom: 12,
                }}>
                  <p style={{ color: "rgba(255,255,255,0.7)", fontSize: mobile ? 13 : 14, lineHeight: 1.8, marginBottom: 8 }}>{entry.content}</p>
                  <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 11 }}>
                    {new Date(entry.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── CSS ─── */}
      <style>{`
        @keyframes overlayIn {
          from { opacity: 0; transform: scale(0.92) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes rocketLaunch {
          0% { transform: translateY(0); opacity: 1; }
          15% { transform: translateY(10px); opacity: 1; }
          100% { transform: translateY(-120vh); opacity: 0; }
        }
        @keyframes flameTrail {
          0% { height: 20px; opacity: 0.8; }
          15% { height: 40px; opacity: 1; }
          60% { height: 200px; opacity: 0.7; }
          100% { height: 400px; opacity: 0; }
        }
        @keyframes planetPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 60px currentColor; }
          50% { transform: scale(1.05); box-shadow: 0 0 90px currentColor; }
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { margin: 0; overflow: hidden; touch-action: none; -webkit-overflow-scrolling: touch; }
        textarea::placeholder { color: rgba(150,148,140,0.35); }
        input::placeholder { color: rgba(255,255,255,0.2); }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
      `}</style>
    </div>
  );
}
