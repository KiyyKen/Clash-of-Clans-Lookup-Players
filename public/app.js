// Cache DOM elements
const elements = {
  // Tabs & Search Input
  tabPlayer: document.getElementById("tabPlayer"),
  tabClan: document.getElementById("tabClan"),
  tagInput: document.getElementById("tagInput"),
  clearInputBtn: document.getElementById("clearInputBtn"),
  fetchButton: document.getElementById("fetchBtn"),
  errorMessage: document.getElementById("errorMessage"),
  sampleChips: document.querySelectorAll(".sample-chip"),

  // Recent Searches
  recentContainer: document.getElementById("recentContainer"),
  recentChips: document.getElementById("recentChips"),
  clearRecentBtn: document.getElementById("clearRecentBtn"),

  // Player Card
  playerCard: document.getElementById("resultCard"),
  playerName: document.getElementById("playerName"),
  playerTagText: document.getElementById("playerTagText"),
  copyPlayerTagBtn: document.getElementById("copyPlayerTagBtn"),
  sharePlayerBtn: document.getElementById("sharePlayerBtn"),
  playerLeagueBadge: document.getElementById("playerLeagueBadge"),
  playerRoleBadge: document.getElementById("playerRoleBadge"),
  playerClanChip: document.getElementById("playerClanChip"),
  playerClanBadgeMini: document.getElementById("playerClanBadgeMini"),
  playerClanNameText: document.getElementById("playerClanNameText"),
  playerWarPref: document.getElementById("playerWarPref"),
  playerLabelsContainer: document.getElementById("playerLabelsContainer"),

  townHallLevel: document.getElementById("townHallLevel"),
  trophies: document.getElementById("trophies"),
  bestTrophies: document.getElementById("bestTrophies"),
  warStars: document.getElementById("warStars"),
  expLevel: document.getElementById("expLevel"),
  attackWins: document.getElementById("attackWins"),
  defenseWins: document.getElementById("defenseWins"),
  donationRatio: document.getElementById("donationRatio"),
  clanCapitalPoints: document.getElementById("clanCapitalPoints"),

  heroesSection: document.getElementById("heroesSection"),
  heroTabHeroes: document.getElementById("heroTabHeroes"),
  heroTabEquip: document.getElementById("heroTabEquip"),
  heroesGrid: document.getElementById("heroesGrid"),
  equipmentGrid: document.getElementById("equipmentGrid"),

  builderBaseSection: document.getElementById("builderBaseSection"),
  builderHallLevel: document.getElementById("builderHallLevel"),
  builderBaseTrophies: document.getElementById("builderBaseTrophies"),
  bestBuilderBaseTrophies: document.getElementById("bestBuilderBaseTrophies"),
  builderHeroesGrid: document.getElementById("builderHeroesGrid"),

  // Clan Card
  clanCard: document.getElementById("clanCard"),
  clanBadge: document.getElementById("clanBadge"),
  clanDataName: document.getElementById("clanDataName"),
  clanDataTag: document.getElementById("clanDataTag"),
  copyClanTagBtn: document.getElementById("copyClanTagBtn"),
  shareClanBtn: document.getElementById("shareClanBtn"),
  clanTypeBadge: document.getElementById("clanTypeBadge"),
  clanLocationBadge: document.getElementById("clanLocationBadge"),
  clanWarLeagueBadge: document.getElementById("clanWarLeagueBadge"),
  clanDescription: document.getElementById("clanDescription"),
  clanLabelsContainer: document.getElementById("clanLabelsContainer"),

  clanLevel: document.getElementById("clanLevel"),
  clanPoints: document.getElementById("clanPoints"),
  clanMembers: document.getElementById("clanMembers"),
  warWinStreak: document.getElementById("warWinStreak"),
  warRecord: document.getElementById("warRecord"),
  capitalHallLevel: document.getElementById("capitalHallLevel"),
  requiredTrophies: document.getElementById("requiredTrophies"),
  warFrequency: document.getElementById("warFrequency"),

  memberSearchInput: document.getElementById("memberSearchInput"),
  memberSortSelect: document.getElementById("memberSortSelect"),
  membersStatus: document.getElementById("membersStatus"),
  membersTableBody: document.getElementById("membersTableBody"),

  // Background & Media
  backgroundImage: document.getElementById("backgroundImage"),
  backgroundVideo: document.getElementById("backgroundVideo"),
  modeButtons: document.querySelectorAll(".mode-btn[data-mode]"),
  soundToggleButton: document.getElementById("soundToggleBtn"),

  // Toast
  toast: document.getElementById("toast"),
};

