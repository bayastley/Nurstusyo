import io, json, sys
sys.stdout.reconfigure(encoding='utf-8', errors='backslashreplace')

d = {
    'id': 'mk-16',
    'kategori': 'Nebiler',
    'baslik': 'Hz. Musa: Saraydan Çöl Sessizliğine',
    'hikaye': ("Hz. Musa, Firavunnun sarayında büyüdü; İsrail oğullarının köleliğini görünce kalbi ezildi. "
               "Bir gün bir saray adamının zulmüne şahit olunca kendini tutamadı; sonra Medyen'e kaçtı. "
               "Orada şeyh Süeyb'in yanında sekiz-on yıl çobanlık yaptı; duanın sonunda Medyen'den ayrıldı. "
               "Musa, ayrıldığında Mısır'a döndü; Firavun'a davet gönderdi; Firavun büyüklük yaptıgından reddetti. "
               "Kavmini deniz boyunca yürüttü; deniz graceliği ilkinde kurtuldu; Firavun boğuldu. "
               "Musa, sonraki günlerde İsrail oğullarının üzerinde vali oldu; kalbi yalnızAllah dariin kullar olduğu için."),
    'hikmet': ('Zulüm karşısında susan kalb; kaçmak her ideyada teslim değildir.'),
    'kaynak': 'Taberî, Târihu'+chr(39)+'r-Rusul; İbn Kesîr, el-Bidâye'
}
json.dump(d, io.open('src/data/menkibeler/mk-16.json', 'w', encoding='utf-8'),
          ensure_ascii=False, indent=2)
dd = json.load(io.open('src/data/menkibeler/mk-16.json', encoding='utf-8'))
print('OK | hikaye:', len(dd['hikaye']), 'kar')
