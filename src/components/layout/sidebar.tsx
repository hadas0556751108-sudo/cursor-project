'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  FileText, 
  DollarSign, 
  Settings,
  Bell,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'My Calendar', href: '/calendar', icon: Calendar },
  { name: 'Shift Manager', href: '/shifts', icon: Users, roles: ['manager', 'admin'] },
  { name: 'Request Center', href: '/requests', icon: FileText },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Finance Hub', href: '/finance', icon: DollarSign, roles: ['finance', 'admin'] },
  { name: 'Admin Settings', href: '/settings', icon: Settings, roles: ['admin'] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const filteredNavigation = navigation.filter(item => {
    if (!item.roles) return true;
    return user && item.roles.includes(user.role);
  });

  return (
    <motion.aside
      initial={{ x: 300 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="flex-shrink-0 w-[240px] bg-[#161B22] border-l border-[#30363D]"
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-[56px] items-center border-b border-[#30363D] px-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#34E3D9] to-[#27DDD3]" />
            <span className="text-xl font-bold text-[#E6EDF3]">HubOffice</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-[#34E3D9]/10 text-[#34E3D9]'
                    : 'text-[#8B949E] hover:bg-[#30363D]/50 hover:text-[#E6EDF3]'
                )}
              >
                <Icon className={cn('h-5 w-5', isActive && 'text-[#34E3D9]')} />
                <span>{item.name}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute left-0 h-8 w-1 rounded-r-full bg-[#34E3D9]"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="border-t border-[#30363D] p-4">
          <div className="flex items-center gap-3 rounded-lg bg-[#0D1117] p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#34E3D9] to-[#27DDD3] text-sm font-semibold text-[#003734]">
              {user?.avatar || user?.name?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-[#E6EDF3]">{user?.name}</p>
              <p className="truncate text-xs text-[#8B949E] capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.aside>
  );
}
