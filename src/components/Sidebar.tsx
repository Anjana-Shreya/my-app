import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './sidebar.css';
import { FaChartBar, FaChevronLeft, FaChevronRight, FaCog, FaHome, FaSignOutAlt } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { logout } from '../slice/authSlice';

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <div className="d-flex">
      <nav className={`sidebar d-flex flex-column flex-shrink-0 position-fixed ${isCollapsed ? 'collapsed' : ''}`}>
        <button className="toggle-btn" onClick={toggleSidebar} style={{color:"white"}}>
          {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
        </button>

        <div className="p-4">
          <h2 className="logo-text fw-bold mb-0">HIVEL</h2>
        </div>

        <div style={{display:"grid", gap:"330px"}}>
          <div className="nav flex-column mb-auto">
            <NavLink 
              to="/dashboard" 
              className={({ isActive }) => 
                `sidebar-link text-decoration-none p-3 ${isActive ? 'active' : ''}`
              }
            >
              <FaHome />
              <span className="hide-on-collapse" style={{paddingLeft:"10px"}}>Dashboard</span>
            </NavLink>
            <NavLink 
              to="/process" 
              className={({ isActive }) => 
                `sidebar-link text-decoration-none p-3 ${isActive ? 'active' : ''}`
              }
            >
              <FaChartBar />
              <span className="hide-on-collapse" style={{paddingLeft:"10px"}}>Process</span>
            </NavLink>
            <NavLink 
              to="/settings" 
              className={({ isActive }) => 
                `sidebar-link text-decoration-none p-3 ${isActive ? 'active' : ''}`
              }
            >
              <FaCog />
              <span className="hide-on-collapse" style={{paddingLeft:"10px"}}>Settings</span>
            </NavLink>
          </div>

          <div className="nav flex-column">
            <div
              onClick={handleLogout}
              className="sidebar-link text-decoration-none p-3 text-start w-100 logout"
              style={{color: "white"}}
            >
              <FaSignOutAlt />
              <span className="hide-on-collapse" style={{paddingLeft:"10px"}}>Logout</span>
            </div> 
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;