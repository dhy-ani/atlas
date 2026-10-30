// ============================================================================
//  STATIC MODE  (used on GitHub Pages, where there is no backend and no server
//  to safely hold TAVILY_API_KEY/OPENROUTER_API_KEY)
//
//  This is a real, device-local atlas (destinations you add persist in this
//  browser's localStorage) with real place search (keyless OpenStreetMap
//  Nominatim). It does NOT simulate flights, best-time, or budget/luxury data —
//  there is no key-safe way to do real web-search-backed data from a static
//  site, so those report status "not_configured" honestly instead of faking
//  numbers, exactly like the backend does when it has no keys either.
//
//  It exposes the SAME interface as ./api.js (real backend), so nothing else
//  in the app changes. Enabled at build time via VITE_STATIC=1 (see api.js).
// ============================================================================
import { englishOnly } from './logic/text.js';

const LS_KEY = 'wa_static_atlas';
const CRUISE_KMH = 850;

function haversineKm(la1, lo1, la2, lo2) {
  const R = 6371, r = Math.PI / 180;
  const dLa = (la2 - la1) * r, dLo = (lo2 - lo1) * r;
  const a = Math.sin(dLa / 2) ** 2 + Math.cos(la1 * r) * Math.cos(la2 * r) * Math.sin(dLo / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

const loadAtlas = () => { try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; } catch { return []; } };
const saveAtlas = (list) => localStorage.setItem(LS_KEY, JSON.stringify(list));

function seed(...parts) {
  let h = 2166136261;
  const s = parts.join('|');
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

const NOT_CONFIGURED = {
  status: 'not_configured',
  message: 'This is the static GitHub Pages demo — live web-search data needs the full backend (Vercel deployment or local server). See the README for how to run it.',
};

export const staticApi = {
  health: async () => ({ status: 'ok', static: true, live: { live_data_agent: false, places_google: false } }),

  // Device-local atlas — not a real account, just this browser. Starts empty.
  atlas: async () => loadAtlas(),

  addToAtlas: async (payload) => {
    const slug = (payload.name || 'place').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'place';
    const dest = {
      id: `${slug}-${seed(payload.name, payload.lat).toString(16).slice(0, 4)}`,
      name: payload.name, country: payload.country || '',
      lat: payload.lat, lng: payload.lng, airport: payload.airport || '',
      days: payload.days || 4, budgetLow: payload.budgetLow || 100, budgetHigh: payload.budgetHigh || 200,
      tagline: payload.tagline || '', custom: true,
    };
    const list = loadAtlas();
    list.push(dest);
    saveAtlas(list);
    return dest;
  },

  removeFromAtlas: async (id) => { saveAtlas(loadAtlas().filter((d) => d.id !== id)); return { removed: id }; },

  flights: async () => ({ ...NOT_CONFIGURED, origin: 'JFK' }),
  bestTime: async (name, country, lat, lng) => {
    try {
      const end = new Date().getFullYear() - 1, start = end - 4;
      const qs = new URLSearchParams({ latitude: lat, longitude: lng, start_date: `${start}-01-01`, end_date: `${end}-12-31`,
        daily: 'temperature_2m_mean,precipitation_sum', timezone: 'auto' });
      const res = await fetch(`https://archive-api.open-meteo.com/v1/archive?${qs}`);
      if (!res.ok) throw new Error(String(res.status));
      const { daily } = await res.json();
      const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const t = Array.from({ length: 12 }, () => []), r = Array(12).fill(0);
      daily.time.forEach((d, i) => {
        const m = +d.slice(5, 7) - 1;
        if (daily.temperature_2m_mean[i] != null) t[m].push(daily.temperature_2m_mean[i]);
        if (daily.precipitation_sum[i] != null) r[m] += daily.precipitation_sum[i];
      });
      const months = names.map((n, m) => {
        const avg = t[m].reduce((a, b) => a + b, 0) / t[m].length, rain = r[m] / 5;
        const comfort = Math.max(0, Math.min(100, 100 - Math.abs(avg - 22) * 3.2 - rain * 0.18));
        return { month: m + 1, month_name: n, avg_temp_c: Math.round(avg * 10) / 10, rain_mm: Math.round(rain), comfort_score: Math.round(comfort * 10) / 10 };
      });
      const ranked = [...months].sort((a, b) => b.comfort_score - a.comfort_score);
      return { status: 'ok', destination: name, source: 'open-meteo-era5', months,
        best_months: ranked.slice(0, 3).map((m) => m.month_name), avoid_months: ranked.slice(-2).map((m) => m.month_name) };
    } catch (e) {
      return { status: 'error', message: 'Climate data is unavailable at the moment.' };
    }
  },
  tradeoff: async () => ({ ...NOT_CONFIGURED }),

  planRoute: async (stops, optimize = false) => {
    let ordered = stops;
    if (optimize && stops.length > 2) {
      const remaining = [...stops];
      ordered = [];
      let cur = [40.7128, -74.006];
      while (remaining.length) {
        let bi = 0, bd = Infinity;
        remaining.forEach((s, i) => { const d = haversineKm(cur[0], cur[1], s.lat, s.lng); if (d < bd) { bd = d; bi = i; } });
        const nx = remaining.splice(bi, 1)[0];
        ordered.push(nx); cur = [nx.lat, nx.lng];
      }
    }
    const legs = [];
    let total = 0;
    for (let i = 0; i < ordered.length - 1; i++) {
      const a = ordered[i], b = ordered[i + 1];
      const km = haversineKm(a.lat, a.lng, b.lat, b.lng);
      total += km;
      legs.push({ from_name: a.name, to_name: b.name, distance_km: Math.round(km * 10) / 10, est_flight_hours: Math.round((km / CRUISE_KMH) * 10) / 10 });
    }
    return { stops: ordered, legs, total_distance_km: Math.round(total * 10) / 10, total_flight_hours: Math.round((total / CRUISE_KMH) * 10) / 10, optimized: !!optimize };
  },

  // Place search hits OpenStreetMap Nominatim directly (public, CORS-enabled, real data).
  places: async (lat, lng, q = '', radius_m = 40000) => {
    const box = 1.2;
    const params = new URLSearchParams({ q: q || 'tourist attraction', format: 'jsonv2', limit: '10', 'accept-language': 'en',
      viewbox: `${lng - box},${lat + box},${lng + box},${lat - box}`, bounded: '1' });
    const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`);
    const data = await res.json();
    const results = data.map((p) => ({ name: englishOnly((p.display_name || '').split(',')[0]), lat: +p.lat, lng: +p.lon, category: p.type, address: p.display_name, source: 'nominatim' }));
    return { query: q, results, source: results.length ? 'nominatim' : 'unavailable' };
  },

  geocode: async (q) => {
    const params = new URLSearchParams({ q, format: 'jsonv2', limit: '8', addressdetails: '1', 'accept-language': 'en' });
    const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`);
    const data = await res.json();
    const results = data.map((p) => ({ name: englishOnly((p.display_name || '').split(',')[0]), lat: +p.lat, lng: +p.lon,
      category: p.type, address: p.display_name, country: p.address?.country, source: 'nominatim' }));
    return { query: q, results, source: results.length ? 'nominatim' : 'unavailable' };
  },
};
