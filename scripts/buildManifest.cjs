const fs = require("node:fs");
const path = require("node:path");

const CATEGORY_FILE = path.join(__dirname, "../src/adminAtmosphereCategories.ts");
const MANIFEST_FILE = path.join(__dirname, "../src/adminMediaManifest.ts");

const VIDEO_ROOT = "C:\\R2_Projesi";
const TEMPLATE_ROOT = "C:\\R2_Projesi sablon";

const SHORT_NAMES = {
  "adiyat-war-horses": "atlar", "ancient_city_walls": "surlar", "ancient_egypt_pyramids": "piramit",
  "ancient_ruins_stone": "harabeler", "aurora_borealis_sky": "kutupisigi", "belkis-throne-kingdom": "taht",
  "black_hole_space": "karadelik", "blind_deaf_mute": "engelli", "boiling_sulfur_springs": "kukurt",
  "cargo_ships_sea": "gemiler", "collapsing_star": "cokenyildiz", "constellation_stars": "takimyildiz",
  "cooked-mud-pottery": "comlek", "darkness_to_light": "nur", "date_palm_branches": "hurma",
  "deep_canyon_passages": "kanyon", "desert-oasis-sources": "vaha", "earth_crust_layers": "yerkabugu",
  "earthquake_shaking_ground": "deprem", "embryo_human_creation": "yaratilis", "flying_crow_raven": "karga",
  "glacier_iceberg_melting": "buzdagi", "grazing_cattle_sheep": "hayvanlar", "gushing_spring_river": "caglayan",
  "hadid_iron_metal": "demir", "hands_praying_sky": "dua", "heaven-pomegranate-fruits": "nar",
  "hellfire_volcano_lava": "lav", "honeybee_hive_comb": "petek", "hudhud-water-suleyman-hoopoe-bird": "hudhud",
  "iron_shield_armor": "zirh", "joseph_deep_well": "kuyu", "justice_scales_balance": "adalet",
  "kahf-cave-zara-bowl": "magara", "karun_treasures_gold": "karun", "liquid_copper_spring": "bakir",
  "lizard_in_desert": "kertenkele", "locust_swarm_flying": "cekirge", "lunar_phases_orbit": "ay",
  "luxury_palace_interior": "saray", "mahshar-wavy-people": "mahser", "market-place-trade": "pazar",
  "meteor_shower_stars": "meteor", "molten_iron_ore": "cevher", "mountains_wool_dust": "daglar",
  "mud_fertile_soil": "toprak", "mustard_seed_macro": "hardal", "night_sleep_death": "uyku",
  "olive_grove_trees": "zeytin", "paradise_garden_palace": "cennet", "paradise_rivers_milk": "nehirler",
  "pearl_coral_diving": "mercan", "pen-ink-writing": "kalem", "praying_hands_islamic": "ibadet",
  "regret_sadness_face": "pismanlik", "rock_carved_houses": "kayalar", "seven_layers_atmosphere": "atmosfer",
  "shining_faces_joy": "sevinc", "silk_fabric_textile": "ipek", "silver_goblets_crystal": "kadehler",
  "sky_ripping_open": "gokyuzu", "smoke_fog_sky": "sis", "solar_eclipse_sun": "tutulma",
  "spider-rotten-nest": "orumcek", "sprouting_seed_soil": "filiz", "stormy_sea_boat": "firtina",
  "stratosphere_clouds_heavy": "stratosfer", "swarming_gnats_mosquito": "sivrisinek", "tectonic_plates_fault": "fay",
  "two-sea-merging": "birlesme", "underground_cave": "magara2", "underwater_currents_dark": "akinti",
  "universe_expansion": "evren", "water_well_depth": "kuyu2", "water-cycle-cloud-formation": "dongu",
  "withered_dry_grass": "kuraklik", "wolf_howling_night": "kurt", "zaqqum_tree_hell": "zakkum",
};

// Turkish slug mapping
function slugify(text) {
  return text.replace(/[^\p{L}\p{N}\s-]/gu, "").trim().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/ı/g, "i").replace(/ğ/g, "g").replace(/ş/g, "s").replace(/ç/g, "c").replace(/ö/g, "o").replace(/ü/g, "u")
    .toLocaleLowerCase("en-US").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function getFolderName(sourceFolder, turkishNames) {
  if (SHORT_NAMES[sourceFolder]) return SHORT_NAMES[sourceFolder];
  if (turkishNames[sourceFolder]) return turkishNames[sourceFolder];
  return sourceFolder.replace(/[_-]+/g, "-").replace(/[^a-zA-Z0-9-]/g, "").toLocaleLowerCase("tr-TR");
}

function parseCategories() {
  const source = fs.readFileSync(CATEGORY_FILE, "utf8");
  const categories = [];
  const turkishNames = {};
  
  // Extract categories
  for (const m of source.matchAll(/\["([^"]+)",\s*"([^"]+)"\]/g)) {
    const folder = m[1];
    const label = m[2];
    const id = `admin_${folder.replace(/[^a-zA-Z0-9]+/g, "_")}`;
    const slug = slugify(label);
    turkishNames[folder] = slug;
    categories.push({ id, folder, label });
  }
  return { categories, turkishNames };
}

