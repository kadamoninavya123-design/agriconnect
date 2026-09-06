import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Leaf,
  Lock,
  Mail,
  ShieldCheck,
  Sprout,
  Store,
  UserRound,
} from "lucide-react";
import { registerUser } from "../api/authApi";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "BUSINESS",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] =
    useState(false);

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

  return (
    <div className="register-modern-page">

      {/* =========================================
          BRAND SIDE
      ========================================= */}

      <section className="register-brand-panel">

        <div className="register-brand-content">

          <div className="register-logo">
            <div className="register-logo-icon">
              <Leaf size={23} />
            </div>

            <div>
              <strong>
                AgriConnect
              </strong>

              <span>
                FARM • TRADE • DELIVER
              </span>
            </div>
          </div>

          <div className="register-brand-main">

            <div className="register-brand-badge">
              <Sprout size={14} />
              JOIN THE AGRICULTURE NETWORK
            </div>

            <h1>
              Build better
              <br />
              <span>farm connections.</span>
            </h1>

            <p>
              Whether you grow produce or source it
              for your business, AgriConnect brings
              both sides together.
            </p>

            <div className="register-points">

              <div>
                <Check size={15} />
                Direct farmer-to-business marketplace
              </div>

              <div>
                <Check size={15} />
                Transparent order management
              </div>

              <div>
                <Check size={15} />
                Live delivery tracking
              </div>

            </div>
          </div>

          <div className="register-brand-footer">
            <span>
              AgriConnect
            </span>

            <span>
              Farm • Trade • Deliver
            </span>
          </div>

        </div>

        <div className="register-circle register-circle-one" />
        <div className="register-circle register-circle-two" />

      </section>

      {/* =========================================
          REGISTER FORM
      ========================================= */}

      <section className="register-form-area">

        <div className="mobile-register-logo">
          <div>
            <Leaf size={19} />
          </div>
          AgriConnect
        </div>

        <div className="register-card">

          <div className="register-heading">

            <span>
              GET STARTED
            </span>

            <h2>
              Create your account
            </h2>

            <p>
              Join AgriConnect and start connecting
              with the agricultural marketplace.
            </p>

          </div>

          {error && (
            <div className="register-error">
              <ShieldCheck size={17} />
              <span>
                {error}
              </span>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="register-form"
          >

            {/* NAME */}

            <label>
              <span>
                Full name
              </span>

              <div className="register-input">
                <UserRound size={17} />

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
              <span>
                Email address
              </span>

              <div className="register-input">
                <Mail size={17} />

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
              <span>
                Password
              </span>

              <div className="register-input">
                <Lock size={17} />

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
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (previous) =>
                        !previous
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>
              </div>
            </label>

            {/* ROLE */}

            <div className="role-field">
              <span className="role-title">
                I am joining as
              </span>

              <div className="role-options">

                <label
                  className={`role-option ${
                    form.role ===
                    "BUSINESS"
                      ? "selected"
                      : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="BUSINESS"
                    checked={
                      form.role ===
                      "BUSINESS"
                    }
                    onChange={
                      handleChange
                    }
                  />

                  <div className="role-icon">
                    <Store size={18} />
                  </div>

                  <div>
                    <strong>
                      Business
                    </strong>

                    <span>
                      Buy fresh produce
                    </span>
                  </div>

                  {form.role ===
                    "BUSINESS" && (
                    <div className="role-check">
                      <Check size={13} />
                    </div>
                  )}
                </label>

                <label
                  className={`role-option ${
                    form.role ===
                    "FARMER"
                      ? "selected"
                      : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="FARMER"
                    checked={
                      form.role ===
                      "FARMER"
                    }
                    onChange={
                      handleChange
                    }
                  />

                  <div className="role-icon">
                    <Sprout size={18} />
                  </div>

                  <div>
                    <strong>
                      Farmer
                    </strong>

                    <span>
                      Sell your produce
                    </span>
                  </div>

                  {form.role ===
                    "FARMER" && (
                    <div className="role-check">
                      <Check size={13} />
                    </div>
                  )}
                </label>

              </div>
            </div>

            {/* SUBMIT */}

            <button
              type="submit"
              disabled={loading}
              className="register-submit"
            >
              {loading ? (
                <>
                  <span className="register-spinner" />
                  Creating account...
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight size={18} />
                </>
              )}
            </button>

          </form>

          <div className="register-existing">
            Already have an account?

            <button
              type="button"
              onClick={() =>
                navigate("/login")
              }
            >
              Sign in
              <ArrowRight size={14} />
            </button>
          </div>

          <p className="register-note">
            Your account type determines the features
            available in your AgriConnect workspace.
          </p>

        </div>

      </section>

      <style>{`
        .register-modern-page {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 0.9fr 1.1fr;
          background: #f5f7f1;
          color: #283421;
        }

        /* =========================
           BRAND SIDE
        ========================= */

        .register-brand-panel {
          position: relative;
          min-height: 100vh;
          overflow: hidden;
          background:
            linear-gradient(
              145deg,
              #2a371a 0%,
              #4b5d25 52%,
              #738641 100%
            );
          color: white;
        }

        .register-brand-content {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          padding: 42px 8vw 32px;
        }

        .register-logo {
          display: flex;
          align-items: center;
          gap: 11px;
        }

        .register-logo-icon {
          width: 46px;
          height: 46px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 14px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.15);
          color: #dce9ac;
        }

        .register-logo strong {
          display: block;
          font-size: 20px;
          font-weight: 900;
        }

        .register-logo span {
          display: block;
          margin-top: 3px;
          color: #cbd7ad;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.13em;
        }

        .register-brand-main {
          max-width: 560px;
          margin: auto 0;
        }

        .register-brand-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 7px 11px;
          border: 1px solid rgba(255,255,255,0.16);
          border-radius: 999px;
          background: rgba(255,255,255,0.08);
          color: #e2ebcb;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.12em;
        }

        .register-brand-main h1 {
          margin: 20px 0 13px;
          color: white;
          font-size: clamp(38px, 4.5vw, 58px);
          line-height: 1;
          font-weight: 900;
          letter-spacing: -0.05em;
        }

        .register-brand-main h1 span {
          color: #d9e6aa;
        }

        .register-brand-main > p {
          max-width: 500px;
          margin: 0;
          color: #d0dbc0;
          font-size: 14px;
          line-height: 1.8;
        }

        .register-points {
          display: grid;
          gap: 11px;
          margin-top: 27px;
        }

        .register-points div {
          display: flex;
          align-items: center;
          gap: 9px;
          color: #d6e1c7;
          font-size: 11px;
          font-weight: 700;
        }

        .register-points div svg {
          display: flex;
          width: 24px;
          height: 24px;
          padding: 4px;
          border-radius: 50%;
          background: rgba(222,237,175,0.13);
          color: #dceca7;
        }

        .register-brand-footer {
          display: flex;
          justify-content: space-between;
          color: #b0bc9f;
          font-size: 9px;
          font-weight: 700;
        }

        .register-circle {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
        }

        .register-circle-one {
          width: 400px;
          height: 400px;
          top: -200px;
          right: -170px;
          background: rgba(216,232,170,0.08);
        }

        .register-circle-two {
          width: 280px;
          height: 280px;
          left: -130px;
          bottom: -160px;
          background: rgba(255,255,255,0.05);
        }

        /* =========================
           FORM AREA
        ========================= */

        .register-form-area {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 42px 60px;
          background:
            radial-gradient(
              circle at top left,
              #edf3df 0%,
              transparent 30%
            ),
            #f5f7f1;
        }

        .mobile-register-logo {
          display: none;
        }

        .register-card {
          width: min(100%, 570px);
          padding: 40px 43px;
          border: 1px solid #dde5d5;
          border-radius: 28px;
          background: rgba(255,255,255,0.97);
          box-shadow:
            0 25px 65px rgba(45,58,32,0.1);
        }

        .register-heading > span {
          color: #6c7d37;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.16em;
        }

        .register-heading h2 {
          margin: 7px 0 7px;
          color: #283421;
          font-size: 29px;
          line-height: 1.15;
          font-weight: 900;
          letter-spacing: -0.035em;
        }

        .register-heading p {
          max-width: 460px;
          margin: 0;
          color: #889184;
          font-size: 12px;
          line-height: 1.6;
        }

        .register-error {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          margin-top: 21px;
          padding: 13px 14px;
          border: 1px solid #efcccc;
          border-radius: 13px;
          background: #fff4f4;
          color: #a13e3e;
          font-size: 11px;
          font-weight: 700;
          line-height: 1.5;
        }

        .register-form {
          display: grid;
          gap: 17px;
          margin-top: 25px;
        }

        .register-form label {
          display: grid;
          gap: 7px;
        }

        .register-form label > span,
        .role-title {
          color: #4d5848;
          font-size: 11px;
          font-weight: 800;
        }

        .register-input {
          display: flex;
          align-items: center;
          gap: 10px;
          min-height: 49px;
          padding: 0 14px;
          border: 1px solid #dce3d8;
          border-radius: 14px;
          background: #fbfcfa;
          color: #899282;
          transition: 0.2s ease;
        }

        .register-input:focus-within {
          border-color: #829648;
          background: white;
          box-shadow:
            0 0 0 4px rgba(130,150,72,0.1);
        }

        .register-input input {
          width: 100%;
          min-width: 0;
          border: none;
          outline: none;
          background: transparent;
          color: #283421;
          font-size: 12px;
        }

        .register-input input::placeholder {
          color: #afb6ab;
        }

        .password-toggle {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          width: 30px;
          height: 30px;
          border: none;
          background: transparent;
          color: #90998c;
          cursor: pointer;
        }

        .role-field {
          display: grid;
          gap: 8px;
        }

        .role-options {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap: 11px;
        }

        .role-option {
          position: relative;
          display: flex !important;
          flex-direction: row !important;
          align-items: center;
          gap: 10px;
          min-height: 78px;
          padding: 13px;
          border: 1px solid #e0e6dc;
          border-radius: 15px;
          background: #fafbf9;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .role-option:hover {
          border-color: #cdd8c1;
          background: #f7f9f4;
        }

        .role-option.selected {
          border-color: #aabc80;
          background:
            linear-gradient(
              145deg,
              #f4f8e9,
              #edf4dd
            );
          box-shadow:
            0 5px 16px rgba(95,119,47,0.08);
        }

        .role-option input {
          position: absolute;
          opacity: 0;
          pointer-events: none;
        }

        .role-icon {
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border-radius: 11px;
          background: white;
          color: #67783b;
          box-shadow: 0 3px 10px rgba(0,0,0,0.04);
        }

        .role-option > div:nth-child(3) {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .role-option strong {
          color: #3c482f;
          font-size: 11px;
          font-weight: 900;
        }

        .role-option span {
          margin-top: 3px;
          color: #8d9688;
          font-size: 9px;
        }

        .role-check {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #70833b;
          color: white;
        }

        .register-submit {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          height: 51px;
          margin-top: 3px;
          border: none;
          border-radius: 14px;
          background:
            linear-gradient(
              135deg,
              #526728,
              #758c3d
            );
          color: white;
          font-size: 12px;
          font-weight: 900;
          box-shadow:
            0 9px 22px rgba(86,109,43,0.2);
          transition: 0.2s ease;
        }

        .register-submit:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow:
            0 13px 27px rgba(86,109,43,0.24);
        }

        .register-submit:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .register-spinner {
          width: 15px;
          height: 15px;
          border: 2px solid rgba(255,255,255,0.4);
          border-top-color: white;
          border-radius: 50%;
          animation:
            register-spin
            0.7s
            linear
            infinite;
        }

        @keyframes register-spin {
          to {
            transform: rotate(360deg);
          }
        }

        .register-existing {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 5px;
          margin-top: 23px;
          color: #90998b;
          font-size: 10px;
          font-weight: 600;
        }

        .register-existing button {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          border: none;
          background: transparent;
          color: #617331;
          font-size: 10px;
          font-weight: 900;
          cursor: pointer;
        }

        .register-note {
          margin: 15px 0 0;
          color: #a0a79d;
          font-size: 9px;
          line-height: 1.6;
          text-align: center;
        }

        @media (max-width: 950px) {
          .register-modern-page {
            grid-template-columns: 1fr;
          }

          .register-brand-panel {
            display: none;
          }

          .register-form-area {
            min-height: 100vh;
            padding: 25px 16px;
          }

          .mobile-register-logo {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            margin-bottom: 21px;
            color: #405025;
            font-size: 18px;
            font-weight: 900;
          }

          .mobile-register-logo div {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 37px;
            height: 37px;
            border-radius: 12px;
            background: #e8f0d5;
            color: #647431;
          }

          .register-card {
            padding: 31px 25px;
            border-radius: 23px;
          }
        }

        @media (max-width: 560px) {
          .register-form-area {
            padding: 16px 11px;
          }

          .register-card {
            padding: 27px 19px;
          }

          .register-heading h2 {
            font-size: 25px;
          }

          .role-options {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export default Register;