import createContextHook from '@nkzw/create-context-hook';
import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation } from '@tanstack/react-query';
import { loginApi, registerApi, logoutApi } from '@/lib/api/auth';
import { User, LoginPayload, RegisterPayload, ApiError } from '@/lib/api/types';

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [storedToken, storedUser] = await Promise.all([
          AsyncStorage.getItem('auth_token'),
          AsyncStorage.getItem('auth_user'),
        ]);
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          console.log('[Auth] Restored session for:', JSON.parse(storedUser).email);
        }
      } catch (e) {
        console.error('[Auth] Failed to restore session:', e);
      } finally {
        setIsBootstrapping(false);
      }
    })();
  }, []);

  const loginMutation = useMutation({
    mutationFn: (payload: LoginPayload) => loginApi(payload),
    onSuccess: async (data) => {
      await Promise.all([
        AsyncStorage.setItem('auth_token', data.token),
        AsyncStorage.setItem('auth_user', JSON.stringify(data.user)),
      ]);
      setToken(data.token);
      setUser(data.user);
      console.log('[Auth] Logged in:', data.user.email);
    },
    onError: (err) => {
      console.error('[Auth] Login failed:', err);
    },
  });

  const registerMutation = useMutation({
    mutationFn: (payload: RegisterPayload) => registerApi(payload),
    onSuccess: async (data) => {
      await Promise.all([
        AsyncStorage.setItem('auth_token', data.token),
        AsyncStorage.setItem('auth_user', JSON.stringify(data.user)),
      ]);
      setToken(data.token);
      setUser(data.user);
      console.log('[Auth] Registered:', data.user.email);
    },
    onError: (err) => {
      console.error('[Auth] Register failed:', err);
    },
  });

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } catch (e) {
      console.warn('[Auth] Logout API error (ignored):', e);
    }
    await Promise.all([
      AsyncStorage.removeItem('auth_token'),
      AsyncStorage.removeItem('auth_user'),
    ]);
    setToken(null);
    setUser(null);
    console.log('[Auth] Logged out');
  }, []);

  return {
    user,
    token,
    isBootstrapping,
    isAuthenticated: !!token && !!user,
    login: loginMutation.mutateAsync,
    loginLoading: loginMutation.isPending,
    loginError: loginMutation.error as ApiError | null,
    register: registerMutation.mutateAsync,
    registerLoading: registerMutation.isPending,
    registerError: registerMutation.error as ApiError | null,
    logout,
  };
});
