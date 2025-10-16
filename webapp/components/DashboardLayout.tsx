// components/DashboardLayout.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  LayoutDashboard,
  Rocket,
  Video,
  Users,
  Library,
  Plug,
  Settings,
  Menu,
  X,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { HeaderBar } from '@/components/ui/dashboard/HeaderBar';

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { name: 'Campaigns', href: '/campaigns', icon: <Rocket className="w-5 h-5" /> },
  { name: 'Studio', href: '/studio', icon: <Video className="w-5 h-5" /> },
  { name: 'Accounts', href: '/accounts', icon: <Users className="w-5 h-5" /> },
  { name: 'Library', href: '/library', icon: <Library className="w-5 h-5" /> },
  { name: 'Plugins', href: '/plugins', icon: <Plug className="w-5 h-5" /> },
  { name: 'Settings', href: '/settings', icon: <Settings className="w-5 h-5" /> },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-zinc-900 border-r border-zinc-800
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo holder */}
          <div className="flex items-center justify-between p-6 border-b border-zinc-800">
            <Link href="/dashboard" className="flex items-center gap-2 pr-3">
              <Image
                src="/logo-mark.png"
                alt="Vulgo logo mark"
                width={54}
                height={27}
                priority
                className="h-8 w-auto object-contain"
              />
              <span className="text-[1.4rem] font-bold text-white tracking-[0.18em] pl-[2px]">
                VULGO
              </span>
            </Link>

            {/* Close button (mobile only) */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 hover:bg-zinc-800 rounded"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>


          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                  ${
                    isActive(item.href)
                      ? 'bg-white text-black font-semibold'
                      : 'text-gray-400 hover:bg-zinc-800 hover:text-white'
                  }
                `}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-zinc-800">
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm font-bold">
                A
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">Anonymous</div>
                <div className="text-xs text-gray-400 truncate">Free Plan</div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile header */}
        <header className="sticky top-0 z-30 lg:hidden bg-zinc-900 border-b border-zinc-800 px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-zinc-800 rounded"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 pr-2">
              <Image
                src="/logo-mark.png"
                alt="Vulgo logo mark"
                width={56}
                height={28}
                className="h-7 w-auto object-contain"
              />
              <span className="text-xl font-bold tracking-[0.18em] pl-[2px]">VULGO</span>
            </div>
            <div className="w-9" /> {/* Spacer for centering */}
          </div>
        </header>

        {/* Page content */}
        <div className="relative">
          <HeaderBar />
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
}
