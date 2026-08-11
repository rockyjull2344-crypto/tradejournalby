import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';

import TradeJournal from '@/components/sections/TradeJournal';
import Analytics from '@/components/sections/Analytics';
import CalendarSection from '@/components/sections/Calendar';
import HabitTracker from '@/components/sections/HabitTracker';
import DailyPlanner from '@/components/sections/DailyPlanner';
import PDFJournal from '@/components/sections/PDFJournal';
import Watchlist from '@/components/sections/Watchlist';
import Settings from '@/components/sections/Settings';

export default function JournalTools() {
  const [currentSection, setCurrentSection] = useState('Trade Journal');

  const renderSection = () => {
    switch (currentSection) {
      case 'Trade Journal': return <TradeJournal />;
      case 'Analytics': return <Analytics />;
      case 'Calendar': return <CalendarSection />;
      case 'Habit Tracker': return <HabitTracker />;
      case 'Daily Planner': return <DailyPlanner />;
      case 'PDF Journal': return <PDFJournal />;
      case 'Watchlist': return <Watchlist />;
      case 'Settings': return <Settings />;
      default: return <TradeJournal />;
    }
  };

  return (
    <div className="min-h-[100dvh] flex bg-background">
      <Sidebar currentSection={currentSection} setCurrentSection={setCurrentSection} />
      <div className="flex-1 ml-[220px] flex flex-col">
        <TopBar title={currentSection} />
        
        <div className="flex-1 p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-300">
          {renderSection()}
        </div>
      </div>
    </div>
  );
}
