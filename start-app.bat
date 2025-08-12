@echo off
setlocal enabledelayedexpansion

echo ========================================
echo   Red Monitor - Sistema Optimizado
echo ========================================
echo.

REM Limpiar procesos previos
echo [1/5] Limpiando procesos anteriores...
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im electron.exe >nul 2>&1
timeout /t 2 /nobreak > nul

REM Verificar dependencias
echo [2/5] Verificando dependencias...
if not exist node_modules (
    echo Instalando dependencias...
    npm install --silent
)

REM Encontrar puerto disponible
echo [3/5] Buscando puerto disponible...
set PORT=3000
for /l %%i in (3000,1,3010) do (
    netstat -an | find ":%%i " >nul
    if errorlevel 1 (
        set PORT=%%i
        goto :found_port
    )
)
:found_port
echo Puerto disponible encontrado: !PORT!

REM Configurar variables de entorno para optimización
set ELECTRON_DISABLE_SECURITY_WARNINGS=true
set ELECTRON_NO_ATTACH_CONSOLE=true
set NODE_ENV=development
set PORT=!PORT!
set BROWSER=none
set GENERATE_SOURCEMAP=false

REM Iniciar React con puerto específico
echo [4/5] Iniciando servidor React optimizado en puerto !PORT!...
start /B cmd /c "set PORT=!PORT! && npm start >nul 2>&1"

REM Esperar a que React se inicie
echo [5/5] Esperando inicialización del servidor...
for /l %%i in (1,1,30) do (
    curl -s http://localhost:!PORT! >nul 2>&1
    if not errorlevel 1 (
        echo Servidor React listo en puerto !PORT!
        goto :start_electron
    )
    timeout /t 1 /nobreak > nul
)

:start_electron
echo.
echo Iniciando Electron optimizado...
set ELECTRON_DEV_URL=http://localhost:!PORT!
npm run electron

echo.
echo Aplicación finalizada.
pause