import React, { useEffect, useState } from "react";
import {
  Store,
  UserCheck,
  Clock,
  UserX,
  Search,
  CheckCircle2,
  XCircle,
  Ban,
  ChevronLeft,
  ChevronRight,
  Eye,
  MapPin,
  Phone,
  Mail,
  Calendar,
  ShoppingBag,
  CreditCard,
  Shield,
} from "lucide-react";
import { api } from "../utils/api";

const Sellers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [storeVerifiedFilter, setStoreVerifiedFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All Time");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [totalItems, setTotalItems] = useState(0);
  const [selectedSeller, setSelectedSeller] = useState(null);

  const [sellersData, setSellersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [metrics, setMetrics] = useState({
    total: 0,
    active: 0,
    pending: 0,
    rejected: 0
  });

  const loadSellers = async () => {
    try {
      setLoading(true);
      let statusQuery = "";
      if (statusFilter === "Active") statusQuery = "active";
      if (statusFilter === "Pending") statusQuery = "suspended";
      if (statusFilter === "Rejected") statusQuery = "blocked";

      const res = await api.get(`/customers?type=seller&search=${encodeURIComponent(searchTerm)}&status=${statusQuery}&page=${currentPage}&limit=${itemsPerPage}`);
      
      if (res.success) {
        const colors = [
          { bg: "bg-purple-100", text: "text-purple-600" },
          { bg: "bg-blue-100", text: "text-blue-600" },
          { bg: "bg-red-100", text: "text-red-600" },
          { bg: "bg-orange-100", text: "text-orange-600" },
          { bg: "bg-green-100", text: "text-green-600" },
        ];

        const items = res.data?.items || res.data || [];
        const pagination = res.data?.pagination || res.pagination;

        const mapped = items.map((item, idx) => {
          const color = colors[idx % colors.length];
          const initials = item.full_name
            ? item.full_name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
            : "S";
          
          return {
            id: item.id,
            sellerProfileId: item.seller_profile_id,
            name: item.full_name || "Unnamed Seller",
            handle: item.business_name ? `@${item.business_name.toLowerCase().replace(/\s+/g, '')}` : `@seller_${item.id}`,
            storeName: item.business_name || "N/A",
            initials,
            phone: item.phone || "N/A",
            joinedDate: new Date(item.created_at).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            }),
            joinedTime: new Date(item.created_at).toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit'
            }),
            status: item.account_status === "active" ? "Active" : item.account_status === "suspended" ? "Pending" : "Rejected",
            storeVerified: item.is_verified ? "Yes" : "No",
            avatarBg: color.bg,
            avatarText: color.text,
            totalOrders: item.seller_details?.total_orders || 0,
            totalSpent: typeof item.seller_details?.total_revenue === 'number' ? `${Number(item.seller_details.total_revenue).toFixed(2)}` : (item.seller_details?.total_revenue || '$0.00'),
            raw: item,
          };
        });

        setSellersData(mapped);
        setTotalItems(pagination?.totalItems || items.length || 0);

        // Fetch counts from dashboard summary
        const summaryRes = await api.get('/dashboard/summary').catch(() => null);
        if (summaryRes && summaryRes.success) {
          setMetrics({
            total: summaryRes.data.counters.totalSellers,
            active: summaryRes.data.counters.totalSellers - summaryRes.data.counters.blockedUsers, // approximate or count
            pending: 0,
            rejected: summaryRes.data.counters.blockedUsers
          });
        } else {
          setMetrics({
            total: pagination?.totalItems || mapped.length,
            active: mapped.filter(s => s.status === "Active").length,
            pending: mapped.filter(s => s.status === "Pending").length,
            rejected: mapped.filter(s => s.status === "Rejected").length
          });
        }
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load sellers list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSellers();
  }, [searchTerm, statusFilter, currentPage]);

  const stats = [
    {
      id: 1,
      title: "Total Sellers",
      value: metrics.total,
      icon: <Store size={24} className="text-[#4f6bff]" />,
      cardBg: "bg-gradient-to-br from-[#f5f7ff] via-[#eef2ff] to-[#e0e7ff]",
      iconBg: "bg-gradient-to-br from-[#dbe5ff] to-[#eef2ff]",
    },
    {
      id: 2,
      title: "Active Sellers",
      value: metrics.active,
      icon: <UserCheck size={24} className="text-green-600" />,
      cardBg: "bg-gradient-to-br from-[#f1fff7] via-[#e8fff1] to-[#dff7e8]",
      iconBg: "bg-gradient-to-br from-[#ccf5db] to-[#e9fff1]",
    },
    {
      id: 3,
      title: "Pending Approval",
      value: metrics.pending,
      icon: <Clock size={24} className="text-orange-500" />,
      cardBg: "bg-gradient-to-br from-[#fffaf0] via-[#fff4df] to-[#ffe8bf]",
      iconBg: "bg-gradient-to-br from-[#ffe3ad] to-[#fff1d1]",
    },
    {
      id: 4,
      title: "Rejected Sellers",
      value: metrics.rejected,
      icon: <UserX size={24} className="text-red-600" />,
      cardBg: "bg-gradient-to-br from-[#fff5f5] via-[#ffeded] to-[#ffe4e4]",
      iconBg: "bg-gradient-to-br from-[#ffd6d6] to-[#ffeded]",
    },
  ];

  const filteredSellers = sellersData.filter((seller) => {
    const matchesStore =
      storeVerifiedFilter === "All" ||
      seller.storeVerified === storeVerifiedFilter;

    const matchesDate =
      dateFilter === "All Time" ||
      seller.joinedDate === dateFilter;

    return matchesStore && matchesDate;
  });

  // Pagination calculations
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + filteredSellers.length;
  const paginatedSellers = filteredSellers;

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, storeVerifiedFilter, dateFilter]);

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

  const handleReset = () => {
    setSearchTerm("");
    setStatusFilter("All Status");
    setStoreVerifiedFilter("All");
    setDateFilter("All Time");
    setCurrentPage(1);
  };

  const updateSellerStatus = async (id, newStatus) => {
    try {
      let backendStatus = "active";
      if (newStatus === "Rejected") backendStatus = "blocked";
      if (newStatus === "Pending") backendStatus = "suspended";

      await api.patch(`/customers/${id}/status`, { status: backendStatus });

      setSellersData((prev) =>
        prev.map((seller) =>
          seller.id === id
            ? {
                ...seller,
                status: newStatus,
              }
            : seller
        )
      );
    } catch (err) {
      alert(err.message || "Failed to update seller status");
    }

  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Pending":
        return "bg-orange-100 text-orange-500";
      case "Active":
        return "bg-green-100 text-green-600";
      case "Rejected":
        return "bg-red-100 text-red-600";
      default:
        return "";
    }
  };

