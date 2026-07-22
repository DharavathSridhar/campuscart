import React from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiMapPin, FiClock, FiTag } from 'react-icons/fi';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ListingCard = ({ listing, onFavoriteToggle }) => {
  const { user } = useAuth();
  const isFavorited = user?.favorites?.includes(listing?._id);

  const toggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return toast.error('Please login to save favorites');
    try {
      if (isFavorited) {
        await API.delete(`/favorites/${listing._id}`);
        toast.success('Removed from favorites');
      } else {
        await API.post('/favorites', { listingId: listing._id });
        toast.success('Added to favorites');
      }
      if (onFavoriteToggle) onFavoriteToggle();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update favorites');
    }
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const conditionColor = { New: 'bg-green-100 text-green-700', Good: 'bg-blue-100 text-blue-700', Fair: 'bg-yellow-100 text-yellow-700', Worn: 'bg-orange-100 text-orange-700' };
  const typeColor = { Free: 'bg-emerald-500 text-white', Sell: 'bg-primary-500 text-white', Lend: 'bg-blue-500 text-white' };

  return (
    <Link to={`/listings/${listing?._id}`} className="card group hover:-translate-y-1">
      <div className="relative">
        <div className="h-48 bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center overflow-hidden">
          {listing?.images?.length > 0 ? (
            <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <FiTag className="text-5xl text-primary-300" />
          )}
        </div>
        <div className="absolute top-3 left-3 flex space-x-2">
          <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${typeColor[listing?.transactionType] || 'bg-gray-500 text-white'}`}>
            {listing?.transactionType === 'Free' ? 'Free' : listing?.transactionType === 'Sell' ? `₹${listing?.price}` : 'Lend'}
          </span>
          <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${conditionColor[listing?.condition] || ''}`}>
            {listing?.condition}
          </span>
        </div>
        <button onClick={toggleFavorite} className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all ${isFavorited ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-400 hover:text-red-500 hover:bg-white'}`}>
          <FiHeart className={`text-sm ${isFavorited ? 'fill-current' : ''}`} />
        </button>
        {listing?.availability !== 'Available' && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-gray-800 px-4 py-2 rounded-xl font-semibold text-sm">{listing?.availability}</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center space-x-2 mb-2">
          <span className="px-2 py-0.5 bg-primary-50 text-primary-600 rounded-md text-xs font-medium">{listing?.category}</span>
        </div>
        <h3 className="font-semibold text-gray-800 mb-1 line-clamp-1 group-hover:text-primary-600 transition-colors">{listing?.title}</h3>
        <p className="text-gray-500 text-sm line-clamp-2 mb-3">{listing?.description}</p>
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center space-x-1"><FiMapPin /><span>{listing?.hostel}, {listing?.campus}</span></div>
          <div className="flex items-center space-x-1"><FiClock /><span>{timeAgo(listing?.createdAt)}</span></div>
        </div>
        {listing?.seller && (
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center space-x-2">
            <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center text-xs font-semibold text-primary-600">
              {listing.seller.profileImage ? <img src={listing.seller.profileImage} alt="" className="w-6 h-6 rounded-full object-cover" /> : listing.seller.fullName?.charAt(0)}
            </div>
            <span className="text-xs text-gray-500">{listing.seller.fullName}</span>
          </div>
        )}
      </div>
    </Link>
  );
};

export default ListingCard;
