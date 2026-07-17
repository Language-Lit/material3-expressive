import React from 'react'
import ReactDOM from 'react-dom/client'
import { Material3Provider } from '../src/context/Material3Provider'
import { App } from './App'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Material3Provider>
      <App />
    </Material3Provider>
  </React.StrictMode>,
)
