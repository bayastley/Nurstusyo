#!/usr/bin/env python3
# ════════════════════════════════════════════════════════
# CEVIR_SAHABELER.PY — İngilizce sahabe/hadis verisini çok dilli JSON'a çevirir
#
# Ne yapar:
#   ingilizce_veri.json  →  cok_dilli_sahabeler.json
#   Her metin alanı {en, tr, ar, de, fr} sözlüğüne dönüşür.
#
# Kurulum:
#   python -m pip install deep-translator
#
# Kullanım:
#   python scripts/cevir_sahabeler.py
#   python scripts/cevir_sahabeler.py --girdi veri/ingilizce_veri.json --cikti veri/cok_dilli_sahabeler.json
#   python scripts/cevir_sahabeler.py --diller tr,ar,de,fr --sinir 3      # ilk 3 kayıtla deneme
#   python scripts/cevir_sahabeler.py --yeniden                          # önbelleği yok say
#
# Özellikler:
#   • Cümle bazlı çeviri (uzun paragraflar tek istekte bozulmuyor)
#   • İslami terim sözlüğü: metin içindeki terimler jetonla korunur, çeviriden
#     sonra hedef dildeki doğru karşılığıyla geri konur (--sozluk ile genişletilir)
#   • Önbellek (ceviri_onbellek.json): aynı cümle ikinci kez çevrilmez
#   • Her kayıttan sonra çıktı diske yazılır → kopmada kaldığı yerden devam eder
#   • Hatalı/yarım kayıt çıktıya tamamlanmış gibi yazılmaz; sonraki çalıştırmada
#     yalnız eksik diller çevrilir
# ════════════════════════════════════════════════════════

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import sys
import time
from pathlib import Path
from typing import Any

# Windows konsolu (cp1254) Türkçe/Unicode işaretlerde patlamasın
for akis in (sys.stdout, sys.stderr):
    if hasattr(akis, "reconfigure"):
        try:
            akis.reconfigure(encoding="utf-8", errors="replace")
        except Exception:  # eski Python / yönlendirilmiş akış
            pass

try:
    from deep_translator import GoogleTranslator
except ImportError:
    sys.exit(
        "deep-translator kurulu değil.\n"
        "Kurulum:  python -m pip install deep-translator"
    )

KAYNAK_DIL = "en"
VARSAYILAN_HEDEFLER = ["tr", "ar", "de", "fr"]
CEKIRDEK_ALANLAR = {"id", "slug", "vefat_yili", "sira", "resim", "gorsel", "image"}

