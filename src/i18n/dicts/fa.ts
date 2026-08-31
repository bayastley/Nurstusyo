import { arDict } from "./ar";
import type { Dict } from "../base";
export const faDict: Dict = {
  ...arDict,
  dailyAyah: "آیه روز",
  loading: "در حال بارگذاری...",
  menuGuide: "راهنمای استفاده",
  menuThemes: "گالری تم",
  premium: "پرمیوم پرو",
  tagline: "ویدیوهای قرآن با کیفیت فوق‌العاده بسازید و به اشتراک بگذارید",
  library: "کتابخانه و جستجوی آیه",
  addAyah: "افزودن آیه",
  ready: "ویدیوی شما آماده است!",
  download: "دانلود",
  share: "اشتراک‌گذاری",
  generate: "ساخت ویدیو",
  stop: "توقف",
  loginTitle: "ورود / ثبت‌نام",
  loginBtn: "ورود",
  registerBtn: "ثبت‌نام",
  googleAuth: "ادامه با گوگل",
  energy: "سهمیه روزانه",
  energyShort: "امروز",
  membership: "عضویت",
  energyPack: "بسته ویدیو",
};

// ★ YENİ DİLLER — arayüz metinleri de değişsin diye (ur/fa ile aynı yöntem:
//   İngilizce sözlük tabana alınıp en görünür anahtarlar native dile
//   çevrildi). Meal (ayet çevirisi) zaten MEAL_EDITIONS üzerinden ayrı bir
