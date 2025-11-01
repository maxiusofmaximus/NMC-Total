const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Iniciando build personalizado para NMC Total...');

// 1. Ejecutar el build normal de React
console.log('📦 Ejecutando build de React...');
execSync('react-scripts build', { stdio: 'inherit' });

// 2. Crear app.html para la aplicación Electron
console.log('🔧 Creando app.html para la aplicación...');

const buildDir = path.join(__dirname, '..', 'build');
const appHtmlPath = path.join(buildDir, 'app.html');
const indexHtmlPath = path.join(buildDir, 'index.html');

// Leer el contenido del index.html generado por React
let indexContent = fs.readFileSync(indexHtmlPath, 'utf8');

// Crear una versión limpia para la aplicación (sin la página web de descarga)
const appHtmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8" />
    <link rel="icon" href="./logo.ico" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="NMC Total - Network Monitor And Cleaner Application" />
    <title>NMC Total - Network Monitor</title>
    ${indexContent.match(/<link[^>]*\.css[^>]*>/g)?.join('\n    ') || ''}
    ${indexContent.match(/<script[^>]*defer[^>]*>/g)?.join('\n    ') || ''}
</head>
<body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
</body>
</html>`;

// Escribir app.html
fs.writeFileSync(appHtmlPath, appHtmlContent);

// 3. Restaurar index.html original para la página web
console.log('🌐 Restaurando index.html para la página web...');
const originalIndexPath = path.join(__dirname, '..', 'public', 'index.html');
const originalIndexContent = fs.readFileSync(originalIndexPath, 'utf8');

// Reemplazar index.html con la página web original
fs.writeFileSync(indexHtmlPath, originalIndexContent);

console.log('✅ Build completado exitosamente!');
console.log('📄 index.html -> Página web de descarga');
console.log('📱 app.html -> Aplicación React para Electron');