import { MouseEvent, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

export function ThemeControl() {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const savedTheme = window.localStorage.getItem('arah-theme');
    const initialTheme: Theme = savedTheme === 'dark' ? 'dark' : 'light';
    document.documentElement.dataset.theme = initialTheme;
    const timer = window.setTimeout(() => setTheme(initialTheme), 0);
    return () => window.clearTimeout(timer);
  }, []);

  function toggleTheme(event: MouseEvent<HTMLButtonElement>) {
    const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark';
    const bounds = event.currentTarget.getBoundingClientRect();
    const originX = event.clientX || bounds.left + bounds.width / 2;
    const originY = event.clientY || bounds.top + bounds.height / 2;
    const root = document.documentElement;
    root.style.setProperty('--theme-origin-x', `${originX}px`);
    root.style.setProperty('--theme-origin-y', `${originY}px`);
    window.localStorage.setItem('arah-theme', nextTheme);

    const applyTheme = () => {
      root.dataset.theme = nextTheme;
      setTheme(nextTheme);
    };
    const transitionDocument = document as Document & {
      startViewTransition?: (callback: () => void) => { finished: Promise<void> };
    };

    if (transitionDocument.startViewTransition) {
      transitionDocument.startViewTransition(applyTheme);
    } else {
      applyTheme();
    }
  }

  return (
    <button
      aria-label={`Aktifkan mode ${theme === 'dark' ? 'terang' : 'gelap'}`}
      aria-pressed={theme === 'dark'}
      className="theme-toggle"
      onClick={toggleTheme}
      type="button"
    >
      <span aria-hidden="true">{theme === 'dark' ? '☼' : '☾'}</span>
      <span className="theme-toggle-label">{theme === 'dark' ? 'Gelap' : 'Terang'}</span>
    </button>
  );
}
