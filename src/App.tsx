// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import Dashboard from './components/Dashboard';
import Process from './components/Process';
import DashboardDetail from './components/DashboardDetail';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LoginForm />} />
        
        {/* Protected routes */}
        <Route path="/dashboard" element={
          <Dashboard />
        } />
        <Route path="/process" element={
          <Process />
        } />
        <Route path="/dashboard/:id" element={
          <DashboardDetail />} 
        />

        
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </Router>
  );
};

export default App;