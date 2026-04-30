import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChefHat, Home, ShoppingBag, BookOpen, User, LogOut, Package, TrendingUp, CreditCard, Clock, ShoppingCart, Coffee, TableIcon } from 'lucide-react';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Navigation items based on user role
  const getNavItems = () => {
    switch (user?.role) {
      case 'customer':
        return [
          { label: 'Dashboard', path: '/customer/dashboard', icon: Home },
          { label: 'My Orders', path: '/customer/orders', icon: BookOpen }
        ];
      case 'admin':
        return [
          { label: 'Dashboard', path: '/admin', icon: Home },
          { label: 'Menu Management', path: '/admin/menu', icon: Package },
          { label: 'Order Management', path: '/admin/orders', icon: ShoppingCart },
          { label: 'Table Management', path: '/admin/tables', icon: TableIcon },
          { label: 'Reports', path: '/admin/reports', icon: TrendingUp }
        ];
      case 'waiter':
        return [
          { label: 'Dashboard', path: '/waiter', icon: Home },
          { label: 'Active Orders', path: '/waiter/orders', icon: ShoppingCart },
          { label: 'Tables', path: '/waiter/tables', icon: Coffee },
          { label: 'History', path: '/waiter/history', icon: Clock }
        ];
      case 'kitchen':
        return [
          { label: 'Dashboard', path: '/kitchen', icon: Home },
          { label: 'Orders', path: '/kitchen/orders', icon: Package }
        ];
      case 'counter':
        return [
          { label: 'Dashboard', path: '/counter', icon: Home },
          { label: 'Billing', path: '/counter/billing', icon: CreditCard },
          { label: 'History', path: '/counter/history', icon: Clock }
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  // Check if current path matches the nav item path
  const isActive = (path) => {
    const currentPath = location.pathname;
    
    // Exact match
    if (currentPath === path) {
      return true;
    }
    
    // For dashboard, only exact match
    if (path === '/waiter' || path === '/admin' || path === '/counter' || path === '/kitchen') {
      return currentPath === path;
    }
    
    // For sub-pages, check if current path starts with the path
    // This ensures /waiter/orders is active when on /waiter/orders
    return currentPath.startsWith(path + '/');
  };

  return (
    <header style={styles.header}>
      <div style={styles.container}>
        <div style={styles.logo} onClick={() => navigate(`/${user?.role || 'login'}`)}>
          <ChefHat size={24} color="#dc2626" />
          <span style={styles.logoText}>Restaurant App</span>
        </div>

        {user?.role && (
          <nav style={styles.nav}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  style={{
                    ...styles.navButton,
                    ...(active ? styles.navButtonActive : {})
                  }}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        )}

        {user?.role && (
          <div style={styles.userMenu}>
            <span style={styles.userName}>{user.name}</span>
            <span style={styles.userRole}>{user.role}</span>
            <button onClick={handleLogout} style={styles.logoutButton}>
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

const styles = {
  header: {
    backgroundColor: "white",
    boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
    position: "sticky",
    top: 0,
    zIndex: 50
  },
  container: {
    maxWidth: "1280px",
    margin: "0 auto",
    padding: "0 1rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    height: "64px"
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    cursor: "pointer"
  },
  logoText: {
    fontSize: "1.25rem",
    fontWeight: "bold",
    color: "#1f2937"
  },
  nav: {
    display: "flex",
    gap: "0.5rem"
  },
  navButton: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.5rem 1rem",
    borderRadius: "0.5rem",
    fontSize: "0.875rem",
    fontWeight: "500",
    backgroundColor: "transparent",
    color: "#4b5563",
    border: "none",
    cursor: "pointer",
    transition: "all 0.2s"
  },
  navButtonActive: {
    backgroundColor: "#fee2e2",
    color: "#dc2626"
  },
  userMenu: {
    display: "flex",
    alignItems: "center",
    gap: "1rem"
  },
  userName: {
    fontSize: "0.875rem",
    fontWeight: "500",
    color: "#374151"
  },
  userRole: {
    fontSize: "0.75rem",
    padding: "0.25rem 0.5rem",
    backgroundColor: "#f3f4f6",
    borderRadius: "9999px",
    color: "#6b7280"
  },
  logoutButton: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.5rem 1rem",
    backgroundColor: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "0.5rem",
    fontSize: "0.875rem",
    fontWeight: "500",
    cursor: "pointer",
    transition: "background-color 0.2s"
  }
};

export default Header;