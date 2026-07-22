import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import { FiUser, FiMail, FiPhone, FiHome, FiBook, FiCalendar, FiCamera, FiLock, FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '', department: user?.department || '', year: user?.year || '',
    campus: user?.campus || '', studentType: user?.studentType || 'hosteller', hostel: user?.hostel || '', phone: user?.phone || '',
  });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(formData);
      toast.success('Profile updated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
    setLoading(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) return toast.error('Passwords do not match');
    if (passwordData.newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await API.put('/auth/change-password', passwordData);
      toast.success('Password changed!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to change password'); }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <div className="text-center mb-8">
        <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 relative">
          {user?.profileImage ? <img src={user.profileImage} alt="" className="w-24 h-24 rounded-full object-cover" /> : <FiUser className="text-primary-600 text-3xl" />}
          <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center shadow-lg"><FiCamera className="text-sm" /></button>
        </div>
        <h1 className="text-2xl font-bold text-gray-800">{user?.fullName}</h1>
        <p className="text-gray-500">{user?.email}</p>
        <span className="inline-block mt-2 px-3 py-1 bg-primary-50 text-primary-600 rounded-lg text-xs font-semibold capitalize">{user?.role}</span>
      </div>

      <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl mb-6">
        {[{ key: 'profile', label: 'Profile' }, { key: 'password', label: 'Password' }].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab.key ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>{tab.label}</button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <form onSubmit={handleProfileUpdate} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium text-gray-700 mb-1 block">Full Name</label><input type="text" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} className="input-field" /></div>
            <div><label className="text-sm font-medium text-gray-700 mb-1 block">Phone</label><input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="input-field" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium text-gray-700 mb-1 block">Department</label><input type="text" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} className="input-field" /></div>
            <div><label className="text-sm font-medium text-gray-700 mb-1 block">Year</label><input type="text" value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })} className="input-field" /></div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Campus</label>
            <input type="text" value={formData.campus} onChange={(e) => setFormData({ ...formData, campus: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Student Type</label>
            <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: '0.75rem', padding: '0.25rem' }}>
              {['hosteller', 'dayScholar'].map(type => (
                <button key={type} type="button" onClick={() => setFormData(prev => ({ ...prev, studentType: type, hostel: type === 'dayScholar' ? '' : prev.hostel }))} style={{
                  flex: 1, padding: '0.625rem', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 600, border: 'none', cursor: 'pointer',
                  background: formData.studentType === type ? 'white' : 'transparent',
                  color: formData.studentType === type ? '#16a34a' : '#6b7280',
                  boxShadow: formData.studentType === type ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}>
                  {type === 'hosteller' ? 'Hosteller' : 'Day Scholar'}
                </button>
              ))}
            </div>
          </div>
          {formData.studentType === 'hosteller' && (
            <div><label className="text-sm font-medium text-gray-700 mb-1 block">Hostel</label><input type="text" value={formData.hostel} onChange={(e) => setFormData({ ...formData, hostel: e.target.value })} className="input-field" placeholder="Your hostel name" /></div>
          )}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">Email:</span><p className="font-medium text-gray-800">{user?.email}</p></div>
              <div><span className="text-gray-500">College ID:</span><p className="font-medium text-gray-800">{user?.collegeId}</p></div>
              <div><span className="text-gray-500">Joined:</span><p className="font-medium text-gray-800">{new Date(user?.createdAt).toLocaleDateString()}</p></div>
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary flex items-center justify-center space-x-2">
            {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <><FiSave /><span>Save Changes</span></>}
          </button>
        </form>
      )}

      {activeTab === 'password' && (
        <form onSubmit={handlePasswordChange} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
          <div><label className="text-sm font-medium text-gray-700 mb-1 block">Current Password</label><input type="password" value={passwordData.currentPassword} onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} className="input-field" /></div>
          <div><label className="text-sm font-medium text-gray-700 mb-1 block">New Password</label><input type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} className="input-field" /></div>
          <div><label className="text-sm font-medium text-gray-700 mb-1 block">Confirm New Password</label><input type="password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} className="input-field" /></div>
          <button type="submit" disabled={loading} className="btn-primary flex items-center justify-center space-x-2">
            {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <><FiLock /><span>Change Password</span></>}
          </button>
        </form>
      )}
    </div>
  );
};

export default Profile;
