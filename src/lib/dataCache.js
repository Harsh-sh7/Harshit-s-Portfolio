/**
 * Portfolio Data Cache
 *
 * Fetches all API data in parallel on first load.
 * Stores results in an in-memory cache + sessionStorage (5-min TTL).
 * All components get data from a single shared fetch — no duplicates, no waterfalls.
 *
 * Case study pages are served instantly from the projects list (same data).
 */

const CACHE_KEY     = 'portfolio_data_cache';
const CACHE_TTL_MS  = 5 * 60 * 1000; // 5 minutes

// In-memory stores
const _inflight = {};
let _cache = null;               // { profile, experiences, projects, projectsById }

// ── SessionStorage helpers ────────────────────────────────────────────────────
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
    // Don't store projectsById — it's derived, rebuild on read
    const { projectsById: _, ...storable } = data;
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: storable }));
  } catch {
    // sessionStorage full or unavailable — silently skip
  }
}

function buildProjectsById(projects) {
  if (!Array.isArray(projects)) return {};
  return Object.fromEntries(projects.map(p => [String(p._id), p]));
}

// ── Core fetch ────────────────────────────────────────────────────────────────
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

  const projectsById = buildProjectsById(projects);
  return { profile, experiences, projects, projectsById };
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Returns { profile, experiences, projects, projectsById }.
 * Subsequent calls within the same tab session return cached data instantly.
 */
export function getPortfolioData() {
  if (_cache) return Promise.resolve(_cache);

  if (typeof window !== 'undefined') {
    const sessionData = readSessionCache();
    if (sessionData) {
      // Rebuild derived index (not stored in sessionStorage)
      _cache = { ...sessionData, projectsById: buildProjectsById(sessionData.projects) };
      return Promise.resolve(_cache);
    }
  }

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
 * Get a single project by ID — served instantly from cache.
 * Falls back to a direct fetch only if the cache hasn't loaded yet.
 */
export async function getProjectById(id) {
  // Try cache first (O(1) lookup)
  if (_cache?.projectsById?.[id]) return _cache.projectsById[id];

  // Cache in session storage?
  if (typeof window !== 'undefined') {
    const sessionData = readSessionCache();
    if (sessionData?.projects) {
      const found = sessionData.projects.find(p => String(p._id) === String(id));
      if (found) return found;
    }
  }

  // If the main cache is in flight, wait for it (don't make a second request)
  if (_inflight.all) {
    const data = await _inflight.all;
    return data?.projectsById?.[id] || null;
  }

  // Last resort: direct fetch (e.g. user deep-linked to case study with no prior visit)
  try {
    const res  = await fetch(`/api/projects/${id}`);
    const json = await res.json();
    return json.success ? json.data : null;
  } catch {
    return null;
  }
}

/**
 * Fire-and-forget prefetch — call in layout-wrapper on mount.
 * Safe to call multiple times (only fetches once per TTL).
 */
export function prefetchPortfolioData() {
  if (typeof window === 'undefined') return;
  getPortfolioData().catch(() => {});
}

/**
 * Invalidate cache (call after admin saves changes so visitors see fresh data).
 */
export function invalidatePortfolioCache() {
  _cache = null;
  try { sessionStorage.removeItem(CACHE_KEY); } catch {}
}
