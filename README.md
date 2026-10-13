# S.Majestic — site web

Site vitrine et calculateur de prix de **S. MAJESTIC BV** (Sint-Cornelisstraat 59, 9600 Ronse — BE 1020.521.459).
Bilingue français / néerlandais, sans framework : HTML, CSS et JavaScript simples, plus Three.js pour la maison en 3D.

En ligne : <https://younesabdellati22-beep.github.io/smajestic/>

---

## ⚠️ À lire avant de modifier quoi que ce soit

**Les fichiers à la racine du dépôt sont générés. Ne les modifiez pas à la main :
la prochaine construction les écrasera.**

On édite ce qui est dans `source/`, puis on relance la construction :

```bash
python3 source/build/make.py
```

La commande régénère les 58 fichiers de la racine. On les commit, GitHub Pages publie.

---

## Organisation

```
/                        le site publié par GitHub Pages — GÉNÉRÉ, ne pas éditer
│                        (18 pages .html, app.js, style.css, images, sitemap.xml, robots.txt)
│
└── source/              tout ce qui s'édite à la main
    ├── template.html    structure HTML de l'accueil + la totalité de la CSS
    ├── app.src.js       toute la logique : textes FR/NL, prix, maison 3D, formulaires
    ├── content/
    │   ├── fr.js        textes des pages services, en français
    │   ├── nl.js        idem en néerlandais
    │   └── legal.js     mentions légales et vie privée
    ├── media/           photos de chantier, logos, three.js
    └── build/           les scripts de construction
```

`source/.work/` apparaît pendant la construction. C'est du jetable, il n'est pas suivi par git.

---

## Comment la construction fonctionne

`source/build/make.py` enchaîne six étapes, chacune dans son fichier :

| | Étape | Ce qu'elle fait |
|---|---|---|
| 1 | `split.py` | Sépare `template.html` en `style.css` d'un côté, le corps de la page de l'autre. Copie `app.src.js` en `app.js` et les médias dans les assets. |
| 2 | `parts.py` | Découpe le corps de l'accueil en fragments (en-tête, hero, services, FAQ, pied de page…) réutilisés par les autres pages. **Repère les blocs par leur structure, jamais par numéro de ligne**, et refuse de continuer si une balise n'est pas refermée. |
| 3 | `ogimage.py` | Fabrique l'aperçu de lien (`og.jpg`, `og-nl.jpg`) et les icônes à partir du logo et d'une photo. |
| 4 | `build_site.py` | Assemble les 18 pages à partir des fragments, injecte `content/*.js` dans `app.js`, écrit les balises `title`, `description`, `canonical`, `hreflang`, la fiche d'entreprise JSON-LD, puis `sitemap.xml` et `robots.txt`. |
| 5 | `prerender.py` | Ouvre chaque page dans Chromium et **réécrit dans le HTML les textes que le JavaScript injecte**. Sans cette étape une page ne contient que ~190 caractères lisibles par un robot ; avec, environ 5 000. Le JavaScript remet la même chose au chargement, le visiteur ne voit aucune différence. |
| 6 | `publish.py` | Recopie le résultat à plat à la racine du dépôt : `assets/style.css` devient `style.css`, parce que GitHub Pages sert la racine. |

`source/build/paths.py` définit les quatre dossiers. Aucun script ne contient de chemin en dur :
le projet se construit depuis n'importe où sur n'importe quelle machine.

**Dépendances :** Python 3, `playwright` (+ Chromium) pour l'étape 5, `pillow` pour l'étape 4.

---

## Les deux langues

Une page = une langue = une URL, pour que Google indexe le néerlandais séparément.

| Français | Nederlands |
|---|---|
| `/` | `/nl.html` |
| `chassis.html` | `ramen.html` |
| `isolation.html` | `isolatie.html` |
| `solaire.html` | `zonnepanelen.html` |
| `clim.html` | `airco.html` |
| `finitions.html` | `afwerking.html` |
| `renovation.html` | `renovatie.html` |
| `materiel.html` | `materieel.html` |
| `mentions.html` | `juridisch.html` |

La correspondance est déclarée à deux endroits qu'il faut garder d'accord :
`NL_FILE` dans `build/build_site.py` et `PAIR` dans `source/app.src.js`.
Le bouton FR/NL ne traduit pas sur place : il emmène vers la page jumelle.

Le dictionnaire des textes communs est l'objet `T = {fr:{…}, nl:{…}}` au début de `app.src.js`.
Dans le HTML, `data-i18n` remplace le texte, `data-i18n-html` remplace le contenu HTML,
`data-pg` prend dans `content/fr.js` ou `content/nl.js` selon la page.

---

## Le calculateur de prix

Les tarifs sont des constantes en haut de `app.src.js`, chacune commentée avec son origine :

- `RATE`, `FORFAIT`, `ISO`, `SOL`, `CLIM` — moyennes du marché belge 2026, **à remplacer par les tarifs réels**
- `FIN.plafo`, `FIN.cloison`, `FIN.rf`, `FIN.sol`, `MAT` — tarifs communiqués par S.Majestic
- `MARGIN` — largeur de la fourchette affichée (±10 %)

Les prix sont calculés hors TVA, puis la TVA (6 % si le logement a plus de dix ans, sinon 21 %) est appliquée.
**L'écran affiche le bas de la fourchette**, précédé de « à partir de », avec le haut de fourchette à côté :
c'est une estimation, jamais une offre, et la page le dit sous le prix et dans le formulaire.

## Les formulaires

Les deux formulaires envoient vers `info@smajestic.be` via FormSubmit (`FORM_EP` dans `app.src.js`),
sans serveur. **La première demande déclenche un e-mail de confirmation qu'il faut activer une fois**,
sinon rien n'arrive. Si l'envoi échoue, le visiteur reçoit le numéro de téléphone.

---

## Si le domaine change

Une seule ligne à modifier, `SITE` en haut de `source/build/build_site.py`.
Elle alimente `canonical`, `hreflang`, l'aperçu de lien, le sitemap, `robots.txt` et la fiche JSON-LD.
Puis on reconstruit.
