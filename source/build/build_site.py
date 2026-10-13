import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from paths import BUILD, WORK, CONTENT, INT
import shutil, re, hashlib, json

#!/usr/bin/env python3
"""Génère les 18 pages du site dans source/.work/ (voir paths.py)."""

B   = BUILD
OUT = WORK

# 1) fragments produits par split.py et parts.py
F = {p.stem: p.read_text() for p in (INT/"frag").iterdir()}

# 2) contenu des pages injecté dans app.js, juste avant applyLang()
app = (OUT/"assets"/"app.js").read_text()
content = ((CONTENT/"fr.js").read_text() + "\n" + (CONTENT/"nl.js").read_text()
           + "\n" + (CONTENT/"legal.js").read_text())
assert "\napplyLang();" in app
app = app.replace("\napplyLang();", "\n/* ---------- contenu des pages ---------- */\n" + content + "\napplyLang();")

# rendu du contenu de page (titres, listes, tableaux, FAQ, étapes)
app = app.replace("""  document.querySelectorAll("[data-nav]").forEach(a=>a.classList.toggle("on",a.dataset.nav===document.body.dataset.page));""",
"""  document.querySelectorAll("[data-nav]").forEach(a=>a.classList.toggle("on",a.dataset.nav===document.body.dataset.page));
  pageContent(); legalContent();""")
app = app.replace("function setLang(x){", """function pageContent(){
  const l=L(), pg=(l.pg||{})[document.body.dataset.page];
  const st=$("#steps");
  if(st&&l.steps){ $("#steps-h").textContent=l.steps_h;
    st.innerHTML=l.steps.map((s,i)=>`<div class="step"><b>${i+1}</b><h3>${s[0]}</h3><p>${s[1]}</p></div>`).join(""); }
  if(!pg) return;
  document.querySelectorAll("[data-pg]").forEach(el=>{ const v=pg[el.dataset.pg]; if(typeof v==="string") el.innerHTML=v; });
  const li=$("#pg-bul");   if(li) li.innerHTML=(pg.bul||[]).map(b=>`<span class="pb">${LEAF}${b}</span>`).join("");
  const inc=$("#pg-inc");  if(inc) inc.innerHTML=(pg.inc||[]).map(b=>`<li>${LEAF}<span>${b}</span></li>`).join("");
  const tb=$("#pg-pr");
  if(tb){ tb.innerHTML=(pg.pr||[]).map(r=>`<li><span class="nm3">${r[0]}<span class="d">${r[2]||""}</span></span><b>${r[1]}</b></li>`).join("");
    tb.closest(".ptable").hidden=!(pg.pr||[]).length; }
  const fq=$("#pg-faq");
  if(fq) fq.innerHTML=(pg.faq||[]).map(q=>`<details class="q"><summary>${q[0]}</summary><p>${q[1]}</p></details>`).join("");
}
function legalContent(){
  const g=$("#legal"); if(!g) return;
  const l=L().lg; if(!l) return;
  const rows=a=>`<dl class="idcard">${a.map(r=>`<div><dt>${r[0]}</dt><dd>${r[1]}</dd></div>`).join("")}</dl>`;
  const list=a=>`<ul class="lgl">${a.map(x=>`<li>${LEAF}<span>${x}</span></li>`).join("")}</ul>`;
  g.innerHTML=`<h2>${l.s1}</h2>${rows(l.b1)}
    <h2>${l.s2}</h2><p>${l.p2}</p>
    <h2>${l.s3}</h2><p>${l.p3}</p>${list(l.b3)}
    <h2>${l.s4}</h2><p>${l.p4}</p>
    <h2>${l.s5}</h2><p>${l.p5}</p>
    <h2>${l.s6}</h2><p>${l.p6}</p>
    <p class="fine" style="margin-top:28px">${l.note}</p>`;
}
const LEAF='<svg class="leaf" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1c3 3 6 5 6 8a6 6 0 0 1-12 0c0-3 3-5 6-8Z"/></svg>';
function setLang(x){""")
(OUT/"assets"/"app.js").write_text(app)

