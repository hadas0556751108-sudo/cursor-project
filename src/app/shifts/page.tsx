'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/auth-context';
import { getShifts, getUsers, getDepartments } from '@/lib/supabase-data';
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

  const [shifts, setShifts] = React.useState<any[]>([]);
  const [users, setUsers] = React.useState<any[]>([]);
  const [departments, setDepartments] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadData = async () => {
      try {
        const [shiftsData, usersData, departmentsData] = await Promise.all([
          getShifts(),
          getUsers(),
          getDepartments()
        ]);
        setShifts(shiftsData);
        setUsers(usersData);
        setDepartments(departmentsData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const departmentShifts = shifts.filter(s => s.department_id === user?.department_id);
  const uncoveredShifts = departmentShifts.filter(s => !s.employee_id);

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

  const handleEditShift = () => {
    console.log('Editing shift:', selectedShift?.id);
  };

  const handleAssignStaff = () => {
    console.log('Assigning staff to shift:', selectedShift?.id);
  };

  const handleAddShift = () => {
    console.log('Adding new shift');
    setShowAddDialog(false);
  };

  const calendarEvents = departmentShifts.map(shift => {
    const assignedUser = users.find(u => u.id === shift.employee_id);
    return {
      id: shift.id,
      title: assignedUser ? `${assignedUser.name}` : 'Unassigned',
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
          <h1 className="text-3xl font-bold tracking-tight">Shift Manager</h1>
          <p className="text-muted-foreground">
            Manage department schedules and assignments
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Shift
        </Button>
      </motion.div>

      {/* Alerts */}
      {uncoveredShifts.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="glass border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertTriangle className="h-5 w-5" />
                Staffing Alerts
              </CardTitle>
              <CardDescription className="text-red-600 dark:text-red-400">
                {uncoveredShifts.length} shift(s) need assignment
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
              Department Schedule
            </CardTitle>
            <CardDescription>
              Red shifts indicate uncovered positions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="min-h-[600px]">
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
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
              Shift Details
            </DialogTitle>
            <DialogDescription>
              View and edit shift information
            </DialogDescription>
          </DialogHeader>
          {selectedShift && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Date</span>
                <span className="text-sm text-muted-foreground">{selectedShift.date}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Time</span>
                <span className="text-sm text-muted-foreground">
                  {selectedShift.start_time} - {selectedShift.end_time}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Assigned To</span>
                <span className="text-sm text-muted-foreground">
                  {users.find(u => u.id === selectedShift.employee_id)?.name || 'Unassigned'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Department</span>
                <span className="text-sm text-muted-foreground">
                  {departments.find(d => d.id === selectedShift.department_id)?.name}
                </span>
              </div>
              <div className="pt-4 flex gap-2">
                <Button className="flex-1" variant="outline" onClick={handleEditShift}>
                  Edit Shift
                </Button>
                <Button className="flex-1" variant="default" onClick={handleAssignStaff}>
                  Assign Staff
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
              Add New Shift
            </DialogTitle>
            <DialogDescription>
              Create a new shift for your department
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input type="time" defaultValue="08:00" />
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <Input type="time" defaultValue="16:00" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Shift Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morning</SelectItem>
                  <SelectItem value="evening">Evening</SelectItem>
                  <SelectItem value="night">Night</SelectItem>
                  <SelectItem value="weekend">Weekend On-Call</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Assign To</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {users.filter(u => u.department_id === user?.department_id).map((u) => (
                    <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="pt-4">
              <Button className="w-full" onClick={handleAddShift}>Create Shift</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
