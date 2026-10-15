// ── Canlı bundle'da bakım yazım bloğu arama (geçici) ──
const SITE = "https://www.nurstudyo.com";
const html = await (await fetch(SITE + "/")).text();

function kacisCoz(s) {
  return s.replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
          .replace(/\\x([0-9a-fA-F]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
}
const coz = kacisCoz(html);

console.log("nur_system_sync_config geçme:", (coz.match(/nur_system_sync_config/g) || []).length);
console.log("updated_at geçme:", (coz.match(/updated_at/g) || []).length);
console.log("updatedAt geçme:", (coz.match(/updatedAt/g) || []).length);

const m1 = coz.match(new RegExp("\\w{1,3}\\.maintenance=\\{enabled[^;]{0,140}"));
console.log("YAZIM pattern:", m1 ? m1[0].slice(0, 160) : "YOK");

const m2 = coz.match(new RegExp("\\w{1,3}\\.updated_at!==[^;]{0,80}"));
console.log("updated_at karşılaştırma:", m2 ? m2[0].slice(0, 90) : "YOK");

const olaylar = [];
let i = 0;
while ((i = coz.indexOf('new Event("nur_config_updated")', i)) >= 0 && olaylar.length < 5) {
  olaylar.push(coz.slice(Math.max(0, i - 75), i + 34).replace(/\s+/g, " ").slice(0, 110));
  i += 25;
}
console.log("nur_config_updated dispatch konakları:", olaylar.length ? olaylar : "YOK");
