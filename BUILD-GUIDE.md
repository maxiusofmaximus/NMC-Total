# 🔨 Guía de Compilación - NMC Total

## 📋 Requisitos Previos

### Node.js y npm
```bash
# Verificar instalación
node --version  # v18.0.0 o superior
npm --version   # v9.0.0 o superior
```

### Electron Builder
```bash
npm install -g electron-builder
```

## 🚀 Compilación Rápida

### 1. Instalar Dependencias
```bash
npm install
```

### 2. Compilar para Windows (.exe)
```bash
npm run dist:win
```
**Resultado:** `dist/NMC Total Setup 1.0.0.exe`

### 3. Compilar para macOS (.dmg)
```bash
# Solo desde macOS
npm run dist:mac
```
**Resultado:** `dist/NMC Total-1.0.0.dmg`

### 4. Compilar para Linux (AppImage)
```bash
# Desde Linux o WSL
npm run dist:linux
```
**Resultado:** `dist/NMC Total-1.0.0.AppImage`

## 📦 Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm start` | Servidor de desarrollo React |
| `npm run build` | Compilar React para producción |
| `npm run electron` | Ejecutar Electron |
| `npm run electron-dev` | Desarrollo con hot-reload |
| `npm run dist` | Compilar para plataforma actual |
| `npm run dist:win` | Compilar para Windows |
| `npm run dist:mac` | Compilar para macOS |
| `npm run dist:linux` | Compilar para Linux |

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
npm run electron-dev
```

### Solo React (sin Electron)
```bash
npm start
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
npm install -g electron-builder
```

### Error: "Python not found"
```bash
# Windows
npm install --global windows-build-tools

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
npm install && npm run dist:win

# Solo desarrollo
npm install && npm run electron-dev

# Limpiar y recompilar
rm -rf node_modules dist && npm install && npm run dist
```

---

**¡Listo para compilar binarios reales de NMC Total!** 🎉