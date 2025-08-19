import { jwtDecode } from 'jwt-decode';

interface TokenPayload {
  userId: string;
  type: 'access' | 'refresh';
  exp: number;
  iat: number;
}

// Updated User interface to include PENDING role
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ORGANIZER' | 'ATTENDEE' | 'ADMIN' | 'PENDING';
  createdAt: string;
}

// Token management
export const setTokens = (accessToken: string, refreshToken: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }
};

export const getAccessToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('accessToken');
  }
  return null;
};

export const getRefreshToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('refreshToken');
  }
  return null;
};

export const clearTokens = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<TokenPayload>(token);
    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

// User management
export const setUser = (user: User): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user', JSON.stringify(user));
  }
};

export const getUser = (): User | null => {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('user');
    if (!user || user === "undefined") return null;

    try {
      return JSON.parse(user);
    } catch (error) {
      console.warn('Invalid user JSON in localStorage:', error);
      localStorage.removeItem('user');
      return null;
    }
  }
  return null;
};


// API client with automatic token refresh
export const apiClient = {
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
    const url = `${baseUrl}${endpoint}`;
    
    let accessToken = getAccessToken();
    
    // Check if token needs refresh
    if (accessToken && isTokenExpired(accessToken)) {
      const refreshed = await this.refreshToken();
      if (!refreshed) {
        clearTokens();
        window.location.href = '/auth/login';
        throw new Error('Session expired');
      }
      accessToken = getAccessToken();
    }
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers && typeof options.headers === 'object' && !Array.isArray(options.headers) && !(options.headers instanceof Headers) ? options.headers : {}),
    };
    
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }
    
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }
    
    return response.json();
  },

  async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = getRefreshToken();
      if (!refreshToken) return false;
      
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
      const response = await fetch(`${baseUrl}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setTokens(data.data.accessToken, data.data.refreshToken);
        return true;
      }
      
      return false;
    } catch {
      return false;
    }
  },

  // Auth endpoints
  async login(email: string, password: string): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async register(
    email: string, 
    password: string, 
    name: string, 
    role: 'ORGANIZER' | 'ATTENDEE' | 'PENDING' = 'PENDING'
  ): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, role }),
    });
  },

  async updateUserRole(role: 'ORGANIZER' | 'ATTENDEE'): Promise<{ user: User }> {
    return this.request('/api/auth/update-role', {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  },

  async logout(): Promise<void> {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      await this.request('/api/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      }).catch(() => {}); // Ignore errors on logout
    }
    clearTokens();
  },
};