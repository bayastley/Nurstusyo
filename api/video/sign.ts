import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";


// ─── Server error logger (gömülü — _shared Vercel'de paketlenmiyor) ───
async function logServerError(req: { url?: string; headers: Record<string, string | string[] | undefined> }, error: unknown, endpoint: string): Promise<void> {
  try {
    const __url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").trim().replace(/\/$/, "");
    const __key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
    if (!__url || !__key) return;
    const __msg = error instanceof Error ? error.message : String(error || "Bilinmeyen sunucu hatası");
    if (!__msg) return;
    const __stack = error instanceof Error ? (error.stack || "") : "";
    const __path = String(req.url || endpoint).slice(0, 200);
    const __fingerprint = require("crypto").createHash("sha256").update(__msg + "|" + __path).digest("hex").slice(0, 16);
    await fetch(__url + "/rest/v1/nur_error_logs", {
      method: "POST",
      headers: { apikey: __key, Authorization: "Bearer " + __key, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({
        message: __msg.slice(0, 500),
        stack: __stack.slice(0, 4000),
        path: __path,
        source: ("server:" + endpoint).slice(0, 40),
        user_agent: String(req.headers["user-agent"] || "server").slice(0, 300),
        fingerprint: __fingerprint,
        kind: "genel",
        user_email: "",
      }),
    });
  } catch { /* log yazımı siteyi ASLA bozmaz */ }
}
type Tier = "free" | "pro" | "elit";
type CatId = typeof CATEGORY_IDS[number];
const CATEGORY_IDS = [
  "namaz", "musaf", "cicekler", "yildizlar", "deniz", "daglar", "gunbatimi", "gece", "selale", "orman", "col", "kar", "sehir", "cami", "desen", "gol", "bulut", "cennet", "ates", "cehennem", "hurma", "ari", "karinca",
] as const;
const TIER_RANK: Record<Tier, number> = { free: 0, pro: 1, elit: 2 };
const FREE_VIDEOS_PER_CATEGORY = 5;
const CATEGORY_TIER: Record<CatId, Tier> = {
  namaz: "free", musaf: "free", cicekler: "free", yildizlar: "free",
  deniz: "free", gunbatimi: "free", gece: "free", orman: "free",
  cami: "free", gol: "free", bulut: "free", desen: "free",
  selale: "pro", daglar: "pro", kar: "pro", sehir: "pro",
  cennet: "elit", col: "elit", ates: "elit",
  cehennem: "elit", hurma: "elit", ari: "elit", karinca: "elit",
};
const ALLOWED_ORIGINS = new Set(["http://localhost:5173", "http://localhost:5174", "https://nurstudyo.com", "https://www.nurstudyo.com"]);
const HITS = new Map<string, number[]>();

interface SessionUser {
  id: string;
  email: string;
  verified: boolean;
  isAdmin: boolean;
  tier?: Tier;
  exp: number;
}

function fromBase64Url(input: string): Buffer {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = normalized.length % 4 ? "=".repeat(4 - (normalized.length % 4)) : "";
  return Buffer.from(normalized + pad, "base64");
}

function base64Url(input: Buffer): string {
  return input.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function getSessionUser(req: VercelRequest): SessionUser | null {
  const cookie = String(req.headers.cookie || "").split(";").map((part) => part.trim()).find((part) => part.startsWith("nur_session="));
  if (!cookie) return null;
  const [payload, signature] = decodeURIComponent(cookie.slice("nur_session=".length)).split(".");
  const secret = process.env.NUR_SESSION_SECRET || process.env.GOOGLE_CLIENT_SECRET || "";
  if (!payload || !signature || secret.length < 20) return null;
  const expected = base64Url(crypto.createHmac("sha256", secret).update(payload).digest());
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(actualBuffer, expectedBuffer)) return null;
  try {
    const user = JSON.parse(fromBase64Url(payload).toString("utf8")) as SessionUser;
    if (!user.id || !user.email || !user.verified || user.exp < Math.floor(Date.now() / 1000)) return null;
    return user;
  } catch {
    return null;
  }
}

// ★ YETKİ ÖNBELLEĞİ: her imza isteğinde 2 Supabase sorgusu atmak önizlemeyi
//   300-600ms geciktiriyordu. Sonuç 60 sn önbelleğe alınır; ban anında uygulanır
//   (en fazla 60 sn gecikmeyle), tier değişimi de en geç 60 sn'de yansır.
const ACCESS_CACHE = new Map<string, { data: { tier: Tier; isAdmin: boolean; banned: boolean }; at: number }>();
const ACCESS_TTL_MS = 60_000;

async function loadServerAccess(userId: string): Promise<{ tier: Tier; isAdmin: boolean; banned: boolean } | null> {
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").trim().replace(/^['"]+|['"]+$/g, "").replace(/\/rest\/v1\/?$/i, "").replace(/\/+$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !key) return null;
  const cached = ACCESS_CACHE.get(userId);
  if (cached && Date.now() - cached.at < ACCESS_TTL_MS) return cached.data;
  try {
    const headers = { apikey: key, Authorization: `Bearer ${key}` };
    const userResponse = await fetch(`${url}/rest/v1/nur_users?id=eq.${encodeURIComponent(userId)}&select=tier,is_admin`, { headers, cache: "no-store" });
    if (!userResponse.ok) return null;
    const users = await userResponse.json() as Array<{ tier?: Tier; is_admin?: boolean }>;
    if (!users[0]) return null;
    const banResponse = await fetch(`${url}/rest/v1/nur_ban_logs?user_id=eq.${encodeURIComponent(userId)}&unbanned=eq.false&select=id&limit=1`, { headers, cache: "no-store" });
    if (!banResponse.ok) return null;
    const bans = await banResponse.json() as Array<{ id: string }>;
    const tier: Tier = users[0].tier === "pro" || users[0].tier === "elit" ? users[0].tier : "free";
    const data: { tier: Tier; isAdmin: boolean; banned: boolean } = {
      tier,
      isAdmin: users[0].is_admin === true,
      banned: bans.length > 0,
    };
    ACCESS_CACHE.set(userId, { data, at: Date.now() });
    return data;
  } catch {
    return null;
  }
}

const USER_HITS = new Map<string, number[]>();

function checkRateLimits(ip: string, userId: string): boolean {
  const now = Date.now();
  
  // 1. IP Limit (dakikada en fazla 60 imzalama isteği — tam sure seçilince 52 ayetin
  //    klibi + posterleri tek seferde imzalanıyor; 40 limiti meşru kullanıcıyı 429'a
  //    boğup önizlemeyi donduruyordu. Oturum + origin doğrulaması zaten var.)
  const ipHits = (HITS.get(ip) || []).filter((hit) => now - hit < 60000);
  if (ipHits.length >= 60) return false;
  ipHits.push(now);
  HITS.set(ip, ipHits);
  
  // 2. Kullanıcı ID Limit (dakikada en fazla 45 imzalama isteği)
  if (userId) {
    const userHits = (USER_HITS.get(userId) || []).filter((hit) => now - hit < 60000);
    if (userHits.length >= 45) return false;
    userHits.push(now);
    USER_HITS.set(userId, userHits);
  }
  
  return true;
}

function canAccessClip(userTier: Tier, cat: CatId, clipIndex: number): boolean {
  const catTier = CATEGORY_TIER[cat];
  if (catTier === "elit" && TIER_RANK[userTier] < TIER_RANK.elit) return false;
  if (TIER_RANK[userTier] < TIER_RANK[catTier]) return false;
  if (clipIndex >= FREE_VIDEOS_PER_CATEGORY) {
    const nextTier: Tier = catTier === "free" ? "pro" : "elit";
    if (TIER_RANK[userTier] < TIER_RANK[nextTier]) return false;
  }
  return true;
}

const ALLOWED_CATEGORIES = new Set<string>(CATEGORY_IDS);

// ★ admin_* kategorilerin R2'deki GERCEK klasor adlari (key) — src/adminMediaManifest.ts ile senkron
const ADMIN_R2_KEYS: Record<string, string> = {"admin_adiyat_war_horses":"atlar","admin_aging_elderly_man":"yasli-adam","admin_ancient_city_walls":"surlar","admin_ancient_egypt_pyramids":"piramit","admin_ancient_ruins_stone":"harabeler","admin_aurora_borealis_sky":"kutupisigi","admin_belkis_throne_kingdom":"taht","admin_black_hole_space":"karadelik","admin_blind_deaf_mute":"engelli","admin_boiling_sulfur_springs":"kukurt","admin_cargo_ships_sea":"gemiler","admin_collapsing_star":"cokenyildiz","admin_constellation_stars":"takimyildiz","admin_cooked_mud_pottery":"comlek","admin_darkness_to_light":"nur","admin_date_palm_branches":"zeytin","admin_deep_canyon_passages":"kanyon","admin_desert_oasis_sources":"vaha","admin_earth_crust_layers":"yerkabugu","admin_earthquake_shaking_ground":"deprem","admin_embryo_human_creation":"yaratilis","admin_flying_crow_raven":"karga","admin_glacier_iceberg_melting":"buzdagi","admin_grazing_cattle_sheep":"hayvanlar","admin_gushing_spring_river":"caglayan","admin_hadid_iron_metal":"demir","admin_hands_praying_sky":"dua","admin_heaven_pomegranate_fruits":"nar","admin_hellfire_volcano_lava":"lav","admin_honeybee_hive_comb":"petek","admin_hudhud_water_suleyman_hoopoe_bird":"hudhud","admin_iron_shield_armor":"zirh","admin_joseph_deep_well":"kuyu","admin_justice_scales_balance":"adalet","admin_kahf_cave_zara_bowl":"magara","admin_karun_treasures_gold":"karun","admin_liquid_copper_spring":"bakir","admin_lizard_in_desert":"kertenkele","admin_locust_swarm_flying":"cekirge","admin_lunar_phases_orbit":"ay","admin_luxury_palace_interior":"saray","admin_mahshar_wavy_people":"mahser","admin_market_place_trade":"pazar","admin_meteor_shower_stars":"meteor","admin_molten_iron_ore":"cevher","admin_mountains_wool_dust":"daglar","admin_mud_fertile_soil":"toprak","admin_mustard_seed_macro":"hardal","admin_night_sleep_death":"uyku","admin_olive_grove_trees":"zeytin","admin_paradise_garden_palace":"cennet","admin_paradise_rivers_milk":"nehirler","admin_pearl_coral_diving":"mercan","admin_pen_ink_writing":"kalem","admin_praying_hands_islamic":"ibadet","admin_regret_sadness_face":"pismanlik","admin_rock_carved_houses":"kayalar","admin_seven_layers_atmosphere":"atmosfer","admin_shining_faces_joy":"sevinc","admin_silk_fabric_textile":"ipek","admin_silver_goblets_crystal":"kadehler","admin_sky_ripping_open":"gokyuzu","admin_smoke_fog_sky":"sis","admin_solar_eclipse_sun":"tutulma","admin_spider_rotten_nest":"orumcek","admin_sprouting_seed_soil":"filiz","admin_stormy_sea_boat":"firtina","admin_stratosphere_clouds_heavy":"stratosfer","admin_swarming_gnats_mosquito":"sivrisinek","admin_tectonic_plates_fault":"fay","admin_two_sea_merging":"birlesme","admin_underground_cave":"magara2","admin_underwater_currents_dark":"akinti","admin_universe_expansion":"evren","admin_water_well_depth":"kuyu2","admin_water_cycle_cloud_formation":"dongu","admin_withered_dry_grass":"kuraklik","admin_wolf_howling_night":"kurt","admin_zaqqum_tree_hell":"zakkum"};

function isSafeCategory(value: unknown): value is CatId {
  return typeof value === "string" && (ALLOWED_CATEGORIES.has(value as CatId) || /^admin_[a-zA-Z0-9_]{2,100}$/.test(value));
}

function normalizePexelsId(value: unknown): number | null {
  if (typeof value === "number" && Number.isSafeInteger(value) && value > 0 && value < 100_000_000) return value;
  if (typeof value === "string" && /^\d{3,9}$/.test(value)) return Number(value);
  return null;
}

function isSafeClipId(value: unknown): value is string {
  return typeof value === "string" && /^[a-zA-Z0-9_-]{2,80}$/.test(value);
}

// Sayısal kimliği olmayan R2 dosyaları: KlasorAdi_rN bicimi (örn. blind_deaf_mute_r3)
function isSafeClipFile(value: unknown): value is string {
  return typeof value === "string" && /^[a-zA-Z0-9]+[_-][a-zA-Z0-9_-]*_r\d{1,4}$/.test(value) && value.length <= 120;
}

function clipIndexFromId(cat: string, clipId: string | null): number {
  const match = clipId?.match(new RegExp(`^${cat}-r(\\d+)$`));
  return match ? Math.max(0, Number(match[1]) - 1) : 0;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method Not Allowed" });

  const origin = typeof req.headers.origin === "string" ? req.headers.origin : "";
  // ★ GÜVENLİK: Origin başlığı TÜM tarayıcılardan POST isteklerinde zorunlu gönderilir.
  //   Boş origin = tarayıcı dışı istemci (curl/script) → cookie çalınsa bile kabul etme.
  //   Eskiden boş origin sessizce geçiliyordu — oturum çalınmış kullanıcıdan script istekleri kabul edilirdi.
  if (!origin || !ALLOWED_ORIGINS.has(origin)) {
    return res.status(403).json({ ok: false, error: "İzin verilmeyen istek kaynağı" });
  }

  const sessionUser = getSessionUser(req);
  if (!sessionUser) return res.status(401).json({ ok: false, error: "Oturum gerekli" });

  // Çok sıkı IP/Kullanıcı Rate Limit (Scraping Engelleme)
  const ip = String(req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown").split(",")[0].trim();
  if (!checkRateLimits(ip, sessionUser.id)) {
    res.setHeader("Retry-After", "60");
    return res.status(429).json({ ok: false, error: "İstek limitini aştınız. Lütfen bir dakika bekleyin." });
  }

  try {
    const access = await loadServerAccess(sessionUser.id);
    if (!access) return res.status(503).json({ ok: false, error: "Yetki servisi kullanılamıyor" });
    if (access.banned) return res.status(403).json({ ok: false, error: "Bu hesap kullanıma kapatılmış" });
    const { clipId, pexelsId, cat, clipFile } = req.body || {};
    if (!isSafeCategory(cat)) return res.status(400).json({ ok: false, error: "Geçersiz veya izinli olmayan kategori" });

    const normalizedPexelsId = normalizePexelsId(pexelsId);
    const normalizedClipId = isSafeClipId(clipId) ? clipId : null;
    const normalizedClipFile = isSafeClipFile(clipFile) ? clipFile : null;
    if (normalizedPexelsId === null && !normalizedClipId && !normalizedClipFile) return res.status(400).json({ ok: false, error: "Geçersiz video kimliği" });
    const userTier: Tier = access.isAdmin ? "elit" : access.tier;
    if (!access.isAdmin && typeof cat === "string" && cat.startsWith("admin_") && userTier !== "elit") {
      return res.status(403).json({ ok: false, error: "Bu içerik yalnızca Elit üyeler içindir" });
    }
    const clipIndex = clipIndexFromId(cat, normalizedClipId);
    if (!canAccessClip(userTier, cat, clipIndex)) return res.status(403).json({ ok: false, error: "Bu içerik için üyelik seviyeniz yetersiz" });

    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || "";
    const bucketName = process.env.R2_BUCKET_NAME || "nurstudyo";
    const accessKeyId = process.env.R2_ACCESS_KEY_ID || "";
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || "";
    const mediaId = normalizedClipFile ?? (normalizedPexelsId !== null ? String(normalizedPexelsId) : normalizedClipId!);
    // ★ admin_* kategoriler R2'de kisa klasor adlariyla durur (orn. videos/hayvanlar/)
    const r2Folder = ADMIN_R2_KEYS[String(cat)] ?? String(cat);
    const videoKey = `videos/${r2Folder}/${mediaId}.mp4`;
    const posterKey = `posters/${r2Folder}/${mediaId}.jpg`;

    if (accountId && accessKeyId && secretAccessKey) {
      if (!/^[a-zA-Z0-9]{16,64}$/.test(accountId)) return res.status(500).json({ ok: false, error: "R2 hesap yapılandırması geçersiz" });
      const s3Client = new S3Client({ region: "auto", endpoint: `https://${accountId}.r2.cloudflarestorage.com`, credentials: { accessKeyId, secretAccessKey } });
      const signedVideoUrl = await getSignedUrl(s3Client, new GetObjectCommand({ Bucket: bucketName, Key: videoKey }), { expiresIn: 600 });
      const signedPosterUrl = await getSignedUrl(s3Client, new GetObjectCommand({ Bucket: bucketName, Key: posterKey }), { expiresIn: 600 });
      return res.status(200).json({ ok: true, url: signedVideoUrl, posterUrl: signedPosterUrl, expiresAt: Date.now() + 600 * 1000 });
    }

    return res.status(503).json({ ok: false, error: "R2 medya servisi yapılandırılmamış" });
  } catch (error) {
    await logServerError(req, error, "api/video/sign");
    console.error("[R2 Presigned URL Error]", error);
    return res.status(500).json({ ok: false, error: "İmzalı video bağlantısı üretilemedi" });
  }
}
