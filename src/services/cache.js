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

module.exports = {
  getFromCache,
  saveToCache,
};