// State
let activeTab = "player"; // "player" | "clan"
let currentClanMembers = []; // Cache clan members for search & sort
const RECENT_KEY = "coc_recent_searches_v2";
const BACKGROUND_STORAGE_KEY = "coc-background-mode";
const AVAILABLE_BACKGROUND_MODES = ["gradient", "image", "video"];

// Helper: Safely format values
function setText(element, value, fallback = "-") {
  if (element) {
    element.textContent = value !== null && value !== undefined && value !== "" ? value : fallback;
  }
}

// Show toast alert
let toastTimer = null;
function showToast(message) {
  if (!elements.toast) return;
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    elements.toast.classList.remove("show");
  }, 2500);
}

// Copy to clipboard helper
async function copyToClipboard(text, entityType = "Tag") {
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
    showToast(`${entityType} (${text}) berhasil disalin! 📋`);
  } catch (err) {
    showToast(`Gagal menyalin: ${text}`);
  }
}

// Share Direct Link
function shareDirectLink(type, tag, name) {
  const cleanTag = tag.replace(/^#/, "");
  const url = `${window.location.origin}${window.location.pathname}?${type}=${encodeURIComponent(cleanTag)}`;
  copyToClipboard(url, `Link ${name || tag}`);
}

// Update URL bar without reload
function updateBrowserUrl(type, tag) {
  const cleanTag = tag.replace(/^#/, "");
  const newUrl = `${window.location.pathname}?${type}=${encodeURIComponent(cleanTag)}`;
  window.history.replaceState({ type, tag }, "", newUrl);
}

// Format Role string
function formatRole(role) {
  const map = {
    member: "Member",
    admin: "Elder",
    coLeader: "Co-Leader",
    leader: "Leader",
  };
  return map[role] || role || "Member";
}

// Format Clan Type
function formatClanType(type) {
  const map = {
    open: "Open",
    inviteOnly: "Invite Only",
    closed: "Closed",
  };
  return map[type] || type || "Public";
}

// Format War Frequency
function formatWarFrequency(freq) {
  const map = {
    always: "Selalu (Always)",
    moreThanOnceAWeek: "2x seminggu",
    onceAWeek: "1x seminggu",
    lessThanOnceAWeek: "Jarang",
    never: "Never",
    unknown: "Tidak diketahui",
  };
  return map[freq] || freq || "-";
}

// Tab Switcher
function setActiveTab(tab) {
  activeTab = tab;
  if (tab === "player") {
    elements.tabPlayer.classList.add("active");
    elements.tabClan.classList.remove("active");
    elements.tagInput.placeholder = "Contoh: 8QRC82JP8";
    elements.fetchButton.querySelector(".btn-text").textContent = "Cari Player";
  } else {
    elements.tabClan.classList.add("active");
    elements.tabPlayer.classList.remove("active");
    elements.tagInput.placeholder = "Contoh: 2LYQPU00L";
    elements.fetchButton.querySelector(".btn-text").textContent = "Cari Clan";
  }
  elements.tagInput.focus();
}

elements.tabPlayer.addEventListener("click", () => setActiveTab("player"));
elements.tabClan.addEventListener("click", () => setActiveTab("clan"));

// Input clear button toggle
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
  elements.fetchButton.disabled = isLoading;
  const btnText = elements.fetchButton.querySelector(".btn-text");
  if (isLoading) {
    btnText.innerHTML = '<span class="loading-dot"></span>Memuat...';
  } else {
    btnText.textContent = activeTab === "player" ? "Cari Player" : "Cari Clan";
  }
}

// Error state
function showError(msg) {
  if (msg) {
    elements.errorMessage.textContent = msg;
    elements.errorMessage.classList.add("show");
  } else {
    elements.errorMessage.textContent = "";
    elements.errorMessage.classList.remove("show");
  }
}

// Reset views
function resetViews() {
  showError("");
  elements.playerCard.classList.remove("show");
  elements.clanCard.classList.remove("show");
}

// Request Helper
async function requestApi(url) {
  const response = await fetch(url);
  const data = await response.json();
  return { response, data };
}

// Render Labels
function renderLabels(container, labels = []) {
  if (!container) return;
  container.innerHTML = "";
  if (!labels || labels.length === 0) {
    container.style.display = "none";
    return;
  }
  container.style.display = "flex";
  labels.forEach((l) => {
    const badge = document.createElement("div");
    badge.className = "label-badge";
    if (l.iconUrl) {
      const img = document.createElement("img");
      img.className = "label-icon";
      img.src = l.iconUrl;
      img.alt = l.name;
      badge.appendChild(img);
    }
    const txt = document.createElement("span");
    txt.textContent = l.name;
    badge.appendChild(txt);
    container.appendChild(badge);
  });
}

// Hero & Equipment Subtabs
if (elements.heroTabHeroes && elements.heroTabEquip) {
  elements.heroTabHeroes.addEventListener("click", () => {
    elements.heroTabHeroes.classList.add("active");
    elements.heroTabEquip.classList.remove("active");
    elements.heroesGrid.style.display = "grid";
    elements.equipmentGrid.style.display = "none";
  });

  elements.heroTabEquip.addEventListener("click", () => {
    elements.heroTabEquip.classList.add("active");
    elements.heroTabHeroes.classList.remove("active");
    elements.heroesGrid.style.display = "none";
    elements.equipmentGrid.style.display = "grid";
  });
}

function createLevelCard(name, level, maxLevel) {
  const isMax = level >= maxLevel;
  const percent = Math.min(100, Math.round((level / (maxLevel || 1)) * 100));

  const card = document.createElement("div");
  card.className = "hero-card";
  card.innerHTML = `
    <div class="hero-card-head">
      <span class="hero-name">${name}</span>
      <span class="hero-level-text">Lv ${level} / ${maxLevel}</span>
    </div>
    <div class="hero-bar-bg">
      <div class="hero-bar-fill ${isMax ? "maxed" : ""}" style="width: ${percent}%;"></div>
    </div>
    ${isMax ? '<div style="display:flex;justify-content:flex-end;"><span class="hero-max-badge">MAXED</span></div>' : ""}
  `;
  return card;
}

// Render Heroes & Equipment
function renderHeroesAndEquipment(heroes = [], equipment = []) {
  elements.heroesGrid.innerHTML = "";
  elements.equipmentGrid.innerHTML = "";
  if (elements.builderHeroesGrid) elements.builderHeroesGrid.innerHTML = "";

  const homeHeroes = heroes.filter((h) => h.village === "home" || !h.village);
  const builderHeroes = heroes.filter((h) => h.village === "builderBase");

  if (!homeHeroes.length && !equipment.length) {
    elements.heroesSection.style.display = "none";
  } else {
    elements.heroesSection.style.display = "flex";

    // Home Heroes
    homeHeroes.forEach((h) => {
      elements.heroesGrid.appendChild(createLevelCard(h.name, h.level, h.maxLevel));
    });

    // Equipment
    equipment.forEach((eq) => {
      elements.equipmentGrid.appendChild(createLevelCard(eq.name, eq.level, eq.maxLevel));
    });

    // Default to Heroes tab
    elements.heroTabHeroes.classList.add("active");
    elements.heroTabEquip.classList.remove("active");
    elements.heroesGrid.style.display = "grid";
    elements.equipmentGrid.style.display = "none";
  }

  // Builder Base Heroes
  if (elements.builderHeroesGrid && builderHeroes.length > 0) {
    elements.builderHeroesGrid.style.display = "grid";
    builderHeroes.forEach((bh) => {
      elements.builderHeroesGrid.appendChild(createLevelCard(bh.name, bh.level, bh.maxLevel));
    });
  } else if (elements.builderHeroesGrid) {
    elements.builderHeroesGrid.style.display = "none";
  }
}

// Render Player Profile
function renderPlayer(p) {
  setText(elements.playerName, p.name);
  setText(elements.playerTagText, p.tag);

  elements.copyPlayerTagBtn.onclick = () => copyToClipboard(p.tag, "Player Tag");
  elements.sharePlayerBtn.onclick = () => shareDirectLink("player", p.tag, p.name);

  // League icon
  if (p.league && p.league.iconUrl) {
    elements.playerLeagueBadge.src = p.league.iconUrl;
    elements.playerLeagueBadge.title = p.league.name;
  } else {
    elements.playerLeagueBadge.src = "/assets/trophy-temp.svg";
    elements.playerLeagueBadge.title = "Unranked";
  }

  // Role & War Preference
  setText(elements.playerRoleBadge, formatRole(p.role));
  elements.playerRoleBadge.style.display = p.role ? "inline-flex" : "none";

  if (p.warPreference) {
    elements.playerWarPref.textContent = p.warPreference === "in" ? "Wars: IN ✅" : "Wars: OUT ❌";
    elements.playerWarPref.style.display = "inline-flex";
  } else {
    elements.playerWarPref.style.display = "none";
  }

  // Clan chip
  if (p.clanName) {
    elements.playerClanChip.style.display = "inline-flex";
    setText(elements.playerClanNameText, p.clanName);
    elements.playerClanBadgeMini.src = p.clanBadgeUrl || "/assets/clan-temp.svg";
    elements.playerClanChip.style.cursor = "pointer";
    elements.playerClanChip.onclick = () => {
      if (p.clanTag) {
        setActiveTab("clan");
        elements.tagInput.value = p.clanTag.replace(/^#/, "");
        searchClan(p.clanTag);
      }
    };
  } else {
    elements.playerClanChip.style.display = "none";
  }

  // Labels
  renderLabels(elements.playerLabelsContainer, p.labels);

  // Stats Grid
  const thDisplay = p.townHallWeaponLevel
    ? `TH ${p.townHallLevel} ⭐${p.townHallWeaponLevel}`
    : `TH ${p.townHallLevel}`;
  setText(elements.townHallLevel, thDisplay);
  setText(elements.trophies, `${p.trophies?.toLocaleString() || 0} 🏆`);
  setText(elements.bestTrophies, `${p.bestTrophies?.toLocaleString() || 0} 🏆`);
  setText(elements.warStars, `${p.warStars?.toLocaleString() || 0} ⭐`);
  setText(elements.expLevel, p.expLevel);
  setText(elements.attackWins, `${p.attackWins || 0} Menang`);
  setText(elements.defenseWins, `${p.defenseWins || 0} Menang`);

  const donated = p.donations?.toLocaleString() || "0";
  const received = p.donationsReceived?.toLocaleString() || "0";
  setText(elements.donationRatio, `${donated} / ${received}`);
  setText(elements.clanCapitalPoints, p.clanCapitalContributions?.toLocaleString() || "0");

  // Heroes & Equipment
  renderHeroesAndEquipment(p.heroes, p.heroEquipment);

  // Builder Base
  if (p.builderHallLevel) {
    elements.builderBaseSection.style.display = "flex";
    setText(elements.builderHallLevel, `BH ${p.builderHallLevel}`);
    setText(elements.builderBaseTrophies, `${p.builderBaseTrophies?.toLocaleString() || 0} 🏆`);
    setText(elements.bestBuilderBaseTrophies, `${p.bestBuilderBaseTrophies?.toLocaleString() || 0} 🏆`);
  } else {
    elements.builderBaseSection.style.display = "none";
  }

  elements.playerCard.classList.add("show");
  saveRecentSearch("player", p.tag, p.name);
  updateBrowserUrl("player", p.tag);
}

// Render Clan Profile
function renderClan(c) {
  setText(elements.clanDataName, c.name);
  setText(elements.clanDataTag, c.tag);

  elements.copyClanTagBtn.onclick = () => copyToClipboard(c.tag, "Clan Tag");
  elements.shareClanBtn.onclick = () => shareDirectLink("clan", c.tag, c.name);

  elements.clanBadge.src = c.badgeUrl || "/assets/clan-temp.svg";
  setText(elements.clanTypeBadge, formatClanType(c.type));
  setText(elements.clanLocationBadge, c.location ? `📍 ${c.location}` : "📍 International");
  setText(elements.clanWarLeagueBadge, c.warLeague ? `🏆 ${c.warLeague}` : "War League");

  if (c.description) {
    elements.clanDescription.textContent = `“${c.description}”`;
    elements.clanDescription.style.display = "block";
  } else {
    elements.clanDescription.style.display = "none";
  }

  // Clan Labels
  renderLabels(elements.clanLabelsContainer, c.labels);

  // Clan Stats Grid
  setText(elements.clanLevel, `Lv ${c.clanLevel}`);
  setText(elements.clanPoints, `${c.clanPoints?.toLocaleString() || 0} 🏆`);
  setText(elements.clanMembers, `${c.members} / 50`);
  setText(elements.warWinStreak, `${c.warWinStreak || 0} Win Streak`);

  const warRecordText = c.isWarLogPublic
    ? `${c.warWins || 0}M / ${c.warLosses || 0}K / ${c.warTies || 0}S`
    : `${c.warWins || 0} Menang (Log Privat)`;
  setText(elements.warRecord, warRecordText);

  setText(elements.capitalHallLevel, c.capitalHallLevel ? `CH ${c.capitalHallLevel}` : "-");
  setText(elements.requiredTrophies, `${c.requiredTrophies?.toLocaleString() || 0} 🏆`);
  setText(elements.warFrequency, formatWarFrequency(c.warFrequency));

  elements.clanCard.classList.add("show");
  saveRecentSearch("clan", c.tag, c.name);
  updateBrowserUrl("clan", c.tag);
}

// Clan Members Filter & Sorting
function getFilteredAndSortedMembers() {
  const query = (elements.memberSearchInput?.value || "").toLowerCase().trim();
  const sortMode = elements.memberSortSelect?.value || "trophies_desc";

  let list = [...currentClanMembers];

  if (query) {
    list = list.filter((m) => (m.name || "").toLowerCase().includes(query) || (m.tag || "").toLowerCase().includes(query));
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

function updateClanMembersTable() {
  const members = getFilteredAndSortedMembers();

  if (!members.length) {
    elements.membersStatus.textContent = currentClanMembers.length === 0
      ? "Clan ini tidak memiliki data anggota."
      : "Tidak ada anggota yang cocok dengan pencarian.";
    elements.membersTableBody.innerHTML =
      '<tr><td colspan="6" class="members-empty">Tidak ada data anggota ditemukan.</td></tr>';
    return;
  }

  elements.membersStatus.textContent = `Menampilkan ${members.length} dari ${currentClanMembers.length} anggota:`;

  const rows = members
    .map((m, index) => {
      const leagueImg = m.leagueIcon
        ? `<img class="member-league-icon" src="${m.leagueIcon}" alt="League" />`
        : "";
      return `
        <tr class="member-row-interactive" data-tag="${m.tag}" title="Klik untuk lihat profil ${m.name}">
          <td>${m.clanRank || index + 1}</td>
          <td>
            <div class="member-name-cell">
              ${leagueImg}
              <span>${m.name}</span>
            </div>
          </td>
          <td><span class="badge-role">${formatRole(m.role)}</span></td>
          <td>TH ${m.townHallLevel || "-"}</td>
          <td>${m.trophies?.toLocaleString() || 0}</td>
          <td>${m.donations?.toLocaleString() || 0}</td>
        </tr>
      `;
    })
    .join("");

  elements.membersTableBody.innerHTML = rows;

  // Add click handler to all rows
  elements.membersTableBody.querySelectorAll(".member-row-interactive").forEach((row) => {
    row.addEventListener("click", () => {
      const tag = row.dataset.tag;
      if (tag) {
        setActiveTab("player");
        elements.tagInput.value = tag.replace(/^#/, "");
        searchPlayer(tag);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  });
}

if (elements.memberSearchInput) {
  elements.memberSearchInput.addEventListener("input", updateClanMembersTable);
}

if (elements.memberSortSelect) {
  elements.memberSortSelect.addEventListener("change", updateClanMembersTable);
}

// Render Clan Members
function renderClanMembers(members = []) {
  currentClanMembers = members;
  if (elements.memberSearchInput) elements.memberSearchInput.value = "";
  updateClanMembersTable();
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

    // If player has a clan, also prefetch clan profile
    if (data.clanTag) {
      fetchClanDataSilently(data.clanTag);
    }
  } catch (err) {
    showError("Terjadi kesalahan jaringan. Cek koneksi Anda.");
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

    // Fetch clan members
    fetchClanMembers(tag);
  } catch (err) {
    showError("Terjadi kesalahan jaringan. Cek koneksi Anda.");
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
  } catch (err) {
    // Clan error is silent when viewing player
  }
}

async function fetchClanMembers(clanTag) {
  try {
    elements.membersStatus.textContent = "Memuat daftar anggota...";
    const { response, data } = await requestApi(`/clan/${encodeURIComponent(clanTag)}/members`);
    if (response.ok && data.members) {
      renderClanMembers(data.members);
    } else {
      elements.membersStatus.textContent = "Gagal memuat daftar anggota.";
    }
  } catch (err) {
    elements.membersStatus.textContent = "Gagal memuat daftar anggota.";
  }
}

// Trigger Search from Input
function triggerSearch() {
  const val = elements.tagInput.value.trim();
  if (!val) {
    showError(activeTab === "player" ? "Masukkan player tag terlebih dahulu." : "Masukkan clan tag terlebih dahulu.");
    return;
  }

  const normalized = val.startsWith("#") ? val : `#${val}`;
  if (activeTab === "player") {
    searchPlayer(normalized);
  } else {
    searchClan(normalized);
  }
}

// Event Listeners for Search
elements.fetchButton.addEventListener("click", triggerSearch);
elements.tagInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    triggerSearch();
  }
});

// Quick Samples
elements.sampleChips.forEach((chip) => {
  chip.addEventListener("click", () => {
    const type = chip.dataset.type;
    const tag = chip.dataset.tag;
    setActiveTab(type);
    elements.tagInput.value = tag.replace(/^#/, "");
    elements.clearInputBtn.classList.add("visible");
    if (type === "player") {
      searchPlayer(tag);
    } else {
      searchClan(tag);
    }
  });
});

// Recent Searches Logic
function loadRecentSearches() {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveRecentSearch(type, tag, name) {
  let list = loadRecentSearches();
  list = list.filter((item) => item.tag !== tag);
  list.unshift({ type, tag, name, time: Date.now() });
  if (list.length > 8) list.pop();
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(list));
    renderRecentSearches();
  } catch (e) {}
}

function renderRecentSearches() {
  const list = loadRecentSearches();
  if (!list.length) {
    elements.recentContainer.classList.add("hide");
    return;
  }
  elements.recentContainer.classList.remove("hide");
  elements.recentChips.innerHTML = "";

  list.forEach((item) => {
    const chip = document.createElement("div");
    chip.className = "recent-chip";
    const icon = item.type === "player" ? "👤" : "🛡️";
    chip.innerHTML = `
      <span>${icon} ${item.name || item.tag}</span>
      <span class="recent-remove" title="Hapus">✕</span>
    `;

    chip.addEventListener("click", (e) => {
      if (e.target.classList.contains("recent-remove")) {
        e.stopPropagation();
        deleteRecentSearch(item.tag);
        return;
      }
      setActiveTab(item.type);
      elements.tagInput.value = item.tag.replace(/^#/, "");
      elements.clearInputBtn.classList.add("visible");
      if (item.type === "player") {
        searchPlayer(item.tag);
      } else {
        searchClan(item.tag);
      }
    });

    elements.recentChips.appendChild(chip);
  });
}

function deleteRecentSearch(tag) {
  let list = loadRecentSearches();
  list = list.filter((i) => i.tag !== tag);
  localStorage.setItem(RECENT_KEY, JSON.stringify(list));
  renderRecentSearches();
}

elements.clearRecentBtn.addEventListener("click", () => {
  localStorage.removeItem(RECENT_KEY);
  renderRecentSearches();
});

// Background Themes
function activateBackgroundMode(mode) {
  const validMode = AVAILABLE_BACKGROUND_MODES.includes(mode) ? mode : "gradient";

  document.body.classList.remove("bg-image-mode", "bg-video-mode");

  if (validMode === "image") {
    document.body.classList.add("bg-image-mode");
  }

  if (validMode === "video") {
    document.body.classList.add("bg-video-mode");
    if (elements.backgroundVideo) {
      elements.backgroundVideo.play().catch(() => {});
    }
  } else if (elements.backgroundVideo) {
    elements.backgroundVideo.pause();
  }

  elements.modeButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.mode === validMode);
  });

  localStorage.setItem(BACKGROUND_STORAGE_KEY, validMode);
  updateSoundButtonLabel();
}

function updateSoundButtonLabel() {
  if (!elements.soundToggleButton || !elements.backgroundVideo) return;
  const isVideoMode = document.body.classList.contains("bg-video-mode");
  const isMuted = elements.backgroundVideo.muted;

  elements.soundToggleButton.classList.toggle("sound-on", isVideoMode && !isMuted);
  elements.soundToggleButton.classList.toggle("visible", isVideoMode);
}

async function toggleVideoSound() {
  if (!elements.backgroundVideo) return;
  if (!document.body.classList.contains("bg-video-mode")) {
    activateBackgroundMode("video");
  }

  elements.backgroundVideo.muted = !elements.backgroundVideo.muted;
  try {
    await elements.backgroundVideo.play();
  } catch (e) {
    elements.backgroundVideo.muted = true;
  }
  updateSoundButtonLabel();
}

elements.modeButtons.forEach((btn) => {
  btn.addEventListener("click", () => activateBackgroundMode(btn.dataset.mode));
});

if (elements.soundToggleButton) {
  elements.soundToggleButton.addEventListener("click", toggleVideoSound);
}

// Fallback handlers
if (elements.backgroundImage) {
  elements.backgroundImage.addEventListener("error", () => {
    if (document.body.classList.contains("bg-image-mode")) {
      activateBackgroundMode("gradient");
    }
  });
}

if (elements.backgroundVideo) {
  elements.backgroundVideo.addEventListener("error", () => {
    if (document.body.classList.contains("bg-video-mode")) {
      activateBackgroundMode("gradient");
    }
  });
}

// Initialise
const savedMode = localStorage.getItem(BACKGROUND_STORAGE_KEY) || "gradient";
activateBackgroundMode(savedMode);
renderRecentSearches();

// Check URL query parameters (Direct Link Support)
const urlParams = new URLSearchParams(window.location.search);
const initialPlayer = urlParams.get("player");
const initialClan = urlParams.get("clan");

if (initialPlayer) {
  setActiveTab("player");
  elements.tagInput.value = initialPlayer.replace(/^#/, "");
  elements.clearInputBtn.classList.add("visible");
  searchPlayer(initialPlayer);
} else if (initialClan) {
  setActiveTab("clan");
  elements.tagInput.value = initialClan.replace(/^#/, "");
  elements.clearInputBtn.classList.add("visible");
  searchClan(initialClan);
}
