import { supabase } from "@/lib/supabase";
import { useLeagueStore } from "@/store/LeagueStore";
import { useMemberStore } from "@/store/MemberStore";
import { useState } from "react";

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function signOut() {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw new Error(error.message);
      }
 
      // Reset stores using their clearAll methods
      useMemberStore.getState().clearAll();
      useLeagueStore.getState().clearAll();
      
      return { success: true };
    } catch (error: any) {
      setIsError(true);
      return { success: false, error: error.message || 'Failed to sign out' };
    } finally {
      setIsLoading(false);
    }
  }
  async function signUp(email: string, password: string, fullname: string) {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({ email, password, options: { data: { fullname } } });
      if(error) throw new Error(error.message);
      return { success: true };
    } catch (error: any) {
      setIsError(true);
      return { success: false, error: error.message || 'Failed to sign up' };
    } finally {
      setIsLoading(false);
    }
  }
  async function signIn(email: string, password: string) {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });
      
      if (error) throw new Error(error.message);
      return { success: true };
    } catch (error: any) {
      setIsError(true);
      setErrorMessage(error.message || 'Failed to sign in');
      return { success: false, error: error.message || 'Failed to sign in' };
    } finally {
      setIsLoading(false);
    }
  }

  return { 
    signOut, 
    signUp, 
    signIn,
    isLoading, 
    isError,
    errorMessage,
    clearError: () => setErrorMessage(null)
  };
};