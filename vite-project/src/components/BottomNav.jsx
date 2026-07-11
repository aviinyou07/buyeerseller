import { Gift, ShoppingBag, Store, UserRound } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useAppText } from '../appText'

const navItems = [
  { labelKey: 'buy', path: '/buy', icon: ShoppingBag },
  { labelKey: 'sell', path: '/sell', icon: Store },
  { labelKey: 'scheme', path: '/history', icon: Gift },
  { labelKey: 'profile', path: '/profile', icon: UserRound },
]

const BottomNav = () => {
  const { t } = useAppText()

  return (
    <nav className=" lg: max-w-4xl mx-auto fixed inset-x-0 bottom-0 z-20 border-t border-gray-200 bg-white px-3 pb-3 pt-2">
      <div className="mx-auto grid max-w-5xl grid-cols-4 gap-1">
        {navItems.map(({ labelKey, path, icon: Icon }) => (
          <NavLink
            className={({ isActive }) =>
              `flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-xs font-bold transition ${
                isActive
                  ? 'text-indigo-600'
                  : 'text-[#082b49]/55 '
              }`
            }
            key={path}
            to={path}
          >
            {({ isActive }) => (
              <>
                <Icon className="md:size-8 size-6" strokeWidth={2.4} />
                <span>{t(labelKey)}</span>
                <span
                  className={`h-1.5 w-1.5 rounded-full transition ${
                    isActive ? 'bg-indigo-600' : 'bg-transparent'
                  }`}
                />
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export default BottomNav
