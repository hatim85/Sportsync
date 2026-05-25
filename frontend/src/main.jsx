import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './mobile.css'
import { Provider } from 'react-redux'
import store from './redux/store'
import axios from 'axios';

import { ThemeProvider } from './contexts/ThemeContext'

// --- NGROK UNIVERSAL CORS FIX ---
// 1. Fix for 'fetch'
const originalFetch = window.fetch;
window.fetch = function() {
    let [resource, config] = arguments;
    if (typeof resource === 'string' && resource.includes('ngrok-free.dev')) {
        config = config || {};
        config.headers = config.headers || {};
        // Add header to bypass ngrok warning page
        if (config.headers instanceof Headers) {
            config.headers.append('ngrok-skip-browser-warning', 'true');
        } else {
            config.headers['ngrok-skip-browser-warning'] = 'true';
        }
    }
    return originalFetch.apply(this, [resource, config]);
};

// 2. Fix for 'axios'
axios.interceptors.request.use((config) => {
    if (config.url && config.url.includes('ngrok-free.dev')) {
        config.headers['ngrok-skip-browser-warning'] = 'true';
    }
    return config;
});
// --------------------------------

ReactDOM.createRoot(document.getElementById('root')).render(
  <>
    <Provider store={store}>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </Provider>
  </>
)
