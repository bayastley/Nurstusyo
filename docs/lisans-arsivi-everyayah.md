# 📜 SES KAYNAĞI LİSANS ARŞİVİ

> **Oluşturma:** 09.10.2026 · **Kaynak doğruluk:** `src/reciters.ts` (tek doğruluk kaynağı; bu dosya özet+kanıt bağlantısıdır)
> **Amaç:** Telif savunması için kaynak/lisans kanıtının TEK dosyada toplanması (dikkat edilecekler.txt açık madde 5)

---

## 1) Birincil kaynak — everyayah.com

- **URL kalıbı:** `https://everyayah.com/data/{KLASOR}/{SSS}{AAA}.mp3` (SSS=sure, AAA=ayet, 3 hane)
- **Üretici fonksiyon:** `reciterAudioUrl()` — `src/reciters.ts`
- **EveryAyah konum:** Açık erişimli Kur'an ayet-bazlı ses arşivi (ayet/ayet kısa klipler). Sitede
  "Quran MP3 downloads" başlığıyla kamuya açık dosyalar sunar; sitede ayrıca talep üzerine
  iletişim kanalı üzerinden telif bildirimi yapılabilir.

### ⚠️ Kanıt durumu (yapılması bekleyen)
- EveryAyah sitesinde **kâri başına yazılı serbest lisans beyanı (CC/prefix) henüz İNCELENMEDİ.**
- Aksiyon: her aktif klasör için site üstündeki kaynak/hak beyanı ekran görüntüsü + URL arşivle
  (aşağıdaki tabloya ekleyeceksin). Bu iş "kâriler"in tarafında bırakılmıştır; arşivin amacı
  kanıtın gecikmeden toplanabilmesidir.

---

## 2) Yedek kaynak — cdn.islamic.network

- **URL kalıbı:** `https://cdn.islamic.network/quran/audio/128/{edition}/{globalAyetNo}.mp3`
- **Eşleme:** `RECITER_SES_YEDEGI` — everyayah klasörü → `ar.*` edition adı.
  Eşleme **api.alquran.cloud/v1/edition sonucuyla 02.10'da doğrulandı**; doğrulanmayan
  kâri YEDEĞE DÜŞMEZ (bugünkü davranış korunur).
- **Üretici:** `reciterAudioYedekUrl()`, zincir `sesKaynakZinciri()`; element-hata zinciri
  `sesZinciriBagla()` ile bağlanır.
- **Lisans notu:** Islamic Network CDN genel kullanıma açıktır; api.alquran.cloud
  Dokümantasyonu edition bazlı yayına işaret eder. Kritik kâriler için aynı
  kanıt-ekran-görüntüsü işlemi buraya da uygulanmalıdır.

---

## 3) Tam-sure kaynakları — mp3quran.net (surahPattern / full alanı)

| Kari id       | full/[klasör,sunucu] | surahPattern (varsa) |
|---------------|---------------------|----------------------|
| muhaisny      | —                   | `https://server11.mp3quran.net/download/mhsny/{S}.mp3` |
| sudais        | ["sds", 11]         | — |
| maher         | ["maher", 12]       | — |
| hudhaify      | ["hthfi", 9]        | — |
| qatami        | ["qtm", 6]          | — |
| dosari        | ["yasser", 12]      | — |
| husary        | ["husr", 13]        | — |
| abdulbasit    | ["basit", 7]        | — |
| jibreel       | ["jbrl", 8]         | — |
| mustafa_ismail| —                   | `https://cdn.mp3quran.net/audio/mustafa-ismail/r1/{S}.mp3` |

- Bu kâriler **tam sure** dosyası indirir (ayet klipleri yerine); `full`/`surahPattern`
  alanları `src/reciters.ts`'de tanımlıdır.

---

## 4) Aktif kâri listesi (reciters.ts'ten türetilmiş — id, klasör, ülke, risk)

