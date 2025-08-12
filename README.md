# 🛡️ NMC Total - Network Monitor And Cleaner

**NMC Total (Network Monitor And Cleaner)** es una herramienta de monitoreo de seguridad de red disponible en dos versiones:

### 🚀 **Nueva Versión React + Electron** (Recomendada)
Interfaz moderna inspirada en Windows 11 con tecnología React y Electron, que incluye:
- Diseño moderno y responsivo
- Limpieza automática de DNS y archivos temporales
- Detección automática de usuarios del sistema
- Mejor rendimiento y experiencia de usuario

### 🐍 **Versión Python + Tkinter** (Clásica)
Versión original diseñada para detectar y monitorear procesos maliciosos (troyanos, malware) que utilizan conexiones de red en sistemas Windows. Combina monitoreo de red en tiempo real con análisis de procesos para identificar actividad sospechosa.

## 🎯 Características Principales

### 🌟 **Nuevas Funcionalidades (Versión React)**
- **🧹 Sistema de Limpieza Avanzado:**
  - Limpieza de DNS cache (`ipconfig /flushdns`)
  - Eliminación de archivos temporales del sistema y usuarios
  - Limpieza de cookies y caché de navegadores
  - Vaciado de papelera de reciclaje
  - Liberador de espacio de Windows
  - Limpiezas automáticas programadas
  - Panel deslizante estilo Discord para opciones de limpieza

- **⚙️ Configuración Avanzada:**
  - Panel de configuración con botón FAB (Floating Action Button)
  - Sistema de actualizaciones automáticas desde GitHub
  - Configuración de inicio automático con Windows
  - Control de versiones integrado
  - Interfaz moderna con sidebar opaco

- **🎨 Interfaz Moderna:**
  - Diseño inspirado en Windows 11 y Discord
  - Tema oscuro con efectos de cristal (glass effect)
  - Animaciones fluidas y transiciones suaves
  - Componentes responsivos y accesibles
  - Panel deslizante para opciones de limpieza

### 🔍 **Funcionalidades Principales**
- **Monitoreo en Tiempo Real**: Supervisa conexiones de red activas continuamente
- **Detección Inteligente**: Identifica procesos sospechosos basándose en múltiples criterios
- **Interfaz Gráfica Intuitiva**: Visualización clara y organizada de la información
- **Análisis de Riesgo**: Sistema de puntuación de 1-5 para evaluar amenazas
- **Integración con VirusTotal**: Acceso directo para verificar IPs sospechosas
- **Exportación de Datos**: Genera reportes detallados en formato texto
- **Script PowerShell Integrado**: Análisis avanzado desde línea de comandos

## 📋 Requisitos del Sistema

### Para la Versión React + Electron:
- **Sistema Operativo:** Windows 10/11
- **Node.js:** 16.0 o superior
- **npm:** 8.0 o superior
- **Privilegios:** Administrador (recomendado para funciones avanzadas)
- **PowerShell:** 5.0 o superior

### Para la Versión Python + Tkinter:
- **Sistema Operativo:** Windows 10/11
- **Python:** 3.6 o superior
- **Privilegios:** Administrador (recomendado para funciones avanzadas)
- **PowerShell:** 5.0 o superior

## 🚀 Instalación y Uso

### 🌟 **Versión React + Electron (Recomendada)**

1. **Instalar Node.js:**
   - Descargar desde: https://nodejs.org/
   - Verificar instalación: `node --version`

2. **Configurar la aplicación:**
   ```bash
   # Ejecutar script de configuración automática
   setup-react.bat
   ```

3. **Ejecutar la aplicación:**
   ```bash
   # Opción 1: Script automático (recomendado)
   run-react-app.bat
   
   # Opción 2: Manual
   npm start          # Inicia servidor React
   npm run electron-dev   # Inicia aplicación Electron
   ```

### 🐍 **Versión Python + Tkinter (Clásica)**

1. **Instalar dependencias** (opcional, usa solo librerías estándar):
   ```bash
   pip install -r requirements.txt
   ```

2. **Ejecutar la aplicación:**
   ```bash
   python app.py
   ```
   
   O usar el script de lanzamiento:
   ```bash
   launch_red_monitor.bat
   ```

### Verificar Dependencias

1. **Verificar Python**:
   ```cmd
   python --version
   ```

2. **Verificar PowerShell**:
   ```cmd
   powershell $PSVersionTable.PSVersion
   ```

3. **Ejecutar como administrador** (recomendado):
   - Clic derecho en Command Prompt → "Ejecutar como administrador"
   - Navegar al directorio del proyecto
   - Ejecutar la aplicación correspondiente

## 📖 Guía de Uso

### Interfaz Principal

La aplicación cuenta con 4 pestañas principales:

#### 🌐 Conexiones Activas
- Muestra todas las conexiones TCP establecidas
- Información de PID, proceso, IPs y puertos
- Identificación geográfica básica
- Código de colores para conexiones sospechosas

#### ⚠️ Procesos Sospechosos
- Lista filtrada de conexiones con riesgo elevado
- Sistema de puntuación de riesgo (1-5)
- Razones específicas de la detección
- Opciones de acción directa

#### 📊 Análisis
- Estadísticas en tiempo real
- Gráficos de actividad de red
- Distribución geográfica
- Métricas de seguridad

#### 📝 Logs
- Registro de actividades
- Historial de detecciones
- Eventos del sistema

### Controles Principales

