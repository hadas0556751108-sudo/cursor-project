'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Search, Menu, Shield, Lock, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/auth-context';
import { mockUsers, mockNotifications } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

export function Topbar() {
  const { user, switchUser, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const userNotifications = mockNotifications.filter(n => n.userId === user?.id);
  const unreadCount = userNotifications.filter(n => !n.read).length;

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-30 flex h-[56px] items-center justify-between border-b border-[#30363D] bg-[#161B22]/80 backdrop-blur-lg px-6"
    >
      {/* Left side - Mobile menu & Search */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="lg:hidden text-[#8B949E] hover:text-[#E6EDF3]">
          <Menu className="h-5 w-5" />
        </Button>

        <div className="relative hidden md:block">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8B949E]" />
          <input
            type="text"
            placeholder="חיפוש..."
            className="h-9 w-64 rounded-lg border border-[#30363D] bg-[#0D1117] pr-10 pl-4 text-sm text-[#E6EDF3] placeholder-[#8B949E] outline-none focus:border-[#34E3D9] focus:ring-1 focus:ring-[#34E3D9]"
          />
        </div>
      </div>

      {/* Right side - Notifications & User */}
      <div className="flex items-center gap-4">
        {/* Current Role Badge */}
        <Badge variant="secondary" className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-[#34E3D9]/10 text-[#34E3D9] border-[#34E3D9]/20">
          <Shield className="h-3.5 w-3.5" />
          <span className="capitalize font-medium">{user?.role}</span>
        </Badge>

        {/* Notifications */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative text-[#8B949E] hover:text-[#E6EDF3]"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#34E3D9]" />
            )}
          </Button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute left-0 top-12 w-80 rounded-lg border border-[#30363D] bg-[#161B22] shadow-lg backdrop-blur-lg"
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-[#E6EDF3]">Notifications</h3>
                    <Badge variant="secondary" className="text-xs bg-[#34E3D9]/10 text-[#34E3D9] border-[#34E3D9]/20">
                      {unreadCount} unread
                    </Badge>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {userNotifications.slice(0, 5).map((notification) => (
                      <div
                        key={notification.id}
                        className={cn(
                          'p-2 rounded-lg text-sm',
                          !notification.read ? 'bg-[#34E3D9]/10' : 'bg-[#0D1117]'
                        )}
                      >
                        <p className="font-medium text-[#E6EDF3]">{notification.title}</p>
                        <p className="text-xs text-[#8B949E] mt-1">
                          {notification.message}
                        </p>
                      </div>
                    ))}
                  </div>
                  <Link href="/notifications" onClick={() => setShowNotifications(false)}>
                    <Button variant="outline" size="sm" className="w-full mt-3 border-[#34E3D9] text-[#34E3D9] hover:bg-[#34E3D9]/10">
                      View All Notifications
                    </Button>
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-gradient-to-br from-[#34E3D9] to-[#27DDD3] text-[#003734]">
                  {user?.avatar || user?.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80 border-[#30363D] bg-[#161B22]" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gradient-to-br from-[#34E3D9] to-[#27DDD3] text-[#003734]">
                      {user?.avatar || user?.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium leading-none text-[#E6EDF3]">{user?.name}</p>
                    <p className="text-xs text-[#8B949E] mt-1">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="w-fit capitalize flex items-center gap-1 border-[#34E3D9] text-[#34E3D9] bg-[#34E3D9]/10">
                  <Shield className="h-3 w-3" />
                  {user?.role}
                </Badge>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-[#30363D]" />
            <DropdownMenuLabel className="text-xs font-semibold text-[#8B949E] flex items-center gap-2 bg-[#0D1117] p-2 rounded border border-[#30363D]">
              <Lock className="h-3 w-3" />
              🔐 Switch User (Admin Only)
            </DropdownMenuLabel>
            <div className="px-2 py-1">
              <p className="text-xs text-[#8B949E] mb-2">
                Select a user account to simulate different roles
              </p>
            </div>
            {mockUsers.map((u) => (
              <DropdownMenuItem
                key={u.id}
                onClick={() => switchUser(u.id)}
                className={cn(
                  'capitalize flex items-center gap-3 py-3 px-2 text-[#E6EDF3] hover:bg-[#30363D]/50',
                  user?.id === u.id && 'bg-[#34E3D9]/10'
                )}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#34E3D9] to-[#27DDD3] text-xs font-semibold text-[#003734]">
                  {u.avatar}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{u.name}</span>
                    {user?.id === u.id && (
                      <Badge variant="secondary" className="text-xs h-5 bg-[#34E3D9]/10 text-[#34E3D9] border-[#34E3D9]/20">Active</Badge>
                    )}
                  </div>
                  <span className="text-xs text-[#8B949E] capitalize">{u.role}</span>
                </div>
                <UserIcon className="h-4 w-4 text-[#8B949E]" />
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator className="bg-[#30363D]" />
            <DropdownMenuItem onClick={logout} className="text-[#FD6D61] flex items-center gap-2 hover:bg-[#FD6D61]/10">
              <Lock className="h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.header>
  );
}
