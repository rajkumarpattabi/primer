@echo off
REM ============================================================================
REM Primer - push.bat  (ongoing safe deploy from the laptop)
REM ---------------------------------------------------------------------------
REM Content can also be committed from mobile (via the GitHub connector), so the
REM repo may be AHEAD of this laptop. We ALWAYS pull --rebase first, so the two
REM routes never overwrite each other, then push.
REM
REM FIRST TIME? Run setup-git.bat once instead - it initialises the repo.
REM Usage:  double-click, or  push.bat "optional commit message"
REM ============================================================================
setlocal
cd /d "%~dp0"

REM --- guard: git installed? ---
where git >nul 2>&1
if errorlevel 1 (
  echo.
  echo ERROR: Git is not installed or not on your PATH.
  echo Install Git from https://git-scm.com/download/win then re-run.
  echo.
  pause
  exit /b 1
)

REM --- guard: is this a git repo yet? ---
if not exist ".git" (
  echo.
  echo This folder is NOT connected to git yet, so there is nothing to push.
  echo Run  setup-git.bat  ONCE first ^(first-time setup^), then use push.bat.
  echo.
  pause
  exit /b 1
)

REM --- clear a stale lock left by an interrupted git command ---
if exist ".git\index.lock" del /f /q ".git\index.lock"

REM --- guard: has the first commit been made? ---
git rev-parse --verify HEAD >nul 2>&1
if errorlevel 1 (
  echo.
  echo No commits yet - first-time setup isn't finished.
  echo Run  setup-git.bat  once to make the first commit and push.
  echo.
  pause
  exit /b 1
)

set "MSG=%~1"
if "%MSG%"=="" set "MSG=content: update concepts"

echo.
echo [1/4] Pulling latest (rebasing local work on top of any mobile commits)...
git pull --rebase origin main
if errorlevel 1 (
  echo.
  echo *** Pull/rebase hit a conflict. Resolve it, then run:  git rebase --continue
  echo *** Nothing has been pushed. Fix the conflict and re-run push.bat.
  echo.
  pause
  exit /b 1
)

echo.
echo [2/4] Staging changes...
git add -A

echo.
echo [3/4] Committing...
git commit -m "%MSG%"
if errorlevel 1 echo (nothing new to commit - will still try to push existing commits)

echo.
echo [4/4] Pushing to GitHub...
git push origin main
if errorlevel 1 (
  echo.
  echo *** Push failed. If someone pushed after your pull, just re-run push.bat.
  echo.
  pause
  exit /b 1
)

echo.
echo Done. GitHub Pages will redeploy in a minute or two.
echo (The app's version stamp changes when app.js APP_VERSION / sw.js CACHE_NAME are bumped.)
echo.
pause
endlocal
