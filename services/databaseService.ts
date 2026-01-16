import { supabase } from './supabaseClient';

/**
 * Service to handle all Supabase database interactions.
 * Professional interface logic is preserved while enhancing stability.
 */
export const db = {
  /**
   * Fetches a user's profile from the public.profiles table.
   * Prevents 406 errors and handles empty results gracefully.
   */
  getUserProfile: async (userId: string) => {
    try {
      if (!userId) return { data: null, error: 'No User ID provided' };

      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id, 
          full_name, 
          email, 
          is_premium, 
          last_payment_ref,
          created_at
        `)
        .eq('id', userId)
        .maybeSingle(); // FIX: Safely returns null instead of crashing if profile doesn't exist

      if (error) {
        console.error('❌ Supabase Error:', error.message);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (err) {
      console.error('💥 Unexpected Database Error:', err);
      return { data: null, error: err };
    }
  },

  /**
   * Updates a user's profile information.
   */
  updateProfile: async (userId: string, updates: any) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .maybeSingle();

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('❌ Error updating profile:', error.message);
      return { data: null, error };
    }
  },

  /**
   * Fetches chat history for a specific match.
   */
  getMessages: async (matchId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('match_id', matchId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Error fetching messages:', error);
      return [];
    }
  },

  /**
   * Saves a message to the database.
   */
  sendMessage: async (matchId: string, message: any) => {
    try {
      const { error } = await supabase
        .from('messages')
        .insert([{
          match_id: matchId,
          sender_id: message.senderId,
          content: message.text,
          created_at: message.timestamp.toISOString()
        }]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('❌ Error sending message:', error);
      return false;
    }
  },

  /**
   * Specifically updates premium status after a successful payment.
   */
  markUserAsPremium: async (userId: string, paymentRef: string) => {
    return await db.updateProfile(userId, {
      is_premium: true,
      last_payment_ref: paymentRef
    });
  }
};