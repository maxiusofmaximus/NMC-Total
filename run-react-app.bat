@echo off
echo ========================================
echo    NMC Total - React + Electron
echo ========================================
echo.

:: Verificar si las dependencias están instaladas
if not exist "node_modules" (
    echo Las dependencias no están instaladas.
    echo Ejecutando instalación automática...
    echo.
    call setup-react.bat
    if %errorlevel% neq 0 (
        echo ERROR: Falló la instalación de dependencias.
        pause
        exit /b 1
    )
)

echo Iniciando NMC Total con React + Electron...
echo.
echo IMPORTANTE:
echo - La aplicación se abrirá en una ventana de Electron
echo - Para cerrar, usa Ctrl+C en esta ventana o cierra la aplicación
echo - Los logs aparecerán en esta consola
echo.

:: Configurar variable de entorno para desarrollo
set ELECTRON_IS_DEV=true

:: Iniciar React en segundo plano
echo Iniciando servidor React...
start /B npm start

:: Esperar a que React se inicie
echo Esperando a que React se inicie...
timeout /t 10 /nobreak >nul

:: Iniciar Electron
echo Iniciando Electron...
npm run electron-dev

echo.
echo NMC Total cerrado.
pause