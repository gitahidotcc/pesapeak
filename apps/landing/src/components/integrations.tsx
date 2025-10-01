const integrations = [
  {
    name: "App Store",
    platform: "iOS",
    image: "/app-store-badge.png",
    link: "#"
  },
  {
    name: "Google Play",
    platform: "Android", 
    image: "/google-play-badge.webp",
    link: "#"
  },
  {
    name: "Chrome Web Store",
    platform: "Browser",
    image: "/chrome-extension-badge.png",
    link: "#"
  },
  {
    name: "Firefox Add-ons",
    platform: "Browser",
    image: "/firefox-addon.png",
    link: "#"
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
            <a
              key={index}
              href={integration.link}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-card border border-border rounded-lg p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 min-w-[200px] text-center block"
            >
              <div className="rounded-lg h-16 flex items-center justify-center mb-4 overflow-hidden">
                <img 
                  src={integration.image} 
                  alt={`${integration.name} Badge`}
                  className="h-full w-auto object-contain"
                />
              </div>
              <h3 className="font-semibold text-foreground mb-1">
                {integration.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {integration.platform}
              </p>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
