// src/layout/MainLayout.tsx
import React from 'react';
import { useRoutes } from 'react-router-dom';
import RouteConfig from './RouteConfig';
import Sidebar from '../components/Sidebar'; 

const MainLayout = () => {
  const element = useRoutes(RouteConfig);

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ flexGrow: 1, overflowY: 'auto' }}>
        {element}
      </div>
    </div>
  );
};

export default MainLayout;
