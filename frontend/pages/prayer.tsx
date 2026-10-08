import PrayerSchedule from '../src/components/PrayerSchedule';

export default function PrayerPage() {
  return (
    <div className="page-stack">
      <section className="page-intro">
        <p className="eyebrow">Waktu ibadah</p>
        <h1>Jadwal salat</h1>
        <p>Temukan waktu salat hari ini berdasarkan lokasimu.</p>
      </section>
      <PrayerSchedule />
    </div>
  );
}
