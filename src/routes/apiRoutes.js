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
      note: process.env.VERCEL
        ? "PERHATIAN: Di Vercel Serverless, IP outbound berubah-ubah secara dinamis dari pool AWS Lambda (tidak statis)."
        : "IP statis / hosting lokal.",
      instruction: "Untuk Vercel / serverless, gunakan proxy static RoyaleAPI (IP: 45.79.218.79) atau tambahkan COC_API_BASE_URL=https://proxy.royaleapi.dev/v1.",
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

