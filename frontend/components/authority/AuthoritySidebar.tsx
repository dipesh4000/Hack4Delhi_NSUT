"use client";

import { LayoutDashboard, MapPin, Users, FileText, Settings, LogOut, HelpCircle, LogIn, MessageSquare, Shield } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useUser, SignOutButton } from "@clerk/nextjs";

const MENU_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/authority" },
  { icon: MapPin, label: "Wards", href: "/authority/wards" },
  { icon: Users, label: "Officers", href: "/authority/officers" },
  { icon: FileText, label: "Reports", href: "/authority/reports" },
  { icon: MessageSquare, label: "Complaints", href: "/authority/complaints" },
  { icon: Shield, label: "GRAP Actions", href: "/authority/grap" },
];

export default function AuthoritySidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();

  const handleSignIn = () => {
    localStorage.setItem("selectedRole", "authority");
    router.push("/role-select");
  };

  if (!isLoaded) return null;

  return (
    <div className="w-24 lg:w-64 h-screen fixed left-0 top-0 bg-white/40 backdrop-blur-xl border-r border-white/20 flex flex-col p-6 z-[60]">
      <Link href="/" className="flex items-center gap-3 mb-12 px-2 hover:opacity-80 transition-opacity">
        <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
          <MapPin className="w-6 h-6" />
        </div>
        <span className="hidden lg:block text-xl font-black text-slate-900 tracking-tight">WardAir</span>
      </Link>

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

        {isSignedIn ? (
          <SignOutButton>
            <button className="w-full flex items-center gap-4 p-4 rounded-2xl text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all group cursor-pointer">
              <LogOut className="w-6 h-6 group-hover:text-red-600" />
              <span className="hidden lg:block font-bold text-sm tracking-tight">Logout</span>
            </button>
          </SignOutButton>
        ) : (
          <button
            onClick={handleSignIn}
            className="w-full flex items-center gap-4 p-4 rounded-2xl text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-all group cursor-pointer"
          >
            <LogIn className="w-6 h-6 group-hover:text-blue-600" />
            <span className="hidden lg:block font-bold text-sm tracking-tight">Sign In</span>
          </button>
        )}
      </div>
    </div>
  );
}
