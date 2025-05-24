import React, { useState } from 'react';
import { Button, Checkbox, Form, Input } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../component/AuthContext';
import axios from 'axios';

const Auth = () => {
  const { login, checkAuth } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [show2FA, setShow2FA] = useState(false);
  const [code, setCode] = useState('');

  const onFinish = async (values) => {
    setUsername(values.username);
    try {
      await axios.post('http://localhost:8000/token',
        new URLSearchParams({
          username: values.username,
          password: values.password,
        }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, withCredentials: true }
      );
      setShow2FA(true);
    } catch {
      alert('Неверный логин или пароль');
    }
  };

  const handle2FA = async () => {
    try {
      await axios.post('http://localhost:8000/verify-2fa', {
        username,
        code,
      }, { withCredentials: true });
      await checkAuth(); // обновить авторизацию
      navigate('/user');
    } catch {
      alert('Неверный код подтверждения');
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  return (
    <>
      <Form
        name="basic"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        style={{ maxWidth: 600 }}
        initialValues={{ remember: true }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Form.Item
          label="Username"
          name="username"
          rules={[{ required: true, message: 'Please input your username!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: 'Please input your password!' }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item name="remember" valuePropName="checked" label={null}>
          <Checkbox>Remember me</Checkbox>
        </Form.Item>

        <Form.Item label={null}>
          <Button type="primary" htmlType="submit">
            Войти
          </Button>
        </Form.Item>
      </Form>
      {show2FA && (
        <div>
          <h3>Введите код подтверждения из письма</h3>
          <Input
            placeholder="Код"
            value={code}
            onChange={e => setCode(e.target.value)}
            style={{ width: 200, marginRight: 8 }}
          />
          <Button type="primary" onClick={handle2FA}>Подтвердить</Button>
        </div>
      )}
    </>
  );
};

export default Auth;
