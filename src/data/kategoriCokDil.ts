// ════════════════════════════════════════════════════════
// ATMOSFER KATEGORİLERİ — çok dil (04.10; admin kategorileri 26.10 eklendi)
// clips.ts CATEGORIES + adminAtmosphereCategories ADMIN_ATMOSPHERE_CATEGORIES
// label çevirileri; catLabel yerine kullanılır.
// ════════════════════════════════════════════════════════

import type { Lang } from "../i18n";

// ── ANA KATEGORİLER (clips.ts CATEGORIES id'leri) ──
export const KATEGORI_AD_COKDIL: Record<string, Partial<Record<Lang, string>>> = {
  "yuklenenler": { en: "📁 My Uploads",      ar: "📁 رفعاتي",          id: "📁 Unggahan Saya",       ur: "📁 میری اپ لوڈز" },
  "namaz":       { en: "🕌 Prayer & Kaaba",  ar: "🕌 الصلاة والكعبة",   id: "🕌 Shalat & Ka'bah",     ur: "🕌 نماز اور کعبہ" },
  "musaf":       { en: "📖 Qur'an & Mushaf", ar: "📖 القرآن والمصحف",   id: "📖 Al-Qur'an & Mushaf",  ur: "📖 قرآن اور مصحف" },
  "cicekler":    { en: "🌸 Flowers & Roses", ar: "🌸 الزهور والورد",    id: "🌸 Bunga & Mawar",       ur: "🌸 پھول اور گلاب" },
  "yildizlar":   { en: "✨ Stars & Space",   ar: "✨ النجوم والفضاء",   id: "✨ Bintang & Antariksa", ur: "✨ ستارے اور کائنات" },
  "deniz":       { en: "🌊 Sea & Waves",     ar: "🌊 البحر والأمواج",   id: "🌊 Laut & Ombak",        ur: "🌊 سمندر اور لہریں" },
  "gunbatimi":   { en: "🌅 Sunset",          ar: "🌅 الغروب",           id: "🌅 Matahari Terbenam",   ur: "🌅 غروبِ آفتاب" },
  "gece":        { en: "🌙 Night & Moon",    ar: "🌙 الليل والقمر",     id: "🌙 Malam & Bulan",       ur: "🌙 رات اور چاند" },
  "orman":       { en: "🌲 Forest & Green",  ar: "🌲 الغابة والخضرة",   id: "🌲 Hutan & Hijau",       ur: "🌲 جنگل اور سبزہ" },
  "cami":        { en: "🕌 Islamic Architecture", ar: "🕌 العمارة الإسلامية", id: "🕌 Arsitektur Islam", ur: "🕌 اسلامی فن تعمیر" },
  "gol":         { en: "🏞️ Calm Lake",       ar: "🏞️ البحيرة الهادئة",  id: "🏞️ Danau Tenang",        ur: "🏞️ پرسکون جھیل" },
  "bulut":       { en: "☁️ Clouds",          ar: "☁️ السحاب",           id: "☁️ Awan",                ur: "☁️ بادل" },
  "desen":       { en: "🔷 Geometric Pattern", ar: "🔷 الزخرفة الهندسية", id: "🔷 Pola Geometris",     ur: "🔷 ہندسی نقش" },
  "selale":      { en: "💧 Waterfalls",      ar: "💧 الشلالات",         id: "💧 Air Terjun",          ur: "💧 آبشاريں" },
  "daglar":      { en: "🏔️ Mountains & Summit", ar: "🏔️ الجبال والقمم",  id: "🏔️ Gunung & Puncak",    ur: "🏔️ پہاڑ اور چوٹیاں" },
  "kar":         { en: "❄️ Snow & Ice",      ar: "❄️ الثلج والجليد",    id: "❄️ Salju & Es",          ur: "❄️ برف اور یخ" },
  "sehir":       { en: "🏙️ Civilization & City", ar: "🏙️ الحضارة والمدينة", id: "🏙️ Peradaban & Kota", ur: "🏙️ تہذیب اور شہر" },
  "cennet":      { en: "🌿 Paradise Garden", ar: "🌿 حدائق الجنة",      id: "🌿 Taman Surga",         ur: "🌿 جنت کے باغ" },
  "col":         { en: "🏜️ Desert & Sand",   ar: "🏜️ الصحراء والرمال",  id: "🏜️ Gurun & Pasir",       ur: "🏜️ صحرا اور ریت" },
  "ates":        { en: "🔥 Fire & Flame",    ar: "🔥 النار واللهب",     id: "🔥 Api & Lidah Api",     ur: "🔥 آگ اور شعلہ" },
  "fil":         { en: "🐘 Elephants & Wildlife", ar: "🐘 الفيلة والحياة البرية", id: "🐘 Gajah & Satwa Liar", ur: "🐘 ہاتھی اور جنگلی حیات" },
  "cehennem":    { en: "⚡ Hellfire & Darkness", ar: "⚡ نار جهنم والظلام", id: "⚡ Neraka & Kegelapan",  ur: "⚡ جہنم اور تاریکی" },
  "hurma":       { en: "🌴 Palms & Oasis",    ar: "🌴 النخيل والواحة",    id: "🌴 Kurma & Oasis",       ur: "🌴 کھجور اور واحہ" },
  "ari":         { en: "🐝 Bees & Honey",     ar: "🐝 النحل والعسل",      id: "🐝 Lebah & Madu",        ur: "🐝 شہد کی مکھی اور شہد" },
  "karinca":     { en: "🐜 Ants & Micro",     ar: "🐜 النمل والعالم الدقيق", id: "🐜 Semut & Mikro",     ur: "🐜 چیونٹی اور خردہ عالم" },
};

