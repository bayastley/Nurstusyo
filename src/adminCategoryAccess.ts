// ═══════════════════════════════════════════════════════════
// ADMIN KATEGORİ ERİŞİM PLANI (ömer onaylı dağıtım — 2026-09)
// ───────────────────────────────────────────────────────────
// FREE  : eski 20 kategori aynen (KATEGORI_TIER'da zaten var, burada değil)
// PRO   : +15 klasör — video sayısı en yüksek olanlar
// ELİT  : +15 klasör — 100'lük şablonlu gösterişliler
// V2    : 10 klasör — KİLİTLİ vitrin, "V2 Güncellemesi Yakında" rozetiyle.
//         İçerik R2'de hazır ve test edilmiş (1438/1438 dosya OK) —
//         V2 günü buradan "v2"yi "elit"e (ya da istenen tier'a) çekmek yeterli.
// GİZLİ : kalanlar — SADECE admin (isMasterSürüm) görür. Boş klasörler
//         (ör. yasli-adam) de burada: kullanıcıya asla görünmez.
// ───────────────────────────────────────────────────────────
// Bu dosyadaki harita ModalsContainer (klasör ızgarası) ve
// StudioApp isClipAccessible (seçim kilidi) tarafından okunur.
// ═══════════════════════════════════════════════════════════

export type AdminCatAccess = "pro" | "elit" | "v2" | "hidden";

// PRO (+15): video sayısı en yüksek olanlar
export const ADMIN_PRO: string[] = [
  "admin_ancient_city_walls",     // Surlar 66
  "admin_adiyat_war_horses",      // Atlar 57
  "admin_ancient_egypt_pyramids", // Piramit 50
  "admin_aurora_borealis_sky",    // Kutup Işığı 50
  "admin_black_hole_space",       // Kara Delik 50
  "admin_cargo_ships_sea",        // Gemiler 50
  "admin_date_palm_branches",     // Hurma 50
  "admin_grazing_cattle_sheep",   // Hayvanlar 50
  "admin_gushing_spring_river",   // Çağlayan 50
  "admin_honeybee_hive_comb",     // Petek 50
  "admin_justice_scales_balance", // Adalet 50
  "admin_lunar_phases_orbit",     // Ay 50
  "admin_market_place_trade",     // Pazar 50
  "admin_pearl_coral_diving",     // Mercan 50
  "admin_belkis_throne_kingdom",  // Taht 49
];

// ELİT (+15): 100'lük şablonlu gösterişliler
export const ADMIN_ELIT: string[] = [
  "admin_boiling_sulfur_springs",  // Kükürt 49
  "admin_deep_canyon_passages",    // Kanyon 49
  "admin_desert_oasis_sources",    // Vaha 49
  "admin_embryo_human_creation",   // Yaratılış 49
  "admin_olive_grove_trees",       // Zeytin 49
  "admin_silk_fabric_textile",     // İpek 49
  "admin_spider_rotten_nest",      // Örümcek 49
  "admin_flying_crow_raven",       // Karga 48
  "admin_glacier_iceberg_melting", // Buzdağı 48
  "admin_heaven_pomegranate_fruits", // Nar 48
  "admin_collapsing_star",         // Çöken Yıldız 47
  "admin_stormy_sea_boat",         // Fırtına 47
  "admin_underwater_currents_dark", // Akıntı 47
  "admin_darkness_to_light",       // Nur 46
  "admin_hellfire_volcano_lava",   // Lav 46
];

// V2 KİLİTLİ (10): vitrinde "🔒 V2 Güncellemesi Yakında" rozetiyle görünür.
// R2 içerikleri sağlam (test edildi) — açılışta "v2" → "elit" yapmak yeterli.
export const ADMIN_V2: string[] = [
  "admin_hudhud_water_suleyman_hoopoe_bird", // Hüdhüd 45
  "admin_lizard_in_desert",                  // Kertenkele 45
  "admin_water_cycle_cloud_formation",       // Su Döngüsü 45
  "admin_praying_hands_islamic",             // Dua 44
  "admin_withered_dry_grass",                // Kuraklık 44
  "admin_earth_crust_layers",                // Yerkabuğu 43
  "admin_hadid_iron_metal",                  // Demir 43
  "admin_kahf_cave_zara_bowl",               // Mağara 43
  "admin_locust_swarm_flying",               // Çekirge 43
  "admin_luxury_palace_interior",            // Saray 43
];

// GİZLİ: yukarıdaki listelerde OLMAYAN tüm admin kategorileri otomatik gizli
// kabul edilir (bkz. getAdminCatAccess). Elle listeye gerek yok — yeni klasör
// eklenirse varsayılanı "hidden" olur, güvenli tarafta kalır.

const ACCESS_MAP: Record<string, AdminCatAccess> = {};
for (const id of ADMIN_PRO) ACCESS_MAP[id] = "pro";
for (const id of ADMIN_ELIT) ACCESS_MAP[id] = "elit";
for (const id of ADMIN_V2) ACCESS_MAP[id] = "v2";

/** Admin kategorisinin erişim seviyesi — listede yoksa GİZLİ (varsayılan). */
export function getAdminCatAccess(adminCatId: string): AdminCatAccess {
  return ACCESS_MAP[adminCatId] ?? "hidden";
}

/** Bu admin kategorisi kullanıcının tier'ına göre görünebilir mi? master=true (admin) → HER ŞEY açık. */
export function adminCatVisible(adminCatId: string, tier: "free" | "pro" | "elit" | null, master = false): boolean {
  if (master) return true; // ★ ADMIN: v2/pro/elit/hidden — hepsi görünür ve açık
  const acc = getAdminCatAccess(adminCatId);
  if (acc === "hidden") return false;
  if (acc === "v2") return true; // V2 vitrinde KİLİTLİ olarak görünür
  return acc === "pro" ? (tier === "pro" || tier === "elit") : tier === "elit";
}

/** Bu admin kategorisinin İÇERİĞİ kullanılabilir mi? master=true (admin) → HER ŞEY kullanılabilir. */
export function adminCatUsable(adminCatId: string, tier: "free" | "pro" | "elit" | null, master = false): boolean {
  if (master) return true; // ★ ADMIN: v2 dahil tüm kilitler açık
  const acc = getAdminCatAccess(adminCatId);
  if (acc === "hidden" || acc === "v2") return false;
  return acc === "pro" ? (tier === "pro" || tier === "elit") : tier === "elit";
}

// ── V2 vitrin istatistikleri (teaser kartındaki sayılar için) ──
// Manifest'in video sayılarından elle hesaplandı: 45+45+45+44+44+43+43+43+43+43 = 438
export const ADMIN_V2_COUNT = ADMIN_V2.length; // 10
export const ADMIN_V2_TOTAL = 438;
