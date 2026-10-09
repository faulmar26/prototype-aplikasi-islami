import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export interface AccountUser {
  id: number;
  username: string;
  name: string;
}

export interface UserProfile {
  streak: {
    current_streak: number;
    longest_streak: number;
  };
  reading: {
    last_surah_number: number | null;
    last_surah_name: string | null;
    last_ayah_number: number | null;
    last_dua_id: number | null;
    last_dua_title: string | null;
    updated_at: string | null;
  } | null;
  missions: {
    code: string;
    title: string;
    targetCount: number;
    currentCount: number;
    rewardPoints: number;
    completed: boolean;
  }[];
  points: number;
}

interface AccountContextValue {
  user: AccountUser | null;
  profile: UserProfile | null;
  ready: boolean;
  profileError: string;
  authenticate: (mode: 'login' | 'register', values: {
    username: string;
    password: string;
    name?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  saveQuranReading: (reading: {
    surahNumber: number;
    surahName: string;
    ayahNumber: number;
    completed?: boolean;
  }) => Promise<void>;
  saveDuaReading: (reading: { duaId: number; duaTitle: string }) => Promise<void>;
}

const AccountContext = createContext<AccountContextValue | null>(null);

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  const headers = new Headers(options.headers);
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  try {
    response = await fetch(`${API_URL}/api${path}`, {
      ...options,
      credentials: 'include',
      headers,
    });
  } catch {
    throw new Error('Layanan akun tidak dapat dihubungi. Pastikan backend sedang berjalan.');
  }

  const payload = await response.json().catch(() => null) as
    | { message?: string | string[] }
    | null;
  if (!response.ok) {
    const message = Array.isArray(payload?.message)
      ? payload.message.join(' ')
      : payload?.message;
    throw new Error(message || 'Permintaan tidak dapat diproses.');
  }
  return payload as T;
}

export function AccountProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AccountUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileError, setProfileError] = useState('');
  const [ready, setReady] = useState(false);

  const refreshProfile = useCallback(async () => {
    try {
      const result = await apiRequest<UserProfile>('/profile');
      setProfile(result);
      setProfileError('');
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : 'Progres akun gagal dimuat.');
    }
  }, []);

  useEffect(() => {
    let active = true;
    async function loadSession() {
      try {
        const currentUser = await apiRequest<AccountUser>('/auth/me');
        if (!active) return;
        setUser(currentUser);
        let checkInError = '';
        try {
          await apiRequest('/auth/check-in', { method: 'POST' });
        } catch (error) {
          checkInError = error instanceof Error ? error.message : 'Login harian gagal dicatat.';
        }
        await refreshProfile();
        if (checkInError) setProfileError(checkInError);
      } catch {
        if (active) {
          setUser(null);
          setProfile(null);
        }
      } finally {
        if (active) setReady(true);
      }
    }
    void loadSession();
    return () => {
      active = false;
    };
  }, [refreshProfile]);

  const authenticate = useCallback(async (
    mode: 'login' | 'register',
    values: { username: string; password: string; name?: string },
  ) => {
    const result = await apiRequest<AccountUser>(`/auth/${mode}`, {
      method: 'POST',
      body: JSON.stringify(values),
    });
    setUser(result);
    await refreshProfile();
  }, [refreshProfile]);

  const logout = useCallback(async () => {
    await apiRequest<{ success: boolean }>('/auth/logout', { method: 'POST' });
    setUser(null);
    setProfile(null);
    setProfileError('');
  }, []);

  const saveQuranReading = useCallback(async (reading: {
    surahNumber: number;
    surahName: string;
    ayahNumber: number;
    completed?: boolean;
  }) => {
    await apiRequest('/profile/quran', { method: 'POST', body: JSON.stringify(reading) });
    await refreshProfile();
  }, [refreshProfile]);

  const saveDuaReading = useCallback(async (reading: { duaId: number; duaTitle: string }) => {
    await apiRequest('/profile/dua', { method: 'POST', body: JSON.stringify(reading) });
    await refreshProfile();
  }, [refreshProfile]);

  return (
    <AccountContext.Provider
      value={{
        user,
        profile,
        ready,
        profileError,
        authenticate,
        logout,
        saveQuranReading,
        saveDuaReading,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
}

export function useAccount() {
  const context = useContext(AccountContext);
  if (!context) throw new Error('useAccount harus digunakan di dalam AccountProvider.');
  return context;
}
