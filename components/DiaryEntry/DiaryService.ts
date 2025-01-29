import { supabase } from '@/lib/supabase';
import type { DiaryEntry } from './types';

export class DiaryService {
  static async fetchEntries(userName: string): Promise<DiaryEntry[]> {
    try {
      const { data: entriesData, error: entriesError } = await supabase
        .from('diary_entries')
        .select('*')
        .eq('user_name', userName)
        .order('date', { ascending: false });

      if (entriesError) throw entriesError;

      return entriesData || [];
    } catch (error) {
      throw new Error('Failed to fetch diary entries');
    }
  }

  static async saveEntry(
    userName: string,
    entryData: Partial<DiaryEntry>,
    date: string
  ): Promise<void> {
    try {
      // Check for existing entry
      const { data: existingEntry } = await supabase
        .from('diary_entries')
        .select('id')
        .eq('user_name', userName)
        .eq('date', date)
        .single();

      if (existingEntry) {
        // Update existing entry
        const { error: updateError } = await supabase
          .from('diary_entries')
          .update(entryData)
          .eq('id', existingEntry.id);
        
        if (updateError) throw updateError;
      } else {
        // Create new entry
        const { error: insertError } = await supabase
          .from('diary_entries')
          .insert([{ ...entryData, user_name: userName, date }]);

        if (insertError) throw insertError;
      }
    } catch (error) {
      throw new Error('Failed to save diary entry');
    }
  }
}
