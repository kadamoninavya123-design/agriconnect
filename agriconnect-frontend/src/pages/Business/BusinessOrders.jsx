import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../api/axiosConfig";

function BusinessOrders() {

  const [orders, setOrders] = useState([]);
  const [tracking, setTracking] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(null);

  // =========================================================
  // OFFER STATES
  // =========================================================

  const [offerOrder, setOfferOrder] = useState(null);
  const [offerPrice, setOfferPrice] = useState("");
  const [offerQuantity, setOfferQuantity] = useState("");
  const [offerMessage, setOfferMessage] = useState("");
  const [offerLoading, setOfferLoading] = useState(false);
  const [offerError, setOfferError] = useState("");

  // =========================================================
  // CANCEL STATES
  // =========================================================

  const [cancelOrder, setCancelOrder] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState("");

  // =========================================================
  // PAYMENT STATES
  // =========================================================

  const [paymentOrder, setPaymentOrder] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // =========================================================
  // LOAD ORDERS
  // =========================================================

  useEffect(() => {

    fetchOrders();

    const interval = setInterval(() => {
      fetchOrders();
    }, 5000);

    return () => clearInterval(interval);

  }, []);

  // =========================================================
  // NORMALIZE STATUS
  // =========================================================

  const normalizeStatus = (status) => {

    if (!status) {
      return "";
    }

    return String(status)
      .trim()
      .toUpperCase()
      .replace(/[\s-]+/g, "_");
  };

  // =========================================================
  // NORMALIZE PAYMENT STATUS
  // =========================================================

  const normalizePaymentStatus = (status) => {

    if (!status) {
      return "";
    }

    return String(status)
      .trim()
      .toUpperCase()
      .replace(/[\s-]+/g, "_");
  };

  // =========================================================
  // NORMALIZE PAYMENT METHOD
  // =========================================================

  const normalizePaymentMethod = (method) => {

    if (!method) {
      return "";
    }

    return String(method)
      .trim()
      .toUpperCase()
      .replace(/[\s-]+/g, "_");
  };

  // =========================================================
  // FETCH ORDERS
  // =========================================================

  const fetchOrders = async () => {

    try {

      const res =
        await api.get("/orders/my-orders");

      const data =
        Array.isArray(res.data)
          ? res.data
          : [];

      setOrders(data);
      setLoading(false);

      data.forEach((order) => {

        const status =
          normalizeStatus(order.status);

        if (
          status === "SHIPPED" ||
          status === "OUT_FOR_DELIVERY"
        ) {

          fetchTracking(order.id);
        }

      });

    } catch (err) {

      console.error(
        "Failed to load orders:",
        err
      );

      setError(
        err.response?.data?.message ||
        "Failed to load orders."
      );

      setLoading(false);
    }
  };

  // =========================================================
  // FETCH TRACKING
  // =========================================================

  const fetchTracking = async (orderId) => {

    try {

      const res =
        await api.get(
          "/orders/" +
          orderId +
          "/tracking"
        );

      setTracking((prev) => ({
        ...prev,
        [orderId]: res.data,
      }));

    } catch (err) {

      console.error(
        "Failed to load tracking:",
        orderId,
        err
      );
    }
  };

  // =========================================================
  // REFRESH
  // =========================================================

  const handleRefresh = async () => {

    try {

      setRefreshing(true);
      setError("");

      await fetchOrders();

    } finally {

      setRefreshing(false);
    }
  };

  // =========================================================
  // PAYMENT
  // =========================================================

  const openPaymentModal = (order) => {

    setPaymentOrder(order);
    setPaymentError("");

    setPaymentSuccess(
      normalizePaymentStatus(
        order.paymentStatus
      ) === "SUCCESS"
    );
  };

  // =========================================================
  // CLOSE PAYMENT MODAL
  // =========================================================

  const closePaymentModal = () => {

    if (paymentLoading) {
      return;
    }

    setPaymentOrder(null);
    setPaymentError("");
    setPaymentSuccess(false);
  };

  // =========================================================
  // HANDLE PAYMENT
  // =========================================================

  const handlePayment = async () => {

    if (!paymentOrder) {
      return;
    }

    try {

      setPaymentLoading(true);
      setPaymentError("");

      // =====================================================
      // PAY ONLY THIS ORDER
      // =====================================================

      const res =
        await api.post(
          "/payments/" +
          paymentOrder.id +
          "/pay"
        );

      const paidOrder = res.data;

      // =====================================================
      // CHECK RESPONSE
      // =====================================================

      const returnedPaymentStatus =
        normalizePaymentStatus(
          paidOrder?.paymentStatus
        );

      if (
        returnedPaymentStatus !== "SUCCESS"
      ) {

        setPaymentError(
          "Payment was not completed."
        );

        return;
      }

      // =====================================================
      // SHOW SUCCESS FOR THIS ORDER ONLY
      // =====================================================

      setPaymentSuccess(true);

      setPaymentOrder((previous) => ({
        ...previous,
        ...paidOrder,
      }));

      // =====================================================
      // REFRESH ORDERS
      // =====================================================

      await fetchOrders();

    } catch (err) {

      console.error(
        "Payment failed:",
        err
      );

      const message =
        err.response?.data?.message ||
        err.response?.data ||
        "Payment failed.";

      setPaymentError(
        typeof message === "string"
          ? message
          : "Payment failed."
      );

    } finally {

      setPaymentLoading(false);
    }
  };

  // =========================================================
  // MAKE OFFER
  // =========================================================

  const openOfferModal = (order) => {

    setOfferOrder(order);

    setOfferPrice("");

    setOfferQuantity(
      order.quantityOrdered || ""
    );

    setOfferMessage("");

    setOfferError("");
  };

  // =========================================================
  // CLOSE OFFER MODAL
  // =========================================================

  const closeOfferModal = () => {

    if (offerLoading) {
      return;
    }

    setOfferOrder(null);
    setOfferPrice("");
    setOfferQuantity("");
    setOfferMessage("");
    setOfferError("");
  };

  // =========================================================
  // SUBMIT OFFER
  // =========================================================

  const submitOffer = async () => {

    if (!offerOrder) {
      return;
    }

    const price =
      Number(offerPrice);

    const quantity =
      Number(offerQuantity);

    if (!price || price <= 0) {

      setOfferError(
        "Please enter a valid offer price."
      );

      return;
    }

    if (!quantity || quantity <= 0) {

      setOfferError(
        "Please enter a valid quantity."
      );

      return;
    }

    if (
      offerOrder.quantityOrdered &&
      quantity >
        Number(
          offerOrder.quantityOrdered
        )
    ) {

      setOfferError(
        "Offer quantity cannot be greater than the ordered quantity."
      );

      return;
    }

    try {

      setOfferLoading(true);
      setOfferError("");

      await api.post(
        "/offers",
        {
          orderId: offerOrder.id,
          offeredPrice: price,
          quantity: quantity,
          message: offerMessage,
        }
      );

      closeOfferModal();

      await fetchOrders();

    } catch (err) {

      console.error(
        "Failed to make offer:",
        err
      );

      const message =
        err.response?.data?.message ||
        err.response?.data ||
        "Failed to make offer.";

      setOfferError(
        typeof message === "string"
          ? message
          : "Failed to make offer."
      );

    } finally {

      setOfferLoading(false);
    }
  };

  // =========================================================
  // CANCEL ORDER
  // =========================================================

  const openCancelModal = (order) => {

    setCancelOrder(order);
    setCancelError("");
  };

  // =========================================================
  // CLOSE CANCEL MODAL
  // =========================================================

  const closeCancelModal = () => {

    if (cancelLoading) {
      return;
    }

    setCancelOrder(null);
    setCancelError("");
  };

  // =========================================================
  // CONFIRM CANCEL
  // =========================================================

  const confirmCancelOrder = async () => {

    if (!cancelOrder) {
      return;
    }

    try {

      setCancelLoading(true);
      setCancelError("");

      await api.put(
        "/orders/" +
        cancelOrder.id +
        "/status",
        {
          status: "CANCELLED",
        }
      );

      setCancelOrder(null);

      await fetchOrders();

    } catch (err) {

      console.error(
        "Failed to cancel order:",
        err
      );

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

  // =========================================================
  // CONFIRM DELIVERY
  // =========================================================

  const confirmDelivery = async (orderId) => {

    const confirmed =
      window.confirm(
        "Have you received this order?"
      );

    if (!confirmed) {
      return;
    }

    try {

      setUpdating(orderId);
      setError("");

      await api.put(
        "/orders/" +
        orderId +
        "/status",
        {
          status: "DELIVERED",
        }
      );

      await fetchOrders();

      await fetchTracking(orderId);

    } catch (err) {

      console.error(
        "Failed to confirm delivery:",
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
  // DELIVERY STAGES
  // =========================================================

  const stages = [
    "PLACED",
    "CONFIRMED",
    "PREPARING",
    "READY",
    "SHIPPED",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
  ];

  const stageLabels = {

    PLACED: "Placed",

    CONFIRMED: "Confirmed",

    PREPARING: "Preparing",

    READY: "Ready",

    SHIPPED: "Shipped",

    OUT_FOR_DELIVERY:
      "Out for Delivery",

    DELIVERED: "Delivered",
  };

  // =========================================================
  // FORMAT STATUS
  // =========================================================

  const formatStatus = (status) => {

    const normalized =
      normalizeStatus(status);

    if (stageLabels[normalized]) {

      return stageLabels[
        normalized
      ];
    }

    return normalized
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(
        /\b\w/g,
        (c) =>
          c.toUpperCase()
      );
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (date) => {

    if (!date) {
      return "Not available";
    }

    const parsedDate =
      new Date(
        String(date).includes("T")
          ? date
          : String(date) +
            "T00:00:00"
      );

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {

      return "Not available";
    }

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    );
  };

  // =========================================================
  // FORMAT DATE TIME
  // =========================================================

  const formatDateTime = (date) => {

    if (!date) {
      return "Not available";
    }

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {

      return "Not available";
    }

    return parsedDate.toLocaleString(
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

  // =========================================================
  // STATUS COLOR
  // =========================================================

  const getStatusClass = (status) => {

    switch (
      normalizeStatus(status)
    ) {

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

  // =========================================================
  // PAYMENT DISPLAY
  // =========================================================

  const getPaymentDisplay = (order) => {

    const paymentStatus =
      normalizePaymentStatus(
        order.paymentStatus
      );

    const paymentMethod =
      normalizePaymentMethod(
        order.paymentMethod
      );

    // =====================================================
    // SUCCESS = ACTUALLY PAID
    // =====================================================

    if (
      paymentStatus === "SUCCESS"
    ) {

      return {
        text: "✓ Paid",
        className:
          "text-green-700 bg-green-50 border-green-200",
      };
    }

    // =====================================================
    // COD = NOT ONLINE PAID
    // =====================================================

    if (
      paymentStatus === "COD" ||
      paymentMethod ===
        "CASH_ON_DELIVERY"
    ) {

      return {
        text: "✓ Payment on Delivery",
        className:
          "text-orange-700 bg-orange-50 border-orange-200",
      };
    }

    // =====================================================
    // PENDING
    // =====================================================

    if (
      paymentStatus === "PENDING"
    ) {

      return {
        text: "Payment Pending",
        className:
          "text-yellow-700 bg-yellow-50 border-yellow-200",
      };
    }

    // =====================================================
    // FAILED
    // =====================================================

    if (
      paymentStatus === "FAILED"
    ) {

      return {
        text: "Payment Failed",
        className:
          "text-red-700 bg-red-50 border-red-200",
      };
    }

    // =====================================================
    // DEFAULT
    // =====================================================

    return {
      text: "Payment Pending",
      className:
        "text-yellow-700 bg-yellow-50 border-yellow-200",
    };
  };

  // =========================================================
  // RENDER
  // =========================================================

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

        {/* =================================================
            PAGE HEADER
        ================================================= */}

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
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-5 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            {refreshing
              ? "Refreshing..."
              : "↻ Refresh"}
          </button>

        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (

          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
            {error}
          </div>

        )}

        {/* =================================================
            LOADING
        ================================================= */}

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

            {/* =================================================
                ORDERS
            ================================================= */}

            {orders.map((order) => {

              const normalizedStatus =
                normalizeStatus(
                  order.status
                );

              const paymentStatus =
                normalizePaymentStatus(
                  order.paymentStatus
                );

              const paymentMethod =
                normalizePaymentMethod(
                  order.paymentMethod
                );

              const currentIndex =
                stages.indexOf(
                  normalizedStatus
                );

              const live =
                tracking[order.id];

              // =================================================
              // IMPORTANT PAYMENT RULES
              // =================================================

              const isPaid =
                paymentStatus ===
                "SUCCESS";

              const isCOD =
                paymentStatus === "COD" ||
                paymentMethod ===
                  "CASH_ON_DELIVERY";

              const isPaymentPending =
                paymentStatus ===
                "PENDING";

              // =================================================
              // OFFER RULE
              // =================================================

              const canMakeOffer =
                normalizedStatus ===
                  "PLACED" &&
                !isPaid &&
                !isCOD;

              // =================================================
              // CANCEL RULE
              // =================================================

              const canCancel =
                normalizedStatus ===
                "PLACED";

              // =================================================
              // PAY RULE
              // =================================================

              const canPay =
                normalizedStatus !==
                  "CANCELLED" &&
                normalizedStatus !==
                  "DELIVERED" &&
                !isPaid &&
                !isCOD;

              const paymentDisplay =
                getPaymentDisplay(order);

              return (

                <div
                  key={order.id}
                  style={{
                    width: "100%",
                    background: "#ffffff",
                    border:
                      "1px solid #e5e7eb",
                    borderRadius: "18px",
                    padding: "28px",
                    boxShadow:
                      "0 4px 12px rgba(0,0,0,0.06)",
                    boxSizing: "border-box",
                  }}
                >

                  {/* =================================================
                      ORDER INFORMATION
                  ================================================= */}

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "1fr",
                      gap: "28px",
                      alignItems:
                        "start",
                    }}
                  >

                    <div>

                      <div
                        style={{
                          display: "flex",
                          justifyContent:
                            "space-between",
                          alignItems:
                            "flex-start",
                          gap: "20px",
                          flexWrap:
                            "wrap",
                        }}
                      >

                        {/* ORDER DETAILS */}

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
                              ₹
                              {order.totalPrice}
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

                          {order.expectedDeliveryDate && (

                            <p className="text-sm text-gray-500 mt-1">
                              Expected Delivery:{" "}

                              {formatDate(
                                order.expectedDeliveryDate
                              )}
                            </p>

                          )}

                        </div>

                        {/* =================================================
                            STATUS + ACTIONS
                        ================================================= */}

                        <div
                          style={{
                            display: "flex",
                            flexDirection:
                              "column",
                            alignItems:
                              "flex-end",
                            gap: "10px",
                          }}
                        >

                          <span
                            className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap ${getStatusClass(
                              normalizedStatus
                            )}`}
                          >
                            {formatStatus(
                              normalizedStatus
                            )}
                          </span>

                          {/* =================================================
                              PAYMENT STATUS
                          ================================================= */}

                          <span
                            className={`px-4 py-2 rounded-full border text-sm font-bold whitespace-nowrap ${paymentDisplay.className}`}
                          >
                            {paymentDisplay.text}
                          </span>

                          {/* =================================================
                              ACTION BUTTONS
                          ================================================= */}

                          <div className="flex items-center gap-2 flex-wrap justify-end">

                            {/* PAY NOW */}

                            {canPay && (

                              <button
                                type="button"
                                onClick={() =>
                                  openPaymentModal(
                                    order
                                  )
                                }
                                className="flex items-center gap-2 rounded-lg border border-blue-700 bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
                              >

                                <span>
                                  💳
                                </span>

                                <span>
                                  Pay Now
                                </span>

                              </button>

                            )}

                            {/* MAKE OFFER */}

                            {canMakeOffer && (

                              <button
                                type="button"
                                onClick={() =>
                                  openOfferModal(
                                    order
                                  )
                                }
                                className="flex items-center gap-2 rounded-lg border border-green-700 bg-green-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-green-700"
                              >

                                <span>
                                  💰
                                </span>

                                <span>
                                  Make Offer
                                </span>

                              </button>

                            )}

                            {/* CANCEL */}

                            {canCancel && (

                              <button
                                type="button"
                                onClick={() =>
                                  openCancelModal(
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

                  </div>

                  {/* =================================================
                      DELIVERY TRACKING
                  ================================================= */}

                  {normalizedStatus !==
                    "CANCELLED" && (

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
                          overflowX:
                            "auto",
                        }}
                      >

                        {stages.map(
                          (
                            stage,
                            index
                          ) => {

                            const completed =
                              currentIndex >=
                                0 &&
                              index <=
                                currentIndex;

                            const active =
                              index ===
                              currentIndex;

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
                                    : index +
                                      1}
                                </div>

                                <p
                                  className={`mt-3 text-sm font-semibold ${
                                    completed
                                      ? "text-green-700"
                                      : "text-gray-500"
                                  }`}
                                >
                                  {
                                    stageLabels[
                                      stage
                                    ]
                                  }
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

                  {/* =================================================
                      LIVE TRACKING
                  ================================================= */}

                  {(
                    normalizedStatus ===
                      "SHIPPED" ||
                    normalizedStatus ===
                      "OUT_FOR_DELIVERY"
                  ) && (

                    <div className="mt-8 pt-7 border-t border-gray-200">

                      <div className="bg-green-50 border border-green-200 rounded-2xl p-6">

                        <h3 className="text-xl font-bold text-green-800">
                          📍 Live Delivery Tracking
                        </h3>

                        {live?.currentLatitude !=
                          null &&
                        live?.currentLongitude !=
                          null ? (

                          <>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">

                              <div className="bg-white rounded-xl p-4 border">

                                <p className="text-sm text-gray-500">
                                  Farmer Location
                                </p>

                                <p className="font-semibold mt-2">
                                  {Number(
                                    live.currentLatitude
                                  ).toFixed(6)}
                                  ,{" "}
                                  {Number(
                                    live.currentLongitude
                                  ).toFixed(6)}
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
                                  href={
                                    "https://www.google.com/maps?q=" +
                                    live.currentLatitude +
                                    "," +
                                    live.currentLongitude
                                  }
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
                            Waiting for the farmer to start GPS tracking...
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

                  {/* =================================================
                      CONFIRM DELIVERY
                  ================================================= */}

                  {normalizedStatus ===
                    "OUT_FOR_DELIVERY" && (

                    <div className="mt-8 pt-7 border-t border-gray-200">

                      <div className="bg-pink-50 border border-pink-200 rounded-2xl p-6">

                        <h3 className="text-xl font-bold text-pink-800">
                          🚚 Your order is out for delivery
                        </h3>

                        <p className="text-pink-700 mt-2">
                          Confirm the delivery after receiving the produce.
                        </p>

                        <button
                          type="button"
                          onClick={() =>
                            confirmDelivery(
                              order.id
                            )
                          }
                          disabled={
                            updating ===
                            order.id
                          }
                          className="mt-5 px-7 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                        >
                          {updating ===
                          order.id
                            ? "Confirming..."
                            : "✓ Confirm Delivery"}
                        </button>

                      </div>

                    </div>

                  )}

                  {/* =================================================
                      DELIVERED
                  ================================================= */}

                  {normalizedStatus ===
                    "DELIVERED" && (

                    <div className="mt-8 pt-7 border-t border-gray-200">

                      <div className="bg-green-50 border border-green-200 rounded-2xl p-6">

                        <h3 className="text-xl font-bold text-green-800">
                          ✓ Delivery Completed
                        </h3>

                        <p className="text-green-700 mt-2">
                          You have successfully received this order.
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

                  {/* =================================================
                      CANCELLED
                  ================================================= */}

                  {normalizedStatus ===
                    "CANCELLED" && (

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

        {/* =========================================================
            PAYMENT MODAL
        ========================================================= */}

        {paymentOrder && (

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="payment-order-title"
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
              background:
                "rgba(25,31,20,0.55)",
              backdropFilter:
                "blur(5px)",
            }}
          >

            <div
              style={{
                position: "relative",
                width: "min(100%, 500px)",
                padding: "29px",
                border:
                  "1px solid #e5e8e1",
                borderRadius: "23px",
                background: "white",
                boxShadow:
                  "0 30px 80px rgba(0,0,0,0.2)",
              }}
            >

              <button
                type="button"
                onClick={
                  closePaymentModal
                }
                disabled={
                  paymentLoading
                }
                aria-label="Close"
                style={{
                  position: "absolute",
                  top: "15px",
                  right: "15px",
                  width: "31px",
                  height: "31px",
                  border: "none",
                  borderRadius: "9px",
                  background:
                    "#f4f5f2",
                  color: "#737b70",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>

              <div className="mb-5">

                <span className="text-blue-700 text-xs font-bold tracking-wider">
                  PAYMENT
                </span>

                <h2
                  id="payment-order-title"
                  className="text-2xl font-bold text-gray-900 mt-2"
                >
                  Pay for Order #
                  {paymentOrder.id}
                </h2>

                <p className="text-gray-500 mt-2">
                  {paymentOrder.produceName ||
                    "Produce"}
                </p>

              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">

                <div className="flex justify-between items-center">

                  <span className="text-gray-600">
                    Quantity
                  </span>

                  <span className="font-semibold">
                    {
                      paymentOrder.quantityOrdered
                    }
                  </span>

                </div>

                <div className="flex justify-between items-center mt-3">

                  <span className="text-gray-600">
                    Farmer
                  </span>

                  <span className="font-semibold">
                    {
                      paymentOrder.farmerName ||
                      "Farmer"
                    }
                  </span>

                </div>

                <div className="border-t border-blue-200 mt-4 pt-4 flex justify-between items-center">

                  <span className="text-lg font-bold text-gray-900">
                    Total Amount
                  </span>

                  <span className="text-2xl font-bold text-blue-700">
                    ₹
                    {
                      paymentOrder.totalPrice
                    }
                  </span>

                </div>

              </div>

              {/* =====================================================
                  SUCCESS
              ===================================================== */}

              {paymentSuccess ? (

                <>

                  <div className="mt-4 bg-green-50 border border-green-200 text-green-700 rounded-lg p-4">

                    ✓ Payment successful! Your order has been paid.

                  </div>

                  <button
                    type="button"
                    disabled
                    className="mt-6 w-full px-5 py-3 rounded-lg bg-gray-400 text-white font-bold cursor-not-allowed"
                  >
                    ✓ Payment Successful
                  </button>

                  {paymentOrder.paymentTransactionId && (

                    <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">

                      <p className="text-sm text-gray-500">
                        Transaction ID
                      </p>

                      <p className="font-bold text-gray-800 mt-1">
                        {
                          paymentOrder.paymentTransactionId
                        }
                      </p>

                    </div>

                  )}

                  {paymentOrder.paidAt && (

                    <p className="text-sm text-gray-500 text-center mt-3">
                      Paid At:{" "}
                      {formatDateTime(
                        paymentOrder.paidAt
                      )}
                    </p>

                  )}

                  <p className="text-xs text-gray-500 text-center mt-4">
                    This project currently uses a simulated payment service.
                  </p>

                </>

              ) : (

                <>

                  {paymentError && (

                    <div className="mt-4 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm">
                      {paymentError}
                    </div>

                  )}

                  <div className="mt-6">

                    <button
                      type="button"
                      onClick={
                        handlePayment
                      }
                      disabled={
                        paymentLoading
                      }
                      className="w-full px-5 py-3 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:bg-gray-400"
                    >
                      {paymentLoading
                        ? "Processing..."
                        : `💳 Pay ₹${paymentOrder.totalPrice}`}
                    </button>

                  </div>

                  <p className="text-xs text-gray-500 text-center mt-4">
                    This project currently uses a simulated payment service.
                  </p>

                </>

              )}

            </div>

          </div>

        )}

        {/* =========================================================
            MAKE OFFER MODAL
        ========================================================= */}

        {offerOrder && (

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="offer-order-title"
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
              background:
                "rgba(25,31,20,0.55)",
              backdropFilter:
                "blur(5px)",
            }}
          >

            <div
              style={{
                position: "relative",
                width: "min(100%, 500px)",
                padding: "29px",
                border:
                  "1px solid #e5e8e1",
                borderRadius: "23px",
                background: "white",
                boxShadow:
                  "0 30px 80px rgba(0,0,0,0.2)",
              }}
            >

              <button
                type="button"
                onClick={
                  closeOfferModal
                }
                disabled={
                  offerLoading
                }
                aria-label="Close"
                style={{
                  position: "absolute",
                  top: "15px",
                  right: "15px",
                  width: "31px",
                  height: "31px",
                  border: "none",
                  borderRadius: "9px",
                  background:
                    "#f4f5f2",
                  color: "#737b70",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>

              <div className="mb-5">

                <span className="text-green-700 text-xs font-bold tracking-wider">
                  MAKE AN OFFER
                </span>

                <h2
                  id="offer-order-title"
                  className="text-2xl font-bold text-gray-900 mt-2"
                >
                  Make Offer for Order #
                  {offerOrder.id}
                </h2>

                <p className="text-gray-500 mt-2">
                  {
                    offerOrder.produceName ||
                    "Produce"
                  }
                </p>

              </div>

              {offerError && (

                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
                  {offerError}
                </div>

              )}

              <div className="space-y-4">

                <div>

                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Offer Price (₹)
                  </label>

                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={offerPrice}
                    onChange={(e) =>
                      setOfferPrice(
                        e.target.value
                      )
                    }
                    placeholder="Enter your offer price"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-green-500"
                  />

                </div>

                <div>

                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Quantity
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={offerQuantity}
                    onChange={(e) =>
                      setOfferQuantity(
                        e.target.value
                      )
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-green-500"
                  />

                  <p className="text-xs text-gray-500 mt-1">
                    Ordered quantity:{" "}
                    {
                      offerOrder.quantityOrdered
                    }
                  </p>

                </div>

                <div>

                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Message
                  </label>

                  <textarea
                    rows="3"
                    value={offerMessage}
                    onChange={(e) =>
                      setOfferMessage(
                        e.target.value
                      )
                    }
                    placeholder="Add a message to the farmer..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-green-500 resize-none"
                  />

                </div>

              </div>

              <div className="flex justify-end gap-3 mt-6">

                <button
                  type="button"
                  onClick={
                    closeOfferModal
                  }
                  disabled={
                    offerLoading
                  }
                  className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={
                    submitOffer
                  }
                  disabled={
                    offerLoading
                  }
                  className="px-5 py-2.5 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700 disabled:bg-gray-400"
                >
                  {offerLoading
                    ? "Sending..."
                    : "Send Offer"}
                </button>

              </div>

            </div>

          </div>

        )}

        {/* =========================================================
            CANCEL ORDER MODAL
        ========================================================= */}

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
              background:
                "rgba(25,31,20,0.55)",
              backdropFilter:
                "blur(5px)",
            }}
          >

            <div
              style={{
                position: "relative",
                width: "min(100%, 440px)",
                padding: "29px",
                border:
                  "1px solid #e5e8e1",
                borderRadius: "23px",
                background: "white",
                boxShadow:
                  "0 30px 80px rgba(0,0,0,0.2)",
              }}
            >

              <button
                type="button"
                onClick={
                  closeCancelModal
                }
                disabled={
                  cancelLoading
                }
                aria-label="Close"
                style={{
                  position: "absolute",
                  top: "15px",
                  right: "15px",
                  width: "31px",
                  height: "31px",
                  border: "none",
                  borderRadius: "9px",
                  background:
                    "#f4f5f2",
                  color: "#737b70",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>

              <div
                style={{
                  width: "48px",
                  height: "48px",
                  marginBottom: "15px",
                  borderRadius: "14px",
                  background:
                    "#fff0f0",
                  display: "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  fontSize: "22px",
                }}
              >
                ⚠️
              </div>

              <span className="text-red-700 text-xs font-bold tracking-wider">
                CANCEL ORDER
              </span>

              <h2
                id="cancel-order-title"
                className="text-2xl font-bold text-gray-900 mt-2"
              >
                Cancel this order?
              </h2>

              <p className="text-gray-500 text-sm mt-3 leading-6">

                You're about to cancel{" "}

                <strong>
                  Order #{cancelOrder.id}
                </strong>{" "}

                for{" "}

                <strong>
                  {
                    cancelOrder.produceName ||
                    "this produce"
                  }
                </strong>

                . The farmer will be notified and
                the quantity will be returned to
                their stock.

              </p>

              {cancelError && (

                <div className="mt-4 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
                  {cancelError}
                </div>

              )}

              <div className="mt-4 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm font-semibold">
                This action cannot be undone.
              </div>

              <div className="flex justify-end gap-3 mt-6">

                <button
                  type="button"
                  onClick={
                    closeCancelModal
                  }
                  disabled={
                    cancelLoading
                  }
                  className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 disabled:opacity-50"
                >
                  Keep Order
                </button>

                <button
                  type="button"
                  onClick={
                    confirmCancelOrder
                  }
                  disabled={
                    cancelLoading
                  }
                  className="px-5 py-2.5 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 disabled:bg-gray-400"
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