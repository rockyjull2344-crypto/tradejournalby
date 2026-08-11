import { useState } from 'react';
import { useStore } from '@/store';
import { format, addDays, subDays } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Check, Trash2 } from 'lucide-react';
import TaskModal from '@/components/TaskModal';

const PRE_MARKET_CHECKLIST = [
  "Check economic calendar",
  "Review pre-market movers",
  "Set daily risk limit",
  "Identify key support/resistance levels",
  "Review open positions",
  "Check overnight news"
];

export default function DailyPlanner() {
  const { state, addTask, toggleTask, deleteTask, addGoal, toggleGoal } = useStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [newGoalText, setNewGoalText] = useState('');
  const [preMarketLocal, setPreMarketLocal] = useState<Record<number, boolean>>({});

  const dateStr = format(currentDate, 'yyyy-MM-dd');
  const tasks = state.tasks[dateStr] || [];
  const goals = state.goals[dateStr] || [];

  const timeSlots = Array.from({ length: 15 }, (_, i) => {
    const hour = i + 6;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalText.trim()) return;
    addGoal(dateStr, newGoalText.trim());
    setNewGoalText('');
  };

  return (
    <div className="flex flex-col h-full gap-6">
      {/* Date Nav */}
      <div className="flex items-center justify-between bg-card border border-border p-4 rounded-xl">
        <div className="flex items-center gap-4">
          <button onClick={() => setCurrentDate(subDays(currentDate, 1))} className="p-2 hover:bg-white/5 rounded-full"><ChevronLeft className="w-5 h-5" /></button>
          <h2 className="text-xl font-bold font-mono min-w-[140px] text-center">{format(currentDate, 'MMM d, yyyy')}</h2>
          <button onClick={() => setCurrentDate(addDays(currentDate, 1))} className="p-2 hover:bg-white/5 rounded-full"><ChevronRight className="w-5 h-5" /></button>
        </div>
        <button 
          onClick={() => setCurrentDate(new Date())}
          className="text-sm font-medium px-4 py-2 bg-muted hover:bg-muted/80 rounded-md transition-colors"
        >
          Today
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Left: Schedule */}
        <div className="col-span-2 bg-card border border-border rounded-xl flex flex-col overflow-hidden">
          <div className="p-4 border-b border-border flex justify-between items-center bg-background">
            <h3 className="font-bold">Daily Schedule</h3>
            <button 
              onClick={() => setIsTaskModalOpen(true)}
              className="flex items-center gap-2 text-sm text-primary hover:text-primary/80"
            >
              <Plus className="w-4 h-4" /> Add Task
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-1">
            {timeSlots.map(time => {
              const slotTasks = tasks.filter(t => t.time.startsWith(time.split(':')[0]));
              return (
                <div key={time} className="flex gap-4 group min-h-[60px]">
                  <div className="w-16 shrink-0 text-right text-xs font-mono text-muted-foreground pt-3">
                    {time}
                  </div>
                  <div className="flex-1 border-t border-border/50 pt-2 pb-4 space-y-2">
                    {slotTasks.map(task => (
                      <div 
                        key={task.id} 
                        className={`flex items-center gap-3 p-3 rounded-lg border bg-background/50 hover:bg-background transition-colors ${
                          task.category === 'trading' ? 'border-l-4 border-l-primary border-t-border border-r-border border-b-border' :
                          task.category === 'review' ? 'border-l-4 border-l-gold border-t-border border-r-border border-b-border' :
                          'border-l-4 border-l-win border-t-border border-r-border border-b-border'
                        } ${task.done ? 'opacity-50 grayscale' : ''}`}
                      >
                        <button 
                          onClick={() => toggleTask(dateStr, task.id)}
                          className={`w-5 h-5 rounded shrink-0 flex items-center justify-center border ${task.done ? 'bg-primary border-primary text-primary-foreground' : 'border-border'}`}
                        >
                          {task.done && <Check className="w-3 h-3" />}
                        </button>
                        <span className={`flex-1 text-sm font-medium ${task.done ? 'line-through text-muted-foreground' : ''}`}>
                          {task.description}
                        </span>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-1 rounded">
                          {task.category}
                        </span>
                        <button 
                          onClick={() => deleteTask(dateStr, task.id)}
                          className="opacity-0 group-hover:opacity-100 text-destructive hover:bg-destructive/10 p-1.5 rounded transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right col */}
        <div className="flex flex-col gap-6">
          {/* Goals */}
          <div className="bg-card border border-border rounded-xl flex flex-col h-1/2">
            <div className="p-4 border-b border-border bg-background">
              <h3 className="font-bold">Today's Goals</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {goals.map((g, i) => (
                <div key={i} className="flex items-start gap-3 group">
                  <button 
                    onClick={() => toggleGoal(dateStr, i)}
                    className={`mt-0.5 w-4 h-4 rounded shrink-0 flex items-center justify-center border ${g.done ? 'bg-primary border-primary text-primary-foreground' : 'border-border'}`}
                  >
                    {g.done && <Check className="w-3 h-3" />}
                  </button>
                  <span className={`text-sm flex-1 ${g.done ? 'line-through text-muted-foreground' : ''}`}>{g.text}</span>
                </div>
              ))}
              {goals.length === 0 && <div className="text-sm text-muted-foreground pb-2">No goals set for today.</div>}
            </div>
            <div className="p-3 border-t border-border">
              <form onSubmit={handleAddGoal} className="flex gap-2">
                <input 
                  type="text" 
                  value={newGoalText}
                  onChange={e => setNewGoalText(e.target.value)}
                  placeholder="Add a goal..."
                  className="flex-1 bg-input border border-border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-primary"
                />
                <button type="submit" className="bg-primary text-primary-foreground p-1.5 rounded-md">
                  <Plus className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>

          {/* Pre-Market Checklist */}
          <div className="bg-card border border-border rounded-xl flex flex-col h-1/2">
            <div className="p-4 border-b border-border bg-background">
              <h3 className="font-bold">Pre-Market Checklist</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {PRE_MARKET_CHECKLIST.map((item, i) => {
                const isChecked = preMarketLocal[i] || false;
                return (
                  <div key={i} className="flex items-start gap-3 group cursor-pointer" onClick={() => setPreMarketLocal(prev => ({...prev, [i]: !prev[i]}))}>
                    <div className={`mt-0.5 w-4 h-4 rounded shrink-0 flex items-center justify-center border transition-colors ${isChecked ? 'bg-win border-win text-white' : 'border-border'}`}>
                      {isChecked && <Check className="w-3 h-3" />}
                    </div>
                    <span className={`text-sm select-none ${isChecked ? 'text-muted-foreground line-through' : ''}`}>{item}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {isTaskModalOpen && <TaskModal onClose={() => setIsTaskModalOpen(false)} date={dateStr} />}
    </div>
  );
}
