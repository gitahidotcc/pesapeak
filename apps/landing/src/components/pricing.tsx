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
    buttonLink: "https://tally.so/r/mRp7LK",
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
    buttonLink: "https://tally.so/r/mRp7LK",
    popular: true
  },
  {
    name: "Self-Hosted",
    price: "Free",
    description: "Own your data",
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

import { useState } from 'react'

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
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  return (
    <div className="bg-background min-h-screen">

      {/* Pricing Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
           
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Simple, transparent{' '}
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                pricing
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Choose the plan that works best for you. All plans include our core features.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingTiers.map((tier, index) => (
              <div
                key={index}
                className={`group relative bg-card/50 backdrop-blur-sm border rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
                  tier.popular 
                    ? 'border-primary shadow-lg scale-105 ring-2 ring-primary/20' 
                    : 'border-border/50 shadow-sm hover:border-border'
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative text-center mb-8">
                  <h3 className="text-2xl font-bold text-foreground mb-3">{tier.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-foreground">{tier.price}</span>
                    {tier.period && (
                      <span className="text-muted-foreground text-lg">{tier.period}</span>
                    )}
                  </div>
                  <p className="text-muted-foreground">{tier.description}</p>
                </div>

                <ul className="space-y-4 mb-8 relative">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <div className="flex-shrink-0 w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center mr-3 mt-0.5">
                        <svg className="w-3 h-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href={tier.buttonLink}
                  target={tier.buttonLink.startsWith('http') ? '_blank' : undefined}
                  rel={tier.buttonLink.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className={`relative w-full block text-center py-3 px-6 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 ${
                    tier.popular
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'border-2 border-border text-foreground hover:border-primary hover:text-primary hover:bg-primary/5'
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
      <section className="py-20 bg-muted/30 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Frequently Asked{' '}
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Questions
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to know about PesaPeak
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className="group relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-card/30 transition-colors duration-200"
                >
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-300 pr-4">
                    {faq.question}
                  </h3>
                  <div className="flex-shrink-0">
                    <svg 
                      className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${
                        openFaq === index ? 'rotate-180' : ''
                      }`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
                <div 
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    openFaq === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-6 pb-6 pt-0">
                    <div className="absolute left-6 top-16 w-px h-8 bg-gradient-to-b from-primary/20 to-transparent"></div>
                    <p className="text-muted-foreground leading-relaxed pl-6">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}
