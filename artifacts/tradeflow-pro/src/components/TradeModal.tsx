import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useStore, Trade } from '@/store';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function TradeModal({ 
  onClose, 
  tradeToEdit 
}: { 
  onClose: () => void, 
  tradeToEdit?: Trade 
}) {
  const { state, addTrade, updateTrade } = useStore();
  
  const [formData, setFormData] = useState({
    symbol: tradeToEdit?.symbol || state.symbols[0] || '',
    date: tradeToEdit?.date || format(new Date(), 'yyyy-MM-dd'),
    direction: tradeToEdit?.direction || 'BUY',
    buyPrice: tradeToEdit?.buyPrice?.toString() || '',
    takeProfitPrice: tradeToEdit?.takeProfitPrice?.toString() || '',
    stopLossPrice: tradeToEdit?.stopLossPrice?.toString() || '',
    exitPrice: tradeToEdit?.exitPrice?.toString() || '',
    quantity: tradeToEdit?.quantity?.toString() || '1',
    result: tradeToEdit?.result || 'open',
    strategy: tradeToEdit?.strategy || '',
    notes: tradeToEdit?.notes || ''
  });

  const [rrRatio, setRrRatio] = useState('0.00:1');
  const [plPercent, setPlPercent] = useState('0.00');
  const [plDollar, setPlDollar] = useState('0.00');

  useEffect(() => {
    const entry = parseFloat(formData.buyPrice);
    const tp = parseFloat(formData.takeProfitPrice);
    const sl = parseFloat(formData.stopLossPrice);
    const exit = parseFloat(formData.exitPrice);
    const qty = parseFloat(formData.quantity);
    
    // RR
    if (entry > 0 && tp > 0 && sl > 0) {
      const risk = Math.abs(entry - sl);
      const reward = Math.abs(tp - entry);
      if (risk > 0) {
        setRrRatio(`${(reward / risk).toFixed(2)}:1`);
      }
    } else {
      setRrRatio('0.00:1');
    }

    // PnL
    if (entry > 0 && exit > 0 && qty > 0) {
      let percent = 0;
      let dollar = 0;
      if (formData.direction === 'BUY') {
        percent = ((exit - entry) / entry) * 100;
        dollar = (exit - entry) * qty;
      } else {
        percent = ((entry - exit) / entry) * 100;
        dollar = (entry - exit) * qty;
      }
      setPlPercent(percent.toFixed(2));
      setPlDollar(dollar.toFixed(2));
    } else {
      setPlPercent('0.00');
      setPlDollar('0.00');
    }
  }, [formData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.symbol || !formData.date) {
      toast.error('Please fill in Symbol and Date');
      return;
    }

    const tradeData = {
      symbol: formData.symbol,
      date: formData.date,
      direction: formData.direction as 'BUY' | 'SELL',
      buyPrice: parseFloat(formData.buyPrice) || 0,
      takeProfitPrice: parseFloat(formData.takeProfitPrice) || 0,
      stopLossPrice: parseFloat(formData.stopLossPrice) || 0,
      exitPrice: parseFloat(formData.exitPrice) || 0,
      quantity: parseFloat(formData.quantity) || 1,
      rrRatio,
      plPercent: parseFloat(plPercent),
      plDollar: parseFloat(plDollar),
      result: formData.result as 'open' | 'win' | 'loss' | 'be',
      strategy: formData.strategy,
      notes: formData.notes
    };

    if (tradeToEdit) {
      updateTrade(tradeToEdit.id, tradeData);
      toast.success('Trade updated successfully!');
    } else {
      addTrade(tradeData);
      toast.success('Trade saved successfully!');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl border border-border shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card z-10">
          <h2 className="text-xl font-bold">{tradeToEdit ? 'Edit Trade' : 'Log New Trade'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Row 1 */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Symbol</label>
              <input 
                type="text"
                list="symbols-list"
                value={formData.symbol}
                onChange={e => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                className="w-full bg-input border border-border rounded-md px-3 py-2 font-mono uppercase focus:outline-none focus:border-primary"
                required
              />
              <datalist id="symbols-list">
                {state.symbols.map(s => <option key={s} value={s} />)}
              </datalist>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Date</label>
              <input 
                type="date"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-input border border-border rounded-md px-3 py-2 font-mono focus:outline-none focus:border-primary [color-scheme:dark]"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Buy / Sell Direction</label>
              <select 
                value={formData.direction}
                onChange={e => setFormData({ ...formData, direction: e.target.value as 'BUY' | 'SELL' })}
                className="w-full bg-input border border-border rounded-md px-3 py-2 focus:outline-none focus:border-primary"
              >
                <option value="BUY">BUY (Long)</option>
                <option value="SELL">SELL (Short)</option>
              </select>
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Buy Price / Entry Price</label>
              <input 
                type="number" step="any"
                value={formData.buyPrice}
                onChange={e => setFormData({ ...formData, buyPrice: e.target.value })}
                className="w-full bg-input border border-border rounded-md px-3 py-2 font-mono focus:outline-none focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Take Profit Price</label>
              <input 
                type="number" step="any"
                value={formData.takeProfitPrice}
                onChange={e => setFormData({ ...formData, takeProfitPrice: e.target.value })}
                className="w-full bg-input border border-border rounded-md px-3 py-2 font-mono focus:outline-none focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Stop Loss Price</label>
              <input 
                type="number" step="any"
                value={formData.stopLossPrice}
                onChange={e => setFormData({ ...formData, stopLossPrice: e.target.value })}
                className="w-full bg-input border border-border rounded-md px-3 py-2 font-mono focus:outline-none focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Risk:Reward Ratio</label>
              <div className="w-full bg-input/50 border border-border rounded-md px-3 py-2 font-mono text-gold cursor-not-allowed">
                {rrRatio}
              </div>
            </div>
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Exit Price</label>
              <input 
                type="number" step="any"
                value={formData.exitPrice}
                onChange={e => setFormData({ ...formData, exitPrice: e.target.value })}
                className="w-full bg-input border border-border rounded-md px-3 py-2 font-mono focus:outline-none focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Quantity (Lots/Shares)</label>
              <input 
                type="number" step="any"
                value={formData.quantity}
                onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full bg-input border border-border rounded-md px-3 py-2 font-mono focus:outline-none focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Profit & Loss %</label>
              <div className={`w-full bg-input/50 border border-border rounded-md px-3 py-2 font-mono cursor-not-allowed ${
                parseFloat(plPercent) > 0 ? 'text-win' : parseFloat(plPercent) < 0 ? 'text-loss' : 'text-foreground'
              }`}>
                {parseFloat(plPercent) > 0 ? '+' : ''}{plPercent}%
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Profit & Loss ($)</label>
              <div className={`w-full bg-input/50 border border-border rounded-md px-3 py-2 font-mono cursor-not-allowed ${
                parseFloat(plDollar) > 0 ? 'text-win' : parseFloat(plDollar) < 0 ? 'text-loss' : 'text-foreground'
              }`}>
                {parseFloat(plDollar) > 0 ? '+' : ''}${plDollar}
              </div>
            </div>
          </div>

          {/* Row 4 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Strategy / Setup</label>
              <input 
                type="text"
                value={formData.strategy}
                onChange={e => setFormData({ ...formData, strategy: e.target.value })}
                placeholder="e.g. Breakout, Reversal"
                className="w-full bg-input border border-border rounded-md px-3 py-2 focus:outline-none focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Trade Result</label>
              <select 
                value={formData.result}
                onChange={e => setFormData({ ...formData, result: e.target.value as 'open' | 'win' | 'loss' | 'be' })}
                className="w-full bg-input border border-border rounded-md px-3 py-2 focus:outline-none focus:border-primary"
              >
                <option value="open">Open / Pending</option>
                <option value="win">Win</option>
                <option value="loss">Loss</option>
                <option value="be">Break Even</option>
              </select>
            </div>
          </div>

          {/* Row 5 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Trade Notes / Journal</label>
            <textarea 
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              placeholder="What did you see? How did you feel?"
              className="w-full bg-input border border-border rounded-md px-3 py-2 focus:outline-none focus:border-primary resize-none"
            />
          </div>

          <div className="pt-4 border-t border-border flex justify-end gap-3">
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
              {tradeToEdit ? 'Save Changes' : 'Save Trade'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
