import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Input } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const User = () => {
  const [user, setUser] = useState(null);
  const [emailConfirmSent, setEmailConfirmSent] = useState(false);
  const [confirmCode, setConfirmCode] = useState('');
  const [emailConfirmed, setEmailConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    axios.get('http://localhost:8000/me', { withCredentials: true })
      .then(res => {
        setUser(res.data);
        setEmailConfirmed(res.data.email_confirmed);
      })
      .catch(() => setUser(null));
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const handleSendConfirmMail = async () => {
    setLoading(true);
    try {
      await axios.post('http://localhost:8000/send-confirm-mail', {}, { withCredentials: true });
      setEmailConfirmSent(true);
    } catch (e) {
      alert('Ошибка отправки кода: ' + (e.response?.data?.detail || e.message));
    }
    setLoading(false);
  };

  const handleConfirmMail = async () => {
    setLoading(true);
    try {
      await axios.post('http://localhost:8000/confirm-mail', {
        email: user.email,
        code: confirmCode,
      }, { withCredentials: true });
      setEmailConfirmed(true);
      setEmailConfirmSent(false);
      setConfirmCode('');
      alert('Почта подтверждена!');
    } catch (e) {
      alert('Ошибка подтверждения: ' + (e.response?.data?.detail || e.message));
    }
    setLoading(false);
  };

  if (!user) {
    return <div>Загрузка...</div>;
  }

  return (
    <div>
      <h2>Профиль пользователя</h2>
      <p><b>Имя пользователя:</b> {user.username}</p>
      <p>
        <b>Email:</b> {user.email || '-'}
        {user.email && (
          <>
            {' '}
            {emailConfirmed ? (
              <span style={{ color: 'green' }}> (подтверждён)</span>
            ) : (
              <span style={{ color: 'red' }}> (не подтверждён)</span>
            )}
          </>
        )}
      </p>
      <p><b>Телефон:</b> {user.phone || '-'}</p>
      <p><b>Страна:</b> {user.country || '-'}</p>
      {!emailConfirmed && (
        <div style={{ marginBottom: 16 }}>
          <Button type="primary" onClick={handleSendConfirmMail} loading={loading} disabled={emailConfirmSent}>
            {emailConfirmSent ? 'Код отправлен' : 'Подтвердить почту'}
          </Button>
          {emailConfirmSent && (
            <div style={{ marginTop: 8 }}>
              <Input
                placeholder="Код из письма"
                value={confirmCode}
                onChange={e => setConfirmCode(e.target.value)}
                style={{ width: 200, marginRight: 8 }}
              />
              <Button type="primary" onClick={handleConfirmMail} loading={loading}>Подтвердить</Button>
            </div>
          )}
        </div>
      )}
      <Button type="primary" danger onClick={handleLogout}>
        Выйти
      </Button>
    </div>
  );
};

export default User;
