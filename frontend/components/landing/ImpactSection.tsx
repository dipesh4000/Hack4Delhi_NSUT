"use client";

export default function ImpactSection() {
  return (
    <section id="impact" className="py-24 bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-16">Built for Real Impact</h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6">
            <div className="text-5xl font-bold text-blue-500 mb-4">40%</div>
            <h3 className="text-xl font-semibold mb-2">Faster Response</h3>
            <p className="text-slate-400">Reduction in time from pollution spike to mitigation action.</p>
          </div>
          
          <div className="p-6 border-l border-slate-800 border-r">
            <div className="text-5xl font-bold text-green-500 mb-4">100%</div>
            <h3 className="text-xl font-semibold mb-2">Ward Coverage</h3>
            <p className="text-slate-400">Every single administrative ward monitored independently.</p>
          </div>
          
          <div className="p-6">
            <div className="text-5xl font-bold text-purple-500 mb-4">24/7</div>
            <h3 className="text-xl font-semibold mb-2">Public Access</h3>
            <p className="text-slate-400">Citizens get transparent, real-time data anytime.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
