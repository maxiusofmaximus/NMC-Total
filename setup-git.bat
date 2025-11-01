@echo off
setlocal enabledelayedexpansion

echo ========================================
echo   NMC Total - Git Repository Setup
echo ========================================
echo.

REM Initialize Git repository if not exists
if not exist .git (
    echo [1/6] Initializing Git repository...
    git init
    echo Git repository initialized.
) else (
    echo [1/6] Git repository already exists.
)

echo.
echo [2/6] Adding remote origin...
git remote remove origin 2>nul
git remote add origin https://github.com/maxiusofmaximus/NMC-Total.git
echo Remote origin added.

echo.
echo [3/6] Setting up Git configuration...
git config user.name "maxiusofmaximus"
git config user.email "maxiusofmaximus@github.com"
git config init.defaultBranch main
echo Git configuration completed.

echo.
echo [4/6] Adding all files to staging...
git add .
echo Files added to staging.

echo.
echo [5/6] Creating initial commit...
git commit -m "Initial commit: NMC Total - Network Monitor And Cleaner

- Renamed project from Red Monitor to NMC Total
- Added commercial license
- Implemented security configurations
- Added npm security settings
- Configured GitHub Actions for security scanning
- Added Dependabot for dependency updates
- Implemented Content Security Policy
- Added comprehensive security documentation"
echo Initial commit created.

echo.
echo [6/6] Setting up main branch...
git branch -M main
echo Main branch configured.

echo.
echo ========================================
echo   Setup completed successfully!
echo ========================================
echo.
echo Next steps:
echo 1. Create the repository on GitHub: https://github.com/maxiusofmaximus/NMC-Total
echo 2. Run: git push -u origin main
echo 3. Enable security features in GitHub repository settings
echo.
echo Repository URL: https://github.com/maxiusofmaximus/NMC-Total
echo.
pause