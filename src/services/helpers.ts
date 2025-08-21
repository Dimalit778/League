import { supabase } from "@/lib/supabase";

// Helper function to generate join code
export function generateJoinCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
  
  // Helper function to ensure unique join code
  export async function generateUniqueJoinCode(): Promise<string> {
    let joinCode: string;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;
  
    do {
      joinCode = generateJoinCode();
      const { data: existingLeague } = await supabase
        .from('leagues')
        .select('id')
        .eq('join_code', joinCode)
        .single();
      
      isUnique = !existingLeague;
      attempts++;
    } while (!isUnique && attempts < maxAttempts);
  
    if (!isUnique) {
      throw new Error('Failed to generate unique join code after multiple attempts');
    }
  
    return joinCode;
  }
  