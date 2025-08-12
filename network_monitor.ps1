# NMC Total - Network Monitor And Cleaner
# Script PowerShell para Detección de Malware y Monitoreo avanzado de conexiones de red y procesos

param(
    [switch]$Continuous,
    [int]$Interval = 5,
    [switch]$ExportJson,
    [string]$OutputFile = "network_scan_$(Get-Date -Format 'yyyyMMdd_HHmmss').json"
)

# Función para obtener información geográfica básica de IP
function Get-IPLocation {
    param([string]$IP)
    
    # Verificar si es IP privada
    if ($IP -match '^(10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.|127\.|::1|localhost)') {
        return "Local/Privada"
    }
    
    # Rangos geográficos aproximados (simplificado)
    $firstOctet = [int]($IP -split '\.')[0]
    switch ($firstOctet) {
        {$_ -ge 1 -and $_ -le 50} { return "América del Norte" }
        {$_ -ge 51 -and $_ -le 100} { return "Europa" }
        {$_ -ge 101 -and $_ -le 150} { return "Asia" }
        {$_ -ge 151 -and $_ -le 200} { return "América del Sur" }
        default { return "Otros/Desconocido" }
    }
}

# Función para analizar nivel de riesgo
function Get-RiskLevel {
    param(
        [string]$ProcessName,
        [string]$ProcessPath,
        [string]$RemoteIP,
        [int]$RemotePort,
        [string]$LocalPort
    )
    
    $riskLevel = 0
    $reasons = @()
    
    # Verificar procesos sospechosos
    $suspiciousProcesses = @('temp', 'tmp', 'unknown', 'svchost', 'rundll32', 'regsvr32')
    if ($suspiciousProcesses | Where-Object { $ProcessName -like "*$_*" }) {
        $riskLevel += 2
        $reasons += "Proceso potencialmente sospechoso"
    }
    
    # Verificar puertos sospechosos
    $suspiciousPorts = @(1337, 31337, 4444, 5555, 6666, 7777, 8888, 9999, 12345, 54321)
    if ($RemotePort -in $suspiciousPorts) {
        $riskLevel += 3
        $reasons += "Puerto comúnmente usado por malware ($RemotePort)"
    }
    
    # Verificar conexiones externas desde procesos del sistema
    $systemProcesses = @('notepad', 'calc', 'mspaint', 'wordpad', 'write')
    if ($systemProcesses -contains $ProcessName.ToLower() -and $RemoteIP -notmatch '^(10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.|127\.)') {
        $riskLevel += 4
        $reasons += "Proceso del sistema con conexión externa inusual"
    }
    
    # Verificar procesos sin ruta válida
    if ([string]::IsNullOrEmpty($ProcessPath) -or $ProcessPath -eq "Unknown") {
        $riskLevel += 1
        $reasons += "Proceso sin ruta identificable"
    }
    
    # Verificar procesos en ubicaciones temporales
    if ($ProcessPath -match '(temp|tmp|appdata\\local\\temp)') {
        $riskLevel += 3
        $reasons += "Proceso ejecutándose desde directorio temporal"
    }
    
    return @{
        Level = [Math]::Min($riskLevel, 5)
        Reasons = $reasons -join "; "
    }
}

