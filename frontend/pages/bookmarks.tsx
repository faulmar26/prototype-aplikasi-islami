import { FormEvent, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAccount } from '../src/lib/account';

export default function BookmarksPage() {
  const {
    user,
    bookmarks,
    bookmarksError,
    createBookmarkCategory,
    deleteBookmark,
    deleteBookmarkCategory,
  } = useAccount();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | 'all'>('all');
  const [categoryName, setCategoryName] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const visibleBookmarks = useMemo(() => (
    selectedCategoryId === 'all'
      ? bookmarks.bookmarks
      : bookmarks.bookmarks.filter((item) => item.categoryId === selectedCategoryId)
  ), [bookmarks.bookmarks, selectedCategoryId]);

  async function addCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    try {
      await createBookmarkCategory({ name: categoryName.trim() });
      setCategoryName('');
      setMessage('Kategori baru berhasil dibuat.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Kategori gagal dibuat.');
    } finally {
      setSaving(false);
    }
  }

  async function removeBookmark(id: number) {
    setError('');
    try {
      await deleteBookmark(id);
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : 'Bookmark gagal dihapus.');
    }
  }

  async function removeCategory(id: number) {
    const category = bookmarks.categories.find((item) => item.id === id);
    if (!category || !window.confirm(`Hapus kategori "${category.name}" beserta seluruh bookmark di dalamnya?`)) return;
    setError('');
    try {
      await deleteBookmarkCategory(id);
      if (selectedCategoryId === id) setSelectedCategoryId('all');
      setMessage('Kategori dan bookmark di dalamnya berhasil dihapus.');
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : 'Kategori gagal dihapus.');
    }
  }

  if (!user) {
    return (
      <section className="bookmarks-page">
        <div className="bookmarks-hero">
          <p className="eyebrow">Simpan bacaan pilihan</p>
          <h1>Bookmark</h1>
          <p>Masuk untuk menyimpan ayat dan doa ke dalam koleksi pribadimu.</p>
          <Link className="primary-button" href="/login">Masuk atau daftar</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="bookmarks-page">
      <header className="bookmarks-hero">
        <p className="eyebrow">Koleksi pribadimu</p>
        <h1>Bookmark</h1>
        <p>Bookmark terpisah dari bacaan terakhir. Atur ayat dan doa dalam kategori bawaan atau kategori buatanmu.</p>
      </header>

      <section className="bookmark-category-manager" aria-labelledby="bookmark-category-title">
        <div>
          <p className="eyebrow">Atur koleksi</p>
          <h2 id="bookmark-category-title">Kategori bookmark</h2>
        </div>
        <form className="bookmark-category-form" onSubmit={(event) => void addCategory(event)}>
          <label className="visually-hidden" htmlFor="bookmark-category-name">Nama kategori baru</label>
          <input
            autoComplete="off"
            id="bookmark-category-name"
            maxLength={50}
            onChange={(event) => setCategoryName(event.target.value)}
            placeholder="Contoh: Hafalan pekan ini"
            required
            value={categoryName}
          />
          <button className="primary-button" disabled={saving} type="submit">
            {saving ? 'Menyimpan…' : 'Buat kategori'}
          </button>
        </form>
        <div className="bookmark-category-list">
          {bookmarks.categories.map((category) => (
            <div className="bookmark-category-item" key={category.id}>
              <button
                aria-pressed={selectedCategoryId === category.id}
                className={`bookmark-category-filter${selectedCategoryId === category.id ? ' bookmark-category-filter-active' : ''}`}
                onClick={() => setSelectedCategoryId(category.id)}
                type="button"
              >
                {category.name}
                <span>{bookmarks.bookmarks.filter((item) => item.categoryId === category.id).length}</span>
              </button>
              {category.type === 'custom' && (
                <button
                  aria-label={`Hapus kategori ${category.name} dan bookmark di dalamnya`}
                  className="bookmark-category-delete"
                  onClick={() => void removeCategory(category.id)}
                  type="button"
                >
                  Hapus
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {(bookmarksError || error) && (
        <p className="error-message" role="alert">{error || bookmarksError}</p>
      )}
      {message && <p className="success-message" role="status">{message}</p>}

      <section className="bookmark-items-section" aria-labelledby="bookmark-items-title">
        <div className="bookmark-items-heading">
          <h2 id="bookmark-items-title">
            {selectedCategoryId === 'all'
              ? 'Semua bookmark'
              : bookmarks.categories.find((item) => item.id === selectedCategoryId)?.name ?? 'Bookmark'}
          </h2>
          <button
            aria-pressed={selectedCategoryId === 'all'}
            className="bookmark-show-all"
            onClick={() => setSelectedCategoryId('all')}
            type="button"
          >
            Tampilkan semua
          </button>
        </div>

        {visibleBookmarks.length ? (
          <div className="bookmark-items">
            {visibleBookmarks.map((bookmark) => {
              const href = bookmark.contentType === 'quran' && bookmark.surahNumber
                ? `/quran/${bookmark.surahNumber}${bookmark.ayahNumber ? `#ayah-${bookmark.ayahNumber}` : ''}`
                : bookmark.duaId
                  ? `/doa/${bookmark.duaId}`
                  : '/doa';
              return (
                <article className="bookmark-item" key={bookmark.id}>
                  <Link href={href}>
                    <span className="bookmark-item-category">{bookmark.categoryName}</span>
                    <strong>{bookmark.title}</strong>
                    <span>{bookmark.contentType === 'quran' ? 'Al-Qur’an' : 'Doa harian'}</span>
                  </Link>
                  <button
                    aria-label={`Hapus bookmark ${bookmark.title}`}
                    className="bookmark-remove"
                    onClick={() => void removeBookmark(bookmark.id)}
                    type="button"
                  >
                    Hapus
                  </button>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="empty-message">Belum ada bookmark dalam kategori ini. Simpan ayat atau doa saat membacanya.</p>
        )}
      </section>
    </section>
  );
}
