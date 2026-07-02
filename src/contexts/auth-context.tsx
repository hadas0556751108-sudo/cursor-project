'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, getUsers, createUser, getDepartments, getBranches } from '@/lib/supabase-data';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  switchUser: (userId: string) => Promise<void>;
  setUser: (user: User | null) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        // Check Supabase Auth session first
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user?.email) {
          const users = await getUsers();
          const foundUser = users.find((u: User) => u.email === session.user.email);
          if (foundUser) {
            setUser(foundUser);
            setIsAuthenticated(true);
            localStorage.setItem('huboffice_user', JSON.stringify(foundUser));
            return;
          } else {
            // User exists in Supabase auth but not in database, create them
            try {
              const departments = await getDepartments();
              const branches = await getBranches();
              const defaultDepartment = departments[0];
              const defaultBranch = branches[0];

              if (defaultDepartment && defaultBranch) {
                const userName = session.user.user_metadata?.name || session.user.email.split('@')[0];
                const newUser = await createUser({
                  name: userName,
                  email: session.user.email,
                  role: 'employee' as UserRole,
                  department_id: defaultDepartment.id,
                  branch_id: defaultBranch.id,
                  avatar: session.user.email.charAt(0).toUpperCase(),
                });
                setUser(newUser);
                setIsAuthenticated(true);
                localStorage.setItem('huboffice_user', JSON.stringify(newUser));
                return;
              }
            } catch (createError) {
              console.error('Error creating user:', createError);
            }
          }
        }

        // Fallback to localStorage for demo mode
        const users = await getUsers();
        const savedUser = localStorage.getItem('huboffice_user');
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          const foundUser = users.find((u: User) => u.id === parsedUser.id);
          if (foundUser) {
            setUser(foundUser);
            setIsAuthenticated(true);
          }
        } else {
          // Default to first user for demo
          if (users.length > 0) {
            setUser(users[0]);
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        console.error('Error loading users:', error);
      }
    };
    loadUsers();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user?.email) {
          const users = await getUsers();
          const foundUser = users.find((u: User) => u.email === session.user.email);
          if (foundUser) {
            setUser(foundUser);
            setIsAuthenticated(true);
            localStorage.setItem('huboffice_user', JSON.stringify(foundUser));
          } else {
            // User exists in Supabase auth but not in database, create them
            try {
              const departments = await getDepartments();
              const branches = await getBranches();
              const defaultDepartment = departments[0];
              const defaultBranch = branches[0];

              if (defaultDepartment && defaultBranch) {
                const userName = session.user.user_metadata?.name || session.user.email.split('@')[0];
                const newUser = await createUser({
                  name: userName,
                  email: session.user.email,
                  role: 'employee' as UserRole,
                  department_id: defaultDepartment.id,
                  branch_id: defaultBranch.id,
                  avatar: session.user.email.charAt(0).toUpperCase(),
                });
                setUser(newUser);
                setIsAuthenticated(true);
                localStorage.setItem('huboffice_user', JSON.stringify(newUser));
              }
            } catch (createError) {
              console.error('Error creating user:', createError);
            }
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsAuthenticated(false);
          localStorage.removeItem('huboffice_user');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    // Mock login - in real app would call Supabase auth
    const users = await getUsers();
    const foundUser = users.find((u: User) => u.email === email);
    if (foundUser) {
      setUser(foundUser);
      setIsAuthenticated(true);
      localStorage.setItem('huboffice_user', JSON.stringify(foundUser));
    } else {
      throw new Error('Invalid credentials');
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('huboffice_user');
    // Redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  const switchUser = async (userId: string) => {
    const users = await getUsers();
    const foundUser = users.find((u: User) => u.id === userId);
    if (foundUser) {
      setUser(foundUser);
      setIsAuthenticated(true);
      localStorage.setItem('huboffice_user', JSON.stringify(foundUser));
      // Force page reload to refresh data with new user context
      window.location.reload();
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, switchUser, setUser, setIsAuthenticated, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