# Función principal de escaneo
function Start-NetworkScan {
    Write-Host "🔍 Iniciando escaneo de red..." -ForegroundColor Cyan
    Write-Host "⏰ $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
    Write-Host "-" * 80 -ForegroundColor Gray
    
    $results = @()
    $suspiciousCount = 0
    
    try {
        # Obtener conexiones TCP establecidas
        $connections = Get-NetTCPConnection | Where-Object { $_.State -eq "Established" }
        
        foreach ($conn in $connections) {
            try {
                # Obtener información del proceso
                $process = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
                
                $processName = if ($process) { $process.ProcessName } else { "Unknown" }
                $processPath = if ($process) { $process.Path } else { "Unknown" }
                
                # Analizar riesgo
                $risk = Get-RiskLevel -ProcessName $processName -ProcessPath $processPath -RemoteIP $conn.RemoteAddress -RemotePort $conn.RemotePort -LocalPort $conn.LocalPort
                
                # Obtener ubicación geográfica
                $location = Get-IPLocation -IP $conn.RemoteAddress
                
                $connectionInfo = [PSCustomObject]@{
                    Timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
                    PID = $conn.OwningProcess
                    ProcessName = $processName
                    ProcessPath = $processPath
                    Protocol = "TCP"
                    LocalAddress = $conn.LocalAddress
                    LocalPort = $conn.LocalPort
                    RemoteAddress = $conn.RemoteAddress
                    RemotePort = $conn.RemotePort
                    State = $conn.State
                    Location = $location
                    RiskLevel = $risk.Level
                    RiskReasons = $risk.Reasons
                    IsSuspicious = $risk.Level -ge 2
                }
                
                $results += $connectionInfo
                
                # Mostrar conexiones sospechosas en tiempo real
                if ($risk.Level -ge 2) {
                    $suspiciousCount++
                    $riskColor = switch ($risk.Level) {
                        {$_ -ge 4} { "Red" }
                        {$_ -eq 3} { "Yellow" }
                        default { "Magenta" }
                    }
                    
                    Write-Host "⚠️  CONEXIÓN SOSPECHOSA DETECTADA" -ForegroundColor $riskColor
                    Write-Host "   PID: $($conn.OwningProcess) | Proceso: $processName" -ForegroundColor White
                    Write-Host "   IP Remota: $($conn.RemoteAddress):$($conn.RemotePort) ($location)" -ForegroundColor White
                    Write-Host "   Nivel de Riesgo: $($risk.Level)/5" -ForegroundColor $riskColor
                    Write-Host "   Razón: $($risk.Reasons)" -ForegroundColor Gray
                    Write-Host "-" * 60 -ForegroundColor Gray
                }
                
            } catch {
                Write-Warning "Error procesando conexión PID $($conn.OwningProcess): $($_.Exception.Message)"
            }
        }
        
        # Mostrar resumen
        Write-Host "\n📊 RESUMEN DEL ESCANEO" -ForegroundColor Green
        Write-Host "   Total de conexiones: $($results.Count)" -ForegroundColor White
        Write-Host "   Conexiones sospechosas: $suspiciousCount" -ForegroundColor $(if($suspiciousCount -gt 0) {'Red'} else {'Green'})
        Write-Host "   Procesos únicos: $($results | Select-Object -Unique ProcessName | Measure-Object | Select-Object -ExpandProperty Count)" -ForegroundColor White
        Write-Host "   Conexiones externas: $($results | Where-Object {$_.Location -ne 'Local/Privada'} | Measure-Object | Select-Object -ExpandProperty Count)" -ForegroundColor White
        
        # Exportar a JSON si se solicita
        if ($ExportJson) {
            $results | ConvertTo-Json -Depth 3 | Out-File -FilePath $OutputFile -Encoding UTF8
            Write-Host "\n💾 Resultados exportados a: $OutputFile" -ForegroundColor Cyan
        }
        
        return $results
        
    } catch {
        Write-Error "Error durante el escaneo: $($_.Exception.Message)"
        return @()
    }
}

# Función para monitoreo continuo
function Start-ContinuousMonitoring {
    Write-Host "🔄 Iniciando monitoreo continuo (Intervalo: $Interval segundos)" -ForegroundColor Green
    Write-Host "   Presiona Ctrl+C para detener" -ForegroundColor Yellow
    Write-Host "=" * 80 -ForegroundColor Gray
    
    $iteration = 1
    
    while ($true) {
        try {
            Write-Host "\n🔍 Iteración #$iteration - $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Cyan
            
            $results = Start-NetworkScan
            $suspicious = $results | Where-Object { $_.IsSuspicious }
            
            if ($suspicious.Count -gt 0) {
                Write-Host "\n🚨 ALERTA: $($suspicious.Count) conexiones sospechosas detectadas" -ForegroundColor Red
                
                # Mostrar top 5 más peligrosas
                $topThreats = $suspicious | Sort-Object RiskLevel -Descending | Select-Object -First 5
                foreach ($threat in $topThreats) {
                    Write-Host "   • PID $($threat.PID): $($threat.ProcessName) → $($threat.RemoteAddress):$($threat.RemotePort) [Riesgo: $($threat.RiskLevel)/5]" -ForegroundColor Yellow
                }
            } else {
                Write-Host "\n✅ No se detectaron conexiones sospechosas" -ForegroundColor Green
            }
            
            $iteration++
            Start-Sleep -Seconds $Interval
            
        } catch {
            Write-Error "Error en monitoreo continuo: $($_.Exception.Message)"
            Start-Sleep -Seconds $Interval
        }
    }
}

