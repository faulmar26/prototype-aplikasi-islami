import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAccount } from '../src/lib/account';

interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

interface Ayah {
  numberInSurah: number;
  text: string;
}

interface SurahEdition {
  ayahs: Ayah[];
}

interface SurahResponse {
  code: number;
  data: Surah[];
}

interface AyahResponse {
  code: number;
  data: SurahEdition[];
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
  const router = useRouter();
  const { user, profile, saveQuranReading } = useAccount();
  const readerPanelRef = useRef<HTMLElement | null>(null);
  const readerRequest = useRef<AbortController | null>(null);
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [arabicAyahs, setArabicAyahs] = useState<Ayah[]>([]);
  const [translatedAyahs, setTranslatedAyahs] = useState<Ayah[]>([]);
  const [readerLoading, setReaderLoading] = useState(false);
  const [readerError, setReaderError] = useState('');
  const [savedAyah, setSavedAyah] = useState<number | null>(null);
  const [savingAyah, setSavingAyah] = useState<number | null>(null);
  const [completingSurah, setCompletingSurah] = useState(false);
  const [readerProgressMessage, setReaderProgressMessage] = useState('');
  const [readerProgressIsError, setReaderProgressIsError] = useState(false);

  useEffect(() => () => readerRequest.current?.abort(), []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadSurahs() {
      try {
        const response = await fetch('https://api.alquran.cloud/v1/surah', {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error('Layanan daftar surah tidak dapat dijangkau.');
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

  const openSurah = useCallback(async (surah: Surah, startAyah = 1, savePosition = true) => {
    readerRequest.current?.abort();
    const controller = new AbortController();
    readerRequest.current = controller;
    setSelectedSurah(surah);
    setArabicAyahs([]);
    setTranslatedAyahs([]);
    setReaderLoading(true);
    setReaderError('');
    setSavedAyah(null);
    setReaderProgressMessage('');
    setReaderProgressIsError(false);

    try {
      const response = await fetch(
        `https://api.alquran.cloud/v1/surah/${surah.number}/editions/quran-uthmani,id.indonesian`,
        { signal: controller.signal },
      );
      if (!response.ok) throw new Error('Ayat surah tidak dapat dimuat saat ini.');
      const result = (await response.json()) as AyahResponse;
      if (
        result.code !== 200 ||
        !Array.isArray(result.data) ||
        result.data.length < 2 ||
        !Array.isArray(result.data[0]?.ayahs) ||
        !Array.isArray(result.data[1]?.ayahs)
      ) {
        throw new Error('Data ayat atau terjemahan surah tidak tersedia.');
      }
      setArabicAyahs(result.data[0].ayahs);
      setTranslatedAyahs(result.data[1].ayahs);
      if (user && savePosition) {
        try {
          await saveQuranReading({
            surahNumber: surah.number,
            surahName: surah.englishName,
            ayahNumber: startAyah,
          });
          setSavedAyah(startAyah);
          setReaderProgressMessage('Bacaan terakhir disimpan di akunmu.');
          setReaderProgressIsError(false);
        } catch (progressError) {
          setReaderProgressMessage(
            progressError instanceof Error ? progressError.message : 'Posisi bacaan tidak dapat disimpan.',
          );
          setReaderProgressIsError(true);
        }
      } else if (user) {
        setSavedAyah(startAyah);
      }
    } catch (loadError) {
      if (!(loadError instanceof Error && loadError.name === 'AbortError')) {
        setReaderError(loadError instanceof Error ? loadError.message : 'Gagal memuat surah.');
      }
    } finally {
      if (readerRequest.current === controller) {
        readerRequest.current = null;
        setReaderLoading(false);
      }
    }
  }, [saveQuranReading, user]);

  useEffect(() => {
    if (readerLoading || arabicAyahs.length === 0) return;
    const target = savedAyah
      ? document.getElementById(`ayah-${savedAyah}`)
      : readerPanelRef.current;
    target?.scrollIntoView({
      behavior: 'smooth',
      block: savedAyah ? 'center' : 'start',
    });
  }, [arabicAyahs.length, readerLoading, savedAyah]);

  useEffect(() => {
    if (!router.isReady || loading || !surahs.length || !router.query.surah) return;
    const requestedNumber = Number(router.query.surah);
    const requestedSurah = surahs.find((surah) => surah.number === requestedNumber);
    if (requestedSurah && selectedSurah?.number !== requestedNumber) {
      const resumeAyah = profile?.reading?.last_surah_number === requestedNumber
        ? profile.reading.last_ayah_number ?? 1
        : 1;
      const timer = window.setTimeout(() => {
        void openSurah(requestedSurah, resumeAyah, resumeAyah === 1);
      }, 0);
      return () => window.clearTimeout(timer);
    }
  }, [loading, openSurah, profile?.reading?.last_ayah_number, profile?.reading?.last_surah_number, router.isReady, router.query.surah, selectedSurah?.number, surahs]);

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

  async function saveReadingPosition(ayahNumber: number) {
    if (!selectedSurah || !user) return;
    setSavingAyah(ayahNumber);
    setReaderProgressMessage('');
    setReaderProgressIsError(false);
    try {
      await saveQuranReading({
        surahNumber: selectedSurah.number,
        surahName: selectedSurah.englishName,
        ayahNumber,
      });
      setSavedAyah(ayahNumber);
      setReaderProgressMessage(`Posisi bacaan disimpan di ayat ${ayahNumber}.`);
      setReaderProgressIsError(false);
    } catch (saveError) {
      setReaderProgressMessage(saveError instanceof Error ? saveError.message : 'Posisi bacaan gagal disimpan.');
      setReaderProgressIsError(true);
    } finally {
      setSavingAyah(null);
    }
  }

  async function completeSurah() {
    if (!selectedSurah || !user) return;
    setCompletingSurah(true);
    setReaderProgressMessage('');
    setReaderProgressIsError(false);
    try {
      await saveQuranReading({
        surahNumber: selectedSurah.number,
        surahName: selectedSurah.englishName,
        ayahNumber: selectedSurah.numberOfAyahs,
        completed: true,
      });
      setSavedAyah(selectedSurah.numberOfAyahs);
      setReaderProgressMessage('Surah selesai dibaca. Misi harian Al-Qur’an selesai!');
      setReaderProgressIsError(false);
    } catch (saveError) {
      setReaderProgressMessage(saveError instanceof Error ? saveError.message : 'Progres surah gagal disimpan.');
      setReaderProgressIsError(true);
    } finally {
      setCompletingSurah(false);
    }
  }

  return (
    <div className="page-stack">
      <section className="page-intro">
        <p className="eyebrow">Baca dan renungkan</p>
        <h1>Al-Qur’an</h1>
        <p>Temukan surah, baca seluruh ayat beserta terjemahan, dan simpan posisi terakhirmu.</p>
      </section>

      {user && profile?.reading?.last_surah_number && (
        <section className="resume-panel">
          <div>
            <p className="eyebrow">Lanjutkan bacaan</p>
            <h2>{profile.reading.last_surah_name}</h2>
            <p>Terakhir di ayat {profile.reading.last_ayah_number}</p>
          </div>
          <button
            className="primary-button"
            onClick={() => {
              const lastSurah = surahs.find((surah) => surah.number === profile.reading?.last_surah_number);
              if (lastSurah) {
                void openSurah(lastSurah, profile.reading?.last_ayah_number ?? 1, false);
              }
            }}
            type="button"
          >
            Lanjutkan
          </button>
        </section>
      )}

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
            {filteredSurahs.length} surah{query.trim() ? ' ditemukan' : ''}
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
              <button
                aria-expanded={selectedSurah?.number === surah.number}
                className={`surah-row surah-row-button${selectedSurah?.number === surah.number ? ' surah-row-selected' : ''}`}
                key={surah.number}
                onClick={() => void openSurah(surah)}
                type="button"
              >
                <span className="surah-number">{surah.number}</span>
                <span className="surah-details">
                  <span className="surah-title">{surah.englishName}</span>
                  <span className="surah-meta">
                    {surah.englishNameTranslation} <span aria-hidden="true">·</span>{' '}
                    {surah.numberOfAyahs} ayat <span aria-hidden="true">·</span>{' '}
                    {surah.revelationType === 'Meccan' ? 'Makkiyah' : 'Madaniyah'}
                  </span>
                </span>
                <span className="surah-arabic" lang="ar" dir="rtl">{surah.name}</span>
                <span aria-hidden="true" className="surah-open-icon">
                  {selectedSurah?.number === surah.number ? '−' : '+'}
                </span>
              </button>
            ))}
          </div>
        )}
      </section>

      {selectedSurah && (
        <section className="reader-panel" aria-live="polite" ref={readerPanelRef}>
          <div className="reader-header">
            <div>
              <p className="eyebrow">
                Surah {selectedSurah.number} · {selectedSurah.revelationType === 'Meccan' ? 'Makkiyah' : 'Madaniyah'}
              </p>
              <h2>{selectedSurah.englishName}</h2>
              <p>{selectedSurah.englishNameTranslation} · {selectedSurah.numberOfAyahs} ayat</p>
            </div>
            <div className="reader-header-actions">
              <span className="reader-surah-arabic" lang="ar" dir="rtl">{selectedSurah.name}</span>
              <button
                aria-label="Tutup surah"
                className="reader-close"
                onClick={() => {
                  readerRequest.current?.abort();
                  readerRequest.current = null;
                  setReaderLoading(false);
                  setSelectedSurah(null);
                }}
                type="button"
              >
                ×
              </button>
            </div>
          </div>

          {!user && (
            <p className="notice-message reader-notice">
              <Link href="/login">Masuk</Link> untuk menyimpan posisi bacaan dan progres misi.
            </p>
          )}
          {readerProgressMessage && (
            <p className={readerProgressIsError ? 'error-message' : 'success-message'} role={readerProgressIsError ? 'alert' : 'status'}>
              {readerProgressMessage}
            </p>
          )}
          {readerLoading && <p className="status-message">Memuat semua ayat surah…</p>}
          {readerError && (
            <div className="error-message" role="alert">
              <p>{readerError}</p>
              <button className="text-button" onClick={() => void openSurah(selectedSurah)} type="button">Coba lagi</button>
            </div>
          )}
          {!readerLoading && !readerError && arabicAyahs.length > 0 && (
            <>
              <div className="ayah-list">
                {arabicAyahs.map((ayah, index) => {
                  const translation = translatedAyahs[index];
                  return (
                    <article className="ayah-card" id={`ayah-${ayah.numberInSurah}`} key={ayah.numberInSurah}>
                      <div className="ayah-number">Ayat {ayah.numberInSurah}</div>
                      <p className="ayah-arabic" dir="rtl" lang="ar">{ayah.text}</p>
                      <p className="ayah-translation">
                        {translation?.text ?? 'Terjemahan ayat tidak tersedia.'}
                      </p>
                      {user && (
                        <button
                          className={`save-position-button${savedAyah === ayah.numberInSurah ? ' position-saved' : ''}`}
                          disabled={savingAyah !== null}
                          onClick={() => void saveReadingPosition(ayah.numberInSurah)}
                          type="button"
                        >
                          {savingAyah === ayah.numberInSurah
                            ? 'Menyimpan…'
                            : savedAyah === ayah.numberInSurah
                              ? '✓ Posisi tersimpan'
                              : 'Simpan posisi di ayat ini'}
                        </button>
                      )}
                    </article>
                  );
                })}
              </div>
              {user ? (
                <button
                  className="primary-button complete-surah-button"
                  disabled={completingSurah}
                  onClick={() => void completeSurah()}
                  type="button"
                >
                  {completingSurah ? 'Menyimpan…' : 'Tandai surah selesai dibaca'}
                </button>
              ) : (
                <Link className="primary-button complete-surah-button" href="/login">
                  Masuk untuk menyelesaikan misi
                </Link>
              )}
            </>
          )}
        </section>
      )}
    </div>
  );
}
