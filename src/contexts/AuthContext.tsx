import { createContext, useContext, useEffect, useState, useMemo, useCallback, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Listener primeiro (síncrono), depois getSession
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!mounted) return;
      // Evita re-render desnecessário se o token de acesso não mudou
      setSession((prev) => (prev?.access_token === newSession?.access_token ? prev : newSession));
      setUser((prev) => (prev?.id === newSession?.user?.id ? prev : newSession?.user ?? null));
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (!mounted) return;
      setSession((prev) => (prev?.access_token === initialSession?.access_token ? prev : initialSession));
      setUser((prev) => (prev?.id === initialSession?.user?.id ? prev : initialSession?.user ?? null));
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const value = useMemo(
    () => ({ user, session, loading, signOut }),
    [user, session, loading, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
