import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, metadata?: { role: string, firstName?: string, lastName?: string }) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, metadata?: { role: string, firstName?: string, lastName?: string }) => {
    console.log("Signing up with metadata:", metadata);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: metadata?.role || 'respondent',
          first_name: metadata?.firstName || '',
          last_name: metadata?.lastName || '',
        },
      },
    });
    
    if (error) {
      console.error("Signup error:", error);
      return { error };
    }

    if (data.user) {
      console.log("User created successfully:", data.user.id);
      
      // Wait a moment for the trigger to create the profile
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verify profile was created, if not create it manually
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .single();
      
      if (profileError && profileError.code === 'PGRST116') {
        // Profile doesn't exist, create it manually
        console.log("Creating profile manually for user:", data.user.id);
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            first_name: metadata?.firstName || '',
            last_name: metadata?.lastName || '',
            role: metadata?.role || 'respondent',
          });
        
        if (insertError) {
          console.error("Error creating profile manually:", insertError);
          return { error: insertError };
        }
      }
    }
    
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    session,
    user,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}