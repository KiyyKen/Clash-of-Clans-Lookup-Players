const { COC_API_KEY } = require("../config");
const { isValidTag, normalizeTag, fetchFromClashApi } = require("../services/clashApi");

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
          member.leagueTier?.iconUrls?.small ||
          member.leagueTier?.iconUrls?.large ||
          (member.league?.name !== "Unranked" ? member.league?.iconUrls?.small : null) ||
          member.league?.iconUrls?.small ||
          null,
        leagueName:
          member.leagueTier?.name ||
          (member.league?.name !== "Unranked" ? member.league?.name : null) ||
          member.league?.name ||
          "Unranked",
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

module.exports = {
  handleClanLookup,
  handleClanMembersLookup,
};

