import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export interface Trade {
  id: string;
  symbol: string;
  date: string;
  direction: 'BUY' | 'SELL';
  buyPrice: number;
  takeProfitPrice: number;
  stopLossPrice: number;
  exitPrice: number;
  quantity: number;
  rrRatio: string;
  plPercent: number;
  plDollar: number;
  result: 'open' | 'win' | 'loss' | 'be';
  strategy: string;
  notes: string;
  createdAt: string;
}

export interface Habit {
  id: string;
  name: string;
  category: string;
  frequency: string;
  completions: Record<string, boolean>; // YYYY-MM-DD -> done
}

export interface PlannerTask {
  id: string;
  time: string; // HH:mm
  category: 'trading' | 'review' | 'personal';
  description: string;
  done: boolean;
}

export interface Goal {
  text: string;
  done: boolean;
}

export interface PDF {
  id: string;
  name: string;
  size: number;
  data: string; // base64
  date: string;
}

export interface AppState {
  trades: Trade[];
  habits: Habit[];
  tasks: Record<string, PlannerTask[]>;
  goals: Record<string, Goal[]>;
  pdfs: PDF[];
  symbols: string[];
  settings: {
    accountName: string;
    startingCapital: number;
    currency: string;
    riskPercentage: number;
    winRateTarget: number;
  };
}

const defaultState: AppState = {
  trades: [],
  habits: [
    { id: 'h1', name: 'Follow Trade Plan', category: 'Trading', frequency: 'Weekdays', completions: {} },
    { id: 'h2', name: 'No Revenge Trading', category: 'Mindset', frequency: 'Weekdays', completions: {} },
    { id: 'h3', name: 'Journal Review', category: 'Trading', frequency: 'Daily', completions: {} },
    { id: 'h4', name: 'Risk Below 1% Per Trade', category: 'Trading', frequency: 'Weekdays', completions: {} },
    { id: 'h5', name: 'Morning Meditation', category: 'Mindset', frequency: 'Daily', completions: {} }
  ],
  tasks: {},
  goals: {},
  pdfs: [],
  symbols: ['AAPL', 'BTC', 'EURUSD', 'GOLD', 'SPY', 'TSLA', 'ETH', 'AMZN'],
  settings: {
    accountName: 'Main Account',
    startingCapital: 10000,
    currency: 'USD',
    riskPercentage: 1,
    winRateTarget: 60
  }
};

