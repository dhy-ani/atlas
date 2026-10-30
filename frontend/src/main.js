// App entry point: wires the globe, panels, and backend together. The atlas
// (destination list) is per-account now — nothing renders until sign-in, and
// what renders comes entirely from the backend (GET /api/atlas), never a
// hardcoded array. A brand-new account always starts empty.
import './styles/main.css';
import { api, USE_STATIC } from './api.js';
import { getUser } from './auth.js';
import { initGlobe } from './globe/globe.js';
import { initDetailPanel } from './panels/detailPanel.js';
import { initMapPanel } from './panels/mapPanel.js';
import { initRoutePlanner } from './panels/routePlanner.js';
import { initBucketDrawer } from './panels/bucketDrawer.js';
import { initAddDestination } from './panels/addDestination.js';
import { initNegotiationPanel } from './panels/negotiationPanel.js';
import { initAuthGate } from './panels/authGate.js';

let atlas = [];
const byId = (id) => atlas.find((d) => d.id === id);

// ---- globe ----
const globe = initGlobe(document.getElementById('globeCanvas'), {
  onSelect: (id) => selectDestination(id),
});

// ---- panels ----
const bucket = initBucketDrawer();
const route = initRoutePlanner({ globe });

const map = initMapPanel({
  onPinGlobe: (place) => globe.addCustomPin(place.lat, place.lng, 'place:' + place.name),
  onAddRoute: (stop) => route.addStop(stop),
  onAddDestination: (place) => addDestinationFromPlace(place),
});

const detail = initDetailPanel({
  onAddBucket: (dest, year, budget, days, addedBy) => bucket.add(dest, year, budget, days, addedBy),
  onAddRoute: (dest) => route.addStop({ id: dest.id, name: dest.name, lat: dest.lat, lng: dest.lng }),
  onOpenMap: (dest) => map.open(dest),
  onSearchNearby: (dest) => map.open(dest, { nearby: true }),
  onRemoveDestination: (dest) => removeDestination(dest),
  getBucketYears: (destId) => bucket.yearsFor(destId),
});

initAddDestination({ onAdd: (place) => addDestinationFromPlace(place) });
initNegotiationPanel({ getBucketDestinations: () => bucket.listDestinations() });

// ---- nav list ----
const navList = document.getElementById('navListItems');
function addNavItem(d, index = document.querySelectorAll('.navItem').length) {
  const el = document.createElement('div');
  el.className = 'navItem';
  el.dataset.id = d.id;
  el.innerHTML = `<span class="dot"></span>${d.name}<span class="rankTag">${d.custom ? 'new' : String(index + 1).padStart(2, '0')}</span>`;
  el.onclick = () => selectDestination(d.id);
  navList.appendChild(el);
}

function selectDestination(id) {
  const d = byId(id);
  if (!d) return; // e.g. a transient "place:" search pin
  globe.setSelected(id);
  globe.focusOn(d.lat, d.lng);
  document.querySelectorAll('.navItem').forEach((n) => n.classList.toggle('active', n.dataset.id === id));
  detail.open(d);
}

// ---- add / remove atlas destinations ----
async function addDestinationFromPlace(place) {
  const payload = {
    name: place.name,
    country: place.country || (place.address ? place.address.split(',').slice(-1)[0].trim() : ''),
    lat: place.lat,
    lng: place.lng,
  };
  const dest = await api.addToAtlas(payload); // backend fills id + defaults
  atlas.push(dest);
  addNavItem(dest);
  globe.removePin('place:' + place.name); // clear any transient search pin for the same spot
  globe.addDestination(dest);
  document.getElementById('addDestModal').classList.remove('open');

  // Adding a destination IS planning to go there — it becomes a bucket-list entry
  // right away (default: next year), attributed to the signed-in user.
  const nextYear = new Date().getFullYear() + 1;
  bucket.add(dest, nextYear, dest.budgetLow * dest.days, dest.days, getUser()?.name || 'Guest');

  selectDestination(dest.id);
  return dest;
}

async function removeDestination(dest) {
  try { await api.removeFromAtlas(dest.id); } catch (e) { /* still remove locally */ }
  atlas = atlas.filter((d) => d.id !== dest.id);
  globe.removePin(dest.id);
  document.querySelector(`.navItem[data-id="${dest.id}"]`)?.remove();
}

// ---- boot: nothing renders until sign-in, then load this account's atlas ----
async function loadAtlas() {
  try {
    atlas = await api.atlas();
  } catch (e) {
    console.error('Failed to load your atlas:', e);
    atlas = [];
  }
  navList.innerHTML = '';
  globe.addDestinations(atlas);
  atlas.forEach((d, i) => addNavItem(d, i));
  document.getElementById('statCount').textContent = atlas.length;
}

// GitHub Pages has no backend to sign in against — the static demo skips the
// gate entirely and uses a device-local atlas (see staticApi.js).
if (USE_STATIC) {
  document.getElementById('authGate').classList.add('hidden');
  loadAtlas();
} else {
  initAuthGate({ onSignedIn: loadAtlas });
}
