'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/auth-context';
import { getUsers, getShifts, getDepartments, User, Shift, Department } from '@/lib/supabase-data';
import { roleLabels, shiftTypeLabels, statusLabels, t } from '@/lib/labels';
import { Building2, Users, CalendarDays, AlertTriangle, Clock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

export default function DepartmentPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const isManager = user?.role === 'manager';

  React.useEffect(() => {
    const loadData = async () => {
      try {
        const [usersData, shiftsData, departmentsData] = await Promise.all([
          getUsers(),
          getShifts(),
          getDepartments()
        ]);
        setUsers(usersData);
        setShifts(shiftsData);
        setDepartments(departmentsData);
      } catch (error) {
        console.error('Error loading department data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

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

  if (!isManager) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>גישה מוגבלת</CardTitle>
            <CardDescription>עמוד זה זמין למנהלי מחלקה בלבד.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const department = departments.find(d => d.id === user?.department_id);
  const departmentUsers = users.filter(u => u.department_id === user?.department_id);
  const departmentShifts = shifts
    .filter(s => s.department_id === user?.department_id)
    .sort((a, b) => `${a.date}T${a.start_time}`.localeCompare(`${b.date}T${b.start_time}`));

  const today = new Date().toISOString().split('T')[0];
  const upcomingShifts = departmentShifts.filter(s => s.date >= today && s.status === 'scheduled');
  const unassignedShifts = upcomingShifts.filter(s => !s.employee_id || !users.find(u => u.id === s.employee_id));

  const getEmployeeName = (employeeId: string) => {
    const employee = users.find(u => u.id === employeeId);
    return employee?.name || 'לא שובצה';
  };

  const formatDate = (dateStr: string) =>
    new Date(`${dateStr}T00:00:00`).toLocaleDateString('he-IL', {
      weekday: 'short',
      day: 'numeric',
      month: 'numeric'
    });

  async function analyzeWithAi() {
    setAiLoading(true);
    setAiError(null);

    try {
      const response = await fetch('/api/ai-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'department',
          data: {
            department: department?.name,
            stats: {
              employees: departmentUsers.length,
              upcomingShifts: upcomingShifts.length,
              unassignedShifts: unassignedShifts.length,
            },
            employees: departmentUsers.map(u => ({
              name: u.name, role: u.role,
            })),
            upcomingShifts: upcomingShifts.slice(0, 15).map(s => ({
              date: s.date,
              time: `${s.start_time}-${s.end_time}`,
              type: s.type,
              assigned: !!s.employee_id,
            })),
            unassignedShifts: unassignedShifts.slice(0, 15).map(s => ({
              date: s.date, time: `${s.start_time}-${s.end_time}`, type: s.type,
            })),
          },
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setAiSummary(result.summary);
      } else {
        setAiError(result.error || 'שגיאה בניתוח הנתונים');
      }
    } catch (error) {
      console.error('AI analysis error:', error);
      setAiError('שגיאה בניתוח הנתונים');
    } finally {
      setAiLoading(false);
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
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            המחלקה שלי
            {department && (
              <Badge variant="secondary" className="text-sm font-medium">
                <Building2 className="h-3.5 w-3.5 me-1.5" />
                {department.name}
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground">עובדים ומשמרות המשויכים למחלקה שלך</p>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-3">
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">עובדים במחלקה</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departmentUsers.length}</div>
            <p className="text-xs text-muted-foreground">סה"כ עובדים משויכים</p>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">משמרות קרובות</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingShifts.length}</div>
            <p className="text-xs text-muted-foreground">מתוכננות מהיום והלאה</p>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">משמרות ללא שיבוץ</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unassignedShifts.length}</div>
            <p className="text-xs text-muted-foreground">דורשות שיבוץ עובד</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* AI Insights */}
      <motion.div variants={itemVariants} dir="rtl">
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[#34E3D9]" />
                תובנות AI
              </CardTitle>
              <CardDescription>ניתוח חכם של נתוני המחלקה באמצעות AI</CardDescription>
            </div>
            <Button
              onClick={analyzeWithAi}
              disabled={aiLoading}
              className="flex items-center gap-2 bg-[#34E3D9] text-[#003734] hover:bg-[#27DDD3] font-medium"
            >
              <Sparkles className="h-4 w-4" />
              {aiLoading ? 'מנתח נתונים...' : 'נתח נתונים'}
            </Button>
          </CardHeader>
          {(aiSummary || aiError) && (
            <CardContent>
              {aiError ? (
                <p className="text-sm text-red-400">{aiError}</p>
              ) : (
                <div className="text-sm leading-relaxed whitespace-pre-wrap rounded-lg border p-4 bg-background/50">
                  {aiSummary}
                </div>
              )}
            </CardContent>
          )}
        </Card>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Department Employees */}
        <motion.div variants={itemVariants}>
          <Card className="glass h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                עובדי המחלקה
              </CardTitle>
              <CardDescription>{departmentUsers.length} עובדים במחלקה</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {departmentUsers.length > 0 ? departmentUsers.map((employee) => (
                  <div
                    key={employee.id}
                    className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#34E3D9] to-[#27DDD3] text-sm font-semibold text-[#003734]">
                        {employee.avatar || employee.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{employee.name}</p>
                        <p className="text-xs text-muted-foreground">{employee.email}</p>
                      </div>
                    </div>
                    <Badge variant="secondary">{t(roleLabels, employee.role)}</Badge>
                  </div>
                )) : (
                  <p className="text-center text-muted-foreground py-8">אין עובדים במחלקה</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Department Shifts */}
        <motion.div variants={itemVariants}>
          <Card className="glass h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                משמרות המחלקה
              </CardTitle>
              <CardDescription>{upcomingShifts.length} משמרות קרובות</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingShifts.length > 0 ? upcomingShifts.slice(0, 10).map((shift) => {
                  const isUnassigned = !shift.employee_id || !users.find(u => u.id === shift.employee_id);
                  return (
                    <div
                      key={shift.id}
                      className={`flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent ${
                        isUnassigned ? 'border-red-500/40' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <Clock className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{getEmployeeName(shift.employee_id)}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(shift.date)} • {shift.start_time}–{shift.end_time}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="secondary">{t(shiftTypeLabels, shift.type)}</Badge>
                        <Badge variant={shift.status === 'completed' ? 'success' : shift.status === 'cancelled' ? 'destructive' : 'info'}>
                          {t(statusLabels, shift.status)}
                        </Badge>
                      </div>
                    </div>
                  );
                }) : (
                  <p className="text-center text-muted-foreground py-8">אין משמרות קרובות במחלקה</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
