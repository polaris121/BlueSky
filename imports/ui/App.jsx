import React, { useState } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { MatricesCollection } from '/imports/api/matrices';
import { UsersCollection } from '/imports/api/users';
import { Header } from './Header.jsx';
import { Footer } from './Footer.jsx';
import { Sidebar } from './Sidebar.jsx';
import { MainContent } from './MainContent.jsx';
import { ContactInfo } from './ContactInfo.jsx';
import { AdminPanel } from './AdminPanel.jsx';
import { UserProfile } from './UserProfile.jsx';
import { Login } from './Login.jsx';

export const App = () => {
  const [content, setContent] = useState('main');
  const [loggedInUser, setLoggedInUser] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Use Meteor's reactive data for both matrices and users
  const { matrix, matrixLoading, registeredUsers, usersLoading } = useTracker(() => {
    const matrixHandle = Meteor.subscribe('matrices');
    const usersHandle = Meteor.subscribe('users');
    const activeMatrix = MatricesCollection.findOne({ isActive: true });
    const users = UsersCollection.find().fetch();
    
    return {
      matrix: activeMatrix,
      matrixLoading: !matrixHandle.ready(),
      registeredUsers: users,
      usersLoading: !usersHandle.ready()
    };
  }, []);

  const handleHomeClick = () => {
    setContent('main');
  };

  const handleContactClick = () => {
    setContent('contact');
  };

  const handleAdminClick = () => {
    setContent('admin');
  };

  const handleUsersClick = () => {
    setContent('users');
  };

  const handleLogin = (user) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
    setLoggedInUser(user.username);
    setContent('main');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setLoggedInUser('');
    // Don't clear matrix - it should persist for other users
    setContent('main');
  };

  const handleUserRegistration = (newUser) => {
    // Save user to MongoDB using Meteor method
    Meteor.call('users.insert', newUser, (error, userId) => {
      if (error) {
        console.error('Error creating user:', error);
        alert('Error creating user: ' + error.reason);
        return false;
      } else {
        console.log('User created successfully with ID:', userId);
        return true;
      }
    });
  };

  const handleMatrixGenerated = (generatedMatrix) => {
    console.log('App.jsx received matrix data:', generatedMatrix);
    console.log('App.jsx column headers:', generatedMatrix.columnHeaders);
    console.log('App.jsx row headers:', generatedMatrix.rowHeaders);
    
    // Save matrix to MongoDB using Meteor method
    Meteor.call('matrices.insert', {
      name: `Matrix by ${generatedMatrix.currentUser}`,
      dimensions: generatedMatrix.dimensions,
      data: generatedMatrix.data,
      selections: generatedMatrix.selections,
      columnHeaders: generatedMatrix.columnHeaders,
      rowHeaders: generatedMatrix.rowHeaders,
      createdBy: generatedMatrix.currentUser
    }, (error, matrixId) => {
      if (error) {
        console.error('Error creating matrix:', error);
        alert('Error creating matrix: ' + error.reason);
      } else {
        // Set this matrix as active
        Meteor.call('matrices.setActive', matrixId, (error) => {
          if (error) {
            console.error('Error setting active matrix:', error);
          }
        });
        setLoggedInUser(generatedMatrix.currentUser);
        setContent('main'); // Navigate to home page
      }
    });
  };

  const handleCellSelect = (rowIndex, colIndex) => {
    if (!matrix || !loggedInUser.trim()) {
      alert('Please generate a matrix with your name first!');
      return;
    }
    
    // Use Meteor method to update cell selection
    Meteor.call('matrices.updateSelection', matrix._id, rowIndex, colIndex, loggedInUser.trim(), (error) => {
      if (error) {
        if (error.reason === 'Cell is full') {
          alert('This cell is full! Maximum 5 selections per cell.');
        } else {
          console.error('Error updating cell:', error);
          alert('Error updating cell: ' + error.reason);
        }
      }
      // No need to update local state - Meteor's reactivity will handle it
    });
  };

  let currentContent;
  if (content === 'contact') {
    currentContent = <ContactInfo />;
  } else if (content === 'admin') {
    currentContent = <AdminPanel 
      onMatrixGenerated={handleMatrixGenerated} 
      onUserRegistration={handleUserRegistration}
      registeredUsers={registeredUsers}
      currentUser={currentUser}
    />;
  } else if (content === 'users') {
    currentContent = <UserProfile currentUser={currentUser} />;
  } else {
    currentContent = <MainContent matrix={matrix} onCellSelect={handleCellSelect} loggedInUser={loggedInUser} currentUser={currentUser} />;
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <Login 
      onLogin={handleLogin} 
      registeredUsers={registeredUsers} 
      onUserRegistration={handleUserRegistration}
    />;
  }

  return (
    <div className="app-container">
      <Header 
        onHomeClick={handleHomeClick} 
        onContactClick={handleContactClick} 
        onLogout={handleLogout}
        currentUser={currentUser}
      />
      <div className="main-container">
        <Sidebar onAdminClick={handleAdminClick} onUsersClick={handleUsersClick} />
        {currentContent}
      </div>
      <Footer />
    </div>
  );
};
