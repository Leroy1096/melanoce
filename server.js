const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');
const zlib = require('zlib');

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

// Répertoire racine résilient (local ou Vercel Lambda)
const ROOT_DIR = fs.existsSync(path.join(__dirname, 'index.html')) 
  ? __dirname 
  : (fs.existsSync(path.join(process.cwd(), 'index.html')) ? process.cwd() : __dirname);

const FS_DIR = path.join(ROOT_DIR, 'melanoce_fs');

// Tracer statiquement index.html pour le bundler Vercel
const VERCEL_TRACED_INDEX = path.join(__dirname, 'index.html');

if (!fs.existsSync(FS_DIR)) {
  try {
    fs.mkdirSync(FS_DIR, { recursive: true });
    fs.writeFileSync(path.join(FS_DIR, 'bienvenue.txt'), 'Bienvenue dans MELA NOCE v1.0 !\nSlogan : Your Device. Your Universe.\nConception et réalisation : Kouamelan', 'utf8');
  } catch(e) {}
}

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.webmanifest': 'application/manifest+json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=UTF-8',
  '.md': 'text/markdown; charset=UTF-8'
};

function fetchRemoteUrl(targetUrl, maxRedirects, callback) {
  if (maxRedirects <= 0) {
    return callback(new Error('Nombre maximum de redirections atteint.'));
  }

  let parsed;
  try {
    parsed = new URL(targetUrl);
  } catch (e) {
    return callback(new Error('URL invalide : ' + targetUrl));
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return callback(new Error('Protocole non pris en charge : ' + parsed.protocol));
  }

  const client = parsed.protocol === 'https:' ? https : http;
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 MelaNoceBrowser/1.0',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
    'Accept-Encoding': 'gzip, deflate',
    'Referer': parsed.origin + '/'
  };

  const req = client.get(targetUrl, { headers, timeout: 15000 }, (res) => {
    if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
      const redirectUrl = new URL(res.headers.location, targetUrl).href;
      return fetchRemoteUrl(redirectUrl, maxRedirects - 1, callback);
    }

    let stream = res;
    const encoding = (res.headers['content-encoding'] || '').toLowerCase();
    if (encoding === 'gzip') {
      stream = res.pipe(zlib.createGunzip());
    } else if (encoding === 'deflate') {
      stream = res.pipe(zlib.createInflate());
    }

    const chunks = [];
    stream.on('data', chunk => chunks.push(chunk));
    stream.on('end', () => {
      const buffer = Buffer.concat(chunks);
      callback(null, {
        statusCode: res.statusCode,
        headers: res.headers,
        finalUrl: targetUrl,
        body: buffer
      });
    });
    stream.on('error', err => callback(err));
  });

  req.on('error', err => callback(err));
  req.on('timeout', () => {
    req.destroy();
    callback(new Error('Délai de connexion dépassé (Timeout).'));
  });
}

