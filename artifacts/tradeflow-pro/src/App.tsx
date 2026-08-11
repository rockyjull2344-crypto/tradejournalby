import { useEffect } from 'react';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { Toaster } from 'sonner';

import { StoreProvider } from '@/store';
import Dashboard from '@/pages/Dashboard';
import JournalTools from '@/pages/JournalTools';
import NotFound from '@/pages/not-found';

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/journal" component={JournalTools} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <StoreProvider>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
        <Router />
      </WouterRouter>
      <Toaster theme="dark" position="bottom-right" />
    </StoreProvider>
  );
}

export default App;
