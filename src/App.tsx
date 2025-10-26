import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from './components/ThemeProvider';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/layout';
import { Dashboard } from './pages/Dashboard';
import { InstrumentsList } from './pages/InstrumentsList';
import { InstrumentDetail } from './pages/InstrumentDetail';
import { Watchlist } from './pages/Watchlist';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { queryClient } from './lib/query-client';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <ThemeProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* Protected routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/instruments"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <InstrumentsList />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/watchlist"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Watchlist />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/instrument/:id"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <InstrumentDetail />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings/*"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Settings />
                    </Layout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </ThemeProvider>
        </AuthProvider>
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
