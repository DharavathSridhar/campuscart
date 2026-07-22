import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import { FiMapPin, FiClock, FiTag, FiUser, FiHeart, FiMessageCircle, FiAlertTriangle, FiArrowLeft, FiCheckCircle, FiCalendar } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ListingDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [requestMessage, setRequestMessage] = useState('');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);

  useEffect(() => {
    API.get(`/listings/${id}`).then(r => { setListing(r.data.listing); setLoading(false); }).catch(() => { toast.error('Listing not found'); navigate('/listings'); });
  }, [id, navigate]);

  const handleRequest = async () => {
    if (!user) return toast.error('Please login to request items');
    setRequestLoading(true);
    try {
      await API.post('/requests', { listingId: listing._id, message: requestMessage });
      toast.success('Request sent successfully!');
      setShowRequestModal(false);
      setRequestMessage('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send request');
    }
    setRequestLoading(false);
  };

  const handleFavorite = async () => {
    if (!user) return toast.error('Please login to save favorites');
    try {
      const isFav = user.favorites?.includes(listing._id);
      if (isFav) { await API.delete(`/favorites/${listing._id}`); toast.success('Removed from favorites'); }
      else { await API.post('/favorites', { listingId: listing._id }); toast.success('Added to favorites'); }
      window.location.reload();
    } catch (err) { toast.error('Failed'); }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div></div>;
  if (!listing) return null;

  const isFavorited = user?.favorites?.includes(listing._id);
  const isSeller = user?._id === listing.seller?._id;
  const conditionColor = { New: 'bg-green-100 text-green-700', Good: 'bg-blue-100 text-blue-700', Fair: 'bg-yellow-100 text-yellow-700', Worn: 'bg-orange-100 text-orange-700' };
  const availColor = { Available: 'bg-green-100 text-green-700', Reserved: 'bg-yellow-100 text-yellow-700', Completed: 'bg-gray-100 text-gray-700' };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center space-x-2 text-gray-500 hover:text-primary-600 mb-6 transition-colors">
        <FiArrowLeft /><span className="text-sm font-medium">Back</span>
      </button>

      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 mb-4">
            <div className="h-96 bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
              {listing.images?.length > 0 ? (
                <img src={listing.images[selectedImage]} alt={listing.title} className="w-full h-full object-cover" />
              ) : (
                <FiTag className="text-7xl text-primary-300" />
              )}
            </div>
          </div>
          {listing.images?.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {listing.images.map((img, i) => (
                <button key={i} onClick={() => setSelectedImage(i)} className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${selectedImage === i ? 'border-primary-500' : 'border-transparent'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-primary-50 text-primary-600 rounded-lg text-xs font-semibold">{listing.category}</span>
              <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${conditionColor[listing.condition]}`}>{listing.condition}</span>
              <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${availColor[listing.availability]}`}>{listing.availability}</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{listing.title}</h1>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1"><FiClock /><span>{new Date(listing.createdAt).toLocaleDateString()}</span></div>
              <div className="flex items-center space-x-1"><FiTag /><span>{listing.views} views</span></div>
            </div>
          </div>

          <div className="bg-primary-50 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-primary-600 font-medium mb-1">
                  {listing.transactionType === 'Free' ? 'Free Item' : listing.transactionType === 'Sell' ? 'Price' : 'Lending Price'}
                </p>
                <p className="text-3xl font-bold text-primary-700">
                  {listing.transactionType === 'Free' ? 'FREE' : listing.transactionType === 'Sell' ? `₹${listing.price}` : `₹${listing.price}/period`}
                </p>
              </div>
              {listing.transactionType === 'Lend' && listing.lendingDuration && (
                <div className="text-right">
                  <p className="text-sm text-gray-500">Duration</p>
                  <p className="font-semibold text-gray-700">{listing.lendingDuration}</p>
                  {listing.depositAmount > 0 && <p className="text-sm text-gray-500 mt-1">Deposit: ₹{listing.depositAmount}</p>}
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Description</h3>
            <p className="text-gray-600 leading-relaxed">{listing.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1"><FiMapPin /><span>Campus</span></div>
              <p className="font-medium text-gray-800">{listing.campus}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1"><FiMapPin /><span>Hostel</span></div>
              <p className="font-medium text-gray-800">{listing.hostel}</p>
            </div>
            {listing.building && (
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-1">Building/Block</p>
                <p className="font-medium text-gray-800">{listing.building}</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-800 mb-3">Seller Information</h3>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                {listing.seller?.profileImage ? <img src={listing.seller.profileImage} alt="" className="w-12 h-12 rounded-full object-cover" /> : <FiUser className="text-primary-600 text-xl" />}
              </div>
              <div>
                <p className="font-semibold text-gray-800">{listing.seller?.fullName}</p>
                <p className="text-sm text-gray-500">{listing.seller?.department} · {listing.seller?.campus}</p>
              </div>
            </div>
          </div>

          {!isSeller && listing.availability === 'Available' && (
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => setShowRequestModal(true)} className="btn-primary flex-1 flex items-center justify-center space-x-2">
                <FiCheckCircle /><span>Request Item</span>
              </button>
              <button onClick={() => user ? navigate(`/chat/${listing.seller._id}`) : toast.error('Please login')} className="btn-secondary flex items-center justify-center space-x-2">
                <FiMessageCircle /><span>Contact Seller</span>
              </button>
              <button onClick={handleFavorite} className={`p-3 rounded-xl border-2 transition-all ${isFavorited ? 'bg-red-50 border-red-200 text-red-500' : 'border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200'}`}>
                <FiHeart className={`text-xl ${isFavorited ? 'fill-current' : ''}`} />
              </button>
            </div>
          )}
        </div>
      </div>

      {showRequestModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full animate-slide-up">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Request This Item</h3>
            <p className="text-sm text-gray-500 mb-4">Send a request to the seller for "{listing.title}"</p>
            <textarea value={requestMessage} onChange={(e) => setRequestMessage(e.target.value)} className="input-field h-24 resize-none mb-4" placeholder="Add a message (optional)..." />
            <div className="flex space-x-3">
              <button onClick={() => setShowRequestModal(false)} className="flex-1 btn-secondary">Cancel</button>
              <button onClick={handleRequest} disabled={requestLoading} className="flex-1 btn-primary">
                {requestLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div> : 'Send Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListingDetail;
