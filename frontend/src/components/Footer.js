import React from 'react';
import { Link } from 'react-router-dom';
import { FiSun, FiGithub, FiTwitter, FiInstagram, FiMail } from 'react-icons/fi';

const Footer = () => (
  <footer className="bg-gray-900 text-gray-300">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <Link to="/" className="flex items-center space-x-2 mb-4">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center"><FiSun className="text-white text-lg" /></div>
            <span className="text-xl font-bold text-white">Campus<span className="text-primary-400">Cart</span></span>
          </Link>
          <p className="text-sm text-gray-400 leading-relaxed">Reuse. Save Money. Build Sustainability. Your campus marketplace for student essentials.</p>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-4">Quick Links</h4>
          <div className="space-y-2">
            <Link to="/listings" className="block text-sm hover:text-primary-400 transition-colors">Browse Items</Link>
            <Link to="/create-listing" className="block text-sm hover:text-primary-400 transition-colors">List an Item</Link>
            <Link to="/sustainability" className="block text-sm hover:text-primary-400 transition-colors">Sustainability</Link>
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-4">Categories</h4>
          <div className="space-y-2">
            <Link to="/listings?category=Books" className="block text-sm hover:text-primary-400 transition-colors">Books & Guides</Link>
            <Link to="/listings?category=Electronics" className="block text-sm hover:text-primary-400 transition-colors">Electronics</Link>
            <Link to="/listings?category=Furniture" className="block text-sm hover:text-primary-400 transition-colors">Furniture</Link>
            <Link to="/listings?category=Hostel Essentials" className="block text-sm hover:text-primary-400 transition-colors">Hostel Essentials</Link>
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-4">Connect</h4>
          <div className="flex space-x-3 mb-4">
            <a href="#" className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-primary-500 transition-all"><FiGithub /></a>
            <a href="#" className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-primary-500 transition-all"><FiTwitter /></a>
            <a href="#" className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-primary-500 transition-all"><FiInstagram /></a>
            <a href="#" className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-primary-500 transition-all"><FiMail /></a>
          </div>
          <p className="text-sm text-gray-400">campuscart@college.edu</p>
        </div>
      </div>
      <div className="border-t border-gray-800 mt-8 pt-8 text-center">
        <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} CampusCart. All rights reserved. Built with care for our planet.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
