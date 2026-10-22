import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAccount } from '../../src/lib/account';
import {
  Ayah,
  BASMALA_ARABIC,
  fetchSurahList,
  fetchSurahReading,
  getIndonesianSurahTranslation,
  ReadingSurah,
  Surah,
} from '../../src/lib/quranApi';

interface ReadingPosition {
  ayahNumber: number;
  surahNumber: number;
}

export default function SurahReadingPage() {
  const router = useRouter();
  const {
    user,
    profile,
    bookmarks,
    createBookmark,
    deleteBookmark,
    saveQuranReading,
  } = useAccount();
  const readerRef = useRef<HTMLElement | null>(null);
  const [surah, setSurah] = useState<Surah | null>(null);
  const [reading, setReading] = useState<ReadingSurah | null>(null);
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bookmarkActionAyah, setBookmarkActionAyah] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [bookmarkMessage, setBookmarkMessage] = useState('');
  const [messageIsError, setMessageIsError] = useState(false);
  const [savedPosition, setSavedPosition] = useState<ReadingPosition | null>(null);
  const [targetAyah, setTargetAyah] = useState('1');
  const [selectedBookmarkCategoryId, setSelectedBookmarkCategoryId] = useState<number | null>(null);

  const currentNumber = useMemo(() => {
    const number = Number(router.query.number);
    return Number.isInteger(number) && number >= 1 && number <= 114 ? number : null;
  }, [router.query.number]);

  useEffect(() => {
    if (!router.isReady) return;
    if (!currentNumber) {
      setError('Nomor surah tidak valid.');
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    async function loadSurah() {
      setLoading(true);
      setError('');
      setReading(null);
      try {
        const surahList = await fetchSurahList(controller.signal);
        const selected = surahList.find((item) => item.number === currentNumber);
        if (!selected) throw new Error('Surah tidak ditemukan.');
        const surahReading = await fetchSurahReading(selected, controller.signal);
        if (controller.signal.aborted) return;
        setSurahs(surahList);
        setSurah(selected);
        setReading(surahReading);
      } catch (loadError) {
        if (loadError instanceof Error && loadError.name !== 'AbortError') {
          setError(loadError.message);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void loadSurah();
    return () => controller.abort();
  }, [currentNumber, router.isReady]);

  useEffect(() => {
    if (!reading || !surah) return;
    const saved = profile?.reading;
    const isSavedSurah = saved?.last_surah_number === surah.number;
    const ayahNumber = isSavedSurah ? saved.last_ayah_number ?? 1 : 1;
    const position = { surahNumber: surah.number, ayahNumber };
    setSavedPosition(isSavedSurah ? position : null);
    setTargetAyah(String(ayahNumber));
    if (isSavedSurah) {
      const timer = window.setTimeout(() => {
        document.getElementById(`ayah-${ayahNumber}`)?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 0);
      return () => window.clearTimeout(timer);
    }
  }, [profile?.reading?.last_ayah_number, profile?.reading?.last_surah_number, reading, surah]);

  const savePosition = useCallback(async (ayahNumber: number) => {
    if (!surah) return;
    setSaving(true);
    setMessage('');
    setMessageIsError(false);
    try {
      await saveQuranReading({
        surahNumber: surah.number,
        surahName: surah.englishName,
        ayahNumber,
      });
      setSavedPosition({ surahNumber: surah.number, ayahNumber });
      setTargetAyah(String(ayahNumber));
      setMessage(`Posisi bacaan disimpan di ayat ${ayahNumber}.`);
    } catch (saveError) {
      setMessage(saveError instanceof Error ? saveError.message : 'Posisi bacaan gagal disimpan.');
      setMessageIsError(true);
    } finally {
      setSaving(false);
    }
  }, [saveQuranReading, surah]);

  function selectAyah(value: string) {
    setTargetAyah(value);
    document.getElementById(`ayah-${value}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  async function markSurahComplete() {
    if (!surah) return;
    setSaving(true);
    setMessage('');
    setMessageIsError(false);
    try {
      await saveQuranReading({
        surahNumber: surah.number,
        surahName: surah.englishName,
        ayahNumber: surah.numberOfAyahs,
        completed: true,
      });
      setSavedPosition({ surahNumber: surah.number, ayahNumber: surah.numberOfAyahs });
      setTargetAyah(String(surah.numberOfAyahs));
      setMessage('Surah selesai dibaca. Misi harian Al-Qur’an selesai!');
    } catch (saveError) {
      setMessage(saveError instanceof Error ? saveError.message : 'Progres surah gagal disimpan.');
      setMessageIsError(true);
    } finally {
      setSaving(false);
    }
  }

  const previousSurah = surah ? surahs.find((item) => item.number === surah.number - 1) : null;
  const nextSurah = surah ? surahs.find((item) => item.number === surah.number + 1) : null;
  const defaultBookmarkCategory = bookmarks.categories.find((category) => category.type === 'quran');
  const bookmarkCategoryId = selectedBookmarkCategoryId ??
    defaultBookmarkCategory?.id ??
    bookmarks.categories.find((category) => category.type === 'custom')?.id ??
    null;
  const bookmarkedAyahs = useMemo(() => new Set(
    bookmarks.bookmarks
      .filter((item) =>
        item.categoryId === bookmarkCategoryId &&
        item.contentType === 'quran' &&
        item.surahNumber === surah?.number,
      )
      .map((item) => item.ayahNumber),
  ), [bookmarkCategoryId, bookmarks.bookmarks, surah?.number]);

  async function toggleAyahBookmark(ayahNumber: number) {
    if (!surah || !bookmarkCategoryId) return;
    const existing = bookmarks.bookmarks.find((item) =>
      item.categoryId === bookmarkCategoryId &&
      item.contentType === 'quran' &&
      item.surahNumber === surah.number &&
      item.ayahNumber === ayahNumber,
    );
    setBookmarkActionAyah(ayahNumber);
    setBookmarkMessage('');
    try {
      if (existing) {
        await deleteBookmark(existing.id);
        setBookmarkMessage(`Bookmark ayat ${ayahNumber} dihapus.`);
      } else {
        await createBookmark({
          categoryId: bookmarkCategoryId,
          contentType: 'quran',
          surahNumber: surah.number,
          surahName: surah.englishName,
          ayahNumber,
        });
        setBookmarkMessage(`Ayat ${ayahNumber} ditambahkan ke bookmark.`);
      }
    } catch (bookmarkError) {
      setBookmarkMessage(bookmarkError instanceof Error ? bookmarkError.message : 'Bookmark gagal disimpan.');
    } finally {
      setBookmarkActionAyah(null);
    }
  }

  return (
    <div className="quran-reading-page">
      <nav className="quran-reader-toolbar" aria-label="Navigasi bacaan">
        <Link className="reader-list-link" href="/quran"><span aria-hidden="true">▦</span> Daftar Surah</Link>
        <div className="reader-selectors">
          <label className="reader-select-wrap">
            <span className="visually-hidden">Pilih surah</span>
            <select
              aria-label="Pilih surah"
              onChange={(event) => void router.push(`/quran/${event.target.value}`)}
              value={surah?.number ?? ''}
            >
              {!surah && <option value="">Pilih surah</option>}
              {surahs.map((item) => (
                <option key={item.number} value={item.number}>{item.englishName}</option>
              ))}
            </select>
          </label>
          {reading && (
            <label className="reader-select-wrap reader-ayah-select">
              <span className="visually-hidden">Pilih ayat</span>
              <select
                aria-label="Pilih ayat"
                onChange={(event) => selectAyah(event.target.value)}
                value={targetAyah}
              >
                {reading.arabicAyahs.map((ayah) => (
                  <option key={ayah.numberInSurah} value={ayah.numberInSurah}>
                    Ayat {ayah.numberInSurah}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
        {nextSurah ? (
          <Link className="reader-next-link" href={`/quran/${nextSurah.number}`}>
            {nextSurah.englishName} <span aria-hidden="true">›</span>
          </Link>
        ) : <span className="reader-next-link reader-end-label">Akhir Al-Qur’an</span>}
      </nav>

      {loading && <p className="status-message reading-status">Memuat seluruh ayat surah…</p>}
      {error && (
        <div className="error-message reading-status" role="alert">
          <p>{error}</p>
          <Link className="text-button" href="/quran">Kembali ke daftar surah</Link>
        </div>
      )}

      {surah && reading && (
        <main className="surah-reader" ref={readerRef}>
          <header className="surah-reader-heading">
            <p className="eyebrow">
              Surah {surah.revelationType === 'Meccan' ? 'Makkiyah' : 'Madaniyah'} · {reading.arabicAyahs.length} ayat
            </p>
            <p className="surah-reader-arabic-name" dir="rtl" lang="ar">{surah.name}</p>
            <h1>{surah.englishName}</h1>
            <p className="surah-reader-translation">{getIndonesianSurahTranslation(surah.number)}</p>
          </header>

          {user ? (
            <p className="reader-session-note">
              {savedPosition?.surahNumber === surah.number
                ? `Bacaan terakhir tersimpan di ayat ${savedPosition.ayahNumber}.`
                : 'Posisi bacaan pertama akan disimpan ke akunmu.'}
            </p>
          ) : (
            <p className="reader-session-note">
              <Link href="/login">Masuk</Link> untuk menyimpan posisi bacaanmu.
            </p>
          )}
          {message && (
            <p className={messageIsError ? 'error-message' : 'success-message'} role={messageIsError ? 'alert' : 'status'}>
              {message}
            </p>
          )}
          {user && (
            <div className="bookmark-action-bar">
              <label>
                <span>Simpan bookmark ke</span>
                <select
                  aria-label="Kategori bookmark ayat"
                  onChange={(event) => setSelectedBookmarkCategoryId(Number(event.target.value))}
                  value={bookmarkCategoryId ?? ''}
                >
                  {bookmarks.categories
                    .filter((category) => category.type === 'quran' || category.type === 'custom')
                    .map((category) => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                </select>
              </label>
              <Link href="/bookmarks">Kelola kategori</Link>
            </div>
          )}
          {bookmarkMessage && (
            <p className="bookmark-feedback" role="status">{bookmarkMessage}</p>
          )}

          {reading.hasBasmala && (
            <div className="basmala-display" lang="ar" dir="rtl" aria-label="Bismillahirrahmanirrahim">
              {BASMALA_ARABIC}
            </div>
          )}

          <div className="reader-ayah-list">
            {reading.arabicAyahs.map((ayah: Ayah, index) => {
              const transliteration = reading.transliterationAyahs[index];
              const translation = reading.translatedAyahs[index];
              return (
                <article className="reader-ayah" id={`ayah-${ayah.numberInSurah}`} key={ayah.numberInSurah}>
                  <div className="reader-ayah-meta">
                    <span className="reader-ayah-badge">{ayah.numberInSurah}</span>
                    {user && (
                      <div className="reader-ayah-actions">
                        <button
                          aria-label={`Simpan posisi bacaan di ayat ${ayah.numberInSurah}`}
                          className={`reader-save-position${savedPosition?.surahNumber === surah.number && savedPosition.ayahNumber === ayah.numberInSurah ? ' reader-position-saved' : ''}`}
                          disabled={saving}
                          onClick={() => void savePosition(ayah.numberInSurah)}
                          type="button"
                        >
                          {savedPosition?.surahNumber === surah.number && savedPosition.ayahNumber === ayah.numberInSurah
                            ? '✓ Posisi tersimpan'
                            : 'Simpan posisi'}
                        </button>
                        {bookmarkCategoryId && (
                          <button
                            aria-label={`${bookmarkedAyahs.has(ayah.numberInSurah) ? 'Hapus bookmark' : 'Bookmark'} ayat ${ayah.numberInSurah}`}
                            aria-pressed={bookmarkedAyahs.has(ayah.numberInSurah)}
                            className="reader-bookmark-button"
                            disabled={bookmarkActionAyah === ayah.numberInSurah}
                            onClick={() => void toggleAyahBookmark(ayah.numberInSurah)}
                            type="button"
                          >
                            {bookmarkedAyahs.has(ayah.numberInSurah) ? '★ Bookmark' : '☆ Bookmark'}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="reader-ayah-content">
                    <p className="reader-ayah-arabic" dir="rtl" lang="ar">{ayah.text}</p>
                    <p className="reader-ayah-transliteration">{transliteration?.text}</p>
                    <p className="reader-ayah-translation">
                      {translation?.text ?? 'Terjemahan ayat tidak tersedia.'}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>

          {user && (
            <button className="primary-button surah-complete-button" disabled={saving} onClick={() => void markSurahComplete()} type="button">
              {saving ? 'Menyimpan…' : 'Tandai surah selesai dibaca'}
            </button>
          )}

          <nav className="reader-bottom-nav" aria-label="Surah sebelum dan sesudah">
            {previousSurah
              ? <Link href={`/quran/${previousSurah.number}`}>‹ {previousSurah.englishName}</Link>
              : <span />}
            {nextSurah
              ? <Link href={`/quran/${nextSurah.number}`}>{nextSurah.englishName} ›</Link>
              : <Link href="/quran">Kembali ke daftar surah</Link>}
          </nav>
        </main>
      )}
    </div>
  );
}
