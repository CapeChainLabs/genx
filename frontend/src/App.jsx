import { Header } from './components/Header.jsx'
import { Hero } from './components/Hero.jsx'
import { WalletConnect } from './components/WalletConnect.jsx'
import { CreateMode } from './components/CreateMode.jsx'
import { Explore } from './components/Explore.jsx'
import { Mining } from './components/Mining.jsx'
import { Dashboard } from './components/Dashboard.jsx'
import { useWallet } from './contexts/WalletContext.jsx'

function App() {
  const { wallet } = useWallet()

  return (
    <div className="app" id="top">
      <Header />
      <main>
        <Hero />
        {!wallet.isConnected && <WalletConnect />}
        <CreateMode />
        <Explore />
        <Mining />
        <Dashboard />
      </main>
      <footer className="footer">
        <p>GenX Blockchain — Build Different</p>
      </footer>
    </div>
  )
}

export default App
