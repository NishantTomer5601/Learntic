import React from 'react';
import { getVSCodeAPI } from './vscode';

interface DetailsPanelProps {
  selectedFile: {
    name: string;
    path: string;
    type: string;
  } | null;
  summary: string;
}

const DetailsPanel: React.FC<DetailsPanelProps> = ({ selectedFile, summary }) => {
  const vscode = getVSCodeAPI();

  const handleGenerateSummary = () => {
    if (selectedFile && selectedFile.type === 'file') {
      vscode.postMessage({
        command: 'get-summary',
        path: selectedFile.path
      });
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      height: '100%', 
      overflow: 'auto',
      backgroundColor: '#f8f9fa',
      borderLeft: '1px solid #ddd'
    }}>
      <h2 style={{ marginTop: 0 }}>File Details</h2>
      
      {selectedFile ? (
        <div>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 10px 0' }}>{selectedFile.name}</h3>
            <p style={{ margin: '0 0 5px 0', color: '#666' }}>
              <strong>Path:</strong> {selectedFile.path}
            </p>
            <p style={{ margin: '0 0 15px 0', color: '#666' }}>
              <strong>Type:</strong> {selectedFile.type}
            </p>
          </div>

          {selectedFile.type === 'file' && (
            <div>
              <button 
                onClick={handleGenerateSummary}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#007acc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginBottom: '20px'
                }}
              >
                Generate Summary
              </button>
              
              {summary && (
                <div style={{
                  backgroundColor: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  padding: '15px',
                  marginTop: '15px'
                }}>
                  <h4 style={{ marginTop: 0 }}>Summary</h4>
                  <p style={{ 
                    whiteSpace: 'pre-wrap',
                    lineHeight: '1.5',
                    margin: 0
                  }}>
                    {summary}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <p style={{ color: '#666' }}>Select a file from the graph to view details</p>
      )}
    </div>
  );
};

export default DetailsPanel;
