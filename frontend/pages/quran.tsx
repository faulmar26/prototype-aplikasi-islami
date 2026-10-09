import { useEffect, useMemo, useState } from 'react';

interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

interface SurahResponse {
  code: number;
  data: Surah[];
  status: string;
}

function normalizeSearch(value: string) {
  return value
    .toLocaleLowerCase('id-ID')
    .normalize('NFD')
    .replace(/[\u0300-\u036f\u0610-\u061a\u064b-\u065f\u0670\u06d6-\u06ed]/g, '')
    .replace(/[^a-z0-9\u0621-\u064a]/g, '');
}

function normalizeTransliteration(value: string) {
  return value.replace(/^al/, '').replace(/([a-z])\1+/g, '$1').replace(/h+$/g, '');
}

export default function QuranPage() {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    async function loadSurahs() {
      try {
        const response = await fetch('https://api.alquran.cloud/v1/surah', {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error('Layanan daftar surah tidak dapat dijangkau.');
        }

        const result = (await response.json()) as SurahResponse;
        if (result.code !== 200 || !Array.isArray(result.data)) {
          throw new Error('Data daftar surah tidak tersedia saat ini.');
        }
        setSurahs(result.data);
      } catch (loadError) {
        if (loadError instanceof Error && loadError.name !== 'AbortError') {
          setError(loadError.message);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadSurahs();
    return () => controller.abort();
  }, []);

  const filteredSurahs = useMemo(() => {
    const normalizedQuery = normalizeSearch(query.trim());
    if (!normalizedQuery) return surahs;
    const transliterationQuery = normalizeTransliteration(normalizedQuery);

    return surahs.filter((surah) =>
      [
        surah.number.toString(),
        surah.name,
        surah.englishName,
        surah.englishNameTranslation,
      ].some((value) => {
        const normalizedValue = normalizeSearch(value);
        return (
          normalizedValue.includes(normalizedQuery) ||
          (/^[a-z]+$/.test(normalizedQuery) &&
            normalizeTransliteration(normalizedValue).includes(transliterationQuery))
        );
      }),
    );
  }, [query, surahs]);

  return (
    <div className="page-stack">
      <section className="page-intro">
        <p className="eyebrow">Baca dan renungkan</p>
        <h1>Al-Qur’an</h1>
        <p>Temukan surah berdasarkan nama, arti, atau nomor surah.</p>
      </section>

      <section className="content-panel quran-panel">
        <label className="search-label" htmlFor="surah-search">Cari surah</label>
        <div className="search-field">
          <span aria-hidden="true">⌕</span>
          <input
            autoComplete="off"
            id="surah-search"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Contoh: Al-Fatihah atau 1"
            type="search"
            value={query}
          />
        </div>
        {!loading && !error && (
          <p className="result-count">
            {filteredSurahs.length} surah{filteredSurahs.length === 1 ? '' : ''}
            {query.trim() ? ' ditemukan' : ''}
          </p>
        )}
        {loading && <p className="status-message">Memuat daftar surah…</p>}
        {error && (
          <div className="error-message" role="alert">
            <p>{error}</p>
            <button className="text-button" onClick={() => window.location.reload()} type="button">
              Coba lagi
            </button>
          </div>
        )}
        {!loading && !error && filteredSurahs.length === 0 && (
          <p className="empty-message">Tidak ada surah yang cocok dengan pencarianmu.</p>
        )}
        {!loading && !error && filteredSurahs.length > 0 && (
          <div className="surah-list">
            {filteredSurahs.map((surah) => (
              <article className="surah-row" key={surah.number}>
                <span className="surah-number">{surah.number}</span>
                <div className="surah-details">
                  <h2>{surah.englishName}</h2>
                  <p>
                    {surah.englishNameTranslation} <span aria-hidden="true">·</span>{' '}
                    {surah.numberOfAyahs} ayat <span aria-hidden="true">·</span>{' '}
                    {surah.revelationType === 'Meccan' ? 'Makkiyah' : 'Madaniyah'}
                  </p>
                </div>
                <p className="surah-arabic" lang="ar" dir="rtl">{surah.name}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
