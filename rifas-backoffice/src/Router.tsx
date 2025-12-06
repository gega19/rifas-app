import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from './admin/components/ErrorBoundary';
import { AuthProvider } from './admin/contexts/AuthContext';
import { lazy, Suspense } from 'react';

// Lazy load admin pages
const Login = lazy(() => import('./admin/pages/Login').then(m => ({ default: m.Login })));
const Dashboard = lazy(() => import('./admin/pages/Dashboard').then(m => ({ default: m.Dashboard })));
const References = lazy(() => import('./admin/pages/References').then(m => ({ default: m.References })));
const Participants = lazy(() => import('./admin/pages/Participants').then(m => ({ default: m.Participants })));
const Tickets = lazy(() => import('./admin/pages/Tickets').then(m => ({ default: m.Tickets })));

// Protected Route and Layout
const ProtectedRoute = lazy(() => import('./admin/components/ProtectedRoute').then(m => ({ default: m.ProtectedRoute })));
const AdminLayout = lazy(() => import('./admin/layouts/AdminLayout').then(m => ({ default: m.AdminLayout })));

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
    </div>
  );
}

export default function Router() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Admin login - public */}
            <Route path="/admin" element={
              <Suspense fallback={<LoadingFallback />}>
                <Login />
              </Suspense>
            } />
            
            {/* Protected admin routes */}
            <Route element={
              <Suspense fallback={<LoadingFallback />}>
                <ProtectedRoute>
                  <Suspense fallback={<LoadingFallback />}>
                    <AdminLayout />
                  </Suspense>
                </ProtectedRoute>
              </Suspense>
            }>
              <Route path="/admin/dashboard" element={
                <Suspense fallback={<LoadingFallback />}>
                  <Dashboard />
                </Suspense>
              } />
              <Route path="/admin/references" element={
                <Suspense fallback={<LoadingFallback />}>
                  <References />
                </Suspense>
              } />
              <Route path="/admin/participants" element={
                <Suspense fallback={<LoadingFallback />}>
                  <Participants />
                </Suspense>
              } />
              <Route path="/admin/tickets" element={
                <Suspense fallback={<LoadingFallback />}>
                  <Tickets />
                </Suspense>
              } />
            </Route>
            
            {/* Redirect root to admin login */}
            <Route path="/" element={<Navigate to="/admin" replace />} />
            
            {/* Redirect unknown routes */}
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}
