import { useEffect, useState } from 'react';
import Link from 'next/link';
import PrayerSchedule from '../src/components/PrayerSchedule';

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
  const [today, setToday] = useState('');

  useEffect(() => {
    setToday(new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date()));
  }, []);

  return (
    <div className="page-stack">
      <section className="welcome-panel">
        <div>
          <p className="eyebrow">{today || '\u00a0'}</p>
          <h1>Assalamu’alaikum</h1>
          <p className="welcome-copy">
            Semoga hari ini dipenuhi ketenangan dan keberkahan.
          </p>
        </div>
        <span className="welcome-ornament" aria-hidden="true">☾</span>
      </section>

      <PrayerSchedule compact />

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
