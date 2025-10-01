import { Link } from 'react-router-dom'

export default function Waitlist() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-20 px-4">
      <div className="max-w-lg mx-auto text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">
          Thanks for joining the waitlist
        </h1>
        
        <p className="text-muted-foreground mb-8">
          We'll update you as soon as possible to get access to the beta.
        </p>

        <Link
          to="/"
          className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  )
}
