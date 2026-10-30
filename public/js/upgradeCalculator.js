/**
 * upgradeCalculator.js
 * Comprehensive Upgrade Requirements & Resource Calculator for Clash of Clans
 * Supports: Heroes, Hero Equipment (Common & Epic), Troops, Spells, Siege Machines, Pets, and Builder Base.
 * Includes: Upgrade Resource Costs AND Upgrade Durations (Time)
 */

// Authentic Clash of Clans resource icons
export const RESOURCE_ICONS = {
  elixir: "/assets/res-elixir.png",
  dark_elixir: "/assets/res-dark-elixir.png",
  builder_elixir: "/assets/res-builder-elixir.png",
  gold: "/assets/res-gold.png",
  builder_gold: "/assets/res-builder-gold.png",
  shiny_ore: "/assets/res-shiny-ore.png",
  glowy_ore: "/assets/res-glowy-ore.png",
  starry_ore: "/assets/res-starry-ore.png",
};

// Universal Hero Equipment Upgrade Cost Table (Official Supercell values)
// Levels 1-18 for Common, Levels 1-27 for Epic (Equipment is Instant: 0s duration)
export const EQUIPMENT_ORE_TABLE = [
  { level: 1,  shiny: 120,  glowy: 0,   starry: 0 },
  { level: 2,  shiny: 240,  glowy: 20,  starry: 0 },
  { level: 3,  shiny: 400,  glowy: 0,   starry: 0 },
  { level: 4,  shiny: 600,  glowy: 0,   starry: 0 },
  { level: 5,  shiny: 840,  glowy: 100, starry: 0 },
  { level: 6,  shiny: 1120, glowy: 0,   starry: 0 },
  { level: 7,  shiny: 1440, glowy: 0,   starry: 0 },
  { level: 8,  shiny: 1800, glowy: 200, starry: 10 },
  { level: 9,  shiny: 1900, glowy: 0,   starry: 0 },
  { level: 10, shiny: 2000, glowy: 0,   starry: 0 },
  { level: 11, shiny: 2100, glowy: 400, starry: 20 },
  { level: 12, shiny: 2200, glowy: 0,   starry: 0 },
  { level: 13, shiny: 2300, glowy: 0,   starry: 0 },
  { level: 14, shiny: 2400, glowy: 600, starry: 30 },
  { level: 15, shiny: 2500, glowy: 0,   starry: 0 },
  { level: 16, shiny: 2600, glowy: 0,   starry: 0 },
  { level: 17, shiny: 2700, glowy: 600, starry: 50 },
  // Common maxes at Lv 18. Epic continues to Lv 27:
  { level: 18, shiny: 2800, glowy: 0,   starry: 0 },
  { level: 19, shiny: 2900, glowy: 0,   starry: 0 },
  { level: 20, shiny: 3000, glowy: 600, starry: 100 },
  { level: 21, shiny: 3100, glowy: 0,   starry: 0 },
  { level: 22, shiny: 3200, glowy: 0,   starry: 0 },
  { level: 23, shiny: 3300, glowy: 600, starry: 120 },
  { level: 24, shiny: 3400, glowy: 0,   starry: 0 },
  { level: 25, shiny: 3500, glowy: 0,   starry: 0 },
  { level: 26, shiny: 3600, glowy: 600, starry: 150 },
];

export const DARK_TROOP_NAMES = new Set([
  "Minion", "Hog Rider", "Valkyrie", "Golem", "Witch",
  "Lava Hound", "Bowler", "Ice Golem", "Headhunter", "Apprentice Warden"
]);

export const DARK_SPELL_NAMES = new Set([
  "Poison Spell", "Earthquake Spell", "Haste Spell",
  "Skeleton Spell", "Bat Spell", "Overgrowth Spell", "Angry Spell"
]);

export const PET_NAMES_SET = new Set([
  "L.A.S.S.I", "Electro Owl", "Mighty Yak", "Unicorn", "Frosty",
  "Diggy", "Poison Lizard", "Phoenix", "Spirit Fox", "Angry Jelly",
  "Sneezy", "Greedy Raven"
]);

