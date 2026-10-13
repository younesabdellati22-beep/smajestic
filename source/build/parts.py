import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from paths import INT
import re, sys as _s

#!/usr/bin/env python3
"""Découpe le corps de la home en fragments réutilisables.

On repère les blocs de premier niveau par leur structure (balise ouvrante en
colonne 0 et balise fermante correspondante en colonne 0), jamais par numéro de
ligne : ajouter ou retirer une ligne ailleurs ne peut plus tout décaler.
"""

base = INT
L = (base/"home_body.html").read_text().split("\n")

OPEN  = re.compile(r"^<(section|header|footer|div)\b")
blocks, i = [], 0
while i < len(L):
    m = OPEN.match(L[i])
    if not m:
        i += 1; continue
    tag, start, depth = m.group(1), i, 0
    while i < len(L):                     # on compte les ouvertures/fermetures en colonne 0
        if re.match(rf"^<{tag}\b", L[i]):  depth += 1
        if re.match(rf"^</{tag}>", L[i]):
            depth -= 1
            if depth == 0: break
        i += 1
    if depth != 0:
        sys.exit(f"ERREUR : bloc <{tag}> ouvert ligne {start+1} jamais refermé")
    blocks.append("\n".join(L[start:i+1]))
    i += 1

# chaque fragment est identifié par un marqueur qu'il est seul à contenir
MARKS = [("util",     'class="util"'),   ("header",   '<header class="top"'),
         ("hero",     'class="hero"'),   ("app",      'class="app"'),
         ("reviews",  'class="rev"'),    ("services", 'id="services"'),
         ("brands",   'data-i18n-html="br_h"'), ("trust",    'class="trust"'),
         ("strip",    'class="strip"'),
         ("works",    'id="realisations"'), ("contact", 'id="contact"'),
         ("avant",    'id="avant-apres"'),
         ("faq",      'class="faqblock"'), ("footer",  '<footer>'),
         ("mbar",     'class="mbar"')]

frag = {}
for name, mark in MARKS:
    hits = [b for b in blocks if mark in b]
    if len(hits) != 1:
        sys.exit(f"ERREUR : {len(hits)} bloc(s) pour « {name} » (marqueur {mark})")
    frag[name] = hits[0]

frag["topbar"] = frag.pop("util") + "\n\n" + frag.pop("header")

# contrôle : chaque fragment doit être équilibré en balises
for name, html in frag.items():
    for tag in ("section", "header", "footer", "div"):
        o = len(re.findall(rf"<{tag}\b", html))
        c = len(re.findall(rf"</{tag}>", html))
        if o != c:
            sys.exit(f"ERREUR : fragment « {name} » déséquilibré ({o} <{tag}> / {c} </{tag}>)")

d = base/"frag"; d.mkdir(exist_ok=True)
for p in d.glob("*.html"): p.unlink()
for k, v in frag.items():
    (d/(k+".html")).write_text(v+"\n")
    print(f"  {k:10} {len(v):6} o   {v.split(chr(10))[0][:56]}")
print(f"  {len(blocks)} blocs de premier niveau, tous équilibrés")
