import { useMemo, useState } from 'react';
import Link from 'next/link';
import { DailyDua, dailyDuas } from '../src/data/dailyDuas';
import { useAccount } from '../src/lib/account';

const categories = ['Semua', 'Pagi', 'Makan', 'Aktivitas', 'Ibadah', 'Petang'] as const;
type Category = (typeof categories)[number];

function normalizeSearch(value: string) {
  return value.toLocaleLowerCase('id-ID').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function DuaCard({ dua, lastDuaId }: { dua: DailyDua; lastDuaId?: number | null }) {
  const isLastRead = lastDuaId === dua.id;
  return (
    <Link className="dua-catalog-card" href={`/doa/${dua.id}`}>
      <div className="dua-catalog-topline">
        <span className="dua-category-chip">{dua.category}</span>
        {isLastRead && <span className="dua-last-read">Terakhir dibaca</span>}
      </div>
      <h2>{dua.title}</h2>
      <p className="dua-catalog-arabic" dir="rtl" lang="ar">{dua.arabic}</p>
      <p className="dua-catalog-translation">{dua.translation}</p>
      <span className="dua-card-open">Baca doa <span aria-hidden="true">↗</span></span>
    </Link>
  );
}

export default function DoaPage() {
  const { profile, user } = useAccount();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<Category>('Semua');

  const filteredDuas = useMemo(() => {
    const normalizedQuery = normalizeSearch(query.trim());
    return dailyDuas.filter((dua) => {
      const matchesCategory = category === 'Semua' || dua.category === category;
      const matchesQuery = !normalizedQuery ||
        [dua.title, dua.category, dua.transliteration, dua.translation]
          .some((value) => normalizeSearch(value).includes(normalizedQuery));
      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

  return (
    <div className="dua-page">
      <section className="dua-page-hero">
        <p className="eyebrow">Menemani keseharian</p>
        <h1>Doa harian</h1>
        <p>Kumpulan doa dari Al-Qur’an dan sunah. Pilih satu untuk membaca teks Arab, transliterasi, dan artinya.</p>
        {user && profile?.reading?.last_dua_id && (
          <Link className="dua-resume-link" href={`/doa/${profile.reading.last_dua_id}`}>
            <span>Terakhir dibaca</span>
            <strong>{profile.reading.last_dua_title}</strong>
            <span aria-hidden="true">Lanjutkan →</span>
          </Link>
        )}
      </section>

      <section className="dua-library">
        <label className="quran-search dua-search" htmlFor="dua-search">
          <span aria-hidden="true">⌕</span>
          <input
            id="dua-search"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari doa harian"
            type="search"
            value={query}
          />
        </label>
        <div className="dua-category-tabs" aria-label="Filter kategori doa">
          {categories.map((item) => (
            <button
              aria-pressed={category === item}
              className={`dua-category-tab${category === item ? ' dua-category-active' : ''}`}
              key={item}
              onClick={() => setCategory(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>
        <div className="dua-catalog-grid">
          {filteredDuas.map((dua) => (
            <DuaCard dua={dua} key={dua.id} lastDuaId={profile?.reading?.last_dua_id} />
          ))}
        </div>
        {filteredDuas.length === 0 && (
          <p className="empty-message">Doa tidak ditemukan. Coba kata pencarian atau kategori lain.</p>
        )}
      </section>
    </div>
  );
}
