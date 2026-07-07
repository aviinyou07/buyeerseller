import { ArrowLeft, MessageCircle, PackageOpen, Star, UserRound } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { getApiAssetUrl } from '../api/axiosClient'
import { getListingEngagement } from '../api/listingEngagementApi'
import { getProduct } from '../api/productsApi'
import { useAppText } from '../appText'

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
  image: getApiAssetUrl(review.image_url || review.image) || '',
})

const ProductReviews = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useAppText()
  const { productId = '1' } = useParams()
  const [reviews, setReviews] = useState([])
  const [productTitle, setProductTitle] = useState(location.state?.productTitle || '')
  const [categoryTitle, setCategoryTitle] = useState(location.state?.categoryTitle || 'listings')
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  const reviewSummary = useMemo(
    () => `${reviews.length} buyer review${reviews.length === 1 ? '' : 's'}`,
    [reviews.length],
  )

  useEffect(() => {
    let isMounted = true

    const loadReviews = async () => {
      try {
        setIsLoading(true)
        setErrorMessage('')

        const [productResponse, engagement] = await Promise.all([
          getProduct(productId),
          getListingEngagement(productId),
        ])
        const backendProduct =
          productResponse.product || productResponse.data?.product || productResponse.data

        if (!isMounted) return

        if (backendProduct) {
          setProductTitle(
            backendProduct.title || backendProduct.name || location.state?.productTitle || '',
          )
          setCategoryTitle(
            location.state?.categoryTitle ||
              backendProduct.category_name ||
              backendProduct.subcategory_name ||
              backendProduct.category ||
              backendProduct.subcategory ||
              'listings',
          )
        }

        setReviews((engagement.reviews || []).map(normalizeReview))
      } catch (error) {
        console.error('[ProductReviews.loadReviews]', error)
        if (isMounted) {
          setErrorMessage(error.response?.data?.message || 'Unable to load reviews right now.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadReviews()

    return () => {
      isMounted = false
    }
  }, [location.state?.categoryTitle, location.state?.productTitle, productId])

  return (
    <div className="min-h-dvh bg-[#f7fafc] text-[#102a43]">
      <header className="sticky top-0 z-30 border-b border-slate-100 bg-white px-3 pb-4 pt-3">
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          <button
            aria-label={t('back')}
            className="grid size-10 shrink-0 place-items-center rounded-full border border-slate-100 bg-white text-[#102a43] transition active:scale-95"
            type="button"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="size-5" />
          </button>
          <div className="min-w-0">
            
            <h1 className="truncate text-lg font-black tracking-normal">
              All reviews
            </h1>
            <p className="truncate text-xs font-semibold text-[#102a43]/58">
              {productTitle || categoryTitle}
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-3 pb-5 pt-3">
        <section className="mb-3 border border-[#e7e3ff] bg-white p-3.5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fbfaff] px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[#4d49b9] ring-1 ring-[#ebe7ff]">
            <MessageCircle className="size-3" />
            Reviews
          </span>
          <h2 className="mt-3 text-xl font-black text-[#102a43] sm:text-2xl">
            {reviewSummary}
          </h2>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
            {categoryTitle}
          </p>
        </section>

        {isLoading ? (
          <div className="grid gap-3 md:grid-cols-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                className="min-h-36 animate-pulse rounded-2xl border border-slate-100 bg-white p-3.5"
                key={index}
              >
                <div className="flex gap-3">
                  <div className="size-10 rounded-full bg-slate-100" />
                  <div className="flex-1 space-y-3">
                    <div className="h-4 w-1/2 rounded bg-slate-100" />
                    <div className="h-3 w-1/3 rounded bg-slate-100" />
                    <div className="h-3 w-full rounded bg-slate-100" />
                    <div className="h-3 w-2/3 rounded bg-slate-100" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : errorMessage ? (
          <section className="border border-slate-100 bg-white px-4 py-12 text-center">
            <PackageOpen className="mx-auto size-10 text-[#4d49b9]" />
            <h2 className="mt-3 text-base font-black text-[#102a43]">
              {errorMessage}
            </h2>
          </section>
        ) : reviews.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2">
            {reviews.map((review) => (
              <article
                className="rounded-2xl border border-slate-100 bg-white p-3.5"
                key={review.id}
              >
                <div className="flex items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#f1efff] text-[#4d49b9] ring-1 ring-[#ebe7ff]">
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
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#fbfaff] px-2.5 py-1 text-xs font-black text-[#4d49b9] ring-1 ring-[#ebe7ff]">
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
            ))}
          </div>
        ) : (
          <section className="border border-dashed border-slate-200 bg-white px-4 py-12 text-center">
            <MessageCircle className="mx-auto size-10 text-[#4d49b9]" />
            <h2 className="mt-3 text-base font-black text-[#102a43]">
              No reviews yet.
            </h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              Reviews posted for this listing will appear here.
            </p>
          </section>
        )}
      </main>
    </div>
  )
}

export default ProductReviews
