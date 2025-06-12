// src/features/dashboard/Dashboard.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../hooks/hooks'; 
import { logout } from '../slice/authSlice';  
import Sidebar from './Sidebar';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(logout());           
    navigate('/');                
  };

  return (
    <div>
      <Sidebar />
      <h1>Dashboard</h1>
      <p>Welcome to your dashboard!</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Dashboard;
