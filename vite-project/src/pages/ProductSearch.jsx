import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  Clock3,
  MapPin,
  Search,
} from 'lucide-react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { getlistings, normalizeProduct } from '../api/productsApi'
import { useAppText } from '../appText'
import { readJSON, writeJSON } from '../services/marketplaceData'

const subcategoryNames = {
  mobile: 'Mobiles',
  laptop: 'Laptops',
  iron: 'Irons',
  induction: 'Induction Cooktops',
  headphones: 'Headphones',
  speaker: 'Speakers',
  camera: 'Cameras',
  car: 'Cars',
  bike: 'Bikes',
  scooter: 'Scooters',
  cycle: 'Cycles',
  'auto-parts': 'Auto Parts',
  property: 'Property',
  sofa: 'Sofas',
  bed: 'Beds',
  table: 'Tables',
  chair: 'Chairs',
  mixer: 'Mixers',
  fridge: 'Fridges',
  'men-wear': 'Men Wear',
  'women-wear': 'Women Wear',
  shoes: 'Shoes',
  bags: 'Bags',
  watches: 'Watches',
}

const subcategoryNameKeys = {
  mobile: 'subMobiles',
  laptop: 'subLaptops',
  iron: 'subIrons',
  induction: 'subInductionCooktops',
  headphones: 'subHeadphones',
  speaker: 'subSpeakers',
  camera: 'subCameras',
  car: 'subCars',
  bike: 'subBikes',
  scooter: 'subScooters',
  cycle: 'subCycles',
  'auto-parts': 'subAutoParts',
  property: 'subProperty',
  sofa: 'subSofas',
  bed: 'subBeds',
  table: 'subTables',
  chair: 'subChairs',
  mixer: 'subMixers',
  fridge: 'subFridges',
  'men-wear': 'subMenWear',
  'women-wear': 'subWomenWear',
  shoes: 'subShoes',
  bags: 'subBags',
  watches: 'subWatches',
}

const categoryBySubcategory = {
  mobile: 'electronics',
  laptop: 'electronics',
  iron: 'home-kitchen',
  induction: 'home-kitchen',
  headphones: 'electronics',
  speaker: 'electronics',
  camera: 'electronics',
  car: 'vehicles',
  bike: 'vehicles',
  scooter: 'vehicles',
  cycle: 'vehicles',
  'auto-parts': 'vehicles',
  property: 'property',
  sofa: 'home-kitchen',
  bed: 'home-kitchen',
  table: 'home-kitchen',
  chair: 'home-kitchen',
  mixer: 'home-kitchen',
  fridge: 'home-kitchen',
  'men-wear': 'fashion',
  'women-wear': 'fashion',
  shoes: 'fashion',
  bags: 'fashion',
  watches: 'fashion',
}

const subcategoryKeywords = {
  mobile: ['mobile', 'mobiles', 'phone', 'phones', 'smartphone', 'iphone'],
  laptop: ['laptop', 'laptops', 'macbook', 'notebook', 'computer'],
  iron: ['iron', 'steam iron', 'dry iron'],
  induction: ['induction', 'cooktop'],
  headphones: ['headphone', 'headphones', 'earphone', 'earphones', 'earbuds'],
  speaker: ['speaker', 'speakers'],
  camera: ['camera', 'cameras', 'dslr'],
  car: ['car', 'cars'],
  bike: ['bike', 'bikes', 'motorcycle'],
  scooter: ['scooter', 'scooters', 'activa'],
  cycle: ['cycle', 'cycles', 'bicycle'],
  sofa: ['sofa', 'couch'],
  bed: ['bed', 'beds'],
  table: ['table', 'tables'],
  chair: ['chair', 'chairs'],
  fridge: ['fridge', 'refrigerator'],
  watches: ['watch', 'watches', 'smartwatch'],
}

const normalize = (value) => String(value || '').trim().toLowerCase()

const getSearchTarget = (query, fallbackSubcategory, fallbackCategory) => {
  const queryText = normalize(query)
  if (!queryText) {
    return {
      categoryId: fallbackCategory,
      subcategoryId: fallbackSubcategory,
    }
  }

  const matchedSubcategory = Object.keys(subcategoryNames).find((id) => {
    const terms = [
      id,
      subcategoryNames[id],
      subcategoryNames[id]?.replace(/s$/i, ''),
      ...(subcategoryKeywords[id] || []),
    ]

    return terms.some((term) => queryText.includes(normalize(term)))
  })

  const nextSubcategory = matchedSubcategory || fallbackSubcategory

  return {
    categoryId: categoryBySubcategory[nextSubcategory] || fallbackCategory,
    subcategoryId: nextSubcategory,
  }
}

