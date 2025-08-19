import React from 'react';

const TestApp: React.FC = () => {
  console.log('TestApp component rendering');
  
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f0f0f0', 
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <h1 style={{ color: '#333', marginBottom: '20px' }}>Test React App</h1>
      <p style={{ color: '#666' }}>If you can see this, React is working!</p>
      <button 
        onClick={() => console.log('Button clicked!')}
        style={{
          padding: '10px 20px',
          backgroundColor: '#007acc',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginTop: '20px'
        }}
      >
        Test Button
      </button>
    </div>
  );
};

export default TestApp;