# Función para generar reporte detallado
function Export-DetailedReport {
    param([array]$ScanResults)
    
    $reportFile = "detailed_report_$(Get-Date -Format 'yyyyMMdd_HHmmss').txt"
    
    $report = @"
🛡️  RED MONITOR - REPORTE DETALLADO DE SEGURIDAD
================================================================
Generado: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
Equipo: $env:COMPUTERNAME
Usuario: $env:USERNAME

📊 RESUMEN EJECUTIVO
================================================================
Total de conexiones analizadas: $($ScanResults.Count)
Conexiones sospechosas: $($ScanResults | Where-Object IsSuspicious | Measure-Object | Select-Object -ExpandProperty Count)
Nivel de riesgo promedio: $(($ScanResults | Measure-Object RiskLevel -Average).Average.ToString('F2'))

🔍 CONEXIONES DE ALTO RIESGO (Nivel 4-5)
================================================================
"@
    
    $highRisk = $ScanResults | Where-Object { $_.RiskLevel -ge 4 } | Sort-Object RiskLevel -Descending
    if ($highRisk.Count -gt 0) {
        foreach ($conn in $highRisk) {
            $report += "`n🔴 RIESGO ALTO - Nivel $($conn.RiskLevel)/5`n"
            $report += "   PID: $($conn.PID) | Proceso: $($conn.ProcessName)`n"
            $report += "   Ruta: $($conn.ProcessPath)`n"
            $report += "   Conexión: $($conn.RemoteAddress):$($conn.RemotePort) ($($conn.Location))`n"
            $report += "   Razones: $($conn.RiskReasons)`n"
            $report += "   Recomendación: INVESTIGAR INMEDIATAMENTE`n"
            $report += "-" * 60 + "`n"
        }
    } else {
        $report += "`n✅ No se detectaron conexiones de alto riesgo`n"
    }
    
    $report += "`n🟡 CONEXIONES DE RIESGO MEDIO (Nivel 2-3)`n"
    $report += "================================================================`n"
    
    $mediumRisk = $ScanResults | Where-Object { $_.RiskLevel -ge 2 -and $_.RiskLevel -le 3 } | Sort-Object RiskLevel -Descending
    if ($mediumRisk.Count -gt 0) {
        foreach ($conn in $mediumRisk) {
            $report += "`n🟡 RIESGO MEDIO - Nivel $($conn.RiskLevel)/5`n"
            $report += "   PID: $($conn.PID) | Proceso: $($conn.ProcessName)`n"
            $report += "   Conexión: $($conn.RemoteAddress):$($conn.RemotePort) ($($conn.Location))`n"
            $report += "   Razones: $($conn.RiskReasons)`n"
            $report += "-" * 40 + "`n"
        }
    } else {
        $report += "`n✅ No se detectaron conexiones de riesgo medio`n"
    }
    
    $report += "`n📈 ESTADÍSTICAS ADICIONALES`n"
    $report += "================================================================`n"
    $report += "Distribución por ubicación geográfica:`n"
    
    $locationStats = $ScanResults | Group-Object Location | Sort-Object Count -Descending
    foreach ($stat in $locationStats) {
        $report += "   $($stat.Name): $($stat.Count) conexiones`n"
    }
    
    $report += "`nProcesos más activos:`n"
    $processStats = $ScanResults | Group-Object ProcessName | Sort-Object Count -Descending | Select-Object -First 10
    foreach ($stat in $processStats) {
        $report += "   $($stat.Name): $($stat.Count) conexiones`n"
    }
    
    $report += "`n🔧 COMANDOS RECOMENDADOS PARA INVESTIGACIÓN`n"
    $report += "================================================================`n"
    $report += "Para analizar procesos sospechosos:`n"
    $report += "   Get-Process -Id <PID> | Select-Object *`n"
    $report += "   tasklist /svc /fi `"PID eq <PID>`"`n"
    $report += "`nPara terminar proceso sospechoso:`n"
    $report += "   taskkill /PID <PID> /F`n"
    $report += "`nPara verificar en VirusTotal:`n"
    $report += "   https://www.virustotal.com/gui/ip-address/<IP>`n"
    
    $report | Out-File -FilePath $reportFile -Encoding UTF8
    Write-Host "\n📄 Reporte detallado generado: $reportFile" -ForegroundColor Green
}

# Ejecución principal
Clear-Host
Write-Host "🛡️  NMC TOTAL - NETWORK MONITOR AND CLEANER" -ForegroundColor Green
Write-Host "   Análisis avanzado de conexiones de red y limpieza del sistema" -ForegroundColor Gray
Write-Host "=" * 50 -ForegroundColor Gray

if ($Continuous) {
    Start-ContinuousMonitoring
} else {
    $scanResults = Start-NetworkScan
    
    if ($scanResults.Count -gt 0) {
        # Generar reporte detallado
        Export-DetailedReport -ScanResults $scanResults
        
        # Mostrar recomendaciones finales
        $suspicious = $scanResults | Where-Object IsSuspicious
        if ($suspicious.Count -gt 0) {
            Write-Host "\n🚨 RECOMENDACIONES DE SEGURIDAD:" -ForegroundColor Red
            Write-Host "   1. Investigue los procesos marcados como sospechosos" -ForegroundColor Yellow
            Write-Host "   2. Verifique las IPs en VirusTotal o servicios similares" -ForegroundColor Yellow
            Write-Host "   3. Considere ejecutar un análisis completo de antivirus" -ForegroundColor Yellow
            Write-Host "   4. Revise las tareas programadas y entradas de registro" -ForegroundColor Yellow
        }
    }
}

Write-Host "\n✅ Escaneo completado." -ForegroundColor Green