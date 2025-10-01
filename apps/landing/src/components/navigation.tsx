import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link 
                to="/"
                className="flex items-center space-x-2 hover:opacity-80 transition-opacity duration-200"
              >
                <img 
                  src="/icons/logo-icon.svg" 
                  alt="PesaPeak Logo" 
                  className="h-8 w-8"
                />
                <span className="text-2xl font-bold text-primary">
                  PesaPeak
                </span>
              </Link>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link
                to="/pricing"
                className="text-foreground hover:text-primary transition-colors duration-200"
              >
                Pricing
              </Link>
              <a
                href="https://docs.pesapeak.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground hover:text-primary transition-colors duration-200"
              >
                Docs
              </a>
              <a
                href="https://github.com/gitahicc/pesapeak"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground hover:text-primary transition-colors duration-200"
              >
                GitHub
              </a>
              <a
                href="https://cloud.pesapeak.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground hover:text-primary transition-colors duration-200"
              >
                Login
              </a>
              <a
                href="https://demo.pesapeak.app"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors duration-200"
              >
                Try Demo
              </a>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-foreground hover:text-primary focus:outline-none focus:text-primary transition-colors duration-200"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link
                to="/pricing"
                className="block px-3 py-2 text-foreground hover:text-primary transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Pricing
              </Link>
              <a
                href="https://docs.pesapeak.app"
                target="_blank"
                rel="noopener noreferrer"
                className="block px-3 py-2 text-foreground hover:text-primary transition-colors duration-200"
              >
                Docs
              </a>
              <a
                href="https://github.com/gitahicc/pesapeak"
                target="_blank"
                rel="noopener noreferrer"
                className="block px-3 py-2 text-foreground hover:text-primary transition-colors duration-200"
              >
                GitHub
              </a>
              <a
                href="https://cloud.pesapeak.app"
                target="_blank"
                rel="noopener noreferrer"
                className="block px-3 py-2 text-foreground hover:text-primary transition-colors duration-200"
              >
                Login
              </a>
              <a
                href="https://demo.pesapeak.app"
                target="_blank"
                rel="noopener noreferrer"
                className="block px-3 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors duration-200"
              >
                Try Demo
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
