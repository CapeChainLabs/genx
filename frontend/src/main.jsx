import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { WalletProvider } from './contexts/WalletContext.jsx'
import Scene3D from './components/Scene3D.jsx'
import App from './App.jsx'
import './styles/globals.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <WalletProvider>
      <Suspense fallback={null}>
        <Scene3D />
      </Suspense>
      <div className="ambient-orb purple" />
      <div className="ambient-orb teal" />
      <div className="ambient-orb blue" />
      <div className="grid-floor" />
      <App />
    </WalletProvider>
  </StrictMode>,
)