const getDynamicSearchValues = (product) =>
  Array.isArray(product.overviewFields)
    ? product.overviewFields.flatMap((field) => [field.label, field.value])
    : []

const searchTextKeys = {
  'Like New': 'likeNew',
  Good: 'good',
  Fair: 'fair',
  'With Warranty': 'withWarranty',
  'No Warranty': 'noWarranty',
}

const translateSearchText = (value, t) => t(searchTextKeys[value] || value)

const listingsearch = () => {
  const navigate = useNavigate()
  const { t } = useAppText()
  const { categoryId = 'electronics', subcategoryId = 'mobile' } = useParams()
  const [searchParams] = useSearchParams()
  const selectedTitle = t(subcategoryNameKeys[subcategoryId] || subcategoryNames[subcategoryId] || 'listings')
  const recentKey = `recent_${subcategoryId}_searches`
  const [productQuery, setProductQuery] = useState(searchParams.get('query') || '')
  const [locationQuery, setLocationQuery] = useState(searchParams.get('location') || '')
  const [activeField, setActiveField] = useState('product')
  const [recentSearches, setRecentSearches] = useState(() => readJSON(recentKey, []))
  const [listings, setlistings] = useState([])
  const [isLoadinglistings, setIsLoadinglistings] = useState(true)

  useEffect(() => {
    let isMounted = true

    const loadlistings = async () => {
      try {
        setIsLoadinglistings(true)
        const response = await getlistings({
          limit: 100,
        })
        const nextlistings = (response.listings || response.data?.listings || [])
          .map(normalizeProduct)

        if (isMounted) {
          setlistings(nextlistings)
        }
      } catch (error) {
        console.error('[listingsearch.loadlistings]', error)
        if (isMounted) {
          setlistings([])
        }
      } finally {
        if (isMounted) {
          setIsLoadinglistings(false)
        }
      }
    }

    loadlistings()

    return () => {
      isMounted = false
    }
  }, [])

  const locations = useMemo(
    () => [...new Set(listings.map((product) => product.location).filter(Boolean))].sort(),
    [listings],
  )

  const listingsuggestions = useMemo(() => {
    const typed = normalize(productQuery)
    const values = [
      ...listings.flatMap((product) => [
        product.title,
        product.brand,
        product.model,
        product.storage,
        product.ram,
        product.condition,
        product.warranty,
        ...getDynamicSearchValues(product),
      ]),
    ].filter(Boolean)
    const uniqueValues = [...new Set(values)]

    return uniqueValues
      .filter((value) => !typed || normalize(value).includes(typed))
      .slice(0, 8)
  }, [productQuery, listings])

  const locationSuggestions = useMemo(() => {
    const typed = normalize(locationQuery)

    return locations
      .filter((location) => !typed || normalize(location).includes(typed))
      .slice(0, 8)
  }, [locationQuery, locations])

  const saveRecentSearch = (product = productQuery, location = locationQuery) => {
    const nextProduct = product.trim()
    const nextLocation = location.trim()
    if (!nextProduct && !nextLocation) return

    const nextSearch = {
      id: `${nextProduct}-${nextLocation}`.toLowerCase(),
      product: nextProduct,
      location: nextLocation,
    }
    const nextSearches = [
      nextSearch,
      ...recentSearches.filter((item) => item.id !== nextSearch.id),
    ].slice(0, 6)

    setRecentSearches(nextSearches)
    writeJSON(recentKey, nextSearches)
  }

  const goToResults = (product = productQuery, location = locationQuery) => {
    const params = new URLSearchParams()
    const nextProduct = product.trim()
    const nextLocation = location.trim()
    const target = getSearchTarget(nextProduct, subcategoryId, categoryId)

    if (nextProduct) params.set('query', nextProduct)
    if (nextLocation) params.set('location', nextLocation)
    saveRecentSearch(nextProduct, nextLocation)
    navigate(
      `/categories/${target.categoryId}/${target.subcategoryId}${
        params.toString() ? `?${params.toString()}` : ''
      }`,
    )
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    goToResults()
  }

  const handleRecentClick = (item) => {
    setProductQuery(item.product || '')
    setLocationQuery(item.location || '')
    goToResults(item.product || '', item.location || '')
  }

  const handleSuggestionClick = (value) => {
    setProductQuery(value)
    setActiveField('location')
  }

  const handleLocationClick = (value) => {
    setLocationQuery(value)
    goToResults(productQuery, value)
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
    writeJSON(recentKey, [])
  }

  return (
    <div className="min-h-dvh  text-[#102a43]">
      <header className="sticky top-0 z-30 border-b border-white/80 bg-gradient-to-br from-[#ffffff] via-[#f1efff] to-[#e6e4ff] px-3 pb-4 pt-3">
        <div className="mx-auto max-w-5xl space-y-3">
          <div className="flex items-center gap-3">
            <button
              aria-label={t('back')}
              className="grid size-10 shrink-0 place-items-center rounded-full border border-white/90 bg-white text-[#102a43] shadow-sm shadow-[#8f8cf5]/10 transition active:scale-95"
              type="button"
              onClick={() => navigate(`/categories/${categoryId}/${subcategoryId}`)}
            >
              <ArrowLeft className="size-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-lg font-black">{t('searchInCategory', { category: selectedTitle })}</h1>
              <p className="text-xs font-semibold text-[#102a43]/58">
                {t('resultsIn', { category: selectedTitle })}
              </p>
            </div>
          </div>

          <form className="space-y-2" onSubmit={handleSubmit}>
            <label className="flex h-12 items-center gap-2 rounded-sm bg-white px-3 ">
              <Search className="size-5 shrink-0 text-slate-500" />
              <input
                autoFocus
                className="h-full min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-slate-400"
                placeholder={t('productBrandModel')}
                type="search"
                value={productQuery}
                onFocus={() => setActiveField('product')}
                onChange={(event) => {
                  setProductQuery(event.target.value)
                  setActiveField('product')
                }}
              />
            </label>
            <label className="flex h-11 items-center gap-2 rounded-sm bg-white px-3 ">
              <MapPin className="size-4 shrink-0 text-slate-500" />
              <input
                className="h-full min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-slate-400"
                placeholder={t('searchLocation')}
                type="search"
                value={locationQuery}
                onFocus={() => setActiveField('location')}
                onChange={(event) => {
                  setLocationQuery(event.target.value)
                  setActiveField('location')
                }}
              />
            </label>
            <button
              className="h-11 w-full rounded-sm bg-[#7f7db6] text-sm font-black text-white"
              type="submit"
            >
              {t('searchMarketplace')}
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-4 px-3 pt-3">
        {activeField === 'location' ? (
          <section>
            <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase text-slate-400">
              <MapPin className="size-3.5" />
              {t('locationSuggestions')}
            </div>
            <div className="overflow-hidden  bg-white ">
              {locationSuggestions.length > 0 ? (
                locationSuggestions.map((location) => (
                  <button
                    className="flex h-11 w-full items-center gap-2 px-3 text-left text-sm font-bold text-[#102a43]"
                    key={location}
                    type="button"
                    onClick={() => handleLocationClick(location)}
                  >
                    <MapPin className="size-4 shrink-0 text-slate-400" />
                    {location}
                  </button>
                ))
              ) : (
                <p className="px-3 py-4 text-sm font-semibold text-slate-500">
                  {t('noLocationsFound')}
                </p>
              )}
            </div>
          </section>
        ) : (
          <section>
            <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase text-slate-400">
              <Search className="size-3.5" />
              {t('suggestions')}
            </div>
            <div className="overflow-hidden  bg-white">
              {isLoadinglistings ? (
                <p className="px-3 py-4 text-sm font-semibold text-slate-500">
                  Loading listings...
                </p>
              ) : listingsuggestions.length > 0 ? (
                listingsuggestions.map((suggestion) => (
                  <button
                    className="flex h-11 w-full items-center gap-2 px-3 text-left text-sm font-bold text-[#102a43]"
                    key={suggestion}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <Search className="size-4 shrink-0 text-slate-400" />
                    <span className="truncate">{translateSearchText(suggestion, t)}</span>
                  </button>
                ))
              ) : (
                <p className="px-3 py-4 text-sm font-semibold text-slate-500">
                  {t('nolistingsFound')}
                </p>
              )}
            </div>
          </section>
        )}

        {recentSearches.length > 0 && (
          <section>
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-black uppercase text-slate-400">
                <Clock3 className="size-3.5" />
                {t('recentSearches')}
              </div>
              <button
                className="text-xs font-black text-[#4d49b9]"
                type="button"
                onClick={clearRecentSearches}
              >
                {t('clearAll')}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((item) => (
                <button
                  className="rounded-full bg-white px-3 py-1.5 text-xs font-black text-[#4d49b9] ring-1 ring-[#ded2ff]"
                  key={item.id}
                  type="button"
                  onClick={() => handleRecentClick(item)}
                >
                  {[item.product, item.location].filter(Boolean).join(t('inSeparator'))}
                </button>
              ))}
            </div>
          </section>
        )}

      </main>
    </div>
  )
}

export default listingsearch
