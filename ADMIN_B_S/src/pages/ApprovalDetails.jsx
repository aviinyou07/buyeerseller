import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, FileText, MapPin, Tag, Box, Info } from 'lucide-react';
import { api } from '../utils/api';

const ApprovalDetails = () => {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        if (type === 'listing') {
          // Assume the API to get a single listing is /listings/:id
          // or /listing-approvals/:id depending on the backend, let's try /listings/:id first
          const res = await api.get(`/listings/${id}`);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-500 p-6 rounded-lg shadow-sm border border-red-100 flex flex-col items-center gap-4">
        <Info size={32} />
        <h2 className="text-xl font-semibold">{error}</h2>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-white text-red-600 border border-red-200 rounded hover:bg-red-50 transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Listing Details</h1>
          <p className="text-sm text-gray-500">#{type.toUpperCase()}-{id}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Images & Core Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-6">
            <div className="aspect-video w-full rounded-lg overflow-hidden bg-gray-100 mb-6">
              {data.images && data.images.length > 0 ? (
                <img
                  src={getListingImageUrl(data.images.find(img => img.is_thumbnail)?.image_url || data.images[0].image_url)}
                  alt={data.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No Image Available
                </div>
              )}
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{data.title}</h2>
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
              <span className="flex items-center gap-1"><Tag size={16} /> {data.brand || 'No Brand'}</span>
              <span className="flex items-center gap-1"><MapPin size={16} /> {data.location || 'No Location'}</span>
              <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md font-medium text-xs border border-blue-100">
                {data.condition || 'Used'}
              </span>
            </div>
            
            <div className="prose max-w-none">
              <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <FileText size={18} /> Description
              </h3>
              <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
                {data.description || 'No description provided.'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column - Pricing, Seller, Status */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl shadow-sm p-6 text-white">
            <p className="text-blue-100 text-sm font-medium mb-1">Pricing</p>
            <h2 className="text-4xl font-bold mb-4">
              {data.price ? `₹${Number(data.price).toLocaleString()}` : 'N/A'}
            </h2>
            <div className="w-full h-px bg-white/20 mb-4"></div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-blue-100">Category</span>
              <span className="font-semibold">{data.category?.name || 'N/A'}</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Box size={18} /> Product Metadata
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-50 text-sm">
                <span className="text-gray-500">Warranty</span>
                <span className="font-medium text-gray-900">{data.warranty || 'None'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-50 text-sm">
                <span className="text-gray-500">Condition</span>
                <span className="font-medium text-gray-900">{data.condition || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-50 text-sm">
                <span className="text-gray-500">Used For</span>
                <span className="font-medium text-gray-900">{data.used_for || data.usedFor || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-50 text-sm">
                <span className="text-gray-500">Status</span>
                <span className={`font-medium px-2 py-0.5 rounded ${
                  data.listing_status === 'approved' ? 'bg-green-100 text-green-700' :
                  data.listing_status === 'rejected' ? 'bg-red-100 text-red-700' :
                  'bg-orange-100 text-orange-700'
                }`}>
                  {data.listing_status ? data.listing_status.toUpperCase() : 'PENDING'}
                </span>
              </div>
              
              {/* Dynamic Custom Attributes */}
              {data.custom_attributes && data.custom_attributes.length > 0 && data.custom_attributes.map((attr, idx) => (
                <div key={idx} className="flex justify-between py-2 border-b border-gray-50 text-sm">
                  <span className="text-gray-500 capitalize">{attr.label || attr.key}</span>
                  <span className="font-medium text-gray-900">{attr.value || 'N/A'}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Seller Information</h3>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xl">
                {data.seller?.user?.full_name?.charAt(0) || data.seller?.business_name?.charAt(0) || 'S'}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{data.seller?.user?.full_name || data.seller?.business_name || 'Unknown Seller'}</p>
                <p className="text-sm text-gray-500">{data.seller?.business_name || 'Individual Seller'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApprovalDetails;
