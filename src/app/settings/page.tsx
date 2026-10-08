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
import { getSettings, updateSettings, getDepartments, getBranches, getUsers, createDepartment, deleteDepartment, createBranch, deleteBranch } from '@/lib/supabase-data';
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

  const [settings, setSettings] = useState<any>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [newDepartment, setNewDepartment] = useState({ name: '', description: '' });
  const [newBranch, setNewBranch] = useState({ name: '', location: '', address: '' });
  const [newCategory, setNewCategory] = useState('');

  React.useEffect(() => {
    const loadData = async () => {
      try {
        const [settingsData, departmentsData, branchesData, usersData] = await Promise.all([
          getSettings(),
          getDepartments(),
          getBranches(),
          getUsers()
        ]);
        setSettings(settingsData[0] || null);
        setDepartments(departmentsData);
        setBranches(branchesData);
        setUsers(usersData);
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const showMessage = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleSaveSettings = async () => {
    if (!settings?.id) return;
    setSaving(true);
    try {
      await updateSettings(settings.id, {
        reimbursement_threshold: settings.reimbursement_threshold,
        max_weekly_hours: settings.max_weekly_hours,
        request_categories: settings.request_categories
      });
      showMessage('ההגדרות נשמרו בהצלחה');
    } catch (error) {
      console.error('Error saving settings:', error);
      showMessage('שמירת ההגדרות נכשלה');
    } finally {
      setSaving(false);
    }
  };

  const handleAddDepartment = async () => {
    if (!newDepartment.name.trim()) {
      showMessage('יש להזין שם מחלקה');
      return;
    }
    try {
      const colors = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];
      const created = await createDepartment({
        name: newDepartment.name.trim(),
        description: newDepartment.description.trim(),
        manager_id: user!.id,
        color: colors[departments.length % colors.length]
      });
      setDepartments([...departments, created]);
      setNewDepartment({ name: '', description: '' });
      showMessage('המחלקה נוספה בהצלחה');
    } catch (error) {
      console.error('Error adding department:', error);
      showMessage('הוספת המחלקה נכשלה');
    }
  };

  const handleDeleteDepartment = async (deptId: string) => {
    try {
      await deleteDepartment(deptId);
      setDepartments(departments.filter(d => d.id !== deptId));
      showMessage('המחלקה הוסרה');
    } catch (error) {
      console.error('Error deleting department:', error);
      showMessage('מחיקת המחלקה נכשלה (ייתכן שמשובצים לה עובדים/משמרות)');
    }
  };

  const handleAddBranch = async () => {
    if (!newBranch.name.trim()) {
      showMessage('יש להזין שם סניף');
      return;
    }
    try {
      const created = await createBranch({
        name: newBranch.name.trim(),
        location: newBranch.location.trim(),
        address: newBranch.address.trim()
      });
      setBranches([...branches, created]);
      setNewBranch({ name: '', location: '', address: '' });
      showMessage('הסניף נוסף בהצלחה');
    } catch (error) {
      console.error('Error adding branch:', error);
      showMessage('הוספת הסניף נכשלה');
    }
  };

  const handleDeleteBranch = async (branchId: string) => {
    try {
      await deleteBranch(branchId);
      setBranches(branches.filter(b => b.id !== branchId));
      showMessage('הסניף הוסר');
    } catch (error) {
      console.error('Error deleting branch:', error);
      showMessage('מחיקת הסניף נכשלה (ייתכן שמשובצים לו עובדים)');
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim() || !settings?.id) return;
    const updated = [...(settings.request_categories || []), newCategory.trim()];
    try {
      await updateSettings(settings.id, { request_categories: updated });
      setSettings({ ...settings, request_categories: updated });
      setNewCategory('');
      showMessage('הקטגוריה נוספה בהצלחה');
    } catch (error) {
      console.error('Error adding category:', error);
      showMessage('הוספת הקטגוריה נכשלה');
    }
  };

  const handleDeleteCategory = async (category: string) => {
    if (!settings?.id) return;
    const updated = (settings.request_categories || []).filter((c: string) => c !== category);
    try {
      await updateSettings(settings.id, { request_categories: updated });
      setSettings({ ...settings, request_categories: updated });
      showMessage('הקטגוריה הוסרה');
    } catch (error) {
      console.error('Error deleting category:', error);
      showMessage('הסרת הקטגוריה נכשלה');
    }
  };

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
            <h2 className="text-xl font-semibold mb-2">גישה מוגבלת</h2>
            <p className="text-muted-foreground">עמוד זה זמין רק למנהלי מערכת.</p>
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
          <h1 className="text-3xl font-bold tracking-tight">הגדרות מערכת</h1>
          <p className="text-muted-foreground">
            ניהול תצורת מערכת והגדרות ארגוניות
          </p>
        </div>
      </motion.div>

      {statusMessage && (
        <motion.div variants={itemVariants}>
          <div className={cn(
            'rounded-lg border px-4 py-3 text-sm',
            statusMessage.includes('בהצלחה') || statusMessage.includes('הוסר') || statusMessage.includes('נוספ')
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : 'border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400'
          )}>
            {statusMessage}
          </div>
        </motion.div>
      )}

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">כללי</TabsTrigger>
          <TabsTrigger value="departments">מחלקות</TabsTrigger>
          <TabsTrigger value="branches">סניפים</TabsTrigger>
          <TabsTrigger value="categories">קטגוריות</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-4">
          <motion.div variants={itemVariants}>
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  חוקים פיננסיים
                </CardTitle>
                <CardDescription>הגדרת ספי אישור ומגבלות הוצאות</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>סף החזר הוצאות (₪)</Label>
                  <Input
                    type="number"
                    value={settings?.reimbursement_threshold ?? ''}
                    onChange={(e) => setSettings({ ...settings, reimbursement_threshold: Number(e.target.value) })}
                  />
                  <p className="text-xs text-muted-foreground">
                    הוצאות מעל סכום זה דורשות אישור מנהל כספים
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>שעות שבועיות מקסימליות</Label>
                  <Input
                    type="number"
                    value={settings?.max_weekly_hours ?? ''}
                    onChange={(e) => setSettings({ ...settings, max_weekly_hours: Number(e.target.value) })}
                  />
                  <p className="text-xs text-muted-foreground">
                    מספר שעות עבודה מקסימלי בשבוע לעובד
                  </p>
                </div>
                <Button className="w-full" onClick={handleSaveSettings} disabled={saving}>
                  <Save className="me-2 h-4 w-4" />
                  {saving ? 'שומר...' : 'שמור שינויים'}
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
                  מחלקות
                </CardTitle>
                <CardDescription>ניהול מחלקות ארגוניות</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>שם מחלקה</Label>
                    <Input
                      value={newDepartment.name}
                      onChange={(e) => setNewDepartment({ ...newDepartment, name: e.target.value })}
                      placeholder="למשל: קרדיולוגיה"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>תיאור</Label>
                    <Input
                      value={newDepartment.description}
                      onChange={(e) => setNewDepartment({ ...newDepartment, description: e.target.value })}
                      placeholder="תיאור קצר"
                    />
                  </div>
                </div>
                <Button onClick={handleAddDepartment}>
                  <Plus className="me-2 h-4 w-4" />
                  הוסף מחלקה
                </Button>

                <div className="space-y-2 pt-4">
                  <Label>מחלקות קיימות</Label>
                  <div className="space-y-2">
                    {departments.map((dept) => (
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
                            {users.filter(u => u.department_id === dept.id).length} עובדים
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
                  סניפים ומיקומים
                </CardTitle>
                <CardDescription>ניהול סניפים ומיקומים</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>שם סניף</Label>
                    <Input
                      value={newBranch.name}
                      onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })}
                      placeholder="למשל: קמפוס מרכזי"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>מיקום</Label>
                    <Input
                      value={newBranch.location}
                      onChange={(e) => setNewBranch({ ...newBranch, location: e.target.value })}
                      placeholder="למשל: תל אביב"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>כתובת</Label>
                    <Input
                      value={newBranch.address}
                      onChange={(e) => setNewBranch({ ...newBranch, address: e.target.value })}
                      placeholder="כתובת מלאה"
                    />
                  </div>
                </div>
                <Button onClick={handleAddBranch}>
                  <Plus className="me-2 h-4 w-4" />
                  הוסף סניף
                </Button>

                <div className="space-y-2 pt-4">
                  <Label>סניפים קיימים</Label>
                  <div className="space-y-2">
                    {branches.map((branch) => (
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
                  קטגוריות הוצאות
                </CardTitle>
                <CardDescription>ניהול קטגוריות החזר הוצאות</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="שם קטגוריה חדשה"
                    className="flex-1"
                  />
                  <Button onClick={handleAddCategory}>
                    <Plus className="me-2 h-4 w-4" />
                    הוסף
                  </Button>
                </div>

                <div className="space-y-2 pt-4">
                  <Label>קטגוריות קיימות</Label>
                  <div className="flex flex-wrap gap-2">
                    {(settings?.request_categories || []).map((category: string, index: number) => (
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