# ── İslami terimler: çeviri öncesi jetonla korunur, sonra doğru karşılığı konur ──
# Anahtar: İngilizce metinde geçen biçim (küçük/büyük harf duyarsız, tam kelime)
TERIM_SOZLUGU: dict[str, dict[str, str]] = {
    "the Prophet": {
        "tr": "Hz. Peygamber", "ar": "النبي", "de": "der Prophet", "fr": "le Prophète",
    },
    "Prophet Muhammad": {
        "tr": "Hz. Muhammed", "ar": "محمد ﷺ", "de": "Prophet Muhammad", "fr": "le Prophète Muhammad",
    },
    "Companions": {"tr": "sahabeler", "ar": "الصحابة", "de": "Gefährten", "fr": "compagnons"},
    "Companion": {"tr": "sahabi", "ar": "صحابي", "de": "Gefährte", "fr": "compagnon"},
    "Caliph": {"tr": "halife", "ar": "خليفة", "de": "Kalif", "fr": "calife"},
    "caliph": {"tr": "halife", "ar": "خليفة", "de": "Kalif", "fr": "calife"},
    "Masjid": {"tr": "mescid", "ar": "المسجد", "de": "Moschee", "fr": "mosquée"},
    "Mosque": {"tr": "cami", "ar": "المسجد", "de": "Moschee", "fr": "mosquée"},
    "Kaaba": {"tr": "Kâbe", "ar": "الكعبة", "de": "Kaaba", "fr": "la Kaaba"},
    "Hijra": {"tr": "hicret", "ar": "الهجرة", "de": "Hidschra", "fr": "l'Hégire"},
    "hijra": {"tr": "hicret", "ar": "الهجرة", "de": "Hidschra", "fr": "l'Hégire"},
    "Umrah": {"tr": "umre", "ar": "العمرة", "de": "Umra", "fr": "la omra"},
    "Hajj": {"tr": "hac", "ar": "الحج", "de": "Hadsch", "fr": "le hajj"},
    "Ramadan": {"tr": "Ramazan", "ar": "رمضان", "de": "Ramadan", "fr": "Ramadan"},
    "Badr": {"tr": "Bedir", "ar": "بدر", "de": "Badr", "fr": "Badr"},
    "Uhud": {"tr": "Uhud", "ar": "أحد", "de": "Uhud", "fr": "Uhud"},
    "Khandaq": {"tr": "Hendek", "ar": "الخندق", "de": "Graben", "fr": "fossé"},
    "Trench": {"tr": "Hendek", "ar": "الخندق", "de": "Graben", "fr": "fossé"},
    "Quraysh": {"tr": "Kureyş", "ar": "قريش", "de": "Quraisch", "fr": "Quraysh"},
    "Ansar": {"tr": "Ensar", "ar": "الأنصار", "de": "Ansar", "fr": "Ansar"},
    "Muhajirun": {"tr": "Muhacirler", "ar": "المهاجرون", "de": "Muhadschirun", "fr": "Muhadjirun"},
    "Sunnah": {"tr": "sünnet", "ar": "السنة", "de": "Sunna", "fr": "sunna"},
    "Hadith": {"tr": "hadis", "ar": "حديث", "de": "Hadith", "fr": "hadith"},
    "Quran": {"tr": "Kur'an", "ar": "القرآن", "de": "Koran", "fr": "Coran"},
    "Qur'an": {"tr": "Kur'an", "ar": "القرآن", "de": "Koran", "fr": "Coran"},
    "Sahaba": {"tr": "sahabe", "ar": "الصحابة", "de": "Sahaba", "fr": "Sahaba"},
}

JETON = "\u2063"  # görünmez ayırıcı: jetonların çeviriye takılmasını engeller
JETON_KALIBI = re.compile(rf"{JETON}(\d+){JETON}")


def terimler(hedef_dil: str) -> dict[str, str]:
    """O hedef dil için terim → karşılık haritası (uzun terimler önce denenir)."""
    harita: dict[str, str] = {}
    for ingilizce, diller in TERIM_SOZLUGU.items():
        karsilik = diller.get(hedef_dil)
        if karsilik:
            harita[ingilizce] = karsilik
    return dict(sorted(harita.items(), key=lambda e: -len(e[0])))


def terimleri_koru(metin: str, hedef_dil: str) -> tuple[str, list[str]]:
    """Terimleri jetonla değiştirir; geri koymak için karşılık listesi döner."""
    korunan: list[str] = []
    sonuc = metin
    for ingilizce, karsilik in terimler(hedef_dil).items():
        kalip = re.compile(rf"(?<!\w){re.escape(ingilizce)}(?!\w)")
        parcalar: list[str] = []
        son = 0
        for eslesme in kalip.finditer(sonuc):
            parcalar.append(sonuc[son:eslesme.start()])
            parcalar.append(f"{JETON}{len(korunan)}{JETON}")
            korunan.append(karsilik)
            son = eslesme.end()
        parcalar.append(sonuc[son:])
        sonuc = "".join(parcalar)
    return sonuc, korunan


def terimleri_geri_koy(metin: str, korunan: list[str]) -> str:
    def degistir(eslesme: re.Match[str]) -> str:
        indeks = int(eslesme.group(1))
        return korunan[indeks] if 0 <= indeks < len(korunan) else ""

    return JETON_KALIBI.sub(degistir, metin)


CUMLE_KALIBI = re.compile(r"(?<=[.!?…])\s+(?=[^\s])")


def cumlelere_ayir(metin: str) -> list[str]:
    """Paragrafları koruyarak cümlelere böler (satır sonları ayrı parça)."""
    parcalar: list[str] = []
    for paragraf in re.split(r"\n+", metin):
        paragraf = paragraf.strip()
        if not paragraf:
            continue
        parcalar.extend(c.strip() for c in CUMLE_KALIBI.split(paragraf) if c.strip())
    return parcalar or [metin]


