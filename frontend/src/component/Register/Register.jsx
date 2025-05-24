import React from 'react';
import { Button, Form, Input } from 'antd';

const Register = () => {
  const onFinish = (values) => {
    // Здесь должна быть логика регистрации пользователя
    alert('Регистрация успешна! (заглушка)');
  };

  return (
    <Form
      name="register"
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 16 }}
      style={{ maxWidth: 600 }}
      onFinish={onFinish}
      autoComplete="off"
    >
      <Form.Item
        label="Username"
        name="username"
        rules={[{ required: true, message: 'Введите имя пользователя!' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label="Password"
        name="password"
        rules={[{ required: true, message: 'Введите пароль!' }]}
      >
        <Input.Password />
      </Form.Item>
      <Form.Item
        label="Confirm"
        name="confirm"
        dependencies={['password']}
        rules={[
          { required: true, message: 'Подтвердите пароль!' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('Пароли не совпадают!'));
            },
          }),
        ]}
      >
        <Input.Password />
      </Form.Item>
      <Form.Item label={null}>
        <Button type="primary" htmlType="submit">
          Зарегистрироваться
        </Button>
      </Form.Item>
    </Form>
  );
};

export default Register;
