import React, { useState } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { SettingsCollection } from '/imports/api/settings';

export const MainContent = ({ matrix, onCellSelect, loggedInUser, currentUser }) => {
  const [warningMessage, setWarningMessage] = useState('');

  // Subscribe to settings to get cost per cell
  const { costPerCell } = useTracker(() => {
    const settingsHandle = Meteor.subscribe('settings');
    const costSetting = SettingsCollection.findOne({ key: 'costPerCell' });
    
    return {
      costPerCell: costSetting ? costSetting.value : 4 // Default value of 4 if not found
    };
  }, []);

  // Calculate user statistics from matrix selections
  const getUserStats = () => {
    if (!matrix || !matrix.selections) {
      console.log('No matrix or selections available');
      return [];
    }
    
    const userStats = {};
    console.log('Matrix selections:', matrix.selections);
    
    // Iterate through all cells to count selections per user
    for (let rowIndex = 0; rowIndex < matrix.data.length; rowIndex++) {
      for (let colIndex = 0; colIndex < matrix.data[rowIndex].length; colIndex++) {
        const selections = matrix.selections[rowIndex]?.[colIndex] || [];
        console.log(`Cell [${rowIndex}][${colIndex}] selections:`, selections);
        
        selections.forEach(username => {
          if (username && username.trim()) { // Make sure username is valid
            if (!userStats[username]) {
              userStats[username] = { username, cellsSelected: 0, totalCost: 0 };
            }
            userStats[username].cellsSelected++;
            userStats[username].totalCost = userStats[username].cellsSelected * costPerCell;
          }
        });
      }
    }
    
    const result = Object.values(userStats).sort((a, b) => b.cellsSelected - a.cellsSelected);
    console.log('User stats calculated:', result);
    return result;
  };

  // Debug logging for headers
  React.useEffect(() => {
    if (matrix) {
      console.log('Matrix received in MainContent:', matrix);
      console.log('Column Headers:', matrix.columnHeaders);
      console.log('Row Headers:', matrix.rowHeaders);
    }
  }, [matrix]);

  const handleCellClick = (rowIndex, colIndex) => {
    // Clear any existing warning message
    setWarningMessage('');
    
    if (loggedInUser && loggedInUser.trim() && onCellSelect) {
      // Check if user is admin (allow unlimited selections)
      const isAdmin = currentUser && currentUser.isAdmin;
      
      if (!isAdmin) {
        // Count current user's selections
        let userSelectionCount = 0;
        const currentSelections = matrix.selections[rowIndex]?.[colIndex] || [];
        const userAlreadySelected = currentSelections.includes(loggedInUser);
        
        // Count total selections by this user across all cells
        for (let r = 0; r < matrix.data.length; r++) {
          for (let c = 0; c < matrix.data[r].length; c++) {
            const cellSelections = matrix.selections[r]?.[c] || [];
            if (cellSelections.includes(loggedInUser)) {
              userSelectionCount++;
            }
          }
        }
        
        // If user already selected this cell, they can unselect it (no limit check needed)
        if (userAlreadySelected) {
          // Proceed with unselection
          onCellSelect(rowIndex, colIndex);
          return;
        }
        
        // If user hasn't selected this cell and would exceed limit
        if (userSelectionCount >= 10) {
          setWarningMessage('⚠️ You have reached the maximum of 10 cell selections! To select a new cell, please unselect one of your existing selections first.');
          return; // Don't proceed with selection
        }
      }
      
      onCellSelect(rowIndex, colIndex);
    } else {
      alert('Please generate a matrix with your name in the Admin panel first!');
    }
  };

  const getCellDisplay = (rowIndex, colIndex) => {
    if (!matrix.selections || !matrix.selections[rowIndex] || !matrix.selections[rowIndex][colIndex]) {
      return matrix.data[rowIndex][colIndex]; // Show original number if no selections
    }
    
    const selections = matrix.selections[rowIndex][colIndex];
    if (selections.length === 0) {
      return matrix.data[rowIndex][colIndex]; // Show original number if no selections
    }
    
    // Show usernames separated by commas
    return selections.join(', ');
  };

  const getCellClass = (rowIndex, colIndex) => {
    if (!matrix.selections || !matrix.selections[rowIndex] || !matrix.selections[rowIndex][colIndex]) {
      return 'matrix-cell';
    }
    
    const selections = matrix.selections[rowIndex][colIndex];
    const selectionCount = selections.length;
    
    if (selectionCount === 0) return 'matrix-cell';
    if (selectionCount >= 5) return 'matrix-cell matrix-cell-full';
    return `matrix-cell matrix-cell-selected matrix-cell-selected-${selectionCount}`;
  };

  return (
    <main className="main-content">
      <article>
        <h1 className="welcome-title">Welcome to the Pool</h1>
        <p className="welcome-subtitle">Where Luck and Strategy Meets!</p>
        <p className="welcome-tagline">-- 99% Dump Luck and 1% Strategy --</p>
        
        {matrix && (
          <div className="matrix-display">
            <h2>Interactive Matrix ({matrix.dimensions.x} × {matrix.dimensions.y})</h2>
            
            <div className="user-input-section">
              <div className="logged-in-user">
                <span className="user-label">Logged in as:</span>
                <span className="user-name-display">{loggedInUser || 'No user logged in'}</span>
              </div>
              
              {warningMessage && (
                <div className="warning-message">
                  {warningMessage}
                </div>
              )}
              <p className="selection-info">
                {loggedInUser 
                  ? 'Click on any cell to add your name (up to 5 names per cell)'
                  : 'Generate a matrix with your name in the Admin panel to start selecting cells'
                }
              </p>
            </div>
            
            <div className="matrix-container">
              <table className="matrix-table">
                {/* Column headers */}
                {matrix.columnHeaders && matrix.columnHeaders.length > 0 && (
                  <thead>
                    <tr>
                      {/* Empty cell for row header space */}
                      {matrix.rowHeaders && matrix.rowHeaders.length > 0 && <th className="header-cell"></th>}
                      {matrix.columnHeaders.map((header, index) => (
                        <th key={index} className="header-cell column-header">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                )}
                <tbody>
                  {matrix.data.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {/* Row header */}
                      {matrix.rowHeaders && matrix.rowHeaders.length > 0 && (
                        <th className="header-cell row-header">
                          {matrix.rowHeaders[rowIndex] !== undefined ? matrix.rowHeaders[rowIndex] : ''}
                        </th>
                      )}
                      {row.map((value, colIndex) => (
                        <td 
                          key={colIndex} 
                          className={getCellClass(rowIndex, colIndex)}
                          onClick={() => handleCellClick(rowIndex, colIndex)}
                          title={`Click to select this cell. Current selections: ${matrix.selections?.[rowIndex]?.[colIndex]?.length || 0}/5`}
                        >
                          {getCellDisplay(rowIndex, colIndex)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* User Statistics Table */}
        {matrix && (
          <div className="user-stats-section">
            <h2 className="stats-title">May the Luck Be with You!</h2>
            
            {/* Debug info */}
            <div style={{background: 'rgba(255,255,255,0.1)', padding: '10px', marginBottom: '10px', fontSize: '0.8em'}}>
              <strong>Debug Info:</strong> Cost per cell: ${costPerCell} | 
              User stats count: {getUserStats().length} | 
              Matrix has selections: {matrix.selections ? 'Yes' : 'No'}
            </div>
            
            <table className="user-stats-table">
              <thead>
                <tr>
                  <th>User Name</th>
                  <th>Cells Selected</th>
                  <th>Total Cost</th>
                </tr>
              </thead>
              <tbody>
                {getUserStats().length > 0 ? (
                  getUserStats().map((userStat, index) => (
                    <tr key={index}>
                      <td>{userStat.username}</td>
                      <td>{userStat.cellsSelected}</td>
                      <td>${userStat.totalCost.toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', fontStyle: 'italic', color: '#888' }}>
                      No cell selections yet. Start clicking on cells to join the pool!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </article>
    </main>
  );
};
