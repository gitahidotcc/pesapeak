export default function Hero() {
  return (
    <section className="bg-background py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Take control of your finances,{' '}
              <span className="text-primary">effortlessly</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0">
              PesaPeak helps you understand your spending habits with smart categorization and insights. 
              Track expenses manually, organize your accounts, and get a complete picture of your financial 
              health—all in one place.
            </p>
            <div className="flex flex-col gap-6 justify-center lg:justify-start">
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="https://demo.pesapeak.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-primary text-primary-foreground px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary/90 transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
                >
                  Try Demo
                </a>
                <a
                  href="https://github.com/gitahicc/pesapeak"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-2 border-primary text-primary px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary hover:text-primary-foreground transition-colors duration-200"
                >
                  GitHub
                </a>
              </div>
              
              {/* App Store Badges */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity duration-200"
                >
                  <img 
                    src="/app-store-badge.png" 
                    alt="Download on the App Store"
                    className="h-12 w-auto"
                  />
                </a>
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity duration-200"
                >
                  <img 
                    src="/google-play-badge.webp" 
                    alt="Get it on Google Play"
                    className="h-12 w-auto"
                  />
                </a>
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity duration-200"
                >
                  <img 
                    src="/chrome-extension-badge.png" 
                    alt="Add to Chrome"
                    className="h-12 w-auto"
                  />
                </a>
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity duration-200"
                >
                  <img 
                    src="/firefox-addon.png" 
                    alt="Add to Firefox"
                    className="h-12 w-auto"
                  />
                </a>
              </div>
            </div>
          </div>

          {/* Screenshots */}
          <div className="relative">
            <div className="relative z-10">
              {/* Desktop Screenshot */}
              <div className="bg-card border border-border rounded-lg shadow-2xl p-4 transform rotate-2 hover:rotate-0 transition-transform duration-300">
                <div className="bg-muted rounded-md h-64 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary/20 rounded-lg mx-auto mb-4 flex items-center justify-center">
                      <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <p className="text-sm text-muted-foreground">Desktop View</p>
                  </div>
                </div>
              </div>

              {/* Mobile Screenshot */}
              <div className="absolute -bottom-8 -right-4 bg-card border border-border rounded-lg shadow-2xl p-2 w-32 h-48 transform -rotate-2 hover:rotate-0 transition-transform duration-300">
                <div className="bg-muted rounded-md h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-8 h-8 bg-primary/20 rounded-lg mx-auto mb-2 flex items-center justify-center">
                      <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <p className="text-xs text-muted-foreground">Mobile View</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
