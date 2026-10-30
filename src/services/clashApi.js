const axios = require("axios");
const { COC_API_KEY, COC_API_BASE_URL } = require("../config");
const { getFromCache, saveToCache } = require("./cache");

// Base URL resolution:
// - If COC_API_BASE_URL is provided, auto-correct 'proxy.royaleapi.dev' to 'cocproxy.royaleapi.dev'
// - In Vercel serverless environment, default to cocproxy.royaleapi.dev/v1 if not specified
// - Otherwise default to official https://api.clashofclans.com/v1
function resolveBaseUrl() {
  let url = (COC_API_BASE_URL || "").trim();
  if (!url && process.env.VERCEL) {
    url = "https://cocproxy.royaleapi.dev/v1";
  }
  if (!url) {
    url = "https://api.clashofclans.com/v1";
  }
  url = url.replace(/\/+$/, "");
  // RoyaleAPI routes Clash of Clans specifically via cocproxy.royaleapi.dev
  if (url.includes("proxy.royaleapi.dev") && !url.includes("cocproxy")) {
    url = url.replace("proxy.royaleapi.dev", "cocproxy.royaleapi.dev");
  }
  return url;
}

const BASE_URL = resolveBaseUrl();

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

