# 🐳 NMC Total - Guía de Docker

## 📋 Requisitos Previos

- **Docker Desktop**: [Descargar aquí](https://www.docker.com/products/docker-desktop)
- **Git**: Para clonar el repositorio
- **4GB RAM mínimo**: Para ejecutar el contenedor

## 🚀 Instalación Rápida

### Opción 1: Usando Docker Hub (Recomendado)
```bash
# Descargar y ejecutar directamente
docker run -d --name nmc-total-app -p 3000:3000 maxiusofmaximus/network-monitor:latest
```

### Opción 2: Construir desde el código fuente
```bash
# Clonar el repositorio
git clone https://github.com/maxiusofmaximus/NMC-Total.git
cd NMC-Total

# Construir y ejecutar
npm run docker:build
npm run docker:run
```

### Opción 3: Usando Docker Compose
```bash
# Clonar el repositorio
git clone https://github.com/maxiusofmaximus/NMC-Total.git
cd NMC-Total

# Ejecutar con Docker Compose
docker-compose up -d
```

### Opción 4: Script Automático (Windows)
```batch
# Ejecutar el script de construcción automática
docker-build.bat
```

## 🌐 Acceso a la Aplicación

Una vez iniciado el contenedor, la aplicación estará disponible en:
- **URL**: http://localhost:3000
- **Puerto**: 3000

## 📊 Comandos Útiles

### Gestión del Contenedor
```bash
# Ver logs en tiempo real
docker logs -f nmc-total-app

# Detener la aplicación
docker stop nmc-total-app

# Iniciar la aplicación
docker start nmc-total-app

# Reiniciar la aplicación
docker restart nmc-total-app

# Eliminar el contenedor
docker rm nmc-total-app
```

### Scripts NPM Disponibles
```bash
# Construir imagen
npm run docker:build

# Ejecutar contenedor
npm run docker:run

# Ver logs
npm run docker:logs

# Detener contenedor
npm run docker:stop

# Eliminar contenedor
npm run docker:remove

# Docker Compose
npm run docker:compose:up
npm run docker:compose:down

# Limpiar sistema Docker
npm run docker:clean
```

## 🔧 Configuración Avanzada

### Variables de Entorno
```bash
# Ejecutar con variables personalizadas
docker run -d \
  --name nmc-total-app \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e ELECTRON_DISABLE_SECURITY_WARNINGS=true \
  maxiusofmaximus/network-monitor:latest
```

### Volúmenes Persistentes
```bash
# Ejecutar con volúmenes para persistir datos
docker run -d \
  --name nmc-total-app \
  -p 3000:3000 \
  -v nmc-data:/app/data \
  -v nmc-logs:/app/logs \
  maxiusofmaximus/network-monitor:latest
```

### Configuración de Red
```bash
# Ejecutar en red personalizada
docker network create nmc-network
docker run -d \
  --name nmc-total-app \
  --network nmc-network \
  -p 3000:3000 \
  maxiusofmaximus/network-monitor:latest
```

## 🛠️ Desarrollo con Docker

### Modo Desarrollo
```bash
# Construir imagen de desarrollo
docker build -f Dockerfile.dev -t nmc-total:dev .

# Ejecutar con hot reload
docker run -d \
  --name nmc-total-dev \
  -p 3000:3000 \
  -v $(pwd)/src:/app/src \
  nmc-total:dev
```

### Debugging
```bash
# Acceder al contenedor
docker exec -it nmc-total-app /bin/sh

# Ver procesos en el contenedor
docker exec nmc-total-app ps aux

# Ver uso de recursos
docker stats nmc-total-app
```

## 🔒 Consideraciones de Seguridad

### Configuración Segura
- El contenedor ejecuta con usuario no privilegiado
- Se aplican políticas de seguridad restrictivas
- Los secretos no se incluyen en la imagen
- Se utiliza imagen base Alpine para menor superficie de ataque

### Puertos y Firewall
- Solo el puerto 3000 está expuesto
- Configurar firewall según necesidades
- Usar HTTPS en producción con proxy reverso

## 📈 Monitoreo y Logs

### Health Checks
```bash
# Verificar estado del contenedor
docker inspect --format='{{.State.Health.Status}}' nmc-total-app

# Ver historial de health checks
docker inspect nmc-total-app | jq '.[0].State.Health'
```

### Logs Estructurados
```bash
# Logs con timestamp
docker logs -t nmc-total-app

# Últimas 100 líneas
docker logs --tail 100 nmc-total-app

# Logs desde una fecha específica
docker logs --since 2024-01-01T00:00:00 nmc-total-app
```

## 🚨 Solución de Problemas

### Problemas Comunes

**Error: Puerto 3000 en uso**
```bash
# Usar puerto diferente
docker run -d --name nmc-total-app -p 3001:3000 maxiusofmaximus/network-monitor:latest
```

**Error: Memoria insuficiente**
```bash
# Limitar memoria del contenedor
docker run -d --name nmc-total-app -p 3000:3000 --memory=2g maxiusofmaximus/network-monitor:latest
```

**Error: Permisos de Docker**
```bash
# En Linux/Mac, agregar usuario al grupo docker
sudo usermod -aG docker $USER
# Reiniciar sesión
```

### Logs de Diagnóstico
```bash
# Información completa del contenedor
docker inspect nmc-total-app

# Procesos en ejecución
docker top nmc-total-app

# Uso de recursos
docker stats --no-stream nmc-total-app
```

## 🔄 Actualizaciones

### Actualizar a Nueva Versión
```bash
# Detener contenedor actual
docker stop nmc-total-app
docker rm nmc-total-app

# Descargar nueva imagen
docker pull maxiusofmaximus/network-monitor:latest

# Ejecutar nueva versión
docker run -d --name nmc-total-app -p 3000:3000 maxiusofmaximus/network-monitor:latest
```

### Backup de Datos
```bash
# Crear backup de volúmenes
docker run --rm -v nmc-data:/data -v $(pwd):/backup alpine tar czf /backup/nmc-backup.tar.gz /data

# Restaurar backup
docker run --rm -v nmc-data:/data -v $(pwd):/backup alpine tar xzf /backup/nmc-backup.tar.gz -C /
```

## 📞 Soporte

Para problemas relacionados con Docker:
1. Revisar logs del contenedor
2. Verificar configuración de Docker
3. Consultar documentación oficial de Docker
4. Reportar issues en GitHub: https://github.com/maxiusofmaximus/NMC-Total/issues

---

**🛡️ NMC Total - Network Monitor And Cleaner**  
*Monitoreo de red profesional en contenedores Docker*