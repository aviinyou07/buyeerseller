import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, MapPin, Tag, Box, Info, CheckCircle, XCircle, Store, User, Camera, Calendar, DollarSign, Image as ImageIcon, Phone } from 'lucide-react';
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

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {(!data.listing_status || data.listing_status === 'pending') && (
            <>
              <button
                onClick={handleReject}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-red-600 border border-red-200 hover:bg-red-50 font-semibold rounded-lg transition-all shadow-sm text-sm"
              >
                <XCircle size={14} /> Reject
              </button>
              <button
                onClick={handleApprove}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white border border-transparent hover:bg-blue-700 font-semibold rounded-lg transition-all shadow-sm text-sm"
              >
                <CheckCircle size={14} /> Approve
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Layout Grid (2/3 and 1/3 split) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
        
        {/* Left Column (Main Content) - Takes 2 of 3 columns */}
        <div className="lg:col-span-2 space-y-2">
          
          {/* Image Gallery */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-3 border-b border-gray-100 flex items-center gap-1.5">
              <ImageIcon size={14} className="text-gray-400" />
              <h2 className="text-sm font-semibold text-gray-800">Media Gallery ({images.length})</h2>
            </div>
            
            <div className="p-4 bg-gray-50 flex flex-col items-center">
              {/* Main Image */}
              <div className="w-full max-w-lg aspect-[4/3] max-h-[350px] bg-white rounded-lg shadow-sm border border-gray-200 p-1 flex items-center justify-center relative">
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
                      className={`flex-shrink-0 w-14 h-14 rounded-md overflow-hidden border transition-all ${
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

          {/* Description */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-3 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-800">Description</h2>
            </div>
            <div className="p-4">
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                {data.description || <span className="italic text-gray-400">No description provided.</span>}
              </p>
            </div>
          </div>
          
        </div>

        {/* Right Column (Sidebar) - Takes 1 of 3 columns */}
        <div className="space-y-2">
          
          {/* Pricing & Key Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-white p-4 border-b border-gray-100">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Asking Price</p>
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                {data.price ? `₹${Number(data.price).toLocaleString('en-IN')}` : 'N/A'}
              </h2>
            </div>
            <div className="p-0">
              <div className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-50">
                <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-gray-500"><Tag size={12} /></div>
                <div>
                  <p className="text-[10px] text-gray-500 font-medium">Brand</p>
                  <p className="text-xs font-semibold text-gray-900">{data.brand || 'Unspecified'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-50">
                <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-gray-500"><MapPin size={12} /></div>
                <div>
                  <p className="text-[10px] text-gray-500 font-medium">Location</p>
                  <p className="text-xs font-semibold text-gray-900">{data.location || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 px-4 py-3">
                <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-gray-500"><Calendar size={12} /></div>
                <div>
                  <p className="text-[10px] text-gray-500 font-medium">Posted Date</p>
                  <p className="text-xs font-semibold text-gray-900">
                    {new Date(data.created_at || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Specifications */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-3 border-b border-gray-100 flex items-center gap-1.5">
              <Box size={14} className="text-gray-400" />
              <h2 className="text-sm font-semibold text-gray-800">Specifications</h2>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                  <p className="text-[10px] text-gray-500 mb-0.5">Condition</p>
                  <p className="text-xs font-semibold text-gray-900">{data.condition || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                  <p className="text-[10px] text-gray-500 mb-0.5">Warranty</p>
                  <p className="text-xs font-semibold text-gray-900">{data.warranty || 'None'}</p>
                </div>
                <div className="col-span-2 bg-gray-50 p-2 rounded-lg border border-gray-100">
                  <p className="text-[10px] text-gray-500 mb-0.5">Used For</p>
                  <p className="text-xs font-semibold text-gray-900">{data.used_for || data.usedFor || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                  <p className="text-[10px] text-gray-500 mb-0.5">Quantity</p>
                  <p className="text-xs font-semibold text-gray-900">{data.quantity || '1'}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                  <p className="text-[10px] text-gray-500 mb-0.5">Views</p>
                  <p className="text-xs font-semibold text-gray-900">{data.views_count || '0'}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                  <p className="text-[10px] text-gray-500 mb-0.5">Likes</p>
                  <p className="text-xs font-semibold text-gray-900">{data.likes_count || '0'}</p>
                </div>
              </div>

              {data.custom_attributes && data.custom_attributes.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Other Details</p>
                  {data.custom_attributes.map((attr, idx) => (
                    <div key={idx} className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0 text-xs">
                      <span className="text-gray-500 capitalize">{attr.label || attr.key}</span>
                      <span className="font-semibold text-gray-900 max-w-[60%] text-right truncate" title={attr.value}>{attr.value || 'N/A'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Customer Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-3 border-b border-gray-100 flex items-center gap-1.5">
              <User size={14} className="text-gray-400" />
              <h2 className="text-sm font-semibold text-gray-800">Customer</h2>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                  {data.seller?.user?.full_name?.charAt(0) || data.seller?.business_name?.charAt(0) || 'S'}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">
                    {data.seller?.user?.full_name || data.seller?.business_name || 'Unknown'}
                  </p>
                  <p className="text-[10px] text-gray-500 bg-gray-100 inline-block px-1.5 py-0.5 rounded mt-0.5 font-medium">
                    {data.seller?.business_name ? 'Business' : 'Individual'}
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                {data.seller?.business_name && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Store size={12} className="text-gray-400" />
                    <span className="truncate">{data.seller.business_name}</span>
                  </div>
                )}
                {data.seller?.gst_number && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <span className="w-3 h-3 flex items-center justify-center bg-gray-200 text-gray-500 rounded text-[8px] font-bold">G</span>
                    <span className="truncate">GST: {data.seller.gst_number}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="w-3 h-3 flex items-center justify-center bg-gray-200 text-gray-500 rounded-full text-[8px] font-bold">@</div>
                  <span className="truncate">{data.seller?.user?.email || 'No email provided'}</span>
                </div>
                {data.seller?.user?.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone size={12} className="text-gray-400" />
                    <span>{data.seller.user.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ApprovalDetails;
