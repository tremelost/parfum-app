import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import StockPage from './pages/StockPage'
import PurchasePage from './pages/PurchasePage'
import SalesPage from './pages/SalesPage'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="stock" element={<StockPage />} />
        <Route path="purchases" element={<PurchasePage />} />
        <Route path="sales" element={<SalesPage />} />
      </Route>
    </Routes>
  )
}
