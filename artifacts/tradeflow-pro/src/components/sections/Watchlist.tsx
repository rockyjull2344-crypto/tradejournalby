import { useState } from 'react';
import { useStore } from '@/store';
import { Plus, X, Activity } from 'lucide-react';

export default function Watchlist() {
  const { state, addSymbol, removeSymbol } = useStore();
  const [newSymbol, setNewSymbol] = useState('');
  const [marketType, setMarketType] = useState('Stocks');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSymbol.trim()) return;
    addSymbol(newSymbol.trim());
    setNewSymbol('');
  };

  const getSymbolStats = (sym: string) => {
    const trades = state.trades.filter(t => t.symbol === sym && t.result !== 'open');
    if (!trades.length) return { trades: 0, wr: 0, pl: 0, best: 0, rr: 0 };
    
    const wins = trades.filter(t => t.result === 'win');
    const pl = trades.reduce((sum, t) => sum + t.plDollar, 0);
    const best = wins.length ? Math.max(...wins.map(t => t.plDollar)) : 0;
    const totalRR = trades.reduce((sum, t) => sum + (parseFloat(t.rrRatio.split(':')[0]) || 0), 0);
    
    return {
      trades: trades.length,
      wr: (wins.length / trades.length) * 100,
      pl,
      best,
      rr: totalRR / trades.length
    };
  };

  return (
    <div className="space-y-6">
      {/* Top Add Form */}
      <div className="bg-card border border-border p-6 rounded-xl flex items-end gap-4">
        <div className="space-y-2 flex-1">
          <label className="text-sm font-medium text-muted-foreground">Add Symbol to Watchlist</label>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={newSymbol}
              onChange={e => setNewSymbol(e.target.value.toUpperCase())}
              placeholder="e.g. NVDA"
              className="flex-1 bg-input border border-border rounded-md px-3 py-2 font-mono uppercase focus:outline-none focus:border-primary"
            />
            <select 
              value={marketType}
              onChange={e => setMarketType(e.target.value)}
              className="w-[180px] bg-input border border-border rounded-md px-3 py-2 focus:outline-none focus:border-primary"
            >
              <option value="Stocks">Stocks</option>
              <option value="Forex">Forex</option>
              <option value="Crypto">Crypto</option>
              <option value="Futures">Futures</option>
              <option value="Options">Options</option>
              <option value="Commodities">Commodities</option>
            </select>
            <button 
              onClick={handleAdd}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
        </div>
      </div>

      {/* Grid of chips */}
      <div className="bg-card border border-border p-6 rounded-xl">
        <h3 className="font-bold mb-4">Active Watchlist</h3>
        <div className="flex flex-wrap gap-3">
          {state.symbols.map(sym => (
            <div key={sym} className="flex items-center gap-2 bg-background border border-border rounded-full pl-4 pr-1 py-1 hover:border-primary/50 transition-colors group">
              <span className="font-mono font-bold">{sym}</span>
              <button 
                onClick={() => {
                  if(confirm(`Remove ${sym} from watchlist?`)) removeSymbol(sym);
                }}
                className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          {state.symbols.length === 0 && (
            <div className="text-muted-foreground text-sm">Watchlist is empty.</div>
          )}
        </div>
      </div>

      {/* Stats Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-6 border-b border-border flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-lg">Symbol Statistics</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-muted/30 text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-mono font-normal">Symbol</th>
                <th className="px-6 py-4 font-mono font-normal">Total Trades</th>
                <th className="px-6 py-4 font-mono font-normal">Win Rate</th>
                <th className="px-6 py-4 font-mono font-normal">Total Profit & Loss</th>
                <th className="px-6 py-4 font-mono font-normal">Best Trade</th>
                <th className="px-6 py-4 font-mono font-normal">Average Risk:Reward</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {state.symbols.map(sym => {
                const stats = getSymbolStats(sym);
                return (
                  <tr key={sym} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-bold font-mono text-secondary">{sym}</td>
                    <td className="px-6 py-4 font-mono">{stats.trades}</td>
                    <td className="px-6 py-4 font-mono">
                      {stats.trades > 0 ? (
                        <span className={stats.wr >= state.settings.winRateTarget ? 'text-win' : ''}>
                          {stats.wr.toFixed(1)}%
                        </span>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 font-mono font-bold">
                      {stats.trades > 0 ? (
                        <span className={stats.pl > 0 ? 'text-win' : stats.pl < 0 ? 'text-loss' : ''}>
                          {stats.pl > 0 ? '+' : ''}${Math.abs(stats.pl).toFixed(2)}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 font-mono">
                      {stats.best > 0 ? <span className="text-win">+${stats.best.toFixed(2)}</span> : '-'}
                    </td>
                    <td className="px-6 py-4 font-mono text-gold">
                      {stats.trades > 0 ? `${stats.rr.toFixed(2)}:1` : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
