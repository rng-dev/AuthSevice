// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);

  // Функция для проверки токена на валидность
  const isTokenValid = (token) => {
    // Валидация токена (проверяем его по фейковому значению или используй реальную проверку)
    return token === 'fake-jwt-token-123456789';
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken && isTokenValid(storedToken)) {
      setToken(storedToken);
    } else {
      setToken(null);  // Если токен невалидный, сбрасываем его
      localStorage.removeItem('token');  // Убираем невалидный токен из localStorage
    }
  }, []);

  const login = async (username, password) => {
    // Мокированная авторизация, возвращаем фейковый токен
    if (username === 'admin' && password === '1234') {
      const fakeToken = 'fake-jwt-token-123456789';
      setToken(fakeToken);
      localStorage.setItem('token', fakeToken);
      return true;
    } else {
      return false;
    }
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('token');
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ token, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
