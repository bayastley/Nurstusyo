import json, io, os

KOLTUK = {
  "tr": "İslâmi Menkıbeler",
  "en": "Islamic Legends",
  "ar": "مناقب إسلامية",
  "id": "Legenda Islam",
  "ur": "اسلامی مناقب",
}

for dil, deger in KOLTUK.items():
    yol = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "src", "i18n", "dicts.%s.json" % dil)
    d = json.load(io.open(yol, encoding="utf-8"))
    d["ksMenkibeler"] = deger
    json.dump(d, io.open(yol, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    print(dil, "->", deger)

# SEKME_KEY'e de aynı solucanı ekleyebiliyor:
p = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "src", "components", "KesfetModal.tsx")
metin = io.open(p, encoding="utf-8").read()
if "ksMenkibeler" not in metin:
    ilk = metin.index("const SEKME_KEY")
    bitis = metin.index("};", ilk)
    metin = metin[:bitis] + '  menkibeler: "ksMenkibeler",\n' + metin[bitis:]
    io.open(p, "w", encoding="utf-8", newline="").write(metin)
    print("SEKME_KEY menkibeler kaydını ekledi")
else:
    print("SEKME_KEY zaten menkibeler kaydı var")
