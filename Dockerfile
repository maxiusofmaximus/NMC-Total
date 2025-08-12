# Dockerfile para NMC Total - Network Monitor And Cleaner
# Imagen base con Node.js para la aplicación React + Electron
FROM node:18-alpine

# Información del mantenedor
LABEL maintainer="maxiusofmaximus@github.com"
LABEL description="NMC Total - Network Monitor And Cleaner"
LABEL version="1.0.0"

# Instalar dependencias del sistema necesarias
RUN apk add --no-cache \
    python3 \
    py3-pip \
    bash \
    curl \
    git \
    && rm -rf /var/cache/apk/*

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración de Node.js
COPY package*.json ./
COPY .npmrc ./

# Instalar dependencias de Node.js
RUN npm ci --only=production --no-audit

# Copiar el código fuente
COPY . .

# Construir la aplicación React
RUN npm run build

# Crear usuario no privilegiado para seguridad
RUN addgroup -g 1001 -S nmcuser && \
    adduser -S nmcuser -u 1001 -G nmcuser

# Cambiar permisos
RUN chown -R nmcuser:nmcuser /app

# Cambiar al usuario no privilegiado
USER nmcuser

# Exponer puerto para la aplicación web
EXPOSE 3000

# Variables de entorno
ENV NODE_ENV=production
ENV ELECTRON_DISABLE_SECURITY_WARNINGS=true

# Comando de inicio
CMD ["npm", "start"]

# Healthcheck para verificar que la aplicación esté funcionando
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000 || exit 1