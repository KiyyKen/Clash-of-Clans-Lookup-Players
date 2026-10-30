/**
 * upgradeCalculator.js
 * Comprehensive Upgrade Requirements & Resource Calculator for Clash of Clans
 * Supports: Heroes, Hero Equipment (Common & Epic), Troops, Spells, Siege Machines, Pets, and Builder Base.
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
// Levels 1-18 for Common, Levels 1-27 for Epic
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

/**
 * Calculate Equipment Upgrade Costs
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
      costBadgeHtml: '<span class="cost-max-tag">🏆 MAX</span>',
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
    costBadgeHtml: parts.join(" "),
  };
}

/**
 * Calculate Hero Upgrade Costs
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
      costBadgeHtml: '<span class="cost-max-tag">🏆 MAX</span>',
    };
  }

  // Cost calculation function per level
  function getCostForLevel(lvl) {
    if (resourceType === "builder_elixir") {
      // 1.5M - 5.5M
      return Math.min(5_500_000, 1_400_000 + (lvl * 120_000));
    }
    if (resourceType === "elixir") {
      // Grand Warden: 3M - 23M
      if (lvl <= 20) return 2_800_000 + (lvl * 350_000);
      if (lvl <= 50) return 9_800_000 + ((lvl - 20) * 280_000);
      return Math.min(23_500_000, 18_200_000 + ((lvl - 50) * 160_000));
    }
    // Dark Elixir Heroes (King, Queen, Royal Champion, Minion Prince, Dragon Duke)
    if (name === "Royal Champion") {
      if (lvl <= 15) return 120_000 + (lvl * 9_000);
      if (lvl <= 35) return 255_000 + ((lvl - 15) * 4_500);
      return Math.min(360_000, 345_000 + ((lvl - 35) * 1_000));
    }
    if (name === "Dragon Duke") {
      return Math.min(360_000, 160_000 + (lvl * 8_000));
    }
    // Barbarian King, Archer Queen, Minion Prince
    if (lvl <= 10) return 12_000 + (lvl * 3_200);
    if (lvl <= 40) return 44_000 + ((lvl - 10) * 4_200);
    if (lvl <= 70) return 170_000 + ((lvl - 40) * 3_600);
    if (lvl <= 95) return 278_000 + ((lvl - 70) * 2_600);
    return Math.min(360_000, 343_000 + ((lvl - 95) * 1_200));
  }

  const nextCost = Math.round(getCostForLevel(level));
  let totalRemaining = 0;
  for (let l = level; l < maxLevel; l++) {
    totalRemaining += getCostForLevel(l);
  }
  totalRemaining = Math.round(totalRemaining);

  return {
    isMax: false,
    levelsRemaining,
    resourceType,
    resourceName,
    resourceIconUrl,
    nextCost,
    totalRemaining,
    costBadgeHtml: `<span class="res-mini ${resourceType}"><img class="res-icon-img" src="${resourceIconUrl}" alt="${resourceName}" /> ${formatResourceNumber(nextCost)}</span>`,
  };
}

/**
 * Calculate Pet Upgrade Costs
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
      costBadgeHtml: '<span class="cost-max-tag">🏆 MAX</span>',
    };
  }

  const PET_COSTS = [105_000, 120_000, 140_000, 160_000, 185_000, 210_000, 235_000, 255_000, 275_000, 290_000];
  function getPetCost(lvl) {
    const idx = Math.min(PET_COSTS.length - 1, Math.max(0, lvl - 1));
    return PET_COSTS[idx] || 250_000;
  }

  const nextCost = getPetCost(level);
  let totalRemaining = 0;
  for (let l = level; l < maxLevel; l++) {
    totalRemaining += getPetCost(l);
  }

  return {
    isMax: false,
    levelsRemaining,
    resourceType,
    resourceName,
    resourceIconUrl,
    nextCost,
    totalRemaining,
    costBadgeHtml: `<span class="res-mini ${resourceType}"><img class="res-icon-img" src="${resourceIconUrl}" alt="${resourceName}" /> ${formatResourceNumber(nextCost)}</span>`,
  };
}

/**
 * Calculate Siege Machine Upgrade Costs
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
      costBadgeHtml: '<span class="cost-max-tag">🏆 MAX</span>',
    };
  }

  const SIEGE_COSTS = [6_000_000, 9_500_000, 13_000_000, 16_500_000, 19_000_000];
  function getSiegeCost(lvl) {
    const idx = Math.min(SIEGE_COSTS.length - 1, Math.max(0, lvl - 1));
    return SIEGE_COSTS[idx] || 15_000_000;
  }

  const nextCost = getSiegeCost(level);
  let totalRemaining = 0;
  for (let l = level; l < maxLevel; l++) {
    totalRemaining += getSiegeCost(l);
  }

  return {
    isMax: false,
    levelsRemaining,
    resourceType,
    resourceName,
    resourceIconUrl,
    nextCost,
    totalRemaining,
    costBadgeHtml: `<span class="res-mini ${resourceType}"><img class="res-icon-img" src="${resourceIconUrl}" alt="${resourceName}" /> ${formatResourceNumber(nextCost)}</span>`,
  };
}

/**
 * Calculate Troop & Spell Upgrade Costs
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
      costBadgeHtml: '<span class="cost-max-tag">🏆 MAX</span>',
    };
  }

  function getStepCost(lvl) {
    const progressRatio = lvl / (maxLevel || 1);

    if (resourceType === "builder_elixir") {
      // 500K - 4.5M
      return Math.round(500_000 + (progressRatio * 4_000_000));
    }
    if (resourceType === "dark_elixir") {
      // 20K - 350K
      return Math.round(25_000 + (progressRatio * 320_000));
    }
    // Regular Elixir (500K - 22M)
    return Math.round(800_000 + (progressRatio * 20_000_000));
  }

  const nextCost = getStepCost(level);
  let totalRemaining = 0;
  for (let l = level; l < maxLevel; l++) {
    totalRemaining += getStepCost(l);
  }

  return {
    isMax: false,
    levelsRemaining,
    resourceType,
    resourceName,
    resourceIconUrl,
    nextCost,
    totalRemaining,
    costBadgeHtml: `<span class="res-mini ${resourceType}"><img class="res-icon-img" src="${resourceIconUrl}" alt="${resourceName}" /> ${formatResourceNumber(nextCost)}</span>`,
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
 * Calculate Cumulative Category Summary
 * Calculates next level and total-to-max costs for a group of units (e.g. Heroes, Equipment, Troops, etc.)
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
  };

  const total = {
    elixir: 0,
    darkElixir: 0,
    builderElixir: 0,
    shinyOre: 0,
    glowyOre: 0,
    starryOre: 0,
  };

  units.forEach((u) => {
    const data = getUnitUpgradeData(u);
    if (data.isMax) {
      maxedCount++;
      return;
    }

    totalLevelsRemaining += data.levelsRemaining || 0;

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

  function renderResourcePills(costObj) {
    const pills = [];

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

  const nextPillsHtml = renderResourcePills(next);
  const totalPillsHtml = renderResourcePills(total);

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
