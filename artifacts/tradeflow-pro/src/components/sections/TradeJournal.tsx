import { useState } from 'react';
import { useStore, Trade } from '@/store';
import { Pencil, Trash2, ArrowUpRight, ArrowDownRight, Filter, BookOpen } from 'lucide-react';
import TradeModal from '@/components/TradeModal';
import { toast } from 'sonner';

export default function TradeJournal() {
  const { state, deleteTrade } = useStore();
  const [filterSymbol, setFilterSymbol] = useState('ALL');
  const [filterResult, setFilterResult] = useState('ALL');
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);

  const uniqueSymbols = ['ALL', ...Array.from(new Set(state.trades.map(t => t.symbol)))];

  const filteredTrades = state.trades.filter(t => {
    if (filterSymbol !== 'ALL' && t.symbol !== filterSymbol) return false;
    if (filterResult !== 'ALL') {
      if (filterResult === 'WINS' && t.result !== 'win') return false;
      if (filterResult === 'LOSSES' && t.result !== 'loss') return false;
      if (filterResult === 'OPEN' && t.result !== 'open') return false;
    }
    return true;
  });

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this trade?')) {
      deleteTrade(id);
      toast('Trade deleted');
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center justify-between bg-card p-4 rounded-xl border border-border">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="w-4 h-4" />
            <span>Filter by:</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {uniqueSymbols.slice(0, 6).map(sym => (
              <button
                key={sym}
                onClick={() => setFilterSymbol(sym)}
                className={`px-3 py-1 rounded-full text-xs font-mono font-medium transition-colors ${
                  filterSymbol === sym ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {sym}
              </button>
            ))}
            {uniqueSymbols.length > 6 && (
              <select 
                value={filterSymbol}
                onChange={e => setFilterSymbol(e.target.value)}
                className="bg-muted text-muted-foreground text-xs font-mono font-medium px-3 py-1 rounded-full outline-none"
              >
                {uniqueSymbols.slice(6).map(sym => (
                  <option key={sym} value={sym}>{sym}</option>
                ))}
              </select>
            )}
          </div>
        </div>
        
        <select 
          value={filterResult}
          onChange={e => setFilterResult(e.target.value)}
          className="bg-input border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary"
        >
          <option value="ALL">All Results</option>
          <option value="WINS">Wins Only</option>
          <option value="LOSSES">Losses Only</option>
          <option value="OPEN">Open Trades</option>
        </select>
      </div>

      {/* Trade Cards List */}
      <div className="space-y-4">
        {filteredTrades.map(trade => (
          <div key={trade.id} className="bg-card border border-border rounded-xl p-6 transition-all hover:border-primary/50 group">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold font-mono text-secondary">{trade.symbol}</span>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold border ${trade.direction === 'BUY' ? 'bg-win/10 text-win border-win/20' : 'bg-loss/10 text-loss border-loss/20'}`}>
                  {trade.direction === 'BUY' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {trade.direction}
                </span>
                {trade.strategy && (
                  <span className="px-2 py-1 rounded text-xs bg-muted text-muted-foreground border border-border">
                    {trade.strategy}
                  </span>
                )}
                {trade.result === 'open' ? (
                  <span className="px-2 py-1 rounded text-xs font-bold bg-muted text-muted-foreground border border-border">OPEN</span>
                ) : trade.result === 'win' ? (
                  <span className="px-2 py-1 rounded text-xs font-bold bg-win/10 text-win border border-win/20">WIN</span>
                ) : trade.result === 'loss' ? (
                  <span className="px-2 py-1 rounded text-xs font-bold bg-loss/10 text-loss border border-loss/20">LOSS</span>
                ) : (
                  <span className="px-2 py-1 rounded text-xs font-bold bg-primary/10 text-primary border border-primary/20">BREAK EVEN</span>
                )}
              </div>
              
              <div className="flex items-center gap-4">
                <span className="font-mono text-muted-foreground">{trade.date}</span>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setEditingTrade(trade)} className="p-2 bg-muted hover:bg-primary/20 hover:text-primary rounded transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(trade.id)} className="p-2 bg-muted hover:bg-destructive/20 hover:text-destructive rounded transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Grid 2 rows of 4 */}
            <div className="grid grid-cols-4 gap-6 mb-6">
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-1">Buy Price / Entry Price</div>
                <div className="font-mono text-lg">{trade.buyPrice}</div>
              </div>
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-1">Take Profit Price</div>
                <div className="font-mono text-lg">{trade.takeProfitPrice}</div>
              </div>
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-1">Stop Loss Price</div>
                <div className="font-mono text-lg">{trade.stopLossPrice}</div>
              </div>
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-1">Exit Price</div>
                <div className="font-mono text-lg">{trade.exitPrice || '-'}</div>
              </div>

              <div>
                <div className="text-xs font-medium text-muted-foreground mb-1">Risk:Reward Ratio</div>
                <div className="font-mono text-lg text-gold">{trade.rrRatio}</div>
              </div>
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-1">Quantity</div>
                <div className="font-mono text-lg">{trade.quantity}</div>
              </div>
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-1">Profit & Loss %</div>
                <div className={`font-mono text-lg ${trade.plPercent > 0 ? 'text-win' : trade.plPercent < 0 ? 'text-loss' : ''}`}>
                  {trade.plPercent > 0 ? '+' : ''}{trade.plPercent.toFixed(2)}%
                </div>
              </div>
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-1">Profit & Loss ($)</div>
                <div className={`font-mono text-lg font-bold ${trade.plDollar > 0 ? 'text-win' : trade.plDollar < 0 ? 'text-loss' : ''}`}>
                  {trade.plDollar > 0 ? '+' : ''}${Math.abs(trade.plDollar).toFixed(2)}
                </div>
              </div>
            </div>

            {/* Notes */}
            {trade.notes && (
              <div className="bg-background rounded-lg p-4 text-sm border border-border text-muted-foreground">
                <div className="font-medium text-foreground mb-1">Trade Notes</div>
                {trade.notes}
              </div>
            )}
          </div>
        ))}

        {filteredTrades.length === 0 && (
          <div className="text-center py-24 bg-card rounded-xl border border-dashed border-border">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-bold mb-2">No trades found</h3>
            <p className="text-muted-foreground">Log a new trade or adjust your filters.</p>
          </div>
        )}
      </div>

      {editingTrade && (
        <TradeModal onClose={() => setEditingTrade(null)} tradeToEdit={editingTrade} />
      )}
    </div>
  );
}
