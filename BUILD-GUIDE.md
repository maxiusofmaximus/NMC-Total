# 🔨 Guía de Compilación - NMC Total

## 📋 Requisitos Previos

### Node.js y pnpm
```bash
# Verificar instalación
node --version  # v18.0.0 o superior
pnpm --version  # v10 o superior
```

electron-builder se instala como devDependency con `pnpm install`; no hace falta instalarlo globalmente.

## 🎨 Logo de la Aplicación

NMC Total incluye un logo SVG personalizado ubicado en `public/logo.svg` que representa:
- Monitoreo de red con nodos conectados y animaciones de flujo de datos
- Limpieza del sistema con un ícono de cepillo de limpieza
- Diseño moderno con gradientes en colores azul y verde
- Ondas de señal animadas y paquetes de datos

El logo se utiliza automáticamente como ícono de la aplicación para todas las plataformas (Windows, macOS, Linux).

## 🚀 Compilación Rápida

### 1. Instalar Dependencias
```bash
pnpm install
```

### 2. Compilar para Windows (.exe)
```bash
pnpm run dist:win
```
**Resultado:** `dist/NMC Total Setup 1.0.0.exe`

### 3. Compilar para macOS (.dmg)
```bash
# Solo desde macOS
pnpm run dist:mac
```
**Resultado:** `dist/NMC Total-1.0.0.dmg`

### 4. Compilar para Linux (AppImage)
```bash
# Desde Linux o WSL
pnpm run dist:linux
```
**Resultado:** `dist/NMC Total-1.0.0.AppImage`

## 📦 Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `pnpm start` | Servidor de desarrollo React |
| `pnpm run build` | Compilar React para producción |
| `pnpm run electron` | Ejecutar Electron |
| `pnpm run electron-dev` | Desarrollo con hot-reload |
| `pnpm run dist` | Compilar para plataforma actual |
| `pnpm run dist:win` | Compilar para Windows |
| `pnpm run dist:mac` | Compilar para macOS |
| `pnpm run dist:linux` | Compilar para Linux |

## 🔧 Configuración Avanzada

### Arquitecturas Soportadas
- **Windows:** x64
- **macOS:** x64, ARM64 (Apple Silicon)
- **Linux:** x64

### Archivos Incluidos
- Aplicación React compilada
- Scripts PowerShell
- Electron runtime
- Dependencias necesarias

## 📁 Estructura de Salida

```
dist/
├── NMC Total Setup 1.0.0.exe     # Windows Installer
├── NMC Total-1.0.0.dmg           # macOS Disk Image
├── NMC Total-1.0.0.AppImage      # Linux AppImage
└── win-unpacked/                 # Windows Unpacked
```

## 🛠️ Desarrollo

### Ejecutar en Modo Desarrollo
```bash
pnpm run electron-dev
```

### Solo React (sin Electron)
```bash
pnpm start
```

## 📋 Notas Importantes

1. **Windows:** Requiere Windows 10 o superior
2. **macOS:** Requiere macOS 10.15 o superior
3. **Linux:** Compatible con la mayoría de distribuciones
4. **Tamaño:** ~150-200MB por plataforma
5. **Firma:** Los binarios no están firmados digitalmente

## 🔍 Solución de Problemas

### Error: "electron-builder not found"
```bash
pnpm install
```

### Error: "Python not found"
```bash
# Windows
pnpm add -g windows-build-tools

# macOS
xcode-select --install

# Linux
sudo apt-get install build-essential
```

### Error de permisos en macOS
```bash
sudo chown -R $(whoami) ~/.npm
```

## ⚡ Comandos Rápidos

```bash
# Compilación completa Windows
pnpm install && pnpm run dist:win

# Solo desarrollo
pnpm install && pnpm run electron-dev

# Limpiar y recompilar
rm -rf node_modules dist && pnpm install && pnpm run dist
```

---

**¡Listo para compilar binarios reales de NMC Total!** 🎉