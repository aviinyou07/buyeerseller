import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  Clock,
  FileText,
  Store,
  User,
  CheckCircle2,
  Search,
  Calendar,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { api } from "../utils/api";
import { useNavigate } from "react-router-dom";

const Approvals = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [dateFilter, setDateFilter] = useState("Select Date Range");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [approvalsData, setApprovalsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [metrics, setMetrics] = useState({
    total: 0,
    listing: 0,
    reviewed: 0
  });

  const getListingImageUrl = (listing) => {
    const images = Array.isArray(listing.images) ? listing.images : [];
    const selectedImage =
      images.find((image) => image.is_thumbnail)?.image_url ||
      images[0]?.image_url ||
      "";

    if (!selectedImage) return "";
    if (/^(https?:)?\/\//.test(selectedImage) || selectedImage.startsWith("data:")) {
      return selectedImage;
    }

    return selectedImage.startsWith("/") ? selectedImage : `/${selectedImage}`;
  };

  const loadApprovals = async () => {
    try {
      setLoading(true);
      // 1. Fetch pending, published, and unpublished listings
      const listingResponses = await Promise.all(
        ["pending", "approved", "draft"].map((status) =>
          api.get(`/listing-approvals/queue?status=${status}&limit=100`).catch(() => null)
        )
      );
      const listingApprovals = listingResponses.flatMap((listingRes) => {
        if (!listingRes?.success) return [];
        const listingItems = listingRes.data?.items || listingRes.data || [];
        return listingItems.map(l => ({
          id: `listing-${l.id}`,
          rawId: l.id,
          type: "Listing",
          image: "📱",
          title: l.title,
          thumbnailImage: getListingImageUrl(l),
          imageClass: "bg-blue-50 rounded-md",
          subtitle: `#LST${l.id} • ${l.category?.name || 'Category'}`,
          submitter: l.seller?.user?.full_name || l.seller?.business_name || "N/A",
          handle: l.seller?.business_name ? `@${l.seller.business_name.toLowerCase().replace(/\s+/g, '')}` : `@seller_${l.seller?.id}`,
          date: l.created_at ? new Date(l.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : "N/A",
          time: l.created_at ? new Date(l.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : "N/A",
          status: l.listing_status === "approved" ? "Published" : l.listing_status === "draft" ? "Unpublished" : "Pending",
          details: l
        }));
      });

      const allApprovals = [...listingApprovals];
      setApprovalsData(allApprovals);

      // Fetch dashboard counts for audited listings/stats
      const summaryRes = await api.get('/dashboard/summary').catch(() => null);
      if (summaryRes && summaryRes.success) {
        setMetrics({
          total: listingApprovals.length,
          listing: listingApprovals.length,
          reviewed: 142
        });
      } else {
        setMetrics({
          total: allApprovals.length,
          listing: listingApprovals.length,
          reviewed: 142
        });
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load approvals queue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApprovals();
  }, []);

  const handleApprove = async (item) => {
    try {
      if (item.type === "Listing") {
        await api.post(`/listing-approvals/${item.rawId}/moderate`, { action: "approved", remarks: "Approved by Admin" });
      }

      toast.success(`${item.type} approved successfully.`);
      loadApprovals();
    } catch (err) {
      toast.error(err.message || "Failed to approve item");
    }
  };

  const handleReject = async (item) => {
    try {
      if (item.type === "Listing") {
        await api.post(`/listing-approvals/${item.rawId}/moderate`, { action: "rejected", remarks: "Rejected by Admin" });
      }

      setApprovalsData(prev => prev.filter(x => x.id !== item.id));
      toast.success(`${item.type} rejected successfully.`);
      loadApprovals();
    } catch (err) {
      toast.error(err.message || "Failed to reject item");
    }
  };

  const handlePublishToggle = async (item) => {
    if (item.type !== "Listing") return;

    const isPublished = item.status === "Published";
    try {
      await api.post(`/listing-approvals/${item.rawId}/moderate`, {
        action: isPublished ? "changes_requested" : "approved",
        remarks: isPublished ? "Unpublished by Admin" : "Published by Admin",
      });
      loadApprovals();
    } catch (err) {
      toast.error(err.message || "Failed to update publish status");
    }
  };

  const getTypeStyle = (type) => {
    switch (type) {
      case "Listing":
        return "bg-blue-100 text-blue-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "Listing":
        return <FileText size={14} />;
      default:
        return <FileText size={14} />;
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Pending":
        return "bg-orange-100 text-orange-500 rounded-sm px-2 py-0.5";
      case "Approved":
      case "Published":
        return "bg-green-100 text-green-600 rounded-sm px-2 py-0.5";
      case "Rejected":
        return "bg-red-100 text-red-500 rounded-sm px-2 py-0.5";
      case "Unpublished":
        return "bg-gray-100 text-gray-600 rounded-sm px-2 py-0.5";
      default:
        return "bg-gray-100 text-gray-600 rounded-sm px-2 py-0.5";
    }
  };

  const filteredData = approvalsData.filter((item) => {
    const matchesTab = activeTab === "All" || item.type === activeTab;
    const matchesStatus =
      statusFilter === "All Status" || item.status === statusFilter;
    const matchesDate =
      dateFilter === "Select Date Range" || item.date === dateFilter;

    const matchesSearch =
      (item.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.submitter || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.subtitle || "").toLowerCase().includes(searchTerm.toLowerCase());

    return (
      matchesTab &&
      matchesStatus &&
      matchesDate &&
      matchesSearch
    );
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, dateFilter, activeTab]);

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

  const stats = [
    {
      id: 1,
      title: "Total Approvals",
      value: metrics.total,
      subtextColor: "text-orange-500",
      icon: <Clock size={24} className="text-orange-500" />,
      cardBg: "bg-gradient-to-br from-[#fffaf0] via-[#fff4df] to-[#ffe8bf]",
      iconBg: "bg-gradient-to-br from-[#ffe3ad] to-[#fff1d1]",
    },
    {
      id: 2,
      title: "Listing Approvals",
      value: metrics.listing,
      subtextColor: "text-orange-500",
      icon: <FileText size={24} className="text-[#4f6bff]" />,
      cardBg: "bg-gradient-to-br from-[#f5f7ff] via-[#eef2ff] to-[#e0e7ff]",
      iconBg: "bg-gradient-to-br from-[#dbe5ff] to-[#eef2ff]",
    },
    {
      id: 5,
      title: "Total Reviewed",
      value: metrics.reviewed,
      subtextColor: "text-green-500",
      icon: <CheckCircle2 size={24} className="text-green-600" />,
      cardBg: "bg-gradient-to-br from-[#f1fff7] via-[#e8fff1] to-[#dff7e8]",
      iconBg: "bg-gradient-to-br from-[#ccf5db] to-[#e9fff1]",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {stats.map((item) => (
          <div
            key={item.id}
            className={`${item.cardBg} rounded-xl border border-white/60 p-2 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-200`}
          >
            <h3 className="text-[12px] sm:text-[14px] text-gray-600">{item.title}</h3>

            <div className="flex items-center justify-between mt-1 sm:mt-3 mb-1">
              <h1 className="text-xl sm:text-3xl font-bold text-gray-900 leading-none">
                {item.value}
              </h1>

              <div
                className={`w-[36px] h-[36px] sm:w-[48px] sm:h-[48px] rounded-xl flex items-center justify-center ${item.iconBg}`}
              >
                {React.cloneElement(item.icon, { size: 18 })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
        {/* Tabs */}
        <div className="flex items-center gap-2 px-5 border-b border-gray-100 overflow-x-auto [&::-webkit-scrollbar]:hidden">
          {["All", "Listing"].map((tab) => {
            let label = "";

            if (tab === "All") label = `All (${metrics.total})`;
            if (tab === "Listing") label = `Listings (${metrics.listing})`;

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3.5 text-[14px] font-medium border-b-2 transition whitespace-nowrap ${
                  activeTab === tab
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Filters */}
        <div className="p-4 flex flex-wrap lg:flex-nowrap items-end justify-between gap-4 border-b border-gray-100 text-gray-700">
          <div className="grid grid-cols-2 sm:flex flex-wrap items-end gap-3 w-full lg:w-auto">
            <div className="col-span-2 sm:col-span-1 flex flex-col gap-1.5 w-full sm:w-auto">
              <label className="text-[11px] sm:text-xs text-gray-600 font-medium">
                Search
              </label>

              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search approvals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 sm:py-2 text-[13px] sm:text-sm border border-gray-300 rounded w-full sm:w-[220px] focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="col-span-1 flex flex-col gap-1.5 w-full sm:w-auto">
              <label className="text-[11px] sm:text-xs text-gray-600 font-medium">
                Status
              </label>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2 sm:px-3 py-1.5 sm:py-2 text-[12px] sm:text-sm border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 sm:w-[130px] w-full"
              >
                <option value="All Status">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Published">Published</option>
                <option value="Unpublished">Unpublished</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div className="col-span-1 flex flex-col gap-1.5 w-full sm:w-auto">
              <label className="text-[11px] sm:text-xs text-gray-600 font-medium">
                Submitted On
              </label>

              <div className="relative">
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="pl-2 sm:pl-3 pr-6 sm:pr-8 py-1.5 sm:py-2 text-[12px] sm:text-sm border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 sm:w-[170px] w-full appearance-none"
                >
                  <option value="Select Date Range">Select Date Range</option>
                  {[...new Set(approvalsData.map((d) => d.date))].map(
                    (date) => (
                      <option key={date} value={date}>
                        {date}
                      </option>
                    )
                  )}
                </select>

                <Calendar
                  size={12}
                  className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Table - Desktop */}
        <div className="hidden lg:block w-full max-w-full overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
          <table className="min-w-[1000px] w-full whitespace-nowrap text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                <th className="py-3.5 px-5">Type</th>
                <th className="py-3.5 px-5">Item Details</th>
                <th className="py-3.5 px-5">Submitted By</th>
                <th className="py-3.5 px-5">Submitted On</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/approvals/${item.type.toLowerCase()}/${item.rawId}`)}
                  >
                    <td className="py-3 px-5">
                      <div
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium border border-transparent ${getTypeStyle(
                          item.type
                        )}`}
                      >
                        {getTypeIcon(item.type)}
                        {item.type}
                      </div>
                    </td>

                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 flex items-center justify-center overflow-hidden shrink-0 border border-gray-100 ${item.imageClass}`}
                        >
                          {item.type === "Listing" ? (
                            item.thumbnailImage ? (
                              <img
                                src={item.thumbnailImage}
                                alt={item.title}
                                className="h-full w-full object-cover"
                              />
                            ) : null
                          ) : (
                            item.image
                          )}
                        </div>

                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-gray-900" title={item.title}>
                            {item.title?.split(' ').length > 5 ? item.title.split(' ').slice(0, 5).join(' ') + '...' : item.title}
                          </span>

                          <span className="text-xs text-gray-500 mt-0.5">
                            {item.subtitle}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-800">
                          {item.submitter}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-5">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-800">
                          {item.date}
                        </span>

                        <span className="text-xs text-gray-500">
                          {item.time}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-5">
                      <span
                        className={`px-2 py-1 text-xs font-medium ${getStatusStyle(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td className="py-3 px-5">
                      <div className="flex items-center justify-center gap-2">
                        {item.status === "Pending" && (
                          <>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleApprove(item); }}
                              className="px-3 py-1.5 text-xs font-semibold rounded border transition text-green-600 border-green-200 bg-green-50 hover:bg-green-100 hover:border-green-300"
                            >
                              Approve
                            </button>

                            <button
                              onClick={(e) => { e.stopPropagation(); handleReject(item); }}
                              className="px-3 py-1.5 text-xs font-semibold rounded border transition text-red-500 border-red-200 bg-red-50 hover:bg-red-100 hover:border-red-300"
                            >
                              Reject
                            </button>
                            {/* Details button removed */}
                          </>
                        )}

                        {item.type === "Listing" && item.status !== "Pending" && item.status !== "Rejected" && (
                          <>
                            <button
                              onClick={(e) => { e.stopPropagation(); handlePublishToggle(item); }}
                              className={`px-3 py-1.5 text-xs font-semibold rounded border transition ${
                                item.status === "Published"
                                  ? "text-gray-600 border-gray-200 bg-gray-50 hover:bg-gray-100"
                                  : "text-green-600 border-green-200 bg-green-50 hover:bg-green-100"
                              }`}
                            >
                              {item.status === "Published" ? "Unpublish" : "Publish"}
                            </button>
                            {/* Details button removed */}
                          </>
                        )}

                        {item.status !== "Pending" && (item.status !== "Published" || item.type !== "Listing") && (
                          <span className="text-xs text-gray-400 italic px-2">No actions available</span>
                        )}                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="py-8 text-center text-gray-500 text-sm"
                  >
                    No approvals found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="grid gap-3 p-4 lg:hidden">
          {paginatedData.length > 0 ? (
            paginatedData.map((item) => (
              <div
                key={item.id}
                className="border border-gray-100 rounded-lg p-3 shadow-sm bg-white flex flex-col gap-3 cursor-pointer"
                onClick={() => navigate(`/approvals/${item.type.toLowerCase()}/${item.rawId}`)}
              >
                <div className="flex justify-between items-start gap-2">
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase rounded border ${getTypeStyle(item.type)}`}>
                    {getTypeIcon(item.type)}
                    {item.type}
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium ${getStatusStyle(item.status)}`}>
                    {item.status}
                  </span>
                </div>
                
                <div className="flex gap-3">
                  <div className={`w-12 h-12 flex items-center justify-center overflow-hidden shrink-0 rounded-md border border-gray-100 ${item.imageClass}`}>
                    {item.type === "Listing" && item.thumbnailImage ? (
                      <img src={item.thumbnailImage} alt={item.title} className="h-full w-full object-cover" />
                    ) : (
                      item.image
                    )}
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-sm font-semibold text-gray-900 line-clamp-2" title={item.title}>{item.title}</span>
                    <span className="text-xs text-gray-500 mt-1 truncate">{item.subtitle}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-50 text-xs">
                   <div className="flex flex-col">
                     <span className="text-gray-500">Submitted by</span>
                     <span className="font-medium text-gray-800 truncate max-w-[120px]">{item.submitter}</span>
                   </div>
                   <div className="flex flex-col text-right">
                     <span className="text-gray-800">{item.date}</span>
                     <span className="text-gray-500">{item.time}</span>
                   </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-50">
                  {item.status === "Pending" && (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleApprove(item); }}
                        className="px-3 py-1.5 text-xs font-semibold rounded border transition text-green-600 border-green-200 bg-green-50 hover:bg-green-100 hover:border-green-300 flex-1"
                      >
                        Approve
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleReject(item); }}
                        className="px-3 py-1.5 text-xs font-semibold rounded border transition text-red-500 border-red-200 bg-red-50 hover:bg-red-100 hover:border-red-300 flex-1"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {item.type === "Listing" && item.status !== "Pending" && item.status !== "Rejected" && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handlePublishToggle(item); }}
                      className={`px-3 py-1.5 text-xs font-semibold rounded border transition flex-1 ${
                        item.status === "Published"
                          ? "text-gray-600 border-gray-200 bg-gray-50 hover:bg-gray-100"
                          : "text-green-600 border-green-200 bg-green-50 hover:bg-green-100"
                      }`}
                    >
                      {item.status === "Published" ? "Unpublish" : "Publish"}
                    </button>
                  )}
                  {item.status !== "Pending" && (item.status !== "Published" || item.type !== "Listing") && (
                    <span className="text-xs text-gray-400 italic px-2">No actions available</span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-gray-500 text-sm border border-gray-100 rounded-lg bg-gray-50">
              No approvals found.
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-gray-100">
          <span className="text-[13px] text-gray-500 text-center sm:text-left">
            Showing {filteredData.length > 0 ? startIndex + 1 : 0} to {Math.min(endIndex, filteredData.length)} of {filteredData.length} approvals
          </span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1} className={`w-6 h-6 flex items-center justify-center border border-gray-300 ${currentPage === 1 ? "text-gray-300 cursor-not-allowed" : "text-gray-600 hover:bg-gray-50 cursor-pointer"}`}>
                <ChevronLeft size={16} />
              </button>
              {getPageNumbers().map((page, index) => page === "..." ? (
                <span key={`dots-${index}`} className="w-6 h-6 flex items-center justify-center text-gray-400">...</span>
              ) : (
                <button key={page} onClick={() => setCurrentPage(page)} className={`w-6 h-6 flex items-center justify-center text-xs font-medium ${currentPage === page ? "border border-transparent bg-[#4f6bff] text-white" : "border border-gray-300 text-gray-600 hover:bg-gray-50 cursor-pointer"}`}>{page}</button>
              ))}
              <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0} className={`w-6 h-6 flex items-center justify-center border border-gray-300 ${currentPage === totalPages || totalPages === 0 ? "text-gray-300 cursor-not-allowed" : "text-gray-600 hover:bg-gray-50 cursor-pointer"}`}>
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

export default Approvals;
