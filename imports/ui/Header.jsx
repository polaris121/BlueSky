import React from 'react';

export const Header = ({ onHomeClick, onContactClick, onLogout, currentUser }) => (
  <header className="header">
    <div className="logo">BlueSky</div>
    <nav>
      <a href="#" className="sidebar-button" onClick={(e) => { e.preventDefault(); onHomeClick(); }}>Home</a>
      <a href="#" className="sidebar-button">About</a>
      <a href="#" className="sidebar-button" onClick={(e) => { e.preventDefault(); onContactClick(); }}>Contact</a>
    </nav>
    <div className="user-profile">
      <span className="user-info">
        Welcome, <strong>{currentUser?.username}</strong> ({currentUser?.role})
      </span>
      <button className="logout-button" onClick={onLogout}>
        Logout
      </button>
    </div>
  </header>
);
