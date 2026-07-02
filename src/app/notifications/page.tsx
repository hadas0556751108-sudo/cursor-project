'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { getNotifications, getUsers, updateNotification } from '@/lib/supabase-data';
import { Bell, Check, CheckCheck, Trash2, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut'
    }
  }
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadData = async () => {
      try {
        const [notificationsData] = await Promise.all([getNotifications()]);
        setNotifications(notificationsData);
      } catch (error) {
        console.error('Error loading notifications:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const userNotifications = notifications.filter(n => n.user_id === user?.id);
  
  const filteredNotifications = userNotifications.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

  const unreadCount = userNotifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  async function markAsRead(id: string) {
    try {
      await updateNotification(id, { read: true });
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  async function markAllAsRead() {
    try {
      await Promise.all(
        userNotifications.filter(n => !n.read).map(n => updateNotification(n.id, { read: true }))
      );
      setNotifications(notifications.map(n => 
        n.user_id === user?.id ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }

  function deleteNotification(id: string) {
    setNotifications(notifications.filter(n => n.id !== id));
  }

  function getNotificationIcon(type: string) {
    switch (type) {
      case 'request_approved':
        return '✅';
      case 'request_rejected':
        return '❌';
      case 'request_submitted':
        return '📝';
      case 'shift_replacement':
        return '🔄';
      case 'staffing_alert':
        return '⚠️';
      default:
        return '🔔';
    }
  }

  function getNotificationColor(type: string) {
    switch (type) {
      case 'request_approved':
        return 'bg-green-500/10 border-green-500/20';
      case 'request_rejected':
        return 'bg-red-500/10 border-red-500/20';
      case 'request_submitted':
        return 'bg-blue-500/10 border-blue-500/20';
      case 'shift_replacement':
        return 'bg-yellow-500/10 border-yellow-500/20';
      case 'staffing_alert':
        return 'bg-orange-500/10 border-orange-500/20';
      default:
        return 'bg-gray-500/10 border-gray-500/20';
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notification Center</h1>
          <p className="text-muted-foreground">
            Stay updated with your alerts and notifications
          </p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1.5 px-3 py-1.5">
          <Bell className="h-3.5 w-3.5" />
          <span>{unreadCount} unread</span>
        </Badge>
      </motion.div>

      {/* Filter Actions */}
      <motion.div variants={itemVariants} className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filter:</span>
        </div>
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All ({userNotifications.length})
          </Button>
          <Button
            variant={filter === 'unread' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('unread')}
          >
            Unread ({unreadCount})
          </Button>
          <Button
            variant={filter === 'read' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('read')}
          >
            Read ({userNotifications.length - unreadCount})
          </Button>
        </div>
        <div className="ml-auto flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="flex items-center gap-2"
          >
            <CheckCheck className="h-4 w-4" />
            Mark All Read
          </Button>
        </div>
      </motion.div>

      {/* Notifications List */}
      <motion.div variants={itemVariants} className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <Card className="glass">
            <CardContent className="p-12 text-center">
              <Bell className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No notifications</h3>
              <p className="text-muted-foreground">
                {filter === 'unread' ? "You're all caught up!" : 'No notifications to display'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'rounded-lg border p-4 transition-all hover:shadow-lg',
                !notification.read ? 'bg-accent/50' : 'bg-background',
                getNotificationColor(notification.type)
              )}
            >
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background shadow-sm">
                  <span className="text-xl">{getNotificationIcon(notification.type)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="font-semibold">{notification.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {notification.created_at}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => markAsRead(notification.id)}
                          title="Mark as read"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteNotification(notification.id)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Notification Types Legend */}
      <motion.div variants={itemVariants}>
        <Card className="glass">
          <CardHeader>
            <CardTitle>Notification Types</CardTitle>
            <CardDescription>Understanding your notification categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { icon: '✅', label: 'Request Approved', color: 'bg-green-500/10 border-green-500/20' },
                { icon: '❌', label: 'Request Rejected', color: 'bg-red-500/10 border-red-500/20' },
                { icon: '📝', label: 'Request Submitted', color: 'bg-blue-500/10 border-blue-500/20' },
                { icon: '🔄', label: 'Shift Replacement', color: 'bg-yellow-500/10 border-yellow-500/20' },
                { icon: '⚠️', label: 'Staffing Alert', color: 'bg-orange-500/10 border-orange-500/20' },
                { icon: '🔔', label: 'General', color: 'bg-gray-500/10 border-gray-500/20' }
              ].map((type) => (
                <div
                  key={type.label}
                  className={cn('flex items-center gap-3 rounded-lg border p-3', type.color)}
                >
                  <span className="text-xl">{type.icon}</span>
                  <span className="text-sm font-medium">{type.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
