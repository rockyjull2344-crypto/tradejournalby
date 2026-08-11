import { useStore } from '@/store';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { Link } from 'wouter';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export default function Dashboard() {
  const { state } = useStore();
  const { trades, settings } = state;

  // Derived calculations
  const closedTrades = trades.filter(t => t.result !== 'open');
  const wins = closedTrades.filter(t => t.result === 'win');
  const losses = closedTrades.filter(t => t.result === 'loss');
  const openTrades = trades.filter(t => t.result === 'open');

  const totalPL = closedTrades.reduce((sum, t) => sum + t.plDollar, 0);
  const winRate = closedTrades.length > 0 ? (wins.length / closedTrades.length) * 100 : 0;
  
  const totalRR = closedTrades.reduce((sum, t) => {
    const r = parseFloat(t.rrRatio.split(':')[0]);
    return sum + (isNaN(r) ? 0 : r);
  }, 0);
  const avgRR = closedTrades.length > 0 ? (totalRR / closedTrades.length).toFixed(2) : '0.00';

  // Last 10
  const last10 = trades.slice(0, 10);
  
  // Ratios
  const grossProfit = wins.reduce((sum, t) => sum + t.plDollar, 0);
  const grossLoss = Math.abs(losses.reduce((sum, t) => sum + t.plDollar, 0));
  const profitFactor = grossLoss > 0 ? (grossProfit / grossLoss).toFixed(2) : (grossProfit > 0 ? '∞' : '0.00');

  const avgWin = wins.length > 0 ? grossProfit / wins.length : 0;
  const avgLoss = losses.length > 0 ? grossLoss / losses.length : 0;
  const expectancy = closedTrades.length > 0 ? (winRate / 100 * avgWin) - ((1 - winRate / 100) * avgLoss) : 0;

  const bestTrade = wins.length > 0 ? Math.max(...wins.map(t => t.plDollar)) : 0;
  const worstTrade = losses.length > 0 ? Math.min(...losses.map(t => t.plDollar)) : 0;

  return (
    <div className="min-h-[100dvh] flex bg-background">
      <Sidebar />
      <div className="flex-1 ml-[220px] flex flex-col">
        <TopBar title="Dashboard" />
        
        <div className="p-8 max-w-7xl mx-auto w-full space-y-8 animate-in fade-in duration-500">
          
          {/* Top 4 stat cards */}
          <div className="grid grid-cols-4 gap-6">
            <div className="bg-card border border-border rounded-xl p-6 relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-win" />
              <div className="text-sm font-medium text-muted-foreground mb-2">Total Profit & Loss ($)</div>
              <div className={`text-3xl font-bold font-mono tracking-tight ${totalPL > 0 ? 'text-win' : totalPL < 0 ? 'text-loss' : ''}`}>
                {totalPL >= 0 ? '+' : ''}{totalPL.toLocaleString('en-US', { style: 'currency', currency: settings.currency })}
              </div>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-6 relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-primary" />
              <div className="text-sm font-medium text-muted-foreground mb-2">Win Rate</div>
              <div className="text-3xl font-bold font-mono tracking-tight">{winRate.toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground mt-2 font-mono">{wins.length} Wins / {losses.length} Losses</div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gold" />
              <div className="text-sm font-medium text-muted-foreground mb-2">Average Risk:Reward Ratio</div>
              <div className="text-3xl font-bold font-mono tracking-tight">{avgRR}:1</div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-loss" />
              <div className="text-sm font-medium text-muted-foreground mb-2">Total Trades</div>
              <div className="text-3xl font-bold font-mono tracking-tight">{trades.length}</div>
              <div className="text-xs text-muted-foreground mt-2 font-mono">{openTrades.length} open positions</div>
            </div>
          </div>

          {/* Middle row: 2 cards side by side */}
          <div className="grid grid-cols-2 gap-6">
            {/* Profit & Loss Overview */}
            <div className="bg-card border border-border rounded-xl p-6 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg">Profit & Loss Overview</h3>
                <div className="flex gap-2">
                  <span className="text-xs px-2 py-1 rounded bg-win/10 text-win border border-win/20 font-mono">{wins.length} Wins</span>
                  <span className="text-xs px-2 py-1 rounded bg-loss/10 text-loss border border-loss/20 font-mono">{losses.length} Losses</span>
                </div>
              </div>
              
              <div className="flex-1 flex items-end gap-2 h-32 mb-6">
                {last10.length === 0 ? (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">No recent trades</div>
                ) : (
                  [...last10].reverse().map(t => {
                    if (t.result === 'open') return null;
                    const maxPL = Math.max(...last10.map(x => Math.abs(x.plDollar)), 1);
                    const height = Math.max((Math.abs(t.plDollar) / maxPL) * 100, 5);
                    const isWin = t.plDollar >= 0;
                    return (
                      <div 
                        key={t.id}
                        className={`flex-1 rounded-t-sm transition-all hover:opacity-80 ${isWin ? 'bg-win' : 'bg-loss'}`}
                        style={{ height: `${height}%` }}
                        title={`${t.symbol}: ${t.plDollar >= 0 ? '+' : ''}$${t.plDollar.toFixed(2)}`}
                      />
                    );
                  })
                )}
              </div>
              
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Best Trade ($)</div>
                  <div className="font-mono text-win font-bold">+{bestTrade.toLocaleString('en-US', { style: 'currency', currency: settings.currency })}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Worst Trade ($)</div>
                  <div className="font-mono text-loss font-bold">{worstTrade.toLocaleString('en-US', { style: 'currency', currency: settings.currency })}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Average Win ($)</div>
                  <div className="font-mono font-bold">{avgWin.toLocaleString('en-US', { style: 'currency', currency: settings.currency })}</div>
                </div>
              </div>
            </div>

            {/* Performance Ratios */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-bold text-lg mb-6">Performance Ratios</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Profit Factor</span>
                    <span className="font-mono font-bold">{profitFactor}</span>
                  </div>
                  <div className="h-2 bg-background rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${Math.min(parseFloat(profitFactor) * 20, 100)}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Expectancy (per $1 risk)</span>
                    <span className="font-mono font-bold text-gold">${expectancy.toFixed(2)}</span>
                  </div>
                  <div className="h-2 bg-background rounded-full overflow-hidden">
                    <div className="h-full bg-gold" style={{ width: `${Math.min((expectancy / 2) * 100, 100)}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Win Rate vs Target ({settings.winRateTarget}%)</span>
                    <span className="font-mono font-bold text-win">{winRate.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-background rounded-full overflow-hidden">
                    <div className="h-full bg-win" style={{ width: `${Math.min((winRate / settings.winRateTarget) * 100, 100)}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Average Hold Discipline</span>
                    <span className="font-mono font-bold text-primary">4h 30m</span>
                  </div>
                  <div className="h-2 bg-background rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `75%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom: Recent Trades Table */}
          <div className="bg-card border border-border rounded-xl p-0 overflow-hidden">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h3 className="font-bold text-lg">Recent Trades</h3>
              <Link href="/journal" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                View All
              </Link>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-muted/30 text-muted-foreground">
                  <tr>
                    <th className="px-6 py-4 font-mono font-normal">Date</th>
                    <th className="px-6 py-4 font-mono font-normal">Symbol</th>
                    <th className="px-6 py-4 font-mono font-normal">Buy / Sell Direction</th>
                    <th className="px-6 py-4 font-mono font-normal">Buy Price / Entry Price</th>
                    <th className="px-6 py-4 font-mono font-normal">Take Profit Price</th>
                    <th className="px-6 py-4 font-mono font-normal">Stop Loss Price</th>
                    <th className="px-6 py-4 font-mono font-normal">Risk:Reward Ratio</th>
                    <th className="px-6 py-4 font-mono font-normal">Profit & Loss %</th>
                    <th className="px-6 py-4 font-mono font-normal">Profit & Loss ($)</th>
                    <th className="px-6 py-4 font-mono font-normal">Trade Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {trades.slice(0, 8).map(t => (
                    <tr key={t.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4 font-mono whitespace-nowrap">{t.date}</td>
                      <td className="px-6 py-4 font-bold text-secondary font-mono">{t.symbol}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold border ${t.direction === 'BUY' ? 'bg-win/10 text-win border-win/20' : 'bg-loss/10 text-loss border-loss/20'}`}>
                          {t.direction === 'BUY' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {t.direction}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono">{t.buyPrice}</td>
                      <td className="px-6 py-4 font-mono">{t.takeProfitPrice}</td>
                      <td className="px-6 py-4 font-mono">{t.stopLossPrice}</td>
                      <td className="px-6 py-4 font-mono text-gold">{t.rrRatio}</td>
                      <td className={`px-6 py-4 font-mono ${t.plPercent > 0 ? 'text-win' : t.plPercent < 0 ? 'text-loss' : ''}`}>
                        {t.plPercent > 0 ? '+' : ''}{t.plPercent.toFixed(2)}%
                      </td>
                      <td className={`px-6 py-4 font-mono ${t.plDollar > 0 ? 'text-win' : t.plDollar < 0 ? 'text-loss' : ''}`}>
                        {t.plDollar > 0 ? '+' : ''}${Math.abs(t.plDollar).toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        {t.result === 'open' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold bg-muted text-muted-foreground border border-border">
                            <Minus className="w-3 h-3" /> OPEN
                          </span>
                        ) : t.result === 'win' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold bg-win/10 text-win border border-win/20">
                            WIN
                          </span>
                        ) : t.result === 'loss' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold bg-loss/10 text-loss border border-loss/20">
                            LOSS
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                            BREAK EVEN
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {trades.length === 0 && (
                    <tr>
                      <td colSpan={10} className="px-6 py-12 text-center text-muted-foreground">
                        No trades logged yet. Click "Log New Trade" to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
