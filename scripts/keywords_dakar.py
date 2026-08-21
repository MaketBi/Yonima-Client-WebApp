#!/usr/bin/env python3
"""
Extraction de mots-cles Google Suggest — marche senegalais, francais.
Categorie A : aucune cle API, aucun compte, aucun quota bloquant.
Teste le 2026-08-17 : 208 requetes, 0 echec.

Usage:  python3 keywords_dakar.py > mots-cles.csv
"""
import urllib.request
import urllib.parse
import json
import time
import string
import csv
import re
import sys

# PIEGE: Google renvoie du latin-1 sur cet endpoint, pas de l'UTF-8.
# Decoder en UTF-8 fait planter tout mot-cle accentue ("a domicile", "senegal").
ENCODING = "latin-1"
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " \
     "(KHTML, like Gecko) Chrome/120.0 Safari/537.36"


def suggest(query, gl="sn", hl="fr"):
    """Retourne les suggestions Google pour une requete, ciblees Senegal/francais."""
    url = "https://suggestqueries.google.com/complete/search?" + urllib.parse.urlencode(
        {"client": "firefox", "hl": hl, "gl": gl, "q": query}
    )
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=15) as r:
        raw = r.read()
    # Le flux est du latin-1 contenant de l'UTF-8: il faut re-encoder pour
    # recuperer les accents, sinon "a domicile" ressort en "Ã  domicile".
    text = raw.decode(ENCODING)
    try:
        text = text.encode(ENCODING).decode("utf-8")
    except (UnicodeDecodeError, UnicodeEncodeError):
        pass
    return json.loads(text)[1]


# Bruit du marche francais metropolitain: Google melange les resultats FR
# quand la graine est un plat senegalais ("livraison mafe marseille", "mafe 93").
NOISE = re.compile(
    r"\b(marseille|paris|lyon|toulouse|lille|bordeaux|nantes|montpellier|"
    r"strasbourg|rennes|9[0-5]|7[5-8]|13|69|france|bruxelles|montreal|"
    r"abidjan|bamako|cotonou|buenos aires)\b",
    re.IGNORECASE,
)


def is_relevant(kw):
    """Ecarte les suggestions qui visent un autre marche que Dakar."""
    return not NOISE.search(kw)


# Graines: intention commerciale x quartiers de Dakar x plats locaux.
# Les plats locaux sont la vraie valeur — aucun outil international ne les suggere.
SEEDS = [
    "livraison repas dakar", "livraison nourriture senegal", "commander en ligne dakar",
    "restaurant livraison dakar", "livraison course dakar", "application livraison dakar",
    "fast food dakar livraison", "livraison petit dejeuner dakar", "livraison pizza dakar",
    "commande repas en ligne dakar", "meilleur restaurant dakar livraison",
    # quartiers
    "livraison almadies", "livraison plateau dakar", "livraison ouakam",
    "livraison point e dakar", "livraison mermoz", "livraison ngor",
    # plats locaux
    "livraison thieboudienne", "livraison yassa", "livraison mafe",
    "livraison thiep dakar", "livraison poulet dakar",
]

SUFFIXES = [""] + list(string.ascii_lowercase) + [
    "pas cher", "rapide", "24h", "prix", "numero", "en ligne", "gratuit",
]


def main():
    found = {}          # mot-cle -> set de graines qui l'ont revele
    n = fails = 0

    for seed in SEEDS:
        for suf in SUFFIXES:
            q = (seed + " " + suf).strip()
            n += 1
            try:
                for kw in suggest(q):
                    if is_relevant(kw):
                        found.setdefault(kw, set()).add(seed)
            except Exception as e:
                fails += 1
                print(f"  echec: {q} ({type(e).__name__})", file=sys.stderr)
            time.sleep(0.15)   # rythme poli; ne pas descendre sous ~0.1s

    print(f"requetes={n} echecs={fails} uniques={len(found)}", file=sys.stderr)

    w = csv.writer(sys.stdout)
    w.writerow(["mot_cle", "nb_graines", "graines"])
    # tri par nombre de graines: un terme revele par plusieurs graines est plus central
    for kw, seeds in sorted(found.items(), key=lambda x: (-len(x[1]), x[0])):
        w.writerow([kw, len(seeds), " | ".join(sorted(seeds))])


if __name__ == "__main__":
    main()
