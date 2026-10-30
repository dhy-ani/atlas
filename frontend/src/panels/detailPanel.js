// Right-hand detail panel: destination content + on-demand live flights,
// best-time-to-travel, and a budget-vs-luxury trade-off slider — all real
// web-search-derived data, loaded from the backend on open.
import { api } from '../api.js';
import { getUser } from '../auth.js';
import { renderFlights, renderBestTime, renderTradeoff } from './flightPanel.js';

const YEARS = [2026, 2027, 2028, 2029, 2030, 2031, 2032];

export function initDetailPanel({ onAddBucket, onAddRoute, onOpenMap, onSearchNearby, onRemoveDestination, getBucketYears }) {
  const panel = document.getElementById('detailPanel');
  const scroll = document.getElementById('panelScroll');
  document.getElementById('closeDetail').onclick = () => panel.classList.remove('open');

  let current = null;
  let tradeoffTimer = null;

  function open(dest) {
    current = dest;
    const takenYears = getBucketYears(dest.id);
    const attractions = dest.attractions || [];
    const activities = dest.activities || [];
    const famous = dest.famous || [];
    const defaultBudget = dest.budgetLow * dest.days;

    const contentHtml = attractions.length || activities.length || famous.length
      ? `${attractions.length ? `<div class="sectionTitle">Must-Visit Spots, Ranked</div>
          ${attractions.map((a, i) => `<div class="attrItem"><div class="attrRank">${i + 1}</div>
            <div><div class="attrName">${a.name}</div><div class="attrDesc">${a.desc}</div></div></div>`).join('')}` : ''}
         ${activities.length ? `<div class="sectionTitle">Top Activities</div>
          <div class="pillList">${activities.map((a) => `<div class="pill">${a}</div>`).join('')}</div>` : ''}
         ${famous.length ? `<div class="sectionTitle">Famous For</div>
          <div class="pillList">${famous.map((a) => `<div class="pill famousPill">${a}</div>`).join('')}</div>` : ''}`
      : `<div class="customNote">Your custom destination. Live flights and best-time data are above.
           Use <b>Nearby places</b> to explore what's around it.</div>`;

    scroll.innerHTML = `
      <div class="eyebrow">${dest.country} · ${dest.airport || 'nearest airport TBD'}${dest.custom ? ' · custom' : ''}</div>
      <h2>${dest.name}</h2>
      ${dest.tagline ? `<div class="tagline">${dest.tagline}</div>` : ''}

      <div class="actionBar">
        <button class="actBtn" id="btnMap">Map / Street View</button>
        <button class="actBtn" id="btnRoute">Add to route</button>
        <button class="actBtn" id="btnNearby">Nearby places</button>
        <button class="actBtn danger" id="btnRemove">Remove</button>
      </div>

      <div class="metaRow">
        <div class="metaChip"><b>Suggested:</b> ${dest.days} days</div>
        <div class="metaChip"><b>Reference budget:</b> $${dest.budgetLow}–$${dest.budgetHigh}/day</div>
      </div>

      <div id="liveIntel" class="liveIntel"><div class="loading">Loading live flights &amp; best-time data…</div></div>

      <div class="peopleInput">
        <label>Total trip budget ($)</label>
        <input type="number" id="tradeoffBudget" value="${defaultBudget}" min="0" step="50"/>
      </div>
      <input type="range" id="tradeoffSlider" min="200" max="10000" step="50" value="${defaultBudget}" style="width:100%;margin:6px 0 12px;"/>
      <div id="tradeoffBox"><div class="loading">Adjust the budget above to compare budget vs. luxury options.</div></div>

      ${contentHtml}

      <div class="addBucketBox">
        <label>Add to bucket list for</label>
        <select id="yearSelect">
          ${YEARS.map((y) => `<option value="${y}" ${takenYears.includes(y) ? 'disabled' : ''}>${y}${takenYears.includes(y) ? ' (added)' : ''}</option>`).join('')}
        </select>
        <label>Number of days</label>
        <input type="number" id="daysInput" value="${dest.days}" min="1" max="60"/>
        <label>Estimated trip budget ($ total)</label>
        <input type="number" id="budgetInput" value="${defaultBudget}" min="0"/>
        <button id="addBucketBtn">Add to Bucket List</button>
      </div>`;

    panel.classList.add('open');

    document.getElementById('btnMap').onclick = () => onOpenMap(dest);
    document.getElementById('btnRoute').onclick = () => onAddRoute(dest);
    document.getElementById('btnNearby').onclick = () => onSearchNearby(dest);
    document.getElementById('btnRemove').onclick = () => {
      if (confirm(`Remove "${dest.name}" from your atlas?`)) {
        onRemoveDestination(dest);
        panel.classList.remove('open');
      }
    };

    const daysInput = document.getElementById('daysInput');
    const budgetInput = document.getElementById('budgetInput');
    let budgetTouched = false;
    budgetInput.addEventListener('input', () => { budgetTouched = true; });
    daysInput.addEventListener('input', () => {
      const days = Math.max(1, parseInt(daysInput.value, 10) || 1);
      if (!budgetTouched) budgetInput.value = dest.budgetLow * days; // keep suggesting until the user edits it directly
    });

    document.getElementById('addBucketBtn').onclick = () => {
      const year = parseInt(document.getElementById('yearSelect').value, 10);
      const days = Math.max(1, parseInt(daysInput.value, 10) || dest.days);
      const budget = parseFloat(budgetInput.value) || 0;
      onAddBucket(dest, year, budget, days, getUser()?.name || 'Guest');
      const b = document.getElementById('addBucketBtn');
      b.textContent = 'Added!'; b.classList.add('added');
      setTimeout(() => open(dest), 700);
    };

    const slider = document.getElementById('tradeoffSlider');
    const budgetField = document.getElementById('tradeoffBudget');
    const syncAndLoadTradeoff = (val) => {
      slider.value = val; budgetField.value = val;
      clearTimeout(tradeoffTimer);
      tradeoffTimer = setTimeout(() => loadTradeoff(dest, Number(val)), 400);
    };
    slider.addEventListener('input', () => syncAndLoadTradeoff(slider.value));
    budgetField.addEventListener('input', () => syncAndLoadTradeoff(budgetField.value));

    loadIntel(dest);
    loadTradeoff(dest, defaultBudget);
  }

  async function loadIntel(dest) {
    const box = document.getElementById('liveIntel');
    try {
      const [flights, best] = await Promise.all([
        api.flights(dest.name, dest.country),
        api.bestTime(dest.name, dest.country, dest.lat, dest.lng),
      ]);
      if (current?.id !== dest.id) return; // user moved on
      box.innerHTML = renderFlights(flights) + renderBestTime(best);
    } catch (e) {
      box.innerHTML = `<div class="loading err">Couldn't reach the backend: ${e.message}. Is it running on :8000?</div>`;
    }
  }

  async function loadTradeoff(dest, budgetUsd) {
    const box = document.getElementById('tradeoffBox');
    if (!box) return;
    box.innerHTML = '<div class="loading">Comparing budget vs. luxury options…</div>';
    try {
      const tr = await api.tradeoff(dest.name, dest.country, budgetUsd);
      if (current?.id !== dest.id) return;
      box.innerHTML = renderTradeoff(tr, budgetUsd);
    } catch (e) {
      box.innerHTML = `<div class="loading err">Couldn't reach the backend: ${e.message}.</div>`;
    }
  }

  return { open, close: () => panel.classList.remove('open') };
}
