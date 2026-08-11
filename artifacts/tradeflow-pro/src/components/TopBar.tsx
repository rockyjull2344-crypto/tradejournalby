import { format } from 'date-fns';
import { Plus } from 'lucide-react';
import TradeModal from './TradeModal';
import { useState } from 'react';

export default function TopBar({ title }: { title: string }) {
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const today = format(new Date(), 'yyyy-MM-dd');

  return (
    <>
      <div className="h-16 border-b border-border flex items-center justify-between px-8 bg-background sticky top-0 z-10">
        <h2 className="text-xl font-bold tracking-tight">{title}</h2>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-win animate-pulse" />
            <span className="font-mono text-sm text-muted-foreground">MARKET OPEN</span>
          </div>
          
          <div className="font-mono text-sm">{today}</div>
          
          <button 
            onClick={() => setIsTradeModalOpen(true)}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Log New Trade
          </button>
        </div>
      </div>
      
      {isTradeModalOpen && (
        <TradeModal onClose={() => setIsTradeModalOpen(false)} />
      )}
    </>
  );
}
