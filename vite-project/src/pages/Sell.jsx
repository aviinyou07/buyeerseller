import { MapPin, PackageOpen, Pencil, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getlistings, normalizeProduct } from '../api/productsApi'
import { useAppText } from '../appText'
import {
  clearUserListings,
  formatCurrency,
  getCurrentUser,
} from '../services/marketplaceData'

const tabs = ['All', 'Pending', 'Active', 'Rejected']

const statusLabels = {
  active: 'Active',
  approved: 'Active',
  pending: 'Pending',
  draft: 'Pending',
  rejected: 'Rejected',
  inactive: 'Inactive',
}

const getListingStatus = (listing) => listing.status || 'Pending'

const listingTextKeys = {
  Active: 'active',
  Rejected: 'rejected',
  Pending: 'pending',
  'Like New': 'likeNew',
  Good: 'good',
  Fair: 'fair',
  Recently: 'recently',
  Yesterday: 'yesterday',
  '3 days ago': 'daysAgo',
  'Sold yesterday': 'soldYesterday',
  Electronics: 'electronics',
  Vehicles: 'vehicles',
  'Home & Kitchen': 'homeKitchen',
  Fashion: 'fashion',
  Mobile: 'subMobile',
  Laptop: 'subLaptop',
  Iron: 'subIron',
  Induction: 'subInduction',
  Headphones: 'subHeadphones',
  Speaker: 'subSpeaker',
  Camera: 'subCamera',
  Car: 'subCar',
  Bike: 'subBike',
  Scooter: 'subScooter',
  Cycle: 'subCycle',
  'Auto Parts': 'subAutoParts',
  Sofa: 'subSofa',
  Bed: 'subBed',
  Table: 'subTable',
  Chair: 'subChair',
  Mixer: 'subMixer',
  Fridge: 'subFridge',
  'Men Wear': 'subMenWear',
  'Women Wear': 'subWomenWear',
  Shoes: 'subShoes',
  Bags: 'subBags',
  Watches: 'subWatches',
}

const translateListingText = (value, t) =>
  value === '3 days ago' ? t('daysAgo', { count: 3 }) : t(listingTextKeys[value] || value)

const getListingSubcategoryId = (listing) =>
  listing.subcategoryId ||
  String(listing.subcategory || 'listing')
    .toLowerCase()
    .replace(/\s+/g, '-')

const formatPostedAt = (createdAt) => {
  if (!createdAt) return 'Recently'

  return new Date(createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const normalizeBackendListing = (product) => {
  const rawStatus = String(product.listing_status || product.status || 'pending').toLowerCase()
  const normalizedProduct = normalizeProduct(product)

  return {
    ...normalizedProduct,
    postedAt: normalizedProduct.postedAt || formatPostedAt(product.created_at),
    status: statusLabels[rawStatus] || rawStatus,
  }
}

const ListingCard = ({ listing, onClick, onEdit }) => {
  const { t } = useAppText()

  return (
  <article
    className="grid w-full grid-cols-[6.5rem_minmax(0,1fr)] overflow-hidden border border-slate-100 bg-white text-left transition active:scale-[0.99]"
    role="button"
    tabIndex={0}
    onClick={onClick}
    onKeyDown={(event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        onClick()
      }
    }}
  >
    <div className="h-28 bg-[#f1efff]">
      {listing.image ? (
        <img
          alt={listing.title}
          className="h-full w-full object-cover"
          src={listing.image}
        />
      ) : (
        <div className="grid h-full place-items-center text-[#4d49b9]">
          <PackageOpen className="size-8" />
        </div>
      )}
    </div>

    <div className="min-w-0 p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="truncate text-sm font-black text-[#102a43]">
            {listing.title}
          </h2>
          <p className="mt-1 truncate text-xs font-semibold text-slate-500">
            {[listing.category, listing.subcategory, listing.condition]
              .filter(Boolean)
              .map((item) => translateListingText(item, t))
              .join(' - ') || t('marketplaceListing')}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            aria-label={`Edit ${listing.title}`}
            className="grid size-7 place-items-center rounded-full bg-[#f1efff] text-[#4d49b9] active:scale-95"
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onEdit()
            }}
          >
            <Pencil className="size-3.5" />
          </button>
          <span className="rounded-full bg-[#f1efff] px-2 py-1 text-[10px] font-black text-[#4d49b9]">
            {translateListingText(listing.status || 'Active', t)}
          </span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="text-base font-black text-[#102a43]">
          {formatCurrency(listing.price)}
        </span>
        <span className="text-[11px] font-bold text-slate-400">
          {translateListingText(listing.postedAt || 'Recently', t)}
        </span>
      </div>

      {listing.location && (
        <p className="mt-2 flex min-w-0 items-center gap-1 text-xs font-semibold text-slate-500">
          <MapPin className="size-3.5 shrink-0" />
          <span className="truncate">{listing.location}</span>
        </p>
      )}
    </div>
  </article>
  )
}

