import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './shared/context/AuthContext';
import ProtectedRoute from './shared/components/ProtectedRoute';
import RoleRoute from './shared/components/RoleRoute';

// Portal Layouts
import ClientLayout from './client/layout/ClientLayout';
const JudgeLayout = lazy(() => import('./judge/layout/JudgeLayout'));
const VolunteerLayout = lazy(() => import('./volunteer/layout/VolunteerLayout'));
const AdminLayout = lazy(() => import('./admin/layout/AdminLayout'));

// Client Root & Candidate Pages
const Home = lazy(() => import('./client/pages/Home'));
const ProblemStatements = lazy(() => import('./client/pages/ProblemStatements'));
const Leaderboard = lazy(() => import('./client/pages/Leaderboard'));
const Contact = lazy(() => import('./client/pages/Contact'));
const Login = lazy(() => import('./client/pages/Login'));
const Signup = lazy(() => import('./client/pages/Signup'));
const VerifyOtp = lazy(() => import('./client/pages/VerifyOtp'));
const TeamInviteAcceptance = lazy(() => import('./client/pages/TeamInviteAcceptance'));
const Dashboard = lazy(() => import('./client/pages/Dashboard'));
const HackathonRegister = lazy(() => import('./client/pages/HackathonRegister'));

// Judge Portal Pages
const JudgeQueuePage = lazy(() => import('./judge/pages/JudgeQueuePage'));
const JudgeHistoryPage = lazy(() => import('./judge/pages/JudgeHistoryPage'));
const JudgeSecurityPage = lazy(() => import('./judge/pages/JudgeSecurityPage'));

// Volunteer Portal & QR Verification Pages
const GateScannerPage = lazy(() => import('./volunteer/pages/GateScannerPage'));
const VolunteerSecurityPage = lazy(() => import('./volunteer/pages/VolunteerSecurityPage'));

// Admin Governance Console Pages
const AdminSubmissionsPage = lazy(() => import('./admin/pages/AdminSubmissionsPage'));
const AdminProblemsPage = lazy(() => import('./admin/pages/AdminProblemsPage'));
const AdminStaffRolesPage = lazy(() => import('./admin/pages/AdminStaffRolesPage'));
const AdminAuditLogsPage = lazy(() => import('./admin/pages/AdminAuditLogsPage'));

const PageLoader = () => (
  <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6">
    <div className="w-10 h-10 rounded-full border-2 border-sky-500/20 border-t-sky-400 animate-spin" />
    <p className="mt-4 text-xs font-mono uppercase tracking-widest text-slate-400">
      Loading Workspace...
    </p>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* 1. CLIENT ROOT: Public Website & Candidate Portal */}
            <Route element={<ClientLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/problems" element={<ProblemStatements />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/verify-otp" element={<VerifyOtp />} />
              <Route path="/team-invite" element={<TeamInviteAcceptance />} />

              {/* Public/Badge QR Scan Verification Route (preserves printed Lanyard QR URLs) */}
              <Route path="/verify-pass" element={<GateScannerPage />} />

              {/* Candidate Authenticated Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/register-hackathon"
                element={
                  <ProtectedRoute>
                    <HackathonRegister />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* 2. JUDGE PORTAL: Evaluation Workspace */}
            <Route
              path="/judge"
              element={
                <RoleRoute allowedRoles={['evaluator', 'admin']} portalName="Judge Evaluation Portal">
                  <JudgeLayout />
                </RoleRoute>
              }
            >
              <Route index element={<JudgeQueuePage />} />
              <Route path="completed" element={<JudgeHistoryPage />} />
              <Route
                path="security"
                element={
                  <RoleRoute
                    allowedRoles={['evaluator']}
                    disallowRoles={['admin']}
                    redirectOnDisallowed="/judge"
                    portalName="Evaluator Security Settings"
                  >
                    <JudgeSecurityPage />
                  </RoleRoute>
                }
              />
            </Route>

            {/* 3. VOLUNTEER PORTAL: Gate Check-In & QR Scanner */}
            <Route
              path="/volunteer"
              element={
                <RoleRoute allowedRoles={['volunteer', 'admin']} portalName="Gate Volunteer Portal">
                  <VolunteerLayout />
                </RoleRoute>
              }
            >
              <Route index element={<GateScannerPage />} />
              <Route
                path="security"
                element={
                  <RoleRoute
                    allowedRoles={['volunteer']}
                    disallowRoles={['admin']}
                    redirectOnDisallowed="/volunteer"
                    portalName="Volunteer Security Settings"
                  >
                    <VolunteerSecurityPage />
                  </RoleRoute>
                }
              />
            </Route>

            {/* 4. ADMIN CONSOLE: Event Governance & RBAC */}
            <Route
              path="/admin"
              element={
                <RoleRoute allowedRoles={['admin']} portalName="Admin Governance Console">
                  <AdminLayout />
                </RoleRoute>
              }
            >
              <Route index element={<AdminSubmissionsPage />} />
              <Route path="problems" element={<AdminProblemsPage />} />
              <Route path="roles" element={<AdminStaffRolesPage />} />
              <Route path="logs" element={<AdminAuditLogsPage />} />
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;
