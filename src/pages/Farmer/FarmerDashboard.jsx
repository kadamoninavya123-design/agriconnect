import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../api/axiosConfig";
import {
  Package,
  ShoppingCart,
  Clock3,
  ChevronRight,
  Sprout,
  Truck,
  CircleCheck,
  AlertCircle,
  TrendingUp,
  Activity,
  Plus,
  ArrowUpRight,
} from "lucide-react";

function FarmerDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    recentOrders: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/orders/farmer-stats"
      );

      setStats({
        totalProducts:
          response.data?.totalProducts ?? 0,

        totalOrders:
          response.data?.totalOrders ?? 0,

        pendingOrders:
          response.data?.pendingOrders ?? 0,

        recentOrders:
          Array.isArray(
            response.data?.recentOrders
          )
            ? response.data.recentOrders
            : [],
      });
    } catch (err) {
      console.error(
        "Failed to load farmer dashboard:",
        err
      );

      setError(
        "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  const activeDeliveries = useMemo(() => {
    return stats.recentOrders.filter(
      (order) =>
        order.status === "SHIPPED" ||
        order.status ===
          "OUT_FOR_DELIVERY"
    ).length;
  }, [stats.recentOrders]);

  const deliveredRecently = useMemo(() => {
    return stats.recentOrders.filter(
      (order) =>
        order.status === "DELIVERED"
    ).length;
  }, [stats.recentOrders]);

  const getStatusConfig = (status) => {
    switch (status) {
      case "PLACED":
        return {
          label: "Placed",
          icon: Clock3,
          className:
            "status-placed",
        };

      case "CONFIRMED":
        return {
          label: "Confirmed",
          icon: CircleCheck,
          className:
            "status-confirmed",
        };

      case "PREPARING":
        return {
          label: "Preparing",
          icon: Package,
          className:
            "status-preparing",
        };

      case "READY":
        return {
          label: "Ready",
          icon: Package,
          className:
            "status-ready",
        };

      case "SHIPPED":
        return {
          label: "Shipped",
          icon: Truck,
          className:
            "status-shipped",
        };

      case "OUT_FOR_DELIVERY":
        return {
          label: "Out for delivery",
          icon: Truck,
          className:
            "status-out-for-delivery",
        };

      case "DELIVERED":
        return {
          label: "Delivered",
          icon: CircleCheck,
          className:
            "status-delivered",
        };

      case "CANCELLED":
        return {
          label: "Cancelled",
          icon: AlertCircle,
          className:
            "status-cancelled",
        };

      default:
        return {
          label: status || "Unknown",
          icon: Activity,
          className:
            "status-default",
        };
    }
  };

  const formatDate = (value) => {
    if (!value) {
      return "";
    }

    return new Date(
      value
    ).toLocaleDateString(
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
      label: "Total Products",
      value: stats.totalProducts,
      description: "Active listings",
      icon: Package,
      className:
        "stat-green",
    },
    {
      label: "Total Orders",
      value: stats.totalOrders,
      description: "Orders received",
      icon: ShoppingCart,
      className:
        "stat-blue",
    },
    {
      label: "Pending Orders",
      value: stats.pendingOrders,
      description:
        stats.pendingOrders > 0
          ? "Needs your attention"
          : "Everything is on track",
      icon: Clock3,
      className:
        "stat-amber",
    },
  ];

  return (
    <DashboardLayout>
      <div className="farmer-dashboard">

        {/* ======================================
            HERO
        ====================================== */}

        <section className="dashboard-hero">
          <div className="hero-left">
            <div className="hero-badge">
              <Sprout size={15} />
              <span>FARMER WORKSPACE</span>
            </div>

            <h1>
              Welcome back,
              <br />
              <span>Farmer.</span>
            </h1>

            <p>
              Manage your produce, keep up with
              orders, and stay on top of deliveries.
            </p>
          </div>

          <button
            type="button"
            className="hero-refresh"
            onClick={fetchStats}
          >
            <Activity size={16} />
            Refresh
          </button>

          <div className="hero-circle hero-circle-one" />
          <div className="hero-circle hero-circle-two" />
        </section>

        {/* ======================================
            ERROR
        ====================================== */}

        {error && (
          <div className="dashboard-alert">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* ======================================
            STATS
        ====================================== */}

        <section className="stats-grid">
          {statCards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.label}
                className={`stat-card ${card.className}`}
              >
                <div className="stat-top">
                  <div className="stat-icon">
                    <Icon size={22} />
                  </div>

                  <ArrowUpRight
                    size={17}
                    className="stat-arrow"
                  />
                </div>

                <div className="stat-label">
                  {card.label}
                </div>

                <div className="stat-value">
                  {loading
                    ? "—"
                    : card.value}
                </div>

                <div className="stat-description">
                  {card.description}
                </div>
              </div>
            );
          })}
        </section>

        {/* ======================================
            MINI OVERVIEW
        ====================================== */}

        <section className="overview-grid">
          <div className="overview-card overview-green">
            <div className="overview-icon">
              <TrendingUp size={19} />
            </div>

            <div className="overview-content">
              <span>Recent Activity</span>
              <strong>
                {loading
                  ? "—"
                  : stats.recentOrders.length}
              </strong>
            </div>

            <small>latest orders</small>
          </div>

          <div className="overview-card overview-orange">
            <div className="overview-icon">
              <Truck size={19} />
            </div>

            <div className="overview-content">
              <span>Active Deliveries</span>
              <strong>
                {loading
                  ? "—"
                  : activeDeliveries}
              </strong>
            </div>

            <small>in progress</small>
          </div>

          <div className="overview-card overview-blue">
            <div className="overview-icon">
              <CircleCheck size={19} />
            </div>

            <div className="overview-content">
              <span>Delivered</span>
              <strong>
                {loading
                  ? "—"
                  : deliveredRecently}
              </strong>
            </div>

            <small>recently completed</small>
          </div>
        </section>

        {/* ======================================
            QUICK ACTIONS
        ====================================== */}

        <section className="content-card">
          <div className="section-heading">
            <div>
              <span className="section-kicker">
                SHORTCUTS
              </span>

              <h2>Quick Actions</h2>

              <p>
                Access the things you use most.
              </p>
            </div>
          </div>

          <div className="quick-actions">

            <Link
              to="/farmer/products"
              className="quick-action quick-action-green"
            >
              <div className="quick-icon">
                <Plus size={21} />
              </div>

              <div className="quick-copy">
                <strong>
                  Manage Products
                </strong>

                <span>
                  Add, edit and manage your
                  produce listings.
                </span>
              </div>

              <ChevronRight size={19} />
            </Link>

            <Link
              to="/farmer/orders"
              className="quick-action quick-action-blue"
            >
              <div className="quick-icon">
                <ShoppingCart size={21} />
              </div>

              <div className="quick-copy">
                <strong>
                  Manage Orders
                </strong>

                <span>
                  Process incoming orders and
                  manage delivery progress.
                </span>
              </div>

              <ChevronRight size={19} />
            </Link>

          </div>
        </section>

        {/* ======================================
            RECENT ORDERS
        ====================================== */}

        <section className="content-card orders-section">
          <div className="section-heading orders-heading">
            <div>
              <span className="section-kicker">
                ORDER ACTIVITY
              </span>

              <h2>Recent Orders</h2>

              <p>
                A quick view of your latest orders.
              </p>
            </div>

            <Link
              to="/farmer/orders"
              className="view-all"
            >
              View all
              <ChevronRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="empty-state">
              Loading recent orders...
            </div>
          ) : stats.recentOrders.length ===
            0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <Package size={25} />
              </div>

              <strong>
                No recent orders
              </strong>

              <span>
                New orders will appear here.
              </span>
            </div>
          ) : (
            <div className="orders-list">
              {stats.recentOrders.map(
                (order) => {
                  const status =
                    getStatusConfig(
                      order.status
                    );

                  const StatusIcon =
                    status.icon;

                  return (
                    <div
                      key={order.id}
                      className="order-row"
                    >
                      <div className="order-number">
                        #{order.id}
                      </div>

                      <div className="order-product">
                        <strong>
                          {order.produceName ||
                            "Produce"}
                        </strong>

                        <span>
                          Business:{" "}
                          {order.businessmanName ||
                            "Unknown"}
                        </span>
                      </div>

                      <div className="order-info">
                        <div>
                          <span>Quantity</span>
                          <strong>
                            {
                              order.quantityOrdered
                            }
                          </strong>
                        </div>

                        <div>
                          <span>Total</span>
                          <strong>
                            ₹
                            {
                              order.totalPrice
                            }
                          </strong>
                        </div>

                        {order.createdAt && (
                          <div>
                            <span>Date</span>
                            <strong>
                              {formatDate(
                                order.createdAt
                              )}
                            </strong>
                          </div>
                        )}
                      </div>

                      <div
                        className={`order-status ${status.className}`}
                      >
                        <StatusIcon
                          size={14}
                        />
                        {status.label}
                      </div>

                      <Link
                        to="/farmer/orders"
                        className="order-view"
                      >
                        <ChevronRight
                          size={17}
                        />
                      </Link>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </section>

        {/* ======================================
            FOOTER
        ====================================== */}

        <div className="dashboard-footer">
          <div>
            <Sprout size={16} />
            <span>
              AgriConnect Farmer Workspace
            </span>
          </div>

          <span>
            Farm • Trade • Deliver
          </span>
        </div>
      </div>

      {/* ========================================
          PAGE CSS
      ======================================== */}

      <style>{`
        .farmer-dashboard {
          width: 100%;
          max-width: 1500px;
          margin: 0 auto;
          padding: 4px 0 34px;
        }

        /* HERO */

        .dashboard-hero {
          position: relative;
          overflow: hidden;
          min-height: 245px;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 30px;
          padding: 38px 42px;
          margin-bottom: 24px;
          border-radius: 30px;
          background:
            linear-gradient(
              135deg,
              #2f3b1e 0%,
              #4c5d26 52%,
              #71833a 100%
            );
          box-shadow:
            0 20px 50px rgba(61, 79, 30, 0.18);
          color: white;
        }

        .hero-left {
          position: relative;
          z-index: 2;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 7px 12px;
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 999px;
          background: rgba(255,255,255,0.09);
          color: #e9f0d5;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.14em;
        }

        .dashboard-hero h1 {
          margin: 16px 0 10px;
          color: white;
          font-size: clamp(34px, 4vw, 50px);
          line-height: 1.02;
          font-weight: 900;
          letter-spacing: -0.045em;
        }

        .dashboard-hero h1 span {
          color: #dce8ac;
        }

        .dashboard-hero p {
          max-width: 590px;
          margin: 0;
          color: #e1e8d0;
          font-size: 14px;
          line-height: 1.7;
        }

        .hero-refresh {
          position: relative;
          z-index: 3;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 13px;
          padding: 11px 15px;
          background: rgba(255,255,255,0.1);
          color: white;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
          backdrop-filter: blur(8px);
          transition: all 0.2s ease;
        }

        .hero-refresh:hover {
          background: rgba(255,255,255,0.17);
          transform: translateY(-1px);
        }

        .hero-circle {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
        }

        .hero-circle-one {
          width: 310px;
          height: 310px;
          right: -110px;
          top: -150px;
          background: rgba(211, 230, 159, 0.11);
        }

        .hero-circle-two {
          width: 200px;
          height: 200px;
          right: 220px;
          bottom: -150px;
          background: rgba(255,255,255,0.055);
        }

        /* ALERT */

        .dashboard-alert {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-bottom: 20px;
          padding: 13px 16px;
          border: 1px solid #fecaca;
          border-radius: 14px;
          background: #fff5f5;
          color: #b42318;
          font-size: 13px;
          font-weight: 700;
        }

        /* STATS */

        .stats-grid {
          display: grid;
          grid-template-columns:
            repeat(3, minmax(0, 1fr));
          gap: 18px;
          margin-bottom: 16px;
        }

        .stat-card {
          position: relative;
          overflow: hidden;
          min-height: 165px;
          padding: 23px;
          border: 1px solid;
          border-radius: 22px;
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }

        .stat-card:hover {
          transform: translateY(-3px);
        }

        .stat-green {
          border-color: #dce7c5;
          background:
            linear-gradient(
              145deg,
              #f8fbf1,
              #eef5df
            );
          box-shadow:
            0 9px 26px rgba(100, 122, 50, 0.07);
        }

        .stat-blue {
          border-color: #dce6f1;
          background:
            linear-gradient(
              145deg,
              #f8fbff,
              #eef4fb
            );
          box-shadow:
            0 9px 26px rgba(73, 101, 139, 0.07);
        }

        .stat-amber {
          border-color: #f0e2ba;
          background:
            linear-gradient(
              145deg,
              #fffdf7,
              #fff7df
            );
          box-shadow:
            0 9px 26px rgba(175, 133, 42, 0.07);
        }

        .stat-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .stat-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 13px;
          background: rgba(255,255,255,0.82);
          box-shadow: 0 4px 12px rgba(0,0,0,0.045);
        }

        .stat-green .stat-icon {
          color: #60752e;
        }

        .stat-blue .stat-icon {
          color: #506d91;
        }

        .stat-amber .stat-icon {
          color: #ae7a21;
        }

        .stat-arrow {
          opacity: 0.34;
        }

        .stat-label {
          margin-top: 18px;
          color: #788272;
          font-size: 12px;
          font-weight: 800;
        }

        .stat-value {
          margin-top: 5px;
          color: #2c3725;
          font-size: 34px;
          line-height: 1;
          font-weight: 900;
          letter-spacing: -0.04em;
        }

        .stat-description {
          margin-top: 8px;
          color: #8b9387;
          font-size: 11px;
          font-weight: 600;
        }

        /* OVERVIEW */

        .overview-grid {
          display: grid;
          grid-template-columns:
            repeat(3, minmax(0, 1fr));
          gap: 13px;
          margin-bottom: 24px;
        }

        .overview-card {
          display: flex;
          align-items: center;
          gap: 11px;
          min-width: 0;
          padding: 14px 16px;
          border-radius: 16px;
          border: 1px solid;
          background: white;
        }

        .overview-green {
          border-color: #e2e9d4;
        }

        .overview-orange {
          border-color: #eee2c9;
        }

        .overview-blue {
          border-color: #dce6f0;
        }

        .overview-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          flex-shrink: 0;
          border-radius: 11px;
        }

        .overview-green .overview-icon {
          background: #edf5df;
          color: #61762e;
        }

        .overview-orange .overview-icon {
          background: #fff3dc;
          color: #ae7a20;
        }

        .overview-blue .overview-icon {
          background: #edf3fa;
          color: #537191;
        }

        .overview-content {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-width: 0;
        }

        .overview-content span {
          color: #879083;
          font-size: 10px;
          font-weight: 800;
        }

        .overview-content strong {
          margin-top: 1px;
          color: #36412e;
          font-size: 19px;
          font-weight: 900;
        }

        .overview-card small {
          color: #a0a79d;
          font-size: 9px;
          font-weight: 700;
          white-space: nowrap;
        }

        /* CONTENT CARD */

        .content-card {
          margin-bottom: 24px;
          overflow: hidden;
          border: 1px solid #e3e8df;
          border-radius: 24px;
          background: white;
          box-shadow:
            0 9px 30px rgba(46, 59, 35, 0.055);
        }

        .section-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 25px 27px 20px;
          border-bottom: 1px solid #edf0ea;
        }

        .section-kicker {
          display: block;
          color: #9aa291;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.16em;
        }

        .section-heading h2 {
          margin: 5px 0 3px;
          color: #29351f;
          font-size: 21px;
          line-height: 1.2;
          font-weight: 900;
        }

        .section-heading p {
          margin: 0;
          color: #899184;
          font-size: 11px;
        }

        /* QUICK ACTION */

        .quick-actions {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap: 16px;
          padding: 22px;
        }

        .quick-action {
          display: flex;
          align-items: center;
          gap: 14px;
          min-width: 0;
          padding: 19px;
          border: 1px solid;
          border-radius: 18px;
          text-decoration: none;
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }

        .quick-action:hover {
          transform: translateY(-2px);
        }

        .quick-action-green {
          border-color: #dce8c6;
          background: #f7faef;
          color: #5c6d31;
        }

        .quick-action-blue {
          border-color: #dce5ef;
          background: #f6f9fd;
          color: #526b89;
        }

        .quick-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 45px;
          height: 45px;
          flex-shrink: 0;
          border-radius: 13px;
          background: white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        .quick-copy {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-width: 0;
        }

        .quick-copy strong {
          color: #364329;
          font-size: 14px;
          font-weight: 900;
        }

        .quick-action-blue .quick-copy strong {
          color: #405773;
        }

        .quick-copy span {
          max-width: 370px;
          margin-top: 3px;
          color: #858f80;
          font-size: 11px;
          line-height: 1.45;
        }

        /* ORDERS */

        .orders-heading {
          padding-bottom: 21px;
        }

        .view-all {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          color: #667732;
          font-size: 12px;
          font-weight: 900;
          text-decoration: none;
        }

        .orders-list {
          width: 100%;
        }

        .order-row {
          display: grid;
          grid-template-columns:
            48px
            minmax(210px, 1.35fr)
            minmax(260px, 1fr)
            auto
            36px;
          align-items: center;
          gap: 18px;
          padding: 18px 27px;
          border-bottom: 1px solid #f0f2ed;
          transition: background 0.15s ease;
        }

        .order-row:last-child {
          border-bottom: none;
        }

        .order-row:hover {
          background: #fbfcfa;
        }

        .order-number {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: #f0f4e7;
          color: #5c6b31;
          font-size: 11px;
          font-weight: 900;
        }

        .order-product {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .order-product strong {
          overflow: hidden;
          color: #35412c;
          font-size: 13px;
          font-weight: 900;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .order-product span {
          margin-top: 3px;
          overflow: hidden;
          color: #8b9488;
          font-size: 10px;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .order-info {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .order-info div {
          display: flex;
          flex-direction: column;
        }

        .order-info span {
          color: #a0a69d;
          font-size: 9px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .order-info strong {
          margin-top: 3px;
          color: #596354;
          font-size: 11px;
          font-weight: 800;
        }

        .order-status {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          border: 1px solid;
          border-radius: 999px;
          padding: 7px 11px;
          font-size: 9px;
          font-weight: 900;
          white-space: nowrap;
        }

        .status-placed {
          border-color: #f2ddb0;
          background: #fff8e8;
          color: #9a6c19;
        }

        .status-confirmed {
          border-color: #d8e4f4;
          background: #f2f7fd;
          color: #4b6687;
        }

        .status-preparing {
          border-color: #e4daf5;
          background: #f8f4fc;
          color: #755b9b;
        }

        .status-ready {
          border-color: #d9e0f4;
          background: #f3f6fc;
          color: #5d6f9e;
        }

        .status-shipped {
          border-color: #f1dcc4;
          background: #fff7ee;
          color: #9f6e35;
        }

        .status-out-for-delivery {
          border-color: #cce7ec;
          background: #f0fafc;
          color: #397582;
        }

        .status-delivered {
          border-color: #cfe7d7;
          background: #effaf2;
          color: #38764b;
        }

        .status-cancelled {
          border-color: #f0cccc;
          background: #fff3f3;
          color: #a54343;
        }

        .status-default {
          border-color: #e2e5df;
          background: #f7f8f6;
          color: #697168;
        }

        .order-view {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border: 1px solid #e2e7de;
          border-radius: 11px;
          color: #7c8577;
          text-decoration: none;
          transition: all 0.15s ease;
        }

        .order-view:hover {
          background: #f4f7f0;
          color: #5f7030;
          border-color: #cfd8c5;
        }

        .empty-state {
          display: flex;
          min-height: 220px;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 30px;
          color: #8c9589;
          text-align: center;
        }

        .empty-state strong {
          color: #3d4936;
          font-size: 14px;
        }

        .empty-state span {
          font-size: 11px;
        }

        .empty-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 55px;
          height: 55px;
          margin-bottom: 7px;
          border-radius: 16px;
          background: #f1f4ec;
          color: #70805a;
        }

        /* FOOTER */

        .dashboard-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 4px 4px 0;
          color: #9aa198;
          font-size: 10px;
          font-weight: 700;
        }

        .dashboard-footer div {
          display: inline-flex;
          align-items: center;
          gap: 7px;
        }

        .dashboard-footer svg {
          color: #71803d;
        }

        /* RESPONSIVE */

        @media (max-width: 1180px) {
          .order-row {
            grid-template-columns:
              44px
              minmax(180px, 1.2fr)
              minmax(190px, 1fr)
              auto
              34px;
            gap: 13px;
          }

          .order-info {
            gap: 14px;
          }
        }

        @media (max-width: 950px) {
          .stats-grid,
          .overview-grid {
            grid-template-columns: 1fr;
          }

          .dashboard-hero {
            align-items: flex-start;
            flex-direction: column;
            min-height: auto;
          }

          .quick-actions {
            grid-template-columns: 1fr;
          }

          .order-row {
            grid-template-columns:
              44px
              1fr
              auto
              34px;
          }

          .order-info {
            grid-column: 2 / 3;
          }

          .order-status {
            grid-column: 3;
            grid-row: 1;
          }

          .order-view {
            grid-column: 4;
            grid-row: 1;
          }
        }

        @media (max-width: 640px) {
          .dashboard-hero {
            padding: 28px 23px;
            border-radius: 22px;
          }

          .dashboard-hero h1 {
            font-size: 34px;
          }

          .section-heading {
            padding: 21px 20px 18px;
          }

          .quick-actions {
            padding: 15px;
          }

          .order-row {
            grid-template-columns:
              42px
              1fr
              34px;
            padding: 17px 20px;
          }

          .order-info {
            grid-column: 2 / 3;
          }

          .order-status {
            grid-column: 2 / 3;
            grid-row: auto;
            justify-self: flex-start;
          }

          .order-view {
            grid-column: 3;
            grid-row: 1;
          }

          .dashboard-footer {
            flex-direction: column;
            align-items: flex-start;
            gap: 6px;
          }
        }
      `}</style>
    </DashboardLayout>
  );
}

export default FarmerDashboard;