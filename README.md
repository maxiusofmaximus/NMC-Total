# 🛡️ NMC Total - Network Monitor And Cleaner

**NMC Total (Network Monitor And Cleaner)** es una herramienta de monitoreo de seguridad de red disponible en dos versiones:

### 🚀 **Nueva Versión React + Electron** (Recomendada)
Interfaz moderna inspirada en Windows 11 con tecnología React y Electron, que incluye:
- **🎨 Sistema de Temas Múltiples**: Oscuro, Claro, Azul y Morado
- **📊 Análisis Visual Avanzado**: Gráficos interactivos con Recharts
- **🧹 Limpieza Automática Programable**: Con configuración de frecuencia en días
- **❓ Modal de Ayuda Integrado**: Documentación completa dentro de la app
- **🔧 Configuración Avanzada**: Panel de configuración con botón FAB
- Diseño moderno y completamente responsivo
- Limpieza automática de DNS y archivos temporales
- Detección automática de usuarios del sistema (Para la limpieza de temporales)
- Mejor rendimiento y experiencia de usuario

### 🐍 **Versión Python + Tkinter** (Clásica)
Versión original diseñada para detectar y monitorear procesos maliciosos (troyanos, malware) que utilizan conexiones de red en sistemas Windows. Combina monitoreo de red en tiempo real con análisis de procesos para identificar actividad sospechosa.

## 🎯 Características Principales

### 🌟 **Nuevas Funcionalidades (Versión React)**
- **🎨 Sistema de Temas Avanzado:**
  - **Tema Oscuro**: Diseño elegante con tonos azules y verdes
  - **Tema Claro**: Interfaz limpia y moderna para uso diurno
  - **Tema Azul**: Variante profesional con acentos azules
  - **Tema Morado**: Diseño único con tonalidades moradas
  - Cambio dinámico de temas que afecta toda la interfaz

- **📊 Análisis Visual Interactivo:**
  - **Gráficos de Distribución Geográfica**: Visualización de conexiones por ubicación
  - **Análisis de Procesos Activos**: Gráficos de barras horizontales
  - **Actividad por Puerto**: Distribución de tráfico por puertos
  - **Métricas de Seguridad**: Estadísticas en tiempo real
  - Powered by Recharts para máximo rendimiento

- **🧹 Sistema de Limpieza Avanzado:**
  - Limpieza de DNS cache
  - Eliminación de archivos temporales del sistema y usuarios
  - Limpieza de cookies y caché de navegadores
  - Vaciado de papelera de reciclaje
  - Liberador de espacio de Windows
  - **🕒 Limpieza Automática Programable**: Configurable de 1 a 365 días
  - Input numérico intuitivo para frecuencia de limpieza

- **❓ Sistema de Ayuda Integrado:**
  - Modal de ayuda completo con documentación
  - Guías de uso paso a paso
  - Explicación de niveles de riesgo
  - Controles y funcionalidades detalladas
  - Diseño responsivo que se adapta a todos los temas

- **⚙️ Configuración Avanzada:**
  - Panel de configuración con botón FAB (Floating Action Button)
  - Sistema de actualizaciones automáticas desde GitHub
  - Configuración de inicio automático con Windows
  - Control de versiones integrado
  - Selector de temas integrado

- **🎨 Interfaz Moderna:**
  - Diseño inspirado en Windows 11 y Discord
  - Sistema de temas completamente funcional
  - Animaciones fluidas y transiciones suaves
  - Componentes responsivos y accesibles
  - Variables CSS dinámicas para cambios de tema instantáneos

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
- **Dependencias principales:**
  - React 18.x
  - Recharts (para gráficos interactivos)
  - Lucide React (iconografía)
- **Privilegios:** Administrador (recomendado para funciones avanzadas)
- **PowerShell:** 5.0 o superior
- **Memoria RAM:** Mínimo 4GB (recomendado 8GB para análisis extensos)

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
- Tabla responsiva que se adapta a todos los temas

#### ⚠️ Procesos Sospechosos
- Lista filtrada de conexiones con riesgo elevado
- Sistema de puntuación de riesgo (1-5)
- Razones específicas de la detección
- Opciones de acción directa
- Indicadores visuales de riesgo por colores

