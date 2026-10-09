import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAccount } from '../src/lib/account';

export default function LoginPage() {
  const router = useRouter();
  const { authenticate, user, ready } = useAccount();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authenticate(mode, {
        username: username.trim(),
        password,
        ...(mode === 'register' ? { name: name.trim() } : {}),
      });
      const next = typeof router.query.next === 'string' &&
        router.query.next.startsWith('/') &&
        !router.query.next.startsWith('//')
        ? router.query.next
        : '/';
      await router.replace(next);
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'Gagal masuk. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  }

  if (ready && user) {
    return (
      <section className="auth-card">
        <p className="eyebrow">Akunmu</p>
        <h1>Kamu sudah masuk</h1>
        <p className="auth-description">Progres ibadahmu tersimpan untuk akun {user.name}.</p>
        <Link className="primary-button auth-submit" href="/">Kembali ke beranda</Link>
      </section>
    );
  }

  return (
    <section className="auth-card">
      <div className="auth-emblem" aria-hidden="true">☾</div>
      <p className="eyebrow">{mode === 'login' ? 'Selamat datang kembali' : 'Mulai perjalananmu'}</p>
      <h1>{mode === 'login' ? 'Masuk ke Arah' : 'Buat akun Arah'}</h1>
      <p className="auth-description">
        Simpan bacaan terakhir dan kumpulkan progres ibadah harianmu.
      </p>

      <form className="auth-form" onSubmit={submit}>
        {mode === 'register' && (
          <div className="input-group">
            <label htmlFor="display-name">Nama</label>
            <input
              autoComplete="name"
              className="text-input"
              id="display-name"
              maxLength={60}
              onChange={(event) => setName(event.target.value)}
              placeholder="Nama yang ingin ditampilkan"
              required
              value={name}
            />
          </div>
        )}
        <div className="input-group">
          <label htmlFor="username">Nama pengguna</label>
          <input
            autoComplete="username"
            className="text-input"
            id="username"
            maxLength={32}
            minLength={3}
            onChange={(event) => setUsername(event.target.value)}
            pattern="(?:[A-Za-z0-9_.]|-)+"
            placeholder="Contoh: nama_pengguna"
            required
            value={username}
          />
        </div>
        <div className="input-group">
          <label htmlFor="password">Kata sandi</label>
          <div className="password-field">
            <input
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              className="text-input"
              id="password"
              maxLength={72}
              minLength={8}
              onChange={(event) => setPassword(event.target.value)}
              required
              type={showPassword ? 'text' : 'password'}
              value={password}
            />
            <button
              aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
              aria-pressed={showPassword}
              className="password-toggle"
              onClick={() => setShowPassword((visible) => !visible)}
              type="button"
            >
              {showPassword ? 'Sembunyikan' : 'Tampilkan'}
            </button>
          </div>
          {mode === 'register' && <span className="field-hint">Gunakan sedikitnya 8 karakter.</span>}
        </div>
        {error && <p className="error-message" role="alert">{error}</p>}
        <button className="primary-button auth-submit" disabled={loading} type="submit">
          {loading ? 'Memproses…' : mode === 'login' ? 'Masuk' : 'Buat akun'}
        </button>
      </form>

      <p className="auth-switch">
        {mode === 'login' ? 'Belum memiliki akun?' : 'Sudah memiliki akun?'}{' '}
        <button
          className="text-button"
          onClick={() => {
            setMode(mode === 'login' ? 'register' : 'login');
            setError('');
          }}
          type="button"
        >
          {mode === 'login' ? 'Daftar sekarang' : 'Masuk'}
        </button>
      </p>
    </section>
  );
}
