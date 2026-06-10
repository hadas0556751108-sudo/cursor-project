'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { mockShifts, mockRequests, mockDepartments } from '@/lib/mock-data';
// הוספתי כאן את DollarSign
import { Calendar, Clock, FileText, TrendingUp, AlertCircle, CheckCircle, DollarSign } from 'lucide-react';
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

export default function Dashboard() {
  const { user } = useAuth();
  const isManager = user?.role === 'manager' || user?.role === 'admin';
  const isFinance = user?.role === 'finance' || user?.role === 'admin';

  const userShifts = mockShifts.filter(s => s.employeeId === user?.id);
  const userRequests = mockRequests.filter(r => r.employeeId === user?.id);
  const pendingRequests = mockRequests.filter(r => r.status === 'pending_dept' || r.status === 'pending_finance');

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
           
            <Card className="glass card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Budget</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₪125K</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
      
      {/* ... המשך רכיבים ... */}
    </motion.div>
  );
}