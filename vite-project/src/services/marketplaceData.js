export const AUTH_USER_KEY = 'auth_user'
export const AUTH_TOKEN_KEY = 'auth_token'
export const USER_LISTINGS_KEY = 'buyerseller_user_listings'
export const PROFILE_IMAGE_KEY = 'buyerseller_profile_image'
export const ORDERS_KEY = 'buyerseller_orders'
export const SALES_KEY = 'buyerseller_sales'
export const WISHLIST_KEY = 'buyerseller_wishlist'

const today = new Date().toLocaleDateString('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})


export const readJSON = (key, fallback = null) => {
  try {
    return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback
  } catch {
    return fallback
  }
}

export const writeJSON = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value))
}

export const getCurrentUser = () => {
  const storedUser = readJSON(AUTH_USER_KEY, {})
  const phone = storedUser.phone || localStorage.getItem('registered_phone') || ''
  const fullName =
    storedUser.fullName || localStorage.getItem('fullName') || ''
  const id = storedUser.id || (phone ? `user-${phone}` : 'guest-user')

  return {
    id,
    fullName,
    phone,
    role: storedUser.role || localStorage.getItem('selected_role') || 'buyer',
    email: storedUser.email || '',
    profileImage: storedUser.profileImage || localStorage.getItem(PROFILE_IMAGE_KEY) || '',
    ...storedUser,
  }
}

export const saveCurrentUser = (user) => {
  const nextUser = {
    ...getCurrentUser(),
    ...user,
  }

  writeJSON(AUTH_USER_KEY, nextUser)
  localStorage.setItem('fullName', nextUser.fullName || '')
  localStorage.setItem('registered_phone', nextUser.phone || '')
  localStorage.setItem('selected_role', nextUser.role || 'buyer')

  if (nextUser.profileImage) {
    localStorage.setItem(PROFILE_IMAGE_KEY, nextUser.profileImage)
  }

  return nextUser
}

export const startSession = (user, token = '') => {
  const savedUser = saveCurrentUser(user)

  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token)
  } else {
    localStorage.removeItem(AUTH_TOKEN_KEY)
  }
  writeJSON('registered_user', savedUser)

  return savedUser
}

export const logout = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY)
  localStorage.removeItem(AUTH_USER_KEY)
}

export const isAuthenticated = () => Boolean(localStorage.getItem(AUTH_TOKEN_KEY))

export const getUserListings = () => readJSON(USER_LISTINGS_KEY, [])

export const clearUserListings = () => {
  localStorage.removeItem(USER_LISTINGS_KEY)
}

export const getAllListings = () => getUserListings()

export const getListingsBySubcategory = (subcategoryId) =>
  getAllListings().filter((listing) => listing.subcategoryId === subcategoryId)

export const getListingById = (listingId, subcategoryId) =>
  getAllListings().find(
    (listing) =>
      String(listing.id) === String(listingId) &&
      (!subcategoryId || listing.subcategoryId === subcategoryId),
  )

export const saveListing = (listing) => {
  const currentUser = getCurrentUser()
  const savedListings = getUserListings()
  const nextListing = {
    id: listing.id || `listing-${Date.now()}`,
    ownerId: currentUser.id,
    sellerName: currentUser.fullName || listing.sellerName || 'Marketplace Seller',
    contactNumber: currentUser.phone ? `+91 ${currentUser.phone}` : listing.contactNumber,
    status: 'Active',
    postedAt: today,
    isVerified: true,
    isFeatured: false,
    ...listing,
  }

  writeJSON(USER_LISTINGS_KEY, [nextListing, ...savedListings])
  return nextListing
}

export const updateListing = (listingId, listing) => {
  const savedListings = getUserListings()
  const existingListing = savedListings.find(
    (savedListing) => String(savedListing.id) === String(listingId),
  )
  const nextListing = {
    ...existingListing,
    ...listing,
    id: listingId,
  }
  const hasExistingListing = Boolean(existingListing)
  const nextListings = hasExistingListing
    ? savedListings.map((savedListing) =>
        String(savedListing.id) === String(listingId) ? nextListing : savedListing,
      )
    : [nextListing, ...savedListings]

  writeJSON(USER_LISTINGS_KEY, nextListings)
  return nextListing
}

export const getOrders = () => {
  const orders = readJSON(ORDERS_KEY, [])
  return orders
}

export const getSales = () => {
  const sales = readJSON(SALES_KEY, [])
  return sales
}

export const getWishlist = () => {
  const wishlist = readJSON(WISHLIST_KEY, [])
  return wishlist
}

export const saveWishlistItem = (product) => {
  const wishlist = readJSON(WISHLIST_KEY, [])
  const nextItem = {
    id: String(product.id),
    title: product.title,
    detail: `${product.category || product.subcategory || 'Marketplace'} - Saved ${today}`,
    price: Number(product.price || product.amount || 0),
  }

  if (wishlist.some((item) => String(item.id) === nextItem.id)) return wishlist

  const nextWishlist = [nextItem, ...wishlist]
  writeJSON(WISHLIST_KEY, nextWishlist)
  return nextWishlist
}

export const removeWishlistItem = (productId) => {
  const wishlist = readJSON(WISHLIST_KEY, [])
  const nextWishlist = wishlist.filter((item) => String(item.id) !== String(productId))

  writeJSON(WISHLIST_KEY, nextWishlist)
  return nextWishlist
}

export const isWishlistItem = (productId) => {
  const wishlist = readJSON(WISHLIST_KEY, [])

  return wishlist.some((item) => String(item.id) === String(productId))
}

export const toggleWishlistItem = (product) => {
  if (isWishlistItem(product.id)) {
    removeWishlistItem(product.id)
    return false
  }

  saveWishlistItem(product)
  return true
}

export const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))
