@echo off
REM Script para construir y desplegar NMC Total con Docker
REM Autor: maxiusofmaximus
REM Versión: 1.0.0

echo ========================================
echo  NMC Total - Docker Build Script
echo ========================================
echo.

REM Verificar si Docker está instalado
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Error: Docker no está instalado o no está en el PATH
    echo    Por favor instala Docker Desktop desde: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

echo ✅ Docker detectado correctamente
echo.

REM Verificar si Docker está ejecutándose
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Error: Docker no está ejecutándose
    echo    Por favor inicia Docker Desktop
    pause
    exit /b 1
)

echo ✅ Docker está ejecutándose
echo.

REM Limpiar contenedores e imágenes anteriores
echo 🧹 Limpiando contenedores e imágenes anteriores...
docker stop nmc-total-app 2>nul
docker rm nmc-total-app 2>nul
docker rmi maxiusofmaximus/network-monitor:latest 2>nul
echo.

REM Construir la imagen Docker
echo 🔨 Construyendo imagen Docker...
docker build -t maxiusofmaximus/network-monitor:latest .
if %errorlevel% neq 0 (
    echo ❌ Error al construir la imagen Docker
    pause
    exit /b 1
)

echo ✅ Imagen construida exitosamente
echo.

REM Ejecutar el contenedor
echo 🚀 Iniciando contenedor...
docker run -d ^^
    --name nmc-total-app ^^
    -p 3000:3000 ^^
    --restart unless-stopped ^^
    maxiusofmaximus/network-monitor:latest

if %errorlevel% neq 0 (
    echo ❌ Error al iniciar el contenedor
    pause
    exit /b 1
)

echo ✅ Contenedor iniciado exitosamente
echo.
echo 🌐 La aplicación está disponible en: http://localhost:3000
echo.
echo Comandos útiles:
echo   docker logs nmc-total-app          # Ver logs
echo   docker stop nmc-total-app          # Detener aplicación
echo   docker start nmc-total-app         # Iniciar aplicación
echo   docker restart nmc-total-app       # Reiniciar aplicación
echo.
echo ========================================
echo  ✅ Despliegue completado exitosamente
echo ========================================
echo.
pause