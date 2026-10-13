#!/usr/bin/env python3
"""Découpe le fichier unique en assets partagés : style.css, app.js, images PNG."""
import re, base64, shutil, pathlib
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from paths import SRC, WORK, MEDIA, INT


base = SRC
out  = WORK
(out/"assets").mkdir(parents=True, exist_ok=True)

# ---- CSS
shell = (base/"template.html").read_text()
m = re.search(r"<style>\n(.*?)\n</style>\n", shell, re.S)
assert m, "bloc <style> introuvable"
(out/"assets"/"style.css").write_text(m.group(1))
body = shell[m.end():]                     # tout ce qui suit </style> = le corps de la home
head_extra = shell[:m.start()]             # <title>, three.js, fonts

# ---- JS
js = (base/"app.src.js").read_text()
js = re.sub(r"^<script>\n", "", js)
js = re.sub(r"</script>\s*$", "", js)
(out/"assets"/"app.js").write_text(js)

# ---- images optimisées (redimensionnées à la taille d'affichage) + three.js auto-hébergé
for src, dst in {"img_lockup.png":"lockup.png", "img_logo.png":"logo.png",
                 "three.min.js":"three.min.js"}.items():
    shutil.copy(MEDIA/src, out/"assets"/dst)
for stale in ("crest.png","word.png"):
    (out/"assets"/stale).unlink(missing_ok=True)
for img in MEDIA.glob("img-*.jpg"):          # photos de chantier déjà optimisées
    shutil.copy(img, out/"assets"/img.name)

# le corps de la home garde des placeholders %%LOCK%% etc. -> on les remplace par des chemins
body = (body.replace('src="data:image/png;base64,%%LOCK%%"',  'src="assets/lockup.png"')
            .replace('src="data:image/png;base64,%%LOGO%%"',  'src="assets/logo.png"')
            .replace('src="data:image/png;base64,%%CREST%%"', 'src="assets/crest.png"')
            .replace('src="data:image/png;base64,%%WORD%%"',  'src="assets/word.png"'))
(INT/"home_body.html").write_text(body)
(INT/"head_extra.html").write_text(head_extra)

for p in sorted((out/"assets").iterdir()):
    print(f"{p.name:14} {p.stat().st_size/1024:8.1f} Ko")
print("corps home   ", len(body)//1024, "Ko")
