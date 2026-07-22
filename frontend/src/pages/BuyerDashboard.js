import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { FiSend, FiCheckCircle, FiClock, FiDollarSign, FiPackage, FiHeart, FiArrowRight } from 'react-icons/fi';

const BuyerDashboard = () => {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('requests');

  useEffect(() => {
    API.get('/dashboard/buyer').then(r => { setDashboard(r.data.dashboard); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div></div>;
  if (!dashboard) return <div className="text-center py-20 text-gray-500">Failed to load dashboard</div>;

  const stats = [
    { icon: FiSend, label: 'Requests Sent', value: dashboard.requestsSent, color: 'bg-blue-50 text-blue-600' },
    { icon: FiCheckCircle, label: 'Accepted', value: dashboard.acceptedRequests, color: 'bg-green-50 text-green-600' },
    { icon: FiClock, label: 'Completed', value: dashboard.completedTransactions, color: 'bg-purple-50 text-purple-600' },
    { icon: FiDollarSign, label: 'Money Saved', value: `₹${dashboard.moneySaved}`, color: 'bg-amber-50 text-amber-600' },
  ];

  const statusColor = { Pending: 'bg-yellow-100 text-yellow-700', Accepted: 'bg-green-100 text-green-700', Rejected: 'bg-red-100 text-red-700', Completed: 'bg-blue-100 text-blue-700' };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Welcome, {user?.fullName?.split(' ')[0]}!</h1>
        <p className="text-gray-500">Here's your buyer dashboard</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center mb-3`}><stat.icon className="text-xl" /></div>
            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl mb-6">
        {[{ key: 'requests', label: 'My Requests' }, { key: 'transactions', label: 'Transaction History' }].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab.key ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>{tab.label}</button>
        ))}
      </div>

      {activeTab === 'requests' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {dashboard.recentRequests?.length === 0 ? (
            <div className="text-center py-16">
              <FiPackage className="text-4xl text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">No requests yet</p>
              <Link to="/listings" className="btn-primary inline-flex items-center space-x-2"><span>Browse Items</span><FiArrowRight /></Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {dashboard.recentRequests.map(req => (
                <div key={req._id} className="p-5 flex items-center space-x-4 hover:bg-gray-50 transition-colors">
                  <div className="w-14 h-14 bg-gray-100 rounded-xl flex-shrink-0 overflow-hidden">
                    {req.listing?.images?.[0] ? <img src={req.listing.images[0]} alt="" className="w-full h-full object-cover" /> : <FiPackage className="text-gray-300 m-auto mt-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link to={`/listings/${req.listing?._id}`} className="font-semibold text-gray-800 hover:text-primary-600 line-clamp-1">{req.listing?.title}</Link>
                    <p className="text-sm text-gray-500">with {req.seller?.fullName}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${statusColor[req.status]}`}>{req.status}</span>
                  <span className="text-sm text-gray-400">{new Date(req.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <p className="text-gray-500 text-center py-8">Transaction history will appear here once transactions are completed.</p>
        </div>
      )}
    </div>
  );
};

export default BuyerDashboard;
