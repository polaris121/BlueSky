import React, { useState } from 'react';
import { Header } from './Header.jsx';
import { Footer } from './Footer.jsx';
import { Sidebar } from './Sidebar.jsx';
import { MainContent } from './MainContent.jsx';
import { ContactInfo } from './ContactInfo.jsx';

export const App = () => {
  const [content, setContent] = useState('main');

  const handleHomeClick = () => {
    setContent('main');
  };

  const handleContactClick = () => {
    setContent('contact');
  };

  let currentContent;
  if (content === 'contact') {
    currentContent = <ContactInfo />;
  } else {
    currentContent = <MainContent />;
  }

  return (
    <div className="app-container">
      <Header onHomeClick={handleHomeClick} onContactClick={handleContactClick} />
      <div className="main-container">
        <Sidebar />
        {currentContent}
      </div>
      <Footer />
    </div>
  );
};
