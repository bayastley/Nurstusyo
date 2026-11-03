import io, json, os, sys

# Izinli karakterset (whitelist): yazdirilabilir ASCII + latin-1 + Turkce harfler
# + tipografik noktalama + paragraf icin yeni satir (\\n)
BAS = ""
ALLOWED = set(
    " \\t\\n\\r"
    "!\\\"#$%&'()*+,-./0123456789:;<=>?@"
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    "[\\\\]^_`abcdefghijklmnopqrstuvwxyz"
    "{|}~"
)
ALLOWED |= set("çğıöşüÇĞİÖŞÜ")
ALLOWED |= set("âîûéèêáàíîóòúû")
ALLOWED |= set("«»·—–…’‘“")
ALLOWED |= set("ÂÎÛ")
ALLOWED |= set(" " + chr(9) + chr(10) + chr(13))

BASE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "src", "data", "menkibeler")
bozuklar = []

for ad in sorted(os.listdir(BASE)):
    if not ad.endswith(".json"):
        continue
    yol = os.path.join(BASE, ad)
    try:
        data = json.load(io.open(yol, encoding="utf-8"))
    except Exception as e:
        bozuklar.append((ad, "parca", 0, "PARSA: " + str(e)[:80], ""))
        continue
    for alan in ("id", "kategori", "baslik", "hikaye", "hikmet", "kaynak"):
        metin = str(data.get(alan, ""))
        for i, ch in enumerate(metin):
            if ch not in ALLOWED:
                baglam = metin[max(0, i - 25):i + 25].replace("\\n", " ")
                bozuklar.append((ad, alan, i, baglam, hex(ord(ch))))

if bozuklar:
    sys.stdout.reconfigure(encoding="utf-8", errors="backslashreplace")
    print("BOZUK BULGULAR:")
    for ad, alan, i, baglam, kod in bozuklar[:60]:
        print("  ", ad, "|", alan, "|", hex(i), "| kod:", kod, "| ...", baglam, "...")
    print("toplam bulgu:", len(bozuklar))
    sys.exit(1)
print("TUM DOSYALAR TEMIZ")
