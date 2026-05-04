import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#131316',
            color: '#e8e8e8',
            border: '1px solid rgba(255,107,0,0.3)',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '13px',
          },
          success: {
            iconTheme: { primary: '#FF6B00', secondary: '#070708' },
          },
          error: {
            iconTheme: { primary: '#ff4444', secondary: '#070708' },
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
)
