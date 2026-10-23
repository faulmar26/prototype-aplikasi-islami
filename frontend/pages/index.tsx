import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FeatureIcon } from '../src/components/FeatureIcon';
import PrayerSchedule from '../src/components/PrayerSchedule';
import { useAccount } from '../src/lib/account';

const shortcuts = [
  {
    href: '/quran',
    icon: 'quran',
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
    icon: 'prayer',
    title: 'Jadwal salat',
    description: 'Lihat waktu salat sesuai lokasimu.',
    tone: 'green',
  },
];

const dailyReminders = [
  {
    text: 'Ingatlah, hanya dengan mengingat Allah hati menjadi tenteram.',
    reference: 'QS. Ar-Ra’d: 28',
  },
  {
    text: 'Sesungguhnya bersama kesulitan ada kemudahan.',
    reference: 'QS. Ash-Sharh: 6',
  },
  {
    text: 'Allah tidak membebani seseorang melainkan sesuai dengan kesanggupannya.',
    reference: 'QS. Al-Baqarah: 286',
  },
  {
    text: 'Barang siapa bertakwa kepada Allah, niscaya Dia akan membukakan jalan keluar baginya.',
    reference: 'QS. At-Talaq: 2',
  },
  {
    text: 'Sungguh, Allah beserta orang-orang yang sabar.',
    reference: 'QS. Al-Baqarah: 153',
  },
];

export default function HomePage() {
  const { user, profile, profileError } = useAccount();
  const [today, setToday] = useState('');
  const [reminderIndex, setReminderIndex] = useState<number | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setToday(new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date()));
    }, 0);
    const reminderTimer = window.setTimeout(() => {
      const previousValue = window.sessionStorage.getItem('arah-reminder-index');
      const previousIndex = previousValue === null ? -1 : Number(previousValue);
      const nextIndex = Number.isInteger(previousIndex) &&
        previousIndex >= 0 &&
        previousIndex < dailyReminders.length
        ? (previousIndex + 1 + Math.floor(Math.random() * (dailyReminders.length - 1))) %
          dailyReminders.length
        : Math.floor(Math.random() * dailyReminders.length);
      window.sessionStorage.setItem('arah-reminder-index', String(nextIndex));
      setReminderIndex(nextIndex);
    }, 0);
    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(reminderTimer);
    };
  }, []);

  return (
    <div className="page-stack">
      <section className="welcome-panel" data-scroll-reveal>
        <div>
          <p className="eyebrow">{today || '\u00a0'}</p>
          <h1>{user ? `Assalamu’alaikum, ${user.name || user.username}` : 'Assalamu’alaikum'}</h1>
          <p className="welcome-copy">
            Semoga hari ini dipenuhi ketenangan dan keberkahan.
          </p>
        </div>
        <span className="welcome-ornament" aria-hidden="true">☾</span>
      </section>

      <PrayerSchedule compact />

      {user ? (
        <section className="progress-panel" data-scroll-reveal>
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
                    ? `/quran/${profile.reading.last_surah_number}`
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
                <Link
                  className="last-read-card"
                  href={profile.reading?.last_dua_id ? `/doa/${profile.reading.last_dua_id}` : '/doa'}
                >
                  <span className="eyebrow">Doa terakhir dibaca</span>
                  <strong>{profile.reading?.last_dua_title ?? 'Temukan doa harian'}</strong>
                  <span>{profile.reading?.last_dua_id ? 'Buka daftar doa' : 'Pilih doa untuk dibaca'}</span>
                </Link>
              </div>
            </>
          )}
        </section>
      ) : (
        <section className="progress-panel guest-progress" data-scroll-reveal>
          <div>
            <p className="eyebrow">Simpan perjalananmu</p>
            <h2>Mulai kumpulkan progres ibadah</h2>
            <p>Masuk untuk menyimpan bacaan terakhir, menjaga streak, dan menyelesaikan misi harian.</p>
          </div>
          <Link className="primary-button" href="/login">Masuk atau daftar</Link>
        </section>
      )}

      <section className="section-block" data-scroll-reveal>
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
              data-scroll-reveal
              href={shortcut.href}
              key={shortcut.href}
            >
              <span className="shortcut-icon" aria-hidden="true">
                {shortcut.icon === 'quran' || shortcut.icon === 'prayer'
                  ? <FeatureIcon name={shortcut.icon} />
                  : shortcut.icon}
              </span>
              <span className="shortcut-title">{shortcut.title}</span>
              <span className="shortcut-description">{shortcut.description}</span>
              <span className="shortcut-arrow" aria-hidden="true">↗</span>
            </Link>
          ))}
        </div>
      </section>

      <section aria-busy={reminderIndex === null} className="verse-panel" data-scroll-reveal>
        <span className="verse-mark" aria-hidden="true">“</span>
        <div>
          <p className="eyebrow">Pengingat hari ini</p>
          <p className="verse-text">
            {reminderIndex === null ? '\u00a0' : `“${dailyReminders[reminderIndex].text}”`}
          </p>
          <p className="verse-reference">
            {reminderIndex === null ? '\u00a0' : dailyReminders[reminderIndex].reference}
          </p>
        </div>
      </section>
    </div>
  );
}
