# MELA NOCE — Spécifications Architecturales & Techniques

> **Signature officielle certifiée :** **« Conception et réalisation : Kouamelan »**  
> **Devise officielle :** *Your Device. Your Universe.*  
> **Version :** 1.0.0 Stable

---

## 1. Vue d'Ensemble du Système

MELA NOCE est conçu selon les principes d'une architecture modulaire distribuée, offrant une compatibilité maximale entre les environnements de bureau, mobiles et conteneurisés.

```
┌────────────────────────────────────────────────────────────────────────┐
│                          COUCHE UTILISATEUR                            │
│  - Thème Windows 11 Fluent (Mica Glassmorphism)                        │
│  - Thème Linux IA Workstation (Dark Monokai / Cyberpunk)               │
│  - Thème Pocket PC Mobile Convergence (Tactile Plein Écran)            │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                    GESTIONNAIRE DE FENÊTRES (WM)                       │
│  - Z-Index dynamique multi-fenêtres                                   │
│  - Drag-and-drop fluide avec maintien des limites d'écran              │
│  - Agrandissement plein écran, minimisation dans le Dock               │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                  SUITE LOGICIELLE MELA NOCE V1.0                       │
│  1. MelaNet Browser : Moteur Web HTTPS avec proxy débloqueur d'iframe  │
│  2. MelaFiles       : Explorateur de documents persistant              │
│  3. MelaEdit        : Bloc-notes avec comptage métrique dynamique      │
│  4. MelaCalc        : Calculatrice scientifique (Trigo, Deg/Rad, Log)  │
│  5. MelaCalendar    : Calendrier mensuel, Agenda journalier & World Tz │
│  6. Terminal IA     : CLI système (ls, cat, touch, rm, edit, calc)     │
│  7. Assistant IA    : Routage en langage naturel et pilotage de l'OS   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│               MOTEUR DE PERSISTANCE HYBRIDE (MelaStorage)              │
│  - Mode Connecté  : API REST (/api/files) sur disque distant           │
│  - Mode Hors-ligne: LocalStorage + IndexedDB (Zéro perte de données)   │
│  - Synchronisation bidirectionnelle automatique                        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                     INFRASTRUCTURE D'HÉBERGEMENT                       │
│  - Mode Serveur   : Node.js http/https/zlib (server.js - Port 3000)    │
│  - Mode Cloud     : Vercel Serverless Functions (/api/proxy, /api/files│
│  - Mode PWA       : Service Worker (sw.js) avec cache statique complet │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Analyse des Composants Clés

### Moteur Web MelaNet & Proxy HTTPS
- Les navigateurs conventionnels bloquent l'affichage de nombreux sites dans une iframe en raison des en-têtes `X-Frame-Options: SAMEORIGIN` ou `Content-Security-Policy: frame-ancestors`.
- Le proxy MELA NOCE réécrit ces réponses côté serveur/edge, injecte une balise `<base>` pour préserver les feuilles de style et chemins d'images relatifs, et réécrit les liens hypertextes pour conserver la navigation à l'intérieur du système MELA NOCE.
- Pour les sites bancaires ou nécessitant des cookies de session tiers stricts, un bouton de dérivation instantanée **↗ Ouvrir dans un onglet externe** garantit l'accès inconditionnel à l'information.

### Moteur de Persistance MelaStorage
- Les applications Web classiques dépendent soit exclusivement du serveur, soit exclusivement du navigateur. MELA NOCE fusionne ces deux approches :
  - Dès l'écriture d'une note ou d'un fichier, le contenu est immédiatement inscrit en mémoire sécurisée locale (`localStorage`).
  - Si le serveur distant ou la fonction serverless répond, la copie disque est synchronisée de façon transparente.
  - Résultat : aucune interruption de service pour l'utilisateur, même en cas de déconnexion réseau temporaire en mobilité.

### PWA & Mobilité Pocket PC
- Le fichier `manifest.webmanifest` associé au Service Worker `sw.js` permet à MELA NOCE d'être installé sur écran d'accueil Android ou iOS comme une véritable application native.
- L'affichage s'adapte automatiquement : sur smartphone, les fenêtres s'ancrent en plein écran tactile ergonomique ; sur grand écran, le multitâche multi-fenêtres s'active spontanément.

---

## 3. Matrice de Tests et Validation

| Module | Test effectué | Résultat |
| :--- | :--- | :---: |
| Serveur HTTP Node.js | Écoute sur 0.0.0.0:3000, gestion MIME, routage | ✅ Validé (200 OK) |
| API REST Fichiers | GET, POST, DELETE, READ sur `/api/files` | ✅ Validé |
| Proxy Web HTTPS | Traversée de redirection, compression gzip/deflate | ✅ Validé |
| Calculatrice Scientifique | Opérations arithmétiques, trigonométrie, Deg/Rad | ✅ Validé |
| Calendrier & Agenda | Génération dynamique des mois, notes journalières | ✅ Validé |
| Horloge Mondiale | Fuseaux horaires en direct (Abidjan, Paris, NY, Tokyo) | ✅ Validé |
| PWA Service Worker | Mise en cache et service offline | ✅ Validé |
| Intégrité de la Signature | Présence permanente : « Conception et réalisation : Kouamelan » | ✅ 100% Conforme |
