import { Session } from "@supabase/supabase-js";
import { createContext, useContext, useState } from "react";

type AuthContextType = {
  session: Session | null;
  isLoading: boolean;
};

export const AuthContext = createContext<AuthContextType>({
  session: null,
  isLoading: true,
});

export const AuthContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  //   useEffect(() => {
  //     // Get initial session
  //     supabase.auth.getSession().then(({ data: { session } }) => {
  //       setSession(session);
  //       setIsLoading(false);
  //     });

  //     // Listen for auth changes
  //     const {
  //       data: { subscription },
  //     } = supabase.auth.onAuthStateChange((_event, session) => {
  //       setSession(session);
  //       setIsLoading(false);
  //     });

  //     // Cleanup subscription
  //     return () => subscription.unsubscribe();
  //   }, []);

  return (
    <AuthContext.Provider value={{ session, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
export const UserAuth = () => {
  return useContext(AuthContext);
};
