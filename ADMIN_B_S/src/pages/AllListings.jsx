import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Download,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  FileText,
  CheckCircle2,
  Ban,
  Clock,
  Eye,
  XCircle,

  Star,
} from "lucide-react";
import { api } from "../utils/api";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";

const AllListings = () => {
  const navigate = useNavigate();
  const [listingsData, setListingsData] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]);
  const [sellers, setSellers] = useState([]);

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [sellerFilter, setSellerFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [subCategoryFilter, setSubCategoryFilter] =
    useState("All Sub Categories");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const rootCategories = categories.filter((cat) => !cat.parent_id);
  const filteredSubCategories =
    categoryFilter === "All Categories"
      ? []
      : categories.filter(
          (cat) => String(cat.parent_id) === String(categoryFilter),
        );

  // Modal Controls
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("add");

  // Form Fields
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    sellerId: "",
    categoryId: "",
    subCategoryId: "",
    price: "",
    salePrice: "",
    sku: "",
    quantity: "1",
    status: "approved",
    brand: "",
    condition: "Good Condition",
    usedFor: "",
    offerBadge: "",
    warranty: "",
    location: "",
    shippingAvailable: false,
    visibility: "public",
    description: "",
    customFields: [],
    image: "",
    thumbnail: "",
    isPublished: true,
  });

  const [imageFile, setImageFile] = useState(null);
  const [thumbnailFiles, setThumbnailFiles] = useState([]);
  const [imagePreview, setImagePreview] = useState("");
  const [thumbnailPreviews, setThumbnailPreviews] = useState([]);

  const [metrics, setMetrics] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    pending: 0,
    rejected: 0,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      // Fetch categories
      const catRes = await api.get("/categories?limit=100");
      if (catRes.success)
        setCategories(catRes.data?.items || catRes.data || []);

      // Fetch registered users for the seller selector.
      const selRes = await api.get("/customers?limit=100");
      if (selRes.success) {
        const sellersItems = selRes.data?.items || selRes.data || [];
        const mappedSellers = sellersItems.map((s) => ({
          id: s.id,
          sellerProfileId: s.seller_profile_id,
          name: s.full_name || s.phone || "Registered User",
          storeName: s.business_name || s.phone || "Registered User",
        }));
        setSellers(mappedSellers);
      }

      await fetchListings();
    } catch (err) {
      console.error(err);
      setError("Failed to load initial listings data");
    } finally {
      setLoading(false);
    }
  };

  const fetchListings = async () => {
    try {
      let statusQuery = "";
      if (statusFilter === "Active") statusQuery = "approved";
      if (statusFilter === "Pending") statusQuery = "pending";
      if (statusFilter === "Rejected") statusQuery = "rejected";
      if (statusFilter === "Inactive") statusQuery = "inactive";

      let catIdQuery = "";
      if (categoryFilter !== "All Categories") {
        catIdQuery = categoryFilter;
      }

      const subCatIdQuery =
        subCategoryFilter !== "All Sub Categories" ? subCategoryFilter : "";

      const res = await api.get(
        `/listings?search=${encodeURIComponent(searchTerm)}&category_id=${catIdQuery}&subcategory_id=${subCatIdQuery}&seller_id=${sellerFilter}&status=${statusQuery}&page=${currentPage}&limit=${itemsPerPage}`,
      );
      if (res.success) {
        const items = res.data?.items || res.data || [];
        const mapped = items.map((item) => {
          return {
            id: item.id,
            name: item.title,
            code: `#LIST${item.id}`,
            sellerId: item.seller?.id,
            sellerName:
              item.seller?.user?.full_name ||
              item.seller?.business_name ||
              "N/A",
            sellerHandle: item.seller?.business_name
              ? `@${item.seller.business_name.toLowerCase().replace(/\s+/g, "")}`
              : `@seller_${item.seller?.id}`,
            categoryId: item.category_id,
            category: item.category_name || "N/A",
            subCategoryId: item.subcategory_id || "",
            subCategory: item.subcategory_name || "",
            price: "₹" + Number(item.price || 0).toLocaleString(),
            rawPrice: item.price,
            brand: item.brand || "",
            condition: item.condition || "Good Condition",
            usedFor: item.used_for || "",
            offerBadge: item.offer_badge || "",
            warranty: item.warranty || "",
            location: item.location || "",
            shippingAvailable:
              item.shipping_available === 1 || item.shipping_available === true,
            salePrice: item.sale_price !== null ? String(item.sale_price) : "",
            sku: item.sku || "",
            visibility: item.visibility || "public",
            status:
              item.listing_status === "approved"
                ? "Active"
                : item.listing_status === "pending"
                  ? "Pending"
                  : item.listing_status === "rejected"
                    ? "Rejected"
                    : "Inactive",
            isPublished: item.listing_status === "approved",
            date: new Date(item.created_at).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }),
            time: new Date(item.created_at).toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            image:
              item.main_image?.url ||
              "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&q=80",
            thumbnail:
              item.thumbnails && item.thumbnails.length > 0
                ? item.thumbnails[0].url
                : item.main_image?.url ||
                  "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=100&q=80",
            description: item.description || "",
            quantity: item.quantity || 1,
            viewsCount: Number(item.views_count || item.viewsCount || item.views || 0),
            isFeatured: item.is_featured === 1 || item.is_featured === true,
          };
        });
        setListingsData(mapped);
        setTotalItems(
          res.data?.pagination?.totalItems ||
            res.pagination?.totalItems ||
            items.length ||
            0,
        );

        // Fetch counts from dashboard summary
        const summaryRes = await api
          .get("/dashboard/summary")
          .catch(() => null);
        if (summaryRes && summaryRes.success) {
          const c = summaryRes.data.counters;
          setMetrics({
            total: c.approvedListings + c.pendingListings + c.rejectedListings,
            active: c.approvedListings,
            inactive: 0,
            pending: c.pendingListings,
            rejected: c.rejectedListings,
          });
        }
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch listings");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    fetchListings();
  }, [searchTerm, categoryFilter, subCategoryFilter, sellerFilter, statusFilter, currentPage]);

  const stats = [
    {
      id: 1,
      title: "Total Listings",
      value: metrics.total,
      icon: <FileText size={22} className="text-[#4f6bff]" />,
      iconBg: "bg-gradient-to-br from-[#dbe5ff] to-[#eef2ff]",
      cardBg: "bg-gradient-to-br from-[#f5f7ff] via-[#eef2ff] to-[#e0e7ff]",
    },
    {
      id: 2,
      title: "Active Listings",
      value: metrics.active,
      icon: <CheckCircle2 size={22} className="text-green-600" />,
      iconBg: "bg-gradient-to-br from-[#ccf5db] to-[#e9fff1]",
      cardBg: "bg-gradient-to-br from-[#f1fff7] via-[#e8fff1] to-[#dff7e8]",
    },
    {
      id: 3,
      title: "Inactive Listings",
      value: metrics.inactive,
      icon: <Ban size={22} className="text-gray-500" />,
      iconBg: "bg-gradient-to-br from-[#e0e0e0] to-[#f5f5f5]",
      cardBg: "bg-gradient-to-br from-[#fcfcfc] via-[#f5f5f5] to-[#ececec]",
    },
    {
      id: 4,
      title: "Pending Approval",
      value: metrics.pending,
      icon: <Clock size={22} className="text-orange-500" />,
      iconBg: "bg-gradient-to-br from-[#ffe3ad] to-[#fff1d1]",
      cardBg: "bg-gradient-to-br from-[#fffaf0] via-[#fff4df] to-[#ffe8bf]",
    },
    {
      id: 5,
      title: "Rejected Listings",
      value: metrics.rejected,
      icon: <XCircle size={22} className="text-red-600" />,
      iconBg: "bg-gradient-to-br from-[#ffd6d6] to-[#ffeded]",
      cardBg: "bg-gradient-to-br from-[#fff5f5] via-[#ffeded] to-[#ffe4e4]",
    },
  ];

  // Pagination calculations
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + listingsData.length;
  const paginatedListings = listingsData;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, subCategoryFilter, sellerFilter, statusFilter]);

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 3) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 2) {
        pages.push(1, 2, "...", totalPages);
      } else if (currentPage >= totalPages - 1) {
        pages.push(1, "...", totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage, "...", totalPages);
      }
    }
    return pages;
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Active":
        return " text-green-500 bg-green-100 rounded-sm px-2 py-0.5";
      case "Pending":
        return " text-orange-500 bg-orange-100 rounded-sm px-2 py-0.5";
      case "Inactive":
        return " text-gray-500 bg-gray-200 rounded-sm px-2 py-0.5";
      case "Rejected":
        return " text-red-500 bg-red-100 rounded-sm px-2 py-0.5";
      default:
        return " text-gray-600 bg-gray-50 rounded-sm px-2 py-0.5";
    }
  };

  const openModal = (mode, product = null) => {
    setFormMode(mode);
    setImageFile(null);
    setThumbnailFiles([]);
    if (product) {
      setFormData({
        id: product.id,
        name: product.name,
        sellerId: product.sellerId || "",
        categoryId: product.categoryId || "",
        subCategoryId: product.subCategoryId || "",
        price: String(product.rawPrice || ""),
        salePrice: product.salePrice || "",
        sku: product.sku || "",
        quantity: String(product.quantity || "1"),
        status:
          product.status === "Active"
            ? "approved"
            : product.status === "Pending"
              ? "pending"
              : product.status === "Rejected"
                ? "rejected"
                : "inactive",
        brand: product.brand || "",
        condition: product.condition || "Good Condition",
        usedFor: product.usedFor || "",
        offerBadge: product.offerBadge || "",
        warranty: product.warranty || "",
        location: product.location || "",
        shippingAvailable: product.shippingAvailable || false,
        visibility: product.visibility || "public",
        description: product.description || "",
        customFields: product.customFields || [],
        image: product.image || "",
        thumbnail: product.thumbnail || "",
        isPublished: product.isPublished,
      });
      setImagePreview(product.image || "");
      setThumbnailPreviews(
        (product.thumbnails && product.thumbnails.length > 0
          ? product.thumbnails.map((thumb) => thumb.url)
          : product.thumbnail
            ? [product.thumbnail]
            : []) || [],
      );
    } else {
      const rootCats = categories.filter((c) => !c.parent_id);
      setFormData({
        id: null,
        name: "",
        sellerId: sellers[0]?.id || "",
        categoryId: rootCats[0]?.id || "",
        subCategoryId: "",
        price: "",
        salePrice: "",
        sku: "",
        quantity: "1",
        status: "approved",
        brand: "",
        condition: "Good Condition",
        usedFor: "",
        offerBadge: "",
        warranty: "",
        location: "",
        shippingAvailable: false,
        visibility: "public",
        description: "",
        customFields: [],
        image: "",
        thumbnail: "",
        isPublished: true,
      });
      setImagePreview("");
      setThumbnailPreviews([]);
    }
    setIsFormOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: type === "checkbox" ? checked : value };
      if (name === "categoryId") {
        next.subCategoryId = "";
      }
      return next;
    });
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleThumbnailFilesChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);

    if (!selectedFiles.length) return;

    setThumbnailFiles((prev) => [...prev, ...selectedFiles].slice(0, 4));
    setThumbnailPreviews((prev) =>
      [
        ...prev,
        ...selectedFiles.map((file) => URL.createObjectURL(file)),
      ].slice(0, 4),
    );
    e.target.value = "";
  };

  const handleRemoveThumbnail = (indexToRemove) => {
    setThumbnailFiles((prev) =>
      prev.filter((_, index) => index !== indexToRemove),
    );
    setThumbnailPreviews((prev) =>
      prev.filter((_, index) => index !== indexToRemove),
    );
  };

  const addCustomField = () => {
    setFormData((prev) => ({
      ...prev,
      customFields: [...(prev.customFields || []), { label: "", value: "" }],
    }));
  };

  const handleCustomFieldChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      customFields: prev.customFields.map((item, idx) =>
        idx === index ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const removeCustomField = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      customFields: prev.customFields.filter(
        (_, index) => index !== indexToRemove,
      ),
    }));
  };

  const handlePublishStatusChange = (statusValue) => {
    if (formMode === "view") return;
    setFormData((prev) => ({
      ...prev,
      isPublished: statusValue,
      status: statusValue ? "approved" : "inactive",
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (formMode === "view") {
      setIsFormOpen(false);
      return;
    }

    try {
      const dataToSend = new FormData();
      dataToSend.append("title", formData.name);
      dataToSend.append("seller_id", parseInt(formData.sellerId, 10));
      dataToSend.append("category_id", parseInt(formData.categoryId, 10));
      if (formData.subCategoryId) {
        dataToSend.append(
          "subcategory_id",
          parseInt(formData.subCategoryId, 10),
        );
      }
      dataToSend.append("price", parseFloat(formData.price));
      if (formData.salePrice) {
        dataToSend.append("sale_price", parseFloat(formData.salePrice));
      }
      if (formData.sku) {
        dataToSend.append("sku", formData.sku);
      }
      dataToSend.append("quantity", parseInt(formData.quantity || 1, 10));
      dataToSend.append("listing_status", formData.status);
      dataToSend.append("brand", formData.brand || "");
      dataToSend.append("condition", formData.condition || "Good Condition");
      dataToSend.append("used_for", formData.usedFor || "");
      dataToSend.append("offer_badge", formData.offerBadge || "");
      dataToSend.append("warranty", formData.warranty || "");
      dataToSend.append("location", formData.location || "");
      dataToSend.append(
        "shipping_available",
        formData.shippingAvailable ? 1 : 0,
      );
      dataToSend.append("visibility", formData.visibility || "public");
      dataToSend.append("description", formData.description || "");
      dataToSend.append(
        "custom_fields",
        JSON.stringify(
          (formData.customFields || []).filter(
            (item) => item.label.trim() || item.value.trim(),
          ),
        ),
      );

      // Append image: either selected file or the original string URL
      if (imageFile) {
        dataToSend.append("image", imageFile);
      } else if (formData.image) {
        dataToSend.append("image", formData.image);
      }

      // Append up to 4 thumbnails
      if (thumbnailFiles.length > 0) {
        thumbnailFiles.slice(0, 4).forEach((file) => {
          dataToSend.append("thumbnail", file);
        });
      } else if (formData.thumbnail) {
        dataToSend.append("thumbnail", formData.thumbnail);
      }

      if (formMode === "add") {
        const res = await api.post("/listings", dataToSend);
        if (!res.success)
          throw new Error(res.message || "Failed to create listing");
      } else if (formMode === "edit") {
        const res = await api.patch(`/listings/${formData.id}`, dataToSend);
        if (!res.success)
          throw new Error(res.message || "Failed to update listing");
      }
      setIsFormOpen(false);
      fetchListings();
    } catch (err) {
      alert(err.message || "Operation failed");
    }
  };

  const toggleFeature = async (id, currentFeatured) => {
    try {
      const res = await api.patch(`/listings/${id}/feature`, {
        is_featured: !currentFeatured,
      });
      if (res.success) {
        setListingsData((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, isFeatured: !currentFeatured } : item,
          ),
        );
      }
    } catch (err) {
      alert(err.message || "Failed to update feature status");
    }
  };

  const deleteListing = async (id) => {
    try {
      if (window.confirm("Are you sure you want to delete this listing?")) {
        const res = await api.delete(`/listings/${id}`);
        if (res.success) {
          setListingsData((prev) => prev.filter((item) => item.id !== id));
          setTotalItems((prev) => Math.max(0, prev - 1));
        }
      }
    } catch (err) {
      alert(err.message || "Failed to delete listing");
    }
  };

  if (isFormOpen) {
    return (
      <div className="space-y-6 w-ful mx-auto animate-[fadeIn_.2s_ease] text-left p-2">
        {/* Header with Back button */}
        <div className="flex items-center gap-4 bg-white p-4 border border-gray-200 rounded-sm shadow-sm">
          <button
            type="button"
            onClick={() => setIsFormOpen(false)}
            className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 transition"
          >
            <X size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 capitalize">
              {formMode === "add" && "Add New Product"}
              {formMode === "view" && "Product Details"}
              {formMode === "edit" && "Edit Product"}
            </h1>
            <p className="text-xs text-gray-500">
              {formMode === "view"
                ? "Inspect all product specifications and marketplace details below."
                : "Enter details for this product listing."}
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
          <form onSubmit={handleFormSubmit} className="p-6 space-y-6">
            {/* Product Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">
                Product Name
              </label>
              <input
                type="text"
                name="name"
                required
                disabled={formMode === "view"}
                placeholder="e.g. iPhone 15 Pro Max"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 disabled:bg-gray-50 text-sm text-gray-800"
              />
            </div>

            {/* Seller & SKU */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">
                  Seller
                </label>
                {formMode === "view" ? (
                  <input
                    type="text"
                    disabled
                    value={
                      sellers.find(
                        (s) => String(s.id) === String(formData.sellerId),
                      )?.name || "N/A"
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-sm text-gray-800"
                  />
                ) : (
                  <select
                    name="sellerId"
                    required
                    value={formData.sellerId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-sm text-gray-800"
                  >
                    <option value="">Select a seller</option>
                    {sellers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">
                  SKU
                </label>
                <input
                  type="text"
                  name="sku"
                  disabled={formMode === "view"}
                  placeholder="e.g. PRD-12345"
                  value={formData.sku}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 disabled:bg-gray-50 text-sm text-gray-800"
                />
              </div>
            </div>

            {/* Category & Subcategory */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">
                  Category
                </label>
                {formMode === "view" ? (
                  <input
                    type="text"
                    disabled
                    value={
                      categories.find(
                        (c) => String(c.id) === String(formData.categoryId),
                      )?.name || "N/A"
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-sm text-gray-800"
                  />
                ) : (
                  <select
                    name="categoryId"
                    required
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-sm text-gray-800"
                  >
                    <option value="">Select a category</option>
                    {categories
                      .filter((c) => !c.parent_id)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">
                  Subcategory
                </label>
                {formMode === "view" ? (
                  <input
                    type="text"
                    disabled
                    value={
                      categories.find(
                        (c) => String(c.id) === String(formData.subCategoryId),
                      )?.name || "N/A"
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-sm text-gray-800"
                  />
                ) : (
                  <select
                    name="subCategoryId"
                    value={formData.subCategoryId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-sm text-gray-800"
                  >
                    <option value="">Select a subcategory</option>
                    {categories
                      .filter(
                        (c) =>
                          String(c.parent_id) === String(formData.categoryId),
                      )
                      .map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.name}
                        </option>
                      ))}
                  </select>
                )}
              </div>
            </div>

            {/* Pricing & Stock */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">
                  Price (₹)
                </label>
                <input
                  type="number"
                  name="price"
                  step="0.01"
                  required
                  disabled={formMode === "view"}
                  placeholder="999.00"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 disabled:bg-gray-50 text-sm text-gray-800"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">
                  Sale Price (₹)
                </label>
                <input
                  type="number"
                  name="salePrice"
                  step="0.01"
                  disabled={formMode === "view"}
                  placeholder="e.g. 899.00"
                  value={formData.salePrice}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 disabled:bg-gray-50 text-sm text-gray-800"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">
                  Quantity
                </label>
                <input
                  type="number"
                  name="quantity"
                  required
                  disabled={formMode === "view"}
                  placeholder="1"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 disabled:bg-gray-50 text-sm text-gray-800"
                />
              </div>
            </div>

            {/* Status & Visibility */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">
                  Status
                </label>
                <select
                  name="status"
                  disabled={formMode === "view"}
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 bg-white rounded focus:outline-none focus:border-blue-500 disabled:bg-gray-50 text-sm text-gray-700 font-medium"
                >
                  <option value="approved">Active</option>
                  <option value="pending">Pending</option>
                  <option value="inactive">Inactive</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">
                  Visibility
                </label>
                <select
                  name="visibility"
                  disabled={formMode === "view"}
                  value={formData.visibility}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 bg-white rounded focus:outline-none focus:border-blue-500 disabled:bg-gray-50 text-sm text-gray-700 font-medium"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>
            </div>

            {/* Product Specifications (Brand, Condition, Used For) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">
                  Brand
                </label>
                <input
                  type="text"
                  name="brand"
                  disabled={formMode === "view"}
                  placeholder="e.g. Samsung"
                  value={formData.brand}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 disabled:bg-gray-50 text-sm text-gray-800"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">
                  Condition
                </label>
                <select
                  name="condition"
                  disabled={formMode === "view"}
                  value={formData.condition}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 bg-white rounded focus:outline-none focus:border-blue-500 disabled:bg-gray-50 text-sm text-gray-700 font-medium"
                >
                  <option value="Good Condition">Good Condition</option>
                  <option value="Like New">Like New</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Needs Repair">Needs Repair</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">
                  Used For
                </label>
                <input
                  type="text"
                  name="usedFor"
                  disabled={formMode === "view"}
                  placeholder="e.g. 6 months"
                  value={formData.usedFor}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 disabled:bg-gray-50 text-sm text-gray-800"
                />
              </div>
            </div>

            {/* Extra Info (Offer Badge, Warranty, Location, Shipping) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">
                  Offer Badge
                </label>
                <input
                  type="text"
                  name="offerBadge"
                  disabled={formMode === "view"}
                  placeholder="e.g. 10% OFF"
                  value={formData.offerBadge}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 disabled:bg-gray-50 text-sm text-gray-800"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">
                  Warranty
                </label>
                <input
                  type="text"
                  name="warranty"
                  disabled={formMode === "view"}
                  placeholder="e.g. 1 Year"
                  value={formData.warranty}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 disabled:bg-gray-50 text-sm text-gray-800"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  disabled={formMode === "view"}
                  placeholder="e.g. Delhi"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 disabled:bg-gray-50 text-sm text-gray-800"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">
                  Shipping
                </label>
                <div className="flex items-center h-full pt-1.5">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="shippingAvailable"
                      disabled={formMode === "view"}
                      checked={formData.shippingAvailable}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer disabled:opacity-50"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Available
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                disabled={formMode === "view"}
                placeholder="Enter product details..."
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 disabled:bg-gray-50 text-sm text-gray-800 resize-none"
              />
            </div>

            {/* Custom Fields */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-4">
                <label className="text-sm font-semibold text-gray-700">
                  Custom Fields
                </label>
                {formMode !== "view" && (
                  <button
                    type="button"
                    onClick={addCustomField}
                    className="inline-flex items-center justify-center rounded border border-blue-300 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                  >
                    + Add Field
                  </button>
                )}
              </div>
              {(formData.customFields || []).length === 0 && (
                <p className="text-sm text-gray-500">
                  Add one or more custom label/value fields for this listing.
                </p>
              )}
              {(formData.customFields || []).map((field, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 items-end"
                >
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm text-gray-600">Label</label>
                    <input
                      type="text"
                      disabled={formMode === "view"}
                      placeholder="Field label"
                      value={field.label}
                      onChange={(e) =>
                        handleCustomFieldChange(index, "label", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 disabled:bg-gray-50 text-sm text-gray-800"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm text-gray-600">Value</label>
                    <input
                      type="text"
                      disabled={formMode === "view"}
                      placeholder="Field value"
                      value={field.value}
                      onChange={(e) =>
                        handleCustomFieldChange(index, "value", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 disabled:bg-gray-50 text-sm text-gray-800"
                    />
                  </div>
                  {formMode !== "view" && (
                    <button
                      type="button"
                      onClick={() => removeCustomField(index)}
                      className="inline-flex h-10 items-center justify-center rounded bg-red-50 px-3 text-sm font-semibold text-red-600 hover:bg-red-100"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Media Block */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">
                  Main Image
                </label>
                {formMode === "view" ? (
                  <div className="w-full h-40 border border-gray-200 rounded overflow-hidden bg-gray-50 flex items-center justify-center">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Main Image"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-sm text-gray-400">No Image</span>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {imagePreview && (
                      <div className="w-full h-40 border border-gray-200 rounded overflow-hidden">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">
                  Gallery Images (max 4)
                </label>
                {formMode === "view" ? (
                  <div className="grid grid-cols-2 gap-2">
                    {thumbnailPreviews.length > 0 ? (
                      thumbnailPreviews.map((src, idx) => (
                        <div
                          key={idx}
                          className="w-full h-24 border border-gray-200 rounded overflow-hidden bg-gray-50"
                        >
                          <img
                            src={src}
                            alt={`Thumbnail ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 w-full h-24 border border-gray-200 rounded overflow-hidden bg-gray-50 flex items-center justify-center text-sm text-gray-400">
                        No images available
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleThumbnailFilesChange}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <p className="text-[11px] text-gray-500">
                      Select up to 4 images for the product gallery.
                    </p>
                    {thumbnailPreviews.length > 0 && (
                      <div className="grid grid-cols-2 gap-2">
                        {thumbnailPreviews.map((src, idx) => (
                          <div
                            key={idx}
                            className="relative w-full h-24 border border-gray-200 rounded overflow-hidden"
                          >
                            <img
                              src={src}
                              alt={`Preview ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveThumbnail(idx)}
                              className="absolute top-1 right-1 h-6 w-6 rounded-full bg-white/90 text-gray-700 border border-gray-200 flex items-center justify-center hover:bg-red-100 font-bold"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Publish Settings */}
            <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
              <label className="text-sm font-semibold text-gray-700">
                Publish Settings
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() =>
                    formMode !== "view" && handlePublishStatusChange(true)
                  }
                  className={`flex-1 flex items-center justify-between px-4 py-3 border rounded-lg transition-all ${
                    formData.isPublished
                      ? "border-green-500 bg-green-50/50 ring-1 ring-green-500"
                      : "border-gray-200 hover:bg-gray-50"
                  } ${formMode === "view" ? "pointer-events-none opacity-70" : ""}`}
                >
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-semibold text-gray-800">
                      Publish
                    </span>
                    <span className="text-[11px] text-gray-400 mt-0.5">
                      Product list live globally on market.
                    </span>
                  </div>
                  <input
                    type="radio"
                    name="publishStatus"
                    checked={formData.isPublished === true}
                    readOnly
                    className="w-4 h-4 text-green-600 border-gray-300 accent-green-600 focus:ring-green-500 cursor-pointer"
                  />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    formMode !== "view" && handlePublishStatusChange(false)
                  }
                  className={`flex-1 flex items-center justify-between px-4 py-3 border rounded-lg transition-all ${
                    !formData.isPublished
                      ? "border-blue-600 bg-blue-50/30 ring-1 ring-blue-600"
                      : "border-gray-200 hover:bg-gray-50"
                  } ${formMode === "view" ? "pointer-events-none opacity-70" : ""}`}
                >
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-semibold text-gray-800">
                      Unpublish
                    </span>
                    <span className="text-[11px] text-gray-400 mt-0.5">
                      Keep as internal draft setup pipeline.
                    </span>
                  </div>
                  <input
                    type="radio"
                    name="publishStatus"
                    checked={formData.isPublished === false}
                    readOnly
                    className="w-4 h-4 text-blue-600 border-gray-300 accent-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </button>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100 mt-4">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-5 py-2.5 border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors rounded-xl"
              >
                {formMode === "view" ? "Close" : "Cancel"}
              </button>
              {formMode !== "view" && (
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors shadow-sm rounded-xl"
                >
                  Save Product
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {stats.map((item) => (
          <div
            key={item.id}
            className={`${item.cardBg} rounded-xl border border-white/60 p-4 shadow-sm hover:shadow-md transition-shadow`}
          >
            <div className="flex flex-col">
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                {item.title}
              </h3>
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {item.value}
                  </h1>
                </div>
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.iconBg}`}
                >
                  {item.icon}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-lg">
        {/* Top Filter Bar */}
        <div className="p-4 border-b border-gray-100 space-y-4 md:space-y-0 text-gray-700">
          <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
            <div className="flex flex-wrap items-end gap-3 md:gap-4 flex-1">
              {/* Search and Dropdowns */}
              <div className="flex flex-col gap-1.5 w-full sm:w-auto">
                <label className="text-[13px] text-gray-500 font-medium">
                  Search
                </label>
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Search listings..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-[220px] pl-9 pr-4 py-2 text-sm border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 w-full sm:w-auto">
                <label className="text-[13px] text-gray-500 font-medium">
                  Category
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value);
                    setSubCategoryFilter("All Sub Categories");
                  }}
                  className="w-full sm:min-w-[140px] px-3 py-2 text-sm text-gray-700 border border-gray-300 bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="All Categories">All Categories</option>
                  {rootCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5 w-full sm:w-auto">
                <label className="text-[13px] text-gray-500 font-medium">
                  Sub Category
                </label>
                <select
                  value={subCategoryFilter}
                  onChange={(e) => setSubCategoryFilter(e.target.value)}
                  disabled={categoryFilter === "All Categories"}
                  className="w-full sm:min-w-[160px] px-3 py-2 text-sm text-gray-700 border border-gray-300 bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="All Sub Categories">All Sub Categories</option>
                  {filteredSubCategories.map((subCat) => (
                    <option key={subCat.id} value={subCat.id}>
                      {subCat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5 w-full sm:w-auto">
                <label className="text-[13px] text-gray-500 font-medium">
                  Seller
                </label>
                <select
                  value={sellerFilter}
                  onChange={(e) => setSellerFilter(e.target.value)}
                  className="w-full sm:min-w-[160px] px-3 py-2 text-sm text-gray-700 border border-gray-300 bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">All Sellers</option>
                  {sellers.map((seller) => (
                    <option key={seller.id} value={seller.id}>
                      {seller.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5 w-full sm:w-auto">
                <label className="text-[13px] text-gray-500 font-medium">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full sm:min-w-[130px] px-3 py-2 text-sm text-gray-700 border border-gray-300 bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="All Status">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full xl:w-auto mt-4 xl:mt-0">
              <button
                onClick={() => openModal("add")}
                className="flex items-center justify-center gap-2 flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-all rounded shadow-sm"
              >
                <Plus size={16} /> Add Product
              </button>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <table className="w-full whitespace-nowrap text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="py-3 px-5 text-sm font-semibold text-gray-700">
                  Listing (Thumbnail)
                </th>
                <th className="py-3 px-5 text-sm font-semibold text-gray-700">
                  Seller
                </th>
                <th className="py-3 px-5 text-sm font-semibold text-gray-700">
                  Category
                </th>
                <th className="py-3 px-5 text-sm font-semibold text-gray-700">
                  Price
                </th>
                <th className="py-3 px-5 text-sm font-semibold text-gray-700">
                  Views
                </th>
                <th className="py-3 px-5 text-sm font-semibold text-gray-700">
                  Status
                </th>
                <th className="py-3 px-5 text-sm font-semibold text-gray-700">
                  Listed On
                </th>
                <th className="py-3 px-5 text-sm font-semibold text-gray-700 text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedListings.length > 0 ? (
                paginatedListings.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.thumbnail || item.image}
                          alt={item.name}
                          className="w-10 h-10 rounded-md flex-shrink-0 object-cover border border-gray-200 shadow-xs"
                        />
                        <div className="flex flex-col min-w-[180px]">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[14px] font-medium text-gray-800" title={item.name}>
                              {item.name?.split(' ').length > 5 ? item.name.split(' ').slice(0, 5).join(' ') + '...' : item.name}
                            </span>
                            <button
                              onClick={() =>
                                toggleFeature(item.id, item.isFeatured)
                              }
                              className="focus:outline-none"
                              title={
                                item.isFeatured
                                  ? "Unfeature Listing"
                                  : "Feature Listing"
                              }
                            >
                              <Star
                                size={14}
                                className={
                                  item.isFeatured
                                    ? "text-yellow-500 fill-yellow-500"
                                    : "text-gray-300 hover:text-yellow-500"
                                }
                              />
                            </button>
                            {item.isPublished ? (
                              <span
                                className="w-1.5 h-1.5 rounded-full bg-green-500"
                                title="Published"
                              />
                            ) : (
                              <span
                                className="w-1.5 h-1.5 rounded-full bg-gray-300"
                                title="Unpublished/Draft"
                              />
                            )}
                          </div>
                          <span className="text-[12px] text-gray-500 mt-0.5">
                            {item.code}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-5">
                      <div className="flex flex-col">
                        <span className="text-[14px] font-medium text-gray-800">
                          {item.sellerName}
                        </span>
                        <span className="text-[12px] text-gray-500 mt-0.5">
                          {item.sellerHandle}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-5">
                      <div className="flex flex-col">
                        <span className="text-[14px] font-medium text-gray-800">
                          {item.category}
                        </span>
                        <span className="text-[12px] text-gray-500 mt-0.5">
                          {item.subCategory}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-5 text-[14px] font-medium text-gray-800">
                      {item.price}
                    </td>
                    <td className="py-3 px-5 text-[14px] font-medium text-gray-800">
                      {item.viewsCount.toLocaleString()}
                    </td>
                    <td className="py-3 px-5">
                      <span className={getStatusStyle(item.status)}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-5">
                      <div className="flex flex-col">
                        <span className="text-[14px] text-gray-800">{item.date}</span>
                        <span className="text-[12px] text-gray-500">{item.time}</span>
                      </div>
                    </td>
                    <td className="py-3 px-5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => navigate(`/approvals/listing/${item.id}`)}
                          className="flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100 px-3 py-1.5 rounded transition-all"
                        >
                          <Eye size={13} /> View
                        </button>
                        <button
                          onClick={() => openModal("edit", item)}
                          className="flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 px-3 py-1.5 rounded transition-all"
                        >
                          <FileText size={13} /> Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="8"
                    className="py-8 text-center text-gray-500 text-sm"
                  >
                    No listings found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-gray-100">
          <span className="text-[13px] text-gray-500 text-center sm:text-left">
            Showing {listingsData.length > 0 ? startIndex + 1 : 0} to{" "}
            {Math.min(endIndex, totalItems)} of {totalItems} listings
          </span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`w-6 h-6 flex items-center justify-center border border-gray-300 ${currentPage === 1 ? "text-gray-300 cursor-not-allowed" : "text-gray-600 hover:bg-gray-50 cursor-pointer"}`}
              >
                <ChevronLeft size={16} />
              </button>
              {getPageNumbers().map((page, index) =>
                page === "..." ? (
                  <span
                    key={`dots-${index}`}
                    className="w-6 h-6 flex items-center justify-center text-gray-400"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-6 h-6 flex items-center justify-center text-xs font-medium ${currentPage === page ? "border border-transparent bg-[#4f6bff] text-white" : "border border-gray-300 text-gray-600 hover:bg-gray-50 cursor-pointer"}`}
                  >
                    {page}
                  </button>
                ),
              )}
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages || totalPages === 0}
                className={`w-6 h-6 flex items-center justify-center border border-gray-300 ${currentPage === totalPages || totalPages === 0 ? "text-gray-300 cursor-not-allowed" : "text-gray-600 hover:bg-gray-50 cursor-pointer"}`}
              >
                <ChevronRight size={16} />
              </button>
            </div>
            <span className="text-[13px] text-gray-500 font-medium whitespace-nowrap">
              Page {currentPage} of {totalPages || 1}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllListings;
