import io, json, re
f = 'src/data/menkibeler/mk-15.json'
t = io.open(f, encoding='utf-8').read()
i = t.find('"hikaye"')
j = t.find('"hikmet"')
header = t[:i]                      # "{" ile hikaye anahtarına kadar
footer = t[j:]                      # hikmetten itibaren
# hikaye gövdesini eski dosyadan kurtar: escape işlemini yap
eski = t[i:j]
govde = eski.replace('\r\n', ' ').replace('\n', ' ').replace('\r', ' ')
govde = govde.replace('  ', ' ')
# tekrar "hikaye" anahtarını başa koy, varolan değeri sadeleştir
govde = govde.replace('"hikaye":', '', 1).strip()
# sondaki ve bastaki tırnak/koma dökülür
if govde.endswith(','):
    govde = govde[:-1]
govde = govde.replace('"', '\\"')   # içteki tırnakları escape et
kurulmus = '{\n  "hikaye": "' + govde.strip() + '",\n  ' + footer
io.open(f, 'w', encoding='utf-8', newline='\n').write(kurulmus)
d = json.load(io.open(f, encoding='utf-8'))
print('OK | hikaye:', len(d['hikaye']), 'karakter')
print(d['hikaye'][:120])
