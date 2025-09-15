import { jwtDecode } from 'jwt-decode';

type Role = 'attendee' | 'presenter' | 'organizer' | 'admin';

interface TokenPayload {
  userId: number;                       // was string
  type: 'access' | 'refresh';
  exp: number;
  iat: number;
}

export interface User {
  id: number;                           // was string
  email: string;
  name: string;
  roles: Role[];                        // was single, uppercase role
  createdAt: string;
}

const ACCESS_TOKEN_KEY = 'joinup_access_token';
const USER_KEY = 'joinup_user';

// In-memory token (avoid localStorage in prod)
let accessTokenMem: string | null = null;

function getStorage(remember: boolean) {
  return remember ? localStorage : sessionStorage;
}

export const setTokens = (accessToken: string, remember: boolean = true): void => {
  accessTokenMem = accessToken;
  if (typeof window === 'undefined') return;

  // Clear token from both storages to avoid duplication, then set into chosen storage
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  getStorage(remember).setItem(ACCESS_TOKEN_KEY, accessToken);
};

export const clearTokens = (): void => {
  accessTokenMem = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(USER_KEY);
  }
};

export const getAccessToken = (): string | null => {
  if (accessTokenMem) return accessTokenMem;
  if (typeof window !== 'undefined') {
    // Prefer persistent, then session
    const t = localStorage.getItem(ACCESS_TOKEN_KEY) || sessionStorage.getItem(ACCESS_TOKEN_KEY);
    if (t) accessTokenMem = t; // hydrate mem once
    return t;
  }
  return null;
};

// User storage
export const setUser = (user: User, remember: boolean = true): void => {
  if (typeof window === 'undefined') return;
  // Clear from both storages then set into chosen one
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(USER_KEY);
  getStorage(remember).setItem(USER_KEY, JSON.stringify(user));
};

export const getUser = (): User | null => {
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
    if (!raw || raw === 'undefined') return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      localStorage.removeItem(USER_KEY);
      sessionStorage.removeItem(USER_KEY);
      return null;
    }
  }
  return null;
};

// Optional helpers
export function getPrimaryRole(user?: User | null): Role | null {
  const u = user ?? getUser();
  if (!u?.roles?.length) return null;
  // Priority: admin > organizer > presenter > attendee
  const priority: Role[] = ['admin', 'organizer', 'presenter', 'attendee'];
  return priority.find(r => u.roles.includes(r)) ?? u.roles[0];
}

export function getUserRoleDisplay(u?: User | null): string | null {
  const role = getPrimaryRole(u);
  return role ? role.charAt(0).toUpperCase() + role.slice(1) : null;
}

// Check if a JWT token is expired
function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwtDecode<TokenPayload>(token);
    // exp is in seconds, Date.now() is in milliseconds
    return decoded.exp * 1000 < Date.now();
  } catch {
    // If token can't be decoded, consider it expired
    return true;
  }
}

// API client with expiry check + refresh + 401 retry
export const apiClient = {
  async request<T>(endpoint: string, options: RequestInit = {}, retried = false): Promise<T> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
    const url = `${baseUrl}${endpoint}`;

    let accessToken = getAccessToken();

    if (accessToken && isTokenExpired(accessToken)) {
      const refreshed = await this.refreshToken();
      if (!refreshed) {
        clearTokens();
        throw new Error('Session expired');
      }
      accessToken = getAccessToken();
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers && typeof options.headers === 'object' && !(options.headers instanceof Headers) ? options.headers as Record<string, string> : {}),
    };
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });

    // If unauthorized, try one refresh then retry original request once
    if (response.status === 401 && !retried) {
      const refreshed = await this.refreshToken();
      if (refreshed) {
        return this.request<T>(endpoint, options, true);
      }
      clearTokens();
      throw new Error('Session expired');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  },

  async refreshToken(): Promise<boolean> {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
      const response = await fetch(`${baseUrl}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) return false;
      const data = await response.json();
      if (!data?.data?.accessToken) return false;
      setTokens(data.data.accessToken);
      return true;
    } catch {
      return false;
    }
  },

  async login(email: string, password: string): Promise<{ success: boolean; data: { user: User; accessToken: string } }> {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async loginAttendee(email: string, password: string): Promise<{ success: boolean; data: { user: User; accessToken: string } }> {
    return this.request('/api/auth/login/attendee', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async loginOrganizer(email: string, password: string): Promise<{ success: boolean; data: { user: User; accessToken: string } }> {
    return this.request('/api/auth/login/organizer', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async register(email: string, password: string, name: string): Promise<{ success: boolean; data: { user: User; accessToken: string } }> {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  },

  async registerAttendee(email: string, password: string, name: string): Promise<{ success: boolean; data: { user: User; accessToken: string } }> {
    return this.request('/api/auth/register/attendee', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  },

  async registerOrganizer(email: string, password: string, name: string): Promise<{ success: boolean; data: { user: User; accessToken: string } }> {
    return this.request('/api/auth/register/organizer', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  },

  async updateUserRole(role: 'ORGANIZER' | 'ATTENDEE' | 'PRESENTER' | 'ADMIN'): Promise<{ success: boolean; data: { user: User } }> {
    return this.request('/api/auth/update-role', {
      method: 'PATCH',
      body: JSON.stringify({ role: role.toLowerCase() }),
    });
  },

  async logout(): Promise<void> {
    try {
      await this.request('/api/auth/logout', { method: 'POST' });
    } finally {
      clearTokens();
    }
  },
};

// Optional: keep named helpers but make them use apiClient + consistent throw-on-error
export async function register(payload: { name: string; email: string; password: string }) {
  const res = await apiClient.register(payload.email, payload.password, payload.name);
  return res;
}

export async function login(email: string, password: string) {
  const res = await apiClient.login(email, password);
  return res;
}

export async function refresh() {
  const ok = await apiClient.refreshToken();
  if (!ok) throw new Error('Refresh failed');
  return { success: true };
}