import { useLocation } from 'wouter';
import { 
  LayoutDashboard, BookOpen, BarChart3, CalendarDays, 
  CheckSquare, CheckCircle, FileText, ListFilter, Settings
} from 'lucide-react';

export default function Sidebar({ 
  currentSection, 
  setCurrentSection 
}: { 
  currentSection?: string, 
  setCurrentSection?: (s: string) => void 
}) {
  const [location, setLocation] = useLocation();

  const mainNav = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Journal & Tools', path: '/journal', icon: BookOpen }
  ];

  const sectionNav = [
    { name: 'Trade Journal', icon: BookOpen },
    { name: 'Analytics', icon: BarChart3 },
    { name: 'Calendar', icon: CalendarDays },
    { name: 'Habit Tracker', icon: CheckCircle },
    { name: 'Daily Planner', icon: CheckSquare },
    { name: 'PDF Journal', icon: FileText },
    { name: 'Watchlist', icon: ListFilter },
    { name: 'Settings', icon: Settings }
  ];

  return (
    <div className="w-[220px] shrink-0 h-screen bg-sidebar border-r border-border fixed left-0 top-0 flex flex-col pt-6 z-20">
      <div className="px-6 mb-8 flex items-center gap-2">
        <div className="w-8 h-8 rounded bg-primary flex items-center justify-center font-bold text-primary-foreground">
          TF
        </div>
        <h1 className="font-bold text-lg tracking-tight">TradeFlow<span className="text-primary">.</span>Pro</h1>
      </div>

      <div className="px-3 mb-6">
        <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2 px-3">Main</div>
        <div className="flex flex-col gap-1">
          {mainNav.map(item => (
            <button
              key={item.name}
              onClick={() => setLocation(item.path)}
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium ${
                location === item.path 
                  ? 'bg-secondary/10 text-secondary' 
                  : 'text-sidebar-foreground hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.name}
            </button>
          ))}
        </div>
      </div>

      {location === '/journal' && setCurrentSection && (
        <div className="px-3 flex-1 overflow-y-auto pb-6">
          <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2 px-3">Sections</div>
          <div className="flex flex-col gap-1">
            {sectionNav.map(item => (
              <button
                key={item.name}
                onClick={() => setCurrentSection(item.name)}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium ${
                  currentSection === item.name 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-sidebar-foreground hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
