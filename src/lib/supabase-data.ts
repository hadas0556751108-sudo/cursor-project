import { supabase } from './supabase';

// Types
export type UserRole = 'employee' | 'manager' | 'finance' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department_id: string;
  branch_id: string;
  avatar?: string;
}

export interface Department {
  id: string;
  name: string;
  description: string;
  manager_id: string;
  color: string;
}

export interface Branch {
  id: string;
  name: string;
  location: string;
  address: string;
}

export interface Shift {
  id: string;
  employee_id: string;
  department_id: string;
  branch_id: string;
  date: string;
  start_time: string;
  end_time: string;
  type: 'morning' | 'evening' | 'night' | 'weekend';
  status: 'scheduled' | 'completed' | 'cancelled';
}

export type RequestType = 'vacation' | 'sick_leave' | 'expense';
export type RequestStatus = 'pending_dept' | 'pending_finance' | 'approved' | 'rejected';

export interface Request {
  id: string;
  employee_id: string;
  type: RequestType;
  title: string;
  description: string;
  start_date?: string;
  end_date?: string;
  amount?: number;
  category?: string;
  file_url?: string;
  status: RequestStatus;
  notes?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'request_submitted' | 'request_approved' | 'request_rejected' | 'shift_replacement' | 'staffing_alert';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface Settings {
  id: string;
  reimbursement_threshold: number;
  max_weekly_hours: number;
  request_categories: string[];
}

export interface UserNote {
  id: string;
  user_id: string;
  note: string;
  created_at: string;
  updated_at: string;
}

export interface UserTask {
  id: string;
  user_id: string;
  title: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

// Functions to fetch data from Supabase
export async function getUsers(): Promise<User[]> {
  const { data, error } = await supabase.from('users').select('*');
  if (error) throw error;
  return data || [];
}

export async function getDepartments(): Promise<Department[]> {
  const { data, error } = await supabase.from('departments').select('*');
  if (error) throw error;
  return data || [];
}

export async function getBranches(): Promise<Branch[]> {
  const { data, error } = await supabase.from('branches').select('*');
  if (error) throw error;
  return data || [];
}

export async function getShifts(): Promise<Shift[]> {
  const { data, error } = await supabase.from('shifts').select('*');
  if (error) throw error;
  return data || [];
}

export async function getRequests(): Promise<Request[]> {
  const { data, error } = await supabase.from('requests').select('*');
  if (error) throw error;
  return data || [];
}

export async function getNotifications(): Promise<Notification[]> {
  const { data, error } = await supabase.from('notifications').select('*');
  if (error) throw error;
  return data || [];
}

export async function getSettings(): Promise<Settings[]> {
  const { data, error } = await supabase.from('settings').select('*');
  if (error) throw error;
  return data || [];
}

// Functions to insert data
export async function createUser(user: Omit<User, 'id'>): Promise<User> {
  const { data, error } = await supabase.from('users').insert(user).select().single();
  if (error) throw error;
  return data;
}

export async function createRequest(request: Omit<Request, 'id' | 'created_at'>): Promise<Request> {
  const { data, error } = await supabase.from('requests').insert(request).select().single();
  if (error) throw error;
  return data;
}

export async function createNotification(notification: Omit<Notification, 'id' | 'created_at'>): Promise<Notification> {
  const { data, error } = await supabase.from('notifications').insert(notification).select().single();
  if (error) throw error;
  return data;
}

export async function createShift(shift: Omit<Shift, 'id'>): Promise<Shift> {
  const { data, error } = await supabase.from('shifts').insert(shift).select().single();
  if (error) throw error;
  return data;
}

// Functions to update data
export async function updateRequest(id: string, updates: Partial<Request>): Promise<Request> {
  const { data, error } = await supabase.from('requests').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function updateNotification(id: string, updates: Partial<Notification>): Promise<Notification> {
  const { data, error } = await supabase.from('notifications').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function updateShift(id: string, updates: Partial<Shift>): Promise<Shift> {
  const { data, error } = await supabase.from('shifts').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function getUserNote(userId: string): Promise<UserNote | null> {
  const { data, error } = await supabase
    .from('user_notes')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}

export async function saveUserNote(userId: string, note: string): Promise<UserNote> {
  const { data: existingNote } = await supabase
    .from('user_notes')
    .select('id')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle();

  if (existingNote) {
    const { data, error } = await supabase
      .from('user_notes')
      .update({ note, updated_at: new Date().toISOString() })
      .eq('id', existingNote.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  const { data, error } = await supabase
    .from('user_notes')
    .insert({ user_id: userId, note })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getUserTasks(userId: string): Promise<UserTask[]> {
  const { data, error } = await supabase
    .from('user_tasks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createUserTask(userId: string, title: string): Promise<UserTask> {
  const { data, error } = await supabase
    .from('user_tasks')
    .insert({ user_id: userId, title })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateUserTask(id: string, updates: Partial<UserTask>): Promise<UserTask> {
  const { data, error } = await supabase
    .from('user_tasks')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteUserTask(id: string): Promise<void> {
  const { error } = await supabase.from('user_tasks').delete().eq('id', id);
  if (error) throw error;
}

export async function deleteNotification(id: string): Promise<void> {
  const { error } = await supabase.from('notifications').delete().eq('id', id);
  if (error) throw error;
}

export async function updateSettings(id: string, updates: Partial<Settings>): Promise<Settings> {
  const { data, error } = await supabase
    .from('settings')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function createDepartment(department: Omit<Department, 'id'>): Promise<Department> {
  const { data, error } = await supabase.from('departments').insert(department).select().single();
  if (error) throw error;
  return data;
}

export async function deleteDepartment(id: string): Promise<void> {
  const { error } = await supabase.from('departments').delete().eq('id', id);
  if (error) throw error;
}

export async function createBranch(branch: Omit<Branch, 'id'>): Promise<Branch> {
  const { data, error } = await supabase.from('branches').insert(branch).select().single();
  if (error) throw error;
  return data;
}

export async function deleteBranch(id: string): Promise<void> {
  const { error } = await supabase.from('branches').delete().eq('id', id);
  if (error) throw error;
}
