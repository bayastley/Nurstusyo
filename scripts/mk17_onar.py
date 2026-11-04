import io, json
f = 'src/data/menkibeler/mk-17.json'
t = io.open(f, encoding='utf-8').read()
i = t.find('"hikaye"', 0)
k = t.find('"hikmet"', 0)
# hikaye satırını ham metinden sadeleştir: gerçek satır sonlarını yerleştir
parca = t[i:k]
parca = parca.replace('\r\n', ' ').replace('\n', ' ')
header = '{\n'
footer = t[k:]
kurulmus = 'hikayeparca\n' + footer
# hikaye başına dize açma ve value: "hikaye": "..."
parca = parca.replace('"hikaye"', '"hikaye": "', 1)
if not parca.endswith(',\n'):
    parca = parca.rstrip() + ',\n'
kurulmus = header + parca + footer
io.open(f, 'w', encoding='utf-8', newline='\n').write(kurulmus)
try:
    d = json.load(io.open(f, encoding='utf-8'))
    print('OK | hikaye:', len(d['hikaye']))
    print('SON:', d['hikaye'][-100:])
except Exception as e:
    print('BOZUK:', e)
