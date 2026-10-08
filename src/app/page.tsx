'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { getShifts, getRequests, getDepartments, getUserTasks, createUserTask, updateUserTask, deleteUserTask, type UserTask } from '@/lib/supabase-data';
import { Calendar, Clock, FileText, TrendingUp, AlertCircle, CheckCircle, DollarSign, Mail, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

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

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [shifts, setShifts] = React.useState<any[]>([]);
  const [requests, setRequests] = React.useState<any[]>([]);
  const [departments, setDepartments] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [sendingEmail, setSendingEmail] = React.useState(false);
  const [emailStatus, setEmailStatus] = React.useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = React.useState('');
  const [tasks, setTasks] = React.useState<UserTask[]>([]);
  const [addingTask, setAddingTask] = React.useState(false);
  const [taskStatus, setTaskStatus] = React.useState<string | null>(null);

  const isManager = user?.role === 'manager' || user?.role === 'admin';
  const isFinance = user?.role === 'finance' || user?.role === 'admin';

  React.useEffect(() => {
    // Redirect to login if no user
    if (!user) {
      router.push('/login');
      return;
    }

    const loadData = async () => {
      try {
        const [shiftsData, requestsData, departmentsData, userTasks] = await Promise.all([
          getShifts(),
          getRequests(),
          getDepartments(),
          getUserTasks(user.id)
        ]);
        setShifts(shiftsData);
        setRequests(requestsData);
        setDepartments(departmentsData);
        setTasks(userTasks);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, router]);

  async function sendSystemUpdate() {
    setSendingEmail(true);
    setEmailStatus(null);

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: 'hadas0556751108@gmail.com',
          subject: 'HubOffice - עדכון מערכת',
          html: `
            <!DOCTYPE html>
            <html lang="he" dir="rtl">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>HubOffice - עדכון מערכת</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0F1117; direction: rtl; text-align: right;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center" style="padding: 40px 20px;">
                    <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; width: 100%; background-color: #161B22; border-radius: 16px; border: 1px solid #30363D; overflow: hidden;">
                      <tr>
                        <td style="background: linear-gradient(135deg, #34E3D9 0%, #27DDD3 100%); padding: 32px; text-align: center;">
                          <h1 style="margin: 0; color: #003734; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">HubOffice</h1>
                          <p style="margin: 8px 0 0 0; color: #003734; font-size: 14px; opacity: 0.8;">Medical Center ERP</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 40px 32px;">
                          <h2 style="margin: 0 0 20px 0; color: #E6EDF3; font-size: 22px; font-weight: 600; text-align: right;">עדכון מערכת</h2>
                          <p style="margin: 0 0 16px 0; color: #E6EDF3; font-size: 16px; line-height: 1.6; text-align: right;">שלום,</p>
                          <p style="margin: 0 0 24px 0; color: #8B949E; font-size: 16px; line-height: 1.6; text-align: right;">זוהי הודעת עדכון ממערכת HubOffice. הפעולה הושלמה בהצלחה.</p>
                          
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 24px 0; background-color: #0D1117; border-radius: 12px; border: 1px solid #30363D;">
                            <tr>
                              <td style="padding: 20px; text-align: right;">
                                <p style="margin: 0 0 8px 0; color: #8B949E; font-size: 13px;">נשלח על ידי</p>
                                <p style="margin: 0; color: #34E3D9; font-size: 15px; font-weight: 600;">${user?.name || 'HubOffice System'}</p>
                                <p style="margin: 12px 0 0 0; color: #8B949E; font-size: 13px;">תאריך ושעה</p>
                                <p style="margin: 0; color: #E6EDF3; font-size: 15px;">${new Date().toLocaleString('he-IL')}</p>
                              </td>
                            </tr>
                          </table>

                          <p style="margin: 24px 0 0 0; color: #8B949E; font-size: 14px; line-height: 1.5; text-align: right;">תודה שהשתמשתם במערכת HubOffice. לשאלות או תמיכה, ניתן לפנות למנהל המערכת.</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 20px 32px; background-color: #0D1117; border-top: 1px solid #30363D; text-align: center;">
                          <p style="margin: 0; color: #8B949E; font-size: 12px;">© HubOffice Medical Center ERP. כל הזכויות שמורות.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
          `
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setEmailStatus('המייל נשלח בהצלחה!');
      } else {
        setEmailStatus(result.error || 'שגיאה בשליחת המייל');
      }
    } catch (error: any) {
      console.error('Error sending system update:', error);
      setEmailStatus(error.message || 'שגיאה בשליחת המייל');
    } finally {
      setSendingEmail(false);
    }
  }

  const userShifts = shifts.filter(s => s.employee_id === user?.id);
  const userRequests = requests.filter(r => r.employee_id === user?.id);
  const pendingRequests = requests.filter(r => r.status === 'pending_dept' || r.status === 'pending_finance');

  async function handleAddTask() {
    if (!user || !newTaskTitle.trim()) return;
    setAddingTask(true);
    setTaskStatus(null);

    try {
      const newTask = await createUserTask(user.id, newTaskTitle.trim());
      setTasks([newTask, ...tasks]);
      setNewTaskTitle('');
      setTaskStatus('המשימה נקלטה בהצלחה במערכת');
    } catch (error: any) {
      console.error('Error adding task:', error);
      setTaskStatus(error.message || 'שגיאה בקליטת המשימה במערכת');
    } finally {
      setAddingTask(false);
    }
  }

  async function handleToggleTask(taskId: string, completed: boolean) {
    try {
      await updateUserTask(taskId, { completed });
      setTasks(tasks.map(t => t.id === taskId ? { ...t, completed } : t));
      setTaskStatus('סטטוס המשימה עודכן בהצלחה במערכת');
    } catch (error: any) {
      console.error('Error updating task:', error);
      setTaskStatus(error.message || 'שגיאה בעדכון סטטוס המשימה');
    }
  }

  async function handleDeleteTask(taskId: string) {
    try {
      await deleteUserTask(taskId);
      setTasks(tasks.filter(t => t.id !== taskId));
      setTaskStatus('המשימה הוסרה בהצלחה מהמערכת');
    } catch (error: any) {
      console.error('Error deleting task:', error);
      setTaskStatus(error.message || 'שגיאה בהסרת המשימה');
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

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header with Send System Update */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">לוח בקרה</h1>
          <p className="text-muted-foreground">
            ברוך שובך, {user?.name}. להלן המצב היום.
          </p>
        </div>
        <Button
          onClick={sendSystemUpdate}
          disabled={sendingEmail}
          className="flex items-center gap-2 bg-[#34E3D9] text-[#003734] hover:bg-[#27DDD3] font-medium"
        >
          <Mail className="h-4 w-4" />
          {sendingEmail ? 'שולח...' : 'שלח עדכון מערכת'}
        </Button>
      </motion.div>

      {emailStatus && (
        <motion.div
          variants={itemVariants}
          className={`p-3 rounded-lg text-sm ${
            emailStatus.includes('בהצלחה')
              ? 'bg-green-500/10 border border-green-500/20 text-green-400'
              : 'bg-red-500/10 border border-red-500/20 text-red-400'
          }`}
        >
          {emailStatus}
        </motion.div>
      )}

      {/* Mini Task Manager */}
      <motion.div variants={itemVariants} dir="rtl">
        <Card className="bg-[#161B22] border-[#30363D]" dir="rtl">
          <CardHeader className="pb-3 text-right">
            <CardTitle className="text-lg font-semibold text-[#E6EDF3]">משימות צוות וניהול שוטף</CardTitle>
            <CardDescription className="text-[#8B949E]">
              נהל משימות צוות ופעולות שוטפות במערכת
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4" dir="rtl">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 space-y-2">
                <Label htmlFor="new-task" className="text-[#E6EDF3] block text-right">הוסף משימה חדשה</Label>
                <input
                  id="new-task"
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                  placeholder="הקלד משימה חדשה לצוות..."
                  className="w-full rounded-md border border-[#30363D] bg-[#0D1117] px-3 py-2 text-sm text-[#E6EDF3] placeholder:text-[#8B949E] focus:border-[#34E3D9] focus:outline-none focus:ring-1 focus:ring-[#34E3D9]"
                  dir="rtl"
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleAddTask}
                  disabled={addingTask || !newTaskTitle.trim()}
                  className="flex items-center gap-2 bg-[#34E3D9] text-[#003734] hover:bg-[#27DDD3] font-medium h-10"
                >
                  <Plus className="h-4 w-4" />
                  {addingTask ? 'מוסיף...' : 'הוסף למערכת'}
                </Button>
              </div>
            </div>

            {taskStatus && (
              <div className={`text-sm text-right ${
                taskStatus.includes('בהצלחה')
                  ? 'text-green-400'
                  : 'text-red-400'
              }`}>
                {taskStatus}
              </div>
            )}

            <div className="space-y-2">
              {tasks.length === 0 ? (
                <p className="text-sm text-[#8B949E] text-right py-4">אין משימות צוות רשומות כרגע. הוסף משימה ראשונה.</p>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-lg bg-[#0D1117] border border-[#30363D] hover:border-[#34E3D9]/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0" dir="rtl">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={(e) => handleToggleTask(task.id, e.target.checked)}
                        className="h-4 w-4 rounded border-[#30363D] bg-[#161B22] text-[#34E3D9] focus:ring-[#34E3D9] focus:ring-offset-0"
                      />
                      <span className={`text-sm text-right truncate ${
                        task.completed
                          ? 'text-[#8B949E] line-through'
                          : 'text-[#E6EDF3]'
                      }`}>
                        {task.title}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-2 rounded-md text-[#8B949E] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="הסר משימה"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Employee Dashboard */}
      {!isManager && !isFinance && (
        <>
          <motion.div
            variants={itemVariants}
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
          >
            <Card className="bg-[#161B22] border-[#30363D] card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-[#E6EDF3]">משמרות קרובות</CardTitle>
                <Calendar className="h-4 w-4 text-[#8B949E]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#E6EDF3]">{userShifts.length}</div>
                <p className="text-xs text-[#8B949E]">החודש</p>
              </CardContent>
            </Card>
            <Card className="bg-[#161B22] border-[#30363D] card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-[#E6EDF3]">בקשות ממתינות</CardTitle>
                <FileText className="h-4 w-4 text-[#8B949E]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#E6EDF3]">{userRequests.filter(r => r.status === 'pending_dept' || r.status === 'pending_finance').length}</div>
                <p className="text-xs text-[#8B949E]">ממתין לאישור</p>
              </CardContent>
            </Card>
            <Card className="bg-[#161B22] border-[#30363D] card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-[#E6EDF3]">שעות השבוע</CardTitle>
                <Clock className="h-4 w-4 text-[#8B949E]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#E6EDF3]">32</div>
                <p className="text-xs text-[#8B949E]">מתוך 48 מקסימום</p>
              </CardContent>
            </Card>
            <Card className="bg-[#161B22] border-[#30363D] card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-[#E6EDF3]">בקשות שאושרו</CardTitle>
                <CheckCircle className="h-4 w-4 text-[#8B949E]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#E6EDF3]">{userRequests.filter(r => r.status === 'approved').length}</div>
                <p className="text-xs text-[#8B949E]">סה"כ אושרו</p>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}

      {/* Manager/Admin Dashboard */}
      {(isManager || isFinance) && (
        <>
          <motion.div
            variants={itemVariants}
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
          >
            <Card className="bg-[#161B22] border-[#30363D] card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-[#E6EDF3]">תקציב חודשי</CardTitle>
                <DollarSign className="h-4 w-4 text-[#8B949E]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#E6EDF3]">₪125K</div>
                <p className="text-xs text-[#8B949E]">החודש</p>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
      
      {/* ... המשך רכיבים ... */}
    </motion.div>
  );
}