// App.tsx
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import './index.css'
import MainLayout from './layouts/MainLayout'
import HomeVariant from './pages/HomeVariant'
import Services from './pages/Services'
import Team from './pages/Team'
import TeamProfile from './pages/TeamProfile'
import Blog from './pages/Blog'
import BlogPost from './pages/BlogPost'
import About from './pages/About'
import Partners from './pages/Partners'
import Contact from './pages/Contact'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import NotFound from './pages/NotFound'
import AdminLogin from './pages/admin/Login'
import AdminDashboard from './pages/admin/Dashboard'
import BlogManagement from './pages/admin/BlogManagement'
import AdminTeam from './pages/admin/AdminTeam'
import AdminPartners from './pages/admin/AdminPartners'
import AdminMessages from './pages/admin/AdminMessages'
import AdminUsers from './pages/admin/AdminUsers'
import AdminPages from './pages/admin/AdminPages'
import AdminHome from './pages/admin/AdminHome'
import AdminServices from './pages/admin/AdminServices'
import AdminAbout from './pages/admin/AdminAbout'
import AdminBanner from './pages/admin/AdminBanner'
import ProtectedRoute from './components/admin/ProtectedRoute'
import { AuthProvider } from './context/AuthProvider'
import ScrollToTop from './components/ScrollToTop'
import PageLoader from './components/PageLoader'
import Preloader from './components/Preloader'

export default function App() {
  return (
    <AuthProvider>
    <>
    <Preloader />
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Admin routes — no MainLayout */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/blog" element={<ProtectedRoute><BlogManagement /></ProtectedRoute>} />
        <Route path="/admin/team" element={<ProtectedRoute><AdminTeam /></ProtectedRoute>} />
        <Route path="/admin/partners" element={<ProtectedRoute><AdminPartners /></ProtectedRoute>} />
        <Route path="/admin/messages" element={<ProtectedRoute><AdminMessages /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/pages" element={<ProtectedRoute><AdminPages /></ProtectedRoute>} />
        <Route path="/admin/pages/home" element={<ProtectedRoute><AdminHome /></ProtectedRoute>} />
        <Route path="/admin/pages/services" element={<ProtectedRoute><AdminServices /></ProtectedRoute>} />
        <Route path="/admin/pages/about" element={<ProtectedRoute><AdminAbout /></ProtectedRoute>} />
        <Route path="/admin/pages/banner" element={<ProtectedRoute><AdminBanner /></ProtectedRoute>} />
        {/* Public routes — wrapped in MainLayout */}
        <Route element={<><PageLoader /><MainLayout><Outlet /></MainLayout></>}>
          <Route path="/" element={<HomeVariant />} />
          <Route path="/services" element={<Services />} />
          <Route path="/team" element={<Team />} />
          <Route path="/team/:slug" element={<TeamProfile />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/about" element={<About />} />
          <Route path="/partners" element={<Partners />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </>
    </AuthProvider>
  )
}