# 3) styles additionnels pour les pages de service
(OUT/"assets"/"style.css").write_text((OUT/"assets"/"style.css").read_text() + """
/* ---------- pages de service ---------- */
nav.links a.on{color:var(--gold-2)}
.phero{background:var(--dark);color:var(--on-dark);position:relative;overflow:hidden;padding-block:64px 128px}
.phero::before{content:"";position:absolute;inset:0;background:radial-gradient(820px 380px at 76% 34%,rgba(206,157,60,.2),transparent 70%)}
.phero .wrap{position:relative;display:grid;gap:18px;max-width:1100px}
.phero h1{max-width:16em}
.phero p.lead2{color:rgba(243,241,236,.78);max-width:40em;font-size:1.06rem}
.phero .bl{display:flex;gap:10px 26px;flex-wrap:wrap;margin-top:4px}
.phero .pb{display:inline-flex;align-items:flex-start;gap:8px;font-size:.92rem;color:rgba(243,241,236,.85)}
.phero .pb .leaf{color:var(--gold-2);margin-top:3px}
.phero .hero-cta{margin-top:8px}
@media (max-width:700px){.phero{padding-block:40px 110px}}
.inc{display:grid;grid-template-columns:1.05fr .95fr;gap:48px;align-items:start}
.inc ul{list-style:none;margin:18px 0 0;padding:0;display:grid;gap:14px}
.inc li{display:flex;gap:11px;font-size:.98rem}
.inc .leaf{margin-top:5px}
@media (max-width:860px){.inc{grid-template-columns:1fr;gap:24px}}
.ptable{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:8px 26px 18px;margin-top:22px}
.ptable ul{list-style:none;margin:0;padding:0}
.ptable li{display:flex;justify-content:space-between;gap:20px;align-items:baseline;padding:14px 0;border-bottom:1px solid var(--line)}
.ptable li:last-child{border-bottom:0}
.ptable .nm3{font-weight:600;font-size:.98rem}
.ptable .nm3 .d{display:block;font-weight:400;font-size:.82rem;color:var(--ink-2)}
.ptable b{font-variant-numeric:tabular-nums;white-space:nowrap;font-weight:800}
.steps{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;margin-top:10px}
.step{display:grid;gap:8px;align-content:start}
.step b{width:34px;height:34px;border-radius:50%;background:var(--gold);color:#fff;display:grid;place-items:center;font-size:.95rem}
.step h3{font-size:1.02rem}
.step p{font-size:.92rem;color:var(--ink-2)}
@media (max-width:860px){.steps{grid-template-columns:1fr 1fr}}
@media (max-width:520px){.steps{grid-template-columns:1fr}}
.faq2{display:grid;gap:0;max-width:60em}
.faq2 details.q{border-bottom:1px solid var(--line)}
.faq2 details.q summary::after{border-color:var(--line-2);color:var(--gold)}
.faq2 details.q p{color:var(--ink-2)}
""")

# empreinte des assets : force les navigateurs à recharger après chaque mise à jour
def _v(name):
    return hashlib.md5((OUT/"assets"/name).read_bytes()).hexdigest()[:8]

SITE = "https://younesabdellati22-beep.github.io/smajestic/"   # <- remplacer par https://smajestic.be/ le jour du domaine

# une URL par langue : Google peut indexer le néerlandais séparément
NL_FILE = {"index.html":"nl.html", "chassis.html":"ramen.html", "isolation.html":"isolatie.html",
           "solaire.html":"zonnepanelen.html", "clim.html":"airco.html", "finitions.html":"afwerking.html",
           "renovation.html":"renovatie.html", "materiel.html":"materieel.html", "mentions.html":"juridisch.html"}

def to_nl(html):
    """Sur une page NL, tous les liens internes pointent vers les pages NL."""
    keys = "|".join(k[:-5] for k in NL_FILE)
    return re.sub(rf'href="({keys})\.html', lambda m: 'href="' + NL_FILE[m.group(1)+".html"], html)

