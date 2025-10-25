import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from './components/ThemeProvider';
import { Layout } from './components/layout';
import ComponentShowcase from './pages/ComponentShowcase';
import { Dashboard } from './pages/Dashboard';
import { queryClient } from './lib/query-client';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<ComponentShowcase />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </Layout>
        </ThemeProvider>
      </BrowserRouter>
      {/* Add DevTools only in development mode */}
      {import.meta.env.DEV && (
        <ReactQueryDevtools
          initialIsOpen={false}
          buttonPosition="bottom-right"
          data-testid="react-query-devtools"
        />
      )}
    </QueryClientProvider>
  );
}

export default App;
