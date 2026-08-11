import { useState } from 'react';
import { useStore } from '@/store';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function CalendarSection() {
  const { state } = useStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });

  // Calculate day stats
  const getDayStats = (dateStr: string) => {
    const trades = state.trades.filter(t => t.date === dateStr);
    if (!trades.length) return null;
    const pl = trades.reduce((sum, t) => sum + (t.result !== 'open' ? t.plDollar : 0), 0);
    return { count: trades.length, pl };
  };

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const selectedTrades = state.trades.filter(t => t.date === selectedDateStr);

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  // padding for calendar
  const startDay = startOfMonth(currentMonth).getDay();
  const padding = Array.from({ length: startDay }, (_, i) => i);

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Left: Calendar Grid */}
      <div className="col-span-2 bg-card border border-border p-6 rounded-xl">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold font-mono">{format(currentMonth, 'MMMM yyyy')}</h2>
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="p-2 hover:bg-white/5 rounded-full transition-colors"><ChevronLeft className="w-5 h-5" /></button>
            <button onClick={() => setCurrentMonth(new Date())} className="text-sm font-medium text-muted-foreground hover:text-foreground">Today</button>
            <button onClick={nextMonth} className="p-2 hover:bg-white/5 rounded-full transition-colors"><ChevronRight className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {padding.map(p => (
            <div key={`pad-${p}`} className="h-24 rounded-lg bg-background/30" />
          ))}
          {days.map(day => {
            const dStr = format(day, 'yyyy-MM-dd');
            const stats = getDayStats(dStr);
            const isToday = isSameDay(day, new Date());
            const isSelected = isSameDay(day, selectedDate);
            
            let bgClass = 'bg-background hover:bg-white/5';
            if (stats) {
              if (stats.pl > 0) bgClass = 'bg-win/10 hover:bg-win/20 border-win/20';
              else if (stats.pl < 0) bgClass = 'bg-loss/10 hover:bg-loss/20 border-loss/20';
              else bgClass = 'bg-primary/10 hover:bg-primary/20 border-primary/20';
            }

            return (
              <button
                key={dStr}
                onClick={() => setSelectedDate(day)}
                className={`h-24 rounded-lg border flex flex-col p-2 transition-all relative ${bgClass} ${isSelected ? 'ring-2 ring-primary border-primary' : 'border-border'} ${isToday && !isSelected ? 'border-primary border-dashed' : ''}`}
              >
                <span className={`text-sm font-mono ${!isSameMonth(day, currentMonth) ? 'text-muted-foreground' : ''}`}>
                  {format(day, 'd')}
                </span>
                {stats && (
                  <div className="mt-auto self-end flex flex-col items-end">
                    <span className={`text-xs font-bold font-mono ${stats.pl > 0 ? 'text-win' : stats.pl < 0 ? 'text-loss' : 'text-primary'}`}>
                      {stats.pl > 0 ? '+' : ''}${Math.abs(stats.pl).toFixed(0)}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">{stats.count} trades</span>
                  </div>
                )}
                {stats && <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-primary" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: Selected Day */}
      <div className="bg-card border border-border p-6 rounded-xl flex flex-col">
        <h3 className="font-bold text-lg mb-2">Trades on {format(selectedDate, 'MMM d, yyyy')}</h3>
        <p className="text-sm text-muted-foreground mb-6 font-mono">{selectedTrades.length} trades logged</p>
        
        <div className="flex-1 overflow-y-auto space-y-3">
          {selectedTrades.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No trades for this date.
            </div>
          ) : (
            selectedTrades.map(t => (
              <div key={t.id} className="p-4 rounded-lg border border-border bg-background flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="font-bold font-mono text-secondary">{t.symbol}</span>
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${t.direction === 'BUY' ? 'bg-win/10 text-win' : 'bg-loss/10 text-loss'}`}>
                      {t.direction}
                    </span>
                  </div>
                  <span className={`font-mono font-bold ${t.plDollar > 0 ? 'text-win' : t.plDollar < 0 ? 'text-loss' : 'text-muted-foreground'}`}>
                    {t.result === 'open' ? 'OPEN' : `${t.plDollar > 0 ? '+' : ''}$${Math.abs(t.plDollar).toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground font-mono">
                  <span>Entry: {t.buyPrice}</span>
                  <span>Exit: {t.exitPrice || '-'}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
