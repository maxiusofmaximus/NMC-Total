const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Network monitoring
  getNetworkConnections: () => ipcRenderer.invoke('get-network-connections'),
  
  // System cleanup
  cleanTempFiles: () => ipcRenderer.invoke('clean-temp-files'),
  cleanDNS: () => ipcRenderer.invoke('clean-dns'),
  emptyRecycleBin: () => ipcRenderer.invoke('empty-recycle-bin'),
  runDiskCleanup: () => ipcRenderer.invoke('run-disk-cleanup'),
  scheduleAutoCleanup: () => ipcRenderer.invoke('schedule-auto-cleanup'),
  
  // Version control and updates
  checkUpdates: () => ipcRenderer.invoke('check-updates'),
  setAutoStart: (enabled) => ipcRenderer.invoke('set-auto-start', enabled),
  
  // Process management
  killProcess: (pid) => ipcRenderer.invoke('kill-process', pid),
  
  // VirusTotal integration
  openVirusTotal: (ip) => ipcRenderer.invoke('open-virustotal', ip),
  
  // System info
  platform: process.platform,
  
  // Event listeners
  onConnectionUpdate: (callback) => {
    ipcRenderer.on('connection-update', callback);
    return () => ipcRenderer.removeListener('connection-update', callback);
  },
  
  onCleanupComplete: (callback) => {
    ipcRenderer.on('cleanup-complete', callback);
    return () => ipcRenderer.removeListener('cleanup-complete', callback);
  }
});