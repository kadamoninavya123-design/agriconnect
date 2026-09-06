import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sprout,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

import { loginUser } from "../api/authApi";
import GoogleLoginButton from "../components/GoogleLoginButton";
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

  // =========================
  // NORMAL LOGIN
  // =========================
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

  // =========================
  // GOOGLE LOGIN SUCCESS
  // =========================
  const handleGoogleSuccess = useCallback(
    (authResponse) => {
      login(authResponse);

      if (authResponse.role === "ADMIN") {
        navigate("/admin");
      } else if (authResponse.role === "FARMER") {
        navigate("/farmer");
      } else if (authResponse.role === "BUSINESS") {
        navigate("/business");
      } else {
        navigate("/");
      }
    },
    [login, navigate]
  );

  // =========================
  // GOOGLE LOGIN ERROR
  // =========================
  const handleGoogleError = useCallback((message) => {
    setError(message);
  }, []);

  return (
    <div className="sc-page">

      <div className="sc-shell">

        {/* =========================
            ILLUSTRATION SIDE
        ========================= */}

        <section className="sc-illustration-panel">

          <div className="sc-illustration-top">
            <Sprout size={20} />
            <span>AgriConnect</span>
          </div>

          <div className="sc-illustration-mid">

            <h2>
              Welcome back to
              <br />
              AgriConnect
            </h2>

            <p>
              Connecting farmers directly with
              businesses — fresh produce, fair prices.
            </p>

            <svg
              className="sc-plant-svg"
              viewBox="0 0 200 200"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <ellipse
                cx="100"
                cy="178"
                rx="52"
                ry="9"
                fill="#2f421c"
                opacity="0.25"
              />

              <rect
                x="96"
                y="90"
                width="8"
                height="88"
                rx="4"
                fill="#dcedb0"
              />

              <path
                d="M100 130 C70 130 55 108 58 82 C82 86 100 104 100 130Z"
                fill="#bcdb7e"
              />

              <path
                d="M100 112 C130 112 145 90 142 64 C118 68 100 86 100 112Z"
                fill="#a9d068"
              />

              <path
                d="M100 96 C82 96 70 80 72 60 C90 63 100 78 100 96Z"
                fill="#cfe89b"
              />

              <circle
                cx="150"
                cy="52"
                r="16"
                fill="#f4d35e"
              />
            </svg>

          </div>

          <div className="sc-illustration-stats">

            <div>
              <strong>500+</strong>
              <span>Farmers</span>
            </div>

            <div>
              <strong>300+</strong>
              <span>Businesses</span>
            </div>

            <div>
              <strong>2K+</strong>
              <span>Produce Listed</span>
            </div>

          </div>

          <div className="sc-illustration-circle sc-circle-one" />
          <div className="sc-illustration-circle sc-circle-two" />

        </section>


        {/* =========================
            FORM SIDE
        ========================= */}

        <section className="sc-form-panel">

          <div className="sc-mobile-logo">
            <Sprout size={18} />
            AgriConnect
          </div>

          <div className="sc-form-inner">

            <h1>Log in</h1>

            <p className="sc-subtitle">
              Enter your details to access your account.
            </p>


            {/* ERROR */}

            {error && (
              <div className="sc-error">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}


            {/* =========================
                NORMAL LOGIN FORM
            ========================= */}

            <form
              onSubmit={handleSubmit}
              className="sc-form"
            >

              {/* EMAIL */}

              <label>

                <span>Email</span>

                <div className="sc-input">

                  <Mail size={16} />

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

                <div className="sc-input">

                  <Lock size={16} />

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


              {/* SIGN IN BUTTON */}

              <button
                type="submit"
                disabled={loading}
                className="sc-submit"
              >

                {loading ? (
                  <>
                    <span className="sc-spinner" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight size={16} />
                  </>
                )}

              </button>

            </form>


            {/* =========================
                GOOGLE LOGIN
            ========================= */}

            <div
              style={{
                textAlign: "center",
                marginTop: "18px",
              }}
            >

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "12px",
                }}
              >

                <div
                  style={{
                    flex: 1,
                    height: "1px",
                    background: "#e0e4d9",
                  }}
                />

                <span
                  style={{
                    color: "#9aa192",
                    fontSize: "11px",
                    fontWeight: "600",
                  }}
                >
                  OR
                </span>

                <div
                  style={{
                    flex: 1,
                    height: "1px",
                    background: "#e0e4d9",
                  }}
                />

              </div>


              <GoogleLoginButton
                role={null}
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
              />

            </div>


            {/* SIGN UP */}

            <p className="sc-switch">

              Don't have an account?{" "}

              <button
                type="button"
                onClick={() =>
                  navigate("/register")
                }
              >
                Sign up
              </button>

            </p>

          </div>

        </section>

      </div>


      {/* =========================
          STYLES
      ========================= */}

      <style>{`

        .sc-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: #eef0e7;
        }

        .sc-shell {
          width: min(100%, 980px);
          display: grid;
          grid-template-columns: 1fr 1fr;
          overflow: hidden;
          border-radius: 24px;
          background: white;
          box-shadow: 0 20px 55px rgba(30,38,20,0.10);
        }

        .sc-illustration-panel {
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          padding: 34px;
          background: linear-gradient(
            160deg,
            #2c3d1c 0%,
            #4c6329 55%,
            #6f8a3c 100%
          );
          color: white;
        }

        .sc-illustration-top {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          gap: 9px;
          color: #e4edc9;
          font-size: 15px;
          font-weight: 800;
        }

        .sc-illustration-mid {
          position: relative;
          z-index: 2;
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          gap: 14px;
          padding: 20px 0;
        }

        .sc-illustration-mid h2 {
          margin: 0;
          font-size: 24px;
          font-weight: 800;
          line-height: 1.3;
          letter-spacing: -0.02em;
        }

        .sc-illustration-mid p {
          max-width: 260px;
          margin: 0;
          color: #d3ddbc;
          font-size: 12.5px;
          line-height: 1.6;
        }

        .sc-plant-svg {
          width: 130px;
          height: 130px;
          margin-top: 6px;
        }

        .sc-illustration-stats {
          position: relative;
          z-index: 2;
          display: flex;
          justify-content: space-between;
          gap: 10px;
        }

        .sc-illustration-stats > div {
          flex: 1;
          text-align: center;
          padding: 12px 6px;
          border-radius: 13px;
          background: rgba(255,255,255,0.09);
        }

        .sc-illustration-stats strong {
          display: block;
          font-size: 17px;
          font-weight: 800;
        }

        .sc-illustration-stats span {
          display: block;
          margin-top: 3px;
          color: #cdd8b5;
          font-size: 9px;
          font-weight: 700;
        }

        .sc-illustration-circle {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
        }

        .sc-circle-one {
          width: 260px;
          height: 260px;
          top: -120px;
          right: -110px;
          background: rgba(255,255,255,0.05);
        }

        .sc-circle-two {
          width: 190px;
          height: 190px;
          left: -100px;
          bottom: -100px;
          background: rgba(220,237,176,0.07);
        }

        .sc-form-panel {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
          background: white;
        }

        .sc-mobile-logo {
          display: none;
        }

        .sc-form-inner {
          width: 100%;
          max-width: 320px;
        }

        .sc-form-inner h1 {
          margin: 0;
          color: #202a19;
          font-size: 25px;
          font-weight: 800;
          letter-spacing: -0.02em;
        }

        .sc-subtitle {
          margin: 8px 0 0;
          color: #838d7a;
          font-size: 12.5px;
          line-height: 1.5;
        }

        .sc-error {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          margin-top: 20px;
          padding: 11px 12px;
          border: 1px solid #f0d2d2;
          border-radius: 10px;
          background: #fdf6f6;
          color: #a44848;
          font-size: 11.5px;
          font-weight: 600;
          line-height: 1.5;
        }

        .sc-form {
          display: grid;
          gap: 16px;
          margin-top: 24px;
        }

        .sc-form label {
          display: grid;
          gap: 6px;
        }

        .sc-form label > span {
          color: #4c5644;
          font-size: 12px;
          font-weight: 700;
        }

        .sc-input {
          display: flex;
          align-items: center;
          gap: 9px;
          height: 44px;
          padding: 0 13px;
          border: 1px solid #dde2d5;
          border-radius: 11px;
          background: #fbfcf9;
          color: #93998a;
          transition: border-color 0.15s ease, background 0.15s ease;
        }

        .sc-input:focus-within {
          border-color: #6c8140;
          background: white;
        }

        .sc-input input {
          width: 100%;
          min-width: 0;
          border: none;
          outline: none;
          background: transparent;
          color: #232c1c;
          font-size: 13px;
        }

        .sc-input input::placeholder {
          color: #a9b09e;
        }

        .sc-submit {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          height: 46px;
          margin-top: 4px;
          border: none;
          border-radius: 11px;
          background: #45611f;
          color: white;
          font-size: 13px;
          font-weight: 700;
          transition: background 0.15s ease;
          cursor: pointer;
        }

        .sc-submit:hover:not(:disabled) {
          background: #395019;
        }

        .sc-submit:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .sc-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255,255,255,0.4);
          border-top-color: white;
          border-radius: 50%;
          animation: sc-spin 0.7s linear infinite;
        }

        @keyframes sc-spin {
          to {
            transform: rotate(360deg);
          }
        }

        .sc-switch {
          margin: 22px 0 0;
          color: #838d7a;
          font-size: 12px;
        }

        .sc-switch button {
          border: none;
          background: transparent;
          color: #45611f;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
        }

        @media (max-width: 860px) {

          .sc-shell {
            grid-template-columns: 1fr;
            max-width: 420px;
          }

          .sc-illustration-panel {
            display: none;
          }

          .sc-mobile-logo {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            margin-bottom: 22px;
            color: #405025;
            font-size: 17px;
            font-weight: 800;
          }

          .sc-form-panel {
            padding: 36px 26px;
          }

        }

      `}</style>

    </div>
  );
}

export default Login;