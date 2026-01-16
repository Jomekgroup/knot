import { User, Match, Message } from '../types';
import { supabase } from './supabaseClient';

class DatabaseService {
    /**
     * GET USER PROFILE
     * Fetches a specific user's data from the 'profiles' table.
     */
    async getUser(): Promise<User | null> {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return null;

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
           .maybeSingle()

        if (error) {
            console.error("Error fetching user profile:", error.message);
            return null;
        }
        return data as User;
    }

    /**
     * SAVE USER PROFILE
     * Updates the user's information in Supabase.
     */
    async saveUser(user: User): Promise<void> {
        const { error } = await supabase
            .from('profiles')
            .update(user)
            .eq('id', user.id);

        if (error) throw new Error(`Failed to save profile: ${error.message}`);
    }

    /**
     * GET MATCHES (DISCOVER)
     * Fetches all potential matches from the profiles table.
     */
    async getMatches(): Promise<Match[]> {
        const { data: { session } } = await supabase.auth.getSession();
        
        // Fetch all profiles except the current logged-in user
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .neq('id', session?.user?.id || '');

        if (error) {
            console.error("Error fetching matches:", error.message);
            return [];
        }
        return data as Match[];
    }

    /**
     * ADD GLOBAL MATCHES
     * Note: In a cloud setup, we don't "save" matches locally. 
     * This now acts as a refresh for your discovery feed.
     */
    async addGlobalMatches(newMatches: Match[]): Promise<void> {
        // In cloud architecture, the discovery feed is dynamic.
        // We simply return to keep your existing App.tsx logic from breaking.
        return;
    }

    /**
     * LIKES SYSTEM
     * Fetches profiles you have already liked.
     */
    async getLikedMatches(): Promise<Match[]> {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return [];

        const { data, error } = await supabase
            .from('likes')
            .select('profiles(*)') // Joins with the profiles table
            .eq('user_id', session.user.id);

        if (error) return [];
        return data.map(item => item.profiles) as unknown as Match[];
    }

    async addLike(match: Match): Promise<void> {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { error } = await supabase
            .from('likes')
            .insert([{ user_id: session.user.id, target_id: match.id }]);

        if (error) console.error("Error adding like:", error.message);
    }

    /**
     * MESSAGING SYSTEM
     * Fetches real-time messages from the 'messages' table.
     */
    async getMessages(matchId: string): Promise<Message[]> {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .or(`and(sender_id.eq.me,receiver_id.eq.${matchId}),and(sender_id.eq.${matchId},receiver_id.eq.me)`)
            .order('created_at', { ascending: true });

        if (error) return [];
        return data as Message[];
    }

    async sendMessage(matchId: string, message: Message): Promise<void> {
        const { error } = await supabase
            .from('messages')
            .insert([{
                receiver_id: matchId,
                content: message.text,
                sender_id: message.senderId
            }]);

        if (error) console.error("Error sending message:", error.message);
    }
}

export const db = new DatabaseService();