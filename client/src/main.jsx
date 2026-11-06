/* Crafted by Ayush Mishra */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Signature log: subtle, classy, orange accent
if (typeof window !== 'undefined') {
  console.log(
    '%c Crafted by Ayush Mishra · https://ayush110109mishra.github.io/Through-My-Frames/ ',
    'background: #0a0e1a; color: #ff8c2b; font-weight: bold; border-radius: 4px; padding: 4px 8px; border: 1px solid rgba(255, 107, 44, 0.4); font-size: 11px;'
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
