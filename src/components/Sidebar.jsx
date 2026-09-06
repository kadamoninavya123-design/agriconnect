import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Package,
  ShoppingCart,
  Users,
  LayoutDashboard,
  Search,
  BarChart3,
  Sprout,
} from "lucide-react";

function Sidebar() {
  const { user } = useAuth();

  const farmerLinks = [
    {
      to: "/farmer",
      icon: LayoutDashboard,
      label: "Dashboard",
    },
    {
      to: "/farmer/products",
      icon: Package,
      label: "My Products",
    },
    {
      to: "/farmer/orders",
      icon: ShoppingCart,
      label: "Orders",
    },
  ];

  const businessLinks = [
    {
      to: "/business",
      icon: LayoutDashboard,
      label: "Dashboard",
    },
    {
      to: "/business/browse",
      icon: Search,
      label: "Browse Products",
    },
    {
      to: "/business/orders",
      icon: ShoppingCart,
      label: "My Orders",
    },
  ];

  const adminLinks = [
    {
      to: "/admin",
      icon: LayoutDashboard,
      label: "Dashboard",
    },
    {
      to: "/admin/users",
      icon: Users,
      label: "User Management",
    },
    {
      to: "/admin/products",
      icon: Package,
      label: "Product Management",
    },
    {
      to: "/admin/orders",
      icon: ShoppingCart,
      label: "Order Management",
    },
  ];

  const getLinks = () => {
    if (user?.role === "FARMER") {
      return farmerLinks;
    }

    if (user?.role === "BUSINESS") {
      return businessLinks;
    }

    if (user?.role === "ADMIN") {
      return adminLinks;
    }

    return [];
  };

  const links = getLinks();

  const getRoleLabel = () => {
    if (user?.role === "FARMER") {
      return "Farmer Workspace";
    }

    if (user?.role === "BUSINESS") {
      return "Business Workspace";
    }

    if (user?.role === "ADMIN") {
      return "Administration";
    }

    return "Workspace";
  };

  return (
    <aside className="sticky top-[76px] hidden h-[calc(100vh-76px)] w-[250px] flex-shrink-0 border-r border-[#dde3d6] bg-white lg:flex lg:flex-col">
      <div className="flex-1 px-4 py-6">
        {/* SECTION HEADING */}

        <div className="mb-4 px-3">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#9aa28f]">
            {getRoleLabel()}
          </p>
        </div>

        {/* NAVIGATION */}

        <nav className="space-y-2">
          {links.map((link) => {
            const Icon = link.icon;

            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={
                  link.to ===
                    "/farmer" ||
                  link.to ===
                    "/business" ||
                  link.to ===
                    "/admin"
                }
                className={({ isActive }) =>
                  [
                    "group relative flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-semibold transition-all duration-200",
                    isActive
                      ? "bg-[#eaf1cf] text-[#435020] shadow-sm"
                      : "text-[#667060] hover:bg-[#f5f7f2] hover:text-[#33401f]",
                  ].join(" ")
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-[#71813a]" />
                    )}

                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
                        isActive
                          ? "bg-white text-[#687934] shadow-sm"
                          : "bg-[#f4f6f0] text-[#7a8471] group-hover:bg-white"
                      }`}
                    >
                      <Icon size={19} />
                    </div>

                    <span>
                      {link.label}
                    </span>

                    {isActive && (
                      <span className="ml-auto h-2 w-2 rounded-full bg-[#71813a]" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* SIDEBAR FOOTER */}

      <div className="border-t border-[#edf0ea] p-4">
        <div className="rounded-2xl bg-[#f5f7ef] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e4ecc2]">
              <Sprout
                size={17}
                className="text-[#65752d]"
              />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-bold text-[#45502f]">
                AgriConnect
              </p>

              <p className="truncate text-[11px] text-[#87907b]">
                Farm to business
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;