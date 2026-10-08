'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '@/contexts/auth-context';
import { getRequests, getDepartments, getUsers } from '@/lib/supabase-data';
import { statusLabels, t } from '@/lib/labels';
import { DollarSign, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
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

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function FinancePage() {
  const { user } = useAuth();
  const isFinance = user?.role === 'finance' || user?.role === 'admin';

  const [requests, setRequests] = React.useState<any[]>([]);
  const [departments, setDepartments] = React.useState<any[]>([]);
  const [users, setUsers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadData = async () => {
      try {
        const [requestsData, departmentsData, usersData] = await Promise.all([
          getRequests(),
          getDepartments(),
          getUsers()
        ]);
        setRequests(requestsData);
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

  const expenseRequests = requests.filter(r => r.type === 'expense');
  const totalExpenses = expenseRequests.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  const approvedExpenses = expenseRequests.filter(r => r.status === 'approved').reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

  // Monthly expense data from real requests
  const monthNames = ['ינו', 'פבר', 'מרץ', 'אפר', 'מאי', 'יונ', 'יול', 'אוג', 'ספט', 'אוק', 'נוב', 'דצמ'];
  const monthlyMap: Record<string, number> = {};
  expenseRequests.forEach(r => {
    const d = new Date(r.created_at);
    const key = monthNames[d.getMonth()];
    monthlyMap[key] = (monthlyMap[key] || 0) + (Number(r.amount) || 0);
  });
  const monthlyData = monthNames
    .filter(m => monthlyMap[m] !== undefined)
    .map(month => ({ month, expenses: monthlyMap[month], budget: 15000 }));
  if (monthlyData.length === 0) {
    monthlyData.push({ month: 'Oct', expenses: 0, budget: 15000 });
  }

  // Category data from real requests
  const categoryMap: Record<string, number> = {};
  expenseRequests.forEach(r => {
    const cat = r.category || 'אחר';
    categoryMap[cat] = (categoryMap[cat] || 0) + (Number(r.amount) || 0);
  });
  const categoryData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));
  if (categoryData.length === 0) {
    categoryData.push({ name: 'אין נתונים', value: 1 });
  }

  // Department spending from real requests
  const deptSpending = departments.map(dept => {
    const deptUserIds = users.filter(u => u.department_id === dept.id).map(u => u.id);
    const spent = expenseRequests
      .filter(r => deptUserIds.includes(r.employee_id))
      .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
    return { ...dept, spent };
  });
  const maxSpent = Math.max(...deptSpending.map(d => d.spent), 1);

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

  if (!isFinance) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex items-center justify-center h-full"
      >
        <Card className="glass">
          <CardContent className="p-12 text-center">
            <Wallet className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">גישה מוגבלת</h2>
            <p className="text-muted-foreground">עמוד זה זמין רק למנהלי כספים ומנהלי מערכת.</p>
          </CardContent>
        </Card>
      </motion.div>
    );
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
          <h1 className="text-3xl font-bold tracking-tight">מרכז כספים</h1>
          <p className="text-muted-foreground">
            ניטור הוצאות, תקציבים ואישורים פיננסיים
          </p>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div
        variants={itemVariants}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        <Card className="glass card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">סה"כ הוצאות</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₪{totalExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">החודש</p>
          </CardContent>
        </Card>

        <Card className="glass card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">אושר</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₪{approvedExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {((approvedExpenses / totalExpenses) * 100).toFixed(0)}% מסך ההוצאות
            </p>
          </CardContent>
        </Card>

        <Card className="glass card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ממתין</CardTitle>
            <TrendingDown className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {expenseRequests.filter(r => r.status === 'pending_finance').length}
            </div>
            <p className="text-xs text-muted-foreground">ממתין לאישור</p>
          </CardContent>
        </Card>

        <Card className="glass card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">תקציב</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₪300,000</div>
            <p className="text-xs text-muted-foreground">תקציב חודשי</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <motion.div variants={itemVariants}>
          <Card className="glass">
            <CardHeader>
              <CardTitle>הוצאות חודשיות מול תקציב</CardTitle>
              <CardDescription>מעקב הוצאות לאורך 6 חודשים</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="expenses" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="budget" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="glass">
            <CardHeader>
              <CardTitle>קטגוריות הוצאות</CardTitle>
              <CardDescription>פילוח הוצאות לפי קטגוריה</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Approvals */}
      <motion.div variants={itemVariants}>
        <Card className="glass">
          <CardHeader>
            <CardTitle>בקשות הוצאה אחרונות</CardTitle>
            <CardDescription>הגשות החזר אחרונות</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {expenseRequests.map((request) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <DollarSign className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{request.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {request.category} • {new Date(request.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold">₪{Number(request.amount || 0).toLocaleString()}</span>
                    <Badge
                      variant={
                        request.status === 'approved'
                          ? 'success'
                          : request.status === 'rejected'
                          ? 'destructive'
                          : request.status === 'pending_finance'
                          ? 'info'
                          : 'warning'
                      }
                    >
                      {t(statusLabels, request.status)}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Department Spending */}
      <motion.div variants={itemVariants}>
        <Card className="glass">
          <CardHeader>
            <CardTitle>הוצאות לפי מחלקה</CardTitle>
            <CardDescription>פילוח הוצאות לפי מחלקה</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {deptSpending.map((dept) => (
                <div key={dept.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: dept.color }}
                    />
                    <span className="font-medium">{dept.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-2 w-32 rounded-full bg-secondary">
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.max((dept.spent / maxSpent) * 100, 4)}%`,
                          backgroundColor: dept.color
                        }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-20 text-right">
                      ₪{dept.spent.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
