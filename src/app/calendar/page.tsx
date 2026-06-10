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
import { useAuth } from '@/contexts/auth-context';
import { mockShifts, mockDepartments } from '@/lib/mock-data';
import { Calendar as CalendarIcon, Clock, User } from 'lucide-react';
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

export default function CalendarPage() {
  const { user } = useAuth();
  const [selectedShift, setSelectedShift] = useState<any>(null);

  const userShifts = mockShifts.filter(s => s.employeeId === user?.id);

  const handleRequestReplacement = () => {
    console.log('Requesting replacement for shift:', selectedShift?.id);
    setSelectedShift(null);
  };

  const calendarEvents = userShifts.map(shift => ({
    id: shift.id,
    title: `${shift.type} shift`,
    start: `${shift.date}T${shift.startTime}`,
    end: `${shift.date}T${shift.endTime}`,
    backgroundColor: getShiftColor(shift.type),
    borderColor: getShiftColor(shift.type),
    extendedProps: shift
  }));

  function getShiftColor(type: string) {
    switch (type) {
      case 'morning':
        return '#3b82f6';
      case 'evening':
        return '#f59e0b';
      case 'night':
        return '#6366f1';
      case 'weekend':
        return '#10b981';
      default:
        return '#6b7280';
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
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold tracking-tight">My Calendar</h1>
        <p className="text-muted-foreground">
          View and manage your scheduled shifts
        </p>
      </motion.div>

      {/* Calendar */}
      <motion.div variants={itemVariants}>
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Schedule Overview
            </CardTitle>
            <CardDescription>
              Click on any shift to view details or request a replacement
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
              View your shift information
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
                  {selectedShift.startTime} - {selectedShift.endTime}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Type</span>
                <Badge variant="secondary" className="capitalize">
                  {selectedShift.type}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Department</span>
                <span className="text-sm text-muted-foreground">
                  {mockDepartments.find(d => d.id === selectedShift.departmentId)?.name}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status</span>
                <Badge
                  variant={selectedShift.status === 'completed' ? 'success' : 'info'}
                  className="capitalize"
                >
                  {selectedShift.status}
                </Badge>
              </div>
              <div className="pt-4">
                <Button className="w-full" variant="outline" onClick={handleRequestReplacement}>
                  Request Replacement
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Legend */}
      <motion.div variants={itemVariants}>
        <Card className="glass">
          <CardHeader>
            <CardTitle>Shift Types</CardTitle>
            <CardDescription>Color-coded shift categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { type: 'morning', color: '#3b82f6', label: 'Morning (8AM-4PM)' },
                { type: 'evening', color: '#f59e0b', label: 'Evening (4PM-12AM)' },
                { type: 'night', color: '#6366f1', label: 'Night (12AM-8AM)' },
                { type: 'weekend', color: '#10b981', label: 'Weekend On-Call' }
              ].map((shift) => (
                <div key={shift.type} className="flex items-center gap-2">
                  <div
                    className="h-4 w-4 rounded"
                    style={{ backgroundColor: shift.color }}
                  />
                  <span className="text-sm">{shift.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
