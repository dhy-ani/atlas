# Rebuild the static site and (re)publish it to the gh-pages branch.
#   Usage:  ./deploy/publish.ps1
# Requires: node/npm, git, and push access to the repo.
$ErrorActionPreference = "Stop"

$Repo = "https://github.com/dhy-ani/atlas.git"
$Base = "/atlas/"                      # must match the repo name

$root = Split-Path $PSScriptRoot -Parent
Push-Location "$root\frontend"
try {
    $env:VITE_STATIC = "1"
    $env:VITE_BASE = $Base
    npm ci
    npm run build
    New-Item -ItemType File -Force dist\.nojekyll | Out-Null

    Push-Location dist
    try {
        if (Test-Path .git) { Remove-Item -Recurse -Force .git }
        git init -q
        git checkout -q -b gh-pages
        git add -A
        git commit -q -m "Deploy Wanderlust Atlas static site"
        git push -f $Repo gh-pages
    } finally { Pop-Location }
    Write-Host "`nDeployed -> https://dhy-ani.github.io/atlas/" -ForegroundColor Green
} finally { Pop-Location }