const Sell = () => {
  const navigate = useNavigate()
  const { t } = useAppText()
  const [activeTab, setActiveTab] = useState('All')
  const [listings, setListings] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadListings = async () => {
      try {
        setIsLoading(true)
        setErrorMessage('')
        clearUserListings()

        const currentUser = getCurrentUser()
        const response = await getlistings({
          sellerId: currentUser.id,
          status: 'all',
          limit: 100,
        })
        const backendListings = (response.listings || response.data?.listings || [])
          .map(normalizeBackendListing)

        if (isMounted) {
          setListings(backendListings)
        }
      } catch (error) {
        console.error('[Sell.loadListings]', error)
        if (isMounted) {
          setListings([])
          setErrorMessage(error.response?.data?.message || 'Unable to load listings right now.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadListings()

    return () => {
      isMounted = false
    }
  }, [])

  const filteredListings =
    activeTab === 'All'
      ? listings
      : listings.filter((listing) => getListingStatus(listing) === activeTab)

  const handleViewDetails = (listing) => {
    navigate(`/listings/${getListingSubcategoryId(listing)}/${listing.id}`, {
      state: {
        product: listing,
        categoryTitle: listing.subcategory || listing.category || t('myListings'),
      },
    })
  }

  const handleEditListing = (listing) => {
    navigate(`/sell/edit/${listing.id}`, {
      state: {
        listing,
      },
    })
  }

  return (
    <div className="min-h-dvh bg-[#f7fafc] text-[#102a43]">
      <header className="sticky top-0 z-20 bg-white px-3 pb-3 pt-3">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 className="truncate text-lg font-black tracking-normal">
                {t('myListings')}
              </h1>
              <p className="text-xs font-semibold text-slate-500">
                {t('listingsSelling')}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                className="flex h-8 rounded-sm items-center justify-center gap-2 bg-[#7f7db6] px-3 text-sm font-black text-white"
                type="button"
                onClick={() => navigate('/sell/new')}
              >
                <Plus className="size-4" />
                {t('add')}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-3 px-3 pt-3">
        <section className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {tabs.map((tab) => {
            const count =
              tab === 'All'
                ? listings.length
                : listings.filter((listing) => getListingStatus(listing) === tab).length

            return (
              <button
                className={`relative h-8 shrink-0 px-2.5 text-xs font-black ${
                  activeTab === tab
                    ? 'text-[#736fdf]'
                    : 'text-slate-500'
                }`}
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
              >
                {t(tab.toLowerCase())} ({count})
                {activeTab === tab && (
                  <span className="absolute inset-x-2.5 bottom-0 h-1 bg-[#8784e2]" />
                )}
              </button>
            )
          })}
        </section>

        {isLoading ? (
          <section className="bg-white px-4 py-12 text-center ring-1 ring-slate-100">
            <PackageOpen className="mx-auto size-10 text-slate-300" />
            <h2 className="mt-3 text-base font-black text-[#102a43]">
              Loading listings...
            </h2>
          </section>
        ) : errorMessage ? (
          <section className="bg-white px-4 py-12 text-center ring-1 ring-slate-100">
            <PackageOpen className="mx-auto size-10 text-slate-300" />
            <h2 className="mt-3 text-base font-black text-[#102a43]">
              {errorMessage}
            </h2>
          </section>
        ) : filteredListings.length > 0 ? (
          <div
           className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {filteredListings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onEdit={() => handleEditListing(listing)}
                onClick={() => handleViewDetails(listing)}
              />
            ))}
          </div>
        ) : (
          <section className="bg-white px-4 py-12 text-center ring-1 ring-slate-100">
            <PackageOpen className="mx-auto size-10 text-slate-300" />
            <h2 className="mt-3 text-base font-black text-[#102a43]">
              {t('noListingsStatus', { status: t(activeTab.toLowerCase()) })}
            </h2>
            <p className="mx-auto mt-1 max-w-sm text-xs font-semibold leading-5 text-slate-500">
              {t('adminStatusMessage')}
            </p>
            <button
              className="mt-5 inline-flex h-9 rounded-sm items-center justify-center gap-2 bg-[#8b88f1] px-3 text-sm font-black text-white"
              type="button"
              onClick={() => navigate('/sell/new')}
            >
              <Plus className="size-4" />
              {t('addListing')}
            </button>
          </section>
        )}
      </main>
    </div>
  )
}

export default Sell
