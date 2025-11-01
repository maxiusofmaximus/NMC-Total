@echo off
echo ========================================
echo    NMC Total - Compilacion Automatica
echo ========================================
echo.

REM Verificar Node.js
echo [1/5] Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js no esta instalado
    echo Descarga desde: https://nodejs.org/
    pause
    exit /b 1
)
echo ✓ Node.js encontrado

REM Verificar npm
echo [2/5] Verificando npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm no esta disponible
    pause
    exit /b 1
)
echo ✓ npm encontrado

REM Instalar dependencias
echo [3/5] Instalando dependencias...
npm install
if %errorlevel% neq 0 (
    echo ERROR: Fallo la instalacion de dependencias
    pause
    exit /b 1
)
echo ✓ Dependencias instaladas

REM Compilar aplicacion React
echo [4/5] Compilando aplicacion React...
npm run build
if %errorlevel% neq 0 (
    echo ERROR: Fallo la compilacion de React
    pause
    exit /b 1
)
echo ✓ React compilado

REM Crear ejecutable Windows
echo [5/5] Creando ejecutable Windows...
npm run dist:win
if %errorlevel% neq 0 (
    echo ERROR: Fallo la creacion del ejecutable
    pause
    exit /b 1
)
echo ✓ Ejecutable creado

echo.
echo ========================================
echo           COMPILACION EXITOSA!
echo ========================================
echo.
echo Archivos generados:
echo - dist\NMC Total Setup 1.0.0.exe
echo.
echo Para otras plataformas:
echo - macOS: npm run dist:mac
echo - Linux: npm run dist:linux
echo.
pause