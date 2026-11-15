const fs = require('fs');
const path = require('path');
const os = require('os');

// En environnement Vercel Serverless, /tmp est le seul répertoire inscriptible
const FS_DIR = process.env.VERCEL ? path.join(os.tmpdir(), 'melanoce_fs') : path.join(process.cwd(), 'melanoce_fs');

function ensureFsDir() {
  if (!fs.existsSync(FS_DIR)) {
    fs.mkdirSync(FS_DIR, { recursive: true });
    // Fichiers par défaut
    const defaultFiles = [
      {
        name: 'bienvenue.txt',
        content: `Bienvenue dans MELA NOCE v1.0 !\nSlogan : Your Device. Your Universe.\nConception et réalisation : Kouamelan\n\nMELA NOCE est votre environnement informatique personnel multiplateforme :\n- Bureau virtuel multitâche (Windows 11 & Linux IA)\n- Navigateur Web HTTPS débloqueur\n- Explorateur de fichiers persistant\n- Bloc-notes & éditeur de code\n- Terminal de commandes\n- Assistant IA\n- Calculatrice scientifique & Calendrier`
      },
      {
        name: 'projet_mela.md',
        content: `# MELA NOCE — Spécifications Techniques\n\n- **Auteur & Concepteur :** Kouamelan\n- **Version :** 1.0.0 Stable\n- **Plateformes :** Web Desktop, Linux Container, Android PWA Pocket PC\n- **Signature Officielle :** Conception et réalisation : Kouamelan\n- **Sécurité :** Chiffrement HTTPS, bac à sable iframe, stockage résilient.`
      }
    ];

    defaultFiles.forEach(f => {
      try {
        fs.writeFileSync(path.join(FS_DIR, f.name), f.content, 'utf8');
      } catch (e) {}
    });
  }
}

module.exports = async (req, res) => {
  ensureFsDir();

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const action = (req.query && req.query.action) || parsedUrl.searchParams.get('action') || (parsedUrl.pathname.includes('/read') ? 'read' : null);

  // 1. Lecture de la liste des fichiers : GET /api/files
  if (req.method === 'GET' && !action && !parsedUrl.searchParams.get('name')) {
    try {
      const fileNames = fs.readdirSync(FS_DIR);
      const files = fileNames.map(name => {
        const filePath = path.join(FS_DIR, name);
        try {
          const stats = fs.statSync(filePath);
          return {
            name,
            size: stats.size,
            mtime: stats.mtime,
            type: path.extname(name).replace('.', '') || 'txt'
          };
        } catch (e) {
          return { name, size: 0, mtime: new Date(), type: 'txt' };
        }
      });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ files }));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: e.message }));
    }
  }

  // 2. Lecture d'un fichier : GET /api/files?name=... ou GET /api/files/read?name=...
  if (req.method === 'GET' && (action === 'read' || parsedUrl.searchParams.get('name'))) {
    const fileName = parsedUrl.searchParams.get('name');
    if (!fileName) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Nom de fichier manquant.' }));
    }
    const safePath = path.normalize(path.join(FS_DIR, fileName));
    if (!safePath.startsWith(FS_DIR)) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Accès interdit.' }));
    }
    try {
      if (!fs.existsSync(safePath)) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Fichier introuvable.' }));
      }
      const data = fs.readFileSync(safePath, 'utf8');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ name: fileName, content: data }));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: e.message }));
    }
  }

  // 3. Écriture / Sauvegarde : POST /api/files
  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const fileName = (data.name || 'nouveau_fichier.txt').trim();
        const content = data.content !== undefined ? data.content : '';
        const safePath = path.normalize(path.join(FS_DIR, fileName));
        if (!safePath.startsWith(FS_DIR)) {
          res.writeHead(403, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Accès interdit.' }));
        }
        fs.writeFileSync(safePath, content, 'utf8');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: true, name: fileName, size: Buffer.byteLength(content) }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Format JSON invalide ou écriture impossible.' }));
      }
    });
    return;
  }

  // 4. Suppression : DELETE /api/files?name=...
  if (req.method === 'DELETE') {
    const fileName = parsedUrl.searchParams.get('name');
    if (!fileName) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Nom de fichier manquant.' }));
    }
    const safePath = path.normalize(path.join(FS_DIR, fileName));
    if (!safePath.startsWith(FS_DIR)) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Accès interdit.' }));
    }
    try {
      if (fs.existsSync(safePath)) {
        fs.unlinkSync(safePath);
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: true, name: fileName }));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: e.message }));
    }
  }

  res.writeHead(405, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Méthode non autorisée.' }));
};
