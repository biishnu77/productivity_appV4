import { supabase } from '@/lib/supabase';
import type { DiaryEntry, DailyHabit } from './types';
import { DEFAULT_HABITS } from './types';

export class DiaryService {
  static async fetchEntries(userName: string): Promise<DiaryEntry[]> {
    try {
      const { data: entriesData, error: entriesError } = await supabase
        .from('diary_entries')
        .select('*')
        .eq('user_name', userName)
        .order('date', { ascending: false });

      if (entriesError) throw entriesError;

      if (!entriesData) return [];

      const entriesWithHabits = await Promise.all(
        entriesData.map(async (entry) => {
          const { data: habitsData } = await supabase
            .from('daily_habits')
            .select('*')
            .eq('diary_entry_id', entry.id);

          return {
            ...entry,
            habits: habitsData || DEFAULT_HABITS
          };
        })
      );

      return entriesWithHabits;
    } catch (error) {
      throw new Error('Failed to fetch diary entries');
    }
  }

  static async saveEntry(
    userName: string,
    entryData: Partial<DiaryEntry>,
    habits: DailyHabit[],
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

      let entryId: number;

      if (existingEntry) {
        // Update existing entry
        const { error: updateError } = await supabase
          .from('diary_entries')
          .update(entryData)
          .eq('id', existingEntry.id);
        
        if (updateError) throw updateError;
        entryId = existingEntry.id;

        // Update existing habits
        const { error: deleteError } = await supabase
          .from('daily_habits')
          .delete()
          .eq('diary_entry_id', entryId);

        if (deleteError) throw deleteError;
      } else {
        // Create new entry
        const { data: newEntry, error: insertError } = await supabase
          .from('diary_entries')
          .insert([entryData])
          .select()
          .single();
        
        if (insertError || !newEntry) throw insertError || new Error('Failed to create entry');
        entryId = newEntry.id;
      }

      // Insert habits
      const { error: habitsError } = await supabase
        .from('daily_habits')
        .insert(habits.map(habit => ({
          diary_entry_id: entryId,
          habit_name: habit.habit_name,
          completed: habit.completed
        })));

      if (habitsError) throw habitsError;
    } catch (error) {
      throw new Error('Failed to save diary entry');
    }
  }
}