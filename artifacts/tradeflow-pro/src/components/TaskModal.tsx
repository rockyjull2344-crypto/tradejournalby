import { useState } from 'react';
import { X } from 'lucide-react';
import { useStore } from '@/store';
import { toast } from 'sonner';

export default function TaskModal({ 
  onClose, 
  date 
}: { 
  onClose: () => void, 
  date: string 
}) {
  const { addTask } = useStore();
  const [formData, setFormData] = useState({
    time: '09:00',
    category: 'trading' as 'trading' | 'review' | 'personal',
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description) return;
    
    addTask(date, formData);
    toast.success('Task added!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-md rounded-xl border border-border shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold">Add Task</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Time</label>
              <input 
                type="time"
                value={formData.time}
                onChange={e => setFormData({ ...formData, time: e.target.value })}
                className="w-full bg-input border border-border rounded-md px-3 py-2 font-mono focus:outline-none focus:border-primary [color-scheme:dark]"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Category</label>
              <select 
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full bg-input border border-border rounded-md px-3 py-2 focus:outline-none focus:border-primary"
              >
                <option value="trading">Trading</option>
                <option value="review">Review</option>
                <option value="personal">Personal</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Task Description</label>
            <input 
              type="text"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g. Pre-market review"
              className="w-full bg-input border border-border rounded-md px-3 py-2 focus:outline-none focus:border-primary"
              required
              autoFocus
            />
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
              Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