import json
def ldjson(lg):
    """Fiche d'entreprise lisible par Google : c'est ce qui alimente le panneau local."""
    return json.dumps({
        "@context":"https://schema.org",
        "@type":"HomeAndConstructionBusiness",
        "@id": SITE + "#entreprise",
        "name":"S. Majestic",
        "alternateName":["S.Majestic","SMajestic"],
        "url": SITE,
        "image": SITE + ("assets/og-nl.jpg" if lg=="nl" else "assets/og.jpg"),
        "logo": SITE + "assets/icon-180.png",
        "telephone":"+32478390270",
        "email":"info@smajestic.be",
        "vatID":"BE1020521459",
        "priceRange":"€€",
        "address":{"@type":"PostalAddress","streetAddress":"Sint-Cornelisstraat 59",
                   "postalCode":"9600","addressLocality":"Ronse","addressRegion":"Oost-Vlaanderen",
                   "addressCountry":"BE"},
        "areaServed":[{"@type":"City","name":n} for n in
                      ["Ronse","Oudenaarde","Geraardsbergen","Kluisbergen","Zottegem","Brakel",
                       "Tournai","Frasnes-lez-Anvaing","Ellezelles","Flobecq"]],
        "knowsLanguage":["fr-BE","nl-BE"],
        "description":(NL_HOME[1] if lg=="nl" else
                       "Châssis, isolation, panneaux solaires, clim, plafonnage et rénovation "
                       "à Renaix (Ronse). Votre prix en ligne en 2 minutes, devis gratuit."),
        "makesOffer":[{"@type":"Offer","itemOffered":{"@type":"Service","name":n}} for n in
                      (["Ramen en deuren","Isolatie","Zonnepanelen","Airco en warmtepomp",
                        "Pleisterwerk en afwerking","Renovatie","Materieelverhuur"] if lg=="nl" else
                       ["Châssis et portes","Isolation","Panneaux solaires","Clim et pompe à chaleur",
                        "Plafonnage et finitions","Rénovation","Location de matériel"])]
    }, ensure_ascii=False, separators=(",",":"))

HEAD = """<!doctype html>
<html lang="{lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="{canon}">
<link rel="alternate" hreflang="fr-be" href="{fr_url}">
<link rel="alternate" hreflang="nl-be" href="{nl_url}">
<link rel="alternate" hreflang="x-default" href="{fr_url}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="S.Majestic">
<meta property="og:locale" content="{locale}">
<meta property="og:url" content="{canon}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:image" content="{og}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="assets/icon-32.png" sizes="32x32">
<link rel="apple-touch-icon" href="assets/icon-180.png">
<script type="application/ld+json">{ldjson}</script>
<script src="assets/three.min.js" defer></script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800&amp;family=Geist+Mono:wght@400;500&amp;display=swap">
<link rel="stylesheet" href="assets/style.css?v={vcss}">
<script src="assets/app.js?v={vjs}" defer></script>
</head>
<body data-page="{page}" data-lang="{lang}"{svc}>
"""

PHERO = """<section class="phero">
  <div class="wrap">
    <h1 data-pg="h1"></h1>
    <p class="lead2" data-pg="lead"></p>
    <div class="bl" id="pg-bul"></div>
    <div class="hero-cta">
      <a class="btn btn-gold" href="#app"><span data-i18n="cta"></span><span class="arw"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 8h9M9 4l4 4-4 4"/></svg></span></a>
      <a class="btn btn-ghost" href="#contact"><span data-i18n="lead_btn"></span></a>
    </div>
  </div>
</section>
"""
PHERO_NOCALC = (PHERO.replace('href="#app"><span data-i18n="cta">', 'href="#contact"><span data-i18n="mt_cta">')
                     .replace('class="btn btn-ghost" href="#contact"><span data-i18n="lead_btn"></span></a>', 'class="btn btn-ghost wa-link" href="#" target="_blank" rel="noopener"><span data-i18n="wa_btn"></span></a>'))

