import React from 'react';
import { Button, Checkbox, Form, Input } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../component/AuthContext';
import axios from 'axios';

const Auth = () => {
  const { checkAuth } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      await axios.post('http://localhost:8000/token',
        new URLSearchParams({
          username: values.username,
          password: values.password,
        }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, withCredentials: true }
      );
      await checkAuth();
      navigate('/user');
    } catch {
      alert('Неверный логин или пароль');
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
    </>
  );
};

export default Auth;
