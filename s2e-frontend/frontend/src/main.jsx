import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './index.css'
import './styles/admin-styles.css'
import './styles/site-styles.css'
import './styles/seller-auth.css'
import './styles/product-styles.css'
import './styles/seller-ui-styles.css'
import 'bootstrap'
import $ from 'jquery'
import App from './App.jsx'
import { AppProvider } from './context/AppContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </StrictMode>,
)

// Expose jQuery globally for legacy scripts
// eslint-disable-next-line no-undef
window.$ = $
// eslint-disable-next-line no-undef
window.jQuery = $
