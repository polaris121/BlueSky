import React from 'react';

export const Header = ({ onHomeClick, onContactClick }) => (
  <header className="header">
    <div className="logo">Logo</div>
    <nav>
      <a href="#" className="sidebar-button" onClick={(e) => { e.preventDefault(); onHomeClick(); }}>Home</a>
      <a href="#" className="sidebar-button">About</a>
      <a href="#" className="sidebar-button" onClick={(e) => { e.preventDefault(); onContactClick(); }}>Contact</a>
    </nav>
    <div className="user-profile">
      <input type="search" placeholder="Search..." />
      <span>&#128100;</span>
    </div>
  </header>
);