function parseExistingKeywords() {
  if (!fs.existsSync(MANIFEST_FILE)) return {};
  const source = fs.readFileSync(MANIFEST_FILE, "utf8");
  const match = source.match(/export const ADMIN_AI_KEYWORDS: Record<string, string> = ({.*?});/);
  if (!match) return {};
  try {
    return JSON.parse(match[1]);
  } catch {
    // Fallback regex parsing if JSON.parse fails due to single quotes or format
    const keywords = {};
    for (const m of match[1].matchAll(/"([^"]+)":"([^"]+)"/g)) {
      keywords[m[1]] = m[2];
    }
    return keywords;
  }
}

function scanFiles(categories, turkishNames) {
  const mediaMap = {};
  for (const cat of categories) {
    const key = getFolderName(cat.folder, turkishNames);
    const videoIds = [];
    const templateIds = [];
    
    // Scan videos
    const videoPath = path.join(VIDEO_ROOT, cat.folder);
    if (fs.existsSync(videoPath)) {
      const files = fs.readdirSync(videoPath);
      for (const file of files) {
        const ext = path.extname(file).toLowerCase();
        if ([".mp4", ".mov", ".webm", ".m4v"].includes(ext)) {
          const name = path.basename(file, ext);
          if (/^\d+$/.test(name)) {
            videoIds.push(parseInt(name, 10));
          }
        }
      }
    }
    
    // Scan templates
    const templatePath = path.join(TEMPLATE_ROOT, cat.folder);
    if (fs.existsSync(templatePath)) {
      const files = fs.readdirSync(templatePath);
      for (const file of files) {
        const ext = path.extname(file).toLowerCase();
        if ([".jpg", ".jpeg", ".png", ".webp"].includes(ext)) {
          const name = path.basename(file, ext);
          if (/^\d+$/.test(name)) {
            templateIds.push(parseInt(name, 10));
          }
        }
      }
    }
    
    // Sort numerically
    videoIds.sort((a, b) => a - b);
    templateIds.sort((a, b) => a - b);
    
    mediaMap[cat.id] = {
      key,
      videoIds,
      templateIds
    };
  }
  return mediaMap;
}

function main() {
  console.log("Parsing categories...");
  const { categories, turkishNames } = parseCategories();
  
  console.log("Extracting existing AI keywords...");
  const existingKeywords = parseExistingKeywords();
  
  // Backfill missing keywords with defaults
  const keywords = {};
  for (const cat of categories) {
    keywords[cat.id] = existingKeywords[cat.id] || slugify(cat.label).replace(/-/g, " ");
  }
  
  console.log("Scanning local video and template folders...");
  const mediaMap = scanFiles(categories, turkishNames);
  
  console.log("Writing manifest file...");
  const content = `import type { Clip } from "./clips";
import { ADMIN_ATMOSPHERE_CATEGORIES } from "./adminAtmosphereCategories";

const R2 = "https://cdn.nurstudyo.com";
export const ADMIN_AI_KEYWORDS: Record<string, string> = ${JSON.stringify(keywords)};
const ADMIN_MEDIA: Record<string, { key: string; videoIds: number[]; templateIds: number[] }> = ${JSON.stringify(mediaMap)};
export const ADMIN_MOTION_CLIPS: Clip[] = ADMIN_ATMOSPHERE_CATEGORIES.flatMap((category) => { const media=ADMIN_MEDIA[category.id]; return media ? media.videoIds.map((id,index)=>({ id:\`\${category.id}-\${index+1}\`, label:\`\${category.label} \${index+1}\`, cat:category.id, kind:"vid" as const, src:\`\${R2}/videos/\${media.key}/\${id}.mp4\`, r2:\`\${R2}/videos/\${media.key}/\${id}.mp4\`, r2Poster:media.templateIds[index] ? \`\${R2}/templates/\${media.key}/\${media.templateIds[index]}.jpg\` : undefined, pexelsId:id })) : []; });
export const ADMIN_TEMPLATE_CLIPS: Clip[] = ADMIN_ATMOSPHERE_CATEGORIES.flatMap((category) => { const media=ADMIN_MEDIA[category.id]; return media ? media.templateIds.map((id,index)=>({ id:\`\${category.id}-tpl-\${index+1}\`, label:\`\${category.label} \${index+1}\`, cat:category.id, kind:"img" as const, src:\`\${R2}/templates/\${media.key}/\${id}.jpg\`, r2Poster:\`\${R2}/templates/\${media.key}/\${id}.jpg\`, pexelsId:id })) : []; });
`;

  fs.writeFileSync(MANIFEST_FILE, content, "utf8");
  console.log("Success! Manifest rebuilt.");
}

main();
