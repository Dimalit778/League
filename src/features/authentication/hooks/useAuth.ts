import { useAppStore } from "@/store/useAppStore";
import { authService } from "../services/authService";

export const useAuth = () => {
  const { 
    user, 
    session, 
    loading, 
    error, 
    setUser, 
    setSession, 
    logout: appLogout
  } = useAppStore();

  const login = async (email: string, password: string) => {
    if (!email) return { success: false, error: "Email is required" };
    if (!password) return { success: false, error: "Password is required" };
    
    try {
      const { data, error: loginError } = await authService.login(email, password);
      if (loginError) {
        return { success: false, error: loginError };
      }
      
      setSession(data.session);
      
      if (data.session) {
        const { data: userData, error: userError } = await authService.getUser(data.session.user.id);
        
        if (userError || !userData) {
          return { success: false, error: userError?.message || "User not found" };
        }
        
        setUser(userData);
      }
      
      return { success: true, data: data.user };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      return { success: false, error: errorMessage };
    }
  };

  const register = async (email: string, password: string, fullname: string) => {
    if (!email) return { success: false, error: "Email is required" };
    if (!password) return { success: false, error: "Password is required" };
    if (!fullname) return { success: false, error: "Full name is required" };

    try {
      const { data, error: registerError } = await authService.register(email, password, fullname);
      
      if (registerError) {
        return { success: false, error: registerError };
      }
      
      if (data.session) {
        setSession(data.session);
      }
      
      return { success: true, data: data.user };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      return { success: false, error: errorMessage };
    }
  };

  return {
    session,
    user,
    loading,
    error,
    login,
    register,
    logout: appLogout,
  };
};