import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../api/axiosConfig";

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });

  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  const [activeSection, setActiveSection] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [statsResponse, usersResponse, productsResponse, ordersResponse] =
        await Promise.all([
          api.get("/admin/stats"),
          api.get("/admin/users"),
          api.get("/admin/produce"),
          api.get("/admin/orders"),
        ]);

      setStats(statsResponse.data);
      setUsers(usersResponse.data);
      setProducts(productsResponse.data);
      setOrders(ordersResponse.data);
    } catch (error) {
      console.error("Error loading admin dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await api.delete(`/admin/users/${id}`);

      alert("User deleted successfully");

      fetchDashboardData();
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user");
    }
  };

  const deleteProduct = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await api.delete(`/admin/produce/${id}`);

      alert("Product deleted successfully");

      fetchDashboardData();
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product");
    }
  };

  return (
    <DashboardLayout>
      <div>
        {/* Page Title */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="text-gray-500 mt-1">
              Manage users, products and orders
            </p>
          </div>

          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900"
          >
            🔄 Refresh
          </button>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">

              {/* Users */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                      Total Users
                    </p>

                    <p className="text-3xl font-bold text-gray-900">
                      {stats.totalUsers}
                    </p>
                  </div>

                  <div className="bg-purple-100 p-3 rounded-full">
                    <span className="text-2xl">👥</span>
                  </div>
                </div>
              </div>

              {/* Products */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                      Total Products
                    </p>

                    <p className="text-3xl font-bold text-gray-900">
                      {stats.totalProducts}
                    </p>
                  </div>

                  <div className="bg-green-100 p-3 rounded-full">
                    <span className="text-2xl">📦</span>
                  </div>
                </div>
              </div>

              {/* Orders */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                      Total Orders
                    </p>

                    <p className="text-3xl font-bold text-gray-900">
                      {stats.totalOrders}
                    </p>
                  </div>

                  <div className="bg-blue-100 p-3 rounded-full">
                    <span className="text-2xl">🛒</span>
                  </div>
                </div>
              </div>

              {/* Revenue */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                      Total Revenue
                    </p>

                    <p className="text-3xl font-bold text-gray-900">
                      ₹{Number(stats.totalRevenue || 0).toFixed(2)}
                    </p>
                  </div>

                  <div className="bg-yellow-100 p-3 rounded-full">
                    <span className="text-2xl">💰</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Management Sections */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* Users */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  User Management
                </h2>

                <p className="text-gray-500 mb-4">
                  Manage all users in the system
                </p>

                <button
                  onClick={() =>
                    setActiveSection(
                      activeSection === "users" ? null : "users"
                    )
                  }
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  {activeSection === "users"
                    ? "Hide Users"
                    : "View Users"}
                </button>
              </div>

              {/* Products */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Product Management
                </h2>

                <p className="text-gray-500 mb-4">
                  Oversee all product listings
                </p>

                <button
                  onClick={() =>
                    setActiveSection(
                      activeSection === "products"
                        ? null
                        : "products"
                    )
                  }
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  {activeSection === "products"
                    ? "Hide Products"
                    : "View Products"}
                </button>
              </div>

              {/* Orders */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Order Management
                </h2>

                <p className="text-gray-500 mb-4">
                  Monitor all transactions
                </p>

                <button
                  onClick={() =>
                    setActiveSection(
                      activeSection === "orders"
                        ? null
                        : "orders"
                    )
                  }
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {activeSection === "orders"
                    ? "Hide Orders"
                    : "View Orders"}
                </button>
              </div>
            </div>

            {/* USERS TABLE */}
            {activeSection === "users" && (
              <div className="bg-white rounded-lg shadow mt-8 p-6">
                <h2 className="text-2xl font-bold mb-4">
                  All Users
                </h2>

                {users.length === 0 ? (
                  <p className="text-gray-500">
                    No users found.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="p-3 text-left">ID</th>
                          <th className="p-3 text-left">Name</th>
                          <th className="p-3 text-left">Email</th>
                          <th className="p-3 text-left">Phone</th>
                          <th className="p-3 text-left">Role</th>
                          <th className="p-3 text-left">Action</th>
                        </tr>
                      </thead>

                      <tbody>
                        {users.map((user) => (
                          <tr
                            key={user.id}
                            className="border-b"
                          >
                            <td className="p-3">
                              {user.id}
                            </td>

                            <td className="p-3">
                              {user.name}
                            </td>

                            <td className="p-3">
                              {user.email}
                            </td>

                            <td className="p-3">
                              {user.phone || "-"}
                            </td>

                            <td className="p-3">
                              <span className="px-3 py-1 rounded-full bg-gray-100">
                                {user.role}
                              </span>
                            </td>

                            <td className="p-3">
                              {user.role !== "ADMIN" && (
                                <button
                                  onClick={() =>
                                    deleteUser(user.id)
                                  }
                                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                                >
                                  Delete
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* PRODUCTS TABLE */}
            {activeSection === "products" && (
              <div className="bg-white rounded-lg shadow mt-8 p-6">
                <h2 className="text-2xl font-bold mb-4">
                  All Products
                </h2>

                {products.length === 0 ? (
                  <p className="text-gray-500">
                    No products found.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="p-3 text-left">
                            ID
                          </th>

                          <th className="p-3 text-left">
                            Product
                          </th>

                          <th className="p-3 text-left">
                            Category
                          </th>

                          <th className="p-3 text-left">
                            Quantity
                          </th>

                          <th className="p-3 text-left">
                            Price
                          </th>

                          <th className="p-3 text-left">
                            Farmer
                          </th>

                          <th className="p-3 text-left">
                            Available
                          </th>

                          <th className="p-3 text-left">
                            Action
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {products.map((product) => (
                          <tr
                            key={product.id}
                            className="border-b"
                          >
                            <td className="p-3">
                              {product.id}
                            </td>

                            <td className="p-3 font-medium">
                              {product.name}
                            </td>

                            <td className="p-3">
                              {product.category}
                            </td>

                            <td className="p-3">
                              {product.quantity} kg
                            </td>

                            <td className="p-3">
                              ₹{product.price}
                            </td>

                            <td className="p-3">
                              {product.farmerName}
                            </td>

                            <td className="p-3">
                              {product.available ? (
                                <span className="text-green-600 font-medium">
                                  Available
                                </span>
                              ) : (
                                <span className="text-red-600 font-medium">
                                  Not Available
                                </span>
                              )}
                            </td>

                            <td className="p-3">
                              <button
                                onClick={() =>
                                  deleteProduct(product.id)
                                }
                                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ORDERS TABLE */}
            {activeSection === "orders" && (
              <div className="bg-white rounded-lg shadow mt-8 p-6">
                <h2 className="text-2xl font-bold mb-4">
                  All Orders
                </h2>

                {orders.length === 0 ? (
                  <p className="text-gray-500">
                    No orders found.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="p-3 text-left">
                            ID
                          </th>

                          <th className="p-3 text-left">
                            Product
                          </th>

                          <th className="p-3 text-left">
                            Quantity
                          </th>

                          <th className="p-3 text-left">
                            Total Price
                          </th>

                          <th className="p-3 text-left">
                            Businessman
                          </th>

                          <th className="p-3 text-left">
                            Farmer
                          </th>

                          <th className="p-3 text-left">
                            Status
                          </th>

                          <th className="p-3 text-left">
                            Date
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {orders.map((order) => (
                          <tr
                            key={order.id}
                            className="border-b"
                          >
                            <td className="p-3">
                              {order.id}
                            </td>

                            <td className="p-3 font-medium">
                              {order.produceName}
                            </td>

                            <td className="p-3">
                              {order.quantityOrdered}
                            </td>

                            <td className="p-3">
                              ₹{order.totalPrice}
                            </td>

                            <td className="p-3">
                              {order.businessmanName}
                            </td>

                            <td className="p-3">
                              {order.farmerName}
                            </td>

                            <td className="p-3">
                              <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                                {order.status}
                              </span>
                            </td>

                            <td className="p-3">
                              {order.createdAt
                                ? new Date(
                                    order.createdAt
                                  ).toLocaleDateString()
                                : "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

export default AdminDashboard;