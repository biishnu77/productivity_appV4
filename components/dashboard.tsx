import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TaskManager from "@/components/task-manager";
import PomodoroTimer from "@/components/pomodoro-timer";
import DailyNotes from "@/components/daily-notes";
import DailyStats from "@/components/daily-stats";
import Leaderboard from "@/components/leaderboard";
import Community from "@/components/community";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/lib/store";
import { LogOut, ListTodo, Timer, ScrollText, BarChart2, Trophy, Users } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function Dashboard() {
  const { userName, clearUserName, activeTab, setActiveTab } = useUserStore();

  // Add this useEffect for login tracking
  useEffect(() => {
    const trackLogin = async () => {
      if (!userName) return;
      
      const today = new Date().toISOString().split('T')[0];
      const { error } = await supabase
      .from('logins')
      .upsert(
        { user_name: userName, login_date: today },
        { onConflict: 'user_name,login_date' } // Use a comma-separated string
      );
    

      if (error) console.error('Login tracking failed:', error);
    };

    trackLogin();
  }, [userName]); // This will run whenever userName changes

  const tabs = [
    { value: "tasks", icon: ListTodo, label: "Tasks" },
    { value: "pomodoro", icon: Timer, label: "Pomodoro" },
    { value: "notes", icon: ScrollText, label: "Notes" },
    { value: "stats", icon: BarChart2, label: "Stats" },
    { value: "leaderboard", icon: Trophy, label: "Leaders" },
    { value: "community", icon: Users, label: "Community" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              HabitUp
            </h1>
            <span className="text-muted-foreground">Welcome back, {userName}!</span>
          </motion.div>
          
          <div className="flex items-center gap-4">
            <ModeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={clearUserName}
              className="rounded-full hover:bg-accent transition-colors"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="w-full overflow-x-auto flex justify-between lg:justify-center">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className={cn(
                  "flex-1 lg:flex-initial px-4 py-2 rounded-full",
                  "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
                  "transition-all hover:scale-[1.02]"
                )}
              >
                <div className="flex items-center gap-2">
                  <tab.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </div>
              </TabsTrigger>
            ))}
          </TabsList>

          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <TabsContent value="tasks" className="space-y-4">
              <TaskManager />
            </TabsContent>

            <TabsContent value="pomodoro" className="space-y-4">
              <PomodoroTimer />
            </TabsContent>

            <TabsContent value="notes" className="space-y-4">
              <DailyNotes />
            </TabsContent>

            <TabsContent value="stats" className="space-y-4">
              <DailyStats />
            </TabsContent>

            <TabsContent value="leaderboard" className="space-y-4">
              <Leaderboard />
            </TabsContent>

            <TabsContent value="community" className="space-y-4">
              <Community />
            </TabsContent>
          </motion.div>
        </Tabs>
      </main>
    </div>
  );
}
