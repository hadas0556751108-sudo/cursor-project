'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { getShifts, getRequests, getDepartments } from '@/lib/supabase-data';
import { Calendar, Clock, FileText, TrendingUp, AlertCircle, CheckCircle, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
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
        const [shiftsData, requestsData, departmentsData] = await Promise.all([
          getShifts(),
          getRequests(),
          getDepartments()
        ]);
        setShifts(shiftsData);
        setRequests(requestsData);
        setDepartments(departmentsData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, router]);

  const userShifts = shifts.filter(s => s.employee_id === user?.id);
  const userRequests = requests.filter(r => r.employee_id === user?.id);
  const pendingRequests = requests.filter(r => r.status === 'pending_dept' || r.status === 'pending_finance');

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

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.name}. Here's what's happening today.
        </p>
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
                <CardTitle className="text-sm font-medium text-[#E6EDF3]">Upcoming Shifts</CardTitle>
                <Calendar className="h-4 w-4 text-[#8B949E]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#E6EDF3]">{userShifts.length}</div>
                <p className="text-xs text-[#8B949E]">This month</p>
              </CardContent>
            </Card>
            <Card className="bg-[#161B22] border-[#30363D] card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-[#E6EDF3]">Pending Requests</CardTitle>
                <FileText className="h-4 w-4 text-[#8B949E]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#E6EDF3]">{userRequests.filter(r => r.status === 'pending_dept' || r.status === 'pending_finance').length}</div>
                <p className="text-xs text-[#8B949E]">Awaiting approval</p>
              </CardContent>
            </Card>
            <Card className="bg-[#161B22] border-[#30363D] card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-[#E6EDF3]">Hours This Week</CardTitle>
                <Clock className="h-4 w-4 text-[#8B949E]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#E6EDF3]">32</div>
                <p className="text-xs text-[#8B949E]">Out of 48 max</p>
              </CardContent>
            </Card>
            <Card className="bg-[#161B22] border-[#30363D] card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-[#E6EDF3]">Approved Requests</CardTitle>
                <CheckCircle className="h-4 w-4 text-[#8B949E]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#E6EDF3]">{userRequests.filter(r => r.status === 'approved').length}</div>
                <p className="text-xs text-[#8B949E]">Total approved</p>
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
                <CardTitle className="text-sm font-medium text-[#E6EDF3]">Monthly Budget</CardTitle>
                <DollarSign className="h-4 w-4 text-[#8B949E]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#E6EDF3]">₪125K</div>
                <p className="text-xs text-[#8B949E]">This month</p>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
      
      {/* ... המשך רכיבים ... */}
    </motion.div>
  );
}