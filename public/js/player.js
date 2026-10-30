import { elements, setText } from "./dom.js";
import { copyToClipboard, shareLink, syncUrl } from "./clipboard.js";
import {
  getTownHallImg,
  getBuilderHallImg,
  getHeroIcon,
  getEquipmentIcon,
  getTroopIcon,
  getSpellIcon,
  getPetIcon,
  SIEGE_MACHINE_NAMES,
  PET_NAMES,
} from "./assets.js";
import { formatRole, renderLabels } from "./formatters.js";
import { saveRecent } from "./history.js";
import { requestApi } from "./api.js";
import { getUnitUpgradeData, RESOURCE_ICONS } from "./upgradeCalculator.js";

// Armory tab elements mapping
const armoryTabsList = [
  { get tab() { return elements.heroTabHeroes; }, get grid() { return elements.heroesGrid; } },
  { get tab() { return elements.heroTabEquip; }, get grid() { return elements.equipmentGrid; } },
  { get tab() { return elements.heroTabTroops; }, get grid() { return elements.troopsGrid; } },
  { get tab() { return elements.heroTabSpells; }, get grid() { return elements.spellsGrid; } },
  { get tab() { return elements.heroTabSiege; }, get grid() { return elements.siegeGrid; } },
  { get tab() { return elements.heroTabPets; }, get grid() { return elements.petsGrid; } },
];

