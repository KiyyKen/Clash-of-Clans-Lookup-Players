const express = require("express");
const axios = require("axios");
const router = express.Router();

const { handlePlayerLookup } = require("../controllers/playerController");
const { handleClanLookup, handleClanMembersLookup } = require("../controllers/clanController");

// Diagnostic route to check server's outbound public IP and config
router.get("/api/my-ip", async (req, res) => {
  try {
    const ipRes = await axios.get("https://api.ipify.org?format=json", { timeout: 6000 });
    return res.json({
      outboundIp: ipRes.data.ip,
      isServerlessVercel: !!process.env.VERCEL,
      activeBaseUrl: process.env.COC_API_BASE_URL || (process.env.VERCEL ? "https://cocproxy.royaleapi.dev/v1" : "https://api.clashofclans.com/v1"),
      proxyIpToWhitelist: "45.79.218.79",
      instruction: "Pastikan IP 45.79.218.79 terdaftar di Allowed IP pada portal developer.clashofclans.com.",
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

