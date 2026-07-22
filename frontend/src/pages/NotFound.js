import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiSun } from 'react-icons/fi';

const NotFound = () => (
  <div className="min-h-[70vh] flex items-center justify-center animate-fade-in">
    <div className="text-center">
      <div className="w-20 h-20 bg-primary-100 rounded-3xl flex items-center justify-center mx-auto mb-6"><FiSun className="text-primary-500 text-3xl" /></div>
      <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
      <p className="text-xl text-gray-500 mb-8">Page not found</p>
      <Link to="/" className="btn-primary inline-flex items-center space-x-2"><FiArrowLeft /><span>Go Home</span></Link>
    </div>
  </div>
);

export default NotFound;