export function selectArmoryTab(activeTabElement) {
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

export function closeUpgradeModal() {
  if (elements.upgradeModal) {
    elements.upgradeModal.classList.remove("show");
    elements.upgradeModal.setAttribute("aria-hidden", "true");
  }
}

export function openUpgradeModal({ name, level, maxLevel, iconUrl, category, village, upgradeData }) {
  if (!elements.upgradeModal) return;

  const isMax = level >= maxLevel;
  const pct = Math.min(100, Math.round((level / (maxLevel || 1)) * 100));

  const categoryLabels = {
    hero: village === "builderBase" ? "HERO DESA MALAM" : "HERO",
    equipment: maxLevel > 18 ? "EPIC EQUIPMENT" : "COMMON EQUIPMENT",
    troop: village === "builderBase" ? "PASUKAN DESA MALAM" : "PASUKAN",
    spell: "SPELL",
    siege: "SIEGE MACHINE",
    pet: "HERO PET",
  };

  if (elements.modalUnitImg) {
    elements.modalUnitImg.src = iconUrl;
    elements.modalUnitImg.alt = name;
  }
  setText(elements.modalUnitCategory, categoryLabels[category] || "UNIT");
  setText(elements.modalUnitName, name);
  setText(elements.modalUnitLevel, `Level ${level} / ${maxLevel}`);

  if (elements.modalUnitStatus) {
    elements.modalUnitStatus.textContent = isMax ? "MAX LEVEL 🏆" : `${upgradeData.levelsRemaining} Level lagi menuju MAX`;
    elements.modalUnitStatus.className = `modal-status-badge ${isMax ? "maxed" : ""}`;
  }

  setText(elements.modalProgressPct, `${pct}%`);
  if (elements.modalTrackFill) {
    elements.modalTrackFill.style.width = `${pct}%`;
    elements.modalTrackFill.className = `modal-track-fill ${isMax ? "maxed" : ""}`;
  }

  // Next level cost box
  setText(elements.modalNextLevelTag, isMax ? "MAX" : `Ke Lv ${level + 1}`);
  if (elements.modalNextCostBody) {
    if (isMax) {
      elements.modalNextCostBody.innerHTML = `
        <div class="cost-max-notice">
          <span>🏆</span>
          <span>Unit ini sudah mencapai level maksimum!</span>
        </div>
      `;
    } else if (category === "equipment") {
      const { shiny, glowy, starry } = upgradeData.nextCost;
      const pills = [];
      if (shiny > 0) pills.push(`<div class="cost-item-pill"><img class="res-icon-img modal-res-icon" src="${RESOURCE_ICONS.shiny_ore}" alt="Shiny Ore" /><span>${shiny.toLocaleString()}</span><span class="res-name">Shiny Ore</span></div>`);
      if (glowy > 0) pills.push(`<div class="cost-item-pill"><img class="res-icon-img modal-res-icon" src="${RESOURCE_ICONS.glowy_ore}" alt="Glowy Ore" /><span>${glowy.toLocaleString()}</span><span class="res-name">Glowy Ore</span></div>`);
      if (starry > 0) pills.push(`<div class="cost-item-pill"><img class="res-icon-img modal-res-icon" src="${RESOURCE_ICONS.starry_ore}" alt="Starry Ore" /><span>${starry.toLocaleString()}</span><span class="res-name">Starry Ore</span></div>`);
      elements.modalNextCostBody.innerHTML = pills.join("");
    } else {
      elements.modalNextCostBody.innerHTML = `
        <div class="cost-item-pill">
          <img class="res-icon-img modal-res-icon" src="${upgradeData.resourceIconUrl}" alt="${upgradeData.resourceName}" />
          <span>${upgradeData.nextCost.toLocaleString()}</span>
          <span class="res-name">${upgradeData.resourceName}</span>
        </div>
      `;
    }
  }

  // Road to max cost box
  setText(elements.modalRemainingLevels, isMax ? "Selesai" : `${upgradeData.levelsRemaining} Level lagi`);
  if (elements.modalTotalCostBody) {
    if (isMax) {
      elements.modalTotalCostBody.innerHTML = `
        <div class="cost-max-notice">
          <span>✅</span>
          <span>Semua level telah terselesaikan! Tidak butuh resource lagi.</span>
        </div>
      `;
    } else if (category === "equipment") {
      const { shiny, glowy, starry } = upgradeData.totalRemaining;
      const pills = [];
      if (shiny > 0) pills.push(`<div class="cost-item-pill"><img class="res-icon-img modal-res-icon" src="${RESOURCE_ICONS.shiny_ore}" alt="Shiny Ore" /><span>${shiny.toLocaleString()}</span><span class="res-name">Total Shiny</span></div>`);
      if (glowy > 0) pills.push(`<div class="cost-item-pill"><img class="res-icon-img modal-res-icon" src="${RESOURCE_ICONS.glowy_ore}" alt="Glowy Ore" /><span>${glowy.toLocaleString()}</span><span class="res-name">Total Glowy</span></div>`);
      if (starry > 0) pills.push(`<div class="cost-item-pill"><img class="res-icon-img modal-res-icon" src="${RESOURCE_ICONS.starry_ore}" alt="Starry Ore" /><span>${starry.toLocaleString()}</span><span class="res-name">Total Starry</span></div>`);
      elements.modalTotalCostBody.innerHTML = pills.join("");
    } else {
      elements.modalTotalCostBody.innerHTML = `
        <div class="cost-item-pill">
          <img class="res-icon-img modal-res-icon" src="${upgradeData.resourceIconUrl}" alt="${upgradeData.resourceName}" />
          <span>${upgradeData.totalRemaining.toLocaleString()}</span>
          <span class="res-name">Total ${upgradeData.resourceName}</span>
        </div>
      `;
    }
  }

  elements.upgradeModal.classList.add("show");
  elements.upgradeModal.setAttribute("aria-hidden", "false");
}

export function initArmoryTabs() {
  armoryTabsList.forEach(({ tab }) => {
    if (tab) {
      tab.addEventListener("click", () => selectArmoryTab(tab));
    }
  });

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

  // Modal event listeners
  if (elements.upgradeModalClose) {
    elements.upgradeModalClose.addEventListener("click", closeUpgradeModal);
  }
  if (elements.upgradeModalBackdrop) {
    elements.upgradeModalBackdrop.addEventListener("click", closeUpgradeModal);
  }
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeUpgradeModal();
  });
}