interface StoreContextType {
  state: AppState;
  addTrade: (trade: Omit<Trade, 'id' | 'createdAt'>) => void;
  updateTrade: (id: string, trade: Partial<Trade>) => void;
  deleteTrade: (id: string) => void;
  addHabit: (habit: Omit<Habit, 'id' | 'completions'>) => void;
  toggleHabit: (id: string, date: string) => void;
  deleteHabit: (id: string) => void;
  addTask: (date: string, task: Omit<PlannerTask, 'id' | 'done'>) => void;
  toggleTask: (date: string, id: string) => void;
  deleteTask: (date: string, id: string) => void;
  addGoal: (date: string, text: string) => void;
  toggleGoal: (date: string, index: number) => void;
  addPDF: (pdf: Omit<PDF, 'id' | 'date'>) => void;
  deletePDF: (id: string) => void;
  addSymbol: (symbol: string) => void;
  removeSymbol: (symbol: string) => void;
  updateSettings: (settings: Partial<AppState['settings']>) => void;
  clearData: () => void;
  exportData: () => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('tradeflow_state');
    if (saved) {
      try {
        return { ...defaultState, ...JSON.parse(saved) };
      } catch (e) {
        return defaultState;
      }
    }
    return defaultState;
  });

  useEffect(() => {
    localStorage.setItem('tradeflow_state', JSON.stringify(state));
  }, [state]);

  const addTrade = (tradeData: Omit<Trade, 'id' | 'createdAt'>) => {
    const trade: Trade = {
      ...tradeData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };
    setState(s => ({ ...s, trades: [trade, ...s.trades] }));
  };

  const updateTrade = (id: string, tradeUpdates: Partial<Trade>) => {
    setState(s => ({
      ...s,
      trades: s.trades.map(t => t.id === id ? { ...t, ...tradeUpdates } : t)
    }));
  };

  const deleteTrade = (id: string) => {
    setState(s => ({
      ...s,
      trades: s.trades.filter(t => t.id !== id)
    }));
  };

  const addHabit = (habitData: Omit<Habit, 'id' | 'completions'>) => {
    const habit: Habit = {
      ...habitData,
      id: crypto.randomUUID(),
      completions: {}
    };
    setState(s => ({ ...s, habits: [...s.habits, habit] }));
  };

  const toggleHabit = (id: string, date: string) => {
    setState(s => ({
      ...s,
      habits: s.habits.map(h => {
        if (h.id !== id) return h;
        const newCompletions = { ...h.completions };
        if (newCompletions[date]) {
          delete newCompletions[date];
        } else {
          newCompletions[date] = true;
        }
        return { ...h, completions: newCompletions };
      })
    }));
  };

  const deleteHabit = (id: string) => {
    setState(s => ({ ...s, habits: s.habits.filter(h => h.id !== id) }));
  };

  const addTask = (date: string, taskData: Omit<PlannerTask, 'id' | 'done'>) => {
    const task: PlannerTask = {
      ...taskData,
      id: crypto.randomUUID(),
      done: false
    };
    setState(s => ({
      ...s,
      tasks: {
        ...s.tasks,
        [date]: [...(s.tasks[date] || []), task].sort((a, b) => a.time.localeCompare(b.time))
      }
    }));
  };

  const toggleTask = (date: string, id: string) => {
    setState(s => ({
      ...s,
      tasks: {
        ...s.tasks,
        [date]: (s.tasks[date] || []).map(t => t.id === id ? { ...t, done: !t.done } : t)
      }
    }));
  };

  const deleteTask = (date: string, id: string) => {
    setState(s => ({
      ...s,
      tasks: {
        ...s.tasks,
        [date]: (s.tasks[date] || []).filter(t => t.id !== id)
      }
    }));
  };

  const addGoal = (date: string, text: string) => {
    setState(s => ({
      ...s,
      goals: {
        ...s.goals,
        [date]: [...(s.goals[date] || []), { text, done: false }]
      }
    }));
  };

  const toggleGoal = (date: string, index: number) => {
    setState(s => ({
      ...s,
      goals: {
        ...s.goals,
        [date]: (s.goals[date] || []).map((g, i) => i === index ? { ...g, done: !g.done } : g)
      }
    }));
  };

  const addPDF = (pdfData: Omit<PDF, 'id' | 'date'>) => {
    const pdf: PDF = {
      ...pdfData,
      id: crypto.randomUUID(),
      date: new Date().toISOString()
    };
    setState(s => ({ ...s, pdfs: [pdf, ...s.pdfs] }));
  };

  const deletePDF = (id: string) => {
    setState(s => ({ ...s, pdfs: s.pdfs.filter(p => p.id !== id) }));
  };

  const addSymbol = (symbol: string) => {
    setState(s => ({ ...s, symbols: Array.from(new Set([...s.symbols, symbol.toUpperCase()])) }));
  };

  const removeSymbol = (symbol: string) => {
    setState(s => ({ ...s, symbols: s.symbols.filter(sym => sym !== symbol) }));
  };

  const updateSettings = (settingsUpdates: Partial<AppState['settings']>) => {
    setState(s => ({ ...s, settings: { ...s.settings, ...settingsUpdates } }));
  };

  const clearData = () => {
    setState(defaultState);
  };

  const exportData = () => {
    const dataStr = JSON.stringify(state, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'tradeflow_export.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <StoreContext.Provider value={{
      state,
      addTrade, updateTrade, deleteTrade,
      addHabit, toggleHabit, deleteHabit,
      addTask, toggleTask, deleteTask,
      addGoal, toggleGoal,
      addPDF, deletePDF,
      addSymbol, removeSymbol,
      updateSettings, clearData, exportData
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};
