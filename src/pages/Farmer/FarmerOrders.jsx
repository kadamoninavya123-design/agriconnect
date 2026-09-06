import { useEffect, useRef, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../api/axiosConfig";

function FarmerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] =
    useState("");
  const [updating, setUpdating] =
    useState(null);
  const [gpsError, setGpsError] =
    useState("");

  const watchIds =
    useRef({});

  const stages = [
    "PLACED",
    "CONFIRMED",
    "PREPARING",
    "READY",
    "SHIPPED",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
  ];

  useEffect(() => {
    fetchOrders();

    const interval =
      setInterval(
        fetchOrders,
        5000
      );

    return () => {
      clearInterval(interval);

      Object.values(
        watchIds.current
      ).forEach(
        (watchId) => {
          navigator.geolocation?.clearWatch(
            watchId
          );
        }
      );
    };
  }, []);

  useEffect(() => {
    orders.forEach(
      (order) => {
        if (
          order.status ===
            "OUT_FOR_DELIVERY" &&
          watchIds.current[
            order.id
          ] === undefined
        ) {
          startTracking(
            order.id
          );
        }

        if (
          order.status ===
            "DELIVERED" ||
          order.status ===
            "CANCELLED"
        ) {
          stopTracking(
            order.id
          );
        }
      }
    );
  }, [orders]);

  const fetchOrders =
    async () => {
      try {
        const response =
          await api.get(
            "/orders/for-my-produce"
          );

        setOrders(
          Array.isArray(
            response.data
          )
            ? response.data
            : []
        );

        setError("");
      } catch (err) {
        console.error(
          "Failed to load farmer orders",
          err
        );

        setError(
          "Failed to load orders."
        );
      } finally {
        setLoading(false);
      }
    };

  const updateOrderStatus =
    async (
      orderId,
      status
    ) => {
      try {
        setUpdating(
          orderId
        );
        setError("");

        await api.put(
          `/orders/${orderId}/status`,
          {
            status,
          }
        );

        await fetchOrders();
      } catch (err) {
        console.error(
          "Failed to update order status",
          err
        );

        const message =
          err.response?.data
            ?.message ||
          err.response?.data ||
          "Failed to update order status.";

        setError(
          typeof message ===
            "string"
            ? message
            : "Failed to update order status."
        );
      } finally {
        setUpdating(null);
      }
    };

  const sendLocation =
    async (
      orderId,
      position
    ) => {
      try {
        await api.put(
          `/orders/${orderId}/tracking/location`,
          {
            latitude:
              position.coords
                .latitude,
            longitude:
              position.coords
                .longitude,
          }
        );

        setGpsError("");
      } catch (err) {
        console.error(
          "Failed to send GPS location",
          err
        );

        setGpsError(
          "Unable to send your current location."
        );
      }
    };

  const startTracking =
    (orderId) => {
      if (
        !navigator.geolocation
      ) {
        setGpsError(
          "Your browser does not support GPS location."
        );

        return;
      }

      if (
        watchIds.current[
          orderId
        ] !== undefined
      ) {
        return;
      }

      setGpsError("");

      navigator.geolocation.getCurrentPosition(
        (position) => {
          sendLocation(
            orderId,
            position
          );
        },
        (err) => {
          console.error(
            "Initial GPS error:",
            err
          );
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        }
      );

      const watchId =
        navigator.geolocation.watchPosition(
          (position) => {
            sendLocation(
              orderId,
              position
            );
          },
          (gpsErrorObject) => {
            console.error(
              "GPS error:",
              gpsErrorObject
            );

            if (
              gpsErrorObject.code === 1
            ) {
              setGpsError(
                "Location permission denied. Please allow location access."
              );
            } else if (
              gpsErrorObject.code === 2
            ) {
              setGpsError(
                "Current location is unavailable."
              );
            } else if (
              gpsErrorObject.code === 3
            ) {
              setGpsError(
                "GPS timed out. Trying again..."
              );
            } else {
              setGpsError(
                "Unable to get your current location."
              );
            }
          },
          {
            enableHighAccuracy: true,
            maximumAge: 5000,
            timeout: 15000,
          }
        );

      watchIds.current[
        orderId
      ] = watchId;
    };

  const stopTracking =
    (orderId) => {
      const watchId =
        watchIds.current[
          orderId
        ];

      if (
        watchId !== undefined
      ) {
        navigator.geolocation.clearWatch(
          watchId
        );

        delete watchIds.current[
          orderId
        ];
      }
    };

  const getNextStatus =
    (status) => {
      switch (status) {
        case "PLACED":
          return "CONFIRMED";

        case "CONFIRMED":
          return "PREPARING";

        case "PREPARING":
          return "READY";

        case "READY":
          return "SHIPPED";

        case "SHIPPED":
          return "OUT_FOR_DELIVERY";

        default:
          return null;
      }
    };

  const openGoogleMaps =
    (order) => {
      if (
        order.currentLatitude ==
          null ||
        order.currentLongitude ==
          null
      ) {
        alert(
          "Your current GPS location is not available yet."
        );

        return;
      }

      if (
        order.deliveryLatitude ==
          null ||
        order.deliveryLongitude ==
          null
      ) {
        alert(
          "The delivery destination is not available."
        );

        return;
      }

      const url =
        "https://www.google.com/maps/dir/?api=1" +
        `&origin=${order.currentLatitude},${order.currentLongitude}` +
        `&destination=${order.deliveryLatitude},${order.deliveryLongitude}` +
        "&travelmode=driving";

      window.open(
        url,
        "_blank",
        "noopener,noreferrer"
      );
    };

  const formatStatus =
    (status) => {
      if (!status) {
        return "";
      }

      return status
        .replaceAll(
          "_",
          " "
        )
        .toLowerCase()
        .replace(
          /\b\w/g,
          (letter) =>
            letter.toUpperCase()
        );
    };

  const getStatusClass =
    (status) => {
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
          return "bg-gray-100 text-gray-800";
      }
    };

  const formatDateTime =
    (value) => {
      if (!value) {
        return "Not available";
      }

      return new Date(
        value
      ).toLocaleString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }
      );
    };

  return (
    <DashboardLayout>
      <div className="w-full max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Orders
            </h1>

            <p className="text-gray-500 mt-1">
              Manage orders and deliveries.
            </p>
          </div>

          <button
            type="button"
            onClick={
              fetchOrders
            }
            className="px-5 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        )}

        {gpsError && (
          <div className="mb-6 bg-orange-50 border border-orange-200 rounded-lg p-4 text-orange-700">
            {gpsError}
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-2xl shadow p-10 text-center text-gray-500">
            Loading orders...
          </div>
        ) : orders.length ===
          0 ? (
          <div className="bg-white rounded-2xl shadow p-10 text-center text-gray-500">
            No orders yet.
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(
              (order) => {
                const currentIndex =
                  stages.indexOf(
                    order.status
                  );

                const nextStatus =
                  getNextStatus(
                    order.status
                  );

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl shadow-md border border-gray-200 p-6"
                  >
                    <div className="flex flex-col lg:flex-row lg:justify-between gap-6">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                          Order #
                          {order.id}
                        </h2>

                        <p className="text-gray-600 mt-3">
                          Product:{" "}
                          <span className="font-semibold">
                            {
                              order.produceName
                            }
                          </span>
                        </p>

                        <p className="text-gray-600">
                          Businessman:{" "}
                          {
                            order.businessmanName
                          }
                        </p>

                        <p className="text-gray-600">
                          Quantity:{" "}
                          {
                            order.quantityOrdered
                          }
                        </p>

                        <p className="text-gray-600">
                          Total Price: ₹
                          {
                            order.totalPrice
                          }
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

                      <span
                        className={`self-start px-4 py-2 rounded-full text-sm font-bold ${getStatusClass(
                          order.status
                        )}`}
                      >
                        {formatStatus(
                          order.status
                        )}
                      </span>
                    </div>

                    {order.expectedDeliveryDate && (
                      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <p className="font-semibold text-blue-800">
                          📅 Expected Delivery
                        </p>

                        <p className="text-blue-700 mt-1">
                          {new Date(
                            `${order.expectedDeliveryDate}T00:00:00`
                          ).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            }
                          )}
                        </p>
                      </div>
                    )}

                    {order.status !==
                      "CANCELLED" && (
                      <div className="mt-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-5">
                          Delivery Progress
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
                          {stages.map(
                            (
                              stage,
                              index
                            ) => {
                              const completed =
                                index <=
                                currentIndex;

                              const active =
                                index ===
                                currentIndex;

                              return (
                                <div
                                  key={
                                    stage
                                  }
                                  className={`rounded-xl border p-4 text-center ${
                                    active
                                      ? "bg-green-50 border-green-400"
                                      : completed
                                      ? "bg-green-50 border-green-200"
                                      : "bg-gray-50 border-gray-200"
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
                                      : index +
                                        1}
                                  </div>

                                  <p className="text-sm font-semibold mt-3">
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
                            }
                          )}
                        </div>
                      </div>
                    )}

                    {/* GOOGLE MAPS */}

                    {order.status ===
                      "OUT_FOR_DELIVERY" && (
                      <div className="mt-8 bg-green-50 border border-green-200 rounded-2xl p-6">
                        <h3 className="text-xl font-bold text-green-800">
                          🚚 Delivery In Progress
                        </h3>

                        <p className="text-green-700 mt-2">
                          Your GPS location is being
                          shared with the businessman.
                        </p>

                        {order.currentLatitude !=
                          null &&
                          order.currentLongitude !=
                            null && (
                            <div className="mt-4 bg-white rounded-xl p-4">
                              <p className="text-sm text-gray-500">
                                Your Current GPS
                              </p>

                              <p className="font-semibold mt-1">
                                {Number(
                                  order.currentLatitude
                                ).toFixed(
                                  6
                                )}
                                ,{" "}
                                {Number(
                                  order.currentLongitude
                                ).toFixed(
                                  6
                                )}
                              </p>

                              {order.lastLocationUpdate && (
                                <p className="text-sm text-gray-500 mt-2">
                                  Last Updated:{" "}
                                  {formatDateTime(
                                    order.lastLocationUpdate
                                  )}
                                </p>
                              )}
                            </div>
                          )}

                        <button
                          type="button"
                          onClick={() =>
                            openGoogleMaps(
                              order
                            )
                          }
                          className="mt-5 px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
                        >
                          🗺️ Open Route in Google Maps
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            updateOrderStatus(
                              order.id,
                              "DELIVERED"
                            )
                          }
                          disabled={
                            updating ===
                            order.id
                          }
                          className="mt-5 ml-3 px-7 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 disabled:bg-gray-400"
                        >
                          {updating ===
                          order.id
                            ? "Updating..."
                            : "✓ Mark Delivered"}
                        </button>
                      </div>
                    )}

                    {order.status ===
                      "DELIVERED" && (
                      <div className="mt-8 bg-green-50 border border-green-200 rounded-2xl p-6">
                        <h3 className="text-xl font-bold text-green-800">
                          ✓ Delivery Completed
                        </h3>

                        <p className="text-green-700 mt-2">
                          You successfully delivered this
                          order.
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
                    )}

                    {nextStatus && (
                      <div className="mt-6">
                        <button
                          type="button"
                          onClick={() =>
                            updateOrderStatus(
                              order.id,
                              nextStatus
                            )
                          }
                          disabled={
                            updating ===
                            order.id
                          }
                          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
                        >
                          {updating ===
                          order.id
                            ? "Updating..."
                            : `Mark ${formatStatus(
                                nextStatus
                              )}`}
                        </button>

                        {order.status ===
                          "PLACED" && (
                          <button
                            type="button"
                            onClick={() =>
                              updateOrderStatus(
                                order.id,
                                "CANCELLED"
                              )
                            }
                            disabled={
                              updating ===
                              order.id
                            }
                            className="ml-3 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-400"
                          >
                            Cancel Order
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              }
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default FarmerOrders;