import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

function DashboardLayout({ children }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        overflowX: "hidden",
      }}
    >
      <Navbar />

      <div
        style={{
          display: "flex",
          width: "100%",
          alignItems: "stretch",
        }}
      >
        <div
          style={{
            flexShrink: 0,
          }}
        >
          <Sidebar />
        </div>

        <main
          style={{
            flex: "1 1 auto",
            width: "calc(100% - 210px)",
            minWidth: 0,
            padding: "24px",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "none",
              margin: 0,
              boxSizing: "border-box",
            }}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;