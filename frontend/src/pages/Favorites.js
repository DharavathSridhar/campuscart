import React, { useState, useEffect } from 'react';
import API from '../utils/api';
import ListingCard from '../components/ListingCard';
import { FiHeart } from 'react-icons/fi';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = () => API.get('/favorites').then(r => { setFavorites(r.data.favorites); setLoading(false); }).catch(() => setLoading(false));
  useEffect(() => { fetchFavorites(); }, []);

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">My Favorites</h1>
        <p className="text-gray-500">{favorites.length} saved items</p>
      </div>
      {favorites.length === 0 ? (
        <div className="text-center py-20">
          <FiHeart className="text-5xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No favorites yet</h3>
          <p className="text-gray-400">Start saving items you love!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {favorites.map(listing => <ListingCard key={listing._id} listing={listing} onFavoriteToggle={fetchFavorites} />)}
        </div>
      )}
    </div>
  );
};

export default Favorites;
