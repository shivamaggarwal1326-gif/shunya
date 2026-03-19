import { useEffect, useRef, useState } from "react";
import { supabase } from "./supabaseClient";
import AuthPage from "./AuthPage";
import FeedbackForm from "./FeedbackForm";
import StreakTracker from "./StreakTracker";
import { RehesyaPanel, RehesyaRelease, RehesyaAnswers, useRehesya, useRehesyaActive, useRehesyaState } from "./Rehesya";
import { useAIPrompt } from "./PlanetPrompt";

const PLANETS = [
  { id: "aatma",
    whisper: "what burns underneath everything",
    lockedHint: "a place older than your name, older than your wounds",
    name: "AATMA", meaning: "The Soul · आत्मा", color: "#e07840", glow: "rgba(224,120,64,0.4)", baseSize: 16, baseOrbit: 150, speed: 0.0005,
    description: "Aatma is the eternal soul — the part of you that existed before your name, your wounds, and your achievements. It is not your personality. It is not your story. It is the awareness behind all of it.",
    howItLives: "When you sit in silence and feel something ancient — something that was here before your first memory — that is Aatma. Journal here when you want to speak from beyond identity." },
  { id: "seesha",
    whisper: "the face you show nobody",
    lockedHint: "the mirror that asks which version of you is real",
    name: "SEESHA", meaning: "The Mirror · शीशा", color: "#7dd3fc", glow: "rgba(125,211,252,0.4)", baseSize: 14, baseOrbit: 280, speed: 0.0004,
    description: "Seesha is the mirror — not the one on your wall but the one inside you that shows every version of yourself at once. The warrior, the child, the fraud, the light. You built so many faces. Seesha asks which one is home.",
    howItLives: "When you don't know who is speaking — when you feel split between versions of yourself — that is Seesha calling. Journal here when you want to meet yourself honestly." },
  { id: "kaal",
    whisper: "the 3 am version of time",
    lockedHint: "where the past wears you like jewellery you never chose",
    name: "KAAL", meaning: "Time · काल", color: "#a78bfa", glow: "rgba(167,139,250,0.4)", baseSize: 18, baseOrbit: 390, speed: 0.00035,
    description: "Kaal is time — not the clock on your wall but the deeper rhythm that governs birth, death, seasons, and everything in between. Kaal does not rush. Kaal does not wait. It simply moves.",
    howItLives: "When you feel anxious about the future or trapped in the past — that is your relationship with Kaal. Journal here when time feels heavy, when you want to process what was or prepare for what is coming." },
  { id: "dharma",
    whisper: "the quiet calling only you can hear",
    lockedHint: "a path that keeps finding you no matter how far you run",
    name: "DHARMA", meaning: "Purpose · धर्म", color: "#f093fb", glow: "rgba(240,147,251,0.4)", baseSize: 15, baseOrbit: 490, speed: 0.0003,
    description: "Dharma is your sacred duty — the thing you were put here to do. Not your job title. Not what society expects. The deep, quiet calling that only you can hear when everything else goes silent.",
    howItLives: "When you feel lost, purposeless, or stuck in a life that does not feel like yours — Dharma is calling. Journal here when you want to explore what you are truly meant to do." },
  { id: "moksha",
    whisper: "what you would say if nothing held you back",
    lockedHint: "the version of you that answers to nobody",
    name: "MOKSHA", meaning: "Liberation · मोक्ष", color: "#ffd700", glow: "rgba(255,215,0,0.4)", baseSize: 13, baseOrbit: 570, speed: 0.00025,
    description: "Moksha is the ultimate freedom — liberation from the cycles of suffering, attachment, and repetition. It is not an escape from life but a deeper entrance into it, free from chains.",
    howItLives: "When you want to send a message to your future self — when you want to set something free — Moksha is where you go. Messages here can be locked and revealed later." },
  { id: "karma",
    whisper: "every choice you made that made you",
    lockedHint: "where every decision you ever made is waiting to be understood",
    name: "KARMA", meaning: "Action · कर्म", color: "#ff6b6b", glow: "rgba(255,107,107,0.4)", baseSize: 16, baseOrbit: 650, speed: 0.0002,
    description: "Karma is not punishment. It is the simple truth that every action creates a ripple. What you do, what you say, what you think — it all echoes forward. Karma is the universe keeping a ledger.",
    howItLives: "When you feel guilt, pride, consequence, or the weight of choices — that is Karma speaking. Journal here to process your actions and their echoes." },
  { id: "prema",
    whisper: "what breaks you open and fills you anyway",
    lockedHint: "the force that makes you do things you cannot explain to yourself",
    name: "PREMA", meaning: "Love · प्रेम", color: "#e8a0bf", glow: "rgba(232,160,191,0.4)", baseSize: 17, baseOrbit: 720, speed: 0.00015,
    description: "Prema is love — not the love sold in movies or reduced to Valentine's cards. It is the force that holds atoms together and makes strangers weep at sunsets. It is what you feel when words fail and the heart overflows.",
    howItLives: "When you ache for someone. When you are grateful for someone. When love has hurt you or healed you or both at once — that is Prema. Journal here about the people who have shaped your heart." },
  { id: "maya",
    whisper: "your hunger has a name",
    lockedHint: "everything you want so badly you are afraid to admit it",
    name: "MAYA", meaning: "Desire · माया", color: "#fd79a8", glow: "rgba(253,121,168,0.4)", baseSize: 12, baseOrbit: 780, speed: 0.00012,
    description: "Maya is not weakness. It is the raw hunger to be seen, to have, to win, to be the greatest version of yourself alive. The mansions, the cars, the freedom to roam — Maya does not apologise for wanting. Neither should you.",
    howItLives: "When you want something so badly it embarrasses you — when desire feels like fire you can not put out — that is Maya speaking honestly. Journal here without apology." }
];

// ─── 224 Age-Targeted Questions ───
const QUESTIONS = {
  aatma: {
    "16-22": ["When you are completely alone with no phone and no noise what do you feel","Who are you when nobody needs you to be anything","What do you believe about yourself that has nothing to do with what others think","What do you feel in your gut about who you actually are","If you could not define yourself by your interests or achievements who would you be","What part of you feels most real and most unseen at the same time","What do you know about yourself that you have never said out loud"],
    "23-30": ["Strip away your job your relationships your image — who are you underneath all of it","What do you come back to when everything else falls away","When do you feel most like yourself — not performing, not achieving, just being","What does your soul want that your life is not currently giving it","What would you think about all day if you had no responsibilities for a week","What do you know to be true about yourself that the world has not confirmed yet","Who are you becoming and do you recognise that person"],
    "31-45": ["What would you think about if you had nothing to distract you for an entire day","When did you last feel fully yourself — not a role, not a title, just you","What does your inner life look like compared to your outer life","What do you believe about who you are at your core","What part of yourself have you been neglecting to keep everything else running","What does your soul already know that your mind has been arguing with","Who are you when you are not being needed by anyone"],
    "45+": ["What are you finally ready to let go of","Who have you become and who did you always know you were","What does it feel like to be you right now — really","What have you learned about yourself that took a lifetime to understand","What is your soul trying to tell you in this season of your life","What do you know now about who you truly are that you could not have known at thirty","What does it mean to you to be at peace with yourself"]
  },
  seesha: {
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
  },
  rehesya: {
    "16-22": ["What is something you cannot explain but deeply feel to be true","What question keeps returning to you no matter how many times you think you have answered it","What do you sense about life that you cannot put into words","What do you wonder about when you cannot sleep","What part of existence feels like a mystery you were not supposed to find","What does it feel like to not know something and sit with it anyway","What would you ask the universe if it could answer"],
    "23-30": ["What do you know in your body that your mind has never been able to confirm","What mystery about yourself have you stopped trying to solve","When did you last feel the strangeness of being alive — really feel it","What question does your life keep asking you that you have not answered yet","What do you sense is true about the world that most people around you do not see","What are you at peace with not understanding","What would change if you stopped needing life to make sense"],
    "31-45": ["What do you hold as sacred that you could never fully explain to someone else","What mystery has your life been trying to show you that you keep looking away from","When did you last feel something larger than yourself — what was it","What do you know that you cannot prove","What part of the unknown do you find terrifying and what part do you find beautiful","What does it feel like to accept that some questions will never be answered","What truth lives in you below the reach of language"],
    "45+": ["What have you stopped needing to understand that used to torment you","What mystery has lived inside you your whole life and never left","What do you sense is waiting on the other side of everything you know","What has life revealed to you that could not have been taught — only lived","What do you find sacred in the silence","When did the unknown stop being frightening and start being something else","What is the most honest thing you can say about what you do not know"]
  }
};

// Get questions for a planet based on age group
function getQuestionsForPlanet(planetId, ageGroup) {
  const planetQs = QUESTIONS[planetId];
  if (!planetQs) return ["What is on your mind today?"];
  if (ageGroup && planetQs[ageGroup]) return planetQs[ageGroup];
  return Object.values(planetQs).flat();
}

// ─── Comets — real named comets with philosophical questions ───
const COMETS = [
  { name: "Halley's Comet", fact: "Returns every 75 years", question: "What keeps coming back to you no matter how far you run from it?", color: "#87ceeb", tailColor: "130,206,235" },
  { name: "Comet Neowise", fact: "Will not return for 6,800 years", question: "What have you witnessed that no one else will ever see the same way?", color: "#c4b5fd", tailColor: "196,181,253" },
  { name: "Hale-Bopp", fact: "Visible to the naked eye for 18 months", question: "What truth has been staring you in the face, waiting to be acknowledged?", color: "#fbbf24", tailColor: "251,191,36" },
  { name: "Comet Lovejoy", fact: "Survived passing through the sun's corona", question: "What fire have you walked through that should have destroyed you but did not?", color: "#34d399", tailColor: "52,211,153" },
  { name: "Comet ISON", fact: "Broke apart approaching the sun", question: "What part of you had to break before you could become who you are now?", color: "#f472b6", tailColor: "244,114,182" },
  { name: "Comet Hyakutake", fact: "Passed closer to Earth than any comet in 200 years", question: "Who has come closest to truly knowing you?", color: "#60a5fa", tailColor: "96,165,250" },
  { name: "Encke's Comet", fact: "Shortest orbital period — 3.3 years", question: "What cycle in your life repeats the fastest and why have you not broken it?", color: "#fb923c", tailColor: "251,146,60" },
  { name: "Comet McNaught", fact: "Brightest comet seen in over 40 years", question: "When was the last time you let yourself shine without dimming for others?", color: "#e2e8f0", tailColor: "226,232,240" },
];

const SUN_BASE_SIZE = 38;

// ─── Quote of the Day ───
const DAILY_QUOTES = [
  // On Time
  "You can't get more time in life, so give more life to your time.",
  "Don't wait for the stars to align. Make your own timeline.",
  "The clock moves forward. So must you.",
  "Yesterday is a planet you've already orbited. Stop trying to land there again.",
  "Time doesn't heal. Honesty does. Time just gives you the space to be honest.",
  // On Self
  "Embarrassment is an underexplored emotion. Go out and make a fool of yourself.",
  "Less telly, vision your thoughts.",
  "You are not your worst day. You are every quiet moment you chose to keep going.",
  "The person you're becoming is watching how you treat the person you are right now.",
  "You don't need to fix yourself. You need to know yourself.",
  "Your core was never broken. It was just waiting for you to come home.",
  "Shunya — the zero that holds everything. That is you.",
  // On Healing
  "Healing is not a straight line. It's an orbit. You will pass this point again, but higher.",
  "The wound is not the story. What you did with it is.",
  "Some nights the universe asks you to be still. That is not weakness. That is wisdom.",
  "You don't have to perform your pain to prove it was real.",
  "Every honest word you write is a moon added to your universe.",
  "Growth doesn't announce itself. One day you just react differently.",
  // On Courage
  "The most radical thing you can do is tell yourself the truth.",
  "Courage is not the absence of fear. It's writing anyway.",
  "Your story is not too much. The wrong audience was just too little.",
  "Stop shrinking yourself to fit into spaces that were never built for you.",
  "The version of you that stopped caring what people think is your most powerful self.",
  // On Purpose
  "Dharma is not found. It is remembered.",
  "You were not born to be busy. You were born to be alive.",
  "Don't mistake movement for direction.",
  "The work that scares you the most is usually the work you were born to do.",
  "Your gifts were never meant to be kept safe. They were meant to be spent.",
  // On the Universe
  "You are made of the same thing as stars. Act like it.",
  "The universe does not waste anything — not your pain, not your joy, not even your confusion. All of it is fuel.",
];

// ─── Planet Classification — keyword-based, instant, no API needed ───
function classifyJournalEntry(text) {
  const t = text.toLowerCase();

  const scores = {
    aatma:  0, seesha: 0, kaal:   0, dharma: 0,
    moksha: 0, karma:  0, prema:  0, maya:   0,
  };

  // AATMA — soul, self, inner fire, warrior, existence
  const aatmaWords = [
    // English
    "soul","warrior","ancient","spirit","fire","exist","identity","calling","nature","light","body","self","inner","deep","true","real","born","energy","purpose","eternal","fight","battle","strength","awareness","consciousness","being","essence","core","alive","breathe","within",
    // Hindi/Hinglish
    "aatma","ruh","rooh","zindagi","jeena","atma","mann","dil ki awaaz","andar se","sachcha","apna aap","khud ko","meri pehchaan","apni zindagi","jiyo","jeetna","junoon","jazba","himmat","hausla","sach","sachai","asli","andar ki awaaz","apna","khud","wajood","hona","mehsoos","zinda","shakti","urja","taakat","andar","gehrai"
  ];
  aatmaWords.forEach(w => { if (t.includes(w)) scores.aatma += 1; });

  // SEESHA — mirror, versions, masks, identity confusion
  const seeshaWords = [
    // English
    "version","mask","face","who am i","identity","confused","mirror","different","pretend","fake","real me","hide","lost","don't know","multiple","sides","persona","split","fracture","reflection","role","character","image","appearance","illusion","disguise","perform","audience","hollow",
    // Hindi/Hinglish
    "aaina","sheeshe","kaun hoon","pehchaan","asli chehra","nakal","dikhawa","andar se kuch aur","bahar se kuch aur","nakab","naqab","chhupa","chhupana","jhooth","saccha kaun","khud se jhooth","confused hoon","samajh nahi","kaun sa main","alag alag","tukde","toot","akela","kho gaya","kho gayi","bharam","wham","dhoka","apne aap ko","kya hoon main","anjaana","anjaani","samjha nahi"
  ];
  seeshaWords.forEach(w => { if (t.includes(w)) scores.seesha += 1; });

  // KAAL — time, past, future, anxiety, regret, memory
  const kaalWords = [
    // English
    "past","future","regret","guilt","overthink","worry","anxious","anxiety","yesterday","tomorrow","memory","remember","forgot","miss","waiting","late","early","clock","days","years","ago","again","back","forward","stuck","loop","cycle","nostalgia","dread","deadline","rush","slow","fast","moment","used to","anymore","when will","what if",
    // Hindi/Hinglish
    "waqt","kal","beeta","pehle","baad","yaadein","yaad","sochta rehta","sochti rehti","baar baar","abhi tak","kab tak","kab hoga","kitna time","guzesha","maazi","mustaqbil","der","jaldi","guzar gaya","nikal gaya","wapas","aage","peeche","ateet","bhavisya","vartaman","ghadi","din","saal","mahine","intezaar","wait kar raha","ruk gaya","ruk gayi","atak gaya","chakkar","daur","dohraana","sochna band nahi","chinta","fikar","dar","khauf","ghabrana","restless","chain nahi"
  ];
  kaalWords.forEach(w => { if (t.includes(w)) scores.kaal += 1; });

  // DHARMA — purpose, path, truth, growth, meaning
  const dharmaWords = [
    // English
    "purpose","path","meaning","explore","truth","calling","grow","help","serve","direction","why","reason","work","create","build","mission","contribute","world","better","change","impact","right thing","duty","responsibility","values","principle","guide","lead","society","honest","integrity","wisdom","learn","teach","uplift","when i can","jab time mile","jab mauka mile","jab mauka milega","jab waqt mile","fursat mile","fursat mili","mauka milega","kisi ki madad","sabki madad","sab ke liye","logo ke liye",
    // Hindi/Hinglish
    "dharm","dharma","kartavya","farz","sahi raasta","seedha raasta","zindagi ka matlab","kyun jeeta hoon","kyun jeeti hoon","apna kaam","apni duty","logo ki madad","duniya ke liye","sach bolna","sachai ka raasta","seedha","neeki","bhalayi","paropkar","seva","insaan banna","achha insaan","apna purpose","mera mission","mera kaam","meri zimmedaari","meri responsibility","kuch karna","badlaav","parivartan","soch","seekhna","sikhaana","satya","nyay","dharmic","nishtha",
    "pooja","puja","bhagwan","bhagvan","ishwar","parmatma","prabhu","waheguru","allah","dua","namaz","prayer","worship","devta","devi","mandir","masjid","gurudwara","temple","aarti","prasad","darshan","satsang","dhyan","meditation","tapasya","sadhna","sadhu","sant","guru","shishya","upkar","paropkar","daan","charity","madad karo","sabki madad","logo ki seva","bade kaam","nishkam","nishkaam seva","ibadat","bandagi","shraddha","bhakti","aastha","vishwas","iman","imaan","rasta dikhao","achha karo","sahi karo","duniya ko behtar","apna farz","apna dharm","bade ka aadar","chhoton ka pyaar","insaniyat","humanity","nek kaam","nek","wafa","sachchi seva"
  ];
  dharmaWords.forEach(w => { if (t.includes(w)) scores.dharma += 1; });

  // MOKSHA — freedom, liberation, fearless, no limits, raw power
  const mokshaWords = [
    // English
    "free","freedom","power","greatest","best","limit","break","fuck","fearless","no one","nobody","rules","liberate","escape","win","top","strong","unstoppable","release","let go","don't care","wild","rebel","refuse","defy","unchain","bold","brave","roar","phoenix","rise","conquer","sovereign","untamed",
    // Hindi/Hinglish
    "azaad","azaadi","mukt","mukti","azaad hona","azaad rehna","free hona","free rehna","chhoot jana","nikal jana","bhagna","chhoot gaya","chhoot gayi","band tod","tod diya","koi rok nahi","koi nahi roka","nidar","dara nahi","darne wala nahi","sab chod","chhod diya","bekaar rules","apni marzi","jo mann kare","khulla","bebak","bindas","mast","full power","sab jeet lunga","sab jeet lungi","main kaafi hoon","mujhe koi nahi rok sakta","mujhe koi nahi rok sakti","apni duniya","apna raaj","toot ke","girega nahi","giregi nahi","utha","uth gaya","uth gayi","jung","lad","ladna","haar nahi","haarna nahi"
  ];
  mokshaWords.forEach(w => { if (t.includes(w)) scores.moksha += 1; });

  // KARMA — choices, mistakes, consequences, blame, growth through pain
  const karmaWords = [
    // English
    "decision","choice","mistake","wrong","blame","consequence","result","action","did","done","made","bad","caused","effect","owe","deserve","fault","responsible","pay","karma","learned","lesson","regret","undo","fix","repair","pattern","repeat","cycle","punish","reward","reap","sow","past action","ripple",
    // Hindi/Hinglish
    "galti","ghalti","bhool","chuk","pachtawa","pachhtawa","pachtana","nahi karna chahiye tha","kyun kiya","kyun ki","anjaam","natija","faisla","choice ki","kiya tha","kar diya","kar diya tha","iska nateeja","meri galti hai","meri wajah se","mujhe maafi","maafi maangna","mujhe khud ko maaf","kash aisa na hota","kash na karta","kash na karti","saza","inam","jo boya","wohi kaata","jo ki so bhar","apne kiye ka","apne actions ka","zimma","uthana","seedha karna","sahi karna","sudhar","prayaschit","badla"
  ];
  karmaWords.forEach(w => { if (t.includes(w)) scores.karma += 1; });

  // PREMA — love, longing, heartbreak, connection, people
  const premaWords = [
    // English
    "love","girl","boy","relationship","heart","miss","kiss","date","hug","crush","romantic","feeling","care","together","alone","friend","family","hurt","beautiful","attracted","emotion","connection","bond","ache","longing","tender","warm","hold","touch","tears","goodbye","distance","close","intimate","attachment","devotion",
    // Hindi/Hinglish
    "pyaar","mohabbat","ishq","prem","dil","dhadkan","tanha","akela","akeli","koi nahi","yaad aata hai","yaad aati hai","bhool nahi pata","bhool nahi pati","woh","use","usse","uski","uska","chahna","chahta hoon","chahti hoon","teri yaad","teri kasam","teri wajah","bichhadna","judai","door","paas","saath","humsafar","dost","yaar","rishtey","rishta","parivaar","ghar","maa","baap","bhai","behan","aankhein","aansu","rona","tadap","tarasta","tarasti","dil toota","dil toot gaya","dard","dil ka dard","kaash woh","kaash tu","chahiye tha","intezaar tera","teri zaroorat"
  ];
  premaWords.forEach(w => { if (t.includes(w)) scores.prema += 1; });

  // MAYA — desire, ambition, hunger, material, success, wanting more
  const mayaWords = [
    // English
    "want","money","rich","success","car","house","mansion","famous","popular","desire","ambition","goal","achieve","status","power","wealth","dream","big","more","best","world","hunger","crave","need","earn","greed","luxury","empire","brand","flex","hustle","grind","own","acquire","reputation","recognition","applause","throne",
    // Hindi/Hinglish
    "chahiye","paisa","ameer","amiri","daulat","gaadi","ghar","bada ghar","bada aadmi","badi aurat","naam","shohrat","mashhoor","popular hona","duniya mein naam","safalta","safal","goal hai","achieve karna","pana","pana chahta","pana chahti","bada sapna","sapna","khwab","khwaish","tamanna","lalach","lobh","aur chahiye","zyada chahiye","kafi nahi","aur aur","bada","sabse bada","sabse aage","duniya dekhe","log dekhen","sab dekhein","mehengi","luxury","lifestyle","flex karna","dikhana","prove karna","khud ko prove","log kya sochenge","log kya sochen","duniya ko dikhana","empire","raj","takhta"
  ];
  mayaWords.forEach(w => { if (t.includes(w)) scores.maya += 1; });

  // Find highest scoring planet
  let best = "aatma", bestScore = 0;
  Object.entries(scores).forEach(([planet, score]) => {
    if (score > bestScore) { bestScore = score; best = planet; }
  });

  return best;
}

