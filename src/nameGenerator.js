// Cosmic + Sanskrit anonymous name generator
const firstWords = [
  "Silent", "Wandering", "Eternal", "Velvet", "Luminous",
  "Celestial", "Drifting", "Sacred", "Infinite", "Astral",
  "Golden", "Midnight", "Crimson", "Frozen", "Floating",
  "Ancient", "Hollow", "Radiant", "Forgotten", "Burning",
  "Gentle", "Mystic", "Distant", "Waning", "Rising",
  "Tranquil", "Fading", "Blazing", "Hidden", "Serene"
];

const secondWords = [
  "Nebula", "Tara", "Comet", "Dhruva", "Eclipse",
  "Ananta", "Void", "Surya", "Drift", "Chandra",
  "Nova", "Akash", "Pulse", "Vega", "Agni",
  "Horizon", "Indra", "Shadow", "Vayu", "Orbit",
  "Priya", "Cosmos", "Jyoti", "Spark", "Nila",
  "Aurora", "Kiran", "Dust", "Mitra", "Flame"
];

export function generateAnonymousName() {
  const first = firstWords[Math.floor(Math.random() * firstWords.length)];
  const second = secondWords[Math.floor(Math.random() * secondWords.length)];
  return `${first} ${second}`;
}

export function generateAvatarSeed() {
  return Math.random().toString(36).substring(2, 10);
}