class Cevirmen:
    def __init__(self, onbellek_yolu: Path, bekleme: float, deneme: int, sessiz: bool) -> None:
        self.onbellek_yolu = onbellek_yolu
        self.bekleme = bekleme
        self.deneme = deneme
        self.sessiz = sessiz
        self.onbellek: dict[str, str] = {}
        if onbellek_yolu.exists():
            try:
                self.onbellek = json.loads(onbellek_yolu.read_text(encoding="utf-8"))
            except json.JSONDecodeError:
                print(f"! Önbellek okunamadı, sıfırdan başlanıyor: {onbellek_yolu}")
                self.onbellek = {}
        self._motorlar: dict[str, GoogleTranslator] = {}

    def kaydet(self) -> None:
        gecici = self.onbellek_yolu.with_suffix(".tmp")
        gecici.write_text(json.dumps(self.onbellek, ensure_ascii=False), encoding="utf-8")
        os.replace(gecici, self.onbellek_yolu)

    def _motor(self, hedef_dil: str) -> GoogleTranslator:
        if hedef_dil not in self._motorlar:
            self._motorlar[hedef_dil] = GoogleTranslator(source=KAYNAK_DIL, target=hedef_dil)
        return self._motorlar[hedef_dil]

    def _dene(self, islev, hedef_dil: str):
        """İsteği dener; kota hatasında uzun, ağ hatasında kısa bekleyip tekrar eder."""
        son_hata: Exception | None = None
        for deneme in range(self.deneme):
            try:
                return islev()
            except Exception as hata:  # ağ / kota / bağlantı kopması
                son_hata = hata
                mesaj = str(hata).lower()
                kota = "too many requests" in mesaj or "429" in mesaj
                bekle = min(60, (5 if kota else 2) * (2 ** deneme))
                if not self.sessiz:
                    print(f"  ! {hedef_dil}: {type(hata).__name__} — {bekle}s sonra tekrar "
                          f"({deneme + 1}/{self.deneme})")
                time.sleep(bekle)
        raise RuntimeError(f"Çeviri başarısız ({hedef_dil}): {son_hata}")

    def _toplu_cevir(self, cumleler: list[str], hedef_dil: str) -> list[str]:
        """Cümleleri tek istekte çevirir (translate_batch); olmazsa tek tek dener.
        Google kotası 5 istek/sn olduğu için toplu istek hem hızlı hem güvenli."""
        hazir: list[str] = []
        korunan_listeler: list[list[str]] = []
        for cumle in cumleler:
            korunmus, korunan = terimleri_koru(cumle, hedef_dil)
            hazir.append(korunmus)
            korunan_listeler.append(korunan)

        motor = self._motor(hedef_dil)
        toplu: Any = None
        try:
            toplu = self._dene(lambda: motor.translate_batch(hazir), hedef_dil)
            if not isinstance(toplu, list) or len(toplu) != len(hazir):
                toplu = None
        except RuntimeError:
            toplu = None

        if toplu is None:
            toplu = [self._dene(lambda c=cumle: motor.translate(cumle), hedef_dil) for cumle in hazir]

        if self.bekleme:
            time.sleep(self.bekleme)
        return [terimleri_geri_koy(ceviri or kaynak, korunan)
                for ceviri, kaynak, korunan in zip(toplu, hazir, korunan_listeler)]

    def cevir(self, metin: str, hedef_dil: str) -> str:
        if hedef_dil == KAYNAK_DIL:
            return metin
        anahtar = hashlib.sha1(f"{hedef_dil}|{metin}".encode("utf-8")).hexdigest()
        if anahtar in self.onbellek:
            return self.onbellek[anahtar]

        cumleler = cumlelere_ayir(metin)
        anahtarlar = [hashlib.sha1(f"{hedef_dil}|{c}".encode("utf-8")).hexdigest() for c in cumleler]
        eksikler = [c for c, a in zip(cumleler, anahtarlar) if a not in self.onbellek]
        if eksikler:
            ceviriler = self._toplu_cevir(eksikler, hedef_dil)
            for cumle, ceviri in zip(eksikler, ceviriler):
                self.onbellek[hashlib.sha1(f"{hedef_dil}|{cumle}".encode("utf-8")).hexdigest()] = ceviri

        sonuc = " ".join(self.onbellek[a] for a in anahtarlar).strip()
        self.onbellek[anahtar] = sonuc
        return sonuc


