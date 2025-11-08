import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/services/firebase';
import { supabase, User } from '@/services/supabase';

interface AuthContextType {
  user: FirebaseUser | null;
  profile: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', firebaseUser.uid)
          .maybeSingle();

        if (error) {
          console.error('Error fetching profile:', error);
        }

        if (!data && firebaseUser.email) {
          const { data: newProfile, error: insertError } = await supabase
            .from('users')
            .insert({
              id: firebaseUser.uid,
              email: firebaseUser.email,
              display_name: firebaseUser.displayName || '',
            })
            .select()
            .single();

          if (insertError) {
            console.error('Error creating profile:', insertError);
          } else {
            setProfile(newProfile);
          }
        } else {
          setProfile(data);
        }
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const refreshProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.uid)
        .maybeSingle();

      if (error) {
        console.error('Error refreshing profile:', error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  };

  const signOut = async () => {
    try {
      await auth.signOut();
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
