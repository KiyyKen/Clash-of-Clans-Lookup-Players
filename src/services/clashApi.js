const axios = require("axios");
const { COC_API_KEY, COC_API_BASE_URL } = require("../config");
const { getFromCache, saveToCache } = require("./cache");

// Base URL can be overridden (e.g. https://proxy.royaleapi.dev/v1 for Vercel/dynamic IP hosting)
const BASE_URL = (COC_API_BASE_URL || "https://api.clashofclans.com/v1").replace(/\/+$/, "");

// Helper to validate Clash of Clans tag format (# + valid base32 characters)
function isValidTag(tag) {
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

  const cleanPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const response = await axios.get(`${BASE_URL}${cleanPath}`, {
    headers: {
      Authorization: `Bearer ${COC_API_KEY}`,
      Accept: "application/json",
    },
    timeout: 10000,
  });

  saveToCache(pathname, response.data);
  return { data: response.data, fromCache: false };
}

module.exports = {
  isValidTag,
  normalizeTag,
  fetchFromClashApi,
};

