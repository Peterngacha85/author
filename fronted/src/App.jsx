import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';

// Guards
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import Login       from './pages/auth/Login';
import Register    from './pages/auth/Register';

// User Pages
import UserHome    from './pages/user/UserHome';
import BooksPage   from './pages/user/BooksPage';
import UserProfile from './pages/user/UserProfile';
import EbookReader from './pages/reader/EbookReader';
import AudioPlayer from './pages/reader/AudioPlayer';

// Admin Pages
import AdminHome     from './pages/admin/AdminHome';
import AdminBooks    from './pages/admin/AdminBooks';
import AdminUpload   from './pages/admin/AdminUpload';
import AdminPayments from './pages/admin/AdminPayments';
import AdminUsers    from './pages/admin/AdminUsers';
import ChapterReorder from './pages/admin/ChapterReorder';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#FFFFFF',
              color: '#222222',
              border: '1px solid #EBEBEB',
              borderRadius: '12px',
              fontSize: '0.95rem',
              boxShadow: '0 6px 16px rgba(0,0,0,0.12)'
            },
            success: { iconTheme: { primary: '#00A699', secondary: '#fff' } },
            error:   { iconTheme: { primary: '#E12C32', secondary: '#fff' } },
          }}
        />

        <Routes>
          {/* Public Routes */}
          <Route path="/"         element={<LandingPage />} />
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ── User Dashboard ─────────────────── */}
          <Route path="/dashboard" element={
            <ProtectedRoute role="user">
              <DashboardLayout role="user" />
            </ProtectedRoute>
          }>
            <Route index        element={<UserHome />} />
            <Route path="ebooks"  element={<BooksPage type="ebook" />} />
            <Route path="audio"   element={<BooksPage type="audiobook" />} />
            <Route path="profile" element={<UserProfile />} />
          </Route>

          {/* ── Shared Reader Routes ─────────────────── */}
          <Route path="/reader" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route path="read/:id" element={<EbookReader />} />
            <Route path="listen/:id" element={<AudioPlayer />} />
          </Route>

          {/* ── Admin Dashboard ─────────────────── */}
          <Route path="/admin" element={
            <ProtectedRoute role="admin">
              <DashboardLayout role="admin" />
            </ProtectedRoute>
          }>
            <Route index          element={<AdminHome />} />
            <Route path="books"     element={<AdminBooks />} />
            <Route path="upload"  element={<AdminUpload />} />
            <Route path="payments" element={<AdminPayments />} />
            <Route path="users"   element={<AdminUsers />} />
            <Route path="books/reorder/:id" element={<ChapterReorder />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
