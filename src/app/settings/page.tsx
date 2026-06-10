'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/auth-context';
import { mockSettings, mockDepartments, mockBranches, mockUsers } from '@/lib/mock-data';
import { Settings as SettingsIcon, Building2, MapPin, Wallet, Users, Save, Plus, Trash2 } from 'lucide-react';
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

export default function SettingsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [settings, setSettings] = useState(mockSettings);
  const [newDepartment, setNewDepartment] = useState({ name: '', description: '' });
  const [newBranch, setNewBranch] = useState({ name: '', location: '', address: '' });
  const [newCategory, setNewCategory] = useState('');

  const handleSaveSettings = () => {
    console.log('Saving settings:', settings);
  };

  const handleAddDepartment = () => {
    console.log('Adding department:', newDepartment);
    setNewDepartment({ name: '', description: '' });
  };

  const handleDeleteDepartment = (deptId: string) => {
    console.log('Deleting department:', deptId);
  };

  const handleAddBranch = () => {
    console.log('Adding branch:', newBranch);
    setNewBranch({ name: '', location: '', address: '' });
  };

  const handleDeleteBranch = (branchId: string) => {
    console.log('Deleting branch:', branchId);
  };

  const handleAddCategory = () => {
    console.log('Adding category:', newCategory);
    setNewCategory('');
  };

  const handleDeleteCategory = (category: string) => {
    console.log('Deleting category:', category);
  };

  if (!isAdmin) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex items-center justify-center h-full"
      >
        <Card className="glass">
          <CardContent className="p-12 text-center">
            <SettingsIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
            <p className="text-muted-foreground">This page is only accessible to Super Admins.</p>
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
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold tracking-tight">Admin Settings</h1>
        <p className="text-muted-foreground">
          Manage system configuration and organizational settings
        </p>
      </motion.div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="branches">Branches</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-4">
          <motion.div variants={itemVariants}>
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Financial Rules
                </CardTitle>
                <CardDescription>Configure expense approval thresholds and limits</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Reimbursement Threshold (₪)</Label>
                  <Input
                    type="number"
                    value={settings.reimbursementThreshold}
                    onChange={(e) => setSettings({ ...settings, reimbursementThreshold: Number(e.target.value) })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Expenses above this amount require Finance Manager approval
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Maximum Weekly Hours</Label>
                  <Input
                    type="number"
                    value={settings.maxWeeklyHours}
                    onChange={(e) => setSettings({ ...settings, maxWeeklyHours: Number(e.target.value) })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Maximum allowed working hours per week per employee
                  </p>
                </div>
                <Button className="w-full" onClick={handleSaveSettings}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Departments */}
        <TabsContent value="departments" className="space-y-4">
          <motion.div variants={itemVariants}>
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Departments
                </CardTitle>
                <CardDescription>Manage organizational departments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Department Name</Label>
                    <Input
                      value={newDepartment.name}
                      onChange={(e) => setNewDepartment({ ...newDepartment, name: e.target.value })}
                      placeholder="e.g., Cardiology"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input
                      value={newDepartment.description}
                      onChange={(e) => setNewDepartment({ ...newDepartment, description: e.target.value })}
                      placeholder="Brief description"
                    />
                  </div>
                </div>
                <Button onClick={handleAddDepartment}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Department
                </Button>

                <div className="space-y-2 pt-4">
                  <Label>Existing Departments</Label>
                  <div className="space-y-2">
                    {settings.departments.map((dept) => (
                      <div
                        key={dept.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: dept.color }}
                          />
                          <div>
                            <p className="font-medium">{dept.name}</p>
                            <p className="text-xs text-muted-foreground">{dept.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {mockUsers.filter(u => u.departmentId === dept.id).length} staff
                          </Badge>
                          <Button size="icon" variant="ghost" onClick={() => handleDeleteDepartment(dept.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Branches */}
        <TabsContent value="branches" className="space-y-4">
          <motion.div variants={itemVariants}>
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Branches & Locations
                </CardTitle>
                <CardDescription>Manage hospital branches and locations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Branch Name</Label>
                    <Input
                      value={newBranch.name}
                      onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })}
                      placeholder="e.g., Main Campus"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input
                      value={newBranch.location}
                      onChange={(e) => setNewBranch({ ...newBranch, location: e.target.value })}
                      placeholder="e.g., Tel Aviv"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Address</Label>
                    <Input
                      value={newBranch.address}
                      onChange={(e) => setNewBranch({ ...newBranch, address: e.target.value })}
                      placeholder="Full address"
                    />
                  </div>
                </div>
                <Button onClick={handleAddBranch}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Branch
                </Button>

                <div className="space-y-2 pt-4">
                  <Label>Existing Branches</Label>
                  <div className="space-y-2">
                    {settings.branches.map((branch) => (
                      <div
                        key={branch.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div>
                          <p className="font-medium">{branch.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {branch.location} • {branch.address}
                          </p>
                        </div>
                        <Button size="icon" variant="ghost" onClick={() => handleDeleteBranch(branch.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Categories */}
        <TabsContent value="categories" className="space-y-4">
          <motion.div variants={itemVariants}>
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Expense Categories
                </CardTitle>
                <CardDescription>Manage expense reimbursement categories</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="New category name"
                    className="flex-1"
                  />
                  <Button onClick={handleAddCategory}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add
                  </Button>
                </div>

                <div className="space-y-2 pt-4">
                  <Label>Existing Categories</Label>
                  <div className="flex flex-wrap gap-2">
                    {settings.requestCategories.map((category, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="flex items-center gap-2 px-3 py-1"
                      >
                        {category}
                        <button className="ml-1 hover:text-destructive" onClick={() => handleDeleteCategory(category)}>
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
