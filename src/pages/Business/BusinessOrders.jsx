import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../api/axiosConfig";

function BusinessOrders() {
  const [orders, setOrders] = useState([]);
  const [tracking, setTracking] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(null);

  // Cancel order confirmation
  const [cancelOrder, setCancelOrder] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState("");

  useEffect(() => {
    fetchOrders();

    const interval = setInterval(() => {
      fetchOrders();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders/my-orders");
      const data = res.data || [];

      setOrders(data);
      setLoading(false);

      data.forEach((order) => {
        if (
          order.status === "SHIPPED" ||
          order.status === "OUT_FOR_DELIVERY"
        ) {
          fetchTracking(order.id);
        }
      });
    } catch (err) {
      console.error("Failed to load orders", err);
      setError("Failed to load orders.");
      setLoading(false);
    }
  };

  const fetchTracking = async (orderId) => {
    try {
      const res = await api.get(
        `/orders/${orderId}/tracking`
      );

      setTracking((prev) => ({
        ...prev,
        [orderId]: res.data,
      }));
    } catch (err) {
      console.error(
        "Failed to load tracking for order:",
        orderId,
        err
      );
    }
  };

  const confirmDelivery = async (orderId) => {
    const confirmed = window.confirm(
      "Have you received this order?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setUpdating(orderId);
      setError("");

      await api.put(`/orders/${orderId}/status`, {
        status: "DELIVERED",
      });

      await fetchOrders();
      await fetchTracking(orderId);
    } catch (err) {
      console.error(
        "Failed to confirm delivery",
        err
      );

      const message =
        err.response?.data?.message ||
        err.response?.data ||
        "Failed to confirm delivery.";

      setError(
        typeof message === "string"
          ? message
          : "Failed to confirm delivery."
      );
    } finally {
      setUpdating(null);
    }
  };

  // =========================================================
  // CANCEL ORDER
  // =========================================================

  const openCancelConfirmation = (order) => {
    setCancelOrder(order);
    setCancelError("");
  };

  const closeCancelConfirmation = () => {
    if (cancelLoading) return;

    setCancelOrder(null);
    setCancelError("");
  };

  const confirmCancelOrder = async () => {
    if (!cancelOrder) return;

    try {
      setCancelLoading(true);
      setCancelError("");

      await api.put(`/orders/${cancelOrder.id}/status`, {
        status: "CANCELLED",
      });

      setCancelOrder(null);

      await fetchOrders();
    } catch (err) {
      console.error("Failed to cancel order", err);

      const message =
        err.response?.data?.message ||
        err.response?.data ||
        "Failed to cancel order.";

      setCancelError(
        typeof message === "string"
          ? message
          : "Failed to cancel order."
      );
    } finally {
      setCancelLoading(false);
    }
  };

  const stages = [
    "PLACED",
    "CONFIRMED",
    "PREPARING",
    "READY",
    "SHIPPED",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
  ];

  const formatStatus = (status) => {
    if (!status) return "";

    return status
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const formatDate = (date) => {
    if (!date) {
      return "Not available";
    }

    return new Date(`${date}T00:00:00`).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    );
  };

  const formatDateTime = (date) => {
    if (!date) {
      return "Not available";
    }

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "PLACED":
        return "bg-yellow-100 text-yellow-800";

      case "CONFIRMED":
        return "bg-blue-100 text-blue-800";

      case "PREPARING":
        return "bg-purple-100 text-purple-800";

      case "READY":
        return "bg-indigo-100 text-indigo-800";

      case "SHIPPED":
        return "bg-orange-100 text-orange-800";

      case "OUT_FOR_DELIVERY":
        return "bg-pink-100 text-pink-800";

      case "DELIVERED":
        return "bg-green-100 text-green-800";

      case "CANCELLED":
        return "bg-red-100 text-red-800";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <DashboardLayout>
      <div
        style={{
          width: "100%",
          maxWidth: "none",
          margin: 0,
          padding: 0,
          boxSizing: "border-box",
        }}
      >
        {/* PAGE HEADER */}

        <div
          style={{
            width: "100%",
            marginBottom: "28px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              My Orders
            </h1>

            <p className="text-gray-500 mt-2">
              Track your orders and delivery status.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchOrders}
            className="px-5 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Refresh
          </button>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
            {error}
          </div>
        )}

        {/* LOADING */}

        {loading ? (
          <div
            style={{
              width: "100%",
              background: "#ffffff",
              borderRadius: "16px",
              padding: "40px",
              textAlign: "center",
              boxSizing: "border-box",
            }}
          >
            <p className="text-gray-500">
              Loading orders...
            </p>
          </div>
        ) : orders.length === 0 ? (
          <div
            style={{
              width: "100%",
              background: "#ffffff",
              borderRadius: "16px",
              padding: "40px",
              textAlign: "center",
              boxSizing: "border-box",
            }}
          >
            <p className="text-gray-500">
              No orders yet.
            </p>
          </div>
        ) : (
          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: "24px",
              boxSizing: "border-box",
            }}
          >
            {orders.map((order) => {
              const currentIndex = stages.indexOf(
                order.status
              );

              const live = tracking[order.id];

              const canCancel =
                order.status === "PLACED";

              return (
                <div
                  key={order.id}
                  style={{
                    width: "100%",
                    background: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "18px",
                    padding: "28px",
                    boxShadow:
                      "0 4px 12px rgba(0,0,0,0.06)",
                    boxSizing: "border-box",
                  }}
                >
                  {/* ORDER TOP */}

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr",
                      gap: "28px",
                      alignItems: "start",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          gap: "20px",
                          flexWrap: "wrap",
                        }}
                      >
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900">
                            Order #{order.id}
                          </h2>

                          <p className="text-gray-600 mt-3">
                            Product:{" "}
                            <span className="font-semibold text-gray-900">
                              {order.produceName ||
                                "Produce"}
                            </span>
                          </p>

                          <p className="text-gray-600 mt-1">
                            Quantity:{" "}
                            {order.quantityOrdered}
                          </p>

                          <p className="text-gray-600 mt-1">
                            Total Price:{" "}
                            <span className="font-semibold">
                              ₹{order.totalPrice}
                            </span>
                          </p>

                          <p className="text-gray-600 mt-1">
                            Farmer:{" "}
                            <span className="font-semibold">
                              {order.farmerName ||
                                "Farmer"}
                            </span>
                          </p>

                          {order.createdAt && (
                            <p className="text-sm text-gray-500 mt-3">
                              Ordered:{" "}
                              {formatDateTime(
                                order.createdAt
                              )}
                            </p>
                          )}
                        </div>

                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-end",
                            gap: "10px",
                          }}
                        >
                          <span
                            className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap ${getStatusClass(
                              order.status
                            )}`}
                          >
                            {formatStatus(
                              order.status
                            )}
                          </span>

                          {canCancel && (
                            <button
                              type="button"
                              onClick={() =>
                                openCancelConfirmation(
                                  order
                                )
                              }
                              className="px-4 py-2 rounded-lg text-sm font-bold text-red-700 bg-red-50 border border-red-200 hover:bg-red-100 whitespace-nowrap"
                            >
                              Cancel Order
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* DELIVERY TRACKING */}

                  {order.status !== "CANCELLED" && (
                    <div className="mt-8 pt-7 border-t border-gray-200">
                      <h3 className="text-xl font-bold text-gray-900 mb-5">
                        Delivery Tracking
                      </h3>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(7, minmax(100px, 1fr))",
                          gap: "12px",
                          overflowX: "auto",
                        }}
                      >
                        {stages.map((stage, index) => {
                          const completed =
                            index <= currentIndex;

                          const active =
                            index === currentIndex;

                          return (
                            <div
                              key={stage}
                              className={`rounded-xl border p-4 text-center ${
                                active
                                  ? "border-green-400 bg-green-50"
                                  : completed
                                  ? "border-green-200 bg-green-50"
                                  : "border-gray-200 bg-gray-50"
                              }`}
                            >
                              <div
                                className={`mx-auto w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                                  completed
                                    ? "bg-green-500 text-white"
                                    : "bg-gray-300 text-gray-600"
                                }`}
                              >
                                {completed
                                  ? "✓"
                                  : index + 1}
                              </div>

                              <p
                                className={`mt-3 text-sm font-semibold ${
                                  completed
                                    ? "text-green-700"
                                    : "text-gray-500"
                                }`}
                              >
                                {formatStatus(
                                  stage
                                )}
                              </p>

                              {active && (
                                <p className="text-xs text-green-600 mt-1">
                                  Current
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* LIVE TRACKING */}

                  {(order.status === "SHIPPED" ||
                    order.status ===
                      "OUT_FOR_DELIVERY") && (
                    <div className="mt-8 pt-7 border-t border-gray-200">
                      <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
                        <h3 className="text-xl font-bold text-green-800">
                          📍 Live Delivery Tracking
                        </h3>

                        {live?.currentLatitude != null &&
                        live?.currentLongitude != null ? (
                          <>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
                              <div className="bg-white rounded-xl p-4 border">
                                <p className="text-sm text-gray-500">
                                  Farmer Location
                                </p>

                                <p className="font-semibold mt-2">
                                  {live.currentLatitude.toFixed(
                                    6
                                  )}
                                  ,{" "}
                                  {live.currentLongitude.toFixed(
                                    6
                                  )}
                                </p>
                              </div>

                              <div className="bg-white rounded-xl p-4 border">
                                <p className="text-sm text-gray-500">
                                  Last Updated
                                </p>

                                <p className="font-semibold mt-2">
                                  {formatDateTime(
                                    live.lastLocationUpdate
                                  )}
                                </p>
                              </div>

                              <div className="flex items-center">
                                <a
                                  href={`https://www.google.com/maps?q=${live.currentLatitude},${live.currentLongitude}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-full text-center px-5 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
                                >
                                  🗺️ View Location
                                </a>
                              </div>
                            </div>
                          </>
                        ) : (
                          <p className="text-gray-600 mt-3">
                            Waiting for the farmer to
                            start GPS tracking...
                          </p>
                        )}

                        {live?.shippedAt && (
                          <p className="text-sm text-gray-600 mt-4">
                            Shipped:{" "}
                            {formatDateTime(
                              live.shippedAt
                            )}
                          </p>
                        )}

                        {live?.outForDeliveryAt && (
                          <p className="text-sm text-gray-600 mt-1">
                            Out for Delivery:{" "}
                            {formatDateTime(
                              live.outForDeliveryAt
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* CONFIRM DELIVERY */}

                  {order.status ===
                    "OUT_FOR_DELIVERY" && (
                    <div className="mt-8 pt-7 border-t border-gray-200">
                      <div className="bg-pink-50 border border-pink-200 rounded-2xl p-6">
                        <h3 className="text-xl font-bold text-pink-800">
                          🚚 Your order is out for
                          delivery
                        </h3>

                        <p className="text-pink-700 mt-2">
                          Confirm the delivery after
                          receiving the produce.
                        </p>

                        <button
                          type="button"
                          onClick={() =>
                            confirmDelivery(
                              order.id
                            )
                          }
                          disabled={
                            updating === order.id
                          }
                          className="mt-5 px-7 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                        >
                          {updating === order.id
                            ? "Confirming..."
                            : "✓ Confirm Delivery"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* DELIVERED */}

                  {order.status === "DELIVERED" && (
                    <div className="mt-8 pt-7 border-t border-gray-200">
                      <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
                        <h3 className="text-xl font-bold text-green-800">
                          ✓ Delivery Completed
                        </h3>

                        <p className="text-green-700 mt-2">
                          You have successfully
                          received this order.
                        </p>

                        {order.deliveredAt && (
                          <p className="text-sm text-gray-600 mt-3">
                            Delivered At:{" "}
                            {formatDateTime(
                              order.deliveredAt
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* CANCELLED */}

                  {order.status === "CANCELLED" && (
                    <div className="mt-8 bg-red-50 border border-red-200 rounded-2xl p-6">
                      <h3 className="font-bold text-red-800">
                        Order Cancelled
                      </h3>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* =================================================
            CANCEL ORDER MODAL
        ================================================= */}

        {cancelOrder && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-order-title"
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
              background: "rgba(25,31,20,0.55)",
              backdropFilter: "blur(5px)",
            }}
          >
            <div
              style={{
                position: "relative",
                width: "min(100%, 440px)",
                padding: "29px",
                border: "1px solid #e5e8e1",
                borderRadius: "23px",
                background: "white",
                boxShadow: "0 30px 80px rgba(0,0,0,0.2)",
              }}
            >
              <button
                type="button"
                onClick={closeCancelConfirmation}
                disabled={cancelLoading}
                aria-label="Close"
                style={{
                  position: "absolute",
                  top: "15px",
                  right: "15px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "31px",
                  height: "31px",
                  border: "none",
                  borderRadius: "9px",
                  background: "#f4f5f2",
                  color: "#737b70",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "48px",
                  height: "48px",
                  marginBottom: "15px",
                  borderRadius: "14px",
                  background: "#fff0f0",
                  color: "#b34a4a",
                  fontSize: "22px",
                }}
              >
                ⚠️
              </div>

              <span
                style={{
                  color: "#a04b4b",
                  fontSize: "9px",
                  fontWeight: 900,
                  letterSpacing: "0.14em",
                }}
              >
                CANCEL ORDER
              </span>

              <h2
                id="cancel-order-title"
                style={{
                  margin: "6px 0 8px",
                  color: "#313b2c",
                  fontSize: "23px",
                  fontWeight: 900,
                }}
              >
                Cancel this order?
              </h2>

              <p
                style={{
                  margin: 0,
                  color: "#7e877b",
                  fontSize: "11px",
                  lineHeight: 1.7,
                }}
              >
                You're about to cancel{" "}
                <strong style={{ color: "#3d4937" }}>
                  Order #{cancelOrder.id}
                </strong>{" "}
                for{" "}
                <strong style={{ color: "#3d4937" }}>
                  {cancelOrder.produceName || "this produce"}
                </strong>
                . The farmer will be notified and the
                quantity will be returned to their stock.
              </p>

              {cancelError && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginTop: "16px",
                    padding: "11px 12px",
                    border: "1px solid #f0dddd",
                    borderRadius: "11px",
                    background: "#fff7f7",
                    color: "#a35a5a",
                    fontSize: "10px",
                    fontWeight: 700,
                  }}
                >
                  {cancelError}
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginTop: "18px",
                  padding: "11px 12px",
                  border: "1px solid #f0dddd",
                  borderRadius: "11px",
                  background: "#fff7f7",
                  color: "#a35a5a",
                  fontSize: "10px",
                  fontWeight: 700,
                }}
              >
                This action cannot be undone.
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "9px",
                  marginTop: "22px",
                }}
              >
                <button
                  type="button"
                  onClick={closeCancelConfirmation}
                  disabled={cancelLoading}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "7px",
                    minHeight: "41px",
                    padding: "9px 14px",
                    borderRadius: "11px",
                    border: "1px solid #dce2d7",
                    background: "white",
                    color: "#687264",
                    fontSize: "10px",
                    fontWeight: 900,
                    cursor: "pointer",
                  }}
                >
                  Keep Order
                </button>

                <button
                  type="button"
                  onClick={confirmCancelOrder}
                  disabled={cancelLoading}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "7px",
                    minHeight: "41px",
                    padding: "9px 14px",
                    borderRadius: "11px",
                    border: "none",
                    background: "#b34a4a",
                    color: "white",
                    fontSize: "10px",
                    fontWeight: 900,
                    boxShadow: "0 7px 17px rgba(179,74,74,0.17)",
                    cursor: "pointer",
                  }}
                >
                  {cancelLoading
                    ? "Cancelling..."
                    : "Cancel Order"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default BusinessOrders;
