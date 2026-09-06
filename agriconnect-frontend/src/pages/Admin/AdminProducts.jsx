import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../api/axiosConfig";

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = async () => {
    try {
      setLoading(true);

      const response = await api.get("/admin/produce");

      setProducts(response.data);
    } catch (error) {
      console.error("Error loading products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

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

      loadProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Unable to delete product");
    }
  };

  return (
    <DashboardLayout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Product Management
            </h1>

            <p className="text-gray-500 mt-1">
              Manage all products in AgriConnect
            </p>
          </div>

          <button
            onClick={loadProducts}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            🔄 Refresh
          </button>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p>Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">
              No products found.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left">ID</th>
                  <th className="px-6 py-3 text-left">Product</th>
                  <th className="px-6 py-3 text-left">Category</th>
                  <th className="px-6 py-3 text-left">Price</th>
                  <th className="px-6 py-3 text-left">Quantity</th>
                  <th className="px-6 py-3 text-left">Farmer</th>
                  <th className="px-6 py-3 text-left">Available</th>
                  <th className="px-6 py-3 text-left">Action</th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-t">
                    <td className="px-6 py-4">
                      {product.id}
                    </td>

                    <td className="px-6 py-4 font-semibold">
                      {product.name}
                    </td>

                    <td className="px-6 py-4">
                      {product.category || "-"}
                    </td>

                    <td className="px-6 py-4">
                      ₹{product.price}
                    </td>

                    <td className="px-6 py-4">
                      {product.quantity}
                    </td>

                    <td className="px-6 py-4">
                      {product.farmerName || "-"}
                    </td>

                    <td className="px-6 py-4">
                      {product.available ? (
                        <span className="text-green-600 font-semibold">
                          Available
                        </span>
                      ) : (
                        <span className="text-red-600 font-semibold">
                          Unavailable
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <button
                        onClick={() => deleteProduct(product.id)}
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
    </DashboardLayout>
  );
}

export default AdminProducts;