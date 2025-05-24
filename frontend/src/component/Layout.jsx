import React, { useState } from 'react';
import { Layout, Breadcrumb } from 'antd';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Menu from './Menu/Menu';
import Auth from './Auth/Auth';
import PrivateRoute from './PrivateRouter';
import Register from './Register/Register';
import User from './User/User';

const { Header, Content, Footer, Sider } = Layout;

const Layouts = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Router>
      <Layout style={{ minHeight: '100vh' }}>
        <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed} width={200}>
          <Menu />
        </Sider>
        <Layout>
          <Header style={{ padding: 0, background: '#001529' }} />
          <Content style={{ margin: '0 16px' }}>
            <Breadcrumb
              style={{ margin: '16px 0' }}
              items={[{ title: '' }]}
            />
            <div
              style={{
                padding: 24,
                minHeight: 360,
                background: '#fff',
                borderRadius: 8,
              }}
            >
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/user"
                  element={
                    <PrivateRoute>
                      <User />
                    </PrivateRoute>
                  }
                />
                <Route path="/" element={<Auth />} />
              </Routes>
            </div>
          </Content>
          <Footer style={{ textAlign: 'center' }}>RNG Studio @</Footer>
        </Layout>
      </Layout>
    </Router>
  );
};

export default Layouts;
