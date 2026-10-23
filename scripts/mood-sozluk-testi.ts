// 23.10 mood sözlük testi — geçici, elle çalıştırılır
import { moodBul } from "../src/data/arkaplanUretici";
import { MOOD_SOZLUK_BOYUT } from "../src/data/moodSozluk";

console.log("sozluk boyut:", MOOD_SOZLUK_BOYUT);
const tests = [
  "çölde peygamber gidiyor", "kervansaray yolculuğu", "hüzünlü bir akşam",
  "yağmur sonrası toprak kokusu", "fırtınalı deniz", "mavi okyanus",
  "bembeyaz kar", "sıcak gün batımı", "peaceful night", "quiet lake",
  "moonlight", "الصحراء والنبي", "بحر هائج", "ليل هادئ", "سکون بھری رات",
  "malam yang tenang", "ombak laut yang liar", "hayırdır", "merhaba dünya",
];
for (const q of tests) {
  const r = moodBul(q);
  console.log(q.padEnd(30), "→", r.preset.ad, "| tam:", r.tam, "|", r.eslesen);
}
