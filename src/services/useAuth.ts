import { supabase } from "@/lib/supabase";
import { useMemberStore } from "@/store/MemberStore";
import { useState } from "react";

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function signOut() {
    setIsLoading(true);
    try {
      // First check if we have a session
      const { data: sessionData } = await supabase.auth.getSession();
      console.log('Session before sign out:', sessionData.session ? 'Found' : 'Not found');
      
      // Even if there's an error with session, we should still clear local state
      try {
        const { error } = await supabase.auth.signOut();
        console.log('Sign out result:', error ? `Error: ${error.message}` : 'Success');
        
        if (error && error.message !== 'Auth session missing!') {
          throw error;
        }
      } catch (signOutError) {
        console.warn('Error during sign out:', signOutError);
        // Continue with cleanup even if sign out fails
      }
      
      // Reset stores using their clearAll methods regardless of Supabase signOut result
      useMemberStore.getState().clearAll();
      
      // Force clear any session data from AsyncStorage directly as a fallback
      try {
        const keys = ['supabase.auth.token', 'supabase-auth-token'];
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        await AsyncStorage.multiRemove(keys);
        console.log('Manually cleared auth storage keys');
      } catch (storageError) {
        console.warn('Failed to manually clear auth storage:', storageError);
      }
      
      return { success: true };
    } catch (error: any) {
      setIsError(true);
      setErrorMessage(error.message || 'Failed to sign out');
      console.error('Sign out error:', error);
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