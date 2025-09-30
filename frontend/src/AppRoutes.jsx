import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import AddProduct from './pages/AddProduct';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import OrderHistory from './pages/OrderHistory';
import UserProfile from './pages/UserProfile';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Category from './pages/Category';
import UpdateProduct from './pages/UpdateProduct';
import CategoryPage from './pages/CategoryPage';
import AddressManagement from './pages/AddressManagement';

const AppRoutes = () => {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={
          !isAuthenticated ? (
            <Login />
          ) : isAdmin ? (
            <Navigate to="/admin/home" />
          ) : (
            <Navigate to="/products" />
          )
        }
      />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/admin/home"
        element={
          <AdminRoute>
            <Home />
          </AdminRoute>
        }
      />
      <Route path="/products" element={<ProductList />} />
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/category/:categoryName" element={<CategoryPage />} />
      <Route
        path="/category"
        element={
          <AdminRoute>
            <Category />
          </AdminRoute>
        }
      />
      <Route
        path="/add-product"
        element={
          <AdminRoute>
            <AddProduct />
          </AdminRoute>
        }
      />
      <Route
        path="/add-product/:category_name"
        element={
          <AdminRoute>
            <AddProduct />
          </AdminRoute>
        }
      />
      <Route
        path="/cart"
        element={
          <ProtectedRoute>
            <Cart />
          </ProtectedRoute>
        }
      />
      <Route
        path="/checkout"
        element={
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        }
      />
      <Route
        path="/order-confirmation"
        element={
          <ProtectedRoute>
            <OrderConfirmation />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        }
      />
              <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <OrderHistory />
                </ProtectedRoute>
              }
            />
              <Route
              path="/product/update/:id"
              element={
                <AdminRoute>
                  <UpdateProduct />
                </AdminRoute>
              }
            />
            <Route
              path="/addresses"
              element={
                <ProtectedRoute>
                  <AddressManagement />
                </ProtectedRoute>
              }
            />
          </Routes>
        );
      };
export default AppRoutes;