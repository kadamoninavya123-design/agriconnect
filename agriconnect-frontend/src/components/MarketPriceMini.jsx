import { useState } from "react";
import { TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import api from "../api/axiosConfig";

function MarketPriceMini({ commodity }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  const formatDateTime = (isoString) => {
    if (!isoString) return "N/A";

    const date = new Date(isoString);

    return date.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const toggleOpen = async () => {
    const next = !open;
    setOpen(next);

    if (next && !data && !loading) {
      setLoading(true);
      setError("");

      try {
        const res = await api.get(
          `/market-prices/${encodeURIComponent(commodity)}`
        );

        setData(res.data);

      } catch (err) {

        if (err.response?.status === 404) {
          setError(
            `No government price data for "${commodity}" yet.`
          );
        } else {
          setError("Could not load market price.");
        }

      } finally {
        setLoading(false);
      }
    }
  };

  const isUp = data?.percentChange > 0;
  const isDown = data?.percentChange < 0;

  // Agmarknet reports prices per quintal (100 kg)
  const perKg = (quintalPrice) =>
    quintalPrice != null
      ? (quintalPrice / 100).toFixed(2)
      : null;

  return (
    <div className="market-mini">

      {/* =========================
          GOVERNMENT PRICE BUTTON
      ========================= */}

      <button
        type="button"
        className="market-mini-toggle"
        onClick={toggleOpen}
      >
        📊 {open ? "Hide govt price" : "Govt market price"}
      </button>


      {open && (
        <div className="market-mini-body">

          {/* =========================
              LOADING
          ========================= */}

          {loading && (
            <div className="market-mini-loading">
              <Loader2
                size={13}
                className="market-mini-spin"
              />
              Loading...
            </div>
          )}


          {/* =========================
              ERROR
          ========================= */}

          {!loading && error && (
            <p className="market-mini-error">
              {error}
            </p>
          )}


          {/* =========================
              MARKET PRICE
          ========================= */}

          {!loading && data && (
            <>

              {/* PRICE */}

              <div className="market-mini-price-row">

                <div className="market-mini-price-block">

                  <strong>
                    ₹{perKg(data.todayModalPrice) ?? "N/A"}
                  </strong>

                  <span className="market-mini-unit">
                    / kg
                  </span>

                </div>


                {/* PRICE CHANGE */}

                {data.percentChange != null && (
                  <span
                    className={
                      isUp
                        ? "up"
                        : isDown
                        ? "down"
                        : ""
                    }
                  >

                    {isUp ? (
                      <TrendingUp size={12} />
                    ) : isDown ? (
                      <TrendingDown size={12} />
                    ) : null}

                    {data.percentChange.toFixed(1)}%

                  </span>
                )}

              </div>


              {/* QUINTAL PRICE */}

              <p className="market-mini-quintal">
                (₹{data.todayModalPrice ?? "N/A"} / quintal)
              </p>


              {/* =================================================
                  PRICE SOURCE
                  TELANGANA OR INDIA-WIDE
              ================================================= */}

              {data.fallback ? (

                <p className="market-mini-source india">
                  🇮🇳 India-wide government price
                </p>

              ) : (

                <p className="market-mini-source telangana">
                  📍 Telangana government price
                </p>

              )}


              {/* YESTERDAY PRICE */}

              {data.yesterdayModalPrice != null && (
                <p className="market-mini-sub">

                  Yesterday: ₹
                  {perKg(data.yesterdayModalPrice)}
                  /kg

                  {" "}
                  (₹
                  {data.yesterdayModalPrice}
                  /quintal)

                </p>
              )}


              {/* MARKET + STATE */}

              <p className="market-mini-sub">

                {data.market
                  ? `${data.market}, `
                  : ""}

                {data.state || ""}

              </p>


              {/* UPDATED */}

              <p className="market-mini-updated">

                Updated:{" "}
                {formatDateTime(data.lastUpdated)}

              </p>

            </>
          )}

        </div>
      )}


      {/* =========================
          STYLES
      ========================= */}

      <style>{`

        .market-mini {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px dashed #e1e7dc;
        }


        .market-mini-toggle {
          width: 100%;
          height: 34px;
          border: 1px solid #dde4d8;
          border-radius: 9px;
          background: #f9fbf6;
          color: #566255;
          font-size: 9px;
          font-weight: 900;
          cursor: pointer;
        }


        .market-mini-toggle:hover {
          background: #f1f5ea;
        }


        .market-mini-body {
          margin-top: 9px;
        }


        .market-mini-loading {
          display: flex;
          align-items: center;
          gap: 5px;
          color: #9aa198;
          font-size: 9px;
        }


        .market-mini-spin {
          animation: market-mini-spin .8s linear infinite;
        }


        @keyframes market-mini-spin {
          to {
            transform: rotate(360deg);
          }
        }


        .market-mini-error {
          margin: 0;
          color: #a1a89f;
          font-size: 9px;
          font-style: italic;
        }


        .market-mini-price-row {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
        }


        .market-mini-price-block {
          display: flex;
          align-items: baseline;
          gap: 3px;
        }


        .market-mini-price-block strong {
          color: #35412f;
          font-size: 16px;
          font-weight: 900;
        }


        .market-mini-unit {
          color: #9aa198;
          font-size: 9px;
        }


        .market-mini-quintal {
          margin: 1px 0 0;
          color: #a8afa4;
          font-size: 8px;
        }


        /* =========================
           PRICE SOURCE
        ========================= */

        .market-mini-source {
          margin: 5px 0 3px;
          font-size: 9px;
          font-weight: 900;
        }


        .market-mini-source.telangana {
          color: #4a7a4e;
        }


        .market-mini-source.india {
          color: #8a7040;
        }


        .market-mini-price-row > span {
          display: flex;
          align-items: center;
          gap: 3px;
          font-size: 9px;
          font-weight: 900;
          color: #8c9489;
        }


        .market-mini-price-row > span.up {
          color: #4a7a4e;
        }


        .market-mini-price-row > span.down {
          color: #a34e4e;
        }


        .market-mini-sub {
          margin: 3px 0 0;
          color: #8e978b;
          font-size: 9px;
        }


        .market-mini-updated {
          margin: 4px 0 0;
          color: #a0a89c;
          font-size: 8px;
        }

      `}</style>

    </div>
  );
}

export default MarketPriceMini;