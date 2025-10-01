const integrations = [
  {
    name: "App Store",
    platform: "iOS",
    placeholder: "App Store Badge"
  },
  {
    name: "Google Play",
    platform: "Android", 
    placeholder: "Google Play Badge"
  },
  {
    name: "Chrome Web Store",
    platform: "Browser",
    placeholder: "Chrome Badge"
  },
  {
    name: "Firefox Add-ons",
    platform: "Browser",
    placeholder: "Firefox Badge"
  }
]

export default function Integrations() {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Available Everywhere
          </h2>
          <p className="text-xl text-muted-foreground">
            Access PesaPeak on all your devices and platforms
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          {integrations.map((integration, index) => (
            <div
              key={index}
              className="bg-card border border-border rounded-lg p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 min-w-[200px] text-center"
            >
              <div className="bg-muted rounded-lg h-16 flex items-center justify-center mb-4">
                <div className="text-center">
                  <div className="w-8 h-8 bg-primary/20 rounded-lg mx-auto mb-2 flex items-center justify-center">
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-xs text-muted-foreground">{integration.placeholder}</p>
                </div>
              </div>
              <h3 className="font-semibold text-foreground mb-1">
                {integration.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {integration.platform}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
