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
