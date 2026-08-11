import { useState } from 'react';
import { X } from 'lucide-react';
import { useStore } from '@/store';
import { toast } from 'sonner';

export default function HabitModal({ onClose }: { onClose: () => void }) {
  const { addHabit } = useStore();
  const [formData, setFormData] = useState({
    name: '',
    category: 'Trading',
    frequency: 'Daily'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    
    addHabit(formData);
    toast.success('Habit added!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-md rounded-xl border border-border shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold">Add New Habit</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Habit Name</label>
            <input 
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-input border border-border rounded-md px-3 py-2 focus:outline-none focus:border-primary"
              required
              autoFocus
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Category</label>
            <select 
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-input border border-border rounded-md px-3 py-2 focus:outline-none focus:border-primary"
            >
              <option value="Trading">Trading</option>
              <option value="Mindset">Mindset</option>
              <option value="Health">Health</option>
              <option value="Learning">Learning</option>
              <option value="Routine">Routine</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Frequency</label>
            <select 
              value={formData.frequency}
              onChange={e => setFormData({ ...formData, frequency: e.target.value })}
              className="w-full bg-input border border-border rounded-md px-3 py-2 focus:outline-none focus:border-primary"
            >
              <option value="Daily">Daily</option>
              <option value="Weekdays">Weekdays</option>
              <option value="Weekends">Weekends</option>
            </select>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-border mt-6">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 border border-border rounded-md font-medium hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-medium transition-colors"
            >
              Add Habit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