INC = """<section class="s">
  <div class="wrap inc">
    <div><h2 data-pg="inc_h"></h2><ul id="pg-inc"></ul></div>
    <div class="photo pgphoto" style="aspect-ratio:4/3"><span data-i18n="photo"></span></div>
  </div>
</section>
"""
PRICES = """<section class="s tinted">
  <div class="wrap">
    <div class="sh2"><h2 data-pg="pr_h"></h2><p data-pg="pr_s"></p></div>
    <div class="ptable"><ul id="pg-pr"></ul></div>
  </div>
</section>
"""
STEPS = """<section class="s">
  <div class="wrap">
    <div class="sh2"><h2 id="steps-h"></h2></div>
    <div class="steps" id="steps"></div>
  </div>
</section>
"""
FAQ = """<section class="s tinted">
  <div class="wrap">
    <div class="sh2"><h2 data-i18n="pg_faq_h"></h2></div>
    <div class="faq2" id="pg-faq"></div>
  </div>
</section>
"""

BA = None   # rempli depuis le fragment de la home

LEGAL = """<section class="phero" style="padding-block:56px 72px">
  <div class="wrap"><h1 data-i18n-html="lg_h1"></h1><p class="lead2" data-i18n="lg_lead"></p></div>
</section>
<section class="s">
  <div class="wrap legal" id="legal"></div>
</section>
"""

MATERIEL = """<section class="s tinted">
  <div class="wrap">
    <div class="mt-grid">
      <div class="mt-card"><h3 data-i18n="mt_1_h"></h3><p class="muted" data-i18n="mt_1_p"></p><ul class="mt-list" id="mt-1"></ul></div>
      <div class="mt-card"><h3 data-i18n="mt_2_h"></h3><p class="muted" data-i18n="mt_2_p"></p><ul class="mt-list" id="mt-2"></ul></div>
      <div class="mt-card"><h3 data-i18n="mt_3_h"></h3><p class="muted" data-i18n="mt_3_p"></p><ul class="mt-list" id="mt-3"></ul></div>
    </div>
    <div class="mt-foot">
      <p data-i18n="mt_fine"></p>
      <div class="mt-acts">
        <a class="btn btn-gold" href="#contact"><span data-i18n="mt_cta"></span><span class="arw"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 8h9M9 4l4 4-4 4"/></svg></span></a>
        <a class="btn btn-line wa-link" href="#" target="_blank" rel="noopener"><span data-i18n="wa_btn"></span></a>
      </div>
    </div>
  </div>
</section>
"""

PAGES = {
 "chassis":  ("chassis.html",   "chassis",  "Châssis PVC, alu et bois à Renaix | S.Majestic",
              "Châssis et portes sur mesure à Renaix. Calculez votre prix en ligne en 2 minutes : PVC, aluminium ou bois, pose et TVA 6 % comprises."),
 "iso":      ("isolation.html", "iso",      "Isolation toiture, murs et sols à Renaix | S.Majestic",
              "Isolation de toiture, mur creux et sols en Belgique. Prix en ligne immédiat, surfaces calculées d’après votre maison."),
 "solar":    ("solaire.html",   "solar",    "Panneaux solaires à Renaix | S.Majestic",
              "Panneaux photovoltaïques posés par des installateurs certifiés. Estimez votre installation et son prix en ligne."),
 "clim":     ("clim.html",      "clim",     "Clim et pompe à chaleur à Renaix | S.Majestic",
              "Climatisation réversible et pompe à chaleur air-eau. Choisissez vos pièces et obtenez un prix tout de suite."),
 "finit":    ("finitions.html", "finit",    "Plafonnage, cloisons, sols et peinture | S.Majestic",
              "Plafonnage, cloisons gyproc, plafonds coupe-feu, parquet, carrelage et peinture. Tarifs au m² et prix en ligne."),
 "reno":     ("renovation.html","reno",     "Rénovation complète à Renaix | S.Majestic",
              "Rénovation de maison, salle de bain, cuisine, toiture et façade à Renaix. Un seul interlocuteur, devis détaillé."),
 "materiel": ("materiel.html",  None,       "Location de grue et mini-pelle à Renaix | S.Majestic",
              "Mini-pelle avec chauffeur 70 €/h, grue de chantier à la journée, citerne d’eau de pluie. Tarifs directs."),
 "mentions": ("mentions.html",  None,       "Mentions légales et vie privée | S.Majestic",
              "S. MAJESTIC BV, Sint-Cornelisstraat 59, 9600 Ronse, BE 1020.521.459. Mentions légales et protection des données."),
}

