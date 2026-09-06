import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import {
  addProduce,
  getMyProduce,
  deleteProduce,
} from "../../api/produceApi";
import {
  Package,
  Plus,
  Upload,
  Image as ImageIcon,
  Leaf,
  Tag,
  IndianRupee,
  Boxes,
  FileText,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Sprout,
} from "lucide-react";

function FarmerProducts() {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState(null);

  // Delete confirmation
  const [deleteProduct, setDeleteProduct] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "",
    category: "",
    imageUrl: "",
  });

  // =========================================================
  // GET FARMER PRODUCTS
  // =========================================================

  const fetchProducts = async () => {
    try {
      const res = await getMyProduce();

      setProducts(
        Array.isArray(res.data)
          ? res.data
          : []
      );
    } catch (err) {
      console.error(
        "Failed to load products",
        err
      );
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // =========================================================
  // HANDLE INPUT
  // =========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================================================
  // IMAGE UPLOAD
  // =========================================================

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    setError("");

    const reader = new FileReader();

    reader.onloadend = () => {
      setImagePreview(reader.result);

      setForm((previous) => ({
        ...previous,
        imageUrl: reader.result,
      }));
    };

    reader.readAsDataURL(file);
  };

  // =========================================================
  // ADD PRODUCT
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!form.name.trim()) {
      setError("Product name is required.");
      return;
    }

    if (
      form.price === "" ||
      Number(form.price) < 0
    ) {
      setError("Please enter a valid price.");
      return;
    }

    if (
      form.quantity === "" ||
      Number(form.quantity) < 0
    ) {
      setError(
        "Please enter a valid quantity."
      );
      return;
    }

    setLoading(true);

    try {
      await addProduce({
        ...form,
        name: form.name.trim(),
        description:
          form.description.trim(),
        category:
          form.category.trim(),
        price: parseFloat(form.price),
        quantity: parseFloat(form.quantity),
      });

      setForm({
        name: "",
        description: "",
        price: "",
        quantity: "",
        category: "",
        imageUrl: "",
      });

      setImagePreview(null);
      setShowForm(false);

      await fetchProducts();
    } catch (err) {
      console.error(
        "Failed to add product:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Failed to add product"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // OPEN DELETE CONFIRMATION
  // =========================================================

  const openDeleteConfirmation = (product) => {
    setDeleteProduct(product);
  };

  // =========================================================
  // CONFIRM DELETE
  // =========================================================

  const confirmDelete = async () => {
    if (!deleteProduct) return;

    setDeleteLoading(true);
    setError("");

    try {
      await deleteProduce(
        deleteProduct.id
      );

      setProducts((previous) =>
        previous.filter(
          (product) =>
            product.id !==
            deleteProduct.id
        )
      );

      setDeleteProduct(null);
    } catch (err) {
      console.error(
        "Failed to delete product:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Failed to delete product"
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  // =========================================================
  // CANCEL DELETE
  // =========================================================

  const cancelDelete = () => {
    if (deleteLoading) return;

    setDeleteProduct(null);
  };

  // =========================================================
  // FORM CLOSE
  // =========================================================

  const closeForm = () => {
    if (loading) return;

    setShowForm(false);
    setError("");

    setForm({
      name: "",
      description: "",
      price: "",
      quantity: "",
      category: "",
      imageUrl: "",
    });

    setImagePreview(null);
  };

  // =========================================================
  // STATS
  // =========================================================

  const totalProducts = products.length;

  const totalStock = products.reduce(
    (sum, product) =>
      sum + Number(product.quantity || 0),
    0
  );

  const averagePrice =
    products.length > 0
      ? products.reduce(
          (sum, product) =>
            sum +
            Number(product.price || 0),
          0
        ) / products.length
      : 0;

  return (
    <DashboardLayout>
      <div className="farmer-products-page">

        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <section className="products-page-header">

          <div>
            <div className="products-breadcrumb">
              <Sprout size={13} />
              FARMER WORKSPACE
            </div>

            <h1>
              My Products
            </h1>

            <p>
              Manage your produce listings,
              pricing, stock, and product photos.
            </p>
          </div>

          <button
            type="button"
            className="add-product-header-button"
            onClick={() =>
              setShowForm(
                (previous) =>
                  !previous
              )
            }
          >
            {showForm ? (
              <>
                <X size={17} />
                Close
              </>
            ) : (
              <>
                <Plus size={18} />
                Add Product
              </>
            )}
          </button>

        </section>

        {/* =================================================
            QUICK STATS
        ================================================= */}

        <section className="products-summary-grid">

          <div className="product-summary-card green">
            <div className="summary-icon">
              <Package size={19} />
            </div>

            <div>
              <span>Total Listings</span>
              <strong>
                {totalProducts}
              </strong>
            </div>

            <small>
              active products
            </small>
          </div>

          <div className="product-summary-card blue">
            <div className="summary-icon">
              <Boxes size={19} />
            </div>

            <div>
              <span>Total Stock</span>
              <strong>
                {totalStock.toLocaleString(
                  "en-IN"
                )}
              </strong>
            </div>

            <small>
              available units
            </small>
          </div>

          <div className="product-summary-card amber">
            <div className="summary-icon">
              <IndianRupee size={19} />
            </div>

            <div>
              <span>Average Price</span>
              <strong>
                ₹
                {averagePrice.toLocaleString(
                  "en-IN",
                  {
                    maximumFractionDigits: 0,
                  }
                )}
              </strong>
            </div>

            <small>
              per unit
            </small>
          </div>

        </section>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="products-alert">
            <AlertCircle size={18} />

            <span>
              {error}
            </span>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* =================================================
            ADD PRODUCT FORM
        ================================================= */}

        {showForm && (
          <section className="product-create-card">

            <div className="product-create-heading">

              <div>
                <span>
                  NEW LISTING
                </span>

                <h2>
                  Add a new product
                </h2>

                <p>
                  Add accurate details so buyers
                  can find and purchase your produce.
                </p>
              </div>

              <div className="create-heading-icon">
                <Leaf size={22} />
              </div>

            </div>

            <form
              onSubmit={handleSubmit}
              className="product-create-form"
            >

              {/* IMAGE */}

              <div className="upload-column">

                <div className="form-label">
                  Product Photo
                </div>

                <label
                  htmlFor="imageUpload"
                  className={`product-upload-box ${
                    imagePreview
                      ? "has-image"
                      : ""
                  }`}
                >

                  {imagePreview ? (
                    <>
                      <img
                        src={imagePreview}
                        alt="Product preview"
                      />

                      <div className="image-overlay">
                        <Upload size={18} />
                        Change photo
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="upload-icon">
                        <ImageIcon
                          size={25}
                        />
                      </div>

                      <strong>
                        Upload product photo
                      </strong>

                      <span>
                        JPG, PNG or WEBP
                      </span>

                      <small>
                        Click to choose an image
                      </small>
                    </>
                  )}

                </label>

                <input
                  id="imageUpload"
                  type="file"
                  accept="image/*"
                  onChange={
                    handleImageChange
                  }
                  className="hidden-input"
                />

              </div>

              {/* FIELDS */}

              <div className="product-fields">

                <div className="field-group">
                  <label htmlFor="productName">
                    Product Name
                  </label>

                  <div className="input-shell">
                    <Package size={17} />

                    <input
                      id="productName"
                      type="text"
                      name="name"
                      placeholder="e.g. Fresh Tomatoes"
                      value={form.name}
                      onChange={
                        handleChange
                      }
                      required
                    />
                  </div>
                </div>

                <div className="fields-two-column">

                  <div className="field-group">
                    <label htmlFor="category">
                      Category
                    </label>

                    <div className="input-shell">
                      <Tag size={17} />

                      <input
                        id="category"
                        type="text"
                        name="category"
                        placeholder="Vegetable, Fruit..."
                        value={
                          form.category
                        }
                        onChange={
                          handleChange
                        }
                      />
                    </div>
                  </div>

                  <div className="field-group">
                    <label htmlFor="price">
                      Price per unit
                    </label>

                    <div className="input-shell">
                      <IndianRupee
                        size={17}
                      />

                      <input
                        id="price"
                        type="number"
                        name="price"
                        placeholder="0"
                        value={form.price}
                        onChange={
                          handleChange
                        }
                        required
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                </div>

                <div className="field-group">
                  <label htmlFor="quantity">
                    Quantity Available
                  </label>

                  <div className="input-shell">
                    <Boxes size={17} />

                    <input
                      id="quantity"
                      type="number"
                      name="quantity"
                      placeholder="Available quantity"
                      value={
                        form.quantity
                      }
                      onChange={
                        handleChange
                      }
                      required
                      min="0"
                    />
                  </div>
                </div>

                <div className="field-group">
                  <label htmlFor="description">
                    Description
                  </label>

                  <div className="textarea-shell">
                    <FileText
                      size={17}
                    />

                    <textarea
                      id="description"
                      name="description"
                      placeholder="Describe the quality, freshness, variety, or other useful details..."
                      value={
                        form.description
                      }
                      onChange={
                        handleChange
                      }
                      rows={4}
                    />
                  </div>
                </div>

                <div className="create-form-actions">

                  <button
                    type="button"
                    onClick={closeForm}
                    className="cancel-form-button"
                    disabled={loading}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="save-product-button"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="button-spinner" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle2
                          size={17}
                        />
                        Save Product
                      </>
                    )}
                  </button>

                </div>

              </div>

            </form>

          </section>
        )}

        {/* =================================================
            ALL LISTINGS
        ================================================= */}

        <section className="all-listings-card">

          <div className="listings-header">

            <div>
              <span>
                INVENTORY
              </span>

              <h2>
                All Listings
              </h2>

              <p>
                Products currently available on
                AgriConnect.
              </p>
            </div>

            <div className="listing-count">
              <Package size={15} />
              {totalProducts}{" "}
              {totalProducts === 1
                ? "product"
                : "products"}
            </div>

          </div>

          {products.length === 0 ? (
            <div className="empty-products">

              <div className="empty-products-icon">
                <Leaf size={27} />
              </div>

              <h3>
                No products yet
              </h3>

              <p>
                Start by adding your first
                produce listing.
              </p>

              <button
                type="button"
                onClick={() =>
                  setShowForm(true)
                }
                className="empty-add-button"
              >
                <Plus size={17} />
                Add your first product
              </button>

            </div>
          ) : (
            <div className="product-grid">

              {products.map((product) => {

                const stock =
                  Number(
                    product.quantity || 0
                  );

                const price =
                  Number(
                    product.price || 0
                  );

                let stockStatus =
                  "In stock";

                let stockClass =
                  "stock-good";

                if (stock === 0) {
                  stockStatus =
                    "Out of stock";
                  stockClass =
                    "stock-empty";
                } else if (stock <= 10) {
                  stockStatus =
                    "Low stock";
                  stockClass =
                    "stock-low";
                }

                return (
                  <article
                    key={product.id}
                    className="product-card-pro"
                  >

                    <div className="product-card-image">

                      {product.imageUrl ? (
                        <img
                          src={
                            product.imageUrl
                          }
                          alt={
                            product.name
                          }
                        />
                      ) : (
                        <div className="product-no-image">
                          <Leaf size={34} />
                        </div>
                      )}

                      {product.category && (
                        <span className="product-category">
                          {product.category}
                        </span>
                      )}

                    </div>

                    <div className="product-card-content">

                      <div className="product-card-title-row">
                        <div>
                          <h3>
                            {product.name}
                          </h3>

                          <p>
                            Fresh farm produce
                          </p>
                        </div>

                        <div
                          className={`stock-pill ${stockClass}`}
                        >
                          {stockStatus}
                        </div>
                      </div>

                      <div className="product-price-row">
                        <div>
                          <span>
                            PRICE
                          </span>

                          <strong>
                            ₹
                            {price.toLocaleString(
                              "en-IN",
                              {
                                maximumFractionDigits: 2,
                              }
                            )}
                          </strong>

                          <small>
                            / unit
                          </small>
                        </div>

                        <div className="quantity-display">
                          <span>
                            AVAILABLE
                          </span>

                          <strong>
                            {stock.toLocaleString(
                              "en-IN"
                            )}
                          </strong>
                        </div>
                      </div>

                      <div className="product-card-divider" />

                      <div className="product-card-footer">

                        <div className="product-listed">
                          <CheckCircle2
                            size={14}
                          />

                          <span>
                            Listed on AgriConnect
                          </span>
                        </div>

                        <button
                          type="button"
                          className="delete-product-button"
                          onClick={() =>
                            openDeleteConfirmation(
                              product
                            )
                          }
                        >
                          <Trash2
                            size={15}
                          />
                          Delete
                        </button>

                      </div>

                    </div>

                  </article>
                );
              })}

            </div>
          )}

        </section>

        {/* =================================================
            DELETE MODAL
        ================================================= */}

        {deleteProduct && (
          <div
            className="delete-modal-backdrop"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-product-title"
          >

            <div className="delete-modal">

              <button
                type="button"
                className="delete-close"
                onClick={cancelDelete}
                disabled={
                  deleteLoading
                }
                aria-label="Close"
              >
                <X size={18} />
              </button>

              <div className="delete-modal-icon">
                <Trash2 size={22} />
              </div>

              <span className="delete-kicker">
                REMOVE LISTING
              </span>

              <h2 id="delete-product-title">
                Delete product?
              </h2>

              <p>
                You're about to permanently
                remove{" "}
                <strong>
                  {deleteProduct.name}
                </strong>{" "}
                from your listings.
              </p>

              <div className="delete-warning">
                <AlertCircle size={16} />
                <span>
                  This action cannot be undone.
                </span>
              </div>

              <div className="delete-actions">

                <button
                  type="button"
                  onClick={
                    cancelDelete
                  }
                  disabled={
                    deleteLoading
                  }
                  className="delete-cancel-button"
                >
                  Keep Product
                </button>

                <button
                  type="button"
                  onClick={
                    confirmDelete
                  }
                  disabled={
                    deleteLoading
                  }
                  className="delete-confirm-button"
                >
                  {deleteLoading ? (
                    <>
                      <span className="button-spinner red" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={15} />
                      Delete Product
                    </>
                  )}
                </button>

              </div>

            </div>

          </div>
        )}

        {/* =================================================
            PAGE CSS
        ================================================= */}

        <style>{`

          .farmer-products-page {
            width: 100%;
            max-width: 1480px;
            margin: 0 auto;
            padding-bottom: 42px;
            color: #293622;
          }

          /* ===============================================
             HEADER
          =============================================== */

          .products-page-header {
            display: flex;
            align-items: flex-end;
            justify-content: space-between;
            gap: 30px;
            margin-bottom: 22px;
          }

          .products-breadcrumb {
            display: inline-flex;
            align-items: center;
            gap: 7px;
            color: #829064;
            font-size: 10px;
            font-weight: 900;
            letter-spacing: .14em;
            margin-bottom: 8px;
          }

          .products-page-header h1 {
            margin: 0;
            color: #293622;
            font-size: clamp(32px, 3vw, 42px);
            line-height: 1.05;
            font-weight: 900;
            letter-spacing: -.045em;
          }

          .products-page-header p {
            margin: 9px 0 0;
            color: #879183;
            font-size: 13px;
            line-height: 1.6;
          }

          .add-product-header-button {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 11px 16px;
            border: none;
            border-radius: 13px;
            background:
              linear-gradient(
                135deg,
                #506326,
                #72883d
              );
            color: white;
            font-size: 11px;
            font-weight: 900;
            box-shadow:
              0 8px 20px rgba(79,101,37,.18);
            transition: .2s ease;
          }

          .add-product-header-button:hover {
            transform: translateY(-2px);
            box-shadow:
              0 12px 24px rgba(79,101,37,.22);
          }

          /* ===============================================
             SUMMARY
          =============================================== */

          .products-summary-grid {
            display: grid;
            grid-template-columns:
              repeat(3,minmax(0,1fr));
            gap: 15px;
            margin-bottom: 22px;
          }

          .product-summary-card {
            display: flex;
            align-items: center;
            gap: 12px;
            min-width: 0;
            padding: 16px 18px;
            border: 1px solid;
            border-radius: 17px;
            background: white;
          }

          .product-summary-card.green {
            border-color: #dce7ca;
            background: #f8fbf2;
          }

          .product-summary-card.blue {
            border-color: #dce6f1;
            background: #f7faff;
          }

          .product-summary-card.amber {
            border-color: #eee1bf;
            background: #fffaf0;
          }

          .summary-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 39px;
            height: 39px;
            flex-shrink: 0;
            border-radius: 12px;
          }

          .product-summary-card.green .summary-icon {
            background: #ebf4d9;
            color: #60732e;
          }

          .product-summary-card.blue .summary-icon {
            background: #eaf2fb;
            color: #557496;
          }

          .product-summary-card.amber .summary-icon {
            background: #fff1d2;
            color: #ac7920;
          }

          .product-summary-card > div:nth-child(2) {
            display: flex;
            flex-direction: column;
            min-width: 0;
            flex: 1;
          }

          .product-summary-card span {
            color: #899283;
            font-size: 9px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: .05em;
          }

          .product-summary-card strong {
            margin-top: 2px;
            color: #37432f;
            font-size: 20px;
            font-weight: 900;
          }

          .product-summary-card small {
            color: #a1a89d;
            font-size: 9px;
            font-weight: 700;
            white-space: nowrap;
          }

          /* ===============================================
             ALERT
          =============================================== */

          .products-alert {
            display: flex;
            align-items: center;
            gap: 9px;
            margin-bottom: 20px;
            padding: 13px 14px;
            border: 1px solid #efcccc;
            border-radius: 13px;
            background: #fff5f5;
            color: #a13e3e;
            font-size: 11px;
            font-weight: 700;
          }

          .products-alert span {
            flex: 1;
          }

          .products-alert button {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 28px;
            height: 28px;
            border: none;
            border-radius: 9px;
            background: rgba(161,62,62,.07);
            color: #a13e3e;
          }

          /* ===============================================
             CREATE PRODUCT
          =============================================== */

          .product-create-card {
            overflow: hidden;
            margin-bottom: 23px;
            border: 1px solid #dfe6d6;
            border-radius: 24px;
            background: white;
            box-shadow:
              0 10px 32px rgba(46,59,35,.06);
          }

          .product-create-heading {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
            padding: 25px 27px 21px;
            border-bottom: 1px solid #edf0e9;
            background:
              linear-gradient(
                90deg,
                #fbfcf8,
                #f7faf2
              );
          }

          .product-create-heading > div:first-child > span {
            color: #8e987f;
            font-size: 9px;
            font-weight: 900;
            letter-spacing: .16em;
          }

          .product-create-heading h2 {
            margin: 5px 0 4px;
            color: #2e3b27;
            font-size: 21px;
            font-weight: 900;
          }

          .product-create-heading p {
            margin: 0;
            color: #899286;
            font-size: 11px;
          }

          .create-heading-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 49px;
            height: 49px;
            border-radius: 15px;
            background: #eaf3d9;
            color: #607431;
          }

          .product-create-form {
            display: grid;
            grid-template-columns: 290px minmax(0,1fr);
            gap: 30px;
            padding: 27px;
          }

          .upload-column {
            min-width: 0;
          }

          .form-label {
            margin-bottom: 8px;
            color: #4c5847;
            font-size: 11px;
            font-weight: 800;
          }

          .product-upload-box {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            width: 100%;
            min-height: 285px;
            overflow: hidden;
            border: 1.5px dashed #cad5be;
            border-radius: 20px;
            background:
              linear-gradient(
                145deg,
                #f8faf5,
                #f1f5ea
              );
            color: #748163;
            cursor: pointer;
            transition: .2s ease;
          }

          .product-upload-box:hover {
            border-color: #8ea259;
            background: #f4f8eb;
          }

          .product-upload-box.has-image {
            border-style: solid;
            border-color: #dbe5d1;
          }

          .product-upload-box img {
            width: 100%;
            height: 100%;
            min-height: 285px;
            object-fit: cover;
          }

          .upload-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 57px;
            height: 57px;
            margin-bottom: 14px;
            border-radius: 17px;
            background: white;
            color: #708342;
            box-shadow:
              0 6px 18px rgba(62,77,39,.08);
          }

          .product-upload-box strong {
            color: #4f5c45;
            font-size: 12px;
            font-weight: 900;
          }

          .product-upload-box > span {
            margin-top: 5px;
            color: #929b8f;
            font-size: 10px;
          }

          .product-upload-box > small {
            margin-top: 12px;
            color: #adb5aa;
            font-size: 9px;
            font-weight: 700;
          }

          .image-overlay {
            position: absolute;
            left: 12px;
            right: 12px;
            bottom: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 7px;
            padding: 10px;
            border-radius: 11px;
            background: rgba(33,43,24,.78);
            color: white;
            font-size: 10px;
            font-weight: 800;
            backdrop-filter: blur(8px);
          }

          .hidden-input {
            display: none;
          }

          .product-fields {
            display: grid;
            align-content: start;
            gap: 17px;
          }

          .field-group {
            display: grid;
            gap: 7px;
          }

          .field-group label {
            color: #4c5748;
            font-size: 10px;
            font-weight: 800;
          }

          .input-shell,
          .textarea-shell {
            display: flex;
            align-items: center;
            gap: 10px;
            border: 1px solid #dce3d7;
            border-radius: 13px;
            background: #fbfcfa;
            color: #8f978b;
            transition: .2s ease;
          }

          .input-shell {
            min-height: 48px;
            padding: 0 13px;
          }

          .textarea-shell {
            align-items: flex-start;
            padding: 12px 13px;
          }

          .input-shell:focus-within,
          .textarea-shell:focus-within {
            border-color: #8aa052;
            background: white;
            box-shadow:
              0 0 0 4px rgba(138,160,82,.09);
          }

          .input-shell input,
          .textarea-shell textarea {
            width: 100%;
            min-width: 0;
            border: none;
            outline: none;
            background: transparent;
            color: #2e3929;
            font-size: 12px;
          }

          .textarea-shell textarea {
            resize: vertical;
            line-height: 1.55;
          }

          .input-shell input::placeholder,
          .textarea-shell textarea::placeholder {
            color: #aab2a7;
          }

          .fields-two-column {
            display: grid;
            grid-template-columns:
              repeat(2,minmax(0,1fr));
            gap: 15px;
          }

          .create-form-actions {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
            margin-top: 2px;
          }

          .cancel-form-button,
          .save-product-button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 7px;
            min-height: 43px;
            padding: 10px 16px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: 900;
            transition: .2s ease;
          }

          .cancel-form-button {
            border: 1px solid #dce2d7;
            background: #f8faf7;
            color: #687364;
          }

          .cancel-form-button:hover:not(:disabled) {
            background: #f1f4ee;
          }

          .save-product-button {
            border: none;
            background:
              linear-gradient(
                135deg,
                #52672a,
                #758b3e
              );
            color: white;
            box-shadow:
              0 7px 17px rgba(80,104,40,.18);
          }

          .save-product-button:hover:not(:disabled) {
            transform: translateY(-1px);
          }

          .save-product-button:disabled,
          .cancel-form-button:disabled {
            opacity: .6;
            cursor: not-allowed;
          }

          .button-spinner {
            width: 14px;
            height: 14px;
            border: 2px solid rgba(255,255,255,.4);
            border-top-color: white;
            border-radius: 50%;
            animation:
              product-spin
              .7s
              linear
              infinite;
          }

          .button-spinner.red {
            border-color: rgba(255,255,255,.35);
            border-top-color: white;
          }

          @keyframes product-spin {
            to {
              transform: rotate(360deg);
            }
          }

          /* ===============================================
             LISTINGS
          =============================================== */

          .all-listings-card {
            overflow: hidden;
            border: 1px solid #e2e7dd;
            border-radius: 24px;
            background: white;
            box-shadow:
              0 9px 30px rgba(46,59,35,.05);
          }

          .listings-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
            padding: 25px 27px 21px;
            border-bottom: 1px solid #edf0e9;
          }

          .listings-header > div:first-child > span {
            display: block;
            color: #99a190;
            font-size: 9px;
            font-weight: 900;
            letter-spacing: .16em;
          }

          .listings-header h2 {
            margin: 5px 0 3px;
            color: #2d3827;
            font-size: 21px;
            font-weight: 900;
          }

          .listings-header p {
            margin: 0;
            color: #8b9487;
            font-size: 11px;
          }

          .listing-count {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 8px 10px;
            border: 1px solid #dce7cc;
            border-radius: 999px;
            background: #f5f9eb;
            color: #667634;
            font-size: 9px;
            font-weight: 900;
            white-space: nowrap;
          }

          .product-grid {
            display: grid;
            grid-template-columns:
              repeat(3,minmax(0,1fr));
            gap: 18px;
            padding: 23px;
          }

          .product-card-pro {
            overflow: hidden;
            border: 1px solid #e3e8df;
            border-radius: 19px;
            background: white;
            box-shadow:
              0 5px 19px rgba(45,58,34,.045);
            transition:
              transform .2s ease,
              box-shadow .2s ease;
          }

          .product-card-pro:hover {
            transform: translateY(-3px);
            box-shadow:
              0 13px 30px rgba(45,58,34,.08);
          }

          .product-card-image {
            position: relative;
            height: 205px;
            overflow: hidden;
            background: #f1f4ed;
          }

          .product-card-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform .35s ease;
          }

          .product-card-pro:hover
          .product-card-image img {
            transform: scale(1.035);
          }

          .product-category {
            position: absolute;
            left: 12px;
            top: 12px;
            padding: 6px 9px;
            border-radius: 999px;
            background: rgba(255,255,255,.9);
            color: #5e7030;
            font-size: 8px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: .06em;
            backdrop-filter: blur(7px);
          }

          .product-no-image {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            color: #82925c;
            background:
              linear-gradient(
                145deg,
                #edf3e2,
                #e3ecd5
              );
          }

          .product-card-content {
            padding: 17px;
          }

          .product-card-title-row {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 12px;
          }

          .product-card-title-row h3 {
            margin: 0;
            overflow: hidden;
            color: #35402f;
            font-size: 15px;
            font-weight: 900;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .product-card-title-row p {
            margin: 4px 0 0;
            color: #9aa196;
            font-size: 9px;
          }

          .stock-pill {
            padding: 5px 8px;
            border: 1px solid;
            border-radius: 999px;
            font-size: 8px;
            font-weight: 900;
            white-space: nowrap;
          }

          .stock-good {
            border-color: #cfe5d3;
            background: #eff9f1;
            color: #3c7750;
          }

          .stock-low {
            border-color: #f1ddae;
            background: #fff8e8;
            color: #9f711e;
          }

          .stock-empty {
            border-color: #efcccc;
            background: #fff4f4;
            color: #a34242;
          }

          .product-price-row {
            display: flex;
            align-items: flex-end;
            justify-content: space-between;
            gap: 15px;
            margin-top: 17px;
          }

          .product-price-row > div,
          .quantity-display {
            display: flex;
            align-items: baseline;
            gap: 5px;
          }

          .product-price-row > div:first-child {
            flex-wrap: wrap;
            align-items: baseline;
          }

          .product-price-row span {
            width: 100%;
            display: block;
            color: #a1a79d;
            font-size: 8px;
            font-weight: 900;
            letter-spacing: .05em;
          }

          .product-price-row strong {
            color: #52672b;
            font-size: 23px;
            font-weight: 900;
            letter-spacing: -.04em;
          }

          .product-price-row small {
            color: #8e968b;
            font-size: 9px;
          }

          .quantity-display strong {
            color: #4e594b;
            font-size: 14px;
            font-weight: 900;
          }

          .product-card-divider {
            height: 1px;
            margin: 15px 0 12px;
            background: #edf0eb;
          }

          .product-card-footer {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
          }

          .product-listed {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            min-width: 0;
            color: #8c9588;
            font-size: 8px;
            font-weight: 700;
          }

          .product-listed svg {
            color: #6c8440;
            flex-shrink: 0;
          }

          .delete-product-button {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            border: none;
            background: transparent;
            color: #b24d4d;
            font-size: 9px;
            font-weight: 900;
            cursor: pointer;
          }

          .delete-product-button:hover {
            color: #8f3131;
          }

          /* ===============================================
             EMPTY STATE
          =============================================== */

          .empty-products {
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            min-height: 330px;
            padding: 35px;
            text-align: center;
          }

          .empty-products-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 65px;
            height: 65px;
            margin-bottom: 12px;
            border-radius: 19px;
            background: #eef4df;
            color: #71833e;
          }

          .empty-products h3 {
            margin: 0;
            color: #37432f;
            font-size: 16px;
            font-weight: 900;
          }

          .empty-products p {
            margin: 6px 0 17px;
            color: #939b91;
            font-size: 11px;
          }

          .empty-add-button {
            display: inline-flex;
            align-items: center;
            gap: 7px;
            padding: 10px 14px;
            border: none;
            border-radius: 11px;
            background: #edf4dc;
            color: #617331;
            font-size: 10px;
            font-weight: 900;
          }

          /* ===============================================
             DELETE MODAL
          =============================================== */

          .delete-modal-backdrop {
            position: fixed;
            inset: 0;
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            background: rgba(25,31,20,.55);
            backdrop-filter: blur(5px);
          }

          .delete-modal {
            position: relative;
            width: min(100%, 440px);
            padding: 29px;
            border: 1px solid #e5e8e1;
            border-radius: 23px;
            background: white;
            box-shadow:
              0 30px 80px rgba(0,0,0,.2);
          }

          .delete-close {
            position: absolute;
            top: 15px;
            right: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 31px;
            height: 31px;
            border: none;
            border-radius: 9px;
            background: #f4f5f2;
            color: #737b70;
          }

          .delete-modal-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 48px;
            height: 48px;
            margin-bottom: 15px;
            border-radius: 14px;
            background: #fff0f0;
            color: #b34a4a;
          }

          .delete-kicker {
            color: #a04b4b;
            font-size: 9px;
            font-weight: 900;
            letter-spacing: .14em;
          }

          .delete-modal h2 {
            margin: 6px 0 8px;
            color: #313b2c;
            font-size: 23px;
            font-weight: 900;
          }

          .delete-modal > p {
            margin: 0;
            color: #7e877b;
            font-size: 11px;
            line-height: 1.7;
          }

          .delete-modal > p strong {
            color: #3d4937;
          }

          .delete-warning {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-top: 18px;
            padding: 11px 12px;
            border: 1px solid #f0dddd;
            border-radius: 11px;
            background: #fff7f7;
            color: #a35a5a;
            font-size: 10px;
            font-weight: 700;
          }

          .delete-actions {
            display: flex;
            justify-content: flex-end;
            gap: 9px;
            margin-top: 22px;
          }

          .delete-cancel-button,
          .delete-confirm-button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 7px;
            min-height: 41px;
            padding: 9px 14px;
            border-radius: 11px;
            font-size: 10px;
            font-weight: 900;
          }

          .delete-cancel-button {
            border: 1px solid #dce2d7;
            background: white;
            color: #687264;
          }

          .delete-confirm-button {
            border: none;
            background: #b34a4a;
            color: white;
            box-shadow:
              0 7px 17px rgba(179,74,74,.17);
          }

          /* ===============================================
             RESPONSIVE
          =============================================== */

          @media (max-width: 1100px) {

            .product-grid {
              grid-template-columns:
                repeat(2,minmax(0,1fr));
            }

            .product-create-form {
              grid-template-columns: 240px minmax(0,1fr);
            }

          }

          @media (max-width: 850px) {

            .products-summary-grid {
              grid-template-columns: 1fr;
            }

            .product-create-form {
              grid-template-columns: 1fr;
            }

            .product-upload-box {
              min-height: 230px;
            }

            .product-upload-box img {
              min-height: 230px;
            }

          }

          @media (max-width: 700px) {

            .products-page-header {
              align-items: flex-start;
              flex-direction: column;
            }

            .product-grid {
              grid-template-columns: 1fr;
            }

            .fields-two-column {
              grid-template-columns: 1fr;
            }

            .product-create-form {
              padding: 20px;
            }

            .product-create-heading,
            .listings-header {
              padding: 20px;
            }

            .product-grid {
              padding: 16px;
            }

          }

          @media (max-width: 500px) {

            .products-page-header h1 {
              font-size: 31px;
            }

            .add-product-header-button {
              width: 100%;
              justify-content: center;
            }

            .product-summary-card {
              padding: 14px;
            }

            .product-create-heading {
              align-items: flex-start;
            }

            .create-heading-icon {
              display: none;
            }

            .create-form-actions {
              flex-direction: column-reverse;
            }

            .cancel-form-button,
            .save-product-button {
              width: 100%;
            }

            .delete-actions {
              flex-direction: column-reverse;
            }

            .delete-cancel-button,
            .delete-confirm-button {
              width: 100%;
            }

          }

        `}</style>

      </div>
    </DashboardLayout>
  );
}

export default FarmerProducts;