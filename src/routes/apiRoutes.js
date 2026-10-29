const express = require("express");
const axios = require("axios");
const router = express.Router();

const { handlePlayerLookup } = require("../controllers/playerController");
const { handleClanLookup, handleClanMembersLookup } = require("../controllers/clanController");

// Diagnostic route to check server's outbound public IP (crucial for Supercell API Allowed IP whitelist)
router.get("/api/my-ip", async (req, res) => {
  try {
    const ipRes = await axios.get("https://api.ipify.org?format=json", { timeout: 6000 });
    return res.json({
      outboundIp: ipRes.data.ip,
      instruction: "Salin IP ini dan masukkan ke 'Allowed IP Addresses' pada key di developer.clashofclans.com",
    });
  } catch (err) {
    return res.status(500).json({ error: "Gagal mendeteksi IP server" });
  }
});

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

