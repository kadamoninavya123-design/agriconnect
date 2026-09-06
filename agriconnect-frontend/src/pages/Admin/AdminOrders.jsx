import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../api/axiosConfig";

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    try {
      setLoading(true);

      const response = await api.get("/admin/orders");

      setOrders(response.data);
    } catch (error) {
      console.error("Error loading orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <DashboardLayout>
      <div>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Order Management
            </h1>

            <p className="text-gray-500 mt-1">
              Monitor all orders in AgriConnect
            </p>
          </div>

          <button
            onClick={loadOrders}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            🔄 Refresh
          </button>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p>Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">
              No orders found.
            </p>
          </div>
        ) : (
          /* Orders Table */
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left">ID</th>
                  <th className="px-6 py-3 text-left">Product</th>
                  <th className="px-6 py-3 text-left">Quantity</th>
                  <th className="px-6 py-3 text-left">Total Price</th>
                  <th className="px-6 py-3 text-left">Business</th>
                  <th className="px-6 py-3 text-left">Farmer</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Order Date</th>
                  <th className="px-6 py-3 text-left">
                    Expected Delivery
                  </th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-t"
                  >
                    <td className="px-6 py-4">
                      {order.id}
                    </td>

                    <td className="px-6 py-4 font-semibold">
                      {order.produceName || "-"}
                    </td>

                    <td className="px-6 py-4">
                      {order.quantityOrdered}
                    </td>

                    <td className="px-6 py-4">
                      ₹{order.totalPrice}
                    </td>

                    <td className="px-6 py-4">
                      {order.businessmanName || "-"}
                    </td>

                    <td className="px-6 py-4">
                      {order.farmerName || "-"}
                    </td>

                    <td className="px-6 py-4">
                      {order.status}
                    </td>

                    <td className="px-6 py-4">
                      {order.createdAt
                        ? new Date(
                            order.createdAt
                          ).toLocaleString()
                        : "-"}
                    </td>

                    <td className="px-6 py-4">
                      {order.expectedDeliveryDate
                        ? new Date(
                            order.expectedDeliveryDate
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
    </DashboardLayout>
  );
}

export default AdminOrders;