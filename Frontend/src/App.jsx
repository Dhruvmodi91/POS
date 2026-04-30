import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { RestaurantProvider } from "./context/RestaurantContext";

// Components
import Login from "./components/Login";
import Signup from "./components/Signup";
import CustomerOrderJourney from "./components/CustomerOrderJourney";
import CustomerOrders from "./components/CustomerOrders";
import AdminScreen from "./components/AdminScreen";
import WaiterInterface from "./components/WaiterInterface";
import KitchenScreen from "./components/KitchenScreen";
import CounterScreen from "./components/CounterScreen";
import Header from "./components/Header";

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!token) {
    return <Navigate to="/login" />;
  }

  // Check role-based access
  if (requiredRole && user.role !== requiredRole && user.role !== "admin") {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

// Layout Component
const Layout = () => {
  const location = useLocation();

  const hideHeaderRoutes = [
    "/login",
    "/signup",
    "/customer/login",
    "/customer/signup"
  ];

  const shouldHideHeader = hideHeaderRoutes.includes(location.pathname);

  return (
    <>
      {!shouldHideHeader && <Header />}
      <Routes>
        {/* Public Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Customer Routes */}
        <Route
          path="/customer/dashboard"
          element={
            <ProtectedRoute requiredRole="customer">
              <CustomerOrderJourney />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/orders"
          element={
            <ProtectedRoute requiredRole="customer">
              <CustomerOrders />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/menu"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/tables"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminScreen />
            </ProtectedRoute>
          }
        />

        {/* Waiter Routes */}
        <Route
          path="/waiter"
          element={
            <ProtectedRoute requiredRole="waiter">
              <WaiterInterface />
            </ProtectedRoute>
          }
        />
        <Route
          path="/waiter/orders"
          element={
            <ProtectedRoute requiredRole="waiter">
              <WaiterInterface />
            </ProtectedRoute>
          }
        />
        <Route
          path="/waiter/tables"
          element={
            <ProtectedRoute requiredRole="waiter">
              <WaiterInterface />
            </ProtectedRoute>
          }
        />
        <Route
          path="/waiter/history"
          element={
            <ProtectedRoute requiredRole="waiter">
              <WaiterInterface />
            </ProtectedRoute>
          }
        />

        {/* Kitchen Routes */}
        <Route
          path="/kitchen"
          element={
            <ProtectedRoute requiredRole="kitchen">
              <KitchenScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/kitchen/orders"
          element={
            <ProtectedRoute requiredRole="kitchen">
              <KitchenScreen />
            </ProtectedRoute>
          }
        />

        {/* Counter Routes */}
        <Route
          path="/counter"
          element={
            <ProtectedRoute requiredRole="counter">
              <CounterScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/counter/billing"
          element={
            <ProtectedRoute requiredRole="counter">
              <CounterScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/counter/history"
          element={
            <ProtectedRoute requiredRole="counter">
              <CounterScreen />
            </ProtectedRoute>
          }
        />

        {/* Unauthorized Page */}
        <Route
          path="/unauthorized"
          element={
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <h1 className="text-2xl font-bold text-red-600 mb-4">Unauthorized Access</h1>
                <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
                <button
                  onClick={() => window.location.href = '/login'}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Go to Login
                </button>
              </div>
            </div>
          }
        />

        {/* Default Route */}
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <RestaurantProvider>
          <Layout />
        </RestaurantProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;