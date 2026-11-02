import json, io, os
p = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "src", "data", "menkibeler", "mk-06.json")
d = json.load(io.open(p, encoding="utf-8"))
d["hikaye"] = ("Bil\u00e2l, k\u00f6le oldu\u011fu i\u00e7in \u0130sl\u00e2m'a ge\u00e7ti\u011fi i\u00e7in ez\u00e2 "
               "g\u00f6rd\u00fc; efendisi onu \u00e7\u00f6lde k\u0131zg\u0131n kuma\u015fa "
               "yat\u0131rd\u0131. K\u0131rba\u00e7lar alt\u0131nda tek kelime s\u00f6yledi: "
               "\"Ehad, Ehad!\" Sonra Hz. Eb\u00fb Bekir onu azat etti. Bil\u00e2l, \u0130sl\u00e2m'\u0131n "
               "ilk m\u00fclezz\u00e2zi oldu; Hicret'te K\u00e2be'nin \u00fcst\u00fcnde "
               "\u0130sl\u00e2m'\u0131n ilk ezan\u0131n\u0131 okudu.")
d["hikmet"] = ("Kul nice eziyette sabr\u0131yla Allah'a y\u00fcz tutar; Allah onu y\u00fckselten "
               "ad\u00e2let ile kar\u015f\u0131l\u0131kl\u0131 sek\u015fin \u015f\u00e2mil g\u00f6r\u00fcr.")
d["kaynak"] = "\u0130bn Hi\u015f\u00e2m, S\u00eeret\u00fc'n-Neb\u00ee; Eb\u00fb Nuaym, Hilyet\u00fc'l-Evliy\u00e2"
json.dump(d, io.open(p, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
print("mk-06 duzeltildi")
