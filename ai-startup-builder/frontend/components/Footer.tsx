import Link from "next/link";
// import { Zap, Github, Twitter, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-background border-t border-white/5 pt-24 pb-12">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-16 mb-20">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-8 group">
              <div className="bg-primary p-2 rounded-xl group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                {/* <Zap className="h-5 w-5 text-background fill-background" /> */}
              </div>
              <span className="font-black text-2xl tracking-tighter text-white">STARTUP<span className="text-primary italic">AI</span></span>
            </Link>
            <p className="text-white/70 text-base max-w-sm leading-relaxed font-medium">
              Empowering the next generation of founders with autonomous agents, real-time market intelligence, and technical validation blueprints.
            </p>
            {/* <div className="flex gap-6 mt-10">
              <Github className="h-6 w-6 text-white/70 hover:text-primary cursor-pointer transition-colors" />
              <Twitter className="h-6 w-6 text-white/70 hover:text-primary cursor-pointer transition-colors" />
              <Linkedin className="h-6 w-6 text-white/70 hover:text-primary cursor-pointer transition-colors" />
            </div> */}
          </div>
          
          <div>
            <h4 className="font-black text-[10px] uppercase tracking-[0.3em] text-white mb-8">Platform</h4>
            <ul className="space-y-4 text-sm font-bold text-white/70">
              <li className="hover:text-primary transition-colors cursor-pointer">AI Agents</li>
              <li className="hover:text-primary transition-colors cursor-pointer">Market Analysis</li>
              <li className="hover:text-primary transition-colors cursor-pointer">Validation</li>
              <li className="hover:text-primary transition-colors cursor-pointer">Integrations</li>
            </ul>
          </div>

          <div>
            <h4 className="font-black text-[10px] uppercase tracking-[0.3em] text-white mb-8">Resources</h4>
            <ul className="space-y-4 text-sm font-bold text-white/70">
              <li className="hover:text-primary transition-colors cursor-pointer">Documentation</li>
              <li className="hover:text-primary transition-colors cursor-pointer">Case Studies</li>
              <li className="hover:text-primary transition-colors cursor-pointer">API Reference</li>
              <li className="hover:text-primary transition-colors cursor-pointer">Community</li>
            </ul>
          </div>

          <div>
            <h4 className="font-black text-[10px] uppercase tracking-[0.3em] text-white mb-8">Company</h4>
            <ul className="space-y-4 text-sm font-bold text-white/70">
              <li className="hover:text-primary transition-colors cursor-pointer">About Us</li>
              <li className="hover:text-primary transition-colors cursor-pointer">Careers</li>
              <li className="hover:text-primary transition-colors cursor-pointer">Privacy</li>
              <li className="hover:text-primary transition-colors cursor-pointer">Terms</li>
            </ul>
          </div>
        </div>
        
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] text-white/70 font-black uppercase tracking-[0.4em]">
          <p>© {new Date().getFullYear()} STARTUPAI TECHNOLOGIES INC.</p>
          <div className="flex gap-12">
            <span className="hover:text-primary cursor-pointer transition-colors">System Status: Operational</span>
            <span className="hover:text-primary cursor-pointer transition-colors">Support</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
