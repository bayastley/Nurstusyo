import io, os

p = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "src", "data", "menkibeler.ts")
metin = io.open(p, encoding="utf-8").read()

etiket = 'import KISLAR from "./menkibeler/liste";'
if etiket not in metin:
    metin = etiket + "\n" + metin
    print("import eklendi")
else:
    print("import zaten var")

belirt = "export const MENKIBELER: Menkibe[] = ["
if belirt in metin:
    sat = metin.index(belirt) + len(belirt)
    metin = metin[:sat] + '\n  ...KISLAR,' + metin[sat:]
    print("spread eklendi")
else:
    print("UYARI: export satiri bulunamadi")

io.open(p, "w", encoding="utf-8", newline="").write(metin)
print("menkibeler.ts guncellendi")
