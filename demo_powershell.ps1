# Demo Script - Red Monitor PowerShell
# Ejemplo de uso del script de monitoreo de red

Write-Host "🛡️  DEMO - RED MONITOR POWERSHELL" -ForegroundColor Green
Write-Host "=" * 50 -ForegroundColor Gray
Write-Host ""

Write-Host "Este script demuestra las capacidades del monitor de red:" -ForegroundColor Cyan
Write-Host "1. Escaneo único de conexiones" -ForegroundColor White
Write-Host "2. Detección de procesos sospechosos" -ForegroundColor White
Write-Host "3. Análisis de riesgo automatizado" -ForegroundColor White
Write-Host "4. Generación de reportes" -ForegroundColor White
Write-Host ""

# Verificar permisos de administrador
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")

if (-not $isAdmin) {
    Write-Host "⚠️  ADVERTENCIA: No se está ejecutando como administrador" -ForegroundColor Yellow
    Write-Host "   Algunos datos pueden no estar disponibles" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "🔍 Iniciando escaneo de demostración..." -ForegroundColor Cyan
Write-Host ""

# Ejecutar el script principal
try {
    & ".\network_monitor.ps1" -ExportJson
    
    Write-Host ""
    Write-Host "✅ Demo completado exitosamente" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Próximos pasos recomendados:" -ForegroundColor Cyan
    Write-Host "   • Revisar el reporte generado" -ForegroundColor White
    Write-Host "   • Ejecutar la aplicación GUI: python app.py" -ForegroundColor White
    Write-Host "   • Para monitoreo continuo: .\network_monitor.ps1 -Continuous" -ForegroundColor White
    
} catch {
    Write-Host "❌ Error durante la ejecución: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Verifique que el archivo network_monitor.ps1 existe" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Presione cualquier tecla para continuar..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")