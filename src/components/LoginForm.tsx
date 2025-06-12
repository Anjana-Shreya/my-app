import React, { useState } from 'react';
import { useLoginMutation } from '../slice/apiSlice';
import { useAppDispatch } from '../hooks/hooks';
import { setCredentials } from '../slice/authSlice';
import { useNavigate } from 'react-router-dom';
import './login.css';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const [login] = useLoginMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {      
      const response = await login({
        initialEmail: formData.email,
        password: formData.password,
      }).unwrap();
      
      dispatch(setCredentials(response));
      navigate('/dashboard');
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <div className="login-form-container">
      <form onSubmit={handleSubmit} className="login-form" style={{ paddingRight: "20px" }}>
        <h2>Login</h2>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={formData.email}
            placeholder="Enter your email"
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={formData.password}
            placeholder="Enter your password"
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
          />
        </div>
        <button 
          type="submit" 
          className="login-button"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default LoginForm;