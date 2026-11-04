import sys, io
sys.stdout.reconfigure(encoding="utf-8", errors="backslashreplace")
# kullanım: python -X utf8 scripts/ham_duzelt.py yol eskiDize yeniDize
yol, eski, yeni = sys.argv[1], sys.argv[2], sys.argv[3]
t = io.open(yol, encoding="utf-8").read()
if eski not in t:
    print("ESKI PARCACIK BULUNAMADI:", eski[:60])
    sys.exit(1)
t = t.replace(eski, yeni, 1)
io.open(yol, "w", encoding="utf-8").write(t)
print("OK, degisti")
