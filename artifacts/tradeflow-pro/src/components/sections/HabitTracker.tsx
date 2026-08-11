import { useState } from 'react';
import { useStore } from '@/store';
import { format, subDays, startOfDay, eachDayOfInterval } from 'date-fns';
import { Plus, Check, Flame } from 'lucide-react';
import HabitModal from '@/components/HabitModal';

export default function HabitTracker() {
  const { state, toggleHabit, deleteHabit } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Last 30 days
  const today = startOfDay(new Date());
  const days = eachDayOfInterval({
    start: subDays(today, 29),
    end: today
  });

  const getStreak = (completions: Record<string, boolean>) => {
    let streak = 0;
    for (let i = 0; i < days.length; i++) {
      // iterate backwards from today
      const d = format(days[days.length - 1 - i], 'yyyy-MM-dd');
      if (completions[d]) streak++;
      else break;
    }
    return streak;
  };

  const getCompletionRate = (completions: Record<string, boolean>) => {
    const doneCount = days.filter(d => completions[format(d, 'yyyy-MM-dd')]).length;
    return (doneCount / days.length) * 100;
  };

  // Global stats
  const activeHabits = state.habits.length;
  const bestStreak = Math.max(0, ...state.habits.map(h => getStreak(h.completions)));
  const totalCompletionRate = activeHabits > 0 
    ? state.habits.reduce((acc, h) => acc + getCompletionRate(h.completions), 0) / activeHabits 
    : 0;

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold">Habit Tracker</h2>
          <p className="text-sm text-muted-foreground mt-1">Discipline is the bridge between goals and accomplishment.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Habit
        </button>
      </div>

      {/* Grid */}
      <div className="bg-card border border-border rounded-xl p-6 overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Header Row */}
          <div className="flex items-center mb-4 pb-2 border-b border-border">
            <div className="w-[200px] shrink-0 font-medium text-sm text-muted-foreground">Habit</div>
            <div className="flex-1 flex gap-1 px-4">
              {days.map((d, i) => (
                <div key={i} className="w-6 flex flex-col items-center gap-1">
                  {i % 5 === 0 || i === days.length - 1 ? (
                    <span className="text-[10px] text-muted-foreground font-mono">{format(d, 'dd')}</span>
                  ) : <span className="h-[15px]"></span>}
                </div>
              ))}
            </div>
            <div className="w-[100px] shrink-0 text-center font-medium text-sm text-muted-foreground">Streak</div>
            <div className="w-[80px] shrink-0 text-center font-medium text-sm text-muted-foreground">% (30d)</div>
          </div>

          {/* Habit Rows */}
          <div className="space-y-3">
            {state.habits.map(habit => {
              const streak = getStreak(habit.completions);
              const rate = getCompletionRate(habit.completions);
              return (
                <div key={habit.id} className="flex items-center group">
                  <div className="w-[200px] shrink-0 pr-4">
                    <div className="font-medium text-sm truncate" title={habit.name}>{habit.name}</div>
                    <div className="text-xs text-muted-foreground flex justify-between items-center mt-1">
                      <span>{habit.category}</span>
                      <button onClick={() => {
                        if (confirm('Delete this habit?')) deleteHabit(habit.id);
                      }} className="opacity-0 group-hover:opacity-100 text-destructive hover:underline text-[10px]">
                        Delete
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex-1 flex gap-1 px-4">
                    {days.map(d => {
                      const dStr = format(d, 'yyyy-MM-dd');
                      const isDone = habit.completions[dStr];
                      const isToday = format(d, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                      return (
                        <button
                          key={dStr}
                          onClick={() => toggleHabit(habit.id, dStr)}
                          className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
                            isDone ? 'bg-primary text-primary-foreground' : 'bg-background border border-border hover:border-primary/50'
                          } ${isToday && !isDone ? 'border-primary/50 ring-1 ring-primary/30' : ''}`}
                          title={format(d, 'MMM d')}
                        >
                          {isDone && <Check className="w-4 h-4" />}
                        </button>
                      );
                    })}
                  </div>

                  <div className="w-[100px] shrink-0 flex items-center justify-center gap-1 font-mono text-lg font-bold">
                    {streak > 0 && <Flame className="w-4 h-4 text-orange-500" fill="currentColor" />}
                    <span className={streak > 0 ? 'text-orange-500' : 'text-muted-foreground'}>{streak}</span>
                  </div>
                  
                  <div className="w-[80px] shrink-0 text-center font-mono text-sm text-muted-foreground">
                    {rate.toFixed(0)}%
                  </div>
                </div>
              );
            })}
            
            {state.habits.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No habits added yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-card border border-border p-6 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-1">Best Streak Active</div>
            <div className="text-3xl font-bold font-mono">{bestStreak} <span className="text-lg text-orange-500">🔥</span></div>
          </div>
        </div>
        <div className="bg-card border border-border p-6 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-1">Average Completion Rate</div>
            <div className="text-3xl font-bold font-mono text-primary">{totalCompletionRate.toFixed(1)}%</div>
          </div>
        </div>
        <div className="bg-card border border-border p-6 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-1">Active Habits</div>
            <div className="text-3xl font-bold font-mono">{activeHabits}</div>
          </div>
        </div>
      </div>

      {isModalOpen && <HabitModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}
