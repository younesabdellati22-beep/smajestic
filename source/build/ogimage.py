#!/usr/bin/env python3
"""Génère l'aperçu de lien (1200x630) et les icônes du site."""
from PIL import Image, ImageDraw, ImageOps, ImageFilter, ImageFont
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from paths import ASSETS


A = ASSETS
W, H = 1200, 630
GOLD, INK, PAPER = (206,157,60), (13,13,12), (243,241,236)

def font(sz, bold=True):
    for p in ["/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold
              else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"]:
        if pathlib.Path(p).exists(): return ImageFont.truetype(p, sz)
    return ImageFont.load_default()

# fond : photo de chantier, recadrée et assombrie
bg = ImageOps.fit(Image.open(A/"img-svc-chassis.jpg").convert("RGB"), (W,H), Image.LANCZOS)
bg = bg.filter(ImageFilter.GaussianBlur(1.2))
# voile sombre : dégradé de la gauche (lisible) vers la droite (photo visible)
veil = Image.new("L",(W,H),0)
d = ImageDraw.Draw(veil)
for x in range(W):
    d.line([(x,0),(x,H)], fill=int(238 - 150*min(1,max(0,(x-120)/900))))
bg = Image.composite(Image.new("RGB",(W,H),(10,10,9)), bg, veil)

im = bg.convert("RGBA")
dr = ImageDraw.Draw(im)


# logo
lock = Image.open(A/"lockup.png").convert("RGBA")
lw = 420; lock = lock.resize((lw, round(lock.height*lw/lock.width)), Image.LANCZOS)
im.alpha_composite(lock, (72, 74))

TXT = {"fr": ("Châssis · Isolation · Rénovation", "Votre prix en ligne en 2 minutes",
              "Devis gratuit · Ronse et environs"),
       "nl": ("Ramen · Isolatie · Renovatie", "Uw prijs online in 2 minuten",
              "Gratis offerte · Ronse en omgeving")}

for lg, (t1, t2, t3) in TXT.items():
    card = im.copy()
    dr = ImageDraw.Draw(card)
    y = 74 + lock.height + 46
    f1, f2, f3 = font(52), font(40, False), font(27)
    dr.text((72, y), t1, font=f1, fill=PAPER)
    dr.text((72, y+72), t2, font=f2, fill=(200,197,188))
    by = H - 118
    wpill = round(dr.textlength(t3, font=f3)) + 72
    dr.rounded_rectangle([72, by, 72+wpill, by+66], radius=33, fill=GOLD)
    dr.text((72+36, by+19), t3, font=f3, fill=(26,18,6))
    card.convert("RGB").save(A/("og.jpg" if lg=="fr" else "og-nl.jpg"), quality=86, optimize=True)

# icônes : le lion sur fond sombre
logo = Image.open(A/"logo.png").convert("RGBA")
for size, name in ((180,"icon-180.png"), (32,"icon-32.png")):
    pad = round(size*0.12)
    c = Image.new("RGBA",(size,size),(13,13,12,255))
    l = ImageOps.contain(logo, (size-2*pad, size-2*pad), Image.LANCZOS)
    c.alpha_composite(l, ((size-l.width)//2, (size-l.height)//2))
    c.convert("RGB").save(A/name, optimize=True)

for n in ("og.jpg","og-nl.jpg","icon-180.png","icon-32.png"):
    print(f"  {n:14} {(A/n).stat().st_size/1024:6.1f} Ko")
