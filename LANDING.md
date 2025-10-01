
Pesapeak Landing Page - Complete Specification
Overview
Pesapeak is a personal finance app designed to simplify understanding where your money goes. It acts as a comprehensive tracker for all your finances, helping you log, categorize, and manually sync all your accounts for a quick financial overview.

Design System
Brand Colors
Primary Color: #fa5207 (vibrant orange)
Supporting colors: refer to the globals.css config at @tooling/tailwind for context.
Typography
Modern, clean sans-serif fonts
Agent to choose appropriate web fonts
Design Style
Modern, minimal aesthetic
Subtle shadows and smooth transitions
Clean whitespace
Hover effects that enhance interactivity

Page Structure
1. Top Navigation
Layout:
Logo and "Pesapeak" name on the left
Navigation links on the right: Pricing | Docs | GitHub | Login | Try Demo (button)
Links:
Pricing: /pricing
Docs: https://docs.pesapeak.app
GitHub: https://github.com/gitahicc/pesapeak
Login: https://cloud.pesapeak.app
Try Demo: https://demo.pesapeak.app
Mobile Behavior:
Hamburger menu for navigation links
Logo remains visible

2. Hero Section
Tagline: "Take control of your finances, effortlessly"
Description: "Pesapeak helps you understand your spending habits with smart categorization and insights. Track expenses manually, organize your accounts, and get a complete picture of your financial health—all in one place."
Action Buttons:
"Try Demo" (primary button with brand color)
"GitHub" (secondary/outline button)
Screenshots:
Two placeholder screenshots: one desktop view, one mobile view
Layout: Overlapping arrangement for a modern feel
Desktop screenshot slightly behind and to the left, mobile in front and to the right
Use placeholder images with labels indicating "Desktop View" and "Mobile View"

3. Features Section
Layout: 3-column grid (responsive: stacks to 1 column on mobile)
Features (6 total):
Smart Categorization


Icon: Tag/label icon
Description: "AI-powered expense classification saves you time and keeps your finances organized automatically"
Multi-Account Management


Icon: Wallet/accounts icon
Description: "Create and manage multiple accounts to organize your finances exactly the way you want"
Budget Tracking


Icon: Target/goal icon
Description: "Set spending limits and get alerts when you're approaching your budget thresholds"
Visual Insights


Icon: Chart/analytics icon
Description: "Beautiful charts and graphs that make understanding your spending patterns effortless"
Cross-Platform


Icon: Devices/mobile icon
Description: "Access your financial data anywhere—mobile apps, web dashboard, and browser extensions"
Privacy-First


Icon: Lock/shield icon
Description: "Your data stays yours. Self-host or use our secure cloud with bank-level encryption"
Card Style:
Subtle shadow
Icon at top
Feature title (bold)
Description text

4. App and Extension Integrations
Title: "Available Everywhere"
Layout: Horizontal row of badges (responsive: wraps on smaller screens)
Badges (clickable links):
App Store (iOS)
Google Play (Android)
Chrome Web Store
Firefox Add-ons
Note to implementer: User will provide actual badge images and URLs. Use placeholder badges for now with labels.

5. Footer
Layout: Minimal, single row
Left side:
Copyright: "© 2025 Pesapeak by Qualitech Labs"
"Qualitech Labs" links to: https://www.qualitechlabs.org
Right side:
Docs link: /docs
GitHub link: https://github.com/gitahicc/pesapeak

Pricing Page
Layout
Three pricing tiers displayed as cards, centered on page
Tier 1: Free
Price: $0
Features:
Unlimited expense logs
Mobile & web apps
Browser extensions
Action Button: "Join Waitlist" (links to placeholder /waitlist)
Tier 2: Pro
Price: $2.99/month
Badge: "Most Popular" or similar highlight
Features:
Unlimited expense logs & budgets
50 GB storage
AI-powered classification & insights
All features included in the Free tier
Action Button: "Join Waitlist" (links to placeholder /waitlist)
Visual Treatment: Slightly elevated/emphasized compared to other tiers
Tier 3: Self-Hosted
Price: Free
Features:
Completely free and fully-featured
Utilize your own servers and API keys
Open source
Action Button: "Go to Docs" (links to https://docs.pesapeak.app)

FAQ Section (Pricing Page Only)
Title: "Frequently Asked Questions"
Questions & Answers:
Q: What happens to my data if I cancel? A: Your data will be available for 30 days after cancellation. You can export your data at any time.
Q: Are there any restrictions in the self-hosted version? A: No. The self-hosted version is completely free, fully-featured, and open source. You just need to provide your own hosting infrastructure.
Q: Do you offer refunds? A: Yes, we offer a 7-day money-back guarantee for all paid plans.
Q: How should I contact you if I have any questions? A: You can reach us at support@pesapeak.app.
Layout: 2-column grid on desktop, single column on mobile. Each Q&A in an expandable accordion or simple card format.

Responsive Behavior
Desktop: Full layout as described
Tablet: Features grid becomes 2 columns, other sections adapt naturally
Mobile:
Hamburger menu for navigation
Single column layouts
Screenshot overlap reduces but maintains visual hierarchy
Touch-friendly button sizes

Implementation Notes
Use modern CSS (Flexbox/Grid) for layouts
Smooth transitions on interactive elements
Ensure accessibility (proper heading hierarchy, alt text, keyboard navigation)
Optimize for performance (lazy load images, efficient CSS)
The user will provide actual images for app store badges later - use placeholders with clear labels
Maintain consistent spacing and rhythm throughout
Use the primary brand color (#fa5207) for CTAs, links, and accents



