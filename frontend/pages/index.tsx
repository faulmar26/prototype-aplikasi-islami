import { useEffect, useState } from 'react';
import Link from 'next/link';
import PrayerSchedule from '../src/components/PrayerSchedule';
import { useAccount } from '../src/lib/account';

const shortcuts = [
  {
    href: '/quran',
    icon: '۞',
    title: 'Al-Qur’an',
    description: 'Jelajahi surah dan temukan bacaan.',
    tone: 'violet',
  },
  {
    href: '/doa',
    icon: 'د',
    title: 'Doa harian',
    description: 'Kumpulan doa untuk menemani aktivitas.',
    tone: 'amber',
  },
  {
    href: '/prayer',
    icon: '◷',
    title: 'Jadwal salat',
    description: 'Lihat waktu salat sesuai lokasimu.',
    tone: 'green',
  },
];

export default function HomePage() {
  const { user, profile, profileError } = useAccount();
  const [today, setToday] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setToday(new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date()));
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="page-stack">
      <section className="welcome-panel">
        <div>
          <p className="eyebrow">{today || '\u00a0'}</p>
          <h1>{user ? `Assalamu’alaikum, ${user.name}` : 'Assalamu’alaikum'}</h1>
          <p className="welcome-copy">
            Semoga hari ini dipenuhi ketenangan dan keberkahan.
          </p>
        </div>
        <span className="welcome-ornament" aria-hidden="true">☾</span>
      </section>

      <PrayerSchedule compact />

      {user ? (
        <section className="progress-panel">
          <div className="progress-heading">
            <div>
              <p className="eyebrow">Perjalanan ibadahmu</p>
              <h2>Progres harian</h2>
            </div>
            <div className="progress-stats">
              <div><strong>{profile?.streak.current_streak ?? '—'}</strong><span>hari beruntun</span></div>
              <div><strong>{profile?.points ?? '—'}</strong><span>poin terkumpul</span></div>
            </div>
          </div>
          {profileError && <p className="error-message" role="alert">{profileError}</p>}
          {profile && (
            <>
              <div className="mission-list">
                {profile.missions.map((mission) => (
                  <div className="mission-row" key={mission.code}>
                    <span className={`mission-check${mission.completed ? ' mission-check-done' : ''}`}>
                      {mission.completed ? '✓' : '·'}
                    </span>
                    <span className="mission-title">{mission.title}</span>
                    <span className="mission-reward">+{mission.rewardPoints} poin</span>
                    <span className="mission-state">{mission.completed ? 'Selesai' : 'Belum selesai'}</span>
                  </div>
                ))}
              </div>
              <div className="last-read-grid">
                <Link
                  className="last-read-card"
                  href={profile.reading?.last_surah_number
                    ? `/quran?surah=${profile.reading.last_surah_number}`
                    : '/quran'}
                >
                  <span className="eyebrow">Bacaan Al-Qur’an terakhir</span>
                  <strong>{profile.reading?.last_surah_name ?? 'Mulai membaca surah'}</strong>
                  <span>
                    {profile.reading?.last_ayah_number
                      ? `Lanjutkan dari ayat ${profile.reading.last_ayah_number}`
                      : 'Pilih surah yang ingin dibaca'}
                  </span>
                </Link>
                <Link className="last-read-card" href="/doa">
                  <span className="eyebrow">Doa terakhir dibaca</span>
                  <strong>{profile.reading?.last_dua_title ?? 'Temukan doa harian'}</strong>
                  <span>{profile.reading?.last_dua_id ? 'Buka daftar doa' : 'Pilih doa untuk dibaca'}</span>
                </Link>
              </div>
            </>
          )}
        </section>
      ) : (
        <section className="progress-panel guest-progress">
          <div>
            <p className="eyebrow">Simpan perjalananmu</p>
            <h2>Mulai kumpulkan progres ibadah</h2>
            <p>Masuk untuk menyimpan bacaan terakhir, menjaga streak, dan menyelesaikan misi harian.</p>
          </div>
          <Link className="primary-button" href="/login">Masuk atau daftar</Link>
        </section>
      )}

      <section className="section-block">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Temukan ketenangan</p>
            <h2>Jelajahi ibadah</h2>
          </div>
        </div>
        <div className="shortcut-grid">
          {shortcuts.map((shortcut) => (
            <Link
              className={`shortcut-card shortcut-${shortcut.tone}`}
              href={shortcut.href}
              key={shortcut.href}
            >
              <span className="shortcut-icon" aria-hidden="true">{shortcut.icon}</span>
              <span className="shortcut-title">{shortcut.title}</span>
              <span className="shortcut-description">{shortcut.description}</span>
              <span className="shortcut-arrow" aria-hidden="true">↗</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="verse-panel">
        <span className="verse-mark" aria-hidden="true">“</span>
        <div>
          <p className="eyebrow">Pengingat hari ini</p>
          <p className="verse-text">
            “Ingatlah, hanya dengan mengingat Allah hati menjadi tenteram.”
          </p>
          <p className="verse-reference">QS. Ar-Ra’d: 28</p>
        </div>
      </section>
    </div>
  );
}
