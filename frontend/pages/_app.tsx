import type { AppProps } from 'next/app';
import Link from 'next/link';
import { useRouter } from 'next/router';
import '../src/styles/global.css';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const navigation = [
    { href: '/', label: 'Beranda' },
    { href: '/prayer', label: 'Jadwal salat' },
    { href: '/quran', label: 'Al-Qur’an' },
    { href: '/doa', label: 'Doa harian' },
  ];

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="header-inner">
          <Link aria-label="Beranda Arah, ke halaman beranda" className="brand" href="/">
            <span className="brand-mark" aria-hidden="true">☾</span>
            <span>Arah<span className="brand-dot">.</span></span>
          </Link>
          <nav aria-label="Navigasi utama" className="main-navigation">
            {navigation.map((item) => {
              const active = router.pathname === item.href;
              return (
                <Link
                  aria-current={active ? 'page' : undefined}
                  className={`nav-link${active ? ' nav-link-active' : ''}`}
                  href={item.href}
                  key={item.href}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="main-content">
        <Component {...pageProps} />
      </main>
      <footer className="site-footer">Semoga setiap langkah membawa kebaikan.</footer>
    </div>
  );
}