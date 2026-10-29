// Load environment variables from .env file
require("dotenv").config({ quiet: true });

const express = require("express");
const path = require("path");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;
const COC_API_KEY = process.env.COC_API_KEY;

// Serve static files (HTML/CSS/JS) from the public folder
app.use(express.static(path.join(__dirname, "..", "public")));

// In-memory cache to reduce rate limits and speed up repeat queries
const memoryCache = new Map();
const CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes TTL

function getFromCache(key) {
  const cached = memoryCache.get(key);
  if (!cached) return null;
  if (Date.now() > cached.expiresAt) {
    memoryCache.delete(key);
    return null;
  }
  return cached.data;
}

function saveToCache(key, data, ttl = CACHE_TTL_MS) {
  memoryCache.set(key, {
    data,
    expiresAt: Date.now() + ttl,
  });
}

// Small helper to validate Clash of Clans tag format
function isValidTag(tag) {
  // Valid chars in COC tag: #, uppercase letters, and numbers from this set
  return /^#?[0289PYLQGRJCUV]+$/i.test(tag);
}

function normalizeTag(tag) {
  return tag.startsWith("#") ? tag.toUpperCase() : `#${tag.toUpperCase()}`;
}

async function fetchFromClashApi(pathname) {
  const cachedData = getFromCache(pathname);
  if (cachedData) {
    return { data: cachedData, fromCache: true };
  }

  const response = await axios.get(`https://api.clashofclans.com/v1${pathname}`, {
    headers: {
      Authorization: `Bearer ${COC_API_KEY}`,
    },
    timeout: 10000,
  });

  saveToCache(pathname, response.data);
  return { data: response.data, fromCache: false };
}

// Shared handler for player lookup:
// - GET /player/:tag
// - GET /players/:tag
async function handlePlayerLookup(req, res) {
  const rawTag = req.params.tag;
  const normalizedTag = normalizeTag(rawTag);

  // Validate before calling external API
  if (!isValidTag(normalizedTag)) {
    return res.status(400).json({
      error: "Format player tag tidak valid. Karakter yang diperbolehkan: 0, 2, 8, 9, P, Y, L, Q, G, R, J, C, U, V.",
    });
  }

  // API key must come from environment variable
  if (!COC_API_KEY) {
    return res.status(500).json({
      error: "Server config error: COC_API_KEY is missing.",
    });
  }

  try {
    const encodedTag = encodeURIComponent(normalizedTag);
    const response = await fetchFromClashApi(`/players/${encodedTag}`);
    const player = response.data;

    // Send rich data to frontend
    return res.json({
      tag: player.tag,
      name: player.name,
      expLevel: player.expLevel,
      townHallLevel: player.townHallLevel,
      townHallWeaponLevel: player.townHallWeaponLevel || null,
      trophies: player.trophies,
      bestTrophies: player.bestTrophies,
      warStars: player.warStars,
      attackWins: player.attackWins ?? 0,
      defenseWins: player.defenseWins ?? 0,
      builderHallLevel: player.builderHallLevel || null,
      builderBaseTrophies: player.builderBaseTrophies ?? null,
      bestBuilderBaseTrophies: player.bestBuilderBaseTrophies ?? null,
      donations: player.donations ?? 0,
      donationsReceived: player.donationsReceived ?? 0,
      clanCapitalContributions: player.clanCapitalContributions ?? 0,
      role: player.role || null,
      warPreference: player.warPreference || null,
      clanName: player.clan ? player.clan.name : null,
      clanTag: player.clan ? player.clan.tag : null,
      clanLevel: player.clan ? player.clan.clanLevel : null,
      clanBadgeUrl:
        player.clan && player.clan.badgeUrls
          ? player.clan.badgeUrls.medium || player.clan.badgeUrls.small
          : null,
      league: player.league
        ? {
            name: player.league.name,
            iconUrl: player.league.iconUrls
              ? player.league.iconUrls.medium || player.league.iconUrls.small
              : null,
          }
        : player.leagueTier
        ? {
            name: player.leagueTier.name,
            iconUrl: player.leagueTier.iconUrls
              ? player.leagueTier.iconUrls.small || player.leagueTier.iconUrls.large
              : null,
          }
        : null,
      builderBaseLeague: player.builderBaseLeague ? player.builderBaseLeague.name : null,
      heroes: (player.heroes || []).map((h) => ({
        name: h.name,
        level: h.level,
        maxLevel: h.maxLevel,
        village: h.village,
      })),
      heroEquipment: (player.heroEquipment || []).map((eq) => ({
        name: eq.name,
        level: eq.level,
        maxLevel: eq.maxLevel,
        village: eq.village,
      })),
      troops: (player.troops || []).map((t) => ({
        name: t.name,
        level: t.level,
        maxLevel: t.maxLevel,
        village: t.village,
      })),
      spells: (player.spells || []).map((s) => ({
        name: s.name,
        level: s.level,
        maxLevel: s.maxLevel,
        village: s.village,
      })),
      labels: (player.labels || []).map((l) => ({
        name: l.name,
        iconUrl: l.iconUrls ? l.iconUrls.medium || l.iconUrls.small : null,
      })),
    });
  } catch (error) {
    if (error.response) {
      const status = error.response.status;

      if (status === 404) {
        return res.status(404).json({
          error: "Pemain tidak ditemukan. Pastikan player tag sudah benar.",
        });
      }

      if (status === 403) {
        return res.status(403).json({
          error: "Akses ditolak oleh Supercell API (403). Periksa API key atau Allowed IP di portal developer.",
        });
      }

      if (status === 503) {
        return res.status(503).json({
          error: "Server Clash of Clans sedang dalam pemeliharaan (Maintenance Break).",
        });
      }

      return res.status(status).json({
        error: error.response.data?.message || "Clash of Clans API mengalami kendala.",
      });
    }

    return res.status(500).json({
      error: "Gagal mengambil data pemain. Silakan coba beberapa saat lagi.",
    });
  }
}

