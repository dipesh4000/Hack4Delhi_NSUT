"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  MapPin, 
  AlertTriangle, 
  FileText, 
  Users, 
  Settings, 
  Bell,
  MessageSquare,
  TrendingUp,
  Shield,
  Activity,
  Zap,
  Target,
  BarChart3
} from 'lucide-react';

interface AuthorityLayoutProps {
  children: React.ReactNode;
}

export default function AuthorityLayout({ children }: AuthorityLayoutProps) {
  const pathname = usePathname();
  const [notifications, setNotifications] = useState(12);
  const [complaints, setComplaints] = useState(8);

  const navigation = [
    {
      name: 'Dashboard',
      href: '/authority',
      icon: LayoutDashboard,
      current: pathname === '/authority'
    },
    {
      name: 'Ward Analysis',
      href: '/authority/wards',
      icon: MapPin,
      current: pathname === '/authority/wards'
    },
    {
      name: 'Officers',
      href: '/authority/officers',
      icon: Users,
      current: pathname === '/authority/officers'
    },
    {
      name: 'Complaints',
      href: '/authority/complaints',
      icon: MessageSquare,
      current: pathname === '/authority/complaints',
      badge: complaints
    },
    {
      name: 'GRAP Actions',
      href: '/authority/grap',
      icon: Shield,
      current: pathname === '/authority/grap'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
        {/* Logo */}
        <div className="flex h-16 items-center justify-center border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Authority</h1>
              <p className="text-xs text-slate-500">Pollution Control</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors
                    ${item.current
                      ? 'bg-red-50 text-red-700 border-r-2 border-red-600'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${item.current ? 'text-red-600' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Quick Stats */}
        <div className="absolute bottom-4 left-3 right-3">
          <div className="bg-slate-50 rounded-lg p-3">
            <h3 className="text-sm font-medium text-slate-900 mb-2">Quick Stats</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600">Active Alerts</span>
                <span className="font-medium text-red-600">{notifications}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-600">Pending Complaints</span>
                <span className="font-medium text-orange-600">{complaints}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-600">Avg AQI Today</span>
                <span className="font-medium text-slate-900">156</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pl-64 min-h-screen">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-40">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {navigation.find(item => item.current)?.name || 'Dashboard'}
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  Delhi Pollution Control Authority
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Emergency Actions */}
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center gap-2">
                  <Zap size={16} />
                  Emergency Action
                </button>
                
                {/* Notifications */}
                <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
                  <Bell size={20} />
                  {notifications > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {notifications}
                    </span>
                  )}
                </button>

                {/* Profile */}
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-900">Authority Officer</p>
                    <p className="text-xs text-slate-500">Delhi Zone 1</p>
                  </div>
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-red-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6 bg-slate-50 min-h-[calc(100vh-80px)]">
          {children}
        </main>
      </div>
    </div>
  );
}