export function createArmorySlot(name, level, maxLevel, iconUrl, category = "troop", village = "home") {
  const isMax = level >= maxLevel;
  const pct = Math.min(100, Math.round((level / (maxLevel || 1)) * 100));
  const upgradeData = getUnitUpgradeData({ name, level, maxLevel, category, village });

  const card = document.createElement("div");
  card.className = "hero-slot-card";
  card.setAttribute("role", "button");
  card.setAttribute("tabindex", "0");
  card.setAttribute("title", `Klik untuk melihat detail kebutuhan upgrade ${name}`);
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
      <div class="hero-cost-pill">
        ${upgradeData.costBadgeHtml}
      </div>
    </div>
  `;

  const onOpen = () => openUpgradeModal({ name, level, maxLevel, iconUrl, category, village, upgradeData });
  card.addEventListener("click", onOpen);
  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onOpen();
    }
  });

  return card;
}

export function renderArmory(heroes = [], equipment = [], troops = [], spells = []) {
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
    if (elements.heroesSection) elements.heroesSection.style.display = "none";
  } else {
    if (elements.heroesSection) elements.heroesSection.style.display = "flex";
    setText(elements.heroesCountText, `${totalArmoryItems} Unit`);

    homeHeroes.forEach((h) => {
      elements.heroesGrid.appendChild(createArmorySlot(h.name, h.level, h.maxLevel, getHeroIcon(h.name), "hero", "home"));
    });

    equipment.forEach((eq) => {
      elements.equipmentGrid.appendChild(createArmorySlot(eq.name, eq.level, eq.maxLevel, getEquipmentIcon(eq.name), "equipment", "home"));
    });

    regularTroops.forEach((t) => {
      elements.troopsGrid.appendChild(createArmorySlot(t.name, t.level, t.maxLevel, getTroopIcon(t.name), "troop", "home"));
    });

    (spells || []).forEach((s) => {
      elements.spellsGrid.appendChild(createArmorySlot(s.name, s.level, s.maxLevel, getSpellIcon(s.name), "spell", "home"));
    });

    siegeMachines.forEach((sm) => {
      elements.siegeGrid.appendChild(createArmorySlot(sm.name, sm.level, sm.maxLevel, getTroopIcon(sm.name), "siege", "home"));
    });

    pets.forEach((p) => {
      elements.petsGrid.appendChild(createArmorySlot(p.name, p.level, p.maxLevel, getPetIcon(p.name), "pet", "home"));
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
      elements.builderHeroesGrid.appendChild(createArmorySlot(bh.name, bh.level, bh.maxLevel, getHeroIcon(bh.name), "hero", "builderBase"));
    });
    bbTroops.forEach((bt) => {
      elements.builderTroopsGrid.appendChild(createArmorySlot(bt.name, bt.level, bt.maxLevel, getTroopIcon(bt.name), "troop", "builderBase"));
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

export function renderPlayer(p, onClanSelect, onRecentSelect) {
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
      if (p.clanTag && onClanSelect) {
        onClanSelect(p.clanTag);
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
  saveRecent("player", p.tag, p.name, onRecentSelect);
  syncUrl("player", p.tag);
}

export async function searchPlayer(tag, { onClanSelect, onClanSilentFetch, toggleLoading, showError, resetViews, onRecentSelect }) {
  resetViews();
  toggleLoading(true);

  try {
    const { response, data } = await requestApi(`/player/${encodeURIComponent(tag)}`);
    if (!response.ok) {
      showError(data.error || "Gagal mengambil data pemain.");
      return;
    }
    renderPlayer(data, onClanSelect, onRecentSelect);

    if (data.clanTag && onClanSilentFetch) {
      onClanSilentFetch(data.clanTag);
    }
  } catch (err) {
    showError("Terjadi kendala jaringan saat menghubungi server.");
  } finally {
    toggleLoading(false);
  }
}

