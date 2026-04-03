import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { EmbedMode } from './components/EmbedMode'

const isEmbed = new URLSearchParams(window.location.search).has('embed')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isEmbed ? <EmbedMode /> : <App />}
  </StrictMode>,
)
