import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../api/axiosConfig";
import {
  Package,
  ShoppingCart,
  Clock3,
  ArrowUpRight,
  Plus,
  ChevronRight,
  Sprout,
  Truck,
  CircleCheck,
  AlertCircle,
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

      const res = await api.get(
        "/orders/farmer-stats"
      );

      setStats({
        totalProducts:
          res.data?.totalProducts ?? 0,

        totalOrders:
          res.data?.totalOrders ?? 0,

        pendingOrders:
          res.data?.pendingOrders ?? 0,

        recentOrders:
          Array.isArray(
            res.data?.recentOrders
          )
            ? res.data.recentOrders
            : [],
      });
    } catch (err) {
      console.error(
        "Failed to load farmer statistics",
        err
      );

      setError(
        "Unable to load dashboard statistics."
      );
    } finally {
      setLoading(false);
    }
  };

  const deliveredCount = useMemo(() => {
    return stats.recentOrders.filter(
      (order) =>
        order.status === "DELIVERED"
    ).length;
  }, [stats.recentOrders]);

  const activeDeliveries = useMemo(() => {
    return stats.recentOrders.filter(
      (order) =>
        order.status ===
          "SHIPPED" ||
        order.status ===
          "OUT_FOR_DELIVERY"
    ).length;
  }, [stats.recentOrders]);

  const getStatusConfig = (status) => {
    switch (status) {
      case "PLACED":
        return {
          label: "Placed",
          className:
            "bg-amber-50 text-amber-700 border-amber-200",
          icon: Clock3,
        };

      case "CONFIRMED":
        return {
          label: "Confirmed",
          className:
            "bg-blue-50 text-blue-700 border-blue-200",
          icon: CircleCheck,
        };

      case "PREPARING":
        return {
          label: "Preparing",
          className:
            "bg-violet-50 text-violet-700 border-violet-200",
          icon: Package,
        };

      case "READY":
        return {
          label: "Ready",
          className:
            "bg-indigo-50 text-indigo-700 border-indigo-200",
          icon: Package,
        };

      case "SHIPPED":
        return {
          label: "Shipped",
          className:
            "bg-orange-50 text-orange-700 border-orange-200",
          icon: Truck,
        };

      case "OUT_FOR_DELIVERY":
        return {
          label: "Out for Delivery",
          className:
            "bg-pink-50 text-pink-700 border-pink-200",
          icon: Truck,
        };

      case "DELIVERED":
        return {
          label: "Delivered",
          className:
            "bg-emerald-50 text-emerald-700 border-emerald-200",
          icon: CircleCheck,
        };

      case "CANCELLED":
        return {
          label: "Cancelled",
          className:
            "bg-red-50 text-red-700 border-red-200",
          icon: AlertCircle,
        };

      default:
        return {
          label: status || "Unknown",
          className:
            "bg-gray-50 text-gray-700 border-gray-200",
          icon: Clock3,
        };
    }
  };

  const formatDate = (value) => {
    if (!value) return "";

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
      title: "Total Products",
      value: stats.totalProducts,
      subtitle: "Active listings",
      icon: Package,
      iconBg: "bg-[#edf4d6]",
      iconColor: "text-[#66752f]",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      subtitle: "All received orders",
      icon: ShoppingCart,
      iconBg: "bg-[#edf2fa]",
      iconColor: "text-[#4d668b]",
    },
    {
      title: "Pending Orders",
      value: stats.pendingOrders,
      subtitle:
        stats.pendingOrders === 0
          ? "Everything is on track"
          : "Needs your attention",
      icon: Clock3,
      iconBg: "bg-[#fff6dc]",
      iconColor: "text-[#b17b18]",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-7">

        {/* =========================================
            PAGE HEADER
        ========================================= */}

        <section className="relative overflow-hidden rounded-[28px] border border-[#dfe6d2] bg-gradient-to-br from-[#3f4926] via-[#59672d] to-[#77863e] px-7 py-8 text-white shadow-[0_18px_45px_rgba(63,73,38,0.18)] sm:px-9">
          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold tracking-wide text-[#f0f5df] backdrop-blur">
                <Sprout size={14} />
                FARMER WORKSPACE
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                Farmer Dashboard
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#e5ebcf] sm:text-base">
                Manage your produce, track incoming orders,
                and keep your deliveries moving smoothly.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchStats}
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/15"
            >
              Refresh
              <ArrowUpRight size={16} />
            </button>
          </div>

          <div className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-24 left-1/3 h-60 w-60 rounded-full bg-[#d4de95]/10 blur-3xl" />
        </section>

        {/* =========================================
            ERROR
        ========================================= */}

        {error && (
          <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {/* =========================================
            STAT CARDS
        ========================================= */}

        <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {statCards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.title}
                className="group rounded-[22px] border border-[#e1e6db] bg-white p-6 shadow-[0_8px_25px_rgba(45,55,30,0.06)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_16px_35px_rgba(45,55,30,0.1)]"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#7a8473]">
                      {card.title}
                    </p>

                    <p className="mt-3 text-4xl font-extrabold tracking-tight text-[#29351f]">
                      {loading
                        ? "—"
                        : card.value}
                    </p>

                    <p className="mt-2 text-xs font-medium text-[#8a9384]">
                      {card.subtitle}
                    </p>
                  </div>

                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl ${card.iconBg} ${card.iconColor}`}
                  >
                    <Icon size={22} />
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {/* =========================================
            SUMMARY STRIP
        ========================================= */}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#e1e6db] bg-white px-5 py-4">
            <p className="text-xs font-bold uppercase tracking-wider text-[#919989]">
              Recent orders
            </p>
            <p className="mt-1 text-xl font-extrabold text-[#2c3725]">
              {loading
                ? "—"
                : stats.recentOrders.length}
            </p>
          </div>

          <div className="rounded-2xl border border-[#e1e6db] bg-white px-5 py-4">
            <p className="text-xs font-bold uppercase tracking-wider text-[#919989]">
              Active deliveries
            </p>
            <p className="mt-1 text-xl font-extrabold text-[#2c3725]">
              {loading
                ? "—"
                : activeDeliveries}
            </p>
          </div>

          <div className="rounded-2xl border border-[#e1e6db] bg-white px-5 py-4">
            <p className="text-xs font-bold uppercase tracking-wider text-[#919989]">
              Delivered recently
            </p>
            <p className="mt-1 text-xl font-extrabold text-[#2c3725]">
              {loading
                ? "—"
                : deliveredCount}
            </p>
          </div>
        </section>

        {/* =========================================
            QUICK ACTIONS
        ========================================= */}

        <section className="rounded-[24px] border border-[#e1e6db] bg-white p-6 shadow-[0_8px_25px_rgba(45,55,30,0.05)] sm:p-7">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#8e977f]">
                Shortcuts
              </p>

              <h2 className="mt-1 text-xl font-extrabold text-[#29351f]">
                Quick Actions
              </h2>

              <p className="mt-1 text-sm text-[#7c8576]">
                Jump directly to the task you need.
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Link
              to="/farmer/products"
              className="group flex items-center justify-between rounded-2xl border border-[#dce6c8] bg-[#f6f8ef] p-5 transition hover:-translate-y-0.5 hover:border-[#c7d5a6] hover:bg-[#f1f5e5]"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#687836] shadow-sm">
                  <Plus size={21} />
                </div>

                <div>
                  <p className="font-bold text-[#374325]">
                    Manage My Products
                  </p>

                  <p className="mt-1 text-xs text-[#7f8876]">
                    Add, view or remove produce listings
                  </p>
                </div>
              </div>

              <ChevronRight
                size={19}
                className="text-[#84905e] transition-transform group-hover:translate-x-1"
              />
            </Link>

            <Link
              to="/farmer/orders"
              className="group flex items-center justify-between rounded-2xl border border-[#dbe4ef] bg-[#f5f8fc] p-5 transition hover:-translate-y-0.5 hover:border-[#c5d4e7] hover:bg-[#f0f5fa]"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#506887] shadow-sm">
                  <ShoppingCart size={20} />
                </div>

                <div>
                  <p className="font-bold text-[#37465b]">
                    View Orders
                  </p>

                  <p className="mt-1 text-xs text-[#7d8897]">
                    Process orders and manage deliveries
                  </p>
                </div>
              </div>

              <ChevronRight
                size={19}
                className="text-[#7689a1] transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>
        </section>

        {/* =========================================
            RECENT ORDERS
        ========================================= */}

        <section className="rounded-[24px] border border-[#e1e6db] bg-white shadow-[0_8px_25px_rgba(45,55,30,0.05)]">
          <div className="flex flex-col gap-3 border-b border-[#edf0e8] px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#8e977f]">
                Activity
              </p>

              <h2 className="mt-1 text-xl font-extrabold text-[#29351f]">
                Recent Orders
              </h2>
            </div>

            <Link
              to="/farmer/orders"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-[#637331] hover:text-[#4f5f24]"
            >
              View all
              <ChevronRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="px-6 py-12 text-center text-sm text-[#899184]">
              Loading recent orders...
            </div>
          ) : stats.recentOrders.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f3f5ed] text-[#7b875d]">
                <Package size={24} />
              </div>

              <p className="mt-4 font-bold text-[#39432f]">
                No recent orders
              </p>

              <p className="mt-1 text-sm text-[#899184]">
                New orders will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#edf0e8]">
              {stats.recentOrders.map((order) => {
                const status =
                  getStatusConfig(
                    order.status
                  );

                const StatusIcon =
                  status.icon;

                return (
                  <div
                    key={order.id}
                    className="flex flex-col gap-5 px-6 py-5 transition hover:bg-[#fafbf8] sm:flex-row sm:items-center sm:justify-between sm:px-7"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-extrabold text-[#2e3928]">
                          Order #{order.id}
                        </p>

                        <span className="text-[#a0a79c]">
                          •
                        </span>

                        <p className="truncate text-sm font-semibold text-[#687263]">
                          {order.produceName ||
                            "Produce"}
                        </p>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-[#8a9285]">
                        <span>
                          Business:{" "}
                          <strong className="text-[#606a5b]">
                            {order.businessmanName ||
                              "Unknown"}
                          </strong>
                        </span>

                        <span>
                          Qty:{" "}
                          <strong className="text-[#606a5b]">
                            {order.quantityOrdered}
                          </strong>
                        </span>

                        <span>
                          Total:{" "}
                          <strong className="text-[#606a5b]">
                            ₹
                            {order.totalPrice}
                          </strong>
                        </span>

                        {order.createdAt && (
                          <span>
                            {formatDate(
                              order.createdAt
                            )}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-extrabold ${status.className}`}
                      >
                        <StatusIcon size={13} />
                        {status.label}
                      </span>

                      <Link
                        to="/farmer/orders"
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e1e6db] bg-white text-[#6e786a] transition hover:border-[#ccd5c5] hover:bg-[#f7f9f5]"
                        aria-label={`View order ${order.id}`}
                      >
                        <ChevronRight
                          size={17}
                        />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}

export default FarmerDashboard;