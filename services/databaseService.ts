import { supabase } from './supabaseClient';

/**
 * Fetches a user's profile from the public.profiles table.
 * Uses .maybeSingle() to prevent 406 errors if the row doesn't exist yet.
 */
export const getUserProfile = async (userId: string) => {
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
      .maybeSingle(); // CRITICAL: This prevents the 406 error crash

    if (error) {
      console.error('❌ Supabase Error:', error.message);
      return { data: null, error };
    }

    // If data is null, the auth user exists but the profile row is missing
    if (!data) {
      console.warn('⚠️ Profile not found in database for ID:', userId);
    }

    return { data, error: null };
  } catch (err) {
    console.error('💥 Unexpected Database Error:', err);
    return { data: null, error: err };
  }
};

/**
 * Updates a user's profile information.
 */
export const updateProfile = async (userId: string, updates: any) => {
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
};

/**
 * Specifically updates premium status after a successful payment.
 */
export const markUserAsPremium = async (userId: string, paymentRef: string) => {
  return await updateProfile(userId, {
    is_premium: true,
    last_payment_ref: paymentRef
  });
};