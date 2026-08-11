import { useState } from 'react';
import { useStore } from '@/store';
import { toast } from 'sonner';
import { Save, Download, Trash2, AlertTriangle } from 'lucide-react';

export default function Settings() {
  const { state, updateSettings, exportData, clearData } = useStore();
  
  const [formData, setFormData] = useState({
    accountName: state.settings.accountName,
    startingCapital: state.settings.startingCapital.toString(),
    currency: state.settings.currency,
    riskPercentage: state.settings.riskPercentage.toString(),
    winRateTarget: state.settings.winRateTarget.toString()
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      accountName: formData.accountName,
      startingCapital: parseFloat(formData.startingCapital) || 0,
      currency: formData.currency,
      riskPercentage: parseFloat(formData.riskPercentage) || 1,
      winRateTarget: parseFloat(formData.winRateTarget) || 50
    });
    toast.success('Settings saved!');
  };

  const handleClear = () => {
    if (confirm('WARNING: This will permanently delete all trades, habits, and settings. Are you absolutely sure?')) {
      if (confirm('FINAL WARNING: Type OK to clear data. Just kidding, click OK.')) {
        clearData();
        toast.success('All data wiped clean.');
      }
    }
  };

  const handleExport = () => {
    exportData();
    toast.success('Data exported!');
  };

  return (
    <div className="max-w-3xl space-y-6">
      
      {/* Account & Preferences */}
      <form onSubmit={handleSave} className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-6 border-b border-border bg-background">
          <h3 className="font-bold text-lg">Account & Preferences</h3>
          <p className="text-sm text-muted-foreground mt-1">Configure your base account parameters.</p>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Account Name</label>
              <input 
                type="text" 
                value={formData.accountName}
                onChange={e => setFormData({ ...formData, accountName: e.target.value })}
                className="w-full bg-input border border-border rounded-md px-3 py-2 focus:outline-none focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Currency</label>
              <select 
                value={formData.currency}
                onChange={e => setFormData({ ...formData, currency: e.target.value })}
                className="w-full bg-input border border-border rounded-md px-3 py-2 focus:outline-none focus:border-primary"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="INR">INR (₹)</option>
                <option value="JPY">JPY (¥)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Starting Capital</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 font-mono text-muted-foreground">$</span>
                <input 
                  type="number" step="any"
                  value={formData.startingCapital}
                  onChange={e => setFormData({ ...formData, startingCapital: e.target.value })}
                  className="w-full bg-input border border-border rounded-md pl-7 pr-3 py-2 font-mono focus:outline-none focus:border-primary"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Risk Per Trade (%)</label>
              <div className="relative">
                <input 
                  type="number" step="any"
                  value={formData.riskPercentage}
                  onChange={e => setFormData({ ...formData, riskPercentage: e.target.value })}
                  className="w-full bg-input border border-border rounded-md px-3 py-2 font-mono focus:outline-none focus:border-primary"
                />
                <span className="absolute right-3 top-2.5 font-mono text-muted-foreground">%</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Win Rate Target (%)</label>
              <div className="relative">
                <input 
                  type="number" step="any"
                  value={formData.winRateTarget}
                  onChange={e => setFormData({ ...formData, winRateTarget: e.target.value })}
                  className="w-full bg-input border border-border rounded-md px-3 py-2 font-mono focus:outline-none focus:border-primary"
                />
                <span className="absolute right-3 top-2.5 font-mono text-muted-foreground">%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-border bg-background flex justify-end">
          <button 
            type="submit"
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Save Settings
          </button>
        </div>
      </form>

      {/* Data Management */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-6 border-b border-border bg-background">
          <h3 className="font-bold text-lg">Data Management</h3>
          <p className="text-sm text-muted-foreground mt-1">Export your journal or clear all local data.</p>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-background">
            <div>
              <div className="font-medium">Export All Trades</div>
              <div className="text-sm text-muted-foreground mt-1">Download a JSON file containing your complete trading history and settings.</div>
            </div>
            <button 
              onClick={handleExport}
              className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md font-medium hover:bg-secondary/90 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Export JSON
            </button>
          </div>

          <div className="flex items-center justify-between p-4 border border-destructive/30 bg-destructive/5 rounded-lg">
            <div>
              <div className="font-medium text-destructive flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Danger Zone
              </div>
              <div className="text-sm text-destructive/80 mt-1">Permanently delete all data from this browser. This cannot be undone.</div>
            </div>
            <button 
              onClick={handleClear}
              className="bg-destructive text-destructive-foreground px-4 py-2 rounded-md font-medium hover:bg-destructive/90 transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> Clear All Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
