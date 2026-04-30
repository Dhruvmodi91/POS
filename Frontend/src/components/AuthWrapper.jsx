import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Login from './Login';
import Signup from './Signup';

const AuthWrapper = ({ userType, children }) => {
  const { isAuthenticated, user } = useAuth();
  const [showSignup, setShowSignup] = useState(false);

  // If user is authenticated, check role access
  if (isAuthenticated) {
    // Customer can access customer interface
    if (userType === 'customer' && user.role === 'customer') {
      return children;
    }
    // Staff can access their respective interfaces
    if (userType !== 'customer' && user.role === userType) {
      return children;
    }
    // Admin can access all interfaces
    if (user.role === 'admin') {
      return children;
    }
  }

  // Show authentication forms
  if (userType === 'customer') {
    return showSignup ? (
      <Signup onSwitchToLogin={() => setShowSignup(false)} />
    ) : (
      <Login 
        userType={userType} 
        onSwitchToSignup={() => setShowSignup(true)} 
      />
    );
  }

  return <Login userType={userType} />;
};

export default AuthWrapper;