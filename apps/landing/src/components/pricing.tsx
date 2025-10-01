const pricingTiers = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for getting started",
    features: [
      "Unlimited expense logs",
      "Mobile & web apps",
      "Browser extensions"
    ],
    buttonText: "Join Waitlist",
    buttonLink: "/waitlist",
    popular: false
  },
  {
    name: "Pro",
    price: "$2.99",
    period: "/month",
    description: "Most popular choice",
    features: [
      "Unlimited expense logs & budgets",
      "50 GB storage",
      "AI-powered classification & insights",
      "All features included in the Free tier"
    ],
    buttonText: "Join Waitlist",
    buttonLink: "/waitlist",
    popular: true
  },
  {
    name: "Self-Hosted",
    price: "Free",
    description: "For developers and organizations",
    features: [
      "Completely free and fully-featured",
      "Utilize your own servers and API keys",
      "Open source"
    ],
    buttonText: "Go to Docs",
    buttonLink: "https://docs.pesapeak.app",
    popular: false
  }
]

const faqs = [
  {
    question: "What happens to my data if I cancel?",
    answer: "Your data will be available for 30 days after cancellation. You can export your data at any time."
  },
  {
    question: "Are there any restrictions in the self-hosted version?",
    answer: "No. The self-hosted version is completely free, fully-featured, and open source. You just need to provide your own hosting infrastructure."
  },
  {
    question: "Do you offer refunds?",
    answer: "Yes, we offer a 7-day money-back guarantee for all paid plans."
  },
  {
    question: "How should I contact you if I have any questions?",
    answer: "You can reach us at support@pesapeak.app."
  }
]

export default function Pricing() {
  return (
    <div className="bg-background min-h-screen">

      {/* Pricing Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Simple, transparent pricing
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Choose the plan that works best for you. All plans include our core features.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingTiers.map((tier, index) => (
              <div
                key={index}
                className={`bg-card border rounded-lg p-8 relative ${
                  tier.popular 
                    ? 'border-primary shadow-lg scale-105' 
                    : 'border-border shadow-sm'
                } hover:shadow-lg transition-all duration-300`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-foreground mb-2">{tier.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-foreground">{tier.price}</span>
                    {tier.period && (
                      <span className="text-muted-foreground">{tier.period}</span>
                    )}
                  </div>
                  <p className="text-muted-foreground">{tier.description}</p>
                </div>

                <ul className="space-y-4 mb-8">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <svg className="w-5 h-5 text-primary mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href={tier.buttonLink}
                  target={tier.buttonLink.startsWith('http') ? '_blank' : undefined}
                  rel={tier.buttonLink.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className={`w-full block text-center py-3 px-6 rounded-lg font-semibold transition-colors duration-200 ${
                    tier.popular
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground'
                  }`}
                >
                  {tier.buttonText}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-card border border-border rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  {faq.question}
                </h3>
                <p className="text-muted-foreground">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="text-sm text-muted-foreground mb-4 sm:mb-0">
              © 2025 PesaPeak by{' '}
              <a
                href="https://www.qualitechlabs.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 transition-colors duration-200"
              >
                Qualitech Labs
              </a>
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
    </div>
  )
}
