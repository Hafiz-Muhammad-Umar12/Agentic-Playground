import Link from "next/link";
import { Droplets } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center text-center px-6">
      <div>
        <div className="w-16 h-16 bg-blood-950/60 border border-blood-800/40 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Droplets size={28} className="text-blood-400" />
        </div>
        <h1 className="font-display text-6xl font-bold text-white mb-3">404</h1>
        <p className="text-white/40 mb-8">Page not found</p>
        <Link href="/" className="btn-primary mx-auto w-fit">
          Go Home
        </Link>
      </div>
    </div>
  );
}
