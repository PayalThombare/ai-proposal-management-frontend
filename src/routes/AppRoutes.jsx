import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import RFPUpload from "../pages/RFPUpload";
import RFPDetails from "../pages/RFPDetails";
import ProposalList from "../pages/ProposalList";
import RFPList from "../pages/RFPList";
import ProposalDetails from "../pages/ProposalDetails";

import ProtectedRoute from "./ProtectedRoute";
import MainLayout from "../layouts/MainLayout";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<Login />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
  path="/rfps"
  element={
    <ProtectedRoute>
      <MainLayout>
        <RFPList />
      </MainLayout>
    </ProtectedRoute>
  }
/>

      <Route
        path="/rfp/upload"
        element={
          <ProtectedRoute>
            <MainLayout>
              <RFPUpload />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/rfp/:id"
        element={
          <ProtectedRoute>
            <MainLayout>
              <RFPDetails />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/proposals"
        element={
          <ProtectedRoute>
            <MainLayout>
              <ProposalList />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/proposals/:id"
        element={
          <ProtectedRoute>
            <MainLayout>
              <ProposalDetails />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="*"
        element={<Navigate to="/login" replace />}
      />
    </Routes>
  );
};

export default AppRoutes;