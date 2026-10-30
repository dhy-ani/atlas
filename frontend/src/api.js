// Thin typed-ish wrapper around the backend REST API. Every call returns parsed
// JSON or throws. Flights/best-time/trade-off responses carry their own
// "status" field ("ok" | "not_configured" | "error") since there is no mock
// fallback anymore — the caller decides how to render each case.
import { API_BASE } from './config.js';
import { authHeaders } from './auth.js';
import { staticApi } from './staticApi.js';

// On GitHub Pages there is no backend, so builds with VITE_STATIC=1 use a
// client-side implementation (staticApi) with the identical interface.
export const USE_STATIC = import.meta.env.VITE_STATIC === '1' || import.meta.env.VITE_STATIC === 'true';

async function get(path, params = {}, auth = false) {
  const qs = new URLSearchParams(params).toString();
  const url = `${API_BASE}/api${path}${qs ? `?${qs}` : ''}`;
  const res = await fetch(url, { headers: auth ? authHeaders() : {} });
  if (!res.ok) throw new Error(`${path} -> ${res.status}`);
  return res.json();
}

async function post(path, body, auth = false) {
  const res = await fetch(`${API_BASE}/api${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(auth ? authHeaders() : {}) },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${path} -> ${res.status}`);
  return res.json();
}

async function del(path, auth = true) {
  const res = await fetch(`${API_BASE}/api${path}`, { method: 'DELETE', headers: auth ? authHeaders() : {} });
  if (!res.ok) throw new Error(`${path} -> ${res.status}`);
  return res.json();
}

const realApi = {
  health: () => get('/health'),

  // Personal atlas — every call requires sign-in.
  atlas: () => get('/atlas', {}, true),
  addToAtlas: (dest) => post('/atlas', dest, true),
  removeFromAtlas: (id) => del(`/atlas/${encodeURIComponent(id)}`),

  geocode: (q) => get('/places/geocode', { q }),
  places: (lat, lng, q = '', radius_m = 40000) => get('/places/search', { lat, lng, q, radius_m }),

  // Real web-search-derived data — no dest_id, no mock. Every response has a
  // "status" field the caller must check.
  flights: (destinationName, destinationCountry = '', origin = 'JFK', depart) =>
    get('/flights', { destination_name: destinationName, destination_country: destinationCountry, origin, ...(depart ? { depart } : {}) }),
  bestTime: (destinationName, destinationCountry = '', lat, lng) =>
    get('/predict/best-time', { destination_name: destinationName, destination_country: destinationCountry, lat, lng }),
  tradeoff: (destinationName, destinationCountry = '', budgetUsd) =>
    get('/predict/tradeoff', { destination_name: destinationName, destination_country: destinationCountry, budget_usd: budgetUsd }),

  planRoute: (stops, optimize = false, roundTrip = false) =>
    post('/routes/plan', { stops, optimize, round_trip: roundTrip }),
};
export const api = USE_STATIC ? staticApi : realApi;
