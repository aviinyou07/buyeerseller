const API_BASE_URL = "/api";

const getHeaders = () => {
  const headers = {
    "Content-Type": "application/json",
  };
  const token = localStorage.getItem("admin_token");

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `HTTP error! status: ${response.status}`);
  }

  return data;
};

export const USE_MOCK_PRODUCT_INSIGHTS = false;

export const mockProductInsights = [
  {
    product_id: 1,
    title: "iPhone 13",
    image: "",
    price: 42000,
    views_count: 120,
    likes_count: 35,
    reviews_count: 12,
    average_rating: 4.5,
    interested_count: 18,
  },
  {
    product_id: 2,
    title: "Samsung Galaxy Watch",
    image: "",
    price: 8500,
    views_count: 86,
    likes_count: 19,
    reviews_count: 6,
    average_rating: 4.2,
    interested_count: 9,
  },
];

export const mockInterestedUsers = {
  1: [
    {
      buyer_id: 5,
      name: "Rahul Sharma",
      email: "rahul@gmail.com",
      phone: "9876543210",
      message: "I am interested in this product",
      status: "pending",
      created_at: "2026-06-11",
    },
  ],
  2: [],
};

const getAssetUrl = (url) => {
  if (!url || /^https?:\/\//i.test(url) || url.startsWith("data:")) return url;

  return `${url.startsWith("/") ? "" : "/"}${url}`;
};

export const normalizeProductInsight = (product = {}) => ({
  productId: product.product_id || product.id,
  title: product.title || product.name || "Untitled product",
  image: getAssetUrl(
    product.image ||
    product.thumbnail ||
    product.thumbnail_url ||
    product.main_image?.url ||
    product.thumbnails?.[0]?.url ||
    "",
  ),
  price: Number(product.price || 0),
  viewsCount: Number(product.views_count || product.viewsCount || 0),
  likesCount: Number(product.likes_count || product.likesCount || 0),
  reviewsCount: Number(product.reviews_count || product.reviewsCount || 0),
  averageRating: Number(product.average_rating || product.averageRating || 0),
  interestedCount: Number(product.interested_count || product.interestedCount || 0),
});

export const normalizeInterestedUser = (user = {}) => ({
  buyerId: user.buyer_id || user.id,
  name: user.name || user.full_name || "Buyer",
  email: user.email || "",
  phone: user.phone || "",
  message: user.message || "",
  status: user.status || "pending",
  createdAt: user.created_at || user.createdAt || "",
});

export const getSellerlistingstats = async () => {
  if (USE_MOCK_PRODUCT_INSIGHTS) {
    return mockProductInsights.map(normalizeProductInsight);
  }

  const response = await fetch(`${API_BASE_URL}/admin/listings?limit=100`, {
    method: "GET",
    headers: getHeaders(),
  });
  const data = await handleResponse(response);
  const items = Array.isArray(data)
    ? data
    : data.data?.items || data.items || data.data || data.listings || [];

  return items.map(normalizeProductInsight);
};

export const getProductInterestedUsers = async (productId) => {
  if (USE_MOCK_PRODUCT_INSIGHTS) {
    return (mockInterestedUsers[productId] || []).map(normalizeInterestedUser);
  }

  const response = await fetch(
    `${API_BASE_URL}/admin/listings/${productId}/interested-users`,
    {
      method: "GET",
      headers: getHeaders(),
    },
  );
  const data = await handleResponse(response);
  const items = Array.isArray(data) ? data : data.data || data.users || [];

  return items.map(normalizeInterestedUser);
};
