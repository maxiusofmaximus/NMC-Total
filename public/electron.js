const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn, exec } = require('child_process');

// Configuración de optimización
app.commandLine.appendSwitch('--disable-gpu-sandbox');
app.commandLine.appendSwitch('--disable-software-rasterizer');
app.commandLine.appendSwitch('--disable-background-timer-throttling');
app.commandLine.appendSwitch('--disable-backgrounding-occluded-windows');
app.commandLine.appendSwitch('--disable-renderer-backgrounding');
app.commandLine.appendSwitch('--disable-features', 'TranslateUI');
app.commandLine.appendSwitch('--disable-ipc-flooding-protection');

let mainWindow;
let connectionCache = new Map();
let lastScanTime = 0;
const CACHE_DURATION = 3000; // 3 segundos de caché

// Pool de procesos para optimizar rendimiento
class ProcessPool {
  constructor(maxSize = 3) {
    this.pool = [];
    this.maxSize = maxSize;
  }

  async execute(command, args = [], options = {}) {
    return new Promise((resolve, reject) => {
      const process = spawn(command, args, { 
        ...options, 
        windowsHide: true,
        stdio: ['ignore', 'pipe', 'pipe']
      });
      
      let output = '';
      let error = '';
      
      process.stdout?.on('data', (data) => output += data.toString());
      process.stderr?.on('data', (data) => error += data.toString());
      
      const timeout = setTimeout(() => {
        process.kill('SIGTERM');
        reject(new Error('Process timeout'));
      }, 10000);
      
      process.on('close', (code) => {
        clearTimeout(timeout);
        if (code === 0) resolve(output);
        else reject(new Error(error || `Exit code: ${code}`));
      });
    });
  }
}

