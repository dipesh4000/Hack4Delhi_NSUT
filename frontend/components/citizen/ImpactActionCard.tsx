"use client";

import { ActionItem } from "@/lib/mock-data";
import { CheckCircle2, XCircle, Leaf } from "lucide-react";

interface ImpactActionCardProps {
  dos: ActionItem[];
  avoids: ActionItem[];
}

export default function ImpactActionCard({ dos, avoids }: ImpactActionCardProps) {
  return (
    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl shadow-sm border border-emerald-100 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-emerald-100 rounded-lg">
          <Leaf className="w-6 h-6 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">How You Can Reduce Pollution Today</h2>
          <p className="text-sm text-slate-600">Small actions from you make a big difference.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* DO THIS */}
        <div>
          <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Do This
          </h3>
          <ul className="space-y-3">
            {dos.map((item, i) => (
              <li key={i} className="flex items-start gap-3 bg-white/60 p-3 rounded-lg border border-emerald-100/50">
                <span className="text-sm font-medium text-slate-800">{item.text}</span>
                {item.impact === "High Impact" && (
                  <span className="ml-auto text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full whitespace-nowrap">
                    High Impact
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* AVOID THIS */}
        <div>
          <h3 className="text-xs font-bold text-red-600 uppercase tracking-wide mb-4 flex items-center gap-2">
            <XCircle className="w-4 h-4" /> Avoid This
          </h3>
          <ul className="space-y-3">
            {avoids.map((item, i) => (
              <li key={i} className="flex items-start gap-3 bg-white/60 p-3 rounded-lg border border-red-100/50">
                <span className="text-sm font-medium text-slate-800">{item.text}</span>
                {item.impact === "High Impact" && (
                  <span className="ml-auto text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full whitespace-nowrap">
                    High Impact
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="mt-6 text-center">
        <p className="text-xs text-emerald-800 font-medium bg-emerald-100/50 inline-block px-4 py-2 rounded-full">
            💡 If 20% of residents avoid short car trips today, PM2.5 levels can drop noticeably.
        </p>
      </div>
    </div>
  );
}
