import React, { useState, useEffect } from "react";
import toast from 'react-hot-toast';
import { useNavigate } from "react-router-dom";
import { Users, Store, ClipboardList, Hourglass } from "lucide-react";
import { api } from "../utils/api";

const Dashboard = () => {
  const navigate = useNavigate();
  const [counters, setCounters] = useState(null);
  const [approvalsList, setApprovalsList] = useState([]);
  const [recentListingsList, setRecentListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [summaryRes, listingsRes] = await Promise.all([
          api.get("/dashboard/summary"),
          api.get("/listings?limit=5"),
        ]);

        if (summaryRes.success) {
          setCounters(summaryRes.data.counters);
          // Map backend pending listing requests to approval format
          const pendingRequests = (
            summaryRes.data.widgets.recentListingRequests || []
          ).map((item) => ({
            id: item.id,
            type: "Listing",
            title: item.title,
            user: item.seller_name,
            date: new Date(item.created_at).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }),
            status: "Pending",
          }));
          setApprovalsList(pendingRequests);
        }

        if (listingsRes.success) {
          const listingsList =
            listingsRes.data?.items || listingsRes.data || [];
          const formattedListings = listingsList.map((item) => ({
            id: item.id,
            image:
              item.main_image?.url ||
              "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=300",
            title: item.title,
            customer:
              item.seller?.user?.full_name ||
              item.seller?.business_name ||
              "Unknown Customer",
            status:
              item.listing_status === "approved"
                ? "Active"
                : item.listing_status === "pending"
                  ? "Pending"
                  : "Rejected",
            date: new Date(item.created_at).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }),
          }));
          setRecentListings(formattedListings);
        }
      } catch (err) {
        console.error("Dashboard load error: ", err);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const backendAction = newStatus === "Approved" ? "approved" : "rejected";
      await api.post(`/listing-approvals/${id}/moderate`, {
        action: backendAction,
        remarks: "Moderated from quick action dashboard panel.",
      });

      setApprovalsList((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: newStatus } : item,
        ),
      );
      toast.success("Listing status updated successfully");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to update listing status");
    }
  };

  const stats = [
    {
      id: 1,
      title: "Total Customers",
      value: counters ? Number(counters.totalUsers).toLocaleString() : "...",
      icon: <Users size={24} className="text-[#4f6bff]" />,
      cardBg: "bg-gradient-to-br from-[#f5f7ff] via-[#eef2ff] to-[#e0e7ff]",
      iconBg: "bg-gradient-to-br from-[#dbe5ff] to-[#eef2ff]",
      growthColor: "text-green-500",
    },
    {
      id: 3,
      title: "Total Listings",
      value: counters
        ? Number(
            (counters.approvedListings || 0) +
              (counters.pendingListings || 0) +
              (counters.rejectedListings || 0),
          ).toLocaleString()
        : "...",
      icon: <ClipboardList size={24} className="text-purple-600" />,
      cardBg: "bg-gradient-to-br from-[#faf5ff] via-[#f4ebff] to-[#eadcff]",
      iconBg: "bg-gradient-to-br from-[#eadcff] to-[#f4ebff]",
      growthColor: "text-green-500",
    },
    {
      id: 4,
      title: "Pending Approvals",
      value: counters
        ? Number(counters.pendingListings).toLocaleString()
        : "...",
      icon: <Hourglass size={24} className="text-orange-500" />,
      cardBg: "bg-gradient-to-br from-[#fffaf0] via-[#fff4df] to-[#ffe8bf]",
      iconBg: "bg-gradient-to-br from-[#ffe3ad] to-[#fff1d1]",
      growthColor: "text-orange-500",
    },
  ];

  // ======================================================
  // Status Styles
  // ======================================================

  const getStatusStyle = (status) => {
    switch (status) {
      case "Pending":
        return "bg-orange-100 text-orange-500";

      case "Approved":
        return "bg-green-100 text-green-600";

      case "Active":
        return "bg-green-100 text-green-600";

      case "Rejected":
        return "bg-red-100 text-red-500";

      default:
        return "";
    }
  };

  return (
    <div className="space-y-4">
      {/* ====================================================== */}
      {/* Stats Cards */}
      {/* ====================================================== */}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 mb-6">
        {stats.map((item) => (
          <div
            key={item.id}
            className={`${item.cardBg} rounded-xl border border-white/60 p-2 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-200`}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-[12px] sm:text-[14px] text-gray-600">{item.title}</h3>

                <h1
                  className="
                    text-[20px] sm:text-[30px]
                    leading-none
                    font-bold
                    mt-1 sm:mt-2
                    text-black
                  "
                >
                  {item.value}
                </h1>

                <p className={`mt-2 text-sm ${item.growthColor}`}>
                  {item.growth}
                </p>
              </div>

              <div
                className={`
                  w-[40px] h-[40px]
                  sm:w-[54px] sm:h-[54px]
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

      {/* ====================================================== */}
      {/* Pending Approvals */}
      {/* ====================================================== */}

      <div className="bg-white border border-gray-200 shadow-sm mt-6 w-full overflow-hidden">
        {/* Header */}
        <div
          className="
            flex
            items-center
            justify-between
            px-5
            py-2
            border-b
          "
        >
          <h2 className="text-[18px] font-semibold text-[#111827]">
            Pending Approvals
          </h2>

          <button
            onClick={() => navigate("/approvals")}
            className="
              px-4
              py-[7px]
              text-sm
              rounded-sm
              border border-gray-300
              text-[#4f6bff]
              font-medium
              hover:bg-[#4f6bff]
              hover:text-white
              transition-all
            "
          >
            View All
          </button>
        </div>

        {/* Table - Desktop */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full min-w-[800px] whitespace-nowrap">
            <thead>
              <tr className="border-b">
                <th
                  className="
                    text-left
                    py-3
                    px-5
                    text-[15px]
                    text-gray-700
                    font-medium
                  "
                >
                  Type
                </th>

                <th
                  className="
                    text-left
                    py-3
                    text-[15px]
                    text-gray-700
                    font-medium
                  "
                >
                  Title / Name
                </th>

                <th
                  className="
                    text-left
                    py-3
                    text-[15px]
                    text-gray-700
                    font-medium
                  "
                >
                  User
                </th>

                <th
                  className="
                    text-left
                    py-3
                    text-[15px]
                    text-gray-700
                    font-medium
                  "
                >
                  Submitted On
                </th>

                <th
                  className="
                    text-left
                    py-3
                    text-[15px]
                    text-gray-700
                    font-medium
                  "
                >
                  Status
                </th>

                <th
                  className="
                    text-left
                    py-3
                    text-[15px]
                    text-gray-700
                    font-medium
                  "
                >
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {approvalsList.map((item) => (
                <tr key={item.id} className="border-b last:border-none">
                  <td className="py-2 px-5 text-[14px]">
                    <span
                      className="
                        px-2
                        py-[2px]
                        rounded-sm
                        bg-blue-100
                        text-blue-600
                        text-[15px]
                        font-medium
                      "
                    >
                      {item.type}
                    </span>
                  </td>

                  <td className="py-2 text-sm text-gray-800" title={item.title}>
                    {item.title?.split(' ').length > 5 ? item.title.split(' ').slice(0, 5).join(' ') + '...' : item.title}
                  </td>

                  <td className="py-2 text-[14px] text-gray-800">
                    {item.user}
                  </td>

                  <td className="py-2 text-[14px] text-gray-700">
                    {item.date}
                  </td>

                  <td className="py-2">
                    <span
                      className={`
                        px-2
                        py-1
                        rounded-sm
                        text-[14px]
                        font-medium
                        ${getStatusStyle(item.status)}
                      `}
                    >
                      {item.status}
                    </span>
                  </td>

                  <td className="py-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStatusChange(item.id, "Approved")}
                        disabled={item.status === "Approved"}
                        className={`
                          px-2
                          text-sm
                          border
                          rounded-sm
                          transition-all
                          ${
                            item.status === "Approved"
                              ? "border-gray-300 text-gray-400 cursor-not-allowed"
                              : "border-green-500 text-green-600 hover:bg-green-500 hover:text-white"
                          }
                        `}
                      >
                        Approve
                      </button>

                      <button
                        onClick={() => handleStatusChange(item.id, "Rejected")}
                        disabled={item.status === "Rejected"}
                        className={`
                          px-4
                          py-[7px]
                          text-sm
                          border
                          rounded-sm
                          transition-all
                          ${
                            item.status === "Rejected"
                              ? "border-gray-300 text-gray-400 cursor-not-allowed"
                              : "border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                          }
                        `}
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards - Pending Approvals */}
        <div className="grid gap-3 p-4 lg:hidden">
          {approvalsList.map((item) => (
            <div key={item.id} className="border border-gray-100 rounded-lg p-3 space-y-3 shadow-sm bg-white">
              <div className="flex justify-between items-start gap-2">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-900 line-clamp-2">{item.title}</span>
                  <span className="text-xs text-gray-500 mt-1">{item.user} • {item.date}</span>
                </div>
                <span className={`px-2 py-1 rounded-sm text-[12px] font-medium whitespace-nowrap ${getStatusStyle(item.status)}`}>
                  {item.status}
                </span>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
                <span className="px-2 py-[2px] rounded-sm bg-blue-100 text-blue-600 text-xs font-medium">
                  {item.type}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleStatusChange(item.id, "Approved")}
                    disabled={item.status === "Approved"}
                    className={`px-3 py-1 text-xs border rounded-sm transition-all ${item.status === "Approved" ? "border-gray-300 text-gray-400 cursor-not-allowed" : "border-green-500 text-green-600 hover:bg-green-500 hover:text-white"}`}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleStatusChange(item.id, "Rejected")}
                    disabled={item.status === "Rejected"}
                    className={`px-3 py-1 text-xs border rounded-sm transition-all ${item.status === "Rejected" ? "border-gray-300 text-gray-400 cursor-not-allowed" : "border-red-500 text-red-500 hover:bg-red-500 hover:text-white"}`}
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ====================================================== */}
      {/* Recent Listings */}
      {/* ====================================================== */}

      <div
        className="
          bg-white
          border
          border-gray-200
          shadow-sm
          w-full
          overflow-hidden
        "
      >
        {/* Header */}
        <div
          className="
            flex
            items-center
            justify-between
            px-5
            py-2
            border-b
          "
        >
          <h2 className="text-md font-bold  text-black">Recent Listings</h2>

          <button
            onClick={() => navigate("/all-listings")}
            className="
              px-4
              py-[7px]
              text-sm
              rounded-sm
              border border-gray-300
              text-[#4f6bff]
              font-medium
              hover:bg-[#4f6bff]
              hover:text-white
              transition-all
            "
          >
            View All
          </button>
        </div>

        {/* Table - Desktop */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full min-w-[800px] whitespace-nowrap">
            <thead>
              <tr className="border-b">
                <th
                  className="
                    text-left
                    py-3
                    px-5
                    text-[15px]
                    text-gray-700
                    font-medium
                  "
                >
                  Title
                </th>

                <th
                  className="
                    text-left
                    py-3
                    text-[15px]
                    text-gray-700
                    font-medium
                  "
                >
                  Customer
                </th>

                <th
                  className="
                    text-left
                    py-3
                    text-[15px]
                    text-gray-700
                    font-medium
                  "
                >
                  Status
                </th>

                <th
                  className="
                    text-left
                    py-3
                    text-[15px]
                    text-gray-700
                    font-medium
                  "
                >
                  Date
                </th>
              </tr>
            </thead>

            <tbody>
              {recentListingsList.map((item) => (
                <tr key={item.id} className="border-b last:border-none">
                  <td className="py-2 px-5">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="
                          w-10
                          h-10
                          rounded-lg
                          object-cover
                        "
                      />

                      <span className="text-[14px] text-gray-700 font-medium" title={item.title}>
                        {item.title?.split(' ').length > 5 ? item.title.split(' ').slice(0, 5).join(' ') + '...' : item.title}
                      </span>
                    </div>
                  </td>

                  <td className="py-2 text-[14px] text-gray-700">
                    {item.customer}
                  </td>

                  <td className="py-2">
                    <span
                      className={`
                        px-2
                        py-1
                        rounded-sm
                        text-[14px]
                        font-medium
                        ${getStatusStyle(item.status)}
                      `}
                    >
                      {item.status}
                    </span>
                  </td>

                  <td className="py-2 text-[14px] text-gray-500">
                    {item.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards - Recent Listings */}
        <div className="grid gap-3 p-4 lg:hidden">
          {recentListingsList.map((item) => (
            <div key={item.id} className="border border-gray-100 rounded-lg p-3 shadow-sm bg-white flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <img src={item.image} alt={item.title} className="w-12 h-12 rounded-lg object-cover border border-gray-100 shadow-sm" />
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-sm font-semibold text-gray-900 truncate" title={item.title}>{item.title}</span>
                  <span className="text-xs text-gray-500 truncate">{item.customer}</span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                <span className="text-xs text-gray-500">{item.date}</span>
                <span className={`px-2 py-1 rounded-sm text-xs font-medium ${getStatusStyle(item.status)}`}>
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
