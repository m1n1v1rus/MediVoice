import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'rgba(15,15,30,0.95)',
              border: '1px solid rgba(6,214,160,0.2)',
              color: '#e2e8f0',
              backdropFilter: 'blur(20px)',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#06d6a0', secondary: '#060612' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#060612' },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)