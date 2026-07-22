import React, { useState, useEffect } from 'react';
import API from '../utils/api';
import { FiUsers, FiPackage, FiRepeat, FiTrendingUp, FiTrash2, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      API.get('/auth/users'),
      API.get('/listings?limit=50'),
      API.get('/listings/stats'),
    ]).then(([u, l, s]) => {
      setUsers(u.data.users);
      setListings(l.data.listings);
      setStats(s.data.stats);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const toggleUser = async (id) => {
    try { await API.put(`/auth/users/${id}/suspend`); toast.success('User status updated'); setUsers(prev => prev.map(u => u._id === id ? { ...u, isActive: !u.isActive } : u)); } catch (err) { toast.error('Failed'); }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try { await API.delete(`/auth/users/${id}`); toast.success('User deleted'); setUsers(prev => prev.filter(u => u._id !== id)); } catch (err) { toast.error('Failed'); }
  };

  const deleteListing = async (id) => {
    if (!window.confirm('Remove this listing?')) return;
    try { await API.delete(`/listings/${id}`); toast.success('Listing removed'); setListings(prev => prev.filter(l => l._id !== id)); } catch (err) { toast.error('Failed'); }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div></div>;

  const statCards = [
    { icon: FiUsers, label: 'Total Users', value: stats?.totalUsers || 0, color: 'bg-blue-50 text-blue-600' },
    { icon: FiPackage, label: 'Total Listings', value: stats?.totalListings || 0, color: 'bg-primary-50 text-primary-600' },
    { icon: FiRepeat, label: 'Transactions', value: stats?.totalTransactions || 0, color: 'bg-purple-50 text-purple-600' },
    { icon: FiTrendingUp, label: 'Items Reused', value: stats?.itemsReused || 0, color: 'bg-emerald-50 text-emerald-600' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Admin Panel</h1>
        <p className="text-gray-500">Manage users, listings, and platform analytics</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center mb-3`}><stat.icon className="text-xl" /></div>
            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl mb-6">
        {[{ key: 'overview', label: 'Users' }, { key: 'listings', label: 'Listings' }].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab.key ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>{tab.label}</button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50"><tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Campus</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {users.map(u => (
                  <tr key={u._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4"><div><p className="font-medium text-gray-800">{u.fullName}</p><p className="text-sm text-gray-500">{u.email}</p></div></td>
                    <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize ${u.role === 'admin' ? 'bg-red-100 text-red-700' : u.role === 'seller' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{u.role}</span></td>
                    <td className="px-6 py-4 text-sm text-gray-600">{u.campus}</td>
                    <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{u.isActive ? 'Active' : 'Suspended'}</span></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button onClick={() => toggleUser(u._id)} className="p-1.5 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-50">{u.isActive ? <FiXCircle /> : <FiCheckCircle />}</button>
                        <button onClick={() => deleteUser(u._id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50"><FiTrash2 /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'listings' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50"><tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Item</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Seller</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {listings.map(l => (
                  <tr key={l._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4"><p className="font-medium text-gray-800">{l.title}</p><p className="text-sm text-gray-500">₹{l.price || 'Free'}</p></td>
                    <td className="px-6 py-4 text-sm text-gray-600">{l.seller?.fullName}</td>
                    <td className="px-6 py-4"><span className="px-2.5 py-1 bg-primary-50 text-primary-600 rounded-lg text-xs font-semibold">{l.category}</span></td>
                    <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${l.availability === 'Available' ? 'bg-green-100 text-green-700' : l.availability === 'Reserved' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>{l.availability}</span></td>
                    <td className="px-6 py-4"><button onClick={() => deleteListing(l._id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50"><FiTrash2 /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
