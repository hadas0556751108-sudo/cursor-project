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
import { mockRequests, mockUsers, mockSettings } from '@/lib/mock-data';
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

  const isManager = user?.role === 'manager' || user?.role === 'admin';
  const isFinance = user?.role === 'finance' || user?.role === 'admin';

  const userRequests = mockRequests.filter(r => r.employeeId === user?.id);
  const pendingDept = mockRequests.filter(r => r.status === 'pending_dept');
  const pendingFinance = mockRequests.filter(r => r.status === 'pending_finance');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success" className="gap-1"><CheckCircle className="h-3 w-3" /> Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> Rejected</Badge>;
      case 'pending_finance':
        return <Badge variant="info" className="gap-1"><Clock className="h-3 w-3" /> Pending Finance</Badge>;
      default:
        return <Badge variant="warning" className="gap-1"><Clock className="h-3 w-3" /> Pending Dept</Badge>;
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

  const handleSubmitRequest = () => {
    console.log('Submitting request:', { requestType, title, description, startDate, endDate, amount, category });
    setShowNewRequestDialog(false);
    setTitle('');
    setDescription('');
    setStartDate('');
    setEndDate('');
    setAmount('');
    setCategory('');
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setStartDate('');
    setEndDate('');
    setAmount('');
    setCategory('');
  };

  const handleApprove = (requestId: string) => {
    console.log('Approving request:', requestId);
  };

  const handleReject = (requestId: string) => {
    console.log('Rejecting request:', requestId);
  };

  const handleCancel = (requestId: string) => {
    console.log('Cancelling request:', requestId);
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
          <h1 className="text-3xl font-bold tracking-tight">Request Center</h1>
          <p className="text-muted-foreground">
            Submit and manage your requests
          </p>
        </div>
        <Button onClick={() => setShowNewRequestDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Request
        </Button>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants}>
        <Tabs defaultValue="my-requests" className="space-y-4">
          <TabsList>
            <TabsTrigger value="my-requests">My Requests</TabsTrigger>
            {isManager && <TabsTrigger value="pending-dept">Pending Dept Approval</TabsTrigger>}
            {isFinance && <TabsTrigger value="pending-finance">Pending Finance Approval</TabsTrigger>}
          </TabsList>

          {/* My Requests */}
          <TabsContent value="my-requests" className="space-y-4">
            <Card className="glass">
              <CardHeader>
                <CardTitle>My Requests</CardTitle>
                <CardDescription>View your submitted requests</CardDescription>
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
                          <p className="text-sm text-muted-foreground capitalize">
                            {request.type.replace('_', ' ')}
                            {request.amount && ` - ₪${request.amount}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(request.status)}
                        {(request.status === 'pending_dept' || request.status === 'pending_finance') && (
                          <Button size="sm" variant="ghost" onClick={() => handleCancel(request.id)}>Cancel</Button>
                        )}
                      </div>
                    </motion.div>
                  )) : (
                    <p className="text-center text-muted-foreground py-8">No requests yet</p>
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
                  <CardTitle>Pending Department Approval</CardTitle>
                  <CardDescription>Requests awaiting your review</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingDept.length > 0 ? pendingDept.map((request) => {
                      const requestUser = mockUsers.find(u => u.id === request.employeeId);
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
                                {requestUser?.name} • {request.type.replace('_', ' ')}
                                {request.amount && ` - ₪${request.amount}`}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleReject(request.id)}>Reject</Button>
                            <Button size="sm" variant="default" onClick={() => handleApprove(request.id)}>Approve</Button>
                          </div>
                        </motion.div>
                      );
                    }) : (
                      <p className="text-center text-muted-foreground py-8">No pending approvals</p>
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
                  <CardTitle>Pending Finance Approval</CardTitle>
                  <CardDescription>Expense requests above ₪{mockSettings.reimbursementThreshold}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingFinance.length > 0 ? pendingFinance.map((request) => {
                      const requestUser = mockUsers.find(u => u.id === request.employeeId);
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
                            <Button size="sm" variant="outline" onClick={() => handleReject(request.id)}>Reject</Button>
                            <Button size="sm" variant="default" onClick={() => handleApprove(request.id)}>Approve</Button>
                          </div>
                        </motion.div>
                      );
                    }) : (
                      <p className="text-center text-muted-foreground py-8">No pending approvals</p>
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
              Submit New Request
            </DialogTitle>
            <DialogDescription>
              Fill in the details for your request
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Request Type</Label>
              <Select value={requestType} onValueChange={(value: any) => setRequestType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vacation">Vacation</SelectItem>
                  <SelectItem value="sick_leave">Sick Leave</SelectItem>
                  <SelectItem value="expense">Expense Reimbursement</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input 
                placeholder="Request title" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input 
                placeholder="Brief description" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            {requestType !== 'expense' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
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
                  <Label>Amount (₪)</Label>
                  <Input 
                    type="number" 
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockSettings.requestCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            <div className="pt-4">
              <Button className="w-full" onClick={handleSubmitRequest}>Submit Request</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
