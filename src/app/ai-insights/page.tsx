'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { getUsers, getShifts, getRequests, getDepartments, User, Shift, Request, Department } from '@/lib/supabase-data';
import { Sparkles, BrainCircuit, ShieldAlert, RefreshCw, FileText, CalendarDays, Users, Building2 } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' }
  }
};

export default function AiInsightsPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';
  const hasAccess = isAdmin || isManager;

  React.useEffect(() => {
    const loadData = async () => {
      try {
        const [usersData, shiftsData, requestsData, departmentsData] = await Promise.all([
          getUsers(),
          getShifts(),
          getRequests(),
          getDepartments()
        ]);
        setUsers(usersData);
        setShifts(shiftsData);
        setRequests(requestsData);
        setDepartments(departmentsData);
      } catch (error) {
        console.error('Error loading AI insights data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const department = departments.find(d => d.id === user?.department_id);
  const departmentUsers = users.filter(u => u.department_id === user?.department_id);
  const departmentShifts = shifts.filter(s => s.department_id === user?.department_id);
  const pendingRequests = requests.filter(r => r.status === 'pending_dept' || r.status === 'pending_finance');
  const unassignedShifts = shifts.filter(s => !s.employee_id);

  async function analyzeWithAi() {
    setAiLoading(true);
    setAiError(null);

    try {
      const payload = isAdmin
        ? {
            type: 'dashboard' as const,
            data: {
              role: user?.role,
              stats: {
                totalShifts: shifts.length,
                unassignedShifts: unassignedShifts.length,
                pendingDeptRequests: requests.filter(r => r.status === 'pending_dept').length,
                pendingFinanceRequests: requests.filter(r => r.status === 'pending_finance').length,
                approvedRequests: requests.filter(r => r.status === 'approved').length,
                rejectedRequests: requests.filter(r => r.status === 'rejected').length,
                totalDepartments: departments.length,
                totalUsers: users.length,
              },
              pendingRequests: pendingRequests.slice(0, 10).map(r => ({
                title: r.title, type: r.type, amount: r.amount, status: r.status,
              })),
              unassignedShifts: unassignedShifts.slice(0, 10).map(s => ({
                date: s.date, type: s.type, department_id: s.department_id,
              })),
            },
          }
        : {
            type: 'department' as const,
            data: {
              department: department?.name,
              stats: {
                employees: departmentUsers.length,
                upcomingShifts: departmentShifts.filter(s => s.status === 'scheduled').length,
                unassignedShifts: departmentShifts.filter(s => !s.employee_id).length,
              },
              employees: departmentUsers.map(u => ({ name: u.name, role: u.role })),
              upcomingShifts: departmentShifts.slice(0, 15).map(s => ({
                date: s.date,
                time: `${s.start_time}-${s.end_time}`,
                type: s.type,
                assigned: !!s.employee_id,
              })),
            },
          };

      const response = await fetch('/api/ai-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="max-w-md bg-[#161B22] border-[#30363D]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-[#8B949E]" />
              גישה מוגבלת
            </CardTitle>
            <CardDescription>מרכז תובנות AI זמין למנהלי מערכת ומנהלי מחלקות בלבד.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const scopeStats = isAdmin
    ? [
        { label: 'בקשות ממתינות', value: pendingRequests.length, icon: FileText },
        { label: 'משמרות ללא שיבוץ', value: unassignedShifts.length, icon: CalendarDays },
        { label: 'עובדים במערכת', value: users.length, icon: Users },
        { label: 'מחלקות', value: departments.length, icon: Building2 },
      ]
    : [
        { label: 'עובדים במחלקה', value: departmentUsers.length, icon: Users },
        { label: 'משמרות המחלקה', value: departmentShifts.length, icon: CalendarDays },
        { label: 'משמרות ללא שיבוץ', value: departmentShifts.filter(s => !s.employee_id).length, icon: FileText },
      ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          מרכז תובנות AI
          <Badge variant="secondary" className="text-sm font-medium">
            <Sparkles className="h-3.5 w-3.5 me-1.5" />
            מופעל על ידי Groq
          </Badge>
        </h1>
        <p className="text-muted-foreground">
          {isAdmin
            ? 'ניתוח חכם של כל נתוני המערכת — בקשות, משמרות וכוח אדם'
            : `ניתוח חכם של נתוני מחלקת ${department?.name || 'שלך'} — עובדים ומשמרות`}
        </p>
      </motion.div>

      {/* Scope stats */}
      <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {scopeStats.map((stat) => (
          <Card key={stat.label} className="bg-[#161B22] border-[#30363D]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#E6EDF3]">{stat.label}</CardTitle>
              <stat.icon className="h-4 w-4 text-[#8B949E]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#E6EDF3]">{stat.value}</div>
              <p className="text-xs text-[#8B949E]">נכלל בניתוח</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* AI Hero Card */}
      <motion.div variants={itemVariants} dir="rtl">
        <Card className="bg-[#161B22] border-[#30363D] overflow-hidden">
          <div className="h-1 bg-gradient-to-l from-[#34E3D9] to-[#27DDD3]" />
          <CardHeader className="text-center pb-4 pt-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#34E3D9] to-[#27DDD3] mb-4">
              <BrainCircuit className="h-8 w-8 text-[#003734]" />
            </div>
            <CardTitle className="text-xl font-semibold text-[#E6EDF3]">
              {isAdmin ? 'הפקת ניתוח מערכת חכם' : 'הפקת ניתוח מחלקתי חכם'}
            </CardTitle>
            <CardDescription className="text-[#8B949E] max-w-lg mx-auto">
              {isAdmin
                ? 'המערכת תנתח בקשות ממתינות, משמרות ללא שיבוץ וסטטיסטיקות כוח אדם — ותציג תובנות והמלצות פעולה בעברית.'
                : 'המערכת תנתח את עובדי המחלקה, המשמרות הקרובות והשיבוצים החסרים — ותציג תובנות והמלצות פעולה בעברית.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center pb-8">
            <Button
              onClick={analyzeWithAi}
              disabled={aiLoading}
              size="lg"
              className="flex items-center gap-2 bg-[#34E3D9] text-[#003734] hover:bg-[#27DDD3] font-semibold text-base px-8 h-12"
            >
              {aiLoading ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  מנתח נתונים...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  {aiSummary ? 'הפק ניתוח מחדש' : 'הפק ניתוח חכם'}
                </>
              )}
            </Button>

            {aiError && (
              <p className="mt-4 text-sm text-red-400">{aiError}</p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Result */}
      {aiSummary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          dir="rtl"
        >
          <Card className="bg-[#161B22] border-[#30363D]">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-[#E6EDF3] flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[#34E3D9]" />
                תוצאות הניתוח
              </CardTitle>
              <CardDescription className="text-[#8B949E]">
                הופק ב-{new Date().toLocaleString('he-IL')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-[#E6EDF3] leading-relaxed whitespace-pre-wrap bg-[#0D1117] border border-[#30363D] rounded-lg p-5">
                {aiSummary}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
