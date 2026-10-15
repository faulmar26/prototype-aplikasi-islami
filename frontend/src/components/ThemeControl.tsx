import { useEffect, useState } from 'react';

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

  function toggleTheme() {
    const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem('arah-theme', nextTheme);
    setTheme(nextTheme);
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
