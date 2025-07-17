import React, { useState } from 'react';

export const AdminPanel = ({ onMatrixGenerated }) => {
  const [users, setUsers] = useState([]);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [deleteUsername, setDeleteUsername] = useState('');
  const [matrixX, setMatrixX] = useState(10);
  const [matrixY, setMatrixY] = useState(10);

  const handleAddUser = (e) => {
    e.preventDefault();
    if (newUsername.trim() === '') {
      alert('Please enter a username.');
      return;
    }
    const newUser = {
      id: Date.now(), // simple unique id
      username: newUsername,
      role: 'User',
    };
    setUsers([...users, newUser]);
    setNewUsername('');
    setNewPassword('');
  };

  const handleDeleteUser = (e) => {
    e.preventDefault();
    if (deleteUsername.trim() === '') {
      alert('Please enter a username to delete.');
      return;
    }
    if (!users.find(user => user.username === deleteUsername)) {
      alert('User not found.');
      return;
    }
    setUsers(users.filter(user => user.username !== deleteUsername));
    setDeleteUsername('');
  };

  const handleMatrix = (e) => {
    e.preventDefault();
    
    // Generate a 2D matrix with dimensions X, Y
    const generatedMatrix = [];
    for (let x = 0; x < matrixX; x++) {
      generatedMatrix[x] = [];
      for (let y = 0; y < matrixY; y++) {
        // Fill with random numbers between 1-100 for demonstration
        generatedMatrix[x][y] = Math.floor(Math.random() * 100) + 1;
      }
    }
    
    const matrixData = {
      dimensions: { x: matrixX, y: matrixY },
      data: generatedMatrix
    };
    
    console.log('Matrix generated:', matrixData);
    
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
          <form className="admin-form horizontal-form" onSubmit={handleMatrix}>
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
            <button type="submit" className="admin-button">Matrix</button>
          </form>
        </div>

        <div className="admin-section">
          <h2>User List</h2>
          <table className="users-table">
            <thead>
              <tr>
                <th>User Name</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map(user => (
                  <tr key={user.id}>
                    <td>{user.username}</td>
                    <td>{user.role}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2" style={{ textAlign: 'center', fontStyle: 'italic', color: 'rgba(255, 255, 255, 0.5)' }}>No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
