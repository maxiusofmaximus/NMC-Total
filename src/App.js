import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { Monitor, Shield, Activity, Trash2, Play, Square, RefreshCw, AlertTriangle, CheckCircle, XCircle, Settings, HelpCircle, Palette } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './App.css';

// Componente optimizado para filas de conexión
const ConnectionRow = memo(({ connection, onConnectionClick, onKillProcess, getRiskColor, getRiskIcon }) => {
  const handleRowClick = useCallback(() => {
    onConnectionClick(connection);
  }, [connection, onConnectionClick]);

  const handleKillClick = useCallback((e) => {
    e.stopPropagation();
    onKillProcess(connection.pid);
  }, [connection.pid, onKillProcess]);

  const handleAnalyzeClick = useCallback((e) => {
    e.stopPropagation();
    onConnectionClick(connection);
  }, [connection, onConnectionClick]);

  return (
    <tr 
      className={`risk-${connection.risk} clickable-row`}
      onClick={handleRowClick}
      title="Haz clic para analizar en VirusTotal"
    >
      <td>
        <div className="risk-indicator" style={{ color: getRiskColor(connection.risk) }}>
          {getRiskIcon(connection.risk)}
        </div>
      </td>
      <td>{connection.protocol}</td>
      <td className="address">{connection.localAddress}:{connection.localPort}</td>
      <td className="address">{connection.remoteAddress}:{connection.remotePort}</td>
      <td><span className="state">{connection.state}</span></td>
      <td>{connection.pid}</td>
      <td className="process">{connection.processName}</td>
      <td>
        <div className="action-buttons">
          <button 
            className="action-btn info"
            onClick={handleAnalyzeClick}
            title="Analizar en VirusTotal"
          >
            🔍
          </button>
          {connection.risk !== 'safe' && (
            <button 
              className="action-btn danger"
              onClick={handleKillClick}
              title="Terminar proceso"
            >
              <XCircle size={14} />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
});

// Componente optimizado para la tabla de conexiones
const ConnectionTable = memo(({ connections, onConnectionClick, onKillProcess, getRiskColor, getRiskIcon }) => {
  return (
    <table className="connections-table">
      <thead>
        <tr>
          <th>Estado</th>
          <th>Protocolo</th>
          <th>Dirección Local</th>
          <th>Dirección Remota</th>
          <th>Estado</th>
          <th>PID</th>
          <th>Proceso</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {connections.map((conn) => (
          <ConnectionRow
            key={`${conn.pid}-${conn.localPort}-${conn.remotePort}`}
            connection={conn}
            onConnectionClick={onConnectionClick}
            onKillProcess={onKillProcess}
            getRiskColor={getRiskColor}
            getRiskIcon={getRiskIcon}
          />
        ))}
      </tbody>
    </table>
  );
});

// Componente optimizado con memoización
const App = memo(() => {
  const [activeTab, setActiveTab] = useState('connections');
  const [connections, setConnections] = useState([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cleanupResults, setCleanupResults] = useState([]);
  // const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [showLocalIPs, setShowLocalIPs] = useState(true);
  const [showExternalIPs, setShowExternalIPs] = useState(true);
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [autoStart, setAutoStart] = useState(false);
  const [autoUpdatesEnabled, setAutoUpdatesEnabled] = useState(true);
  const [currentVersion, setCurrentVersion] = useState('1.0.0');
  const [latestVersion, setLatestVersion] = useState('1.0.0');
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [cleanupOptions, setCleanupOptions] = useState({
    dns: true,
    tempFiles: true,
    recycleBin: true,
    diskCleanup: true,
    autoSchedule: false
  });
  const [cleanupFrequencyDays, setCleanupFrequencyDays] = useState(7);
  const [cleanupProgress, setCleanupProgress] = useState(0);
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('dark');

  const addLog = useCallback((message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, message, type }].slice(-100));
  }, []);

  // Función para cambiar el tema
  const changeTheme = useCallback((theme) => {
    setCurrentTheme(theme);
    if (theme === 'dark') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
    // Guardar preferencia en localStorage
    localStorage.setItem('nmc-theme', theme);
    addLog(`Tema cambiado a: ${theme === 'dark' ? 'Oscuro' : theme === 'light' ? 'Claro' : theme === 'blue' ? 'Azul' : 'Morado'}`, 'info');
  }, [addLog]);

  // Cargar tema guardado al iniciar
  useEffect(() => {
    const savedTheme = localStorage.getItem('nmc-theme') || 'dark';
    changeTheme(savedTheme);
  }, [changeTheme]);

  // Función para determinar si una IP es local
  const isLocalIP = useCallback((ip) => {
    if (!ip) return true;
    if (ip === '127.0.0.1' || ip === '::1' || ip === '0.0.0.0') return true;
    if (ip.startsWith('192.168.') || ip.startsWith('10.')) return true;
    if (ip.startsWith('172.')) {
      const secondOctet = parseInt(ip.split('.')[1]);
      return secondOctet >= 16 && secondOctet <= 31;
    }
    return false;
  }, []);

  // Filtrar conexiones según los checkboxes
  const filteredConnections = useMemo(() => {
    return connections.filter(conn => {
      const isLocal = isLocalIP(conn.remoteAddress);
      if (isLocal && !showLocalIPs) return false;
      if (!isLocal && !showExternalIPs) return false;
      return true;
    });
  }, [connections, showLocalIPs, showExternalIPs, isLocalIP]);

  // Memoizar estadísticas para evitar recálculos innecesarios
  const stats = useMemo(() => {
    const total = filteredConnections.length;
    let suspicious = 0;
    let safe = 0;

    filteredConnections.forEach(conn => {
      if (conn.risk === 'high' || conn.risk === 'medium') suspicious++;
      else safe++;
    });

    return { total, suspicious, safe };
  }, [filteredConnections]);

  // Datos para gráficos
  const chartData = useMemo(() => {
    // Distribución de riesgo
    const riskDistribution = [
      { name: 'Bajo', value: connections.filter(c => c.risk === 'low').length, color: '#10b981' },
      { name: 'Medio', value: connections.filter(c => c.risk === 'medium').length, color: '#f59e0b' },
      { name: 'Alto', value: connections.filter(c => c.risk === 'high').length, color: '#ef4444' }
    ].filter(item => item.value > 0);

    // Distribución geográfica
    const geoDistribution = connections.reduce((acc, conn) => {
      const ip = conn.remoteAddress;
      let region = 'Desconocido';
      
      if (isLocalIP(ip)) {
        region = 'Local/Privada';
      } else {
        const firstOctet = parseInt(ip.split('.')[0]);
        if (firstOctet >= 1 && firstOctet <= 50) region = 'América del Norte';
        else if (firstOctet >= 51 && firstOctet <= 100) region = 'Europa';
        else if (firstOctet >= 101 && firstOctet <= 150) region = 'Asia';
        else if (firstOctet >= 151 && firstOctet <= 200) region = 'América del Sur';
        else region = 'Otros';
      }
      
      acc[region] = (acc[region] || 0) + 1;
      return acc;
    }, {});

    const geoData = Object.entries(geoDistribution).map(([name, value]) => ({ name, value }));

    // Procesos más activos
    const processActivity = connections.reduce((acc, conn) => {
      const process = conn.processName || 'Desconocido';
      acc[process] = (acc[process] || 0) + 1;
      return acc;
    }, {});

    const processData = Object.entries(processActivity)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([name, value]) => ({ name, value }));

    // Actividad por puerto
    const portActivity = connections.reduce((acc, conn) => {
      const port = conn.remotePort;
      if (port) {
        acc[port] = (acc[port] || 0) + 1;
      }
      return acc;
    }, {});

    const portData = Object.entries(portActivity)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([name, value]) => ({ name: `Puerto ${name}`, value }));

    return {
      riskDistribution,
      geoData,
      processData,
      portData
    };
  }, [connections, isLocalIP]);



  // Función optimizada de análisis de riesgo con caché y algoritmos mejorados
  const analyzeRisk = useCallback((connection) => {
    const { remoteAddress, processName, remotePort } = connection;
    
    // Cache estático para mejorar rendimiento
    const suspiciousPorts = new Set([1337, 31337, 4444, 5555, 6666, 7777, 8888, 9999, 22, 23, 135, 139, 445]);
    const suspiciousProcesses = new Set(['notepad', 'calc', 'mspaint', 'wordpad']);
    const systemProcesses = new Set(['svchost.exe', 'system', 'winlogon.exe', 'csrss.exe', 'lsass.exe', 'services.exe']);
    
    let riskLevel = 0;
    
    // Verificación rápida de direcciones locales
    if (remoteAddress === '127.0.0.1' || remoteAddress === '::1' || remoteAddress === '0.0.0.0') {
      return 'safe';
    }
    
    const processLower = processName?.toLowerCase() || '';
    
    // Verificar proceso desconocido (optimizado)
    if (!processLower || processLower.includes('unknown') || processLower.includes('temp') || processLower.includes('tmp')) {
      riskLevel += 2;
    }
    
    // Verificación optimizada de puertos sospechosos
    const port = parseInt(remotePort);
    if (suspiciousPorts.has(port)) {
      riskLevel += 3;
    }
    
    // Verificación optimizada de IPs privadas
    const isPrivateIP = (() => {
      if (remoteAddress.startsWith('192.168.') || remoteAddress.startsWith('10.')) return true;
      if (remoteAddress.startsWith('172.')) {
        const secondOctet = parseInt(remoteAddress.split('.')[1]);
        return secondOctet >= 16 && secondOctet <= 31;
      }
      return false;
    })();
    
    if (!isPrivateIP) {
      riskLevel += 1;
    }
    
    // Verificación optimizada de procesos sospechosos
    if (!isPrivateIP && Array.from(suspiciousProcesses).some(proc => processLower.includes(proc))) {
      riskLevel += 4;
    }
    
    // Verificación optimizada de procesos del sistema
    if (systemProcesses.has(processLower)) {
      riskLevel = Math.max(0, riskLevel - 2);
    }
    
    // Determinar nivel de riesgo
    if (riskLevel >= 4) return 'high';
    if (riskLevel >= 2) return 'medium';
    return 'safe';
  }, []);

  const fetchConnections = useCallback(async (isAutoUpdate = false) => {
    if (!window.electronAPI) {
      addLog('API de Electron no disponible', 'error');
      return;
    }

    try {
      setIsLoading(true);
      const rawConnections = await window.electronAPI.getNetworkConnections();
      
      const processedConnections = rawConnections.map(conn => ({
        ...conn,
        risk: analyzeRisk(conn),
        id: `${conn.localAddress}-${conn.remoteAddress}-${conn.pid}`
      }));
      
      if (isAutoUpdate && autoUpdate) {
        // En actualización automática, agregar solo nuevas conexiones al final
        setConnections(prevConnections => {
          const existingIds = new Set(prevConnections.map(conn => conn.id));
          const newConnections = processedConnections.filter(conn => !existingIds.has(conn.id));
          
          if (newConnections.length > 0) {
            addLog(`${newConnections.length} nuevas conexiones detectadas`, 'info');
            return [...prevConnections, ...newConnections];
          }
          return prevConnections;
        });
      } else {
        // Actualización manual completa
        setConnections(processedConnections);
        addLog(`${processedConnections.length} conexiones analizadas`, 'success');
      }
      
      // setLastUpdate(Date.now());
    } catch (error) {
      addLog(`Error al obtener conexiones: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [addLog, analyzeRisk, autoUpdate]);

  const startMonitoring = () => {
    setIsMonitoring(true);
    addLog(`Monitoreo iniciado ${autoUpdate ? '(actualización automática habilitada)' : '(actualización manual)'}`, 'success');
    fetchConnections();
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
    addLog('Monitoreo detenido', 'info');
  };

  const cleanTempFiles = async () => {
    if (!window.electronAPI) {
      addLog('API de Electron no disponible', 'error');
      return;
    }

    try {
      setIsLoading(true);
      addLog('Iniciando limpieza de archivos temporales...', 'info');
      
      const results = await window.electronAPI.cleanTempFiles();
      setCleanupResults(results);
      
      addLog('Limpieza completada exitosamente', 'success');
      results.forEach(result => addLog(result, 'info'));
    } catch (error) {
      addLog(`Error en limpieza: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const executeAdvancedCleanup = async () => {
    setIsCleaningUp(true);
    setCleanupProgress(0);
    const results = [];
    
    try {
      const selectedOptions = Object.entries(cleanupOptions).filter(([key, value]) => value);
      const totalSteps = selectedOptions.length;
      let currentStep = 0;

      addLog('Iniciando limpieza avanzada del sistema...', 'info');

      for (const [option, enabled] of selectedOptions) {
        if (!enabled) continue;

        currentStep++;
        const progress = Math.round((currentStep / totalSteps) * 100);
        setCleanupProgress(progress);

        switch (option) {
          case 'dns':
            addLog('Limpiando caché DNS...', 'info');
            try {
              await window.electronAPI.cleanDNS();
              results.push('✅ Caché DNS limpiada exitosamente');
              addLog('Caché DNS limpiada', 'success');
            } catch (error) {
              results.push('❌ Error al limpiar caché DNS');
              addLog(`Error al limpiar DNS: ${error.message}`, 'error');
            }
            break;

          case 'tempFiles':
            addLog('Eliminando archivos temporales...', 'info');
            try {
              const result = await window.electronAPI.cleanTempFiles();
              results.push(`✅ Archivos temporales eliminados: ${result.cleaned?.length || 0} ubicaciones`);
              addLog('Archivos temporales eliminados', 'success');
            } catch (error) {
              results.push('❌ Error al eliminar archivos temporales');
              addLog(`Error al limpiar temporales: ${error.message}`, 'error');
            }
            break;

          case 'recycleBin':
            addLog('Vaciando papelera de reciclaje...', 'info');
            try {
              await window.electronAPI.emptyRecycleBin();
              results.push('✅ Papelera de reciclaje vaciada');
              addLog('Papelera de reciclaje vaciada', 'success');
            } catch (error) {
              results.push('❌ Error al vaciar papelera de reciclaje');
              addLog(`Error al vaciar papelera: ${error.message}`, 'error');
            }
            break;

          case 'diskCleanup':
            addLog('Ejecutando liberador de espacio...', 'info');
            try {
              await window.electronAPI.runDiskCleanup();
              results.push('✅ Liberador de espacio ejecutado');
              addLog('Liberador de espacio completado', 'success');
            } catch (error) {
              results.push('❌ Error al ejecutar liberador de espacio');
              addLog(`Error en liberador de espacio: ${error.message}`, 'error');
            }
            break;

          case 'autoSchedule':
            addLog('Configurando limpieza automática...', 'info');
            try {
              await window.electronAPI.scheduleAutoCleanup();
              results.push('✅ Limpieza automática programada');
              addLog('Limpieza automática configurada', 'success');
            } catch (error) {
              results.push('❌ Error al programar limpieza automática');
              addLog(`Error al programar limpieza: ${error.message}`, 'error');
            }
            break;
            
          default:
            addLog(`Opción de limpieza desconocida: ${option}`, 'warning');
            break;
        }

        // Simular tiempo de procesamiento
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      setCleanupResults(results);
      addLog(`Limpieza avanzada completada. ${results.length} operaciones realizadas`, 'success');
      
    } catch (error) {
      addLog(`Error en limpieza avanzada: ${error.message}`, 'error');
    } finally {
      setIsCleaningUp(false);
      setCleanupProgress(100);
    }
  };

  const killProcess = async (pid) => {
    if (!window.electronAPI) {
      addLog('API de Electron no disponible', 'error');
      return;
    }

    try {
      await window.electronAPI.killProcess(pid);
      addLog(`Proceso ${pid} terminado`, 'success');
      fetchConnections(); // Actualizar lista
    } catch (error) {
      addLog(`Error al terminar proceso ${pid}: ${error.message}`, 'error');
    }
  };

  const openVirusTotal = useCallback(async (ip) => {
    if (!window.electronAPI) {
      addLog('API de Electron no disponible', 'error');
      return;
    }

    try {
      addLog(`Abriendo VirusTotal para IP: ${ip}`, 'info');
      const result = await window.electronAPI.openVirusTotal(ip);
      addLog(result, 'success');
    } catch (error) {
      addLog(`Error abriendo VirusTotal: ${error.message}`, 'error');
      console.error('VirusTotal error:', error);
    }
  }, [addLog]);

  const handleConnectionClick = useCallback((connection) => {
    const ip = connection.remoteAddress;
    addLog(`Intentando analizar IP: ${ip}`, 'info');
    
    if (!ip || ip === '0.0.0.0' || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.') || (ip.startsWith('172.') && parseInt(ip.split('.')[1]) >= 16 && parseInt(ip.split('.')[1]) <= 31)) {
      addLog('No se puede analizar esta dirección IP en VirusTotal (IP local/privada)', 'warning');
      return;
    }
    
    openVirusTotal(ip);
  }, [addLog, openVirusTotal]);

  useEffect(() => {
    let interval;
    if (isMonitoring && autoUpdate) {
      interval = setInterval(() => fetchConnections(true), 5000);
    }
    return () => clearInterval(interval);
  }, [isMonitoring, autoUpdate, fetchConnections]);

  // Check for updates on startup
  useEffect(() => {
    const checkForUpdates = async () => {
      if (autoUpdatesEnabled && window.electronAPI && window.electronAPI.checkUpdates) {
        try {
          const updateInfo = await window.electronAPI.checkUpdates();
          if (updateInfo.success) {
            setCurrentVersion(updateInfo.currentVersion);
            setLatestVersion(updateInfo.latestVersion);
            setUpdateAvailable(updateInfo.updateAvailable);
            
            if (updateInfo.updateAvailable) {
              addLog(`Nueva versión disponible: v${updateInfo.latestVersion}`, 'info');
            }
          }
        } catch (error) {
          console.error('Error checking for updates:', error);
        }
      }
    };
    
    // Delay the check to ensure Electron context is ready
    const timer = setTimeout(checkForUpdates, 1000);
    
    // Check for updates every hour if enabled
    let interval;
    if (autoUpdatesEnabled) {
      interval = setInterval(checkForUpdates, 3600000); // 1 hour
    }
    
    return () => {
      clearTimeout(timer);
      if (interval) clearInterval(interval);
    };
  }, [autoUpdatesEnabled, addLog]);

  // Handle auto start setting
  const handleAutoStartChange = async (enabled) => {
    if (!window.electronAPI || !window.electronAPI.setAutoStart) {
      addLog('Función no disponible en modo web', 'warning');
      return;
    }
    
    try {
      const result = await window.electronAPI.setAutoStart(enabled);
      if (result.success) {
        setAutoStart(enabled);
        addLog(result.message, 'success');
      } else {
        addLog(result.message, 'error');
      }
    } catch (error) {
      addLog('Error al configurar inicio automático', 'error');
    }
  };

  useEffect(() => {
    addLog('Network Monitor And Cleaner iniciado', 'success');
    addLog('Haga clic en "Iniciar Monitoreo" para comenzar', 'info');
  }, [addLog]);

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'high': return '#ff4757';
      case 'medium': return '#ffa502';
      case 'safe': return '#2ed573';
      default: return '#747d8c';
    }
  };

  const getRiskIcon = (risk) => {
    switch (risk) {
      case 'high': return <XCircle size={16} />;
      case 'medium': return <AlertTriangle size={16} />;
      case 'safe': return <CheckCircle size={16} />;
      default: return <Activity size={16} />;
    }
  };

  return (
    <div className="app">
      {/* Header */}
      <div className="header">
        <div className="header-left">
          <Shield className="logo" size={24} />
          <h1>Network Monitor And Cleaner</h1>
        </div>
        <div className="header-controls">
          <button 
            className="control-btn theme-toggle"
            onClick={() => {
              const themes = ['dark', 'light', 'blue', 'purple'];
              const currentIndex = themes.indexOf(currentTheme);
              const nextTheme = themes[(currentIndex + 1) % themes.length];
              changeTheme(nextTheme);
            }}
            title={`Tema actual: ${currentTheme === 'dark' ? 'Oscuro' : currentTheme === 'light' ? 'Claro' : currentTheme === 'blue' ? 'Azul' : 'Morado'} - Clic para cambiar`}
          >
            <Palette size={16} />
            Tema
          </button>
          
          <button 
            className={`control-btn ${isMonitoring ? 'active' : ''}`}
            onClick={isMonitoring ? stopMonitoring : startMonitoring}
            disabled={isLoading}
          >
            {isMonitoring ? <Square size={16} /> : <Play size={16} />}
            {isMonitoring ? 'Detener' : 'Iniciar'}
          </button>
          <button 
            className="control-btn"
            onClick={() => fetchConnections(false)}
            disabled={isLoading || (isMonitoring && autoUpdate)}
            title={isMonitoring && autoUpdate ? 'Desactive la actualización automática para usar este botón' : 'Actualizar manualmente'}
          >
            <RefreshCw size={16} className={isLoading ? 'spinning' : ''} />
            Actualizar
          </button>


        </div>
      </div>

      {/* Stats */}
      <div className="stats">
        <div className="stat-card">
          <Monitor size={20} />
          <div>
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Conexiones</div>
          </div>
        </div>
        <div className="stat-card suspicious">
          <AlertTriangle size={20} />
          <div>
            <div className="stat-number">{stats.suspicious}</div>
            <div className="stat-label">Sospechosas</div>
          </div>
        </div>
        <div className="stat-card safe">
          <CheckCircle size={20} />
          <div>
            <div className="stat-number">{stats.safe}</div>
            <div className="stat-label">Seguras</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="nav">
        <button 
          className={`nav-btn ${activeTab === 'connections' ? 'active' : ''}`}
          onClick={() => setActiveTab('connections')}
        >
          <Monitor size={16} />
          Conexiones
        </button>
        <button 
          className={`nav-btn ${activeTab === 'analysis' ? 'active' : ''}`}
          onClick={() => setActiveTab('analysis')}
        >
          <Activity size={16} />
          Análisis
        </button>
        <button 
          className={`nav-btn ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          <Shield size={16} />
          Logs
        </button>
        <button 
          className={`nav-btn ${activeTab === 'cleanup' ? 'active' : ''}`}
          onClick={() => setActiveTab('cleanup')}
        >
          <Trash2 size={16} />
          Limpieza
        </button>
      </div>

      {/* Content */}
      <div className="content">
        {activeTab === 'connections' && (
          <div className="connections-tab">
            <div className="filter-controls">
              <div className="filter-group">
                <label className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={showLocalIPs}
                    onChange={(e) => setShowLocalIPs(e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  IPs Locales ({connections.filter(conn => isLocalIP(conn.remoteAddress)).length})
                </label>
                <label className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={showExternalIPs}
                    onChange={(e) => setShowExternalIPs(e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  IPs Externas ({connections.filter(conn => !isLocalIP(conn.remoteAddress)).length})
                </label>
              </div>
            </div>
            <div className="table-container">
              <ConnectionTable 
                connections={filteredConnections}
                onConnectionClick={handleConnectionClick}
                onKillProcess={killProcess}
                getRiskColor={getRiskColor}
                getRiskIcon={getRiskIcon}
              />
              {filteredConnections.length === 0 && connections.length > 0 && (
                <div className="empty-state">
                  <Monitor size={48} />
                  <p>No hay conexiones que coincidan con los filtros</p>
                  <p>Ajuste los filtros para ver más conexiones</p>
                </div>
              )}
              {connections.length === 0 && (
                <div className="empty-state">
                  <Monitor size={48} />
                  <p>No hay conexiones para mostrar</p>
                  <p>Inicie el monitoreo para ver las conexiones de red</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="analysis-tab">
            <div className="analysis-grid">
              {/* Distribución de Riesgo */}
              <div className="analysis-card">
                <h3>📊 Distribución de Riesgo</h3>
                {chartData.riskDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={chartData.riskDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {chartData.riskDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="no-data">No hay datos de riesgo para mostrar</div>
                )}
              </div>

              {/* Distribución Geográfica */}
              <div className="analysis-card">
                <h3>🌍 Distribución Geográfica</h3>
                {chartData.geoData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={chartData.geoData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#0088FE" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="no-data">No hay datos geográficos para mostrar</div>
                )}
              </div>

              {/* Procesos Más Activos */}
              <div className="analysis-card">
                <h3>🔄 Procesos Más Activos</h3>
                {chartData.processData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={chartData.processData} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#00C49F" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="no-data">No hay datos de procesos para mostrar</div>
                )}
              </div>

              {/* Actividad por Puerto */}
              <div className="analysis-card">
                <h3>🔌 Actividad por Puerto</h3>
                {chartData.portData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={chartData.portData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#FFBB28" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="no-data">No hay datos de puertos para mostrar</div>
                )}
              </div>

              {/* Métricas de Seguridad */}
              <div className="analysis-card metrics-card">
                <h3>🛡️ Métricas de Seguridad</h3>
                <div className="metrics-grid">
                  <div className="metric-item">
                    <div className="metric-value">{stats.total}</div>
                    <div className="metric-label">Total Conexiones</div>
                  </div>
                  <div className="metric-item suspicious">
                    <div className="metric-value">{stats.suspicious}</div>
                    <div className="metric-label">Sospechosas</div>
                  </div>
                  <div className="metric-item safe">
                    <div className="metric-value">{stats.safe}</div>
                    <div className="metric-label">Seguras</div>
                  </div>
                  <div className="metric-item">
                    <div className="metric-value">{connections.filter(c => !isLocalIP(c.remoteAddress)).length}</div>
                    <div className="metric-label">Externas</div>
                  </div>
                  <div className="metric-item">
                    <div className="metric-value">{new Set(connections.map(c => c.processName)).size}</div>
                    <div className="metric-label">Procesos Únicos</div>
                  </div>
                  <div className="metric-item">
                    <div className="metric-value">{stats.total > 0 ? ((stats.suspicious / stats.total) * 100).toFixed(1) : 0}%</div>
                    <div className="metric-label">Tasa de Riesgo</div>
                  </div>
                </div>
              </div>
              
              {cleanupResults.length > 0 && (
                <div className="analysis-card">
                  <h3>🧹 Resultados de Limpieza</h3>
                  <div className="cleanup-results">
                    {cleanupResults.map((result, index) => (
                      <div key={index} className="cleanup-item">
                        <CheckCircle size={16} className="success" />
                        <span>{result}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="logs-tab">
            <div className="logs-container">
              {logs.map((log, index) => (
                <div key={index} className={`log-entry ${log.type}`}>
                  <span className="log-time">[{log.timestamp}]</span>
                  <span className="log-message">{log.message}</span>
                </div>
              ))}
              {logs.length === 0 && (
                <div className="empty-state">
                  <Activity size={48} />
                  <p>No hay logs para mostrar</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'cleanup' && (
          <div className="cleanup-tab">
            <div className="cleanup-container">
              <div className="cleanup-header">
                <h2>🧹 Limpieza Avanzada del Sistema</h2>
                <p>Seleccione las opciones de limpieza que desea ejecutar</p>
              </div>

              <div className="cleanup-options">
                <div className="cleanup-grid">
                  <div className="cleanup-option">
                    <label className="cleanup-checkbox">
                      <input
                        type="checkbox"
                        checked={cleanupOptions.dns}
                        onChange={(e) => setCleanupOptions(prev => ({ ...prev, dns: e.target.checked }))}
                      />
                      <span className="checkmark"></span>
                      <div className="option-content">
                        <h4>🌐 Limpiar DNS</h4>
                        <p>Vacía la caché DNS del sistema para resolver problemas de conectividad</p>
                      </div>
                    </label>
                  </div>

                  <div className="cleanup-option">
                    <label className="cleanup-checkbox">
                      <input
                        type="checkbox"
                        checked={cleanupOptions.tempFiles}
                        onChange={(e) => setCleanupOptions(prev => ({ ...prev, tempFiles: e.target.checked }))}
                      />
                      <span className="checkmark"></span>
                      <div className="option-content">
                        <h4>📁 Archivos Temporales</h4>
                        <p>Elimina archivos temporales del sistema y usuario (%temp%, Windows\Temp)</p>
                      </div>
                    </label>
                  </div>

                  <div className="cleanup-option">
                    <label className="cleanup-checkbox">
                      <input
                        type="checkbox"
                        checked={cleanupOptions.recycleBin}
                        onChange={(e) => setCleanupOptions(prev => ({ ...prev, recycleBin: e.target.checked }))}
                      />
                      <span className="checkmark"></span>
                      <div className="option-content">
                        <h4>🗑️ Papelera de Reciclaje</h4>
                        <p>Vacía completamente la papelera de reciclaje</p>
                      </div>
                    </label>
                  </div>

                  <div className="cleanup-option">
                    <label className="cleanup-checkbox">
                      <input
                        type="checkbox"
                        checked={cleanupOptions.diskCleanup}
                        onChange={(e) => setCleanupOptions(prev => ({ ...prev, diskCleanup: e.target.checked }))}
                      />
                      <span className="checkmark"></span>
                      <div className="option-content">
                        <h4>💾 Liberador de Espacio</h4>
                        <p>Ejecuta el liberador de espacio en disco de Windows</p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="cleanup-advanced">
                  <h3>⚙️ Opciones Avanzadas</h3>
                  <label className="cleanup-checkbox">
                    <input
                      type="checkbox"
                      checked={cleanupOptions.autoSchedule}
                      onChange={(e) => setCleanupOptions(prev => ({ ...prev, autoSchedule: e.target.checked }))}
                    />
                    <span className="checkmark"></span>
                    <div className="option-content">
                      <h4>📅 Programar Limpieza Automática</h4>
                      <p>Configura una limpieza automática del sistema cada ciertos días</p>
                      {cleanupOptions.autoSchedule && (
                        <div className="frequency-input-container">
                          <label htmlFor="cleanup-frequency">Frecuencia (días):</label>
                          <input
                            id="cleanup-frequency"
                            type="number"
                            min="1"
                            max="365"
                            value={cleanupFrequencyDays}
                            onChange={(e) => setCleanupFrequencyDays(parseInt(e.target.value) || 1)}
                            className="frequency-input"
                          />
                          <span className="frequency-help">La limpieza se ejecutará cada {cleanupFrequencyDays} día{cleanupFrequencyDays !== 1 ? 's' : ''}</span>
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              </div>

              {isCleaningUp && (
                <div className="cleanup-progress">
                  <h3>🔄 Limpieza en Progreso...</h3>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${cleanupProgress}%` }}
                    ></div>
                  </div>
                  <p>{cleanupProgress}% completado</p>
                </div>
              )}

              <div className="cleanup-actions">
                <button 
                  className="cleanup-start-btn yellow-btn"
                  onClick={executeAdvancedCleanup}
                  disabled={isCleaningUp || !Object.values(cleanupOptions).some(Boolean)}
                >
                  {isCleaningUp ? (
                    <>
                      <RefreshCw size={16} className="spinning" />
                      Limpiando...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Iniciar Limpieza
                    </>
                  )}
                </button>
                
                <button 
                  className="cleanup-quick-btn"
                  onClick={cleanTempFiles}
                  disabled={isLoading || isCleaningUp}
                >
                  <Trash2 size={16} />
                  Limpieza Rápida
                </button>
              </div>

              {cleanupResults.length > 0 && (
                <div className="cleanup-results">
                  <h3>✅ Resultados de la Limpieza</h3>
                  <div className="results-list">
                    {cleanupResults.map((result, index) => (
                      <div key={index} className="result-item">
                        <CheckCircle size={16} className="success" />
                        <span>{result}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Settings Button - Bottom Left */}
      <button 
        className={`settings-fab ${showSettings ? 'active' : ''}`}
        onClick={() => setShowSettings(!showSettings)}
        title="Configuración"
      >
        <Settings size={24} />
      </button>

      {/* Help Button - Bottom Right */}
      <button 
        className="help-fab"
        onClick={() => setShowHelpModal(true)}
        title="Ayuda e Información"
      >
        <HelpCircle size={24} />
      </button>

      {/* Side Settings Panel */}
      <div className={`settings-sidebar ${showSettings ? 'open' : ''}`}>
        <div className="settings-sidebar-content">
          <div className="settings-header">
            <h3>Configuración</h3>
            <button 
              className="close-settings"
              onClick={() => setShowSettings(false)}
            >
              ✕
            </button>
          </div>
          
          <div className="setting-group">
            <div className="setting-item">
              <label className="setting-label">
                <input
                  type="checkbox"
                  checked={autoUpdate}
                  onChange={(e) => setAutoUpdate(e.target.checked)}
                  className="setting-checkbox"
                />
                <span className="setting-text">Actualización automática</span>
              </label>
              <p className="setting-description">
                Actualiza automáticamente las conexiones de red cada 5 segundos
              </p>
            </div>
          </div>

          <div className="setting-group">
            <div className="setting-item">
              <label className="setting-label">
                <input
                  type="checkbox"
                  checked={autoUpdatesEnabled}
                  onChange={(e) => setAutoUpdatesEnabled(e.target.checked)}
                  className="setting-checkbox"
                />
                <span className="setting-text">Actualizaciones automáticas</span>
                {updateAvailable && (
                  <span className="update-badge">¡Nueva versión disponible!</span>
                )}
              </label>
              <p className="setting-description">
                Detecta automáticamente nuevas versiones en GitHub
                <br />
                <small>Versión actual: v{currentVersion} | Última: v{latestVersion}</small>
              </p>
            </div>
          </div>

          <div className="setting-group">
            <div className="setting-item">
              <label className="setting-label">
                <input
                  type="checkbox"
                  checked={autoStart}
                  onChange={(e) => handleAutoStartChange(e.target.checked)}
                  className="setting-checkbox"
                />
                <span className="setting-text">Inicio automático</span>
              </label>
              <p className="setting-description">
                Abrir automáticamente al iniciar Windows
              </p>
            </div>
          </div>

          <div className="setting-group">
            <h3>🎨 Configuración de Tema</h3>
            <div className="theme-selector">
              <div className="theme-options">
                <button 
                  className={`theme-option ${currentTheme === 'dark' ? 'active' : ''}`}
                  onClick={() => changeTheme('dark')}
                  title="Tema Oscuro"
                >
                  <div className="theme-preview dark-preview"></div>
                  <span>Oscuro</span>
                </button>
                <button 
                  className={`theme-option ${currentTheme === 'light' ? 'active' : ''}`}
                  onClick={() => changeTheme('light')}
                  title="Tema Claro"
                >
                  <div className="theme-preview light-preview"></div>
                  <span>Claro</span>
                </button>
                <button 
                  className={`theme-option ${currentTheme === 'blue' ? 'active' : ''}`}
                  onClick={() => changeTheme('blue')}
                  title="Tema Azul"
                >
                  <div className="theme-preview blue-preview"></div>
                  <span>Azul</span>
                </button>
                <button 
                  className={`theme-option ${currentTheme === 'purple' ? 'active' : ''}`}
                  onClick={() => changeTheme('purple')}
                  title="Tema Morado"
                >
                  <div className="theme-preview purple-preview"></div>
                  <span>Morado</span>
                </button>
              </div>
            </div>
          </div>

          <div className="setting-group">

          </div>
        </div>
      </div>



      {/* Help Modal */}
      {showHelpModal && (
        <div className="modal-overlay" onClick={() => setShowHelpModal(false)}>
          <div className="help-modal" onClick={(e) => e.stopPropagation()}>
            <div className="help-modal-header">
               <h2>🛡️ Network Monitor And Cleaner - Guía de Uso</h2>
               <button 
                 className="close-modal"
                 onClick={() => setShowHelpModal(false)}
               >
                 ✕
               </button>
             </div>
            <div className="help-modal-content">
              <div className="help-section">
                <h3>🎯 ¿Qué es Network Monitor And Cleaner?</h3>
              <p>Network Monitor And Cleaner es una herramienta de monitoreo de seguridad que detecta procesos maliciosos y conexiones sospechosas en tiempo real, combinando análisis de red con limpieza del sistema.</p>
              </div>

              <div className="help-section">
                <h3>📋 Pestañas Principales</h3>
                <div className="help-tabs">
                  <div className="help-tab-item">
                    <strong>🌐 Conexiones:</strong> Muestra todas las conexiones TCP activas con información de PID, proceso, IPs y puertos. Código de colores para identificar conexiones sospechosas.
                  </div>
                  <div className="help-tab-item">
                    <strong>⚠️ Sospechosos:</strong> Lista filtrada de conexiones con riesgo elevado, sistema de puntuación (1-5) y razones específicas de detección.
                  </div>
                  <div className="help-tab-item">
                    <strong>📊 Análisis:</strong> Estadísticas en tiempo real, gráficos de actividad de red y métricas de seguridad.
                  </div>
                  <div className="help-tab-item">
                    <strong>🧹 Limpieza:</strong> Sistema avanzado de limpieza que incluye DNS, archivos temporales, papelera y liberador de espacio.
                  </div>
                  <div className="help-tab-item">
                    <strong>📝 Logs:</strong> Registro de actividades, historial de detecciones y eventos del sistema.
                  </div>
                </div>
              </div>

              <div className="help-section">
                <h3>🔍 Criterios de Detección</h3>
                <div className="risk-levels">
                  <div className="risk-item">
                    <span className="risk-badge low">🟢 Nivel 1:</span> Riesgo bajo - Monitorear
                  </div>
                  <div className="risk-item">
                    <span className="risk-badge medium">🟡 Nivel 2-3:</span> Riesgo medio - Investigar
                  </div>
                  <div className="risk-item">
                    <span className="risk-badge high">🔴 Nivel 4-5:</span> Riesgo alto - Acción inmediata
                  </div>
                </div>
              </div>

              <div className="help-section">
                <h3>🛠️ Controles Principales</h3>
                <div className="controls-grid">
                  <div className="control-item">
                    <strong>🎨 Tema:</strong> Cambia entre temas Oscuro, Claro, Azul y Morado
                  </div>
                  <div className="control-item">
                    <strong>🔍 Iniciar Monitoreo:</strong> Comienza el análisis continuo de conexiones
                  </div>
                  <div className="control-item">
                    <strong>⏹️ Detener:</strong> Pausa el monitoreo en tiempo real
                  </div>
                  <div className="control-item">
                    <strong>🔄 Actualizar:</strong> Realiza un escaneo manual único
                  </div>
                  <div className="control-item">
                    <strong>💾 Exportar:</strong> Genera un reporte completo de resultados
                  </div>
                </div>
              </div>

              <div className="help-section">
                <h3>🧹 Sistema de Limpieza</h3>
                <div className="cleanup-features">
                  <div className="feature-item">
                    <strong>🌐 DNS:</strong> Limpia la caché DNS (ipconfig /flushdns)
                  </div>
                  <div className="feature-item">
                    <strong>📁 Temporales:</strong> Elimina archivos temporales del sistema y usuarios
                  </div>
                  <div className="feature-item">
                    <strong>🗑️ Papelera:</strong> Vacía completamente la papelera de reciclaje
                  </div>
                  <div className="feature-item">
                    <strong>💾 Liberador:</strong> Ejecuta el liberador de espacio de Windows
                  </div>
                  <div className="feature-item">
                    <strong>📅 Automático:</strong> Programa limpiezas automáticas semanales
                  </div>
                </div>
              </div>

              <div className="help-section">
                <h3>⚠️ Factores de Riesgo</h3>
                <div className="risk-factors">
                  <div className="factor-item">• Proceso desconocido (+2 puntos)</div>
                  <div className="factor-item">• Puerto sospechoso (+3 puntos)</div>
                  <div className="factor-item">• Conexión externa inusual (+4 puntos)</div>
                  <div className="factor-item">• Ubicación temporal (+3 puntos)</div>
                  <div className="factor-item">• Sin ruta válida (+1 punto)</div>
                </div>
              </div>

              <div className="help-section">
                <h3>🚨 Acciones Recomendadas</h3>
                <div className="actions-list">
                  <div className="action-item">
                    <strong>Para conexiones sospechosas:</strong>
                    <ul>
                      <li>Verificar en VirusTotal (doble clic)</li>
                      <li>Investigar ubicación del proceso</li>
                      <li>Monitorear actividad continua</li>
                      <li>Considerar terminación si se confirma malware</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="help-section">
                <h3>🎨 Personalización</h3>
                <div className="customization-info">
                  <div className="feature-item">
                    <strong>🌙 Tema Oscuro:</strong> Diseño por defecto, ideal para uso nocturno
                  </div>
                  <div className="feature-item">
                    <strong>☀️ Tema Claro:</strong> Interfaz clara, perfecta para uso diurno
                  </div>
                  <div className="feature-item">
                    <strong>🔵 Tema Azul:</strong> Estilo profesional con tonos azules
                  </div>
                  <div className="feature-item">
                    <strong>🟣 Tema Morado:</strong> Diseño elegante con colores morados
                  </div>
                </div>
                <p><strong>Cambio rápido:</strong> Usa el botón "Tema" en la barra superior o accede a configuración avanzada en el panel lateral.</p>
              </div>

              <div className="help-section">
                 <h3>🔒 Consideraciones de Seguridad</h3>
                 <p><strong>Importante:</strong> Network Monitor And Cleaner requiere permisos de administrador para acceso completo. No reemplaza un antivirus, sino que complementa la seguridad del sistema detectando actividad de red sospechosa.</p>
               </div>

               <div className="help-section version-info">
                 <div className="version-container">
                   <h4>📱 Información de la Aplicación</h4>
                   <p><strong>Versión Actual:</strong> {currentVersion}</p>
                   <p><strong>Aplicación:</strong> Network Monitor And Cleaner</p>
                   <p><strong>Desarrollado con:</strong> React + Electron</p>
                 </div>
               </div>
             </div>
          </div>
        </div>
      )}

      {/* Overlays */}
      {showSettings && (
        <div 
          className="settings-overlay"
          onClick={() => setShowSettings(false)}
        />
      )}
      

    </div>
  );
});

export default App;