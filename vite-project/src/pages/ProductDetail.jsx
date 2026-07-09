import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  ThumbsUp,
  MapPin,
  MessageCircle,
  PackageOpen,
  Phone,
  Send,
  ShieldCheck,
  Star,
  UserRound,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { getApiAssetUrl } from '../api/axiosClient'
import {
  getListingEngagement,
  postListingReview,
  toggleListingLike,
} from '../api/listingEngagementApi'
import { getProduct } from '../api/productsApi'
import { useAppText } from '../appText'
import { getCurrentUser, isAuthenticated } from '../services/marketplaceData'

const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(price || 0))

const formatPostedAt = (createdAt) => {
  if (!createdAt) return 'Today'

  return new Date(createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const parseMeta = (meta) => {
  if (!meta) return {}
  if (typeof meta === 'object') return meta

  try {
    return JSON.parse(meta)
  } catch {
    return {}
  }
}

const normalizeBackendProduct = (apiProduct) => {
  const meta = parseMeta(apiProduct.meta)
  const overviewFields = Array.isArray(meta.overviewFields) ? meta.overviewFields : []
  const photos = Array.isArray(apiProduct.photos)
    ? apiProduct.photos.map((photo) => getApiAssetUrl(photo.image_url)).filter(Boolean)
    : []
  const primaryImage = getApiAssetUrl(apiProduct.primary_photo || apiProduct.image)

  const getMetaValue = (key) => {
    if (Array.isArray(overviewFields)) {
      const item = overviewFields.find(a => a.label?.toLowerCase() === key.toLowerCase());
      return item ? item.value : null;
    }
    return meta[key] || null;
  };

  const condition = apiProduct.condition || getMetaValue('Condition') || '';
  const warranty = apiProduct.warranty || getMetaValue('Warranty') || '';
  const usedFor = apiProduct.used_for || apiProduct.usedFor || getMetaValue('Used For') || '';

  return {
    ...apiProduct,
    category: apiProduct.category_name || apiProduct.category || apiProduct.category_id || '',
    subcategory:
      apiProduct.subcategory_name ||
      apiProduct.subcategory ||
      apiProduct.subcategory_id ||
      '',
    subcategoryId: apiProduct.subcategory_id || '',
    image: primaryImage || photos[0] || '',
    images: photos,
    sellerName: apiProduct.seller_name || '',
    sellerRating: Number(apiProduct.seller_rating || 0),
    contactNumber: apiProduct.seller_phone || '',
    postedAt: formatPostedAt(apiProduct.created_at),
    condition,
    warranty,
    usedFor,
    offerBadge: apiProduct.offer_badge || apiProduct.offerBadge || '',
    overviewFields,
    isVerified: Boolean(apiProduct.is_verified || apiProduct.isVerified),
    isFeatured: Boolean(apiProduct.is_featured || apiProduct.isFeatured),
    likesCount: Number(apiProduct.likes_count ?? apiProduct.likesCount ?? 0),
    reviewsCount: Number(apiProduct.reviews_count || apiProduct.reviewsCount || 0),
    viewsCount: Number(
      apiProduct.views_count ||
        apiProduct.viewsCount ||
        apiProduct.view_count ||
        apiProduct.viewCount ||
        apiProduct.views ||
        0,
    ),
    avgRating: Number(apiProduct.avg_rating || apiProduct.avgRating || apiProduct.rating || 0),
    isLiked: Boolean(apiProduct.is_liked || apiProduct.isLiked),
  }
}

const detailTextKeys = {
  Category: 'category',
  Subcategory: 'subcategory',
  Mobile: 'subMobile',
  Mobiles: 'subMobiles',
  Laptop: 'subLaptop',
  Laptops: 'subLaptops',
  Iron: 'subIron',
  Irons: 'subIrons',
  Induction: 'subInduction',
  'Induction Cooktops': 'subInductionCooktops',
  Headphones: 'subHeadphones',
  Speaker: 'subSpeaker',
  Speakers: 'subSpeakers',
  Camera: 'subCamera',
  Cameras: 'subCameras',
  Car: 'subCar',
  Cars: 'subCars',
  Bike: 'subBike',
  Bikes: 'subBikes',
  Scooter: 'subScooter',
  Scooters: 'subScooters',
  Cycle: 'subCycle',
  Cycles: 'subCycles',
  'Auto Parts': 'subAutoParts',
  Sofa: 'subSofa',
  Sofas: 'subSofas',
  Bed: 'subBed',
  Beds: 'subBeds',
  Table: 'subTable',
  Tables: 'subTables',
  Chair: 'subChair',
  Chairs: 'subChairs',
  Mixer: 'subMixer',
  Mixers: 'subMixers',
  Fridge: 'subFridge',
  Fridges: 'subFridges',
  'Men Wear': 'subMenWear',
  'Women Wear': 'subWomenWear',
  Shoes: 'subShoes',
  Bags: 'subBags',
  Watches: 'subWatches',
  Brand: 'brand',
  Model: 'model',
  Condition: 'condition',
  Warranty: 'warranty',
  'Used For': 'usedFor',
  'Used for': 'usedFor',
  Usage: 'usage',
  Storage: 'storage',
  RAM: 'ram',
  Processor: 'processor',
  'Battery health': 'batteryHealth',
  'Pickup location': 'pickupLocation',
  'Price negotiable': 'priceNegotiable',
  'Bill available': 'billAvailable',
  'Delivery option': 'deliveryOption',
  Year: 'year',
  'KM driven': 'kmDriven',
  'Fuel type': 'fuelType',
  Ownership: 'ownership',
  Material: 'material',
  'Seating capacity': 'seatingCapacity',
  Dimensions: 'dimensions',
  Capacity: 'capacity',
  Type: 'type',
  Size: 'size',
  Fabric: 'fabric',
  Fit: 'fit',
  Occasion: 'occasion',
  Good: 'good',
  'Like New': 'likeNew',
  Fair: 'fair',
  'Needs Repair': 'needsRepair',
  'With Warranty': 'withWarranty',
  'No Warranty': 'noWarranty',
  Yes: 'yes',
  No: 'no',
  Today: 'today',
  Yesterday: 'yesterday',
}

const translateDetailText = (value, t) => t(detailTextKeys[value] || value)

const formatReviewDate = (createdAt) => {
  if (!createdAt) return 'Just now'

  return new Date(createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const normalizeReview = (review = {}) => ({
  id: review.id,
  userId: review.user_id || review.userId || '',
  name: review.user_name || review.name || 'User',
  rating: Number(review.rating || 5),
  text: review.review || review.text || '',
  date: formatReviewDate(review.created_at || review.date),
  image: review.image || '',
})

const formatStatCount = (value) =>
  new Intl.NumberFormat('en-IN', {
    notation: Number(value || 0) >= 1000 ? 'compact' : 'standard',
    maximumFractionDigits: 1,
  }).format(Number(value || 0))

const hiddenProductFields = new Set([
  'id',
  'ownerId',
  'title',
  'price',
  'image',
  'images',
  'photos',
  'meta',
  'created_at',
  'updated_at',
  'seller_id',
  'seller_phone',
  'seller_name',
  'seller_rating',
  'category_id',
  'category_name',
  'subcategory_id',
  'subcategory_name',
  'used_for',
  'description',
  'sellerName',
  'contactNumber',
  'status',
  'postedAt',
  'location',
  'subcategoryId',
  'overviewFields',
  'isVerified',
  'isFeatured',
  'isLiked',
  'offerBadge',
  'companyName',
  'rating',
  'ratingCount',
  'likes_count',
  'likesCount',
  'reviews_count',
  'reviewsCount',
  'views_count',
  'viewsCount',
  'view_count',
  'viewCount',
  'avg_rating',
  'avgRating',
])

const specFields = [
  { name: 'category', label: 'Category' },
  { name: 'subcategory', label: 'Subcategory' },
  { name: 'brand', label: 'Brand' },
  { name: 'condition', label: 'Condition' },
  { name: 'warranty', label: 'Warranty' },
  { name: 'usedFor', label: 'Used For' },
  { name: 'model', label: 'Model' },
  { name: 'processor', label: 'Processor' },
  { name: 'battery', label: 'Battery health' },
  { name: 'usage', label: 'Usage' },
  { name: 'storage', label: 'Storage' },
  { name: 'ram', label: 'RAM' },
  { name: 'negotiable', label: 'Price negotiable' },
  { name: 'billAvailable', label: 'Bill available' },
  { name: 'deliveryOption', label: 'Delivery option' },
  { name: 'year', label: 'Year' },
  { name: 'kmDriven', label: 'KM driven' },
  { name: 'fuel', label: 'Fuel type' },
  { name: 'ownership', label: 'Ownership' },
  { name: 'material', label: 'Material' },
  { name: 'seating', label: 'Seating capacity' },
  { name: 'dimensions', label: 'Dimensions' },
  { name: 'capacity', label: 'Capacity' },
  { name: 'type', label: 'Type' },
  { name: 'size', label: 'Size' },
  { name: 'fabric', label: 'Fabric' },
  { name: 'fit', label: 'Fit' },
  { name: 'occasion', label: 'Occasion' },
  { name: 'shoeType', label: 'Type' },
  { name: 'watchType', label: 'Type' },
]

const hiddenOverviewFields = new Set(['condition', 'warranty', 'usedFor', 'used_for'])

const humanizeFieldName = (name) =>
  String(name || '')
    .replace(/^custom_/, 'Custom ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())

const isDisplayableValue = (value) =>
  ['string', 'number', 'boolean'].includes(typeof value) &&
  String(value).trim()

const getOverviewFields = (product) => {
  const savedFields = (Array.isArray(product.overviewFields) ? product.overviewFields : [])
    .filter((field) => !hiddenOverviewFields.has(field.name))
  const usedNames = new Set(savedFields.map((field) => field.name))
  const specNames = new Set(specFields.map((field) => field.name))
  const standardFields = specFields
    .filter((field) => !usedNames.has(field.name))
    .map((field) => ({
      ...field,
      value: product[field.name],
    }))
  const looseFields = Object.entries(product)
    .filter(
      ([name, value]) =>
        !hiddenProductFields.has(name) &&
        !usedNames.has(name) &&
        !specNames.has(name) &&
        isDisplayableValue(value),
    )
    .map(([name, value]) => ({
      name,
      label: humanizeFieldName(name),
      value,
    }))

  return [...savedFields, ...standardFields, ...looseFields]
    .map((field) => ({
      label: field.label,
      name: field.name || field.label,
      value: field.value,
    }))
    .filter((field) => String(field.value || '').trim())
}

const ProductDetailSkeleton = ({ t, categoryTitle, onBack }) => (
  <div className="min-h-dvh bg-[#f7fafc] text-[#102a43]">
    <header className="sticky top-0 z-30 overflow-hidden  bg-white px-3 pb-4 pt-3">
      <div className="relative mx-auto flex max-w-5xl items-center gap-3">
        <button
          aria-label={t('back')}
          className="grid size-10 shrink-0 place-items-center rounded-full border border-white/90 bg-white text-[#102a43] "
          type="button"
          onClick={onBack}
        >
          <ArrowLeft className="size-5" />
        </button>
        <div className="min-w-0">
          <h1 className="truncate text-lg font-black tracking-normal">
            {t('productDetails')}
          </h1>
          <p className="text-xs font-semibold text-[#102a43]/58">
            {t('buyerViewFor', { category: categoryTitle })}
          </p>
        </div>
      </div>
    </header>

    <main className="mx-auto max-w-5xl space-y-3 px-3 pb-4 pt-3">
      <section className="overflow-hidden  border border-slate-100 bg-white ">
        <div className="aspect-[4/3] animate-pulse bg-slate-100 sm:aspect-[16/9]" />
        <div className="grid grid-cols-4 gap-2 border-b border-slate-100 p-2.5">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              className="aspect-square animate-pulse bg-slate-100"
              key={index}
            />
          ))}
        </div>
        <div className="p-3.5">
          <div className="animate-pulse space-y-3">
            <div className="h-7 w-32 rounded bg-slate-100" />
            <div className="h-5 w-3/4 rounded bg-slate-100" />
            <div className="flex gap-2">
              <div className="h-7 w-24 rounded-full bg-slate-100" />
              <div className="h-7 w-24 rounded-full bg-slate-100" />
            </div>
          </div>
        </div>
      </section>

      <section className=" border border-slate-100 bg-white p-3.5 ">
        <div className="h-6 w-24 animate-pulse rounded bg-slate-100" />
        <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div className="bg-[#fbfaff] p-3 ring-1 ring-slate-100" key={index}>
              <div className="h-3 w-16 animate-pulse rounded bg-slate-100" />
              <div className="mt-2 h-4 w-24 animate-pulse rounded bg-slate-100" />
            </div>
          ))}
        </div>
      </section>
    </main>
  </div>
)

