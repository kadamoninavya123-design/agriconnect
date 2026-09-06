import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RoleBasedRoute from "./components/RoleBasedRoute";
import FarmerDashboard from "./pages/Farmer/FarmerDashboard";
import FarmerProducts from "./pages/Farmer/FarmerProducts";
import FarmerOrders from "./pages/Farmer/FarmerOrders";
import BusinessDashboard from "./pages/Business/BusinessDashboard";
import BusinessBrowseProducts from "./pages/Business/BusinessBrowseProducts";
import BusinessOrders from "./pages/Business/BusinessOrders";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Farmer Routes */}
      <Route
        path="/farmer"
        element={
          <RoleBasedRoute allowedRoles={["FARMER", "ADMIN"]}>
            <FarmerDashboard />
          </RoleBasedRoute>
        }
      />
      <Route
        path="/farmer/products"
        element={
          <RoleBasedRoute allowedRoles={["FARMER", "ADMIN"]}>
            <FarmerProducts />
          </RoleBasedRoute>
        }
      />
      <Route
        path="/farmer/orders"
        element={
          <RoleBasedRoute allowedRoles={["FARMER", "ADMIN"]}>
            <FarmerOrders />
          </RoleBasedRoute>
        }
      />

      {/* Business Routes */}
      <Route
        path="/business"
        element={
          <RoleBasedRoute allowedRoles={["BUSINESS", "ADMIN"]}>
            <BusinessDashboard />
          </RoleBasedRoute>
        }
      />
      <Route
        path="/business/browse"
        element={
          <RoleBasedRoute allowedRoles={["BUSINESS", "ADMIN"]}>
            <BusinessBrowseProducts />
          </RoleBasedRoute>
        }
      />
      <Route
        path="/business/orders"
        element={
          <RoleBasedRoute allowedRoles={["BUSINESS", "ADMIN"]}>
            <BusinessOrders />
          </RoleBasedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <RoleBasedRoute allowedRoles={["ADMIN"]}>
            <AdminDashboard />
          </RoleBasedRoute>
        }
      />
    </Routes>
  );
}

export default App;