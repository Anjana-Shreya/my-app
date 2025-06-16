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
            </div>
          )}
        </div>

        <NavLink to="/settings" className="sidebar-link">Settings</NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
