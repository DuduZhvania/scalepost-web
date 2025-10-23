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
  ChevronDown,
  Sun,
  Moon,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { HeaderBar } from '@/components/ui/dashboard/HeaderBar';
import clsx from 'clsx';
import type { LucideIcon } from 'lucide-react';
import { useTheme } from '@/components/ui/providers/ThemeProvider';

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

const primaryNavigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Campaigns', href: '/campaigns', icon: Rocket },
  { name: 'Studio', href: '/studio', icon: Video },
  { name: 'Accounts', href: '/accounts', icon: Users },
  { name: 'Library', href: '/library', icon: Library },
  { name: 'Plugins', href: '/plugins', icon: Plug },
];

const secondaryNavigation: NavItem[] = [
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/');

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => {
            setSidebarOpen(false);
            setUserMenuOpen(false);
          }}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'group/sidebar fixed top-0 left-0 z-50 flex h-full flex-col overflow-hidden border-r border-gray-200 dark:border-zinc-900 bg-white dark:bg-black transition-all duration-200 ease-out lg:transition-[width] lg:duration-300 lg:ease-in-out',
          'w-60 transform transition-transform',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0 lg:w-16 lg:hover:w-[240px]'
        )}
      >
        {/* split padding so collapsed centering looks right */}
        <div className="flex h-full flex-col px-2 pt-3 pb-4">
          <div className="flex flex-col gap-5">
            {/* Center when collapsed; spread when expanded/hovered */}
            <div className="flex items-center justify-center lg:group-hover/sidebar:justify-between">
              <Link
                href="/dashboard"
                className={clsx(
                  'flex items-center px-3 py-2 transition-all duration-200 w-full',
                  // no gap when collapsed, gap appears on hover/expand
                  'gap-0 lg:group-hover/sidebar:gap-3',
                  // center in collapsed state, slide-left when expanded/hover
                  'justify-center lg:group-hover/sidebar:justify-start'
                )}
              >
                {/* Always-visible small logo; tiny right nudge only when collapsed */}
                <Image
                  src="/logo-mark.png"
                  alt="Vulgo logo mark"
                  width={32}
                  height={32}
                  priority
                  className="h-8 w-8 object-contain transition-all duration-200 ml-[3px] lg:group-hover/sidebar:ml-0"
                />

                {/* Wordmark expands only on hover; no width taken when collapsed */}
                <span
                  className={clsx(
                    'whitespace-nowrap text-lg font-semibold tracking-[0.2em] text-gray-900 dark:text-white transition-all duration-200',
                    // collapsed: fully hidden AND width=0 so it doesn't push the icon
                    'opacity-0 w-0 overflow-hidden',
                    // on hover/expand: reveal + give it natural width + little slide
                    'group-hover/sidebar:opacity-100 group-hover/sidebar:w-auto group-hover/sidebar:translate-x-0',
                  )}
                  // small entrance delay feels premium
                  style={{ transitionDelay: '75ms' }}
                >
                  VULGO
                </span>
              </Link>

              <button
                onClick={() => {
                  setSidebarOpen(false);
                  setUserMenuOpen(false);
                }}
                className="ml-2 rounded-lg p-2 text-gray-400 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-zinc-900/60 hover:text-gray-900 dark:hover:text-white lg:hidden"
                aria-label="Close sidebar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex flex-col gap-1">
              {primaryNavigation.map((item) => (
                <SidebarLink
                  key={item.name}
                  item={item}
                  active={isActive(item.href)}
                  expanded={sidebarOpen}
                />
              ))}
            </nav>
          </div>

          {/* Bottom section */}
          <div className="mt-auto flex flex-col gap-1 border-t border-gray-200 dark:border-white/5 pt-3">
            {/* Theme toggle button */}
            <button
              type="button"
              onClick={() => toggleTheme()}
              className="group/theme flex w-full items-center gap-3 rounded-xl px-3 py-2 text-gray-600 dark:text-gray-300 transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-100 dark:hover:bg-zinc-900/50"
              aria-label="Toggle theme"
            >
              <span className="flex h-8 w-8 items-center justify-center">
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </span>
              <span className={clsx(
                'text-sm transition-all duration-200 delay-75 whitespace-nowrap',
                'opacity-0 w-0 overflow-hidden',
                'group-hover/sidebar:opacity-100 group-hover/sidebar:w-auto'
              )}>
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </span>
            </button>
            
            {secondaryNavigation.map((item) => (
              <SidebarLink
                key={item.name}
                item={item}
                active={isActive(item.href)}
                expanded={sidebarOpen}
              />
            ))}
            <div className="relative">
              <button
                type="button"
                className="group/user flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-gray-600 dark:text-gray-300 transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-100 dark:hover:bg-zinc-900/50"
                onClick={() => setUserMenuOpen((prev) => !prev)}
                aria-haspopup="menu"
                aria-expanded={userMenuOpen}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-sm font-semibold text-white transition-all duration-200 group-hover/user:scale-110">
                  A
                </span>
                <span
                  className={clsx(
                    'flex flex-1 flex-col transition-all duration-200 delay-75',
                    sidebarOpen || userMenuOpen
                      ? 'translate-x-0 opacity-100'
                      : 'translate-x-2 opacity-0 group-hover/sidebar:translate-x-0 group-hover/sidebar:opacity-100'
                  )}
                >
                  <span className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                    Anonymous
                    <ChevronDown
                      className={clsx(
                        'h-3.5 w-3.5 opacity-70 transition-transform duration-200',
                        userMenuOpen && 'rotate-180'
                      )}
                    />
                  </span>
                  <span className="text-[11px] uppercase tracking-wide text-cyan-500 dark:text-cyan-300">
                    Free Plan
                  </span>
                </span>
              </button>
              {userMenuOpen && (
                <div className="absolute bottom-14 left-3 right-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white/95 dark:bg-zinc-950/95 p-2 text-sm shadow-lg backdrop-blur">
                  <button className="w-full rounded-md px-3 py-2 text-left text-gray-600 dark:text-gray-300 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white">
                    View Profile
                  </button>
                  <button className="w-full rounded-md px-3 py-2 text-left text-gray-600 dark:text-gray-300 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white">
                    Manage Plan
                  </button>
                  <button className="w-full rounded-md px-3 py-2 text-left text-red-500 dark:text-red-300 transition-all duration-200 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-100">
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => {
            setSidebarOpen(false);
            setUserMenuOpen(false);
          }}
        />
      )}

      {/* Main content */}
      <div className="lg:pl-16">
        {/* Mobile header */}
        <header className="sticky top-0 z-30 lg:hidden bg-gray-50 dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                setSidebarOpen(true);
                setUserMenuOpen(false);
              }}
              className="p-2 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded"
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
              <span className="text-xl font-bold tracking-[0.18em] pl-[2px]">
                VULGO
              </span>
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

