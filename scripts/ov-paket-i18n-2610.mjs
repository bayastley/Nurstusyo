// OnerilenVideolar HAFTA_PAKETLERI → baslik/aciklama sözlük anahtarı
// 26.10: i18n gereği metin yerine sözlük anahtarı (ovB*/ovA*) yazılır.
import fs from "node:fs";
const p = "src/components/OnerilenVideolar.tsx";
const satirlar = fs.readFileSync(p, "utf8").split("\n");

// metin → { gun, idx }
const M = {
  "İhlas ve zamana tanıklık": [0, 0],
  "Huzur günunden kalan": [0, 1],
  "Gece sessizliğinde tesbih": [0, 2],
  "Zorlukla beraber kolaylık": [1, 0],
  "Sabır = iki melek kanadı": [1, 1],
  "Haftaya rahmetle başla": [1, 2],
  "Tasavvu kartları": [2, 0],
  "Şükre dışı salı": [2, 1],
  "Kalbi arındır": [2, 2],
  "Arınma ve rahmet": [3, 0],
  "Su döngüsü ayetleri": [3, 1],
  "Yağmur duası": [3, 2],
  "Salavat gecesi — Cuma'ya açılan kapı": [4, 0],
  "Gece kıyamı: Tekvir": [4, 1],
  "İstiğfar ve af": [4, 2],
  "Cuma — camiye çağrı": [5, 0],
  "Cuma sünneti: Kehf": [5, 1],
  "Peygamber sevgisi günü": [5, 2],
  "Huzur ve tefekkür": [6, 0],
  "İhsan günü": [6, 1],
  "Cumartesi gecesi: Felek": [6, 2],
};
const ASM = {
  "Haftanın son günü: ihlas ve asr yeminine tanıklık.": "ovA0_0",
  "Ra'd 28: kalp ancak zikirle mutmain olur.": "ovA0_1",
  "Yıldızlar ayetinden tefekkür kı kesiti.": "ovA0_2",
  "Yeni haftanın ilk niyeti: İnşirah müjdesi.": "ovA1_0",
  "Bakara 153: sabır ve namazla yardım dileği.": "ovA1_1",
  "Rahmet ayetleri + doğan güneş atmosferi.": "ovA1_2",
  "Âl-i İmrân 139: üzülme, zira mü'minler ustabaşıdır.": "ovA2_0",
  "İbrahim 7: şükredersen artıracak olan benim.": "ovA2_1",
  "Sebe 13: Rabbinin nimetine şükreden kalpler.": "ovA2_2",
  "Zümer 53: Allah'ın rahmetinden ümit kesmeyin.": "ovA3_0",
  "Rad 28: kalpler ancak zikirle huzur bulur.": "ovA3_1",
  "Nur 43: bulutları sürerken rahmet ayetleri.": "ovA3_2",
  "Ahzâb 56: Peygamber'e salat ve selam.": "ovA4_0",
  "İsrâ 79: gece kıyamı sana mahsustur.": "ovA4_1",
  "Nuh 10-12: istiğfar et ki gökten yağmur vereyim.": "ovA4_2",
  "Cuma 9: cuma namazı için işi bırakın çağrısı.": "ovA5_0",
  "Kehf 10: mağara ahfadı ve rahmet duası.": "ovA5_1",
  "Enbiyâ 107: alemlere rahmet olan Peygamber.": "ovA5_2",
  "Rahman 13: peki Rabbinin nimetlerinden hangisini yalanlıyorsun?": "ovA6_1",
  "Kevser 1: Rabbin için namaz kıl.": "ovA6_2",
};
let degisen = 0, atlanan = [];
for (let i = 0; i < satirlar.length; i++) {
  const l = satirlar[i];
  const m = l.match(/baslik: "([^"]+)", aciklama: "([^"]+)"/);
  if (!m) continue;
  const y = M[m[1]];
  if (!y) { atlanan.push(m[1]); continue; }
  satirlar[i] = l
    .replace(/baslik: "[^"]+",/, `baslik: "ovB${y[0]}_${y[1]}",`)
    .replace(/aciklama: "([^"]+)"/, (mm, metin) => {
      const a = ASM[metin];
      if (!a) throw new Error("aciklama çözülemedi: " + metin);
      return `aciklama: "${a}"`;
    });
  degisen++;
}
fs.writeFileSync(p, satirlar.join("\n"));
console.log("degisen:", degisen, "atlanan:", atlanan);
