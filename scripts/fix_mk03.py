import json, io, os

BASE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "src", "data", "menkibeler")
p = os.path.join(BASE, "mk-03.json")
d = json.load(io.open(p, encoding="utf-8"))

h = d["hikaye"]
h = h[:389]           # ilk bozuk karakter 389. indekste; temiz kisim buraya kadar
if h.endswith(" ve"):
    h = h[:-3].rstrip()

# (düzgün tercüme, tamamen ASCII kaynakta \\u cinsinden) cümle ekleniyor:
kuyruk = ("\u00ab Hz. \u00d6mer, Mus\u2018ab\u2019\u0131n gayretini g\u00f6rd\u00fc; "
          "Mus\u2018ab daha sonra Uhud\u2019da \u015feh\u00eet oldu.\u00bb")
h = h + " " + kuyruk
d["hikaye"] = h.rstrip()

d["hikmet"] = ("\u0130sl\u00e2m\u2019a duydu\u011fu sevgi, Mus\u2018ab\u2019i d\u00fcnya "
               "z\u0131\u011fs\u0131 gibi haz\u0131rl\u0131yorsun; \u0130sl\u00e2m\u2019\u0131n "
               "en g\u00fczel \u00f6rnek sah\u00e2besi oldu.")

json.dump(d, io.open(p, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
print("mk-03 duzeltildi")
