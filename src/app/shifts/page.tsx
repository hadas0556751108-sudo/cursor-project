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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/auth-context';
import { getShifts, getUsers, getDepartments, getBranches, createShift, updateShift } from '@/lib/supabase-data';
import { shiftTypeLabels, statusLabels, t } from '@/lib/labels';
import { Calendar as CalendarIcon, Clock, UserPlus, AlertTriangle } from 'lucide-react';
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

export default function ShiftsPage() {
  const { user } = useAuth();
  const [selectedShift, setSelectedShift] = useState<any>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [savingShift, setSavingShift] = useState(false);
  const [assignEmployeeId, setAssignEmployeeId] = useState('');

  // Add shift form state
  const [newShiftDate, setNewShiftDate] = useState('');
  const [newShiftStart, setNewShiftStart] = useState('08:00');
  const [newShiftEnd, setNewShiftEnd] = useState('16:00');
  const [newShiftType, setNewShiftType] = useState<'morning' | 'evening' | 'night' | 'weekend'>('morning');
  const [newShiftEmployee, setNewShiftEmployee] = useState('');

  const [shifts, setShifts] = React.useState<any[]>([]);
  const [users, setUsers] = React.useState<any[]>([]);
  const [departments, setDepartments] = React.useState<any[]>([]);
  const [branches, setBranches] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  const isAdmin = user?.role === 'admin';

  React.useEffect(() => {
    const loadData = async () => {
      try {
        const [shiftsData, usersData, departmentsData, branchesData] = await Promise.all([
          getShifts(),
          getUsers(),
          getDepartments(),
          getBranches()
        ]);
        setShifts(shiftsData);
        setUsers(usersData);
        setDepartments(departmentsData);
        setBranches(branchesData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const showMessage = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const departmentShifts = isAdmin
    ? shifts
    : shifts.filter(s => s.department_id === user?.department_id);
  const uncoveredShifts = departmentShifts.filter(s => !s.employee_id);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">טוען...</p>
        </div>
      </div>
    );
  }

  const handleCancelShift = async () => {
    if (!selectedShift) return;
    try {
      await updateShift(selectedShift.id, { status: 'cancelled' });
      setShifts(shifts.map(s => s.id === selectedShift.id ? { ...s, status: 'cancelled' } : s));
      setSelectedShift(null);
      showMessage('המשמרת בוטלה בהצלחה');
    } catch (error) {
      console.error('Error cancelling shift:', error);
      showMessage('ביטול המשמרת נכשל');
    }
  };

  const handleAssignStaff = async () => {
    if (!selectedShift || !assignEmployeeId) {
      showMessage('יש לבחור עובד לשיבוץ');
      return;
    }
    try {
      await updateShift(selectedShift.id, { employee_id: assignEmployeeId });
      setShifts(shifts.map(s => s.id === selectedShift.id ? { ...s, employee_id: assignEmployeeId } : s));
      setSelectedShift(null);
      setAssignEmployeeId('');
      showMessage('העובד שובץ בהצלחה');
    } catch (error) {
      console.error('Error assigning staff:', error);
      showMessage('שיבוץ העובד נכשל');
    }
  };

  const handleAddShift = async () => {
    if (!newShiftDate) {
      showMessage('יש לבחור תאריך למשמרת');
      return;
    }
    setSavingShift(true);
    try {
      const newShift = await createShift({
        employee_id: newShiftEmployee || user!.id,
        department_id: user?.department_id || departments[0]?.id,
        branch_id: user?.branch_id || branches[0]?.id,
        date: newShiftDate,
        start_time: newShiftStart,
        end_time: newShiftEnd,
        type: newShiftType,
        status: 'scheduled'
      });
      setShifts([...shifts, newShift]);
      setShowAddDialog(false);
      setNewShiftDate('');
      setNewShiftEmployee('');
      showMessage('המשמרת נוצרה ונשמרה בהצלחה');
    } catch (error) {
      console.error('Error adding shift:', error);
      showMessage('יצירת המשמרת נכשלה');
    } finally {
      setSavingShift(false);
    }
  };

  const calendarEvents = departmentShifts.map(shift => {
    const assignedUser = users.find(u => u.id === shift.employee_id);
    return {
      id: shift.id,
      title: assignedUser ? `${assignedUser.name}` : 'לא משובץ',
      start: `${shift.date}T${shift.start_time}`,
      end: `${shift.date}T${shift.end_time}`,
      backgroundColor: shift.employee_id ? '#3b82f6' : '#ef4444',
      borderColor: shift.employee_id ? '#3b82f6' : '#ef4444',
      extendedProps: shift
    };
  });

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
          <h1 className="text-3xl font-bold tracking-tight">ניהול משמרות</h1>
          <p className="text-muted-foreground">
            ניהול לוחות זמנים ושיבוצים של המחלקה
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => setShowAddDialog(true)}>
            <UserPlus className="me-2 h-4 w-4" />
            הוספת משמרת
          </Button>
        </div>
      </motion.div>

      {statusMessage && (
        <motion.div variants={itemVariants}>
          <div className={cn(
            'rounded-lg border px-4 py-3 text-sm',
            statusMessage.includes('בהצלחה')
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : 'border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400'
          )}>
            {statusMessage}
          </div>
        </motion.div>
      )}

      {/* Alerts */}
      {uncoveredShifts.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="glass border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertTriangle className="h-5 w-5" />
                התראות איוש
              </CardTitle>
              <CardDescription className="text-red-600 dark:text-red-400">
                {uncoveredShifts.length} משמרות דורשות שיבוץ
              </CardDescription>
            </CardHeader>
          </Card>
        </motion.div>
      )}

      {/* Calendar */}
      <motion.div variants={itemVariants}>
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              לוח זמנים של המחלקה
            </CardTitle>
            <CardDescription>
              משמרות אדומות מסמנות תקנים לא מאוישים
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
              צפייה ועריכת פרטי המשמרת
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
                <span className="text-sm font-medium">משובץ ל</span>
                <span className="text-sm text-muted-foreground">
                  {users.find(u => u.id === selectedShift.employee_id)?.name || 'לא משובץ'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">מחלקה</span>
                <span className="text-sm text-muted-foreground">
                  {departments.find(d => d.id === selectedShift.department_id)?.name}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">סטטוס</span>
                <Badge variant="secondary">
                  {t(statusLabels, selectedShift.status)}
                </Badge>
              </div>
              <div className="space-y-2 pt-2">
                <Label>שיבוץ מחדש</Label>
                <Select value={assignEmployeeId} onValueChange={setAssignEmployeeId}>
                  <SelectTrigger>
                    <SelectValue placeholder="בחר עובד" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.filter(u => u.department_id === selectedShift.department_id).map((u) => (
                      <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="pt-2 flex gap-2">
                <Button className="flex-1" variant="outline" onClick={handleCancelShift}>
                  ביטול משמרת
                </Button>
                <Button className="flex-1" variant="default" onClick={handleAssignStaff}>
                  שיבוץ עובד
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Shift Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              משמרת חדשה
            </DialogTitle>
            <DialogDescription>
              יצירת משמרת חדשה עבור המחלקה שלך
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>תאריך</Label>
              <Input type="date" value={newShiftDate} onChange={(e) => setNewShiftDate(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>שעת התחלה</Label>
                <Input type="time" value={newShiftStart} onChange={(e) => setNewShiftStart(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>שעת סיום</Label>
                <Input type="time" value={newShiftEnd} onChange={(e) => setNewShiftEnd(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>סוג משמרת</Label>
              <Select value={newShiftType} onValueChange={(v: any) => setNewShiftType(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="בחר סוג" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">בוקר</SelectItem>
                  <SelectItem value="evening">ערב</SelectItem>
                  <SelectItem value="night">לילה</SelectItem>
                  <SelectItem value="weekend">סוף שבוע - כוננות</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>שיבוץ ל</Label>
              <Select value={newShiftEmployee} onValueChange={setNewShiftEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="בחר עובד" />
                </SelectTrigger>
                <SelectContent>
                  {users.filter(u => isAdmin || u.department_id === user?.department_id).map((u) => (
                    <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="pt-4 space-y-3">
              <Button className="w-full" onClick={handleAddShift} disabled={savingShift || !newShiftDate}>
                {savingShift ? 'יוצר...' : 'צור משמרת'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