// ── ADMIN ATMOSFER KATEGORİLERİ (★ 26.10: 72 kategori × 4 dil) ──
//   Anahtar = ADMIN_ATMOSPHERE_CATEGORIES'de üretilen "admin_" önekli id.
export const KATEGORI_AD_COKDIL_ADMIN: Record<string, Partial<Record<Lang, string>>> = {
  "admin_adiyat_war_horses":       { en: "🎞️ War Horses",       ar: "🎞️ خيول الحرب",       id: "🎞️ Kuda Perang",         ur: "🎞️ جنگی گھوڑے" },
  "admin_aging_elderly_man":       { en: "🎞️ Aged Elderly Man", ar: "🎞️ رجل شيخ يحيا الزمن", id: "🎞️ Pria Tua Menua",      ur: "🎞️ بوڑھا بزرگ" },
  "admin_ancient_city_walls":      { en: "🎞️ Ancient City Walls", ar: "🎞️ أسوار المدينة القديمة", id: "🎞️ Dinding Kota Kuno", ur: "🎞️ قدیم شہر کی دیواریں" },
  "admin_ancient_egypt_pyramids":  { en: "🎞️ Ancient Egyptian Pyramids", ar: "🎞️ أهرامات مصر",  id: "🎞️ Piramida Mesir Kuno", ur: "🎞️ مصر کے قدیم اہرام" },
  "admin_ancient_ruins_stone":     { en: "🎞️ Ancient Stone Ruins", ar: "🎞️ أطلال حجرية قديمة", id: "🎞️ Reruntuhan Batu Kuno", ur: "🎞️ قدیم پتھر کے کھنڈر" },
  "admin_aurora_borealis_sky":     { en: "🎞️ Northern Lights",  ar: "🎞️ الشفق القطبي",     id: "🎞️ Cahaya Utara",        ur: "🎞️ شمالی روشنیاں" },
  "admin_belkis_throne_kingdom":   { en: "🎞️ Throne of Belqis", ar: "🎞️ عرش ملكة سبأ",     id: "🎞️ Takhta Ratu Bilqis",  ur: "🎞️ ملکہ بلقیس کا تخت" },
  "admin_black_hole_space":        { en: "🎞️ Black Hole & Space", ar: "🎞️ الثقب الأسود والفضاء", id: "🎞️ Lubang Hitam & Antariksa", ur: "🎞️ کالے سوراخ اور خلاء" },
  "admin_blind_deaf_mute":         { en: "🎞️ Deaf, Blind and Mute", ar: "🎞️ الأصم والبكم والكيّف", id: "🎞️ Tuli, Buta & Bisu", ur: "🎞️ بہرے، نابینا و گونگے" },
  "admin_boiling_sulfur_springs":  { en: "🎞️ Boiling Sulfur Springs", ar: "🎞️ الينابيع الكبريتية الغليانة", id: "🎞️ Mata Air Belerang Mendidih", ur: "🎞️ ابلتے گندھک کے چشمے" },
  "admin_cargo_ships_sea":         { en: "🎞️ Cargo Ships at Sea", ar: "🎞️ سفن الشحن في البحر", id: "🎞️ Kapal Kargo di Laut", ur: "🎞️ سمندر میں مال گزاری جہاز" },
  "admin_collapsing_star":         { en: "🎞️ Collapsing Star",  ar: "🎞️ انهيار النجم",     id: "🎞️ Bintang yang Runtuh", ur: "🎞️ گرتی ہوئی ستارا" },
  "admin_constellation_stars":     { en: "🎞️ Star Constellations", ar: "🎞️ أبراج النجوم",   id: "🎞️ Rasi Bintang",        ur: "🎞️ ستاروں کے ترب" },
  "admin_cooked_mud_pottery":      { en: "🎞️ Baked Clay and Pottery", ar: "🎞️ الطين المشوي والمفخخرة", id: "🎞️ Tanah Bakar & Tembikar", ur: "🎞️ پکائی ہوئی مٹی اور فنجم" },
  "admin_darkness_to_light":       { en: "🎞️ From Darkness to Light", ar: "🎞️ من الظلمات إلى النور", id: "🎞️ dari Kegelapan ke Cahaya", ur: "🎞️ تاریکی سے روشنی تک" },
  "admin_date_palm_branches":      { en: "🎞️ Date Palm Branches", ar: "🎞️ حافت النخیيل",  id: "🎞️ Kagas Daun Kurma",    ur: "🎞️ کھجور کی شاخیں" },
  "admin_deep_canyon_passages":    { en: "🎞️ Deep Canyon Passes", ar: "🎞️ مضيق الأودية العميقة", id: "🎞️ Lembah Ngawi",    ur: "🎞️ گہرے گھاٹی" },
  "admin_desert_oasis_sources":    { en: "🎞️ Desert Oasis and Springs", ar: "🎞️ واحة الصحراء والمنابع", id: "🎞️ Oasis Gurun & Mata Air", ur: "🎞️ صحرائی واحہ اور چشمے" },
  "admin_earth_crust_layers":      { en: "🎞️ Earth's Crust Layers", ar: "🎞️ طبقات القشرة الأرضية", id: "🎞️ Lapisan Kerak Bumi", ur: "🎞️ زمین کی پرتیں" },
  "admin_earthquake_shaking_ground": { en: "🎞️ The Shaking Earth", ar: "🎞️ الأرض المتزلزلة", id: "🎞️ Bumi yang Berguncang", ur: "🎞️ لرزش زمین" },
  "admin_embryo_human_creation":   { en: "🎞️ Human Embryo and Creation", ar: "🎞️ خلق الإنسان في الجنين", id: "🎞️ Embrio Manusia & Penciptaan", ur: "🎞️ انسانی جنین اور تخلیق" },
  "admin_flying_crow_raven":       { en: "🎞️ Flying Crow",      ar: "🎞️ الغراب الطائر",     id: "🎞️ Gagak Terbang",       ur: "🎞ں اڑتا ہوا کوا" },
  "admin_glacier_iceberg_melting": { en: "🎞️ Melting Glaciers and Icebergs", ar: "🎞️ ذوبان الجبال الجليدية", id: "🎞️ Mencairnya Gletser & Gunung Es", ur: "🎞️ گل بجال گرتی ہوئی یخیں" },
  "admin_grazing_cattle_sheep":    { en: "🎞️ Grazing Cattle and Sheep", ar: "🎞️ الأنعام الرايات", id: "🎞️ Ternak Makan Rumput", ur: "🎞️ چرتے مالِ مویشی اور بھیڑ بکریاں" },
  "admin_gushing_spring_river":    { en: "🎞️ Bursting Springs and Rivers", ar: "🎞️ الينابيع والأنهار", id: "🎞️ Mata Air Mancur & Sungai", ur: "🎞ں ابلتے چشمے اور ندیاں" },
  "admin_hadid_iron_metal":        { en: "🎞️ Iron and Metal",   ar: "🎞️ الحديد والمعادن",   id: "🎞️ Besi & Logam",        ur: "🎞ں آہن اور دھات" },
  "admin_hands_praying_sky":       { en: "🎞️ Raised Hands in Prayer", ar: "🎞️ الأيادی نحو السماء", id: "🎞️ Tangan Berdoa ke Langit", ur: "🎞️ آسمان کی طرف اٹھے ہاتھ" },
  "admin_heaven_pomegranate_fruits": { en: "🎞️ Paradise and Pomegranate Fruits", ar: "🎞️ الجنة والرمان", id: "🎞️ Surga & Buah Delima", ur: "🎞️ بہشت اور انار" },
  "admin_hellfire_volcano_lava":   { en: "🎞️ Hellfire and Lava", ar: "🎞️ نار جهنم والحمم", id: "🎞️ Api Neraka & Lava", ur: "🎞️ جہنم اور لاوا" },
  "admin_honeybee_hive_comb":      { en: "🎞️ The Honeybee and Hive", ar: "🎞️ النحل وخليته", id: "🎞️ Lebah & Sarang Madu", ur: "🎞ں شہد کی مکھی اور چھتہ" },
  "admin_hudhud_water_suleyman_hoopoe_bird": { en: "🎞️ The Hoopoe of Suleyman", ar: "🎞️ الهدهد لسليمان", id: "🎞️ Burung Hudhud Sulaiman", ur: "🎞ں سليمان کا ہدیہ" },
  "admin_iron_shield_armor":       { en: "🎞️ Iron Shield and Armor", ar: "🎞️ الترس والدرع الحديدية", id: "🎞️ Perisai Besi & Zirah", ur: "🎞️ لوہے کی ڈھال اور زرہ" },
  "admin_joseph_deep_well":        { en: "🎞️ Joseph and the Deep Well", ar: "🎞️ يوسف والبئر", id: "🎞️ Yusuf & Sumur Dalam", ur: "🎞️ یوسف اور گہری کنوئیں" },
  "admin_justice_scales_balance":  { en: "🎞️ Scales of Justice", ar: "🎞️ ميزان العدل",   id: "🎞️ Skala Keadilan",  ur: "🎞️ ترازوء عدل" },
  "admin_kahf_cave_zara_bowl":     { en: "🎞️ The Cave and the Bowl", ar: "🎞️ الكهف والقدح",   id: "🎞️ Gua & Mangkuk",      ur: "🎞️ غار اور پیالی" },
  "admin_karun_treasures_gold":    { en: "🎞️ Karun's Golden Treasures", ar: "🎞️ كنوز قارون الذهبية", id: "🎞️ Harta Karun Qarun",   ur: "🎞️ قارون کے خزائنِ زر" },
  "admin_liquid_copper_spring":    { en: "🎞️ Molten Copper Spring", ar: "🎞️ نبع النحاس", id: "🎞️ Mata Air Tembaga Cair", ur: "🎞ں پگھلا ہوا تانبا چشمہ" },
  "admin_lizard_in_desert":        { en: "🎞️ Lizard in the Desert", ar: "🎞️ سحلية في الصحراء", id: "🎞️ Kadal di Gurun", ur: "🎞️ صحرا میں چھپکلی" },
  "admin_locust_swarm_flying":     { en: "🎞️ Flying Locust Swarm", ar: "🎞️ الجراد الطير", id: "🎞️ Kawanan Belalang", ur: "🎞️ پرواز کرتا ٹڈی دل" },
  "admin_lunar_phases_orbit":      { en: "🎞️ Moon Phases and Orbit", ar: "🎞️ مراحل القمر ومداره", id: "🎞️ Fase & Orbit Bulan", ur: "🎞️ چاند کی حالتیں اور مدار" },
  "admin_luxury_palace_interior":  { en: "🎞️ Luxury Palace Interior", ar: "🎞️ داخل القصر الفخم", id: "🎞️ Interior Istana Mewah", ur: "🎞️ شاندار محل کا اندرونی حصہ" },
  "admin_mahshar_wavy_people":     { en: "🎞️ Mahshar and Crowds", ar: "🎞️ المحشر والجماعه", id: "🎞️ Mahsyar و Kumpulan Manusia", ur: "🎞️ محشر اور انساں کا ہجوم" },
  "admin_market_place_trade":      { en: "🎞️ Market and Trade", ar: "🎞️ السوق والتجارة", id: "🎞️ Pasar & Perdagangan", ur: "🎞️ بازار ور کاروبار" },
  "admin_meteor_shower_stars":     { en: "🎞️ Meteor Shower", ar: "🎞️ مطر الشهب",    id: "🎞️ Hujan Meteor",      ur: "🎞️ شہابِ باراں" },
  "admin_molten_iron_ore":         { en: "🎞️ Molten Iron Ore", ar: "🎞️ خام الحديد المصهور", id: "🎞️ Bijih Besi Cair", ur: "🎞️ پگھلی ہوئی دھات" },
  "admin_mountains_wool_dust":     { en: "🎞️ Mountains and Peaks", ar: "🎞️ الجبال والقمم", id: "🎞️ Pegunungan dan Puncak", ur: "🎞️ پہاڑ ور چوٹیاں" },
  "admin_mud_fertile_soil":        { en: "🎞️ Fertile Mud Soil", ar: "🎞️ التربة الطينية الخصبة", id: "🎞️ Tanah Subur", ur: "🎞️ زرخیز مٹی" },
  "admin_mustard_seed_macro":      { en: "🎞️ Mustard Seed", ar: "🎞️ حبة الخردل",   id: "🎞️ Biji Αrdi",      ur: "🎞️ رائی کا دانا" },
  "admin_night_sleep_death":       { en: "🎞️ Night, Sleep and Death", ar: "🎞️ الليل والنوم والموت", id: "🎞️ Malam, Tidur & Kematian", ur: "🎞️ رات، خواب ور موت" },
  "admin_olive_grove_trees":       { en: "🎞️ Olive Grove Trees", ar: "🎞️ أشجار الزيتون",    id: "🎞️ Kebun Zaitun",     ur: "🎞️ زیتون کا جنگل" },
  "admin_paradise_garden_palace":  { en: "🎞️ Gardens and Palaces of Paradise", ar: "🎞️ حدائق وقصور الجنة", id: "🎞️ Taman dan Istana Surga", ur: "🎞️ بہشت کے باغ اور محل" },
  "admin_paradise_rivers_milk":    { en: "🎞️ Rivers and Milk of Paradise", ar: "🎞️ أنهار الجنة والحليب", id: "🎞️ Sungai Surga", ur: "🎞️ بہشت کے ندیاں" },
  "admin_pearl_coral_diving":      { en: "🎞️ Pearls and Coral Diving", ar: "🎞️ اللؤلؤ والمرجان", id: "🎞️ Mutiara & Karang", ur: "🎞️ موتی ور مرجان" },
  "admin_pen_ink_writing":         { en: "🎞️ Pen and Ink Writing", ar: "🎞️ القلم والحبر",    id: "🎞️ Kalam & Tinta",    ur: "🎞️ قلم اور سیاہی" },
  "admin_praying_hands_islamic":   { en: "🎞️ Islamic Praying Hands", ar: "🎞️ الاستعمال الدعاء الإسلامي", id: "🎞️礼拜 Tangan Berdoa Il", ur: "🎞️礼拜 اسلامی مد حار" },
  "admin_regret_sadness_face":     { en: "🎞️ Regretful Face", ar: "🎞️ الوجهّ حرب", id: "🎞️ Wajah Menyesal", ur: "🎞️ غمگین چہرہ" },
  "admin_rock_carved_houses":      { en: "🎞️ Houses Carved in Rock", ar: "🎞️ بيوت محفورة في الصخر", id: "🎞️ Rumah Berukir Batu", ur: "🎞️ پتھر میں کندہ گھر" },
  "admin_seven_layers_atmosphere": { en: "🎞️ Seven Layers of the Atmosphere", ar: "🎞️ سبع طبقات الجو", id: "🎞️ Tujuh Lapis Atmosfer", ur: "🎞️ آسمان کی سات پرتیں" },
  "admin_shining_faces_joy":       { en: "🎞️ Shining Faces and Joy", ar: "🎞️ الوجوه المشرقة والفرح", id: "🎞️ Wajah Berseri & Gembira", ur: "🎞️ چمکتے چہرے اور خوشی" },
  "admin_silk_fabric_textile":     { en: "🎞️ Silk Fabric Textile", ar: "🎞️ القماش الحرير", id: "🎞️ Kain Sutra",       ur: "🎞️ ریشم کا کپڑا" },
  "admin_silver_goblets_crystal":  { en: "🎞️ Silver Goblets & Crystal", ar: "🎞️ كؤوس الفضة والكربستال", id: "🎞️ Cawan Perak & Kristal", ur: "🎞️ چاندی کے پیالے اور کرسٹل" },
  "admin_sky_ripping_open":        { en: "🎞️ The Sky Tearing Open", ar: "🎞️ انفصال السماء", id: "🎞️ Langit Terbelah", ur: "🎞️ آسمان چاک" },
  "admin_smoke_fog_sky":           { en: "🎞️ Smoke and Fog Sky", ar: "🎞️ الدخان والضباب", id: "🎞️ Langit Berasap & Berkabut", ur: "🎞️ دھوا اور دھند آسمان" },
  "admin_solar_eclipse_sun":       { en: "🎞️ Solar Eclipse", ar: "🎞️ الكسوف", id: "🎞️ Gerhana Matahari", ur: "🎞️ سورج گرین" },
  "admin_spider_rotten_nest":      { en: "🎞️ The Spider and Rotten Web", ar: "🎞️ العواقب على شكل شبكة", id: "🎞️ Laba-laba & Sarang Lapuk", ur: "🎞️ مکڑی اور گرایا گھر" },
  "admin_sprouting_seed_soil":     { en: "🎞️ Sprouting Seed", ar: "🎞️ النبتة الناشئة", id: "🎞️ Benih yang Bertunas", ur: "🎞️ نکلتی بوٹی" },
  "admin_stormy_sea_boat":         { en: "🎞️ Stormy Sea and Boat", ar: "🎞️ البحر العاصف",    id: "🎞️ Laut Badai & Perahu", ur: "🎞️ طوفانی سمندر اور کشتی" },
  "admin_stratosphere_clouds_heavy": { en: "🎞️ Heavy Stratosphere Clouds", ar: "🎞️ الانهيارات الكثيفة", id: "🎞️ Awan Berat di Stratosfer", ur: "🎞️ علوی کی گھن بادل" },
  "admin_swarming_gnats_mosquito": { en: "🎞️ Swarming Gnats", ar: "🎞️ أسراب البعوض",    id: "🎞️ Kawanan Nyamuk",    ur: "🎞️ مچھروں کا جھنڈ" },
  "admin_tectonic_plates_fault":   { en: "🎞️ Tectonic Plates and Fault", ar: "🎞️ الصفائح التكتونية", id: "🎞️ Pelat Tektonik", ur: "🎞️ی تختی تکتونی" },
  "admin_two_sea_merging":         { en: "🎞️ The Meeting of the Two Seas", ar: "🎞️ المرجَ البيحرين", id: "🎞️ Pertemuan Dua Laut", ur: "🎞️ی دو سمندر کا ملاق" },
  "admin_underground_cave":        { en: "🎞️ Underground Cave", ar: "🎞️ الكهف الأرضي", id: "🎞️ Gua Bawah Tanah", ur: "🎞️ زمینی غار" },
  "admin_underwater_currents_dark": { en: "🎞️ Dark Underwater Currents", ar: "🎞️ التيارات المظلمة", id: "🎞️ Arus Laut Gelap", ur: "🎞️ گہری تاریک پانی کی روئیں" },
  "admin_universe_expansion":      { en: "🎞️ Expanding Universe", ar: "🎞️ توسع الكون", id: "🎞️ Alam Semesta Mengembang", ur: "🎞️ پھیلتی کائنات" },
  "admin_water_well_depth":        { en: "🎞️ Water Well and Depth", ar: "🎞️ البئر وعمق المياه", id: "🎞️ Sumur & Kedalaman", ur: "🎞️ پانی کا کنواں اور گہرائی" },
  "admin_water_cycle_cloud_formation": { en: "🎞️ The Water Cycle and Cloud Formation", ar: "🎞️ دورة الماء وتشكل السحاب", id: "🎞️ Siklus Air & Pembentukan Awan", ur: "🎞️ پانی کا سائیکل اور بادل" },
  "admin_withered_dry_grass":      { en: "🎞️ Withered Dry Grass", ar: "🎞️ العشب اليابس", id: "🎞️ Rumput Layu", ur: "🎞️ سوکھی گھاس" },
  "admin_wolf_howling_night":      { en: "🎞️ Howling Wolf at Night", ar: "🎞️ هدير الذئب في الليل", id: "🎞️ Serigala Melolong Malam", ur: "🎞️ رات میں بھونکنے والا بھیڑیا" },
  "admin_zaqqum_tree_hell":        { en: "🎞️ The Zaqqum Tree of Hell", ar: "🎞️ شجرة الزقوم",    id: "🎞️ Pohon Zaqqum",      ur: "🎞️ زقوم جہنم کا درخت" },
};

/** Kategori adının seçili dildeki görünümü — çeviri yoksa TR label */
export function kategoriAdGorunum(catId: string, trLabel: string, lang: Lang): string {
  const dil = String(lang || "tr").toLowerCase() as Lang;
  if (dil === "tr") return trLabel;
  return KATEGORI_AD_COKDIL[catId]?.[dil]
      ?? KATEGORI_AD_COKDIL_ADMIN[catId]?.[dil]
      ?? trLabel;
}

/** ★ 26.10: her kategori tipinde (ana + admin) universal id eşleme; dil None gelirse TR */
export function atmosKategoriAdGorunum(catId: string, trLabel: string, lang: Lang | string | null | undefined): string {
  const l = String(lang || "tr").trim().toLowerCase() as Lang;
  if (l === "tr") return trLabel;
  return KATEGORI_AD_COKDIL[catId]?.[l]
      ?? KATEGORI_AD_COKDIL_ADMIN[catId]?.[l]
      ?? trLabel;
}
