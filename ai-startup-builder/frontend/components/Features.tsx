import { Zap, Shield, BarChart3, Globe, Code2, Cpu } from "lucide-react";

export function Features() {
  const features = [
    {
      title: "Agentic Logic",
      description: "Our multi-agent system coordinates Idea, Market, and Validation agents in a seamless workflow.",
      icon: Cpu,
    },
    {
      title: "Neural RAG",
      description: "Deep-dive analysis of competitors, trends, and target demographics using real-time vector data.",
      icon: BarChart3,
    },
    {
      title: "Blueprint Gen",
      description: "Get a full technical architecture and scaffold for your startup in minutes, not weeks.",
      icon: Code2,
    },
    {
      title: "Edge Delivery",
      description: "Deploy and manage your AI-generated startups across multiple regions with zero latency.",
      icon: Globe,
    },
    {
      title: "Hardened Core",
      description: "Industry-standard encryption and data isolation for your most sensitive startup concepts.",
      icon: Shield,
    },
    {
      title: "Rapid Validation",
      description: "Validate business models and technical feasibility using our proprietary validation engine.",
      icon: Zap,
    },
  ];

  return (
    <section id="features" className="py-40 bg-background relative">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="text-center max-w-3xl mx-auto mb-32">
          <h2 className="text-primary font-black uppercase tracking-[0.5em] text-[10px] mb-8">Infrastructure</h2>
          <h3 className="text-6xl md:text-7xl font-black text-white tracking-tighter leading-[0.9] uppercase italic">The Silicon <br /> <span className="text-primary not-italic tracking-[-0.05em]">Foundation.</span></h3>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div key={i} className="group p-10 rounded-[2.5rem] bg-card/40 border border-white/5 hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5">
              <div className="bg-white/5 h-16 w-16 rounded-2xl flex items-center justify-center mb-10 group-hover:scale-110 group-hover:bg-primary group-hover:text-background transition-all">
                <feature.icon className="h-8 w-8" />
              </div>
              <h4 className="text-2xl font-bold mb-4 text-white uppercase italic tracking-tight">{feature.title}</h4>
              <p className="text-white/80 leading-relaxed font-medium text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
