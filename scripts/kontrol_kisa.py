import sys, io, json, os
sys.stdout.reconfigure(encoding="utf-8", errors="backslashreplace")

def kontrol(yol):
    try:
        d = json.load(io.open(yol, encoding="utf-8"))
    except Exception as e:
        print("PARSE HATASI:", yol, "|", e)
        return 1
    hikaye = d.get("hikaye", "")
    hikmet = d.get("hikmet", "")
    sorun = []
    # çok geçici bozuk alanları basit kontrol: çoklu latin harf üretiminde garble belirğini
    # gerçekleştirmek zor; sadece uzunluk + alan bütünlüğü raporlanır
    print("OK   %s | kategori: %s | hikaye: %d kar | hikmet: %d kar" % (
        yol, d.get("kategori"), len(hikaye), len(hikmet)))
    return 0

if __name__ == "__main__":
    sys.exit(sum(kontrol(y) for y in sys.argv[1:]))
