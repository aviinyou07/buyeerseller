import {
  Bike,
  Briefcase,
  Camera,
  Car,
  ChefHat,
  Headphones,
  Home,
  Laptop,
  MonitorSpeaker,
  Refrigerator,
  Shirt,
  ShoppingBag,
  Sofa,
  Sparkles,
  Speaker,
  Table2,
  Tag,
  TabletSmartphone,
  UserRound,
  Watch,
  Waves,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCategories } from '../api/categoriesApi'
import { getlistings, normalizeProduct } from '../api/productsApi'
import { PackageOpen, Star } from 'lucide-react'
import bagImage from '../assets/bag.png'
import laptopImage from '../assets/laptop.png'
import mobileImage from '../assets/mobile.png'
import shoesImage from '../assets/shoes.png'
import { useAppText } from '../appText'

const apiOrigin = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'
).replace(/\/api\/?$/, '')

const iconBySubcategory = {
  mobile: TabletSmartphone,
  laptop: Laptop,
  iron: Waves,
  induction: ChefHat,
  headphones: Headphones,
  speaker: Speaker,
  camera: Camera,
  car: Car,
  bike: Bike,
  scooter: Bike,
  cycle: Bike,
  'auto-parts': MonitorSpeaker,
  sofa: Sofa,
  bed: Home,
  table: Table2,
  chair: Briefcase,
  mixer: ChefHat,
  fridge: Refrigerator,
  'men-wear': UserRound,
  'women-wear': Shirt,
  shoes: Sparkles,
  bags: ShoppingBag,
  watches: Watch,
}

const getImageUrl = (image) => {
  if (!image) return ''
  if (/^(https?:|data:|blob:)/i.test(image)) return image

  return `${apiOrigin}${image.startsWith('/') ? image : `/${image}`}`
}

const normalizeCategories = (apiCategories) =>
  apiCategories.map((category) => ({
    id: category.slug || String(category.id),
    title: category.title,
    titleKey: category.titleKey === category.slug ? '' : category.titleKey,
    description: category.description,
    descriptionKey:
      category.descriptionKey === `${category.slug}Desc` ? '' : category.descriptionKey,
    accent: category.accent,
    items: (category.items || category.subcategories || []).map((item) => {
      const id = item.slug || String(item.id)

      return {
        id,
        name: item.name,
        image: getImageUrl(item.imageThumbnail || item.image),
        icon: iconBySubcategory[id] || ShoppingBag,
        fields: item.fields || [],
      }
    }),
  }))

const subcategoryLabelKeys = {
  mobile: 'subMobile',
  laptop: 'subLaptop',
  iron: 'subIron',
  induction: 'subInduction',
  headphones: 'subHeadphones',
  speaker: 'subSpeaker',
  camera: 'subCamera',
  car: 'subCar',
  bike: 'subBike',
  scooter: 'subScooter',
  cycle: 'subCycle',
  'auto-parts': 'subAutoParts',
  sofa: 'subSofa',
  bed: 'subBed',
  table: 'subTable',
  chair: 'subChair',
  mixer: 'subMixer',
  fridge: 'subFridge',
  'men-wear': 'subMenWear',
  'women-wear': 'subWomenWear',
  shoes: 'subShoes',
  bags: 'subBags',
  watches: 'subWatches',
}

const CategoryCard = ({ category, item, onClick }) => {
  const Icon = item.icon || ShoppingBag
  const { t } = useAppText()
  const label = t(subcategoryLabelKeys[item.id] || item.name)

  return (
    <div
      type="button"
      onClick={() => onClick(category, item)}
      className="group flex flex-col items-center justify-start gap-2 p-1 text-center transition active:scale-[0.98]"
    >
      <div className="flex w-full aspect-square items-center justify-center text-[#0b87b8] overflow-hidden rounded-sm bg-slate-50 ring-1 ring-slate-100">
        {item.image ? (
          <img
            alt={item.name}
            className="h-full w-full object-cover"
            src={item.image}
          />
        ) : (
          <Icon className="size-8" strokeWidth={2.2} />
        )}
      </div>
      <span className="line-clamp-2 font-extrabold leading-tight text-[#102a43] text-sm">
        {label}
      </span>
    </div>
  )
}