// Shared handler for clan lookup routes
async function handleClanLookup(req, res) {
  const rawTag = req.params.tag;
  const normalizedTag = normalizeTag(rawTag);

  if (!isValidTag(normalizedTag)) {
    return res.status(400).json({
      error: "Format clan tag tidak valid.",
    });
  }

  if (!COC_API_KEY) {
    return res.status(500).json({
      error: "Server config error: COC_API_KEY is missing.",
    });
  }

  try {
    const encodedTag = encodeURIComponent(normalizedTag);
    const response = await fetchFromClashApi(`/clans/${encodedTag}`);
    const clan = response.data;

    return res.json({
      tag: clan.tag,
      name: clan.name,
      type: clan.type,
      description: clan.description || null,
      clanLevel: clan.clanLevel,
      clanPoints: clan.clanPoints,
      clanBuilderBasePoints: clan.clanBuilderBasePoints || 0,
      clanCapitalPoints: clan.clanCapitalPoints || 0,
      capitalHallLevel: clan.clanCapital ? clan.clanCapital.capitalHallLevel : null,
      members: clan.members,
      requiredTrophies: clan.requiredTrophies ?? 0,
      requiredTownhallLevel: clan.requiredTownhallLevel ?? null,
      warFrequency: clan.warFrequency || null,
      warWinStreak: clan.warWinStreak ?? 0,
      warWins: clan.warWins ?? 0,
      warTies: clan.warTies ?? 0,
      warLosses: clan.warLosses ?? 0,
      isWarLogPublic: clan.isWarLogPublic ?? false,
      warLeague: clan.warLeague ? clan.warLeague.name : null,
      location: clan.location ? clan.location.name : null,
      badgeUrl: clan.badgeUrls
        ? clan.badgeUrls.large || clan.badgeUrls.medium || clan.badgeUrls.small
        : null,
      labels: (clan.labels || []).map((l) => ({
        name: l.name,
        iconUrl: l.iconUrls ? l.iconUrls.medium || l.iconUrls.small : null,
      })),
    });
  } catch (error) {
    if (error.response) {
      const status = error.response.status;

      if (status === 404) {
        return res.status(404).json({
          error: "Clan tidak ditemukan. Pastikan clan tag sudah benar.",
        });
      }

      if (status === 403) {
        return res.status(403).json({
          error: "Akses ditolak oleh Supercell API (403). Periksa API key atau Allowed IP.",
        });
      }

      if (status === 503) {
        return res.status(503).json({
          error: "Server Clash of Clans sedang dalam pemeliharaan (Maintenance Break).",
        });
      }

      return res.status(status).json({
        error: error.response.data?.message || "Clash of Clans API mengalami kendala.",
      });
    }

    return res.status(500).json({
      error: "Gagal mengambil data clan. Silakan coba beberapa saat lagi.",
    });
  }
}

// Shared handler for clan member list routes
async function handleClanMembersLookup(req, res) {
  const rawTag = req.params.tag;
  const normalizedTag = normalizeTag(rawTag);

  if (!isValidTag(normalizedTag)) {
    return res.status(400).json({
      error: "Format clan tag tidak valid.",
    });
  }

  if (!COC_API_KEY) {
    return res.status(500).json({
      error: "Server config error: COC_API_KEY is missing.",
    });
  }

  try {
    const encodedTag = encodeURIComponent(normalizedTag);
    const response = await fetchFromClashApi(`/clans/${encodedTag}/members`);
    const memberItems = response.data.items || [];

    return res.json({
      clanTag: normalizedTag,
      total: memberItems.length,
      members: memberItems.map((member) => ({
        name: member.name,
        tag: member.tag,
        role: member.role,
        clanRank: member.clanRank,
        townHallLevel: member.townHallLevel,
        expLevel: member.expLevel,
        trophies: member.trophies,
        builderBaseTrophies: member.builderBaseTrophies,
        donations: member.donations ?? 0,
        donationsReceived: member.donationsReceived ?? 0,
        leagueIcon:
          member.league?.iconUrls?.small ||
          member.leagueTier?.iconUrls?.small ||
          null,
        leagueName: member.league?.name || member.leagueTier?.name || null,
      })),
    });
  } catch (error) {
    if (error.response) {
      const status = error.response.status;

      if (status === 404) {
        return res.status(404).json({
          error: "Anggota clan tidak ditemukan. Pastikan clan tag sudah benar.",
        });
      }

      if (status === 403) {
        return res.status(403).json({
          error: "Akses ditolak oleh Supercell API (403). Periksa API key atau Allowed IP.",
        });
      }

      return res.status(status).json({
        error: error.response.data?.message || "Clash of Clans API mengalami kendala.",
      });
    }

    return res.status(500).json({
      error: "Gagal mengambil daftar anggota clan. Silakan coba beberapa saat lagi.",
    });
  }
}

// GET /player/:tag
// Example: /player/%2398R828VJ
app.get("/player/:tag", handlePlayerLookup);
app.get("/players/:tag", handlePlayerLookup);

// GET /clan/:tag
// Example: /clan/%232PP
app.get("/clan/:tag", handleClanLookup);
app.get("/clans/:tag", handleClanLookup);

// GET /clan/:tag/members
app.get("/clan/:tag/members", handleClanMembersLookup);
app.get("/clans/:tag/members", handleClanMembersLookup);

// Start server only when this file is run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

module.exports = app;