if (selectedSeller) {
    const isSeller = true;
    const hasAddress = !!selectedSeller.raw?.address;

    return (
      <div className="space-y-6 w-full mx-auto animate-[fadeIn_.2s_ease] text-left p-4 lg:p-6 pb-20">
        {/* Header with Back button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 border border-gray-200 rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setSelectedSeller(null)}
              className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 transition shrink-0"
            >
              <ChevronLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Seller Profile</h1>
              <p className="text-sm text-gray-500 mt-0.5">Manage customer account, view orders, and history.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <span
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                selectedSeller.status === 'Active'
                  ? 'text-green-700 bg-green-100 border border-green-200'
                  : selectedSeller.status === 'Blocked'
                    ? 'text-red-700 bg-red-100 border border-red-200'
                    : 'text-gray-700 bg-gray-100 border border-gray-200'
              }`}
            >
              {selectedSeller.status}
            </span>
          </div>
        </div>

        {/* Top Profile Card */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 lg:p-8 flex flex-col md:flex-row gap-8 items-start md:items-center">
          <div
            className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full flex items-center justify-center text-4xl sm:text-5xl font-bold border-4 border-white shadow-md shrink-0 ${selectedSeller.avatarBg} ${selectedSeller.avatarText}`}
          >
            {selectedSeller.initials}
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900">{selectedSeller.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-blue-600 font-medium">{selectedSeller.handle}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                <span className="text-gray-500 font-medium flex items-center gap-1">
                  {isSeller ? <Store size={14} className="text-orange-500" /> : <Users size={14} className="text-blue-500" />}
                  {isSeller ? 'Seller Account' : 'Buyer Account'}
                </span>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 pt-2">
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                <Mail size={16} className="text-gray-400" />
                <span className="font-medium">{selectedSeller.email || "No Email provided"}</span>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                <Phone size={16} className="text-gray-400" />
                <span className="font-medium">{selectedSeller.phone || "No Phone provided"}</span>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                <Calendar size={16} className="text-gray-400" />
                <span className="font-medium">Joined {selectedSeller.joinedDate || "N/A"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-blue-800">Total Orders</span>
              <ShoppingBag size={20} className="text-blue-500" />
            </div>
            <h4 className="text-3xl font-extrabold text-blue-900">{selectedSeller.totalOrders}</h4>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-green-800">{isSeller ? 'Total Revenue' : 'Total Spent'}</span>
              <CreditCard size={20} className="text-green-500" />
            </div>
            <h4 className="text-3xl font-extrabold text-green-900">{selectedSeller.totalSpent || "$0.00"}</h4>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-purple-800">Role Level</span>
              <Shield size={20} className="text-purple-500" />
            </div>
            <h4 className="text-3xl font-extrabold text-purple-900 capitalize">{selectedSeller.raw?.role || 'User'}</h4>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-orange-800">Verification</span>
              <CheckCircle2 size={20} className="text-orange-500" />
            </div>
            <h4 className="text-lg font-bold text-orange-900 mt-2">{selectedSeller.raw?.is_verified ? 'Verified' : 'Unverified'}</h4>
          </div>
        </div>

        {/* Detailed Information Tabs / Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-3 flex items-center gap-2">
                <MapPin size={18} className="text-gray-400" /> Address Details
              </h3>
              {hasAddress ? (
                <div className="space-y-2 text-gray-700">
                  <p className="font-medium text-gray-900 whitespace-pre-wrap">{selectedSeller.raw?.address}</p>
                </div>
              ) : (
                <div className="py-6 text-center text-gray-500 italic bg-gray-50 rounded-lg border border-dashed border-gray-200">No address provided by the user.</div>
              )}
            </div>
            
            {isSeller && (
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-3 flex items-center gap-2">
                  <Store size={18} className="text-gray-400" /> Seller Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <span className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Business Name</span>
                    <span className="font-semibold text-gray-900 text-base">{selectedSeller.raw?.business_name || selectedSeller.raw?.seller_details?.business_name || 'N/A'}</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <span className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">GST Number</span>
                    <span className="font-semibold text-gray-900 text-base">{selectedSeller.raw?.gst_number || selectedSeller.raw?.seller_details?.gst_number || 'N/A'}</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <span className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Total Listings</span>
                    <span className="font-semibold text-gray-900 text-base">{selectedSeller.raw?.seller_details?.total_listings || 0}</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <span className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Seller Profile ID</span>
                    <span className="font-semibold text-gray-900 text-base">{selectedSeller.raw?.seller_profile_id || 'N/A'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="space-y-6">
             <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-3 flex items-center gap-2">
                  <Shield size={18} className="text-gray-400" /> Quick Actions
                </h3>
                <div className="space-y-3">
                  {selectedSeller.status !== "Blocked" ? (
                    <button
                      type="button"
                      onClick={() => updateSellerStatus(selectedSeller.id, selectedSeller.status === 'Rejected' ? 'Active' : 'Rejected')}
                      className="w-full flex items-center justify-center gap-2 px-5 py-3 text-sm text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition font-semibold shadow-sm"
                    >
                      <Ban size={16} />
                      Suspend Customer
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => updateSellerStatus(selectedSeller.id, selectedSeller.status === 'Rejected' ? 'Active' : 'Rejected')}
                      className="w-full flex items-center justify-center gap-2 px-5 py-3 text-sm text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 rounded-xl transition font-semibold shadow-sm"
                    >
                      <CheckCircle2 size={16} />
                      Unblock Customer
                    </button>
                  )}
                  
                  <button
                    type="button"
                    onClick={() => {
                        openCustomerForm("edit", selectedSeller);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-5 py-3 text-sm text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition font-semibold shadow-sm"
                  >
                    Edit Profile
                  </button>
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  }

  

  return (
    <div className="space-y-5">

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 xl:gap-5">

        {stats.map((item) => (
          <div
            key={item.id}
            className={`
              ${item.cardBg}
              rounded-lg
              border
              border-white/60
              p-2
            `}
          >

            <div className="flex items-start justify-between">

              <div>

                <h3 className="text-[12px] sm:text-[14px] text-gray-600">
                  {item.title}
                </h3>

                <h1 className="text-[24px] sm:text-[30px] leading-none font-bold mt-1 sm:mt-2 text-black">
                  {item.value}
                </h1>

              </div>

              <div
                className={`
                  w-[40px] h-[40px] sm:w-[54px] sm:h-[54px]
                  rounded-xl
                  flex
                  items-center
                  justify-center
                  ${item.iconBg}
                `}
              >
                <div className="scale-75 sm:scale-100">{item.icon}</div>
              </div>

            </div>

          </div>
        ))}

      </div>

      {/* Table */}
      <div className="bg-white border text-gray-800 border-gray-200 shadow-sm">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between p-3 sm:p-4 md:px-5 md:py-3 border-b border-gray-100 gap-3">

          <h2 className="text-[18px] font-semibold text-[#111827]">
            Sellers
          </h2>

          <div className="relative w-full sm:w-[260px]">

            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search sellers..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(
                  e.target.value
                )
              }
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />

          </div>

        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-end gap-5 p-4 md:px-5 md:py-1 border-b border-gray-100">

          <div className="flex flex-col gap-1.5">

            <label className="text-md text-gray-700 font-medium">
              Status
            </label>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
              className="px-3 py-1.5 text-sm border border-gray-300 bg-white outline-none focus:ring-1 focus:ring-blue-700 sm:w-[140px] text-gray-700"
            >
              <option value="All Status">
                All Status
              </option>

              <option value="Active">
                Active
              </option>

              <option value="Pending">
                Pending
              </option>

              <option value="Rejected">
                Rejected
              </option>

            </select>

          </div>

          <div className="flex flex-col gap-1.5">

            <label className="text-md text-gray-700 font-medium">
              Store Verified
            </label>

            <select
              value={storeVerifiedFilter}
              onChange={(e) =>
                setStoreVerifiedFilter(
                  e.target.value
                )
              }
              className="px-3 py-1.5 text-sm border border-gray-300 bg-white outline-none focus:ring-1 focus:ring-blue-700 sm:w-[140px] text-gray-700"
            >
              <option value="All">
                All
              </option>

              <option value="Yes">
                Yes
              </option>

              <option value="No">
                No
              </option>

            </select>

          </div>

          <div className="flex flex-col gap-1.5">

            <label className="text-md text-gray-700 font-medium">
              Joined Date
            </label>

            <select
              value={dateFilter}
              onChange={(e) =>
                setDateFilter(
                  e.target.value
                )
              }
              className="px-3 py-1.5 text-sm border border-gray-300 bg-white outline-none focus:ring-1 focus:ring-blue-700 sm:w-[140px] text-gray-700"
            >
              <option value="All Time">
                All Time
              </option>

              {[
                ...new Set(
                  sellersData.map(
                    (s) =>
                      s.joinedDate
                  )
                ),
              ].map((date) => (
                <option
                  key={date}
                  value={date}
                >
                  {date}
                </option>
              ))}

            </select>

          </div>

          <button
            onClick={handleReset}
            className="px-4 py-1.5 text-sm border border-gray-300 bg-white hover:bg-gray-50 text-gray-600 transition font-medium"
          >
            Reset
          </button>

        </div>

        {/* Table */}
        <div className="w-full max-w-full overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">

          <table className="min-w-[980px] w-full whitespace-nowrap">

            <thead>

              <tr className="border-b border-gray-100 bg-gray-50/50">

                <th className="text-left py-2 px-5 text-sm font-medium">
                  Seller
                </th>

                <th className="text-left py-2 px-5 text-sm font-medium">
                  Store Name
                </th>

                <th className="text-left py-2 px-5 text-sm font-medium">
                  Phone
                </th>

                <th className="text-left py-2 px-5 text-sm font-medium">
                  Joined On
                </th>

                <th className="text-left py-2 px-5 text-sm font-medium">
                  Status
                </th>

                <th className="text-left py-2 px-5 text-sm font-medium">
                  Action
                </th>

              </tr>

            </thead>

            <tbody>
              {paginatedSellers.length > 0 ? (
                paginatedSellers.map((seller) => (
                  <tr key={seller.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold ${seller.avatarBg} ${seller.avatarText}`}>
                          {seller.initials}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-800">{seller.name}</span>
                          <span className="text-[13px] text-gray-500">{seller.handle}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-5 text-sm text-gray-800 font-medium">{seller.storeName}</td>
                    <td className="py-3 px-5 text-sm text-gray-600">{seller.phone}</td>
                    <td className="py-3 px-5">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-800">{seller.joinedDate}</span>
                        <span className="text-[13px] text-gray-500">{seller.joinedTime}</span>
                      </div>
                    </td>
                    <td className="py-3 px-5">
                      <span className={`px-2.5 py-1 rounded-sm text-xs font-medium ${getStatusStyle(seller.status)}`}>
                        {seller.status}
                      </span>
                    </td>
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-2 relative">
                        {seller.status === "Pending" && (
                          <>
                            <button onClick={() => updateSellerStatus(seller.id, "Active")} className="flex items-center gap-1.5 px-2 py-1 text-xs text-green-600 bg-green-100 border border-green-200 hover:bg-green-200 transition">
                              <CheckCircle2 size={14} /> Approve
                            </button>
                            <button onClick={() => updateSellerStatus(seller.id, "Rejected")} className="flex items-center gap-1.5 px-2 py-1 text-xs text-red-500 bg-red-100 border border-red-200 hover:bg-red-200 transition">
                              <XCircle size={14} /> Reject
                            </button>
                          </>
                        )}
                        {seller.status === "Active" && (
                          <button onClick={() => updateSellerStatus(seller.id, "Rejected")} className="flex items-center gap-1.5 px-2 py-1 text-xs text-[#4f6bff] bg-blue-50 border border-[#dbe5ff] hover:bg-blue-100 transition">
                            <Ban size={14} /> Deactivate
                          </button>
                        )}
                        {seller.status === "Rejected" && (
                          <button onClick={() => updateSellerStatus(seller.id, "Active")} className="flex items-center gap-1.5 px-2 py-1 text-xs text-green-600 bg-green-100 border border-green-200 hover:bg-green-200 transition">
                            <CheckCircle2 size={14} /> Activate
                          </button>
                        )}
                        {seller.status !== 'Rejected' && (
                          <button onClick={() => setSelectedSeller(seller)} className="flex items-center gap-1.5 px-2 py-1 text-xs text-[#4f6bff] bg-blue-50 border border-[#dbe5ff] hover:bg-blue-100 transition ml-2">
                            <Eye size={14} /> View
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-500 text-sm">
                    No sellers found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-gray-100 gap-4">

          <span className="text-[13px] text-gray-500">
            Showing{" "}
            {filteredSellers.length > 0
              ? startIndex + 1
              : 0}{" "}
            to{" "}
            {Math.min(
              endIndex,
              totalItems
            )}{" "}
            of {totalItems} sellers
          </span>

          <div className="flex items-center gap-3">

            <div className="flex items-center gap-1.5">

              <button
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.max(prev - 1, 1)
                  )
                }
                disabled={currentPage === 1}
                className={`w-6 h-6 flex items-center justify-center border border-gray-300 ${
                  currentPage === 1
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-600 hover:bg-gray-50 cursor-pointer"
                }`}
              >
                <ChevronLeft size={16} />
              </button>

              {getPageNumbers().map(
                (page, index) =>
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
                      onClick={() =>
                        setCurrentPage(page)
                      }
                      className={`w-6 h-6 flex items-center justify-center text-xs font-medium ${
                        currentPage === page
                          ? "border border-transparent bg-[#4f6bff] text-white"
                          : "border border-gray-300 text-gray-600 hover:bg-gray-50 cursor-pointer"
                      }`}
                    >
                      {page}
                    </button>
                  )
              )}

              <button
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(
                      prev + 1,
                      totalPages
                    )
                  )
                }
                disabled={
                  currentPage === totalPages ||
                  totalPages === 0
                }
                className={`w-6 h-6 flex items-center justify-center border border-gray-300 ${
                  currentPage === totalPages ||
                  totalPages === 0
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-600 hover:bg-gray-50 cursor-pointer"
                }`}
              >
                <ChevronRight size={16} />
              </button>

            </div>

            <span className="text-[13px] text-gray-500 font-medium whitespace-nowrap">
              Page {currentPage} of{" "}
              {totalPages || 1}
            </span>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Sellers;
