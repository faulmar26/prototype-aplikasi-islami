import { dailyDuas } from '../src/data/dailyDuas';

export default function DoaPage() {
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
          </article>
        ))}
      </div>
    </div>
  );
}
