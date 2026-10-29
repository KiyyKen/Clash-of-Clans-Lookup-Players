// Cache DOM elements
const elements = {
  // Navigation & Search Mode
  tabPlayer: document.getElementById("tabPlayer"),
  tabClan: document.getElementById("tabClan"),
  themeSelect: document.getElementById("themeSelect"),
  soundToggleBtn: document.getElementById("soundToggleBtn"),

  // Search Console
  tagInput: document.getElementById("tagInput"),
  clearInputBtn: document.getElementById("clearInputBtn"),
  fetchBtn: document.getElementById("fetchBtn"),
  errorMessage: document.getElementById("errorMessage"),
  sampleChips: document.querySelectorAll(".sample-chip"),

  // Recent Searches
  recentContainer: document.getElementById("recentContainer"),
  recentChips: document.getElementById("recentChips"),
  clearRecentBtn: document.getElementById("clearRecentBtn"),

  // Player View
  playerCard: document.getElementById("resultCard"),
  playerName: document.getElementById("playerName"),
  playerTagText: document.getElementById("playerTagText"),
  copyPlayerTagBtn: document.getElementById("copyPlayerTagBtn"),
  sharePlayerBtn: document.getElementById("sharePlayerBtn"),
  playerLeagueBadge: document.getElementById("playerLeagueBadge"),
  playerLeagueNameSub: document.getElementById("playerLeagueNameSub"),
  townHallBadge: document.getElementById("townHallBadge"),
  playerTownHallImg: document.getElementById("playerTownHallImg"),
  playerRoleBadge: document.getElementById("playerRoleBadge"),
  playerWarPref: document.getElementById("playerWarPref"),
  playerClanChip: document.getElementById("playerClanChip"),
  playerClanBadgeMini: document.getElementById("playerClanBadgeMini"),
  playerClanNameText: document.getElementById("playerClanNameText"),
  playerLabelsContainer: document.getElementById("playerLabelsContainer"),

  trophies: document.getElementById("trophies"),
  bestTrophiesSub: document.getElementById("bestTrophiesSub"),
  warStars: document.getElementById("warStars"),
  expLevel: document.getElementById("expLevel"),
  attackDefenseStats: document.getElementById("attackDefenseStats"),

  donationRatioText: document.getElementById("donationRatioText"),
  donationRatioBar: document.getElementById("donationRatioBar"),
  clanCapitalPoints: document.getElementById("clanCapitalPoints"),
  thWeaponLevel: document.getElementById("thWeaponLevel"),

  heroesSection: document.getElementById("heroesSection"),
  heroesCountText: document.getElementById("heroesCountText"),
  heroTabHeroes: document.getElementById("heroTabHeroes"),
  heroTabEquip: document.getElementById("heroTabEquip"),
  heroTabTroops: document.getElementById("heroTabTroops"),
  heroTabSpells: document.getElementById("heroTabSpells"),
  heroTabSiege: document.getElementById("heroTabSiege"),
  heroTabPets: document.getElementById("heroTabPets"),
  heroesGrid: document.getElementById("heroesGrid"),
  equipmentGrid: document.getElementById("equipmentGrid"),
  troopsGrid: document.getElementById("troopsGrid"),
  spellsGrid: document.getElementById("spellsGrid"),
  siegeGrid: document.getElementById("siegeGrid"),
  petsGrid: document.getElementById("petsGrid"),

  builderBaseSection: document.getElementById("builderBaseSection"),
  builderHallImg: document.getElementById("builderHallImg"),
  builderHallPill: document.getElementById("builderHallPill"),
  builderLeagueText: document.getElementById("builderLeagueText"),
  builderHallLevel: document.getElementById("builderHallLevel"),
  builderBaseTrophies: document.getElementById("builderBaseTrophies"),
  bestBuilderBaseTrophies: document.getElementById("bestBuilderBaseTrophies"),
  bbTabHeroes: document.getElementById("bbTabHeroes"),
  bbTabTroops: document.getElementById("bbTabTroops"),
  builderHeroesGrid: document.getElementById("builderHeroesGrid"),
  builderTroopsGrid: document.getElementById("builderTroopsGrid"),

  // Clan View
  clanCard: document.getElementById("clanCard"),
  clanBadge: document.getElementById("clanBadge"),
  clanDataName: document.getElementById("clanDataName"),
  clanDataTag: document.getElementById("clanDataTag"),
  copyClanTagBtn: document.getElementById("copyClanTagBtn"),
  shareClanBtn: document.getElementById("shareClanBtn"),
  clanLevelBadge: document.getElementById("clanLevelBadge"),
  clanTypeBadge: document.getElementById("clanTypeBadge"),
  clanWarLeagueBadge: document.getElementById("clanWarLeagueBadge"),
  clanLocationBadge: document.getElementById("clanLocationBadge"),
  clanDescription: document.getElementById("clanDescription"),
  clanLabelsContainer: document.getElementById("clanLabelsContainer"),

  clanPoints: document.getElementById("clanPoints"),
  clanBuilderPoints: document.getElementById("clanBuilderPoints"),
  clanMembers: document.getElementById("clanMembers"),
  warRecord: document.getElementById("warRecord"),
  warWinStreak: document.getElementById("warWinStreak"),
  capitalHallLevel: document.getElementById("capitalHallLevel"),
  capitalPoints: document.getElementById("capitalPoints"),
  requiredEntry: document.getElementById("requiredEntry"),
  warFrequency: document.getElementById("warFrequency"),

  membersCountSummary: document.getElementById("membersCountSummary"),
  memberSearchInput: document.getElementById("memberSearchInput"),
  memberSortSelect: document.getElementById("memberSortSelect"),
  membersTableBody: document.getElementById("membersTableBody"),
  membersStatus: document.getElementById("membersStatus"),

  // Background media
  backgroundImage: document.getElementById("backgroundImage"),
  backgroundVideo: document.getElementById("backgroundVideo"),

  // Toast
  toast: document.getElementById("toast"),
};