export const SIEGE_MACHINE_NAMES_SET = new Set([
  "Wall Wrecker", "Battle Blimp", "Stone Slammer", "Siege Barracks",
  "Log Launcher", "Flame Flinger", "Battle Drill"
]);

// Format numbers nicely: 2500 -> 2.5K, 14500000 -> 14.5M, 120 -> 120
export function formatResourceNumber(num) {
  if (num === null || num === undefined || isNaN(num) || num <= 0) return "0";
  if (num >= 1_000_000) {
    const val = num / 1_000_000;
    return val >= 10 ? `${Math.round(val)}M` : `${val.toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (num >= 1_000) {
    const val = num / 1_000;
    return val >= 10 ? `${Math.round(val)}K` : `${val.toFixed(1).replace(/\.0$/, "")}K`;
  }
  return num.toLocaleString();
}

// Format duration in readable Indonesian (h = hari, j = jam, m = menit)
export function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return "Instant";
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);

  if (days >= 365) {
    const years = Math.floor(days / 365);
    const remMonths = Math.round((days % 365) / 30);
    return remMonths > 0 ? `${years} thn ${remMonths} bln` : `${years} Tahun`;
  }
  if (days >= 30) {
    const months = Math.floor(days / 30);
    const remDays = days % 30;
    return remDays > 0 ? `${months} bln ${remDays} hari` : `${months} Bulan`;
  }
  if (days > 0) {
    return hours > 0 ? `${days} hari ${hours} jam` : `${days} Hari`;
  }
  if (hours > 0) {
    return mins > 0 ? `${hours} jam ${mins} mnt` : `${hours} Jam`;
  }
  return `${mins} Menit`;
}

// Compact duration for unit card pills: 12j, 3h, 7h 12j, 2.5bln
export function formatDurationCompact(seconds) {
  if (!seconds || seconds <= 0) return "";
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);

  if (days >= 365) {
    const years = (days / 365).toFixed(1).replace(/\.0$/, "");
    return `${years}th`;
  }
  if (days >= 30) {
    const months = (days / 30).toFixed(1).replace(/\.0$/, "");
    return `${months}bln`;
  }
  if (days > 0) {
    return hours >= 6 ? `${days}h ${hours}j` : `${days}h`;
  }
  return `${hours}j`;
}

/**
 * Calculate Equipment Upgrade Costs & Duration
 * Equipment upgrade in Clash of Clans is instantaneous with Ores (0s).
 */
export function calculateEquipmentUpgrade(level, maxLevel) {
  const isMax = level >= maxLevel;
  const isEpic = maxLevel > 18;
  const levelsRemaining = Math.max(0, maxLevel - level);

  if (isMax || level < 1 || level > maxLevel) {
    return {
      isMax: true,
      levelsRemaining: 0,
      resourceType: "ore",
      resourceName: "Ore (Batu Mulia)",
      resourceIconUrl: RESOURCE_ICONS.shiny_ore,
      nextCost: { shiny: 0, glowy: 0, starry: 0 },
      totalRemaining: { shiny: 0, glowy: 0, starry: 0 },
      nextTimeSeconds: 0,
      totalTimeSeconds: 0,
      nextTimeText: "Instant",
      totalTimeText: "Instant",
      costBadgeHtml: '<span class="cost-max-tag">🏆 MAX</span>',
      timeBadgeHtml: '',
    };
  }

  // Next level cost
  const nextIdx = level - 1;
  const nextStep = EQUIPMENT_ORE_TABLE[nextIdx] || { shiny: 0, glowy: 0, starry: 0 };
  const nextShiny = nextStep.shiny || 0;
  const nextGlowy = nextStep.glowy || 0;
  const nextStarry = isEpic ? (nextStep.starry || 0) : 0;

  // Sum total remaining
  let totalShiny = 0;
  let totalGlowy = 0;
  let totalStarry = 0;

  for (let i = nextIdx; i < maxLevel - 1; i++) {
    const step = EQUIPMENT_ORE_TABLE[i];
    if (step) {
      totalShiny += step.shiny || 0;
      totalGlowy += step.glowy || 0;
      if (isEpic) {
        totalStarry += step.starry || 0;
      }
    }
  }

  // Build compact pill HTML with official ore graphics
  const parts = [];
  if (nextShiny > 0) {
    parts.push(`<span class="ore-mini shiny" title="Shiny Ore"><img class="res-icon-img" src="${RESOURCE_ICONS.shiny_ore}" alt="Shiny Ore" /> ${formatResourceNumber(nextShiny)}</span>`);
  }
  if (nextGlowy > 0) {
    parts.push(`<span class="ore-mini glowy" title="Glowy Ore"><img class="res-icon-img" src="${RESOURCE_ICONS.glowy_ore}" alt="Glowy Ore" /> ${formatResourceNumber(nextGlowy)}</span>`);
  }
  if (nextStarry > 0) {
    parts.push(`<span class="ore-mini starry" title="Starry Ore"><img class="res-icon-img" src="${RESOURCE_ICONS.starry_ore}" alt="Starry Ore" /> ${nextStarry}</span>`);
  }

  return {
    isMax: false,
    levelsRemaining,
    resourceType: "ore",
    resourceName: isEpic ? "Shiny, Glowy & Starry Ore" : "Shiny & Glowy Ore",
    resourceIconUrl: RESOURCE_ICONS.shiny_ore,
    nextCost: { shiny: nextShiny, glowy: nextGlowy, starry: nextStarry },
    totalRemaining: { shiny: totalShiny, glowy: totalGlowy, starry: totalStarry },
    nextTimeSeconds: 0,
    totalTimeSeconds: 0,
    nextTimeText: "Instant (0s)",
    totalTimeText: "Instant (0s)",
    costBadgeHtml: parts.join(" "),
    timeBadgeHtml: '',
  };
}

/**
 * Calculate Hero Upgrade Costs & Duration
 */
export function calculateHeroUpgrade(name, level, maxLevel, village) {
  const isMax = level >= maxLevel;
  const levelsRemaining = Math.max(0, maxLevel - level);

  let resourceType = "dark_elixir";
  let resourceName = "Dark Elixir";

  if (village === "builderBase" || name === "Battle Machine" || name === "Battle Copter") {
    resourceType = "builder_elixir";
    resourceName = "Builder Elixir";
  } else if (name === "Grand Warden") {
    resourceType = "elixir";
    resourceName = "Elixir";
  }

  const resourceIconUrl = RESOURCE_ICONS[resourceType] || RESOURCE_ICONS.elixir;

  if (isMax || level < 1) {
    return {
      isMax: true,
      levelsRemaining: 0,
      resourceType,
      resourceName,
      resourceIconUrl,
      nextCost: 0,
      totalRemaining: 0,
      nextTimeSeconds: 0,
      totalTimeSeconds: 0,
      nextTimeText: "Selesai",
      totalTimeText: "Selesai",
      costBadgeHtml: '<span class="cost-max-tag">🏆 MAX</span>',
      timeBadgeHtml: '',
    };
  }

  // Cost calculation function per level
  function getCostForLevel(lvl) {
    if (resourceType === "builder_elixir") {
      return Math.min(5_500_000, 1_400_000 + (lvl * 120_000));
    }
    if (resourceType === "elixir") {
      if (lvl <= 20) return 2_800_000 + (lvl * 350_000);
      if (lvl <= 50) return 9_800_000 + ((lvl - 20) * 280_000);
      return Math.min(23_500_000, 18_200_000 + ((lvl - 50) * 160_000));
    }
    if (name === "Royal Champion") {
      if (lvl <= 15) return 120_000 + (lvl * 9_000);
      if (lvl <= 35) return 255_000 + ((lvl - 15) * 4_500);
      return Math.min(360_000, 345_000 + ((lvl - 35) * 1_000));
    }
    if (name === "Dragon Duke") {
      return Math.min(360_000, 160_000 + (lvl * 8_000));
    }
    if (lvl <= 10) return 12_000 + (lvl * 3_200);
    if (lvl <= 40) return 44_000 + ((lvl - 10) * 4_200);
    if (lvl <= 70) return 170_000 + ((lvl - 40) * 3_600);
    if (lvl <= 95) return 278_000 + ((lvl - 70) * 2_600);
    return Math.min(360_000, 343_000 + ((lvl - 95) * 1_200));
  }

  // Duration calculation in seconds per level
  function getHeroTimeForLevel(lvl) {
    if (village === "builderBase" || name === "Battle Machine" || name === "Battle Copter") {
      if (lvl <= 5) return 6 * 3600;
      if (lvl <= 15) return 18 * 3600;
      if (lvl <= 25) return Math.round((1.5 + ((lvl - 15) / 10) * 1.5) * 86400);
      return Math.round((3.0 + ((lvl - 25) / 10) * 1.5) * 86400);
    }
    if (name === "Royal Champion") {
      if (lvl <= 10) return Math.round((2.0 + (lvl / 10) * 1.5) * 86400);
      if (lvl <= 30) return Math.round((3.5 + ((lvl - 10) / 20) * 2.5) * 86400);
      return Math.min(8 * 86400, Math.round((6.0 + ((lvl - 30) / 25) * 2.0) * 86400));
    }
    if (name === "Dragon Duke") {
      if (lvl <= 10) return Math.round((3.5 + (lvl / 10) * 2.0) * 86400);
      return Math.min(8 * 86400, Math.round((5.5 + ((lvl - 10) / 15) * 2.5) * 86400));
    }
    // BK, AQ, GW, Minion Prince (capped at 8 days max in CoC)
    if (lvl <= 10) return Math.round((6 + (lvl * 1.8)) * 3600);
    if (lvl <= 40) return Math.round((1.0 + ((lvl - 10) / 30) * 2.5) * 86400);
    if (lvl <= 70) return Math.round((3.5 + ((lvl - 40) / 30) * 2.0) * 86400);
    if (lvl <= 95) return Math.round((5.5 + ((lvl - 70) / 25) * 1.5) * 86400);
    return Math.min(8 * 86400, Math.round((7.0 + ((lvl - 95) / 15) * 1.0) * 86400));
  }

  const nextCost = Math.round(getCostForLevel(level));
  let totalRemaining = 0;
  for (let l = level; l < maxLevel; l++) {
    totalRemaining += getCostForLevel(l);
  }
  totalRemaining = Math.round(totalRemaining);

  const nextTimeSeconds = getHeroTimeForLevel(level);
  let totalTimeSeconds = 0;
  for (let l = level; l < maxLevel; l++) {
    totalTimeSeconds += getHeroTimeForLevel(l);
  }

  const nextTimeText = formatDuration(nextTimeSeconds);
  const totalTimeText = formatDuration(totalTimeSeconds);
  const timeCompact = formatDurationCompact(nextTimeSeconds);

  return {
    isMax: false,
    levelsRemaining,
    resourceType,
    resourceName,
    resourceIconUrl,
    nextCost,
    totalRemaining,
    nextTimeSeconds,
    totalTimeSeconds,
    nextTimeText,
    totalTimeText,
    costBadgeHtml: `<span class="res-mini ${resourceType}"><img class="res-icon-img" src="${resourceIconUrl}" alt="${resourceName}" /> ${formatResourceNumber(nextCost)}</span>`,
    timeBadgeHtml: `<span class="time-mini" title="Waktu upgrade berikutnya: ${nextTimeText}"><span class="time-ico">⏱️</span> ${timeCompact}</span>`,
  };
}

/**
 * Calculate Pet Upgrade Costs & Duration
 */
export function calculatePetUpgrade(level, maxLevel) {
  const isMax = level >= maxLevel;
  const levelsRemaining = Math.max(0, maxLevel - level);

  const resourceType = "dark_elixir";
  const resourceName = "Dark Elixir";
  const resourceIconUrl = RESOURCE_ICONS.dark_elixir;

  if (isMax || level < 1) {
    return {
      isMax: true,
      levelsRemaining: 0,
      resourceType,
      resourceName,
      resourceIconUrl,
      nextCost: 0,
      totalRemaining: 0,
      nextTimeSeconds: 0,
      totalTimeSeconds: 0,
      nextTimeText: "Selesai",
      totalTimeText: "Selesai",
      costBadgeHtml: '<span class="cost-max-tag">🏆 MAX</span>',
      timeBadgeHtml: '',
    };
  }

  const PET_COSTS = [105_000, 120_000, 140_000, 160_000, 185_000, 210_000, 235_000, 255_000, 275_000, 290_000];
  function getPetCost(lvl) {
    const idx = Math.min(PET_COSTS.length - 1, Math.max(0, lvl - 1));
    return PET_COSTS[idx] || 250_000;
  }

  const PET_TIMES = [
    3 * 86400, 3.5 * 86400, 4 * 86400, 4.5 * 86400, 5.5 * 86400,
    6 * 86400, 6.5 * 86400, 7 * 86400, 7.5 * 86400, 8 * 86400
  ];
  function getPetTime(lvl) {
    const idx = Math.min(PET_TIMES.length - 1, Math.max(0, lvl - 1));
    return PET_TIMES[idx] || 6 * 86400;
  }

  const nextCost = getPetCost(level);
  let totalRemaining = 0;
  for (let l = level; l < maxLevel; l++) {
    totalRemaining += getPetCost(l);
  }

  const nextTimeSeconds = getPetTime(level);
  let totalTimeSeconds = 0;
  for (let l = level; l < maxLevel; l++) {
    totalTimeSeconds += getPetTime(l);
  }

  const nextTimeText = formatDuration(nextTimeSeconds);
  const totalTimeText = formatDuration(totalTimeSeconds);
  const timeCompact = formatDurationCompact(nextTimeSeconds);

  return {
    isMax: false,
    levelsRemaining,
    resourceType,
    resourceName,
    resourceIconUrl,
    nextCost,
    totalRemaining,
    nextTimeSeconds,
    totalTimeSeconds,
    nextTimeText,
    totalTimeText,
    costBadgeHtml: `<span class="res-mini ${resourceType}"><img class="res-icon-img" src="${resourceIconUrl}" alt="${resourceName}" /> ${formatResourceNumber(nextCost)}</span>`,
    timeBadgeHtml: `<span class="time-mini" title="Waktu upgrade berikutnya: ${nextTimeText}"><span class="time-ico">⏱️</span> ${timeCompact}</span>`,
  };
}

/**
 * Calculate Siege Machine Upgrade Costs & Duration
 */
export function calculateSiegeUpgrade(level, maxLevel) {
  const isMax = level >= maxLevel;
  const levelsRemaining = Math.max(0, maxLevel - level);

  const resourceType = "elixir";
  const resourceName = "Elixir";
  const resourceIconUrl = RESOURCE_ICONS.elixir;

  if (isMax || level < 1) {
    return {
      isMax: true,
      levelsRemaining: 0,
      resourceType,
      resourceName,
      resourceIconUrl,
      nextCost: 0,
      totalRemaining: 0,
      nextTimeSeconds: 0,
      totalTimeSeconds: 0,
      nextTimeText: "Selesai",
      totalTimeText: "Selesai",
      costBadgeHtml: '<span class="cost-max-tag">🏆 MAX</span>',
      timeBadgeHtml: '',
    };
  }

  const SIEGE_COSTS = [6_000_000, 9_500_000, 13_000_000, 16_500_000, 19_000_000];
  function getSiegeCost(lvl) {
    const idx = Math.min(SIEGE_COSTS.length - 1, Math.max(0, lvl - 1));
    return SIEGE_COSTS[idx] || 15_000_000;
  }

  const SIEGE_TIMES = [7 * 86400, 9.5 * 86400, 11.5 * 86400, 14 * 86400];
  function getSiegeTime(lvl) {
    const idx = Math.min(SIEGE_TIMES.length - 1, Math.max(0, lvl - 1));
    return SIEGE_TIMES[idx] || 10 * 86400;
  }

  const nextCost = getSiegeCost(level);
  let totalRemaining = 0;
  for (let l = level; l < maxLevel; l++) {
    totalRemaining += getSiegeCost(l);
  }

  const nextTimeSeconds = getSiegeTime(level);
  let totalTimeSeconds = 0;
  for (let l = level; l < maxLevel; l++) {
    totalTimeSeconds += getSiegeTime(l);
  }

  const nextTimeText = formatDuration(nextTimeSeconds);
  const totalTimeText = formatDuration(totalTimeSeconds);
  const timeCompact = formatDurationCompact(nextTimeSeconds);

  return {
    isMax: false,
    levelsRemaining,
    resourceType,
    resourceName,
    resourceIconUrl,
    nextCost,
    totalRemaining,
    nextTimeSeconds,
    totalTimeSeconds,
    nextTimeText,
    totalTimeText,
    costBadgeHtml: `<span class="res-mini ${resourceType}"><img class="res-icon-img" src="${resourceIconUrl}" alt="${resourceName}" /> ${formatResourceNumber(nextCost)}</span>`,
    timeBadgeHtml: `<span class="time-mini" title="Waktu upgrade berikutnya: ${nextTimeText}"><span class="time-ico">⏱️</span> ${timeCompact}</span>`,
  };
}

/**
 * Calculate Troop & Spell Upgrade Costs & Duration
 */
export function calculateTroopOrSpellUpgrade(name, level, maxLevel, category, village) {
  const isMax = level >= maxLevel;
  const levelsRemaining = Math.max(0, maxLevel - level);

  let resourceType = "elixir";
  let resourceName = "Elixir";

  if (village === "builderBase") {
    resourceType = "builder_elixir";
    resourceName = "Builder Elixir";
  } else if (DARK_TROOP_NAMES.has(name) || DARK_SPELL_NAMES.has(name)) {
    resourceType = "dark_elixir";
    resourceName = "Dark Elixir";
  }

  const resourceIconUrl = RESOURCE_ICONS[resourceType] || RESOURCE_ICONS.elixir;

  if (isMax || level < 1) {
    return {
      isMax: true,
      levelsRemaining: 0,
      resourceType,
      resourceName,
      resourceIconUrl,
      nextCost: 0,
      totalRemaining: 0,
      nextTimeSeconds: 0,
      totalTimeSeconds: 0,
      nextTimeText: "Selesai",
      totalTimeText: "Selesai",
      costBadgeHtml: '<span class="cost-max-tag">🏆 MAX</span>',
      timeBadgeHtml: '',
    };
  }

  function getStepCost(lvl) {
    const progressRatio = lvl / (maxLevel || 1);

    if (resourceType === "builder_elixir") {
      return Math.round(500_000 + (progressRatio * 4_000_000));
    }
    if (resourceType === "dark_elixir") {
      return Math.round(25_000 + (progressRatio * 320_000));
    }
    return Math.round(800_000 + (progressRatio * 20_000_000));
  }

  function getTroopTime(lvl) {
    if (village === "builderBase") {
      const ratio = lvl / (maxLevel || 1);
      return Math.min(5 * 86400, Math.round((0.5 + (ratio * 4.5)) * 86400));
    }
    const ratio = lvl / (maxLevel || 1);
    if (maxLevel <= 5) {
      return Math.min(7 * 86400, Math.round((0.5 + (ratio * 6.5)) * 86400));
    }
    return Math.min(14 * 86400, Math.round((0.75 + (ratio * 13.0)) * 86400));
  }

  const nextCost = getStepCost(level);
  let totalRemaining = 0;
  for (let l = level; l < maxLevel; l++) {
    totalRemaining += getStepCost(l);
  }

  const nextTimeSeconds = getTroopTime(level);
  let totalTimeSeconds = 0;
  for (let l = level; l < maxLevel; l++) {
    totalTimeSeconds += getTroopTime(l);
  }

  const nextTimeText = formatDuration(nextTimeSeconds);
  const totalTimeText = formatDuration(totalTimeSeconds);
  const timeCompact = formatDurationCompact(nextTimeSeconds);

  return {
    isMax: false,
    levelsRemaining,
    resourceType,
    resourceName,
    resourceIconUrl,
    nextCost,
    totalRemaining,
    nextTimeSeconds,
    totalTimeSeconds,
    nextTimeText,
    totalTimeText,
    costBadgeHtml: `<span class="res-mini ${resourceType}"><img class="res-icon-img" src="${resourceIconUrl}" alt="${resourceName}" /> ${formatResourceNumber(nextCost)}</span>`,
    timeBadgeHtml: `<span class="time-mini" title="Waktu upgrade berikutnya: ${nextTimeText}"><span class="time-ico">⏱️</span> ${timeCompact}</span>`,
  };
}

/**
 * Universal Unit Upgrade Dispatcher
 */
export function getUnitUpgradeData(unit) {
  const { name, level, maxLevel, category, village } = unit;

  if (category === "equipment") {
    return calculateEquipmentUpgrade(level, maxLevel);
  }
  if (category === "hero") {
    return calculateHeroUpgrade(name, level, maxLevel, village);
  }
  if (category === "pet" || PET_NAMES_SET.has(name)) {
    return calculatePetUpgrade(level, maxLevel);
  }
  if (category === "siege" || SIEGE_MACHINE_NAMES_SET.has(name)) {
    return calculateSiegeUpgrade(level, maxLevel);
  }
  return calculateTroopOrSpellUpgrade(name, level, maxLevel, category, village);
}

/**
 * Calculate Cumulative Category Summary (Resource Costs + Durations)
 */
export function calculateCategorySummary(units = []) {
  const totalUnits = units.length;
  let maxedCount = 0;
  let totalLevelsRemaining = 0;

  const next = {
    elixir: 0,
    darkElixir: 0,
    builderElixir: 0,
    shinyOre: 0,
    glowyOre: 0,
    starryOre: 0,
    timeSeconds: 0,
  };

  const total = {
    elixir: 0,
    darkElixir: 0,
    builderElixir: 0,
    shinyOre: 0,
    glowyOre: 0,
    starryOre: 0,
    timeSeconds: 0,
  };

  units.forEach((u) => {
    const data = getUnitUpgradeData(u);
    if (data.isMax) {
      maxedCount++;
      return;
    }

    totalLevelsRemaining += data.levelsRemaining || 0;

    // Time summation
    next.timeSeconds += data.nextTimeSeconds || 0;
    total.timeSeconds += data.totalTimeSeconds || 0;

    // Resource summation
    if (data.resourceType === "ore") {
      next.shinyOre += data.nextCost.shiny || 0;
      next.glowyOre += data.nextCost.glowy || 0;
      next.starryOre += data.nextCost.starry || 0;

      total.shinyOre += data.totalRemaining.shiny || 0;
      total.glowyOre += data.totalRemaining.glowy || 0;
      total.starryOre += data.totalRemaining.starry || 0;
    } else if (data.resourceType === "dark_elixir") {
      next.darkElixir += data.nextCost || 0;
      total.darkElixir += data.totalRemaining || 0;
    } else if (data.resourceType === "builder_elixir") {
      next.builderElixir += data.nextCost || 0;
      total.builderElixir += data.totalRemaining || 0;
    } else {
      next.elixir += data.nextCost || 0;
      total.elixir += data.totalRemaining || 0;
    }
  });

  const isAllMax = totalUnits > 0 && maxedCount === totalUnits;
  next.timeText = formatDuration(next.timeSeconds);
  total.timeText = formatDuration(total.timeSeconds);

  return {
    totalUnits,
    maxedCount,
    totalLevelsRemaining,
    isAllMax,
    next,
    total,
  };
}

/**
 * Render Category Summary Banner HTML
 */
export function renderCategorySummaryHtml(title, summaryData) {
  if (!summaryData || summaryData.totalUnits === 0) {
    return "";
  }

  const { totalUnits, maxedCount, totalLevelsRemaining, isAllMax, next, total } = summaryData;

  function renderResourcePills(costObj, isNext = false) {
    const pills = [];

    // Duration pill
    if (costObj.timeSeconds > 0) {
      const timeLabel = isNext ? "Waktu" : "Total Waktu";
      const timeIcon = isNext ? "⏱️" : "⏳";
      pills.push(`
        <span class="summary-res-pill time-pill" title="${isNext ? 'Akumulasi waktu upgrade 1x berikutnya' : 'Total akumulasi waktu tukang/lab menuju MAX'}: ${costObj.timeText}">
          <span class="time-pill-ico">${timeIcon}</span>
          <span>${costObj.timeText}</span>
          <small class="res-label-sub">${timeLabel}</small>
        </span>
      `);
    } else if (costObj.shinyOre > 0 || costObj.glowyOre > 0) {
      pills.push(`
        <span class="summary-res-pill time-pill instant" title="Upgrade Equipment instan tanpa jeda waktu tukang">
          <span class="time-pill-ico">⚡</span>
          <span>Instant</span>
          <small class="res-label-sub">Waktu</small>
        </span>
      `);
    }

    if (costObj.darkElixir > 0) {
      pills.push(`
        <span class="summary-res-pill dark_elixir" title="${costObj.darkElixir.toLocaleString()} Dark Elixir">
          <img class="res-icon-img" src="${RESOURCE_ICONS.dark_elixir}" alt="Dark Elixir" />
          <span>${formatResourceNumber(costObj.darkElixir)}</span>
          <small class="res-label-sub">Dark Elixir</small>
        </span>
      `);
    }

    if (costObj.elixir > 0) {
      pills.push(`
        <span class="summary-res-pill elixir" title="${costObj.elixir.toLocaleString()} Elixir">
          <img class="res-icon-img" src="${RESOURCE_ICONS.elixir}" alt="Elixir" />
          <span>${formatResourceNumber(costObj.elixir)}</span>
          <small class="res-label-sub">Elixir</small>
        </span>
      `);
    }

    if (costObj.builderElixir > 0) {
      pills.push(`
        <span class="summary-res-pill builder_elixir" title="${costObj.builderElixir.toLocaleString()} Builder Elixir">
          <img class="res-icon-img" src="${RESOURCE_ICONS.builder_elixir}" alt="Builder Elixir" />
          <span>${formatResourceNumber(costObj.builderElixir)}</span>
          <small class="res-label-sub">Builder Elixir</small>
        </span>
      `);
    }

    if (costObj.shinyOre > 0) {
      pills.push(`
        <span class="summary-res-pill ore-shiny" title="${costObj.shinyOre.toLocaleString()} Shiny Ore">
          <img class="res-icon-img" src="${RESOURCE_ICONS.shiny_ore}" alt="Shiny Ore" />
          <span>${formatResourceNumber(costObj.shinyOre)}</span>
          <small class="res-label-sub">Shiny</small>
        </span>
      `);
    }

    if (costObj.glowyOre > 0) {
      pills.push(`
        <span class="summary-res-pill ore-glowy" title="${costObj.glowyOre.toLocaleString()} Glowy Ore">
          <img class="res-icon-img" src="${RESOURCE_ICONS.glowy_ore}" alt="Glowy Ore" />
          <span>${formatResourceNumber(costObj.glowyOre)}</span>
          <small class="res-label-sub">Glowy</small>
        </span>
      `);
    }

    if (costObj.starryOre > 0) {
      pills.push(`
        <span class="summary-res-pill ore-starry" title="${costObj.starryOre.toLocaleString()} Starry Ore">
          <img class="res-icon-img" src="${RESOURCE_ICONS.starry_ore}" alt="Starry Ore" />
          <span>${costObj.starryOre.toLocaleString()}</span>
          <small class="res-label-sub">Starry</small>
        </span>
      `);
    }

    if (pills.length === 0) {
      return '<span class="summary-all-max-tag">🏆 Sudah MAX Semua!</span>';
    }
    return pills.join("");
  }

  const nextPillsHtml = renderResourcePills(next, true);
  const totalPillsHtml = renderResourcePills(total, false);

  return `
    <div class="summary-banner-header">
      <div class="summary-banner-title">
        <span class="summary-badge-icon">📊</span>
        <span class="summary-title-text">${title}</span>
      </div>
      <div class="summary-meta-badges">
        <span class="summary-meta-pill ${isAllMax ? 'maxed' : ''}">🏆 ${maxedCount}/${totalUnits} MAX</span>
        <span class="summary-meta-pill levels">⚡ ${totalLevelsRemaining} Level Tersisa</span>
      </div>
    </div>
    <div class="summary-banner-grid">
      <div class="summary-box next-box">
        <span class="summary-box-label">🎯 Biaya 1x Upgrade Berikutnya</span>
        <div class="summary-pills-row">
          ${nextPillsHtml}
        </div>
      </div>
      <div class="summary-box total-box">
        <span class="summary-box-label">🏆 Total Sisa Menuju Semua MAX</span>
        <div class="summary-pills-row">
          ${totalPillsHtml}
        </div>
      </div>
    </div>
  `;
}
