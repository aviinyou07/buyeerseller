import React, { useEffect, useState } from "react";
import toast from 'react-hot-toast';
import { useConfirm } from '../contexts/ConfirmContext';
import {
  Users,
  UserCheck,
  UserPlus,
  UserMinus,
  Search,
  CheckCircle2,
  Ban,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  Plus,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Calendar,
  Shield,
  ShoppingBag,
  Store,
  Clock
} from "lucide-react";
import { api } from "../utils/api";
import {createPortal} from "react-dom";

const Customers = () => {
  const confirm = useConfirm();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [dateFilter, setDateFilter] = useState("All Time");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customersData, setCustomersData] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [totalCustomersCount, setTotalCustomersCount] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [customersStats, setCustomersStats] = useState({
    total: 0,
    active: 0,
    blocked: 0,
    newThisMonth: 0,
  });

  // Body overflow locking removed as full-page layouts do not require scrolling capture

  // Load customers from backend
  const loadCustomers = async () => {
    try {
      setLoadingCustomers(true);
      const params = new URLSearchParams();
      params.append("limit", itemsPerPage);
      params.append("page", currentPage);
      if (searchTerm) params.append("search", searchTerm);
      if (statusFilter && statusFilter !== "All Status") {
        const map = {
          Active: "active",
          Blocked: "blocked",
          Inactive: "suspended",
        };
        const s = map[statusFilter] || statusFilter.toLowerCase();
        params.append("status", s);
      }

      const res = await api.get(`/customers?${params.toString()}`);
      if (res && res.success && res.data) {
        const items = res.data.items || [];
        const mapped = items.map((c, idx) => {
          const name = c.full_name || "Unknown";
          const initials = name
            .split(" ")
            .map((n) => n[0] || "")
            .slice(0, 2)
            .join("")
            .toUpperCase();
          const colorIdx = idx % 6;
          const bgList = [
            "bg-blue-100",
            "bg-green-100",
            "bg-purple-100",
            "bg-orange-100",
            "bg-red-100",
            "bg-indigo-100",
          ];
          const textList = [
            "text-blue-600",
            "text-green-600",
            "text-purple-600",
            "text-orange-600",
            "text-red-600",
            "text-indigo-600",
          ];
          const joinedDate = c.created_at
            ? new Date(c.created_at).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "";
          const totalOrders =
            (c.buyer_details && c.buyer_details.total_orders_placed) ||
            (c.seller_details && c.seller_details.total_orders) ||
            0;
          const totalSpent =
            (c.buyer_details && c.buyer_details.total_spent) ||
            (c.seller_details && c.seller_details.total_revenue) ||
            0;
          const statusMap = {
            active: "Active",
            blocked: "Blocked",
            suspended: "Inactive",
          };

          return {
            id: c.id,
            uuid: c.uuid,
            name,
            handle:
              c.username || `@${name.split(" ").join("").toLowerCase()}`,
            initials,
            phone: c.phone || "",
            email: c.email || "",
            joinedDate,
            totalOrders,
            totalSpent:
              typeof totalSpent === "number"
                ? `$${Number(totalSpent).toFixed(2)}`
                : totalSpent,
            status:
              statusMap[c.account_status] || c.account_status || "Active",
            avatarBg: bgList[colorIdx],
            avatarText: textList[colorIdx],
            raw: c,
          };
        });

        setCustomersData(mapped);
        setTotalCustomersCount(
          res.data.pagination?.totalItems || mapped.length,
        );

        // Try fetching server-side summary for accurate 'New This Month'
        try {
          const summaryRes = await api
            .get("/dashboard/summary")
            .catch(() => null);
          if (
            summaryRes &&
            summaryRes.success &&
            summaryRes.data &&
            summaryRes.data.counters
          ) {
            setCustomersStats({
              total:
                summaryRes.data.counters.totalUsers ||
                res.data.pagination?.totalItems ||
                mapped.length,
              active:
                summaryRes.data.counters.activeUsers ||
                mapped.filter((m) => m.account_status === "active").length,
              blocked:
                summaryRes.data.counters.blockedUsers ||
                mapped.filter((m) => m.account_status === "blocked").length,
              newThisMonth: summaryRes.data.counters.newThisMonth || 0,
            });
          } else {
            // Fallback compute from fetched page
            const now = new Date();
            const nm = mapped.filter((m) => {
              if (!m.raw || !m.raw.created_at) return false;
              const d = new Date(m.raw.created_at);
              return (
                d.getMonth() === now.getMonth() &&
                d.getFullYear() === now.getFullYear()
              );
            }).length;
            setCustomersStats({
              total: res.data.pagination?.totalItems || mapped.length,
              active: mapped.filter((c) => c.account_status === "active")
                .length,
              blocked: mapped.filter((c) => c.account_status === "blocked")
                .length,
              newThisMonth: nm,
            });
          }
        } catch (e) {
          // ignore
        }
      }
    } catch (err) {
      console.error("Failed to load customers", err);
    } finally {
      setLoadingCustomers(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [searchTerm, statusFilter, currentPage, refreshKey]);

  // Customer form modal states and handlers (Add / Edit)
  const [isCustomerFormOpen, setIsCustomerFormOpen] = useState(false);
  const [customerFormMode, setCustomerFormMode] = useState("add");
  const [customerFormData, setCustomerFormData] = useState({
    id: null,
    name: "",
    handle: "",
    phone: "",
    email: "",
    password: "",
    type: "Buyer",
    joinedDate: "",
    image:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=600&q=80",
    thumbnail:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80",
    isPublished: true,
    productName: "",
    productCategory: "",
    listingsubCategory: "",
    productPrice: "",
    listingstatus: "Active",
    productImage: "",
    productThumbnail: "",
    productIsPublished: true,
  });

  const openCustomerForm = (mode, customer = null) => {
    setCustomerFormMode(mode);
    if (customer) {
      setCustomerFormData({
        id: customer.id,
        name: customer.name || "",
        handle: customer.handle || "",
        phone: customer.phone || "",
        email: customer.email || "",
        password: "",
        type: customer.type || "Buyer",
        joinedDate: customer.joinedDate || "",
        image:
          customer.image ||
          customer.thumbnail ||
          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=600&q=80",
        thumbnail:
          customer.thumbnail ||
          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80",
        isPublished: customer.isPublished ?? true,
        productName: "",
        productCategory: "",
        listingsubCategory: "",
        productPrice: "",
        listingstatus: "Active",
        productImage: "",
        productThumbnail: "",
        productIsPublished: true,
      });
    } else {
      setCustomerFormData({
        id: null,
        name: "",
        handle: "",
        phone: "",
        email: "",
        password: "",
        type: "Buyer",
        joinedDate: "",
        image:
          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=600&q=80",
        thumbnail:
          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80",
        isPublished: true,
        productName: "",
        productCategory: "",
        listingsubCategory: "",
        productPrice: "",
        listingstatus: "Active",
        productImage: "",
        productThumbnail: "",
        productIsPublished: true,
      });
    }
    setIsCustomerFormOpen(true);
  };

  const handleCustomerInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCustomerPublishStatusChange = (value) => {
    setCustomerFormData((prev) => ({ ...prev, isPublished: value }));
  };

  const handleCustomerFormSubmit = (e) => {
    e.preventDefault();
    const today = new Date();
    const formattedDate = today.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    if (customerFormMode === "add") {
      (async () => {
        try {
          const payload = {
            full_name: customerFormData.name,
            phone: customerFormData.phone,
            password: customerFormData.password || "TempPass123!",
            role: customerFormData.type === "Seller" ? "seller" : "user",
          };

          const res = await api.post("/customers", payload);
          if (res && res.success && res.data) {
            // Reload customers from server so display is always consistent
            setRefreshKey((prev) => prev + 1);
            toast.success("Customer created successfully");
          }
        } catch (err) {
          console.error("Failed to create customer", err);
          toast.error(err.message || "Failed to create customer");
        }
      })();
    } else if (customerFormMode === "edit") {
      setCustomersData((prev) =>
        prev.map((c) =>
          c.id === customerFormData.id
            ? {
                ...c,
                name: customerFormData.name,
                handle: customerFormData.handle.startsWith("@")
                  ? customerFormData.handle
                  : `@${customerFormData.handle}`,
                phone: customerFormData.phone,
                email: customerFormData.email,
                // image: customerFormData.image,
                // thumbnail: customerFormData.thumbnail,
                // isPublished: customerFormData.isPublished,
                type: customerFormData.type,
              }
            : c,
        ),
      );
    }

    setIsCustomerFormOpen(false);
  };

  const closeCustomerForm = () => setIsCustomerFormOpen(false);

  const stats = [
    {
      id: 1,
      title: "Total Customers",
      value:
        customersStats.total || totalCustomersCount || customersData.length,
      icon: <Users size={22} className="text-[#4f6bff]" />,
      cardBg: "bg-gradient-to-br from-[#f5f7ff] via-[#eef2ff] to-[#e0e7ff]",
      iconBg: "bg-gradient-to-br from-[#dbe5ff] to-[#eef2ff]",
    },
    {
      id: 2,
      title: "Active Customers",
      value:
        customersStats.active ||
        customersData.filter((c) => c.status === "Active").length,
      icon: <UserCheck size={22} className="text-green-600" />,
      cardBg: "bg-gradient-to-br from-[#f1fff7] via-[#e8fff1] to-[#dff7e8]",
      iconBg: "bg-gradient-to-br from-[#ccf5db] to-[#e9fff1]",
    },
    {
      id: 3,
      title: "New This Month",
      value: customersStats.newThisMonth || 0,
      icon: <UserPlus size={22} className="text-blue-500" />,
      cardBg: "bg-gradient-to-br from-[#f5fafe] via-[#f1f8ff] to-[#e6f3ff]",
      iconBg: "bg-gradient-to-br from-[#d8edff] to-[#f1f8ff]",
    },
    {
      id: 4,
      title: "Inactive/Blocked",
      value:
        customersStats.blocked ||
        customersData.filter(
          (c) => c.status === "Inactive" || c.status === "Blocked",
        ).length,
      icon: <UserMinus size={22} className="text-red-600" />,
      cardBg: "bg-gradient-to-br from-[#fff5f5] via-[#ffeded] to-[#ffe4e4]",
      iconBg: "bg-gradient-to-br from-[#ffd6d6] to-[#ffeded]",
    },
  ];

  const filteredCustomers = customersData.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm);
    const matchesStatus =
      statusFilter === "All Status" || customer.status === statusFilter;
    const matchesDate =
      dateFilter === "All Time" || customer.joinedDate === dateFilter;
    return matchesSearch && matchesStatus && matchesDate;
  });

  const totalPages = Math.max(
    1,
    Math.ceil((totalCustomersCount || filteredCustomers.length) / itemsPerPage),
  );
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(
    startIndex + itemsPerPage,
    totalCustomersCount || filteredCustomers.length,
  );
  const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex);

  useEffect(() => setCurrentPage(1), [searchTerm, statusFilter, dateFilter]);

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 3) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 2) pages.push(1, 2, "...", totalPages);
      else if (currentPage >= totalPages - 1)
        pages.push(1, "...", totalPages - 1, totalPages);
      else pages.push(1, "...", currentPage, "...", totalPages);
    }
    return pages;
  };

  const handleReset = () => {
    setSearchTerm("");
    setStatusFilter("All Status");
    setDateFilter("All Time");
    setCurrentPage(1);
  };

  const toggleBlockStatus = (id) => {
    (async () => {
      try {
        const customer = customersData.find((c) => c.id === id);
        if (!customer) return;
        const newStatus = customer.status === "Blocked" ? "active" : "blocked";
        await api.patch(`/customers/${id}/status`, { status: newStatus });

        setCustomersData((prev) =>
          prev.map((customer) =>
            customer.id === id
              ? {
                  ...customer,
                  status: customer.status === "Blocked" ? "Active" : "Blocked",
                }
              : customer,
          ),
        );

        if (selectedCustomer && selectedCustomer.id === id)
          setSelectedCustomer((prev) => ({
            ...prev,
            status: prev.status === "Blocked" ? "Active" : "Blocked",
          }));
        toast.success("Customer status updated");
      } catch (err) {
        console.error("Failed to update customer status", err);
        toast.error(err.message || "Failed to update status");
      }
    })();
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-600";
      case "Inactive":
        return "bg-gray-100 text-gray-600";
      case "Blocked":
        return "bg-red-100 text-red-600";
      default:
        return "";
    }
  };

  const handleVerifySeller = async (sellerProfileId) => {
    if (!sellerProfileId) return;
    try {
      await api.patch(`/customers/sellers/${sellerProfileId}/verify`, { is_verified: true });
      setSelectedCustomer(prev => ({
        ...prev,
        raw: {
          ...prev.raw,
          is_verified: true,
          seller_details: {
            ...(prev.raw?.seller_details || {}),
            is_verified: true
          }
        }
      }));
      setRefreshKey(prev => prev + 1);
      toast.success("Seller verified successfully!");
    } catch (err) {
      toast.error("Failed to verify seller");
    }
  };

  const handleDeleteCustomer = async (id) => {
    const confirmed = await confirm("Are you sure you want to completely delete this customer?");
    if(!confirmed) return;
    try {
      await api.delete(`/customers/${id}`);
      setSelectedCustomer(null);
      setRefreshKey(prev => prev + 1);
      toast.success("Customer deleted permanently");
    } catch(err) {
      toast.error("Failed to delete customer");
    }
  };

  if (selectedCustomer && !isCustomerFormOpen) {
    const isSeller = selectedCustomer.raw?.role === 'Seller' || selectedCustomer.raw?.role === 'Both' || selectedCustomer.raw?.role === 'seller';
    const hasAddress = !!selectedCustomer.raw?.address;
    const isVerified = selectedCustomer.raw?.is_verified || selectedCustomer.raw?.seller_details?.is_verified;

    return (
      <div className="space-y-4 w-full mx-auto animate-[fadeIn_.2s_ease] text-left p-2 pb-20">
        
        {/* Unified Profile Header */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          {/* Top Banner */}
          <div className="h-28 bg-gradient-to-r from-blue-50 to-indigo-50 relative border-b border-gray-100">
            <button
              type="button"
              onClick={() => setSelectedCustomer(null)}
              className="absolute top-4 left-4 flex items-center justify-center w-9 h-9 rounded-full bg-white shadow-sm border border-gray-200 hover:bg-gray-50 text-gray-700 transition"
              title="Back to Customers"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm border ${
                  selectedCustomer.status === 'Active'
                    ? 'text-green-800 bg-green-100 border-green-200'
                    : selectedCustomer.status === 'Blocked'
                      ? 'text-red-800 bg-red-100 border-red-200'
                      : 'text-gray-800 bg-gray-100 border-gray-200'
                }`}
              >
                {selectedCustomer.status}
              </span>
            </div>
          </div>

          <div className="px-5 lg:px-8 pb-5 relative">
            <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-end -mt-12 mb-5">
              <div
                className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center text-3xl sm:text-4xl font-extrabold border-4 border-white shadow-md shrink-0 ${selectedCustomer.avatarBg} ${selectedCustomer.avatarText}`}
              >
                {selectedCustomer.initials}
              </div>
              <div className="flex-1 pb-1">
                <h2 className="text-2xl font-extrabold text-gray-900 leading-tight">{selectedCustomer.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-blue-600 font-medium text-sm">{selectedCustomer.handle}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                  <span className="text-gray-500 font-medium text-sm flex items-center gap-1.5">
                    <Users size={14} className="text-blue-500" />
                    Customer Account
                  </span>
                </div>
              </div>
            </div>

            {/* Info Badges */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                <Mail size={15} className="text-gray-400" />
                <span className="font-medium">{selectedCustomer.email || "No Email provided"}</span>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                <Phone size={15} className="text-gray-400" />
                <span className="font-medium">{selectedCustomer.phone || "No Phone provided"}</span>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                <Calendar size={15} className="text-gray-400" />
                <span className="font-medium">Joined {selectedCustomer.joinedDate || "N/A"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <div className="bg-gradient-to-br from-[#f5f7ff] via-[#eef2ff] to-[#e0e7ff] rounded-xl border border-white/60 p-4 shadow-sm flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Total Orders</span>
              <ShoppingBag size={18} className="text-[#4f6bff]" />
            </div>
            <h4 className="text-3xl font-extrabold text-gray-900">{selectedCustomer.totalOrders}</h4>
          </div>
          <div className="bg-gradient-to-br from-[#f1fff7] via-[#e8fff1] to-[#dff7e8] rounded-xl border border-white/60 p-4 shadow-sm flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Total Revenue</span>
              <CreditCard size={18} className="text-green-600" />
            </div>
            <h4 className="text-3xl font-extrabold text-gray-900">{selectedCustomer.totalSpent || "$0.00"}</h4>
          </div>
          <div className="bg-gradient-to-br from-[#f5fafe] via-[#f1f8ff] to-[#e6f3ff] rounded-xl border border-white/60 p-4 shadow-sm flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Role Level</span>
              <Shield size={18} className="text-blue-500" />
            </div>
            <h4 className="text-2xl font-extrabold text-gray-900 capitalize">{selectedCustomer.raw?.role || 'User'}</h4>
          </div>
          <div className="bg-gradient-to-br from-[#fff5f5] via-[#ffeded] to-[#ffe4e4] rounded-xl border border-white/60 p-4 shadow-sm flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Verification</span>
              <CheckCircle2 size={18} className="text-red-500" />
            </div>
            <h4 className="text-xl font-extrabold text-gray-900 mt-1">{isVerified ? 'Verified' : 'Unverified'}</h4>
          </div>
        </div>

        {/* Detailed Information Tabs / Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
          <div className="lg:col-span-2 space-y-2">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
              <h3 className="text-[15px] font-bold text-gray-900 mb-3 border-b border-gray-100 pb-2 flex items-center gap-2">
                <MapPin size={16} className="text-gray-400" /> Address Details
              </h3>
              {hasAddress ? (
                <div className="space-y-2 text-gray-700 text-sm">
                  <p className="font-medium text-gray-900 whitespace-pre-wrap">{selectedCustomer.raw?.address}</p>
                </div>
              ) : (
                <div className="py-4 text-center text-sm text-gray-500 italic bg-gray-50 rounded-lg border border-dashed border-gray-200">No address provided by the user.</div>
              )}
            </div>
            
            {isSeller && (
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
                <h3 className="text-[15px] font-bold text-gray-900 mb-3 border-b border-gray-100 pb-2 flex items-center gap-2">
                  <Store size={16} className="text-gray-400" /> Business Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">Business Name</span>
                    <span className="font-semibold text-gray-900 text-[14px]">{selectedCustomer.raw?.business_name || selectedCustomer.raw?.seller_details?.business_name || 'N/A'}</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">GST Number</span>
                    <span className="font-semibold text-gray-900 text-[14px]">{selectedCustomer.raw?.gst_number || selectedCustomer.raw?.seller_details?.gst_number || 'N/A'}</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">Total Listings</span>
                    <span className="font-semibold text-gray-900 text-[14px]">{selectedCustomer.raw?.seller_details?.total_listings || 0}</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">Business Profile ID</span>
                    <span className="font-semibold text-gray-900 text-[14px]">{selectedCustomer.raw?.seller_profile_id || 'N/A'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
             <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
                <h3 className="text-[15px] font-bold text-gray-900 mb-3 border-b border-gray-100 pb-2 flex items-center gap-2">
                  <Shield size={16} className="text-gray-400" /> Quick Actions
                </h3>
                <div className="flex flex-col gap-2.5">
                  <button
                    type="button"
                    onClick={() => openCustomerForm("edit", selectedCustomer)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition font-semibold shadow-sm"
                  >
                    Edit Profile
                  </button>

                  {isSeller && !isVerified && selectedCustomer.raw?.seller_profile_id && (
                    <button
                      type="button"
                      onClick={() => handleVerifySeller(selectedCustomer.raw.seller_profile_id)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition font-semibold shadow-sm"
                    >
                      <CheckCircle2 size={16} />
                      Verify Seller
                    </button>
                  )}

                  {selectedCustomer.status !== "Blocked" ? (
                    <button
                      type="button"
                      onClick={() => toggleBlockStatus(selectedCustomer.id)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg transition font-semibold shadow-sm"
                    >
                      <Ban size={16} />
                      Suspend Customer
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => toggleBlockStatus(selectedCustomer.id)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition font-semibold shadow-sm"
                    >
                      <CheckCircle2 size={16} />
                      Unblock Customer
                    </button>
                  )}
                  
                  <button
                    type="button"
                    onClick={() => handleDeleteCustomer(selectedCustomer.id)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition font-semibold shadow-sm"
                  >
                    <X size={16} />
                    Delete Customer
                  </button>
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  }

  if (isCustomerFormOpen) {
    return (
      <div className="space-y-6 w-full mx-auto animate-[fadeIn_.2s_ease] text-left p-2">
        {/* Header with Back button */}
        <div className="flex items-center gap-4 bg-white p-4 border border-gray-200 rounded-sm shadow-sm">
          <button
            type="button"
            onClick={closeCustomerForm}
            className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 transition"
          >
            <ChevronLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {customerFormMode === "add" ? "Add New Customer" : "Edit Customer"}
            </h1>
            <p className="text-xs text-gray-500">
              {customerFormMode === "add" ? "Create a new customer account profile." : "Update profile details for this customer account."}
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
          <form onSubmit={handleCustomerFormSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                  Full Name
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  value={customerFormData.name}
                  onChange={handleCustomerInputChange}
                  placeholder="e.g. Michael Scott"
                  className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-gray-800 font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                  Handle
                </label>
                <input
                  name="handle"
                  type="text"
                  value={customerFormData.handle}
                  onChange={handleCustomerInputChange}
                  placeholder="@username"
                  className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-gray-800 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                  Phone
                </label>
                <input
                  name="phone"
                  type="text"
                  value={customerFormData.phone}
                  onChange={handleCustomerInputChange}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-gray-800 font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  value={customerFormData.email}
                  onChange={handleCustomerInputChange}
                  placeholder="me@example.com"
                  className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-gray-800 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                  Type
                </label>
                <select
                  name="type"
                  value={customerFormData.type}
                  onChange={handleCustomerInputChange}
                  className="w-full px-4 py-3 text-sm border border-gray-300 bg-white rounded-lg outline-none focus:border-blue-500 text-gray-700 font-medium"
                >
                  <option value="Buyer">Buyer</option>
                  <option value="Seller">Seller</option>
                </select>
              </div>

              {customerFormMode === "add" && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                    Password
                  </label>
                  <input
                    name="password"
                    type="password"
                    value={customerFormData.password || ""}
                    onChange={handleCustomerInputChange}
                    placeholder="Set account password"
                    className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-gray-800 font-medium"
                  />
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeCustomerForm}
                className="px-5 py-2.5 text-sm border border-gray-300 rounded-xl hover:bg-gray-50 text-gray-600 transition font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-sm"
              >
                {customerFormMode === "add" ? "Save Customer" : "Update Customer"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
<div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {stats.map((item) => (
          <div
            key={item.id}
            className={`${item.cardBg} rounded-xl border border-white/60 p-2 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-200`}
          >
            <div className="flex flex-col">
              <h3 className="text-[12px] sm:text-[14px] text-gray-600 mb-1 sm:mb-2">{item.title}</h3>
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-xl sm:text-3xl leading-none font-bold text-black">
                    {item.value}
                  </h1>
                </div>
                <div
                  className={`w-[36px] h-[36px] sm:w-[54px] sm:h-[54px] rounded-xl flex items-center justify-center ${item.iconBg}`}
                >
                  <div className="scale-75 sm:scale-100">{item.icon}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 shadow-sm w-full max-w-full overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between p-3 sm:p-4 md:px-5 md:py-3 border-b border-gray-100 gap-3">
          <h2 className="text-[18px] font-semibold text-[#111827]">
            All Customers
          </h2>
          <div className="w-full lg:w-auto">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 justify-end w-full">
              <div className="relative w-full sm:w-[260px]">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={() => openCustomerForm("add")}
                className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-all rounded shadow-sm whitespace-nowrap"
              >
                <Plus size={16} /> Add Customer
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-end gap-3 p-3 sm:p-4 md:px-5 md:py-3 border-b border-gray-100">
          <div className="flex flex-col gap-1.5 col-span-1 w-full sm:w-[170px]">
            <label className="text-[11px] sm:text-sm text-gray-700 font-medium">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-[12px] sm:text-sm border border-gray-300 bg-white outline-none focus:ring-1 focus:ring-blue-700 text-gray-700"
            >
              <option value="All Status">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Blocked">Blocked</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5 col-span-1 w-full sm:w-[170px]">
            <label className="text-[11px] sm:text-sm text-gray-700 font-medium">
              Joined Date
            </label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-[12px] sm:text-sm border border-gray-300 bg-white outline-none focus:ring-1 focus:ring-blue-500 text-gray-700"
            >
              <option value="All Time">All Time</option>
              {[...new Set(customersData.map((b) => b.joinedDate))].map(
                (date) => (
                  <option key={date} value={date}>
                    {date}
                  </option>
                ),
              )}
            </select>
          </div>

          <div className="w-full sm:w-auto">
            <button
              onClick={handleReset}
              className="px-4 py-2 text-sm border border-gray-300 bg-white hover:bg-gray-50 text-gray-600 transition font-medium"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Table Content - Desktop */}
        <div className="hidden lg:block w-full max-w-full overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
          <table className="min-w-[1050px] w-full whitespace-nowrap">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left py-3 px-5 text-sm text-black font-medium">
                  Customer
                </th>
                <th className="text-left py-3 px-5 text-sm text-black font-medium">
                  Contact Details
                </th>
                <th className="text-left py-3 px-5 text-sm text-black font-medium">
                  Email
                </th>
                <th className="text-left py-3 px-5 text-sm text-black font-medium">
                  Status
                </th>
                <th className="text-left py-3 px-5 text-sm text-black font-medium">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedCustomers.length > 0 ? (
                paginatedCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="border-b border-gray-100 hover:bg-gray-50/50 cursor-pointer"
                    onClick={() => setSelectedCustomer(customer)}
                  >
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${customer.avatarBg} ${customer.avatarText}`}
                        >
                          {customer.initials}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-800">
                            {customer.name}
                          </span>
                          <span className="text-[12px] text-gray-500">
                            Joined {customer.joinedDate}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-5">
                      <span className="text-[15px] text-gray-500">
                        {customer.phone}
                      </span>
                    </td>
                    <td className="py-3 px-5">
                      <span className="text-[15px] text-gray-500">
                        {customer.email || "N/A"}
                      </span>
                    </td>
                    <td className="py-3 px-5">
                      <span
                        className={`px-2.5 py-1 text-sm font-medium ${getStatusStyle(customer.status)}`}
                      >
                        {customer.status}
                      </span>
                    </td>
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-2">
                        {customer.status !== "Blocked" ? (
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleBlockStatus(customer.id); }}
                            className="flex items-center gap-1.5 px-2 py-1 text-xs text-[#4f6bff] bg-blue-50 border border-[#dbe5ff] hover:bg-blue-100 transition"
                          >
                            <Ban size={14} className="text-[#4f6bff]" />
                            Block
                          </button>
                        ) : (
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleBlockStatus(customer.id); }}
                            className="flex items-center gap-1.5 px-2 py-1 text-xs text-green-600 bg-green-50 border border-green-200 hover:bg-green-100 transition"
                          >
                            <CheckCircle2
                              size={14}
                              className="text-green-600"
                            />
                            Unblock
                          </button>
                        )}
                        {/* View button removed */}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="py-8 text-center text-gray-500 text-sm"
                  >
                    No customers found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="grid gap-3 p-4 lg:hidden">
          {paginatedCustomers.length > 0 ? (
            paginatedCustomers.map((customer) => (
              <div
                key={customer.id}
                className="border border-gray-100 rounded-lg p-3 shadow-sm bg-white flex flex-col gap-3 cursor-pointer"
                onClick={() => setSelectedCustomer(customer)}
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${customer.avatarBg} ${customer.avatarText}`}>
                      {customer.initials}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-semibold text-gray-900 truncate">{customer.name}</span>
                      <span className="text-xs text-gray-500">Joined {customer.joinedDate}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium whitespace-nowrap rounded ${getStatusStyle(customer.status)}`}>
                    {customer.status}
                  </span>
                </div>
                
                <div className="flex flex-col gap-1.5 pt-2 border-t border-gray-50">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone size={14} className="text-gray-400" />
                    <span>{customer.phone}</span>
                  </div>
                  {customer.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail size={14} className="text-gray-400" />
                      <span className="truncate">{customer.email}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-50">
                  {customer.status !== "Blocked" ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleBlockStatus(customer.id); }}
                      className="flex items-center justify-center flex-1 gap-1.5 px-3 py-2 text-xs font-medium text-[#4f6bff] bg-blue-50 border border-[#dbe5ff] hover:bg-blue-100 transition rounded"
                    >
                      <Ban size={14} className="text-[#4f6bff]" /> Block
                    </button>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleBlockStatus(customer.id); }}
                      className="flex items-center justify-center flex-1 gap-1.5 px-3 py-2 text-xs font-medium text-green-600 bg-green-50 border border-green-200 hover:bg-green-100 transition rounded"
                    >
                      <CheckCircle2 size={14} className="text-green-600" /> Unblock
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-gray-500 text-sm border border-gray-100 rounded-lg bg-gray-50">
              No customers found.
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-gray-100">
          <span className="text-[13px] text-gray-500 text-center sm:text-left">
            Showing {filteredCustomers.length > 0 ? startIndex + 1 : 0} to{" "}
            {endIndex} of {totalCustomersCount || filteredCustomers.length}{" "}
            customers
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

export default Customers;
