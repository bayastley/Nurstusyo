// ════════════════════════════════════════════════════════
// AYET PAKETLERİ — yol haritası madde 8
// "Vesveseye karşı 5 ayet", "Sabır ayetleri", "Cuma mesajları" —
// üretici 2 dakikada video basar. Paket seçilince ayetler tek tuşla
// stüdyoya eklenir (mevcut addAyah akışı üzerinden — stüdyo bozulmaz).
// ════════════════════════════════════════════════════════

import React, { useEffect, useMemo, useState } from "react";
import { translate, type Lang } from "../i18n";
import { Package, Plus, Video } from "lucide-react";
import { Modal } from "./UIElements";
// ★ 04.10: paket ad/açıklama seçili dilde; ayet satırlarında çevrilmiş meal
import { paketGorunum } from "../data/ayetPaketleriCokDil";
import { gorunenMeal, mealleriTasi } from "../data/ayetMealCokDil";
import { SURE_ADLARI } from "../data/ayetKartlariData";

export interface AyetPaketiOgesi { s: number; a: number; baslik?: string }
export interface AyetPaketi {
  id: string;
  ad: string;
  emoji: string;
  aciklama: string;
  renk: string;
  ayetler: AyetPaketiOgesi[];
}

export const AYET_PAKETLERI: AyetPaketi[] = [
  {
    id: "vesvese", ad: "Vesveseye Karşı 5 Ayet", emoji: "🛡️", renk: "#a5b4fc",
    aciklama: "Şüphe ve korku anında kalbe perde olan ayetler — koruma ve sığınma.",
    ayetler: [
      { s: 7, a: 56, baslik: "Allah'ın rahmeti yakındır" },
      { s: 65, a: 3, baslik: "Tevekkül edenlere yeter" },
      { s: 13, a: 28, baslik: "Kalpler ancak zikirle huzur bulur" },
      { s: 2, a: 286, baslik: "Allah gücünün üstünde görev yüklemez" },
      { s: 3, a: 173, baslik: "Hasbünallâh ve ni'mel vekîl" },
    ],
  },
  {
    id: "sabir", ad: "Sabır Ayetleri", emoji: "🌿", renk: "#4ade80",
    aciklama: "Zor günlerde omuz vertiren, ferahlık vaat eden ayetler.",
    ayetler: [
      { s: 94, a: 5, baslik: "Güçlükle beraber kolaylık" },
      { s: 94, a: 6, baslik: "İki kolaylık birden" },
      { s: 8, a: 46, baslik: "Allah sabredenlerle beraber" },
      { s: 2, a: 45, baslik: "Sabır ve namazla yardım" },
      { s: 42, a: 43, baslik: "Sabredip affeden" },
      { s: 31, a: 17, baslik: "Başına gelene sabret" },
    ],
  },
  {
    id: "cuma", ad: "Cuma Mesajları", emoji: "🕌", renk: "#fbbf24",
    aciklama: "Cuma günü sevdiklerine göndereceğin paylaşımlık ayet ve dualar.",
    ayetler: [
      { s: 62, a: 9, baslik: "Cuma namazına çağrı" },
      { s: 62, a: 10, baslik: "Namaz bitince dağılın ve rızık arayın" },
      { s: 18, a: 10, baslik: "Rabbimiz bize katından rahmet ver" },
      { s: 2, a: 201, baslik: "Rabbenâ dünyada ve ahirette iyilik ver" },
      { s: 33, a: 70, baslik: "Sağlam söz söyleyin" },
    ],
  },
  {
    id: "sukur", ad: "Şükür & Nimet", emoji: "🤍", renk: "#f5dda6",
    aciklama: "Nimetleri fark etmenin, kalbi şükürle doldurmanın ayetleri.",
    ayetler: [
      { s: 14, a: 7, baslik: "Şükrederseniz artırırım" },
      { s: 2, a: 152, baslik: "Beni anın ki ben de sizi anayım" },
      { s: 55, a: 13, baslik: "Hangi nimeti yalanlarsınız" },
      { s: 108, a: 1, baslik: "Kevser" },
      { s: 16, a: 18, baslik: "Allah'ın nimetini sayasanız bitiremezsiniz" },
    ],
  },
  {
    id: "rahmet", ad: "Rahmet & Tövbe", emoji: "💧", renk: "#7dd3fc",
    aciklama: "Tövbe kapısının açık olduğunu hatırlatan, umut veren ayetler.",
    ayetler: [
      { s: 39, a: 53, baslik: "Allah'ın rahmetinden ümit kesmeyin" },
      { s: 40, a: 60, baslik: "Dua edin, karşılık vereyim" },
      { s: 21, a: 87, baslik: "Yûnus'un nidası" },
      { s: 27, a: 62, baslik: "Darda kalana karşılık veren" },
      { s: 66, a: 8, baslik: "Nûrumuzu tamamla" },
    ],
  },
  {
    id: "ruzik", ad: "Rızık & Bereket", emoji: "🌾", renk: "#fbbf24",
    aciklama: "Rızık arayışında kalbe güç veren, bereket müjdeleyen ayetler.",
    ayetler: [
      { s: 65, a: 2, baslik: "Kim Allah'tan korkarsa ona bir çıkış yolu verir" },
      { s: 2, a: 216, baslik: "Hoşlanmadığın şey hayırlı olabilir" },
      { s: 11, a: 88, baslik: "Başarı ancak Allah'tandır" },
      { s: 29, a: 69, baslik: "Çaba gösterene yollarını açarız" },
      { s: 53, a: 39, baslik: "İnsan ancak emeğinin karşılığıdır" },
    ],
  },
  {
    id: "sevgi", ad: "Aile & Sevgi", emoji: "🌸", renk: "#f9a8d4",
    aciklama: "Eşler, çocuklar ve anne-baba üzerine nazik ayetler — aile paylaşımları.",
    ayetler: [
      { s: 30, a: 21, baslik: "Aranıza sevgi ve rahmet koydu" },
      { s: 17, a: 24, baslik: "Anne babaya merhamet duam" },
      { s: 25, a: 74, baslik: "Eşlerimizden göz aydınlığı ver" },
      { s: 24, a: 26, baslik: "Nur üstüne nur" },
      { s: 76, a: 9, baslik: "Allah rızası için doyuruyoruz" },
    ],
  },
  {
    id: "zafer", ad: "Umutsuzluğa Karşı", emoji: "✨", renk: "#fbbf24",
    aciklama: "Karamsarlık çöktüğünde kalbi kaldıran, zafer müjdeleyen ayetler.",
    ayetler: [
      { s: 3, a: 139, baslik: "Üstün gelen sizsiniz" },
      { s: 61, a: 13, baslik: "Yakın zafer müjdesi" },
      { s: 9, a: 51, baslik: "Bize ancak Allah'ın yazdığı ulaşır" },
      { s: 9, a: 40, baslik: "Üzülme, Allah bizimle" },
      { s: 12, a: 87, baslik: "Allah'ın rahmetinden ümit kesilmez" },
    ],
  },
  // ═══ +50 YENİ PAKET (28.09, kullanıcı kararı: "az az yapma, tam yap") ═══
  {
    id: "kandil", ad: "Kandil & Mübarek Geceler", emoji: "🌙", renk: "#d7aa41",
    aciklama: "Kandil mesajlarında paylaşımlık, nurlu ve dualı ayetler.",
    ayetler: [
      { s: 24, a: 35, baslik: "Allah nurdur — Ayete'n-Nûr" },
      { s: 97, a: 1, baslik: "Kadir Gecesi'nde nurla" },
      { s: 44, a: 3, baslik: "Mübarek gecede inen Kitap" },
      { s: 2, a: 185, baslik: "Ramazan ayı Kur'an ayıdır" },
      { s: 25, a: 74, baslik: "Nur üstüne nur" },
      { s: 6, a: 122, baslik: "Ölüyken dirilttiğimiz kimse" },
    ],
  },
  {
    id: "dua-nehri", ad: "Dualar Nehri", emoji: "🤲", renk: "#7dd3fc",
    aciklama: "Kur'an'dan dualar — her video bir dua olsun.",
    ayetler: [
      { s: 1, a: 5, baslik: "Yalnız sana kulluk ederiz" },
      { s: 2, a: 286, baslik: "Rabbenâ âtinâ fî'd-dünyâ" },
      { s: 3, a: 8, baslik: "Rabbimiz kalplerimizi sağlamlaştır" },
      { s: 7, a: 23, baslik: "Rabbimiz kendimize zulmettik" },
      { s: 14, a: 40, baslik: "Beni namazı kılanlardan eyle" },
      { s: 23, a: 118, baslik: "Rabbiğfir ve'rham" },
    ],
  },
  {
    id: "kesin-iman", ad: "İman & Tevhid", emoji: "🕌", renk: "#34d399",
    aciklama: "İmanı tazeleyen, tevhid hakikatini hatırlatan ayetler.",
    ayetler: [
      { s: 112, a: 1, baslik: "İhlâs Suresi" },
      { s: 2, a: 255, baslik: "Ayete'l-Kürsî" },
      { s: 3, a: 2, baslik: "Allah'tan başka ilah yoktur" },
      { s: 59, a: 22, baslik: "O, Allah'tır — kendisinden başka ilah yok" },
      { s: 2, a: 163, baslik: "İlahınız tek ilahtır" },
      { s: 6, a: 102, baslik: "Bu Rabbınız Allah'tır" },
    ],
  },
  {
    id: "koruma", ad: "Koruma & Sığınma", emoji: "🛡️", renk: "#a5b4fc",
    aciklama: "Felak-Nâs suresi ruhuyla: her kötülüğe karşı sığınak.",
    ayetler: [
      { s: 113, a: 1, baslik: "Felak Suresi" },
      { s: 114, a: 1, baslik: "Nâs Suresi" },
      { s: 2, a: 255, baslik: "Kürsî — koruma şifresi" },
      { s: 12, a: 64, baslik: "Allah'ın koruması en hayırlıdır" },
      { s: 40, a: 81, baslik: "Allah size ayetlerini gösterir" },
    ],
  },
  {
    id: "afv", ad: "Affedicilik & Yumuşaklık", emoji: "🕊️", renk: "#7dd3fc",
    aciklama: "Afvedenlerin, yumuşak davrananların sevincini yansıtan ayetler.",
    ayetler: [
      { s: 3, a: 134, baslik: "Afvedenler, Allah'ı sevenlerdir" },
      { s: 24, a: 22, baslik: "Affedin, affedilmenizi istemez misiniz" },
      { s: 42, a: 40, baslik: "Af ile intikam eşit değildir" },
      { s: 64, a: 14, baslik: "Aile ve mal imtihandır" },
      { s: 7, a: 199, baslik: "Af diler, adet gereği affet" },
    ],
  },
  {
    id: "anne-baba", ad: "Anne-Baba Duası", emoji: "👨‍👩‍👦", renk: "#f9a8d4",
    aciklama: "Anne-babaya merhamet ve dua — doğum günlerinde, özel anlarda.",
    ayetler: [
      { s: 17, a: 23, baslik: "Anne babaya 'öf' bile deme" },
      { s: 17, a: 24, baslik: "Küçültme duam: rahmet" },
      { s: 31, a: 14, baslik: "Annenin karnında taşıma" },
      { s: 46, a: 15, baslik: "Ana babaya iyi davranma duam" },
      { s: 2, a: 45, baslik: "Sabır + namaz + merhamet" },
    ],
  },
  {
    id: "evlat", ad: "Evlat & Zürriyet", emoji: "👶", renk: "#fbbf24",
    aciklama: "Sâlih evlat isteme ve çocuk duası — aile video paylaşımları.",
    ayetler: [
      { s: 3, a: 38, baslik: "Zekiyyeden nesil ver Rabbim" },
      { s: 25, a: 74, baslik: "Göz aydınlığından eş ve evlat" },
      { s: 21, a: 90, baslik: "Zekeriyya'nın duası kabul oldu" },
      { s: 19, a: 5, baslik: "Bana bir veli eyle" },
      { s: 37, a: 100, baslik: "Rabbim bana sâlih bağışla" },
    ],
  },
  {
    id: "şifâ", ad: "Şifâ & Sağlık", emoji: "💚", renk: "#4ade80",
    aciklama: "Hastalara moral, şifâ umudu veren ayetler.",
    ayetler: [
      { s: 26, a: 80, baslik: "Hastalandığımda şifâ veren O" },
      { s: 9, a: 14, baslik: "Allah onları şifâlandırır" },
      { s: 41, a: 44, baslik: "Kur'an müminlere şifâdır" },
      { s: 10, a: 57, baslik: "Kur'an kalplerin ilacıdır" },
      { s: 17, a: 82, baslik: "Kur'an'dan şifâ iniyor" },
    ],
  },
  {
    id: "hamd", ad: "Hamd & Sena", emoji: "📿", renk: "#d7aa41",
    aciklama: "Hamd'ı yücelten, Allah'ı öven ayetler — açılış videoları.",
    ayetler: [
      { s: 1, a: 2, baslik: "Âlemlere hamd Allah'ındır" },
      { s: 87, a: 1, baslik: "Yüce Rabbinin adını tesbih et" },
      { s: 110, a: 3, baslik: "Rabbini hamd ile tesbih et" },
      { s: 20, a: 130, baslik: "Akşam sabah hamd et" },
      { s: 50, a: 39, baslik: "Sabah akşam tesbih et" },
    ],
  },
  {
    id: "tefekkur", ad: "Tefekkür & Akıl", emoji: "🌌", renk: "#7dd3fc",
    aciklama: "Göğe, yere, insana bakıp düşündüren ayetler.",
    ayetler: [
      { s: 3, a: 190, baslik: "Göklerin ve yerin yaratılışı" },
      { s: 51, a: 21, baslik: "Kendi nefslerinize bakın" },
      { s: 2, a: 164, baslik: "Düşünen bir toplum için" },
      { s: 13, a: 3, baslik: "Kâinat tefekkür âynasıdır" },
      { s: 30, a: 8, baslik: "Akıl sahipleri için ibretler" },
    ],
  },
  {
    id: "vaad", ad: "Allah'ın Vaadi", emoji: "🌟", renk: "#d7aa41",
    aciklama: "Allah'ın vaadi hakir bir vadide değildir — umut videoları.",
    ayetler: [
      { s: 3, a: 194, baslik: "Allah vaadini bozmaz" },
      { s: 30, a: 60, baslik: "Ümitsiz olma, vaat haktır" },
      { s: 46, a: 13, baslik: "Sözünde duran Allah'tır" },
      { s: 14, a: 51, baslik: "Allah'ın vaadi gerçektir" },
      { s: 40, a: 55, baslik: "Allah'ın vaadi haktır" },
    ],
  },
];

