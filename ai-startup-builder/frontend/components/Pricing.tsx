import { Check, Sparkles } from "lucide-react";

export function Pricing() {
  const tiers = [
    {
      name: "Standard",
      price: "$0",
      description: "For individual builders and experimenters.",
      features: ["3 Validations / mo", "Standard RAG", "JSON Export"],
      cta: "Initialize",
      highlighted: false,
    },
    {
      name: "Terminal",
      price: "$99",
      description: "Professional-grade tools for serious founders.",
      features: ["Unlimited Validations", "Neural Market Search", "Technical Blueprinting", "Full Scaffold Export"],
      cta: "Upgrade System",
      highlighted: true,
    },
    {
      name: "Quantum",
      price: "Custom",
      description: "For innovation hubs and global enterprises.",
      features: ["Custom Orchestrators", "White-label Briefs", "API Infrastructure", "24/7 Priority Ops"],
      cta: "Contact Ops",
      highlighted: false,
    },
  ];

  return (
    <section id="pricing" className="py-40 bg-background relative overflow-hidden">
      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-32">
          <h2 className="text-primary font-black uppercase tracking-[0.5em] text-[10px] mb-8">Resource Allocation</h2>
          <h3 className="text-6xl font-black text-white tracking-tighter uppercase italic">Scalable <br /><span className="text-primary not-italic">Capital.</span></h3>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {tiers.map((tier, i) => (
            <div key={i} className={`p-12 rounded-[3rem] border transition-all duration-700 ${tier.highlighted ? 'bg-card border-primary shadow-glow scale-105' : 'bg-card/30 border-white/5'}`}>
              <div className="flex justify-between items-start mb-10">
                <h4 className="font-bold text-2xl text-white uppercase italic">{tier.name}</h4>
                {tier.highlighted && <Sparkles className="h-6 w-6 text-primary animate-pulse" />}
              </div>
              <div className="mb-8">
                <span className="text-6xl font-black text-white tracking-tighter italic">{tier.price}</span>
                {tier.price !== "Custom" && <span className="text-white/80 font-black text-[10px] uppercase tracking-widest ml-3">/ Project</span>}
              </div>
              <p className="text-sm text-white/80 mb-12 font-medium leading-relaxed">{tier.description}</p>
              <ul className="space-y-6 mb-12">
                {tier.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-4 text-[13px] font-bold text-white/80 uppercase tracking-tight">
                    <Check className="h-4 w-4 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
              <button className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all ${tier.highlighted ? 'emerald-gradient text-background shadow-glow hover:opacity-90' : 'bg-white/5 text-white hover:bg-white/10'}`}>
                {tier.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
