// src/components/Sidebar.tsx
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './sidebar.css';

const Sidebar = () => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const toggleDropdown = (name: string) => {
    setOpenDropdown(prev => (prev === name ? null : name));
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">MyApp</div>
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className="sidebar-link">Dashboard</NavLink>

        <div className="sidebar-group">
          <div className="sidebar-link" onClick={() => toggleDropdown('workflow')}>
            Workflow
            <span className="arrow">{openDropdown === 'workflow' ? '▾' : '▸'}</span>
          </div>
          {openDropdown === 'workflow' && (
            <div className="sidebar-submenu">
              <NavLink to="/process" className="sidebar-sublink">Process</NavLink>
              <NavLink to="/steps" className="sidebar-sublink">Steps</NavLink>
            </div>
          )}
        </div>

        <div className="sidebar-group">
          <div className="sidebar-link" onClick={() => toggleDropdown('settings')}>
            Settings
            <span className="arrow">{openDropdown === 'settings' ? '▾' : '▸'}</span>
          </div>
          {openDropdown === 'settings' && (
            <div className="sidebar-submenu">
              <NavLink to="/profile" className="sidebar-sublink">Profile</NavLink>
              <NavLink to="/preferences" className="sidebar-sublink">Preferences</NavLink>
            </div>
          )}
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
