const { COC_API_KEY } = require("../config");
const { isValidTag, normalizeTag, fetchFromClashApi } = require("../services/clashApi");

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

    // Send formatted structured data to frontend
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
      league: player.leagueTier
        ? {
            name: player.leagueTier.name,
            iconUrl: player.leagueTier.iconUrls
              ? player.leagueTier.iconUrls.small || player.leagueTier.iconUrls.large
              : null,
          }
        : player.league && player.league.name !== "Unranked"
        ? {
            name: player.league.name,
            iconUrl: player.league.iconUrls
              ? player.league.iconUrls.medium || player.league.iconUrls.small
              : null,
          }
        : player.league
        ? {
            name: player.league.name,
            iconUrl: player.league.iconUrls
              ? player.league.iconUrls.medium || player.league.iconUrls.small
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

module.exports = {
  handlePlayerLookup,
};

