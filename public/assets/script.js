// NMC Total - Landing Page JavaScript
// Funcionalidad de descarga automática y detección de SO

// Configuración global
const CONFIG = {
    GITHUB_REPO: 'maxiusofmaximus/NMC-Total',
    API_BASE: '/api',
    DOWNLOAD_TIMEOUT: 30000, // 30 segundos
    STATS_REFRESH_INTERVAL: 300000 // 5 minutos
};

// Estado global de la aplicación
const AppState = {
    isLoading: true,
    detectedOS: null,
    latestRelease: null,
    downloadStats: null,
    isDownloading: false
};

// Utilidades para detección de sistema operativo
const OSDetector = {
    detect() {
        const userAgent = navigator.userAgent.toLowerCase();
        const platform = navigator.platform.toLowerCase();
        
        if (userAgent.includes('win') || platform.includes('win')) {
            return {
                name: 'Windows',
                icon: 'fab fa-windows',
                pattern: /windows.*\.exe$/i,
                downloadName: 'Windows (64-bit)'
            };
        }
        
        if (userAgent.includes('mac') || platform.includes('mac')) {
            return {
                name: 'macOS',
                icon: 'fab fa-apple',
                pattern: /macos.*\.(dmg|pkg)$/i,
                downloadName: 'macOS'
            };
        }
        
        if (userAgent.includes('linux') || platform.includes('linux')) {
            return {
                name: 'Linux',
                icon: 'fab fa-linux',
                pattern: /linux.*\.(deb|rpm|tar\.gz|appimage)$/i,
                downloadName: 'Linux'
            };
        }
        
        // Por defecto, Windows
        return {
            name: 'Windows',
            icon: 'fab fa-windows',
            pattern: /windows.*\.exe$/i,
            downloadName: 'Windows (64-bit)'
        };
    },
    
    updateUI(osInfo) {
        const elements = {
            detectedOS: document.getElementById('detected-os'),
            autoDetectedOS: document.getElementById('auto-detected-os')
        };
        
        Object.values(elements).forEach(el => {
            if (el) el.textContent = osInfo.downloadName;
        });
    }
};

// API para comunicación con GitHub y Vercel
const API = {
    async fetchWithTimeout(url, options = {}, timeout = CONFIG.DOWNLOAD_TIMEOUT) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    },
    
    async getLatestRelease() {
        try {
            const response = await this.fetchWithTimeout(`${CONFIG.API_BASE}/download`);
            if (!response.ok) throw new Error('Error al obtener información de descarga');
            return await response.json();
        } catch (error) {
            console.error('Error fetching latest release:', error);
            return null;
        }
    },
    
    async getStats() {
        try {
            const response = await this.fetchWithTimeout(`${CONFIG.API_BASE}/stats`);
            if (!response.ok) throw new Error('Error al obtener estadísticas');
            return await response.json();
        } catch (error) {
            console.error('Error fetching stats:', error);
            return null;
        }
    },
    
    async downloadFile(platform = 'windows') {
        try {
            const response = await this.fetchWithTimeout(
                `${CONFIG.API_BASE}/download?platform=${platform}&redirect=true`
            );
            
            if (response.redirected) {
                // El navegador manejará la descarga automáticamente
                return { success: true, url: response.url };
            }
            
            const data = await response.json();
            if (data.download_url) {
                // Crear enlace temporal para descarga
                const link = document.createElement('a');
                link.href = data.download_url;
                link.download = data.filename || 'NMC-Total-Setup.exe';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                return { success: true, data };
            }
            
            throw new Error('URL de descarga no disponible');
        } catch (error) {
            console.error('Error downloading file:', error);
            throw error;
        }
    }
};

