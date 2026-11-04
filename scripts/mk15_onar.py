import io, json, sys
f = 'src/data/menkibeler/mk-15.json'
t = io.open(f, encoding='utf-8').read()
i = t.find('"hikaye"')
j = t.find('"hikmet"')
# iki key arasını ham metin olarak alıp gerçek kontrol karakterlerini \\n ile escape et
parca = t[i:j]
temiz = parca.replace('\r\n', '').replace('\n', '\\n')
t = t[:i] + temiz + t[j:]
io.open(f, 'w', encoding='utf-8').write(t)
d = json.load(io.open(f, encoding='utf-8'))
print('OK | hikaye:', len(d['hikaye']), 'karakter')