interface AyetPaketleriModalProps {
  /** ★ FULL I18N (01.10): başlık/sub seçili dile döner */
  lang?: Lang;
  open: boolean;
  onClose: () => void;
  /** Seçilen paketin tüm ayetlerini stüdyoya ekler (mevcut addAyah akışı) */
  addAyah: (s: number, a: number) => void;
  notify: (msg: string) => void;
  /** Video üretim akışına yumuşak köprü — stüdyoya dönüş yapar */
  onStudyyeDon?: () => void;
}

export const AyetPaketleriModal: React.FC<AyetPaketleriModalProps> = ({ open, onClose, addAyah, notify, onStudyyeDon , lang = "tr" }) => {
  // ★ FULL I18N (01.10): prop lang → sözlük; eksik anahtar TR fallback
  const tt = (k: string): string => translate(lang, k);

  const [secili, setSecili] = useState<string | null>(null);
  const paket = useMemo(() => AYET_PAKETLERI.find((p) => p.id === secili) ?? null, [secili]);
  // ★ 04.10: satır başlığı seçili dilde ayetin MEALİ (TR başlık veri katmanında kalır) —
  //   meal gelmediyse TR başlık. Sureler açılışta arka planda taşınır.
  const [, setMealTick] = useState(0);
  // source: sureNoFromSource sure ADI bekler → "Bakara Suresi • 255. Ayet" biçimi
  const satirKaynagi = (o: { s: number; a: number }) => `${SURE_ADLARI[o.s - 1] ?? ""} Suresi • ${o.a}. Ayet`;
  useEffect(() => {
    if (!open) return;
    void mealleriTasi(AYET_PAKETLERI.flatMap((p) => p.ayetler).map((o) => ({ source: satirKaynagi(o) })), lang, () => setMealTick((v) => v + 1));
  }, [open, lang]);
  const satirBasligi = (o: { s: number; a: number; baslik?: string }) => {
    const m = gorunenMeal({ tr: o.baslik ?? "", source: satirKaynagi(o) }, lang);
    return m || o.baslik || "";
  };

  if (!open) return null;

  const paketEkle = (p: AyetPaketi) => {
    p.ayetler.forEach((o) => addAyah(o.s, o.a));
    notify(tt("apEklendi").replace("{ad}", paketGorunum(p.id, p.ad, p.aciklama, lang).ad).replace("{n}", String(p.ayetler.length)));
    onClose();
    onStudyyeDon?.();
  };

  return (
    <Modal title={tt("v2AyetPaketleriTitle")} sub={tt("v2AyetPaketleriSub")} onClose={onClose} wide>
      {!paket ? (
        <div className="grid gap-2.5 sm:grid-cols-2">
          {AYET_PAKETLERI.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setSecili(p.id)}
              className="group rounded-2xl border border-white/10 bg-white/[.03] p-4 text-left transition hover:border-white/25 hover:bg-white/[.05]"
            >
              <div className="mb-1.5 flex items-center gap-2">
                <span className="text-xl">{p.emoji}</span>
                <h4 className="text-[12px] font-black" style={{ color: p.renk }}>{paketGorunum(p.id, p.ad, p.aciklama, lang).ad}</h4>
                <span className="ml-auto rounded-full bg-white/5 px-2 py-0.5 text-[8.5px] font-bold text-white/45">{tt("apSayiEtiket").replace("{n}", String(p.ayetler.length))}</span>
              </div>
              <p className="text-[9.5px] leading-relaxed text-white/55">{paketGorunum(p.id, p.ad, p.aciklama, lang).aciklama}</p>
            </button>
          ))}
        </div>
      ) : (
        <>
          <button type="button" onClick={() => setSecili(null)} className="mb-3 flex items-center gap-1.5 rounded-lg glass-soft px-2.5 py-1.5 text-[10px] font-bold text-white/60 transition hover:text-white">
            ◀ {tt("apDon")}
          </button>
          <div className="mb-3 flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[.03] p-3.5">
            <span className="text-2xl">{paket.emoji}</span>
            <div className="min-w-0">
              <h4 className="text-[12.5px] font-black" style={{ color: paket.renk }}>{paketGorunum(paket.id, paket.ad, paket.aciklama, lang).ad}</h4>
              <p className="text-[9.5px] text-white/55">{paketGorunum(paket.id, paket.ad, paket.aciklama, lang).aciklama}</p>
            </div>
          </div>
          <div className="space-y-1.5">
            {paket.ayetler.map((o) => (
              <div key={`${o.s}:${o.a}`} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[.02] px-3 py-2">
                <div className="min-w-0">
                  <p className="text-[10.5px] font-bold text-white/85">{satirBasligi(o)}</p>
                  <p className="text-[9px] text-white/45">{tt("apSatirAlt").replace("{s}", String(o.s)).replace("{a}", String(o.a))}</p>
                </div>
                <button
                  type="button"
                  onClick={() => addAyah(o.s, o.a)}
                  className="flex shrink-0 items-center gap-1 rounded-lg glass-soft px-2 py-1.5 text-[9px] font-bold text-white/65 transition hover:text-white"
                  title={tt("apSadeceEkle")}
                >
                  <Plus size={10} /> {tt("apEkle")}
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => paketEkle(paket)}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-[11.5px] font-black text-black shadow-lg transition hover:brightness-110 active:scale-[.98]"
            style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}
          >
            <Video size={14} /> {tt("apTamaminiEkle").replace("{n}", String(paket.ayetler.length))}
          </button>
          <p className="mt-2 text-center text-[8.5px] text-white/30">
            <Package size={9} className="mr-1 inline" />{tt("apDipnot")}
          </p>
        </>
      )}
    </Modal>
  );
};
