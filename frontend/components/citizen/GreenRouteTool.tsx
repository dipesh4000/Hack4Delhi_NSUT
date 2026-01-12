"use client";

import { useState } from 'react';
import { 
  Navigation, 
  MapPin, 
  Search, 
  Wind, 
  Waves, 
  ShieldCheck, 
  Clock, 
  ArrowRight,
  Zap,
  AlertTriangle,
  Leaf
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Route {
  id: string;
  name: string;
  distance: string;
  time: string;
  aqi: number;
  waterlogging: string;
  safetyScore: number;
  type: string;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

export default function GreenRouteTool() {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!start || !end) return;

    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/waterlogging/navigation?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`);
      if (response.ok) {
        const data = await response.json();
        setRoutes(data.routes);
        setSearched(true);
      }
    } catch (error) {
      console.error("Error fetching routes:", error);
    } finally {
      setLoading(false);
    }
  };

  const getAqiColor = (aqi: number) => {
    if (aqi <= 50) return 'text-emerald-500';
    if (aqi <= 100) return 'text-yellow-500';
    if (aqi <= 200) return 'text-orange-500';
    return 'text-red-500';
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-200">
          <Navigation className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900">Green-Route</h2>
          <p className="text-sm text-slate-500 font-medium">Find the cleanest & driest path</p>
        </div>
      </div>

      <form onSubmit={handleSearch} className="space-y-4 mb-8">
        <div className="relative">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            value={start}
            onChange={(e) => setStart(e.target.value)}
            placeholder="Starting Point (e.g. Rohini)"
            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-2xl font-bold text-slate-900 transition-all outline-none"
          />
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            placeholder="Destination (e.g. Connaught Place)"
            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-2xl font-bold text-slate-900 transition-all outline-none"
          />
        </div>
        <button 
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              Plan Safe Route
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>

      <AnimatePresence mode="wait">
        {searched && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Suggested Routes</h3>
            {routes.map((route) => (
              <motion.div 
                key={route.id}
                whileHover={{ scale: 1.02 }}
                className={`p-5 rounded-3xl border-2 transition-all cursor-pointer ${
                  route.type.includes('Cleanest') 
                    ? 'border-emerald-100 bg-emerald-50/30' 
                    : route.type.includes('Driest')
                    ? 'border-blue-100 bg-blue-50/30'
                    : 'border-slate-100 bg-white'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                        route.type.includes('Cleanest') ? 'bg-emerald-500 text-white' :
                        route.type.includes('Driest') ? 'bg-blue-600 text-white' :
                        'bg-slate-900 text-white'
                      }`}>
                        {route.type}
                      </span>
                      {route.safetyScore > 80 && (
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      )}
                    </div>
                    <h4 className="text-lg font-black text-slate-900">{route.name}</h4>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-black text-slate-900">{route.time}</div>
                    <div className="text-xs font-bold text-slate-500">{route.distance}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-slate-100">
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <Wind className={`w-4 h-4 ${getAqiColor(route.aqi)}`} />
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-slate-400 uppercase">Avg AQI</div>
                      <div className={`text-sm font-black ${getAqiColor(route.aqi)}`}>{route.aqi}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-slate-100">
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <Waves className={`w-4 h-4 ${route.waterlogging === 'None' ? 'text-emerald-500' : 'text-red-500'}`} />
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-slate-400 uppercase">Waterlogging</div>
                      <div className={`text-sm font-black ${route.waterlogging === 'None' ? 'text-emerald-500' : 'text-red-500'}`}>
                        {route.waterlogging}
                      </div>
                    </div>
                  </div>
                </div>

                {route.waterlogging !== 'None' && (
                  <div className="mt-4 p-3 bg-red-50 rounded-xl border border-red-100 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span className="text-[10px] font-bold text-red-700">Warning: Active waterlogging reported on this route.</span>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {!searched && !loading && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Leaf className="w-8 h-8 text-emerald-200" />
          </div>
          <p className="text-sm font-bold text-slate-400">Enter your destination to find the<br/>safest environmental path.</p>
        </div>
      )}
    </div>
  );
}
