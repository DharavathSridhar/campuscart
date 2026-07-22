import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { FiPackage, FiDollarSign, FiUsers, FiClock, FiPlus, FiEdit3, FiTrash2, FiCheckCircle, FiXCircle, FiArrowRight } from 'react-icons/fi';
import toast from 'react-hot-toast';

const SellerDashboard = () => {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('listings');

  const fetchData = () => API.get('/dashboard/seller').then(r => { setDashboard(r.data.dashboard); setLoading(false); }).catch(() => setLoading(false));

  useEffect(() => { fetchData(); }, []);

  const handleAction = async (action, id) => {
    try {
      if (action === 'delete') { await API.delete(`/listings/${id}`); toast.success('Listing deleted'); }
      else if (action === 'accept') { await API.put(`/requests/${id}/accept`); toast.success('Request accepted'); }
      else if (action === 'reject') { await API.put(`/requests/${id}/reject`); toast.success('Request rejected'); }
      else if (action === 'complete') { await API.put(`/requests/${id}/complete`); toast.success('Marked as completed'); }
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Action failed'); }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div></div>;
  if (!dashboard) return <div className="text-center py-20 text-gray-500">Failed to load dashboard</div>;

  const stats = [
    { icon: FiPackage, label: 'Active Listings', value: dashboard.activeListings, color: 'bg-primary-50 text-primary-600' },
    { icon: FiDollarSign, label: 'Sold Items', value: dashboard.soldItems, color: 'bg-green-50 text-green-600' },
    { icon: FiClock, label: 'Lent Items', value: dashboard.lentItems, color: 'bg-blue-50 text-blue-600' },
    { icon: FiUsers, label: 'Requests Received', value: dashboard.requestsReceived, color: 'bg-purple-50 text-purple-600' },
    { icon: FiPackage, label: 'Donated Items', value: dashboard.donatedItems, color: 'bg-amber-50 text-amber-600' },
    { icon: FiDollarSign, label: 'Total Earnings', value: `₹${dashboard.totalEarnings}`, color: 'bg-emerald-50 text-emerald-600' },
  ];

  const statusColor = { Pending: 'bg-yellow-100 text-yellow-700', Accepted: 'bg-green-100 text-green-700', Rejected: 'bg-red-100 text-red-700', Completed: 'bg-blue-100 text-blue-700' };
  const availColor = { Available: 'bg-green-100 text-green-700', Reserved: 'bg-yellow-100 text-yellow-700', Completed: 'bg-gray-100 text-gray-700' };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Seller Dashboard</h1>
          <p className="text-gray-500">Manage your listings and requests</p>
        </div>
        <Link to="/create-listing" className="btn-primary flex items-center space-x-2"><FiPlus /><span>New Listing</span></Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center mb-3`}><stat.icon className="text-xl" /></div>
            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl mb-6">
        {[{ key: 'listings', label: 'My Listings' }, { key: 'requests', label: 'Incoming Requests' }].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab.key ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>{tab.label}</button>
        ))}
      </div>

      {activeTab === 'listings' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {dashboard.myListings?.length === 0 ? (
            <div className="text-center py-16"><FiPackage className="text-4xl text-gray-300 mx-auto mb-3" /><p className="text-gray-500 mb-4">No listings yet</p><Link to="/create-listing" className="btn-primary inline-flex items-center space-x-2"><span>Create Listing</span><FiArrowRight /></Link></div>
          ) : (
            <div className="divide-y divide-gray-100">
              {dashboard.myListings.map(listing => (
                <div key={listing._id} className="p-5 flex items-center space-x-4 hover:bg-gray-50 transition-colors">
                  <div className="w-14 h-14 bg-gray-100 rounded-xl flex-shrink-0 overflow-hidden">
                    {listing.images?.[0] ? <img src={listing.images[0]} alt="" className="w-full h-full object-cover" /> : <FiPackage className="text-gray-300 m-auto mt-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link to={`/listings/${listing._id}`} className="font-semibold text-gray-800 hover:text-primary-600 line-clamp-1">{listing.title}</Link>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${availColor[listing.availability]}`}>{listing.availability}</span>
                      <span className="text-xs text-gray-400">₹{listing.price || 'Free'}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link to={`/create-listing`} className="p-2 rounded-lg text-gray-400 hover:text-primary-500 hover:bg-primary-50 transition-all"><FiEdit3 /></Link>
                    <button onClick={() => handleAction('delete', listing._id)} className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"><FiTrash2 /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {dashboard.incomingRequests?.length === 0 ? (
            <div className="text-center py-16"><FiUsers className="text-4xl text-gray-300 mx-auto mb-3" /><p className="text-gray-500">No incoming requests yet</p></div>
          ) : (
            <div className="divide-y divide-gray-100">
              {dashboard.incomingRequests.map(req => (
                <div key={req._id} className="p-5 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4 mb-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-sm font-semibold text-primary-600">{req.buyer?.fullName?.charAt(0)}</div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{req.buyer?.fullName}</p>
                      <p className="text-sm text-gray-500">{req.buyer?.department}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${statusColor[req.status]}`}>{req.status}</span>
                  </div>
                  <div className="flex items-center space-x-3 mb-3">
                    <Link to={`/listings/${req.listing?._id}`} className="text-sm text-primary-500 hover:underline">{req.listing?.title}</Link>
                  </div>
                  {req.message && <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-3 mb-3">"{req.message}"</p>}
                  {req.status === 'Pending' && (
                    <div className="flex space-x-2">
                      <button onClick={() => handleAction('accept', req._id)} className="flex items-center space-x-1 px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-all"><FiCheckCircle /><span>Accept</span></button>
                      <button onClick={() => handleAction('reject', req._id)} className="flex items-center space-x-1 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-all"><FiXCircle /><span>Reject</span></button>
                    </div>
                  )}
                  {req.status === 'Accepted' && (
                    <button onClick={() => handleAction('complete', req._id)} className="flex items-center space-x-1 px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-all"><FiCheckCircle /><span>Mark Completed</span></button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;
