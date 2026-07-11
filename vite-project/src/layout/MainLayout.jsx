import { Outlet } from 'react-router-dom'
import BottomNav from '../components/BottomNav'

const MainLayout = () => {
  return (
    <div className="min-h-dvh bg-gradient-to-b from-[#e6e6fa] to-white text-[#082b49]">
      <div className="min-h-dvh lg:max-w-4xl md:max-w-6xl mx-auto pb-24">
        {/* We use an Outlet to render the child routes */}
        <Outlet />
        <BottomNav />
      </div>
    </div>
  )
}

export default MainLayout