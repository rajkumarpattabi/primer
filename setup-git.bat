@echo off
REM ============================================================================
REM Primer - setup-git.bat  (RUN ONCE, first time - also safe to re-run to fix)
REM ---------------------------------------------------------------------------
REM Initialises this folder as a git repo, sets your identity if missing,
REM makes the first commit, and pushes to GitHub. Safe to re-run if a previous
REM attempt half-finished. After this, use push.bat for every future update.
REM
REM BEFORE running: create an EMPTY public repo named "primer" on github.com
REM   (New repository -> name: primer -> Public -> Create; add nothing else).
REM ============================================================================
setlocal
cd /d "%~dp0"

where git >nul 2>&1
if errorlevel 1 (
  echo ERROR: Git is not installed. Get it from https://git-scm.com/download/win
  pause & exit /b 1
)

REM --- clear a stale lock from any interrupted attempt ---
if exist ".git\index.lock" del /f /q ".git\index.lock"

REM --- init if needed ---
if not exist ".git" git init
git branch -M main 2>nul

REM --- set identity if not configured (edit these if you prefer) ---
git config user.email >nul 2>&1
if errorlevel 1 (
  echo Setting git identity (one time). Edit setup-git.bat to change these.
  git config --global user.name "Rajkumar Pattabi"
  git config --global user.email "rajkumar.com@gmail.com"
)

REM --- ensure the remote exists ---
set "REMOTE=%~1"
git remote get-url origin >nul 2>&1
if not errorlevel 1 goto HAVEREMOTE
if "%REMOTE%"=="" set /p REMOTE=Paste your repo URL (e.g. https://github.com/rajkumarpattabi/primer.git):
if "%REMOTE%"=="" ( echo No URL entered. Aborting. & pause & exit /b 1 )
git remote add origin "%REMOTE%"
:HAVEREMOTE
echo Remote:
git remote get-url origin

REM --- first commit (skip cleanly if one already exists) ---
git rev-parse --verify HEAD >nul 2>&1
if not errorlevel 1 goto HAVECOMMIT
git add -A
git commit -m "Primer v1: initial commit"
if errorlevel 1 (
  echo.
  echo Commit failed. Check your git identity:
  git config user.name
  git config user.email
  pause & exit /b 1
)
:HAVECOMMIT

echo.
echo Pushing to GitHub (a sign-in window may appear - sign in there)...
git push -u origin main
if errorlevel 1 (
  echo.
  echo *** Push failed. Check that the GitHub repo exists and is EMPTY,
  echo *** the URL is correct, and you completed the sign-in.
  echo.
  pause & exit /b 1
)

echo.
echo Success! Now enable hosting:
echo   GitHub repo -^> Settings -^> Pages -^> Source: main branch, / (root) -^> Save
echo   App URL:  https://^<your-username^>.github.io/primer/
echo.
echo From now on, just use push.bat for updates.
echo.
pause
endlocal
