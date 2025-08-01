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
    // Get initial session and persist it
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
        }
        
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };
    
    initializeAuth();

    // Listen for auth changes and persist sessions
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Handle session persistence
      if (event === 'SIGNED_IN' && session) {
        // Session is automatically persisted by Supabase
        console.log('User signed in, session persisted');
      } else if (event === 'SIGNED_OUT') {
        // Clear any local state if needed
        console.log('User signed out');
      } else if (event === 'TOKEN_REFRESHED' && session) {
        // Session token was refreshed automatically
        console.log('Session token refreshed');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, metadata?: { role: string, firstName?: string, lastName?: string }) => {
    console.log("Signing up with metadata:", metadata);
    
    const { data, error: signUpError } = await supabase.auth.signUp({
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
    
    if (signUpError) {
      console.error("Signup error:", signUpError);
      return { error: signUpError };
    }

    if (data.user) {
      console.log("User created successfully:", data.user.id);
      
      // Wait longer for the trigger to create the profile
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Check if profile was created by trigger, retry up to 3 times
      let profile = null;
      let profileError = null;
      
      for (let i = 0; i < 3; i++) {
        const { data: profileData, error: err } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', data.user.id)
          .maybeSingle();
        
        if (profileData) {
          profile = profileData;
          profileError = null;
          break;
        }
        
        profileError = err;
        
        if (i < 2) {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      if (profileError || !profile) {
        // Profile doesn't exist or there was an error, create it manually
        console.log("Creating profile manually for user:", data.user.id);
        
        // Try multiple times to create the profile
        let manualInsertError = null;
        
        for (let i = 0; i < 3; i++) {
          const { error: err } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              first_name: metadata?.firstName || '',
              last_name: metadata?.lastName || '',
              role: metadata?.role || 'respondent',
            });
          
          if (!err) {
            manualInsertError = null;
            break;
          }
          
          manualInsertError = err;
          
          if (i < 2) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
        
        if (manualInsertError) {
          console.error("Error creating profile manually:", manualInsertError);
          // This is a critical error - we need the profile for assessments to work
          return { error: new Error("Failed to create user profile. Please try again.") };
        }
      } else {
        console.log("Profile created successfully by trigger");
      }
    }
    
    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (!error && data.session) {
      console.log('User signed in successfully, session will be persisted');
    }
    
    return { error };
  };

  const signOut = async () => {
    console.log('Signing out user');
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