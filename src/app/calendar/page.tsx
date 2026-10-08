'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import heLocale from '@fullcalendar/core/locales/he';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/auth-context';
import { getShifts, getDepartments, getUsers, createNotification } from '@/lib/supabase-data';
import { shiftTypeLabels, statusLabels, t } from '@/lib/labels';
import { Calendar as CalendarIcon, Clock, User } from 'lucide-react';
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

export default function CalendarPage() {
  const { user } = useAuth();
  const [selectedShift, setSelectedShift] = useState<any>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const [shifts, setShifts] = React.useState<any[]>([]);
  const [departments, setDepartments] = React.useState<any[]>([]);
  const [users, setUsers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadData = async () => {
      try {
        const [shiftsData, departmentsData, usersData] = await Promise.all([
          getShifts(),
          getDepartments(),
          getUsers()
        ]);
        setShifts(shiftsData);
        setDepartments(departmentsData);
        setUsers(usersData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const userShifts = shifts.filter(s => s.employee_id === user?.id && s.status !== 'cancelled');

  const handleRequestReplacement = async () => {
    if (!selectedShift) return;
    try {
      const department = departments.find(d => d.id === selectedShift.department_id);
      const manager = users.find(u => u.id === department?.manager_id);
      if (manager) {
        await createNotification({
          user_id: manager.id,
          type: 'shift_replacement',
          title: 'בקשת החלפה למשמרת',
          message: `${user?.name} ביקש/ה החלפה למשמרת ${t(shiftTypeLabels, selectedShift.type)} בתאריך ${selectedShift.date}.`,
          read: false
        });
      }
      setSelectedShift(null);
      setStatusMessage('בקשת ההחלפה נשלחה למנהל המחלקה');
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (error) {
      console.error('Error requesting replacement:', error);
      setStatusMessage('שליחת בקשת ההחלפה נכשלה');
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  const calendarEvents = userShifts.map(shift => ({
    id: shift.id,
    title: `משמרת ${t(shiftTypeLabels, shift.type)}`,
    start: `${shift.date}T${shift.start_time}`,
    end: `${shift.date}T${shift.end_time}`,
    backgroundColor: getShiftColor(shift.type),
    borderColor: getShiftColor(shift.type),
    extendedProps: shift
  }));

  function getShiftColor(type: string) {
    switch (type) {
      case 'morning':
        return '#3b82f6';
      case 'evening':
        return '#f59e0b';
      case 'night':
        return '#6366f1';
      case 'weekend':
        return '#10b981';
      default:
        return '#6b7280';
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
          <h1 className="text-3xl font-bold tracking-tight">היומן שלי</h1>
          <p className="text-muted-foreground">
            צפייה וניהול המשמרות המתוכננות שלך
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="px-3 py-1.5">
            {userShifts.length} משמרות בתקופה זו
          </Badge>
        </div>
      </motion.div>

      {statusMessage && (
        <motion.div variants={itemVariants}>
          <div className={cn(
            'rounded-lg border px-4 py-3 text-sm',
            statusMessage.includes('נשלח')
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : 'border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400'
          )}>
            {statusMessage}
          </div>
        </motion.div>
      )}

      {/* Calendar */}
      <motion.div variants={itemVariants}>
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              סקירת לוח זמנים
            </CardTitle>
            <CardDescription>
              לחץ על משמרת לצפייה בפרטים או לבקשת החלפה
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="min-h-[600px]">
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                locale={heLocale}
                direction="rtl"
                initialView="dayGridMonth"
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,timeGridWeek'
                }}
                events={calendarEvents}
                eventClick={(info) => {
                  setSelectedShift(info.event.extendedProps);
                }}
                height="auto"
                eventDisplay="block"
                dayMaxEvents={3}
                moreLinkClick="popover"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Shift Details Dialog */}
      <Dialog open={!!selectedShift} onOpenChange={() => setSelectedShift(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              פרטי משמרת
            </DialogTitle>
            <DialogDescription>
              צפייה בפרטי המשמרת שלך
            </DialogDescription>
          </DialogHeader>
          {selectedShift && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">תאריך</span>
                <span className="text-sm text-muted-foreground">{selectedShift.date}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">שעות</span>
                <span className="text-sm text-muted-foreground">
                  {selectedShift.start_time} - {selectedShift.end_time}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">סוג</span>
                <Badge variant="secondary">
                  {t(shiftTypeLabels, selectedShift.type)}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">מחלקה</span>
                <span className="text-sm text-muted-foreground">
                  {departments.find(d => d.id === selectedShift.department_id)?.name}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">סטטוס</span>
                <Badge
                  variant={selectedShift.status === 'completed' ? 'success' : 'info'}
                >
                  {t(statusLabels, selectedShift.status)}
                </Badge>
              </div>
              <div className="pt-4 space-y-3">
                <Button className="w-full" variant="outline" onClick={handleRequestReplacement}>
                  בקשת החלפה
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Legend */}
      <motion.div variants={itemVariants}>
        <Card className="glass">
          <CardHeader>
            <CardTitle>סוגי משמרות</CardTitle>
            <CardDescription>סיווג משמרות לפי צבע</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { type: 'morning', color: '#3b82f6', label: 'בוקר (07:00-15:00)' },
                { type: 'evening', color: '#f59e0b', label: 'ערב (15:00-23:00)' },
                { type: 'night', color: '#6366f1', label: 'לילה (23:00-07:00)' },
                { type: 'weekend', color: '#10b981', label: 'סוף שבוע - כוננות' }
              ].map((shift) => (
                <div key={shift.type} className="flex items-center gap-2">
                  <div
                    className="h-4 w-4 rounded"
                    style={{ backgroundColor: shift.color }}
                  />
                  <span className="text-sm">{shift.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
