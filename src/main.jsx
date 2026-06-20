import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles/global.css';

// Note: no <React.StrictMode> here on purpose — StrictMode double-invokes
// effects in dev, which would run paper.setup() twice on the same canvas.
createRoot(document.getElementById('root')).render(<App />);
