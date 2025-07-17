import React from 'react';

export const MainContent = ({ matrix }) => (
  <main className="main-content">
    <article>
      <h1 className="welcome-title">Welcome to the Pool</h1>
      <p className="welcome-subtitle">Where Luck and Strategy Meets!</p>
      <p className="welcome-tagline">-- 99% Dump Luck and 1% Strategy --</p>
      
      {matrix && (
        <div className="matrix-display">
          <h2>Generated Matrix ({matrix.dimensions.x} × {matrix.dimensions.y})</h2>
          <div className="matrix-container">
            <table className="matrix-table">
              <tbody>
                {matrix.data.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((value, colIndex) => (
                      <td key={colIndex} className="matrix-cell">
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </article>
  </main>
);