function handleRequest(req, res) {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  // --- API PROXY WEB HTTPS ---
  if (pathname === '/api/proxy' || pathname === '/api/proxy.js' || pathname.startsWith('/api/proxy')) {
    let target = parsedUrl.searchParams.get('url');
    if (!target) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Paramètre ?url= manquant.' }));
    }

    target = target.trim();
    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      target = 'https://' + target;
    }

    fetchRemoteUrl(target, 5, (err, remoteRes) => {
      if (err) {
        res.writeHead(502, { 'Content-Type': 'text/html; charset=UTF-8' });
        return res.end(`
          <!DOCTYPE html>
          <html lang="fr">
          <head>
            <meta charset="UTF-8">
            <title>Erreur de navigation — MELA NOCE Browser</title>
            <style>
              body { font-family: -apple-system, sans-serif; background: #0b0f19; color: #f8fafc; padding: 40px; text-align: center; }
              .box { max-width: 500px; margin: 40px auto; background: rgba(255,255,255,0.05); padding: 30px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); }
              h1 { color: #f87171; font-size: 1.4rem; }
              p { color: #94a3b8; font-size: 0.9rem; line-height: 1.5; margin-top: 10px; }
              code { background: rgba(0,0,0,0.4); padding: 4px 8px; border-radius: 6px; color: #38bdf8; word-break: break-all; }
              button { margin-top: 20px; padding: 10px 20px; background: #38bdf8; border: none; border-radius: 8px; color: #0b0f19; font-weight: bold; cursor: pointer; }
            </style>
          </head>
          <body>
            <div class="box">
              <h1>Impossible de charger la page</h1>
              <p>L'adresse suivante n'a pas pu être atteinte en HTTPS :</p>
              <p><code>${target}</code></p>
              <p style="color: #cbd5e1; font-size: 0.8rem;">Détail : ${err.message}</p>
              <button onclick="window.history.back()">Revenir en arrière</button>
            </div>
          </body>
          </html>
        `);
      }

      const contentType = remoteRes.headers['content-type'] || 'text/html';
      const isHtml = contentType.includes('text/html');

      const outHeaders = {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*'
      };

      if (isHtml) {
        let htmlStr = remoteRes.body.toString('utf-8');
        const finalUrl = remoteRes.finalUrl;
        const baseTag = `<base href="${finalUrl}">`;

        if (htmlStr.includes('<head>')) {
          htmlStr = htmlStr.replace('<head>', '<head>' + baseTag);
        } else if (htmlStr.includes('<HEAD>')) {
          htmlStr = htmlStr.replace('<HEAD>', '<HEAD>' + baseTag);
        } else {
          htmlStr = baseTag + htmlStr;
        }

        htmlStr = htmlStr.replace(/\s+target=["'](_blank|_top|_parent)["']/gi, ' target="_self"');

        const linkInterceptor = `
          <script>
            (function() {
              try {
                window.parent.postMessage({
                  type: 'MELANET_NAVIGATE',
                  url: ${JSON.stringify(finalUrl)},
                  title: document.title || ${JSON.stringify(target)}
                }, '*');
              } catch(e) {}

              document.addEventListener('click', function(e) {
                var a = e.target.closest('a');
                if (a && a.href && !a.href.startsWith('javascript:') && !a.href.startsWith('#')) {
                  e.preventDefault();
                  window.location.href = '/api/proxy?url=' + encodeURIComponent(a.href);
                }
              }, true);

              document.addEventListener('submit', function(e) {
                var form = e.target;
                if (form) {
                  e.preventDefault();
                  var formData = new FormData(form);
                  var params = new URLSearchParams(formData);
                  var action = form.getAttribute('action') || window.location.href;
                  var fullAction = new URL(action, ${JSON.stringify(finalUrl)}).href.split('?')[0];
                  window.location.href = '/api/proxy?url=' + encodeURIComponent(fullAction + '?' + params.toString());
                }
              }, true);
            })();
          </script>
        `;

        if (htmlStr.includes('</body>')) {
          htmlStr = htmlStr.replace('</body>', linkInterceptor + '</body>');
        } else if (htmlStr.includes('</BODY>')) {
          htmlStr = htmlStr.replace('</BODY>', linkInterceptor + '</BODY>');
        } else {
          htmlStr += linkInterceptor;
        }

        res.writeHead(remoteRes.statusCode, outHeaders);
        res.end(htmlStr);
      } else {
        res.writeHead(remoteRes.statusCode, outHeaders);
        res.end(remoteRes.body);
      }
    });
    return;
  }

  // --- API FICHIERS ---
  const isFilesRoute = pathname === '/api/files' || pathname === '/api/files.js' || pathname.startsWith('/api/files');
  if (isFilesRoute && req.method === 'GET') {
    const action = parsedUrl.searchParams.get('action');
    const fileName = parsedUrl.searchParams.get('name');
    if (action === 'read' || pathname.includes('/read') || fileName) {
      if (!fileName) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Nom de fichier manquant.' }));
      }
      const safePath = path.normalize(path.join(FS_DIR, fileName));
      fs.readFile(safePath, 'utf8', (err, data) => {
        if (err) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Fichier introuvable.' }));
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ name: fileName, content: data }));
      });
      return;
    }

    fs.readdir(FS_DIR, (err, fileNames) => {
      if (err) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ files: [] }));
      }
      const files = (fileNames || []).map(name => {
        try {
          const stats = fs.statSync(path.join(FS_DIR, name));
          return { name, isDirectory: stats.isDirectory(), size: stats.size, mtime: stats.mtime };
        } catch(e) {
          return { name, isDirectory: false, size: 0, mtime: new Date() };
        }
      });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ files }));
    });
    return;
  }

  if (isFilesRoute && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const fileName = (data.name || 'nouveau.txt').trim();
        const content = data.content !== undefined ? data.content : '';
        const safePath = path.normalize(path.join(FS_DIR, fileName));
        fs.writeFile(safePath, content, 'utf8', (err) => {
          if (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: err.message }));
          }
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: true, name: fileName, size: Buffer.byteLength(content) }));
        });
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'JSON invalide.' }));
      }
    });
    return;
  }

  if (isFilesRoute && req.method === 'DELETE') {
    const fileName = parsedUrl.searchParams.get('name');
    const safePath = path.normalize(path.join(FS_DIR, fileName || ''));
    try {
      if (fs.existsSync(safePath)) fs.unlinkSync(safePath);
    } catch(e) {}
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ success: true, name: fileName }));
  }

  // --- SÉCURITÉ : TOUTE ROUTE /api/ NON RECONNUE RETOURNE JSON 404, JAMAIS INDEX.HTML ---
  if (pathname.startsWith('/api/')) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Route API introuvable : ' + pathname }));
  }

  // --- SERVEUR DE FICHIERS STATIQUES ---
  const cleanPath = pathname === '/' ? 'index.html' : pathname.replace(/^\//, '');
  let resolvedPath = path.join(ROOT_DIR, cleanPath);

  // Recherche dans les dossiers de repli
  if (!fs.existsSync(resolvedPath)) {
    const alt1 = path.join(__dirname, cleanPath);
    const alt2 = path.join(process.cwd(), cleanPath);
    if (fs.existsSync(alt1)) resolvedPath = alt1;
    else if (fs.existsSync(alt2)) resolvedPath = alt2;
  }

  const ext = path.extname(resolvedPath).toLowerCase();

  // Si le fichier n'existe pas :
  if (!fs.existsSync(resolvedPath)) {
    // Si c'est un asset avec extension (js, css, png, json...), renvoyer 404 direct
    if (ext && ext !== '.html') {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
      return res.end('Fichier non trouvé : ' + cleanPath);
    }
    // Repli SPA index.html uniquement pour les routes HTML/sans extension
    resolvedPath = path.join(ROOT_DIR, 'index.html');
    if (!fs.existsSync(resolvedPath)) {
      resolvedPath = path.join(__dirname, 'index.html');
    }
  }

  const mime = MIME_TYPES[ext] || 'text/html; charset=UTF-8';

  fs.readFile(resolvedPath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
      return res.end('Erreur de lecture : ' + cleanPath);
    }
    res.writeHead(200, { 'Content-Type': mime });
    res.end(content);
  });
}

// Export pour Vercel Serverless Function & Serveur natif
module.exports = handleRequest;

if (require.main === module) {
  const server = http.createServer(handleRequest);
  server.listen(PORT, HOST, () => {
    console.log(`[MELA NOCE] Serveur actif sur http://${HOST}:${PORT}`);
  });
}
