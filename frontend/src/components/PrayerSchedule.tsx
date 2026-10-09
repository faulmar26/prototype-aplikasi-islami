import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';

const prayerTimes = [
  { key: 'Fajr', label: 'Subuh' },
  { key: 'Dhuhr', label: 'Zuhur' },
  { key: 'Asr', label: 'Asar' },
  { key: 'Maghrib', label: 'Magrib' },
  { key: 'Isha', label: 'Isya' },
] as const;

type PrayerKey = (typeof prayerTimes)[number]['key'];
type Place =
  | { kind: 'coordinates'; latitude: number; longitude: number }
  | { kind: 'city'; city: string };

interface PrayerDay {
  date: string;
  timezone: string;
  timings: Record<string, string>;
}

interface PrayerResponse {
  code: number;
  data: {
    date: { gregorian: { date: string } };
    meta: { timezone: string };
    timings: Record<string, string>;
  };
  status: string;
}

interface PrayerScheduleProps {
  compact?: boolean;
}

function formatApiDate(date: Date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}-${month}-${date.getFullYear()}`;
}

function getZonedParts(timestamp: number, timezone: string) {
  const values = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(new Date(timestamp));
  return Object.fromEntries(values.map((part) => [part.type, Number(part.value)]));
}

function getZonedDate(year: number, month: number, day: number, hour: number, minute: number, timezone: string) {
  const desired = Date.UTC(year, month - 1, day, hour, minute);
  let result = desired;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const actual = getZonedParts(result, timezone);
    const represented = Date.UTC(actual.year, actual.month - 1, actual.day, actual.hour, actual.minute, actual.second);
    result += desired - represented;
  }
  return new Date(result);
}

function parseDay(day: string, timezone: string) {
  const [dayPart, monthPart, yearPart] = day.split('-').map(Number);
  if (!dayPart || !monthPart || !yearPart) return null;
  const zonedToday = getZonedParts(Date.now(), timezone);
  const currentDay = new Date(Date.UTC(zonedToday.year, zonedToday.month - 1, zonedToday.day));
  const targetDay = new Date(Date.UTC(yearPart, monthPart - 1, dayPart));
  const dayOffset = Math.round((targetDay.getTime() - currentDay.getTime()) / 86_400_000);
  if (dayOffset < 0 || dayOffset > 2) return null;
  return { year: yearPart, month: monthPart, day: dayPart };
}

function getPrayerDate(day: PrayerDay, key: PrayerKey) {
  const calendarDay = parseDay(day.date, day.timezone);
  const rawTime = day.timings[key]?.match(/^(\d{1,2}):(\d{2})/);
  if (!calendarDay || !rawTime) return null;
  return getZonedDate(
    calendarDay.year,
    calendarDay.month,
    calendarDay.day,
    Number(rawTime[1]),
    Number(rawTime[2]),
    day.timezone,
  );
}

function formatCountdown(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  return [hours, minutes, remainingSeconds].map((value) => String(value).padStart(2, '0')).join(':');
}

function formatToday(timezone?: string) {
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...(timezone ? { timeZone: timezone } : {}),
  }).format(new Date());
}

async function fetchPrayerDay(place: Place, date: Date): Promise<PrayerDay> {
  const datePath = formatApiDate(date);
  const url = new URL(`https://api.aladhan.com/v1/${place.kind === 'city' ? 'timingsByCity' : 'timings'}/${datePath}`);
  url.searchParams.set('method', '20');
  if (place.kind === 'city') {
    url.searchParams.set('city', place.city);
    url.searchParams.set('country', 'Indonesia');
  } else {
    url.searchParams.set('latitude', String(place.latitude));
    url.searchParams.set('longitude', String(place.longitude));
  }

  const response = await fetch(url);
  if (!response.ok) throw new Error('Tidak dapat menghubungi layanan jadwal salat.');
  const result = (await response.json()) as PrayerResponse;
  if (result.code !== 200 || !result.data?.timings || !result.data?.meta?.timezone) {
    throw new Error('Jadwal salat tidak tersedia untuk lokasi ini.');
  }
  return {
    date: result.data.date.gregorian.date,
    timezone: result.data.meta.timezone,
    timings: result.data.timings,
  };
}

