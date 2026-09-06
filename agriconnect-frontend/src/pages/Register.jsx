import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Sprout,
  Lock,
  Mail,
  AlertCircle,
  Store,
  UserRound,
} from "lucide-react";

import { registerUser } from "../api/authApi";
import GoogleLoginButton from "../components/GoogleLoginButton";
import { useAuth } from "../context/AuthContext";

function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "BUSINESS",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // =========================
  // NORMAL SIGNUP
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await registerUser(form);
      navigate("/login");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Registration failed. Is the backend running?"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // GOOGLE SIGNUP SUCCESS
  // =========================
  const handleGoogleSuccess = useCallback(
    (authResponse) => {
      login(authResponse);

      if (authResponse.role === "FARMER") {
        navigate("/farmer");
      } else if (authResponse.role === "BUSINESS") {
        navigate("/business");
      } else if (authResponse.role === "ADMIN") {
        navigate("/admin");
      }
    },
    [login, navigate]
  );

  // =========================
  // GOOGLE SIGNUP ERROR
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
              Build better
              <br />
              farm connections
            </h2>

            <p>
              Whether you grow produce or source it for
              your business, AgriConnect brings both
              sides together.
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

          <div className="sc-illustration-points">

            <div>
              <Check size={13} />
              Direct farmer-to-business marketplace
            </div>

            <div>
              <Check size={13} />
              Transparent order management
            </div>

            <div>
              <Check size={13} />
              Live delivery tracking
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

            <h1>Create your account</h1>

            <p className="sc-subtitle">
              Join AgriConnect to buy or sell fresh
              produce.
            </p>


            {/* =========================
                ERROR MESSAGE
            ========================= */}

            {error && (
              <div className="sc-error">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}


            {/* =========================
                NORMAL SIGNUP FORM
            ========================= */}

            <form
              onSubmit={handleSubmit}
              className="sc-form"
            >

              {/* FULL NAME */}

              <label>
                <span>Full name</span>

                <div className="sc-input">

                  <UserRound size={16} />

                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={form.name}
                    onChange={handleChange}
                    autoComplete="name"
                    required
                  />

                </div>

              </label>


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
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    name="password"
                    placeholder="Minimum 6 characters"
                    value={form.password}
                    onChange={handleChange}
                    minLength={6}
                    autoComplete="new-password"
                    required
                  />

                  <button
                    type="button"
                    className="sc-eye"
                    onClick={() =>
                      setShowPassword(
                        (previous) => !previous
                      )
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >

                    {showPassword ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}

                  </button>

                </div>

              </label>


              {/* =========================
                  ROLE SELECTION
              ========================= */}

              <div className="sc-role-field">

                <span className="sc-role-label">
                  I am joining as
                </span>

                <div className="sc-role-options">

                  {/* BUSINESS */}

                  <label
                    className={`sc-role-option ${
                      form.role === "BUSINESS"
                        ? "selected"
                        : ""
                    }`}
                  >

                    <input
                      type="radio"
                      name="role"
                      value="BUSINESS"
                      checked={
                        form.role === "BUSINESS"
                      }
                      onChange={handleChange}
                    />

                    <Store size={17} />

                    <div>
                      <strong>Business</strong>
                      <span>
                        Buy fresh produce
                      </span>
                    </div>

                    {form.role === "BUSINESS" && (
                      <div className="sc-role-check">
                        <Check size={11} />
                      </div>
                    )}

                  </label>


                  {/* FARMER */}

                  <label
                    className={`sc-role-option ${
                      form.role === "FARMER"
                        ? "selected"
                        : ""
                    }`}
                  >

                    <input
                      type="radio"
                      name="role"
                      value="FARMER"
                      checked={
                        form.role === "FARMER"
                      }
                      onChange={handleChange}
                    />

                    <Sprout size={17} />

                    <div>
                      <strong>Farmer</strong>
                      <span>
                        Sell your produce
                      </span>
                    </div>

                    {form.role === "FARMER" && (
                      <div className="sc-role-check">
                        <Check size={11} />
                      </div>
                    )}

                  </label>

                </div>

              </div>


              {/* =========================
                  CREATE ACCOUNT BUTTON
              ========================= */}

              <button
                type="submit"
                disabled={loading}
                className="sc-submit"
              >

                {loading ? (
                  <>
                    <span className="sc-spinner" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create account
                    <ArrowRight size={16} />
                  </>
                )}

              </button>


              {/* =========================
                  GOOGLE SIGNUP
              ========================= */}

              <div
                style={{
                  textAlign: "center",
                  marginTop: "8px",
                  marginBottom: "4px",
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
                  role={form.role}
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                />


                <p
                  style={{
                    margin: "8px 0 0",
                    color: "#9aa192",
                    fontSize: "10px",
                  }}
                >
                  Select your role above before
                  signing up with Google.
                </p>

              </div>

            </form>


            {/* =========================
                LOGIN LINK
            ========================= */}

            <p className="sc-switch">

              Already have an account?{" "}

              <button
                type="button"
                onClick={() =>
                  navigate("/login")
                }
              >
                Sign in
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
          width: min(100%, 1020px);
          display: grid;
          grid-template-columns: 0.85fr 1.15fr;
          overflow: hidden;
          border-radius: 24px;
          background: white;
          box-shadow: 0 20px 55px rgba(30,38,20,0.10);
        }

        /* ============= ILLUSTRATION SIDE ============= */

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
          font-size: 22px;
          font-weight: 800;
          line-height: 1.3;
          letter-spacing: -0.02em;
        }

        .sc-illustration-mid p {
          max-width: 250px;
          margin: 0;
          color: #d3ddbc;
          font-size: 12px;
          line-height: 1.6;
        }

        .sc-plant-svg {
          width: 120px;
          height: 120px;
          margin-top: 6px;
        }

        .sc-illustration-points {
          position: relative;
          z-index: 2;
          display: grid;
          gap: 9px;
        }

        .sc-illustration-points div {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #d6e1c7;
          font-size: 10.5px;
          font-weight: 700;
        }

        .sc-illustration-points svg {
          flex-shrink: 0;
          width: 20px;
          height: 20px;
          padding: 4px;
          border-radius: 50%;
          background: rgba(222,237,175,0.15);
          color: #dceca7;
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

        /* ============= FORM SIDE ============= */

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
          max-width: 380px;
        }

        .sc-form-inner h1 {
          margin: 0;
          color: #202a19;
          font-size: 24px;
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
          gap: 15px;
          margin-top: 22px;
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
          transition:
            border-color 0.15s ease,
            background 0.15s ease;
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

        .sc-eye {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border: none;
          background: transparent;
          color: #93998a;
          cursor: pointer;
        }

        .sc-role-field {
          display: grid;
          gap: 8px;
        }

        .sc-role-label {
          color: #4c5644;
          font-size: 12px;
          font-weight: 700;
        }

        .sc-role-options {
          display: grid;
          grid-template-columns: repeat(2, minmax(0,1fr));
          gap: 9px;
        }

        .sc-role-option {
          position: relative;
          display: flex !important;
          flex-direction: row !important;
          align-items: center;
          gap: 9px;
          padding: 11px;
          border: 1px solid #e0e4d9;
          border-radius: 12px;
          background: #fbfcf9;
          color: #5a6551;
          cursor: pointer;
          transition:
            border-color 0.15s ease,
            background 0.15s ease;
        }

        .sc-role-option:hover {
          border-color: #c9d2ba;
        }

        .sc-role-option.selected {
          border-color: #6c8140;
          background: #f1f5e6;
          color: #3c4a2a;
        }

        .sc-role-option input {
          position: absolute;
          opacity: 0;
          pointer-events: none;
        }

        .sc-role-option > div {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .sc-role-option strong {
          font-size: 11.5px;
          font-weight: 800;
        }

        .sc-role-option span {
          margin-top: 2px;
          color: #8b9382;
          font-size: 9px;
        }

        .sc-role-check {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #45611f;
          color: white;
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
          margin: 20px 0 0;
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

        @media (max-width: 900px) {

          .sc-shell {
            grid-template-columns: 1fr;
            max-width: 460px;
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

        @media (max-width: 480px) {

          .sc-role-options {
            grid-template-columns: 1fr;
          }

        }

      `}</style>

    </div>
  );
}

export default Register;