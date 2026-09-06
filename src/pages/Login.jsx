import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Leaf,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  Truck,
  Sprout,
} from "lucide-react";
import { loginUser } from "../api/authApi";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const res = await loginUser(form);

      login(res.data);

      if (res.data.role === "ADMIN") {
        navigate("/admin");
      } else if (res.data.role === "FARMER") {
        navigate("/farmer");
      } else if (res.data.role === "BUSINESS") {
        navigate("/business");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(
        err.response?.data ||
          "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-modern-page">

      {/* =========================
          LEFT BRAND PANEL
      ========================= */}

      <section className="auth-brand-panel">
        <div className="brand-content">

          <div className="brand-logo">
            <div className="brand-logo-icon">
              <Leaf size={24} />
            </div>

            <div>
              <strong>AgriConnect</strong>
              <span>
                FARM • TRADE • DELIVER
              </span>
            </div>
          </div>

          <div className="brand-main">

            <div className="brand-tag">
              <Sprout size={15} />
              SMART AGRICULTURE MARKETPLACE
            </div>

            <h1>
              From the farm
              <br />
              <span>to your business.</span>
            </h1>

            <p>
              Connect directly with farmers,
              discover fresh produce, manage orders,
              and track deliveries in one simple platform.
            </p>

            <div className="brand-features">

              <div className="brand-feature">
                <div>
                  <Sprout size={18} />
                </div>

                <section>
                  <strong>
                    Direct from farmers
                  </strong>

                  <span>
                    Fresh produce with transparent sourcing.
                  </span>
                </section>
              </div>

              <div className="brand-feature">
                <div>
                  <Truck size={18} />
                </div>

                <section>
                  <strong>
                    Delivery tracking
                  </strong>

                  <span>
                    Stay updated from shipment to delivery.
                  </span>
                </section>
              </div>

              <div className="brand-feature">
                <div>
                  <ShieldCheck size={18} />
                </div>

                <section>
                  <strong>
                    Trusted marketplace
                  </strong>

                  <span>
                    A simple and secure farm-to-business network.
                  </span>
                </section>
              </div>

            </div>
          </div>

          <div className="brand-footer">
            <span>
              © {new Date().getFullYear()} AgriConnect
            </span>

            <span>
              Better connections. Better agriculture.
            </span>
          </div>
        </div>

        <div className="auth-decoration auth-decoration-one" />
        <div className="auth-decoration auth-decoration-two" />
        <div className="auth-decoration auth-decoration-three" />
      </section>

      {/* =========================
          LOGIN PANEL
      ========================= */}

      <section className="auth-form-panel">

        <div className="mobile-brand">
          <div className="mobile-brand-icon">
            <Leaf size={21} />
          </div>

          <span>
            AgriConnect
          </span>
        </div>

        <div className="login-card">

          <div className="form-heading">
            <div className="form-kicker">
              WELCOME BACK
            </div>

            <h2>
              Sign in to your account
            </h2>

            <p>
              Enter your details to continue to
              AgriConnect.
            </p>
          </div>

          {error && (
            <div className="auth-error-modern">
              <ShieldCheck size={17} />
              <span>{error}</span>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="modern-auth-form"
          >

            {/* EMAIL */}

            <label>
              <span>Email address</span>

              <div className="input-wrapper">
                <Mail size={18} />

                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />
              </div>
            </label>

            {/* PASSWORD */}

            <label>
              <span>Password</span>

              <div className="input-wrapper">
                <Lock size={18} />

                <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                />
              </div>
            </label>

            {/* SUBMIT */}

            <button
              type="submit"
              disabled={loading}
              className="auth-submit"
            >
              {loading ? (
                <>
                  <span className="auth-spinner" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="auth-divider">
            <span>New to AgriConnect?</span>
          </div>

          <button
            type="button"
            className="secondary-auth-button"
            onClick={() =>
              navigate("/register")
            }
          >
            Create an account
            <ArrowRight size={17} />
          </button>

          <p className="auth-small-note">
            By continuing, you agree to use
            AgriConnect responsibly and securely.
          </p>

        </div>
      </section>

      <style>{`
        .auth-modern-page {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          background: #f5f7f1;
          color: #283421;
        }

        /* =========================
           BRAND PANEL
        ========================= */

        .auth-brand-panel {
          position: relative;
          min-height: 100vh;
          overflow: hidden;
          background:
            linear-gradient(
              145deg,
              #263519 0%,
              #39491f 42%,
              #657638 100%
            );
          color: white;
        }

        .brand-content {
          position: relative;
          z-index: 3;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          padding: 46px 8vw 34px;
        }

        .brand-logo {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .brand-logo-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 15px;
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.16);
          color: #dce9b0;
          box-shadow:
            0 8px 22px rgba(0,0,0,0.12);
        }

        .brand-logo strong {
          display: block;
          font-size: 21px;
          line-height: 1.1;
          font-weight: 900;
          letter-spacing: -0.03em;
        }

        .brand-logo span {
          display: block;
          margin-top: 4px;
          color: #cbd7ad;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.15em;
        }

        .brand-main {
          max-width: 650px;
          margin: auto 0;
        }

        .brand-tag {
          width: max-content;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 999px;
          background: rgba(255,255,255,0.08);
          color: #e4edcd;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.13em;
        }

        .brand-main h1 {
          margin: 21px 0 16px;
          color: white;
          font-size: clamp(40px, 5vw, 66px);
          line-height: 1;
          font-weight: 900;
          letter-spacing: -0.055em;
        }

        .brand-main h1 span {
          color: #dbe8ac;
        }

        .brand-main > p {
          max-width: 570px;
          margin: 0;
          color: #d3ddc0;
          font-size: 15px;
          line-height: 1.8;
        }

        .brand-features {
          margin-top: 34px;
          display: grid;
          gap: 13px;
        }

        .brand-feature {
          display: flex;
          align-items: center;
          gap: 13px;
        }

        .brand-feature > div {
          width: 41px;
          height: 41px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border-radius: 12px;
          background: rgba(255,255,255,0.09);
          border: 1px solid rgba(255,255,255,0.1);
          color: #d9e7a9;
        }

        .brand-feature section {
          display: flex;
          flex-direction: column;
        }

        .brand-feature strong {
          color: white;
          font-size: 12px;
          font-weight: 800;
        }

        .brand-feature span {
          margin-top: 3px;
          color: #bfcbb0;
          font-size: 10px;
          line-height: 1.5;
        }

        .brand-footer {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          color: #aebba2;
          font-size: 9px;
          font-weight: 700;
        }

        .auth-decoration {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
        }

        .auth-decoration-one {
          width: 460px;
          height: 460px;
          top: -240px;
          right: -170px;
          background: rgba(214,232,165,0.08);
        }

        .auth-decoration-two {
          width: 330px;
          height: 330px;
          right: 10%;
          bottom: -230px;
          background: rgba(255,255,255,0.05);
        }

        .auth-decoration-three {
          width: 180px;
          height: 180px;
          left: -100px;
          bottom: 20%;
          background: rgba(189,216,110,0.08);
        }

        /* =========================
           FORM PANEL
        ========================= */

        .auth-form-panel {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 45px;
          background:
            radial-gradient(
              circle at top right,
              #eef4df 0%,
              transparent 34%
            ),
            #f5f7f1;
        }

        .login-card {
          width: min(100%, 455px);
          padding: 42px;
          border: 1px solid #dde5d4;
          border-radius: 28px;
          background: rgba(255,255,255,0.95);
          box-shadow:
            0 24px 65px rgba(45,58,32,0.11);
        }

        .mobile-brand {
          display: none;
        }

        .form-kicker {
          color: #6d7c39;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.16em;
        }

        .form-heading h2 {
          margin: 8px 0 8px;
          color: #283421;
          font-size: 29px;
          line-height: 1.15;
          font-weight: 900;
          letter-spacing: -0.035em;
        }

        .form-heading p {
          margin: 0;
          color: #87907e;
          font-size: 12px;
          line-height: 1.6;
        }

        .auth-error-modern {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          margin-top: 22px;
          padding: 13px 14px;
          border: 1px solid #f0cccc;
          border-radius: 13px;
          background: #fff4f4;
          color: #a33f3f;
          font-size: 11px;
          font-weight: 700;
          line-height: 1.5;
        }

        .modern-auth-form {
          display: grid;
          gap: 19px;
          margin-top: 27px;
        }

        .modern-auth-form label {
          display: grid;
          gap: 7px;
        }

        .modern-auth-form label > span {
          color: #495442;
          font-size: 11px;
          font-weight: 800;
        }

        .input-wrapper {
          display: flex;
          align-items: center;
          gap: 10px;
          height: 50px;
          padding: 0 14px;
          border: 1px solid #dce3d7;
          border-radius: 14px;
          background: #fbfcfa;
          color: #8b9585;
          transition: all 0.2s ease;
        }

        .input-wrapper:focus-within {
          border-color: #819548;
          background: white;
          box-shadow:
            0 0 0 4px rgba(129,149,72,0.1);
        }

        .input-wrapper input {
          width: 100%;
          min-width: 0;
          border: none;
          outline: none;
          background: transparent;
          color: #293524;
          font-size: 13px;
        }

        .input-wrapper input::placeholder {
          color: #adb5a9;
        }

        .auth-submit {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          width: 100%;
          height: 51px;
          margin-top: 4px;
          border: none;
          border-radius: 14px;
          background:
            linear-gradient(
              135deg,
              #526728,
              #748b3c
            );
          color: white;
          font-size: 13px;
          font-weight: 900;
          box-shadow:
            0 9px 22px rgba(86,109,43,0.21);
          transition: all 0.2s ease;
        }

        .auth-submit:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow:
            0 13px 27px rgba(86,109,43,0.25);
        }

        .auth-submit:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .auth-spinner {
          width: 15px;
          height: 15px;
          border: 2px solid rgba(255,255,255,0.4);
          border-top-color: white;
          border-radius: 50%;
          animation: auth-spin 0.7s linear infinite;
        }

        @keyframes auth-spin {
          to {
            transform: rotate(360deg);
          }
        }

        .auth-divider {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 26px 0 17px;
        }

        .auth-divider::before {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          top: 50%;
          height: 1px;
          background: #edf0eb;
        }

        .auth-divider span {
          position: relative;
          z-index: 1;
          padding: 0 11px;
          background: white;
          color: #a0a89c;
          font-size: 10px;
          font-weight: 700;
        }

        .secondary-auth-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          height: 47px;
          border: 1px solid #dbe3d6;
          border-radius: 13px;
          background: #f8faf6;
          color: #556340;
          font-size: 12px;
          font-weight: 900;
          transition: all 0.2s ease;
        }

        .secondary-auth-button:hover {
          background: #f1f5ea;
          border-color: #cbd7bc;
          transform: translateY(-1px);
        }

        .auth-small-note {
          margin: 18px 0 0;
          color: #9aa297;
          font-size: 9px;
          line-height: 1.6;
          text-align: center;
        }

        @media (max-width: 950px) {
          .auth-modern-page {
            grid-template-columns: 1fr;
          }

          .auth-brand-panel {
            display: none;
          }

          .auth-form-panel {
            min-height: 100vh;
            padding: 25px 18px;
          }

          .mobile-brand {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 9px;
            margin-bottom: 22px;
            color: #405025;
            font-size: 18px;
            font-weight: 900;
          }

          .mobile-brand-icon {
            display: flex;
            width: 38px;
            height: 38px;
            align-items: center;
            justify-content: center;
            border-radius: 12px;
            background: #e8f0d5;
            color: #647431;
          }

          .login-card {
            padding: 31px 25px;
            border-radius: 23px;
          }
        }

        @media (max-width: 500px) {
          .auth-form-panel {
            padding: 17px 12px;
          }

          .login-card {
            padding: 27px 20px;
          }

          .form-heading h2 {
            font-size: 25px;
          }
        }
      `}</style>
    </div>
  );
}

export default Login;