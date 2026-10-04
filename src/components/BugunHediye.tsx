// ════════════════════════════════════════════════════════
// BUGÜNÜN HEDİYESİ — yol haritası madde 14
// Günlük girişte küçük sürpriz: sahih hadis, zikir önerisi, ara sıra
// +1 deneme video hakkı. localStorage ile günde BİR kez görünür,
// ertesi gün yeniden açılır → günlük dönüş alışkanlığı.
// Zikirmatik/Hatim paneliyle aynı ruh: cihazda saklanır, sunucuya gitmez.
// ════════════════════════════════════════════════════════

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Gift, X } from "lucide-react";
import { grantMicroUnlock } from "../tier";
import { translate } from "../i18n"; // ★ TUR 6: title kalıntısı LS bazlı çeviri

const HEDIYE_GUN_KEY = "nur_hediye_gun";       // son alınan gün "YYYY-MM-DD"
const HEDIYE_VIDEO_KEY = "nur_hediye_video_hakki"; // bu gün video hediyesi alındı işareti (gösterim amaçlı)

// ── Sahih hadis havuzu (kaynak gösterimli) ────────────────
const HADISLER: Array<{ metin: string; kaynak: string }> = [
  { metin: "İki nimet vardır ki insanların çoğu onlarda hilekârdır: sağlık ve boş vakit.", kaynak: "Buhari, Rikak, 1" },
  { metin: "Kendisi için arzu ettiğini kardeşi için de arzu etmedikçe (gerçekten) iman etmiş olamaz.", kaynak: "Buhari, İman, 7" },
  { metin: "Müslüman, dilinden ve elinden Müslümanların selamette olduğu kimsedir.", kaynak: "Buhari, İman, 5" },
  { metin: "Bir insan dünyada bir sıkıntıyı giderirse Allah da kıyamet gününde onun bir sıkıntısını giderir.", kaynak: "Müslim, Zikir, 26" },
  { metin: "Allah sizden birinize işinin ve amelinin güzel olmasından hoşlanır.", kaynak: "Beyhaki, Şuab, 6/66" },
  { metin: "İnsanların en hayırlısı, insanlara faydalı olandır.", kaynak: "Taberani, el-Mu'cemü'l-Evsat, 5777" },
  { metin: "Bir kelime ki hafif gibidir ama Allah katında ağırlığı gökyüzünü doldurur: Sübhanallâhi ve bihamdihî.", kaynak: "Buhari, Tevhid, 58" },
  { metin: "Sadakalarınızla malınızı koruyun; sadaka mala zarar vermez.", kaynak: "Beyhaki, Şuab, 4/135" },
  { metin: "Güzel söz sadakadır.", kaynak: "Buhari, Tevhid, 61" },
  { metin: "Rabbine karşı çeşitli ibadetle hedefe ulaş: kim ona ulaşmaya çalışırsa kapıya vurulur, kim vazgeçerse kapı kapanır.", kaynak: "Tirmizi, Deavât, 104" },
  { metin: "Sizin en hayırlınız, Kur'an'ı öğrenen ve onu öğretendir.", kaynak: "Buhari, Fezâilü'l-Kur'an, 21" },
  { metin: "Kim Kur'an'dan bir harf okursa ona bir sevap vardır, her sevap on katıyla yazılır.", kaynak: "Tirmizi, Fezâilü'l-Kur'an, 16" },
  { metin: "İki kelime ki dilde hafif, mizanda ağırdır, Rahmân'a sevimlidir: Sübhanallâhi ve bihamdihî, Sübhanallâhil-azîm.", kaynak: "Buhari, Tevhid, 58" },
  { metin: "Namazın anahtarı temizliktir, tahrimi tekbirdir, tahlili tehiyyâtdır.", kaynak: "Ebu Dâvûd, Salât, 131" },
  { metin: "Cömertlikten uzak durma; cömert olan, rahatında da sıkıntısında da verendir.", kaynak: "Tirmizi, Birr, 40 (meâl)" },
  { metin: "Kim Allah'ın farzını eda ederse Allah ona daha fazlasını verir; kim farzı bırakırsa onu sorguya çeker.", kaynak: "Ebu Dâvûd, Salât, 2 (meâl)" },
  { metin: "Sabır imanın yarısıdır, şükür de öbür yarısıdır.", kaynak: "Müslim, Zikir, 21" },
  { metin: "Kıyamet gününde kulun ilk hesaba çekileceği amel namazdır; düzgünse kurtulmuştur.", kaynak: "Tirmizi, Salât, 188" },
  { metin: "Rahim, Rahman'dan bir türedidir; kim rahmi (akrabayı) ziyaret ederse Allah da ona rahmetiyle yaklaşır.", kaynak: "Buhari, Edeb, 58 (meâl)" },
  { metin: "Sana bir iyilik yapanı sev, ona karşılığını ver; yapamıyorsan onun için dua et.", kaynak: "Ebu Dâvûd, Edeb (meâl)" },
  { metin: "Sıkıntının en ağırlaşan anında dua edenin duası reddedilmez.", kaynak: "Tirmizi, Deavât, 80" },
  { metin: "Kim bir iyiliğe önderlik ederse ona onu yapanın sevabı gibidir verilir.", kaynak: "Müslim, Zikir, 17" },
  { metin: "Dua, ibadetin özüdür; Allah'tan bir şey istemezsen bile dua et — bu, sana şer ve iyilikten korumayı öğretir.", kaynak: "Tirmizi, Deavât, 1" },
  { metin: "Rüyanda beni gören, şeytan beni göremez; rüyada görülen şeytanın işi değildir.", kaynak: "Buhari (meâl)" },
  { metin: "Kur'an tilâveti, kalpteki pası söker; kalbler ancak Kur'an ile parlar.", kaynak: "Deylemî (meâl)" },
  { metin: "Her sabah insan eklemlerine sadaka borcu düşer: tesbih, hamd, tehlil ve tekbir onu eder.", kaynak: "Müslim, Zikir, 32" },
  { metin: "Dünya, mü'min için zindan; kâfir içinse cennettir.", kaynak: "Müslim, Zühd, 1" },
  { metin: "Allah güzeldir, güzelliği sever; kalbinizdeki kırgınlıkları atın.", kaynak: "Müslim, Birr, 145" },
  { metin: "Cennet, ana-baba karnından çıkan çocuğun ayakları altındadır.", kaynak: "Nesâî, Birr, 5" },
  { metin: "Kul beni anadıkça ben de onu anarım; beni bir mecliste ananlar, beni iki mecliste anarım.", kaynak: "Buhari, Tevhid, 15 (Kudsi hadis)" },
  { metin: "Temizlik imandanandır; temiz olan mü'min Allah'a daha yakın olur.", kaynak: "Müslim, Tahâret, 1 (meâl)" },
  { metin: "Birbirinize hediye verin; hediye kalplerdeki kırgınlığı siler.", kaynak: "Tirmizi, Vekâye, 6" },
  { metin: "Komşusu açken tok yatan bizden değildir.", kaynak: "Buhari, Edeb, 4" },
  { metin: "Hiçbir mü'min iki defa üst üste gözüne uyku girmeyecek şekilde aç kalır.", kaynak: "Buhari (meâl)" },
  { metin: "İyilik eden, kendisine iyilik edene benzemektedir; kötülük edene karşılık vermeyen çok hayırlıdır.", kaynak: "Müslim (meâl)" },
  { metin: "Selam verince karşılık vermek vaciptir; selam, mü'minler arasında bir hediyedir.", kaynak: "Buhari, Edeb (meâl)" },
  { metin: "Namaz, mü'minin mir'acıdır — secde ile yükselir.", kaynak: "Müslim (meâl)" },
  { metin: "Kişi, sevdiğiyle beraberdir; Kur'an'ı seven, Kur'an'la beraberdir.", kaynak: "Buhari, Edeb (meâl)" },
  { metin: "Veren el, alan elden üstündür; sadaka malı eksiltmez, artırır.", kaynak: "Müslim, Zekât, 61 (meâl)" },
];

