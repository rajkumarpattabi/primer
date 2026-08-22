@echo off
REM ============================================================================
REM Primer - push.bat  (ongoing safe deploy from the laptop)
REM ---------------------------------------------------------------------------
REM Correct order: COMMIT your local edits first, THEN pull --rebase (so it has
REM a clean tree to work with and picks up any mobile commits), THEN push. This
REM is what keeps the laptop and mobile routes from overwriting each other.
REM
REM FIRST TIME? Run first-push.bat (or setup-git.bat) once instead.
REM Usage:  double-click, or  push.bat "optional commit message"
REM ============================================================================
setlocal
cd /d "%~dp0"

where git >nul 2>&1
if errorlevel 1 (
  echo ERROR: Git is not installed or not on PATH. Get it: https://git-scm.com/download/win
  pause & exit /b 1
)
if not exist ".git" (
  echo This folder is not a git repo yet. Run first-push.bat once first.
  pause & exit /b 1
)
if exist ".git\index.lock" del /f /q ".git\index.lock"

git rev-parse --verify HEAD >nul 2>&1
if errorlevel 1 (
  echo No commits yet - run first-push.bat once to make the first commit.
  pause & exit /b 1
)

set "MSG=%~1"
if "%MSG%"=="" set "MSG=content: update concepts"

echo.
echo [1/4] Clearing processed (empty) inbox captures, then staging...
if exist "inbox\" for %%F in (inbox\*.md) do if /I not "%%~nxF"=="README.md" if %%~zF EQU 0 del "%%F"
git add -A

echo.
echo [2/4] Committing...
git commit -m "%MSG%"
if errorlevel 1 echo (nothing new to commit - continuing)

echo.
echo [3/4] Pulling latest (rebase; auto-stashes anything not committed)...
git pull --rebase --autostash origin main
if errorlevel 1 (
  echo.
  echo *** Pull/rebase hit a conflict. Resolve the listed files, then run:
  echo        git rebase --continue
  echo *** Nothing has been pushed yet. Fix, then re-run push.bat.
  echo.
  pause & exit /b 1
)

echo.
echo [4/4] Pushing to GitHub...
git push origin main
if errorlevel 1 (
  echo.
  echo *** Push failed. If the remote moved on, just re-run push.bat.
  echo.
  pause & exit /b 1
)

echo.
echo Done. GitHub Pages will redeploy in a minute or two.
echo Then on the phone: fully close Primer and reopen to get the update.
echo.
pause
endlocal