NL_META = {
 "chassis":  ("Ramen en deuren in pvc, alu en hout in Ronse | S.Majestic",
              "Ramen en deuren op maat in Ronse. Bereken uw prijs online in 2 minuten: pvc, aluminium of hout, plaatsing en 6 % btw inbegrepen."),
 "iso":      ("Dak-, muur- en vloerisolatie in Ronse | S.Majestic",
              "Isolatie van dak, spouwmuur en vloer in België. Onmiddellijk een prijs online, oppervlakten berekend op uw woning."),
 "solar":    ("Zonnepanelen in Ronse | S.Majestic",
              "Zonnepanelen geplaatst door gecertificeerde installateurs. Raam uw installatie en de prijs ervan online."),
 "clim":     ("Airco en warmtepomp in Ronse | S.Majestic",
              "Omkeerbare airco en lucht-waterwarmtepomp. Kies uw kamers en krijg meteen een prijs."),
 "finit":    ("Pleisterwerk, wanden, vloeren en schilderwerk | S.Majestic",
              "Pleisterwerk, gyprocwanden, brandwerende plafonds, parket, tegels en schilderwerk. Tarieven per m² en prijs online."),
 "reno":     ("Volledige renovatie in Ronse | S.Majestic",
              "Renovatie van woning, badkamer, keuken, dak en gevel in Ronse. Eén aanspreekpunt, gedetailleerde offerte."),
 "materiel": ("Kraan en minigraver huren in Ronse | S.Majestic",
              "Minigraver met chauffeur 70 €/u, werfkraan per dag, regenwaterput. Rechtstreekse tarieven."),
 "mentions": ("Juridische informatie en privacy | S.Majestic",
              "S. MAJESTIC BV, Sint-Cornelisstraat 59, 9600 Ronse, BE 1020.521.459. Juridische informatie en gegevensbescherming."),
}
NL_HOME = ("S.Majestic — Bouw &amp; Renovatie in Ronse",
           "Ramen, isolatie, zonnepanelen, airco, pleisterwerk en renovatie in Ronse. Uw prijs online in 2 minuten, gratis offerte.")

HAS_PHOTO = {"chassis","iso","solar","clim","finit","reno","materiel"}
ILLUS_3D  = {"solar"}   # rendu 3D : on le dit

def page(key, lg="fr"):
    global BA
    fname, svc, title, desc = PAGES[key]
    if lg == "nl":
        title, desc = NL_META[key]
    fr_url, nl_url = SITE + fname, SITE + NL_FILE[fname]
    inc = INC.replace('<div class="photo pgphoto" style="aspect-ratio:4/3"><span data-i18n="photo"></span></div>',
                      f'<div class="photo has" style="aspect-ratio:4/3"><img src="assets/img-pg-{key}.jpg" alt="{title.split(" | ")[0]}" loading="lazy">'
                      + (f'<span class="illus" data-i18n="illus3d"></span>' if key in ILLUS_3D else '') + '</div>'
                      ) if key in HAS_PHOTO else INC
    head = HEAD.format(title=title, desc=desc, page=key, lang=lg,
                       locale=("nl_BE" if lg == "nl" else "fr_BE"), ldjson=ldjson(lg),
                       og=SITE + ("assets/og-nl.jpg" if lg == "nl" else "assets/og.jpg"),
                       canon=(nl_url if lg == "nl" else fr_url), fr_url=fr_url, nl_url=nl_url,
                       svc=(f' data-svc="{svc}"' if svc else ""),
                       vcss=_v("style.css"), vjs=_v("app.js"))
    parts = [head, F["topbar"]]
    if key == "mentions":
        parts = [head, F["topbar"], LEGAL, F["contact"], F["footer"], F["mbar"]]
        out = "\n".join(parts) + "\n</body>\n</html>\n"
        return to_nl(out) if lg == "nl" else out
    if key == "materiel":
        parts += [PHERO_NOCALC, MATERIEL, inc, STEPS, FAQ, F["contact"], F["footer"], F["mbar"]]
    elif key == "reno":
        parts += [PHERO, F["app"], inc, PRICES, STEPS, FAQ, F["contact"], F["footer"], F["mbar"]]
    elif key == "chassis":
        parts += [PHERO, F["app"], inc, PRICES, F["avant"], STEPS, F["strip"], FAQ, F["contact"], F["footer"], F["mbar"]]
    else:
        parts += [PHERO, F["app"], inc, PRICES, STEPS, F["strip"], FAQ, F["contact"], F["footer"], F["mbar"]]
    out = "\n".join(parts) + "\n</body>\n</html>\n"
    return to_nl(out) if lg == "nl" else out

