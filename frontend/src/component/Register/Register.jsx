import React, { useState } from 'react';
import { Button, Form, Input, Select } from 'antd';
import axios from 'axios';

const countryPhoneMasks = {
  Russia: '+7 (___) ___-__-__',
  Azerbaijan: '+994 (__) ___-__-__',
  Kazakhstan: '+7 (___) ___-__-__',
  USA: '+1 (___) ___-____',
  Germany: '+49 (____) ______',
  // ...добавьте другие страны и маски по необходимости
};

const Register = () => {
  const [form] = Form.useForm();
  const [selectedCountry, setSelectedCountry] = useState('Russia');
  const [emailConfirmVisible, setEmailConfirmVisible] = useState(false);
  const [emailForConfirm, setEmailForConfirm] = useState('');
  const [confirmCode, setConfirmCode] = useState('');

  const onFinish = async (values) => {
    try {
      await axios.post('http://localhost:8000/register', {
        username: values.username,
        password: values.password,
        email: values.email,
        country: values.country,
        phone: values.phone,
      });
      setEmailForConfirm(values.email);
      setEmailConfirmVisible(true);
      alert('На почту отправлен код подтверждения!');
    } catch (e) {
      alert('Ошибка регистрации: ' + (e.response?.data?.detail || e.message));
    }
  };

  const handleConfirmMail = async () => {
    try {
      await axios.post('http://localhost:8000/confirm-mail', {
        email: emailForConfirm,
        code: confirmCode,
      });
      alert('Почта подтверждена! Теперь вы можете войти.');
      setEmailConfirmVisible(false);
    } catch (e) {
      alert('Ошибка подтверждения: ' + (e.response?.data?.detail || e.message));
    }
  };

  const handleCountryChange = (value) => {
    setSelectedCountry(value);
    form.setFieldsValue({ phone: '' });
  };

  return (
    <>
      <Form
        form={form}
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
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Введите email!' },
            { type: 'email', message: 'Некорректный email!' },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Страна"
          name="country"
          rules={[{ required: true, message: 'Выберите страну!' }]}
          initialValue={selectedCountry}
        >
          <Select onChange={handleCountryChange}>
            <Select.Option value="Russia">Россия</Select.Option>
            <Select.Option value="Azerbaijan">Азербайджан</Select.Option>
            <Select.Option value="Kazakhstan">Казахстан</Select.Option>
            <Select.Option value="USA">США</Select.Option>
            <Select.Option value="Germany">Германия</Select.Option>

            {/* ...добавьте другие страны */}
          </Select>
        </Form.Item>
        <Form.Item
          label="Телефон"
          name="phone"
          rules={[
            { required: true, message: 'Введите номер телефона!' },
            // Можно добавить кастомную валидацию по маске
          ]}
        >
          <Input placeholder={countryPhoneMasks[selectedCountry]} />
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
      {emailConfirmVisible && (
        <div>
          <h3>Подтвердите почту</h3>
          <Input
            placeholder="Код из письма"
            value={confirmCode}
            onChange={e => setConfirmCode(e.target.value)}
            style={{ width: 200, marginRight: 8 }}
          />
          <Button type="primary" onClick={handleConfirmMail}>Подтвердить</Button>
        </div>
      )}
    </>
  );
};

export default Register;
