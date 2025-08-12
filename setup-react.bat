@echo off
echo ========================================
echo    Red Monitor - Setup React App
echo ========================================
echo.

:: Verificar si Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js no está instalado.
    echo Por favor, descarga e instala Node.js desde: https://nodejs.org/
    pause
    exit /b 1
)

:: Verificar si npm está disponible
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm no está disponible.
    echo Por favor, reinstala Node.js desde: https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js y npm están instalados correctamente.
echo.

:: Instalar dependencias
echo Instalando dependencias de React...
npm install
if %errorlevel% neq 0 (
    echo ERROR: Falló la instalación de dependencias.
    pause
    exit /b 1
)

echo.
echo ========================================
echo    Instalación completada exitosamente
echo ========================================
echo.
echo Para ejecutar la aplicación:
echo 1. Ejecuta: npm start (para desarrollo web)
echo 2. Ejecuta: npm run electron-dev (para aplicación de escritorio)
echo.
pause