// State
let activeTab = "player"; // "player" | "clan"
let currentClanMembers = [];
const RECENT_KEY = "coc_recent_searches_v2";
const THEME_STORAGE_KEY = "coc-theme-preference";

// Helper: safe text injection
function setText(element, value, fallback = "-") {
  if (element) {
    element.textContent = value !== null && value !== undefined && value !== "" ? value : fallback;
  }
}

// Toast notification
let toastTimer = null;
function showToast(message) {
  if (!elements.toast) return;
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    elements.toast.classList.remove("show");
  }, 2400);
}

// Clipboard copy helper
async function copyToClipboard(text, label = "Tag") {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    showToast(`${label} disalin ke clipboard! 📋`);
  } catch (err) {
    showToast(`Gagal menyalin: ${text}`);
  }
}

// Share direct URL
function shareLink(type, tag, name) {
  const clean = tag.replace(/^#/, "");
  const url = `${window.location.origin}${window.location.pathname}?${type}=${encodeURIComponent(clean)}`;
  copyToClipboard(url, `Link ${name || tag}`);
}

// Sync browser URL
function syncUrl(type, tag) {
  const clean = tag.replace(/^#/, "");
  const newUrl = `${window.location.pathname}?${type}=${encodeURIComponent(clean)}`;
  window.history.replaceState({ type, tag }, "", newUrl);
}

// Role label formatting
function formatRole(role) {
  const map = {
    member: "Member",
    admin: "Elder",
    coLeader: "Co-Leader",
    leader: "Leader",
  };
  return map[role] || role || "Member";
}

// Clan type formatting
function formatClanType(type) {
  const map = {
    open: "Public (Open)",
    inviteOnly: "Invite Only",
    closed: "Closed",
  };
  return map[type] || type || "Public";
}

// War frequency formatting
function formatWarFrequency(freq) {
  const map = {
    always: "Always (Selalu)",
    moreThanOnceAWeek: "2x per minggu",
    onceAWeek: "1x per minggu",
    lessThanOnceAWeek: "Jarang",
    never: "Never",
    unknown: "Tidak diketahui",
  };
  return map[freq] || freq || "-";
}

// Tab Switching
function setMode(tab) {
  activeTab = tab;
  if (tab === "player") {
    elements.tabPlayer.classList.add("active");
    elements.tabClan.classList.remove("active");
    elements.tagInput.placeholder = "Masukkan player tag, misal 8QRC82JP8";
    elements.fetchBtn.querySelector(".btn-text").textContent = "Cari Player";
  } else {
    elements.tabClan.classList.add("active");
    elements.tabPlayer.classList.remove("active");
    elements.tagInput.placeholder = "Masukkan clan tag, misal 2LYQPU00L";
    elements.fetchBtn.querySelector(".btn-text").textContent = "Cari Clan";
  }
  elements.tagInput.focus();
}

elements.tabPlayer.addEventListener("click", () => setMode("player"));
elements.tabClan.addEventListener("click", () => setMode("clan"));

// Clear button
elements.tagInput.addEventListener("input", () => {
  elements.clearInputBtn.classList.toggle("visible", elements.tagInput.value.length > 0);
});

elements.clearInputBtn.addEventListener("click", () => {
  elements.tagInput.value = "";
  elements.clearInputBtn.classList.remove("visible");
  elements.tagInput.focus();
});

// Loading state
function toggleLoading(isLoading) {
  elements.fetchBtn.disabled = isLoading;
  const btnText = elements.fetchBtn.querySelector(".btn-text");
  if (isLoading) {
    btnText.innerHTML = '<span class="loading-dot"></span>Memuat...';
  } else {
    btnText.textContent = activeTab === "player" ? "Cari Player" : "Cari Clan";
  }
}

function showError(msg) {
  if (msg) {
    elements.errorMessage.textContent = msg;
    elements.errorMessage.classList.add("show");
  } else {
    elements.errorMessage.textContent = "";
    elements.errorMessage.classList.remove("show");
  }
}

function resetViews() {
  showError("");
  elements.playerCard.classList.remove("show");
  elements.clanCard.classList.remove("show");
}

async function requestApi(url) {
  const response = await fetch(url);
  const data = await response.json();
  return { response, data };
}

// Render Playstyle Labels
function renderLabels(container, labels = []) {
  if (!container) return;
  container.innerHTML = "";
  if (!labels || labels.length === 0) {
    container.style.display = "none";
    return;
  }
  container.style.display = "flex";
  labels.forEach((l) => {
    const chip = document.createElement("div");
    chip.className = "official-label-chip";
    if (l.iconUrl) {
      const img = document.createElement("img");
      img.className = "official-label-img";
      img.src = l.iconUrl;
      img.alt = "";
      chip.appendChild(img);
    }
    const txt = document.createElement("span");
    txt.textContent = l.name;
    chip.appendChild(txt);
    container.appendChild(chip);
  });
}

// Armory & Army Tab System (Heroes, Equipment, Troops, Spells, Siege, Pets)
const armoryTabsList = [
  { get tab() { return elements.heroTabHeroes; }, get grid() { return elements.heroesGrid; } },
  { get tab() { return elements.heroTabEquip; }, get grid() { return elements.equipmentGrid; } },
  { get tab() { return elements.heroTabTroops; }, get grid() { return elements.troopsGrid; } },
  { get tab() { return elements.heroTabSpells; }, get grid() { return elements.spellsGrid; } },
  { get tab() { return elements.heroTabSiege; }, get grid() { return elements.siegeGrid; } },
  { get tab() { return elements.heroTabPets; }, get grid() { return elements.petsGrid; } },
];

function selectArmoryTab(activeTabElement) {
  armoryTabsList.forEach(({ tab, grid }) => {
    if (!tab || !grid) return;
    if (tab === activeTabElement) {
      tab.classList.add("active");
      grid.style.display = "grid";
    } else {
      tab.classList.remove("active");
      grid.style.display = "none";
    }
  });
}

armoryTabsList.forEach(({ tab }) => {
  if (tab) {
    tab.addEventListener("click", () => selectArmoryTab(tab));
  }
});

// Builder Base Army Tabs (Heroes vs Troops)
if (elements.bbTabHeroes && elements.bbTabTroops) {
  elements.bbTabHeroes.addEventListener("click", () => {
    elements.bbTabHeroes.classList.add("active");
    elements.bbTabTroops.classList.remove("active");
    if (elements.builderHeroesGrid) elements.builderHeroesGrid.style.display = "grid";
    if (elements.builderTroopsGrid) elements.builderTroopsGrid.style.display = "none";
  });
  elements.bbTabTroops.addEventListener("click", () => {
    elements.bbTabTroops.classList.add("active");
    elements.bbTabHeroes.classList.remove("active");
    if (elements.builderHeroesGrid) elements.builderHeroesGrid.style.display = "none";
    if (elements.builderTroopsGrid) elements.builderTroopsGrid.style.display = "grid";
  });
}

// Clash of Clans Categorization Sets
const SIEGE_MACHINE_NAMES = new Set([
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

const PET_NAMES = new Set([
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

// Asset URL Helpers (Town Hall, Builder Hall, Heroes, Equipment, Troops, Spells, Pets)
function getTownHallImg(level) {
  const lvl = Math.max(1, Math.min(18, parseInt(level, 10) || 1));
  return `https://assets.clashk.ing/buildings/home-village/town_hall/level_${lvl}.webp`;
}

function getBuilderHallImg(level) {
  const lvl = Math.max(1, Math.min(10, parseInt(level, 10) || 1));
  return `https://assets.clashk.ing/buildings/builder-base/builder_hall/level_${lvl}.webp`;
}

function getHeroIcon(name) {
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

function getEquipmentIcon(name) {
  if (!name) return "/assets/barbarian-temp.svg";
  const key = name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  if (key === "portal_pendant") {
    return "/assets/portal_pendant.png";
  }
  return `https://assets.clashk.ing/equipment/${key}.webp`;
}

function getTroopIcon(name) {
  if (!name) return "/assets/barbarian-temp.svg";
  const map = {
    "p.e.k.k.a": "pekka",
    "power p.e.k.k.a": "power_pekka",
  };
  const key = map[name.toLowerCase().trim()] || name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  return `https://assets.clashk.ing/troops/${key}/icon.webp`;
}

function getSpellIcon(name) {
  if (!name) return "/assets/barbarian-temp.svg";
  const key = name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  return `https://assets.clashk.ing/spells/${key}.webp`;
}

function getPetIcon(name) {
  if (!name) return "/assets/barbarian-temp.svg";
  const map = {
    "l.a.s.s.i": "lassi",
  };
  const key = map[name.toLowerCase().trim()] || name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  return `https://assets.clashk.ing/pets/${key}/icon.webp`;
}

function createArmorySlot(name, level, maxLevel, iconUrl) {
  const isMax = level >= maxLevel;
  const pct = Math.min(100, Math.round((level / (maxLevel || 1)) * 100));

  const card = document.createElement("div");
  card.className = "hero-slot-card";
  card.innerHTML = `
    <div class="hero-thumb-box">
      <img
        class="hero-thumb-img"
        src="${iconUrl}"
        alt="${name}"
        loading="lazy"
        onerror="this.onerror=null; this.src='/assets/barbarian-temp.svg';"
      />
    </div>
    <div class="hero-slot-info">
      <div class="hero-slot-head">
        <span class="hero-slot-name" title="${name}">${name}</span>
        <span class="hero-slot-level">Lv ${level} <small style="color:var(--text-muted);font-weight:400;">/ ${maxLevel}</small></span>
      </div>
      <div class="hero-level-track">
        <div class="hero-level-fill ${isMax ? "maxed" : ""}" style="width: ${pct}%;"></div>
      </div>
      ${isMax ? '<span class="hero-max-badge">MAX</span>' : ""}
    </div>
  `;
  return card;
}

function renderArmory(heroes = [], equipment = [], troops = [], spells = []) {
  if (elements.heroesGrid) elements.heroesGrid.innerHTML = "";
  if (elements.equipmentGrid) elements.equipmentGrid.innerHTML = "";
  if (elements.troopsGrid) elements.troopsGrid.innerHTML = "";
  if (elements.spellsGrid) elements.spellsGrid.innerHTML = "";
  if (elements.siegeGrid) elements.siegeGrid.innerHTML = "";
  if (elements.petsGrid) elements.petsGrid.innerHTML = "";
  if (elements.builderHeroesGrid) elements.builderHeroesGrid.innerHTML = "";
  if (elements.builderTroopsGrid) elements.builderTroopsGrid.innerHTML = "";

  const homeHeroes = heroes.filter((h) => h.village === "home" || !h.village);
  const builderHeroes = heroes.filter((h) => h.village === "builderBase");

  const regularTroops = [];
  const siegeMachines = [];
  const pets = [];
  const bbTroops = [];

  (troops || []).forEach((t) => {
    if (t.village === "builderBase") {
      bbTroops.push(t);
    } else if (PET_NAMES.has(t.name)) {
      pets.push(t);
    } else if (SIEGE_MACHINE_NAMES.has(t.name)) {
      siegeMachines.push(t);
    } else {
      regularTroops.push(t);
    }
  });

  const totalArmoryItems = homeHeroes.length + equipment.length + regularTroops.length + spells.length + siegeMachines.length + pets.length;

  if (totalArmoryItems === 0) {
    elements.heroesSection.style.display = "none";
  } else {
    elements.heroesSection.style.display = "flex";
    setText(elements.heroesCountText, `${totalArmoryItems} Unit`);

    homeHeroes.forEach((h) => {
      elements.heroesGrid.appendChild(createArmorySlot(h.name, h.level, h.maxLevel, getHeroIcon(h.name)));
    });

    equipment.forEach((eq) => {
      elements.equipmentGrid.appendChild(createArmorySlot(eq.name, eq.level, eq.maxLevel, getEquipmentIcon(eq.name)));
    });

    regularTroops.forEach((t) => {
      elements.troopsGrid.appendChild(createArmorySlot(t.name, t.level, t.maxLevel, getTroopIcon(t.name)));
    });

    (spells || []).forEach((s) => {
      elements.spellsGrid.appendChild(createArmorySlot(s.name, s.level, s.maxLevel, getSpellIcon(s.name)));
    });

    siegeMachines.forEach((sm) => {
      elements.siegeGrid.appendChild(createArmorySlot(sm.name, sm.level, sm.maxLevel, getTroopIcon(sm.name)));
    });

    pets.forEach((p) => {
      elements.petsGrid.appendChild(createArmorySlot(p.name, p.level, p.maxLevel, getPetIcon(p.name)));
    });

    // Update tab labels with counts
    if (elements.heroTabHeroes) elements.heroTabHeroes.textContent = `Heroes (${homeHeroes.length})`;
    if (elements.heroTabEquip) elements.heroTabEquip.textContent = `Equipment (${equipment.length})`;
    if (elements.heroTabTroops) elements.heroTabTroops.textContent = `Pasukan (${regularTroops.length})`;
    if (elements.heroTabSpells) elements.heroTabSpells.textContent = `Spell (${(spells || []).length})`;
    if (elements.heroTabSiege) {
      elements.heroTabSiege.style.display = siegeMachines.length > 0 ? "inline-block" : "none";
      elements.heroTabSiege.textContent = `Siege (${siegeMachines.length})`;
    }
    if (elements.heroTabPets) {
      elements.heroTabPets.style.display = pets.length > 0 ? "inline-block" : "none";
      elements.heroTabPets.textContent = `Pets (${pets.length})`;
    }

    // Default to Heroes tab
    selectArmoryTab(elements.heroTabHeroes);
  }

  // Builder Heroes & Troops
  if (builderHeroes.length > 0 || bbTroops.length > 0) {
    builderHeroes.forEach((bh) => {
      elements.builderHeroesGrid.appendChild(createArmorySlot(bh.name, bh.level, bh.maxLevel, getHeroIcon(bh.name)));
    });
    bbTroops.forEach((bt) => {
      elements.builderTroopsGrid.appendChild(createArmorySlot(bt.name, bt.level, bt.maxLevel, getTroopIcon(bt.name)));
    });

    if (elements.bbTabHeroes) elements.bbTabHeroes.textContent = `Heroes (${builderHeroes.length})`;
    if (elements.bbTabTroops) elements.bbTabTroops.textContent = `Pasukan BB (${bbTroops.length})`;

    if (elements.bbTabHeroes && elements.bbTabTroops) {
      elements.bbTabHeroes.classList.add("active");
      elements.bbTabTroops.classList.remove("active");
      if (elements.builderHeroesGrid) elements.builderHeroesGrid.style.display = "grid";
      if (elements.builderTroopsGrid) elements.builderTroopsGrid.style.display = "none";
    }
  }
}

// Render Player Profile
function renderPlayer(p) {
  setText(elements.playerName, p.name);
  setText(elements.playerTagText, p.tag);

  elements.copyPlayerTagBtn.onclick = () => copyToClipboard(p.tag, "Player Tag");
  elements.sharePlayerBtn.onclick = () => shareLink("player", p.tag, p.name);

  // League icon & text
  if (p.league && p.league.iconUrl) {
    elements.playerLeagueBadge.src = p.league.iconUrl;
    elements.playerLeagueBadge.title = p.league.name;
    setText(elements.playerLeagueNameSub, p.league.name);
  } else {
    elements.playerLeagueBadge.src = "/assets/trophy-temp.svg";
    elements.playerLeagueBadge.title = "Unranked";
    setText(elements.playerLeagueNameSub, "Unranked");
  }

  // Town Hall building image & meta pill
  if (elements.playerTownHallImg) {
    elements.playerTownHallImg.src = getTownHallImg(p.townHallLevel);
    elements.playerTownHallImg.alt = `Town Hall ${p.townHallLevel || 1}`;
  }
  const thText = p.townHallWeaponLevel
    ? `TH ${p.townHallLevel} ⭐${p.townHallWeaponLevel}`
    : `TH ${p.townHallLevel}`;
  setText(elements.townHallBadge, thText);
  setText(elements.playerRoleBadge, formatRole(p.role));
  elements.playerRoleBadge.style.display = p.role ? "inline-flex" : "none";

  if (p.warPreference) {
    elements.playerWarPref.textContent = p.warPreference === "in" ? "Wars: In ✅" : "Wars: Out ❌";
    elements.playerWarPref.style.display = "inline-flex";
  } else {
    elements.playerWarPref.style.display = "none";
  }

  // Clan chip
  if (p.clanName) {
    elements.playerClanChip.style.display = "inline-flex";
    setText(elements.playerClanNameText, p.clanName);
    elements.playerClanBadgeMini.src = p.clanBadgeUrl || "/assets/clan-temp.svg";
    elements.playerClanChip.onclick = () => {
      if (p.clanTag) {
        setMode("clan");
        elements.tagInput.value = p.clanTag.replace(/^#/, "");
        searchClan(p.clanTag);
      }
    };
  } else {
    elements.playerClanChip.style.display = "none";
  }

  // Labels
  renderLabels(elements.playerLabelsContainer, p.labels);

  // Combat metrics
  setText(elements.trophies, `${p.trophies?.toLocaleString() || 0}`);
  setText(elements.bestTrophiesSub, `Tertinggi: ${p.bestTrophies?.toLocaleString() || 0}`);
  setText(elements.warStars, `${p.warStars?.toLocaleString() || 0} ⭐`);
  setText(elements.expLevel, `Level ${p.expLevel || 1}`);
  setText(elements.attackDefenseStats, `${p.attackWins || 0} / ${p.defenseWins || 0}`);

  // Economy & Clan metrics
  const sent = p.donations || 0;
  const rcvd = p.donationsReceived || 0;
  setText(elements.donationRatioText, `${sent.toLocaleString()} / ${rcvd.toLocaleString()}`);

  const totalDonations = sent + rcvd;
  const ratioPct = totalDonations > 0 ? Math.round((sent / totalDonations) * 100) : 50;
  if (elements.donationRatioBar) {
    elements.donationRatioBar.style.width = `${ratioPct}%`;
  }

  setText(elements.clanCapitalPoints, `${p.clanCapitalContributions?.toLocaleString() || 0}`);
  setText(elements.thWeaponLevel, p.townHallWeaponLevel ? `Bintang ${p.townHallWeaponLevel}` : "None");

  // Armory
  renderArmory(p.heroes, p.heroEquipment, p.troops, p.spells);

  // Builder Base
  if (p.builderHallLevel) {
    elements.builderBaseSection.style.display = "flex";
    if (elements.builderHallImg) {
      elements.builderHallImg.src = getBuilderHallImg(p.builderHallLevel);
      elements.builderHallImg.alt = `Builder Hall ${p.builderHallLevel}`;
    }
    setText(elements.builderHallPill, `BH ${p.builderHallLevel}`);
    setText(elements.builderLeagueText, p.builderBaseLeague || "Builder Base");
    setText(elements.builderHallLevel, `BH ${p.builderHallLevel}`);
    setText(elements.builderBaseTrophies, `${p.builderBaseTrophies?.toLocaleString() || 0}`);
    setText(elements.bestBuilderBaseTrophies, `${p.bestBuilderBaseTrophies?.toLocaleString() || 0}`);
  } else {
    elements.builderBaseSection.style.display = "none";
  }

  elements.playerCard.classList.add("show");
  saveRecent("player", p.tag, p.name);
  syncUrl("player", p.tag);
}

// Render Clan Profile
function renderClan(c) {
  setText(elements.clanDataName, c.name);
  setText(elements.clanDataTag, c.tag);

  elements.copyClanTagBtn.onclick = () => copyToClipboard(c.tag, "Clan Tag");
  elements.shareClanBtn.onclick = () => shareLink("clan", c.tag, c.name);

  elements.clanBadge.src = c.badgeUrl || "/assets/clan-temp.svg";
  setText(elements.clanLevelBadge, `Level ${c.clanLevel}`);
  setText(elements.clanTypeBadge, formatClanType(c.type));
  setText(elements.clanWarLeagueBadge, c.warLeague ? `🏆 ${c.warLeague}` : "War League");
  setText(elements.clanLocationBadge, c.location ? `📍 ${c.location}` : "📍 International");

  if (c.description) {
    elements.clanDescription.textContent = `“${c.description}”`;
    elements.clanDescription.style.display = "block";
  } else {
    elements.clanDescription.style.display = "none";
  }

  renderLabels(elements.clanLabelsContainer, c.labels);

  // Metrics
  setText(elements.clanPoints, `${c.clanPoints?.toLocaleString() || 0}`);
  setText(elements.clanBuilderPoints, `Builder Base: ${c.clanBuilderBasePoints?.toLocaleString() || 0}`);
  setText(elements.clanMembers, `${c.members} / 50`);

  const warLogStr = c.isWarLogPublic
    ? `${c.warWins || 0}W - ${c.warLosses || 0}L - ${c.warTies || 0}T`
    : `${c.warWins || 0} Menang (Log Privat)`;
  setText(elements.warRecord, warLogStr);
  setText(elements.warWinStreak, `Streak: ${c.warWinStreak || 0} Win`);

  setText(elements.capitalHallLevel, c.capitalHallLevel ? `CH ${c.capitalHallLevel}` : "-");
  setText(elements.capitalPoints, `Capital Points: ${c.clanCapitalPoints?.toLocaleString() || 0}`);

  const reqTh = c.requiredTownhallLevel ? `TH ${c.requiredTownhallLevel}` : "-";
  setText(elements.requiredEntry, `${c.requiredTrophies?.toLocaleString() || 0} 🏆 / ${reqTh}`);
  setText(elements.warFrequency, formatWarFrequency(c.warFrequency));

  elements.clanCard.classList.add("show");
  saveRecent("clan", c.tag, c.name);
  syncUrl("clan", c.tag);
}

// Clan Roster Table Filtering & Sorting
function getFilteredAndSortedRoster() {
  const query = (elements.memberSearchInput?.value || "").toLowerCase().trim();
  const sortMode = elements.memberSortSelect?.value || "trophies_desc";

  let list = [...currentClanMembers];

  if (query) {
    list = list.filter((m) =>
      (m.name || "").toLowerCase().includes(query) ||
      (m.tag || "").toLowerCase().includes(query)
    );
  }

  list.sort((a, b) => {
    if (sortMode === "trophies_desc") return (b.trophies || 0) - (a.trophies || 0);
    if (sortMode === "th_desc") return (b.townHallLevel || 0) - (a.townHallLevel || 0);
    if (sortMode === "donations_desc") return (b.donations || 0) - (a.donations || 0);
    if (sortMode === "name_asc") return (a.name || "").localeCompare(b.name || "");
    return 0;
  });

  return list;
}

function updateRosterTable() {
  const list = getFilteredAndSortedRoster();

  if (!list.length) {
    elements.membersStatus.textContent = currentClanMembers.length === 0
      ? "Clan ini tidak memiliki data anggota."
      : "Tidak ada anggota yang cocok dengan filter.";
    elements.membersTableBody.innerHTML =
      '<tr><td colspan="6" class="table-empty">Tidak ada data anggota ditemukan.</td></tr>';
    return;
  }

  elements.membersStatus.textContent = `Menampilkan ${list.length} dari ${currentClanMembers.length} anggota clan. Klik baris untuk inspect.`;

  const rows = list
    .map((m, idx) => {
      const icon = m.leagueIcon
        ? `<img class="member-league-img" src="${m.leagueIcon}" alt="" />`
        : "";
      const thImg = m.townHallLevel
        ? `<img class="table-th-icon" src="${getTownHallImg(m.townHallLevel)}" alt="TH ${m.townHallLevel}" loading="lazy" />`
        : "";
      return `
        <tr class="member-row-clickable" data-tag="${m.tag}">
          <td style="font-weight:700;color:var(--text-tertiary);">${m.clanRank || idx + 1}</td>
          <td>
            <div class="member-name-flex">
              ${icon}
              <span>${m.name}</span>
            </div>
          </td>
          <td><span class="pill-role">${formatRole(m.role)}</span></td>
          <td>
            <div class="table-th-flex">
              ${thImg}
              <span class="pill-th">TH ${m.townHallLevel || "-"}</span>
            </div>
          </td>
          <td style="font-weight:700;font-family:var(--font-mono);">${m.trophies?.toLocaleString() || 0}</td>
          <td style="font-family:var(--font-mono);">${m.donations?.toLocaleString() || 0}</td>
        </tr>
      `;
    })
    .join("");

  elements.membersTableBody.innerHTML = rows;

  elements.membersTableBody.querySelectorAll(".member-row-clickable").forEach((row) => {
    row.addEventListener("click", () => {
      const tag = row.dataset.tag;
      if (tag) {
        setMode("player");
        elements.tagInput.value = tag.replace(/^#/, "");
        searchPlayer(tag);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  });
}

if (elements.memberSearchInput) {
  elements.memberSearchInput.addEventListener("input", updateRosterTable);
}
if (elements.memberSortSelect) {
  elements.memberSortSelect.addEventListener("change", updateRosterTable);
}

function renderClanMembers(members = []) {
  currentClanMembers = members;
  setText(elements.membersCountSummary, `${members.length} Anggota`);
  if (elements.memberSearchInput) elements.memberSearchInput.value = "";
  updateRosterTable();
}

// Search Player
async function searchPlayer(tag) {
  resetViews();
  toggleLoading(true);

  try {
    const { response, data } = await requestApi(`/player/${encodeURIComponent(tag)}`);
    if (!response.ok) {
      showError(data.error || "Gagal mengambil data pemain.");
      return;
    }
    renderPlayer(data);

    if (data.clanTag) {
      fetchClanDataSilently(data.clanTag);
    }
  } catch (err) {
    showError("Terjadi kendala jaringan saat menghubungi server.");
  } finally {
    toggleLoading(false);
  }
}

// Search Clan
async function searchClan(tag) {
  resetViews();
  toggleLoading(true);

  try {
    const { response, data } = await requestApi(`/clan/${encodeURIComponent(tag)}`);
    if (!response.ok) {
      showError(data.error || "Gagal mengambil data clan.");
      return;
    }
    renderClan(data);
    fetchClanMembers(tag);
  } catch (err) {
    showError("Terjadi kendala jaringan saat menghubungi server.");
  } finally {
    toggleLoading(false);
  }
}

async function fetchClanDataSilently(clanTag) {
  try {
    const { response, data } = await requestApi(`/clan/${encodeURIComponent(clanTag)}`);
    if (response.ok) {
      renderClan(data);
      fetchClanMembers(clanTag);
    }
  } catch (err) {}
}

async function fetchClanMembers(clanTag) {
  try {
    elements.membersStatus.textContent = "Memuat data anggota...";
    const { response, data } = await requestApi(`/clan/${encodeURIComponent(clanTag)}/members`);
    if (response.ok && data.members) {
      renderClanMembers(data.members);
    } else {
      elements.membersStatus.textContent = "Gagal memuat anggota.";
    }
  } catch (err) {
    elements.membersStatus.textContent = "Gagal memuat anggota.";
  }
}

// Execute search
function executeSearch() {
  const val = elements.tagInput.value.trim();
  if (!val) {
    showError(activeTab === "player" ? "Ketik player tag terlebih dahulu." : "Ketik clan tag terlebih dahulu.");
    return;
  }
  const norm = val.startsWith("#") ? val : `#${val}`;
  if (activeTab === "player") {
    searchPlayer(norm);
  } else {
    searchClan(norm);
  }
}

elements.fetchBtn.addEventListener("click", executeSearch);
elements.tagInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") executeSearch();
});

// Quick samples
elements.sampleChips.forEach((chip) => {
  chip.addEventListener("click", () => {
    const type = chip.dataset.type;
    const tag = chip.dataset.tag;
    setMode(type);
    elements.tagInput.value = tag.replace(/^#/, "");
    elements.clearInputBtn.classList.add("visible");
    if (type === "player") searchPlayer(tag);
    else searchClan(tag);
  });
});

// Recent searches
function loadRecent() {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveRecent(type, tag, name) {
  let list = loadRecent().filter((i) => i.tag !== tag);
  list.unshift({ type, tag, name, time: Date.now() });
  if (list.length > 6) list.pop();
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(list));
    renderRecent();
  } catch (e) {}
}

function renderRecent() {
  const list = loadRecent();
  if (!list.length) {
    elements.recentContainer.classList.add("hide");
    return;
  }
  elements.recentContainer.classList.remove("hide");
  elements.recentChips.innerHTML = "";

  list.forEach((item) => {
    const chip = document.createElement("div");
    chip.className = "recent-chip";
    chip.innerHTML = `
      <span>${item.name || item.tag}</span>
      <span class="recent-remove" title="Hapus">✕</span>
    `;

    chip.addEventListener("click", (e) => {
      if (e.target.classList.contains("recent-remove")) {
        e.stopPropagation();
        deleteRecent(item.tag);
        return;
      }
      setMode(item.type);
      elements.tagInput.value = item.tag.replace(/^#/, "");
      elements.clearInputBtn.classList.add("visible");
      if (item.type === "player") searchPlayer(item.tag);
      else searchClan(item.tag);
    });

    elements.recentChips.appendChild(chip);
  });
}

function deleteRecent(tag) {
  let list = loadRecent().filter((i) => i.tag !== tag);
  localStorage.setItem(RECENT_KEY, JSON.stringify(list));
  renderRecent();
}

elements.clearRecentBtn.addEventListener("click", () => {
  localStorage.removeItem(RECENT_KEY);
  renderRecent();
});

// Theme Management
function applyTheme(theme) {
  document.body.classList.remove("bg-image-mode", "bg-video-mode");

  if (theme === "image") {
    document.body.classList.add("bg-image-mode");
  } else if (theme === "video") {
    document.body.classList.add("bg-video-mode");
    if (elements.backgroundVideo) {
      elements.backgroundVideo.play().catch(() => {});
    }
  } else if (elements.backgroundVideo) {
    elements.backgroundVideo.pause();
  }

  if (elements.themeSelect) {
    elements.themeSelect.value = theme;
  }

  localStorage.setItem(THEME_STORAGE_KEY, theme);
  updateSoundBtn();
}

function updateSoundBtn() {
  if (!elements.soundToggleBtn || !elements.backgroundVideo) return;
  const isVideo = document.body.classList.contains("bg-video-mode");
  const isMuted = elements.backgroundVideo.muted;

  elements.soundToggleBtn.classList.toggle("sound-on", isVideo && !isMuted);
  elements.soundToggleBtn.classList.toggle("visible", isVideo);
}

if (elements.soundToggleBtn) {
  elements.soundToggleBtn.addEventListener("click", async () => {
    if (!elements.backgroundVideo) return;
    if (!document.body.classList.contains("bg-video-mode")) {
      applyTheme("video");
    }
    elements.backgroundVideo.muted = !elements.backgroundVideo.muted;
    try {
      await elements.backgroundVideo.play();
    } catch (e) {
      elements.backgroundVideo.muted = true;
    }
    updateSoundBtn();
  });
}

if (elements.themeSelect) {
  elements.themeSelect.addEventListener("change", (e) => {
    applyTheme(e.target.value);
    const msgs = {
      gradient: "Tema Tactical Dark aktif 🌙",
      image: "Tema Village Daylight (Terang) aktif ☀️",
      video: "Tema Cinematic Video aktif 🎬 (Nyalakan audio jika mau)",
    };
    if (msgs[e.target.value]) showToast(msgs[e.target.value]);
  });
}

// Fallback handlers
if (elements.backgroundImage) {
  elements.backgroundImage.addEventListener("error", () => {
    if (document.body.classList.contains("bg-image-mode")) applyTheme("gradient");
  });
}
if (elements.backgroundVideo) {
  elements.backgroundVideo.addEventListener("error", () => {
    if (document.body.classList.contains("bg-video-mode")) applyTheme("gradient");
  });
}

// Initialise
const initialTheme = localStorage.getItem(THEME_STORAGE_KEY) || "gradient";
applyTheme(initialTheme);
renderRecent();

// Direct Link param check
const params = new URLSearchParams(window.location.search);
const pTag = params.get("player");
const cTag = params.get("clan");

if (pTag) {
  setMode("player");
  elements.tagInput.value = pTag.replace(/^#/, "");
  elements.clearInputBtn.classList.add("visible");
  searchPlayer(pTag);
} else if (cTag) {
  setMode("clan");
  elements.tagInput.value = cTag.replace(/^#/, "");
  elements.clearInputBtn.classList.add("visible");
  searchClan(cTag);
}
