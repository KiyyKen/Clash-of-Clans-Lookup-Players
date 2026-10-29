import { elements } from "./js/dom.js";
import { initTheme } from "./js/theme.js";
import { initRecent } from "./js/history.js";
import { initArmoryTabs, searchPlayer } from "./js/player.js";
import { initRosterFilters, searchClan, fetchClanDataSilently } from "./js/clan.js";

// State
let activeTab = "player"; // "player" | "clan"

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

// Cross-feature callbacks
function handleMemberInspect(tag) {
  setMode("player");
  elements.tagInput.value = tag.replace(/^#/, "");
  executePlayerSearch(tag);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function handleClanSelect(clanTag) {
  setMode("clan");
  elements.tagInput.value = clanTag.replace(/^#/, "");
  executeClanSearch(clanTag);
}

function handleRecentSelect(type, tag) {
  setMode(type);
  elements.tagInput.value = tag.replace(/^#/, "");
  elements.clearInputBtn.classList.add("visible");
  if (type === "player") {
    executePlayerSearch(tag);
  } else {
    executeClanSearch(tag);
  }
}

function executePlayerSearch(tag) {
  searchPlayer(tag, {
    onClanSelect: handleClanSelect,
    onClanSilentFetch: (cTag) => fetchClanDataSilently(cTag, handleMemberInspect, handleRecentSelect),
    toggleLoading,
    showError,
    resetViews,
    onRecentSelect: handleRecentSelect,
  });
}

function executeClanSearch(tag) {
  searchClan(tag, {
    onMemberClick: handleMemberInspect,
    toggleLoading,
    showError,
    resetViews,
    onRecentSelect: handleRecentSelect,
  });
}

// Execute search from input
function executeSearch() {
  const val = elements.tagInput.value.trim();
  if (!val) {
    showError(activeTab === "player" ? "Ketik player tag terlebih dahulu." : "Ketik clan tag terlebih dahulu.");
    return;
  }
  const norm = val.startsWith("#") ? val : `#${val}`;
  if (activeTab === "player") {
    executePlayerSearch(norm);
  } else {
    executeClanSearch(norm);
  }
}

// Event Listeners setup
function initEvents() {
  elements.tabPlayer.addEventListener("click", () => setMode("player"));
  elements.tabClan.addEventListener("click", () => setMode("clan"));

  elements.tagInput.addEventListener("input", () => {
    elements.clearInputBtn.classList.toggle("visible", elements.tagInput.value.length > 0);
  });

  elements.clearInputBtn.addEventListener("click", () => {
    elements.tagInput.value = "";
    elements.clearInputBtn.classList.remove("visible");
    elements.tagInput.focus();
  });

  elements.fetchBtn.addEventListener("click", executeSearch);
  elements.tagInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") executeSearch();
  });

  // Quick sample chips
  elements.sampleChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const type = chip.dataset.type;
      const tag = chip.dataset.tag;
      setMode(type);
      elements.tagInput.value = tag.replace(/^#/, "");
      elements.clearInputBtn.classList.add("visible");
      if (type === "player") {
        executePlayerSearch(tag);
      } else {
        executeClanSearch(tag);
      }
    });
  });
}

// Deep linking check
function handleDeepLink() {
  const params = new URLSearchParams(window.location.search);
  const pTag = params.get("player");
  const cTag = params.get("clan");

  if (pTag) {
    setMode("player");
    elements.tagInput.value = pTag.replace(/^#/, "");
    elements.clearInputBtn.classList.add("visible");
    executePlayerSearch(pTag);
  } else if (cTag) {
    setMode("clan");
    elements.tagInput.value = cTag.replace(/^#/, "");
    elements.clearInputBtn.classList.add("visible");
    executeClanSearch(cTag);
  }
}

// Bootstrapping the app
function init() {
  initTheme();
  initArmoryTabs();
  initRosterFilters(handleMemberInspect);
  initRecent(handleRecentSelect);
  initEvents();
  handleDeepLink();
}

// Start
init();