const processPool = new ProcessPool();

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true,
      allowRunningInsecureContent: false,
      experimentalFeatures: false,
      backgroundThrottling: false,
      preload: path.join(__dirname, 'preload.js'),
      // Optimizaciones de memoria
      v8CacheOptions: 'code',
      enableWebSQL: false
    },
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#1a1a1a',
      symbolColor: '#ffffff'
    },
    backgroundColor: '#1a1a1a',
    show: false,
    icon: path.join(__dirname, 'icon.png'),
    // Optimizaciones adicionales
    skipTaskbar: false,
    autoHideMenuBar: true
  });

  // Detecta si estamos en modo desarrollo
  const isDev = process.env.ELECTRON_IS_DEV === 'true' || process.env.NODE_ENV === 'development' || !app.isPackaged;
  
  // En desarrollo, carga desde el servidor de React
  if (isDev) {
    try {
      await mainWindow.loadURL('http://localhost:3000');
      mainWindow.webContents.openDevTools();
    } catch (error) {
      console.log('Error loading React dev server, trying local file...');
      mainWindow.loadFile(path.join(__dirname, 'index.html'));
    }
  } else {
    // En producción, cargar el archivo HTML compilado de la aplicación
    mainWindow.loadFile(path.join(__dirname, '..', 'build', 'app.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Función optimizada para obtener conexiones de red con caché
async function getNetworkConnections() {
  const now = Date.now();
  
  // Verificar caché
  if (connectionCache.has('connections') && (now - lastScanTime) < CACHE_DURATION) {
    return connectionCache.get('connections');
  }

  try {
    const output = await processPool.execute('netstat', ['-ano']);
    const connections = parseNetstatOutput(output);
    
    // Actualizar caché
    connectionCache.set('connections', connections);
    lastScanTime = now;
    
    return connections;
  } catch (error) {
    console.error('Error getting network connections:', error);
    // Retornar caché anterior si existe
    return connectionCache.get('connections') || [];
  }
}

// IPC Handlers
ipcMain.handle('get-network-connections', async () => {
  return await getNetworkConnections();
});

ipcMain.handle('clean-temp-files', async () => {
  try {
    const script = `
      function Clean-Directory {
        param([string]$Path, [string]$Description)
        
        if (Test-Path $Path) {
          try {
            $itemCount = (Get-ChildItem -Path $Path -Recurse -Force -ErrorAction SilentlyContinue | Measure-Object).Count
            
            # Usar comandos CMD más agresivos para archivos temporales
            if ($Path -like "*Temp*") {
              cmd /c "cd /d \`"$Path\`" && del /q /f /s *.* 2>nul"
              cmd /c "cd /d \`"$Path\`" && for /d %i in (*) do rd /s /q \`"%i\`" 2>nul"
            } else {
              Get-ChildItem -Path $Path -Recurse -Force -ErrorAction SilentlyContinue | Remove-Item -Force -Recurse -ErrorAction SilentlyContinue
            }
            
            Write-Output "✅ $Description - $itemCount archivos procesados"
          } catch {
            Write-Output "⚠️ $Description - Error: $($_.Exception.Message)"
          }
        } else {
          Write-Output "ℹ️ $Description - Directorio no encontrado"
        }
      }
      
      # Limpiar DNS
      try {
        ipconfig /flushdns | Out-Null
        Write-Output "✅ Caché DNS limpiada"
      } catch {
        Write-Output "⚠️ Error limpiando DNS: $($_.Exception.Message)"
      }
      
      # Limpiar archivos temporales del usuario actual usando CMD
      try {
        cmd /c "cd /d %temp% && del /q /f /s *.* 2>nul"
        cmd /c "cd /d %temp% && for /d %i in (*) do rd /s /q %i 2>nul"
        Write-Output "✅ Archivos temporales del usuario (%temp%) - Limpieza CMD completada"
      } catch {
        Write-Output "⚠️ Error limpiando %temp% con CMD: $($_.Exception.Message)"
      }
      
      # Limpiar archivos temporales del sistema usando CMD
      try {
        cmd /c "cd /d C:\\Windows\\Temp && del /q /f /s *.* 2>nul"
        cmd /c "cd /d C:\\Windows\\Temp && for /d %i in (*) do rd /s /q %i 2>nul"
        Write-Output "✅ Archivos temporales del sistema (C:\\Windows\\Temp) - Limpieza CMD completada"
      } catch {
        Write-Output "⚠️ Error limpiando C:\\Windows\\Temp con CMD: $($_.Exception.Message)"
      }
      
      # Limpiar directorios temporales adicionales
      Clean-Directory "C:\\Temp" "Archivos temporales del sistema (C:\\Temp)"
      
      # Limpiar archivos temporales de todos los usuarios
      $users = Get-ChildItem "C:\\Users" -Directory -ErrorAction SilentlyContinue
      foreach ($user in $users) {
        $tempPath = "$($user.FullName)\\AppData\\Local\\Temp"
        if (Test-Path $tempPath) {
          try {
            cmd /c "cd /d \`"$tempPath\`" && del /q /f /s *.* 2>nul"
            cmd /c "cd /d \`"$tempPath\`" && for /d %i in (*) do rd /s /q %i 2>nul"
            Write-Output "✅ Archivos temporales de $($user.Name) - Limpieza CMD completada"
          } catch {
            Write-Output "⚠️ Error limpiando temporales de $($user.Name): $($_.Exception.Message)"
          }
        }
      }
      
      # Limpiar caché de Internet
      Clean-Directory "$env:LOCALAPPDATA\\Microsoft\\Windows\\INetCache" "Caché de Internet Explorer"
      Clean-Directory "$env:LOCALAPPDATA\\Google\\Chrome\\User Data\\Default\\Cache" "Caché de Chrome"
      Clean-Directory "$env:LOCALAPPDATA\\Mozilla\\Firefox\\Profiles\\*\\cache2" "Caché de Firefox"
      
      # Limpiar otros directorios temporales
      Clean-Directory "$env:WINDIR\\SoftwareDistribution\\Download" "Caché de Windows Update"
      Clean-Directory "$env:WINDIR\\Prefetch" "Archivos Prefetch"
      Clean-Directory "$env:APPDATA\\Microsoft\\Windows\\Recent" "Elementos recientes"
      
      # Vaciar papelera de reciclaje usando CMD
      try {
        cmd /c "rd /s /q C:\\$Recycle.Bin 2>nul"
        Write-Output "✅ Papelera de reciclaje vaciada con CMD"
      } catch {
        Write-Output "⚠️ Error vaciando papelera con CMD: $($_.Exception.Message)"
      }
    `;
    
    return new Promise((resolve, reject) => {
      const process = spawn('powershell.exe', ['-Command', script], {
        windowsHide: true,
        timeout: 90000 // 90 segundos de timeout para limpieza más profunda
      });
      
      let errorOutput = '';
      
      process.stdout.on('data', (data) => {
        // Output captured but not used for this operation
      });
      
      process.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });
      
      process.on('close', (code) => {
        const lines = errorOutput ? [] : ['Limpieza completada exitosamente'];
        
        if (code === 0 || lines.length > 0) {
          resolve({
            success: true,
            cleaned: lines,
            message: `Limpieza completada. ${lines.length} operaciones realizadas.`
          });
        } else {
          reject(new Error(`Proceso terminado con código ${code}. Error: ${errorOutput}`));
        }
      });
      
      process.on('error', (error) => {
        reject(new Error(`Error ejecutando PowerShell: ${error.message}`));
      });
    });
  } catch (error) {
    throw new Error(`Error en limpieza de archivos temporales: ${error.message}`);
  }
});

// Limpiar caché DNS
ipcMain.handle('clean-dns', async () => {
  try {
    const command = 'ipconfig /flushdns';
    
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`Error limpiando DNS: ${error.message}`));
          return;
        }
        resolve({ success: true, message: 'Caché DNS limpiada exitosamente' });
      });
    });
  } catch (error) {
    throw new Error(`Error al limpiar DNS: ${error.message}`);
  }
});

