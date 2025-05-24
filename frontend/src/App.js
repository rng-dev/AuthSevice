import React from 'react';
import Layouts from './component/Layout';
import { AuthProvider } from './component/AuthContext';

const App = () => {
  return (
    <AuthProvider>
      <Layouts />
    </AuthProvider>
  );
};

export default App;
