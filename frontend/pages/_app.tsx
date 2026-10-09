import type { AppProps } from 'next/app';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { AccountProvider, useAccount } from '../src/lib/account';
import '../src/styles/global.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AccountProvider>
      <AppLayout Component={Component} pageProps={pageProps} />
    </AccountProvider>
  );
}

function AppLayout({ Component, pageProps }: Pick<AppProps, 'Component' | 'pageProps'>) {
  const router = useRouter();
  const { user, logout, ready } = useAccount();
  const [logoutError, setLogoutError] = useState('');
  const navigation = [
    { href: '/', label: 'Beranda' },
    { href: '/prayer', label: 'Jadwal salat' },
    { href: '/quran', label: 'Al-Qur’an' },
    { href: '/doa', label: 'Doa harian' },
  ];

  async function handleLogout() {
    setLogoutError('');
    try {
      await logout();
      await router.push('/');
    } catch (error) {
      setLogoutError(error instanceof Error ? error.message : 'Gagal keluar dari akun.');
    }
  }

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
            {user ? (
              <div className="account-nav">
                <span className="account-nav-name">{user.name}</span>
                <button className="nav-account-button" onClick={handleLogout} type="button">Keluar</button>
              </div>
            ) : (
              <Link
                aria-current={router.pathname === '/login' ? 'page' : undefined}
                className={`nav-link nav-login-link${router.pathname === '/login' ? ' nav-link-active' : ''}`}
                href="/login"
              >
                {ready ? 'Masuk' : 'Akun'}
              </Link>
            )}
          </nav>
        </div>
      </header>
      {logoutError && <p className="global-account-error" role="alert">{logoutError}</p>}
      <main className="main-content">
        <Component {...pageProps} />
      </main>
      <footer className="site-footer">Semoga setiap langkah membawa kebaikan.</footer>
    </div>
  );
}