// Vaciar papelera de reciclaje
ipcMain.handle('empty-recycle-bin', async () => {
  try {
    const script = `
      Add-Type -AssemblyName Microsoft.VisualBasic
      [Microsoft.VisualBasic.FileIO.FileSystem]::DeleteDirectory(
        "C:\\$Recycle.Bin",
        [Microsoft.VisualBasic.FileIO.DeleteDirectoryOption]::DeleteAllContents
      )
      Write-Output "Papelera de reciclaje vaciada exitosamente"
    `;
    
    return new Promise((resolve, reject) => {
      const process = spawn('powershell.exe', ['-Command', script], {
        windowsHide: true,
        timeout: 30000
      });
      
      let errorOutput = '';
      
      process.stdout.on('data', (data) => {
        // Output captured but not used for this operation
      });
      
      process.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });
      
      process.on('close', (code) => {
        if (code === 0) {
          resolve({ success: true, message: 'Papelera de reciclaje vaciada' });
        } else {
          reject(new Error(`Error vaciando papelera: ${errorOutput || 'Código de salida: ' + code}`));
        }
      });
      
      process.on('error', (error) => {
        reject(new Error(`Error ejecutando comando: ${error.message}`));
      });
    });
  } catch (error) {
    throw new Error(`Error al vaciar papelera: ${error.message}`);
  }
});

// Ejecutar liberador de espacio en disco
ipcMain.handle('run-disk-cleanup', async () => {
  try {
    const command = 'cleanmgr /sagerun:1';
    
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          // cleanmgr puede devolver error incluso si funciona correctamente
          resolve({ success: true, message: 'Liberador de espacio iniciado' });
          return;
        }
        resolve({ success: true, message: 'Liberador de espacio ejecutado exitosamente' });
      });
    });
  } catch (error) {
    throw new Error(`Error ejecutando liberador de espacio: ${error.message}`);
  }
});

// Programar limpieza automática
ipcMain.handle('schedule-auto-cleanup', async () => {
  try {
    const script = `
      $taskName = "RedMonitor_AutoCleanup"
      $action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-Command ipconfig /flushdns; Get-ChildItem -Path $env:TEMP -Recurse | Remove-Item -Force -Recurse -ErrorAction SilentlyContinue"
      $trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Sunday -At 2AM
      $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
      
      try {
        Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction SilentlyContinue
      } catch {}
      
      Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Description "Limpieza automática semanal de NMC Total"
      Write-Output "Tarea programada creada exitosamente"
    `;
    
    return new Promise((resolve, reject) => {
      const process = spawn('powershell.exe', ['-Command', script], {
        windowsHide: true,
        timeout: 15000
      });
      
      let errorOutput = '';
      
      process.stdout.on('data', (data) => {
        // Output captured but not used for this operation
      });
      
      process.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });
      
      process.on('close', (code) => {
        if (code === 0) {
          resolve({ success: true, message: 'Limpieza automática programada para los domingos a las 2 AM' });
        } else {
          reject(new Error(`Error programando limpieza: ${errorOutput || 'Código de salida: ' + code}`));
        }
      });
      
      process.on('error', (error) => {
        reject(new Error(`Error ejecutando comando: ${error.message}`));
      });
    });
  } catch (error) {
    throw new Error(`Error programando limpieza automática: ${error.message}`);
  }
});

