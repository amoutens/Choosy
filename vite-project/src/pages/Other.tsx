import { Link } from 'react-router-dom'

export default function Other() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white">
      <div className="p-8 text-center">
        <h1 style={{ fontSize: 36 }}>Other Page</h1>
        <p className="mt-4">This is a placeholder secondary page.</p>
        <p className="mt-6">
          <Link to="/" className="text-choosyPurple underline">
            Back home
          </Link>
        </p>
      </div>
    </main>
  )
}
