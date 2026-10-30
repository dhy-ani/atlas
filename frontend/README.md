# Frontend — Atlas

Vite + Three.js single-page app: the 3D satellite globe, 2D detail map with
Satellite/Street View, and all the planning UI.

## Run

```bash
npm install
cp .env.example .env      # optional: add VITE_GOOGLE_MAPS_API_KEY for Street View
npm run dev               # http://localhost:5173  (proxies /api -> :8000)
```

Start the [backend](../backend/README.md) on port 8000 first, or the panels will show
“backend offline”.

## Layout

```
src/
├── main.js              app wiring: globe + panels + backend
├── config.js            env vars, Earth texture URL, NYC origin
├── api.js               fetch wrappers for every backend endpoint
├── data/destinations.js rich descriptive content for the detail panel
├── globe/
│   ├── globe.js         Three.js scene, satellite texture, drag/spin, raycasting
│   ├── pins.js          small Google-style red teardrop markers (white dot)
│   └── routes.js        dashed great-circle route lines
├── panels/
│   ├── detailPanel.js   destination info + on-demand live intel
│   ├── flightPanel.js   render helpers: flights, ML prediction, best-time chart
│   ├── mapPanel.js      2D map: Google (satellite + Street View) or Leaflet/Esri
│   ├── routePlanner.js  multi-stop route + dashed globe line
│   └── bucketDrawer.js  year-by-year plan + budget summary
└── styles/main.css      all styling
```

## Notes
- **No charting library** — the price curve and best-time chart are hand-rolled inline
  SVG in `flightPanel.js`.
- **Street View** needs `VITE_GOOGLE_MAPS_API_KEY`; without it the map uses keyless
  Leaflet + Esri World Imagery and hides the Street View toggle.
- The globe's Earth texture is a public Blue Marble image (see `config.js`); it falls
  back to a solid ocean colour if the CDN is unreachable.
