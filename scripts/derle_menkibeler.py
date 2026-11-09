import json, io, os

BASE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "src", "data", "menkibeler")
SIRA = ("id", "kategori", "baslik", "hikaye", "hikmet", "kaynak")
CEVIRI = (
    "baslik_en", "baslik_ar", "baslik_id", "baslik_ur",
    "hikaye_en", "hikaye_ar", "hikaye_id", "hikaye_ur",
    "hikmet_en", "hikmet_ar", "hikmet_id", "hikmet_ur",
)
CHUNK = 30
HDR = "// Bu dosya scripts/derle_menkibeler.py ile uretilmistir (elle duzenleme yok)."

def esc(v):
    return str(v).replace("\\", "\\\\").replace('"', '\\"').replace("\n", "\\n")

items = []
for ad in sorted(os.listdir(BASE), key=lambda x: (len(x), x)):
    if not ad.endswith(".json"):
        continue
    data = json.load(io.open(os.path.join(BASE, ad), encoding="utf-8"))
    if data.get("id") == "mk-01":
        continue                       # mk-01 menkibeler.ts'te hard-coded
    sat = ["  {"]
    for alan in SIRA:
        sat.append('    %s: "%s",' % (alan, esc(data.get(alan, ""))))
    for alan in CEVIRI:
        v = data.get(alan)
        if v:
            sat.append('    %s: "%s",' % (alan, esc(v)))
    sat.append("  },")
    items.append("\n".join(sat))

outdir = os.path.join(BASE, "liste")
os.makedirs(outdir, exist_ok=True)
for f in os.listdir(outdir):
    if f.startswith("part") and f.endswith(".ts"):
        os.remove(os.path.join(outdir, f))

parts = []
for i in range(0, len(items), CHUNK):
    n = i // CHUNK + 1
    name = f"part{n:02d}"
    parts.append(name)
    body = [HDR, 'import type { Menkibe } from "../../menkibeler";', "", f"export const {name.upper()}: Menkibe[] = ["]
    body.extend(items[i:i+CHUNK])
    body.extend(["];", ""])
    io.open(os.path.join(outdir, f"{name}.ts"), "w", encoding="utf-8", newline="\r\n").write("\n".join(body))

barrel_root = [HDR]
barrel_idx = [HDR]
for p in parts:
    barrel_root.append(f'import {{ {p.upper()} }} from "./liste/{p}";')
    barrel_idx.append(f'import {{ {p.upper()} }} from "./{p}";')
for b in (barrel_root, barrel_idx):
    b.append("")
    b.append("const KISLAR = [" + ", ".join(f"...{p.upper()}" for p in parts) + "];")
    b.append("")
    b.append("export default KISLAR;")
    b.append("")

io.open(os.path.join(BASE, "liste.ts"), "w", encoding="utf-8", newline="\r\n").write("\n".join(barrel_root))
io.open(os.path.join(outdir, "index.ts"), "w", encoding="utf-8", newline="\r\n").write("\n".join(barrel_idx))

print("menkibeler derlendi: %d kıssa, %d parça" % (len(items), len(parts)))
