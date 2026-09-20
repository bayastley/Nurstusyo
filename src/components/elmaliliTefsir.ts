// ═══════════════════════════════════════════════════════════
// EL MALİ K TEFSİR YÜKLEYİCİ — kurancilar/json CDN (jsDelivr)
// Kaynak: github.com/kurancilar/json → tafseer/elmalili/{sure}.md
// Hak Dini Kur'an Dili — Elmalılı Muhammed Hamdi Yazır (public domain
// statüsünde, vefat 1942). Tek .md dosyası surenin TAM tefsiri.
// ═══════════════════════════════════════════════════════════

const cache = new Map<number, string>();

export async function elmaliliTefsirGetir(sureNo: number): Promise<string> {
  const cached = cache.get(sureNo);
  if (cached !== undefined) return cached;
  const r = await fetch(`https://cdn.jsdelivr.net/gh/kurancilar/json@main/tafseer/elmalili/${sureNo}.md`);
  if (!r.ok) throw new Error(`tefsir ${sureNo}: HTTP ${r.status}`);
  const metin = await r.text();
  // Başındaki "108-KEVSER:" başlık satırını ve çizgi ayırıcıları temizle
  const temiz = metin
    .replace(/^\d+-[^\n]*\n/, "")
    .replace(/-{20,}/g, "")
    .replace(/\\'/g, "'")
    .trim();
  cache.set(sureNo, temiz);
  return temiz;
}
