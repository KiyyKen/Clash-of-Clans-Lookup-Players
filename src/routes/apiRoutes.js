const express = require("express");
const router = express.Router();

const { handlePlayerLookup } = require("../controllers/playerController");
const { handleClanLookup, handleClanMembersLookup } = require("../controllers/clanController");

// Player routes
router.get("/player/:tag", handlePlayerLookup);
router.get("/players/:tag", handlePlayerLookup);

// Clan routes
router.get("/clan/:tag", handleClanLookup);
router.get("/clans/:tag", handleClanLookup);

// Clan members routes
router.get("/clan/:tag/members", handleClanMembersLookup);
router.get("/clans/:tag/members", handleClanMembersLookup);

module.exports = router;
