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

// Small helper to validate Clash of Clans player tag format
function isValidTag(tag) {
  // Valid chars in COC tag: #, uppercase letters, and numbers from this set
  return /^#?[0289PYLQGRJCUV]+$/i.test(tag);
}

function normalizeTag(tag) {
  return tag.startsWith("#") ? tag : `#${tag}`;
}

async function fetchFromClashApi(pathname) {
  return axios.get(`https://api.clashofclans.com/v1${pathname}`, {
    headers: {
      Authorization: `Bearer ${COC_API_KEY}`,
    },
    timeout: 10000,
  });
}

// Shared handler so we can support both:
// - GET /player/:tag   (as requested in assignment)
// - GET /players/:tag  (looks closer to Clash API naming)
async function handlePlayerLookup(req, res) {
  const rawTag = req.params.tag;

  // Add # if user did not include it
  const normalizedTag = normalizeTag(rawTag);

  // Validate before calling external API
  if (!isValidTag(normalizedTag)) {
    return res.status(400).json({
      error: "Invalid player tag format.",
    });
  }

  // API key must come from environment variable
  if (!COC_API_KEY) {
    return res.status(500).json({
      error: "Server config error: COC_API_KEY is missing.",
    });
  }

  try {
    // Clash API needs URL-encoded tag: # becomes %23
    const encodedTag = encodeURIComponent(normalizedTag);
    const response = await fetchFromClashApi(`/players/${encodedTag}`);

    const player = response.data;

    // Send only fields needed by the frontend
    return res.json({
      name: player.name,
      expLevel: player.expLevel,
      townHallLevel: player.townHallLevel,
      trophies: player.trophies,
      bestTrophies: player.bestTrophies,
      warStars: player.warStars,
      clanName: player.clan ? player.clan.name : null,
      clanTag: player.clan ? player.clan.tag : null,
    });
  } catch (error) {
    // Handle known API error responses
    if (error.response) {
      const status = error.response.status;

      if (status === 404) {
        return res.status(404).json({
          error: "Player not found. Check the player tag.",
        });
      }

      if (status === 403) {
        return res.status(403).json({
          error: "Access denied by Clash API. Check your API key or allowed IP.",
        });
      }

      return res.status(status).json({
        error: "Clash API returned an error.",
      });
    }

    // Handle network/timeout/unexpected errors
    return res.status(500).json({
      error: "Failed to fetch player data. Please try again.",
    });
  }
}

// Shared handler for clan lookup routes
async function handleClanLookup(req, res) {
  const rawTag = req.params.tag;
  const normalizedTag = normalizeTag(rawTag);

  if (!isValidTag(normalizedTag)) {
    return res.status(400).json({
      error: "Invalid clan tag format.",
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
      name: clan.name,
      tag: clan.tag,
      clanLevel: clan.clanLevel,
      members: clan.members,
      warLeague: clan.warLeague ? clan.warLeague.name : null,
      location: clan.location ? clan.location.name : null,
      description: clan.description || null,
      badgeUrl: clan.badgeUrls ? clan.badgeUrls.medium : null,
    });
  } catch (error) {
    if (error.response) {
      const status = error.response.status;

      if (status === 404) {
        return res.status(404).json({
          error: "Clan not found. Check the clan tag.",
        });
      }

      if (status === 403) {
        return res.status(403).json({
          error: "Access denied by Clash API. Check your API key or allowed IP.",
        });
      }

      return res.status(status).json({
        error: "Clash API returned an error.",
      });
    }

    return res.status(500).json({
      error: "Failed to fetch clan data. Please try again.",
    });
  }
}

// Shared handler for clan member list routes
async function handleClanMembersLookup(req, res) {
  const rawTag = req.params.tag;
  const normalizedTag = normalizeTag(rawTag);

  if (!isValidTag(normalizedTag)) {
    return res.status(400).json({
      error: "Invalid clan tag format.",
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
        expLevel: member.expLevel,
        trophies: member.trophies,
        builderBaseTrophies: member.builderBaseTrophies,
      })),
    });
  } catch (error) {
    if (error.response) {
      const status = error.response.status;

      if (status === 404) {
        return res.status(404).json({
          error: "Clan members not found. Check the clan tag.",
        });
      }

      if (status === 403) {
        return res.status(403).json({
          error: "Access denied by Clash API. Check your API key or allowed IP.",
        });
      }

      return res.status(status).json({
        error: "Clash API returned an error.",
      });
    }

    return res.status(500).json({
      error: "Failed to fetch clan members. Please try again.",
    });
  }
}

// GET /player/:tag
// Example: /player/%2390ABC123
app.get("/player/:tag", handlePlayerLookup);

// Optional alias route
app.get("/players/:tag", handlePlayerLookup);

// GET /clan/:tag
app.get("/clan/:tag", handleClanLookup);

// Optional alias route
app.get("/clans/:tag", handleClanLookup);

// GET /clan/:tag/members
app.get("/clan/:tag/members", handleClanMembersLookup);

// Optional alias route
app.get("/clans/:tag/members", handleClanMembersLookup);

// Start server only when this file is run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

module.exports = app;
