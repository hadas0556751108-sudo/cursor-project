// Mock data for HubOffice ERP System
// This simulates the database structure without actual Supabase connection

export type UserRole = 'employee' | 'manager' | 'finance' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  departmentId: string;
  avatar?: string;
  branchId: string;
}

export interface Department {
  id: string;
  name: string;
  description: string;
  managerId: string;
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
  employeeId: string;
  departmentId: string;
  branchId: string;
  date: string;
  startTime: string;
  endTime: string;
  type: 'morning' | 'evening' | 'night' | 'weekend';
  status: 'scheduled' | 'completed' | 'cancelled';
}

export type RequestType = 'vacation' | 'sick_leave' | 'expense';
export type RequestStatus = 'pending_dept' | 'pending_finance' | 'approved' | 'rejected';

export interface Request {
  id: string;
  employeeId: string;
  type: RequestType;
  title: string;
  description: string;
  startDate?: string;
  endDate?: string;
  amount?: number;
  category?: string;
  fileUrl?: string;
  status: RequestStatus;
  createdAt: string;
  notes?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'request_submitted' | 'request_approved' | 'request_rejected' | 'shift_replacement' | 'staffing_alert';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface Settings {
  id: string;
  reimbursementThreshold: number;
  maxWeeklyHours: number;
  departments: Department[];
  branches: Branch[];
  requestCategories: string[];
}

// Mock Users
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Dr. Sarah Cohen',
    email: 'sarah.cohen@huboffice.com',
    role: 'employee',
    departmentId: '1',
    branchId: '1',
    avatar: 'SC'
  },
  {
    id: '2',
    name: 'Dr. Michael Levi',
    email: 'michael.levi@huboffice.com',
    role: 'manager',
    departmentId: '1',
    branchId: '1',
    avatar: 'ML'
  },
  {
    id: '3',
    name: 'Nurse Rachel Green',
    email: 'rachel.green@huboffice.com',
    role: 'employee',
    departmentId: '2',
    branchId: '1',
    avatar: 'RG'
  },
  {
    id: '4',
    name: 'David Katz',
    email: 'david.katz@huboffice.com',
    role: 'finance',
    departmentId: '4',
    branchId: '1',
    avatar: 'DK'
  },
  {
    id: '5',
    name: 'Admin User',
    email: 'admin@huboffice.com',
    role: 'admin',
    departmentId: '5',
    branchId: '1',
    avatar: 'AU'
  }
];

// Mock Departments
export const mockDepartments: Department[] = [
  {
    id: '1',
    name: 'Cardiology',
    description: 'Heart and cardiovascular care',
    managerId: '2',
    color: '#3b82f6'
  },
  {
    id: '2',
    name: 'Emergency',
    description: 'Emergency medical services',
    managerId: '2',
    color: '#ef4444'
  },
  {
    id: '3',
    name: 'Pediatrics',
    description: 'Child healthcare',
    managerId: '2',
    color: '#22c55e'
  },
  {
    id: '4',
    name: 'Finance',
    description: 'Financial management',
    managerId: '4',
    color: '#8b5cf6'
  },
  {
    id: '5',
    name: 'Administration',
    description: 'Hospital administration',
    managerId: '5',
    color: '#f59e0b'
  }
];

// Mock Branches
export const mockBranches: Branch[] = [
  {
    id: '1',
    name: 'Main Campus',
    location: 'Tel Aviv',
    address: '123 Medical Center Blvd, Tel Aviv'
  },
  {
    id: '2',
    name: 'North Branch',
    location: 'Haifa',
    address: '456 Health Street, Haifa'
  }
];

