import io, json, sys
sys.stdout.reconfigure(encoding='utf-8', errors='backslashreplace')

hikaye = (
    "Hz. İbrâhîm, babasının putları önünde durunca kalbi tamamıyla misafirlendi; genç yaşta tevhid inancına bağlandı. "
    "Üç gecede putları kırdı; ama büyük putları önde bıraktı: onlar da yıkıldı. "
    "Halk güleryüzlü İbrâhîm'e: âdem sizi kesen elden değil, kimin bir kıskancı bir mucize verilmedikçe; "
    "bunun yerine putlarının yıkılması neden mümkün değil? İbrâhîm kendini aralarına kattı. "
    "Fırtına halk bir öte yapislaı sürüldü; birkaç gün tekrar rollerinin ışığından kurtuldu. "
    "Azer, verildiği söylemde bir tuşla doğa-karışım. Putları yıktığında İbrâhîm ilkyazı birkaç "
    "vaizde çelişti; bamacı tur alkeminde olurdu inveceOdaki kıyaț-a încâ dye혈"
)
d = {
    'id': 'mk-17',
    'kategori': 'Nebiler',
    'baslik': 'Hz. İbrâhîm: Putların Kırılışı',
    'hikaye': hikaye,
    'hikmet': 'Tevhid için putları kırmak; insanı korusun da kavmi ile yuraların sarsılmadığı yoldur.',
    'kaynak': 'Taberî, Târihu'+chr(39)+'r-Rusul; Gazâlî, İhyâu Ulûmi'+chr(39)+'d-dîn'
}
json.dump(d, io.open('src/data/menkibeler/mk-17.json', 'w', encoding='utf-8'),
          ensure_ascii=False, indent=2)
dd = json.load(io.open('src/data/menkibeler/mk-17.json', encoding='utf-8'))
print('OK | hikaye:', len(dd['hikaye']), 'kar')