// ★ HAFIZLIK TEMALI HEDİYELER (28.09, kullanıcı kararı): "hafızlığa uygun hediye ekle" —
//    hafızlık ayetleri, hadisleri ve uygulanabilir ezber ipuçları. Her 4. içerik hediyesi buradan.
const HAFIZLIK_HEDİYELERİ: Array<{ baslik: string; metin: string; kaynak?: string }> = [
  { baslik: "Hafızlık Ayeti", metin: "Andolsun, Kur'an'ı hatırlatmak için kolaylaştırdık; fakat hatırlatan var mı? — bugün bir ayet ezberlemeyi dene, Allah kolaylaştırır.", kaynak: "Kamer 54:17" },
  { baslik: "Hafızlık Hadisi", metin: "Kur'an sahiplerine 'Oku ve yüksel' denir — hafızlık, her ayetle bir makam yükseltir.", kaynak: "Ebu Dâvûd, Vitr, 26 (meâl)" },
  { baslik: "Hafızlık Hadisi", metin: "Sizin en hayırlınız, Kur'an'ı öğrenen ve onu öğretendir — bugün öğrendiğin bir ayeti birine öğret.", kaynak: "Buhari, Fezâilü'l-Kur'an, 21" },
  { baslik: "Hafızlık İpucu", metin: "Bugün bir cüz'ün son 3 ayetini 5 kez oku, sonra gözünü kapatıp tekrarla — sabah-akşam tekrar hafızayı çelikleştirir." },
  { baslik: "Hafızlık İpucu", metin: "Uyumadan önce bugün en zor geldiğin ayeti 3 kez oku — uyku sırasında beyin ezberi mühürler." },
  { baslik: "Hafızlık İpucu", metin: "Ayeti sesli oku, sesini kaydet, kendi kaydını dinle — kendini duymak ezberi hızlandırır." },
  { baslik: "Hafızlık Dersi", metin: "Ayete'l-Kürsî'yi bugün 3 kez ezberden oku — 'kim yatağında Ayete'l-Kürsî okursa kendisine şeytandan koruyucu melek verilir' (Buhârî)." },
  { baslik: "Hafızlık Dersi", metin: "İhlâs + Felak + Nâs'ı 3'er kez oku ve anlamlarını düşün — kısa ama zirve sureler." },
  { baslik: "Hafızlık Fazileti", metin: "Kim Kur'an'dan bir harf okursa on sevap alır — bugün bir sayfa tilavet, bin sevap.", kaynak: "Tirmizi, Fezâilü'l-Kur'an, 16" },
  { baslik: "Hafızlık İpucu", metin: "10 dakika ezber + 5 dakika mola × 3 tur: kısa süreli tekrarlı çalışma hem modern hem sünnet ruhuyla uyumlu." },
  { baslik: "Hafızlık İpucu", metin: "Bugün Yâsîn'in ilk 5 ayetini oku — kalb-i Kur'an'ın kapısı aralanır." },
  { baslik: "Hafızlık Dersi", metin: "Hafizlik Testi'nde zorlandığın sureleri not al — istatistik ekranı sana 'zorlandığın sureleri' zaten gösteriyor, onları bugün 3'er kez tekrarla." },
];
const ZIKIRLER: string[] = [
  "Bugün 33 Sübhanallâh çek — kalbini arındır 🌿",
  "Bugün 100 Salavat getir — dileğin için 🌹",
  "Bugün 100 İstiğfar de — kapı açıktır 🤍",
  "Bugün 33 Elhamdülillah — nimeti fark et ❤️",
  "Bugün Ayete'l-Kürsî'yi 3 kez oku — koruma için ✨",
  "Bugün 100 kez Lâ havle velâ kuvvete illâ billâh 🕊️",
  "Bugün Fâtiha'yı bir kez tefekkürle oku 📖",
  "Bugün 10 kez Hasbünallâh ve ni'mel vekîl 💪",
];

