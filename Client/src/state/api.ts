import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "./redux";

// Types
interface User {
  id: string;
  email: string;
  name: string;
  role: 'ORGANIZER' | 'ATTENDEE' | 'ADMIN';
  createdAt: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role?: 'ORGANIZER' | 'ATTENDEE';
}

interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}

interface RefreshResponse {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
  };
}

// Base query with auth header injection
const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001",
  prepareHeaders: (headers, { getState }) => {
    // Get token from Redux state
    const token = (getState() as RootState).auth.accessToken;
    
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    
    headers.set('content-type', 'application/json');
    return headers;
  },
});

// Base query with automatic token refresh
const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  let result = await baseQuery(args, api, extraOptions);
  
  // If we get a 401/403, try to refresh the token
  if (result.error && (result.error.status === 401 || result.error.status === 403)) {
    const refreshToken = (api.getState() as RootState).auth.refreshToken;
    
    if (refreshToken) {
      // Try to refresh
      const refreshResult = await baseQuery(
        {
          url: '/api/auth/refresh',
          method: 'POST',
          body: { refreshToken },
        },
        api,
        extraOptions
      );
      
      if (refreshResult.data) {
        // Store new tokens and retry original request
        const refreshData = refreshResult.data as RefreshResponse;
        api.dispatch(
          api.endpoints.refresh.initiate(refreshData.data, { forceRefetch: true })
        );
        
        // Retry the original request
        result = await baseQuery(args, api, extraOptions);
      } else {
        // Refresh failed, logout user
        api.dispatch(api.util.resetApiState());
        // Clear auth state will be handled by the auth slice
      }
    }
  }
  
  return result;
};

export const api = createApi({
  baseQuery: baseQueryWithReauth,
  reducerPath: "api",
  tagTypes: ["User", "Event", "Category", "Presentation"],
  endpoints: (build) => ({
    // Authentication endpoints
    login: build.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/api/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ["User"],
    }),

    register: build.mutation<AuthResponse, RegisterRequest>({
      query: (userData) => ({
        url: '/api/auth/register',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ["User"],
    }),

    refresh: build.mutation<RefreshResponse, { refreshToken: string }>({
      query: ({ refreshToken }) => ({
        url: '/api/auth/refresh',
        method: 'POST',
        body: { refreshToken },
      }),
    }),

    logout: build.mutation<{ success: boolean }, { refreshToken: string }>({
      query: ({ refreshToken }) => ({
        url: '/api/auth/logout',
        method: 'POST',
        body: { refreshToken },
      }),
      invalidatesTags: ["User"],
    }),

    // User profile endpoints
    getProfile: build.query<{ user: User }, void>({
      query: () => '/api/auth/profile',
      providesTags: ["User"],
    }),

    updateProfile: build.mutation<{ user: User }, Partial<User>>({
      query: (updates) => ({
        url: '/api/auth/profile',
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: ["User"],
    }),

    // Events endpoints (placeholder for future implementation)
    getEvents: build.query<any, { page?: number; limit?: number; category?: string }>({
      query: ({ page = 1, limit = 10, category }) => ({
        url: '/api/events',
        params: { page, limit, ...(category && { category }) },
      }),
      providesTags: ["Event"],
    }),

    // Categories endpoints
    getCategories: build.query<any, void>({
      query: () => '/api/categories',
      providesTags: ["Category"],
    }),
  }),
});

export const {
  // Auth hooks
  useLoginMutation,
  useRegisterMutation,
  useRefreshMutation,
  useLogoutMutation,
  
  // Profile hooks
  useGetProfileQuery,
  useUpdateProfileMutation,
  
  // Events hooks
  useGetEventsQuery,
  
  // Categories hooks
  useGetCategoriesQuery,
} = api;