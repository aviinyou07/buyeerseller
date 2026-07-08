import React, { useState, useEffect } from "react";
import {
  Landmark,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  Plus,
  ExternalLink,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  X,
  Trash2
} from "lucide-react";
import { api } from "../utils/api";
const Schemes = () => {
  // Master Schemes Data State
  const [schemesData, setSchemesData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Add Scheme Modal Form State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newScheme, setNewScheme] = useState({
    name: "",
    department: "", // Kept in form for UI consistency but description-prepended
    category_id: "",
    description: "",
    eligibility: "",
    link: "",
    start_date: new Date().toISOString().split("T")[0],
    deadline: ""
  });

  // Extend Date Modal State
  const [isExtendModalOpen, setIsExtendModalOpen] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [extendedDate, setExtendedDate] = useState("");

  const getComputedStatus = (endDateString) => {
    if (!endDateString) return "Active";
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(endDateString);
    end.setHours(0, 0, 0, 0);
    
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return "Expired";
    } else if (diffDays <= 30) {
      return "Expiring Soon";
    }
    return "Active";
  };

  const getLinkForScheme = (title, description) => {
    const match = description?.match(/Link:\s*(https?:\/\/[^\s]+)/i);
    if (match) return match[1];
    if (title?.toLowerCase().includes("kisan")) return "https://pmkisan.gov.in/";
    if (title?.toLowerCase().includes("solar")) return "https://pmkusum.mnre.gov.in/";
    return `https://www.google.com/search?q=${encodeURIComponent(title || "Government Scheme")}`;
  };

  const extractCleanDescription = (description) => {
    if (!description) return "";
    return description.split("\n\nLink:")[0];
  };

  // Helper colors mapping for categories
  const getCategoryAvatarStyles = (category) => {
    const colors = {
      Agriculture: { bg: "bg-green-100", text: "text-green-600" },
      Seeds: { bg: "bg-green-50", text: "text-green-500" },
      Fertilizers: { bg: "bg-emerald-100", text: "text-emerald-600" },
      Equipment: { bg: "bg-amber-100", text: "text-amber-600" },
      Electronics: { bg: "bg-blue-100", text: "text-blue-600" },
      Mobile: { bg: "bg-blue-50", text: "text-blue-500" },
      Laptop: { bg: "bg-indigo-100", text: "text-indigo-600" },
      Accessories: { bg: "bg-violet-100", text: "text-violet-600" },
    };
    return colors[category] || { bg: "bg-gray-100", text: "text-gray-600" };
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Fetch categories
      const catRes = await api.get("/categories?limit=100");
      let catsList = [];
      if (catRes.success) {
        catsList = catRes.data?.items || catRes.data || [];
        setCategories(catsList);
      }

      // Fetch schemes
      const schemesRes = await api.get("/government-schemes?limit=1000");
      if (schemesRes.success) {
        const schemesItems = schemesRes.data?.items || schemesRes.data || [];
        const mapped = schemesItems.map(gs => {
          const catName = gs.category?.name || catsList.find(c => c.id === gs.category_id)?.name || "Agriculture";
          const status = getComputedStatus(gs.end_date);
          const styles = getCategoryAvatarStyles(catName);
          
          return {
            id: gs.id,
            name: gs.title,
            category_id: gs.category_id,
            category: catName,
            avatarBg: styles.bg,
            avatarText: styles.text,
            description: extractCleanDescription(gs.description),
            eligibility: gs.eligibility || "",
            link: getLinkForScheme(gs.title, gs.description),
            addedOn: gs.start_date ? gs.start_date.split("T")[0] : "",
            deadline: gs.end_date ? gs.end_date.split("T")[0] : "",
            status: status,
          };
        });
        setSchemesData(mapped);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load government schemes data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalCount = schemesData.length;
  const activeCount = schemesData.filter(s => s.status === "Active").length;
  const expiringCount = schemesData.filter(s => s.status === "Expiring Soon").length;
  const expiredCount = schemesData.filter(s => s.status === "Expired").length;

  const stats = [
    {
      id: 1,
      title: "Total Schemes",
      value: totalCount.toString(),
      icon: <Landmark size={22} className="text-[#4f6bff]" />,
      cardBg: "bg-gradient-to-br from-[#f5f7ff] via-[#eef2ff] to-[#e0e7ff]",
      iconBg: "bg-gradient-to-br from-[#dbe5ff] to-[#eef2ff]",
    },
    {
      id: 2,
      title: "Active Schemes",
      value: activeCount.toString(),
      icon: <CheckCircle2 size={22} className="text-green-600" />,
      cardBg: "bg-gradient-to-br from-[#f1fff7] via-[#e8fff1] to-[#dff7e8]",
      iconBg: "bg-gradient-to-br from-[#ccf5db] to-[#e9fff1]",
    },
    {
      id: 3,
      title: "Expiring Soon",
      value: expiringCount.toString(),
      icon: <Clock size={22} className="text-orange-500" />,
      cardBg: "bg-gradient-to-br from-[#fffaf0] via-[#fff4df] to-[#ffe8bf]",
      iconBg: "bg-gradient-to-br from-[#ffe3ad] to-[#fff1d1]",
    },
    {
      id: 4,
      title: "Closed/Expired",
      value: expiredCount.toString(),
      icon: <XCircle size={22} className="text-red-600" />,
      cardBg: "bg-gradient-to-br from-[#fff5f5] via-[#ffeded] to-[#ffe4e4]",
      iconBg: "bg-gradient-to-br from-[#ffd6d6] to-[#ffeded]",
    },
  ];

  const filteredSchemes = schemesData.filter((scheme) => {
    const matchesSearch =
      scheme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (scheme.description || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (scheme.category || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "All Status" || scheme.status === statusFilter;

    const matchesCategory =
      categoryFilter === "All Categories" || scheme.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredSchemes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSchemes = filteredSchemes.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, categoryFilter]);

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
    categoryFilter !== "All Categories" && setCategoryFilter("All Categories");
    setCurrentPage(1);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-700 border border-green-200";
      case "Expiring Soon":
        return "bg-orange-100 text-orange-700 border border-orange-200";
      case "Expired":
        return "bg-red-100 text-red-700 border border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border border-gray-200";
    }
  };

  // Format date to readable format for view
  const formatDisplayDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Add Scheme Submission
  const handleAddSchemeSubmit = async (e) => {
    e.preventDefault();
    if (!newScheme.category_id) {
      alert("Please select a category");
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(newScheme.start_date);
    start.setHours(0, 0, 0, 0);
    const scheme_type = start > today ? 'upcoming' : 'current';

    // Format final description by prepending department and appending link
    let finalDesc = "";
    if (newScheme.department) {
      finalDesc += `[Department: ${newScheme.department}] `;
    }
    finalDesc += newScheme.description;
    if (newScheme.link) {
      finalDesc += `\n\nLink: ${newScheme.link}`;
    }

    try {
      setLoading(true);
      const payload = {
        category_id: parseInt(newScheme.category_id, 10),
        title: newScheme.name,
        description: finalDesc,
        eligibility: newScheme.eligibility,
        scheme_type,
        start_date: newScheme.start_date,
        end_date: newScheme.deadline || null
      };

      const res = await api.post("/government-schemes", payload);
      if (res.success) {
        setIsAddModalOpen(false);
        setNewScheme({
          name: "",
          department: "",
          category_id: "",
          description: "",
          eligibility: "",
          link: "",
          start_date: new Date().toISOString().split("T")[0],
          deadline: ""
        });
        loadData();
      } else {
        alert(res.message || "Failed to create scheme");
      }
    } catch (err) {
      console.error(err);
      alert("Error creating scheme");
    } finally {
      setLoading(false);
    }
  };

  // Handle opening Extend Date Popup
  const openExtendModal = (scheme) => {
    setSelectedScheme(scheme);
    setExtendedDate(scheme.deadline);
    setIsExtendModalOpen(true);
  };

  // Update scheme deadline date
  const handleExtendSubmit = async (e) => {
    e.preventDefault();
    if (!selectedScheme) return;

    try {
      setLoading(true);
      const res = await api.put(`/government-schemes/${selectedScheme.id}`, {
        end_date: extendedDate
      });
      if (res.success) {
        setIsExtendModalOpen(false);
        setSelectedScheme(null);
        loadData();
      } else {
        alert(res.message || "Failed to extend deadline");
      }
    } catch (err) {
      console.error(err);
      alert("Error extending deadline");
    } finally {
      setLoading(false);
    }
  };

  // Delete scheme
  const handleDeleteScheme = async (id) => {
    if (!window.confirm("Are you sure you want to delete this government scheme?")) return;
    try {
      setLoading(true);
      const res = await api.delete(`/government-schemes/${id}`);
      if (res.success) {
        loadData();
      } else {
        alert(res.message || "Failed to delete scheme");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting scheme");
    } finally {
      setLoading(false);
    }
  };

  if (isAddModalOpen) {
    return (
      <div className="space-y-6 w-full mx-auto animate-[fadeIn_.2s_ease] text-left">
        {/* Header with Back button */}
        <div className="flex items-center gap-4 bg-white p-4 border border-gray-200 rounded-sm shadow-sm">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(false)}
            className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 transition"
          >
            <X size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Create New Government Scheme</h1>
            <p className="text-xs text-gray-500">Publish a new welfare scheme for marketplace sellers and buyers.</p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
          <form onSubmit={handleAddSchemeSubmit} className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">Scheme Name</label>
              <input 
                type="text" 
                required
                placeholder="e.g. Pradhan Mantri Kisan Samman Nidhi"
                value={newScheme.name}
                onChange={(e) => setNewScheme({...newScheme, name: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 text-gray-900 font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">Department / Ministry</label>
                <input 
                  type="text" 
                  placeholder="e.g. Ministry of Agriculture"
                  value={newScheme.department}
                  onChange={(e) => setNewScheme({...newScheme, department: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 text-gray-900 font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">Category</label>
                <select
                  required
                  value={newScheme.category_id}
                  onChange={(e) => setNewScheme({...newScheme, category_id: e.target.value})}
                  className="w-full border border-gray-300 bg-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 text-gray-700 font-medium"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">Description</label>
              <textarea 
                rows="4"
                required
                placeholder="Describe the scheme benefits, eligibility criteria, and details..."
                value={newScheme.description}
                onChange={(e) => setNewScheme({...newScheme, description: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 resize-none text-gray-900 font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">Eligibility</label>
              <textarea 
                rows="3"
                placeholder="Who can apply for this scheme?"
                value={newScheme.eligibility}
                onChange={(e) => setNewScheme({...newScheme, eligibility: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 resize-none text-gray-900 font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">Official Scheme Website URL</label>
              <input 
                type="url" 
                placeholder="https://example.gov.in"
                value={newScheme.link}
                onChange={(e) => setNewScheme({...newScheme, link: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 text-gray-900 font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">Start Date</label>
                <input 
                  type="date" 
                  required
                  value={newScheme.start_date}
                  onChange={(e) => setNewScheme({...newScheme, start_date: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 cursor-pointer text-gray-700 font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">Application Deadline</label>
                <input 
                  type="date" 
                  required
                  value={newScheme.deadline}
                  onChange={(e) => setNewScheme({...newScheme, deadline: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 cursor-pointer text-gray-700 font-medium"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex items-center justify-end gap-3">
              <button 
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-5 py-2.5 text-sm border border-gray-300 rounded-xl hover:bg-gray-50 text-gray-600 transition font-medium"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-sm"
              >
                Save Scheme
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {stats.map((item) => (
          <div
            key={item.id}
            className={`
              ${item.cardBg}
              rounded-lg
              border
              border-white/60
              p-3
              shadow-sm flex items-start justify-between
            `}
          >
            <div>
              <h3 className="text-[13px] text-gray-600 font-medium">
                {item.title}
              </h3>
              <h1 className="text-3xl font-bold text-gray-900 leading-none mt-3">
                {item.value}
              </h1>
            </div>
            <div
              className={`
                w-[48px]
                h-[48px]
                rounded-xl
                flex
                items-center
                justify-center
                ${item.iconBg}
              `}
            >
              {item.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Main Container */}
      <div className="bg-white border text-gray-800 border-gray-200 shadow-sm">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between p-3 sm:p-4 md:px-5 md:py-3 border-b border-gray-100 gap-3">
          <h2 className="text-[18px] font-semibold text-[#111827]">Government Schemes</h2>
          <div className="w-full lg:w-auto flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:w-[260px]">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search schemes, description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center justify-end w-full sm:w-auto gap-2 shrink-0">
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-sm bg-[#4f6bff] text-white rounded hover:bg-blue-600 transition font-medium whitespace-nowrap"
              >
                <Plus size={16} /> Add Scheme
              </button>
            </div>
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-end gap-5 p-4 md:px-5 md:py-3 border-b border-gray-100">
          <div className="flex flex-col gap-1.5 w-full sm:w-auto">
            <label className="text-sm text-gray-700 font-medium">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 bg-white rounded outline-none focus:ring-1 focus:ring-blue-700 sm:w-[150px] text-gray-700"
            >
              <option value="All Status">All Status</option>
              <option value="Active">Active</option>
              <option value="Expiring Soon">Expiring Soon</option>
              <option value="Expired">Expired</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5 w-full sm:w-auto">
            <label className="text-sm text-gray-700 font-medium">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 bg-white rounded outline-none focus:ring-1 focus:ring-blue-500 sm:w-[170px] text-gray-700"
            >
              <option value="All Categories">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className="w-full sm:w-auto">
            <button
              onClick={handleReset}
              className="px-4 py-2 text-sm border border-gray-300 bg-white rounded hover:bg-gray-50 text-gray-600 transition font-medium"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Table Section */}
        <div className="w-full max-w-full overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
          <table className="min-w-[1100px] w-full whitespace-nowrap">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left py-3 px-5 text-sm text-gray-800 font-semibold">Scheme Info</th>
                <th className="text-left py-3 px-5 text-sm text-gray-800 font-semibold">Description & Link</th>
                <th className="text-left py-3 px-5 text-sm text-gray-800 font-semibold">Timelines</th>
                <th className="text-left py-3 px-5 text-sm text-gray-800 font-semibold">Status</th>
                <th className="text-left py-3 px-5 text-sm text-gray-800 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-500 text-sm">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-[#4f6bff] border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading government schemes...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-red-500 text-sm">
                    {error}
                  </td>
                </tr>
              ) : paginatedSchemes.length > 0 ? (
                paginatedSchemes.map((scheme) => (
                  <tr
                    key={scheme.id}
                    className="border-b border-gray-100 last:border-none hover:bg-gray-50/50"
                  >
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-semibold ${scheme.avatarBg} ${scheme.avatarText}`}
                        >
                          <Landmark size={18} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-gray-900 max-w-[200px] truncate" title={scheme.name}>
                            {scheme.name}
                          </span>
                          <span className="text-[12px] text-gray-500">
                            {scheme.category}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-5">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-sm text-gray-600 truncate max-w-[280px]" title={scheme.description}>
                          {scheme.description}
                        </span>
                        <a 
                          href={scheme.link} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="flex items-center gap-1 text-[12px] font-medium text-blue-600 hover:text-blue-700 w-fit"
                        >
                          <ExternalLink size={12} /> View Official Site
                        </a>
                      </div>
                    </td>
                    <td className="py-3 px-5">
                      <div className="flex flex-col gap-1">
                        <span className="text-[12px] text-gray-500">Start: {formatDisplayDate(scheme.addedOn)}</span>
                        <span className="text-sm font-medium text-gray-900 flex items-center gap-1">
                           End: {formatDisplayDate(scheme.deadline)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-5">
                      <span
                        className={`text-[12px] px-2.5 py-1 font-medium rounded-sm ${getStatusStyle(
                          scheme.status
                        )}`}
                      >
                        {scheme.status}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-center">
                      <button 
                        onClick={() => openExtendModal(scheme)}
                        className="px-3 py-1.5 text-xs font-semibold text-blue-600 border border-blue-200 bg-blue-50 hover:bg-blue-100 transition inline-flex items-center gap-1.5 rounded"
                      >
                        <CalendarDays size={14} />
                        Extend Date
                      </button>
                      <button 
                        onClick={() => handleDeleteScheme(scheme.id)}
                        className="px-3 py-1.5 text-xs font-semibold text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 transition inline-flex items-center gap-1.5 rounded ml-2"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-500 text-sm">
                    No schemes found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-gray-100">
          <span className="text-[13px] text-gray-500 text-center sm:text-left">
            Showing {filteredSchemes.length > 0 ? startIndex + 1 : 0} to {Math.min(endIndex, filteredSchemes.length)} of {filteredSchemes.length} schemes
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

      {/* 2. Extend Date Overlay Calendar Modal */}
      {isExtendModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-sm shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 border border-gray-100">
            <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 bg-gray-50">
              <h3 className="text-sm font-bold text-gray-800">Extend Scheme Deadline</h3>
              <button 
                onClick={() => setIsExtendModalOpen(false)}
                className="text-gray-400 hover:bg-gray-200 p-1 rounded-full transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            
            <form onSubmit={handleExtendSubmit} className="p-3 space-y-3">
              <div>
                <p className="text-xs text-gray-500">Scheme Name</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5 truncate">{selectedScheme?.name}</p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">Select New Deadline Date</label>
                <input 
                  type="date"
                  required
                  value={extendedDate}
                  onChange={(e) => setExtendedDate(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-gray-700 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
                <button 
                  type="button"
                  onClick={() => setIsExtendModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-medium border border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                >
                  Update Timeline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Schemes;
