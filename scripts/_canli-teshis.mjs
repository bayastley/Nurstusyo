// GEÇİCİ teşhis (commit'lenmez): canlı HTML'de hangi çeviri metinleri var, kaçıyor mu?
const html = await (await fetch("https://www.nurstudyo.com/?t=" + Date.now())).text();
console.log("html uzunluk:", html.length);
const probe = [
  "Patience of Yusuf",
  "Ayat al-Kursi",
  "Allah — there is no deity",
  "stories · tap a card",
  "tap a card for details",
  "آية الكرسي",
  "صبر يوسف",
  "Segala puji bagi-Nya",
  "Sudut Kisah",
  "صبح و شام کے اذکار",
];
for (const s of probe) console.log(html.includes(s) ? "VAR  " + s : "YOK  " + s);
// en bloğu id-teyidi: EN bir kartın kaynak satırı
console.log("en kaynak 'Bukhari & Muslim':", html.includes("Bukhari & Muslim"));
// YOK olanlar için alt-parça ara (farklı transliterasyon/format mı?)
const altParca = [["ay-255 en başlık başı", "Ayat al"], ["id zk-subhan", "Segala puji"], ["ar ay-255 başlık", "الكرسي"], ["ur du-sabah", "صبح و شام"]];
for (const [ad, s] of altParca) console.log(ad + ":", html.includes(s) ? "VAR" : "YOK");
