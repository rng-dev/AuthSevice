import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const User = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    axios.get('http://localhost:8000/me', { withCredentials: true })
      .then(res => setUser(res.data))
      .catch(() => setUser(null));
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  if (!user) {
    return <div>Загрузка...</div>;
  }

  return (
    <div>
      <h2>Профиль пользователя</h2>
      <p><b>Имя пользователя:</b> {user.username}</p>
      <p><b>Email:</b> {user.email || '-'}</p>
      <p><b>Телефон:</b> {user.phone || '-'}</p>
      <p><b>Страна:</b> {user.country || '-'}</p>
      <Button type="primary" danger onClick={handleLogout}>
        Выйти
      </Button>
    </div>
  );
};

export default User;