- **🔍 Iniciar Monitoreo**: Comienza el análisis continuo
- **⏹️ Detener**: Pausa el monitoreo
- **🔄 Actualizar**: Escaneo manual único
- **💾 Exportar**: Genera reporte completo

### Acciones Avanzadas

#### Análisis de Conexiones
- **Doble clic** en una conexión → Ver detalles y abrir VirusTotal
- **Clic derecho** en proceso sospechoso → Menú de acciones:
  - 🔍 Analizar en VirusTotal
  - ⚠️ Terminar proceso
  - 📋 Copiar PID

## 🔧 Script PowerShell Independiente

### Uso Básico
```powershell
# Escaneo único
.\network_monitor.ps1

# Monitoreo continuo cada 5 segundos
.\network_monitor.ps1 -Continuous -Interval 5

# Exportar resultados a JSON
.\network_monitor.ps1 -ExportJson -OutputFile "scan_results.json"
```

### Parámetros Disponibles
- `-Continuous`: Monitoreo continuo
- `-Interval <segundos>`: Intervalo entre escaneos
- `-ExportJson`: Exportar a formato JSON
- `-OutputFile <archivo>`: Nombre del archivo de salida

## 🔍 Criterios de Detección

### Factores de Riesgo

| Factor | Puntos | Descripción |
|--------|--------|-------------|
| Proceso desconocido | +2 | Proceso sin nombre identificable |
| Puerto sospechoso | +3 | Puertos comúnmente usados por malware |
| Conexión externa inusual | +4 | Procesos del sistema conectándose externamente |
| Ubicación temporal | +3 | Ejecutables en directorios temporales |
| Sin ruta válida | +1 | Procesos sin ubicación identificable |

### Puertos Monitoreados
- **Sospechosos**: 1337, 31337, 4444, 5555, 6666, 7777, 8888, 9999
- **Análisis**: Todos los puertos con conexiones establecidas

### Procesos de Interés
- **Sistema**: notepad, calc, mspaint, wordpad
- **Sospechosos**: temp*, tmp*, unknown, svchost (en contextos inusuales)

## 🚨 Interpretación de Resultados

### Niveles de Riesgo
- **🟢 Nivel 1**: Riesgo bajo - Monitorear
- **🟡 Nivel 2-3**: Riesgo medio - Investigar
- **🔴 Nivel 4-5**: Riesgo alto - Acción inmediata

### Acciones Recomendadas

#### Para Conexiones Sospechosas:
1. **Verificar en VirusTotal**: Analizar la IP de destino
2. **Investigar el proceso**: Revisar ubicación y firma digital
3. **Analizar comportamiento**: Monitorear actividad continua
4. **Considerar terminación**: Si se confirma como malware

#### Para Procesos Maliciosos Confirmados:
1. **Terminar proceso**: `taskkill /PID <PID> /F`
2. **Eliminar archivo**: Desde modo seguro
3. **Revisar persistencia**:
   - Tareas programadas: `taskschd.msc`
   - Registro: `regedit` → Claves de inicio
4. **Escaneo completo**: Antivirus actualizado

## 📁 Estructura de Archivos

```
Red-Monitor/
├── app.py                 # Aplicación principal con GUI
├── network_monitor.ps1    # Script PowerShell independiente
├── requirements.txt       # Dependencias (ninguna externa)
├── README.md             # Este archivo
└── exports/              # Carpeta para reportes (se crea automáticamente)
```

## 🔒 Consideraciones de Seguridad

### Permisos Necesarios
- **Lectura de procesos**: Para obtener información de PID
- **Acceso a red**: Para monitorear conexiones TCP
- **Administrador**: Recomendado para acceso completo

### Limitaciones
- No detecta malware inactivo
- Requiere conexión de red activa para detección
- Geolocalización básica (sin servicios externos)
- No reemplaza un antivirus completo

## 🛠️ Solución de Problemas

### Errores Comunes

#### "Access Denied" al obtener información de procesos
**Solución**: Ejecutar como administrador

#### PowerShell no reconocido
**Solución**: Verificar que PowerShell esté instalado y en PATH

#### Interfaz no responde
**Solución**: Verificar que no haya procesos bloqueantes, reiniciar aplicación

#### No se detectan conexiones
**Solución**: 
- Verificar permisos de administrador
- Comprobar que hay actividad de red
- Revisar firewall de Windows

### Logs de Depuración
Los logs se muestran en la pestaña "📝 Logs" de la aplicación y incluyen:
- Eventos de inicio/parada
- Errores de conexión
- Resultados de análisis
- Acciones del usuario

## 🤝 Contribuciones

Este proyecto está diseñado para uso educativo y de seguridad. Las mejoras sugeridas incluyen:

- Integración con APIs de geolocalización
- Base de datos de firmas de malware
- Análisis de tráfico en tiempo real
- Interfaz web opcional
- Notificaciones del sistema

## ⚖️ Disclaimer

**Red Monitor** es una herramienta de análisis de seguridad. Su uso debe cumplir con:

- Leyes locales de privacidad y seguridad
- Políticas de la organización
- Términos de servicio de redes

**No nos hacemos responsables por el uso indebido de esta herramienta.**

## 📞 Soporte

Para reportar problemas o sugerir mejoras:
1. Revisar la sección de solución de problemas
2. Verificar logs de la aplicación
3. Documentar pasos para reproducir el problema

---

**🛡️ Mantén tu sistema seguro - NMC Total**