export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

export interface Ayah {
  numberInSurah: number;
  text: string;
}

export interface ReadingSurah {
  metadata: Surah;
  arabicAyahs: Ayah[];
  transliterationAyahs: Ayah[];
  translatedAyahs: Ayah[];
  hasBasmala: boolean;
}

interface SurahResponse {
  code: number;
  data: Surah[];
}

interface EditionSurah {
  numberOfAyahs: number;
  ayahs: Ayah[];
}

interface EditionResponse {
  code: number;
  data: EditionSurah[];
}

export const BASMALA_ARABIC = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';

const ARABIC_MARKS = /[\u064b-\u065f\u0670\u06d6-\u06ed\u08d3-\u08ff]/gu;
const BASMALA_NORMALIZED = 'بسم الله الرحمن الرحيم';

function normalizeArabic(text: string) {
  return text
    .normalize('NFKD')
    .replace(ARABIC_MARKS, '')
    .replace(/[ٱأإآ]/gu, 'ا')
    .replace(/\u0640/gu, '');
}

function stripArabicBasmala(text: string) {
  const normalized = normalizeArabic(text).trimStart();
  if (
    !normalized.startsWith(BASMALA_NORMALIZED) ||
    !/^\s/u.test(normalized.slice(BASMALA_NORMALIZED.length))
  ) {
    return text.trim();
  }

  let normalizedLength = 0;
  let originalLength = 0;
  for (const character of text) {
    originalLength += character.length;
    normalizedLength += normalizeArabic(character).length;
    if (normalizedLength >= BASMALA_NORMALIZED.length && /\s/u.test(character)) break;
  }
  return text.slice(originalLength).trimStart();
}

function stripTransliterationBasmala(text: string) {
  return text.replace(/^\s*bismillah[^\s]*\s*/iu, '').trim();
}

function stripTranslationBasmala(text: string) {
  return text
    .replace(
      /^\s*dengan menyebut nama allah yang maha (?:pemurah|pengasih) lagi maha (?:penyayang|pengasih)\.?\s*/iu,
      '',
    )
    .trim();
}

function validateAyahSequence(ayahs: Ayah[], expectedCount: number, edition: string) {
  if (ayahs.length !== expectedCount) {
    throw new Error(`Jumlah ayat pada data ${edition} tidak sesuai dengan jumlah ayat surah.`);
  }
  ayahs.forEach((ayah, index) => {
    if (ayah.numberInSurah !== index + 1) {
      throw new Error(`Urutan ayat pada data ${edition} tidak lengkap atau tidak berurutan.`);
    }
  });
}

export async function fetchSurahList(signal?: AbortSignal): Promise<Surah[]> {
  const response = await fetch('https://api.alquran.cloud/v1/surah', { signal });
  if (!response.ok) throw new Error('Layanan daftar surah tidak dapat dijangkau.');
  const result = (await response.json()) as SurahResponse;
  if (result.code !== 200 || !Array.isArray(result.data) || result.data.length !== 114) {
    throw new Error('Daftar 114 surah tidak tersedia saat ini.');
  }
  return result.data;
}

export async function fetchSurahReading(
  surah: Surah,
  signal?: AbortSignal,
): Promise<ReadingSurah> {
  const response = await fetch(
    `https://api.alquran.cloud/v1/surah/${surah.number}/editions/quran-uthmani,en.transliteration,id.indonesian`,
    { signal },
  );
  if (!response.ok) throw new Error('Ayat surah tidak dapat dimuat saat ini.');
  const result = (await response.json()) as EditionResponse;
  if (
    result.code !== 200 ||
    !Array.isArray(result.data) ||
    result.data.length !== 3 ||
    result.data.some((edition) => !Array.isArray(edition.ayahs))
  ) {
    throw new Error('Data ayat, transliterasi, atau terjemahan surah tidak tersedia.');
  }

  const [arabicEdition, transliterationEdition, translationEdition] = result.data;
  for (const [edition, label] of [
    [arabicEdition, 'Arab'],
    [transliterationEdition, 'transliterasi'],
    [translationEdition, 'terjemahan'],
  ] as const) {
    if (edition.numberOfAyahs !== surah.numberOfAyahs) {
      throw new Error(`Jumlah ayat ${label} tidak cocok dengan data surah.`);
    }
    validateAyahSequence(edition.ayahs, surah.numberOfAyahs, label);
  }

  const hasBasmala = surah.number !== 1 && surah.number !== 9;
  const arabicAyahs = arabicEdition.ayahs.map((ayah, index) => ({
    ...ayah,
    text: hasBasmala && index === 0 ? stripArabicBasmala(ayah.text) : ayah.text.trim(),
  }));
  const transliterationAyahs = transliterationEdition.ayahs.map((ayah, index) => ({
    ...ayah,
    text: hasBasmala && index === 0
      ? stripTransliterationBasmala(ayah.text)
      : ayah.text.trim(),
  }));
  const translatedAyahs = translationEdition.ayahs.map((ayah, index) => ({
    ...ayah,
    text: hasBasmala && index === 0
      ? stripTranslationBasmala(ayah.text)
      : ayah.text.trim(),
  }));

  if (arabicAyahs.some((ayah) => !ayah.text)) {
    throw new Error('Teks ayat pertama tidak valid setelah basmalah dipisahkan.');
  }

  return {
    metadata: surah,
    arabicAyahs,
    transliterationAyahs,
    translatedAyahs,
    hasBasmala,
  };
}