def metin_mi(deger: Any) -> bool:
    return isinstance(deger, str) and bool(re.search(r"[A-Za-z]", deger))


def cevir_deger(cevirmen: Cevirmen, deger: Any, hedef_diller: list[str]) -> Any:
    """Alanı {dil: metin} sözlüğüne çevirir; listeleri paragraf olarak birleştirir."""
    if metin_mi(deger):
        kaynak = deger
    elif isinstance(deger, list) and deger and all(metin_mi(p) for p in deger):
        kaynak = "\n\n".join(deger)
    else:
        return deger

    return {dil: (kaynak if dil == KAYNAK_DIL else cevirmen.cevir(kaynak, dil)) for dil in [KAYNAK_DIL, *hedef_diller]}


def kayit_cevir(cevirmen: Cevirmen, kayit: dict[str, Any], hedef_diller: list[str]) -> dict[str, Any]:
    cikti: dict[str, Any] = {}
    for alan, deger in kayit.items():
        if alan in CEKIRDEK_ALANLAR:
            cikti[alan] = deger
        elif isinstance(deger, dict):
            cikti[alan] = {k: cevir_deger(cevirmen, v, hedef_diller) for k, v in deger.items()}
        elif isinstance(deger, list) and deger and isinstance(deger[0], dict):
            cikti[alan] = [
                {k: cevir_deger(cevirmen, v, hedef_diller) for k, v in alt.items()} for alt in deger
            ]
        else:
            cikti[alan] = cevir_deger(cevirmen, deger, hedef_diller)
    return cikti


def tam_mi(kayit: dict[str, Any], diller: list[str]) -> bool:
    """Kayıtta her çevrilebilir alanın her dili var mı?"""
    def kontrol(deger: Any) -> bool:
        if isinstance(deger, dict):
            if set(deger.keys()) & set(diller) and all(isinstance(deger.get(d), str) and deger.get(d) for d in diller):
                return True
            return all(kontrol(v) for v in deger.values())
        if isinstance(deger, list):
            return all(kontrol(v) for v in deger)
        return True

    return all(kontrol(v) for k, v in kayit.items() if k not in CEKIRDEK_ALANLAR)


def ingilizce_kayitlari_oku(yol: Path) -> list[dict[str, Any]]:
    ham = json.loads(yol.read_text(encoding="utf-8"))
    if isinstance(ham, dict):
        for anahtar in ("sahabeler", "data", "kayitlar", "items", "records"):
            if isinstance(ham.get(anahtar), list):
                return ham[anahtar]
        # {"slug": {...}} biçimi
        if all(isinstance(v, dict) for v in ham.values()):
            kayitlar = []
            for slug, deger in ham.items():
                kayitlar.append({"slug": slug, **deger})
            return kayitlar
        raise SystemExit("JSON içinde kayıt listesi bulunamadı (sahabeler / data / items).")
    if isinstance(ham, list):
        return ham
    raise SystemExit("Beklenmeyen JSON yapısı: kök nesne ne liste ne sözlük.")


def slug_uret(kayit: dict[str, Any], sira: int) -> str:
    slug = kayit.get("slug")
    if isinstance(slug, str) and slug.strip():
        return slug.strip()
    isim = kayit.get("isim") or kayit.get("name") or kayit.get("ad") or f"sahabe-{sira}"
    if isinstance(isim, dict):
        isim = isim.get(KAYNAK_DIL) or next(iter(isim.values()), "")
    temiz = re.sub(r"[^a-z0-9]+", "-", str(isim).lower().replace("ı", "i").replace("ş", "s")
                   .replace("ğ", "g").replace("ü", "u").replace("ö", "o").replace("ç", "c"))
    return temiz.strip("-") or f"sahabe-{sira}"


def cikti_yaz(yol: Path, kayitlar: list[dict[str, Any]]) -> None:
    gecici = yol.with_suffix(".tmp")
    gecici.write_text(json.dumps(kayitlar, ensure_ascii=False, indent=2), encoding="utf-8")
    os.replace(gecici, yol)


