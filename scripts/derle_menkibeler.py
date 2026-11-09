import json, io, os

BASE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "src", "data", "menkibeler")
SIRA = ("id", "kategori", "baslik", "hikaye", "hikmet", "kaynak")
CEVIRI = (
    "baslik_en", "baslik_ar", "baslik_id", "baslik_ur",
    "hikaye_en", "hikaye_ar", "hikaye_id", "hikaye_ur",
    "hikmet_en", "hikmet_ar", "hikmet_id", "hikmet_ur",
)

def esc(v):
    return str(v).replace("\\", "\\\\").replace('"', '\\"').replace("\n", "\\n")

satlar = [
    "// \u00dcstteki bu dosya scripts/derle_menkibeler.py ile \u00fcretilmi\u015ftir (elle duzenleme yok).",
    "import type { Menkibe } from \"../menkibeler\";",
    "",
    "const KISLAR: Menkibe[] = [",
]
for ad in sorted(os.listdir(BASE), key=lambda x: (len(x), x)):
    if not ad.endswith(".json"):
        continue
    data = json.load(io.open(os.path.join(BASE, ad), encoding="utf-8"))
    if data.get("id") == "mk-01":
        continue                       # mk-01 menkibeler.ts'te hard-coded
    satlar.append("  {")
    for alan in SIRA:
        satlar.append('    %s: "%s",' % (alan, esc(data.get(alan, ""))))
    for alan in CEVIRI:
        v = data.get(alan)
        if v:
            satlar.append('    %s: "%s",' % (alan, esc(v)))
    satlar.append("  },")
satlar.append("];")
satlar.append("")
satlar.append("export default KISLAR;")
satlar.append("")

cikti = os.path.join(BASE, "liste.ts")
io.open(cikti, "w", encoding="utf-8", newline="\r\n").write("\n".join(satlar))
print("liste.ts uretildi: %d dosya tarandi" % len([a for a in os.listdir(BASE) if a.endswith('.json')]))
