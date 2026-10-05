/** States only what is true of the site today; S13 completes it as features land. */
export function Privacy() {
  return (
    <article aria-labelledby="privacy-title" className="max-w-prose rounded-sign bg-tile-raised p-6 shadow-panel sm:p-8">
      <h1 id="privacy-title" className="sign-type text-4xl text-enamel">
        Privacy note
      </h1>
      <div className="mt-4 flex flex-col gap-3">
        <p>Long Cycle is a fictional store built as a portfolio project. Nothing here is sold and no order is real.</p>
        <p>
          The site uses no analytics, tracking or advertising cookies. It sets security cookies that protect forms from
          being submitted by other sites, and nothing else.
        </p>
        <p>It does not collect personal details yet. This note will say exactly what is kept, and for how long, before it does.</p>
      </div>
    </article>
  )
}
