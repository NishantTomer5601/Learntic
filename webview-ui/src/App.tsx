import React, { useState, useEffect } from 'react';
import { getVSCodeAPI } from './vscode';
import DetailsPanel from './DetailsPanel';
import type { Message, LoadDataMessage, ShowSummaryMessage } from './types';

import './App.css';

const App: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    path: string;
    type: string;
  } | null>(null);
  const [summary, setSummary] = useState<string>('');

  const vscode = getVSCodeAPI();

  useEffect(() => {
    console.log('Setting up message listener...');
    const handleMessage = (event: MessageEvent) => {
      const message: Message = event.data;
      console.log('Received message:', message);
      
      switch (message.command) {
        case 'load-data':
          const loadMessage = message as LoadDataMessage;
          console.log('Loading data:', loadMessage.data);
          setData(loadMessage.data);
          break;
          
        case 'show-summary':
          const summaryMessage = message as ShowSummaryMessage;
          setSummary(summaryMessage.summary);
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const handleFileClick = (file: any) => {
    console.log('File clicked:', file);
    const fileInfo = {
      name: file.name,
      path: file.path,
      type: file.type
    };
    
    setSelectedFile(fileInfo);
    setSummary('');
    
    if (file.type === 'file') {
      vscode.postMessage({
        command: 'open-file',
        path: file.path
      });
    }
  };

  const renderTree = (items: any[], level = 0) => {
    return items.map((item) => (
      <div key={item.id} style={{ marginLeft: `${level * 20}px`, margin: '5px 0' }}>
        <div 
          onClick={() => handleFileClick(item)}
          style={{
            padding: '5px 10px',
            backgroundColor: item.type === 'directory' ? '#e1f5fe' : '#f3e5f5',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'inline-block',
            minWidth: '200px'
          }}
        >
          {item.type === 'directory' ? '📁' : '📄'} {item.name}
        </div>
        {item.children && item.children.length > 0 && (
          <div style={{ marginLeft: '20px' }}>
            {renderTree(item.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  console.log('App render - data items:', data.length);

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ flex: 1, height: '100%', overflow: 'auto', padding: '20px' }}>
        <h2>Project Structure</h2>
        {data.length > 0 ? (
          <div>
            {renderTree(data)}
          </div>
        ) : (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '50%',
            color: '#666',
            fontSize: '18px'
          }}>
            Loading project structure...
          </div>
        )}
      </div>
      <div style={{ width: '400px' }}>
        <DetailsPanel selectedFile={selectedFile} summary={summary} />
      </div>
    </div>
  );
};

export default App;
