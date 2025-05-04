// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { theme } from './styles/theme';
import { Layout } from './components/common/Layout';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminPage } from './pages/AdminPage';
import { AdminSignupPage } from './pages/AdminSignupPage';
import BoardListPage from './pages/BoardListPage';
import BoardCreatePage from './pages/BoardCreatePage';
import BoardDetailPage from './pages/BoardDetailPage';
import { ChatPage } from './pages/ChatPage';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/admin/signup" element={<AdminSignupPage />} />
            <Route
              path="/profile/:userId"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly>
                  <AdminPage />
                </ProtectedRoute>
              }
            />
            <Route path="/boards" element={<BoardListPage />} />
            <Route
              path="/boards/create"
              element={
                <ProtectedRoute>
                  <BoardCreatePage />
                </ProtectedRoute>
              }
            />
            <Route path="/boards/:boardId" element={<BoardDetailPage />} />
            <Route
              path="/chat/:userId"
              element={
                <ProtectedRoute>
                  <ChatPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Layout>
      </Router>
      <ToastContainer />
    </ThemeProvider>
  );
}

export default App;