// Gestor de descargas
const DownloadManager = {
    async initiate(platform) {
        if (AppState.isDownloading) {
            console.log('Descarga ya en progreso');
            return;
        }
        
        AppState.isDownloading = true;
        this.showDownloadModal();
        
        try {
            // Simular progreso de descarga
            this.updateProgress('downloading');
            
            const result = await API.downloadFile(platform);
            
            if (result.success) {
                this.updateProgress('verifying');
                
                // Simular verificación
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                this.updateProgress('completed');
                
                // Mostrar información de descarga
                if (result.data) {
                    this.updateDownloadInfo(result.data);
                }
                
                // Auto-cerrar modal después de 3 segundos
                setTimeout(() => {
                    this.hideDownloadModal();
                }, 3000);
                
                // Mostrar notificación de éxito
                this.showNotification('¡Descarga completada exitosamente!', 'success');
            }
        } catch (error) {
            this.updateProgress('error');
            this.showNotification('Error en la descarga: ' + error.message, 'error');
            console.error('Download error:', error);
        } finally {
            AppState.isDownloading = false;
        }
    },
    
    showDownloadModal() {
        const modal = document.getElementById('installation-modal');
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    },
    
    hideDownloadModal() {
        const modal = document.getElementById('installation-modal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            this.resetProgress();
        }
    },
    
    updateProgress(stage) {
        const steps = document.querySelectorAll('.progress-step');
        steps.forEach(step => step.classList.remove('active', 'completed', 'error'));
        
        switch (stage) {
            case 'downloading':
                steps[0]?.classList.add('active');
                break;
            case 'verifying':
                steps[0]?.classList.add('completed');
                steps[1]?.classList.add('active');
                break;
            case 'completed':
                steps[0]?.classList.add('completed');
                steps[1]?.classList.add('completed');
                steps[2]?.classList.add('active', 'completed');
                break;
            case 'error':
                document.querySelector('.progress-step.active')?.classList.add('error');
                break;
        }
    },
    
    resetProgress() {
        const steps = document.querySelectorAll('.progress-step');
        steps.forEach(step => {
            step.classList.remove('active', 'completed', 'error');
        });
        steps[0]?.classList.add('active');
    },
    
    updateDownloadInfo(data) {
        const elements = {
            filename: document.getElementById('download-filename'),
            filesize: document.getElementById('download-filesize'),
            version: document.getElementById('download-version')
        };
        
        if (elements.filename && data.filename) {
            elements.filename.textContent = data.filename;
        }
        
        if (elements.filesize && data.size) {
            elements.filesize.textContent = this.formatFileSize(data.size);
        }
        
        if (elements.version && data.version) {
            elements.version.textContent = data.version;
        }
    },
    
    formatFileSize(bytes) {
        if (!bytes) return '~50 MB';
        
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 Bytes';
        
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    },
    
    showNotification(message, type = 'info') {
        // Crear notificación temporal
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;
        
        // Agregar estilos si no existen
        if (!document.querySelector('#notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 15px 20px;
                    border-radius: 8px;
                    color: white;
                    font-weight: 500;
                    z-index: 10000;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    animation: slideIn 0.3s ease-out;
                }
                .notification-success { background: #10b981; }
                .notification-error { background: #ef4444; }
                .notification-info { background: #3b82f6; }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(styles);
        }
        
        document.body.appendChild(notification);
        
        // Auto-remover después de 5 segundos
        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }
};

// Gestor de estadísticas
const StatsManager = {
    async update() {
        try {
            const stats = await API.getStats();
            if (stats) {
                AppState.downloadStats = stats;
                this.updateUI(stats);
            }
        } catch (error) {
            console.error('Error updating stats:', error);
        }
    },
    
    updateUI(stats) {
        const elements = {
            totalDownloads: document.getElementById('total-downloads'),
            githubStars: document.getElementById('github-stars'),
            latestVersion: document.getElementById('latest-version'),
            downloadSize: document.getElementById('download-size')
        };
        
        if (elements.totalDownloads && stats.total_downloads !== undefined) {
            this.animateNumber(elements.totalDownloads, stats.total_downloads);
        }
        
        if (elements.githubStars && stats.stargazers_count !== undefined) {
            this.animateNumber(elements.githubStars, stats.stargazers_count);
        }
        
        if (elements.latestVersion && stats.latest_release) {
            elements.latestVersion.textContent = stats.latest_release.tag_name || 'v1.0.0';
        }
        
        if (elements.downloadSize && stats.latest_release?.assets?.[0]?.size) {
            elements.downloadSize.textContent = DownloadManager.formatFileSize(
                stats.latest_release.assets[0].size
            );
        }
    },
    
    animateNumber(element, targetValue) {
        const startValue = parseInt(element.textContent) || 0;
        const duration = 2000; // 2 segundos
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (ease-out)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentValue = Math.round(startValue + (targetValue - startValue) * easeOut);
            
            element.textContent = currentValue.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }
};

// Gestor de UI y eventos
const UIManager = {
    init() {
        this.setupEventListeners();
        this.setupNavigation();
        this.setupLoadingScreen();
        this.setupCopyButtons();
    },
    
    setupEventListeners() {
        // Botones de descarga principales
        const downloadBtn = document.getElementById('download-btn');
        const autoDownloadBtn = document.getElementById('auto-download-btn');
        
        [downloadBtn, autoDownloadBtn].forEach(btn => {
            if (btn) {
                btn.addEventListener('click', () => {
                    const platform = AppState.detectedOS?.name.toLowerCase() || 'windows';
                    DownloadManager.initiate(platform);
                });
            }
        });
        
        // Botón ver todas las versiones
        const viewAllBtn = document.getElementById('view-all-downloads');
        if (viewAllBtn) {
            viewAllBtn.addEventListener('click', () => {
                window.open('https://github.com/maxiusofmaximus/NMC-Total/releases', '_blank');
            });
        }
        
        // Modal de instalación
        const modal = document.getElementById('installation-modal');
        const closeButtons = document.querySelectorAll('.modal-close');
        
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                DownloadManager.hideDownloadModal();
            });
        });
        
        // Cerrar modal al hacer clic fuera
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    DownloadManager.hideDownloadModal();
                }
            });
        }
        
        // Botón abrir descargas
        const openDownloadsBtn = document.getElementById('open-downloads');
        if (openDownloadsBtn) {
            openDownloadsBtn.addEventListener('click', () => {
                // Intentar abrir la carpeta de descargas del sistema
                if (navigator.userAgent.includes('Win')) {
                    // Windows
                    window.open('file:///C:/Users/' + (process.env.USERNAME || 'User') + '/Downloads');
                } else if (navigator.userAgent.includes('Mac')) {
                    // macOS
                    window.open('file:///Users/' + (process.env.USER || 'user') + '/Downloads');
                } else {
                    // Linux y otros
                    window.open('file:///home/' + (process.env.USER || 'user') + '/Downloads');
                }
            });
        }
    },
    
    setupNavigation() {
        // Navegación suave
        const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
        
        // Toggle de menú móvil
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');
        
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                navToggle.classList.toggle('active');
            });
        }
    },
    
    setupLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        
        // Simular carga inicial
        setTimeout(() => {
            if (loadingScreen) {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                    AppState.isLoading = false;
                }, 500);
            }
        }, 2000);
    },
    
    setupCopyButtons() {
        const copyButtons = document.querySelectorAll('.copy-btn');
        copyButtons.forEach(btn => {
            btn.addEventListener('click', async () => {
                const textToCopy = btn.getAttribute('data-copy');
                
                try {
                    await navigator.clipboard.writeText(textToCopy);
                    
                    // Feedback visual
                    const originalIcon = btn.innerHTML;
                    btn.innerHTML = '<i class="fas fa-check"></i>';
                    btn.style.color = '#10b981';
                    
                    setTimeout(() => {
                        btn.innerHTML = originalIcon;
                        btn.style.color = '';
                    }, 2000);
                    
                    DownloadManager.showNotification('Comando copiado al portapapeles', 'success');
                } catch (error) {
                    console.error('Error copying to clipboard:', error);
                    DownloadManager.showNotification('Error al copiar al portapapeles', 'error');
                }
            });
        });
    }
};

// Inicialización de la aplicación
const App = {
    async init() {
        console.log('🚀 Iniciando NMC Total Landing Page...');
        
        try {
            // Detectar sistema operativo
            AppState.detectedOS = OSDetector.detect();
            OSDetector.updateUI(AppState.detectedOS);
            
            // Inicializar UI
            UIManager.init();
            
            // Cargar estadísticas
            await StatsManager.update();
            
            // Configurar actualización periódica de estadísticas
            setInterval(() => {
                StatsManager.update();
            }, CONFIG.STATS_REFRESH_INTERVAL);
            
            console.log('✅ Aplicación inicializada correctamente');
            console.log('🖥️ Sistema detectado:', AppState.detectedOS.name);
            
        } catch (error) {
            console.error('❌ Error inicializando aplicación:', error);
        }
    }
};

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', App.init);
} else {
    App.init();
}

// Exportar para uso global si es necesario
window.NMCApp = {
    App,
    DownloadManager,
    StatsManager,
    OSDetector,
    API
};