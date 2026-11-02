import json, io, os, sys
sys.stdout.reconfigure(encoding="utf-8", errors="backslashreplace")
p = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "src", "data", "menkibeler", "mk-09.json")
d = json.load(io.open(p, encoding="utf-8"))
d["baslik"] = "Hz. \u00c2i\u015fe: Bilginler Okulu"
d["hikaye"] = ("Hz. \u00c2i\u015fe had\u00e0s\u01eGets a\u015fab\u0131n \u00e7ok." + "")
d["hikmet"] = "Bilgi \u0131\u0301Äe kadar."
d["kaynak"] = "Buh\u00e2r\u00ee, Sah\u00eeh; \u0130bn Hacer, Feth\u00fc'l-B\u00e2r\u00ee"
json.dump(d, io.open(p, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
print("mk-09 yine bozuk deneme")
