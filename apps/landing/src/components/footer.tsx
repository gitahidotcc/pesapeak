export default function Footer() {
  return (
    <footer className="bg-background border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <div className="flex items-center space-x-3 text-sm text-muted-foreground mb-4 sm:mb-0">
            <img 
              src="/icons/logo-icon.svg" 
              alt="PesaPeak Logo" 
              className="h-5 w-5"
            />
            <span>
              © 2025 PesaPeak by{' '}
              <a
                href="https://www.qualitechlabs.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 transition-colors duration-200"
              >
                Qualitech Labs
              </a>
            </span>
          </div>
          <div className="flex space-x-6">
            <a
              href="/docs"
              className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
            >
              Docs
            </a>
            <a
              href="https://github.com/gitahicc/pesapeak"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
