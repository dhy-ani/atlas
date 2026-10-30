# Deployment

**Live demo:** https://dhy-ani.github.io/atlas/

GitHub Pages serves **static files only** — it cannot run the FastAPI backend. So
the deployed site runs in **static mode**: a client-side port of the backend
(`frontend/src/staticApi.js`) provides the same price simulation, climate model,
best-time blend, and route math, and place search hits OpenStreetMap directly from
the browser. Toggled at build time by `VITE_STATIC=1` (see `frontend/src/api.js`).

> Want *real* Amadeus/OpenWeather prices online? Those need a server — deploy the
> Docker stack (see `docs/DOCKER.md`) to a host like Render/Railway/Fly.io and point
> the frontend at it by building with `VITE_API_BASE=https://your-backend` instead of
> `VITE_STATIC=1`.

---

## How it's deployed now: `gh-pages` branch

The built site lives on the `gh-pages` branch; Pages serves it. To **redeploy** after
changes, just run the helper:

```powershell
# from the repo root (Windows)
./deploy/publish.ps1
```

It rebuilds the static site (with the correct `/atlas/` base path) and
force-pushes `frontend/dist` to `gh-pages`. The manual equivalent:

```bash
cd frontend
VITE_STATIC=1 VITE_BASE="/atlas/" npm run build
touch dist/.nojekyll
cd dist && git init -b gh-pages && git add -A && git commit -m deploy \
  && git push -f https://github.com/dhy-ani/atlas.git gh-pages
```

---

## Optional: CI auto-deploy on every push

A ready-made GitHub Actions workflow is in
[`deploy/github-pages-workflow.yml`](../deploy/github-pages-workflow.yml). It builds
static mode and publishes on every push to `master`. It's **not active yet** because
the file lives outside `.github/workflows/` (pushing workflow files needs the `gh`
token's `workflow` scope). To enable it:

1. Grant the scope once:
   ```bash
   gh auth refresh -h github.com -s workflow
   ```
2. Move the file into place and push:
   ```bash
   mkdir -p .github/workflows
   git mv deploy/github-pages-workflow.yml .github/workflows/deploy-pages.yml
   git commit -m "Enable Pages CI" && git push
   ```
3. In the repo: **Settings → Pages → Source → GitHub Actions**.

(Alternatively, create the workflow file straight from the GitHub web UI — the browser
isn't subject to the token-scope restriction.)

### Google Maps on the live site
Street View + Google satellite need a browser key. Add a repo **secret** named
`VITE_GOOGLE_MAPS_API_KEY` (Settings → Secrets → Actions) — the CI workflow passes it
into the build. Without it, the live site uses the keyless Leaflet/Esri satellite view.
