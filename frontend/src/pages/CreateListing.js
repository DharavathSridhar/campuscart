import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import { FiUploadCloud, FiX, FiImage } from 'react-icons/fi';
import toast from 'react-hot-toast';

const categories = ['Books', 'Guides', 'Calculator', 'Engineering Kit', 'Lab Kit', 'Boneset', 'Stationery', 'Lab Coat', 'Hostel Essentials', 'Electronics', 'Cycle', 'Furniture', 'Others'];
const conditions = ['New', 'Good', 'Fair', 'Worn'];

const CreateListing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef();
  const [loading, setLoading] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [formData, setFormData] = useState({
    title: '', description: '', category: '', condition: '', transactionType: 'Sell',
    price: '', lendingDuration: '', depositAmount: '', campus: user?.campus || '',
    hostel: user?.hostel || '', building: '', availability: 'Available',
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) return toast.error('Maximum 5 images allowed');
    setImagePreviews(files.map(f => ({ file: f, preview: URL.createObjectURL(f) })));
  };

  const removeImage = (index) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.category || !formData.condition || !formData.transactionType) {
      return toast.error('Please fill in all required fields');
    }
    setLoading(true);
    try {
      let imageUrls = [];
      if (imagePreviews.length > 0) {
        const uploadForm = new FormData();
        imagePreviews.forEach(p => uploadForm.append('images', p.file));
        const uploadRes = await API.post('/listings/upload', uploadForm, { headers: { 'Content-Type': 'multipart/form-data' } });
        imageUrls = uploadRes.data.images;
      }
      const { data } = await API.post('/listings', { ...formData, images: imageUrls });
      toast.success('Listing created successfully!');
      navigate(`/listings/${data.listing._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create listing');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Listing</h1>
        <p className="text-gray-500">List your item for other students to buy, borrow, or receive</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Item Information</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Title *</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} className="input-field" placeholder="e.g., Engineering Mathematics Textbook" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Description *</label>
              <textarea name="description" value={formData.description} onChange={handleChange} className="input-field h-28 resize-none" placeholder="Describe your item in detail..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Category *</label>
                <select name="category" value={formData.category} onChange={handleChange} className="input-field">
                  <option value="">Select Category</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Condition *</label>
                <select name="condition" value={formData.condition} onChange={handleChange} className="input-field">
                  <option value="">Select Condition</option>
                  {conditions.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Transaction Type</h2>
          <div className="flex space-x-3 mb-4">
            {['Free', 'Sell', 'Lend'].map(type => (
              <button key={type} type="button" onClick={() => setFormData({ ...formData, transactionType: type })} className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all ${formData.transactionType === type ? 'bg-primary-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {type}
              </button>
            ))}
          </div>
          {formData.transactionType === 'Sell' && (
            <div><label className="text-sm font-medium text-gray-700 mb-1.5 block">Price (₹)</label><input type="number" name="price" value={formData.price} onChange={handleChange} className="input-field" placeholder="Enter price" min="0" /></div>
          )}
          {formData.transactionType === 'Lend' && (
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium text-gray-700 mb-1.5 block">Lending Duration</label><input type="text" name="lendingDuration" value={formData.lendingDuration} onChange={handleChange} className="input-field" placeholder="e.g., 2 weeks" /></div>
              <div><label className="text-sm font-medium text-gray-700 mb-1.5 block">Deposit Amount (₹)</label><input type="number" name="depositAmount" value={formData.depositAmount} onChange={handleChange} className="input-field" placeholder="Optional" min="0" /></div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Location</h2>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="text-sm font-medium text-gray-700 mb-1.5 block">Campus</label><input type="text" name="campus" value={formData.campus} onChange={handleChange} className="input-field" placeholder="Campus" /></div>
            <div><label className="text-sm font-medium text-gray-700 mb-1.5 block">Hostel</label><input type="text" name="hostel" value={formData.hostel} onChange={handleChange} className="input-field" placeholder="Hostel" /></div>
            <div><label className="text-sm font-medium text-gray-700 mb-1.5 block">Building/Block</label><input type="text" name="building" value={formData.building} onChange={handleChange} className="input-field" placeholder="Optional" /></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Images</h2>
          <div onClick={() => fileRef.current?.click()} className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/50 transition-all">
            <FiUploadCloud className="text-4xl text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">Click to upload images (max 5)</p>
            <p className="text-xs text-gray-400 mt-1">JPG, PNG, GIF up to 5MB each</p>
          </div>
          <input ref={fileRef} type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-5 gap-3 mt-4">
              {imagePreviews.map((img, i) => (
                <div key={i} className="relative group">
                  <img src={img.preview} alt="" className="w-full h-20 object-cover rounded-xl" />
                  <button type="button" onClick={() => removeImage(i)} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><FiX className="text-xs" /></button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex space-x-4">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center">
            {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : 'Publish Listing'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateListing;
