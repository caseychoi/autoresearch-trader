'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, Calendar, Clock, Settings } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Dashboard', icon: Calendar },
    { href: '/appointments', label: 'Appointments', icon: Clock },
    { href: '/clients', label: 'Clients & Patients', icon: Users },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white/40 backdrop-blur-xl border-r border-white/50 flex flex-col min-h-screen shadow-[4px_0_24px_rgba(0,0,0,0.02)] relative z-20">
      <div className="h-16 flex items-center px-6 border-b border-white/50">
        <h1 className="text-2xl font-extrabold text-indigo-700 tracking-tight">🐾 VetPulse</h1>
      </div>
      <nav className="flex-1 py-4 px-3 space-y-1">
        {links.map((link) => {
          const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                isActive
                  ? 'bg-white/60 text-indigo-700 shadow-sm border border-white/50 backdrop-blur-sm'
                  : 'text-slate-600 hover:bg-white/40 hover:text-indigo-600'
              }`}
            >
              <Icon className="w-5 h-5 mr-3" /> {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-200">
        <button
          onClick={() => {
            document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            document.cookie = 'user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            document.cookie = 'user_name=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            window.location.href = '/login';
          }}
          className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}
