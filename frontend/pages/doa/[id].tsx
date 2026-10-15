import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { dailyDuas } from '../../src/data/dailyDuas';
import { useAccount } from '../../src/lib/account';

export default function DuaDetailPage() {
  const router = useRouter();
  const { user, profile, saveDuaReading } = useAccount();
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; error: boolean } | null>(null);
  const id = Number(router.query.id);
  const dua = dailyDuas.find((item) => item.id === id);

  async function markDuaRead() {
    if (!dua) return;
    setSaving(true);
    setFeedback(null);
    try {
      await saveDuaReading({ duaId: dua.id, duaTitle: dua.title });
      setFeedback({ message: 'Doa tersimpan. Misi membaca doa hari ini selesai!', error: false });
    } catch (saveError) {
      setFeedback({
        message: saveError instanceof Error ? saveError.message : 'Progres doa gagal disimpan.',
        error: true,
      });
    } finally {
      setSaving(false);
    }
  }

  if (!router.isReady) return <p className="status-message">Memuat doa…</p>;
  if (!dua) {
    return (
      <section className="dua-detail-not-found">
        <h1>Doa tidak ditemukan</h1>
        <Link className="primary-button" href="/doa">Kembali ke doa harian</Link>
      </section>
    );
  }

  const currentIndex = dailyDuas.findIndex((item) => item.id === dua.id);
  const previousDua = dailyDuas[currentIndex - 1];
  const nextDua = dailyDuas[currentIndex + 1];
  const lastRead = profile?.reading?.last_dua_id === dua.id;

  return (
    <div className="dua-detail-page">
      <Link className="dua-back-link" href="/doa">‹ Semua doa</Link>
      <article className="dua-detail-card">
        <div className="dua-detail-heading">
          <span className="dua-category-chip">{dua.category}</span>
          <p className="eyebrow">Doa harian pilihan</p>
          <h1>{dua.title}</h1>
          <p className="dua-detail-reference">{dua.source}</p>
        </div>
        <div className="dua-detail-arabic-wrap">
          <p className="dua-detail-arabic" dir="rtl" lang="ar">{dua.arabic}</p>
        </div>
        <section className="dua-detail-section">
          <p className="eyebrow">Transliterasi</p>
          <p className="dua-detail-transliteration">{dua.transliteration}</p>
        </section>
        <section className="dua-detail-section">
          <p className="eyebrow">Terjemahan</p>
          <p className="dua-detail-translation">{dua.translation}</p>
        </section>
        {feedback && (
          <p className={feedback.error ? 'error-message' : 'success-message'} role={feedback.error ? 'alert' : 'status'}>
            {feedback.message}
          </p>
        )}
        {user ? (
          <button
            className="primary-button dua-mark-read"
            disabled={saving}
            onClick={() => void markDuaRead()}
            type="button"
          >
            {saving ? 'Menyimpan…' : lastRead ? '✓ Doa terakhir dibaca' : 'Tandai sudah dibaca'}
          </button>
        ) : (
          <Link className="primary-button dua-mark-read" href="/login">Masuk untuk menyimpan bacaan</Link>
        )}
      </article>
      <nav className="dua-detail-pagination" aria-label="Doa sebelumnya dan selanjutnya">
        {previousDua
          ? <Link href={`/doa/${previousDua.id}`}>‹ {previousDua.title}</Link>
          : <span />}
        {nextDua
          ? <Link href={`/doa/${nextDua.id}`}>{nextDua.title} ›</Link>
          : <Link href="/doa">Kembali ke daftar doa</Link>}
      </nav>
    </div>
  );
}
