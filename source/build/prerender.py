#!/usr/bin/env python3
"""Écrit dans le HTML les textes que le JavaScript injectait.

Sans ça, un robot qui ne lance pas le JavaScript ne voit que ~190 caractères.
On ouvre chaque page dans un vrai navigateur, on lit le résultat, et on le
réécrit dans le fichier. Le JavaScript remet exactement la même chose au
chargement : rien ne change pour le visiteur, tout change pour Google.
"""
from playwright.async_api import async_playwright
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from paths import WORK
import re, json, asyncio


OUT   = WORK
FLAGS = ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"]

# conteneurs remplis par le JS dont le contenu est fixe pour une page et une langue
BOXES = ["svc-grid", "gal", "steps", "steps-h", "pg-inc", "pg-pr", "pg-faq",
         "pg-bul", "legal", "mt-1", "mt-2", "mt-3", "mt-quick"]

GRAB = """() => {
  const i18n = {}, ihtml = {}, pg = {}, box = {};
  document.querySelectorAll("[data-i18n]").forEach(e => i18n[e.dataset.i18n] = e.innerHTML);
  document.querySelectorAll("[data-i18n-html]").forEach(e => ihtml[e.dataset.i18nHtml] = e.innerHTML);
  document.querySelectorAll("[data-pg]").forEach(e => pg[e.dataset.pg] = e.innerHTML);
  %s.forEach(id => { const e = document.getElementById(id); if (e && e.innerHTML.trim()) box[id] = e.innerHTML; });
  return {i18n, ihtml, pg, box};
}""" % json.dumps(BOXES)


def fill_attr(html, attr, key, content):
    """Remplit l'élément vide porteur de attr="key"."""
    pat = re.compile(r'(<([a-zA-Z0-9]+)(?:\s[^>]*)?\s%s="%s"(?:\s[^>]*)?>)(</\2>)'
                     % (attr, re.escape(key)))
    return pat.sub(lambda m: m.group(1) + content + m.group(3), html)


def fill_id(html, ident, content):
    pat = re.compile(r'(<([a-zA-Z0-9]+)(?:\s[^>]*)?\sid="%s"(?:\s[^>]*)?>)(</\2>)' % re.escape(ident))
    return pat.sub(lambda m: m.group(1) + content + m.group(3), html)


async def main():
    pages = sorted(OUT.glob("*.html"))
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path="/opt/pw-browsers/chromium", args=FLAGS)
        pg = await b.new_page(viewport={"width": 1280, "height": 900})
        errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        for f in pages:
            await pg.goto(f.as_uri())
            await pg.wait_for_timeout(1200)
            d = await pg.evaluate(GRAB)
            html = f.read_text()
            before = len(re.sub(r"<[^>]+>", " ", html[html.index("<body"):]))
            for k, v in d["i18n"].items():
                if v.strip(): html = fill_attr(html, "data-i18n", k, v)
            for k, v in d["ihtml"].items():
                if v.strip(): html = fill_attr(html, "data-i18n-html", k, v)
            for k, v in d["pg"].items():
                if v.strip(): html = fill_attr(html, "data-pg", k, v)
            for k, v in d["box"].items():
                html = fill_id(html, k, v)
            f.write_text(html)
            after = len(re.sub(r"<[^>]+>", " ", html[html.index("<body"):]))
            print(f"  {f.name:20} {before:>6} -> {after:>6} caractères de texte")
        if errs:
            print("  ERREURS JS :", errs[:3])
        await b.close()

asyncio.run(main())
