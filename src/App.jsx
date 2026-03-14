import { useEffect, useRef, useState } from "react";

const PLANETS = [
  {
    id: "aatma", name: "AATMA", meaning: "The Soul · आत्मा",
    description: "Aatma is the eternal soul — the part of you that existed before your name, your job, your wounds, and your achievements. It is not your personality. It is not your story. It is the pure awareness watching the story unfold.<br><br>In the Hindu tradition, Aatma is considered identical to Brahman — the universal consciousness. To know your Aatma is to know that you are not separate from the universe. You are it.",
    significance: "In your life, Aatma speaks in the quiet moments — in the feeling that something is 'off' even when everything looks fine, or the inexplicable sense of peace in certain places or people. It is your compass when the mind is too loud. When you journal here, you are not writing thoughts. You are letting the soul speak without interruption.",
    prompt: "What does your soul long for today, beyond what the world can see?",
    color: "#9b72cf", glow: "rgba(155,114,207,.5)", size: 18, orbitR: 130, speed: 0.00022, startAngle: 0.8,
    gradient: ["#c4a0ff", "#7a4dbf", "#3d1870"],
  },
  {
    id: "pranaa", name: "PRANAA", meaning: "The Life Force · प्राण",
    description: "Pranaa is the vital breath — the animating energy that flows through every living being. It is not oxygen alone. Ancient yogic texts describe Prana as the intelligence behind every heartbeat, every synapse, every moment your body chooses life over stillness.<br><br>Prana flows through invisible channels called nadis, and when it moves freely, you feel alive, creative, and grounded. When it is blocked, you feel drained, anxious, or disconnected.",
    significance: "In your daily life, Pranaa shows up as your energy levels, your enthusiasm, and your capacity to feel. When you wake up excited — that is Prana. When you feel the urge to dance, to create, to love deeply — that is Prana moving. This planet is where you track what feeds you and what drains you.",
    prompt: "What gave you energy today — and what quietly took it away?",
    color: "#4dbf8c", glow: "rgba(77,191,140,.5)", size: 22, orbitR: 195, speed: 0.00016, startAngle: 2.1,
    gradient: ["#72ffcb", "#2d9e6f", "#0d4a32"],
  },
  {
    id: "kaal", name: "KAAL", meaning: "Time & Fate · काल",
    description: "Kaal means both time and death in Sanskrit — not as opposites, but as the same sacred force. Every moment that passes is a small death of what was. Kaal is the great teacher who reminds us that nothing is permanent, and that this impermanence is not tragedy — it is liberation.<br><br>Kaal governs cycles: the seasons, the breath, the rise and fall of civilizations.",
    significance: "In your life, Kaal appears when you are haunted by the past or anxious about the future. It is the weight of regret and the shadow of anticipation. But Kaal also holds the memory of your growth — every scar that became a teacher, every ending that made room for something truer.",
    prompt: "What from your past still holds power over you — and are you ready to release it?",
    color: "#6b8ccc", glow: "rgba(107,140,204,.5)", size: 16, orbitR: 255, speed: 0.00013, startAngle: 4.2,
    gradient: ["#a0b8f0", "#4a6aad", "#1a2d5a"],
  },
  {
    id: "dharma", name: "DHARMA", meaning: "Sacred Duty · धर्म",
    description: "Dharma is one of the most complex words in the Sanskrit language. It cannot be fully translated. It is your duty, your nature, your cosmic role, and your moral compass — all at once. The Bhagavad Gita teaches that it is better to fulfill your own Dharma imperfectly than to perform another's perfectly.<br><br>Dharma is not imposed from outside. It arises from within.",
    significance: "In your life, Dharma is the answer to 'why am I here?' It shows up as the work that makes you feel like yourself, the values you refuse to compromise under pressure, and the quiet guilt when you live out of alignment. This planet is where you find your way back.",
    prompt: "What did you do today that felt true to who you really are?",
    color: "#cc9b4d", glow: "rgba(204,155,77,.5)", size: 26, orbitR: 315, speed: 0.0001, startAngle: 1.5,
    gradient: ["#f0c97a", "#a87030", "#4a2d0a"],
  },
  {
    id: "moksha", name: "MOKSHA", meaning: "Liberation · मोक्ष",
    description: "Moksha is the ultimate goal of the Hindu spiritual tradition — liberation from the cycle of birth, death, and rebirth. But in everyday life, Moksha is the small liberations: letting go of a grudge, releasing an identity that no longer fits, forgiving yourself for who you were.<br><br>Moksha is also the realm of the future self.",
    significance: "In your life, Moksha calls when you are ready to let something go. It is the exhale after years of holding your breath. Journal here when you feel the weight of something that needs releasing — an emotion, a story, an old version of yourself. This is the sacred act of setting yourself free.",
    prompt: "Dear future self — what do you want them to know about where you are right now?",
    color: "#e8d4a0", glow: "rgba(232,212,160,.55)", size: 20, orbitR: 380, speed: 0.00008, startAngle: 3.0,
    gradient: ["#fff8dc", "#d4a84b", "#6b4a1a"],
  },
  {
    id: "karma", name: "KARMA", meaning: "Sacred Action · कर्म",
    description: "Karma is not punishment. That is a misunderstanding the modern world has carried too long. Karma simply means action — and its inevitable echo. Every thought, word, and deed sends a ripple into the field of existence. Those ripples return, not as reward or revenge, but as the universe reflecting you back to yourself.",
    significance: "In your life, Karma asks you to take responsibility — not with guilt, but with power. It shows up in the patterns you keep repeating, the relationships that feel strangely familiar, and the moments when you realize that how you treat others mirrors how you treat yourself.",
    prompt: "What action did you take today that you are proud of — or wish you could undo?",
    color: "#cf7272", glow: "rgba(207,114,114,.5)", size: 15, orbitR: 440, speed: 0.00007, startAngle: 5.1,
    gradient: ["#ff9a9a", "#a04040", "#4a1010"],
  },
  {
    id: "akasha", name: "AKASHA", meaning: "The Infinite Space · आकाश",
    description: "Akasha is the fifth element in Hindu cosmology — the element that contains all others. It is space itself: the silence between words, the pause between heartbeats, the vast emptiness that makes form possible. Akasha is the medium through which all consciousness travels.",
    significance: "In your life, Akasha is the experience of pure being. Not doing, not thinking — just existing in this moment, in this body, in this strange and beautiful world. Journal here when you want to write without purpose. No goal. No resolution. Just the raw stream of your consciousness.",
    prompt: "Without thinking about what is 'right' to write — what is simply here, right now?",
    color: "#7ab8cc", glow: "rgba(122,184,204,.5)", size: 19, orbitR: 500, speed: 0.00006, startAngle: 0.3,
    gradient: ["#b0e8ff", "#4a9ab8", "#0d3a4f"],
  },
  {
    id: "maya", name: "MAYA", meaning: "The Illusion · माया",
    description: "Maya is one of the most profound concepts in Vedantic philosophy. It is the cosmic illusion — the veil that makes the one appear as many, the eternal appear as temporary. Maya is why we suffer: because we mistake the dream for reality.<br><br>But Maya is not evil. It is the game the universe plays with itself.",
    significance: "In your life, Maya is every story you tell yourself that is not quite true. It is 'I am not enough,' 'they don't care,' 'nothing will ever change.' These stories feel real — but they are the mind's interpretations, not facts. Journal here when you want to examine the narratives beneath your experience.",
    prompt: "What story are you telling yourself right now that might not be the whole truth?",
    color: "#b87aab", glow: "rgba(184,122,171,.5)", size: 17, orbitR: 565, speed: 0.000045, startAngle: 2.7,
    gradient: ["#e8aadd", "#904a88", "#3d1038"],
  },
];

