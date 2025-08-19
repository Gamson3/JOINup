import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { api } from "./api";
import { type User } from "@/lib/auth";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Helper functions for localStorage (with SSR safety)
const getFromStorage = (key: string): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(key);
  }
  return null;
};

const setToStorage = (key: string, value: string): void => {
  if (
    typeof window !== 'undefined' &&
    value !== undefined &&
    value !== "undefined"
  ) {
    localStorage.setItem(key, value);
  }
};

const removeFromStorage = (key: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(key);
  }
};

// Initial state with persistence
const getInitialState = (): AuthState => {
  const storedUser = getFromStorage('user');
  const storedAccessToken = getFromStorage('accessToken');
  const storedRefreshToken = getFromStorage('refreshToken');

  let parsedUser: User | null = null;

  try {
    if (storedUser && storedUser !== 'undefined') {
      parsedUser = JSON.parse(storedUser);
    }
  } catch (err) {
    console.warn('Invalid user data in localStorage:', err);
    removeFromStorage('user');
  }

  return {
    user: parsedUser,
    accessToken: storedAccessToken ?? null,
    refreshToken: storedRefreshToken ?? null,
    isAuthenticated: !!(parsedUser && storedAccessToken),
    loading: false,
    error: null,
  };
};

const authSlice = createSlice({
  name: "auth",
  initialState: getInitialState(),
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        user: User;
        accessToken: string;
        refreshToken: string;
      }>
    ) => {
      const { user, accessToken, refreshToken } = action.payload;

      state.user = user;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.isAuthenticated = true;
      state.error = null;

      setToStorage('user', JSON.stringify(user));
      setToStorage('accessToken', accessToken);
      setToStorage('refreshToken', refreshToken);
    },

    updateTokens: (
      state,
      action: PayloadAction<{
        accessToken: string;
        refreshToken: string;
      }>
    ) => {
      const { accessToken, refreshToken } = action.payload;

      state.accessToken = accessToken;
      state.refreshToken = refreshToken;

      setToStorage('accessToken', accessToken);
      setToStorage('refreshToken', refreshToken);
    },

    clearCredentials: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;

      removeFromStorage('user');
      removeFromStorage('accessToken');
      removeFromStorage('refreshToken');
    },

    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },

    clearError: (state) => {
      state.error = null;
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },

  extraReducers: (builder) => {
    // Login
    builder
      .addMatcher(api.endpoints.login.matchPending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addMatcher(api.endpoints.login.matchFulfilled, (state, action) => {
        state.loading = false;

        if (action.payload.success) {
          const { user, accessToken, refreshToken } = action.payload.data;

          state.user = user;
          state.accessToken = accessToken;
          state.refreshToken = refreshToken;
          state.isAuthenticated = true;

          setToStorage('user', JSON.stringify(user));
          setToStorage('accessToken', accessToken);
          setToStorage('refreshToken', refreshToken);
        }
      })
      .addMatcher(api.endpoints.login.matchRejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Login failed';
      });

    // Register
    builder
      .addMatcher(api.endpoints.register.matchPending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addMatcher(api.endpoints.register.matchFulfilled, (state, action) => {
        state.loading = false;

        if (action.payload.success) {
          const { user, accessToken, refreshToken } = action.payload.data;

          state.user = user;
          state.accessToken = accessToken;
          state.refreshToken = refreshToken;
          state.isAuthenticated = true;

          setToStorage('user', JSON.stringify(user));
          setToStorage('accessToken', accessToken);
          setToStorage('refreshToken', refreshToken);
        }
      })
      .addMatcher(api.endpoints.register.matchRejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Registration failed';
      });

    // Token refresh
    builder
      .addMatcher(api.endpoints.refresh.matchFulfilled, (state, action) => {
        if (action.payload.success) {
          const { accessToken, refreshToken } = action.payload.data;

          state.accessToken = accessToken;
          state.refreshToken = refreshToken;

          setToStorage('accessToken', accessToken);
          setToStorage('refreshToken', refreshToken);
        }
      })
      .addMatcher(api.endpoints.refresh.matchRejected, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;

        removeFromStorage('user');
        removeFromStorage('accessToken');
        removeFromStorage('refreshToken');
      });

    // Logout
    builder
      .addMatcher(api.endpoints.logout.matchFulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.error = null;

        removeFromStorage('user');
        removeFromStorage('accessToken');
        removeFromStorage('refreshToken');
      });
  },
});

export const {
  setCredentials,
  updateTokens,
  clearCredentials,
  setError,
  clearError,
  setLoading,
} = authSlice.actions;

export default authSlice.reducer;

// Selectors
export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.loading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
export const selectUserRole = (state: { auth: AuthState }) => state.auth.user?.role;
