import { useState, useEffect } from 'react';
import { WellnessCard } from '@/components/ui/wellness-card';
import { useUserStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { Sun, Moon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function SleepTimeManager() {
  const [wakeUpTime, setWakeUpTime] = useState('07:00');
  const [sleepTime, setSleepTime] = useState('22:00');
  const { userName } = useUserStore();

  useEffect(() => {
    fetchTodaysSleepData();
  }, [userName]);

  const fetchTodaysSleepData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('user_preferences')
        .select('wake_up_time, sleep_time')
        .eq('user_name', userName)
        .eq('date', today)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching sleep data:', error);
        return;
      }

      if (data) {
        setWakeUpTime(data.wake_up_time || '07:00');
        setSleepTime(data.sleep_time || '22:00');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const saveSleepSchedule = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Check if entry exists for today
      const { data: existing } = await supabase
        .from('user_preferences')
        .select('id')
        .eq('user_name', userName)
        .eq('date', today)
        .single();

      let result;
      
      if (existing) {
        // Update existing record
        result = await supabase
          .from('user_preferences')
          .update({
            wake_up_time: wakeUpTime,
            sleep_time: sleepTime,
            updated_at: new Date().toISOString()
          })
          .eq('user_name', userName)
          .eq('date', today);
      } else {
        // Insert new record
        result = await supabase
          .from('user_preferences')
          .insert({
            user_name: userName,
            wake_up_time: wakeUpTime,
            sleep_time: sleepTime,
            date: today
          });
      }

      if (result.error) throw result.error;
      
      toast.success('Sleep schedule updated successfully');
    } catch (error) {
      console.error('Error saving sleep schedule:', error);
      toast.error('Failed to save sleep schedule');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sleep Schedule</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <WellnessCard
            icon={<Sun className="h-5 w-5 text-yellow-500" />}
            title="Wake-up Time"
            description="Set your daily wake-up time"
            timeInput={{
              value: wakeUpTime,
              onChange: setWakeUpTime,
              onSave: () => {} // Empty function since we're using a single save button
            }}
          />
          <WellnessCard
            icon={<Moon className="h-5 w-5 text-blue-500" />}
            title="Sleep Time"
            description="Set your daily sleep time"
            timeInput={{
              value: sleepTime,
              onChange: setSleepTime,
              onSave: () => {} // Empty function since we're using a single save button
            }}
          />
        </div>
        <div className="flex justify-end">
          <Button onClick={saveSleepSchedule}>
            Save Sleep Schedule
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}