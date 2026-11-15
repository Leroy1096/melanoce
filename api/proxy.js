const http = require('http');
const https = require('https');
const url = require('url');
const zlib = require('zlib');

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

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
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
};
