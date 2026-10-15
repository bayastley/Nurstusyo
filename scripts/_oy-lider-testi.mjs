// ═══ OYLAMA LİDERİ BİRİM TESTİ (01.10) — api/config.ts'teki saf hesap mantığı ═══
// api/config'in cevabına gömdüğü lider→free merge'i birebir kopyalar ve senaryoları koşar.
const V2_KAPI_ESLESME = {
  "ayet-kutuphanesi": "ayetKartlari",
  "hafizlik-testi": "hafizlikTesti",
  "ayet-notlari": "ayetNotlari",
  "ayet-paketleri": "ayetPaketleri",
  "ozel-gun-takvimi": "ozelGunTakvimi",
  "kesfet-merkezi": "kesfet",
};

function hesapla(roadmapVotes, roadmapFeatures, featureLocks) {
  const oySayaci = {};
  for (const v of Array.isArray(roadmapVotes) ? roadmapVotes : []) {
    const rid = String(v?.feature_id || "");
    if (rid) oySayaci[rid] = (oySayaci[rid] || 0) + 1;
  }
  let liderOy = 0;
  const liderIds = [];
  for (const f of Array.isArray(roadmapFeatures) ? roadmapFeatures : []) {
    if (f?.version !== "V2" || f?.active === false) continue;
    const oy = oySayaci[String(f?.id)] || 0;
    if (oy === 0) continue;
    if (oy > liderOy) { liderOy = oy; liderIds.length = 0; liderIds.push(String(f?.id)); }
    else if (oy === liderOy) liderIds.push(String(f?.id));
  }
  const liderSatirlari = liderIds
    .map((rid) => V2_KAPI_ESLESME[rid])
    .filter(Boolean)
    .map((modulId) => ({ feature_id: modulId, lock_level: "free" }));
  const acikAdminKilidi = new Set((featureLocks || []).filter((l) => l.lock_level !== "free").map((l) => l.feature_id));
  const etkinKilitler = [...(featureLocks || []), ...liderSatirlari.filter((l) => !acikAdminKilidi.has(l.feature_id))];
  return etkinKilitler;
}

const F = (id, version, active) => ({ id, version, active });
let gecen = 0, toplam = 0;
const kos = (ad, kosul) => { toplam++; if (kosul) { gecen++; } else console.error("  ✗ FAIL:", ad); };

// 1) Oy yok → kilitler aynen, lider satırı yok
{
  const out = hesapla([], [F("ayet-kutuphanesi", "V2", true)], []);
  kos("oysuz: lider satırı üretilmez", out.length === 0);
}
// 2) Lider = ayet-kutuphanesi (3 oy) → ayetKartlari:free
{
  const votes = [{ feature_id: "ayet-kutuphanesi" }, { feature_id: "ayet-kutuphanesi" }, { feature_id: "ayet-kutuphanesi" }, { feature_id: "bugun-hediye" }];
  const feats = [F("ayet-kutuphanesi", "V2", true), F("bugun-hediye", "V2", true), F("hafizlik-testi", "V2", true)];
  const out = hesapla(votes, feats, []);
  kos("lider: ayetKartlari free açıldı", out.some(l => l.feature_id === "ayetKartlari" && l.lock_level === "free"));
  kos("lider: yalnız lider açılır (hafizlikTesti yok)", !out.some(l => l.feature_id === "hafizlikTesti"));
}
// 3) Oysuz V2 kalemi lider olamaz
{
  const feats = [F("ayet-kutuphanesi", "V2", true), F("hafizlik-testi", "V2", true)];
  const out = hesapla([{ feature_id: "bugun-hediye" }], feats, []);
  kos("oy lideri dışı: kapi kilidi üretilmez", out.length === 0);
}
// 4) V3 kalem lider olamaz; pasif V2 de olamaz
{
  const feats = [F("ayet-kutuphanesi", "V3", true), F("hafizlik-testi", "V2", false)];
  const out = hesapla([{ feature_id: "ayet-kutuphanesi" }, { feature_id: "hafizlik-testi" }], feats, []);
  kos("V3/pasif: üretilmez", out.length === 0);
}
// 5) Admin'in açık kilidi öncelikli — lider free satırı EZMEZ
{
  const votes = [{ feature_id: "ayet-kutuphanesi" }];
  const feats = [F("ayet-kutuphanesi", "V2", true)];
  const out = hesapla(votes, feats, [{ feature_id: "ayetKartlari", lock_level: "pro" }]);
  kos("admin kilidi korundu (pro)", out.filter(l => l.feature_id === "ayetKartlari").length === 1 && out.find(l => l.feature_id === "ayetKartlari").lock_level === "pro");
}
// 6) Beraberlik: eşit oy alan iki lider de free dağıtılır
{
  const votes = [{ feature_id: "ayet-kutuphanesi" }, { feature_id: "hafizlik-testi" }];
  const feats = [F("ayet-kutuphanesi", "V2", true), F("hafizlik-testi", "V2", true)];
  const out = hesapla(votes, feats, []);
  kos("beraberlik: iki kapi da free", out.filter(l => l.lock_level === "free").length === 2);
}
// 7) Roadmap dışı admin kilidi bozulmadan taşınır
{
  const out = hesapla([], [], [{ feature_id: "maher", lock_level: "elit" }]);
  kos("mevcut kilitler korunur", out.some(l => l.feature_id === "maher" && l.lock_level === "elit"));
}

console.log(toplam === gecen ? `✅ LİDER TESTİ ${gecen}/${toplam} PASS` : `❌ ${toplam - gecen} SENARYO FAIL`);
process.exit(toplam === gecen ? 0 : 1);
