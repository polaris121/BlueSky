import React from 'react';

export const Sidebar = ({ onAdminClick, onUsersClick }) => (
  <aside className="sidebar">
    <ul>
      <li><a href="#" className="sidebar-button" onClick={(e) => { e.preventDefault(); onAdminClick(); }}>Admin</a></li>
      <li><a href="#" className="sidebar-button">About</a></li>
      <li><a href="#" className="sidebar-button" onClick={(e) => { e.preventDefault(); onUsersClick(); }}>Users</a></li>
      <li><a href="#" className="sidebar-button">Contact</a></li>
    </ul>
  </aside>
); 
