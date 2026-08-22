@echo off
REM ============================================================================
REM Primer - first-push.bat  (RUN ONCE to complete the first-time setup)
REM ---------------------------------------------------------------------------
REM Clears any stale lock, sets your git identity, makes the FIRST commit, and
REM pushes. It verifies the commit actually happened before pushing, so it won't
REM falsely report success. After it works, use push.bat for future updates.
REM
REM A GitHub sign-in window may appear during the push - sign in there.
REM ============================================================================
setlocal
cd /d "%~dp0"

echo.
echo [1/6] Removing any stale git lock...
if exist ".git\index.lock" del /f /q ".git\index.lock"

echo.
echo [2/6] Setting your git identity...
git config --global user.name "Rajkumar Pattabi"
git config --global user.email "rajkumar.com@gmail.com"

echo.
echo [3/6] Ensuring we are on the main branch...
git branch -M main 2>nul

echo.
echo [4/6] Staging files (node_modules is ignored via .gitignore)...
git add -A
if errorlevel 1 (
  echo.
  echo *** git add failed. If it mentions index.lock, close any open git tools,
  echo *** delete  .git\index.lock  manually, and re-run this file.
  echo.
  pause & exit /b 1
)

echo.
echo [5/6] Committing...
git commit -m "Primer v1: initial commit"

REM Verify a commit now exists before we try to push.
git rev-parse --verify HEAD >nul 2>&1
if errorlevel 1 (
  echo.
  echo *** No commit was created. Most likely causes:
  echo     - a leftover .git\index.lock  ^(delete it, then re-run^)
  echo     - git identity not set        ^(this script sets it; check for errors above^)
  echo.
  pause & exit /b 1
)
echo Commit created:
git log --oneline -1

echo.
echo [6/6] Pushing to GitHub (sign in if a window appears)...
git push -u origin main
if errorlevel 1 (
  echo.
  echo *** Push failed. Check the GitHub repo "primer" exists and is EMPTY,
  echo *** you completed sign-in, and internet is connected. Then re-run.
  echo.
  pause & exit /b 1
)

echo.
echo Success! Files are on GitHub.
echo Next (one time): repo -^> Settings -^> Pages -^> Source: main branch, / (root) -^> Save
echo App URL:  https://rajkumarpattabi.github.io/primer/
echo.
echo From now on, just double-click push.bat to publish updates.
echo.
pause
endlocal