function getDailyQuote() {
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
  return DAILY_QUOTES[dayOfYear % DAILY_QUOTES.length];
}

// ─── How It Works Modal ───
function HowItWorks({ onClose, onJournal, mobile }) {
  const steps = [
    {
      icon: "✦",
      color: "#f5a623",
      title: "You write. Freely.",
      body: "No prompts. No categories. No pressure. Just open the journal and write whatever is on your mind — raw, honest, unfiltered. The universe is listening.",
    },
    {
      icon: "◎",
      color: "#a78bfa",
      title: "The universe reads you.",
      body: "When you release your words, Shunya reads the emotional weight of what you wrote — not just the words, but what they carry. Fear, hunger, love, time, purpose.",
    },
    {
      icon: "🪐",
      color: "#4ecdc4",
      title: "A planet is assigned.",
      body: "Your entry is sent to the planet that resonates most with what you felt. You don't choose — the universe does. Sometimes it surprises you. That surprise is the point.",
    },
    {
      icon: "☽",
      color: "#ffd700",
      title: "Moons orbit your planets.",
      body: "Every entry creates a moon. 10 moons on a planet and they collapse into your sun — SHUNYA, your core. The more you write, the bigger and brighter your sun grows.",
    },
    {
      icon: "◉",
      color: "#fd79a8",
      title: "New planets unlock.",
      body: "You start with one planet. As you journal, you discover others — each one a different dimension of who you are. Some you'll unlock quickly. Some will take time. Some will surprise you.",
    },
    {
      icon: "∞",
      color: "#e8a0bf",
      title: "Your universe grows with you.",
      body: "The more you explore, the more your solar system expands. Your core grows. New planets appear. The universe you see is not fixed — it is alive, and it reflects you.",
    },
  ];

  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,0.82)", backdropFilter:"blur(20px)", animation:"overlayIn 0.4s ease", padding: mobile?"16px":0 }}>
      <div onClick={e => e.stopPropagation()} style={{ maxWidth:mobile?"100%":580, width:"100%", maxHeight:"88vh", overflowY:"auto", background:"rgba(5,3,15,0.98)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:24, padding:mobile?"28px 22px 36px":"48px 44px", position:"relative", boxShadow:"0 40px 80px rgba(0,0,0,0.8)" }}>

        <button onClick={onClose} style={{ position:"absolute", top:18, right:20, background:"none", border:"none", color:"rgba(255,255,255,0.2)", fontSize:16, cursor:"pointer" }}>✕</button>

        {/* Header */}
        <div style={{ textAlign:"center", marginBottom:40 }}>
          <div style={{ width:10, height:10, borderRadius:"50%", background:"#f5a623", boxShadow:"0 0 20px rgba(245,166,35,0.6)", margin:"0 auto 18px", animation:"planetPulse 3s ease-in-out infinite" }} />
          <h2 style={{ color:"rgba(255,255,255,0.85)", fontSize:mobile?20:26, fontWeight:300, letterSpacing:6, fontFamily:"Georgia,serif", marginBottom:10 }}>How Shunya Works</h2>
          <p style={{ color:"rgba(255,255,255,0.25)", fontSize:12, letterSpacing:2, fontFamily:"Georgia,serif", fontStyle:"italic" }}>your universe, explained</p>
        </div>

        {/* Steps */}
        <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
          {steps.map((step, i) => (
            <div key={i} style={{ display:"flex", gap:mobile?16:22, padding:`${mobile?18:22}px 0`, borderBottom: i < steps.length-1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
              {/* Icon + line */}
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", flexShrink:0 }}>
                <div style={{ width:36, height:36, borderRadius:"50%", background:`${step.color}18`, border:`1px solid ${step.color}33`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, color:step.color, flexShrink:0 }}>
                  {step.icon}
                </div>
                {i < steps.length-1 && (
                  <div style={{ width:1, flex:1, minHeight:16, background:`linear-gradient(to bottom, ${step.color}22, transparent)`, marginTop:6 }} />
                )}
              </div>
              {/* Content */}
              <div style={{ paddingTop:6 }}>
                <h3 style={{ color:step.color, fontSize:mobile?14:16, fontWeight:300, letterSpacing:2, fontFamily:"Georgia,serif", marginBottom:8 }}>{step.title}</h3>
                <p style={{ color:"rgba(255,255,255,0.45)", fontSize:mobile?13:14, fontFamily:"Georgia,serif", lineHeight:1.85, letterSpacing:0.3 }}>{step.body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div style={{ marginTop:32, textAlign:"center" }}>
          <div style={{ width:40, height:1, background:"rgba(245,166,35,0.15)", margin:"0 auto 20px" }} />
          <p style={{ color:"rgba(255,255,255,0.2)", fontSize:12, fontFamily:"Georgia,serif", fontStyle:"italic", lineHeight:1.8 }}>
            The universe doesn't judge what you write.<br/>It only listens.
          </p>
          <button onClick={() => { localStorage.setItem("shunya_hiw_seen","1"); onJournal ? onJournal() : onClose(); }} style={{ marginTop:24, background:"rgba(245,166,35,0.1)", border:"1px solid rgba(245,166,35,0.3)", borderRadius:12, padding:"11px 32px", color:"#f5a623", fontSize:11, letterSpacing:3, fontFamily:"Georgia,serif", cursor:"pointer", boxShadow:"0 0 16px rgba(245,166,35,0.12)" }}>
            begin journaling →
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Free Journal Component — entry point for new users ───
function FreeJournal({ user, onPlanetUnlocked, mobile }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim() || loading) return;
    setLoading(true);
    const planetId = classifyJournalEntry(text);

    // Show done state immediately
    setDone(true);
    setLoading(false);

    // Fire DB writes in parallel
    const current = JSON.parse(localStorage.getItem("shunya_unlocked") || '["aatma"]');
    const updated = current.includes(planetId) ? current : [...current, planetId];

    Promise.all([
      supabase.from("journal_entries").insert({
        user_id: user.id, planet_id: planetId,
        content: text.trim(), created_at: new Date().toISOString(),
      }),
      supabase.from("profiles").update({ unlocked_planets: updated }).eq("id", user.id),
    ]).catch(err => console.error("FreeJournal write error:", err));

    setTimeout(() => onPlanetUnlocked(planetId), 800);
  };

  return (
    <div style={{ position:"fixed", inset:0, zIndex:300, background:"#03020a", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding: mobile?"24px":"0", animation:"overlayIn 0.8s ease" }}>
      {/* Stars background */}
      <div style={{ position:"absolute", inset:0, overflow:"hidden", pointerEvents:"none" }}>
        {Array.from({length:40}).map((_,i)=>(
          <div key={i} style={{ position:"absolute", width: Math.random()*2+1, height: Math.random()*2+1, borderRadius:"50%", background:"rgba(255,255,255,0.6)", left:`${Math.random()*100}%`, top:`${Math.random()*100}%`, opacity: 0.2+Math.random()*0.5 }} />
        ))}
      </div>

      <div style={{ position:"relative", zIndex:2, maxWidth:560, width:"100%", textAlign:"center" }}>
        {/* Shunya glow */}
        <div style={{ width:18, height:18, borderRadius:"50%", background:"#f5a623", boxShadow:"0 0 40px rgba(245,166,35,0.6), 0 0 80px rgba(245,166,35,0.2)", margin:"0 auto 28px", animation:"planetPulse 3s ease-in-out infinite" }} />

        {/* Intro poem */}
        <div style={{ marginBottom:36, padding:"0 8px" }}>
          <p style={{ color:"rgba(255,255,255,0.55)", fontSize: mobile?13:15, fontFamily:"Georgia,serif", fontStyle:"italic", lineHeight:2, letterSpacing:0.3 }}>
            Anxiety is just a paradox, to make you live inside the box<br/>
            think outside, work, let them talk — you will get your shot.<br/>
            <span style={{ color:"rgba(245,166,35,0.6)" }}>till then journal all you want, in this beautiful box.</span>
          </p>
        </div>

        {/* Journal box */}
        <div style={{ position:"relative", marginBottom:16 }}>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="what's on your mind right now..."
            autoFocus
            style={{
              width:"100%", minHeight: mobile?160:200,
              background:"rgba(255,255,255,0.03)",
              border:"1px solid rgba(255,255,255,0.1)",
              borderRadius:16, padding:"20px 22px",
              color:"rgba(255,255,255,0.82)", fontSize: mobile?15:17,
              fontFamily:"Georgia,serif", lineHeight:1.9,
              resize:"none", outline:"none",
              boxSizing:"border-box", letterSpacing:0.3,
              transition:"border 0.3s",
            }}
            onFocus={e => e.target.style.borderColor = "rgba(245,166,35,0.25)"}
            onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
          />
          {text.length > 0 && (
            <span style={{ position:"absolute", bottom:12, right:16, color:"rgba(255,255,255,0.15)", fontSize:10, fontFamily:"Georgia,serif", letterSpacing:1 }}>
              {text.trim().split(/\s+/).filter(Boolean).length} words
            </span>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!text.trim() || loading || done}
          style={{
            background: done ? "rgba(245,166,35,0.15)" : text.trim() ? "rgba(245,166,35,0.12)" : "rgba(255,255,255,0.03)",
            border: `1px solid ${text.trim() ? "rgba(245,166,35,0.3)" : "rgba(255,255,255,0.08)"}`,
            borderRadius:12, padding:"13px 36px",
            color: text.trim() ? "#f5a623" : "rgba(255,255,255,0.2)",
            fontSize:12, letterSpacing:3, fontFamily:"Georgia,serif",
            cursor: text.trim() && !loading ? "pointer" : "default",
            transition:"all 0.3s",
          }}
        >
          {done ? "✦ reading your universe..." : loading ? "..." : "release into the universe →"}
        </button>
      </div>
    </div>
  );
}

// ─── Planet Unlock Modal ───
function UnlockModal({ planet, onClose, mobile }) {
  const [step, setStep] = useState(0); // 0=dark, 1=hint, 2=name reveal

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 600);
    const t2 = setTimeout(() => setStep(2), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (!planet) return null;

  return (
    <div style={{ position:"fixed", inset:0, zIndex:250, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,0.92)", backdropFilter:"blur(20px)", animation:"overlayIn 0.5s ease" }}>
      <div style={{ textAlign:"center", padding: mobile?"32px 24px":"48px 52px", maxWidth:460 }}>
        {/* Planet orb */}
        <div style={{
          width: mobile?80:110, height: mobile?80:110, borderRadius:"50%",
          background:`radial-gradient(circle at 38% 38%, rgba(255,255,255,0.2), ${planet.color}cc 45%, ${planet.color}66 75%, transparent)`,
          boxShadow:`0 0 60px ${planet.color}44, 0 0 120px ${planet.color}22`,
          margin:"0 auto 28px",
          animation:"planetPulse 4s ease-in-out infinite",
          transition:"all 1s ease",
        }} />

        {step >= 1 && (
          <p style={{ color:"rgba(255,255,255,0.5)", fontSize: mobile?13:15, fontFamily:"Georgia,serif", fontStyle:"italic", lineHeight:1.9, marginBottom:20, animation:"overlayIn 0.8s ease" }}>
            {planet.lockedHint}
          </p>
        )}

        {step >= 2 && (
          <>
            <div style={{ width:30, height:1, background:`rgba(${planet.color},0.3)`, margin:"0 auto 20px", background:"rgba(255,255,255,0.1)" }} />
            <h2 style={{ color:planet.color, fontSize: mobile?28:36, letterSpacing:10, fontWeight:300, fontFamily:"Georgia,serif", marginBottom:8, animation:"overlayIn 0.6s ease", textShadow:`0 0 30px ${planet.color}66` }}>
              {planet.name}
            </h2>
            <p style={{ color:"rgba(255,255,255,0.25)", fontSize:11, letterSpacing:3, fontFamily:"Georgia,serif", marginBottom:8, animation:"overlayIn 0.6s ease" }}>
              {planet.meaning}
            </p>
            <p style={{ color:planet.color, fontSize: mobile?13:15, fontStyle:"italic", fontFamily:"Georgia,serif", opacity:0.5, marginBottom:32, animation:"overlayIn 0.6s ease" }}>
              {planet.whisper}
            </p>
            <p style={{ color:"rgba(255,255,255,0.2)", fontSize:11, letterSpacing:2, fontFamily:"Georgia,serif", marginBottom:28 }}>
              YOU HAVE UNLOCKED A NEW PLANET
            </p>
            <button onClick={onClose} style={{ background:"rgba(255,255,255,0.04)", border:`1px solid ${planet.color}44`, borderRadius:12, padding:"11px 32px", color:planet.color, fontSize:11, letterSpacing:3, fontFamily:"Georgia,serif", cursor:"pointer" }}>
              enter your universe →
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── QuickJournal Modal — write freely, universe decides the planet ───
function QuickJournal({ user, unlockedPlanets, moonCounts, onDone, mobile }) {
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null); // { planet, isNew }

  const handleSubmit = async () => {
    if (!text.trim() || saving) return;
    setSaving(true);

    // Classify instantly — no await needed
    const planetId = classifyJournalEntry(text);
    const planet = PLANETS.find(p => p.id === planetId) || PLANETS[0];
    const isNewUnlock = !unlockedPlanets.includes(planetId);
    const cur = moonCounts[planetId] || 0;
    const next = cur + 1;

    // Show result immediately — don't wait for DB writes
    setSaving(false);
    setResult({ planet, isNew: isNewUnlock });

    // Fire all DB writes in parallel, non-blocking
    const writes = [
      supabase.from("journal_entries").insert({
        user_id: user.id, planet_id: planetId,
        content: text.trim(), created_at: new Date().toISOString(),
      }),
      supabase.from("moon_progress")
        .upsert({ user_id: user.id, planet_id: planetId, moon_count: next >= 10 ? 0 : next }, { onConflict: "user_id,planet_id" }),
    ];

    if (isNewUnlock) {
      const updated = [...unlockedPlanets, planetId];
      writes.push(supabase.from("profiles").update({ unlocked_planets: updated }).eq("id", user.id));
    }

    // Fire and forget — result screen already shown
    Promise.all(writes).catch(err => console.error("Shunya write error:", err));
  };

  // Result screen
  if (result) {
    return (
      <div style={{ position:"fixed", inset:0, zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,0.82)", backdropFilter:"blur(20px)", animation:"overlayIn 0.4s ease" }}>
        <div style={{ maxWidth:mobile?"88vw":460, textAlign:"center", padding:mobile?"40px 28px":"56px 48px", background:"rgba(5,3,15,0.98)", border:`1px solid ${result.planet.color}22`, borderRadius:24, boxShadow:`0 0 80px ${result.planet.color}15, 0 32px 80px rgba(0,0,0,0.8)` }}>

          {/* Planet orb */}
          <div style={{ width:mobile?70:90, height:mobile?70:90, borderRadius:"50%", background:`radial-gradient(circle at 38% 38%, rgba(255,255,255,0.2), ${result.planet.color}cc 45%, ${result.planet.color}55 75%, transparent)`, boxShadow:`0 0 50px ${result.planet.color}44`, margin:"0 auto 24px", animation:"planetPulse 4s ease-in-out infinite" }} />

          {result.isNew ? (
            <>
              <p style={{ color:"rgba(255,255,255,0.3)", fontSize:9, letterSpacing:5, fontFamily:"Georgia,serif", marginBottom:16 }}>NEW PLANET DISCOVERED</p>
              <h2 style={{ color:result.planet.color, fontSize:mobile?26:32, letterSpacing:8, fontWeight:300, fontFamily:"Georgia,serif", marginBottom:8, textShadow:`0 0 30px ${result.planet.color}66` }}>{result.planet.name}</h2>
              <p style={{ color:`${result.planet.color}88`, fontSize:mobile?13:15, fontStyle:"italic", fontFamily:"Georgia,serif", marginBottom:24 }}>{result.planet.whisper}</p>
            </>
          ) : (
            <>
              <p style={{ color:"rgba(255,255,255,0.3)", fontSize:9, letterSpacing:5, fontFamily:"Georgia,serif", marginBottom:16 }}>YOUR WORDS LANDED ON</p>
              <h2 style={{ color:result.planet.color, fontSize:mobile?26:32, letterSpacing:8, fontWeight:300, fontFamily:"Georgia,serif", marginBottom:8 }}>{result.planet.name}</h2>
              <p style={{ color:`${result.planet.color}77`, fontSize:mobile?12:14, fontStyle:"italic", fontFamily:"Georgia,serif", marginBottom:24 }}>{result.planet.whisper}</p>
              <p style={{ color:"rgba(255,255,255,0.2)", fontSize:10, letterSpacing:2, fontFamily:"Georgia,serif", marginBottom:24 }}>a moon has been added ☽</p>
            </>
          )}

          <div style={{ width:32, height:1, background:`rgba(245,166,35,0.2)`, margin:"0 auto 20px" }} />
          <button onClick={() => onDone(result.planet.id, result.isNew, result.planet)} style={{ background:`rgba(245,166,35,0.08)`, border:`1px solid rgba(245,166,35,0.25)`, borderRadius:12, padding:"11px 32px", color:"#f5a623", fontSize:11, letterSpacing:3, fontFamily:"Georgia,serif", cursor:"pointer" }}>
            {result.isNew ? "enter your universe →" : "back to universe →"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position:"fixed", inset:0, zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,0.35)", backdropFilter:"blur(6px)", animation:"overlayIn 0.4s ease" }}>
      <div style={{ maxWidth:mobile?"96vw":640, width:"100%", background:"rgba(3,12,6,0.82)", border:"1px solid rgba(74,222,128,0.14)", borderRadius:24, padding:mobile?"24px 20px 28px":"44px 48px", boxShadow:"0 8px 40px rgba(0,0,0,0.6), 0 0 80px rgba(60,180,100,0.06)", position:"relative", maxHeight:mobile?"94vh":"88vh", overflowY:"auto", backdropFilter:"blur(12px)" }}>

        <button onClick={() => onDone(null, false, null)} style={{ position:"absolute", top:18, right:20, background:"none", border:"none", color:"rgba(255,255,255,0.2)", fontSize:16, cursor:"pointer" }}>✕</button>

        {/* Poem */}
        <div style={{ textAlign:"center", marginBottom:24, padding:mobile?"0":"0 8px" }}>
          <div style={{ width:6, height:6, borderRadius:"50%", background:"#4ade80", boxShadow:"0 0 16px rgba(74,222,128,0.6)", margin:"0 auto 18px", animation:"planetPulse 3s ease-in-out infinite" }} />
          <p style={{
            color:"rgba(255,255,255,0.38)", fontSize:mobile?12:13,
            fontFamily:"Georgia,serif", fontStyle:"italic",
            lineHeight:2.1, letterSpacing:0.3,
          }}>
            Anxiety is just a paradox, to make you live inside the box,<br/>
            think outside, work, let them talk — you will get your shot,<br/>
            to prove you can make the world rock, you better miss it not,<br/>
            but if you did, no worries you are not lost, everything will be sort<br/>
            <span style={{ color:"rgba(74,222,128,0.65)", fontStyle:"italic" }}>till then journal all you want, in this beautiful box.</span>
          </p>
          <div style={{ width:32, height:1, background:"rgba(74,222,128,0.12)", margin:"16px auto 0" }} />
        </div>

        <div style={{ position:"relative", marginBottom:12 }}>
          <textarea
            value={text} onChange={e => setText(e.target.value)}
            placeholder="whatever is on your mind right now..."
            autoFocus
            style={{ width:"100%", minHeight:mobile?220:280, background:"rgba(74,222,128,0.03)", border:"1px solid rgba(74,222,128,0.1)", borderRadius:14, padding:"20px 22px", color:"rgba(255,255,255,0.85)", fontSize:mobile?15:17, fontFamily:"Georgia,serif", lineHeight:2.0, resize:"none", outline:"none", boxSizing:"border-box", letterSpacing:0.3, WebkitOverflowScrolling:"touch", transition:"border 0.3s" }}
            onFocus={e => e.target.style.borderColor="rgba(74,222,128,0.28)"}
            onBlur={e => e.target.style.borderColor="rgba(74,222,128,0.1)"}
          />
          {text.length > 0 && (
            <span style={{ position:"absolute", bottom:10, right:14, color:"rgba(74,222,128,0.25)", fontSize:10, fontFamily:"Georgia,serif", letterSpacing:1 }}>
              {text.trim().split(/\s+/).filter(Boolean).length} words
            </span>
          )}
        </div>

        <button onClick={handleSubmit} disabled={!text.trim() || saving} style={{ width:"100%", padding:"13px", background:text.trim()?"rgba(74,222,128,0.1)":"rgba(255,255,255,0.03)", border:`1px solid ${text.trim()?"rgba(74,222,128,0.3)":"rgba(255,255,255,0.06)"}`, borderRadius:12, color:text.trim()?"#4ade80":"rgba(255,255,255,0.2)", fontSize:11, letterSpacing:3, fontFamily:"Georgia,serif", cursor:text.trim()&&!saving?"pointer":"default", transition:"all 0.3s", textShadow:text.trim()?"0 0 12px rgba(74,222,128,0.4)":"none" }}>
          {saving ? "reading..." : "release into the universe →"}
        </button>
      </div>
    </div>
  );
}

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
  const [unlockedPlanets, setUnlockedPlanets] = useState(["aatma","seesha","kaal","dharma","moksha","karma","prema","maya"]); // all unlocked by default
  // Keep ref in sync for canvas (avoids stale closure)
  useEffect(() => { unlockedPlanetsRef.current = unlockedPlanets; }, [unlockedPlanets]);
  const [showUnlockModal, setShowUnlockModal] = useState(null); // planet just unlocked
  const [showFreeJournal, setShowFreeJournal] = useState(false); // first-time free journal
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
  const [activeComet, setActiveComet] = useState(null);
  const [toast, setToast] = useState(null);
  const [showPlanetNav, setShowPlanetNav] = useState(false);
  const [showQuickJournal, setShowQuickJournal] = useState(false);
  const [showSunCore, setShowSunCore] = useState(false);
  const [sunCoreData, setSunCoreData] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showStreak, setShowStreak] = useState(false);
  const [cometArriving, setCometArriving] = useState(null); // "left" | "right" | null
  const [showRehesyaPanel, setShowRehesyaPanel] = useState(false);
  const [showRehesyaRelease, setShowRehesyaRelease] = useState(false);
  const [showRehesyaAnswers, setShowRehesyaAnswers] = useState(false);
  const [showQuote, setShowQuote] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [howItWorksSeenRef] = useState(() => localStorage.getItem("shunya_hiw_seen") === "1");

  // ─── Rehesya — unified state machine ───
  const { state: rehesyaState, pendingPass, myAnswers, refresh: refreshRehesya } = useRehesyaState(user);
  const hasActiveQuestion = rehesyaState === "traveling";
  const newAnswers = rehesyaState === "answered";
  const rehesyaBlinkRef = useRef(false);

  useEffect(() => {
    // State machine visibility:
    // "idle"      → no planet, no button
    // "traveling" → no planet, no button (question is out there)
    // "answer"    → planet appears, button: "Answer the Universe"
    // "answered"  → planet appears (gold glow), button: "Universe has answered"
    const shouldShow = rehesyaState === "answer" || rehesyaState === "answered";
    rehesyaVisibleRef.current = shouldShow;
    rehesyaBlinkRef.current = rehesyaState === "answered"; // gold blink when answers arrived
    setRehesyaVisible(shouldShow);
  }, [rehesyaState]);

  // Trigger roulette spin — called when new planet unlocked
  const triggerRoulette = (planetId) => {
    const r = rouletteRef.current;
    r.spinning = true;
    r.targetPlanetId = planetId;
    r.phase = "charge";
    r.elapsed = 0;
  };

  // ─── AI-powered personalized prompt ───
  const { prompt: aiPrompt, loading: aiPromptLoading, regenerate: regenerateAIPrompt } = useAIPrompt(
    user, selectedPlanet, ageGroup,
    !!selectedPlanet && selectedPlanet.id !== "moksha"
  );

  // Show toast notification — auto-dismisses
  const showToast = (message, type = "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };
  const [mobile, setMobile] = useState(window.innerWidth < 768);
  const getScale = () => { const w = window.innerWidth; return w < 768 ? w / 820 : Math.min(w, window.innerHeight) / 900; };
  const scaleRef = useRef(getScale());
  const animFrameRef = useRef(null);
  const shootingStarsRef = useRef([]);
  const mergingMoons = useRef([]);
  const cometsRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const timeRef = useRef(0);
  const rehesyaVisibleRef = useRef(false);
  const rehesyaPosRef = useRef(null);
  const rouletteRef = useRef({ spinning: false, targetPlanetId: null, phase: "idle", elapsed: 0 }); // idle | charge | transfer
  const unlockedPlanetsRef = useRef(["aatma","seesha","kaal","dharma","moksha","karma","prema","maya"]);

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
    try {
      const { data: profile, error: profileErr } = await supabase.from("profiles").select("*").eq("id", authUser.id).single();
      if (profileErr) throw profileErr;
      if (profile) { setAnonymousName(profile.anonymous_name); setSunSize(SUN_BASE_SIZE * profile.sun_size); setStarsCollected(profile.stars_collected); starsRef.current = profile.stars_collected; if (profile.age_group) setAgeGroup(profile.age_group); setUnlockedPlanets(profile.unlocked_planets && profile.unlocked_planets.length > 0 ? profile.unlocked_planets : ["aatma","seesha","kaal","dharma","moksha","karma","prema","maya"]); }
      const { data: moons, error: moonErr } = await supabase.from("moon_progress").select("*").eq("user_id", authUser.id);
      if (moonErr) throw moonErr;
      if (moons) { const c = {}; moons.forEach((m) => (c[m.planet_id] = m.moon_count)); setMoonCounts(c); }
      setUser(authUser); setCheckingAuth(false);
    } catch (err) {
      console.error("Failed to load user data:", err);
      showToast("Something went wrong loading your universe. Try refreshing.");
      setCheckingAuth(false);
    }
  };

  const handleAuth = (u, n, suggestedPlanetId, isNewUser) => {
    onboardingInProgress.current = false; setUser(u); setAnonymousName(n); loadUserData(u);
    // Show HowItWorks on first ever visit
    if (!localStorage.getItem("shunya_hiw_seen")) {
      setTimeout(() => setShowHowItWorks(true), 1200);
    }
    // If mood selector suggested a planet, auto-open it after a short delay
    if (suggestedPlanetId) {
      setTimeout(() => {
        const planet = PLANETS.find(p => p.id === suggestedPlanetId);
        if (planet) {
          setSelectedPlanet(planet);
          supabase.from("journal_entries").select("*").eq("user_id", u.id).eq("planet_id", planet.id).order("created_at", { ascending: false }).then(({ data }) => {
            setPastEntries(data || []);
          });
        }
      }, 800);
    }
  };
  const handleLogout = async () => { await supabase.auth.signOut(); setUser(null); setAnonymousName(""); setMoonCounts({}); setSunSize(SUN_BASE_SIZE); setStarsCollected(0); starsRef.current = 0; };

  const saveJournalEntry = async () => {
    if (!journalText.trim() || !selectedPlanet || !user) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("journal_entries").insert({ user_id: user.id, planet_id: selectedPlanet.id, content: journalText });
      if (error) throw error;
      const cur = moonCounts[selectedPlanet.id] || 0; const next = cur + 1;
      await supabase.from("moon_progress").update({ moon_count: next >= 10 ? 0 : next }).eq("user_id", user.id).eq("planet_id", selectedPlanet.id);

      // ── Planet unlock mechanic — every 3rd journal entry classifies & unlocks a new planet ──
      const totalEntries = Object.values({...moonCounts, [selectedPlanet.id]: next}).reduce((a,b)=>a+b,0);
      if (totalEntries % 3 === 0) {
        const locked = PLANETS.filter(p => !unlockedPlanets.includes(p.id));
        if (locked.length > 0) {
          const newPlanetId = classifyJournalEntry(journalText);
          const targetPlanet = locked.find(p => p.id === newPlanetId) || locked[0];
          const updated = [...unlockedPlanets, targetPlanet.id];
          setUnlockedPlanets(updated);
          await supabase.from("profiles").update({ unlocked_planets: updated }).eq("id", user.id);
          triggerRoulette(targetPlanet.id);
          setTimeout(() => setShowUnlockModal(targetPlanet), 4800);
        }
      }
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
    setJournalOpen(false);
    setSelectedPlanet(null);
    setFutureRevealDate(null);
    } catch (err) {
      console.error("Failed to save entry:", err);
      showToast("Could not save your entry. Check your connection and try again.");
      setSaving(false);
    }
  };

  const saveFutureMessage = async (months) => {
    if (!journalText.trim() || !selectedPlanet || !user) return;
    setSaving(true);
    setRocketLaunching(true);
    try {
      const revealDate = new Date();
      revealDate.setMonth(revealDate.getMonth() + months);
      const { error } = await supabase.from("journal_entries").insert({
        user_id: user.id, planet_id: "moksha", content: journalText, reveal_at: revealDate.toISOString()
      });
      if (error) throw error;

    const cur = moonCounts["moksha"] || 0; const next = cur + 1;
    await supabase.from("moon_progress").update({ moon_count: next >= 10 ? 0 : next }).eq("user_id", user.id).eq("planet_id", "moksha");
    if (next >= 10) {
      const w = window.innerWidth; const h = window.innerHeight;
      const sunCx = w < 768 ? w * 0.78 : w * 0.55; const sunCy = w < 768 ? h / 2 - 20 : h / 2;
      const scale = scaleRef.current; const eR = w < 768 ? 0.75 : 0.4;
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

    setTimeout(() => {
      setRocketLaunching(false);
      setJournalText(""); setSaving(false); setFutureRevealDate(null);
      setJournalOpen(false); setSelectedPlanet(null);
    }, 2800);
    } catch (err) {
      console.error("Failed to send future message:", err);
      showToast("Could not send your message to the future. Try again.");
      setSaving(false); setRocketLaunching(false);
    }
  };

  const loadPastEntries = async (pid) => {
    try {
      const { data, error } = await supabase.from("journal_entries").select("*").eq("user_id", user.id).eq("planet_id", pid).order("created_at", { ascending: false });
      if (error) throw error;
      setPastEntries(data || []); setShowPastEntries(true);
    } catch (err) { console.error("Failed to load entries:", err); showToast("Could not load past entries."); }
  };

  const collectStar = async () => {
    starsRef.current += 1;
    const n = starsRef.current;
    setStarsCollected(n);
    setCursorBlink(true);
    setTimeout(() => setCursorBlink(false), 400);
    try { await supabase.from("profiles").update({ stars_collected: n }).eq("id", user.id); }
    catch (err) { console.error("Star save failed:", err); }
  };

  // ─── Dharma To-Do Functions ───
  const loadDharmaTodos = async () => {
    try {
      const { data, error } = await supabase.from("dharma_todos").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      if (error) throw error;
      setDharmaTodos(data || []); setShowDharmaTodos(true);
    } catch (err) { console.error("Failed to load todos:", err); showToast("Could not load your commitments."); }
  };

  const addDharmaTodo = async () => {
    if (!newTodoText.trim() || !user) return;
    try {
      const { data, error } = await supabase.from("dharma_todos").insert({
        user_id: user.id, content: newTodoText, priority: newTodoPriority,
      }).select().single();
      if (error) throw error;
      setDharmaTodos((prev) => [data, ...prev]);
      setNewTodoText(""); setNewTodoPriority("medium");
    } catch (err) { console.error("Failed to add todo:", err); showToast("Could not save your commitment."); }
  };

  const toggleDharmaTodo = async (id, completed) => {
    try {
      await supabase.from("dharma_todos").update({
        completed: !completed, completed_at: !completed ? new Date().toISOString() : null
      }).eq("id", id);
      setDharmaTodos((prev) => prev.map((t) => t.id === id ? { ...t, completed: !completed, completed_at: !completed ? new Date().toISOString() : null } : t));
    } catch (err) { console.error("Toggle failed:", err); }
  };

  const deleteDharmaTodo = async (id) => {
    try {
      await supabase.from("dharma_todos").delete().eq("id", id);
      setDharmaTodos((prev) => prev.filter((t) => t.id !== id));
    } catch (err) { console.error("Delete failed:", err); showToast("Could not delete commitment."); }
  };

  // ─── Canvas Animation ───
  useEffect(() => {
    if (!user) return;
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
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

    // Comet spawning — random comet every 30-60 seconds
    const spawnComet = () => {
      if (cometsRef.current.length >= 1) return; // max 1 comet at a time
      const comet = COMETS[Math.floor(Math.random() * COMETS.length)];
      const fromLeft = Math.random() > 0.5;
      const w = window.innerWidth; const h = window.innerHeight;
      cometsRef.current.push({
        ...comet,
        x: fromLeft ? -50 : w + 50,
        y: Math.random() * h * 0.6 + h * 0.1,
        vx: fromLeft ? (1 + Math.random() * 0.8) : -(1 + Math.random() * 0.8),
        vy: (Math.random() - 0.5) * 0.5,
        size: 5 + Math.random() * 3,
        life: 1,
        tailParticles: [],
      });
      // Show arrival message from the correct side
      setCometArriving(fromLeft ? "left" : "right");
      setTimeout(() => setCometArriving(null), 3500);
    };
    const cometInterval = setInterval(spawnComet, 30000 + Math.random() * 30000);
    // Spawn first comet after 10 seconds
    setTimeout(spawnComet, 10000);

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
      const cx = w < 768 ? w * 0.78 : w * 0.55; const cy = w < 768 ? h / 2 - 20 : h / 2; const scale = scaleRef.current;
      const eR = w < 768 ? 0.85 : 0.4;
      shootingStarsRef.current.forEach((star) => { const d = Math.hypot(star.x - mx, star.y - my); if (d < 50) { star.caught = true; collectStar(); } });
      // Check Rehesya click — wandering planet
      if (rehesyaPosRef.current) {
        const rd = Math.hypot(rehesyaPosRef.current.x - mx, rehesyaPosRef.current.y - my);
        if (rd < rehesyaPosRef.current.r) {
          if (pendingPass) setShowRehesyaPanel(true);
          else if (newAnswers && !hasActiveQuestion) setShowRehesyaAnswers(true);
          else setShowRehesyaRelease(true);
          return;
        }
      }
      // Check comet clicks
      cometsRef.current.forEach((comet) => {
        const d = Math.hypot(comet.x - mx, comet.y - my);
        if (d < 40) { setActiveComet({ name: comet.name, fact: comet.fact, question: comet.question, color: comet.color }); }
      });
      // Check sun click
      const sunDist = Math.hypot(cx - mx, cy - my);
      const currentSunSize = (sunSize / SUN_BASE_SIZE) * SUN_BASE_SIZE * scale;
      if (sunDist < currentSunSize + 20) {
        // Load all entries grouped by planet for pie chart
        supabase.from("journal_entries").select("planet_id").eq("user_id", user.id).then(({ data }) => {
          if (data) {
            const counts = {};
            data.forEach((e) => { counts[e.planet_id] = (counts[e.planet_id] || 0) + 1; });
            const total = data.length;
            const planetData = PLANETS.map((p) => ({
              id: p.id, name: p.name, color: p.color, meaning: p.meaning,
              count: counts[p.id] || 0,
              percent: total > 0 ? Math.round(((counts[p.id] || 0) / total) * 100) : 0,
            })).filter((p) => p.count > 0).sort((a, b) => b.count - a.count);
            setSunCoreData({ planetData, total, merges: Math.floor(total / 10) });
            setShowSunCore(true);
          }
        });
        return; // Don't also select a planet
      }
      const t = timeRef.current;
      PLANETS.forEach((planet) => {
        const angle = t * planet.speed; const orbit = planet.baseOrbit * scale;
        const size = Math.max(planet.baseSize * scale, 12);
        const px = cx + Math.cos(angle) * orbit; const py = cy + Math.sin(angle) * orbit * eR;
        const dist = Math.hypot(px - mx, py - my);
        const hitR = w < 768 ? Math.max(size + 22, 32) : size + 15;
        if (dist < hitR) {
          if (!unlockedPlanetsRef.current.includes(planet.id)) {
            showToast("Journal more to unlock this planet ✦", "info");
            return;
          }
          setSelectedPlanet(planet); setJournalOpen(false); setShowPastEntries(false); setSelectedMoonEntry(null);
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
      const dt = Math.min(now - lastFrameTime, 33);
      lastFrameTime = now;
      const w = window.innerWidth; const h = window.innerHeight;
      // Offset sun to the right on desktop so outer planets orbit through the left edge
      const cx = w < 768 ? w / 2 : w * 0.55;
      const cy = w < 768 ? h / 2 - 20 : h / 2;
      const scale = scaleRef.current; const eR = w < 768 ? 0.75 : 0.4;
      timeRef.current += dt;

      // ── Roulette energy update ──
      const rou = rouletteRef.current;
      if (rou.spinning) {
        rou.elapsed += dt;
        // Phase timing: charge (1500ms) → transfer (600ms) → done
        if (rou.phase === "charge" && rou.elapsed > 3500) {
          rou.phase = "transfer";
          rou.elapsed = 0;
        } else if (rou.phase === "transfer" && rou.elapsed > 600) {
          rou.phase = "idle";
          rou.spinning = false;
        }
      }

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
      // ─── Deep space background ───
      ctx.fillStyle = "#030108"; ctx.fillRect(0, 0, w, h);

      // Draw cached nebula background (rendered once to offscreen canvas)
      if (!window._shunyaNebulaCache2 || window._shunyaNebulaW !== w || window._shunyaNebulaH !== h) {
        const offscreen = document.createElement("canvas");
        offscreen.width = w; offscreen.height = h;
        const oc = offscreen.getContext("2d");

        const drawNeb = (nx, ny, radius, r, g, b, alpha) => {
          const nb = oc.createRadialGradient(nx, ny, 0, nx, ny, radius);
          nb.addColorStop(0, `rgba(${r},${g},${b},${alpha})`);
          nb.addColorStop(0.3, `rgba(${r},${g},${b},${alpha * 0.5})`);
          nb.addColorStop(0.6, `rgba(${r},${g},${b},${alpha * 0.15})`);
          nb.addColorStop(1, "transparent");
          oc.fillStyle = nb;
          oc.fillRect(nx - radius, ny - radius, radius * 2, radius * 2);
        };

        // Layer 1: Deep base gradient — dark blue-purple wash
        const baseGrad = oc.createRadialGradient(w * 0.5, h * 0.4, 0, w * 0.5, h * 0.4, w * 0.8);
        baseGrad.addColorStop(0, "rgba(15,8,40,0.6)");
        baseGrad.addColorStop(0.5, "rgba(8,4,25,0.3)");
        baseGrad.addColorStop(1, "transparent");
        oc.fillStyle = baseGrad; oc.fillRect(0, 0, w, h);

        // Very subtle deep-space wisps only — no visible colour blobs
        drawNeb(w * 0.1, h * 0.15, w * 0.35, 20, 15, 50, 0.05);
        drawNeb(w * 0.85, h * 0.8, w * 0.30, 15, 10, 40, 0.04);
        drawNeb(w * 0.5, h * 0.9, w * 0.30, 20, 20, 55, 0.04);
        drawNeb(w * 0.75, h * 0.12, w * 0.22, 10, 20, 50, 0.04);

        // Layer 8: Fine star dust — tiny scattered bright points
        for (let i = 0; i < 80; i++) {
          const dx = Math.random() * w; const dy = Math.random() * h;
          const ds = Math.random() * 1.5 + 0.3;
          const da = Math.random() * 0.15 + 0.05;
          const dc = Math.random() > 0.7 ? `rgba(180,160,255,${da})` : `rgba(255,255,255,${da})`;
          oc.beginPath(); oc.arc(dx, dy, ds, 0, Math.PI * 2);
          oc.fillStyle = dc; oc.fill();
        }

        window._shunyaNebulaCache2 = offscreen;
        window._shunyaNebulaW = w;
        window._shunyaNebulaH = h;
      }
      ctx.drawImage(window._shunyaNebulaCache2, 0, 0);

      bgStars.forEach((s) => { s.twinkle += s.speed; const a = 0.3 + Math.sin(s.twinkle) * 0.3; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fillStyle = `rgba(255,255,255,${a})`; ctx.fill(); });

      const t_orb = timeRef.current;

      // ─── ASTEROID BELT between Kaal (390) and Dharma (490) ───
      const beltInner = 415 * scale, beltOuter = 465 * scale;
      for (let i = 0; i < 220; i++) {
        const s1 = Math.sin(i*127.1+42)*0.5+0.5, s2 = Math.sin(i*311.7+17)*0.5+0.5;
        const s3 = Math.sin(i*54.3+99)*0.5+0.5, s4 = Math.sin(i*73.9+31)*0.5+0.5;
        const angle = (i/220)*Math.PI*2 + t_orb*0.000035;
        const r = beltInner + s1*(beltOuter-beltInner);
        const ax = cx+Math.cos(angle)*r, ay = cy+Math.sin(angle)*r*eR;
        const aSize = s2*1.8+0.4, aAlpha = s3*0.35+0.1;
        ctx.beginPath(); ctx.arc(ax, ay, aSize, 0, Math.PI*2);
        ctx.fillStyle = s4>0.75?`rgba(200,180,140,${aAlpha})`:s4>0.5?`rgba(160,150,130,${aAlpha})`:s4>0.25?`rgba(120,110,100,${aAlpha})`:`rgba(185,165,120,${aAlpha})`;
        ctx.fill();
        if (aSize>1.4) { ctx.beginPath(); ctx.arc(ax-aSize*0.3,ay-aSize*0.3,aSize*0.35,0,Math.PI*2); ctx.fillStyle=`rgba(255,245,220,${aAlpha*0.5})`; ctx.fill(); }
      }
      ctx.fillStyle="rgba(185,165,120,0.2)"; ctx.font=`${Math.max(7,8*scale)}px Georgia`; ctx.textAlign="center";
      ctx.fillText("ASTEROID BELT", cx+Math.cos(Math.PI*1.28)*((beltInner+beltOuter)/2), cy+Math.sin(Math.PI*1.28)*((beltInner+beltOuter)/2)*eR);

      PLANETS.forEach((p) => {
        const o = p.baseOrbit * scale;
        const planetAngle = t_orb * p.speed;
        const rou = rouletteRef.current;
        const isTarget = rou.spinning && rou.targetPlanetId === p.id;
        const isCharging = isTarget && rou.phase === "charge";
        const isTransfer = isTarget && rou.phase === "transfer";

        // Charge progress 0→1 over 1500ms
        const chargeProgress = isCharging ? Math.min(rou.elapsed / 3500, 1) : 0;
        // Transfer progress 0→1 over 600ms
        const transferProgress = isTransfer ? Math.min(rou.elapsed / 600, 1) : 0;

        // Base orbit ring — brightens during charge
        ctx.beginPath(); ctx.ellipse(cx, cy, o, o * eR, 0, 0, Math.PI * 2);
        ctx.strokeStyle = isCharging
          ? `rgba(255,255,255,${0.06 + chargeProgress * 0.12})`
          : "rgba(255,255,255,0.06)";
        ctx.lineWidth = 1; ctx.stroke();

        // Full orbit colour glow during charge — entire ring lights up
        if (isCharging && chargeProgress > 0.05) {
          const segments = 60;
          for (let s = 0; s < segments; s++) {
            const sa = (s / segments) * Math.PI * 2;
            const na = ((s + 1) / segments) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(cx + Math.cos(sa) * o, cy + Math.sin(sa) * o * eR);
            ctx.lineTo(cx + Math.cos(na) * o, cy + Math.sin(na) * o * eR);
            // Pulse the alpha with a wave
            const wave = 0.5 + 0.5 * Math.sin(sa * 3 - t_orb * 0.008);
            ctx.strokeStyle = p.color + Math.round(chargeProgress * wave * 0.7 * 255).toString(16).padStart(2, '0');
            ctx.lineWidth = 2.5; ctx.stroke();
          }
          // Outer glow ring
          ctx.beginPath(); ctx.ellipse(cx, cy, o, o * eR, 0, 0, Math.PI * 2);
          ctx.strokeStyle = p.color + Math.round(chargeProgress * 0.3 * 255).toString(16).padStart(2, '0');
          ctx.lineWidth = 5; ctx.stroke();
        }

        // Energy transfer — beam shoots from orbit ring to planet
        if (isTransfer) {
          const ease = 1 - Math.pow(1 - transferProgress, 3);
          // Flash the orbit fading out
          ctx.beginPath(); ctx.ellipse(cx, cy, o, o * eR, 0, 0, Math.PI * 2);
          ctx.strokeStyle = p.color + Math.round((1 - ease) * 0.8 * 255).toString(16).padStart(2, '0');
          ctx.lineWidth = 3; ctx.stroke();
          // Energy beam: from orbit point nearest planet to planet center
          const px2 = cx + Math.cos(planetAngle) * o;
          const py2 = cy + Math.sin(planetAngle) * o * eR;
          const ppx = cx + Math.cos(planetAngle) * o * 0.85;
          const ppy = cy + Math.sin(planetAngle) * o * 0.85 * eR;
          // Beam position interpolates toward planet
          const bx = px2 + (ppx - px2) * ease;
          const by = py2 + (ppy - py2) * ease;
          ctx.beginPath(); ctx.moveTo(px2, py2); ctx.lineTo(bx, by);
          ctx.strokeStyle = p.color + "cc"; ctx.lineWidth = 2; ctx.stroke();
          // Planet burst glow at end of transfer
          if (ease > 0.7) {
            const burstR = (ease - 0.7) / 0.3;
            const burstGlow = ctx.createRadialGradient(ppx, ppy, 0, ppx, ppy, 40 * burstR);
            burstGlow.addColorStop(0, p.color + "88");
            burstGlow.addColorStop(1, "transparent");
            ctx.fillStyle = burstGlow;
            ctx.fillRect(ppx - 40, ppy - 40, 80, 80);
          }
        }

        // Normal color arc that follows the planet
        const arcSpread = 0.8;
        const segments = 40;
        for (let s = 0; s < segments; s++) {
          const segAngle = planetAngle - arcSpread / 2 + (s / segments) * arcSpread;
          const nextAngle = planetAngle - arcSpread / 2 + ((s + 1) / segments) * arcSpread;
          const distFromCenter = Math.abs((s / segments) - 0.5) * 2;
          const alpha = (1 - distFromCenter * distFromCenter) * 0.35;
          const x1 = cx + Math.cos(segAngle) * o;
          const y1 = cy + Math.sin(segAngle) * o * eR;
          const x2 = cx + Math.cos(nextAngle) * o;
          const y2 = cy + Math.sin(nextAngle) * o * eR;
          ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
          ctx.strokeStyle = p.color + Math.round(alpha * 255).toString(16).padStart(2, '0');
          ctx.lineWidth = 2; ctx.stroke();
        }

        // Bright spot at planet position
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
        const glowRadius = pulseSize * (4 + Math.sin(t * 0.0015 + p.baseOrbit) * 1.2);

        const isUnlocked = unlockedPlanetsRef.current.includes(p.id);
        const isRoulettTarget = rouletteRef.current.spinning && rouletteRef.current.targetPlanetId === p.id;

        // ── LOCKED PLANET — dim but hinting at its true colour ──
        if (!isUnlocked) {
          // Orbit ring in planet's colour — faint
          ctx.beginPath(); ctx.ellipse(cx, cy, orbit, orbit * eR, 0, 0, Math.PI * 2);
          ctx.strokeStyle = p.color + "18"; ctx.lineWidth = 1; ctx.stroke();

          const lockedPulse = size * (1 + Math.sin(t * 0.0008 + p.baseOrbit) * 0.05);

          // Outer colour glow — very dim, just a whisper of what it could be
          const outerGlow = ctx.createRadialGradient(px, py, 0, px, py, lockedPulse * 3.5);
          outerGlow.addColorStop(0, p.color + "22");
          outerGlow.addColorStop(0.5, p.color + "0a");
          outerGlow.addColorStop(1, "transparent");
          ctx.fillStyle = outerGlow;
          ctx.fillRect(px - lockedPulse*3.5, py - lockedPulse*3.5, lockedPulse*7, lockedPulse*7);

          // Planet body — dark desaturated version of its colour
          const lockedGrad = ctx.createRadialGradient(px - size*0.25, py - size*0.25, 0, px, py, lockedPulse);
          lockedGrad.addColorStop(0, p.color + "55");  // faint colour at highlight
          lockedGrad.addColorStop(0.4, p.color + "28"); // mid
          lockedGrad.addColorStop(0.8, "rgba(15,12,22,0.85)"); // dark towards edge
          lockedGrad.addColorStop(1, "rgba(8,6,14,0.9)");
          ctx.beginPath(); ctx.arc(px, py, lockedPulse, 0, Math.PI * 2);
          ctx.fillStyle = lockedGrad; ctx.fill();

          // Thin colour rim — just enough to feel alive
          ctx.beginPath(); ctx.arc(px, py, lockedPulse, 0, Math.PI * 2);
          ctx.strokeStyle = p.color + "33"; ctx.lineWidth = 1; ctx.stroke();

          // Question mark in planet's colour
          ctx.fillStyle = p.color + "55";
          ctx.font = `${Math.max(size*0.7, 8)}px Georgia`;
          ctx.textAlign = "center";
          ctx.fillText("?", px, py + size*0.25);

          // Dots below instead of name
          ctx.fillStyle = p.color + "30";
          ctx.font = `${Math.max(7, 8 * scale)}px Georgia`;
          ctx.fillText("· · ·", px, py + size + 16);
          return;
        }

const spinSpeed = 0.0008 + p.baseOrbit * 0.0000005;
        const spinAngle = t * spinSpeed;
        const hlOffsetX = Math.cos(spinAngle) * size * 0.3;
        const hlOffsetY = Math.sin(spinAngle) * size * 0.15;

        // ── Outer glow — stronger, double layer ──
        const gl = ctx.createRadialGradient(px, py, 0, px, py, glowRadius);
        gl.addColorStop(0, p.glow); gl.addColorStop(0.3, p.glow.replace("0.4", "0.12")); gl.addColorStop(0.6, p.glow.replace("0.4", "0.04")); gl.addColorStop(1, "transparent");
        ctx.fillStyle = gl; ctx.fillRect(px - glowRadius, py - glowRadius, glowRadius * 2, glowRadius * 2);

        // Second glow layer for depth
        const gl2 = ctx.createRadialGradient(px, py, 0, px, py, glowRadius * 0.6);
        gl2.addColorStop(0, p.glow.replace("0.4", "0.25")); gl2.addColorStop(1, "transparent");
        ctx.fillStyle = gl2; ctx.fillRect(px - glowRadius * 0.6, py - glowRadius * 0.6, glowRadius * 1.2, glowRadius * 1.2);

        // Shadow underneath
        ctx.beginPath(); ctx.ellipse(px + 2, py + size + 4, size * 0.7, size * 0.15, 0, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,0,0,0.3)"; ctx.fill();

        // ── Planet base body — unique per planet ──
        ctx.beginPath(); ctx.arc(px, py, pulseSize, 0, Math.PI * 2);
        const baseGrad = ctx.createRadialGradient(px + hlOffsetX * 0.3, py + hlOffsetY * 0.3, size * 0.1, px, py, pulseSize);

        if (p.id === "aatma") {
          // Molten copper core — volcanic, burning soul
          baseGrad.addColorStop(0, "#ffd4a8");
          baseGrad.addColorStop(0.3, "#e07840");
          baseGrad.addColorStop(0.7, "#a04520");
          baseGrad.addColorStop(1, "#4a1a08");
        } else if (p.id === "seesha") {
          // Ice mirror — crystalline, reflective, layered blue
          baseGrad.addColorStop(0, "#e8f8ff");
          baseGrad.addColorStop(0.3, "#7dd3fc");
          baseGrad.addColorStop(0.7, "#1e6fa8");
          baseGrad.addColorStop(1, "#0a2a40");
        } else if (p.id === "kaal") {
          // Deep violet — swirling time, cosmic mystery
          baseGrad.addColorStop(0, "#d4b8ff");
          baseGrad.addColorStop(0.3, "#a78bfa");
          baseGrad.addColorStop(0.7, "#6d4aad");
          baseGrad.addColorStop(1, "#2a1650");
        } else if (p.id === "dharma") {
          // Bright pink-magenta — purpose, passion
          baseGrad.addColorStop(0, "#ffd6f7");
          baseGrad.addColorStop(0.3, "#f093fb");
          baseGrad.addColorStop(0.7, "#b050c8");
          baseGrad.addColorStop(1, "#4a1055");
        } else if (p.id === "moksha") {
          // Pure gold core — radiant liberation
          baseGrad.addColorStop(0, "#fffbe8");
          baseGrad.addColorStop(0.3, "#ffd700");
          baseGrad.addColorStop(0.7, "#c8a000");
          baseGrad.addColorStop(1, "#5a4800");
        } else if (p.id === "karma") {
          // Burning red — fire, consequence
          baseGrad.addColorStop(0, "#ffc8c8");
          baseGrad.addColorStop(0.3, "#ff6b6b");
          baseGrad.addColorStop(0.7, "#c82020");
          baseGrad.addColorStop(1, "#4a0808");
        } else if (p.id === "prema") {
          // Rose gold — warm, soft, glowing love
          baseGrad.addColorStop(0, "#ffe8f0");
          baseGrad.addColorStop(0.3, "#e8a0bf");
          baseGrad.addColorStop(0.7, "#b06888");
          baseGrad.addColorStop(1, "#4a2038");
        } else if (p.id === "maya") {
          // Iridescent pink shifting — illusion, shimmer
          baseGrad.addColorStop(0, "#ffd0e8");
          baseGrad.addColorStop(0.3, "#fd79a8");
          baseGrad.addColorStop(0.7, "#c03070");
          baseGrad.addColorStop(1, "#3a0820");
        }
        ctx.fillStyle = baseGrad; ctx.fill();

        // ── Surface texture per planet ──
        ctx.save();
        ctx.beginPath(); ctx.arc(px, py, pulseSize, 0, Math.PI * 2); ctx.clip();

        if (p.id === "aatma") {
          // Volcanic surface cracks
          for (let i = 0; i < 3; i++) {
            const crackAngle = spinAngle + i * 2.1;
            ctx.beginPath();
            ctx.moveTo(px + Math.cos(crackAngle) * size * 0.2, py + Math.sin(crackAngle) * size * 0.15);
            ctx.lineTo(px + Math.cos(crackAngle + 0.5) * size * 0.8, py + Math.sin(crackAngle + 0.3) * size * 0.6);
            ctx.strokeStyle = "rgba(255,160,60,0.15)"; ctx.lineWidth = 1.5; ctx.stroke();
          }
        } else if (p.id === "seesha") {
          // Mirror facets — geometric reflections
          for (let i = 0; i < 3; i++) {
            const fAngle = spinAngle * 0.3 + i * 2.09;
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(px + Math.cos(fAngle)*size*0.7, py + Math.sin(fAngle)*size*0.5);
            ctx.lineTo(px + Math.cos(fAngle+0.8)*size*0.6, py + Math.sin(fAngle+0.8)*size*0.45);
            ctx.closePath();
            ctx.strokeStyle = "rgba(200,240,255,0.08)"; ctx.lineWidth = 0.8; ctx.stroke();
          }
        } else if (p.id === "kaal") {
          // Time spiral rings
          ctx.beginPath(); ctx.ellipse(px, py, pulseSize * 0.7, pulseSize * 0.2, spinAngle * 0.2, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(200,180,255,0.1)"; ctx.lineWidth = 1; ctx.stroke();
          ctx.beginPath(); ctx.ellipse(px, py, pulseSize * 0.5, pulseSize * 0.15, spinAngle * 0.3 + 0.5, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(200,180,255,0.08)"; ctx.lineWidth = 0.8; ctx.stroke();
        } else if (p.id === "moksha") {
          // Golden energy corona
          for (let i = 0; i < 6; i++) {
            const rAngle = spinAngle * 0.3 + i * Math.PI / 3;
            const rLen = size * (0.6 + Math.sin(t * 0.003 + i) * 0.2);
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(px + Math.cos(rAngle) * rLen, py + Math.sin(rAngle) * rLen * 0.7);
            ctx.strokeStyle = "rgba(255,230,100,0.08)"; ctx.lineWidth = 2; ctx.stroke();
          }
        } else if (p.id === "karma") {
          // Burning streaks
          for (let i = 0; i < 3; i++) {
            const sAngle = spinAngle + i * 2.2;
            ctx.beginPath();
            ctx.arc(px + Math.cos(sAngle) * size * 0.3, py + Math.sin(sAngle) * size * 0.25, size * 0.3, sAngle, sAngle + 1.2);
            ctx.strokeStyle = "rgba(255,120,80,0.12)"; ctx.lineWidth = 1.5; ctx.stroke();
          }
        } else if (p.id === "prema") {
          // Soft warm inner glow pulse
          const premaGlow = ctx.createRadialGradient(px, py, 0, px, py, size * 0.5);
          premaGlow.addColorStop(0, `rgba(255,200,220,${0.08 + Math.sin(t * 0.002) * 0.04})`);
          premaGlow.addColorStop(1, "transparent");
          ctx.fillStyle = premaGlow;
          ctx.fillRect(px - size * 0.5, py - size * 0.5, size, size);
        }

        // Terminator line (day/night) — all planets
        const termX = px + hlOffsetX * 2;
        const termGrad = ctx.createLinearGradient(termX - size, py, termX + size, py);
        termGrad.addColorStop(0, "rgba(0,0,0,0.3)");
        termGrad.addColorStop(0.45, "rgba(0,0,0,0.1)");
        termGrad.addColorStop(0.55, "transparent");
        termGrad.addColorStop(1, "transparent");
        ctx.fillStyle = termGrad;
        ctx.fillRect(px - pulseSize, py - pulseSize, pulseSize * 2, pulseSize * 2);
        ctx.restore();

        // ── Specular highlight — brighter, sharper ──
        const specX = px - hlOffsetX * 0.8;
        const specY = py - size * 0.25 + hlOffsetY * 0.5;
        const hl = ctx.createRadialGradient(specX, specY, 0, specX, specY, size * 0.6);
        hl.addColorStop(0, "rgba(255,255,255,0.55)");
        hl.addColorStop(0.2, "rgba(255,255,255,0.2)");
        hl.addColorStop(0.5, "rgba(255,255,255,0.05)");
        hl.addColorStop(1, "transparent");
        ctx.beginPath(); ctx.arc(px, py, pulseSize, 0, Math.PI * 2); ctx.fillStyle = hl; ctx.fill();

        // ── Rim light ──
        const rim = ctx.createRadialGradient(px, py, pulseSize * 0.82, px, py, pulseSize * 1.1);
        rim.addColorStop(0, "transparent"); rim.addColorStop(0.6, p.color + "20");
        rim.addColorStop(0.85, p.color + "12"); rim.addColorStop(1, p.color + "06");
        ctx.beginPath(); ctx.arc(px, py, pulseSize * 1.1, 0, Math.PI * 2); ctx.fillStyle = rim; ctx.fill();

        // ── KARMA RINGS ──
        if (p.id === "karma") {
          const tilt = 0.28;
          ctx.save(); ctx.translate(px, py);
          ctx.beginPath(); ctx.ellipse(0, 0, pulseSize*2.6, pulseSize*0.55*Math.cos(tilt), tilt, Math.PI, Math.PI*2);
          const rb1 = ctx.createLinearGradient(-pulseSize*2.6,0,pulseSize*2.6,0);
          rb1.addColorStop(0,"rgba(255,80,80,0)"); rb1.addColorStop(0.25,"rgba(255,80,80,0.22)"); rb1.addColorStop(0.5,"rgba(255,110,110,0.35)"); rb1.addColorStop(0.75,"rgba(255,80,80,0.22)"); rb1.addColorStop(1,"rgba(255,80,80,0)");
          ctx.strokeStyle=rb1; ctx.lineWidth=pulseSize*0.28; ctx.stroke();
          ctx.beginPath(); ctx.ellipse(0, 0, pulseSize*1.85, pulseSize*0.4*Math.cos(tilt), tilt, Math.PI, Math.PI*2);
          const rb2 = ctx.createLinearGradient(-pulseSize*1.85,0,pulseSize*1.85,0);
          rb2.addColorStop(0,"rgba(200,60,60,0)"); rb2.addColorStop(0.3,"rgba(220,70,70,0.28)"); rb2.addColorStop(0.5,"rgba(255,90,90,0.4)"); rb2.addColorStop(0.7,"rgba(220,70,70,0.28)"); rb2.addColorStop(1,"rgba(200,60,60,0)");
          ctx.strokeStyle=rb2; ctx.lineWidth=pulseSize*0.14; ctx.stroke();
          ctx.restore();
          ctx.beginPath(); ctx.arc(px, py, pulseSize, 0, Math.PI*2); ctx.fillStyle=baseGrad; ctx.fill();
          ctx.save(); ctx.translate(px, py);
          ctx.beginPath(); ctx.ellipse(0, 0, pulseSize*2.6, pulseSize*0.55*Math.cos(tilt), tilt, 0, Math.PI);
          ctx.strokeStyle=rb1; ctx.lineWidth=pulseSize*0.28; ctx.stroke();
          ctx.beginPath(); ctx.ellipse(0, 0, pulseSize*1.85, pulseSize*0.4*Math.cos(tilt), tilt, 0, Math.PI);
          ctx.strokeStyle=rb2; ctx.lineWidth=pulseSize*0.14; ctx.stroke();
          ctx.restore();
        }

        // Planet name
        ctx.fillStyle = p.color; ctx.font = `${Math.max(8, 10 * scale)}px Georgia`; ctx.textAlign = "center";
        ctx.globalAlpha = 0.85; ctx.fillText(p.name, px, py + size + 16); ctx.globalAlpha = 1.0;

        const mc = moonCounts[p.id] || 0;
        for (let i = 0; i < mc; i++) {
          const ma = t*0.002+(i*Math.PI*2)/Math.max(mc,1); const md = size+10+i*3;
          const mmx = px+Math.cos(ma)*md; const mmy = py+Math.sin(ma)*md*0.6;
          const mg = ctx.createRadialGradient(mmx,mmy,0,mmx,mmy,Math.max(3,5*scale));
          mg.addColorStop(0,"rgba(255,255,255,0.5)"); mg.addColorStop(1,"transparent");
          ctx.fillStyle=mg; ctx.fillRect(mmx-5*scale,mmy-5*scale,10*scale,10*scale);
          ctx.beginPath(); ctx.arc(mmx,mmy,Math.max(1.5,2.5*scale),0,Math.PI*2); ctx.fillStyle="rgba(255,255,255,0.8)"; ctx.fill();
        }
      });

      // ─── REHESYA — wandering planet, only in "answer" or "answered" states ───
      if (rehesyaVisibleRef.current) {
        const isAnswered = rehesyaBlinkRef.current; // "answered" state = gold
        // Wander freely across the canvas (not on a fixed orbit)
        const rx = cx + Math.sin(t * 0.00018) * w * 0.26 + Math.cos(t * 0.00009) * w * 0.08;
        const ry = cy + Math.cos(t * 0.00013) * h * 0.2 + Math.sin(t * 0.00021) * h * 0.06;
        const rSize = Math.max(13 * scale, 10);
        const pulse = 1 + Math.sin(t * 0.0018) * 0.08;
        const rps = rSize * pulse;

        // Gold blink when answered, blue glow when answering
        const glowR = isAnswered ? "255,215,0" : "56,189,248";
        const blinkAlpha = isAnswered ? (0.65 + Math.sin(t * 0.006) * 0.35) : 1;

        ctx.globalAlpha = blinkAlpha;

        // Flash ring when answered — gold electric pulse
        if (isAnswered) {
          const flashR = rps * (3 + Math.sin(t * 0.006) * 1.5);
          const flashG = ctx.createRadialGradient(rx, ry, rps, rx, ry, flashR);
          flashG.addColorStop(0, `rgba(255,215,0,${0.22 * Math.abs(Math.sin(t * 0.006))})`);
          flashG.addColorStop(1, "transparent");
          ctx.fillStyle = flashG;
          ctx.fillRect(rx - flashR, ry - flashR, flashR * 2, flashR * 2);
        }

        // Outer glow layers
        for (let g = 3; g >= 1; g--) {
          const gr = ctx.createRadialGradient(rx, ry, 0, rx, ry, rps * (2.2 + g));
          gr.addColorStop(0, `rgba(${glowR},${isAnswered ? 0.2 / g : 0.1 / g})`);
          gr.addColorStop(1, "transparent");
          ctx.fillStyle = gr;
          ctx.fillRect(rx - rps * (2.2 + g), ry - rps * (2.2 + g), rps * (4.4 + g * 2), rps * (4.4 + g * 2));
        }

        // Planet body — blue when answering, gold when answered
        const rg = ctx.createRadialGradient(rx - rps * 0.28, ry - rps * 0.28, 0, rx, ry, rps);
        if (isAnswered) {
          rg.addColorStop(0, "#fffde8"); rg.addColorStop(0.25, "#ffd700");
          rg.addColorStop(0.6, "#b45309"); rg.addColorStop(1, "#451a03");
        } else {
          rg.addColorStop(0, "rgba(255,255,255,0.98)"); rg.addColorStop(0.25, "#bae6fd");
          rg.addColorStop(0.6, "#7dd3fc"); rg.addColorStop(0.85, "#0284c7"); rg.addColorStop(1, "#0c4a6e");
        }
        ctx.beginPath(); ctx.arc(rx, ry, rps, 0, Math.PI * 2);
        ctx.fillStyle = rg; ctx.fill();

        // Orbiting rings — mystery effect
        ctx.save(); ctx.translate(rx, ry); ctx.rotate(t * 0.0005);
        ctx.beginPath(); ctx.ellipse(0, 0, rps * 2.0, rps * 0.55, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${glowR},${0.3 + Math.sin(t * 0.002) * 0.1})`; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.rotate(0.7);
        ctx.beginPath(); ctx.ellipse(0, 0, rps * 1.5, rps * 0.38, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${glowR},${0.15 + Math.sin(t * 0.003) * 0.06})`; ctx.lineWidth = 0.8; ctx.stroke();
        ctx.restore();

        // Specular highlight
        const rhl = ctx.createRadialGradient(rx - rps * 0.3, ry - rps * 0.3, 0, rx, ry, rps * 0.7);
        rhl.addColorStop(0, "rgba(255,255,255,0.6)"); rhl.addColorStop(0.5, "rgba(255,255,255,0.1)"); rhl.addColorStop(1, "transparent");
        ctx.beginPath(); ctx.arc(rx, ry, rps, 0, Math.PI * 2); ctx.fillStyle = rhl; ctx.fill();

        // Label
        ctx.shadowColor = isAnswered ? "rgba(255,215,0,0.9)" : "rgba(56,189,248,0.6)";
        ctx.shadowBlur = isAnswered ? 18 : 8;
        ctx.fillStyle = isAnswered ? "#ffd700" : "#7dd3fc";
        ctx.font = `${Math.max(9, 11 * scale)}px Georgia`; ctx.textAlign = "center";
        ctx.globalAlpha = 0.75 + Math.sin(t * 0.002) * 0.2;
        ctx.fillText("REHESYA", rx, ry + rSize + 18);
        ctx.shadowBlur = 0; ctx.shadowColor = "transparent"; ctx.globalAlpha = 1;

        rehesyaPosRef.current = { x: rx, y: ry, r: rps + 18 };
      }

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

      // ─── Comets ───
      cometsRef.current = cometsRef.current.filter((c) => {
        c.x += c.vx;
        c.y += c.vy;

        // Add tail particles
        c.tailParticles.push({ x: c.x, y: c.y, life: 1 });
        if (c.tailParticles.length > 60) c.tailParticles.shift();

        // Remove if off screen
        if (c.x < -100 || c.x > w + 100) return false;

        // Draw tail
        for (let tp = 0; tp < c.tailParticles.length; tp++) {
          const p = c.tailParticles[tp];
          p.life -= 0.018;
          if (p.life <= 0) continue;
          const tSize = c.size * p.life * 0.6;
          const tGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, tSize * 2);
          tGrad.addColorStop(0, `rgba(${c.tailColor},${p.life * 0.4})`);
          tGrad.addColorStop(1, "transparent");
          ctx.fillStyle = tGrad;
          ctx.fillRect(p.x - tSize * 2, p.y - tSize * 2, tSize * 4, tSize * 4);
        }

        // Draw comet head — bright core with glow
        const headGlow = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.size * 4);
        headGlow.addColorStop(0, `rgba(${c.tailColor},0.5)`);
        headGlow.addColorStop(0.5, `rgba(${c.tailColor},0.15)`);
        headGlow.addColorStop(1, "transparent");
        ctx.fillStyle = headGlow;
        ctx.fillRect(c.x - c.size * 4, c.y - c.size * 4, c.size * 8, c.size * 8);

        ctx.beginPath(); ctx.arc(c.x, c.y, c.size, 0, Math.PI * 2);
        const coreGrad = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.size);
        coreGrad.addColorStop(0, "#ffffff");
        coreGrad.addColorStop(0.4, c.color);
        coreGrad.addColorStop(1, `rgba(${c.tailColor},0.5)`);
        ctx.fillStyle = coreGrad; ctx.fill();

        // Draw comet name label
        ctx.fillStyle = `rgba(${c.tailColor},0.5)`;
        ctx.font = `${mobile ? 9 : 11}px Georgia`;
        ctx.textAlign = "center";
        ctx.fillText(c.name, c.x, c.y - c.size - 8);

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

    return () => { cancelAnimationFrame(animFrameRef.current); clearInterval(shootingInterval); clearInterval(cometInterval); window.removeEventListener("resize", resize); window.removeEventListener("mousemove", handleMouse); window.removeEventListener("touchmove", handleTouchMove); canvas.removeEventListener("click", handleClick); canvas.removeEventListener("touchstart", handleTap); };
  }, [user, moonCounts, sunSize]);

  // ─── Screens ───
  if (checkingAuth) return (
    <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "rgba(255,255,255,0.3)", fontFamily: "Georgia", letterSpacing: "4px" }}>SHUNYA</p>
    </div>
  );
  if (!user) return <AuthPage onAuth={handleAuth} onSignupStart={() => { onboardingInProgress.current = true; }} />;

  // FreeJournal only shows when explicitly triggered via state
  if (showFreeJournal) {
    return <FreeJournal user={user} mobile={mobile} onPlanetUnlocked={(pid) => {
      const p = PLANETS.find(pl => pl.id === pid);
      setUnlockedPlanets(prev => prev.includes(pid) ? prev : [...prev, pid]);
      setShowFreeJournal(false);
      setShowUnlockModal(p);
    }} />;
  }

  // ─── Overlay: determines what's shown over the solar system ───
  const hasOverlay = selectedPlanet !== null || showAgePrompt || showDharmaTodos || showSunCore;

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
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 10 }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "0 28px", height: 56,
            background: "linear-gradient(to bottom, rgba(2,1,8,0.97) 0%, rgba(2,1,8,0.85) 80%, transparent 100%)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(245,166,35,0.08)",
          }}>
            {/* LEFT — Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <span style={{
                color: "#f5a623", fontSize: 20, letterSpacing: 11, fontWeight: 300,
                fontFamily: "Georgia, serif",
                textShadow: "0 0 40px rgba(245,166,35,0.6), 0 0 80px rgba(245,166,35,0.2)",
                animation: "logoGlow 3s ease-in-out infinite alternate",
              }}>SHUNYA</span>
              <div style={{ width: 1, height: 20, background: "rgba(245,166,35,0.15)" }} />
              <span style={{
                color: "rgba(255,255,255,0.35)", fontSize: 11,
                letterSpacing: 3, fontStyle: "italic", fontFamily: "Georgia, serif",
                textShadow: "0 0 12px rgba(255,255,255,0.08)",
              }}>for your 3 am thoughts</span>
            </div>

            {/* RIGHT — Nav */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>

              {/* Start Journal — quick entry, pulses to guide new users */}
              <button onClick={() => setShowQuickJournal(true)} style={{
                background: "linear-gradient(135deg, rgba(245,166,35,0.2), rgba(245,166,35,0.08))",
                border: "1px solid rgba(245,166,35,0.5)",
                borderRadius: 10, padding: "7px 18px", cursor: "pointer",
                color: "#f5a623", fontSize: 11, letterSpacing: 2,
                fontFamily: "Georgia, serif",
                boxShadow: "0 0 18px rgba(245,166,35,0.2)",
                textShadow: "0 0 10px rgba(245,166,35,0.5)",
                display: "flex", alignItems: "center", gap: 7,
                animation: "journalPulse 2.5s ease-in-out infinite",
              }}>✦ Journal</button>

              {/* How it works */}
              <button onClick={() => setShowHowItWorks(true)} style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 10, padding: "7px 16px", cursor: "pointer",
                color: "rgba(255,255,255,0.45)", fontSize: 11, letterSpacing: 2,
                fontFamily: "Georgia, serif", transition: "all 0.2s",
                display: "flex", alignItems: "center", gap: 6,
              }}>✦ How it works</button>

              {/* Planets */}
              <button onClick={() => setShowPlanetNav(!showPlanetNav)} style={{
                background: showPlanetNav ? "rgba(245,166,35,0.15)" : "rgba(255,255,255,0.05)",
                border: `1px solid ${showPlanetNav ? "rgba(245,166,35,0.4)" : "rgba(255,255,255,0.12)"}`,
                borderRadius: 10, padding: "7px 16px", cursor: "pointer",
                color: showPlanetNav ? "#f5a623" : "rgba(255,255,255,0.6)",
                fontSize: 11, letterSpacing: 2, fontFamily: "Georgia, serif",
                transition: "all 0.2s", display: "flex", alignItems: "center", gap: 7,
                boxShadow: showPlanetNav ? "0 0 20px rgba(245,166,35,0.2), inset 0 0 10px rgba(245,166,35,0.05)" : "inset 0 0 0 0 transparent",
              }}><span style={{ fontSize: 7, opacity: 0.7 }}>✦</span> Planets</button>

              {/* Stars */}
              <div style={{
                display: "flex", alignItems: "center", gap: 6, padding: "7px 14px",
                background: "rgba(255,215,0,0.08)", borderRadius: 10,
                border: "1px solid rgba(255,215,0,0.2)",
                boxShadow: "0 0 16px rgba(255,215,0,0.08)",
              }}>
                <span style={{ color: "#ffd700", fontSize: 13, filter: "drop-shadow(0 0 5px rgba(255,215,0,0.7))" }}>★</span>
                <span style={{ color: "rgba(255,215,0,0.9)", fontSize: 12, fontFamily: "Georgia, serif", fontWeight: 300 }}>{starsCollected}</span>
              </div>

              <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.08)", margin: "0 2px" }} />

              {/* Name */}
              <span style={{
                color: "rgba(255,255,255,0.45)", fontSize: 12, letterSpacing: 2,
                fontFamily: "Georgia, serif", fontStyle: "italic",
                padding: "0 8px",
              }}>{anonymousName}</span>

              <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.08)", margin: "0 2px" }} />

              {/* Quote */}
              <button onClick={() => setShowQuote(true)} title="Quote of the day" style={{
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 9, padding: "6px 13px", cursor: "pointer",
                color: "rgba(255,255,255,0.5)", fontSize: 17, fontFamily: "Georgia, serif",
                lineHeight: 1, transition: "all 0.2s",
              }}>"</button>

              {/* Streak */}
              <button onClick={() => setShowStreak(true)} title="Journaling streak" style={{
                background: "rgba(255,100,50,0.07)", border: "1px solid rgba(255,120,60,0.18)",
                borderRadius: 9, padding: "6px 12px", cursor: "pointer", fontSize: 14,
                boxShadow: "0 0 10px rgba(255,100,50,0.06)", transition: "all 0.2s",
              }}>🔥</button>

              {/* Feedback */}
              <button onClick={() => setShowFeedback(true)} style={{
                background: "rgba(245,166,35,0.1)", border: "1px solid rgba(245,166,35,0.28)",
                borderRadius: 9, padding: "7px 18px",
                color: "rgba(245,166,35,0.85)", fontSize: 10, cursor: "pointer",
                letterSpacing: 2, fontFamily: "Georgia, serif",
                boxShadow: "0 0 16px rgba(245,166,35,0.12), inset 0 0 8px rgba(245,166,35,0.04)",
                textShadow: "0 0 12px rgba(245,166,35,0.5)", transition: "all 0.2s",
              }}>FEEDBACK</button>

              {/* Exit */}
              <button onClick={handleLogout} style={{
                background: "transparent", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 9, padding: "7px 14px", color: "rgba(255,255,255,0.25)",
                fontSize: 10, cursor: "pointer", letterSpacing: 2,
                fontFamily: "Georgia, serif", transition: "all 0.2s",
              }}>EXIT</button>
            </div>
          </div>
          {/* Accent line */}
          <div style={{ height: 1, background: "linear-gradient(90deg, transparent 2%, rgba(245,166,35,0.05) 10%, rgba(245,166,35,0.3) 30%, rgba(255,210,80,0.5) 50%, rgba(245,166,35,0.3) 70%, rgba(245,166,35,0.05) 90%, transparent 98%)", boxShadow: "0 0 12px rgba(245,166,35,0.18), 0 1px 20px rgba(245,166,35,0.06)" }} />
        </div>
      )}

      {/* Top bar — Mobile */}
      {mobile && !hasOverlay && (
        <div style={{ position:"absolute", top:0, left:0, right:0, zIndex:10 }}>
          <div style={{ display:"flex", alignItems:"center", padding:"0 14px", height:50, gap:8 }}>
            <button onClick={() => setShowQuickJournal(true)} style={{ flexShrink:0, background:"rgba(245,166,35,0.12)", border:"1px solid rgba(245,166,35,0.4)", borderRadius:8, padding:"5px 14px", cursor:"pointer", color:"#f5a623", fontSize:9, letterSpacing:1.5, fontFamily:"Georgia,serif", animation:"journalPulse 2.5s ease-in-out infinite", whiteSpace:"nowrap" }}>✦ Journal</button>
            <button onClick={() => setShowPlanetNav(!showPlanetNav)} style={{ flexShrink:0, background:showPlanetNav?"rgba(245,166,35,0.14)":"rgba(255,255,255,0.06)", border:`1px solid ${showPlanetNav?"rgba(245,166,35,0.35)":"rgba(255,255,255,0.12)"}`, borderRadius:8, padding:"5px 12px", cursor:"pointer", color:showPlanetNav?"#f5a623":"rgba(255,255,255,0.55)", fontSize:9, letterSpacing:1.5, fontFamily:"Georgia,serif", whiteSpace:"nowrap" }}>✦ Planets</button>
            <button onClick={() => setShowHowItWorks(true)} style={{ flexShrink:0, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, padding:"5px 11px", cursor:"pointer", color:"rgba(255,255,255,0.4)", fontFamily:"Georgia,serif", fontSize:11 }}>?</button>
            <div style={{ flexShrink:0, display:"flex", alignItems:"center", gap:3, padding:"4px 10px", background:"rgba(255,215,0,0.08)", borderRadius:7, border:"1px solid rgba(255,215,0,0.2)" }}>
              <span style={{ color:"#ffd700", fontSize:11, filter:"drop-shadow(0 0 4px rgba(255,215,0,0.6))" }}>★</span>
              <span style={{ color:"rgba(255,215,0,0.9)", fontSize:10 }}>{starsCollected}</span>
            </div>
            <div style={{ width:1, height:14, background:"rgba(255,255,255,0.08)", flexShrink:0 }} />
            <span style={{ color:"rgba(255,255,255,0.35)", fontSize:9, letterSpacing:1, fontStyle:"italic", fontFamily:"Georgia,serif", flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{anonymousName}</span>
          </div>
          <div style={{ height:1, background:"linear-gradient(90deg, transparent 3%, rgba(245,166,35,0.05) 15%, rgba(245,166,35,0.3) 35%, rgba(255,210,80,0.45) 50%, rgba(245,166,35,0.3) 65%, rgba(245,166,35,0.05) 85%, transparent 97%)", boxShadow:"0 0 10px rgba(245,166,35,0.15)" }} />
        </div>
      )}

      {/* Bottom bar — Mobile */}
      {mobile && !hasOverlay && (
        <div style={{ position:"fixed", bottom:0, left:0, right:0, zIndex:10 }}>
          <div style={{ height:1, background:"linear-gradient(90deg, transparent 3%, rgba(245,166,35,0.08) 20%, rgba(245,166,35,0.2) 50%, rgba(245,166,35,0.08) 80%, transparent 97%)" }} />
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-around", padding:"8px 8px 16px", background:"rgba(2,1,8,0.92)", backdropFilter:"blur(16px)" }}>

            {/* Rehesya — hidden when question is traveling, shown otherwise */}
            {!hasActiveQuestion || pendingPass || newAnswers ? (
              <>
                <button onClick={() => { if(pendingPass) setShowRehesyaPanel(true); else if(newAnswers&&!hasActiveQuestion) setShowRehesyaAnswers(true); else setShowRehesyaRelease(true); }} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3, background:"none", border:"none", cursor:"pointer", padding:"2px 6px" }}>
                  <div style={{ width:7, height:7, borderRadius:"50%", background:"#38bdf8", boxShadow:`0 0 ${pendingPass||newAnswers?"10px":"6px"} rgba(56,189,248,${pendingPass||newAnswers?0.9:0.6})`, animation:"rehesyaPulse 1.5s ease-in-out infinite" }} />
                  <span style={{ color:`rgba(56,189,248,${pendingPass||newAnswers?0.9:0.6})`, fontSize:7, letterSpacing:1, fontFamily:"Georgia,serif", whiteSpace:"nowrap" }}>
                    {pendingPass ? "ANSWER ✦" : newAnswers ? "ANSWERS ✦" : "RELEASE ✦"}
                  </span>
                </button>
                <div style={{ width:1, height:28, background:"rgba(255,255,255,0.06)" }} />
              </>
            ) : null}

            <button onClick={() => setShowQuote(true)} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2, background:"none", border:"none", cursor:"pointer", padding:"2px 8px" }}>
              <span style={{ color:"rgba(255,255,255,0.45)", fontSize:20, fontFamily:"Georgia,serif", lineHeight:1 }}>"</span>
              <span style={{ color:"rgba(255,255,255,0.25)", fontSize:7, letterSpacing:1, fontFamily:"Georgia,serif" }}>QUOTE</span>
            </button>

            <button onClick={() => setShowStreak(true)} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2, background:"none", border:"none", cursor:"pointer", padding:"2px 8px" }}>
              <span style={{ fontSize:17 }}>🔥</span>
              <span style={{ color:"rgba(255,255,255,0.25)", fontSize:7, letterSpacing:1, fontFamily:"Georgia,serif" }}>STREAK</span>
            </button>

            <button onClick={() => setShowFeedback(true)} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2, background:"none", border:"none", cursor:"pointer", padding:"2px 8px" }}>
              <span style={{ color:"rgba(245,166,35,0.65)", fontSize:15 }}>✦</span>
              <span style={{ color:"rgba(245,166,35,0.4)", fontSize:7, letterSpacing:1, fontFamily:"Georgia,serif" }}>FEEDBACK</span>
            </button>

            <button onClick={handleLogout} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2, background:"none", border:"none", cursor:"pointer", padding:"2px 8px" }}>
              <span style={{ color:"rgba(255,255,255,0.3)", fontSize:15 }}>↗</span>
              <span style={{ color:"rgba(255,255,255,0.2)", fontSize:7, letterSpacing:1, fontFamily:"Georgia,serif" }}>EXIT</span>
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════ */}
      {/* PLANET NAV — Quick access dropdown       */}
      {/* ═══════════════════════════════════════ */}
      {showPlanetNav && !hasOverlay && (
        <div style={{
          position: "absolute",
          top: mobile ? 56 : 58, right: mobile ? 8 : 20,
          zIndex: 15,
          background: "rgba(6,4,16,0.92)", backdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 20, padding: mobile ? "10px 8px" : "12px 10px",
          display: "flex", flexDirection: "column", gap: 2,
          animation: "overlayIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
          boxShadow: "0 16px 48px rgba(0,0,0,0.6), 0 0 1px rgba(255,255,255,0.05)",
          minWidth: mobile ? 190 : 220,
        }}>
          {/* Nav header */}
          <p style={{ color: "rgba(255,255,255,0.15)", fontSize: 9, letterSpacing: 3, textTransform: "uppercase", padding: "6px 14px 8px", borderBottom: "1px solid rgba(255,255,255,0.04)", marginBottom: 4 }}>Navigate</p>

          {PLANETS.map((p) => (
            <button key={p.id} onClick={() => {
              setShowPlanetNav(false);
              setSelectedPlanet(p);
              setSelectedMoonEntry(null);
              supabase.from("journal_entries").select("*").eq("user_id", user.id).eq("planet_id", p.id).order("created_at", { ascending: false }).then(({ data }) => {
                setPastEntries(data || []);
              });
            }} style={{
              display: "flex", alignItems: "center", gap: mobile ? 10 : 12,
              padding: mobile ? "9px 14px" : "10px 14px",
              background: "transparent", border: "none", borderRadius: 12,
              cursor: "pointer", transition: "background 0.2s",
              textAlign: "left", width: "100%",
            }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.color, boxShadow: `0 0 6px ${p.color}55`, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <span style={{ color: "rgba(255,255,255,0.7)", fontSize: mobile ? 11 : 12, letterSpacing: 1.5, fontFamily: "Georgia, serif", display: "block" }}>{p.name}</span>
              </div>
              {(moonCounts[p.id] || 0) > 0 && (
                <span style={{ color: p.color, fontSize: mobile ? 8 : 9, opacity: 0.5 }}>{moonCounts[p.id]}☽</span>
              )}
            </button>
          ))}
        </div>
      )}



      {/* ═══════════════════════════════════════ */}
      {/* COMET — Philosophical question popup     */}
      {/* ═══════════════════════════════════════ */}
      {activeComet && !selectedPlanet && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 20,
          display: "flex", alignItems: "center", justifyContent: "center",
          animation: "overlayIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        }}>
          {/* Close on background click */}
          <div onClick={() => setActiveComet(null)} style={{ position: "absolute", inset: 0 }} />

          <div style={{
            position: "relative", zIndex: 2, maxWidth: mobile ? "90vw" : 480,
            padding: mobile ? "32px 28px" : "44px 40px", textAlign: "center",
            background: "rgba(10,8,20,0.85)", backdropFilter: "blur(20px)",
            border: `1px solid ${activeComet.color}33`, borderRadius: 24,
            boxShadow: `0 0 40px ${activeComet.color}15, 0 20px 60px rgba(0,0,0,0.5)`,
          }}>
            {/* Comet icon */}
            <div style={{
              width: 12, height: 12, borderRadius: "50%", margin: "0 auto 16px",
              background: activeComet.color, boxShadow: `0 0 15px ${activeComet.color}66`,
            }} />

            {/* Comet name */}
            <h3 style={{
              color: activeComet.color, fontSize: mobile ? 16 : 20,
              letterSpacing: mobile ? 3 : 5, fontWeight: 300, marginBottom: 6,
              fontFamily: "Georgia, serif",
            }}>{activeComet.name}</h3>

            {/* Fact */}
            <p style={{
              color: "rgba(255,255,255,0.25)", fontSize: mobile ? 10 : 12,
              letterSpacing: 1.5, marginBottom: mobile ? 24 : 32,
            }}>{activeComet.fact}</p>

            {/* The philosophical question */}
            <p style={{
              color: "rgba(255,255,255,0.75)", fontSize: mobile ? 15 : 18,
              lineHeight: 1.9, fontFamily: "Georgia, serif", fontStyle: "italic",
            }}>"{activeComet.question}"</p>

            {/* Dismiss */}
            <button onClick={() => setActiveComet(null)} style={{
              marginTop: mobile ? 24 : 32, padding: "10px 28px",
              background: "rgba(255,255,255,0.05)", border: `1px solid ${activeComet.color}33`,
              borderRadius: 12, color: "rgba(255,255,255,0.4)",
              fontSize: 12, cursor: "pointer", fontFamily: "Georgia, serif", letterSpacing: 1.5,
            }}>Continue Exploring</button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════ */}
      {/* SUN CORE — Your inner universe map       */}
      {/* ═══════════════════════════════════════ */}
      {showSunCore && sunCoreData && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 22,
          display: "flex", flexDirection: mobile ? "column" : "row",
          alignItems: "center", justifyContent: "center",
          animation: "overlayIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
          padding: mobile ? "60px 20px 40px" : "40px",
          overflowY: "auto",
        }}>
          {/* Close */}
          <button onClick={() => setShowSunCore(false)} style={{
            position: "absolute", top: mobile ? 16 : 24, right: mobile ? 16 : 24,
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "50%", width: 36, height: 36, color: "rgba(255,255,255,0.5)",
            fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10,
          }}>✕</button>

          {/* LEFT — Pie chart visualization */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginRight: mobile ? 0 : 60, marginBottom: mobile ? 30 : 0 }}>
            {/* SVG Pie Chart */}
            <svg width={mobile ? 200 : 260} height={mobile ? 200 : 260} viewBox="0 0 260 260">
              {(() => {
                const size = 260;
                const cx = size / 2, cy = size / 2, r = 100;
                let cumulative = 0;
                const slices = sunCoreData.planetData.length > 0 ? sunCoreData.planetData : [{ percent: 100, color: "rgba(255,255,255,0.1)" }];

                return slices.map((p, i) => {
                  const pct = Math.max(p.percent, 1);
                  const startAngle = (cumulative / 100) * Math.PI * 2 - Math.PI / 2;
                  cumulative += pct;
                  const endAngle = (cumulative / 100) * Math.PI * 2 - Math.PI / 2;
                  const largeArc = pct > 50 ? 1 : 0;
                  const x1 = cx + r * Math.cos(startAngle);
                  const y1 = cy + r * Math.sin(startAngle);
                  const x2 = cx + r * Math.cos(endAngle);
                  const y2 = cy + r * Math.sin(endAngle);

                  return (
                    <path key={i} d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`}
                      fill={p.color || "rgba(255,255,255,0.05)"}
                      opacity={0.8} stroke="rgba(0,0,0,0.3)" strokeWidth={1}
                    />
                  );
                });
              })()}
              {/* Inner circle — sun core */}
              <circle cx={130} cy={130} r={50} fill="url(#sunCoreGrad)" />
              <defs>
                <radialGradient id="sunCoreGrad">
                  <stop offset="0%" stopColor="#fffbe8" />
                  <stop offset="40%" stopColor="#f5a623" />
                  <stop offset="100%" stopColor="#8a5a00" />
                </radialGradient>
              </defs>
              {/* Center text */}
              <text x={130} y={125} textAnchor="middle" fill="#fff" fontSize={22} fontFamily="Georgia" fontWeight="300">{sunCoreData.total}</text>
              <text x={130} y={145} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize={9} letterSpacing={2} fontFamily="Georgia">ENTRIES</text>
            </svg>

            {/* Stats below chart */}
            <div style={{ display: "flex", gap: mobile ? 20 : 28, marginTop: 20 }}>
              <div style={{ textAlign: "center" }}>
                <span style={{ color: "#f5a623", fontSize: mobile ? 20 : 24, fontFamily: "Georgia, serif", fontWeight: 300 }}>{sunCoreData.merges}</span>
                <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 9, letterSpacing: 2, marginTop: 4 }}>MERGES</p>
              </div>
              <div style={{ textAlign: "center" }}>
                <span style={{ color: "rgba(255,215,0,0.8)", fontSize: mobile ? 20 : 24, fontFamily: "Georgia, serif", fontWeight: 300 }}>{starsCollected}</span>
                <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 9, letterSpacing: 2, marginTop: 4 }}>STARS</p>
              </div>
              <div style={{ textAlign: "center" }}>
                <span style={{ color: "rgba(255,255,255,0.6)", fontSize: mobile ? 20 : 24, fontFamily: "Georgia, serif", fontWeight: 300 }}>{(sunSize / SUN_BASE_SIZE).toFixed(1)}x</span>
                <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 9, letterSpacing: 2, marginTop: 4 }}>SUN SIZE</p>
              </div>
            </div>
          </div>

          {/* RIGHT — Planet breakdown list */}
          <div style={{ maxWidth: mobile ? "100%" : 340, width: "100%" }}>
            <h2 style={{ color: "#f5a623", fontSize: mobile ? 18 : 22, letterSpacing: mobile ? 3 : 5, fontWeight: 300, marginBottom: 6, fontFamily: "Georgia, serif" }}>YOUR CORE</h2>
            <p style={{ color: "rgba(255,255,255,0.2)", fontSize: mobile ? 10 : 11, letterSpacing: 2, marginBottom: mobile ? 20 : 28 }}>Where your soul has traveled</p>

            {sunCoreData.planetData.length === 0 ? (
              <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 13, fontStyle: "italic", fontFamily: "Georgia, serif" }}>
                Your sun is waiting. Start journaling to see your inner universe take shape.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {sunCoreData.planetData.map((p) => (
                  <button key={p.id} onClick={() => {
                    setShowSunCore(false);
                    const planet = PLANETS.find((pl) => pl.id === p.id);
                    if (planet) {
                      setSelectedPlanet(planet); setSelectedMoonEntry(null);
                      supabase.from("journal_entries").select("*").eq("user_id", user.id).eq("planet_id", p.id).order("created_at", { ascending: false }).then(({ data }) => {
                        setPastEntries(data || []);
                      });
                    }
                  }} style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: mobile ? "12px 14px" : "14px 16px",
                    background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)",
                    borderRadius: 14, cursor: "pointer", textAlign: "left", width: "100%",
                    borderLeft: `3px solid ${p.color}`,
                    transition: "background 0.2s",
                  }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: p.color, boxShadow: `0 0 8px ${p.color}44`, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <span style={{ color: "rgba(255,255,255,0.7)", fontSize: mobile ? 12 : 13, letterSpacing: 1.5, fontFamily: "Georgia, serif" }}>{p.name}</span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ color: p.color, fontSize: mobile ? 16 : 18, fontFamily: "Georgia, serif", fontWeight: 300 }}>{p.percent}%</span>
                      <p style={{ color: "rgba(255,255,255,0.15)", fontSize: 9, marginTop: 2 }}>{p.count} {p.count === 1 ? "entry" : "entries"}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
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
          animation: "overlayIn 0.5s ease",
          overflow: "hidden",
        }}>
          {/* ── LEFT / TOP: Planet with orbiting moons ── */}
          <div style={{
            width: mobile ? "100%" : "42%",
            height: mobile ? "38vh" : "100vh",
            display: "flex", alignItems: "center", justifyContent: "center",
            position: "relative", flexShrink: 0,
          }}>
            <div style={{
              width: mobile ? 130 : 180, height: mobile ? 130 : 180, borderRadius: "50%",
              background: `radial-gradient(circle at 38% 38%, rgba(255,255,255,0.15), ${selectedPlanet.color}cc 45%, ${selectedPlanet.color}66 75%, transparent 100%)`,
              boxShadow: `0 0 50px ${selectedPlanet.color}33, 0 0 100px ${selectedPlanet.color}15`,
              animation: "planetPulse 5s ease-in-out infinite",
              position: "relative", zIndex: 2,
              willChange: "transform", transform: "translateZ(0)",
            }} />

            {pastEntries.slice(0, moonCounts[selectedPlanet.id] || 0).map((entry, i) => {
              const totalMoons = Math.min(pastEntries.length, moonCounts[selectedPlanet.id] || 0);
              const orbitRadius = mobile ? 95 + i * 13 : 130 + i * 16;
              const angleOffsetDeg = (i * 360) / Math.max(totalMoons, 1);
              return (
                <div key={entry.id} style={{
                  position: "absolute",
                  width: mobile ? 16 : 20, height: mobile ? 16 : 20, borderRadius: "50%",
                  background: selectedMoonEntry?.id === entry.id
                    ? `radial-gradient(circle, #fff, ${selectedPlanet.color})`
                    : "radial-gradient(circle, rgba(255,255,255,0.7), rgba(180,180,175,0.4))",
                  boxShadow: selectedMoonEntry?.id === entry.id
                    ? `0 0 10px ${selectedPlanet.color}`
                    : "0 0 4px rgba(255,255,255,0.15)",
                  cursor: "pointer", zIndex: 3,
                  animation: `moonOrbit${i} ${15 + i * 3}s linear infinite`,
                  border: selectedMoonEntry?.id === entry.id ? `2px solid ${selectedPlanet.color}` : "1px solid rgba(255,255,255,0.15)",
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

            <button onClick={() => { setSelectedPlanet(null); setSelectedMoonEntry(null); setPastEntries([]); }} style={{
              position: "absolute", top: mobile ? 14 : 20, left: mobile ? 14 : 20,
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 10, padding: "7px 16px", color: "rgba(255,255,255,0.4)",
              fontSize: 12, cursor: "pointer", zIndex: 10, letterSpacing: 1,
            }}>← Back</button>
          </div>

          {/* ── RIGHT / BOTTOM: Description or moon entry ── */}
          <div style={{
            flex: 1, padding: mobile ? "20px 24px 40px" : "60px 48px",
            overflowY: "auto", display: "flex", flexDirection: "column",
            justifyContent: mobile ? "flex-start" : "center",
          }}>
            {selectedMoonEntry ? (
              <div style={{ animation: "fadeIn 0.3s ease" }}>
                <button onClick={() => setSelectedMoonEntry(null)} style={{
                  background: "none", border: "none", color: "rgba(255,255,255,0.35)",
                  fontSize: 12, cursor: "pointer", marginBottom: 24, letterSpacing: 1,
                }}>← Back to {selectedPlanet.name}</button>

                <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 11, letterSpacing: 3, textTransform: "uppercase", marginBottom: 16 }}>
                  {new Date(selectedMoonEntry.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                </p>
                <p style={{
                  color: "rgba(255,255,255,0.7)", fontSize: mobile ? 16 : 18,
                  lineHeight: 2.1,
                }}>{selectedMoonEntry.content}</p>

                {selectedMoonEntry.reveal_at && new Date(selectedMoonEntry.reveal_at) > new Date() && (
                  <p style={{ color: "rgba(255,215,0,0.35)", fontSize: 12, marginTop: 24, fontStyle: "italic" }}>
                    Sealed until {new Date(selectedMoonEntry.reveal_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                )}
              </div>
            ) : (
              <div style={{ animation: "fadeIn 0.3s ease" }}>
                {/* Planet name */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: selectedPlanet.color, boxShadow: `0 0 8px ${selectedPlanet.color}44` }} />
                  <h1 style={{
                    color: selectedPlanet.color, fontSize: mobile ? 24 : 36,
                    letterSpacing: mobile ? 4 : 8, fontWeight: 300,
                  }}>{selectedPlanet.name}</h1>
                </div>
                {selectedPlanet.whisper && (
                  <p style={{
                    color: selectedPlanet.color,
                    fontSize: mobile ? 13 : 15,
                    fontStyle: "italic",
                    fontFamily: "Georgia, serif",
                    letterSpacing: 0.5,
                    opacity: 0.45,
                    marginLeft: 20,
                    marginBottom: 8,
                    fontWeight: 300,
                  }}>{selectedPlanet.whisper}</p>
                )}
                <p style={{
                  color: "rgba(255,255,255,0.25)", fontSize: mobile ? 11 : 12,
                  letterSpacing: 3, marginBottom: mobile ? 24 : 36, marginLeft: 20,
                }}>{selectedPlanet.meaning}</p>

                {/* Description - single block, no headers */}
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: mobile ? 13 : 15, lineHeight: 2, marginBottom: mobile ? 12 : 20, maxWidth: 520 }}>{selectedPlanet.description}</p>
                <p style={{ color: "rgba(255,255,255,0.35)", fontSize: mobile ? 12 : 14, lineHeight: 2, marginBottom: mobile ? 24 : 36, maxWidth: 520, fontStyle: "italic" }}>{selectedPlanet.howItLives}</p>

                {/* Thin separator */}
                <div style={{ width: 40, height: 1, background: `linear-gradient(90deg, ${selectedPlanet.color}33, transparent)`, marginBottom: mobile ? 16 : 24 }} />

                {/* Moon progress - inline */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: mobile ? 20 : 28 }}>
                  <div style={{ display: "flex", gap: 5 }}>
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div key={i} style={{
                        width: 7, height: 7, borderRadius: "50%",
                        background: i < (moonCounts[selectedPlanet.id] || 0) ? selectedPlanet.color : "rgba(255,255,255,0.08)",
                        transition: "all 0.3s"
                      }} />
                    ))}
                  </div>
                  <span style={{ color: "rgba(255,255,255,0.15)", fontSize: 10, letterSpacing: 1 }}>
                    {moonCounts[selectedPlanet.id] || 0}/10
                  </span>
                </div>

                {/* Buttons - unified style */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 340 }}>
                  <button onClick={() => {
                    if (!ageGroup) { setShowAgePrompt(true); return; }
                    if (selectedPlanet.id === "moksha") { setCurrentPrompt(""); setJournalOpen(true); return; }
                    // Use AI-generated prompt if available, otherwise static
                    if (aiPrompt) {
                      setCurrentPrompt(aiPrompt);
                    } else {
                      const prompts = getQuestionsForPlanet(selectedPlanet.id, ageGroup);
                      const lastIdx = promptHistoryRef.current[selectedPlanet.id] ?? -1;
                      let newIdx;
                      do { newIdx = Math.floor(Math.random() * prompts.length); } while (newIdx === lastIdx && prompts.length > 1);
                      promptHistoryRef.current[selectedPlanet.id] = newIdx;
                      setCurrentPrompt(prompts[newIdx]);
                    }
                    setJournalOpen(true);
                  }} style={{
                    padding: mobile ? "14px 24px" : "16px 28px", border: "none", borderRadius: 12,
                    background: `linear-gradient(135deg, ${selectedPlanet.color}, ${selectedPlanet.color}bb)`,
                    color: "#000", fontSize: mobile ? 13 : 14, fontWeight: 600, cursor: "pointer",
                    letterSpacing: 1.5, boxShadow: `0 4px 20px ${selectedPlanet.color}22`,
                    opacity: aiPromptLoading ? 0.85 : 1, transition: "opacity 0.3s",
                  }}>
                    {aiPromptLoading ? "✦ Preparing your question..." : "✦ Start Journaling"}
                  </button>

                  {selectedPlanet.id === "dharma" && (
                    <button onClick={loadDharmaTodos} style={{
                      padding: mobile ? "12px 24px" : "14px 28px",
                      background: "transparent", border: `1px solid ${selectedPlanet.color}33`,
                      borderRadius: 12, cursor: "pointer",
                      color: selectedPlanet.color, fontSize: mobile ? 12 : 13, letterSpacing: 1.5,
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
                color: "rgba(200,195,180,0.4)", fontSize: mobile ? 13 : 16,
                fontStyle: "italic", marginBottom: mobile ? 28 : 44,
                lineHeight: 2.2, textAlign: "center", maxWidth: 560,
                letterSpacing: 0.5, animation: "fadeIn 1.2s ease",
              }}>Moksha asks nothing of you.<br/>Write freely — to yourself, to the universe, or to who you will become.</p>
            ) : (
              <div style={{ marginBottom: mobile ? 28 : 44, textAlign: "center", maxWidth: 580 }}>
                <p style={{
                  color: "rgba(200,196,188,0.55)", fontSize: mobile ? 14 : 17,
                  fontStyle: "italic", lineHeight: 2.2, letterSpacing: 0.3,
                  animation: "fadeIn 1.2s ease",
                  textShadow: "0 1px 8px rgba(0,0,0,0.4)",
                  marginBottom: 12,
                }}>"{currentPrompt}"</p>
                {/* Regenerate — only available if not already typing */}
                {!journalText.trim() && (
                  <button onClick={() => {
                    regenerateAIPrompt();
                    // Also refresh from static as fallback
                    if (!aiPromptLoading) {
                      const prompts = getQuestionsForPlanet(selectedPlanet.id, ageGroup);
                      const lastIdx = promptHistoryRef.current[selectedPlanet.id] ?? -1;
                      let newIdx;
                      do { newIdx = Math.floor(Math.random() * prompts.length); } while (newIdx === lastIdx && prompts.length > 1);
                      promptHistoryRef.current[selectedPlanet.id] = newIdx;
                      setCurrentPrompt(aiPrompt || prompts[newIdx]);
                    }
                  }} style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: "rgba(180,175,165,0.25)", fontSize: 10,
                    letterSpacing: 2, fontFamily: "Georgia,serif",
                    transition: "color 0.2s",
                  }}>↻ different question</button>
                )}
              </div>
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
                width: "100%", height: mobile ? "320px" : "440px",
                padding: mobile ? "28px 24px" : "40px 40px",
                background: "rgba(0,0,0,0.2)",
                border: "1px solid rgba(150,148,140,0.1)",
                borderRadius: 24,
                color: "rgba(230,226,218,0.92)",
                fontSize: mobile ? 17 : 20, lineHeight: 2.4,
                resize: "none", outline: "none", fontFamily: "Georgia, serif",
                boxSizing: "border-box", letterSpacing: 0.5,
                boxShadow: "inset 0 2px 20px rgba(0,0,0,0.2)",
                transition: "border-color 0.3s ease",
                WebkitOverflowScrolling: "touch",
              }}
            />

            {/* Word count */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 6, marginBottom: -8 }}>
              <span style={{
                color: journalText.trim().split(/\s+/).filter(Boolean).length > 0 ? "rgba(200,196,188,0.28)" : "transparent",
                fontSize: 10, fontFamily: "Georgia, serif", letterSpacing: 1,
                transition: "color 0.3s",
              }}>
                {journalText.trim().split(/\s+/).filter(Boolean).length} words
              </span>
            </div>

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

      {/* ═══════════════════════════════════════ */}
      {/* COMET ARRIVAL — edge notification        */}
      {/* ═══════════════════════════════════════ */}
      {cometArriving && !hasOverlay && (
        <div style={{
          position: "fixed",
          top: "50%",
          [cometArriving === "left" ? "left" : "right"]: 0,
          transform: cometArriving === "left"
            ? "translateY(-50%) translateX(0)"
            : "translateY(-50%) translateX(0)",
          zIndex: 50,
          pointerEvents: "none",
          animation: "cometArrivalIn 0.6s cubic-bezier(0.16,1,0.3,1)",
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "12px 20px",
            background: "rgba(4,2,14,0.85)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(135,206,250,0.2)",
            borderRadius: cometArriving === "left" ? "0 20px 20px 0" : "20px 0 0 20px",
            boxShadow: "0 0 30px rgba(135,206,250,0.08)",
          }}>
            {cometArriving === "left" && (
              <span style={{ color: "rgba(135,206,250,0.7)", fontSize: 14 }}>☄</span>
            )}
            <div>
              <p style={{
                color: "rgba(135,206,250,0.85)", fontSize: mobile ? 10 : 11,
                letterSpacing: 3, fontFamily: "Georgia,serif",
                whiteSpace: "nowrap",
              }}>SOMETHING IS COMING</p>
              <p style={{
                color: "rgba(255,255,255,0.25)", fontSize: mobile ? 9 : 10,
                letterSpacing: 2, fontFamily: "Georgia,serif",
                marginTop: 2,
              }}>
                {cometArriving === "left" ? "from the left →" : "← from the right"}
              </p>
            </div>
            {cometArriving === "right" && (
              <span style={{ color: "rgba(135,206,250,0.7)", fontSize: 14 }}>☄</span>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════ */}
      {/* REHESYA — Wandering planet panel         */}
      {/* ═══════════════════════════════════════ */}
      {showRehesyaAnswers && (
        <RehesyaAnswers user={user} answers={myAnswers} mobile={mobile} onClose={() => setShowRehesyaAnswers(false)} />
      )}
      {showRehesyaPanel && pendingPass && (
        <RehesyaPanel user={user} rehesyaPass={pendingPass} mobile={mobile}
          onAnswered={() => { setShowRehesyaPanel(false); refreshRehesya(); showToast("Your answer travels into the unknown.", "success"); }}
          onSkipped={() => { setShowRehesyaPanel(false); refreshRehesya(); }}
        />
      )}
      {showRehesyaRelease && (
        <RehesyaRelease user={user} mobile={mobile}
          onClose={() => setShowRehesyaRelease(false)}
          onReleased={() => { refreshRehesya(); }}
        />
      )}
      {/* Rehesya bottom button — only shows in answer or answered state, hidden when traveling or idle */}
      {!hasOverlay && !showRehesyaPanel && (rehesyaState === "answer" || rehesyaState === "answered" || rehesyaState === "idle") && (
        <div
          onClick={() => {
            if (rehesyaState === "answered") setShowRehesyaAnswers(true);
            else if (rehesyaState === "answer") setShowRehesyaPanel(true);
            else setShowRehesyaRelease(true);
          }}
          style={{
            position: "fixed",
            bottom: mobile ? 72 : 36,
            left: "50%", transform: "translateX(-50%)",
            zIndex: 50, cursor: "pointer",
            animation: "rehesyaPulse 2.5s ease-in-out infinite",
            display: "flex", alignItems: "center", gap: 8,
            padding: mobile ? "8px 18px" : "11px 24px",
            background: "rgba(4,2,14,0.92)",
            backdropFilter: "blur(16px)",
            border: `1px solid rgba(${rehesyaState === "answered" ? "255,215,0" : "56,189,248"},${rehesyaState === "answered" ? "0.5" : rehesyaState === "answer" ? "0.35" : "0.15"})`,
            borderRadius: 40,
            boxShadow: `0 0 ${rehesyaState === "answered" ? "60px rgba(255,215,0,0.25)" : rehesyaState === "answer" ? "40px rgba(56,189,248,0.18)" : "20px rgba(56,189,248,0.08)"}`,
            transition: "all 0.6s ease",
          }}
        >
          <div style={{
            width: mobile ? 7 : 9, height: mobile ? 7 : 9, borderRadius: "50%",
            background: rehesyaState === "answered" ? "#ffd700" : "#38bdf8",
            boxShadow: `0 0 ${rehesyaState === "answered" ? "10px rgba(255,215,0,0.9)" : "8px rgba(56,189,248,0.8)"}`,
            animation: "rehesyaPulse 1.5s ease-in-out infinite",
          }} />
          <span style={{
            color: rehesyaState === "answered" ? "#ffd700" : rehesyaState === "answer" ? "#38bdf8" : "rgba(56,189,248,0.5)",
            fontSize: mobile ? 9 : 11, letterSpacing: mobile ? 2 : 3,
            fontFamily: "Georgia,serif", whiteSpace: "nowrap",
          }}>
            {rehesyaState === "answered"
              ? "✦ UNIVERSE HAS ANSWERED"
              : rehesyaState === "answer"
              ? "ANSWER THE UNIVERSE"
              : "✦ RELEASE A QUESTION"}
          </span>
        </div>
      )}

      {/* Quote of the Day Modal */}
      {showQuote && (
        <div onClick={() => setShowQuote(false)} style={{
          position:"fixed", inset:0, zIndex:200,
          display:"flex", alignItems:"center", justifyContent:"center",
          background:"rgba(0,0,0,0.75)", backdropFilter:"blur(20px)",
          animation:"overlayIn 0.4s cubic-bezier(0.16,1,0.3,1)",
        }}>
          <div onClick={e=>e.stopPropagation()} style={{
            maxWidth: mobile?"88vw":500,
            background:"rgba(5,3,15,0.98)",
            border:"1px solid rgba(245,166,35,0.14)",
            borderRadius:28,
            padding: mobile?"44px 28px 36px":"64px 56px 52px",
            textAlign:"center", position:"relative",
            boxShadow:"0 0 100px rgba(245,166,35,0.07), 0 40px 80px rgba(0,0,0,0.8)",
          }}>
            <button onClick={()=>setShowQuote(false)} style={{ position:"absolute",top:18,right:22,background:"none",border:"none",color:"rgba(255,255,255,0.18)",fontSize:16,cursor:"pointer" }}>✕</button>
            <div style={{ fontSize:mobile?80:100,lineHeight:0.9,color:"rgba(245,166,35,0.08)",fontFamily:"Georgia,serif",marginBottom:-10,userSelect:"none" }}>"</div>
            <p style={{
              color:"rgba(255,255,255,0.85)", fontSize:mobile?16:20,
              fontStyle:"italic", fontFamily:"Georgia,serif",
              lineHeight:1.9, letterSpacing:0.4, fontWeight:300, marginBottom:32,
            }}>{getDailyQuote()}</p>
            <div style={{ width:36,height:1,background:"rgba(245,166,35,0.25)",margin:"0 auto 18px" }} />
            <p style={{ color:"rgba(255,255,255,0.15)",fontSize:9,letterSpacing:6,fontFamily:"Georgia,serif",textTransform:"uppercase" }}>today's reflection</p>
          </div>
        </div>
      )}

      {showQuote && (
        <div onClick={() => setShowQuote(false)} style={{ position:"fixed",inset:0,zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.75)",backdropFilter:"blur(20px)",animation:"overlayIn 0.4s cubic-bezier(0.16,1,0.3,1)" }}>
          <div onClick={e=>e.stopPropagation()} style={{ maxWidth:mobile?"88vw":500,background:"rgba(5,3,15,0.98)",border:"1px solid rgba(245,166,35,0.14)",borderRadius:28,padding:mobile?"44px 28px 36px":"64px 56px 52px",textAlign:"center",position:"relative",boxShadow:"0 0 100px rgba(245,166,35,0.07),0 40px 80px rgba(0,0,0,0.8)" }}>
            <button onClick={()=>setShowQuote(false)} style={{ position:"absolute",top:18,right:22,background:"none",border:"none",color:"rgba(255,255,255,0.18)",fontSize:16,cursor:"pointer" }}>✕</button>
            <div style={{ fontSize:mobile?80:100,lineHeight:0.9,color:"rgba(245,166,35,0.08)",fontFamily:"Georgia,serif",marginBottom:-10,userSelect:"none" }}>"</div>
            <p style={{ color:"rgba(255,255,255,0.85)",fontSize:mobile?16:20,fontStyle:"italic",fontFamily:"Georgia,serif",lineHeight:1.9,letterSpacing:0.4,fontWeight:300,marginBottom:32 }}>{getDailyQuote()}</p>
            <div style={{ width:36,height:1,background:"rgba(245,166,35,0.25)",margin:"0 auto 18px" }} />
            <p style={{ color:"rgba(255,255,255,0.15)",fontSize:9,letterSpacing:6,fontFamily:"Georgia,serif",textTransform:"uppercase" }}>today's reflection</p>
          </div>
        </div>
      )}

      {/* How It Works Modal */}
      {showHowItWorks && (
        <HowItWorks mobile={mobile} onClose={() => { localStorage.setItem("shunya_hiw_seen","1"); setShowHowItWorks(false); }} onJournal={() => { localStorage.setItem("shunya_hiw_seen","1"); setShowHowItWorks(false); setShowQuickJournal(true); }} />
      )}

      {/* Quick Journal Modal */}
      {showQuickJournal && (
        <QuickJournal
          user={user}
          unlockedPlanets={unlockedPlanets}
          moonCounts={moonCounts}
          mobile={mobile}
          onDone={(planetId, isNew, planet) => {
            setShowQuickJournal(false);
            if (planetId) {
              setMoonCounts(prev => ({ ...prev, [planetId]: Math.min((prev[planetId]||0)+1, 9) }));
              if (isNew && planet) {
                setUnlockedPlanets(prev => prev.includes(planetId) ? prev : [...prev, planetId]);
                triggerRoulette(planetId);
                setTimeout(() => setShowUnlockModal(planet), 4800);
              }
            }
          }}
        />
      )}

      {/* Planet Unlock Modal */}
      {showUnlockModal && (
        <UnlockModal planet={showUnlockModal} mobile={mobile} onClose={() => setShowUnlockModal(null)} />
      )}

      {/* Feedback Form */}
      {showFeedback && (
        <FeedbackForm user={user} mobile={mobile} onClose={() => setShowFeedback(false)} />
      )}

      {/* Streak Tracker */}
      {showStreak && (
        <StreakTracker user={user} mobile={mobile} onClose={() => setShowStreak(false)} />
      )}

      {/* ═══════════════════════════════════════ */}
      {/* TOAST NOTIFICATION                        */}
      {/* ═══════════════════════════════════════ */}
      {toast && (
        <div style={{
          position: "fixed", bottom: mobile ? 24 : 36, left: "50%", transform: "translateX(-50%)",
          zIndex: 9999, animation: "toastIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          padding: mobile ? "14px 24px" : "16px 32px",
          background: toast.type === "error" ? "rgba(255,60,60,0.15)" : "rgba(78,205,196,0.15)",
          border: `1px solid ${toast.type === "error" ? "rgba(255,60,60,0.3)" : "rgba(78,205,196,0.3)"}`,
          borderRadius: 16, backdropFilter: "blur(20px)",
          color: toast.type === "error" ? "rgba(255,150,150,0.9)" : "rgba(150,255,230,0.9)",
          fontSize: mobile ? 12 : 13, fontFamily: "Georgia, serif",
          letterSpacing: 0.5, maxWidth: mobile ? "90vw" : 440, textAlign: "center",
        }}>{toast.message}</div>
      )}

      {/* ─── CSS — Shunya Design System ─── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&display=swap');
        @keyframes overlayIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(-50%) translateY(20px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
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
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.03); }
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes cometArrivalIn {
          from { opacity: 0; transform: translateY(-50%) translateX(var(--slide-dir, -20px)); }
          to   { opacity: 1; transform: translateY(-50%) translateX(0); }
        }
        @keyframes rehesyaPulse {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        @keyframes rehesyaFadeOut {
          0% { opacity: 1; transform: scale(1); filter: blur(0px); }
          40% { opacity: 0.7; transform: scale(1.08); filter: blur(2px); }
          100% { opacity: 0; transform: scale(0.5); filter: blur(20px); }
        }
        @keyframes rehesyaArrive {
          from { opacity: 0; filter: blur(10px); }
          to { opacity: 1; filter: blur(0px); }
        }
        @keyframes rehesyaDepart {
          0% { opacity: 1; filter: blur(0px); }
          60% { opacity: 0.5; filter: blur(4px); }
          100% { opacity: 0; filter: blur(18px); }
        }
          0%, 100% { opacity: 0.7; box-shadow: 0 0 30px rgba(56,189,248,0.12); }
          50% { opacity: 1; box-shadow: 0 0 55px rgba(56,189,248,0.35); }
        }
        @keyframes journalPulse {
          0%, 100% { box-shadow: 0 0 10px rgba(245,166,35,0.2), 0 0 0 0 rgba(245,166,35,0); border-color: rgba(245,166,35,0.4); }
          50% { box-shadow: 0 0 22px rgba(245,166,35,0.5), 0 0 12px 2px rgba(245,166,35,0.12); border-color: rgba(245,166,35,0.75); }
        }
        @keyframes logoGlow {
          from { text-shadow: 0 0 30px rgba(245,166,35,0.4), 0 0 60px rgba(245,166,35,0.15); }
          to   { text-shadow: 0 0 55px rgba(245,166,35,0.75), 0 0 100px rgba(245,166,35,0.28); }
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        canvas { -webkit-backface-visibility: hidden; backface-visibility: hidden; }
        html, body { margin: 0; overflow: hidden; touch-action: none; -webkit-overflow-scrolling: touch; font-family: 'Cormorant Garamond', Georgia, serif; }
        canvas { -webkit-backface-visibility: hidden; backface-visibility: hidden; }
        textarea::placeholder { color: rgba(255,255,255,0.2); }
        input::placeholder { color: rgba(255,255,255,0.2); }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        button { font-family: 'Cormorant Garamond', Georgia, serif; }
        h1, h2, h3, h4, p, span { font-family: 'Cormorant Garamond', Georgia, serif; }
      `}</style>
    </div>
  );
}
