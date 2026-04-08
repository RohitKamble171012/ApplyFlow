import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/shared/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import InboxPage from './pages/InboxPage';
import ApplicationDetailPage from './pages/ApplicationDetailPage';
import LabelsPage from './pages/LabelsPage';
import SettingsPage from './pages/SettingsPage';
import SyncHistoryPage from './pages/SyncHistoryPage';
import CalendarPage from './pages/CalendarPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsPage from './pages/TermsPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes — no auth needed */}
          <Route path="/login"   element={<LoginPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/terms"   element={<TermsPage />} />
          <Route path="/"        element={<Navigate to="/dashboard" replace />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard"        element={<DashboardPage />} />
            <Route path="/inbox"            element={<InboxPage />} />
            <Route path="/inbox/:filter"    element={<InboxPage />} />
            <Route path="/applications/:id" element={<ApplicationDetailPage />} />
            <Route path="/calendar"         element={<CalendarPage />} />
            <Route path="/labels"           element={<LabelsPage />} />
            <Route path="/settings"         element={<SettingsPage />} />
            <Route path="/sync-history"     element={<SyncHistoryPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
