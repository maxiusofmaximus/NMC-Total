// API de Vercel para manejar descargas desde GitHub Releases
// Endpoint: /api/download

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { platform, version = 'latest' } = req.query;

    // Información del repositorio
    const GITHUB_REPO = 'maxiusofmaximus/NMC-Total';
    const GITHUB_API = `https://api.github.com/repos/${GITHUB_REPO}/releases/${version}`;

    // Obtener información de la release desde GitHub
    const response = await fetch(GITHUB_API, {
      headers: {
        'User-Agent': 'NMC-Total-Downloader',
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const releaseData = await response.json();

    // Mapear plataformas a archivos
    const platformMap = {
      'windows': {
        patterns: ['.exe', 'win', 'windows'],
        name: 'Windows'
      },
      'mac': {
        patterns: ['.dmg', '.pkg', 'mac', 'darwin'],
        name: 'macOS'
      },
      'linux': {
        patterns: ['.deb', '.rpm', '.appimage', 'linux'],
        name: 'Linux'
      },
      'source': {
        patterns: ['source', '.zip', '.tar.gz'],
        name: 'Código Fuente'
      }
    };

    // Encontrar el asset correcto
    let downloadAsset = null;
    
    if (platform && platformMap[platform]) {
      const patterns = platformMap[platform].patterns;
      downloadAsset = releaseData.assets.find(asset => 
        patterns.some(pattern => 
          asset.name.toLowerCase().includes(pattern.toLowerCase())
        )
      );
    }

    // Si no se encuentra un asset específico, usar el primer asset disponible
    if (!downloadAsset && releaseData.assets.length > 0) {
      downloadAsset = releaseData.assets[0];
    }

    // Preparar respuesta
    const downloadInfo = {
      success: true,
      release: {
        version: releaseData.tag_name,
        name: releaseData.name,
        description: releaseData.body,
        published_at: releaseData.published_at,
        html_url: releaseData.html_url
      },
      download: downloadAsset ? {
        name: downloadAsset.name,
        size: downloadAsset.size,
        download_url: downloadAsset.browser_download_url,
        download_count: downloadAsset.download_count
      } : null,
      all_assets: releaseData.assets.map(asset => ({
        name: asset.name,
        size: asset.size,
        download_url: asset.browser_download_url,
        download_count: asset.download_count
      })),
      repository: {
        url: `https://github.com/${GITHUB_REPO}`,
        clone_url: `https://github.com/${GITHUB_REPO}.git`,
        zip_url: `https://github.com/${GITHUB_REPO}/archive/refs/heads/main.zip`
      }
    };

    // Si se solicita descarga directa
    if (req.query.direct === 'true' && downloadAsset) {
      res.redirect(302, downloadAsset.browser_download_url);
      return;
    }

    res.status(200).json(downloadInfo);

  } catch (error) {
    console.error('Download API Error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Error al obtener información de descarga',
      message: error.message,
      fallback: {
        repository_url: 'https://github.com/maxiusofmaximus/NMC-Total',
        manual_download: 'https://github.com/maxiusofmaximus/NMC-Total/releases/latest',
        source_code: 'https://github.com/maxiusofmaximus/NMC-Total/archive/refs/heads/main.zip'
      }
    });
  }
}

// Función auxiliar para detectar plataforma desde User-Agent
function detectPlatform(userAgent) {
  const ua = userAgent.toLowerCase();
  
  if (ua.includes('windows') || ua.includes('win32') || ua.includes('win64')) {
    return 'windows';
  }
  if (ua.includes('mac') || ua.includes('darwin')) {
    return 'mac';
  }
  if (ua.includes('linux') || ua.includes('ubuntu') || ua.includes('debian')) {
    return 'linux';
  }
  
  return 'source';
}