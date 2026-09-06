import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../api/axiosConfig";
import MarketPriceMini from "../../components/MarketPriceMini";

import {
  Search,
  SlidersHorizontal,
  ShoppingCart,
  MapPin,
  Package,
  X,
  Plus,
  Minus,
  CheckCircle2,
  AlertCircle,
  Leaf,
  UserRound,
  ArrowRight,
  RefreshCw,
  Map,
  CreditCard,
  Clock,
} from "lucide-react";

function BusinessBrowseProducts() {
  // =========================================================
  // PRODUCTS
  // =========================================================

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // =========================================================
  // ORDER
  // =========================================================

  const [selectedProduct, setSelectedProduct] = useState(null);

  const [quantity, setQuantity] = useState("");

  const [ordering, setOrdering] = useState(false);

  // =========================================================
  // DELIVERY LOCATION
  // =========================================================

  const [gettingLocation, setGettingLocation] = useState(false);

  const [deliveryLocation, setDeliveryLocation] = useState(null);

  const [manualAddress, setManualAddress] = useState("");

  const [geocoding, setGeocoding] = useState(false);

  // =========================================================
  // PAYMENT
  // =========================================================

  const [paymentMethod, setPaymentMethod] = useState("");

  const [paymentTiming, setPaymentTiming] = useState("");

  // =========================================================
  // MESSAGES
  // =========================================================

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  // =========================================================
  // SEARCH / FILTER / SORT
  // =========================================================

  const [searchTerm, setSearchTerm] = useState("");

  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const [sortOption, setSortOption] = useState("DEFAULT");

  // =========================================================
  // FETCH PRODUCTS
  // =========================================================

  const fetchProducts = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await api.get("/produce/browse/all");

      const productData = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.content)
        ? res.data.content
        : [];

      setProducts(productData);
    } catch (err) {
      console.error("Failed to load products:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Unable to load products right now."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // =========================================================
  // OPEN ORDER FORM
  // =========================================================

  const openOrderForm = (product) => {
    if (Number(product.quantity) <= 0) {
      return;
    }

    setSelectedProduct(product);

    setQuantity("");

    setDeliveryLocation(null);

    setManualAddress("");

    // Reset payment fields every time modal opens
    setPaymentMethod("");

    setPaymentTiming("");

    setMessage("");

    setError("");
  };

  // =========================================================
  // CLOSE ORDER FORM
  // =========================================================

  const closeOrderForm = () => {
    if (ordering || gettingLocation || geocoding) {
      return;
    }

    setSelectedProduct(null);

    setQuantity("");

    setMessage("");

    setError("");

    setDeliveryLocation(null);

    setManualAddress("");

    setPaymentMethod("");

    setPaymentTiming("");
  };

  // =========================================================
  // GPS LOCATION
  // =========================================================

  const captureDeliveryLocation = () => {
    if (!navigator.geolocation) {
      setError(
        "Your browser does not support GPS location."
      );

      return;
    }

    setGettingLocation(true);

    setError("");

    setMessage("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setDeliveryLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });

        setGettingLocation(false);

        setMessage(
          "Delivery location captured successfully."
        );
      },

      (err) => {
        console.error(
          "Failed to get delivery location:",
          err
        );

        setGettingLocation(false);

        if (err.code === 1) {
          setError(
            "Location permission was denied. Please allow location access."
          );
        } else if (err.code === 2) {
          setError(
            "Your current location is unavailable."
          );
        } else if (err.code === 3) {
          setError(
            "Location request timed out. Please try again."
          );
        } else {
          setError(
            "Unable to get your current location."
          );
        }
      },

      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  // =========================================================
  // MANUAL ADDRESS -> COORDINATES
  // =========================================================

  const geocodeAddress = async () => {
    if (!manualAddress.trim()) {
      setError("Please enter an address.");
      return;
    }

    setGeocoding(true);

    setError("");

    setMessage("");

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
          manualAddress
        )}`
      );

      if (!res.ok) {
        throw new Error(
          "Address lookup service failed."
        );
      }

      const data = await res.json();

      if (!data || data.length === 0) {
        setError(
          "Address not found. Try being more specific (add city/state)."
        );

        setGeocoding(false);

        return;
      }

      setDeliveryLocation({
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
      });

      setMessage(
        "Delivery location set from address."
      );
    } catch (err) {
      console.error(
        "Failed to geocode address:",
        err
      );

      setError(
        "Failed to find that address. Please try again or use GPS instead."
      );
    } finally {
      setGeocoding(false);
    }
  };

  // =========================================================
  // PLACE ORDER
  // =========================================================

  const placeOrder = async () => {
    if (!selectedProduct) {
      return;
    }

    const orderedQuantity = Number(quantity);

    const availableQuantity = Number(
      selectedProduct.quantity
    );

    // ---------------------------------------------------------
    // QUANTITY VALIDATION
    // ---------------------------------------------------------

    if (!quantity || orderedQuantity <= 0) {
      setError("Please enter a valid quantity.");
      return;
    }

    if (orderedQuantity > availableQuantity) {
      setError(
        `Only ${availableQuantity} units are available.`
      );

      return;
    }

    // ---------------------------------------------------------
    // LOCATION VALIDATION
    // ---------------------------------------------------------

    if (!deliveryLocation) {
      setError(
        "Please capture your delivery location before placing the order."
      );

      return;
    }

    // ---------------------------------------------------------
    // PAYMENT METHOD VALIDATION
    // ---------------------------------------------------------

    if (!paymentMethod) {
      setError(
        "Please select a payment method."
      );

      return;
    }

    // ---------------------------------------------------------
    // PAYMENT TIMING VALIDATION
    // ---------------------------------------------------------

    if (!paymentTiming) {
      setError(
        "Please select payment timing."
      );

      return;
    }

    // ---------------------------------------------------------
    // PLACE ORDER
    // ---------------------------------------------------------

    try {
      setOrdering(true);

      setError("");

      setMessage("");

      await api.post("/orders", {
        produceId: selectedProduct.id,

        quantityOrdered: orderedQuantity,

        deliveryLatitude:
          deliveryLocation.latitude,

        deliveryLongitude:
          deliveryLocation.longitude,

        // NEW PAYMENT FIELDS
        paymentMethod: paymentMethod,

        paymentTiming: paymentTiming,
      });

      // -------------------------------------------------------
      // UPDATE LOCAL STOCK
      // -------------------------------------------------------

      const newQuantity =
        availableQuantity - orderedQuantity;

      setProducts((currentProducts) =>
        currentProducts.map((product) =>
          product.id === selectedProduct.id
            ? {
                ...product,
                quantity: newQuantity,
              }
            : product
        )
      );

      setMessage(
        "Order placed successfully!"
      );

      // -------------------------------------------------------
      // CLOSE MODAL AFTER SUCCESS
      // -------------------------------------------------------

      setTimeout(() => {
        setSelectedProduct(null);

        setQuantity("");

        setMessage("");

        setDeliveryLocation(null);

        setManualAddress("");

        setPaymentMethod("");

        setPaymentTiming("");
      }, 1800);
    } catch (err) {
      console.error(
        "Failed to place order:",
        err
      );

      const backendMessage =
        err.response?.data?.message ||
        err.response?.data ||
        "Failed to place order.";

      setError(
        typeof backendMessage === "string"
          ? backendMessage
          : "Failed to place order."
      );
    } finally {
      setOrdering(false);
    }
  };

  // =========================================================
  // CATEGORIES
  // =========================================================

  const categories = useMemo(() => {
    const values = products
      .map((product) =>
        String(product.category || "").trim()
      )
      .filter(Boolean);

    return [
      "ALL",
      ...Array.from(new Set(values)),
    ];
  }, [products]);

  // =========================================================
  // FILTER + SORT
  // =========================================================

  const filteredProducts = useMemo(() => {
    let result = [...products];

    const search = searchTerm
      .trim()
      .toLowerCase();

    if (search) {
      result = result.filter((product) => {
        const name = String(
          product.name || ""
        ).toLowerCase();

        const category = String(
          product.category || ""
        ).toLowerCase();

        const farmer = String(
          product.farmerName || ""
        ).toLowerCase();

        return (
          name.includes(search) ||
          category.includes(search) ||
          farmer.includes(search)
        );
      });
    }

    if (categoryFilter !== "ALL") {
      result = result.filter(
        (product) =>
          String(
            product.category || ""
          ).toLowerCase() ===
          categoryFilter.toLowerCase()
      );
    }

    if (sortOption === "PRICE_LOW") {
      result.sort(
        (a, b) =>
          Number(a.price || 0) -
          Number(b.price || 0)
      );
    }

    if (sortOption === "PRICE_HIGH") {
      result.sort(
        (a, b) =>
          Number(b.price || 0) -
          Number(a.price || 0)
      );
    }

    if (sortOption === "STOCK_HIGH") {
      result.sort(
        (a, b) =>
          Number(b.quantity || 0) -
          Number(a.quantity || 0)
      );
    }

    if (sortOption === "NAME") {
      result.sort((a, b) =>
        String(
          a.name || ""
        ).localeCompare(
          String(b.name || "")
        )
      );
    }

    return result;
  }, [
    products,
    searchTerm,
    categoryFilter,
    sortOption,
  ]);

  // =========================================================
  // CATEGORY CLASS
  // =========================================================

  const getCategoryClass = (category) => {
    const value = String(
      category || ""
    ).toLowerCase();

    if (value.includes("fruit")) {
      return "browse-category-fruit";
    }

    if (value.includes("vegetable")) {
      return "browse-category-vegetable";
    }

    if (value.includes("herb")) {
      return "browse-category-herb";
    }

    return "browse-category-default";
  };

  // =========================================================
  // STOCK STATUS
  // =========================================================

  const getStockStatus = (quantityValue) => {
    const stock = Number(
      quantityValue || 0
    );

    if (stock <= 0) {
      return {
        label: "Out of stock",
        className:
          "browse-stock-empty",
      };
    }

    if (stock <= 10) {
      return {
        label: "Low stock",
        className:
          "browse-stock-low",
      };
    }

    return {
      label: "In stock",
      className:
        "browse-stock-good",
    };
  };

  // =========================================================
  // TOTAL AVAILABLE
  // =========================================================

  const totalAvailableUnits =
    products.reduce(
      (sum, product) =>
        sum +
        Number(
          product.quantity || 0
        ),
      0
    );

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <DashboardLayout>
      <div className="browse-page">

        {/* =================================================
            HEADER
        ================================================= */}

        <section className="browse-hero">

          <div className="browse-hero-copy">

            <div className="browse-eyebrow">
              <Leaf size={13} />
              BUSINESS MARKETPLACE
            </div>

            <h1>
              Fresh produce,
              <br />
              <span>
                direct from farmers.
              </span>
            </h1>

            <p>
              Discover quality farm produce,
              compare prices, and place orders
              directly with farmers.
            </p>

          </div>

          <div className="browse-hero-stats">

            <div>
              <strong>
                {products.length}
              </strong>

              <span>
                Listings
              </span>
            </div>

            <div>
              <strong>
                {totalAvailableUnits.toLocaleString(
                  "en-IN"
                )}
              </strong>

              <span>
                Units available
              </span>
            </div>

          </div>

          <div className="browse-hero-circle browse-circle-one" />

          <div className="browse-hero-circle browse-circle-two" />

        </section>

        {/* =================================================
            SEARCH + FILTERS
        ================================================= */}

        <section className="browse-toolbar">

          <div className="browse-search">

            <Search size={18} />

            <input
              type="text"
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(
                  e.target.value
                )
              }
              placeholder="Search produce, category or farmer..."
            />

            {searchTerm && (
              <button
                type="button"
                onClick={() =>
                  setSearchTerm("")
                }
              >
                <X size={15} />
              </button>
            )}

          </div>

          <div className="browse-filter-group">

            <div className="browse-filter-label">
              <SlidersHorizontal size={14} />
              Filter
            </div>

            <select
              value={categoryFilter}
              onChange={(e) =>
                setCategoryFilter(
                  e.target.value
                )
              }
            >
              {categories.map(
                (category) => (
                  <option
                    key={category}
                    value={category}
                  >
                    {category === "ALL"
                      ? "All categories"
                      : category}
                  </option>
                )
              )}
            </select>

            <select
              value={sortOption}
              onChange={(e) =>
                setSortOption(
                  e.target.value
                )
              }
            >
              <option value="DEFAULT">
                Sort: Recommended
              </option>

              <option value="PRICE_LOW">
                Price: Low to high
              </option>

              <option value="PRICE_HIGH">
                Price: High to low
              </option>

              <option value="STOCK_HIGH">
                Most stock
              </option>

              <option value="NAME">
                Name A–Z
              </option>
            </select>

            <button
              type="button"
              className="browse-refresh"
              onClick={fetchProducts}
              title="Refresh products"
            >
              <RefreshCw size={16} />
            </button>

          </div>

        </section>

        {/* =================================================
            STATUS
        ================================================= */}

        {error &&
          products.length > 0 && (
            <div className="browse-inline-error">

              <AlertCircle size={17} />

              <span>
                {error}
              </span>

              <button
                type="button"
                onClick={fetchProducts}
              >
                Try again
              </button>

            </div>
          )}

        {/* =================================================
            LISTINGS
        ================================================= */}

        <section className="browse-listings-section">

          <div className="browse-section-heading">

            <div>

              <span>
                FRESH FROM THE FARM
              </span>

              <h2>
                Available Produce
              </h2>

              <p>
                {loading
                  ? "Finding available produce..."
                  : `${filteredProducts.length} ${
                      filteredProducts.length ===
                      1
                        ? "product"
                        : "products"
                    } available`}
              </p>

            </div>

            <div className="browse-live-badge">
              <span />
              Live inventory
            </div>

          </div>

          {/* =================================================
              LOADING
          ================================================= */}

          {loading && (
            <div className="browse-loading-grid">

              {Array.from({
                length: 6,
              }).map((_, index) => (
                <div
                  key={index}
                  className="browse-skeleton-card"
                >

                  <div className="browse-skeleton-image" />

                  <div className="browse-skeleton-line large" />

                  <div className="browse-skeleton-line medium" />

                  <div className="browse-skeleton-line small" />

                  <div className="browse-skeleton-button" />

                </div>
              ))}

            </div>
          )}

          {/* =================================================
              EMPTY AFTER FILTER
          ================================================= */}

          {!loading &&
            products.length > 0 &&
            filteredProducts.length ===
              0 && (
              <div className="browse-empty">

                <div className="browse-empty-icon">
                  <Search size={25} />
                </div>

                <h3>
                  No matching produce
                </h3>

                <p>
                  Try another search or remove
                  some filters.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setCategoryFilter(
                      "ALL"
                    );
                  }}
                >
                  Clear filters
                </button>

              </div>
            )}

          {/* =================================================
              NO PRODUCTS
          ================================================= */}

          {!loading &&
            products.length === 0 &&
            !error && (
              <div className="browse-empty">

                <div className="browse-empty-icon">
                  <Package size={26} />
                </div>

                <h3>
                  No produce available
                </h3>

                <p>
                  Farmers haven't listed any
                  available produce yet.
                </p>

                <button
                  type="button"
                  onClick={fetchProducts}
                >
                  Refresh marketplace
                </button>

              </div>
            )}

          {/* =================================================
              PRODUCT GRID
          ================================================= */}

          {!loading &&
            filteredProducts.length > 0 && (
              <div className="browse-product-grid">

                {filteredProducts.map(
                  (product) => {

                    const available =
                      Number(
                        product.quantity
                      ) > 0;

                    const stockStatus =
                      getStockStatus(
                        product.quantity
                      );

                    return (
                      <article
                        key={product.id}
                        className="browse-product-card"
                      >

                        {/* IMAGE */}

                        <div className="browse-image-wrap">

                          {product.imageUrl ? (
                            <img
                              src={
                                product.imageUrl
                              }
                              alt={
                                product.name ||
                                "Produce"
                              }
                            />
                          ) : (
                            <div className="browse-no-image">
                              <Leaf size={36} />
                            </div>
                          )}

                          {product.category && (
                            <span
                              className={`browse-category ${getCategoryClass(
                                product.category
                              )}`}
                            >
                              {product.category}
                            </span>
                          )}

                          <span
                            className={`browse-stock-badge ${stockStatus.className}`}
                          >
                            <span />

                            {stockStatus.label}
                          </span>

                        </div>

                        {/* CONTENT */}

                        <div className="browse-product-content">

                          <div className="browse-product-title-row">

                            <div>

                              <h3>
                                {product.name}
                              </h3>

                              <div className="browse-farmer">

                                <UserRound
                                  size={13}
                                />

                                <span>
                                  Farmer:{" "}
                                  {product.farmerName ||
                                    "Unknown"}
                                </span>

                              </div>

                            </div>

                          </div>

                          <div className="browse-price-row">

                            <div>

                              <span>
                                PRICE
                              </span>

                              <strong>
                                ₹
                                {Number(
                                  product.price ||
                                    0
                                ).toLocaleString(
                                  "en-IN",
                                  {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  }
                                )}
                              </strong>

                              <small>
                                / unit
                              </small>

                            </div>

                            <div className="browse-quantity">

                              <span>
                                AVAILABLE
                              </span>

                              <strong>
                                {Number(
                                  product.quantity ||
                                    0
                                ).toLocaleString(
                                  "en-IN"
                                )}
                              </strong>

                            </div>

                          </div>

                          <MarketPriceMini
                            commodity={
                              product.name
                            }
                          />

                          <div className="browse-card-divider" />

                          <button
                            type="button"
                            disabled={!available}
                            onClick={() =>
                              openOrderForm(
                                product
                              )
                            }
                            className={`browse-order-button ${
                              available
                                ? ""
                                : "disabled"
                            }`}
                          >

                            {available ? (
                              <>
                                <ShoppingCart
                                  size={17}
                                />

                                Place Order

                                <ArrowRight
                                  size={16}
                                />
                              </>
                            ) : (
                              <>
                                Out of Stock
                              </>
                            )}

                          </button>

                        </div>

                      </article>
                    );
                  }
                )}

              </div>
            )}

        </section>

        {/* =================================================
            ORDER MODAL
        ================================================= */}

        {selectedProduct && (
          <div
            className="browse-modal-backdrop"
            role="dialog"
            aria-modal="true"
          >

            <div className="browse-order-modal">

              {/* MODAL HEADER */}

              <div className="browse-modal-header">

                <div>

                  <span>
                    NEW ORDER
                  </span>

                  <h2>
                    Place your order
                  </h2>

                </div>

                <button
                  type="button"
                  onClick={closeOrderForm}
                  disabled={
                    ordering ||
                    gettingLocation ||
                    geocoding
                  }
                  className="browse-modal-close"
                >
                  <X size={18} />
                </button>

              </div>

              {/* =================================================
                  SELECTED PRODUCT
              ================================================= */}

              <div className="browse-selected-product">

                <div className="browse-selected-image">

                  {selectedProduct.imageUrl ? (
                    <img
                      src={
                        selectedProduct.imageUrl
                      }
                      alt={
                        selectedProduct.name
                      }
                    />
                  ) : (
                    <Leaf size={27} />
                  )}

                </div>

                <div className="browse-selected-info">

                  <span>
                    {selectedProduct.category ||
                      "Fresh produce"}
                  </span>

                  <h3>
                    {selectedProduct.name}
                  </h3>

                  <p>
                    From{" "}
                    <strong>
                      {selectedProduct.farmerName ||
                        "Unknown farmer"}
                    </strong>
                  </p>

                </div>

                <div className="browse-selected-price">

                  <strong>
                    ₹
                    {Number(
                      selectedProduct.price ||
                        0
                    ).toFixed(2)}
                  </strong>

                  <span>
                    / unit
                  </span>

                </div>

              </div>

              {/* =================================================
                  QUANTITY
              ================================================= */}

              <div className="browse-modal-section">

                <label>
                  Quantity
                </label>

                <div className="browse-quantity-control">

                  <button
                    type="button"
                    onClick={() => {

                      const current =
                        Number(
                          quantity || 0
                        );

                      setQuantity(
                        String(
                          Math.max(
                            0,
                            current - 1
                          )
                        )
                      );

                      setError("");

                      setMessage("");
                    }}
                    disabled={
                      ordering ||
                      gettingLocation ||
                      geocoding
                    }
                  >
                    <Minus size={16} />
                  </button>

                  <input
                    type="number"
                    min="0.01"
                    max={
                      selectedProduct.quantity
                    }
                    step="0.01"
                    value={quantity}
                    onChange={(e) => {

                      setQuantity(
                        e.target.value
                      );

                      setError("");

                      setMessage("");
                    }}
                    placeholder="0"
                    disabled={ordering}
                  />

                  <button
                    type="button"
                    onClick={() => {

                      const current =
                        Number(
                          quantity || 0
                        );

                      const maximum =
                        Number(
                          selectedProduct.quantity ||
                            0
                        );

                      const next =
                        Math.min(
                          maximum,
                          current + 1
                        );

                      setQuantity(
                        String(next)
                      );

                      setError("");

                      setMessage("");
                    }}
                    disabled={
                      ordering ||
                      gettingLocation ||
                      geocoding
                    }
                  >
                    <Plus size={16} />
                  </button>

                </div>

                <div className="browse-available-note">

                  <Package size={13} />

                  {selectedProduct.quantity} units
                  available

                </div>

                {quantity &&
                  Number(quantity) > 0 && (
                    <div className="browse-estimated-total">

                      <div>

                        <span>
                          ESTIMATED TOTAL
                        </span>

                        <strong>
                          ₹
                          {(
                            Number(
                              selectedProduct.price ||
                                0
                            ) *
                            Number(quantity)
                          ).toLocaleString(
                            "en-IN",
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }
                          )}
                        </strong>

                      </div>

                      <ShoppingCart size={21} />

                    </div>
                  )}

              </div>

              {/* =================================================
                  DELIVERY LOCATION
              ================================================= */}

              <div className="browse-delivery-box">

                <div className="browse-delivery-heading">

                  <div className="browse-delivery-icon">
                    <MapPin size={19} />
                  </div>

                  <div>

                    <h3>
                      Delivery location
                    </h3>

                    <p>
                      Required to place this order
                    </p>

                  </div>

                </div>

                {!deliveryLocation ? (
                  <>

                    <div className="browse-address-input-row">

                      <input
                        type="text"
                        value={manualAddress}
                        onChange={(e) => {

                          setManualAddress(
                            e.target.value
                          );

                          setError("");

                          setMessage("");
                        }}
                        placeholder="Type your delivery address..."
                        disabled={
                          geocoding ||
                          gettingLocation ||
                          ordering
                        }
                        className="browse-address-input"
                      />

                      <button
                        type="button"
                        onClick={
                          geocodeAddress
                        }
                        disabled={
                          geocoding ||
                          gettingLocation ||
                          ordering ||
                          !manualAddress.trim()
                        }
                        className="browse-address-button"
                      >

                        {geocoding ? (
                          <span className="browse-spinner" />
                        ) : (
                          "Find"
                        )}

                      </button>

                    </div>

                    <div className="browse-or-divider">

                      <span />

                      OR

                      <span />

                    </div>

                    <button
                      type="button"
                      onClick={
                        captureDeliveryLocation
                      }
                      disabled={
                        gettingLocation ||
                        geocoding ||
                        ordering
                      }
                      className="browse-location-button"
                    >

                      {gettingLocation ? (
                        <>
                          <span className="browse-spinner" />
                          Getting location...
                        </>
                      ) : (
                        <>
                          <MapPin size={17} />
                          Use my current location
                        </>
                      )}

                    </button>

                  </>
                ) : (
                  <div className="browse-location-success">

                    <div className="browse-location-status">

                      <CheckCircle2 size={17} />

                      <div>

                        <strong>
                          Location captured
                        </strong>

                        <span>
                          Ready for delivery
                        </span>

                      </div>

                    </div>

                    <div className="browse-coordinates">

                      <span>
                        {deliveryLocation.latitude.toFixed(
                          6
                        )}
                      </span>

                      <span>
                        {deliveryLocation.longitude.toFixed(
                          6
                        )}
                      </span>

                    </div>

                    <div className="browse-location-actions">

                      <button
                        type="button"
                        onClick={() => {

                          setDeliveryLocation(
                            null
                          );

                          setManualAddress("");

                          setMessage("");

                        }}
                        disabled={
                          gettingLocation ||
                          geocoding ||
                          ordering
                        }
                      >

                        <RefreshCw size={14} />

                        Change

                      </button>

                      <a
                        href={`https://www.google.com/maps?q=${deliveryLocation.latitude},${deliveryLocation.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                      >

                        <Map size={14} />

                        View on Maps

                      </a>

                    </div>

                  </div>
                )}

              </div>

              {/* =================================================
                  PAYMENT SECTION
              ================================================= */}

              <div className="browse-payment-box">

                <div className="browse-payment-heading">

                  <div className="browse-payment-icon">
                    <CreditCard size={19} />
                  </div>

                  <div>

                    <h3>
                      Payment details
                    </h3>

                    <p>
                      Required to place this order
                    </p>

                  </div>

                </div>

                {/* PAYMENT METHOD */}

                <div className="browse-payment-field">

                  <label htmlFor="paymentMethod">
                    Payment Method
                  </label>

                  <div className="browse-payment-select-wrap">

                    <CreditCard
                      size={16}
                    />

                    <select
                      id="paymentMethod"
                      value={paymentMethod}
                      onChange={(e) => {

                        setPaymentMethod(
                          e.target.value
                        );

                        setError("");

                        setMessage("");
                      }}
                      disabled={ordering}
                    >

                      <option value="">
                        Select payment method
                      </option>

                      <option value="CASH">
                        Cash
                      </option>

                      <option value="UPI">
                        UPI
                      </option>

                      <option value="BANK_TRANSFER">
                        Bank Transfer
                      </option>

                    </select>

                  </div>

                </div>

                {/* PAYMENT TIMING */}

                <div className="browse-payment-field">

                  <label htmlFor="paymentTiming">
                    Payment Timing
                  </label>

                  <div className="browse-payment-select-wrap">

                    <Clock size={16} />

                    <select
                      id="paymentTiming"
                      value={paymentTiming}
                      onChange={(e) => {

                        setPaymentTiming(
                          e.target.value
                        );

                        setError("");

                        setMessage("");
                      }}
                      disabled={ordering}
                    >

                      <option value="">
                        Select payment timing
                      </option>

                      <option value="BEFORE_DELIVERY">
                        Before Delivery
                      </option>

                      <option value="ON_DELIVERY">
                        On Delivery
                      </option>

                    </select>

                  </div>

                </div>

              </div>

              {/* =================================================
                  MESSAGES
              ================================================= */}

              {error && (
                <div className="browse-modal-error">

                  <AlertCircle size={16} />

                  <span>
                    {error}
                  </span>

                </div>
              )}

              {message && (
                <div className="browse-modal-success">

                  <CheckCircle2 size={16} />

                  <span>
                    {message}
                  </span>

                </div>
              )}

              {/* =================================================
                  ACTIONS
              ================================================= */}

              <div className="browse-modal-actions">

                <button
                  type="button"
                  onClick={closeOrderForm}
                  disabled={
                    ordering ||
                    gettingLocation ||
                    geocoding
                  }
                  className="browse-cancel-button"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={placeOrder}
                  disabled={
                    ordering ||
                    gettingLocation ||
                    geocoding ||
                    !deliveryLocation ||
                    !quantity ||
                    Number(quantity) <= 0 ||
                    !paymentMethod ||
                    !paymentTiming
                  }
                  className="browse-confirm-button"
                >

                  {ordering ? (
                    <>
                      <span className="browse-spinner" />

                      Placing order...
                    </>
                  ) : (
                    <>
                      Confirm order

                      <ArrowRight size={17} />
                    </>
                  )}

                </button>

              </div>

              <p className="browse-modal-note">

                Your delivery coordinates and payment
                details are saved with this order so the
                farmer can process and deliver it correctly.

              </p>

            </div>

          </div>
        )}

        {/* =================================================
            PAGE CSS
        ================================================= */}

        <style>{`

          .browse-page {
            width: 100%;
            max-width: 1500px;
            margin: 0 auto;
            padding-bottom: 42px;
            color: #293624;
          }

          /* ============================================
             HERO
          ============================================ */

          .browse-hero {
            position: relative;
            overflow: hidden;
            min-height: 235px;
            display: flex;
            align-items: flex-end;
            justify-content: space-between;
            gap: 30px;
            margin-bottom: 20px;
            padding: 34px 38px;
            border-radius: 28px;
            background:
              linear-gradient(
                135deg,
                #26361c 0%,
                #435624 52%,
                #718440 100%
              );
            box-shadow:
              0 20px 45px rgba(47,64,27,.14);
          }

          .browse-hero-copy {
            position: relative;
            z-index: 2;
            max-width: 680px;
          }

          .browse-eyebrow {
            display: inline-flex;
            align-items: center;
            gap: 7px;
            padding: 7px 11px;
            border: 1px solid rgba(255,255,255,.16);
            border-radius: 999px;
            background: rgba(255,255,255,.08);
            color: #e2ebca;
            font-size: 9px;
            font-weight: 900;
            letter-spacing: .14em;
          }

          .browse-hero h1 {
            margin: 16px 0 11px;
            color: #fff;
            font-size: clamp(35px,4vw,50px);
            line-height: 1;
            font-weight: 900;
            letter-spacing: -.05em;
          }

          .browse-hero h1 span {
            color: #dce8b0;
          }

          .browse-hero p {
            max-width: 610px;
            margin: 0;
            color: #d0dbc1;
            font-size: 13px;
            line-height: 1.7;
          }

          .browse-hero-stats {
            position: relative;
            z-index: 2;
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .browse-hero-stats > div {
            min-width: 105px;
            padding: 15px 16px;
            border: 1px solid rgba(255,255,255,.12);
            border-radius: 15px;
            background: rgba(255,255,255,.08);
            backdrop-filter: blur(10px);
          }

          .browse-hero-stats strong {
            display: block;
            color: white;
            font-size: 23px;
            font-weight: 900;
          }

          .browse-hero-stats span {
            display: block;
            margin-top: 3px;
            color: #bcc9ad;
            font-size: 8px;
            font-weight: 700;
          }

          .browse-hero-circle {
            position: absolute;
            border-radius: 50%;
            pointer-events: none;
          }

          .browse-circle-one {
            width: 320px;
            height: 320px;
            right: -110px;
            top: -180px;
            background: rgba(220,235,175,.08);
          }

          .browse-circle-two {
            width: 230px;
            height: 230px;
            right: 180px;
            bottom: -180px;
            background: rgba(255,255,255,.05);
          }

          /* ============================================
             TOOLBAR
          ============================================ */

          .browse-toolbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 15px;
            margin-bottom: 20px;
            padding: 13px;
            border: 1px solid #dfe6d9;
            border-radius: 18px;
            background: white;
            box-shadow:
              0 6px 20px rgba(49,64,36,.045);
          }

          .browse-search {
            display: flex;
            align-items: center;
            gap: 9px;
            flex: 1;
            min-width: 220px;
            height: 43px;
            padding: 0 13px;
            border: 1px solid #dde4d9;
            border-radius: 12px;
            background: #f9fbf8;
            color: #849080;
          }

          .browse-search:focus-within {
            border-color: #94a76a;
            background: white;
            box-shadow:
              0 0 0 4px rgba(117,137,60,.08);
          }

          .browse-search input {
            width: 100%;
            min-width: 0;
            border: none;
            outline: none;
            background: transparent;
            color: #33412d;
            font-size: 11px;
          }

          .browse-search input::placeholder {
            color: #a0a89c;
          }

          .browse-search button {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 27px;
            height: 27px;
            border: none;
            border-radius: 8px;
            background: #edf1ea;
            color: #788173;
          }

          .browse-filter-group {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .browse-filter-label {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            color: #7f887a;
            font-size: 9px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: .05em;
          }

          .browse-filter-group select {
            height: 43px;
            padding: 0 29px 0 11px;
            border: 1px solid #dde4d8;
            border-radius: 11px;
            background: #fbfcfa;
            color: #5d6859;
            font-size: 10px;
            font-weight: 700;
            outline: none;
          }

          .browse-refresh {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 43px;
            height: 43px;
            border: 1px solid #dce5d5;
            border-radius: 11px;
            background: #f5f8f1;
            color: #617431;
            cursor: pointer;
            transition: .2s ease;
          }

          .browse-refresh:hover {
            transform: translateY(-1px);
            background: #edf4df;
          }

          /* ============================================
             ERROR
          ============================================ */

          .browse-inline-error {
            display: flex;
            align-items: center;
            gap: 9px;
            margin-bottom: 18px;
            padding: 11px 13px;
            border: 1px solid #eed1d1;
            border-radius: 12px;
            background: #fff6f6;
            color: #9f4b4b;
            font-size: 10px;
            font-weight: 700;
          }

          .browse-inline-error span {
            flex: 1;
          }

          .browse-inline-error button {
            padding: 5px 9px;
            border: 1px solid #e7c0c0;
            border-radius: 8px;
            background: white;
            color: #9f4b4b;
            font-size: 9px;
            font-weight: 900;
          }

          /* ============================================
             LISTINGS
          ============================================ */

          .browse-listings-section {
            overflow: hidden;
            border: 1px solid #e1e7dc;
            border-radius: 23px;
            background: white;
            box-shadow:
              0 9px 28px rgba(45,59,34,.05);
          }

          .browse-section-heading {
            display: flex;
            align-items: flex-end;
            justify-content: space-between;
            gap: 20px;
            padding: 24px 26px 19px;
            border-bottom: 1px solid #edf0ea;
          }

          .browse-section-heading span {
            color: #9aa294;
            font-size: 8px;
            font-weight: 900;
            letter-spacing: .16em;
          }

          .browse-section-heading h2 {
            margin: 5px 0 3px;
            color: #2f3c29;
            font-size: 21px;
            font-weight: 900;
          }

          .browse-section-heading p {
            margin: 0;
            color: #929b90;
            font-size: 10px;
          }

          .browse-live-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 7px 10px;
            border: 1px solid #d9e5cd;
            border-radius: 999px;
            background: #f4f8ed;
            color: #637531;
            font-size: 8px !important;
            font-weight: 900 !important;
            letter-spacing: 0 !important;
            white-space: nowrap;
          }

          .browse-live-badge span {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #75a64d;
            box-shadow:
              0 0 0 3px rgba(117,166,77,.12);
          }

          /* ============================================
             GRID
          ============================================ */

          .browse-product-grid {
            display: grid;
            grid-template-columns:
              repeat(3,minmax(0,1fr));
            gap: 18px;
            padding: 23px;
          }

          .browse-product-card {
            overflow: hidden;
            border: 1px solid #e1e7dd;
            border-radius: 19px;
            background: white;
            box-shadow:
              0 5px 18px rgba(44,57,34,.045);
            transition:
              transform .2s ease,
              box-shadow .2s ease;
          }

          .browse-product-card:hover {
            transform: translateY(-3px);
            box-shadow:
              0 14px 30px rgba(44,57,34,.09);
          }

          .browse-image-wrap {
            position: relative;
            height: 210px;
            overflow: hidden;
            background: #edf2e9;
          }

          .browse-image-wrap img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform .35s ease;
          }

          .browse-product-card:hover
          .browse-image-wrap img {
            transform: scale(1.035);
          }

          .browse-no-image {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            color: #718348;
            background:
              linear-gradient(
                145deg,
                #edf4df,
                #e1ebd4
              );
          }

          .browse-category {
            position: absolute;
            top: 11px;
            left: 11px;
            padding: 6px 9px;
            border-radius: 999px;
            font-size: 8px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: .06em;
            backdrop-filter: blur(8px);
          }

          .browse-category-fruit {
            background: rgba(255,249,220,.94);
            color: #9a7720;
          }

          .browse-category-vegetable {
            background: rgba(237,248,222,.94);
            color: #58702e;
          }

          .browse-category-herb {
            background: rgba(227,246,240,.94);
            color: #36766a;
          }

          .browse-category-default {
            background: rgba(244,246,242,.94);
            color: #667064;
          }

          .browse-stock-badge {
            position: absolute;
            top: 11px;
            right: 11px;
            display: inline-flex;
            align-items: center;
            gap: 5px;
            padding: 6px 8px;
            border-radius: 999px;
            background: rgba(255,255,255,.92);
            font-size: 8px;
            font-weight: 900;
            backdrop-filter: blur(8px);
          }

          .browse-stock-badge span {
            width: 5px;
            height: 5px;
            border-radius: 50%;
          }

          .browse-stock-good {
            color: #4a7a4e;
          }

          .browse-stock-good span {
            background: #5e9d61;
          }

          .browse-stock-low {
            color: #9c741e;
          }

          .browse-stock-low span {
            background: #d29c2a;
          }

          .browse-stock-empty {
            color: #a34e4e;
          }

          .browse-stock-empty span {
            background: #cf6464;
          }

          /* ============================================
             CARD CONTENT
          ============================================ */

          .browse-product-content {
            padding: 17px;
          }

          .browse-product-title-row {
            display: flex;
            justify-content: space-between;
            gap: 10px;
          }

          .browse-product-content h3 {
            margin: 0;
            color: #35412f;
            font-size: 16px;
            line-height: 1.25;
            font-weight: 900;
          }

          .browse-farmer {
            display: flex;
            align-items: center;
            gap: 5px;
            margin-top: 5px;
            color: #919a8e;
            font-size: 9px;
          }

          .browse-farmer svg {
            color: #738250;
          }

          .browse-price-row {
            display: flex;
            align-items: flex-end;
            justify-content: space-between;
            gap: 20px;
            margin-top: 17px;
          }

          .browse-price-row > div:first-child {
            display: flex;
            align-items: baseline;
            flex-wrap: wrap;
            column-gap: 4px;
          }

          .browse-price-row > div:first-child span {
            width: 100%;
            display: block;
            color: #a1a89f;
            font-size: 7px;
            font-weight: 900;
            letter-spacing: .07em;
          }

          .browse-price-row strong {
            color: #52702c;
            font-size: 23px;
            line-height: 1;
            font-weight: 900;
            letter-spacing: -.04em;
          }

          .browse-price-row small {
            color: #8c9489;
            font-size: 9px;
          }

          .browse-quantity {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
          }

          .browse-quantity span {
            color: #a0a79d;
            font-size: 7px;
            font-weight: 900;
            letter-spacing: .07em;
          }

          .browse-quantity strong {
            margin-top: 3px;
            color: #566255;
            font-size: 14px;
            font-weight: 900;
          }

          .browse-card-divider {
            height: 1px;
            margin: 15px 0 13px;
            background: #edf0eb;
          }

          .browse-order-button {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 7px;
            width: 100%;
            height: 43px;
            border: none;
            border-radius: 12px;
            background:
              linear-gradient(
                135deg,
                #51682b,
                #789042
              );
            color: white;
            font-size: 10px;
            font-weight: 900;
            box-shadow:
              0 7px 17px rgba(80,105,42,.17);
            transition: .2s ease;
          }

          .browse-order-button:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow:
              0 10px 20px rgba(80,105,42,.22);
          }

          .browse-order-button svg:last-child {
            margin-left: auto;
            opacity: .75;
          }

          .browse-order-button.disabled {
            background: #d9ded7;
            color: #747d70;
            cursor: not-allowed;
            box-shadow: none;
          }

          /* ============================================
             EMPTY
          ============================================ */

          .browse-empty {
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            min-height: 310px;
            padding: 30px;
            text-align: center;
          }

          .browse-empty-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 62px;
            height: 62px;
            margin-bottom: 13px;
            border-radius: 19px;
            background: #eff4e6;
            color: #6f813d;
          }

          .browse-empty h3 {
            margin: 0;
            color: #3a4634;
            font-size: 15px;
            font-weight: 900;
          }

          .browse-empty p {
            margin: 6px 0 15px;
            color: #919a90;
            font-size: 10px;
          }

          .browse-empty button {
            padding: 9px 13px;
            border: none;
            border-radius: 10px;
            background: #edf4df;
            color: #627433;
            font-size: 9px;
            font-weight: 900;
          }

          /* ============================================
             SKELETON
          ============================================ */

          .browse-loading-grid {
            display: grid;
            grid-template-columns:
              repeat(3,minmax(0,1fr));
            gap: 18px;
            padding: 23px;
          }

          .browse-skeleton-card {
            overflow: hidden;
            border: 1px solid #e7ebe4;
            border-radius: 18px;
            padding-bottom: 15px;
            background: white;
          }

          .browse-skeleton-image,
          .browse-skeleton-line,
          .browse-skeleton-button {
            position: relative;
            overflow: hidden;
            background: #edf0eb;
          }

          .browse-skeleton-image {
            height: 210px;
          }

          .browse-skeleton-line {
            height: 11px;
            margin: 15px 15px 0;
            border-radius: 8px;
          }

          .browse-skeleton-line.large {
            width: 55%;
          }

          .browse-skeleton-line.medium {
            width: 40%;
            margin-top: 9px;
          }

          .browse-skeleton-line.small {
            width: 28%;
            margin-top: 9px;
          }

          .browse-skeleton-button {
            height: 40px;
            margin: 16px 15px 0;
            border-radius: 11px;
          }

          /* ============================================
             MODAL
          ============================================ */

          .browse-modal-backdrop {
            position: fixed;
            inset: 0;
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            background: rgba(22,29,19,.58);
            backdrop-filter: blur(7px);
          }

          .browse-order-modal {
            width: min(100%, 570px);
            max-height: calc(100vh - 40px);
            overflow-y: auto;
            padding: 28px;
            border: 1px solid #e0e7da;
            border-radius: 24px;
            background: white;
            box-shadow:
              0 30px 85px rgba(0,0,0,.22);
          }

          .browse-modal-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 20px;
          }

          .browse-modal-header > div > span {
            color: #7e8e57;
            font-size: 8px;
            font-weight: 900;
            letter-spacing: .16em;
          }

          .browse-modal-header h2 {
            margin: 6px 0 0;
            color: #2f3b2a;
            font-size: 24px;
            font-weight: 900;
            letter-spacing: -.03em;
          }

          .browse-modal-close {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 34px;
            height: 34px;
            border: 1px solid #e2e7df;
            border-radius: 10px;
            background: #f7f9f5;
            color: #758073;
          }

          /* ============================================
             SELECTED PRODUCT
          ============================================ */

          .browse-selected-product {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-top: 22px;
            padding: 12px;
            border: 1px solid #e1e7dc;
            border-radius: 16px;
            background: #f8faf6;
          }

          .browse-selected-image {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 68px;
            height: 68px;
            flex-shrink: 0;
            overflow: hidden;
            border-radius: 13px;
            background: #e8efdf;
            color: #748648;
          }

          .browse-selected-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .browse-selected-info {
            flex: 1;
            min-width: 0;
          }

          .browse-selected-info > span {
            color: #839069;
            font-size: 8px;
            font-weight: 900;
            text-transform: uppercase;
          }

          .browse-selected-info h3 {
            margin: 3px 0 3px;
            color: #34412f;
            font-size: 14px;
            font-weight: 900;
          }

          .browse-selected-info p {
            margin: 0;
            color: #8e978b;
            font-size: 9px;
          }

          .browse-selected-info p strong {
            color: #63705c;
          }

          .browse-selected-price {
            display: flex;
            align-items: baseline;
            flex-direction: column;
          }

          .browse-selected-price strong {
            color: #55712f;
            font-size: 19px;
            font-weight: 900;
          }

          .browse-selected-price span {
            color: #929a8f;
            font-size: 8px;
          }

          /* ============================================
             MODAL SECTION
          ============================================ */

          .browse-modal-section {
            margin-top: 21px;
          }

          .browse-modal-section > label {
            display: block;
            margin-bottom: 8px;
            color: #4a5645;
            font-size: 10px;
            font-weight: 900;
          }

          .browse-quantity-control {
            display: grid;
            grid-template-columns: 43px 1fr 43px;
            height: 47px;
            overflow: hidden;
            border: 1px solid #dce3d7;
            border-radius: 13px;
            background: #fbfcfa;
          }

          .browse-quantity-control button {
            display: flex;
            align-items: center;
            justify-content: center;
            border: none;
            background: #f1f4ed;
            color: #64724f;
          }

          .browse-quantity-control button:hover:not(:disabled) {
            background: #e7eedc;
          }

          .browse-quantity-control input {
            width: 100%;
            min-width: 0;
            border: none;
            outline: none;
            background: white;
            color: #33402f;
            text-align: center;
            font-size: 14px;
            font-weight: 900;
          }

          .browse-available-note {
            display: flex;
            align-items: center;
            gap: 5px;
            margin-top: 7px;
            color: #9aa198;
            font-size: 9px;
          }

          .browse-estimated-total {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-top: 12px;
            padding: 13px 14px;
            border: 1px solid #dce8cf;
            border-radius: 13px;
            background:
              linear-gradient(
                135deg,
                #f4f8eb,
                #edf5e0
              );
            color: #617635;
          }

          .browse-estimated-total span {
            display: block;
            color: #85966a;
            font-size: 7px;
            font-weight: 900;
            letter-spacing: .08em;
          }

          .browse-estimated-total strong {
            display: block;
            margin-top: 2px;
            color: #456029;
            font-size: 19px;
            font-weight: 900;
          }

          /* ============================================
             DELIVERY
          ============================================ */

          .browse-delivery-box {
            margin-top: 20px;
            padding: 15px;
            border: 1px solid #dce7ef;
            border-radius: 16px;
            background:
              linear-gradient(
                145deg,
                #f5faff,
                #eff7f9
              );
          }

          .browse-delivery-heading {
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .browse-delivery-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 39px;
            height: 39px;
            border-radius: 12px;
            background: #e2f0f1;
            color: #347683;
          }

          .browse-delivery-heading h3 {
            margin: 0;
            color: #355c66;
            font-size: 12px;
            font-weight: 900;
          }

          .browse-delivery-heading p {
            margin: 3px 0 0;
            color: #8c9ba0;
            font-size: 8px;
          }

          .browse-address-input-row {
            display: flex;
            gap: 8px;
            margin-top: 13px;
          }

          .browse-address-input {
            flex: 1;
            min-width: 0;
            height: 43px;
            padding: 0 12px;
            border: 1px solid #dce3d7;
            border-radius: 11px;
            background: #fbfcfa;
            color: #33402f;
            font-size: 11px;
            outline: none;
          }

          .browse-address-input:focus {
            border-color: #91a464;
          }

          .browse-address-button {
            display: flex;
            align-items: center;
            justify-content: center;
            min-width: 66px;
            height: 43px;
            padding: 0 14px;
            border: none;
            border-radius: 11px;
            background: #51682b;
            color: white;
            font-size: 10px;
            font-weight: 900;
          }

          .browse-address-button:disabled {
            background: #c9d0c4;
            cursor: not-allowed;
          }

          .browse-or-divider {
            display: flex;
            align-items: center;
            gap: 10px;
            margin: 13px 0;
            color: #9aa8a9;
            font-size: 8px;
            font-weight: 900;
            letter-spacing: .1em;
          }

          .browse-or-divider span {
            flex: 1;
            height: 1px;
            background: #dbe4e3;
          }

          .browse-location-button {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 7px;
            width: 100%;
            height: 43px;
            border: none;
            border-radius: 11px;
            background: #426f79;
            color: white;
            font-size: 10px;
            font-weight: 900;
          }

          .browse-location-button:hover:not(:disabled) {
            background: #365f69;
          }

          .browse-location-success {
            margin-top: 13px;
            padding: 12px;
            border: 1px solid #d9e6da;
            border-radius: 12px;
            background: white;
          }

          .browse-location-status {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #3f764d;
          }

          .browse-location-status strong {
            display: block;
            font-size: 10px;
            font-weight: 900;
          }

          .browse-location-status span {
            display: block;
            margin-top: 2px;
            color: #909b91;
            font-size: 8px;
          }

          .browse-coordinates {
            display: flex;
            gap: 7px;
            margin-top: 10px;
          }

          .browse-coordinates span {
            flex: 1;
            padding: 8px 9px;
            border: 1px solid #edf0ec;
            border-radius: 9px;
            background: #fafbf9;
            color: #6d766c;
            font-family:
              ui-monospace,
              SFMono-Regular,
              Menlo,
              monospace;
            font-size: 8px;
            font-weight: 700;
          }

          .browse-location-actions {
            display: flex;
            gap: 8px;
            margin-top: 9px;
          }

          .browse-location-actions button,
          .browse-location-actions a {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 5px;
            flex: 1;
            min-height: 34px;
            border: 1px solid #dce4dc;
            border-radius: 9px;
            background: #f7faf7;
            color: #61705c;
            font-size: 8px;
            font-weight: 900;
            text-decoration: none;
          }

          .browse-location-actions a {
            border-color: #d3e2e4;
            background: #f3f9fa;
            color: #46737b;
          }

          /* ============================================
             PAYMENT
          ============================================ */

          .browse-payment-box {
            margin-top: 20px;
            padding: 15px;
            border: 1px solid #e4dfd1;
            border-radius: 16px;
            background:
              linear-gradient(
                145deg,
                #fffdf7,
                #f9f7ef
              );
          }

          .browse-payment-heading {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 15px;
          }

          .browse-payment-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 39px;
            height: 39px;
            border-radius: 12px;
            background: #f0ead8;
            color: #806d35;
          }

          .browse-payment-heading h3 {
            margin: 0;
            color: #62552e;
            font-size: 12px;
            font-weight: 900;
          }

          .browse-payment-heading p {
            margin: 3px 0 0;
            color: #9a947f;
            font-size: 8px;
          }

          .browse-payment-field {
            margin-top: 12px;
          }

          .browse-payment-field label {
            display: block;
            margin-bottom: 7px;
            color: #4e5545;
            font-size: 9px;
            font-weight: 900;
          }

          .browse-payment-select-wrap {
            display: flex;
            align-items: center;
            gap: 8px;
            height: 43px;
            padding: 0 11px;
            border: 1px solid #dce2d7;
            border-radius: 11px;
            background: white;
            color: #78816f;
          }

          .browse-payment-select-wrap:focus-within {
            border-color: #91a464;
            box-shadow:
              0 0 0 4px rgba(117,137,60,.07);
          }

          .browse-payment-select-wrap select {
            width: 100%;
            height: 100%;
            border: none;
            outline: none;
            background: transparent;
            color: #414b3b;
            font-size: 10px;
            font-weight: 700;
          }

          /* ============================================
             MESSAGES
          ============================================ */

          .browse-modal-error,
          .browse-modal-success {
            display: flex;
            align-items: flex-start;
            gap: 8px;
            margin-top: 12px;
            padding: 11px 12px;
            border-radius: 11px;
            font-size: 9px;
            font-weight: 700;
            line-height: 1.5;
          }

          .browse-modal-error {
            border: 1px solid #efd0d0;
            background: #fff5f5;
            color: #a44a4a;
          }

          .browse-modal-success {
            border: 1px solid #d4e6d7;
            background: #f1faf3;
            color: #477653;
          }

          /* ============================================
             ACTIONS
          ============================================ */

          .browse-modal-actions {
            display: grid;
            grid-template-columns: .75fr 1.25fr;
            gap: 9px;
            margin-top: 20px;
          }

          .browse-cancel-button,
          .browse-confirm-button {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 7px;
            height: 45px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: 900;
          }

          .browse-cancel-button {
            border: 1px solid #dce3d8;
            background: #f8faf7;
            color: #687366;
          }

          .browse-confirm-button {
            border: none;
            background:
              linear-gradient(
                135deg,
                #50672a,
                #758c3d
              );
            color: white;
            box-shadow:
              0 8px 18px rgba(78,101,39,.18);
          }

          .browse-confirm-button:disabled {
            background: #c9d0c4;
            box-shadow: none;
            cursor: not-allowed;
          }

          .browse-modal-note {
            margin: 13px 0 0;
            color: #9ca39a;
            font-size: 8px;
            line-height: 1.6;
            text-align: center;
          }

          /* ============================================
             SPINNER
          ============================================ */

          .browse-spinner {
            width: 14px;
            height: 14px;
            border: 2px solid rgba(255,255,255,.4);
            border-top-color: white;
            border-radius: 50%;
            animation:
              browse-spin
              .7s
              linear
              infinite;
          }

          @keyframes browse-spin {
            to {
              transform: rotate(360deg);
            }
          }

          /* ============================================
             RESPONSIVE
          ============================================ */

          @media (max-width: 1100px) {

            .browse-product-grid,
            .browse-loading-grid {
              grid-template-columns:
                repeat(2,minmax(0,1fr));
            }

          }

          @media (max-width: 850px) {

            .browse-hero {
              align-items: flex-start;
              flex-direction: column;
              min-height: auto;
            }

            .browse-hero-stats {
              width: 100%;
            }

            .browse-hero-stats > div {
              flex: 1;
            }

            .browse-toolbar {
              align-items: stretch;
              flex-direction: column;
            }

            .browse-filter-group {
              flex-wrap: wrap;
            }

            .browse-filter-label {
              display: none;
            }

          }

          @media (max-width: 650px) {

            .browse-product-grid,
            .browse-loading-grid {
              grid-template-columns: 1fr;
            }

            .browse-hero {
              padding: 27px 22px;
              border-radius: 22px;
            }

            .browse-hero h1 {
              font-size: 35px;
            }

            .browse-section-heading {
              align-items: flex-start;
              flex-direction: column;
            }

            .browse-product-grid,
            .browse-loading-grid {
              padding: 15px;
            }

            .browse-order-modal {
              padding: 21px;
              border-radius: 20px;
            }

          }

          @media (max-width: 480px) {

            .browse-filter-group {
              display: grid;
              grid-template-columns:
                1fr 1fr 43px;
            }

            .browse-filter-group select {
              width: 100%;
            }

            .browse-selected-product {
              align-items: flex-start;
              flex-wrap: wrap;
            }

            .browse-selected-price {
              width: 100%;
              flex-direction: row;
              align-items: baseline;
              gap: 4px;
              padding-left: 80px;
            }

            .browse-modal-actions {
              grid-template-columns: 1fr;
            }

            .browse-address-input-row {
              flex-direction: column;
            }

            .browse-address-button {
              width: 100%;
            }

          }

        `}</style>

      </div>
    </DashboardLayout>
  );
}

export default BusinessBrowseProducts;