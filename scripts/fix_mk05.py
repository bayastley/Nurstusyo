import json, io, os
p = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "src", "data", "menkibeler", "mk-05.json")
d = json.load(io.open(p, encoding="utf-8"))
d["baslik"] = "Hz. Eyy\u00fbb: Bel\u00e2 \u00fczerinde Sab\u0131r"
json.dump(d, io.open(p, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
print("mk-05 baslik ->", d["baslik"])
