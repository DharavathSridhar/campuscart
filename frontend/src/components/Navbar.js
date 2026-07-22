import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../hooks/useNotifications';
import { FiMenu, FiX, FiBell, FiUser, FiHeart, FiMessageCircle, FiLogOut, FiHome, FiGrid, FiPlus, FiSun } from 'react-icons/fi';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); setProfileOpen(false); };

  return (
    <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center">
              <FiSun className="text-white text-lg" />
            </div>
            <span className="text-xl font-bold text-gray-800">Campus<span className="text-primary-500">Cart</span></span>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            <Link to="/" className="flex items-center space-x-1 px-3 py-2 rounded-xl text-gray-600 hover:text-primary-600 hover:bg-primary-50 transition-all text-sm font-medium"><FiHome /><span>Home</span></Link>
            <Link to="/listings" className="flex items-center space-x-1 px-3 py-2 rounded-xl text-gray-600 hover:text-primary-600 hover:bg-primary-50 transition-all text-sm font-medium"><FiGrid /><span>Browse</span></Link>
            {user && (user.role === 'seller' || user.role === 'admin') && (
              <Link to="/create-listing" className="flex items-center space-x-1 px-3 py-2 rounded-xl text-gray-600 hover:text-primary-600 hover:bg-primary-50 transition-all text-sm font-medium"><FiPlus /><span>Sell</span></Link>
            )}
          </div>

          <div className="hidden md:flex items-center space-x-2">
            {user ? (
              <>
                <Link to="/favorites" className="p-2.5 rounded-xl text-gray-500 hover:text-primary-600 hover:bg-primary-50 transition-all"><FiHeart className="text-lg" /></Link>
                <Link to="/chat" className="p-2.5 rounded-xl text-gray-500 hover:text-primary-600 hover:bg-primary-50 transition-all"><FiMessageCircle className="text-lg" /></Link>
                <Link to="/notifications" className="p-2.5 rounded-xl text-gray-500 hover:text-primary-600 hover:bg-primary-50 transition-all relative">
                  <FiBell className="text-lg" />
                  {unreadCount > 0 && <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{unreadCount > 9 ? '9+' : unreadCount}</span>}
                </Link>
                <div className="relative">
                  <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center space-x-2 px-3 py-2 rounded-xl hover:bg-gray-50 transition-all">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      {user.profileImage ? <img src={user.profileImage} alt="" className="w-8 h-8 rounded-full object-cover" /> : <FiUser className="text-primary-600" />}
                    </div>
                    <span className="text-sm font-medium text-gray-700 hidden lg:block">{user.fullName?.split(' ')[0]}</span>
                  </button>
                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-fade-in">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-semibold text-gray-800 text-sm">{user.fullName}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      <Link to="/profile" onClick={() => setProfileOpen(false)} className="flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-all"><FiUser /><span>My Profile</span></Link>
                      <Link to="/favorites" onClick={() => setProfileOpen(false)} className="flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-all"><FiHeart /><span>Favorites</span></Link>
                      <Link to="/sustainability" onClick={() => setProfileOpen(false)} className="flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-all"><FiSun /><span>Sustainability</span></Link>
                      {user.role === 'buyer' && <Link to="/buyer/dashboard" onClick={() => setProfileOpen(false)} className="flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-all"><FiGrid /><span>Dashboard</span></Link>}
                      {(user.role === 'seller' || user.role === 'admin') && <Link to="/seller/dashboard" onClick={() => setProfileOpen(false)} className="flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-all"><FiGrid /><span>Dashboard</span></Link>}
                      {user.role === 'admin' && <Link to="/admin" onClick={() => setProfileOpen(false)} className="flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-all"><FiGrid /><span>Admin Panel</span></Link>}
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button onClick={handleLogout} className="flex items-center space-x-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-all w-full"><FiLogOut /><span>Logout</span></button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login" className="btn-secondary text-sm !py-2 !px-4">Login</Link>
                <Link to="/register" className="btn-primary text-sm !py-2 !px-4">Register</Link>
              </div>
            )}
          </div>

          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-all">
            {mobileOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white animate-fade-in">
          <div className="px-4 py-3 space-y-1">
            <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-all"><FiHome /><span>Home</span></Link>
            <Link to="/listings" onClick={() => setMobileOpen(false)} className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-all"><FiGrid /><span>Browse Items</span></Link>
            {user && (user.role === 'seller' || user.role === 'admin') && <Link to="/create-listing" onClick={() => setMobileOpen(false)} className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-all"><FiPlus /><span>List an Item</span></Link>}
            {user ? (
              <>
                <div className="border-t border-gray-100 pt-2 mt-2">
                  <Link to="/profile" onClick={() => setMobileOpen(false)} className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-gray-700 hover:bg-primary-50"><FiUser /><span>Profile</span></Link>
                  <Link to="/favorites" onClick={() => setMobileOpen(false)} className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-gray-700 hover:bg-primary-50"><FiHeart /><span>Favorites</span></Link>
                  <Link to="/chat" onClick={() => setMobileOpen(false)} className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-gray-700 hover:bg-primary-50"><FiMessageCircle /><span>Messages</span></Link>
                  <Link to="/sustainability" onClick={() => setMobileOpen(false)} className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-gray-700 hover:bg-primary-50"><FiSun /><span>Sustainability</span></Link>
                  {user.role === 'buyer' && <Link to="/buyer/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-gray-700 hover:bg-primary-50"><FiGrid /><span>Dashboard</span></Link>}
                  {(user.role === 'seller' || user.role === 'admin') && <Link to="/seller/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-gray-700 hover:bg-primary-50"><FiGrid /><span>Dashboard</span></Link>}
                  {user.role === 'admin' && <Link to="/admin" onClick={() => setMobileOpen(false)} className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-gray-700 hover:bg-primary-50"><FiGrid /><span>Admin Panel</span></Link>}
                  <button onClick={handleLogout} className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 w-full text-left"><FiLogOut /><span>Logout</span></button>
                </div>
              </>
            ) : (
              <div className="border-t border-gray-100 pt-2 mt-2 flex space-x-2">
                <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-secondary text-sm flex-1 text-center">Login</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-primary text-sm flex-1 text-center">Register</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