const productDetailLoadCache = new Map()
const PRODUCT_DETAIL_DEDUPE_MS = 2000

const loadProductDetailData = (productId) => {
  const cacheKey = String(productId)
  const cachedLoad = productDetailLoadCache.get(cacheKey)

  if (cachedLoad && Date.now() - cachedLoad.createdAt < PRODUCT_DETAIL_DEDUPE_MS) {
    return cachedLoad.promise
  }

  const promise = Promise.all([
    getProduct(productId),
    getListingEngagement(productId),
  ]).then(([response, engagement]) => ({ response, engagement }))

  productDetailLoadCache.set(cacheKey, {
    createdAt: Date.now(),
    promise,
  })

  promise
    .then(() => {
      window.setTimeout(() => {
        if (productDetailLoadCache.get(cacheKey)?.promise === promise) {
          productDetailLoadCache.delete(cacheKey)
        }
      }, PRODUCT_DETAIL_DEDUPE_MS)
    })
    .catch(() => {
      if (productDetailLoadCache.get(cacheKey)?.promise === promise) {
        productDetailLoadCache.delete(cacheKey)
      }
    })

  return promise
}

const ProductDetail = () => {
  const navigate = useNavigate()
  const { language, t, translateDynamicText } = useAppText()
  const location = useLocation()
  const { subcategoryId = 'listings', productId = '1' } = useParams()
  const initialProduct = useMemo(
    () => location.state?.product || null,
    [location.state?.product],
  )
  const [product, setProduct] = useState(initialProduct)
  const [translatedProductTitle, setTranslatedProductTitle] = useState('')
  const [translatedProductDescription, setTranslatedProductDescription] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const sellerPhone = String(product?.contactNumber || '').replace(/\D/g, '')
  const categoryTitle =
    location.state?.categoryTitle || product?.category || product?.subcategory || 'listings'
  const galleryImages = useMemo(
    () =>
      [
        product?.image,
        ...(Array.isArray(product?.images) ? product.images : []),
      ].filter((image, index, images) => images.indexOf(image) === index),
    [product],
  )
  const [selectedImage, setSelectedImage] = useState('')

  const specs = product ? getOverviewFields(product) : []
  const activeImage = selectedImage || galleryImages[0]
  const chatUrl = sellerPhone
    ? `https://wa.me/${sellerPhone}?text=${encodeURIComponent(
        `Hi, I am interested in ${product?.title || ''}`,
      )}`
    : ''
  const callUrl = sellerPhone ? `tel:+${sellerPhone}` : ''
  const [reviews, setReviews] = useState([])
  const [reviewText, setReviewText] = useState('')
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewImagePreview, setReviewImagePreview] = useState('')
  const [reviewMessage, setReviewMessage] = useState('')
  const [isReviewPosting, setIsReviewPosting] = useState(false)
  const [isLikePending, setIsLikePending] = useState(false)
  const [engagementStats, setEngagementStats] = useState({
    likesCount: 0,
    isLiked: false,
    commentsCount: 0,
    viewsCount: 0,
  })
  const lastImageTapRef = useRef(0)
  const contactActionHandledRef = useRef(false)
  const currentUser = useMemo(() => getCurrentUser(), [])
  const currentUserId = String(currentUser.id || '')
  const hasReviewedProduct = reviews.some(
    (review) => currentUserId && String(review.userId) === currentUserId,
  )
  const previewReviews = reviews.slice(0, 2)
  const hasMoreReviews = reviews.length > previewReviews.length
  const averageRating = useMemo(() => {
    if (reviews.length > 0) {
      const ratingTotal = reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0)

      return ratingTotal / reviews.length
    }

    return Number(product?.avgRating || 0)
  }, [product?.avgRating, reviews])
  
  const isProductActive = product?.status === 'active' || product?.listing_status === 'approved'
  
  const listingstats = [
    {
      label: 'Views',
      value: formatStatCount(engagementStats.viewsCount || product?.viewsCount),
      icon: Eye,
    },
    {
      label: 'Likes',
      value: formatStatCount(engagementStats.likesCount ?? product?.likesCount),
      icon: ThumbsUp,
    },
    {
      label: 'Rating',
      value: averageRating > 0 ? averageRating.toFixed(1) : 'New',
      icon: Star,
    },
    {
      label: 'Reviews',
      value: formatStatCount(reviews.length || product?.reviewsCount),
      icon: MessageCircle,
    },
  ]

  useEffect(() => {
    let isMounted = true

    const loadTranslatedProductText = async () => {
      if (!product) return

      if (language === 'en') {
        setTranslatedProductTitle('')
        setTranslatedProductDescription('')
        return
      }

      const [nextTitle, nextDescription] = await Promise.all([
        translateDynamicText(
          product.title || '',
          `translation:hi:product:${product.id || productId}:title`,
        ),
        translateDynamicText(
          product.description || '',
          `translation:hi:product:${product.id || productId}:description`,
        ),
      ])

      if (isMounted) {
        setTranslatedProductTitle(nextTitle)
        setTranslatedProductDescription(nextDescription)
      }
    }

    loadTranslatedProductText()

    return () => {
      isMounted = false
    }
  }, [language, product, productId, translateDynamicText])

  useEffect(() => {
    let isMounted = true

    const loadProduct = async () => {
      try {
        setIsLoading(true)
        setErrorMessage('')

        const { response, engagement } = await loadProductDetailData(productId)
        const backendProduct = response.product || response.data?.product || response.data

        if (isMounted && backendProduct) {
          setProduct(normalizeBackendProduct(backendProduct))
          setReviews((engagement.reviews || []).map(normalizeReview))
          setEngagementStats({
            likesCount: Number(engagement.likesCount ?? backendProduct.likes_count ?? 0),
            isLiked: Boolean(engagement.isLiked || backendProduct.is_liked),
            commentsCount: Number((engagement.comments || []).length),
            viewsCount: Number(
              engagement.viewsCount ||
                engagement.views_count ||
                backendProduct.views_count ||
                backendProduct.viewsCount ||
                backendProduct.view_count ||
                backendProduct.viewCount ||
                backendProduct.views ||
                0,
            ),
          })
        }
      } catch (error) {
        console.error('[ProductDetail.loadProduct]', error)
        if (isMounted) {
          setErrorMessage(error.response?.data?.message || 'Unable to load product details.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadProduct()

    return () => {
      isMounted = false
    }
  }, [productId])

  const handleLikeToggle = async () => {
    if (isLikePending) return
    if (!isAuthenticated()) {
      navigate('/login', {
        state: {
          from: `${location.pathname}${location.search}`,
        },
      })
      return
    }

    const previousStats = engagementStats
    const nextIsLiked = !previousStats.isLiked
    const nextLikesCount = Math.max(
      0,
      Number(previousStats.likesCount ?? product?.likesCount ?? 0) + (nextIsLiked ? 1 : -1),
    )

    setIsLikePending(true)
    setEngagementStats((currentStats) => ({
      ...currentStats,
      isLiked: nextIsLiked,
      likesCount: nextLikesCount,
    }))

    try {
      const result = await toggleListingLike(productId)
      setEngagementStats((currentStats) => ({
        ...currentStats,
        isLiked: Boolean(result.isLiked),
        likesCount: Number(result.likesCount ?? 0),
      }))
    } catch (error) {
      console.error('[ProductDetail.handleLikeToggle]', error)
      setEngagementStats(previousStats)
    } finally {
      setIsLikePending(false)
    }
  }

  const touchStartXRef = useRef(0)

  const handleImageTouchStart = (e) => {
    touchStartXRef.current = e.changedTouches[0].clientX
  }

  const handleImageTouchEnd = (e) => {
    const now = Date.now()
    const touchEndX = e.changedTouches[0].clientX
    const deltaX = touchEndX - touchStartXRef.current

    if (Math.abs(deltaX) > 50 && galleryImages.length > 1) {
      const idx = galleryImages.indexOf(activeImage)
      if (deltaX > 0) {
        // Swipe right (previous image)
        const prevIdx = idx <= 0 ? galleryImages.length - 1 : idx - 1
        setSelectedImage(galleryImages[prevIdx])
      } else {
        // Swipe left (next image)
        const nextIdx = idx >= galleryImages.length - 1 ? 0 : idx + 1
        setSelectedImage(galleryImages[nextIdx])
      }
      return
    }

    if (now - lastImageTapRef.current < 320) {
      handleLikeToggle()
      lastImageTapRef.current = 0
      return
    }

    lastImageTapRef.current = now
  }

  const handleReviewSubmit = async (event) => {
    event.preventDefault()

    if (!isAuthenticated()) {
      setReviewMessage('You must be logged in to post a review.')
      return
    }

    if (isReviewPosting) return
    if (hasReviewedProduct) {
      setReviewMessage('You have already reviewed this product.')
      return
    }

    const trimmedReview = reviewText.trim()
    if (!trimmedReview) {
      setReviewMessage('Please write your review before posting.')
      return
    }

    try {
      setIsReviewPosting(true)
      const createdReview = await postListingReview(productId, {
        rating: reviewRating,
        review: trimmedReview,
      })

      setReviews((currentReviews) => [
        normalizeReview({
          ...createdReview,
          user_id: createdReview?.user_id || currentUser?.id,
          image: reviewImagePreview,
        }),
        ...currentReviews,
      ])
      setReviewText('')
      setReviewRating(5)
      setReviewImagePreview('')
      setReviewMessage('Review posted.')
    } catch (error) {
      console.error('[ProductDetail.handleReviewSubmit]', error)
      setReviewMessage(error.response?.data?.message || 'Unable to post review right now.')
    } finally {
      setIsReviewPosting(false)
    }
  }

  const requireLoginForContact = (contactAction) => {
    if (!isAuthenticated()) {
      navigate('/login', {
        state: {
          from: location.pathname,
          contactAction,
        },
      })
      return false
    }

    return true
  }

  const handleChatClick = () => {
    if (!requireLoginForContact('chat')) return
    window.open(chatUrl, '_blank', 'noreferrer')
  }

  const handleCallClick = () => {
    if (!requireLoginForContact('call')) return
    window.location.href = callUrl
  }

  useEffect(() => {
    const contactAction = location.state?.contactAction
    if (
      !contactAction ||
      !sellerPhone ||
      contactActionHandledRef.current ||
      !isAuthenticated()
    ) {
      return
    }

    contactActionHandledRef.current = true

    if (contactAction === 'chat') {
      window.open(chatUrl, '_blank', 'noreferrer')
    }

    if (contactAction === 'call') {
      window.location.href = callUrl
    }
  }, [callUrl, chatUrl, location.state?.contactAction, sellerPhone])

  if (isLoading) {
    return (
      <ProductDetailSkeleton
        categoryTitle={categoryTitle}
        t={t}
        onBack={() => navigate(-1)}
      />
    )
  }

  if (errorMessage || !product) {
    return (
      <div className="min-h-dvh bg-[#f7fafc] text-[#102a43]">
        <header className="sticky top-0 z-30 bg-white px-3 pb-4 pt-3">
          <div className="mx-auto flex max-w-5xl items-center gap-3">
            <button
              aria-label={t('back')}
              className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-[#102a43]"
              type="button"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="size-5" />
            </button>
            <h1 className="truncate text-lg font-black tracking-normal">
              {t('productDetails')}
            </h1>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-3 pt-3">
          <section className="border border-slate-100 bg-white px-4 py-12 text-center">
            <h2 className="text-base font-black text-[#102a43]">
              {errorMessage || 'Product not found.'}
            </h2>
          </section>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-[#f7fafc] text-[#102a43]">
      <header className="sticky top-0 z-30 overflow-hidden  bg-white px-3 pb-4 pt-3">
        <div className="relative mx-auto flex max-w-5xl items-center gap-3">
          <button
            aria-label={t('back')}
            className="grid size-10 shrink-0 place-items-center rounded-full border border-white/90 bg-white text-[#102a43] "
            type="button"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="size-5" />
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-black tracking-normal">
              {t('productDetails')}
            </h1>
            <p className="text-xs font-semibold text-[#102a43]/58">
              {t('buyerViewFor', { category: categoryTitle })}
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-3  pb-4">
        <section className="overflow-hidden  border border-slate-100 bg-white ">
          <div
            className="relative h-72 bg-[#f1efff] sm:h-80 md:h-96"
            role="button"
            tabIndex={0}
            onDoubleClick={handleLikeToggle}
            onTouchStart={handleImageTouchStart}
            onTouchEnd={handleImageTouchEnd}
          >
            {activeImage ? (
              <>
                <img
                  alt={product.title}
                  className="h-full w-full object-contain"
                  src={activeImage}
                />
                {galleryImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      className="absolute left-2 top-1/2 -translate-y-1/2 grid size-8 place-items-center rounded-full bg-white/80 text-[#102a43] shadow-md transition hover:bg-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        const idx = galleryImages.indexOf(activeImage);
                        const prevIdx = idx <= 0 ? galleryImages.length - 1 : idx - 1;
                        setSelectedImage(galleryImages[prevIdx]);
                      }}
                    >
                      <ChevronLeft className="size-5" />
                    </button>
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2 grid size-8 place-items-center rounded-full bg-white/80 text-[#102a43] shadow-md transition hover:bg-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        const idx = galleryImages.indexOf(activeImage);
                        const nextIdx = idx >= galleryImages.length - 1 ? 0 : idx + 1;
                        setSelectedImage(galleryImages[nextIdx]);
                      }}
                    >
                      <ChevronRight className="size-5" />
                    </button>
                  </>
                )}
              </>
            ) : (
              <div className="grid h-full place-items-center text-[#4d49b9]">
                <PackageOpen className="size-12" />
              </div>
            )}
            {product.isFeatured && (
              <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-3 py-1.5 text-xs font-black text-[#4d49b9] ">
                <Star className="size-3.5" />
                {t('featured')}
              </span>
            )}
          </div>

          <div className="flex gap-4 overflow-x-auto border-b border-slate-100 p-2.5">
            {galleryImages.map((image, index) => (
              <button
                className={`h-20 w-20 md:w-26 md:h-26 shrink-0 overflow-hidden bg-[#f1efff] sm:h-20 sm:w-20  ${
                  activeImage === image
                    ? 'border-[#c9c8ff] '
                    : 'border-slate-100'
                }`}
                key={image}
                type="button"
                onClick={() => setSelectedImage(image)}
              >
                <img
                  alt={`${product.title} view ${index + 1}`}
                  className="h-full w-full object-contain"
                  src={image}
                />
              </button>
            ))}
          </div>

          <div className="p-3.5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-black leading-6 text-[#102a43]">
                  {translatedProductTitle || product.title}
                </h2>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                <p className="text-right text-2xl font-black text-[#102a43]">
                  {formatPrice(product.price)}
                </p>
              </div>
            </div>

            <div className="mt-3 flex items-end justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500">
                {product.isVerified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#f1efff] px-2.5 py-1.5 text-xs font-black text-[#4d49b9]">
                    <BadgeCheck className="size-3.5" />
                    {t('verified')}
                  </span>
                )}
                <span className="flex items-center gap-1 rounded-full bg-[#fbfaff] px-3 py-1.5 ring-1 ring-slate-100">
                  <MapPin className="size-3.5" />
                  {product.location}
                </span>
                <span className="flex items-center gap-1 rounded-full bg-[#fbfaff] px-3 py-1.5 ring-1 ring-slate-100">
                  <CalendarDays className="size-3.5" />
                  {translateDetailText(product.postedAt, t)}
                </span>
              </div>
              {isProductActive && (
                <button
                  aria-label={engagementStats.isLiked ? 'Unlike product' : 'Like product'}
                  className={`inline-flex shrink-0 px-3 py-1.5 items-center gap-2 rounded-full text-xs font-semibold ${
                    engagementStats.isLiked
                      ? 'bg-[#4d49b9] text-white'
                      : 'bg-[#fbfaff] text-[#102a43] ring-1 ring-[#ded2ff]'
                  }`}
                  disabled={isLikePending}
                  type="button"
                  onClick={handleLikeToggle}
                >
                  <ThumbsUp
                    className={`size-4 ${engagementStats.isLiked ? 'fill-white' : 'text-[#4d49b9]'}`}
                  />
                  {formatStatCount(engagementStats.likesCount ?? product?.likesCount)}
                </button>
              )}
            </div>
          </div>
        </section>

        {isProductActive && (
          <section className="border border-slate-200 bg-white p-3">
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
              {listingstats.map((stat) => {
                const StatIcon = stat.icon

                return (
                  <div
                    className="flex min-h-16 min-w-0 flex-col items-center justify-center border border-gray-100 bg-white px-1.5 py-2 text-center  sm:min-h-20 sm:flex-row sm:justify-start sm:gap-3 sm:px-3 sm:text-left"
                    key={stat.label}
                  >
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#4d49b9] text-white  sm:size-10">
                      <StatIcon className="size-3.5 sm:size-4" strokeWidth={2.5} />
                    </span>
                    <div className="mt-1 min-w-0 sm:mt-0">
                      <p className="text-[9px] font-black uppercase text-slate-500 sm:text-[11px]">
                        {stat.label}
                      </p>
                      <p className="mt-0.5 truncate text-sm font-black text-[#082b49] sm:text-base">
                        {stat.value}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        <section className=" border border-slate-100 bg-white p-3.5 ">
          <h2 className="text-lg font-black tracking-normal">{t('overview')}</h2>
          <div className="mt-3 grid md:grid-cols-3 gap-2 grid-cols-2">
            {specs.map((item) => (
              <div className=" bg-[#fbfaff] p-3 ring-1 ring-slate-100" key={`${item.name}-${item.label}`}>
                <p className="text-[11px] font-black uppercase text-slate-400">
                  {translateDetailText(item.label, t)}
                </p>
                <p className="mt-1 text-sm font-black text-[#102a43]">
                  {translateDetailText(item.value, t)}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className=" border border-slate-100 bg-white p-3.5 ">
          <h2 className="text-lg font-black tracking-normal">{t('description')}</h2>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
            {translatedProductDescription || product.description || ''}
          </p>
          <div className="mt-3 space-y-2">
            {[
              t('askOriginalPhotos'),
              t('inspectBeforePayment'),
              t('meetSafeLocation'),
            ].map((tip) => (
              <div className="flex items-center gap-2 text-sm font-bold" key={tip}>
                <CheckCircle2 className="size-4 shrink-0 text-[#4d49b9]" />
                {tip}
              </div>
            ))}
          </div>
        </section>

        {isProductActive && (
          <section className="overflow-hidden  border border-[#e7e3ff] bg-white">
            <div className="flex items-center justify-between gap-3 bg-[#fbfaff] px-4 py-3.5">
              <div className="min-w-0">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[#4d49b9] ring-1 ring-[#ebe7ff]">
                  <MessageCircle className="size-3" />
                  Buyer feedback
                </span>
                <h2 className="mt-2 text-lg font-black tracking-normal text-[#102a43]">
                  Reviews
                </h2>
                <p className="mt-1 text-xs font-semibold text-slate-500">
                  {reviews.length
                    ? `${reviews.length} buyer review${reviews.length > 1 ? 's' : ''} for this listing.`
                    : 'Share your experience with this listing.'}
                </p>
              </div>
            
            </div>

            {hasReviewedProduct ? (
              <div className="m-3.5 border border-slate-100 bg-white p-3">
                <p className=" bg-[#f1efff] px-3 py-2 text-sm font-semibold text-[#4d49b9]">
                  You have already reviewed this product.
                </p>
              </div>
            ) : (
              <form
                className=" border-y border-slate-100 p-3.5"
                onSubmit={handleReviewSubmit}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-black text-[#102a43]">Rate this listing</p>
                  <div className="flex items-center gap-1 rounded-full bg-[#fbfaff] p-1 ring-1 ring-[#ebe7ff]">
                    {Array.from({ length: 5 }).map((_, index) => {
                      const ratingValue = index + 1

                      return (
                        <button
                          aria-label={`Rate ${ratingValue} star${ratingValue > 1 ? 's' : ''}`}
                          className={`grid size-8 place-items-center rounded-full text-[#4d49b9] transition ${
                            reviewRating >= ratingValue
                              ? 'bg-white '
                              : 'hover:bg-white/70'
                          }`}
                          key={ratingValue}
                          type="button"
                          onClick={() => setReviewRating(ratingValue)}
                        >
                          <Star
                            className={`size-4 ${
                              reviewRating >= ratingValue ? 'fill-[#4d49b9]' : ''
                            }`}
                          />
                        </button>
                      )
                    })}
                  </div>
                </div>

                <textarea
                  className="mt-3 min-h-32 w-full resize-none rounded-sm border border-slate-200 bg-[#fbfaff] px-4 py-3 text-sm font-semibold leading-6 text-[#102a43] outline-none placeholder:text-slate-400"
                  placeholder="Write your review"
                  value={reviewText}
                  onChange={(event) => {
                    setReviewText(event.target.value)
                    setReviewMessage('')
                  }}
                />

                {reviewImagePreview && (
                  <div className="relative mt-3 h-28 w-28 overflow-hidden rounded-2xl bg-[#f1efff] ring-1 ring-[#ebe7ff]">
                    <img
                      alt="Review upload preview"
                      className="h-full w-full object-cover"
                      src={reviewImagePreview}
                    />
                    <button
                      aria-label="Remove review image"
                      className="absolute right-1 top-1 grid size-7 place-items-center rounded-full bg-white text-[#102a43]"
                      type="button"
                      onClick={() => setReviewImagePreview('')}
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                )}

                {reviewMessage && (
                  <p className="mt-3 rounded-xl bg-[#f1efff] px-3 py-2 text-xs font-black text-[#4d49b9]">
                    {reviewMessage}
                  </p>
                )}

                <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
                  <button
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#4d49b9] px-5 text-sm font-black text-white"
                    disabled={isReviewPosting || !reviewText.trim()}
                    type="submit"
                  >
                    <Send className="size-4" />
                    {isReviewPosting ? 'Posting...' : 'Post review'}
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-3 px-3.5 pb-3.5">
              {previewReviews.length > 0 ? (
                previewReviews.map((review) => (
                  <article
                    className="rounded-2xl border border-slate-100 bg-[#fbfaff] p-3.5"
                    key={review.id}
                  >
                    <div className="flex items-start gap-3">
                      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-[#4d49b9]  ring-1 ring-[#ebe7ff]">
                        <UserRound className="size-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <h3 className="text-sm font-black text-[#102a43]">
                              {review.name}
                            </h3>
                            <p className="text-xs font-semibold text-slate-500">
                              {review.date}
                            </p>
                          </div>
                          <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-black text-[#4d49b9] ring-1 ring-[#ebe7ff]">
                            {review.rating}
                            <Star className="size-3 fill-[#4d49b9]" />
                          </span>
                        </div>
                        <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                          {review.text}
                        </p>
                        {review.image && (
                          <img
                            alt={`${review.name} review`}
                            className="mt-3 h-28 w-28 rounded-2xl object-cover ring-1 ring-slate-100"
                            src={review.image}
                          />
                        )}
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-[#fbfaff] px-4 py-8 text-center">
                  <p className="text-sm font-black text-[#102a43]">No reviews yet.</p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    Be the first buyer to share feedback.
                  </p>
                </div>
              )}

              {hasMoreReviews && (
                <button
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-sm border border-[#ded2ff] bg-white text-sm font-black text-[#4d49b9] "
                  type="button"
                  onClick={() =>
                    navigate(`/listings/${subcategoryId}/${productId}/reviews`, {
                      state: {
                        productTitle: product.title,
                        categoryTitle,
                      },
                    })
                  }
                >
                  View all reviews
                  <span className="rounded-full bg-[#f1efff] px-2 py-0.5 text-xs">
                    {reviews.length}
                  </span>
                </button>
              )}
            </div>
          </section>
        )}

        <section className="border border-slate-100 bg-white p-3.5">
          <div className="flex items-center gap-3">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#f1efff] text-[#4d49b9]">
              <UserRound className="size-6" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-black uppercase tracking-wide text-[#4d49b9]">
                Seller details
              </p>
              <h2 className="truncate text-sm font-black text-[#102a43]">
                {product.sellerName || t('localSeller')}
              </h2>
              <p className="mt-1 text-xs font-semibold text-slate-500">
                {t('repliesWithinHour')}
              </p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#4d49b9] px-3 py-1.5 text-xs font-black text-white">
              {product.sellerRating > 0 ? product.sellerRating.toFixed(1) : 'New'}
              <Star className="size-3 fill-white" />
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#f1efff] px-2.5 py-1 text-[10px] font-black text-[#4d49b9]">
              <ShieldCheck className="size-3" />
              {t('safe')}
            </span>
          </div>

          {sellerPhone && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                className="flex h-11 items-center justify-center gap-2 bg-[#fbfaff] text-sm font-black text-[#4d49b9] ring-1 ring-[#ded2ff] active:scale-[0.99]"
                type="button"
                onClick={handleChatClick}
              >
                <MessageCircle className="size-4" />
                {t('chat')}
              </button>
              <button
                className="flex h-11 items-center justify-center gap-2 bg-[#7f7db6] text-sm font-black text-white active:scale-[0.99]"
                type="button"
                onClick={handleCallClick}
              >
                <Phone className="size-4" />
                {t('callSeller')}
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default ProductDetail
