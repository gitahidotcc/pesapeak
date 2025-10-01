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
    <section className="py-20 bg-muted/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Available Everywhere
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Access PesaPeak on all your devices and platforms with seamless synchronization
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-8 lg:gap-12">
          {integrations.map((integration, index) => (
            <a
              key={index}
              href={integration.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center"
            >
              <img 
                src={integration.image} 
                alt={`${integration.name} Badge`}
                className="h-12 w-auto object-contain rounded-xl shadow-sm"
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
