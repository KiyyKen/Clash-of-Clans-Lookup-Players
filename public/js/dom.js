// Cache DOM elements
export const elements = {
  // Navigation & Search Mode
  tabPlayer: document.getElementById("tabPlayer"),
  tabClan: document.getElementById("tabClan"),
  themeSelect: document.getElementById("themeSelect"),

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

  // Army & Armory
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

  // Builder Base
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
  bgNight: document.getElementById("bgNight"),
  bgDay: document.getElementById("bgDay"),

  // Toast
  toast: document.getElementById("toast"),
};

// Helper: Safe text injection
export function setText(element, value, fallback = "-") {
  if (element) {
    element.textContent = value !== null && value !== undefined && value !== "" ? value : fallback;
  }
}
