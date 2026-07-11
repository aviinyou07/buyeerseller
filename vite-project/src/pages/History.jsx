import {
  BadgeIndianRupee,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  FileCheck2,
  Landmark,
  UsersRound,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { getSchemes } from '../api/schemesApi'
import { useAppText } from '../appText'

const statusStyles = {
  Open: 'bg-emerald-50 text-emerald-600',
  Active: 'bg-emerald-50 text-emerald-600',
  New: 'bg-[#f1efff] text-[#4d49b9]',
  'Closing Soon': 'bg-amber-50 text-amber-600',
  Closed: 'bg-slate-100 text-slate-500',
  Expired: 'bg-red-50 text-red-600',
  Inactive: 'bg-slate-100 text-slate-500',
}

const statusKeyByValue = {
  Open: 'open',
  Active: 'active',
  New: 'newScheme',
  'Closing Soon': 'closingSoon',
  Closed: 'closed',
  Expired: 'expired',
  Inactive: 'inactive',
}

const formatDate = (value) => {
  if (!value) return ''

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

const normalizeScheme = (scheme) => ({
  id: scheme.displayId || `SCH-${scheme.id}`,
  rawId: scheme.id,
  title: scheme.name || scheme.title || '',
  department: scheme.department || '',
  category: scheme.category || '',
  benefit:
    scheme.benefits ||
    scheme.description ||
    scheme.benefit ||
    '',
  eligibility: scheme.eligibility || '',
  deadline: formatDate(scheme.deadline),
  status: scheme.status || '',
  statusKey: statusKeyByValue[scheme.status] || '',
  link: scheme.link || '',
})

const isOpenScheme = (scheme) =>
  ['Open', 'Active'].includes(scheme.status)

const SchemeCard = ({ scheme }) => {
  const { t } = useAppText()
  const schemeText = scheme
  const openSchemeLink = () => {
    if (scheme.link) {
      window.open(scheme.link, '_blank', 'noreferrer')
    }
  }

  return (
  <article className="border border-slate-100 bg-white p-3">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded bg-[#f1efff] px-2 py-1 text-[10px] font-black text-[#4d49b9]">
            {scheme.id}
          </span>
          {scheme.status && (
            <span
              className={`rounded-full px-2 py-1 text-[10px] font-black ${
                statusStyles[scheme.status] || 'bg-slate-100 text-slate-500'
              }`}
            >
              {scheme.statusKey ? t(scheme.statusKey) : scheme.status}
            </span>
          )}
        </div>

        <h2 className="mt-2 text-base font-black leading-5 text-[#102a43]">
          {schemeText.title}
        </h2>
        <p className="mt-1 flex items-center gap-1.5 text-xs font-bold text-slate-500">
          <Landmark className="size-3.5 shrink-0" />
          <span className="truncate">{schemeText.department}</span>
        </p>
      </div>

      <button
        aria-label={t('viewDetails')}
        className="grid size-9 shrink-0 place-items-center rounded-full bg-[#f7fafc] text-[#102a43]"
        type="button"
        onClick={openSchemeLink}
      >
        <ChevronRight className="size-5" />
      </button>
    </div>

    <div className="mt-3 grid grid-cols-1 gap-2">
      <div className="rounded-lg bg-[#f7fafc] p-2.5">
        <p className="flex items-center gap-1.5 text-[11px] font-black uppercase text-slate-400">
          <BadgeIndianRupee className="size-3.5" />
          {t('benefit')}
        </p>
        <p className="mt-1 text-xs font-bold leading-5 text-[#102a43]">
          {schemeText.benefit}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div className="rounded-lg bg-[#f7fafc] p-2.5">
          <p className="flex items-center gap-1.5 text-[11px] font-black uppercase text-slate-400">
            <UsersRound className="size-3.5" />
            {t('eligibility')}
          </p>
          <p className="mt-1 line-clamp-2 text-xs font-bold leading-5 text-[#102a43]">
            {schemeText.eligibility}
          </p>
        </div>
        <div className="rounded-lg bg-[#f7fafc] p-2.5">
          <p className="flex items-center gap-1.5 text-[11px] font-black uppercase text-slate-400">
            <CalendarDays className="size-3.5" />
            {t('deadline')}
          </p>
          <p className="mt-1 text-xs font-bold leading-5 text-[#102a43]">
            {scheme.deadline}
          </p>
        </div>
      </div>
    </div>

    <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
      <span className="rounded-md bg-white px-2.5 py-1 text-xs font-black text-slate-600 ring-1 ring-slate-200">
        {schemeText.category}
      </span>
      <button
        className="h-10 rounded-md bg-gradient-to-r from-indigo-600 to-purple-600 px-4 text-xs font-black text-white shadow-sm shadow-indigo-200 transition hover:opacity-90 active:scale-95"
        type="button"
        onClick={openSchemeLink}
      >
        {t('viewDetails')}
      </button>
    </div>
  </article>
  )
}

const SchemeCardSkeleton = () => (
  <article className="border border-slate-100 bg-white p-3">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <div className="h-5 w-28 animate-pulse rounded bg-slate-100" />
        <div className="mt-3 h-5 w-3/4 animate-pulse rounded bg-slate-100" />
        <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-slate-100" />
      </div>
      <div className="size-9 animate-pulse rounded-full bg-slate-100" />
    </div>
    <div className="mt-3 h-20 animate-pulse rounded-lg bg-slate-100" />
    <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
      <div className="h-20 animate-pulse rounded-lg bg-slate-100" />
      <div className="h-20 animate-pulse rounded-lg bg-slate-100" />
    </div>
  </article>
)

const History = () => {
  const { t } = useAppText()
  const [schemes, setSchemes] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadSchemes = async () => {
      try {
        setIsLoading(true)
        setError('')
        const apiSchemes = await getSchemes()

        if (isMounted) {
          setSchemes(apiSchemes.map(normalizeScheme))
        }
      } catch (loadError) {
        console.error('[History.loadSchemes]', loadError)

        if (isMounted) {
          setError('Unable to load schemes right now.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadSchemes()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="min-h-dvh bg-[#f7fafc] text-[#102a43]">
      <header className="sticky top-0 z-20 border-b border-slate-100 bg-white px-3 pb-3 pt-3">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-indigo-50 text-indigo-600 shadow-sm">
              <Building2 className="size-5" />
            </span>
            <div className="min-w-0">
              <h1 className="text-lg font-black tracking-normal">
                {t('governmentSchemes')}
              </h1>
              <p className="text-xs font-semibold text-slate-500">
                {t('schemeSubtitle')}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-3 px-3 pt-3">
        <section className="grid grid-cols-2 gap-2 sm:grid-cols-2">
          <div className="bg-white p-3 ring-1 ring-slate-100 rounded-xl shadow-sm">
            <FileCheck2 className="size-5 text-indigo-600" />
            <p className="mt-2 text-lg font-black">{schemes.length}</p>
            <p className="text-xs font-bold text-slate-500">{t('totalSchemes')}</p>
          </div>
          <div className="bg-white p-3 ring-1 ring-slate-100">
            <CheckCircle2 className="size-5 text-emerald-600" />
            <p className="mt-2 text-lg font-black">
              {schemes.filter(isOpenScheme).length}
            </p>
            <p className="text-xs font-bold text-slate-500">{t('openNow')}</p>
          </div>
        </section>

        {error && (
          <section className="rounded-lg bg-red-50 px-4 py-5 text-center text-sm font-black text-red-600">
            {error}
          </section>
        )}

        <section className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {isLoading
            ? Array.from({ length: 4 }).map((_, index) => (
                <SchemeCardSkeleton key={index} />
              ))
            : schemes.map((scheme) => (
                <SchemeCard key={scheme.id} scheme={scheme} />
              ))}
        </section>

        {!isLoading && !error && schemes.length === 0 && (
          <section className="rounded-lg bg-white px-4 py-12 text-center ring-1 ring-slate-100">
            <p className="text-base font-black">{t('totalSchemes')}: 0</p>
          </section>
        )}
      </main>
    </div>
  )
}

export default History
