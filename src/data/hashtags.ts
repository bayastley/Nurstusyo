export const HASHTAG_CATEGORIES: Record<string, string[]> = {
  kuran:     ["#kuran", "#ayet", "#mushaf", "#tilavet", "#tefsir", "#sure", "#meal", "#kuraniKerim"],
  cuma:      ["#cuma", "#cumamübarek", "#cumagünü", "#hayırlıcumalar", "#cumadua"],
  ramazan:   ["#ramazan", "#iftar", "#sahur", "#teravih", "#kadirgecesi", "#oruç", "#bayram"],
  dua:       ["#dua", "#istiğfar", "#tevbe", "#secde", "#zikir", "#niyaz"],
  tefekkur:  ["#tefekkür", "#maneviyat", "#huzur", "#içhuzur", "#sekinet", "#sükunet"],
  huzur:     ["#huzur", "#rahmet", "#gönül", "#kalp", "#şifa"],
  peygamber: ["#peygamber", "#efendimiz", "#hadis", "#sünnet", "#nebevi", "#salavat"],
  aile:      ["#müslümanaile", "#anne", "#baba", "#evlilik", "#helal", "#terbiye"],
  sosyal:    ["#islam", "#iman", "#namaz", "#allah", "#ümmet", "#hayır", "#sadaka"],
  keşfet:    ["#keşfet", "#fyp", "#foryou", "#viral", "#reels", "#shorts"],
  marka:     ["#nurstudyo", "#nurstüdyo"],
};

export const HASHTAG_POOL: string[] = Object.values(HASHTAG_CATEGORIES).flat();

/** Rastgele hashtag kombinasyonu üretir — her kategoriden farklı sayıda çekerek çeşitlilik sağlar */
export function randomHashtagCombo(count = 7): string[] {
  const cats = Object.values(HASHTAG_CATEGORIES);
  const picked: string[] = [];
  const shuffledCats = [...cats].sort(() => Math.random() - 0.5);
  for (const cat of shuffledCats) {
    if (picked.length >= count) break;
    const item = cat[Math.floor(Math.random() * cat.length)];
    if (!picked.includes(item)) picked.push(item);
  }
  while (picked.length < count) {
    const pool = HASHTAG_POOL;
    const item = pool[Math.floor(Math.random() * pool.length)];
    if (!picked.includes(item)) picked.push(item);
  }
  return picked.sort(() => Math.random() - 0.5);
}
