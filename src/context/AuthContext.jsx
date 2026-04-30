import { createContext, useContext, useReducer, useEffect } from 'react';
import { get, set, KEYS } from '../utils/storage';

const AuthContext = createContext(null);

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: action.payload, isLoggedIn: true };
    case 'LOGOUT':
      return { ...state, user: null, isLoggedIn: false };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isLoggedIn: false,
  });

  useEffect(() => {
    const savedUser = get(KEYS.USER);
    if (savedUser) {
      dispatch({ type: 'LOGIN', payload: savedUser });
    }
  }, []);

  function login(username, password) {
    const users = get(KEYS.USERS, []);
    const found = users.find(u => u.username === username && u.password === password);
    if (!found) {
      return { success: false, error: '用户名或密码错误' };
    }
    const { password: _, ...user } = found;
    set(KEYS.USER, user);
    dispatch({ type: 'LOGIN', payload: user });
    return { success: true };
  }

  function register(username, password) {
    const users = get(KEYS.USERS, []);
    if (users.find(u => u.username === username)) {
      return { success: false, error: '用户名已存在' };
    }
    const colors = ['#FF3B30', '#FF9500', '#FFCC00', '#34C759', '#007AFF', '#5856D6', '#AF52DE', '#FF2D55'];
    const newUser = {
      id: 'user_' + Date.now(),
      username,
      password,
      avatarColor: colors[Math.floor(Math.random() * colors.length)],
    };
    users.push(newUser);
    set(KEYS.USERS, users);
    const { password: _, ...user } = newUser;
    set(KEYS.USER, user);
    dispatch({ type: 'LOGIN', payload: user });
    return { success: true };
  }

  function logout() {
    set(KEYS.USER, null);
    dispatch({ type: 'LOGOUT' });
  }

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
