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
import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCategories } from '../api/categoriesApi'
import { getlistings, normalizeProduct } from '../api/productsApi'
import { PackageOpen, Star, Sun, Moon, Sunrise, Gift, Bell, UserCircle, ArrowRight, Search } from 'lucide-react'
import bagImage from '../assets/bag.png'
import laptopImage from '../assets/laptop.png'
import mobileImage from '../assets/mobile.png'
import shoesImage from '../assets/shoes.png'
import { useAppText } from '../appText'
import { isAuthenticated, getCurrentUser } from '../services/marketplaceData'

const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return { text: 'Good Morning', icon: Sunrise }
  if (hour < 17) return { text: 'Good Afternoon', icon: Sun }
  return { text: 'Good Evening', icon: Moon }
}

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

const categoryColors = [
  'bg-indigo-600',
  'bg-purple-600',
  'bg-blue-600',
  'bg-[#2e016e]',
  'bg-fuchsia-600',
  'bg-[#4d49b9]'
]
const getCategoryColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return categoryColors[Math.abs(hash) % categoryColors.length];
}

const CategoryCard = ({ category, item, onClick }) => {
  const Icon = item.icon || ShoppingBag
  const { t } = useAppText()
  const label = t(subcategoryLabelKeys[item.id] || item.name)
  const colorClass = getCategoryColor(item.id)

  return (
    <div
      type="button"
      onClick={() => onClick(category, item)}
      className="group flex flex-col items-center justify-start gap-2 p-1 text-center transition active:scale-[0.98]"
    >
      <div className={`flex w-full aspect-square items-center justify-center text-white overflow-hidden rounded-sm ${colorClass} shadow-md border-2 border-white/50`}>
        {item.image ? (
          <img
            alt={item.name}
            className="h-full w-full object-cover rounded-sm"
            src={item.image}
          />
        ) : (
          <Icon className="size-8" strokeWidth={2.2} />
        )}
      </div>
      <span className="line-clamp-2 font-black leading-tight text-[slate-900] text-[11px] mt-1 tracking-tight">
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
            <h2 className="text-lg font-black tracking-normal text-[#2e016e]">
              {category.titleKey ? t(category.titleKey) : category.title}
            </h2>
            <button
              type="button"
              onClick={() => navigate(`/categories/${category.id}/all`)}
              className="text-sm font-bold text-[#4d49b9] hover:text-[#2e016e] transition-colors"
            >
              View All
            </button>
          </div>
          <p className=" text-xs font-semibold leading-relaxed text-indigo-900/60">
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

const featuredColors = [
  'bg-indigo-100/70',
  'bg-purple-100/70',
  'bg-blue-100/70',
]

const mockNotifications = [
  { id: 1, title: 'Welcome to Marketplace!', message: 'Start exploring deals today.', time: 'Just now', unread: true },
  { id: 2, title: 'Your Listing was Approved', message: 'Your iPhone 13 listing is now live.', time: '2 hours ago', unread: true },
  { id: 3, title: 'Price Drop Alert', message: 'A laptop in your wishlist dropped by ₹2,000.', time: '1 day ago', unread: false },
]

const FeaturedListings = ({ listings, onClick }) => {
  const { t } = useAppText()

  if (!listings || listings.length === 0) return null

  return (
    <section className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <div className="grid size-8 place-items-center rounded-full bg-white text-[#4d49b9] shadow-sm">
          <Star className="size-4" fill="currentColor" />
        </div>
        <h2 className="text-lg font-black tracking-normal text-[#2e016e]">
          {t('featuredDeals') || 'Featured Deals'}
        </h2>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-6 snap-x pt-2 px-1">
        {listings.map((item, idx) => {
          const bgColor = featuredColors[idx % featuredColors.length]
          return (
          <div
            key={item.id}
            onClick={() => onClick(item)}
            className={`group relative flex w-36 shrink-0 cursor-pointer snap-start flex-col gap-3 rounded-[2rem] ${bgColor} p-3 transition active:scale-[0.98] sm:w-44 border border-white shadow-sm hover:shadow-md`}
          >
            <div className="relative h-28 w-full overflow-hidden rounded-full bg-white p-2 sm:h-32 shadow-sm border border-white/50">
              {item.image ? (
                <img
                  alt={item.title}
                  className="h-full w-full object-contain drop-shadow-sm rounded-full"
                  src={item.image}
                />
              ) : (
                <div className="grid h-full place-items-center text-indigo-700">
                  <PackageOpen className="size-8" />
                </div>
              )}
            </div>
            <div className="flex flex-col px-1 pb-4 items-center text-center">
              <span className="mt-1.5 line-clamp-1 w-full text-xs font-black tracking-normal text-indigo-950">
                {item.nameKey ? t(item.nameKey) : item.name}
              </span>
              <span className="mt-1 text-xs font-bold text-indigo-700">
                {item.price ? `₹${item.price.toLocaleString('en-IN')}` : ''}
              </span>
            </div>
            
            <div className="absolute left-1/2 -translate-x-1/2 -bottom-3 bg-white size-8 rounded-full shadow-md flex items-center justify-center border border-slate-50 group-hover:-bottom-4 transition-all">
                <ArrowRight size={14} className="text-indigo-700" />
            </div>
          </div>
        )})}
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

  const isAuth = isAuthenticated()
  const user = isAuth ? getCurrentUser() : null
  const greeting = getGreeting()
  const GreetingIcon = greeting.icon

  const [showNotifications, setShowNotifications] = useState(false)
  const notificationsRef = useRef(null)
  
  const [rewardPoints, setRewardPoints] = useState(0)

  useEffect(() => {
    if (isAuth && user) {
      import('../api/usersApi').then(({ getProfileData }) => {
        getProfileData()
          .then((res) => {
            if (res?.profileData?.rewardPoints !== undefined) {
              setRewardPoints(res.profileData.rewardPoints)
            }
          })
          .catch((err) => console.error('[Buy.jsx] Failed to load rewards:', err))
      })
    }
  }, [isAuth, user])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    let isMounted = true

    const loadCategories = async () => {
      try {
        setIsLoadingCategories(true)
        setCategoryError('')
        const apiCategories = await getCategories()

        if (isMounted) {
          let normalized = normalizeCategories(apiCategories)
          if (user) {
            normalized = normalized.map(cat => ({
              ...cat,
              items: cat.items ? cat.items.filter(item => String(item.sellerId) !== String(user.id)) : []
            }))
          }
          setCategories(normalized)
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
          let listings = res.data.map(normalizeProduct)
          if (user) {
            listings = listings.filter(item => String(item.sellerId) !== String(user.id))
          }
          setFeaturedListings(listings)
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
    <div className="bg-transparent text-slate-900">
      <header className="relative bg-gradient-to-b from-[#9575CD] via-[#9575CD]/70 to-transparent px-4 pt-4 pb-32 text-slate-900">
        {/* Top Navbar */}
        <div className="flex items-center justify-between mb-4 relative z-50">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black tracking-tight text-slate-900">{t('marketplace') || 'Marketplace'}</h2>
          </div>
          <div className="flex items-center gap-3 relative" ref={notificationsRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition text-slate-900 shadow-sm backdrop-blur-md border border-white/30"
            >
              <Bell size={22} />
              <span className="absolute top-1 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-slate-200"></span>
            </button>
            
            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute top-full right-0 mt-2 w-64 max-w-[85vw] bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 text-slate-900">
                <div className="p-2.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
                  <h3 className="text-sm font-bold">Notifications</h3>
                  <span className="text-[10px] text-[#4d49b9] cursor-pointer font-semibold hover:underline">Mark all read</span>
                </div>
                <div className="max-h-[45vh] overflow-y-auto">
                  {mockNotifications.map(notif => (
                    <div key={notif.id} className={`p-2.5 border-b border-slate-50 hover:bg-slate-50 transition cursor-pointer flex gap-2.5 ${notif.unread ? 'bg-indigo-50/40' : ''}`}>
                       <div className="mt-1">
                          <div className={`w-1.5 h-1.5 rounded-full ${notif.unread ? 'bg-[#4d49b9]' : 'bg-transparent'}`}></div>
                       </div>
                       <div>
                         <h4 className="text-xs font-bold text-slate-900">{notif.title}</h4>
                         <p className="text-[11px] text-slate-600 mt-0.5 leading-tight">{notif.message}</p>
                         <p className="text-[9px] text-slate-500 mt-1 font-medium">{notif.time}</p>
                       </div>
                    </div>
                  ))}
                </div>
                <div className="p-2 text-center bg-slate-50/80 border-t border-slate-100">
                  <button className="text-[11px] font-bold text-[#4d49b9] hover:underline" onClick={() => setShowNotifications(false)}>Close</button>
                </div>
              </div>
            )}

            <button onClick={() => navigate('/profile')} className="p-1 rounded-full bg-white/20 hover:bg-white/30 transition text-slate-900 shadow-sm backdrop-blur-md border border-white/30">
              {isAuth && user?.profileImage ? (
                <img src={user.profileImage} alt="Profile" className="w-7 h-7 rounded-full object-cover border border-slate-200" />
              ) : (
                <div className="p-0.5"><UserCircle size={22} /></div>
              )}
            </button>
          </div>
        </div>

        <div className="pointer-events-none absolute -right-16 -top-20 size-48 rounded-full bg-white/20 blur-xl" />
        <div className="pointer-events-none absolute -left-14 bottom-[-5rem] size-40 rounded-full bg-white/20 blur-xl" />
        <div className="relative mx-auto max-w-3xl flex items-end justify-between gap-4 mt-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 opacity-90 mb-0.5 text-slate-800">
              <GreetingIcon size={14} />
              <span className="text-xs font-semibold whitespace-nowrap">{greeting.text}</span>
            </div>
            <h1 className="text-2xl font-extrabold leading-tight tracking-normal text-slate-900 truncate">
              {isAuth && (user?.full_name || user?.fullName) ? (user.full_name || user.fullName) : t('welcomeToMarketplace') || 'Welcome to Marketplace'}
            </h1>
          </div>
          
          {/* Small Glassmorphic Rewards Badge on Right */}
          <div className="shrink-0 inline-flex items-center gap-2 bg-white/30 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/40 text-slate-900 shadow-sm">
            <Gift size={18} className="text-purple-700" />
            <div className="flex flex-col items-start leading-tight">
              <span className="text-[11px] text-slate-800 font-semibold">Rewards</span>
              <span className="text-base font-black tracking-tight text-[#2e016e] leading-none">{isAuth ? rewardPoints : 0} PTS</span>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 relative z-10 -mt-20"> 
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