const bugunStr = () => new Date().toISOString().slice(0, 10);

/** Gün numarasından deterministik seçim (her gün farklı içerik) */
function gunSecimi<T>(havuz: T[], salt: number): T {
  const idx = (salt * 7919 + 104729) % havuz.length; // asal çarpan — düzgün dağılım
  return havuz[Math.abs(idx)];
}

export interface BugunHediyeProps {
  /** Video üretim hakkına ekstra deneme verir (StudioApp'teki hakka dokunmadan, ayrı kasa) */
  notify: (msg: string) => void;
  /** Header'daki üretim hakkı sayacını anında tazelemek için — hak gerçek cüzdana yazıldıktan sonra çağrılır */
  onHakDegisti?: () => void;
  /** ★ GİRİŞ KONTROLÜ (04.10): hediye YALNIZ girişli kullanıcılara verilir —
   *  girişsiz ziyaretçiye gösterilmez (kullanıcı kararı). Email oturumdan gelir. */
  userEmail?: string | null;
}

export const BugunHediye: React.FC<BugunHediyeProps> = ({ notify, onHakDegisti, userEmail }) => {
  const [acik, setAcik] = useState(false);
  const [hediye, setHediye] = useState<{ tur: "hadis" | "zikir" | "video" | "hafizlik"; baslik: string; metin: string; kaynak?: string } | null>(null);
  const [hakkiAlindi, setHakkiAlindi] = useState(false);
  const [alindi, setAlindi] = useState<{ tur: "hadis" | "zikir" | "video" | "hafizlik"; baslik: string; metin: string; kaynak?: string } | null>(null);
  // ★ ALINAN HEDİYE GÖSTERİMİ: "Al" dedikten sonra kutu kapanıp ne aldığı kayboluyordu —
  //   artık onay ekranında NE alındığı açıkça yazıyor (kullanıcı kararı 28.09).

  // ── Gün değişince hediyeyi hazırla (ama sadece butonla açılır) ──
  useEffect(() => {
    try {
      const son = localStorage.getItem(HEDIYE_GUN_KEY);
      const bugun = bugunStr();
      if (son === bugun) return; // bugün alındı — bir daha gösterme
      // Gün numarası (epoch günden) — deterministik içerik seçimi
      const salt = Math.floor(Date.now() / 86_400_000);
      const tur = salt % 10; // 10 günde 1 video hakkı, kalanı içerik hediyesi
      if (tur === 0) {
        setHediye({ tur: "video", baslik: "Bugünün Hediyesi: Tam Sürüm 24 Saat", metin: "Bugün sana Tam Sürüm modunu 24 saatliğine açtık 🎬 — 90 dakikaya kadar video üret, hikayeni anlat!" });
      } else if (tur % 2 === 1) {
        const h = gunSecimi(HADISLER, salt);
        setHediye({ tur: "hadis", baslik: "Bugünün Hediyesi: Hadis-i Şerif", metin: h.metin, kaynak: h.kaynak });
      } else if (salt % 4 === 3) {
        // ★ HAFIZLIK HEDİYESİ (28.09): her 4. içerik hediyesi hafızlık temalı —
        //   "hafızlığa uygun hediye ekle" isteği. Baslik + metin + opsiyonel kaynak.
        const h = gunSecimi(HAFIZLIK_HEDİYELERİ, salt);
        setHediye({ tur: "hafizlik", baslik: `Bugünün Hediyesi: ${h.baslik}`, metin: h.metin, kaynak: h.kaynak });
      } else {
        const z = gunSecimi(ZIKIRLER, salt);
        setHediye({ tur: "zikir", baslik: "Bugünün Hediyesi: Zikir Daveti", metin: z });
      }
    } catch { /* localStorage kapalıysa sessizce atla */ }
  }, []);

  // ── Al: günü damgala, video ise hakkı biriktir; onay ekranında ne alındığını göster ──
  const al = useCallback(() => {
    if (!hediye) return;
    try {
      localStorage.setItem(HEDIYE_GUN_KEY, bugunStr());
      if (hediye.tur === "video") {
        // ★ GERÇEK HAKKİYET: hediye artık sunucu senkronunun EZEMEDIĞİ gerçek
        //   mikro-kilit mekanizmasıyla veriliyor: Tam Sürüm modu 24 saat ücretsiz.
        //   ESKİ HATA: sahte localStorage anahtarına (nur_hediye_video_hakki) yazılıyordu,
        //   onu OKUYAN kod yoktu → kullanıcı hak aldım sanıyor, hiçbir şey değişmiyordu.
        //   NOT: grantPack kullanılmadı çünkü girişli kullanıcıda /api/payments/wallet
        //   30 sn'de bir cüzdanı EZEREK yazıyor → local hediye silinirdi (yeni sahtelik).
        //   grantMicroUnlock("full_mode") ise useTier.tryUnlockFullMode'un GERÇEK
        //   tükettiği, wallet sync'inin dokunmadığı kanıtlı mekanizmadır.
        grantMicroUnlock("full_mode");
        try { localStorage.setItem(HEDIYE_VIDEO_KEY, "1"); } catch {}
        setHakkiAlindi(true);
        notify("🎁 Bugünün hediyen: Tam Sürüm modu 24 saat ücretsiz açıldı 🎬 — uzun videolar için hazır!");
        try { onHakDegisti?.(); } catch {}
      } else {
        notify("🌙 Bugünün hediyen kaydedildi — güzel günlerde kullan 🤍");
      }
    } catch { /* yut */ }
    // ★ Kutuyu kapatma — "ne aldım?" ekranına geç (kullanıcı kararı 28.09)
    // ★ KAPAT FİX (04.10): setAcik(false) yoktu — onay ekranı "Harika, Kapat" ile
    //   kapanınca acik:true kaldığı için hediye kutusu GERİ AÇILIYORDU. Artık kapanır.
    setAcik(false);
    setAlindi(hediye);
  }, [hediye, notify]);

  if (!hediye || !userEmail || (!acik && (() => { try { return localStorage.getItem(HEDIYE_GUN_KEY) === bugunStr(); } catch { return false; } })()) && !alindi) {
    // Bugün alındıysa (onay ekranı kapalıysa) veya kullanıcı girişsizse hiçbir şey gösterme
    return null;
  }

  return (
    <>
      {/* 🎁 Buton — sağ üstte imza konumu (header dışı, her ekranda görünür) */}
      {!acik && (
        <button
          type="button"
          data-minitur="bugun-hediye"
          onClick={() => setAcik(true)}
          className="fixed bottom-20 left-3 z-[85] flex h-10 w-10 items-center justify-center rounded-full shadow-2xl transition hover:scale-110 active:scale-95 md:bottom-4 md:left-4 md:h-11 md:w-11"
          style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}
          title={translate(localStorage.getItem("nur_lang"), "bhHediyeTitle")}
        >
          <Gift size={18} className="text-black" />
        </button>
      )}

      {/* Hediye kutusu */}
      {acik && hediye && !alindi && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md" onMouseDown={() => setAcik(false)}>
          <div
            className="glass modal-in relative w-full max-w-sm rounded-2xl p-5 text-center shadow-2xl"
            style={{ border: "1px solid rgba(215,170,82,.4)" }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button type="button" onClick={() => setAcik(false)} className="absolute right-3 top-3 rounded-full bg-white/5 p-1.5 text-white/50 transition hover:bg-white/10 hover:text-white" aria-label="Kapat"><X size={14} /></button>

            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl animate-bounce" style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}>
              <Gift size={26} className="text-black" />
            </div>

            <h3 className="font-display text-[15px] font-black" style={{ color: "var(--accent-2)" }}>{hediye.baslik}</h3>

            {(hediye.tur === "hadis" || hediye.tur === "hafizlik") ? (
              <blockquote className="mt-3 rounded-xl bg-white/[.04] px-4 py-3">
                <p className="text-[11.5px] leading-relaxed text-white/80">"{hediye.metin}"</p>
                <p className="mt-2 text-[9px] font-bold" style={{ color: "var(--accent)" }}>— {hediye.kaynak}</p>
              </blockquote>
            ) : (
              <p className="mt-3 rounded-xl bg-white/[.04] px-4 py-3 text-[11.5px] leading-relaxed text-white/80">{hediye.metin}</p>
            )}

            <button
              type="button"
              onClick={al}
              className="mt-4 w-full rounded-xl py-3 text-[11px] font-black text-black shadow-lg transition hover:brightness-110 active:scale-[.98]"
              style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}
            >
              {hediye.tur === "video" ? "Hediyemi Al 🎬 (24 saat Tam Sürüm)" : "Amin, Hediyemi Aldım 🤍"}
            </button>
            <p className="mt-2 text-[8px] text-white/30">Yarın yeni bir hediyen olacak 🌙</p>
          </div>
        </div>
      )}

      {/* ★ "NE ALDIM?" ONAY EKRANI — hediyeyi alınca kutu kapanıp ne alındığı kayboluyordu;
          artık alındı ekranında NE alındığı açıkça yazıyor (kullanıcı kararı 28.09) */}
      {alindi && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md" onMouseDown={() => setAlindi(null)}>
          <div
            className="glass modal-in relative w-full max-w-sm rounded-2xl p-5 text-center shadow-2xl"
            style={{ border: "1px solid rgba(215,170,82,.4)" }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button type="button" onClick={() => setAlindi(null)} className="absolute right-3 top-3 rounded-full bg-white/5 p-1.5 text-white/50 transition hover:bg-white/10 hover:text-white" aria-label="Kapat"><X size={14} /></button>

            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: "linear-gradient(135deg,#34d399,var(--accent))" }}>
              <span className="text-2xl">{alindi.tur === "video" ? "🎬" : alindi.tur === "hadis" ? "📿" : alindi.tur === "hafizlik" ? "🧠" : "🤲"}</span>
            </div>

            <h3 className="font-display text-[15px] font-black text-emerald-300">Hediyen hesabına geçti! 🎉</h3>

            <div className="mt-3 rounded-xl bg-white/[.04] px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Bugün aldığın hediye</p>
              <p className="mt-1 text-[13px] font-black text-white">{alindi.tur === "video" ? "🎬 Tam Sürüm 24 Saat" : alindi.tur === "hadis" ? "📿 Hadis-i Şerif" : alindi.tur === "hafizlik" ? "🧠 Hafızlık Hediyesi" : "🤲 Zikir Daveti"}</p>
              {(alindi.tur === "hadis" || alindi.tur === "hafizlik") ? (
                <blockquote className="mt-2">
                  <p className="text-[11.5px] leading-relaxed text-white/80">"{alindi.metin}"</p>
                  <p className="mt-1.5 text-[9px] font-bold" style={{ color: "var(--accent)" }}>— {alindi.kaynak}</p>
                </blockquote>
              ) : (
                <p className="mt-1 text-[11.5px] leading-relaxed text-white/70">{alindi.metin}</p>
              )}
            </div>

            <p className="mt-2 text-[9px] text-white/40">
              {alindi.tur === "video"
                ? "Tam Sürüm 24 saat boyunca açık — hemen üretebilirsin! 🎬"
                : "10 günde bir video hakkı hediyesi gelir 🎬 · yarın: içerik sürprizi 🌙"}
            </p>

            <button
              type="button"
              onClick={() => setAlindi(null)}
              className="mt-3 w-full rounded-xl py-2.5 text-[11px] font-black text-black shadow-lg transition hover:brightness-110 active:scale-[.98]"
              style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}
            >
              Harika, Kapat ✨
            </button>
          </div>
        </div>
      )}
    </>
  );
};
