#!/usr/bin/env python3
"""Copie le site construit à la racine du dépôt, à plat.

GitHub Pages sert la racine du dépôt. On y dépose donc les pages et les assets
côte à côte, sans sous-dossier : `assets/style.css` devient `style.css`.
Les fichiers du dépôt qui ne viennent pas du build (README, source/, .git) ne
sont jamais touchés.
"""
import pathlib, re, shutil, sys
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from paths import WORK, REPO

GARDER = {"README.md", ".nojekyll", ".gitignore", "CNAME", "source", ".git"}

def aplatir(txt, est_js=False):
    """Les pages sont servies à la racine : on enlève le préfixe assets/."""
    return re.sub(r"assets/img-", "img-", txt) if est_js else txt.replace("assets/", "")

def run():
    produits = []

    for f in sorted(WORK.glob("*.html")):
        (REPO/f.name).write_text(aplatir(f.read_text()))
        produits.append(f.name)

    for f in sorted(WORK.glob("*")):                      # sitemap.xml, robots.txt
        if f.is_file() and f.suffix in (".xml", ".txt"):
            shutil.copy2(f, REPO/f.name); produits.append(f.name)

    for f in sorted((WORK/"assets").iterdir()):
        if f.name == "app.js":
            (REPO/f.name).write_text(aplatir(f.read_text(), est_js=True))
        else:
            shutil.copy2(f, REPO/f.name)
        produits.append(f.name)

    # garde-fou : si un fichier généré disparaît un jour du build, on le signale
    orphelins = [p.name for p in REPO.iterdir()
                 if p.name not in GARDER and p.name not in produits and not p.name.startswith(".")]
    print(f"  {len(produits)} fichiers publies a la racine du depot")
    if orphelins:
        print("  a verifier, presents dans le depot mais plus produits :", ", ".join(orphelins))

if __name__ == "__main__":
    run()
