import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiSearch, FiSliders, FiX } from 'react-icons/fi';
import API from '../utils/api';
import ListingCard from '../components/ListingCard';
import { useAuth } from '../context/AuthContext';

const categories = ['Books', 'Guides', 'Calculator', 'Engineering Kit', 'Lab Kit', 'Boneset', 'Stationery', 'Lab Coat', 'Hostel Essentials', 'Electronics', 'Cycle', 'Furniture', 'Others'];
const conditions = ['New', 'Good', 'Fair', 'Worn'];
const transactionTypes = ['Free', 'Sell', 'Lend'];

const Listings = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [nearby, setNearby] = useState(null);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    condition: searchParams.get('condition') || '',
    transactionType: searchParams.get('transactionType') || '',
    campus: searchParams.get('campus') || '',
    hostel: searchParams.get('hostel') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    availability: 'Available',
    sort: searchParams.get('sort') || 'newest',
  });

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, val]) => { if (val) params.set(key, val); });
      params.set('page', page);
      params.set('limit', 12);
      const { data } = await API.get(`/listings?${params}`);
      setListings(data.listings);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {}
    setLoading(false);
  }, [filters, page]);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  useEffect(() => {
    if (user) {
      API.get('/listings/nearby').then(r => setNearby(r.data)).catch(() => {});
    }
  }, [user]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ search: '', category: '', condition: '', transactionType: '', campus: '', hostel: '', minPrice: '', maxPrice: '', availability: 'Available', sort: 'newest' });
    setSearchParams({});
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Browse Items</h1>
        <p className="text-gray-500">{total} items available across campuses</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={filters.search} onChange={(e) => handleFilterChange('search', e.target.value)} className="input-field !pl-12 !py-3.5 text-base" placeholder="Search for textbooks, calculators, kits..." />
        </div>
        <div className="flex gap-3">
          <select value={filters.sort} onChange={(e) => handleFilterChange('sort', e.target.value)} className="input-field !w-auto text-sm">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="priceLow">Price Low to High</option>
            <option value="priceHigh">Price High to Low</option>
          </select>
          <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center space-x-2 px-5 py-3 rounded-xl font-medium text-sm transition-all ${showFilters ? 'bg-primary-500 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
            <FiSliders /><span>Filters</span>
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Filters</h3>
            <button onClick={clearFilters} className="text-sm text-primary-500 hover:underline flex items-center space-x-1"><FiX /><span>Clear All</span></button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Category</label>
              <select value={filters.category} onChange={(e) => handleFilterChange('category', e.target.value)} className="input-field text-sm">
                <option value="">All Categories</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Condition</label>
              <select value={filters.condition} onChange={(e) => handleFilterChange('condition', e.target.value)} className="input-field text-sm">
                <option value="">All Conditions</option>
                {conditions.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Type</label>
              <select value={filters.transactionType} onChange={(e) => handleFilterChange('transactionType', e.target.value)} className="input-field text-sm">
                <option value="">All Types</option>
                {transactionTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Campus</label>
              <input type="text" value={filters.campus} onChange={(e) => handleFilterChange('campus', e.target.value)} className="input-field text-sm" placeholder="Campus name" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Hostel</label>
              <input type="text" value={filters.hostel} onChange={(e) => handleFilterChange('hostel', e.target.value)} className="input-field text-sm" placeholder="Hostel name" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Min Price</label>
              <input type="number" value={filters.minPrice} onChange={(e) => handleFilterChange('minPrice', e.target.value)} className="input-field text-sm" placeholder="₹0" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Max Price</label>
              <input type="number" value={filters.maxPrice} onChange={(e) => handleFilterChange('maxPrice', e.target.value)} className="input-field text-sm" placeholder="₹10000" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Availability</label>
              <select value={filters.availability} onChange={(e) => handleFilterChange('availability', e.target.value)} className="input-field text-sm">
                <option value="">All</option>
                <option value="Available">Available</option>
                <option value="Reserved">Reserved</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {nearby && (nearby.sameHostel?.length > 0 || nearby.sameCampus?.length > 0) && user && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Near You</h2>
          {nearby.sameHostel?.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-primary-600 mb-3">Same Hostel ({nearby.sameHostel.length})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {nearby.sameHostel.slice(0, 4).map(l => <ListingCard key={l._id} listing={l} onFavoriteToggle={fetchListings} />)}
              </div>
            </div>
          )}
          {nearby.sameCampus?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-primary-600 mb-3">Same Campus ({nearby.sameCampus.length})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {nearby.sameCampus.slice(0, 4).map(l => <ListingCard key={l._id} listing={l} onFavoriteToggle={fetchListings} />)}
              </div>
            </div>
          )}
          <div className="border-b border-gray-200 mt-8 mb-6"></div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-200"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="flex justify-between"><div className="h-3 bg-gray-200 rounded w-1/4"></div><div className="h-3 bg-gray-200 rounded w-1/4"></div></div>
              </div>
            </div>
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6"><FiSearch className="text-4xl text-gray-300" /></div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No items found</h3>
          <p className="text-gray-400 mb-6">Try adjusting your filters or search terms</p>
          <button onClick={clearFilters} className="btn-primary">Clear Filters</button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {listings.map(listing => <ListingCard key={listing._id} listing={listing} onFavoriteToggle={fetchListings} />)}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-8">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium disabled:opacity-50 hover:bg-gray-50">Prev</button>
              {[...Array(totalPages)].slice(0, 5).map((_, i) => (
                <button key={i} onClick={() => setPage(i + 1)} className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${page === i + 1 ? 'bg-primary-500 text-white' : 'border border-gray-200 hover:bg-gray-50'}`}>{i + 1}</button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium disabled:opacity-50 hover:bg-gray-50">Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Listings;