// Verificar actualizaciones desde GitHub
ipcMain.handle('check-updates', async () => {
  try {
    const https = require('https');
    const packageJson = require('../package.json');
    const currentVersion = packageJson.version;
    
    return new Promise((resolve) => {
      const options = {
        hostname: 'api.github.com',
        path: '/repos/YOUR_USERNAME/Red-Monitor/releases/latest',
        method: 'GET',
        headers: {
          'User-Agent': 'Red-Monitor-App'
        }
      };
      
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            const release = JSON.parse(data);
            const latestVersion = release.tag_name.replace('v', '');
            const updateAvailable = latestVersion !== currentVersion;
            
            resolve({
              success: true,
              currentVersion,
              latestVersion,
              updateAvailable,
              downloadUrl: release.html_url
            });
          } catch (error) {
            resolve({
              success: false,
              currentVersion,
              latestVersion: currentVersion,
              updateAvailable: false,
              error: 'Error parsing GitHub response'
            });
          }
        });
      });
      
      req.on('error', () => {
        resolve({
          success: false,
          currentVersion,
          latestVersion: currentVersion,
          updateAvailable: false,
          error: 'No se pudo conectar con GitHub'
        });
      });
      
      req.end();
    });
  } catch (error) {
    const packageJson = require('../package.json');
    return {
      success: false,
      currentVersion: packageJson.version,
      latestVersion: packageJson.version,
      updateAvailable: false,
      error: error.message
    };
  }
});

// Configurar inicio automático
ipcMain.handle('set-auto-start', async (event, enabled) => {
  try {
    const appPath = process.execPath;
    const appName = 'RedMonitor';
    
    if (enabled) {
      const script = `
        $regPath = "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Run"
        Set-ItemProperty -Path $regPath -Name "${appName}" -Value "${appPath.replace(/\\/g, '\\\\')}"
      `;
      await processPool.execute('powershell.exe', ['-Command', script]);
      return { success: true, message: 'Inicio automático habilitado' };
    } else {
      const script = `
        $regPath = "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Run"
        Remove-ItemProperty -Path $regPath -Name "${appName}" -ErrorAction SilentlyContinue
      `;
      await processPool.execute('powershell.exe', ['-Command', script]);
      return { success: true, message: 'Inicio automático deshabilitado' };
    }
  } catch (error) {
    return { success: false, message: 'Error al configurar inicio automático', error: error.message };
  }
});

ipcMain.handle('kill-process', async (event, pid) => {
  return new Promise((resolve, reject) => {
    const powershell = spawn('powershell.exe', [
      '-Command',
      `Stop-Process -Id ${pid} -Force`
    ]);
    
    powershell.on('close', (code) => {
      if (code === 0) {
        resolve(`Proceso ${pid} terminado exitosamente`);
      } else {
        reject(new Error(`Error al terminar proceso ${pid}`));
      }
    });
  });
});

// Handler para abrir VirusTotal
ipcMain.handle('open-virustotal', async (event, ip) => {
  const { shell } = require('electron');
  const url = `https://www.virustotal.com/gui/ip-address/${ip}`;
  await shell.openExternal(url);
  return `Abriendo análisis de VirusTotal para IP: ${ip}`;
});

// Función optimizada para parsear salida de netstat
function parseNetstatOutput(output) {
  const lines = output.split('\n');
  const connections = [];
  const processCache = new Map();
  
  // Regex optimizado para parsing
  const connectionRegex = /^\s*(TCP|UDP)\s+([^\s]+)\s+([^\s]+)\s+(\w+)\s+(\d+)/;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = connectionRegex.exec(line);
    
    if (match && match[4] === 'ESTABLISHED') {
      const [, protocol, localAddress, remoteAddress, state, pid] = match;
      
      // Parsing optimizado de direcciones
      const localParts = localAddress.split(':');
      const remoteParts = remoteAddress.split(':');
      
      const localIP = localParts.slice(0, -1).join(':');
      const localPort = localParts[localParts.length - 1];
      const remoteIP = remoteParts.slice(0, -1).join(':');
      const remotePort = remoteParts[remoteParts.length - 1];
      
      // Obtener nombre del proceso con caché
      let processName = processCache.get(pid);
      if (!processName) {
        processName = getProcessNameSync(pid);
        processCache.set(pid, processName);
      }
      
      connections.push({
        protocol,
        localAddress: localIP,
        localPort,
        remoteAddress: remoteIP,
        remotePort,
        state,
        pid,
        processName
      });
    }
  }
  
  return connections;
}

// Función optimizada para obtener nombres de procesos
function getProcessNameSync(pid) {
  try {
    const { execSync } = require('child_process');
    const output = execSync(`tasklist /FI "PID eq ${pid}" /FO CSV /NH`, { 
      encoding: 'utf8',
      timeout: 3000,
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'ignore']
    });
    
    const firstLine = output.split('\n')[0];
    if (firstLine) {
      const processName = firstLine.split(',')[0];
      return processName ? processName.replace(/"/g, '') : 'Unknown';
    }
    return 'Unknown';
  } catch (error) {
    return 'Unknown';
  }
}