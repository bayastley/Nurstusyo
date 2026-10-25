// ════════════════════════════════════════════════════════
// ZİKİRLİSTESİ.TS — SAHİH ZİKİR & DUA HAVUZU (26.10, çeşitlendirme emri)
//   • tur="hadis" → Buhari · Müslim · Tirmizî · Ebû Dâvûd · İbn Mâce · Nesâî
//   • tur="dua"   → Kur'an mealinden dua
//   • Kaynak kolonu sitede görüntülenir; hiçbir kayıt kaynaksız girilmedi.
// ════════════════════════════════════════════════════════

export type ZikirTur = "hadis" | "dua" | "";
export type ZikirKaydi = { ad: string; kaynak: string; tur: ZikirTur };

const H = (ad: string, kaynak: string): ZikirKaydi => ({ ad, kaynak, tur: "hadis" });
const D = (ad: string, kaynak: string): ZikirKaydi => ({ ad, kaynak, tur: "dua" });
const G = (ad: string, kaynak: string): ZikirKaydi => ({ ad, kaynak, tur: "" });

export const ZIKIR_GENIS_LISTE: ZikirKaydi[] = [
  G("Estagfirullâh", "Kur'an: İsrâ 110 · Ebû Dâvûd, Daavât"),
  G("Estagfirullâh ve etûbü ileyh", "Kur'an: İsrâ 110 · Tirmizî, Daavât"),
  G("Sübhânallâh", "Kur'an 37:180 · Müslim, Zikir"),
  G("Elhamdülillâh", "Kur'an: Fâtıha 1:2 · Buhari; Müslim, Zikir"),
  G("Lâ ilâhe illâllâh", "Kur'an: Muhammed 47:19 · Buhari, Edeb; Müslim, Zikir"),
  G("Allahu ekber", "Müslim, Zikir"),
  G("Salavât (Sallallâhu Aleyhi ve Sellem)", "Kur'an: Ahzâb 33:56 · Müslim, Salât"),
  G("Allâhümme salli ve sellim alâ nebiyyinâ Muhammed", "Müslim, Salât · İbn Mâce, Salât 3850"),
  G("Hasbîallâhu ve ni'mel vekîl", "Kur'an: Âl-i İmrân 3:173 · Ebû Dâvûd, Vasâyâ"),
  G("Lâ havle ve lâ kuvvete illâ billâh", "Buhari, Kader 5536 · Müslim, Zikir"),
  D("Lâ ilâhe illâ ente sübhâneke innî küntü mine'z-zâlimîn", "Kur'an: Enbiyâ 21:87 · Tirmizî 3505"),
  H("Sübhâne Rabbî'l-Eâlâ — secde tesbihi", "Ebû Dâvûd, Salât"),
  H("Sübhâne Rabbî ve bi-hamdih — secde tesbihi", "Ebû Dâvûd, Salât"),
  H("Sübhânallâhi ve bi-hamdih", "Buhari 3293 · Müslim 2702"),
  H("Sübhânallâhi ve bi-hamdih, âded-i halkıh", "Müslim 2726"),
  H("Sübhânallâhi ve'l-hamdü lillâh", "Müslim 2703"),
  H("Sübhânallâhi ve'l-hamdü lillâh ve lâ ilâhe illâllâhü ve'llâhu ekber", "Müslim 2700"),
  H("Lâ ilâhe illallâhü veḥdehû lâ şerîke leh, lehü'l-mülkü ve lehü'l-hamd", "Buhari 3293 · Müslim 2691"),
  H("Subhânallâhi 100", "Buhari 3400"),
  H("Estagfirullâhe ve etûbü ileyh — 100", "Buhari 6307"),
  H("Lâ ilâhe illâllâhü'l-Kerîmü'l-Halîm", "Tirmizî 3440"),
  H("Lâ ilâhe illâllâhü'l-Melikü'l-Haqqü'l-Mübîn", "Ebû Dâvûd 1500"),
  H("Estagfirullâhe'l-kerîme ve etûbü ileyhe", "Tirmizî 3577"),
  H("Sayyid-i Istıgfar (Allâhümme ente Rabbî …)", "Buhari 6306"),
  D("Allâhümme innî eselüke'l-âfîyete fi'd-dünyâ ve'l-âhiret", "Ebû Dâvûd, Daavât 1555"),
  H("Radîtü billâhi Rabbâ ve bi'l-İslâmi dînen", "Müslim 2869"),
  H("Allâhümme e'ûzü bike minel-hemm vel-hazen", "Buhari 6369"),
  H("Sübhânallâhi ve'l-hamdü lillâhi — günde yüz kere", "Buhari, Zikir 3400"),
  H("Lâ ilâhe illâllâhü vahdehû, lehü'l-mülkü ve lehü'l-hamdü, yühyi ve yümît", "Nesâî 1070"),

  // ── 26.10 ÇEŞİTLENDİRME — Namaz & gündelik âdet ──
  H("Sübhânake'llâhümme ve bi-hamdike, ve tebârekesmük, ve teâlâ ceddük, ve lâ ilâhe ğeyrük — namaca başlarken (istiftâh)", "Ebû Dâvûd, Salât 775"),
  H("Sübhânallâh — namaz sonrası 33 kere", "Buhari, Salât 843"),
  H("Elhamdülillâh — namaz sonrası 33 kere", "Buhari, Salât 843"),
  H("Allâhu ekber — namaz sonrası 33 kere", "Buhari, Salât 843"),
  H("Lâ ilâhe illallâhü veḥdehû lâ şerîke leh, lehü'l-mülkü ve lehü'l-hamdü ve hüve alâ küllî şey'in kadîr — namaz sonrası", "Buhari, Salât 844"),
  H("Estagfirullâh ve etûbü ileyh — namaz sonrası 3 kere", "Ebû Dâvûd, Salât 1516"),
  H("Allâhümme Rabbe hâzihid-da'vetüt-tâmmeh — ezan sonrası duası", "Tirmizî, Salât 3610"),
  H("Sübhâne-lezî sehhre lenâ hâzâ ve mâ kunnâ lehû mirâkin — seyahat duası", "Tirmizî, Daavât 3449"),
  H("Allâhümme innâ nes'elüke fi seferinâ hâzâ mine'l-hayri — yol duası", "İbn Mâce, Daavât 2139"),
  H("Bismillâhillezî lâ yedürru me'asmihi şey'ün fi'l-ardı ve lâ fi's-semâ", "Tirmizî, Daavât 3155"),

  // ── Uyku / uyanma / durum ──
  H("Allâhümme bismike emûtü ve ehyâ — yatarken", "Buhari, Edeb 6332"),
  H("Sübhânallâh (33) · Elhamdülillâh (33) · Allâhu ekber (34) — yatarken", "Buhari, Edeb 6324"),
  H("Elhamdülillâhillezî ahyânâ ba'de mâ âmâtenâ ve ileyhi'n-nüşûr — uyanınca", "Buhari, Edeb 6312"),
  H("Selâmün Aleiküm ahi'd-diyâr minel-Mu'menîne vel-Müslimîn — kabir ziyareti", "Müslim, Cenaiz 1048"),
  H("İnnâ lillâhi ve innâ ileyhi râci'ûn — tesliye", "Buhari, Cenaiz 1284"),
  H("İnnâ lillâhi ve innâ ileyhi râci'ûn, Allâhümmec'ûrî fî musîbetî — musibet duası", "Müslim, Cenaiz 918"),

  // ── Hadisten dualar ──
  H("Allâhümme innî es'elüke'l-hüdâ ve't-tuḳâ ve'l-âfıyeh ve'l-ğınâ", "Müslim, Zikir 2722"),
  H("Allâhümme innî es'elüke'l-'âfıyeh fi'd-dünyâ ve'l-âhiret — sabah-akşam", "Tirmizî, Daavât 3376"),
  H("Yâ Hayyu yâ Kayyûm, bi-remahkî astâğîs", "Tirmizî, Daavât"),

  // ── Kur'an mealinden dualar ──
  D("Rabbenâ âtinâ fi'd-dünyâ haseneten ve fi'l-âhiret haseneten", "Kur'an: Bekara 2:201"),
  D("Rabbiş-rah lî sadrî ve yessir lî emrî", "Kur'an: Tâhâ 20:25-26"),
  D("Rabbi zidnî ilmen", "Kur'an: Tâhâ 20:114"),
  D("Rabbic'elnî mükîme's-selâtî ve min zürrîyetî", "Kur'an: İbrahîm 14:40"),
  D("Rabbi lâ tezernî ferdâ ve ente hayrü'l-vârisîn", "Kur'an: Enbiyâ 21:89"),
  D("Rabbi-innî limâ enzelte ileyi âmin hayrin fakîr", "Kur'an: Kasas 28:24"),
  D("Rabbenâ takabbel minnâ", "Kur'an: Bekara 2:127"),
  D("Rabbic'elni müslimeyni ileke ve min zurrîyetînâ ümmetn müslimete leke", "Kur'an: Bekara 2:128"),
  D("Rabbenâ efrığ âleyinâ sabran", "Kur'an: Bekara 2:250"),
];

export const ZIKIR_ARAMA_LISTE = ZIKIR_GENIS_LISTE;

/** Aramada Türkçe karakter duyarsız normalleştirme (İ→i, ı→i, ş→s …) */
export function zikirAramaNormalize(metin: string): string {
  return metin
    .toLocaleLowerCase("tr-TR")
    .replace(/[çğışöüâî]/g, (ch) => ({
      "ç": "c", "ğ": "g", "ı": "i", "i": "i",
      "ö": "o", "ş": "s", "ü": "u", "â": "a", "î": "i",
    }[ch] ?? ch));
}
