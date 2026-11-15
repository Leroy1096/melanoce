# MELA NOCE — Système d'Exploitation Virtuel Hybride

> **Devise officielle :** *Your Device. Your Universe.*  
> **Signature officielle certifiée :** **« Conception et réalisation : Kouamelan »**  
> **Version :** 1.0.0 Stable

---

## 1. Présentation Générale

**MELA NOCE** est un environnement informatique virtuel de nouvelle génération conçu pour transformer n'importe quel appareil (ordinateur, tablette, smartphone) en une station de travail multitâche complète, fluide et sécurisée, sans nécessiter d'installation lourde.

L'environnement réunit la puissance et le confort d'un bureau de travail multitâche, la mobilité tactile d'un smartphone (mode Pocket PC), l'accès direct aux ressources du Web sans bridage d'iframe (navigateur MelaNet HTTPS), un système de fichiers persistant hybride, un terminal de commandes et un assistant IA interactif.

---

## 2. Architecture Technique

```
┌────────────────────────────────────────────────────────────────────────┐
│                      1. COUCHE EXPÉRIENCE VISUELLE                     │
│  Windows 11 Fluent UI • Linux IA Workstation • Pocket PC Mobile PWA   │
│  Dock • Gestionnaire de fenêtres déplaçables • Systray • Menu Démarrer │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                    2. SUITE LOGICIELLE INTÉGRÉE (V1)                   │
│  • MelaNet Browser : Navigateur Web HTTPS débloqueur d'iframe          │
│  • MelaFiles       : Explorateur de fichiers persistant                │
│  • MelaEdit        : Bloc-notes et éditeur de code avec métriques      │
│  • MelaCalc        : Calculatrice scientifique (Trigo, Deg/Rad, Log)   │
│  • MelaCalendar    : Calendrier interactif, Agenda & Horloge mondiale  │
│  • Terminal IA     : Interpréteur de commandes CLI système             │
│  • Assistant IA    : Copilote de navigation et création documentaire   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                  3. MOTEUR DE PERSISTANCE HYBRIDE                      │
│   Stockage Disque Distant (/api/files) ◄──► Stockage Local Sécurisé    │
│            (Zéro perte de données en ligne comme hors-ligne)           │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                      4. INFRASTRUCTURE & BACKEND                       │
│      Node.js Native Server • Vercel Serverless Functions (/api/*)      │
│              Service Worker PWA (Cache 100% Offline)                   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Emplacements de la Signature Officielle

Conformément aux directives de marque, la mention **« Conception et réalisation : Kouamelan »** est intégrée de façon permanente et visible dans :
1. **Écran de démarrage (Boot screen)** : Sous la barre d'initialisation du système.
2. **Écran de verrouillage / Connexion** : Profil administrateur et pied de page officiel.
3. **Bureau principal (Desktop)** : Filigrane officiel en bas à droite.
4. **Fenêtre système « À propos »** : Bannière certifiée mise en exergue avec logo officiel.
5. **Barre des tâches (Taskbar)** : Mention officielle discrète et élégante.
6. **Menu Démarrer (Start Menu)** : Profil administrateur et badge de conception.
7. **Terminal Système** : Commandes `info`, `signature`, et `neofetch`.
8. **Métadonnées PWA & SEO** : Manifest web, balises meta `author` et `description`.

---

## 4. Applications Intégrées

### A. Navigateur Web MelaNet HTTPS
- Navigation directe sur le Web mondial en HTTPS.
- Moteur de proxy débloqueur désarmant les en-têtes `X-Frame-Options` et `Content-Security-Policy: frame-ancestors`.
- Moteur de recherche DuckDuckGo intégré avec raccourcis Wikipédia, OpenStreetMap, etc.
- Bouton de secours instantané **↗ Ouvrir dans un onglet externe**.

### B. Explorateur de Fichiers MelaFiles & Bloc-Notes MelaEdit
- Moteur hybride : fonctionne en local sur disque, sur Cloud Serverless ou 100% hors-ligne dans le navigateur.
- Création, édition en direct, sauvegarde instantanée, suppression et téléchargement de documents.
- Statistiques de frappe en temps réel (lignes, mots, caractères).

### C. Calculatrice Scientifique MelaCalc
- Calculs arithmétiques standards et scientifiques.
- Fonctions trigonométriques (`sin`, `cos`, `tan`), logarithmes (`ln`, `log`), puissances, racines carrées (`√`), constantes mathématiques (`π`).
- Bascule d'angle Degrés / Radians (`DEG` / `RAD`).
- Raccourcis clavier complets.

### D. Calendrier, Agenda & Horloge Mondiale MelaCalendar
- Calendrier mensuel interactif avec navigation temporelle fluide.
- Bloc-notes d'agenda journalier associé à chaque date (sauvegarde automatique).
- Horloges mondiales en direct : Abidjan (GMT/UTC+0), Paris (UTC+1), New York (UTC-5), Tokyo (UTC+9).
- Chronomètre de haute précision au centième de seconde avec bouton de pause et réinitialisation.
- Accès direct en un clic depuis l'horloge de la barre des tâches.

### E. Terminal CLI Système
Commandes intégrées :
- `ls` : Lister tous les fichiers enregistrés
- `cat [fichier]` : Afficher le contenu d'un fichier
- `touch [fichier]` : Créer un fichier vierge
- `echo "texte" > [fichier]` : Écrire du contenu dans un fichier
- `edit [fichier]` : Ouvrir le document dans MelaEdit
- `rm [fichier]` : Supprimer un fichier
- `calc` : Lancer la Calculatrice scientifique
- `cal` : Afficher le calendrier
- `files` : Ouvrir l'explorateur MelaFiles
- `web [url]` : Ouvrir le navigateur Web
- `info` / `signature` : Afficher la signature officielle de Kouamelan
- `win11` / `linux` : Basculer d'interface à la volée
- `clear` : Nettoyer l'écran

---

## 5. Guide de Déploiement

### Exécution Locale & Serveur Dédié
```bash
# Vérification des composants
npm test

# Lancement du serveur Node.js (Port 3000)
npm start
```
Accédez ensuite à l'adresse : `http://localhost:3000`

### Déploiement Cloud Vercel
Le projet intègre `vercel.json` et les fonctions serverless dans `/api/` :
1. Créez ou reliez un dépôt GitHub pour le projet `melanoce`.
2. Connectez le projet dans votre tableau de bord Vercel.
3. Vercel compile et déploie automatiquement le site statique et les fonctions serverless `/api/proxy` et `/api/files`.

---

## 6. Licence & Droits

Conception, architecture et réalisation intégrale par **Kouamelan**.  
Tous droits réservés © 2026 MELA NOCE.
