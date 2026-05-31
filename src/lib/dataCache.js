/**
 * Portfolio Data Cache
 *
 * Fetches all API data in parallel on first load.
 * Stores results in an in-memory cache + sessionStorage.
 * All components subscribe and receive data the moment it's ready —
 * no duplicate requests, no waterfalls.
 */

const CACHE_KEY = 'portfolio_data_cache';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// In-memory promise store — deduplicate concurrent fetches
const _inflight = {};
let _cache = null;

function readSessionCache() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.ts > CACHE_TTL_MS) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }
    return parsed.data;
  } catch {
    return null;
  }
}

function writeSessionCache(data) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
  } catch {
    // sessionStorage might be full or unavailable — silently ignore
  }
}

async function fetchAll() {
  const [profileRes, experiencesRes, projectsRes] = await Promise.allSettled([
    fetch('/api/admin/profile'),
    fetch('/api/admin/experiences'),
    fetch('/api/admin/projects'),
  ]);

  const safe = async (settled) => {
    if (settled.status === 'rejected') return null;
    try {
      const json = await settled.value.json();
      return json.success ? json.data : null;
    } catch {
      return null;
    }
  };

  const [profile, experiences, projects] = await Promise.all([
    safe(profileRes),
    safe(experiencesRes),
    safe(projectsRes),
  ]);

  return { profile, experiences, projects };
}

/**
 * Returns a promise that resolves to { profile, experiences, projects }.
 * Subsequent calls within the same tab session return cached data instantly.
 */
export function getPortfolioData() {
  // Return in-memory cache if available
  if (_cache) return Promise.resolve(_cache);

  // Return session storage cache if fresh
  if (typeof window !== 'undefined') {
    const sessionData = readSessionCache();
    if (sessionData) {
      _cache = sessionData;
      return Promise.resolve(_cache);
    }
  }

  // Deduplicate: if a fetch is already in flight, reuse it
  if (_inflight.all) return _inflight.all;

  _inflight.all = fetchAll().then((data) => {
    _cache = data;
    if (typeof window !== 'undefined') writeSessionCache(data);
    delete _inflight.all;
    return data;
  }).catch((err) => {
    delete _inflight.all;
    throw err;
  });

  return _inflight.all;
}

/**
 * Call this early (e.g. in layout-wrapper) to kick off background prefetch.
 * Safe to call multiple times — only fetches once.
 */
export function prefetchPortfolioData() {
  if (typeof window === 'undefined') return;
  getPortfolioData().catch(() => {}); // fire-and-forget
}

/**
 * Invalidate cache (call after admin saves changes).
 */
export function invalidatePortfolioCache() {
  _cache = null;
  try { sessionStorage.removeItem(CACHE_KEY); } catch {}
}
