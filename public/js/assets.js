// Clash of Clans Categorization Sets
export const SIEGE_MACHINE_NAMES = new Set([
  "Wall Wrecker",
  "Battle Blimp",
  "Stone Slammer",
  "Siege Barracks",
  "Log Launcher",
  "Flame Flinger",
  "Battle Drill",
  "Troop Launcher",
  "Sky Wagon",
]);

export const PET_NAMES = new Set([
  "L.A.S.S.I",
  "Mighty Yak",
  "Electro Owl",
  "Unicorn",
  "Phoenix",
  "Poison Lizard",
  "Diggy",
  "Frosty",
  "Spirit Fox",
  "Angry Jelly",
  "Sneezy",
  "Greedy Raven",
]);

// Asset URL Helpers
export function getTownHallImg(level) {
  const lvl = Math.max(1, Math.min(18, parseInt(level, 10) || 1));
  return `https://assets.clashk.ing/buildings/home-village/town_hall/level_${lvl}.webp`;
}

export function getBuilderHallImg(level) {
  const lvl = Math.max(1, Math.min(10, parseInt(level, 10) || 1));
  return `https://assets.clashk.ing/buildings/builder-base/builder_hall/level_${lvl}.webp`;
}

export function getHeroIcon(name) {
  if (!name) return "/assets/barbarian-temp.svg";
  const map = {
    "barbarian king": "barbarian_king",
    "archer queen": "archer_queen",
    "grand warden": "grand_warden",
    "royal champion": "royal_champion",
    "minion prince": "minion_prince",
    "dragon duke": "dragon_duke",
    "battle machine": "battle_machine",
    "battle copter": "battle_copter",
  };
  const key = map[name.toLowerCase().trim()] || name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  return `https://assets.clashk.ing/heroes/${key}/icon.webp`;
}

export function getEquipmentIcon(name) {
  if (!name) return "/assets/barbarian-temp.svg";
  const key = name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  if (key === "portal_pendant") {
    return "/assets/portal_pendant.png";
  }
  return `https://assets.clashk.ing/equipment/${key}.webp`;
}

export function getTroopIcon(name) {
  if (!name) return "/assets/barbarian-temp.svg";
  const map = {
    "p.e.k.k.a": "pekka",
    "power p.e.k.k.a": "power_pekka",
  };
  const key = map[name.toLowerCase().trim()] || name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  return `https://assets.clashk.ing/troops/${key}/icon.webp`;
}

export function getSpellIcon(name) {
  if (!name) return "/assets/barbarian-temp.svg";
  const key = name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  return `https://assets.clashk.ing/spells/${key}.webp`;
}

export function getPetIcon(name) {
  if (!name) return "/assets/barbarian-temp.svg";
  const map = {
    "l.a.s.s.i": "lassi",
  };
  const key = map[name.toLowerCase().trim()] || name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  return `https://assets.clashk.ing/pets/${key}/icon.webp`;
}
