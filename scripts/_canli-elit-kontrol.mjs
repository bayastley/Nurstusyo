// GEÇİCİ canlı doğrulama (commit'lenmez): "Öncelikli destek" yayından kalktı mı?
const html = await (await fetch("https://www.nurstudyo.com/?t=" + Date.now())).text();
const coz = (s) => s
  .replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
  .replace(/\\x([0-9a-fA-F]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
const d = coz(html);
const kaldirilan = ["Öncelikli destek", "Priority support", "دعم ذو أولوية", "Dukungan prioritas", "ترجیحی سپورٹ", "planElitOzellik7"];
const kalanmali = ["planElitOzellik6", "Tasarım stüdyosu + kendi imzan", "Design studio + your own signature", "استوديو التصميم + توقيعك الخاص", "Studio desain + tanda tanganmu sendiri", "ڈیزائن اسٹوڈیو + اپنا دستخط"];
let bad = 0;
for (const s of kaldirilan) {
  const var_ = d.includes(s);
  if (var_) bad++;
  console.log((var_ ? "✗ KALDI  " : "✓ KALKTI ") + s);
}
for (const s of kalanmali) {
  const var_ = d.includes(s);
  if (!var_) bad++;
  console.log((var_ ? "✓ DURUYOR " : "✗ YOK    ") + s);
}
console.log(bad === 0 ? "CANLI-ELIT-PASS: satır 5 dilde kalktı, kart sağlam" : "CANLI-BULGU=" + bad);
process.exit(bad === 0 ? 0 : 1);
