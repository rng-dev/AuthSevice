import React, { useState } from 'react';
import { HomeOutlined, UserOutlined, FormOutlined } from '@ant-design/icons';
import { Menu as AntMenu } from 'antd';
import { Link } from 'react-router-dom';

const Menu = () => {
  const [mode] = useState('inline');
  const [theme] = useState('dark');
  const [selectedKey, setSelectedKey] = useState('1');

  const handleMenuClick = (e) => {
    setSelectedKey(e.key);
  };

  const items = [
    {
      key: '1',
      icon: <HomeOutlined />,
      label: <Link to="/auth">Авторизация</Link>,
    },
    {
      key: '2',
      icon: <FormOutlined />,
      label: <Link to="/register">Регистрация</Link>,
    },
    {
      key: '3',
      icon: <UserOutlined />,
      label: <Link to="/user">Пользователь</Link>,
    },

  ];

  return (
    <div>
      <AntMenu
        style={{ width: '100%', marginTop: '20px' }}
        defaultSelectedKeys={['1']}
        mode={mode}
        theme={theme}
        selectedKeys={[selectedKey]}
        items={items}
        onClick={handleMenuClick}
      />
    </div>
  );
};

export default Menu;
