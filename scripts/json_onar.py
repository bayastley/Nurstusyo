import io, json, sys, re
f = sys.argv[1] if len(sys.argv) > 1 else 'src/data/menkibeler/mk-15.json'
t = io.open(f, encoding='utf-8').read()
lines = t.split('\n')
# hikaye satırını baştan sondan kur: escape işlemi tırnak içindekine uygulanır
for k, ln in enumerate(lines):
    s = ln.strip()
    if s.startswith('"hikaye"'):
        # değer kısmını al: "hikaye": "..."
        m = re.match(r'("hikaye"\s*:\s*")(.*)("\s*,?)\s*$', s, re.S)
        if m:
            govde = m.group(2).replace('\r', '').replace('\n', '\\n').replace('\\"', '#DELQUOTE#')
            lines[k] = '  ' + m.group(1) + govde + m.group(3)
        break
t = '\n'.join(lines)
io.open(f, 'w', encoding='utf-8').write(t)
try:
    d = json.load(io.open(f, encoding='utf-8'))
    print('OK | hikaye:', len(d['hikaye']), 'karakter')
except Exception as e:
    print('HALA BOZUK:', e)
