// Full-screen 2D detail map with Map / Satellite / Street View toggles and a
// nearby-places search. Uses the Google Maps JS API when VITE_GOOGLE_MAPS_API_KEY
// is set (adds Street View); otherwise falls back to keyless Leaflet + Esri
// satellite imagery. Place search always goes through the backend, so it works
// in either mode.
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
// Bundle Leaflet's default marker images so they resolve correctly in a Vite
// production build (and under the GitHub Pages base path).
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { GOOGLE_MAPS_KEY } from '../config.js';
import { api } from '../api.js';

L.Icon.Default.mergeOptions({ iconRetinaUrl: markerIcon2x, iconUrl: markerIcon, shadowUrl: markerShadow });

let googlePromise = null;
function loadGoogle() {
  if (window.google?.maps) return Promise.resolve(window.google);
  if (!GOOGLE_MAPS_KEY) return Promise.reject(new Error('no key'));
  if (!googlePromise) {
    googlePromise = new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}&libraries=places`;
      s.async = true;
      s.onload = () => res(window.google);
      s.onerror = () => rej(new Error('google load failed'));
      document.head.appendChild(s);
    });
  }
  return googlePromise;
}

export function initMapPanel({ onPinGlobe, onAddRoute, onAddDestination }) {
  const modal = document.getElementById('mapModal');
  const mapEl = document.getElementById('mapCanvas');
  const svEl = document.getElementById('streetView');
  const titleEl = document.getElementById('mapTitle');
  const listEl = document.getElementById('placeResults');
  const searchInput = document.getElementById('placeSearchInput');

  let dest = null;
  let mode = 'satellite';
  let gmap = null, gpano = null, lmap = null, lLayers = null;
  let usingGoogle = false;

  document.getElementById('closeMap').onclick = () => { modal.classList.remove('open'); };
  document.querySelectorAll('#mapModal .viewBtn').forEach((b) => {
    b.onclick = () => setMode(b.dataset.mode);
  });
  document.getElementById('placeSearchBtn').onclick = () => search(searchInput.value);
  searchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') search(searchInput.value); });
  document.getElementById('nearbyBtn').onclick = () => search('');

  async function open(d, opts = {}) {
    dest = d;
    titleEl.textContent = `${d.name} — ${d.country}`;
    modal.classList.add('open');
    listEl.innerHTML = '<div class="loading">Tip: search a place or hit “Nearby famous places”.</div>';
    searchInput.value = '';
    if (opts.nearby) search('');

    try {
      await loadGoogle();
      usingGoogle = true;
      document.getElementById('svBtnWrap').style.display = '';
      await initGoogle(d);
    } catch {
      usingGoogle = false;
      document.getElementById('svBtnWrap').style.display = 'none'; // no Street View without key
      initLeaflet(d);
    }
    setMode('satellite');
  }

  // ---------- Google implementation ----------
  async function initGoogle(d) {
    const g = window.google;
    const center = { lat: d.lat, lng: d.lng };
    gmap = new g.maps.Map(mapEl, { center, zoom: 12, mapTypeId: 'satellite', streetViewControl: false });
    new g.maps.Marker({ position: center, map: gmap, title: d.name });
    gpano = new g.maps.StreetViewPanorama(svEl, { position: center, pov: { heading: 34, pitch: 8 }, zoom: 1 });
  }

  // ---------- Leaflet fallback ----------
  function initLeaflet(d) {
    if (lmap) { lmap.remove(); lmap = null; }
    lmap = L.map(mapEl, { zoomControl: true }).setView([d.lat, d.lng], 11);
    const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' });
    const sat = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { attribution: 'Tiles © Esri' },
    );
    lLayers = { osm, sat };
    sat.addTo(lmap);
    L.marker([d.lat, d.lng]).addTo(lmap).bindPopup(d.name).openPopup();
    setTimeout(() => lmap.invalidateSize(), 60);
  }

  function setMode(m) {
    mode = m;
    document.querySelectorAll('#mapModal .viewBtn').forEach((b) => b.classList.toggle('active', b.dataset.mode === m));
    const showSV = m === 'street';
    svEl.style.display = showSV ? 'block' : 'none';
    mapEl.style.display = showSV ? 'none' : 'block';

    if (usingGoogle) {
      if (m === 'map') gmap.setMapTypeId('roadmap');
      if (m === 'satellite') gmap.setMapTypeId('satellite');
      if (m === 'street' && gpano) gpano.setVisible(true);
    } else {
      if (m === 'map') { lLayers.sat.remove(); lLayers.osm.addTo(lmap); }
      if (m === 'satellite') { lLayers.osm.remove(); lLayers.sat.addTo(lmap); }
      setTimeout(() => lmap.invalidateSize(), 60);
    }
  }

  async function search(q) {
    if (!dest) return;
    listEl.innerHTML = '<div class="loading">Searching…</div>';
    try {
      const data = await api.places(dest.lat, dest.lng, q.trim());
      if (!data.results.length) { listEl.innerHTML = '<div class="loading">No places found.</div>'; return; }
      listEl.innerHTML = data.results.map((p, i) => `
        <div class="placeCard" data-i="${i}">
          <div class="pcMain">
            <div class="pcName">${p.name}</div>
            <div class="pcMeta">${p.category || 'place'}${p.rating ? ' · rated ' + p.rating : ''} · ${data.source}</div>
          </div>
          <div class="pcBtns">
            <button data-act="focus" data-i="${i}" title="Show on map">Map</button>
            <button data-act="pin" data-i="${i}" title="Pin on globe">Pin</button>
            <button data-act="route" data-i="${i}" title="Add to route">Route</button>
            <button data-act="dest" data-i="${i}" title="Add as destination">Add</button>
          </div>
        </div>`).join('');
      listEl.querySelectorAll('button').forEach((btn) => {
        btn.onclick = () => {
          const p = data.results[+btn.dataset.i];
          const act = btn.dataset.act;
          if (act === 'focus') focusPlace(p);
          if (act === 'pin') onPinGlobe(p);
          if (act === 'route') onAddRoute({ id: 'place:' + p.name, name: p.name, lat: p.lat, lng: p.lng });
          if (act === 'dest') onAddDestination(p);
        };
      });
    } catch (e) {
      listEl.innerHTML = `<div class="loading err">Search failed: ${e.message}</div>`;
    }
  }

  function focusPlace(p) {
    if (usingGoogle && gmap) {
      gmap.panTo({ lat: p.lat, lng: p.lng }); gmap.setZoom(15);
      new window.google.maps.Marker({ position: { lat: p.lat, lng: p.lng }, map: gmap, title: p.name });
      if (mode === 'street' && gpano) gpano.setPosition({ lat: p.lat, lng: p.lng });
    } else if (lmap) {
      lmap.setView([p.lat, p.lng], 15);
      L.marker([p.lat, p.lng]).addTo(lmap).bindPopup(p.name).openPopup();
    }
  }

  return { open };
}