// Mock Shifts
export const mockShifts: Shift[] = [
  {
    id: '1',
    employeeId: '1',
    departmentId: '1',
    branchId: '1',
    date: '2026-06-15',
    startTime: '08:00',
    endTime: '16:00',
    type: 'morning',
    status: 'scheduled'
  },
  {
    id: '2',
    employeeId: '1',
    departmentId: '1',
    branchId: '1',
    date: '2026-06-16',
    startTime: '16:00',
    endTime: '00:00',
    type: 'evening',
    status: 'scheduled'
  },
  {
    id: '3',
    employeeId: '1',
    departmentId: '1',
    branchId: '1',
    date: '2026-06-18',
    startTime: '08:00',
    endTime: '16:00',
    type: 'morning',
    status: 'scheduled'
  },
  {
    id: '4',
    employeeId: '1',
    departmentId: '1',
    branchId: '1',
    date: '2026-06-20',
    startTime: '16:00',
    endTime: '00:00',
    type: 'evening',
    status: 'scheduled'
  },
  {
    id: '5',
    employeeId: '1',
    departmentId: '1',
    branchId: '1',
    date: '2026-06-22',
    startTime: '08:00',
    endTime: '16:00',
    type: 'morning',
    status: 'scheduled'
  },
  {
    id: '6',
    employeeId: '1',
    departmentId: '1',
    branchId: '1',
    date: '2026-06-25',
    startTime: '00:00',
    endTime: '08:00',
    type: 'night',
    status: 'scheduled'
  },
  {
    id: '7',
    employeeId: '1',
    departmentId: '1',
    branchId: '1',
    date: '2026-06-28',
    startTime: '08:00',
    endTime: '20:00',
    type: 'weekend',
    status: 'scheduled'
  },
  {
    id: '8',
    employeeId: '3',
    departmentId: '2',
    branchId: '1',
    date: '2026-06-15',
    startTime: '00:00',
    endTime: '08:00',
    type: 'night',
    status: 'scheduled'
  },
  {
    id: '9',
    employeeId: '3',
    departmentId: '2',
    branchId: '1',
    date: '2026-06-17',
    startTime: '08:00',
    endTime: '20:00',
    type: 'weekend',
    status: 'scheduled'
  },
  {
    id: '10',
    employeeId: '3',
    departmentId: '2',
    branchId: '1',
    date: '2026-06-19',
    startTime: '16:00',
    endTime: '00:00',
    type: 'evening',
    status: 'scheduled'
  },
  {
    id: '11',
    employeeId: '3',
    departmentId: '2',
    branchId: '1',
    date: '2026-06-21',
    startTime: '08:00',
    endTime: '16:00',
    type: 'morning',
    status: 'scheduled'
  },
  {
    id: '12',
    employeeId: '3',
    departmentId: '2',
    branchId: '1',
    date: '2026-06-24',
    startTime: '00:00',
    endTime: '08:00',
    type: 'night',
    status: 'scheduled'
  }
];

// Mock Requests
export const mockRequests: Request[] = [
  {
    id: '1',
    employeeId: '1',
    type: 'vacation',
    title: 'Summer Vacation',
    description: 'Family vacation to Europe',
    startDate: '2026-07-01',
    endDate: '2026-07-10',
    status: 'pending_dept',
    createdAt: '2026-06-10'
  },
  {
    id: '2',
    employeeId: '3',
    type: 'expense',
    title: 'Medical Conference',
    description: 'Attendance fee and travel expenses for annual conference',
    amount: 1500,
    category: 'Training',
    status: 'pending_finance',
    createdAt: '2026-06-08'
  },
  {
    id: '3',
    employeeId: '1',
    type: 'sick_leave',
    title: 'Sick Leave',
    description: 'Not feeling well, need rest',
    startDate: '2026-06-12',
    endDate: '2026-06-13',
    status: 'approved',
    createdAt: '2026-06-11'
  },
  {
    id: '4',
    employeeId: '3',
    type: 'expense',
    title: 'Medical Equipment',
    description: 'New stethoscope and medical supplies',
    amount: 850,
    category: 'Equipment',
    status: 'pending_dept',
    createdAt: '2026-06-09'
  },
  {
    id: '5',
    employeeId: '1',
    type: 'vacation',
    title: 'Personal Days',
    description: 'Personal matters',
    startDate: '2026-06-25',
    endDate: '2026-06-26',
    status: 'approved',
    createdAt: '2026-06-05'
  },
  {
    id: '6',
    employeeId: '3',
    type: 'expense',
    title: 'Travel Expenses',
    description: 'Travel to branch location for training',
    amount: 320,
    category: 'Travel',
    status: 'approved',
    createdAt: '2026-06-01'
  },
  {
    id: '7',
    employeeId: '1',
    type: 'expense',
    title: 'Continuing Education',
    description: 'Online course certification',
    amount: 450,
    category: 'Training',
    status: 'pending_finance',
    createdAt: '2026-06-07'
  },
  {
    id: '8',
    employeeId: '3',
    type: 'sick_leave',
    title: 'Medical Appointment',
    description: 'Regular checkup',
    startDate: '2026-06-20',
    endDate: '2026-06-20',
    status: 'pending_dept',
    createdAt: '2026-06-15'
  }
];

