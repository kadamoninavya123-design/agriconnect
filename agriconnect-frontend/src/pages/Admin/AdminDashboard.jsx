import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosConfig";

function AdminDashboard() {
  const navigate = useNavigate();

  // Store dashboard statistics
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });

  // Loading state
  const [loading, setLoading] = useState(true);

  // Get statistics from backend
  const loadStats = async () => {
    try {
      setLoading(true);

      const response = await api.get("/admin/stats");

      console.log("Admin Stats:", response.data);

      setStats(response.data);
    } catch (error) {
      console.error("Error loading admin statistics:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load statistics when dashboard opens
  useEffect(() => {
    loadStats();
  }, []);

  return (
    <DashboardLayout>
      <div>
        {/* Dashboard Heading */}
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Admin Dashboard
        </h1>

        {/* ================= STATISTICS ================= */}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">

          {/* Total Users */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  Total Users
                </p>

                <p className="text-3xl font-bold text-gray-900">
                  {loading ? "..." : stats.totalUsers}
                </p>
              </div>

              <div className="bg-purple-100 p-3 rounded-full">
                <span className="text-2xl">
                  👥
                </span>
              </div>
            </div>
          </div>


          {/* Total Products */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  Total Products
                </p>

                <p className="text-3xl font-bold text-gray-900">
                  {loading ? "..." : stats.totalProducts}
                </p>
              </div>

              <div className="bg-green-100 p-3 rounded-full">
                <span className="text-2xl">
                  📦
                </span>
              </div>
            </div>
          </div>


          {/* Total Orders */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  Total Orders
                </p>

                <p className="text-3xl font-bold text-gray-900">
                  {loading ? "..." : stats.totalOrders}
                </p>
              </div>

              <div className="bg-blue-100 p-3 rounded-full">
                <span className="text-2xl">
                  🛒
                </span>
              </div>
            </div>
          </div>


          {/* Revenue */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  Revenue
                </p>

                <p className="text-3xl font-bold text-gray-900">
                  {loading
                    ? "..."
                    : `₹${Number(
                        stats.totalRevenue || 0
                      ).toLocaleString("en-IN")}`}
                </p>
              </div>

              <div className="bg-yellow-100 p-3 rounded-full">
                <span className="text-2xl">
                  💰
                </span>
              </div>
            </div>
          </div>

        </div>


        {/* ================= MANAGEMENT SECTIONS ================= */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* User Management */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              User Management
            </h2>

            <p className="text-gray-500 mb-4">
              Manage all users in the system
            </p>

            <button
              onClick={() => navigate("/admin/users")}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              View Users
            </button>
          </div>


          {/* Product Management */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Product Management
            </h2>

            <p className="text-gray-500 mb-4">
              Oversee all product listings
            </p>

            <button
              onClick={() => navigate("/admin/products")}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              View Products
            </button>
          </div>


          {/* Order Management */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Order Management
            </h2>

            <p className="text-gray-500 mb-4">
              Monitor all transactions
            </p>

            <button
              onClick={() => navigate("/admin/orders")}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Orders
            </button>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}

export default AdminDashboard;