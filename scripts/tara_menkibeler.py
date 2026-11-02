import io, json, os, sys

# Izinli karakter kumesi (negatif-set yerine acik whitelist):
# ASCII yazdirilabilir + latin-1 + Turkce harfler + tipografik noktalama.
ALLOWED = set(
    "\u0020\u0021\u0022\u0023\u0024\u0025\u0026\u0027\u0028\u0029"
    "\u002a\u002b\u002c\u002d\u002e\u002f\u0030\u0031\u0032\u0033\u0034\u0035\u0036\u0037\u0038\u0039"
    "\u003a\u003b\u003c\u003d\u003e\u003f\u0040\u0041\u0042\u0043\u0044\u0045\u0046\u0047\u0048\u0049"
    "\u004a\u004b\u004c\u004d\u004e\u004f\u0050\u0051\u0052\u0053\u0054\u0055\u0056\u0057\u0058\u0059"
    "\u005a\u005b\u005c\u005d\u005e\u005f\u0060\u0061\u0062\u0063\u0064\u0065\u0066\u0067\u0068\u0069"
    "\u006a\u006b\u006c\u006d\u006e\u006f\u0070\u0071\u0072\u0073\u0074\u0075\u0076\u0077\u0078\u0079"
    "\u007a\u007b\u007c\u007d\u007e"
    "\u00a0\u00b7\u00ab\u00bb"
    "\u00c0\u00c1\u00c2\u00c3\u00c7\u00c8\u00c9\u00ca\u00cb\u00cc\u00cd\u00ce\u00cf"
    "\u00d0\u00d2\u00d3\u00d4\u00d5\u00d6\u00d8\u00d9\u00da\u00db\u00dc"
    "\u00df\u00e0\u00e1\u00e2\u00e3\u00e7\u00e8\u00e9\u00ea\u00eb\u00ec\u00ed\u00ee\u00ef"
    "\u00f0\u00f2\u00f3\u00f4\u00f5\u00f6\u00f8\u00f9\u00fa\u00fb\u00fc"
    "\u011e\u011f\u0130\u0131\u015e\u015f\u0218\u0219\u00ae"
    "\u2018\u2019\u201c\u201d\u2013\u2014\u2026"
)

def tara_metin(alan, metin, ad):
    sorun = []
    for i, ch in enumerate(metin):
        if ch not in ALLOWED:
            baglam = metin[max(0, i - 25):i + 25].replace("\n", " ")
            sorun.append((ad, alan, i, baglam, hex(ord(ch))))
    return sorun

BASE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "src", "data", "menkibeler")
bozuklar = []
for ad in sorted(os.listdir(BASE)):
    if not ad.endswith(".json"):
        continue
    yol = os.path.join(BASE, ad)
    try:
        data = json.load(io.open(yol, encoding="utf-8"))
    except Exception as e:
        bozuklar.append((ad, "parca", 0, "PARSA: " + str(e)[:80], "")  )
        continue
    for alan in ("id", "kategori", "baslik", "hikaye", "hikmet", "kaynak"):
        metin = data.get(alan, "")
        bozuklar.extend(tara_metin(alan, metin, ad))

if bozuklar:
    sys.stdout = io.open(sys.stdout.fileno(), mode="w", encoding="utf-8", errors="backslashreplace")
    print("BOZUK BULGULAR:")
    for ad, alan, i, baglam, kod in bozuklar[:60]:
        print(" ", ad, "|", alan, "|", hex(i), "| kod:", kod, "| ...", baglam, "...")
    print("toplam bulgu:", len(bozuklar))
    sys.exit(1)
print("TUM DOSYALAR TEMIZ")
