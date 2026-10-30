# Docker, explained through this project

This is a from-scratch guide to Docker that uses **our own files** as the examples.
By the end you'll understand what a container is and be able to run the whole app on
any laptop with one command.

---

## 1. The problem Docker solves

"It works on my machine." Our app needs Python 3.12 + a dozen libraries, Node 20 to
build the frontend, a trained ML model, and nginx to serve everything. Installing all
of that correctly on a second laptop is fiddly and easy to get wrong.

A **container** packages the app *together with its entire environment* — the OS
libraries, the runtime, the dependencies, the code — into one sealed unit that runs
identically everywhere. It's like shipping the whole kitchen, not just the recipe.

### Container vs. virtual machine
A VM virtualises a whole computer (its own OS kernel) — heavy, gigabytes, slow to boot.
A container shares the host's kernel and only isolates the *user space* — lightweight,
megabytes, boots in milliseconds. That's why we can run two of them casually.

---

## 2. The three core nouns

| Term | What it is | Analogy |
|---|---|---|
| **Image** | A read-only, built snapshot of a filesystem + metadata (what to run). | A class / a blueprint |
| **Container** | A running (or stopped) instance of an image. | An object / a house built from the blueprint |
| **Registry** | A place images are stored & shared (e.g. Docker Hub). | GitHub, but for images |

You **build** an image from a `Dockerfile`, then **run** it to get a container. You can
run many containers from one image.

---

## 3. The Dockerfile — how an image is built

A `Dockerfile` is a recipe: each instruction creates a **layer** (a cached filesystem
diff). Look at [`backend/Dockerfile`](../backend/Dockerfile):

```dockerfile
FROM python:3.12-slim          # start from an official Python image (a base layer)
WORKDIR /app                   # set the working directory
COPY requirements.txt .        # copy just the deps list…
RUN pip install -r requirements.txt   # …and install — this LAYER is cached
COPY app ./app                 # copy the code (changes often)
RUN python -m app.ml.train     # bake the trained ML model into the image
USER appuser                   # drop root for safety
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Why the order matters (layer caching)
Docker caches each layer and reuses it if nothing above changed. We copy
`requirements.txt` and install deps **before** copying the code. So when you edit a
Python file, Docker reuses the cached "install dependencies" layer (slow, ~a minute)
and only re-runs the fast code-copy layer. Put the rarely-changing, expensive steps
first.

### `CMD` vs `RUN`
`RUN` executes at **build** time and bakes the result into the image (installing deps,
training the model). `CMD` is the default command run when the **container starts**.

---

## 4. Multi-stage builds — small, clean images

The frontend needs Node to *build*, but not to *run* (nginx just serves static files).
[`frontend/Dockerfile`](../frontend/Dockerfile) uses **two stages**:

```dockerfile
FROM node:20-alpine AS build   # stage 1: heavy toolchain
RUN npm ci && npm run build     #   -> produces /app/dist (static files)

FROM nginx:alpine AS runtime   # stage 2: tiny web server
COPY --from=build /app/dist /usr/share/nginx/html   # copy ONLY the built output
```

The final image contains **no Node, no node_modules, no source** — just nginx + a few
MB of assets. The build tooling stays behind in stage 1 and is discarded. This is the
single most important trick for lean, secure images.

---

## 5. `.dockerignore` — keep the build context small

Before building, Docker sends the folder ("build context") to the engine. Our
[`.dockerignore`](../frontend/.dockerignore) files exclude `node_modules/`, `.venv/`,
`dist/`, and secrets so builds are fast and nothing sensitive leaks into an image.

---

## 6. docker compose — running the whole system

One container = one job. We have two (API + web), so we describe them together in
[`docker-compose.yml`](../docker-compose.yml) and bring them up with one command.
Key concepts it demonstrates:

- **Services**: `backend` and `frontend` — each becomes a container.
- **Networking / service discovery**: Compose puts both on a private network. Inside
  it, containers reach each other **by service name**. That's why our nginx config says
  `proxy_pass http://backend:8000` — `backend` is a DNS name Docker resolves. The
  browser never talks to the backend directly; nginx proxies `/api` to it, so the whole
  app is one origin (no CORS).
- **Ports**: `"8080:80"` publishes container port 80 to host port 8080. The backend
  uses `expose` (internal only) — it's *not* reachable from your host, only from nginx.
  One front door.
- **Volumes**: `wanderlust-data:/app/persist` is a **named volume** — storage that
  outlives the container. Your added custom destinations are written there, so they
  survive `docker compose down` / `up`. (A container's own filesystem is ephemeral;
  delete the container and un-volumed changes vanish.)
- **Environment / secrets**: keys are passed via `environment:` with `${VAR:-}`
  defaults, so it runs with nothing set. Compose auto-loads a `.env` file for those
  values — no keys are baked into images.
- **depends_on + healthcheck**: nginx waits for `condition: service_healthy` so the API
  is actually ready (its `/api/health` passes) before the web layer starts.

---

## 7. Run it on another laptop  
1. **Install Docker Desktop** (Windows/macOS) or Docker Engine (Linux), and start it.
2. **Get the project** onto the laptop (git clone, or copy the folder — you do *not*
   need Python or Node installed; Docker handles all of it).
3. From the project root:
   ```bash
   docker compose up --build
   ```
   First build takes a few minutes (downloads base images, installs deps, trains the
   model, builds the frontend). Later runs are cached and start in seconds.
4. Open **http://localhost:8080**. Done.

To stop: `Ctrl-C`, then `docker compose down` (add `-v` to also wipe the saved custom
destinations).

### Going live with real keys
Copy `.env.example` to `.env` in the project root, fill in any keys, then rebuild:
```bash
docker compose up --build
```
> Note: the Google **Maps** browser key (`VITE_GOOGLE_MAPS_API_KEY`) is compiled into
> the frontend at build time, so changing it requires a rebuild. The backend keys
> (Amadeus/OpenWeather/Places) are read at runtime — no rebuild needed, just restart.

---

## 8. Command cheat sheet

```bash
docker compose up --build        # build + start everything (foreground)
docker compose up -d             # start in the background (detached)
docker compose ps                # list running services
docker compose logs -f backend   # follow one service's logs
docker compose exec backend sh   # open a shell inside the running API container
docker compose down              # stop & remove containers (keeps the volume)
docker compose down -v           # also delete the named volume (fresh start)

docker images                    # images on this machine
docker ps -a                     # all containers (running + stopped)
docker system prune              # reclaim space from dangling images/containers
```

---

## 9. How our images map to the concepts

```
docker-compose.yml
├── service: backend  ──build──►  backend/Dockerfile
│      • python:3.12-slim base            (FROM)
│      • pip install deps (cached layer)  (COPY requirements + RUN pip)
│      • bake trained ML model            (RUN python -m app.ml.train)
│      • volume /app/persist              (custom destinations persist here)
│      • healthcheck /api/health
│
└── service: frontend ──build──►  frontend/Dockerfile (multi-stage)
       • stage 1 node:20-alpine  -> vite build -> /app/dist
       • stage 2 nginx:alpine    -> serves dist + proxies /api -> backend:8000
       • published on host :8080
```

That's the whole mental model: **Dockerfile → image → container**, wired together and
run by **compose**, with **volumes** for persistence and a private **network** for the
two services to talk. 