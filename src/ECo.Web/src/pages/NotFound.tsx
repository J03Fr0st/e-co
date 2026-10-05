import { Link } from 'react-router'

export function NotFound() {
  return (
    <section aria-labelledby="not-found-title" className="max-w-prose rounded-sign bg-tile-raised p-6 shadow-panel sm:p-8">
      <h1 id="not-found-title" className="sign-type text-4xl text-enamel">
        No machine at this address
      </h1>
      <p className="mt-4">
        <span className="readout mr-2 rounded-sticker bg-ink px-2 py-1 text-sm text-tile-raised">E-404</span>
        The page may have moved, or the link has a typo.
      </p>
      <Link to="/" className="mt-4 inline-flex min-h-11 items-center font-semibold text-enamel underline">
        Back to the shop
      </Link>
    </section>
  )
}
