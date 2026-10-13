#!/usr/bin/env python3
"""Construit le site entier. C'est la seule commande à lancer :

    python3 source/build/make.py

Les cinq étapes, dans l'ordre (chacune dépend de la précédente) :

  1. split      source/template.html + source/app.src.js  ->  assets (style.css, app.js, images)
  2. parts      découpe le corps de la page d'accueil en fragments réutilisables
  3. ogimage    fabrique l'aperçu de lien (og.jpg) et les icônes
  4. build_site assemble les 18 pages FR + NL, le sitemap et robots.txt
  5. prerender  écrit dans le HTML les textes que le JavaScript injecte
  6. publish    recopie le tout à plat à la racine du dépôt, là où GitHub Pages sert
"""
import subprocess, sys, pathlib

BUILD = pathlib.Path(__file__).resolve().parent
ETAPES = ["split.py", "parts.py", "ogimage.py", "build_site.py", "prerender.py", "publish.py"]

for etape in ETAPES:
    print(f"\n--- {etape} ---")
    r = subprocess.run([sys.executable, str(BUILD/etape)], capture_output=True, text=True)
    sortie = (r.stdout or r.stderr).strip()
    print("\n".join(sortie.splitlines()[-8:]))
    if r.returncode:
        sys.exit(f"\nECHEC sur {etape} :\n{r.stderr[-2000:]}")

print("\nSite construit. Les fichiers a la racine du depot sont prets a etre commites.")
