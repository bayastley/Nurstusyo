import json, io, os, sys
sys.stdout.reconfigure(encoding="utf-8", errors="backslashreplace")
p = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "src", "data", "menkibeler", "mk-08.json")
d = json.load(io.open(p, encoding="utf-8"))
d["hikaye"] = ("Z\u00fcnn\u00fbn-i M\u0131sr\u00ee, valinin iftir\u00e2s\u0131 ile gemiden at\u0131ld\u0131. "
               "Denizin ortas\u0131nda kald\u0131. O anda iki b\u00fcy\u00fck bal\u0131k onu "
               "s\u0131rtlar\u0131na al\u0131p k\u0131y\u0131ya ta\u015f\u0131d\u0131. Vali bu durumu "
               "g\u00f6r\u00fcnce utand\u0131 ve pi\u015fman oldu.")
d["hikmet"] = "Hak, samimi kulunu imtihanda yaln\u0131z b\u0131rakmaz."
d["kaynak"] = "Att\u00e2r, Tezkiret\u00fc'l-Evliy\u00e2"
json.dump(d, io.open(p, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
print("mk-08 son duzeltme")