def main() -> None:
    ayar = argparse.ArgumentParser(description="İngilizce sahabe verisini çok dilli JSON'a çevirir.")
    ayar.add_argument("--girdi", default="ingilizce_veri.json", help="İngilizce kaynak JSON")
    ayar.add_argument("--cikti", default="cok_dilli_sahabeler.json", help="Çok dilli çıktı JSON")
    ayar.add_argument("--diller", default=",".join(VARSAYILAN_HEDEFLER), help="Hedef diller (virgülle)")
    ayar.add_argument("--onbellek", default="ceviri_onbellek.json", help="Cümle önbelleği")
    ayar.add_argument("--bekleme", type=float, default=0.5, help="İstekler arası bekleme (sn)")
    ayar.add_argument("--deneme", type=int, default=4, help="Cümle başına deneme sayısı")
    ayar.add_argument("--sinir", type=int, default=0, help="Yalnız ilk N kaydı çevir (deneme için)")
    ayar.add_argument("--yeniden", action="store_true", help="Önbelleği ve mevcut çıktıyı yok say")
    ayar.add_argument("--sessiz", action="store_true", help="Ayrıntılı günlük yazma")
    secim = ayar.parse_args()

    girdi = Path(secim.girdi)
    if not girdi.exists():
        sys.exit(
            f"Kaynak dosya bulunamadı: {girdi.resolve()}\n"
            "İngilizce JSON'u bu yol koyun ya da --girdi ile yol verin."
        )

    hedef_diller = [d.strip() for d in secim.diller.split(",") if d.strip() and d.strip() != KAYNAK_DIL]
    cikti_yolu = Path(secim.cikti)
    onbellek_yolu = Path(secim.onbellek)
    if secim.yeniden:
        for yol in (cikti_yolu, onbellek_yolu):
            if yol.exists():
                yol.unlink()

    kaynak_kayitlar = ingilizce_kayitlari_oku(girdi)
    if secim.sinir > 0:
        kaynak_kayitlar = kaynak_kayitlar[: secim.sinir]

    mevcut: dict[str, dict[str, Any]] = {}
    if cikti_yolu.exists():
        try:
            for kayit in json.loads(cikti_yolu.read_text(encoding="utf-8")):
                anahtar = str(kayit.get("slug") or kayit.get("id"))
                mevcut[anahtar] = kayit
        except json.JSONDecodeError:
            print(f"! Mevcut çıktı bozuk, sıfırdan yazılacak: {cikti_yolu}")

    cevirmen = Cevirmen(onbellek_yolu, secim.bekleme, secim.deneme, secim.sessiz)
    sonuc: list[dict[str, Any]] = []
    basarisiz: list[str] = []
    toplam = len(kaynak_kayitlar)
    print(f"{toplam} kayıt · hedef diller: {', '.join(hedef_diller)} · çıktı: {cikti_yolu}")

    for sira, kayit in enumerate(kaynak_kayitlar, start=1):
        slug = slug_uret(kayit, sira)
        kayit = {**kayit, "slug": slug}
        kayit.setdefault("id", sira)

        eski = mevcut.get(slug)
        if eski and not secim.yeniden and tam_mi(eski, hedef_diller):
            if not secim.sessiz:
                print(f"[{sira}/{toplam}] {slug} — zaten tam, atlandı")
            sonuc.append(eski)
            continue

        print(f"[{sira}/{toplam}] {slug} çevriliyor…")
        try:
            cevrilmis = kayit_cevir(cevirmen, kayit, hedef_diller)
        except RuntimeError as hata:
            # Kayıt yarım kaldı: tamamlanan kayıtlar diskte, bu kayıt sonraki turda sürer
            cevirmen.kaydet()
            cikti_yaz(cikti_yolu, sonuc)
            print(f"    ! atlandı: {hata}")
            basarisiz.append(slug)
            continue

        sonuc.append(cevrilmis)
        cikti_yaz(cikti_yolu, sonuc)
        cevirmen.kaydet()
        print(f"    ✓ kaydedildi (toplam {len(sonuc)})")

    cikti_yaz(cikti_yolu, sonuc)
    cevirmen.kaydet()
    print(f"\nBitti: {len(sonuc)}/{toplam} kayıt → {cikti_yolu.resolve()}")
    if basarisiz:
        print("Çevrilemeyen kayıtlar (aynı komutu tekrar çalıştırınca yalnız bunlar denenir):")
        for slug in basarisiz:
            print(f"  · {slug}")
        sys.exit(1)


if __name__ == "__main__":
    main()