#### 📊 Análisis (NUEVO)
- **Estadísticas en Tiempo Real**: Métricas de seguridad actualizadas
- **Gráfico de Distribución Geográfica**: Visualización por países/regiones
- **Procesos Más Activos**: Ranking de procesos con mayor actividad
- **Actividad por Puerto**: Análisis de tráfico por puertos específicos
- **Gráficos Interactivos**: Powered by Recharts con tooltips informativos
- **Diseño Responsivo**: Se adapta perfectamente a todos los temas

#### 📝 Logs
- Registro de actividades del sistema
- Historial de detecciones y alertas
- Eventos del sistema con timestamps
- Filtrado por tipo de evento

### Controles Principales

- **🔍 Iniciar Monitoreo**: Comienza el análisis continuo
- **⏹️ Detener**: Pausa el monitoreo
- **🔄 Actualizar**: Escaneo manual único
- **💾 Exportar**: Genera reporte completo
- **🎨 Selector de Temas**: Cambio dinámico entre 4 temas disponibles
- **❓ Ayuda**: Modal integrado con documentación completa
- **⚙️ Configuración**: Panel FAB con opciones avanzadas

### 🎨 Sistema de Temas

La aplicación incluye 4 temas completamente funcionales:

#### 🌙 Tema Oscuro (Por defecto)
- Fondo principal: `#0f0f23`
- Acentos: Azul cian (`#00d4ff`) y Verde (`#2ed573`)
- Ideal para uso nocturno y sesiones prolongadas

#### ☀️ Tema Claro
- Fondo principal: `#f8f9fa`
- Acentos: Azul (`#0066cc`) y Verde (`#28a745`)
- Perfecto para uso diurno y ambientes bien iluminados

#### 🔵 Tema Azul
- Fondo principal: `#0d1421`
- Acentos: Azul profesional (`#3498db`)
- Diseño corporativo y profesional

#### 🟣 Tema Morado
- Fondo principal: `#1a0d2e`
- Acentos: Morado (`#9b59b6`)
- Diseño único y creativo

**Cambio de Tema**: Utiliza el selector en la esquina superior derecha para cambiar instantáneamente entre temas.

### 🧹 Limpieza Automática Programable

La nueva funcionalidad permite configurar limpiezas automáticas:

1. **Activar Limpieza Automática**: Marca la casilla "Programar Limpieza Automática"
2. **Configurar Frecuencia**: Usa el input numérico para establecer días (1-365)
3. **Confirmación Visual**: El texto se actualiza dinámicamente mostrando la frecuencia seleccionada
4. **Validación**: El sistema valida automáticamente el rango permitido

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
Network-Monitor-And-Cleaner/
├── src/
│   ├── App.js            # Aplicación principal React
│   ├── App.css           # Estilos con sistema de temas
│   ├── index.js          # Punto de entrada React
│   └── index.css         # Estilos globales
├── public/
│   ├── index.html        # Template HTML
│   ├── electron.js       # Configuración Electron
│   └── preload.js        # Script de preload Electron
├── app.py                # Aplicación Python (versión clásica)
├── network_monitor.ps1   # Script PowerShell independiente
├── package.json          # Dependencias Node.js y scripts
├── requirements.txt      # Dependencias Python
├── README.md            # Este archivo
└── exports/             # Carpeta para reportes (se crea automáticamente)
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

**Network Monitor And Cleaner** es una herramienta de análisis de seguridad. Su uso debe cumplir con:

- Leyes locales de privacidad y seguridad
- Políticas de la organización
- Términos de servicio de redes

**No nos hacemos responsables por el uso indebido de esta herramienta.**

## 📞 Soporte

Para reportar problemas o sugerir mejoras:
1. Revisar la sección de solución de problemas
2. Verificar logs de la aplicación
3. Documentar pasos para reproducir el problema

## 🚀 Tecnologías Utilizadas

### Versión React + Electron
- **Frontend**: React 18.x con Hooks modernos
- **Gráficos**: Recharts para visualizaciones interactivas
- **Iconografía**: Lucide React para iconos consistentes
- **Estilos**: CSS Variables para sistema de temas dinámico
- **Desktop**: Electron para aplicación nativa
- **Desarrollo**: Create React App con Hot Reload

### Versión Python
- **GUI**: Tkinter (biblioteca estándar)
- **Análisis**: PowerShell integrado
- **Compatibilidad**: Python 3.6+

---

**🛡️ Mantén tu sistema seguro - NMC Total**