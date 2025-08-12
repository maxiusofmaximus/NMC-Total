# NMC Total - Vercel Deployment Guide

## 📁 Estructura del Proyecto para Vercel

Este proyecto está configurado para desplegarse en Vercel como una página estática con APIs serverless.

### Archivos Principales

```
├── public/                 # Archivos estáticos (HTML, CSS, JS)
│   ├── index.html         # Página principal
│   ├── assets/
│   │   ├── style.css      # Estilos CSS
│   │   └── script.js      # JavaScript funcional
│   └── logos/
│       └── logo.svg       # Logo de la aplicación
├── api/                   # APIs serverless de Vercel
│   ├── download.js        # API para descargas desde GitHub
│   └── stats.js           # API para estadísticas del repositorio
├── vercel.json            # Configuración de Vercel
├── .vercelignore          # Archivos a ignorar en el deployment
└── package.json           # Configuración simplificada para Vercel
```

### Archivos de Desarrollo (No desplegados)

```
├── package-electron.json  # Configuración original con React/Electron
├── src/                   # Código fuente de React (desarrollo local)
├── Dockerfile             # Para desarrollo con Docker
├── docker-compose.yml     # Orquestación local
└── *.bat, *.ps1          # Scripts de Windows para desarrollo
```

## 🚀 Configuración de Vercel

### vercel.json

- **buildCommand**: Vacío para evitar builds de React
- **outputDirectory**: `public` para servir archivos estáticos
- **Routes**: Configuradas para APIs y archivos estáticos
- **Headers**: Seguridad HTTP configurada

### package.json

- Simplificado sin dependencias de React
- Solo comandos básicos para Vercel
- Node.js >= 18.0.0

## 🔧 Solución de Problemas

### Errores Comunes Resueltos

1. **`react-scripts: command not found`**
   - ✅ Solucionado: package.json simplificado sin React dependencies
   - ✅ buildCommand vacío en vercel.json

2. **`npm warn config cache-max/cache-min deprecated`**
   - ✅ Solucionado: .vercelignore incluye .npmrc
   - ✅ package.json actualizado sin configuraciones obsoletas

3. **`Running pip as root user warning`**
   - ✅ Solucionado: .vercelignore excluye archivos Python
   - ✅ requirements.txt no se procesa en Vercel

4. **`New major version of npm available`**
   - ✅ Solucionado: engines especifica Node.js >= 18.0.0
   - ✅ Vercel usa versiones actualizadas automáticamente

## 📋 Checklist de Deployment

- [x] vercel.json configurado correctamente
- [x] .vercelignore creado
- [x] package.json simplificado
- [x] Archivos estáticos en /public
- [x] APIs en /api
- [x] Routes configuradas
- [x] Headers de seguridad
- [x] Archivos de desarrollo excluidos

## 🌐 URLs de Producción

Cuando se despliegue en Vercel:

- **Página principal**: `https://tu-proyecto.vercel.app`
- **API de descarga**: `https://tu-proyecto.vercel.app/api/download`
- **API de estadísticas**: `https://tu-proyecto.vercel.app/api/stats`

## 🔄 Desarrollo Local vs Producción

### Para Desarrollo Local
```bash
# Usar package-electron.json
npm install
npm start  # React development server
```

### Para Vercel (Producción)
```bash
# Usar package.json (simplificado)
# Vercel maneja automáticamente el deployment
```

## 📝 Notas Importantes

1. **Archivos Estáticos**: Todo en `/public` se sirve directamente
2. **APIs Serverless**: Archivos en `/api` se ejecutan como funciones
3. **Sin Build Process**: No se ejecuta `npm run build`
4. **Configuración Dual**: Dos package.json para diferentes propósitos
5. **Exclusiones**: .vercelignore previene archivos innecesarios

Esta configuración asegura un deployment limpio y eficiente en Vercel sin conflictos de dependencias.