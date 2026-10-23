import type { AppProps } from 'next/app';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { CursorGlow } from '../src/components/CursorGlow';
import { ThemeControl } from '../src/components/ThemeControl';
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
  const mainRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const main = mainRef.current;
    if (!main || !('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const observeRevealElements = (node: ParentNode) => {
      if (node instanceof Element && node.matches('[data-scroll-reveal]')) {
        observer.observe(node);
      }
      node.querySelectorAll?.('[data-scroll-reveal]').forEach((element) => observer.observe(element));
    };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const element = entry.target as HTMLElement;
        const revealSiblings = Array.from(element.parentElement?.children ?? [])
          .filter((sibling) => sibling.hasAttribute('data-scroll-reveal'));
        const siblingIndex = revealSiblings.indexOf(element);
        element.style.setProperty('--reveal-delay', `${Math.min(siblingIndex, 2) * 75}ms`);
        element.dataset.revealed = 'true';
        observer.unobserve(element);
      });
    }, { threshold: 0, rootMargin: '0px 0px -36px 0px' });
    const mutations = new MutationObserver((records) => {
      records.forEach((record) => {
        record.addedNodes.forEach((node) => {
          if (node instanceof Element) observeRevealElements(node);
        });
      });
    });

    document.documentElement.dataset.scrollReveal = 'true';
    observeRevealElements(main);
    mutations.observe(main, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutations.disconnect();
      delete document.documentElement.dataset.scrollReveal;
    };
  }, [router.asPath]);
  const navigation = [
    { href: '/', label: 'Beranda' },
    { href: '/prayer', label: 'Jadwal salat' },
    { href: '/quran', label: 'Al-Qur’an' },
    { href: '/doa', label: 'Doa harian' },
  ];
  if (user) navigation.push({ href: '/bookmarks', label: 'Bookmark' });

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
      <CursorGlow />
      <header className="site-header">
        <div className="header-inner">
          <Link aria-label="Beranda Arah, ke halaman beranda" className="brand" href="/">
            <span className="brand-mark" aria-hidden="true">☾</span>
            <span>Arah<span className="brand-dot">.</span></span>
          </Link>
          <nav aria-label="Navigasi utama" className="main-navigation">
            {navigation.map((item) => {
              const active = router.pathname === item.href ||
                (item.href === '/quran' && router.pathname.startsWith('/quran/')) ||
                (item.href === '/doa' && router.pathname.startsWith('/doa/'));
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
            <ThemeControl />
          </nav>
        </div>
      </header>
      {logoutError && <p className="global-account-error" role="alert">{logoutError}</p>}
      <main className="main-content" ref={mainRef}>
        <div key={router.asPath}>
          <Component {...pageProps} />
        </div>
      </main>
      <footer className="site-footer">Semoga setiap langkah membawa kebaikan.</footer>
    </div>
  );
}