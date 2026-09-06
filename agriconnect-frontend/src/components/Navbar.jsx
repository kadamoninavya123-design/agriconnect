import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LogOut,
  Leaf,
  ShieldCheck,
  Store,
  UserRound,
} from "lucide-react";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getInitial = () => {
    if (!user?.name) {
      return "U";
    }

    return user.name
      .trim()
      .charAt(0)
      .toUpperCase();
  };

  const getRoleConfig = (role) => {
    switch (role) {
      case "FARMER":
        return {
          label: "Farmer",
          icon: Leaf,
          classes:
            "bg-[#eef5d7] text-[#53631f] border-[#d8e7a5]",
        };

      case "BUSINESS":
        return {
          label: "Business",
          icon: Store,
          classes:
            "bg-[#edf2f7] text-[#40526b] border-[#d7e0eb]",
        };

      case "ADMIN":
        return {
          label: "Administrator",
          icon: ShieldCheck,
          classes:
            "bg-[#e8ecdb] text-[#465127] border-[#ced8ae]",
        };

      default:
        return {
          label: role || "User",
          icon: UserRound,
          classes:
            "bg-gray-100 text-gray-700 border-gray-200",
        };
    }
  };

  const roleConfig = getRoleConfig(
    user?.role
  );

  const RoleIcon = roleConfig.icon;

  return (
    <header className="sticky top-0 z-40 border-b border-[#dde3d6] bg-white/95 backdrop-blur">
      <div className="flex h-[76px] items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* BRAND */}

        <div
          className="flex cursor-pointer items-center gap-3"
          onClick={() => {
            if (user?.role === "FARMER") {
              navigate("/farmer");
            } else if (
              user?.role === "BUSINESS"
            ) {
              navigate("/business");
            } else if (
              user?.role === "ADMIN"
            ) {
              navigate("/admin");
            }
          }}
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#edf4d6] shadow-sm">
            <Leaf
              size={23}
              strokeWidth={2.2}
              className="text-[#65752d]"
            />
          </div>

          <div className="hidden sm:block">
            <div className="text-[20px] font-extrabold tracking-tight text-[#34401f]">
              AgriConnect
            </div>

            <div className="text-[11px] font-medium tracking-wide text-[#7a846d]">
              FARM • TRADE • DELIVER
            </div>
          </div>
        </div>

        {/* USER AREA */}

        {user && (
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden text-right md:block">
              <p className="text-sm font-bold text-[#26311f]">
                {user.name}
              </p>

              <p className="max-w-[220px] truncate text-xs text-[#7b8574]">
                {user.email}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#697736] text-sm font-extrabold text-white shadow-sm">
                {getInitial()}
              </div>

              <div
                className={`hidden items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold sm:flex ${roleConfig.classes}`}
              >
                <RoleIcon size={14} />
                <span>{roleConfig.label}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="group flex items-center gap-2 rounded-xl border border-[#dce2d6] bg-white px-3 py-2 text-sm font-semibold text-[#586250] shadow-sm transition hover:border-[#bcc6b0] hover:bg-[#f7f9f4] hover:text-[#313b2b]"
            >
              <LogOut
                size={17}
                className="transition-transform group-hover:-translate-x-0.5"
              />

              <span className="hidden sm:inline">
                Logout
              </span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default Navbar;