export default function App() {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const stateRef = useRef({
    planetAngles: Object.fromEntries(PLANETS.map((p) => [p.id, p.startAngle])),
    moons: Object.fromEntries(PLANETS.map((p) => [p.id, []])),
    entries: Object.fromEntries(PLANETS.map((p) => [p.id, 0])),
    sunScale: 1,
    shootingStars: [],
    comets: [],
    starTimer: 0,
    cometTimer: 0,
    nextStarTime: 2000,
    nextCometTime: 8000,
    mouseX: 0,
    mouseY: 0,
    stars: 0,
  });

  const [stars, setStars] = useState(0);
  const [activePlanet, setActivePlanet] = useState(null);
  const [showSunPanel, setShowSunPanel] = useState(false);
  const [showJournal, setShowJournal] = useState(false);
  const [journalText, setJournalText] = useState("");
  const [planetPositions, setPlanetPositions] = useState({});
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [nearStar, setNearStar] = useState(false);
  const [toast, setToast] = useState("");
  const [showToast, setShowToast] = useState(false);
  const toastRef = useRef(null);

  const cx = typeof window !== "undefined" ? window.innerWidth / 2 : 500;
  const cy = typeof window !== "undefined" ? window.innerHeight / 2 : 400;

  function showToastMsg(msg) {
    setToast(msg);
    setShowToast(true);
    clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setShowToast(false), 3000);
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const bgStars = Array.from({ length: 280 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.2,
      opacity: Math.random() * 0.7 + 0.1,
      twinkle: Math.random() * Math.PI * 2,
      ts: (Math.random() * 0.5 + 0.2) * 0.01,
    }));

    function spawnShootingStar() {
      const side = Math.random();
      let x, y, angle;
      if (side < 0.25) { x = -10; y = Math.random() * window.innerHeight; angle = Math.random() * 40 - 20; }
      else if (side < 0.5) { x = window.innerWidth + 10; y = Math.random() * window.innerHeight; angle = 180 + Math.random() * 40 - 20; }
      else if (side < 0.75) { x = Math.random() * window.innerWidth; y = -10; angle = 90 + Math.random() * 40 - 20; }
      else { x = Math.random() * window.innerWidth; y = window.innerHeight + 10; angle = 270 + Math.random() * 40 - 20; }
      const speed = 0.35 + Math.random() * 0.3;
      stateRef.current.shootingStars.push({
        x, y,
        vx: Math.cos((angle * Math.PI) / 180) * speed,
        vy: Math.sin((angle * Math.PI) / 180) * speed,
        angle, trail: 40 + Math.random() * 60, caught: false,
        id: Date.now() + Math.random(),
      });
    }

    function spawnComet() {
      const fromLeft = Math.random() > 0.5;
      const x = fromLeft ? -20 : window.innerWidth + 20;
      const y = Math.random() * window.innerHeight * 0.6 + 50;
      const angle = fromLeft ? Math.random() * 20 - 10 : 180 + Math.random() * 20 - 10;
      const speed = 0.12 + Math.random() * 0.1;
      stateRef.current.comets.push({
        x, y,
        vx: Math.cos((angle * Math.PI) / 180) * speed,
        vy: Math.sin((angle * Math.PI) / 180) * speed,
        angle, tail: 80 + Math.random() * 120,
      });
    }

    let lastT = 0;
    function animate(t) {
      const dt = t - lastT; lastT = t;
      const s = stateRef.current;

      // Draw bg stars
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      bgStars.forEach((star) => {
        star.twinkle += star.ts;
        const op = star.opacity * (0.6 + 0.4 * Math.sin(star.twinkle));
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(240,236,224,${op})`;
        ctx.fill();
      });

      // Draw shooting stars
      s.starTimer += dt;
      if (s.starTimer >= s.nextStarTime) {
        s.starTimer = 0; s.nextStarTime = 1500 + Math.random() * 3500;
        spawnShootingStar();
      }
      let anyNear = false;
      s.shootingStars = s.shootingStars.filter((star) => {
        if (star.caught) return false;
        const dx = s.mouseX - star.x, dy = s.mouseY - star.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          anyNear = true;
          star.x += star.vx * (dist / 100) * 0.3 * dt;
          star.y += star.vy * (dist / 100) * 0.3 * dt;
          if (dist < 22) {
            star.caught = true;
            s.stars++;
            setStars(s.stars);
            showToastMsg(`✦ Star caught · ${s.stars} collected`);
            return false;
          }
        } else {
          star.x += star.vx * dt; star.y += star.vy * dt;
        }
        // Draw shooting star
        ctx.save();
        ctx.translate(star.x, star.y);
        ctx.rotate((star.angle * Math.PI) / 180);
        const grad = ctx.createLinearGradient(-star.trail, 0, 0, 0);
        grad.addColorStop(0, "transparent");
        grad.addColorStop(1, dist < 100 ? "rgba(232,204,122,0.9)" : "rgba(232,204,122,0.6)");
        ctx.beginPath(); ctx.moveTo(-star.trail, 0); ctx.lineTo(0, 0);
        ctx.strokeStyle = grad; ctx.lineWidth = 1; ctx.stroke();
        const glowSize = dist < 100 ? 5 : 3;
        const radGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, glowSize * 2);
        radGrad.addColorStop(0, "rgba(255,255,255,1)");
        radGrad.addColorStop(0.5, "rgba(232,204,122,0.8)");
        radGrad.addColorStop(1, "transparent");
        ctx.beginPath(); ctx.arc(0, 0, glowSize * 2, 0, Math.PI * 2);
        ctx.fillStyle = radGrad; ctx.fill();
        ctx.restore();
        return star.x > -100 && star.x < window.innerWidth + 100 && star.y > -100 && star.y < window.innerHeight + 100;
      });
      setNearStar(anyNear);

      // Draw comets
      s.cometTimer += dt;
      if (s.cometTimer >= s.nextCometTime) {
        s.cometTimer = 0; s.nextCometTime = 6000 + Math.random() * 12000;
        spawnComet();
      }
      s.comets = s.comets.filter((c) => {
        c.x += c.vx * dt; c.y += c.vy * dt;
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate((c.angle * Math.PI) / 180);
        const cGrad = ctx.createLinearGradient(-c.tail, 0, 0, 0);
        cGrad.addColorStop(0, "transparent");
        cGrad.addColorStop(1, "rgba(150,200,255,0.4)");
        ctx.beginPath(); ctx.moveTo(-c.tail, 0); ctx.lineTo(0, 0);
        ctx.strokeStyle = cGrad; ctx.lineWidth = 1.5; ctx.stroke();
        const cRad = ctx.createRadialGradient(0, 0, 0, 0, 0, 4);
        cRad.addColorStop(0, "rgba(255,255,255,1)");
        cRad.addColorStop(1, "rgba(150,200,255,0.3)");
        ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fillStyle = cRad; ctx.fill();
        ctx.restore();
        return c.x > -200 && c.x < window.innerWidth + 200 && c.y > -200 && c.y < window.innerHeight + 200;
      });

      // Update planet angles & moons
      PLANETS.forEach((p) => {
        s.planetAngles[p.id] += p.speed * dt;
        s.moons[p.id] = s.moons[p.id].map((a, i) => a + 0.0008 * dt * (i % 2 === 0 ? 1 : -0.7));
      });

      // Update positions for React rendering
      const positions = {};
      PLANETS.forEach((p) => {
        const a = s.planetAngles[p.id];
        positions[p.id] = {
          x: Math.cos(a) * p.orbitR,
          y: Math.sin(a) * p.orbitR,
          moons: [...s.moons[p.id]],
        };
      });
      setPlanetPositions(positions);

      animRef.current = requestAnimationFrame(animate);
    }

    animRef.current = requestAnimationFrame(animate);
    setTimeout(() => spawnShootingStar(), 1000);
    setTimeout(() => spawnShootingStar(), 3000);
    setTimeout(() => spawnComet(), 6000);

    return () => cancelAnimationFrame(animRef.current);
  }, []);

  useEffect(() => {
    const onMove = (e) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
      stateRef.current.mouseX = e.clientX;
      stateRef.current.mouseY = e.clientY;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  function handlePlanetClick(p) { setActivePlanet(p); }
  function handleSunClick() { setShowSunPanel(true); }
  function closeAll() { setActivePlanet(null); setShowSunPanel(false); }

  function handleStartJournaling() {
    setShowJournal(true);
    setJournalText("");
  }

  function handleInscribe() {
    if (!journalText.trim() || !activePlanet) return;
    const s = stateRef.current;
    s.entries[activePlanet.id]++;
    s.moons[activePlanet.id].push(Math.random() * Math.PI * 2);
    setShowJournal(false);
    showToastMsg(`A new moon rises around ${activePlanet.name}`);
    if (s.moons[activePlanet.id].length >= 10) {
      setTimeout(() => triggerMoonMerge(activePlanet), 600);
    }
  }

  function triggerMoonMerge(p) {
    const s = stateRef.current;
    s.moons[p.id] = [];
    s.sunScale += 0.06;
    showToastMsg(`SHUNYA grows · ${p.name} has healed ✦`);
  }

  const moonCount = activePlanet ? stateRef.current.moons[activePlanet.id].length : 0;
  const entryCount = activePlanet ? stateRef.current.entries[activePlanet.id] : 0;

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#020408", overflow: "hidden", position: "relative", cursor: "none", fontFamily: "'Raleway', sans-serif" }}>

      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Cinzel:wght@400;500&family=Raleway:wght@200;300;400&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { overflow: hidden; cursor: none; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: rgba(201,168,76,.2); border-radius: 2px; }
        .planet-body:hover { transform: scale(1.25) !important; filter: brightness(1.3); }
      `}</style>

      {/* Nebula */}
      <div style={{ position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none", background: "radial-gradient(ellipse 80% 60% at 20% 30%,rgba(26,10,46,.7) 0%,transparent 60%),radial-gradient(ellipse 60% 80% at 80% 70%,rgba(10,22,40,.8) 0%,transparent 55%)" }} />

      {/* Canvas */}
      <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, zIndex: 0 }} />

      {/* Custom Cursor */}
      <div style={{ position: "fixed", left: cursorPos.x, top: cursorPos.y, width: nearStar ? 28 : 12, height: nearStar ? 28 : 12, border: `1px solid ${nearStar ? "#e8cc7a" : "rgba(201,168,76,.8)"}`, borderRadius: "50%", pointerEvents: "none", zIndex: 9999, transform: "translate(-50%,-50%)", transition: "width .2s,height .2s", background: nearStar ? "rgba(201,168,76,.15)" : "transparent", boxShadow: nearStar ? "0 0 20px #c9a84c" : "none", mixBlendMode: "screen" }} />

      {/* Logo */}
      <div style={{ position: "fixed", top: 28, left: 30, zIndex: 100, fontFamily: "'Cinzel',serif", fontSize: 22, letterSpacing: 6, color: "#e8cc7a", textShadow: "0 0 20px rgba(201,168,76,.5)", fontWeight: 400 }}>
        SHUNYA
        <span style={{ fontSize: 10, letterSpacing: 4, display: "block", color: "rgba(201,168,76,.5)", fontFamily: "'Raleway',sans-serif", fontWeight: 300, marginTop: 2 }}>journey within</span>
      </div>

      {/* Star Counter */}
      <div style={{ position: "fixed", top: 30, right: 30, zIndex: 100, display: "flex", alignItems: "center", gap: 10, fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: 2, color: "#e8cc7a" }}>
        <div style={{ width: 18, height: 18, background: "radial-gradient(circle,#fff 0%,#e8cc7a 60%)", clipPath: "polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)", boxShadow: "0 0 10px #c9a84c" }} />
        <span style={{ textShadow: "0 0 10px rgba(201,168,76,.8)" }}>{stars}</span>
      </div>

      {/* Solar System */}
      <div style={{ position: "fixed", inset: 0, zIndex: 2, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "relative", width: 0, height: 0 }}>

          {/* Orbit rings */}
          {PLANETS.map((p) => (
            <div key={p.id} style={{ position: "absolute", width: p.orbitR * 2, height: p.orbitR * 2, left: -p.orbitR, top: -p.orbitR, borderRadius: "50%", border: "1px dashed rgba(201,168,76,.04)", pointerEvents: "none" }} />
          ))}

          {/* Sun — Shunya */}
          <div onClick={handleSunClick} style={{ position: "absolute", transform: "translate(-50%,-50%)", cursor: "pointer", zIndex: 20 }}>
            {[130, 170, 220].map((s, i) => (
              <div key={i} style={{ position: "absolute", width: s, height: s, left: -(s - 90) / 2 - 0, top: -(s - 90) / 2 - 0, borderRadius: "50%", border: "1px solid rgba(255,179,71,.15)", animation: `pulse 3s ease-in-out ${i}s infinite`, pointerEvents: "none" }} />
            ))}
            <div style={{ position: "relative", width: 90, height: 90, borderRadius: "50%", background: "radial-gradient(circle at 35% 35%,#fff4c2 0%,#ffd06b 30%,#ffb347 60%,#ff6b00 85%,#c23b00 100%)", boxShadow: `0 0 ${30 * stateRef.current.sunScale}px ${10 * stateRef.current.sunScale}px rgba(255,179,71,.6),0 0 ${60 * stateRef.current.sunScale}px ${20 * stateRef.current.sunScale}px rgba(255,107,0,.4),0 0 100px 40px rgba(255,107,0,.2)`, transition: "transform .3s,box-shadow .3s", transform: `scale(${stateRef.current.sunScale})` }} />
            <div style={{ position: "absolute", bottom: -28, left: "50%", transform: "translateX(-50%)", fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: 3, color: "#e8cc7a", whiteSpace: "nowrap", textShadow: "0 0 10px rgba(201,168,76,.8)" }}>SHUNYA</div>
          </div>

          {/* Planets */}
          {PLANETS.map((p) => {
            const pos = planetPositions[p.id] || { x: Math.cos(p.startAngle) * p.orbitR, y: Math.sin(p.startAngle) * p.orbitR, moons: [] };
            return (
              <div key={p.id} onClick={() => handlePlanetClick(p)} style={{ position: "absolute", left: pos.x, top: pos.y, transform: "translate(-50%,-50%)", cursor: "pointer", zIndex: 10 }}>
                <div className="planet-body" style={{ width: p.size, height: p.size, borderRadius: "50%", background: `radial-gradient(circle at 35% 35%,${p.gradient[0]},${p.gradient[1]} 55%,${p.gradient[2]} 100%)`, boxShadow: `0 0 ${p.size}px ${p.size / 2}px ${p.glow},0 0 ${p.size * 2}px ${p.size}px ${p.glow.replace(".5", ".15")}`, transition: "transform .3s,filter .3s", position: "relative" }}>
                  {/* Moons */}
                  {pos.moons.map((ma, i) => {
                    const mr = p.size * 1.8 + 4;
                    return (
                      <div key={i} style={{ position: "absolute", width: 5, height: 5, borderRadius: "50%", background: "radial-gradient(circle at 35% 35%,#e8e0d0,#a0958a)", boxShadow: "0 0 6px 2px rgba(200,190,170,.4)", left: p.size / 2 + Math.cos(ma) * mr - 2.5, top: p.size / 2 + Math.sin(ma) * mr - 2.5, pointerEvents: "none" }} />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Overlay */}
      {(activePlanet || showSunPanel) && (
        <div onClick={closeAll} style={{ position: "fixed", inset: 0, zIndex: 350, background: "rgba(2,4,8,.65)", backdropFilter: "blur(5px)", transition: "opacity .4s" }} />
      )}

      {/* Sun Panel */}
      {showSunPanel && (
        <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 400, width: "min(520px,88vw)", background: "linear-gradient(160deg,rgba(4,7,14,.98),rgba(20,8,4,.98))", border: "1px solid rgba(255,179,71,.2)", padding: "52px 52px 44px", backdropFilter: "blur(20px)", textAlign: "center" }}>
          <button onClick={closeAll} style={{ position: "absolute", top: 20, right: 24, background: "none", border: "none", color: "rgba(255,179,71,.4)", fontSize: 18, cursor: "pointer" }}>✕</button>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "radial-gradient(circle at 35% 35%,#fff4c2,#ffd06b 30%,#ffb347 60%,#ff6b00 85%,#c23b00 100%)", boxShadow: "0 0 40px 15px rgba(255,179,71,.5)", margin: "0 auto 24px" }} />
          <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 9, letterSpacing: 4, color: "rgba(255,179,71,.5)", marginBottom: 8 }}>THE CORE OF YOUR UNIVERSE</div>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 30, letterSpacing: 8, color: "#ffd06b", marginBottom: 6, textShadow: "0 0 30px rgba(255,179,71,.5)" }}>SHUNYA</div>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: 14, color: "rgba(255,200,100,.5)", marginBottom: 28 }}>The Infinite Zero · The Self Beyond Self</div>
          <div style={{ height: 1, width: 60, margin: "0 auto 26px", background: "linear-gradient(to right,transparent,rgba(255,179,71,.4),transparent)" }} />
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, lineHeight: 1.95, color: "rgba(232,223,200,.78)", fontWeight: 300 }}>
            In Sanskrit, <em>Shunya</em> means the void — not an emptiness to be feared, but the sacred space from which all creation arises.<br /><br />
            Shunya is <em>you</em> — your core, your consciousness, the silent witness behind every thought and feeling. It does not judge what orbits it. It simply shines.<br /><br />
            <em>You are not broken. You are a sun learning to know its own light.</em>
          </div>
        </div>
      )}

      {/* Planet Description Panel */}
      {activePlanet && !showJournal && (
        <div style={{ position: "fixed", top: 0, right: 0, width: "min(460px,90vw)", height: "100vh", zIndex: 400, display: "flex", flexDirection: "column", background: "linear-gradient(150deg,rgba(4,7,14,.98),rgba(8,4,22,.98))", borderLeft: "1px solid rgba(201,168,76,.12)", backdropFilter: "blur(20px)", transition: "right .55s" }}>
          <div style={{ height: 3, background: `linear-gradient(to right,transparent,${activePlanet.color},transparent)` }} />
          <button onClick={closeAll} style={{ position: "absolute", top: 22, left: 24, background: "none", border: "none", color: "rgba(201,168,76,.4)", fontSize: 18, cursor: "pointer" }}>✕</button>

          <div style={{ flex: 1, overflowY: "auto", padding: "60px 44px 40px" }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: `radial-gradient(circle at 35% 35%,${activePlanet.gradient[0]},${activePlanet.gradient[1]} 55%,${activePlanet.gradient[2]} 100%)`, boxShadow: `0 0 30px 10px ${activePlanet.glow}`, marginBottom: 22 }} />
            <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 9, letterSpacing: 4, color: "rgba(201,168,76,.45)", fontWeight: 300, textTransform: "uppercase", marginBottom: 8 }}>Planet of</div>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 32, letterSpacing: 6, color: "#e8cc7a", marginBottom: 4, textShadow: "0 0 30px rgba(201,168,76,.3)" }}>{activePlanet.name}</div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15, fontStyle: "italic", color: "rgba(232,223,200,.5)", marginBottom: 30 }}>{activePlanet.meaning}</div>
            <div style={{ height: 1, width: 48, background: "linear-gradient(to right,rgba(201,168,76,.4),transparent)", marginBottom: 26 }} />

            <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 8, letterSpacing: 3, color: "rgba(201,168,76,.4)", textTransform: "uppercase", marginBottom: 12 }}>What it is</div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 17, lineHeight: 1.95, color: "rgba(232,223,200,.82)", marginBottom: 28, fontWeight: 300 }} dangerouslySetInnerHTML={{ __html: activePlanet.description }} />

            <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 8, letterSpacing: 3, color: "rgba(201,168,76,.4)", textTransform: "uppercase", marginBottom: 12 }}>How it lives in you</div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15, lineHeight: 1.9, color: "rgba(232,223,200,.62)", fontStyle: "italic", paddingLeft: 16, borderLeft: "2px solid rgba(201,168,76,.2)", marginBottom: 34 }}>{activePlanet.significance}</div>

            {/* Moon dots */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", background: "rgba(255,255,255,.02)", border: "1px solid rgba(201,168,76,.08)", marginBottom: 34 }}>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", flex: 1 }}>
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: i < moonCount ? "radial-gradient(circle at 35% 35%,#e8e0d0,#a0958a)" : "rgba(200,190,170,.2)", border: `1px solid ${i < moonCount ? "rgba(200,190,170,.4)" : "rgba(200,190,170,.12)"}`, boxShadow: i < moonCount ? "0 0 6px 1px rgba(200,190,170,.5)" : "none" }} />
                ))}
              </div>
              <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 9, letterSpacing: 2, color: "rgba(201,168,76,.4)", whiteSpace: "nowrap" }}>{moonCount} / 10 moons</div>
            </div>
          </div>

          {/* Start Journaling Button */}
          <div style={{ padding: "24px 44px 36px", borderTop: "1px solid rgba(201,168,76,.07)", background: "rgba(4,7,14,.96)" }}>
            <button onClick={handleStartJournaling} style={{ width: "100%", fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: 4, color: "#020408", background: "linear-gradient(135deg,#e8cc7a,#c9a84c)", border: "none", padding: "16px 28px", cursor: "pointer", textTransform: "uppercase" }}>
              START JOURNALING
              <span style={{ display: "block", fontSize: 8, letterSpacing: 2, opacity: .6, marginTop: 3, fontFamily: "'Raleway',sans-serif", fontWeight: 300 }}>reflect through {activePlanet.name.toLowerCase()}</span>
            </button>
          </div>
        </div>
      )}

      {/* Journal Modal */}
      {showJournal && activePlanet && (
        <div style={{ position: "fixed", inset: 0, zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", background: "radial-gradient(ellipse at center,rgba(6,9,15,.96),rgba(2,4,8,.99))", backdropFilter: "blur(10px)" }}>
          <div style={{ width: "min(580px,90vw)", border: "1px solid rgba(201,168,76,.18)", background: "rgba(6,9,15,.93)", padding: "44px 48px", position: "relative" }}>
            <button onClick={() => setShowJournal(false)} style={{ position: "absolute", top: 20, left: 24, background: "none", border: "none", color: "rgba(201,168,76,.4)", fontSize: 11, letterSpacing: 2, cursor: "pointer", fontFamily: "'Raleway',sans-serif" }}>← BACK</button>
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: activePlanet.color, boxShadow: `0 0 10px ${activePlanet.glow}`, marginBottom: 20 }} />
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 22, letterSpacing: 5, marginBottom: 4, color: activePlanet.gradient[0] }}>{activePlanet.name}</div>
            <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 9, letterSpacing: 3, color: "rgba(201,168,76,.4)", fontWeight: 300, textTransform: "uppercase", marginBottom: 28 }}>{activePlanet.meaning}</div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15, fontStyle: "italic", color: "rgba(232,223,200,.6)", marginBottom: 20, lineHeight: 1.6 }}>{activePlanet.prompt}</div>
            <textarea value={journalText} onChange={(e) => setJournalText(e.target.value)} placeholder="Let the words flow from within..." style={{ width: "100%", height: 160, background: "rgba(255,255,255,.02)", border: "none", borderBottom: "1px solid rgba(201,168,76,.2)", color: "#e8dfc8", fontFamily: "'Cormorant Garamond',serif", fontSize: 16, lineHeight: 1.8, resize: "none", outline: "none", padding: "10px 0", caretColor: "#e8cc7a" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 28 }}>
              <div style={{ fontSize: 9, letterSpacing: 2, color: "rgba(201,168,76,.4)", fontFamily: "'Raleway',sans-serif" }}>{moonCount} moons · {entryCount} entries inscribed</div>
              <button onClick={handleInscribe} style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: 3, color: "#e8cc7a", background: "transparent", border: "1px solid rgba(201,168,76,.35)", padding: "10px 24px", cursor: "pointer", textTransform: "uppercase" }}>INSCRIBE</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      <div style={{ position: "fixed", bottom: 40, left: "50%", transform: `translateX(-50%) translateY(${showToast ? 0 : 20}px)`, zIndex: 600, fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: 3, color: "#e8cc7a", background: "rgba(6,9,15,.97)", border: "1px solid rgba(201,168,76,.3)", padding: "12px 28px", opacity: showToast ? 1 : 0, transition: "opacity .4s,transform .4s", pointerEvents: "none" }}>{toast}</div>

      <style>{`
        @keyframes pulse {
          0%,100% { transform:scale(1); opacity:.4; }
          50% { transform:scale(1.05); opacity:.8; }
        }
      `}</style>
    </div>
  );
}
