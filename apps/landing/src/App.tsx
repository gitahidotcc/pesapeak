
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navigation from './components/navigation'
import HomePage from './pages/home'
import PricingPage from './pages/pricing'
import WaitlistPage from './pages/waitlist'
import Footer from './components/footer'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Navigation />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/waitlist" element={<WaitlistPage />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  )
}

export default App
