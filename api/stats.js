// API de Vercel para estadísticas del repositorio y descargas
// Endpoint: /api/stats

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 's-maxage=300'); // Cache por 5 minutos

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const GITHUB_REPO = 'maxiusofmaximus/NMC-Total';
    
    // Obtener información del repositorio
    const [repoResponse, releasesResponse] = await Promise.all([
      fetch(`https://api.github.com/repos/${GITHUB_REPO}`, {
        headers: {
          'User-Agent': 'NMC-Total-Stats',
          'Accept': 'application/vnd.github.v3+json'
        }
      }),
      fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases`, {
        headers: {
          'User-Agent': 'NMC-Total-Stats',
          'Accept': 'application/vnd.github.v3+json'
        }
      })
    ]);

    if (!repoResponse.ok || !releasesResponse.ok) {
      throw new Error('Error al obtener datos del repositorio');
    }

    const repoData = await repoResponse.json();
    const releasesData = await releasesResponse.json();

    // Calcular estadísticas de descarga
    let totalDownloads = 0;
    const releaseStats = releasesData.map(release => {
      const releaseDownloads = release.assets.reduce((sum, asset) => sum + asset.download_count, 0);
      totalDownloads += releaseDownloads;
      
      return {
        version: release.tag_name,
        name: release.name,
        published_at: release.published_at,
        downloads: releaseDownloads,
        assets_count: release.assets.length,
        prerelease: release.prerelease,
        draft: release.draft
      };
    });

    // Estadísticas generales
    const stats = {
      success: true,
      repository: {
        name: repoData.name,
        full_name: repoData.full_name,
        description: repoData.description,
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
        watchers: repoData.watchers_count,
        issues: repoData.open_issues_count,
        language: repoData.language,
        size: repoData.size,
        created_at: repoData.created_at,
        updated_at: repoData.updated_at,
        pushed_at: repoData.pushed_at,
        homepage: repoData.homepage,
        html_url: repoData.html_url,
        clone_url: repoData.clone_url,
        topics: repoData.topics || []
      },
      downloads: {
        total: totalDownloads,
        releases_count: releasesData.length,
        latest_release: releasesData.length > 0 ? {
          version: releasesData[0].tag_name,
          name: releasesData[0].name,
          published_at: releasesData[0].published_at,
          downloads: releasesData[0].assets.reduce((sum, asset) => sum + asset.download_count, 0)
        } : null
      },
      releases: releaseStats.slice(0, 10), // Últimas 10 releases
      generated_at: new Date().toISOString()
    };

    res.status(200).json(stats);

  } catch (error) {
    console.error('Stats API Error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Error al obtener estadísticas',
      message: error.message,
      fallback: {
        repository_url: 'https://github.com/maxiusofmaximus/NMC-Total',
        releases_url: 'https://github.com/maxiusofmaximus/NMC-Total/releases'
      }
    });
  }
}