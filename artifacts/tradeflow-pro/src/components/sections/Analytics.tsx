import { useStore } from '@/store';

export default function Analytics() {
  const { state } = useStore();
  const closedTrades = state.trades.filter(t => t.result !== 'open');
  const wins = closedTrades.filter(t => t.result === 'win');
  const losses = closedTrades.filter(t => t.result === 'loss');

  // Stats
  const returns = closedTrades.map(t => t.plPercent);
  const avgReturn = returns.length ? returns.reduce((a,b)=>a+b,0)/returns.length : 0;
  const stdDev = returns.length ? Math.sqrt(returns.reduce((sq, n) => sq + Math.pow(n - avgReturn, 2), 0) / returns.length) : 0;
  const sharpeRatio = stdDev > 0 ? (avgReturn / stdDev).toFixed(2) : '0.00';

  const largestWin = wins.length > 0 ? Math.max(...wins.map(t => t.plDollar)) : 0;
  const largestLoss = losses.length > 0 ? Math.min(...losses.map(t => t.plDollar)) : 0;

  const totalRR = closedTrades.reduce((sum, t) => sum + (parseFloat(t.rrRatio.split(':')[0]) || 0), 0);
  const avgRR = closedTrades.length > 0 ? (totalRR / closedTrades.length).toFixed(2) : '0.00';

  // Per Symbol Performance
  const symbolStats = state.symbols.map(sym => {
    const symTrades = closedTrades.filter(t => t.symbol === sym);
    if (!symTrades.length) return null;
    const symWins = symTrades.filter(t => t.result === 'win');
    const wr = (symWins.length / symTrades.length) * 100;
    const pl = symTrades.reduce((sum, t) => sum + t.plDollar, 0);
    return { symbol: sym, trades: symTrades.length, wr, pl };
  }).filter(Boolean) as any[];

  // Monthly summary
  const monthly = closedTrades.reduce((acc: any, t) => {
    const m = t.date.substring(0, 7); // YYYY-MM
    if (!acc[m]) acc[m] = { month: m, trades: 0, wins: 0, pl: 0 };
    acc[m].trades++;
    if (t.result === 'win') acc[m].wins++;
    acc[m].pl += t.plDollar;
    return acc;
  }, {});
  const monthlyArr = Object.values(monthly).sort((a:any, b:any) => b.month.localeCompare(a.month));

  // Donut chart logic
  const buyTrades = closedTrades.filter(t => t.direction === 'BUY').length;
  const sellTrades = closedTrades.filter(t => t.direction === 'SELL').length;
  const totalDir = buyTrades + sellTrades;
  const buyPct = totalDir ? (buyTrades / totalDir) * 100 : 50;
  const sellPct = totalDir ? (sellTrades / totalDir) * 100 : 50;
  
  const circumference = 2 * Math.PI * 40;
  const buyDash = (buyPct / 100) * circumference;

  return (
    <div className="space-y-6">
      {/* Top Stats */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-card border border-border p-6 rounded-xl">
          <div className="text-sm font-medium text-muted-foreground mb-2">Sharpe Ratio</div>
          <div className="text-3xl font-bold font-mono">{sharpeRatio}</div>
        </div>
        <div className="bg-card border border-border p-6 rounded-xl">
          <div className="text-sm font-medium text-muted-foreground mb-2">Largest Win</div>
          <div className="text-3xl font-bold font-mono text-win">${largestWin.toFixed(2)}</div>
        </div>
        <div className="bg-card border border-border p-6 rounded-xl">
          <div className="text-sm font-medium text-muted-foreground mb-2">Largest Loss</div>
          <div className="text-3xl font-bold font-mono text-loss">${Math.abs(largestLoss).toFixed(2)}</div>
        </div>
        <div className="bg-card border border-border p-6 rounded-xl">
          <div className="text-sm font-medium text-muted-foreground mb-2">Average Risk:Reward Achieved</div>
          <div className="text-3xl font-bold font-mono text-gold">{avgRR}:1</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Symbol Performance */}
        <div className="col-span-2 bg-card border border-border p-6 rounded-xl">
          <h3 className="font-bold text-lg mb-6">Symbol Performance</h3>
          <div className="space-y-4">
            {symbolStats.length === 0 ? (
              <div className="text-muted-foreground py-8 text-center">No data available</div>
            ) : (
              symbolStats.sort((a,b)=>b.pl - a.pl).map(s => (
                <div key={s.symbol}>
                  <div className="flex justify-between items-end mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold font-mono">{s.symbol}</span>
                      <span className="text-xs text-muted-foreground">{s.trades} trades · {s.wr.toFixed(0)}% WR · <span className={s.pl >= 0 ? 'text-win' : 'text-loss'}>{s.pl >= 0 ? '+' : ''}${s.pl.toFixed(2)}</span></span>
                    </div>
                  </div>
                  <div className="h-2 bg-background rounded-full overflow-hidden flex">
                    <div className="bg-win h-full" style={{ width: `${s.wr}%` }} />
                    <div className="bg-loss h-full" style={{ width: `${100 - s.wr}%` }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Trade Direction Split */}
        <div className="bg-card border border-border p-6 rounded-xl flex flex-col items-center">
          <h3 className="font-bold text-lg mb-8 self-start">Trade Direction Split</h3>
          <div className="relative w-48 h-48 mb-8">
            <svg width="100%" height="100%" viewBox="0 0 100 100" className="transform -rotate-90">
              <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--loss))" strokeWidth="20" className="text-loss" style={{ stroke: 'hsl(var(--chart-2))' }} />
              <circle cx="50" cy="50" r="40" fill="none" strokeWidth="20" 
                strokeDasharray={`${buyDash} ${circumference}`}
                style={{ stroke: 'hsl(var(--chart-1))' }}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold font-mono">{totalDir}</span>
              <span className="text-xs text-muted-foreground">Trades</span>
            </div>
          </div>
          <div className="flex justify-between w-full px-4 font-mono">
            <div className="text-center">
              <div className="text-win font-bold">{buyPct.toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground">BUY</div>
            </div>
            <div className="text-center">
              <div className="text-loss font-bold">{sellPct.toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground">SELL</div>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Summary */}
      <div className="bg-card border border-border p-6 rounded-xl overflow-hidden">
        <h3 className="font-bold text-lg mb-6">Monthly Profit & Loss Summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-muted/30 text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-mono font-normal">Month</th>
                <th className="px-6 py-4 font-mono font-normal">Total Trades</th>
                <th className="px-6 py-4 font-mono font-normal">Wins</th>
                <th className="px-6 py-4 font-mono font-normal">Win Rate</th>
                <th className="px-6 py-4 font-mono font-normal">Profit & Loss ($)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {monthlyArr.map((m: any) => (
                <tr key={m.month} className="hover:bg-white/5">
                  <td className="px-6 py-4 font-mono font-bold">{m.month}</td>
                  <td className="px-6 py-4 font-mono">{m.trades}</td>
                  <td className="px-6 py-4 font-mono">{m.wins}</td>
                  <td className="px-6 py-4 font-mono text-primary">{((m.wins / m.trades) * 100).toFixed(1)}%</td>
                  <td className={`px-6 py-4 font-mono font-bold ${m.pl > 0 ? 'text-win' : m.pl < 0 ? 'text-loss' : ''}`}>
                    {m.pl > 0 ? '+' : ''}${Math.abs(m.pl).toFixed(2)}
                  </td>
                </tr>
              ))}
              {monthlyArr.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No monthly data available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
