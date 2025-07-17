import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';

export const UserProfile = ({ currentUser }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newEmail, setNewEmail] = useState(currentUser?.email || '');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handlePasswordChange = (e) => {
    e.preventDefault();
    
    // Clear previous messages
    setSuccessMessage('');
    setErrorMessage('');
    
    // Validation
    if (!newPassword.trim()) {
      setErrorMessage('Please enter a new password.');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }
    
    if (newPassword.length < 4) {
      setErrorMessage('Password must be at least 4 characters long.');
      return;
    }
    
    // Call server method to update password
    Meteor.call('users.updatePassword', currentUser.username, newPassword, (error) => {
      if (error) {
        setErrorMessage('Error updating password: ' + error.reason);
      } else {
        setSuccessMessage('Password updated successfully!');
        setNewPassword('');
        setConfirmPassword('');
      }
    });
  };

  const handleEmailChange = (e) => {
    e.preventDefault();
    
    // Clear previous messages
    setSuccessMessage('');
    setErrorMessage('');
    
    // Validation
    if (!newEmail.trim()) {
      setErrorMessage('Please enter an email address.');
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    
    // Call server method to update email
    Meteor.call('users.updateEmail', currentUser.username, newEmail, (error) => {
      if (error) {
        setErrorMessage('Error updating email: ' + error.reason);
      } else {
        setSuccessMessage('Email updated successfully!');
      }
    });
  };

  return (
    <div className="user-profile">
      <div className="user-profile-header">
        <h1>User Profile</h1>
        <p className="user-profile-subtitle">Manage your account settings</p>
      </div>
      
      <div className="user-profile-content">
        {/* Current User Info */}
        <div className="profile-section">
          <h2>Current Information</h2>
          <div className="user-info-display">
            <div className="info-item">
              <span className="info-label">Username:</span>
              <span className="info-value">{currentUser?.username || 'N/A'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Role:</span>
              <span className="info-value">{currentUser?.role || 'User'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Email:</span>
              <span className="info-value">{currentUser?.email || 'Not set'}</span>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="success-message">
            ✅ {successMessage}
          </div>
        )}
        
        {errorMessage && (
          <div className="error-message">
            ❌ {errorMessage}
          </div>
        )}

        {/* Change Password Section */}
        <div className="profile-section">
          <h2>Change Password</h2>
          <form className="profile-form" onSubmit={handlePasswordChange}>
            <div className="form-group">
              <label htmlFor="new-password">New Password</label>
              <input
                type="password"
                id="new-password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirm-password">Confirm Password</label>
              <input
                type="password"
                id="confirm-password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="profile-button">Update Password</button>
          </form>
        </div>

        {/* Change Email Section */}
        <div className="profile-section">
          <h2>Change Email</h2>
          <form className="profile-form" onSubmit={handleEmailChange}>
            <div className="form-group">
              <label htmlFor="new-email">Email Address</label>
              <input
                type="email"
                id="new-email"
                placeholder="Enter email address"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>
            <button type="submit" className="profile-button">Update Email</button>
          </form>
        </div>
      </div>
    </div>
  );
};
