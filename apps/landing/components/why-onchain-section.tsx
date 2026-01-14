import { Shield, Globe, CheckCircle, Users } from "lucide-react"

export function WhyOnchainSection() {
  const features = [
    {
      icon: Shield,
      title: "Open & permissionless",
    },
    {
      icon: Globe,
      title: "Global by default",
    },
    {
      icon: CheckCircle,
      title: "Verifiable outcomes",
    },
    {
      icon: Users,
      title: "Social coordination beats prediction",
    },
  ]

  return (
    <section className="border-b border-border py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-center text-4xl font-bold text-primary">Why Onchain</h2>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div key={feature.title} className="cm-panel flex flex-col items-center rounded-sm p-8 text-center">
                <feature.icon className="mb-4 h-12 w-12 text-accent" />
                <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
