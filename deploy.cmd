@echo off
REM ============================================================
REM  AI Tool Scout - one-shot build + deploy to Cloudflare Pages
REM  Requires: Node 18+ and a logged-in Wrangler (npx wrangler login)
REM ============================================================

cd /d "%~dp0"

echo [1/3] Building site...
call npx --yes wrangler@latest --version >nul 2>&1
node build.js
if errorlevel 1 (
  echo      BUILD FAILED
  exit /b 1
)

echo.
echo [2/3] Running SEO checks...
node check.js

echo.
echo [3/3] Deploying to Cloudflare Pages...
call npx --yes wrangler@latest pages deploy dist --project-name=ai-tool-scout
if errorlevel 1 (
  echo      DEPLOY FAILED - run "npx wrangler login" first
  exit /b 1
)

echo.
echo Done.
