'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { User, getUsers, createUser, getDepartments, getBranches, UserRole } from '@/lib/supabase-data';
import { useAuth } from '@/contexts/auth-context';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const router = useRouter();
  const { setUser, setIsAuthenticated } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) throw error;

        if (data.session?.user?.email) {
          const users = await getUsers();
          let foundUser = users.find((u: User) => u.email === data.session.user.email);

          if (!foundUser) {
            // User not found in the system, create them automatically
            try {
              const departments = await getDepartments();
              const branches = await getBranches();

              // Use first department and branch as defaults
              const defaultDepartment = departments[0];
              const defaultBranch = branches[0];

              const userName = data.session.user.user_metadata?.name || data.session.user.email.split('@')[0];

              const newUser = await createUser({
                name: userName,
                email: data.session.user.email,
                role: 'employee' as UserRole,
                department_id: defaultDepartment?.id || '',
                branch_id: defaultBranch?.id || '',
                avatar: data.session.user.email.charAt(0).toUpperCase(),
              });

              foundUser = newUser;
            } catch (createError) {
              console.error('Error creating user:', createError);
              setError('Failed to create user account. Please try again.');
              return;
            }
          }

          setUser(foundUser);
          setIsAuthenticated(true);
          localStorage.setItem('huboffice_user', JSON.stringify(foundUser));
          router.push('/');
        } else {
          setError('No session found');
        }
      } catch (error: any) {
        console.error('Error handling auth callback:', error);
        setError(error.message || 'Authentication failed');
      }
    };

    handleAuthCallback();
  }, [router, setUser, setIsAuthenticated]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F1117]">
        <div className="text-center space-y-4">
          <div className="text-red-400 text-xl">{error}</div>
          <button
            onClick={() => router.push('/login')}
            className="text-[#34E3D9] hover:underline"
          >
            Return to login
          </button>
        </div>
      </div>
    );
  }
  
  
  
  
  
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F1117]">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-[#34E3D9] mx-auto" />
        <p className="text-[#8B949E]">Signing you in...</p>
      </div>
    </div>
  );
}