export default function PrayerSchedule({ compact = false }: PrayerScheduleProps) {
  const [days, setDays] = useState<PrayerDay[]>([]);
  const [locationName, setLocationName] = useState('Jakarta');
  const [cityInput, setCityInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [locationNotice, setLocationNotice] = useState('');
  const [now, setNow] = useState(0);

  const loadSchedule = useCallback(async (place: Place, label: string) => {
    setLoading(true);
    setError('');
    try {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const [todaySchedule, tomorrowSchedule] = await Promise.all([
        fetchPrayerDay(place, today),
        fetchPrayerDay(place, tomorrow),
      ]);
      setDays([todaySchedule, tomorrowSchedule]);
      setLocationName(label);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Terjadi kesalahan saat memuat jadwal.');
      setDays([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const requestDeviceLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationNotice('Lokasi perangkat tidak tersedia. Jadwal ditampilkan untuk Jakarta; masukkan kota lain di bawah.');
      void loadSchedule({ kind: 'city', city: 'Jakarta' }, 'Jakarta');
      return;
    }

    setLoading(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationNotice('');
        void loadSchedule(
          {
            kind: 'coordinates',
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
          'Lokasi perangkat',
        );
      },
      () => {
        setLocationNotice('Izin lokasi tidak tersedia. Jadwal ditampilkan untuk Jakarta; masukkan kota lain di bawah.');
        void loadSchedule({ kind: 'city', city: 'Jakarta' }, 'Jakarta');
      },
      { timeout: 10000, maximumAge: 300000 },
    );
  }, [loadSchedule]);

  useEffect(() => {
    const locationTimer = window.setTimeout(requestDeviceLocation, 0);
    const clockTimer = window.setTimeout(() => setNow(Date.now()), 0);
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => {
      window.clearTimeout(locationTimer);
      window.clearTimeout(clockTimer);
      window.clearInterval(interval);
    };
  }, [requestDeviceLocation]);

  async function submitCity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const city = cityInput.trim();
    if (!city) {
      setError('Masukkan nama kota terlebih dahulu.');
      return;
    }
    setLocationNotice('');
    await loadSchedule({ kind: 'city', city }, city);
  }

  const nextPrayer = useMemo(() => {
    const upcoming = days
      .flatMap((day) =>
        prayerTimes.map((prayer) => ({
          ...prayer,
          time: getPrayerDate(day, prayer.key),
        })),
      )
      .filter((prayer): prayer is typeof prayer & { time: Date } => prayer.time !== null && prayer.time.getTime() > now)
      .sort((left, right) => left.time.getTime() - right.time.getTime())[0];
    if (!upcoming) return null;
    return {
      label: upcoming.label,
      time: upcoming.time,
      seconds: Math.max(0, Math.floor((upcoming.time.getTime() - now) / 1000)),
    };
  }, [days, now]);

  const today = days[0];

  return (
    <section className={`prayer-panel${compact ? ' prayer-panel-compact' : ''}`}>
      <div className="prayer-panel-header">
        <div>
          <p className="eyebrow">{today ? formatToday(today.timezone) : 'Jadwal harian'}</p>
          <h2>{compact ? 'Waktu salat hari ini' : 'Jadwal waktu salat'}</h2>
        </div>
        <span className="location-label" aria-live="polite">⌖ {locationName}</span>
      </div>

      {loading && <p className="status-message" role="status">Memuat jadwal salat…</p>}
      {!loading && error && (
        <div className="error-message prayer-feedback" role="alert">
          <p>{error}</p>
          <button className="text-button" onClick={requestDeviceLocation} type="button">Coba lagi</button>
        </div>
      )}
      {!loading && !error && today && (
        <>
          <div className="next-prayer" aria-live="polite">
            <div>
              <p className="eyebrow">Salat berikutnya</p>
              <h3>{nextPrayer ? nextPrayer.label : 'Jadwal berikutnya'}</h3>
            </div>
            <div className="countdown">
              <strong>{nextPrayer ? formatCountdown(nextPrayer.seconds) : '—:—:—'}</strong>
              <span>{nextPrayer ? 'lagi' : 'Waktu berikutnya belum tersedia'}</span>
            </div>
          </div>
          <div className="prayer-table" aria-label="Jadwal waktu salat hari ini">
            {prayerTimes.map((prayer) => {
              const time = today.timings[prayer.key]?.match(/^(\d{1,2}:\d{2})/)?.[1] ?? '--:--';
              return (
                <div className="prayer-time" key={prayer.key}>
                  <span className="prayer-time-name">{prayer.label}</span>
                  <span className="prayer-time-value">{time}</span>
                </div>
              );
            })}
          </div>
        </>
      )}

      {!compact && (
        <>
          {locationNotice && <p className="notice-message prayer-feedback">{locationNotice}</p>}
          <form className="prayer-form" onSubmit={submitCity}>
            <div className="input-group">
              <label htmlFor="city">Cari jadwal berdasarkan kota</label>
              <input
                className="text-input"
                id="city"
                onChange={(event) => setCityInput(event.target.value)}
                placeholder="Contoh: Bandung"
                value={cityInput}
              />
            </div>
            <button className="primary-button" type="submit">Cari kota</button>
            <button className="secondary-button" onClick={requestDeviceLocation} type="button">Gunakan lokasiku</button>
          </form>
        </>
      )}
    </section>
  );
}
