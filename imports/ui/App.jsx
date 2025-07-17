import React, { useState } from 'react';
import { Header } from './Header.jsx';
import { Footer } from './Footer.jsx';
import { Sidebar } from './Sidebar.jsx';
import { MainContent } from './MainContent.jsx';
import { ContactInfo } from './ContactInfo.jsx';
import { AdminPanel } from './AdminPanel.jsx';

export const App = () => {
  const [content, setContent] = useState('main');
  const [matrix, setMatrix] = useState(null);

  const handleHomeClick = () => {
    setContent('main');
  };

  const handleContactClick = () => {
    setContent('contact');
  };

  const handleAdminClick = () => {
    setContent('admin');
  };

  const handleMatrixGenerated = (generatedMatrix) => {
    setMatrix(generatedMatrix);
    setContent('main'); // Navigate to home page
  };

  let currentContent;
  if (content === 'contact') {
    currentContent = <ContactInfo />;
  } else if (content === 'admin') {
    currentContent = <AdminPanel onMatrixGenerated={handleMatrixGenerated} />;
  } else {
    currentContent = <MainContent matrix={matrix} />;
  }

  return (
    <div className="app-container">
      <Header onHomeClick={handleHomeClick} onContactClick={handleContactClick} />
      <div className="main-container">
        <Sidebar onAdminClick={handleAdminClick} />
        {currentContent}
      </div>
      <Footer />
    </div>
  );
};
