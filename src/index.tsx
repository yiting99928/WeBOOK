import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthContextProvider } from './context/authContext';
import './index.css';
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  // <StrictMode>
    <AuthContextProvider>
      <App />
    </AuthContextProvider>
  // </StrictMode>
);
