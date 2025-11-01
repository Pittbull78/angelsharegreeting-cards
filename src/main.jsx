import React from 'react'
import ReactDOM from 'react-dom/client'
// This line tries to import the main App component from App.jsx in the SAME folder
import App from './App.jsx'
// This line tries to import the styles from index.css in the SAME folder
import './index.css'

// This finds the <div id="root"></div> in index.html and renders the App inside it.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)


