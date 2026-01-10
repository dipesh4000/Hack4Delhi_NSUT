"use client";

import { LayoutDashboard, MapPin, Bell, Settings, LogOut, HelpCircle, Calendar, MessageSquare } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const MENU_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/citizen" },
  { icon: MapPin, label: "Wards", href: "/citizen/wards" },
  { icon: Bell, label: "Alerts", href: "/citizen/alerts" },
  { icon: Calendar, label: "History", href: "/citizen/history" },
  { icon: MessageSquare, label: "Support", href: "/citizen/support" },
];

export default function CitizenSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-24 lg:w-64 h-screen fixed left-0 top-0 bg-white/40 backdrop-blur-xl border-r border-white/20 flex flex-col p-6 z-[60]">
      <div className="flex items-center gap-3 mb-12 px-2">
        <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
          <MapPin className="w-6 h-6" />
        </div>
        <span className="hidden lg:block text-xl font-black text-slate-900 tracking-tight">WardAir</span>
      </div>

      <nav className="flex-1 space-y-2">
        {MENU_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group relative",
                isActive 
                  ? "bg-blue-600 text-white shadow-xl shadow-blue-600/20" 
                  : "text-slate-400 hover:bg-white/50 hover:text-slate-900"
              )}
            >
              <item.icon className={cn("w-6 h-6", isActive ? "text-white" : "group-hover:text-blue-600")} />
              <span className="hidden lg:block font-bold text-sm tracking-tight">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute left-0 w-1 h-6 bg-white rounded-full lg:hidden"
                />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="pt-8 border-t border-white/20 space-y-2">
        <button className="w-full flex items-center gap-4 p-4 rounded-2xl text-slate-400 hover:bg-white/50 hover:text-slate-900 transition-all group">
          <HelpCircle className="w-6 h-6 group-hover:text-blue-600" />
          <span className="hidden lg:block font-bold text-sm tracking-tight">Help Center</span>
        </button>
        <button className="w-full flex items-center gap-4 p-4 rounded-2xl text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all group">
          <LogOut className="w-6 h-6 group-hover:text-red-600" />
          <span className="hidden lg:block font-bold text-sm tracking-tight">Logout</span>
        </button>
      </div>
    </div>
  );
}
