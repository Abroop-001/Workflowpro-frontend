import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { authApi } from '../api/auth';

const AuthContext = createContext(null);

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGOUT':
      return { ...initialState, isLoading: false };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'RESTORE_SESSION':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Restore session on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        dispatch({ type: 'RESTORE_SESSION', payload: { user, token } });
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const login = useCallback(async (credentials, rememberMe = false) => {
    const response = await authApi.login(credentials);
    // Backend returns { user, accessToken, refreshToken } nested under data.data
    const payload = response.data?.data ?? response.data;
    const { accessToken, user } = payload;
    const token = accessToken;

    if (rememberMe) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      // Store in both so axios interceptor always finds the token
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('user', JSON.stringify(user));
    }

    dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
    return user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore errors on logout
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  const updateUser = useCallback((updatedFields) => {
    dispatch({ type: 'UPDATE_USER', payload: updatedFields });
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        localStorage.setItem('user', JSON.stringify({ ...user, ...updatedFields }));
      } catch (e) {
        console.error(e);
      }
    }
    const sessUserStr = sessionStorage.getItem('user');
    if (sessUserStr) {
      try {
        const user = JSON.parse(sessUserStr);
        sessionStorage.setItem('user', JSON.stringify({ ...user, ...updatedFields }));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const hasRole = useCallback(
    (...roles) => state.user && roles.includes(state.user.role),
    [state.user]
  );

  const value = {
    ...state,
    login,
    logout,
    hasRole,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
