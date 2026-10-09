import { useState } from 'react';
import Link from 'next/link';
import { dailyDuas } from '../src/data/dailyDuas';
import { useAccount } from '../src/lib/account';

export default function DoaPage() {
  const { user, profile, saveDuaReading } = useAccount();
  const [savingDuaId, setSavingDuaId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ duaId: number; message: string; error: boolean } | null>(null);

  async function markDuaRead(duaId: number, duaTitle: string) {
    setSavingDuaId(duaId);
    setFeedback(null);
    try {
      await saveDuaReading({ duaId, duaTitle });
      setFeedback({ duaId, message: 'Doa tersimpan. Misi membaca doa hari ini selesai!', error: false });
    } catch (saveError) {
      setFeedback({
        duaId,
        message: saveError instanceof Error ? saveError.message : 'Progres doa gagal disimpan.',
        error: true,
      });
    } finally {
      setSavingDuaId(null);
    }
  }

  return (
    <div className="page-stack">
      <section className="page-intro">
        <p className="eyebrow">Dalam setiap aktivitas</p>
        <h1>Doa harian</h1>
        <p>Doa pilihan untuk mengawali dan mengakhiri hari dengan mengingat Allah.</p>
      </section>

      <div className="dua-list">
        {dailyDuas.map((dua, index) => (
          <article className="dua-card" key={dua.title}>
            <div className="dua-heading">
              <span className="dua-index">{String(index + 1).padStart(2, '0')}</span>
              <h2>{dua.title}</h2>
            </div>
            <p className="dua-arabic" dir="rtl" lang="ar">{dua.arabic}</p>
            <div className="dua-translation">
              <p className="eyebrow">Transliterasi</p>
              <p className="transliteration">{dua.transliteration}</p>
            </div>
            <div className="dua-translation">
              <p className="eyebrow">Terjemahan</p>
              <p>{dua.translation}</p>
            </div>
            {dua.source && <p className="dua-source">{dua.source}</p>}
            {user ? (
              <button
                className={`dua-read-button${profile?.reading?.last_dua_id === index + 1 ? ' dua-read-saved' : ''}`}
                disabled={savingDuaId !== null}
                onClick={() => void markDuaRead(index + 1, dua.title)}
                type="button"
              >
                {savingDuaId === index + 1
                  ? 'Menyimpan…'
                  : profile?.reading?.last_dua_id === index + 1
                    ? '✓ Terakhir dibaca'
                    : 'Tandai sudah dibaca'}
              </button>
            ) : (
              <Link className="dua-read-button" href="/login">Masuk untuk menyimpan bacaan</Link>
            )}
            {feedback?.duaId === index + 1 && (
              <p className={feedback.error ? 'error-message' : 'success-message'} role="status">
                {feedback.message}
              </p>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