> ⚠️ Bu listeyi elle sabitlemek yerine her sürümde `src/reciters.ts`'in kendisi referans alınır.
> Aşağıdaki liste yalnızca **bu arşivin yazıldığı tarih** itibariyle alındı; yeni kâri eklenirse
> güncelle (ihracat scripti: `node -e` ile `RECITERS`'ı ver — sonraki iş olarak eklenecek).

| id | path | ülke | risk |
|---|---|---|---|
| muhaisny | (full: server11/mhsny) | Suudi Arabistan | low |
| sudais | Abdurrahmaan_As-Sudais_192kbps | Suudi Arabistan | low |
| sudais_fast | Abdurrahmaan_As-Sudais_64kbps | Suudi Arabistan | low |
| shuraim | Saood_ash-Shuraym_128kbps | Suudi Arabistan | low |
| maher | MaherAlMuaiqly128kbps | Suudi Arabistan | low |
| hudhaify | Hudhaify_128kbps | Suudi Arabistan | low |
| juhany | Abdullaah_3awwaad_Al-Juhaynee_128kbps | Suudi Arabistan | low |
| qasim | Muhsin_Al_Qasim_192kbps | Suudi Arabistan | low |
| budair | Salah_Al_Budair_128kbps | Suudi Arabistan | low |
| ayyoub | Muhammad_Ayyoub_128kbps | Suudi Arabistan | low |
| matroud | Abdullah_Matroud_128kbps | Suudi Arabistan | low |
| akhdar | Ibrahim_Akhdar_32kbps | Suudi Arabistan | low |
| basfar | Abdullah_Basfar_192kbps | Suudi Arabistan | low |
| qatami | Nasser_Alqatami_128kbps | Suudi Arabistan | low |
| dosari | Yasser_Ad-Dussary_128kbps | Suudi Arabistan | low |
| ajamý | ahmed_ibn_ali_al_ajamy_128kbps | Suudi Arabistan | low |
| husary | Husary_128kbps | Mısır | low |
| husary_mujawwad | Husary_128kbps_Mujawwad | Mısır | low |
| husary_teacher | Husary_Muallim_128kbps | Mısır | low |
| abdulbasit | Abdul_Basit_Murattal_192kbps | Mısır | low |
| abdulbasit_mujawwad | Abdul_Basit_Mujawwad_128kbps | Mısır | low |
| minshawi | Minshawy_Murattal_128kbps | Mısır | low |
| minshawi_mujawwad | Minshawy_Mujawwad_192kbps | Mısır | low |
| tablawi | Mohammad_al_Tablaway_128kbps | Mısır | low |
| banna | mahmoud_ali_al_banna_32kbps | Mısır | low |
| jibreel | Muhammad_Jibreel_128kbps | Mısır | low |
| alafasy | Alafasy_128kbps | Kuveyt | **mid** |
| shatri | Abu_Bakr_Ash-Shaatree_128kbps | Yemen | **mid** |
| qahtani | Khaalid_Abdullaah_al-Qahtaanee_192kbps | Suudi Arabistan | **mid** |
| sowaid | Ayman_Sowaid_64kbps | Suriye | low |
| parhizgar | Parhizgar_48kbps | İran | low |
| ali_jaber | Ali_Jaber_64kbps | Suudi Arabistan | low |
| ghamdi_saad | Ghamadi_40kbps | Suudi Arabistan | low |
| hani_rifai | Hani_Rifai_192kbps | Suudi Arabistan | low |
| fares_abbad | Fares_Abbad_64kbps | Suudi Arabistan | low |
| mustafa_ismail | (cdn.mp3quran tam sure) | Mısır | low |
| akram_alaqimy | Akram_AlAlaqimy_128kbps | Irak | low |
| abdulkareem | Muhammad_AbdulKareem_128kbps | Mısır | low |
| bukhatir | Salaah_AbdulRahman_Bukhatir_128kbps | BAE | low |
| yaser_salamah | Yaser_Salamah_128kbps | Mısır | low |
| tunaiji | Khalefa_Al_Tunaiji_64kbps | BAE | low |
| ahmed_neana | Ahmed_Neana_128kbps | Mısır | low |
| sahl_yassin | Sahl_Yassin_128kbps | Suudi Arabistan | low |
| aziz_alili | Aziz_Alili_128kbps | Bosna Hersek | low |
| karim_mansoori | Karim_Mansoori_40kbps | İran | low |

- (`…404 kaldırılan` kâriler reciters.ts içinde yorum satırı olarak arşivlenmiştir —
  khalid_aljalil, nabil_rifai, hady_toure, balila, ibrahim_dosary_warsh,
  karim_mansoori_mujawwad, yassin_jazaery_warsh.)

---

## 5) Telif riski politikası (özet)

- Her kâri `telifRiski` 0–100 skoruyla işaretlenir (düşük/orta). **high** kâri şu an yok;
  premium'da high-risk kısıtı kararı açık bir iş maddesi olarak kalıyor.
- Kullanıcıya **telif uyarısı** ÜRETİM ÖNCESİ bir kere gösterilir (`TelifDisclaimer.tsx`,
  5 dilde). Ayrıca "sorumluluk üreticidedir" cümlesi eklendi (09.10).
- **Kaldırılan kâriler** (everyayah 404) kaynak kaybı nedeni ile devre dışıdır —
  yeniden aktive edilmeden önce everyayah tekrar erişim testi yapılmalıdır.

---

## 6) Kanıt toplama checklist (açık iş)

- [ ] Her aktif klasörün everyayah sayfa/başlık ekran görüntüsü → `docs/lisans-kanitlari/{id}.png`
- [ ] Everyayah "terms" sayfası içeriğinin arşiv.org snapshot linki kayıt altına alınsın
- [ ] islamic.network CDN için aynı işlem (bcd / api.alquran.cloud edition listesi export)
- [ ] mp3quran.net sunucu (server11, cdn.mp3quran.net) için erişim+kurallar sayfası arşivi
- [ ] (gelecek) Reciters'a yeni kâri eklendiğinde checklist'in otomatik hatırlatılması
