@echo off
echo ============================================
echo    Red Monitor - Detector de Malware
echo ============================================
echo.
echo Iniciando aplicacion...
echo.

REM Cambiar al directorio del script
cd /d "%~dp0"

REM Verificar si Python esta instalado
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python no esta instalado o no esta en PATH
    echo Por favor instale Python 3.6+ desde https://python.org
    pause
    exit /b 1
)

REM Ejecutar la aplicacion
echo Ejecutando Red Monitor...
python app.py

REM Si hay error, mostrar mensaje
if errorlevel 1 (
    echo.
    echo ERROR: La aplicacion no pudo iniciarse correctamente
    echo Verifique que tenga permisos de administrador
    echo.
    pause
)