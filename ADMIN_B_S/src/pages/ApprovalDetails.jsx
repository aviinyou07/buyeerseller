import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, MapPin, Tag, Box, Info, CheckCircle, XCircle, Store, User, Camera, Calendar, DollarSign, Image as ImageIcon, Phone, Ban, Trash2, Edit, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../utils/api';
import { useConfirm } from '../contexts/ConfirmContext';

const ApprovalDetails = () => {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        if (type === 'listing') {
          const res = await api.get(`/listing-approvals/${id}/details`);
          if (res.success) {
            setData(res.product || res.listing || res.data);
          } else {
            setError(res.message || 'Failed to fetch details');
          }
        } else {
          setError(`Details view for ${type} is not implemented yet.`);
        }
      } catch (err) {
        console.error(err);
        setError('Error fetching details.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [type, id]);

  const getListingImageUrl = (url) => {
    if (!url) return 'https://via.placeholder.com/600x400?text=No+Image';
    if (/^(https?:)?\/\//.test(url) || url.startsWith('data:')) {
      return url;
    }
    return url.startsWith('/') ? url : `/${url}`;
  };

  const handleApprove = async () => {
    const confirmed = await confirm("Approve this listing?");
    if (!confirmed) return;
    try {
      await api.post(`/listing-approvals/${id}/moderate`, { action: "approved", remarks: "Approved by Admin" });
      toast.success("Listing approved successfully.");
      navigate(-1);
    } catch (err) {
      toast.error(err.message || "Failed to approve listing");
    }
  };

  const handleReject = async () => {
    const confirmed = await confirm("Reject this listing?");
    if (!confirmed) return;
    try {
      await api.post(`/listing-approvals/${id}/moderate`, { action: "rejected", remarks: "Rejected by Admin" });
      toast.success("Listing rejected successfully.");
      navigate(-1);
    } catch (err) {
      toast.error(err.message || "Failed to reject listing");
    }
  };

  const handleBlock = async () => {
    const confirmed = await confirm("Block this listing?");
    if (!confirmed) return;
    try {
      await api.post(`/listing-approvals/${id}/moderate`, { action: "blocked", remarks: "Blocked by Admin" });
      toast.success("Listing blocked successfully.");
      navigate(-1);
    } catch (err) {
      toast.error(err.message || "Failed to block listing");
    }
  };

  const handleRemove = async () => {
    const confirmed = await confirm("Remove this listing?");
    if (!confirmed) return;
    try {
      await api.post(`/listing-approvals/${id}/moderate`, { action: "removed", remarks: "Removed by Admin" });
      toast.success("Listing removed successfully.");
      navigate(-1);
    } catch (err) {
      toast.error(err.message || "Failed to remove listing");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-500 p-6 rounded-lg shadow-sm border border-red-100 flex flex-col items-center gap-3 max-w-sm mx-auto mt-12">
        <Info size={32} className="text-red-400" />
        <h2 className="text-base font-semibold text-center">{error}</h2>
        <button
          onClick={() => navigate(-1)}
          className="mt-2 px-4 py-1.5 bg-white text-red-600 font-medium border border-red-200 rounded hover:bg-red-50 transition-all text-sm"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!data) return null;

  const images = data.images && data.images.length > 0 
    ? data.images.sort((a, b) => (b.is_thumbnail ? 1 : 0) - (a.is_thumbnail ? 1 : 0)) 
    : [];

  return (
    <div className="space-y-4 pb-12 mx-auto">
      
      {/* Top Action Bar (Sticky) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white px-5 py-3 rounded-xl shadow-sm border border-gray-200 sticky top-2 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-gray-900 leading-tight line-clamp-1">{data.title}</h1>
              {data.listing_status === 'approved' && <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded">Approved</span>}
              {data.listing_status === 'rejected' && <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold uppercase rounded">Rejected</span>}
              {(!data.listing_status || data.listing_status === 'pending') && <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-[10px] font-bold uppercase rounded">Pending</span>}
            </div>
            <p className="text-xs text-gray-500 font-medium mt-0.5 flex items-center gap-1.5">
              <span>Ref: #{type.toUpperCase()}-{id}</span>
              <span className="text-gray-300">•</span>
              <span>{data.category?.name || 'Uncategorized'}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Main Layout Grid (1/4 and 3/4 split) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-2 items-start">
        
        {/* Left Column (Image & Description) - Takes 1 of 4 columns */}
        <div className="lg:col-span-1 space-y-4">
          
          {/* Image Gallery */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-3 border-b border-gray-100 flex items-center gap-1.5">
              <ImageIcon size={14} className="text-gray-400" />
              <h2 className="text-sm font-semibold text-gray-800">Media Gallery ({images.length})</h2>
            </div>
            
            <div className="p-4 bg-gray-50 flex flex-col items-center">
              {/* Main Image */}
              <div className="w-full aspect-[4/3] bg-white rounded-lg shadow-sm border border-gray-200 p-1 flex items-center justify-center relative">
                {images.length > 0 ? (
                  <img
                    src={getListingImageUrl(images[currentImageIndex].image_url)}
                    alt={`${data.title}`}
                    className="w-full h-full object-contain rounded"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-400 gap-2">
                    <Camera size={32} className="opacity-30" />
                    <span className="text-xs font-medium">No Images</span>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 mt-4 overflow-x-auto pb-1 max-w-full scrollbar-hide">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`flex-shrink-0 w-10 h-10 rounded-md overflow-hidden border transition-all ${
                        currentImageIndex === idx ? 'border-blue-600 shadow-sm ring-1 ring-blue-100' : 'border-gray-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img 
                        src={getListingImageUrl(img.image_url)} 
                        alt="Thumbnail" 
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          
        </div>

        {/* Right Column (Consolidated Big Card) - Takes 3 of 4 columns */}
        <div className="lg:col-span-3">
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header / Pricing / Actions */}
            <div className="bg-gradient-to-r from-gray-50 to-white p-6 border-b border-gray-100 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Asking Price</p>
                <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                  {data.price ? `₹${Number(data.price).toLocaleString('en-IN')}` : 'N/A'}
                </h2>
              </div>
              
              {/* Action Buttons Inside Card */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => navigate('/all-listings', { state: { editProductId: data.id } })}
                  className="flex items-center gap-1.5 px-4 py-2 bg-white text-gray-700 border border-gray-200 hover:bg-gray-100 hover:text-blue-600 font-semibold rounded-lg transition-all shadow-sm text-sm"
                >
                  <Edit size={16} /> Edit
                </button>
                <button
                  onClick={handleRemove}
                  className="flex items-center gap-1.5 px-4 py-2 bg-white text-gray-700 border border-gray-200 hover:bg-gray-100 hover:text-red-600 font-semibold rounded-lg transition-all shadow-sm text-sm"
                >
                  <Trash2 size={16} /> Remove
                </button>
                <button
                  onClick={handleBlock}
                  className="flex items-center gap-1.5 px-4 py-2 bg-white text-gray-700 border border-gray-200 hover:bg-gray-100 hover:text-orange-600 font-semibold rounded-lg transition-all shadow-sm text-sm"
                >
                  <Ban size={16} /> Block
                </button>
                {(!data.listing_status || data.listing_status === 'pending') && (
                  <>
                    <button
                      onClick={handleReject}
                      className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 font-semibold rounded-lg transition-all shadow-sm text-sm"
                    >
                      <XCircle size={16} /> Reject
                    </button>
                    <button
                      onClick={handleApprove}
                      className="flex items-center gap-1.5 px-6 py-2 bg-green-600 text-white border border-transparent hover:bg-green-700 font-semibold rounded-lg transition-all shadow-sm text-sm"
                    >
                      <CheckCircle size={16} /> Approve
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Details Content Grid */}
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* Column 1: Basic Info */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Info size={14} /> Basic Details
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500 border border-gray-100 shrink-0"><Tag size={14} /></div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Brand</p>
                        <p className="text-sm font-semibold text-gray-900">{data.brand || 'Unspecified'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500 border border-gray-100 shrink-0"><MapPin size={14} /></div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Location</p>
                        <p className="text-sm font-semibold text-gray-900">{data.location || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500 border border-gray-100 shrink-0"><Calendar size={14} /></div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Posted Date</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {new Date(data.created_at || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <FileText size={14} /> Description
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                      {data.description || <span className="italic text-gray-400">No description provided.</span>}
                    </p>
                  </div>
                </div>
              </div>

              {/* Column 2: Product Details */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Box size={14} /> Product Details
                  </h3>
                  
                  {(data.custom_attributes || []).filter(attr => !String(attr.key || '').startsWith('custom_')).length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {(data.custom_attributes || []).filter(attr => !String(attr.key || '').startsWith('custom_')).map((field, idx) => (
                        <div key={`overview-${idx}`} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                          <p className="text-[10px] text-gray-500 mb-0.5 capitalize">{field.label || field.key}</p>
                          <p className="text-sm font-semibold text-gray-900">{field.value || 'N/A'}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center justify-center text-sm text-gray-400 italic">
                      No admin-defined fields found.
                    </div>
                  )}

                  {(data.custom_attributes || []).filter(attr => String(attr.key || '').startsWith('custom_')).length > 0 && (
                    <div className="mt-5">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <Tag size={14} /> Seller Custom Details
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        {(data.custom_attributes || []).filter(attr => String(attr.key || '').startsWith('custom_')).map((field, idx) => (
                          <div key={`custom-${idx}`} className="bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                            <p className="text-[10px] text-blue-500 mb-0.5 capitalize">{field.label || field.key}</p>
                            <p className="text-sm font-semibold text-gray-900">{field.value || 'N/A'}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Column 3: Customer Details */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <User size={14} /> Customer Profile
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
                      <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-sm">
                        {data.seller?.user?.full_name?.charAt(0) || data.seller?.business_name?.charAt(0) || 'S'}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-base">
                          {data.seller?.user?.full_name || data.seller?.business_name || 'Unknown'}
                        </p>
                        <p className="text-[10px] text-blue-700 bg-blue-100 inline-block px-2 py-0.5 rounded mt-1 font-bold uppercase tracking-wider">
                          {data.seller?.business_name ? 'Business' : 'Individual'}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 text-sm">
                      {data.seller?.business_name && (
                        <div className="flex items-center gap-3 text-gray-700">
                          <Store size={14} className="text-gray-400" />
                          <span className="truncate font-medium">{data.seller.business_name}</span>
                        </div>
                      )}
                      {data.seller?.gst_number && (
                        <div className="flex items-center gap-3 text-gray-700">
                          <div className="w-4 h-4 flex items-center justify-center bg-gray-200 text-gray-600 rounded text-[9px] font-bold">G</div>
                          <span className="truncate font-medium">GST: {data.seller.gst_number}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-3 text-gray-700">
                        <div className="w-4 h-4 flex items-center justify-center bg-gray-200 text-gray-600 rounded-full text-[9px] font-bold">@</div>
                        <span className="truncate font-medium">{data.seller?.user?.email || 'No email provided'}</span>
                      </div>
                      {data.seller?.user?.phone && (
                        <div className="flex items-center gap-3 text-gray-700">
                          <Phone size={14} className="text-gray-400" />
                          <span className="font-medium">{data.seller.user.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>


              </div>

            </div>

            {/* Interested Customers (Full Width) */}
            {data.interested_customers && data.interested_customers.length > 0 && (
              <div className="p-5 border-t border-gray-100 bg-white">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <User size={14} /> Interested Customers ({data.interested_customers.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {data.interested_customers.map((user, idx) => (
                    <div key={`customer-${idx}`} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200 shadow-sm transition-all hover:shadow-md hover:border-blue-200">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
                        {user.full_name?.charAt(0) || 'U'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 text-sm truncate">{user.full_name || 'Unknown User'}</p>
                        <p className="text-gray-500 text-xs truncate flex items-center gap-1 mt-0.5">
                          <Phone size={10} /> {user.phone || user.email || 'No contact info'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApprovalDetails;
