import React from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { Link } from 'react-router-dom';
import { FiBell, FiCheck, FiTrash2, FiMessageCircle, FiRepeat, FiAlertCircle } from 'react-icons/fi';

const Notifications = () => {
  const { notifications, loading, markAsRead, markAllAsRead } = useNotifications();

  const iconMap = { request: FiRepeat, message: FiMessageCircle, transaction: FiCheck, system: FiAlertCircle };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div></div>;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Notifications</h1>
        {notifications.some(n => !n.read) && (
          <button onClick={markAllAsRead} className="text-sm text-primary-500 hover:underline font-medium">Mark all read</button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-20">
          <FiBell className="text-5xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600">No notifications</h3>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(notif => {
            const Icon = iconMap[notif.type] || FiBell;
            return (
              <div key={notif._id} className={`bg-white rounded-2xl p-5 border shadow-sm flex items-start space-x-4 transition-all hover:shadow-md ${notif.read ? 'border-gray-100' : 'border-primary-200 bg-primary-50/30'}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${notif.type === 'request' ? 'bg-blue-100 text-blue-600' : notif.type === 'message' ? 'bg-purple-100 text-purple-600' : notif.type === 'transaction' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                  <Icon className="text-lg" />
                </div>
                <div className="flex-1">
                  <p className={`font-semibold text-sm ${notif.read ? 'text-gray-700' : 'text-gray-900'}`}>{notif.title}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{notif.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(notif.createdAt).toLocaleString()}</p>
                </div>
                {!notif.read && (
                  <button onClick={() => markAsRead(notif._id)} className="p-2 rounded-lg text-gray-400 hover:text-primary-500 hover:bg-primary-50 transition-all flex-shrink-0">
                    <FiCheck />
                  </button>
                )}
                {notif.link && (
                  <Link to={notif.link} className="text-xs text-primary-500 hover:underline flex-shrink-0 mt-1">View</Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notifications;
