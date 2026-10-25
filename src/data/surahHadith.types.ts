export interface SurahHadith {
  title: string;      // hadise/knowledge dayanan başlık (TR referans)
  desc: string;       // açıklama (TR referans)
  source: string;     // kaynak (evrensel — sure kitabı adı, çevrilmez)
  /** ★ 26.10 5-dil: TR kaynağa ek dilde alternatif metinler (aynı rivâyetin
   *  doğru çevirisi). Eksik dil TR'ye düşer — hiç yer boş kalmaz. */
  cokDil?: Partial<Record<"en" | "ar" | "id" | "ur", { title: string; desc: string }>>;
}
