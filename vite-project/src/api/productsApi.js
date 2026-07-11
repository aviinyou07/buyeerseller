import axiosClient, { getApiAssetUrl } from './axiosClient'

const parseMeta = (meta) => {
  if (!meta) return {}
  if (typeof meta === 'object') return meta

  try {
    return JSON.parse(meta)
  } catch {
    return {}
  }
}

const normalizePhotos = (product) =>
  (product.photos || product.images || [])
    .map((photo) => {
      const url = photo.image_url || photo.url || photo
      return url ? getApiAssetUrl(url) : ''
    })
    .filter(Boolean)

const normalizePhotoThumbnails = (product) =>
  (product.photos || product.images || [])
    .map((photo) => {
      const url = photo.thumbnail_url || photo.thumbnailUrl || photo.image_url || photo.url || photo
      return url ? getApiAssetUrl(url) : ''
    })
    .filter(Boolean)

export const normalizeProduct = (product = {}) => {
  const meta = parseMeta(product.meta)
  const photos = normalizePhotos(product)
  const photoThumbnails = normalizePhotoThumbnails(product)
  const reviewsCount = Number(product.reviews_count || product.reviewsCount || 0)
  const image = getApiAssetUrl(
    product.thumbnail_photo ||
    product.thumbnail ||
    product.primary_photo ||
    product.image ||
    product.product_image ||
    photos[0] ||
    '',
  )

  return {
    ...product,
    id: product.id,
    title: product.title || '',
    brand: product.brand || '',
    category: product.category_name || product.category || product.category_id || '',
    subcategory: product.subcategory_name || product.subcategory || product.subcategory_id || '',
    subcategoryId: product.subcategory_id || product.subcategoryId || '',
    condition: product.condition || '',
    warranty: product.warranty || '',
    usedFor: product.used_for || product.usedFor || '',
    offerBadge: product.offer_badge || product.offerBadge || '',
    overviewFields: meta.overviewFields || product.overviewFields || [],
    meta,
    photos,
    photoThumbnails,
    price: Number(product.price || 0),
    location: product.location || '',
    image,
    originalImage: getApiAssetUrl(product.primary_photo || product.image || photos[0] || ''),
    thumbnailImage: image,
    sellerName: product.seller_name || product.sellerName || '',
    sellerId: product.seller_id || product.sellerId || product.user_id || product.userId || '',
    contactNumber: product.seller_phone || product.contactNumber || '',
    postedAt: product.created_at
      ? new Date(product.created_at).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
      : '',
    isVerified: Boolean(product.is_verified || product.isVerified),
    isFeatured: Boolean(product.is_featured || product.isFeatured),
    isLiked: Boolean(product.is_liked || product.isLiked),
    likesCount: Number(product.likes_count ?? product.likesCount ?? product.likeCount ?? 0),
    viewsCount: Number(
      product.views_count || product.viewsCount || product.view_count || product.viewCount || product.views || 0,
    ),
    reviewsCount,
    rating: product.avg_rating && reviewsCount > 0
      ? Number(product.avg_rating).toFixed(1)
      : '',
  }
}

export const getlistings = async (params = {}) => {
  const response = await axiosClient.get('/listings', { params })

  return response.data
}

export const getProduct = async (productId) => {
  const response = await axiosClient.get(`/listings/${productId}`)

  return response.data
}

export const createProduct = async (formData) => {
  const response = await axiosClient.post('/listings', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })

  return response.data
}

export const updateProduct = async (productId, formData) => {
  const response = await axiosClient.put(`/listings/${productId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })

  return response.data
}

export const getListingInterestedUsers = async (productId) => {
  const response = await axiosClient.get(`/listings/${productId}/interested-users`)
  return response.data
}

export const recordListingInteraction = async (productId, type) => {
  const response = await axiosClient.post(`/engagement/${productId}/interact`, { type })
  return response.data
}
