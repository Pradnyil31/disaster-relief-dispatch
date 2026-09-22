import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';
import { ROLES } from '../utils/constants';
import { LandingPage } from '../pages/public/LandingPage';
import { LoginPage } from '../pages/public/LoginPage';
import { RegisterPage } from '../pages/public/RegisterPage';
import { DonatePublicPage } from '../pages/public/DonatePublicPage';
import { CitizenDashboard } from '../pages/citizen/CitizenDashboard';
import { SubmitSOSPage } from '../pages/citizen/SubmitSOSPage';
import { MySOSHistoryPage } from '../pages/citizen/MySOSHistoryPage';
import { VolunteerDashboard } from '../pages/volunteer/VolunteerDashboard';
import { MyTasksPage } from '../pages/volunteer/MyTasksPage';
import { TaskDetailPage } from '../pages/volunteer/TaskDetailPage';
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { SOSManagementPage } from '../pages/admin/SOSManagementPage';
import { InventoryManagementPage } from '../pages/admin/InventoryManagementPage';
import { VolunteerManagementPage } from '../pages/admin/VolunteerManagementPage';
import { DispatchManagementPage } from '../pages/admin/DispatchManagementPage';
import { DonationManagementPage } from '../pages/admin/DonationManagementPage';
import { DonorDashboard } from '../pages/donor/DonorDashboard';
import { MyDonationsPage } from '../pages/donor/MyDonationsPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/donate" element={<DonatePublicPage />} />

      <Route
        path="/citizen/*"
        element={
          <ProtectedRoute allowedRoles={[ROLES.CITIZEN]}>
            <Routes>
              <Route path="" element={<CitizenDashboard />} />
              <Route path="sos/new" element={<SubmitSOSPage />} />
              <Route path="sos/history" element={<MySOSHistoryPage />} />
            </Routes>
          </ProtectedRoute>
        }
      />

      <Route
        path="/volunteer/*"
        element={
          <ProtectedRoute allowedRoles={[ROLES.VOLUNTEER]}>
            <Routes>
              <Route path="" element={<VolunteerDashboard />} />
              <Route path="tasks" element={<MyTasksPage />} />
              <Route path="tasks/:id" element={<TaskDetailPage />} />
            </Routes>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={[ROLES.ADMINISTRATOR]}>
            <Routes>
              <Route path="" element={<AdminDashboard />} />
              <Route path="sos" element={<SOSManagementPage />} />
              <Route path="inventory" element={<InventoryManagementPage />} />
              <Route path="volunteers" element={<VolunteerManagementPage />} />
              <Route path="dispatch" element={<DispatchManagementPage />} />
              <Route path="dispatch/:id" element={<TaskDetailPage />} />
              <Route path="donations" element={<DonationManagementPage />} />
            </Routes>
          </ProtectedRoute>
        }
      />

      <Route
        path="/donor/*"
        element={
          <ProtectedRoute allowedRoles={[ROLES.DONOR]}>
            <Routes>
              <Route path="" element={<DonorDashboard />} />
              <Route path="donations" element={<MyDonationsPage />} />
            </Routes>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}