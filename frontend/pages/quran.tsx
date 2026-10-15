import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { fetchSurahList, Surah } from '../src/lib/quranApi';

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
        setSurahs(await fetchSurahList(controller.signal));
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
    <div className="quran-page">
      <section className="quran-hero">
        <div>
          <span className="quran-hero-mark" aria-hidden="true">۞</span>
          <div>
            <p className="eyebrow">Baca dan renungkan</p>
            <h1>Al-Qur’an</h1>
          </div>
        </div>
        <label className="quran-search" htmlFor="surah-search">
          <span aria-hidden="true">⌕</span>
          <input
            autoComplete="off"
            id="surah-search"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Nama/nomor surah, atau kata kunci"
            type="search"
            value={query}
          />
        </label>
        <p className="quran-search-hint">Contoh: Yasin, 36, atau Al-Baqarah</p>
      </section>

      <section className="quran-catalog-section">
        <div className="catalog-toolbar">
          <div className="catalog-tabs" aria-label="Daftar Al-Qur’an">
            <span className="catalog-tab catalog-tab-active">Surah</span>
            <span className="catalog-tab catalog-tab-muted">114 surah</span>
          </div>
          <span className="catalog-sort-label">Urutan mushaf ↑</span>
        </div>

        {loading && <p className="status-message">Memuat daftar surah…</p>}
        {error && (
          <div className="error-message" role="alert">
            <p>{error}</p>
            <button className="text-button" onClick={() => window.location.reload()} type="button">Coba lagi</button>
          </div>
        )}
        {!loading && !error && filteredSurahs.length === 0 && (
          <p className="empty-message">Tidak ada surah yang cocok dengan pencarianmu.</p>
        )}
        {!loading && !error && (
          <div className="surah-catalog">
            {filteredSurahs.map((surah) => (
              <Link className="surah-catalog-card" href={`/quran/${surah.number}`} key={surah.number}>
                <span className="surah-catalog-number">{surah.number}</span>
                <span className="surah-catalog-copy">
                  <strong>{surah.englishName}</strong>
                  <span>{surah.englishNameTranslation} · {surah.numberOfAyahs} ayat</span>
                </span>
                <span className="surah-catalog-arabic" dir="rtl" lang="ar">{surah.name}</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
