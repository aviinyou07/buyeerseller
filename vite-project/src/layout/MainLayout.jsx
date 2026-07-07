import { Outlet } from 'react-router-dom'
import BottomNav from '../components/BottomNav'

const MainLayout = () => {
  return (
    <div className="min-h-dvh bg-[#f1f1e7]">
      <div className="min-h-dvh lg:max-w-4xl  md:max-w-6xl mx-auto bg-white pb-24">
        <Outlet />
        <BottomNav />
      </div>
    </div>
  )
}

export default MainLayout