// Mock Notifications
export const mockNotifications: Notification[] = [
  {
    id: '1',
    userId: '1',
    type: 'request_approved',
    title: 'Request Approved',
    message: 'Your sick leave request has been approved',
    read: false,
    createdAt: '2026-06-11'
  },
  {
    id: '2',
    userId: '1',
    type: 'shift_replacement',
    title: 'Shift Replacement Available',
    message: 'A replacement shift is available for June 20th',
    read: false,
    createdAt: '2026-06-10'
  },
  {
    id: '3',
    userId: '1',
    type: 'staffing_alert',
    title: 'Staffing Alert',
    message: 'Emergency department needs additional staff for weekend shift',
    read: true,
    createdAt: '2026-06-09'
  },
  {
    id: '4',
    userId: '1',
    type: 'request_approved',
    title: 'Personal Days Approved',
    message: 'Your personal days request for June 25-26 has been approved',
    read: true,
    createdAt: '2026-06-07'
  },
  {
    id: '5',
    userId: '2',
    type: 'request_submitted',
    title: 'New Request',
    message: 'Dr. Sarah Cohen submitted a vacation request',
    read: false,
    createdAt: '2026-06-10'
  },
  {
    id: '6',
    userId: '2',
    type: 'staffing_alert',
    title: 'Staffing Alert',
    message: 'Cardiology department has 2 uncovered shifts next week',
    read: false,
    createdAt: '2026-06-08'
  },
  {
    id: '7',
    userId: '3',
    type: 'request_approved',
    title: 'Expense Approved',
    message: 'Your travel expense request has been approved',
    read: false,
    createdAt: '2026-06-06'
  },
  {
    id: '8',
    userId: '3',
    type: 'shift_replacement',
    title: 'Shift Change Requested',
    message: 'Nurse Rachel Green requested to swap shifts on June 19th',
    read: true,
    createdAt: '2026-06-05'
  },
  {
    id: '9',
    userId: '4',
    type: 'request_submitted',
    title: 'Finance Approval Required',
    message: 'Expense request of 1500 ILS needs approval',
    read: false,
    createdAt: '2026-06-08'
  },
  {
    id: '10',
    userId: '4',
    type: 'request_submitted',
    title: 'Finance Approval Required',
    message: 'Expense request of 450 ILS needs approval',
    read: false,
    createdAt: '2026-06-07'
  },
  {
    id: '11',
    userId: '5',
    type: 'staffing_alert',
    title: 'System Alert',
    message: 'Weekly staffing report is ready for review',
    read: false,
    createdAt: '2026-06-10'
  },
  {
    id: '12',
    userId: '5',
    type: 'request_submitted',
    title: 'New Department Request',
    message: 'New department configuration request submitted',
    read: true,
    createdAt: '2026-06-05'
  }
];

// Mock Settings
export const mockSettings: Settings = {
  id: '1',
  reimbursementThreshold: 1000,
  maxWeeklyHours: 48,
  departments: mockDepartments,
  branches: mockBranches,
  requestCategories: ['Training', 'Equipment', 'Travel', 'Medical Supplies', 'Other']
};

// Current logged-in user (can be changed for testing different roles)
export const currentUser: User = mockUsers[0]; // Default: Dr. Sarah Cohen (employee)
