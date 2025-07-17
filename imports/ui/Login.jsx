import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';

export const Login = ({ onLogin, registeredUsers, onUserRegistration }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }

    if (isSignupMode) {
      // Handle signup
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }

      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }

      // Create new user using Meteor method
      const newUser = {
        username: username.trim(),
        password: password,
        role: 'User'
      };

      Meteor.call('users.insert', newUser, (error, userId) => {
        if (error) {
          setError('Error creating user: ' + error.reason);
        } else {
          setError('');
          // Automatically log in the new user
          const userToLogin = {
            _id: userId,
            username: username.trim(),
            role: 'User'
          };
          onLogin(userToLogin);
        }
      });
    } else {
      // Handle login using Meteor method
      Meteor.call('users.authenticate', username.trim(), password, (error, user) => {
        if (error) {
          setError('Invalid username or password.');
        } else {
          setError('');
          onLogin(user);
        }
      });
    }
  };

  const toggleMode = () => {
    setIsSignupMode(!isSignupMode);
    setError('');
    setUsername('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>Welcome to BlueSky</h1>
          <p>{isSignupMode ? 'Create your account' : 'Please login to continue'}</p>
        </div>
        
        <form className="login-form" onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="login-username">Username</label>
            <input
              type="text"
              id="login-username"
              name="username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="login-input"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <input
              type="password"
              id="login-password"
              name="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
            />
          </div>

          {isSignupMode && (
            <div className="form-group">
              <label htmlFor="confirm-password">Confirm Password</label>
              <input
                type="password"
                id="confirm-password"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="login-input"
              />
            </div>
          )}
          
          <button type="submit" className="login-button">
            {isSignupMode ? 'Sign Up' : 'Login'}
          </button>
        </form>
        
        <div className="login-footer">
          <p>
            {isSignupMode ? 'Already have an account?' : "Don't have an account?"}
            <button 
              type="button" 
              className="toggle-mode-button" 
              onClick={toggleMode}
            >
              {isSignupMode ? 'Login here' : 'Sign up here'}
            </button>
          </p>
          {!isSignupMode && (
            <p className="admin-hint">
              <strong>Admin Login:</strong> username: admin, password: admin123
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
