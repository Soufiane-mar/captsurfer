# CaptSurfer — site vitrine one-page (photographe surf)

Date : 2026-10-07

## Contexte

Site de démonstration pour un photographe de surf, destiné à montrer un effet "wow" dans le hero : un appareil photo 3D qui s'assemble au scroll, puis dont on zoome dans l'objectif pour révéler le portfolio.

## Règle absolue

Aucun texte, slogan, prix ou section inventés. Les seuls textes autorisés sont ceux listés dans ce document. Toute information manquante doit être redemandée avant d'être supposée.

## Identité

- Nom du site : **CaptSurfer**
- Langue : anglais
- Ambiance : sombre et cinématique, fort contraste, typographie sobre, pas de couleurs vives
- Repo GitHub : `captsurfer` (public, compte `Soufiane-mar`)
- URL finale : `https://soufiane-mar.github.io/captsurfer/`

## Stack technique

- Vite (vanilla JavaScript, pas de framework)
- Three.js (modèle 3D natif, sans fichier externe)
- GSAP + ScrollTrigger (animation pilotée par le scroll, scrub, réversible)
- HTML/CSS natifs
- Déploiement GitHub Pages via GitHub Actions

## Structure de la page

1. Nav fixe : Home, Portfolio, Contact (scroll fluide, hamburger mobile)
2. Hero animé (Home), qui contient aussi le portfolio
3. Section Contact (formulaire démo)
4. Footer (icônes Instagram, TikTok, Pinterest — Simple Icons CC0, liens vides pour l'instant)

## Séquence du hero (cœur du projet)

Section pinnée, animation scrub (réversible en remontant) :

1. **État initial** : pièces de l'appareil éparpillées en étoile, légère rotation + flottement
2. **Assemblage** : chaque pièce rejoint sa position, trajectoires fluides et décalées
3. **Mise en face** : l'appareil assemblé pivote face à l'utilisateur
4. **Zoom dans l'objectif** : la caméra avance à travers les lentilles et le diaphragme
5. **Portfolio dans l'objectif** : relais vers une composition circulaire des 12 photos (cadre circulaire, vignettage, aberration chromatique légère, crédit discret par photo), le scroll fait défiler la composition
6. Retour à un scroll normal vers Contact

Le lien de nav **Portfolio** doit amener directement au moment où le portfolio est visible.

### Décision technique : rendu du portfolio

**Approche hybride retenue** (vs. 100% Three.js) : le zoom 3D amène la caméra au cœur de l'objectif, puis un overlay HTML/CSS (vraies `<img>`, masque circulaire, vignettage et aberration chromatique en CSS) prend le relais, piloté par le même scroll GSAP.

Raisons : vrai lazy-loading natif, crédits Unsplash cliquables et accessibles, bien plus robuste/performant sur mobile, plus simple à déboguer. L'effet visuel reste fidèle à la description d'origine.

### Modèle 3D de l'appareil

Construit en géométries Three.js natives, chaque pièce est un objet séparé : boîtier, capot supérieur, poignée, déclencheur, molette, viseur, monture d'objectif, fût de l'objectif, bagues de l'objectif, lentille frontale, lentilles internes, lamelles du diaphragme.

Matériaux PBR : métal brossé / plastique mat pour le boîtier, verre réaliste (MeshPhysicalMaterial, transmission, réflexions, légère teinte) pour les lentilles. Éclairage studio cinématique + environment map. Post-processing léger : bloom, vignettage.

## Photos du portfolio

- 12 photos, thème **surf et océan**, depuis Unsplash (`images.unsplash.com`)
- Chaque photo doit être vérifiée réellement existante (recherche via navigateur intégré avant intégration) — aucun identifiant inventé
- Données centralisées dans `src/data/photos.js` (url, nom du photographe, lien profil) pour remplacement facile plus tard
- Crédit discret sur chaque photo : "Photo by [Nom] on Unsplash", lien profil + lien Unsplash

## Section Contact

- Titre : "Contact"
- Champs : Name, Email, Message, bouton "Send"
- Mode démo uniquement : validation des champs (requis, format email), puis message de confirmation à l'écran, aucun envoi réel

## Footer

- Icônes SVG officielles Simple Icons (CC0) : Instagram, TikTok, Pinterest
- Liens vides (`href="#"`) regroupés dans `src/config/social-links.js`

## Exigences techniques transverses

- Responsive desktop/tablette/mobile, complexité 3D réduite sur mobile
- Respect de `prefers-reduced-motion` (version simplifiée sans animation lourde)
- Écran de chargement léger pendant l'init 3D
- Lazy loading des images
- Code commenté sobrement, organisé en modules

## Architecture des fichiers

```
captsurfer/
├── index.html
├── package.json, vite.config.js
├── .github/workflows/deploy.yml
├── src/
│   ├── main.js
│   ├── config/social-links.js
│   ├── data/photos.js
│   ├── scene/                # renderer, caméra, lumières, env map, post-processing
│   ├── camera-model/
│   │   ├── buildCamera.js
│   │   ├── parts/             # un module par pièce (cf. liste ci-dessus)
│   │   └── materials.js
│   ├── scroll/
│   │   ├── scrollTimeline.js  # timeline GSAP pinnée complète
│   │   └── reducedMotion.js
│   ├── portfolio/
│   │   ├── portfolioRing.js   # overlay HTML circulaire
│   │   └── photoCredit.js
│   ├── ui/                   # nav + hamburger, loading screen, contactForm
│   └── styles/main.css
└── README.md
```

## Livraison en 3 phases (validation à chaque étape)

1. Modèle 3D + séquence d'assemblage → démo locale avant de continuer
2. Zoom caméra + portfolio dans l'objectif
3. Contact, footer, déploiement GitHub Pages (via `gh` CLI — à installer/authentifier le moment venu)

## GitHub

- Compte : `Soufiane-mar`
- Dépôt public `captsurfer`, créé et poussé via `gh` CLI (prérequis : installer et authentifier `gh`, non fait à ce jour)
- `base` Vite configuré pour GitHub Pages, workflow Actions de déploiement auto sur push `main`
- README en anglais : lancement local, remplacement des photos, remplissage des liens réseaux sociaux

## Modèle Claude utilisé

- Bascule sur Opus pour la phase 1 (modèle 3D + animation)
- Sonnet pour le reste (zoom/portfolio, contact, footer, déploiement)
