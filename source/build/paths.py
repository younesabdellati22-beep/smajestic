#!/usr/bin/env python3
"""Les quatre dossiers du projet. Tout le reste s'y réfère — aucun chemin en dur.

    <dépôt>/                 le site généré, c'est ce que GitHub Pages publie
    <dépôt>/source/          les fichiers qu'on édite à la main
    <dépôt>/source/build/    les scripts qui fabriquent le site
    <dépôt>/source/.work/    dossier de travail, jetable, régénéré à chaque build
"""
import pathlib

BUILD = pathlib.Path(__file__).resolve().parent     # source/build
SRC   = BUILD.parent                                # source
REPO  = SRC.parent                                  # racine du dépôt
WORK  = SRC / ".work"                               # intermédiaires (jetable)

MEDIA   = SRC / "media"
CONTENT = SRC / "content"
ASSETS  = WORK / "assets"
INT     = WORK / "_int"      # intermediaires de decoupe (home_body, fragments)

WORK.mkdir(exist_ok=True)
ASSETS.mkdir(parents=True, exist_ok=True)
INT.mkdir(parents=True, exist_ok=True)
