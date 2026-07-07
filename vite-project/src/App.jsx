import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import MainLayout from './layout/MainLayout'
import AddListing from './pages/AddListing'
import Buy from './pages/Buy'
import History from './pages/History'
import Login from './pages/Login'
import ProductDetail from './pages/ProductDetail'
import ProductReviews from './pages/ProductReviews'
import ProductSearch from './pages/ProductSearch'
import Profile from './pages/Profile'
import Sell from './pages/Sell'
import Signup from './pages/Signup'
import SplashScreen from './pages/SplashScreen'
import SubcategoryListing from './pages/SubcategoryListing'
import { isAuthenticated } from './services/marketplaceData'

const ProtectedRoute = ({ children }) => {
  const location = useLocation()

  return isAuthenticated()
    ? children
    : <Navigate replace to="/login" state={{ from: location.pathname }} />
}

const App = () => {
  const { pathname } = useLocation()
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    const splashTimer = window.setTimeout(() => {
      setShowSplash(false)
    }, 3000)

    return () => window.clearTimeout(splashTimer)
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 })
  }, [pathname])

  if (showSplash) {
    return <SplashScreen />
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate replace to="/buy" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route element={<MainLayout />}>
        <Route path="/buy" element={<Buy />} />
        <Route
          path="/categories/:categoryId/:subcategoryId"
          element={<SubcategoryListing />}
        />
        <Route
          path="/categories/:categoryId/:subcategoryId/search"
          element={<ProductSearch />}
        />
        <Route
          path="/listings/:subcategoryId/:productId"
          element={<ProductDetail />}
        />
        <Route
          path="/listings/:subcategoryId/:productId/reviews"
          element={<ProductReviews />}
        />
        <Route
          path="/sell"
          element={
            <ProtectedRoute>
              <Sell />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sell/new"
          element={
            <ProtectedRoute>
              <AddListing />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sell/edit/:listingId"
          element={
            <ProtectedRoute>
              <AddListing />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="/buyer/settings" element={<Navigate replace to="/profile" />} />
        <Route path="/settings" element={<Navigate replace to="/profile" />} />
      </Route>
    </Routes>
  )
}

export default App
