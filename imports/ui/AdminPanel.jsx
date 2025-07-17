import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';

export const AdminPanel = ({ onMatrixGenerated, onUserRegistration, registeredUsers, currentUser }) => {
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [deleteUsername, setDeleteUsername] = useState('');
  const [matrixX, setMatrixX] = useState(10);
  const [matrixY, setMatrixY] = useState(10);
  const [columnHeaders, setColumnHeaders] = useState([]);
  const [rowHeaders, setRowHeaders] = useState([]);
  const [costPerCell, setCostPerCell] = useState(4);

  // Clear headers when dimensions change
  React.useEffect(() => {
    if (columnHeaders.length !== matrixX || rowHeaders.length !== matrixY) {
      setColumnHeaders([]);
      setRowHeaders([]);
    }
  }, [matrixX, matrixY]);

  const handleAddUser = (e) => {
    e.preventDefault();
    if (newUsername.trim() === '' || newPassword.trim() === '') {
      alert('Please enter both username and password.');
      return;
    }
    
    const newUser = {
      username: newUsername.trim(),
      password: newPassword,
      role: 'User',
    };
    
    Meteor.call('users.insert', newUser, (error, userId) => {
      if (error) {
        alert('Error creating user: ' + error.reason);
      } else {
        setNewUsername('');
        setNewPassword('');
        alert('User registered successfully!');
      }
    });
  };

  const handleDeleteUser = (e) => {
    e.preventDefault();
    if (deleteUsername.trim() === '') {
      alert('Please enter a username to delete.');
      return;
    }
    if (deleteUsername === 'admin') {
      alert('Cannot delete admin user.');
      return;
    }
    if (deleteUsername === currentUser?.username) {
      alert('Cannot delete your own account.');
      return;
    }
    
    Meteor.call('users.remove', deleteUsername.trim(), (error, result) => {
      if (error) {
        alert('Error deleting user: ' + error.reason);
      } else {
        setDeleteUsername('');
        alert('User deleted successfully!');
      }
    });
  };

  const handleCostPerCellUpdate = (e) => {
    e.preventDefault();
    
    // Update cost per cell in the database
    Meteor.call('admin.updateCostPerCell', costPerCell, (error) => {
      if (error) {
        alert('Error updating cost per cell: ' + error.reason);
      } else {
        alert(`Cost per cell updated successfully to $${costPerCell}`);
      }
    });
  };

  const generateUniqueRandomNumbers = (count) => {
    if (count > 10) {
      throw new Error('Cannot generate more than 10 unique numbers from 0-9');
    }
    
    const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const result = [];
    
    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * numbers.length);
      result.push(numbers[randomIndex]);
      numbers.splice(randomIndex, 1); // Remove the selected number to ensure uniqueness
    }
    
    return result;
  };

  const handleGenerateHeaders = () => {
    try {
      const newColumnHeaders = generateUniqueRandomNumbers(matrixX);
      const newRowHeaders = generateUniqueRandomNumbers(matrixY);
      
      setColumnHeaders(newColumnHeaders);
      setRowHeaders(newRowHeaders);
      
      // If a matrix already exists, update its headers in the database
      Meteor.call('matrices.updateHeaders', newColumnHeaders, newRowHeaders, (error) => {
        if (error) {
          console.error('Error updating matrix headers:', error);
          alert(`Headers generated locally!\nColumn Headers: [${newColumnHeaders.join(', ')}]\nRow Headers: [${newRowHeaders.join(', ')}]\n\nNote: Create a matrix first to persist headers to database.`);
        } else {
          alert(`Headers updated successfully!\nColumn Headers: [${newColumnHeaders.join(', ')}]\nRow Headers: [${newRowHeaders.join(', ')}]`);
        }
      });
      
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleMatrix = (e) => {
    e.preventDefault();
    
    if (!currentUser?.username) {
      alert('User information not available. Please log in again.');
      return;
    }
    
    // Initialize headers to 0 for all columns and rows
    const finalColumnHeaders = Array(matrixX).fill(0);
    const finalRowHeaders = Array(matrixY).fill(0);
    
    // Update the state to show the initialized headers
    setColumnHeaders(finalColumnHeaders);
    setRowHeaders(finalRowHeaders);
    
    // Generate a 2D matrix with dimensions X, Y
    const generatedMatrix = [];
    const cellSelections = []; // Track user selections for each cell
    
    let cellNumber = 1; // Start with 1 and increment for each cell
    
    for (let x = 0; x < matrixX; x++) {
      generatedMatrix[x] = [];
      cellSelections[x] = [];
      for (let y = 0; y < matrixY; y++) {
        // Fill with continuous unique numbers starting from 1
        generatedMatrix[x][y] = cellNumber;
        cellNumber++; // Increment for next cell
        // Initialize empty selections array for each cell (max 5 selections)
        cellSelections[x][y] = [];
      }
    }
    
    const matrixData = {
      dimensions: { x: matrixX, y: matrixY },
      data: generatedMatrix,
      selections: cellSelections,
      columnHeaders: finalColumnHeaders,
      rowHeaders: finalRowHeaders,
      currentUser: currentUser.username
    };
    
    console.log('Matrix generated with headers initialized to 0:', matrixData);
    console.log('Column Headers:', matrixData.columnHeaders);
    console.log('Row Headers:', matrixData.rowHeaders);
    
    // Call the callback to pass the matrix to the parent and navigate to home
    if (onMatrixGenerated) {
      onMatrixGenerated(matrixData);
    }
  };

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>Welcome to the Admin Panel</h1>
        <p className="admin-user-role">User as Admin</p>
      </div>
      <div className="admin-content">
        <div className="admin-section">
          <form className="admin-form horizontal-form" onSubmit={handleAddUser}>
            <div className="form-group">
              <label htmlFor="username">User Name</label>
              <input 
                type="text" 
                id="username" 
                name="username" 
                placeholder="Enter new user's name" 
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input 
                type="password" 
                id="password" 
                name="password" 
                placeholder="Enter password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="admin-button">Add User</button>
          </form>
        </div>

        <div className="admin-section">
          <form className="admin-form horizontal-form" onSubmit={handleDeleteUser}>
            <div className="form-group">
              <label htmlFor="delete-username">User Name</label>
              <input 
                type="text" 
                id="delete-username" 
                name="delete-username" 
                placeholder="Enter user's name to delete" 
                value={deleteUsername}
                onChange={(e) => setDeleteUsername(e.target.value)}
              />
            </div>
            <button type="submit" className="admin-button danger">Delete User</button>
          </form>
        </div>

        <div className="admin-section">
          <form className="admin-form horizontal-form" onSubmit={handleCostPerCellUpdate}>
            <div className="form-group">
              <label htmlFor="cost-per-cell">Cost per Cell ($)</label>
              <input 
                type="number" 
                id="cost-per-cell" 
                name="cost-per-cell" 
                placeholder="Enter cost per cell" 
                value={costPerCell}
                onChange={(e) => setCostPerCell(Number(e.target.value))}
                min="0"
                step="0.01"
              />
            </div>
            <button type="submit" className="admin-button">Update Cost</button>
          </form>
        </div>

        <div className="admin-section">
          <form className="admin-form horizontal-form" onSubmit={handleMatrix}>
            <div className="form-group">
              <label htmlFor="current-user">Matrix for:</label>
              <div className="user-display">
                <strong>{currentUser?.username || 'Unknown User'}</strong>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="matrix-x">X</label>
              <input 
                type="number" 
                id="matrix-x" 
                name="matrix-x" 
                placeholder="X value" 
                value={matrixX}
                onChange={(e) => setMatrixX(Number(e.target.value))}
              />
            </div>
            <div className="form-group">
              <label htmlFor="matrix-y">Y</label>
              <input 
                type="number" 
                id="matrix-y" 
                name="matrix-y" 
                placeholder="Y value" 
                value={matrixY}
                onChange={(e) => setMatrixY(Number(e.target.value))}
              />
            </div>
            <div className="form-group" style={{display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'nowrap'}}>
              <button 
                type="button" 
                className="admin-button" 
                onClick={handleGenerateHeaders}
              >
                Gen. Header
              </button>
              {columnHeaders.length > 0 && (
                <span style={{fontSize: '0.9em', color: 'rgba(255,255,255,0.8)', whiteSpace: 'nowrap'}}>
                  <strong>Col:</strong> [{columnHeaders.join(', ')}]
                </span>
              )}
              {rowHeaders.length > 0 && (
                <span style={{fontSize: '0.9em', color: 'rgba(255,255,255,0.8)', whiteSpace: 'nowrap'}}>
                  <strong>Row:</strong> [{rowHeaders.join(', ')}]
                </span>
              )}
              <button type="submit" className="admin-button">Matrix</button>
            </div>
          </form>
        </div>

        <div className="admin-section">
          <h2>User List</h2>
          <table className="users-table">
            <thead>
              <tr>
                <th>User Name</th>
                <th>Role</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {registeredUsers.length > 0 ? (
                registeredUsers.map(user => (
                  <tr key={user._id}>
                    <td>{user.username}</td>
                    <td>{user.role}</td>
                    <td>{user.email || '--'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', fontStyle: 'italic', color: 'rgba(255, 255, 255, 0.5)' }}>No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