const CategorySection = ({ category, onCardClick }) => {
  const { t } = useAppText()
  const [isExpanded, setIsExpanded] = useState(false)

  const displayedItems = isExpanded ? category.items : category.items.slice(0, 8)
  const navigate = useNavigate()

  return (
    <section>
      <div className="flex w-full items-center justify-between gap-4 text-left">
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black tracking-normal text-[#102a43]">
              {category.titleKey ? t(category.titleKey) : category.title}
            </h2>
            <button
              type="button"
              onClick={() => navigate(`/categories/${category.id}/all`)}
              className="text-sm font-bold text-blue-600 hover:text-blue-800"
            >
              View All
            </button>
          </div>
          <p className=" text-xs font-semibold leading-relaxed text-slate-500">
            {category.descriptionKey ? t(category.descriptionKey) : category.description}
          </p>
        </div>
      </div>

      <div className=" mt-3 grid grid-cols-4 gap-2.5 md:grid-cols-6">
        {displayedItems.map((item) => (
          <CategoryCard
            category={category}
            item={item}
            key={item.id}
            onClick={onCardClick}
          />
        ))}
      </div>
    </section>
  )
}

const FeaturedListings = ({ listings, onClick }) => {
  const { t } = useAppText()

  if (!listings || listings.length === 0) return null

  return (
    <section className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <div className="grid size-8 place-items-center rounded-full bg-[#f1efff] text-[#4d49b9]">
          <Star className="size-4" fill="currentColor" />
        </div>
        <h2 className="text-lg font-black tracking-normal text-[#102a43]">
          {t('featuredDeals') || 'Featured Deals'}
        </h2>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
        {listings.map((item) => (
          <div
            key={item.id}
            onClick={() => onClick(item)}
            className="group relative flex w-40 shrink-0 cursor-pointer snap-start flex-col gap-2 rounded-xl border border-slate-100 bg-white p-2 shadow-sm transition active:scale-[0.98] sm:w-48"
          >
            <div className="relative h-32 w-full overflow-hidden rounded-lg bg-[#fbfaff] p-2 sm:h-36">
              {item.image ? (
                <img
                  alt={item.title}
                  className="h-full w-full object-contain drop-shadow-sm"
                  src={item.image}
                />
              ) : (
                <div className="grid h-full place-items-center text-[#4d49b9]">
                  <PackageOpen className="size-8" />
                </div>
              )}
              <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded bg-white/95 px-1.5 py-0.5 text-[10px] font-black text-[#4d49b9] shadow-sm">
                <Star className="size-3" fill="currentColor" />
                {t('featured')}
              </span>
            </div>
            <div className="flex flex-col px-1 pb-1">
              <span className="line-clamp-2 text-sm font-black leading-tight text-[#102a43]">
                {item.title}
              </span>
              <span className="mt-1 text-sm font-bold text-[#4d49b9]">
                ₹{item.price?.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

const Buy = () => {
  const navigate = useNavigate()
  const { t } = useAppText()
  const [categories, setCategories] = useState([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [categoryError, setCategoryError] = useState('')

  const [featuredListings, setFeaturedListings] = useState([])
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(true)

  useEffect(() => {
    let isMounted = true

    const loadCategories = async () => {
      try {
        setIsLoadingCategories(true)
        setCategoryError('')
        const apiCategories = await getCategories()

        if (isMounted) {
          setCategories(normalizeCategories(apiCategories))
        }
      } catch (error) {
        console.error('[Buy.loadCategories]', error)

        if (isMounted) {
          setCategoryError('Unable to load categories right now.')
        }
      } finally {
        if (isMounted) {
          setIsLoadingCategories(false)
        }
      }
    }

    const loadFeatured = async () => {
      try {
        setIsLoadingFeatured(true)
        const res = await getlistings({ isFeatured: true, limit: 10 })
        if (isMounted && res && res.data) {
          setFeaturedListings(res.data.map(normalizeProduct))
        }
      } catch (error) {
        console.error('[Buy.loadFeatured]', error)
      } finally {
        if (isMounted) setIsLoadingFeatured(false)
      }
    }

    loadCategories()
    loadFeatured()

    return () => {
      isMounted = false
    }
  }, [])

  const handleCardClick = (category, item) => {
    navigate(`/categories/${category.id}/${item.id}`)
  }

  const handleFeaturedClick = (item) => {
    navigate(`/categories/${item.category || item.categoryId || 'all'}/${item.id}`)
  }

  return (
    <div className="min-h-dvh bg-white text-[#082b49]">
      <header className="relative overflow-hidden 
       bg-gradient-to-br from-[#fbfaff] via-[#e6e4ff] to-[#b9b6ff]  px-3 pb-3 pt-6 text-[#102a43]">
        <div className="pointer-events-none absolute -right-16 -top-20 size-48 rounded-full bg-white/25" />
        <div className="pointer-events-none absolute -left-14 bottom-[-5rem] size-40 rounded-full bg-white/20" />
        <div className="relative mx-auto max-w-3xl">
          <section className="overflow-hidden bg-gradient-to-br from-[#ffffff]/28 via-[#eeeaff]/20 to-[#c7c4ff]/10 p-1">
            <div className="flex min-h-40 items-center justify-between gap-3 sm:min-h-44 sm:gap-4">
              <div className="max-w-[58%] sm:max-w-[58%]">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-[#4d49b9]">
                  <Tag className="size-3.5" />
                  {t('marketplace')}
                </div>
                <h1 className="text-3xl font-black leading-tight tracking-normal text-[#102a43]">
                  {t('buyHeroTitle')}
                </h1>
                <p className="mt-2 text-sm font-semibold leading-5 text-[#102a43]/64">
                  {t('buyHeroSubtitle')}
                </p>
                <button
                  className="mt-5 rounded-lg bg-white px-5 py-2 text-sm font-black text-[#4d49b9]"
                  type="button"
                >
                  {t('exploreDeals')}
                </button>
              </div>

              <div className="relative h-40 min-w-32 flex-1 sm:h-44 sm:min-w-44">
                <div className="absolute right-1 top-4 grid size-24 place-items-center rounded-[2rem] bg-white/70 shadow-sm ring-1 ring-white/80 sm:right-2 sm:top-2 sm:size-30">
                  <img
                    alt=""
                    className="h-20 w-20 object-contain md:h-26 md:w-26"
                    src={laptopImage}
                  />
                </div>
                <div className="absolute bottom-5 right-20 grid size-16 place-items-center rounded-2xl bg-white/90 shadow-sm ring-1 ring-white/80 sm:bottom-3 sm:right-26 sm:size-18">
                  <img
                    alt=""
                    className="h-12 w-12 object-contain sm:h-14 sm:w-14"
                    src={mobileImage}
                  />
                </div>
                <div className="absolute bottom-2 right-2 grid size-15 place-items-center rounded-2xl bg-white/85 shadow-sm ring-1 ring-white/80 sm:right-3 sm:size-17">
                  <img
                    alt=""
                    className="h-11 w-11 object-contain sm:h-13 sm:w-13"
                    src={bagImage}
                  />
                </div>
                <div className="absolute right-21 top-2 grid size-13 place-items-center rounded-2xl bg-white/80 shadow-sm ring-1 ring-white/80 sm:right-30 sm:top-3 sm:size-15">
                  <img
                    alt=""
                    className="h-10 w-10 object-contain sm:h-12 sm:w-12"
                    src={shoesImage}
                  />        
                </div>
                {/* <div className="absolute right-18 top-24 grid size-11 place-items-center rounded-full bg-white/90 shadow-sm ring-1 ring-white/80 sm:right-18 sm:top-29 sm:size-13">
                  <img
                    alt=""
                    className="h-8 w-8 object-contain sm:h-10 sm:w-10"
                    src={watchImage}
                  />
                </div> */}
              </div>
            </div>
          </section>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pt-3"> 
        <div className="space-y-4">
          
          {isLoadingFeatured ? (
            <section className="mb-6 space-y-3">
              <div className="h-5 w-44 animate-pulse rounded bg-slate-100" />
              <div className="flex gap-4 overflow-hidden pb-4">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="h-48 w-40 shrink-0 animate-pulse rounded-xl bg-slate-100 sm:w-48" />
                ))}
              </div>
            </section>
          ) : (
            <FeaturedListings listings={featuredListings} onClick={handleFeaturedClick} />
          )}

          {isLoadingCategories ? (
            Array.from({ length: 4 }).map((_, index) => (
              <section className="space-y-3" key={index}>
                <div className="h-5 w-44 animate-pulse rounded bg-slate-100" />
                <div className="grid grid-cols-4 gap-3 md:grid-cols-6">
                  {Array.from({ length: 6 }).map((__, itemIndex) => (
                    <div
                      className="flex flex-col items-center gap-2"
                      key={itemIndex}
                    >
                      <div className="size-20 animate-pulse rounded-full bg-slate-100" />
                      <div className="h-3 w-14 animate-pulse rounded bg-slate-100" />
                    </div>
                  ))}
                </div>
              </section>
            ))
          ) : categoryError ? (
            <section className="rounded-lg bg-red-50 px-4 py-5 text-center text-sm font-black text-red-600">
              {categoryError}
            </section>
          ) : categories.length > 0 ? (
            categories.map((category) => (
              <CategorySection
                category={category}
                key={category.id}
                onCardClick={handleCardClick}
              />
            ))
          ) : (
            <section className="rounded-lg bg-slate-50 px-4 py-5 text-center text-sm font-black text-slate-500">
              No categories found.
            </section>
          )}
        </div>
      </main>

    </div>
  )
}

export default Buy
