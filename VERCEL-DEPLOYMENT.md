# Configuración de Vercel para NMC Total

Este documento explica la estructura del proyecto y la configuración específica para el deployment en Vercel como sitio estático.

## Estructura del Proyecto para Vercel

### Archivos principales para Vercel:
- `public/` - Archivos estáticos (HTML, CSS, JS, imágenes)
- `api/` - Funciones serverless de Vercel
- `vercel.json` - Configuración simplificada de Vercel
- `package.json` - Configuración mínima (solo metadatos)
- `.vercelignore` - Archivos a ignorar en el deployment

### Archivos de desarrollo (IGNORADOS por Vercel):
- `src/` - Código fuente de React (solo para desarrollo local)
- `package-electron.json` - Configuración original de Electron
- `*.py` - Scripts de Python
- `*.bat`, `*.ps1` - Scripts de Windows
- `Dockerfile`, `docker-compose.yml` - Configuración de Docker
- `node_modules/` - Dependencias de Node.js

### Estructura Detallada

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

## 🚀 Configuración de Vercel

### `vercel.json` (Configuración Estática)
```json
{
  "version": 2,
  "builds": [
    {
      "src": "public/**/*",
      "use": "@vercel/static"
    },
    {
      "src": "api/**/*.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/assets/(.*)",
      "dest": "/public/assets/$1"
    },
    {
      "src": "/",
      "dest": "/public/index.html"
    },
    {
      "src": "/(.*)",
      "dest": "/public/$1"
    }
  ]
}
```

### `package.json` (Mínimo)
```json
{
  "name": "nmc-total-static",
  "version": "1.0.0",
  "description": "Static landing page for NMC Total",
  "private": true
}
```

**IMPORTANTE:** No incluir scripts de build ni dependencias para evitar que Vercel intente ejecutar procesos de build innecesarios.

### Configuración Clave

- **buildCommand**: Vacío para evitar builds de React
- **outputDirectory**: `public` para servir archivos estáticos
- **Routes**: Configuradas para APIs y archivos estáticos
- **Headers**: Seguridad HTTP configurada
- **Node.js**: >= 18.0.0

## 🔧 Solución de Problemas

### Error: `react-scripts: command not found`

**Causa**: Vercel detecta un `package.json` con scripts de build y intenta ejecutar `npm run build`.

**Solución Aplicada**:
1. ✅ Eliminado `buildCommand` y `outputDirectory` de `vercel.json`
2. ✅ Simplificado `package.json` sin scripts ni dependencias
3. ✅ Configurado `.vercelignore` para excluir archivos de desarrollo
4. ✅ Usado solo `@vercel/static` para archivos estáticos

### Advertencias Comunes (No críticas)

**Node.js version warning**: 
- Mensaje: `Detected "engines": { "node": ">=16.0.0" }`
- Solución: Normal, Vercel usa la versión LTS más reciente

**pip warning**: 
- Mensaje: `Running pip as the 'root' user`
- Solución: Normal en contenedores de Vercel, no afecta deployment

**npm cache warnings**: 
- Mensaje: `cache-max/cache-min deprecated`
- Solución: Advertencias de deprecación, no afectan funcionalidad

**npm update notice**:
- Mensaje: `New major version of npm available`
- Solución: Informativo, Vercel maneja las versiones automáticamente

## 📋 Checklist de Deployment

### Pre-deployment
- [x] `vercel.json` configurado solo para archivos estáticos
- [x] `package.json` mínimo sin scripts de build
- [x] `.vercelignore` excluye todos los archivos de desarrollo
- [x] APIs en `/api/` con funciones serverless
- [x] Archivos estáticos en `/public/`
- [x] Headers de seguridad configurados

### Post-deployment
- [ ] Verificar que el sitio carga correctamente
- [ ] Probar API de download: `/api/download`
- [ ] Probar API de stats: `/api/stats`
- [ ] Verificar detección automática de OS
- [ ] Configurar dominio personalizado (opcional)
- [ ] Configurar variables de entorno (si necesario)

## 🌐 URLs de Producción

- **Sitio Principal**: `https://nmc-total.vercel.app`
- **API Download**: `https://nmc-total.vercel.app/api/download`
- **API Stats**: `https://nmc-total.vercel.app/api/stats`

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

### Desarrollo vs Producción
- **Desarrollo Local**: Usar servidor HTTP simple (`python -m http.server 8080`)
- **Producción**: Vercel sirve archivos estáticos automáticamente
- **APIs**: Funciones serverless en Node.js (solo en producción)
- **Build Process**: NO hay proceso de build, solo archivos estáticos

### Estructura de Deployment
```
Vercel Deployment:
├── public/ → Servido como archivos estáticos
├── api/ → Funciones serverless de Node.js
└── vercel.json → Configuración de routing y headers
```

### Puntos Clave
1. **Archivos Estáticos**: Todo en `/public` se sirve directamente
2. **APIs Serverless**: Archivos en `/api` se ejecutan como funciones
3. **Sin Build Process**: No se ejecuta `npm run build`
4. **Configuración Dual**: Dos package.json para diferentes propósitos
5. **Exclusiones**: .vercelignore previene archivos innecesarios

Esta configuración asegura un deployment limpio y eficiente en Vercel sin conflictos de dependencias.