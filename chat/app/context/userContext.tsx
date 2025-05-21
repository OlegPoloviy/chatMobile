import { supabaseClient } from "@/services/supabaseClient";
import { Session } from "@supabase/supabase-js";
import React, { createContext, useContext, useEffect, useState } from "react";

interface AppUser {
  id: string;
  username: string;
}

interface UserContextType {
  user: AppUser | null;
  setUser: (user: AppUser | null) => void;
  session: Session | null;
  setSession: (session: Session | null) => void;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    username: string,
    fullName?: string
  ) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        // Map Supabase user to AppUser
        setUser({
          id: session.user.id,
          username:
            session.user.user_metadata.username ||
            session.user.email ||
            "Unknown",
        });
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        // Map Supabase user to AppUser
        setUser({
          id: session.user.id,
          username:
            session.user.user_metadata.username ||
            session.user.email ||
            "Unknown",
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (
    email: string,
    password: string,
    username?: string,
    fullName?: string
  ) => {
    try {
      setError(null);
      const { error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
            full_name: fullName,
          },
        },
      });

      if (error) throw error;
    } catch (err) {
      console.log(err);
      setError(
        err instanceof Error ? err.message : "An error occurred during sign up"
      );
      throw err;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      const { error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
    } catch (err) {
      console.log(err);
      setError(
        err instanceof Error ? err.message : "An error occurred during sign in"
      );
      throw err;
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      const { error } = await supabaseClient.auth.signOut();
      if (error) throw error;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An error occurred during sign out"
      );
      throw err;
    }
  };

  const value = {
    user,
    setUser,
    session,
    setSession,
    loading,
    signUp,
    signIn,
    signOut,
    error,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
