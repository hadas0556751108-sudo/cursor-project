'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/auth-context';
import { getRequests, getUsers, getSettings, updateRequest, createRequest } from '@/lib/supabase-data';
import { requestTypeLabels, t } from '@/lib/labels';
import { FileText, Plus, Calendar, DollarSign, CheckCircle, XCircle, Clock } from 'lucide-react';
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

export default function RequestsPage() {
  const { user } = useAuth();
  const [showNewRequestDialog, setShowNewRequestDialog] = useState(false);
  const [requestType, setRequestType] = useState<'vacation' | 'sick_leave' | 'expense'>('vacation');
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const isManager = user?.role === 'manager' || user?.role === 'admin';
  const isFinance = user?.role === 'finance' || user?.role === 'admin';

  const [requests, setRequests] = React.useState<any[]>([]);
  const [users, setUsers] = React.useState<any[]>([]);
  const [settings, setSettings] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadData = async () => {
      try {
        const [requestsData, usersData, settingsData] = await Promise.all([
          getRequests(),
          getUsers(),
          getSettings()
        ]);
        setRequests(requestsData);
        setUsers(usersData);
        setSettings(settingsData[0]);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const userRequests = requests.filter(r => r.employee_id === user?.id);
  const pendingDept = requests.filter(r => r.status === 'pending_dept');
  const pendingFinance = requests.filter(r => r.status === 'pending_finance');

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success" className="gap-1"><CheckCircle className="h-3 w-3" /> אושר</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> נדחה</Badge>;
      case 'pending_finance':
        return <Badge variant="info" className="gap-1"><Clock className="h-3 w-3" /> ממתין לכספים</Badge>;
      default:
        return <Badge variant="warning" className="gap-1"><Clock className="h-3 w-3" /> ממתין למחלקה</Badge>;
    }
  };

  const getRequestIcon = (type: string) => {
    switch (type) {
      case 'expense':
        return <DollarSign className="h-5 w-5" />;
      default:
        return <Calendar className="h-5 w-5" />;
    }
  };

  const handleSubmitRequest = async () => {
    if (!user || !title.trim()) {
      setStatusMessage('יש למלא כותרת לפני השליחה');
      return;
    }
    setSubmitting(true);
    setStatusMessage(null);
    try {
      const newRequest = await createRequest({
        employee_id: user.id,
        type: requestType,
        title: title.trim(),
        description: description.trim(),
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        amount: requestType === 'expense' ? Number(amount) : undefined,
        category: requestType === 'expense' ? category : undefined,
        status: 'pending_dept',
      });
      setRequests([newRequest, ...requests]);
      setShowNewRequestDialog(false);
      resetForm();
      setStatusMessage('הבקשה נשלחה בהצלחה');
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (error) {
      console.error('Error submitting request:', error);
      setStatusMessage('שליחת הבקשה נכשלה. נסה שוב.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setStartDate('');
    setEndDate('');
    setAmount('');
    setCategory('');
  };

  const handleApprove = async (requestId: string) => {
    const request = requests.find(r => r.id === requestId);
    if (!request) return;

    const threshold = settings?.reimbursement_threshold ?? 1000;
    const nextStatus =
      request.status === 'pending_dept' &&
      request.type === 'expense' &&
      Number(request.amount) > threshold
        ? 'pending_finance'
        : 'approved';

    try {
      await updateRequest(requestId, { status: nextStatus });
      setRequests(requests.map(r => r.id === requestId ? { ...r, status: nextStatus } : r));
    } catch (error) {
      console.error('Error approving request:', error);
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await updateRequest(requestId, { status: 'rejected' });
      setRequests(requests.map(r => r.id === requestId ? { ...r, status: 'rejected' } : r));
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  const handleCancel = async (requestId: string) => {
    try {
      await updateRequest(requestId, { status: 'rejected' });
      setRequests(requests.map(r => r.id === requestId ? { ...r, status: 'rejected' } : r));
    } catch (error) {
      console.error('Error cancelling request:', error);
    }
  };

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
          <h1 className="text-3xl font-bold tracking-tight">מרכז בקשות</h1>
          <p className="text-muted-foreground">
            הגשה וניהול בקשות
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => setShowNewRequestDialog(true)}>
            <Plus className="me-2 h-4 w-4" />
            בקשה חדשה
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

      {/* Tabs */}
      <motion.div variants={itemVariants}>
        <Tabs defaultValue="my-requests" className="space-y-4">
          <TabsList>
            <TabsTrigger value="my-requests">הבקשות שלי</TabsTrigger>
            {isManager && <TabsTrigger value="pending-dept">ממתין לאישור מחלקה</TabsTrigger>}
            {isFinance && <TabsTrigger value="pending-finance">ממתין לאישור כספים</TabsTrigger>}
          </TabsList>

          {/* My Requests */}
          <TabsContent value="my-requests" className="space-y-4">
            <Card className="glass">
              <CardHeader>
                <CardTitle>הבקשות שלי</CardTitle>
                <CardDescription>צפייה בבקשות שהוגשו</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userRequests.length > 0 ? userRequests.map((request) => (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          {getRequestIcon(request.type)}
                        </div>
                        <div>
                          <p className="font-medium">{request.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {t(requestTypeLabels, request.type)}
                            {request.amount && ` - ₪${request.amount}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(request.status)}
                        {(request.status === 'pending_dept' || request.status === 'pending_finance') && (
                          <Button size="sm" variant="ghost" onClick={() => handleCancel(request.id)}>ביטול</Button>
                        )}
                      </div>
                    </motion.div>
                  )) : (
                    <p className="text-center text-muted-foreground py-8">אין בקשות עדיין</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pending Dept Approval */}
          {isManager && (
            <TabsContent value="pending-dept" className="space-y-4">
              <Card className="glass">
                <CardHeader>
                  <CardTitle>ממתין לאישור מחלקה</CardTitle>
                  <CardDescription>בקשות הממתינות לסקירתך</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingDept.length > 0 ? pendingDept.map((request) => {
                      const requestUser = users.find(u => u.id === request.employee_id);
                      return (
                        <motion.div
                          key={request.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                              {getRequestIcon(request.type)}
                            </div>
                            <div>
                              <p className="font-medium">{request.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {requestUser?.name} • {t(requestTypeLabels, request.type)}
                                {request.amount && ` - ₪${request.amount}`}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleReject(request.id)}>דחייה</Button>
                            <Button size="sm" variant="default" onClick={() => handleApprove(request.id)}>אישור</Button>
                          </div>
                        </motion.div>
                      );
                    }) : (
                      <p className="text-center text-muted-foreground py-8">אין אישורים ממתינים</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Pending Finance Approval */}
          {isFinance && (
            <TabsContent value="pending-finance" className="space-y-4">
              <Card className="glass">
                <CardHeader>
                  <CardTitle>ממתין לאישור כספים</CardTitle>
                  <CardDescription>בקשות הוצאה מעל ₪{settings?.reimbursement_threshold}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingFinance.length > 0 ? pendingFinance.map((request) => {
                      const requestUser = users.find(u => u.id === request.employee_id);
                      return (
                        <motion.div
                          key={request.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                              <DollarSign className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-medium">{request.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {requestUser?.name} • ₪{request.amount}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleReject(request.id)}>דחייה</Button>
                            <Button size="sm" variant="default" onClick={() => handleApprove(request.id)}>אישור</Button>
                          </div>
                        </motion.div>
                      );
                    }) : (
                      <p className="text-center text-muted-foreground py-8">אין אישורים ממתינים</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </motion.div>

      {/* New Request Dialog */}
      <Dialog open={showNewRequestDialog} onOpenChange={(open) => {
        setShowNewRequestDialog(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              הגשת בקשה חדשה
            </DialogTitle>
            <DialogDescription>
              מלא את פרטי הבקשה
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>סוג בקשה</Label>
              <Select value={requestType} onValueChange={(value: any) => setRequestType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vacation">חופשה</SelectItem>
                  <SelectItem value="sick_leave">מחלה</SelectItem>
                  <SelectItem value="expense">החזר הוצאות</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>כותרת</Label>
              <Input 
                placeholder="כותרת הבקשה" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>תיאור</Label>
              <Input 
                placeholder="תיאור קצר" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            {requestType !== 'expense' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>תאריך התחלה</Label>
                  <Input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>תאריך סיום</Label>
                  <Input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            )}
            {requestType === 'expense' && (
              <>
                <div className="space-y-2">
                  <Label>סכום (₪)</Label>
                  <Input 
                    type="number" 
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>קטגוריה</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="בחר קטגוריה" />
                    </SelectTrigger>
                    <SelectContent>
                      {(settings?.request_categories || []).map((cat: string) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            <div className="pt-4 space-y-3">
              <Button className="w-full" onClick={handleSubmitRequest} disabled={submitting || !title.trim()}>
                {submitting ? 'שולח...' : 'שלח בקשה'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
