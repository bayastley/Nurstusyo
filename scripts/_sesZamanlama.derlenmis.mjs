const PENCERE_SN = 0.04;
const SESLI_SN = 0.08;
const SESSIZ_SN = 0.22;
const MIN_SEG_SN = 0.35;
const BAS_ETIKET_SN = 0.35;
const SON_ETIKET_SN = 0.5;
function taramaYap(buffer, ayetSayisi, sureSiniri) {
  const kanal = buffer.getChannelData(0);
  const ornekHz = buffer.sampleRate;
  const pencereBoyu = Math.max(1, Math.round(PENCERE_SN * ornekHz));
  const sinir = typeof sureSiniri === "number" && sureSiniri > 0.5 ? sureSiniri : null;
  const etkiliToplam = sinir ? Math.min(buffer.duration, sinir) : buffer.duration;
  const etkiliUzunluk = sinir ? Math.min(kanal.length, Math.floor(sinir * ornekHz)) : kanal.length;
  const toplam = Math.floor(etkiliUzunluk / pencereBoyu);
  const rmsler = new Float32Array(toplam);
  for (let p = 0; p < toplam; p += 1) {
    let toplamKare = 0;
    const bas = p * pencereBoyu;
    for (let i = 0; i < pencereBoyu; i += 1) {
      const v = kanal[bas + i];
      toplamKare += v * v;
    }
    rmsler[p] = Math.sqrt(toplamKare / pencereBoyu);
  }
  const kenar = Math.max(4, Math.floor(toplam * 0.15));
  const kenarDizi = Array.from(rmsler.slice(0, kenar)).concat(Array.from(rmsler.slice(toplam - kenar)));
  kenarDizi.sort((a, b) => a - b);
  const taban = kenarDizi[Math.floor(kenarDizi.length / 2)] || 5e-3;
  const siraliRms = Array.from(rmsler).sort((a, b) => a - b);
  const yuzdelik = (q) => siraliRms[Math.min(siraliRms.length - 1, Math.floor(siraliRms.length * q))] || 5e-3;
  const q10 = yuzdelik(0.1);
  const q60 = yuzdelik(0.6);
  const esik = q60 > q10 * 3 ? Math.max((q10 + q60) / 2, 5e-4) : Math.max(taban * 2.2, 8e-3, q60 * 0.6);
  if (toplam < 10) {
    const esit = boluEsit(buffer.duration, ayetSayisi);
    return { segments: esit, total: buffer.duration, esik, pencereler: toplam, yontem: "esit-bol" };
  }
  const sesliPencereSay = Math.round(SESLI_SN / PENCERE_SN);
  const sessizPencereSay = Math.round(SESSIZ_SN / PENCERE_SN);
  const sesli = new Array(toplam).fill(false);
  for (let p = 0; p < toplam; p += 1) sesli[p] = rmsler[p] > esik;
  let segments = [];
  let segBas = -1;
  let sessizUstUste = 0;
  const pencereSn = PENCERE_SN;
  const kapan = (bitisPencere) => {
    if (segBas < 0) return;
    const start = Math.max(0, segBas * pencereSn - (segBas === 0 ? 0 : BAS_ETIKET_SN * 0));
    const dur = bitisPencere * pencereSn - start;
    if (dur >= MIN_SEG_SN) segments.push({ start, dur });
    else if (segments.length) {
      const onceki = segments[segments.length - 1];
      onceki.dur = bitisPencere * pencereSn - onceki.start;
    } else if (start >= 0) {
      segments.push({ start, dur });
    }
    segBas = -1;
  };
  for (let p = 0; p < toplam; p += 1) {
    if (sesli[p]) {
      if (segBas < 0) {
        let ileri = 0;
        while (p + ileri < toplam && sesli[p + ileri]) ileri += 1;
        if (ileri >= sesliPencereSay) {
          segBas = p;
          sessizUstUste = 0;
        }
        p += ileri - 1;
        continue;
      }
      sessizUstUste = 0;
    } else if (segBas >= 0) {
      sessizUstUste += 1;
      if (sessizUstUste >= sessizPencereSay) kapan(p - sessizUstUste + 1);
    }
  }
  kapan(toplam);
  const total = etkiliToplam;
  if (segments.length > ayetSayisi && ayetSayisi > 0) {
    segments = birlestir(segments, ayetSayisi);
  } else if (segments.length < ayetSayisi && ayetSayisi > 0) {
    const bosluklar = [];
    let bosBas = -1;
    for (let p = 0; p < toplam; p += 1) {
      if (!sesli[p]) {
        if (bosBas < 0) bosBas = p;
      } else {
        if (bosBas > 0) bosluklar.push({ bas: bosBas, genislik: p - bosBas });
        bosBas = -1;
      }
    }
    const kesilecek = [...bosluklar].sort((a, b) => b.genislik - a.genislik).slice(0, Math.max(0, ayetSayisi - 1));
    if (kesilecek.length === ayetSayisi - 1 && ayetSayisi >= 2) {
      const sinirPencereleri = kesilecek.map((b) => b.bas + Math.floor(b.genislik / 2)).sort((a, b) => a - b);
      const pass2 = [];
      let onceki = 0;
      for (const kesim of sinirPencereleri) {
        pass2.push({ start: onceki * pencereSn, dur: (kesim - onceki) * pencereSn });
        onceki = kesim;
      }
      pass2.push({ start: onceki * pencereSn, dur: (toplam - onceki) * pencereSn });
      if (pass2.every((s) => s.dur >= MIN_SEG_SN)) {
        return { segments: pass2, total, esik, pencereler: toplam, yontem: "sessizlik" };
      }
    }
    const esit = boluEsit(total, ayetSayisi);
    return { segments: esit, total, esik, pencereler: toplam, yontem: "esit-bol" };
  }
  if (segments.length) {
    const son = segments[segments.length - 1];
    const uzatma = Math.min(0.15, Math.max(0, total - (son.start + son.dur)));
    son.dur += uzatma;
  }
  return { segments, total, esik, pencereler: toplam, yontem: "sessizlik" };
}
function birlestir(liste, hedef) {
  const kopya = liste.map((s) => ({ ...s }));
  while (kopya.length > hedef) {
    let enKucukIdx = 0;
    let enKucukUzun = Infinity;
    for (let i = 0; i < kopya.length; i += 1) {
      if (kopya[i].dur < enKucukUzun) {
        enKucukUzun = kopya[i].dur;
        enKucukIdx = i;
      }
    }
    const silinen = kopya[enKucukIdx];
    if (enKucukIdx > 0) {
      const onceki = kopya[enKucukIdx - 1];
      onceki.dur = silinen.start + silinen.dur - onceki.start;
    } else {
      const sonraki = kopya[enKucukIdx + 1];
      sonraki.start = silinen.start;
      sonraki.dur = sonraki.start + sonraki.dur - silinen.start;
    }
    kopya.splice(enKucukIdx, 1);
  }
  return kopya;
}
function boluEsit(total, adet) {
  const bir = total / Math.max(adet, 1);
  return Array.from({ length: adet }, (_, i) => ({ start: bir * i, dur: bir }));
}
function baslangicKaydir(liste, index, yeniBas, total) {
  const kopya = liste.map((s) => ({ ...s }));
  const su = kopya[index];
  if (!su) return kopya;
  const altSinir = index > 0 ? kopya[index - 1].start + 0.2 : 0;
  const ustSinir = index < kopya.length - 1 ? kopya[index + 1].start - 0.2 : total - 0.3;
  const clamped = Math.min(Math.max(yeniBas, Math.max(0, altSinir)), Math.max(0, ustSinir));
  kopya[index - 0].start = clamped;
  if (index > 0) kopya[index - 1].dur = Math.max(0.1, clamped - kopya[index - 1].start);
  if (index < kopya.length - 1) kopya[index].dur = Math.max(0.1, kopya[index + 1].start - clamped);
  else kopya[index].dur = Math.max(0.1, total - clamped);
  return kopya;
}
function nefesAraliklariEkle(liste, ekSaniye) {
  if (ekSaniye <= 0) return liste;
  const sonuc = [];
  let tasima = 0;
  for (let i = 0; i < liste.length; i += 1) {
    if (i > 0) tasima += ekSaniye;
    sonuc.push({ start: liste[i].start + tasima, dur: liste[i].dur });
  }
  return sonuc;
}
function duzelt(liste, total) {
  const sirali = [...liste].sort((a, b) => a.start - b.start);
  for (let i = 0; i < sirali.length; i += 1) {
    sirali[i].start = Math.max(0, sirali[i].start);
    const sonraki = i < sirali.length - 1 ? sirali[i + 1].start : total;
    sirali[i].dur = Math.max(0.1, Math.min(sirali[i].dur, sonraki - sirali[i].start));
  }
  return sirali;
}
export {
  baslangicKaydir,
  duzelt,
  nefesAraliklariEkle,
  taramaYap
};