# 4) home — le corps complet d'origine, avec la nav mise à jour
# F["reviews"] : avis Google retirés en attendant de vrais avis — remettre dans la liste pour les réactiver
# F["reviews"] et F["brands"] retirés : avis Google en attente, logos de marques pas encore fournis
home_body = "\n".join([F["topbar"], F["hero"], F["app"], F["avant"], F["services"], F["works"],
                       F["trust"], F["strip"], F["faq"], F["contact"],
                       F["footer"], F["mbar"]])
HOME_FR = SITE            # la racine, pas /index.html
HOME_NL = SITE + "nl.html"
home_head = HEAD.format(title="S.Majestic — Construction &amp; Rénovation à Renaix (Ronse)",
                        desc="Châssis, isolation, panneaux solaires, clim, plafonnage et rénovation à Renaix (Ronse). Votre prix en ligne en 2 minutes, devis gratuit.",
                        page="home", lang="fr", locale="fr_BE", og=SITE+"assets/og.jpg", ldjson=ldjson("fr"),
                        canon=HOME_FR, fr_url=HOME_FR, nl_url=HOME_NL,
                        svc="", vcss=_v("style.css"), vjs=_v("app.js"))
(OUT/"index.html").write_text(home_head + home_body + "\n</body>\n</html>\n")

home_head_nl = HEAD.format(title=NL_HOME[0], desc=NL_HOME[1],
                           page="home", lang="nl", locale="nl_BE", og=SITE+"assets/og-nl.jpg", ldjson=ldjson("nl"),
                           canon=HOME_NL, fr_url=HOME_FR, nl_url=HOME_NL,
                           svc="", vcss=_v("style.css"), vjs=_v("app.js"))
(OUT/"nl.html").write_text(home_head_nl + to_nl(home_body) + "\n</body>\n</html>\n")

for k in PAGES:
    (OUT/PAGES[k][0]).write_text(page(k))
    (OUT/NL_FILE[PAGES[k][0]]).write_text(page(k, "nl"))

# plan du site + robots : Google trouve les 18 pages, FR et NL
_BACK = {v: k for k, v in NL_FILE.items()}
_fr   = lambda u: u if u in NL_FILE else _BACK[u]      # le fichier FR correspondant
_loc  = lambda u: "" if u == "index.html" else u       # la home vit à la racine du site
urls  = ["index.html"] + [PAGES[k][0] for k in PAGES]
urls += [NL_FILE[u] for u in urls]
(OUT/"sitemap.xml").write_text(
    '<?xml version="1.0" encoding="UTF-8"?>\n'
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" '
    'xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'
    + "".join(
        f'  <url><loc>{SITE}{_loc(u)}</loc>'
        f'<xhtml:link rel="alternate" hreflang="fr-be" href="{SITE}{_loc(_fr(u))}"/>'
        f'<xhtml:link rel="alternate" hreflang="nl-be" href="{SITE}{NL_FILE[_fr(u)]}"/>'
        f'</url>\n' for u in urls)
    + "</urlset>\n")
(OUT/"robots.txt").write_text(f"User-agent: *\nAllow: /\n\nSitemap: {SITE}sitemap.xml\n")

print(f"  {len(list(OUT.glob('*.html')))} pages generees dans {OUT}")
