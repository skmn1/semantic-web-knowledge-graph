import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { OidcProvider } from './components/OidcProvider';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <OidcProvider>
      <App />
    </OidcProvider>
  </React.StrictMode>
);
