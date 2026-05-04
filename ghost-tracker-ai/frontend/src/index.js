import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Reset all browser defaults
const globalStyle = document.createElement('style');
globalStyle.textContent = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #030b12; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: rgba(0,255,136,0.03); }
  ::-webkit-scrollbar-thumb { background: rgba(0,255,136,0.2); border-radius: 2px; }
  input:focus { outline: none; border-color: rgba(0,255,136,0.4) !important; }
`;
document.head.appendChild(globalStyle);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<React.StrictMode><App /></React.StrictMode>);
