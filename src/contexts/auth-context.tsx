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
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user?.email) {
          const users = await getUsers();

          // A saved (impersonated) user takes precedence over the auth user,
          // so "Switch User" survives page refreshes.
          const savedUser = localStorage.getItem('huboffice_user');
          if (savedUser) {
            try {
              const parsedUser = JSON.parse(savedUser);
              const foundSaved = users.find((u: User) => u.id === parsedUser.id);
              if (foundSaved) {
                setUser(foundSaved);
                setIsAuthenticated(true);
                return;
              }
            } catch {
              localStorage.removeItem('huboffice_user');
            }
          }

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

        // No valid Supabase session — require sign-in.
        // Clear any stale saved user so the app can't bypass the login screen.
        localStorage.removeItem('huboffice_user');
        setUser(null);
        setIsAuthenticated(false);
      } catch (error) {
        console.error('Error loading users:', error);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user?.email) {
          const users = await getUsers();

          // A saved (impersonated) user takes precedence over the auth user.
          // This event also fires when the tab regains focus and Supabase
          // refreshes the session — without this check it would reset the
          // switched user back to the admin on every tab focus.
          const savedUser = localStorage.getItem('huboffice_user');
          if (savedUser) {
            try {
              const parsedUser = JSON.parse(savedUser);
              const foundSaved = users.find((u: User) => u.id === parsedUser.id);
              if (foundSaved) {
                setUser(foundSaved);
                setIsAuthenticated(true);
                return;
              }
            } catch {
              localStorage.removeItem('huboffice_user');
            }
          }

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
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data.user?.email) {
      const users = await getUsers();
      const foundUser = users.find((u: User) => u.email === data.user!.email);
      if (!foundUser) throw new Error('User not found in system');
      setUser(foundUser);
      setIsAuthenticated(true);
      localStorage.setItem('huboffice_user', JSON.stringify(foundUser));
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
    <AuthContext.Provider value={{ user, login, logout, switchUser, setUser, setIsAuthenticated, isAuthenticated, loading }}>
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
