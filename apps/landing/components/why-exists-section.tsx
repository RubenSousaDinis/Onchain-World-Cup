export function WhyExistsSection() {
  return (
    <section className="border-b border-border bg-card py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-8 text-4xl font-bold text-primary">Why This Exists</h2>
          <div className="space-y-6 text-xl leading-relaxed">
            <p className="text-2xl font-semibold text-foreground">
              Football is emotional.
              <br />
              Crypto is coordination.
            </p>
            <p className="text-2xl font-semibold text-primary">Onchain World Cup combines both.</p>
            <div className="cm-panel mx-auto mt-8 max-w-2xl rounded-sm p-8 text-left">
              <p className="mb-4 font-semibold text-primary">It's about:</p>
              <ul className="space-y-3 text-lg">
                <li className="flex items-center gap-3">
                  <span className="text-accent">▸</span> National pride
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-accent">▸</span> Social coordination
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-accent">▸</span> Transparent rules
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-accent">▸</span> Global participation
                </li>
              </ul>
            </div>
            <p className="pt-6 text-2xl font-bold text-accent">If enough people support your team — it wins.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
