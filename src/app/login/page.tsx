'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { User, UserRole, getUsers, createUser, getDepartments, getBranches } from '@/lib/supabase-data';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { Loader2, Mail, Lock } from 'lucide-react';

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

export default function LoginPage() {
  const router = useRouter();
  const { setUser, setIsAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');

  useEffect(() => {
    // Check if user is already authenticated
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await handleUserLogin(session.user.email);
      }
    };
    checkSession();
  }, []);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) throw error;

      // The user will be redirected to Google
    } catch (error: any) {
      console.error('Error signing in with Google:', error);
      setError(error.message || 'Failed to sign in with Google');
      setLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user?.email) {
        await handleUserLogin(data.user.email);
      }
    } catch (error: any) {
      console.error('Error signing in with email:', error);
      setError(error.message || 'Failed to sign in');
      setLoading(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('📝 Sign up clicked with:', { email, name, password: '***' });
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Trying to sign up...');

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      });

      console.log('📊 Supabase response:', { data, error });

      if (error) {
        // If user already exists, try to sign in instead
        if (error.message.includes('User already registered') || error.message.includes('already registered')) {
          console.log('� User already exists, trying to sign in...');
          return handleEmailSignIn(e);
        }
        throw error;
      }

      if (data.user) {
        console.log('✅ User created in Supabase auth:', data.user);
        // Check if email confirmation is required
        if (data.session) {
          // User is automatically signed in (autoConfirm enabled)
          console.log('🚀 Session exists, logging in...');
          await handleUserLogin(data.user.email, name);
        } else {
          // Email confirmation required (autoConfirm disabled)
          console.log('⏳ No session, email confirmation required');
          setError('Please check your email to confirm your account');
          setLoading(false);
        }
      } else {
        console.log('❌ No user returned from Supabase');
        setError('Failed to create user account');
        setLoading(false);
      }
    } catch (error: any) {
      console.error('❌ Error signing up:', error);
      setError(error.message || 'Failed to sign up');
      setLoading(false);
    }
  };

  const handleUserLogin = async (email: string | null | undefined, userName?: string) => {
    if (!email) return;

    try {
      console.log('🔍 Looking for user:', email);
      const users = await getUsers();
      console.log('👥 Found users:', users.length);
      let foundUser = users.find((u: User) => u.email === email);

      if (!foundUser) {
        console.log('❌ User not found, creating new user...');
        // User not found in the system, create them automatically
        try {
          const departments = await getDepartments();
          const branches = await getBranches();

          console.log('🏢 Departments:', departments.length, '🏢 Branches:', branches.length);

          // Use first department and branch as defaults
          const defaultDepartment = departments[0];
          const defaultBranch = branches[0];

          if (!defaultDepartment || !defaultBranch) {
            console.error('❌ No departments or branches found');
            setError('System configuration error. Please contact administrator.');
            setLoading(false);
            return;
          }

          console.log('Creating user with:', {
            name: userName || email.split('@')[0],
            email: email,
            role: 'employee',
            department_id: defaultDepartment?.id,
            branch_id: defaultBranch?.id,
          });

          const newUser = await createUser({
            name: userName || email.split('@')[0],
            email: email,
            role: 'employee' as UserRole,
            department_id: defaultDepartment?.id || '',
            branch_id: defaultBranch?.id || '',
            avatar: email.charAt(0).toUpperCase(),
          });

          console.log('✅ User created:', newUser);
          foundUser = newUser;
        } catch (createError) {
          console.error('❌ Error creating user:', createError);
          setError('Failed to create user account. Please try again.');
          setLoading(false);
          return;
        }
      } else {
        console.log('✅ User found:', foundUser);
      }

      console.log('🚀 Logging in user...');
      setUser(foundUser);
      setIsAuthenticated(true);
      localStorage.setItem('huboffice_user', JSON.stringify(foundUser));
      console.log('✅ Redirecting to dashboard...');
      router.push('/');
    } catch (error) {
      console.error('❌ Error loading user data:', error);
      setError('Failed to load user data');
      setLoading(false);
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen flex items-center justify-center bg-[#0F1117] p-4"
    >
      <motion.div variants={itemVariants} className="w-full max-w-md">
        <Card className="glass border-[#30363D] bg-[#161B22]/80 backdrop-blur-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-3xl font-bold text-[#E6EDF3]">
              HubOffice
            </CardTitle>
            <CardDescription className="text-[#8B949E]">
              Medical Center ERP System
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-center">
              <h2 className="text-xl font-semibold text-[#E6EDF3]">
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </h2>
              <p className="text-sm text-[#8B949E]">
                {isSignUp ? 'Sign up to access your dashboard' : 'Sign in to access your dashboard'}
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={isSignUp ? handleEmailSignUp : handleEmailSignIn} className="space-y-4">
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-[#E6EDF3]">Full Name</Label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8B949E]" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-[#0D1117] border-[#30363D] text-[#E6EDF3] placeholder-[#8B949E] pr-10"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#E6EDF3]">Email</Label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8B949E]" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-[#0D1117] border-[#30363D] text-[#E6EDF3] placeholder-[#8B949E] pr-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#E6EDF3]">Password</Label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8B949E]" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-[#0D1117] border-[#30363D] text-[#E6EDF3] placeholder-[#8B949E] pr-10"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#34E3D9] text-[#003734] hover:bg-[#27DDD3] font-medium"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isSignUp ? 'Creating account...' : 'Signing in...'}
                  </>
                ) : (
                  isSignUp ? 'Sign Up' : 'Sign In'
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-[#30363D]" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#161B22] px-2 text-[#8B949E]">Or continue with</span>
              </div>
            </div>

            <Button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full bg-white text-gray-900 hover:bg-gray-100 font-medium"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign in with Google
                </>
              )}
            </Button>

            <div className="text-center text-sm text-[#8B949E]">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                }}
                className="text-[#34E3D9] hover:underline"
              >
                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </button>
            </div>

            <div className="text-center text-xs text-[#8B949E]">
              <p>By signing in, you agree to our Terms of Service and Privacy Policy</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
