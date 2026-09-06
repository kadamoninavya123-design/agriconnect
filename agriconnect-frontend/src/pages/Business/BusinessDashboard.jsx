import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../api/axiosConfig";
import {
  ShoppingCart,
  Clock3,
  Wallet,
  Search,
  ChevronRight,
  Package,
  Truck,
  CircleCheck,
  AlertCircle,
  ArrowUpRight,
  Sparkles,
  RefreshCw,
} from "lucide-react";

function BusinessDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalSpent: 0,
  });

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    setOrdersLoading(true);
    setError("");

    try {
      const [statsResponse, ordersResponse] =
        await Promise.all([
          api.get("/orders/my-stats"),
          api.get("/orders/my-orders"),
        ]);

      setStats({
        totalOrders:
          statsResponse.data?.totalOrders ?? 0,
        pendingOrders:
          statsResponse.data?.pendingOrders ?? 0,
        totalSpent:
          statsResponse.data?.totalSpent ?? 0,
      });

      const orderData =
        Array.isArray(ordersResponse.data)
          ? ordersResponse.data
          : Array.isArray(
              ordersResponse.data?.content
            )
          ? ordersResponse.data.content
          : [];

      setOrders(orderData);
    } catch (err) {
      console.error(
        "Failed to load business dashboard",
        err
      );

      setError(
        "Unable to load dashboard information right now."
      );
    } finally {
      setLoading(false);
      setOrdersLoading(false);
    }
  };

  const recentOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => {
        const first = new Date(
          a?.createdAt || 0
        ).getTime();

        const second = new Date(
          b?.createdAt || 0
        ).getTime();

        return second - first;
      })
      .slice(0, 5);
  }, [orders]);

  const activeOrders = useMemo(() => {
    return orders.filter(
      (order) =>
        order.status &&
        [
          "PLACED",
          "CONFIRMED",
          "PREPARING",
          "READY",
          "SHIPPED",
          "OUT_FOR_DELIVERY",
        ].includes(order.status)
    ).length;
  }, [orders]);

  const deliveredOrders = useMemo(() => {
    return orders.filter(
      (order) =>
        order.status === "DELIVERED"
    ).length;
  }, [orders]);

  const getStatusConfig = (status) => {
    switch (status) {
      case "PLACED":
        return {
          label: "Placed",
          icon: Clock3,
          className: "business-status-placed",
        };

      case "CONFIRMED":
        return {
          label: "Confirmed",
          icon: CircleCheck,
          className: "business-status-confirmed",
        };

      case "PREPARING":
        return {
          label: "Preparing",
          icon: Package,
          className: "business-status-preparing",
        };

      case "READY":
        return {
          label: "Ready",
          icon: Package,
          className: "business-status-ready",
        };

      case "SHIPPED":
        return {
          label: "Shipped",
          icon: Truck,
          className: "business-status-shipped",
        };

      case "OUT_FOR_DELIVERY":
        return {
          label: "Out for delivery",
          icon: Truck,
          className:
            "business-status-delivery",
        };

      case "DELIVERED":
        return {
          label: "Delivered",
          icon: CircleCheck,
          className:
            "business-status-delivered",
        };

      case "CANCELLED":
        return {
          label: "Cancelled",
          icon: AlertCircle,
          className:
            "business-status-cancelled",
        };

      default:
        return {
          label: status || "Unknown",
          icon: Clock3,
          className:
            "business-status-default",
        };
    }
  };

  const formatDate = (value) => {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const statCards = [
    {
      title: "Total Orders",
      value: stats.totalOrders,
      description: "All orders placed",
      icon: ShoppingCart,
      tone: "business-stat-green",
    },
    {
      title: "Pending Orders",
      value: stats.pendingOrders,
      description:
        stats.pendingOrders > 0
          ? "Waiting for action"
          : "Nothing needs attention",
      icon: Clock3,
      tone: "business-stat-amber",
    },
    {
      title: "Total Spent",
      value: `₹${Number(
        stats.totalSpent || 0
      ).toLocaleString("en-IN", {
        maximumFractionDigits: 0,
      })}`,
      description: "Total purchase value",
      icon: Wallet,
      tone: "business-stat-blue",
    },
  ];

  return (
    <DashboardLayout>
      <div className="business-dashboard">

        {/* =================================================
            HERO
        ================================================= */}

        <section className="business-hero">

          <div className="business-hero-content">
            <div>

              <div className="business-hero-badge">
                <Sparkles size={14} />
                BUSINESS WORKSPACE
              </div>

              <h1>
                Source smarter.
                <br />
                <span>Grow faster.</span>
              </h1>

              <p>
                Discover fresh produce, manage your
                purchases, and stay updated on every
                delivery from one place.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchDashboard}
              className="business-refresh-button"
            >
              <RefreshCw size={15} />
              Refresh
            </button>
          </div>

          <div className="business-hero-shape business-shape-one" />
          <div className="business-hero-shape business-shape-two" />

        </section>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="business-alert">
            <AlertCircle size={17} />
            <span>{error}</span>
          </div>
        )}

        {/* =================================================
            STATISTICS
        ================================================= */}

        <section className="business-stat-grid">

          {statCards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.title}
                className={`business-stat-card ${card.tone}`}
              >
                <div className="business-stat-top">
                  <div className="business-stat-icon">
                    <Icon size={21} />
                  </div>

                  <ArrowUpRight
                    size={16}
                    className="business-stat-arrow"
                  />
                </div>

                <span className="business-stat-title">
                  {card.title}
                </span>

                <strong className="business-stat-value">
                  {loading
                    ? "—"
                    : card.value}
                </strong>

                <span className="business-stat-description">
                  {card.description}
                </span>
              </div>
            );
          })}

        </section>

        {/* =================================================
            QUICK OVERVIEW
        ================================================= */}

        <section className="business-overview-grid">

          <div className="business-overview-card green">
            <div className="business-overview-icon">
              <ShoppingCart size={17} />
            </div>

            <div>
              <span>Orders</span>
              <strong>
                {loading
                  ? "—"
                  : stats.totalOrders}
              </strong>
            </div>

            <small>all time</small>
          </div>

          <div className="business-overview-card amber">
            <div className="business-overview-icon">
              <Truck size={17} />
            </div>

            <div>
              <span>Active</span>
              <strong>
                {ordersLoading
                  ? "—"
                  : activeOrders}
              </strong>
            </div>

            <small>in progress</small>
          </div>

          <div className="business-overview-card blue">
            <div className="business-overview-icon">
              <CircleCheck size={17} />
            </div>

            <div>
              <span>Delivered</span>
              <strong>
                {ordersLoading
                  ? "—"
                  : deliveredOrders}
              </strong>
            </div>

            <small>completed</small>
          </div>

        </section>

        {/* =================================================
            QUICK ACTIONS
        ================================================= */}

        <section className="business-content-card">

          <div className="business-section-heading">
            <div>
              <span>
                SHORTCUTS
              </span>

              <h2>
                Quick Actions
              </h2>

              <p>
                Find produce or manage your purchases.
              </p>
            </div>
          </div>

          <div className="business-actions">

            <Link
              to="/business/browse"
              className="business-action-card browse"
            >
              <div className="business-action-icon">
                <Search size={21} />
              </div>

              <div className="business-action-copy">
                <strong>
                  Browse Products
                </strong>

                <span>
                  Discover fresh produce from farmers
                  across the marketplace.
                </span>
              </div>

              <ChevronRight size={19} />
            </Link>

            <Link
              to="/business/orders"
              className="business-action-card orders"
            >
              <div className="business-action-icon">
                <ShoppingCart size={21} />
              </div>

              <div className="business-action-copy">
                <strong>
                  View My Orders
                </strong>

                <span>
                  Check order progress, delivery,
                  and purchase history.
                </span>
              </div>

              <ChevronRight size={19} />
            </Link>

          </div>

        </section>

        {/* =================================================
            RECENT ORDERS
        ================================================= */}

        <section className="business-content-card business-orders-card">

          <div className="business-section-heading business-orders-heading">

            <div>
              <span>
                PURCHASE ACTIVITY
              </span>

              <h2>
                Recent Orders
              </h2>

              <p>
                Your latest marketplace purchases.
              </p>
            </div>

            <Link
              to="/business/orders"
              className="business-view-all"
            >
              View all
              <ChevronRight size={16} />
            </Link>

          </div>

          {ordersLoading ? (
            <div className="business-empty">
              <div className="business-loading-spinner" />
              <span>
                Loading your orders...
              </span>
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="business-empty">

              <div className="business-empty-icon">
                <Package size={24} />
              </div>

              <strong>
                No recent orders
              </strong>

              <span>
                Browse products and place your first order.
              </span>

              <Link
                to="/business/browse"
                className="business-empty-button"
              >
                Browse products
                <ArrowUpRight size={15} />
              </Link>

            </div>
          ) : (
            <div className="business-orders-list">

              {recentOrders.map((order) => {

                const status =
                  getStatusConfig(
                    order.status
                  );

                const StatusIcon =
                  status.icon;

                return (
                  <div
                    key={order.id}
                    className="business-order-row"
                  >

                    <div className="business-order-number">
                      #{order.id}
                    </div>

                    <div className="business-order-product">
                      <strong>
                        {order.produceName ||
                          "Produce"}
                      </strong>

                      <span>
                        Farmer:{" "}
                        {order.farmerName ||
                          "Unknown"}
                      </span>
                    </div>

                    <div className="business-order-details">

                      <div>
                        <span>
                          Quantity
                        </span>

                        <strong>
                          {order.quantityOrdered}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Total
                        </span>

                        <strong>
                          ₹
                          {Number(
                            order.totalPrice ||
                              0
                          ).toLocaleString(
                            "en-IN",
                            {
                              maximumFractionDigits: 0,
                            }
                          )}
                        </strong>
                      </div>

                      {order.createdAt && (
                        <div>
                          <span>
                            Ordered
                          </span>

                          <strong>
                            {formatDate(
                              order.createdAt
                            )}
                          </strong>
                        </div>
                      )}

                    </div>

                    <div
                      className={`business-order-status ${status.className}`}
                    >
                      <StatusIcon size={13} />
                      {status.label}
                    </div>

                    <Link
                      to="/business/orders"
                      className="business-order-arrow"
                      aria-label={`View order ${order.id}`}
                    >
                      <ChevronRight size={17} />
                    </Link>

                  </div>
                );
              })}

            </div>
          )}

        </section>

        {/* =================================================
            FOOTER
        ================================================= */}

        <div className="business-footer">
          <span>
            AgriConnect Business Workspace
          </span>

          <span>
            Source • Trade • Grow
          </span>
        </div>

      </div>

      {/* =================================================
          PAGE STYLES
      ================================================= */}

      <style>{`

        .business-dashboard {
          width: 100%;
          max-width: 1500px;
          margin: 0 auto;
          padding-bottom: 38px;
        }

        /* =============================================
           HERO
        ============================================= */

        .business-hero {
          position: relative;
          overflow: hidden;
          min-height: 235px;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 30px;
          padding: 38px 42px;
          margin-bottom: 23px;
          border-radius: 30px;
          background:
            linear-gradient(
              135deg,
              #26361e 0%,
              #3f5426 48%,
              #657a38 100%
            );
          box-shadow:
            0 20px 50px rgba(50,69,29,0.16);
        }

        .business-hero-content {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          width: 100%;
          gap: 30px;
        }

        .business-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 7px 12px;
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 999px;
          background: rgba(255,255,255,0.08);
          color: #e4edce;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.13em;
        }

        .business-hero h1 {
          margin: 16px 0 11px;
          color: white;
          font-size: clamp(34px,4vw,49px);
          line-height: 1.02;
          font-weight: 900;
          letter-spacing: -0.045em;
        }

        .business-hero h1 span {
          color: #dae7aa;
        }

        .business-hero p {
          max-width: 630px;
          margin: 0;
          color: #d5dfc4;
          font-size: 14px;
          line-height: 1.7;
        }

        .business-refresh-button {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          flex-shrink: 0;
          padding: 11px 15px;
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 13px;
          background: rgba(255,255,255,0.1);
          color: white;
          font-size: 11px;
          font-weight: 800;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .business-refresh-button:hover {
          background: rgba(255,255,255,0.17);
          transform: translateY(-1px);
        }

        .business-hero-shape {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
        }

        .business-shape-one {
          width: 320px;
          height: 320px;
          right: -120px;
          top: -180px;
          background: rgba(218,232,169,0.09);
        }

        .business-shape-two {
          width: 220px;
          height: 220px;
          right: 220px;
          bottom: -160px;
          background: rgba(255,255,255,0.05);
        }

        /* =============================================
           ALERT
        ============================================= */

        .business-alert {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-bottom: 20px;
          padding: 13px 15px;
          border: 1px solid #efcccc;
          border-radius: 14px;
          background: #fff5f5;
          color: #aa3e3e;
          font-size: 12px;
          font-weight: 700;
        }

        /* =============================================
           STAT CARDS
        ============================================= */

        .business-stat-grid {
          display: grid;
          grid-template-columns:
            repeat(3,minmax(0,1fr));
          gap: 18px;
          margin-bottom: 15px;
        }

        .business-stat-card {
          position: relative;
          overflow: hidden;
          min-height: 157px;
          padding: 23px;
          border: 1px solid;
          border-radius: 22px;
          transition:
            transform .2s ease,
            box-shadow .2s ease;
        }

        .business-stat-card:hover {
          transform: translateY(-3px);
        }

        .business-stat-green {
          border-color: #dce7c7;
          background:
            linear-gradient(
              145deg,
              #fbfcf8,
              #eef5df
            );
          color: #60752e;
          box-shadow:
            0 9px 26px rgba(91,115,43,.06);
        }

        .business-stat-amber {
          border-color: #efe2c3;
          background:
            linear-gradient(
              145deg,
              #fffefa,
              #fff7e4
            );
          color: #b17d24;
          box-shadow:
            0 9px 26px rgba(178,130,37,.06);
        }

        .business-stat-blue {
          border-color: #dce6f0;
          background:
            linear-gradient(
              145deg,
              #fbfdff,
              #edf4fb
            );
          color: #536f91;
          box-shadow:
            0 9px 26px rgba(67,97,134,.06);
        }

        .business-stat-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .business-stat-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 13px;
          background: rgba(255,255,255,.86);
          box-shadow:
            0 4px 12px rgba(0,0,0,.04);
        }

        .business-stat-arrow {
          opacity: .3;
        }

        .business-stat-title {
          display: block;
          margin-top: 16px;
          color: #778175;
          font-size: 11px;
          font-weight: 800;
        }

        .business-stat-value {
          display: block;
          margin-top: 5px;
          color: #2c3826;
          font-size: 33px;
          line-height: 1;
          font-weight: 900;
          letter-spacing: -.045em;
        }

        .business-stat-description {
          display: block;
          margin-top: 8px;
          color: #929a8e;
          font-size: 10px;
          font-weight: 600;
        }

        /* =============================================
           OVERVIEW STRIP
        ============================================= */

        .business-overview-grid {
          display: grid;
          grid-template-columns:
            repeat(3,minmax(0,1fr));
          gap: 13px;
          margin-bottom: 24px;
        }

        .business-overview-card {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 13px 15px;
          border: 1px solid;
          border-radius: 16px;
          background: white;
        }

        .business-overview-card.green {
          border-color: #e0e9d4;
        }

        .business-overview-card.amber {
          border-color: #eee4cb;
        }

        .business-overview-card.blue {
          border-color: #dde6f0;
        }

        .business-overview-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          flex-shrink: 0;
          border-radius: 11px;
        }

        .business-overview-card.green
        .business-overview-icon {
          background: #edf5df;
          color: #637831;
        }

        .business-overview-card.amber
        .business-overview-icon {
          background: #fff4dd;
          color: #ad7920;
        }

        .business-overview-card.blue
        .business-overview-icon {
          background: #edf3fa;
          color: #547294;
        }

        .business-overview-card > div:nth-child(2) {
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .business-overview-card span {
          color: #879084;
          font-size: 9px;
          font-weight: 800;
        }

        .business-overview-card strong {
          margin-top: 2px;
          color: #37422f;
          font-size: 18px;
          font-weight: 900;
        }

        .business-overview-card small {
          color: #a1a89f;
          font-size: 9px;
          font-weight: 700;
          white-space: nowrap;
        }

        /* =============================================
           CONTENT
        ============================================= */

        .business-content-card {
          margin-bottom: 24px;
          overflow: hidden;
          border: 1px solid #e2e7de;
          border-radius: 24px;
          background: white;
          box-shadow:
            0 8px 28px rgba(46,59,35,.05);
        }

        .business-section-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 25px 27px 20px;
          border-bottom: 1px solid #edf0e9;
        }

        .business-section-heading span {
          display: block;
          color: #99a190;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: .16em;
        }

        .business-section-heading h2 {
          margin: 5px 0 3px;
          color: #2c3826;
          font-size: 21px;
          line-height: 1.2;
          font-weight: 900;
        }

        .business-section-heading p {
          margin: 0;
          color: #8b9487;
          font-size: 11px;
        }

        /* =============================================
           ACTIONS
        ============================================= */

        .business-actions {
          display: grid;
          grid-template-columns:
            repeat(2,minmax(0,1fr));
          gap: 16px;
          padding: 22px;
        }

        .business-action-card {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 19px;
          border: 1px solid;
          border-radius: 18px;
          text-decoration: none;
          transition:
            transform .2s ease,
            box-shadow .2s ease;
        }

        .business-action-card:hover {
          transform: translateY(-2px);
        }

        .business-action-card.browse {
          border-color: #dce7c6;
          background: #f7faef;
          color: #60742f;
        }

        .business-action-card.orders {
          border-color: #dce5ee;
          background: #f6f9fc;
          color: #526d8c;
        }

        .business-action-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 45px;
          height: 45px;
          flex-shrink: 0;
          border-radius: 13px;
          background: white;
          box-shadow:
            0 4px 12px rgba(0,0,0,.05);
        }

        .business-action-copy {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-width: 0;
        }

        .business-action-copy strong {
          color: #354228;
          font-size: 14px;
          font-weight: 900;
        }

        .business-action-card.orders
        .business-action-copy strong {
          color: #405773;
        }

        .business-action-copy span {
          margin-top: 4px;
          color: #879083;
          font-size: 10px;
          line-height: 1.5;
        }

        /* =============================================
           ORDERS
        ============================================= */

        .business-orders-heading {
          padding-bottom: 21px;
        }

        .business-view-all {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          color: #647532;
          font-size: 11px;
          font-weight: 900;
          text-decoration: none;
        }

        .business-orders-list {
          width: 100%;
        }

        .business-order-row {
          display: grid;
          grid-template-columns:
            44px
            minmax(190px,1.2fr)
            minmax(230px,1fr)
            auto
            35px;
          align-items: center;
          gap: 18px;
          padding: 18px 27px;
          border-bottom: 1px solid #f0f2ed;
          transition: background .15s ease;
        }

        .business-order-row:last-child {
          border-bottom: none;
        }

        .business-order-row:hover {
          background: #fbfcfa;
        }

        .business-order-number {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: #f0f4e8;
          color: #5d6d32;
          font-size: 10px;
          font-weight: 900;
        }

        .business-order-product {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .business-order-product strong {
          overflow: hidden;
          color: #35412d;
          font-size: 13px;
          font-weight: 900;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .business-order-product span {
          margin-top: 3px;
          overflow: hidden;
          color: #8c9589;
          font-size: 10px;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .business-order-details {
          display: flex;
          align-items: center;
          gap: 22px;
        }

        .business-order-details div {
          display: flex;
          flex-direction: column;
        }

        .business-order-details span {
          color: #a1a89e;
          font-size: 8px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: .04em;
        }

        .business-order-details strong {
          margin-top: 3px;
          color: #5c6658;
          font-size: 10px;
          font-weight: 800;
        }

        .business-order-status {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          width: max-content;
          padding: 7px 10px;
          border: 1px solid;
          border-radius: 999px;
          font-size: 9px;
          font-weight: 900;
          white-space: nowrap;
        }

        .business-status-placed {
          border-color: #f0dcae;
          background: #fff9eb;
          color: #9b6d1a;
        }

        .business-status-confirmed {
          border-color: #d7e3f4;
          background: #f2f7fd;
          color: #4e6889;
        }

        .business-status-preparing {
          border-color: #e4d9f3;
          background: #f8f4fc;
          color: #735b98;
        }

        .business-status-ready {
          border-color: #d9e1f4;
          background: #f3f6fc;
          color: #5f709b;
        }

        .business-status-shipped {
          border-color: #efdac1;
          background: #fff7ee;
          color: #9e6d35;
        }

        .business-status-delivery {
          border-color: #cde7eb;
          background: #effafc;
          color: #397681;
        }

        .business-status-delivered {
          border-color: #cce5d4;
          background: #f0faf2;
          color: #3a764b;
        }

        .business-status-cancelled {
          border-color: #efcccc;
          background: #fff4f4;
          color: #a34343;
        }

        .business-status-default {
          border-color: #e0e4dd;
          background: #f7f8f6;
          color: #6c746a;
        }

        .business-order-arrow {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border: 1px solid #e1e6dd;
          border-radius: 11px;
          color: #7f887b;
          transition: .15s ease;
        }

        .business-order-arrow:hover {
          background: #f4f7f0;
          border-color: #ced8c5;
          color: #5e7030;
        }

        /* =============================================
           EMPTY
        ============================================= */

        .business-empty {
          display: flex;
          min-height: 230px;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 30px;
          text-align: center;
          color: #8c9589;
        }

        .business-empty strong {
          color: #3d4935;
          font-size: 14px;
        }

        .business-empty span {
          font-size: 11px;
        }

        .business-empty-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 54px;
          height: 54px;
          margin-bottom: 8px;
          border-radius: 16px;
          background: #f1f4ec;
          color: #70805a;
        }

        .business-empty-button {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-top: 12px;
          padding: 9px 13px;
          border-radius: 11px;
          background: #edf4dd;
          color: #60712f;
          font-size: 10px;
          font-weight: 900;
          text-decoration: none;
        }

        .business-loading-spinner {
          width: 23px;
          height: 23px;
          margin-bottom: 7px;
          border: 2px solid #dce3d6;
          border-top-color: #71813b;
          border-radius: 50%;
          animation:
            business-spin
            .7s
            linear
            infinite;
        }

        @keyframes business-spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* =============================================
           FOOTER
        ============================================= */

        .business-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 3px 3px 0;
          color: #9ba29a;
          font-size: 9px;
          font-weight: 700;
        }

        /* =============================================
           RESPONSIVE
        ============================================= */

        @media (max-width: 1050px) {

          .business-order-row {
            grid-template-columns:
              44px
              minmax(170px,1.1fr)
              minmax(180px,1fr)
              auto
              35px;
            gap: 12px;
          }

          .business-order-details {
            gap: 13px;
          }

        }

        @media (max-width: 900px) {

          .business-stat-grid,
          .business-overview-grid {
            grid-template-columns: 1fr;
          }

          .business-hero {
            align-items: flex-start;
            min-height: auto;
          }

          .business-hero-content {
            align-items: flex-start;
            flex-direction: column;
          }

          .business-actions {
            grid-template-columns: 1fr;
          }

          .business-order-row {
            grid-template-columns:
              43px
              1fr
              auto
              34px;
          }

          .business-order-details {
            grid-column: 2 / 3;
          }

          .business-order-status {
            grid-column: 3;
            grid-row: 1;
          }

          .business-order-arrow {
            grid-column: 4;
            grid-row: 1;
          }

        }

        @media (max-width: 620px) {

          .business-hero {
            padding: 28px 22px;
            border-radius: 22px;
          }

          .business-hero h1 {
            font-size: 34px;
          }

          .business-section-heading {
            padding: 21px 20px 18px;
          }

          .business-actions {
            padding: 15px;
          }

          .business-order-row {
            grid-template-columns:
              42px
              1fr
              34px;
            padding: 17px 20px;
          }

          .business-order-details {
            grid-column: 2 / 3;
          }

          .business-order-status {
            grid-column: 2 / 3;
            grid-row: auto;
            justify-self: flex-start;
          }

          .business-order-arrow {
            grid-column: 3;
            grid-row: 1;
          }

          .business-footer {
            align-items: flex-start;
            flex-direction: column;
            gap: 5px;
          }

        }

      `}</style>
    </DashboardLayout>
  );
}

export default BusinessDashboard;