function SidebarLink({
  item,
  active,
  expanded,
}: {
  item: NavItem;
  active: boolean;
  expanded: boolean;
}) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={clsx(
        'group/nav relative flex items-center gap-3 overflow-hidden rounded-xl px-3 py-2 transition-all duration-200',
        active
          ? 'bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white shadow-[0_4px_20px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] backdrop-blur'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-900/50 hover:text-gray-900 dark:hover:text-white'
      )}
    >
      <span
        className={clsx(
          'pointer-events-none absolute left-1 top-1 bottom-1 w-[3px] rounded-full bg-gradient-to-b from-cyan-400 to-purple-500 transition-opacity duration-200',
          active ? 'opacity-100' : 'opacity-0 group-hover/nav:opacity-60'
        )}
      />
      <Icon
        className={clsx(
          'h-5 w-5 flex-shrink-0 transition-all duration-200',
          active ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400 group-hover/nav:text-gray-900 dark:group-hover/nav:text-gray-200',
          'group-hover/nav:scale-110'
        )}
      />
      <span
        className={clsx(
          'whitespace-nowrap text-sm font-medium transition-all duration-200 delay-75',
          expanded
            ? 'translate-x-0 opacity-100'
            : 'translate-x-2 opacity-0 group-hover/sidebar:translate-x-0 group-hover/sidebar:opacity-100',
          active ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'
        )}
      >
        {item.name}
      </span>
    </Link>
  );
}
