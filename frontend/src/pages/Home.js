import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiPackage, FiUsers, FiRepeat, FiDollarSign, FiStar, FiBook, FiMonitor, FiHome, FiTool, FiBox, FiBookOpen, FiEdit3, FiTarget, FiWatch, FiCrosshair, FiScissors, FiShoppingBag, FiTruck } from 'react-icons/fi';
import API from '../utils/api';
import ListingCard from '../components/ListingCard';

const Counter = ({ end, duration = 2000, prefix = '', suffix = '' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const counted = useRef(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !counted.current) {
        counted.current = true;
        let start = 0;
        const increment = end / (duration / 16);
        const timer = setInterval(() => {
          start += increment;
          if (start >= end) { setCount(end); clearInterval(timer); }
          else setCount(Math.floor(start));
        }, 16);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);
  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
};

const categories = [
  { name: 'Books', icon: FiBook, color: 'from-blue-500 to-blue-600' },
  { name: 'Guides', icon: FiBookOpen, color: 'from-indigo-500 to-indigo-600' },
  { name: 'Calculator', icon: FiTarget, color: 'from-purple-500 to-purple-600' },
  { name: 'Engineering Kit', icon: FiTool, color: 'from-red-500 to-red-600' },
  { name: 'Lab Kit', icon: FiBox, color: 'from-pink-500 to-pink-600' },
  { name: 'Boneset', icon: FiWatch, color: 'from-amber-500 to-amber-600' },
  { name: 'Stationery', icon: FiEdit3, color: 'from-teal-500 to-teal-600' },
  { name: 'Lab Coat', icon: FiScissors, color: 'from-cyan-500 to-cyan-600' },
  { name: 'Hostel Essentials', icon: FiHome, color: 'from-orange-500 to-orange-600' },
  { name: 'Electronics', icon: FiMonitor, color: 'from-violet-500 to-violet-600' },
  { name: 'Cycle', icon: FiTruck, color: 'from-emerald-500 to-emerald-600' },
  { name: 'Furniture', icon: FiShoppingBag, color: 'from-rose-500 to-rose-600' },
  { name: 'Others', icon: FiPackage, color: 'from-gray-500 to-gray-600' },
];

const Home = () => {
  const [stats, setStats] = useState(null);
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    API.get('/listings/stats').then(r => setStats(r.data.stats)).catch(() => {});
    API.get('/listings/featured').then(r => setFeatured(r.data.listings)).catch(() => {});
  }, []);

  return (
    <div className="animate-fade-in">
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-accent-light overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 rounded-full opacity-30 animate-pulse-slow"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-300 rounded-full opacity-20 animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-100 rounded-full opacity-20"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center space-x-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium">
                <FiStar className="text-sm" />
                <span>Campus Sustainability Platform</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
                Reuse. <span className="text-primary-500">Save Money.</span> Build Sustainability.
              </h1>
              <p className="text-lg text-gray-500 leading-relaxed">Buy, Sell, Donate, and Lend Student Essentials Within Your Campus. Join thousands of students making a difference.</p>
              <div className="flex flex-wrap gap-4">
                <Link to="/listings" className="btn-primary flex items-center space-x-2 text-lg !py-3 !px-8">
                  <span>Browse Items</span><FiArrowRight />
                </Link>
                <Link to="/register" className="btn-secondary flex items-center space-x-2 text-lg !py-3 !px-8">
                  <span>List an Item</span>
                </Link>
              </div>
              <div className="flex items-center space-x-6 pt-4">
                <div className="flex -space-x-2">
                  {[1,2,3,4].map(i => <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-300 to-primary-500 border-2 border-white flex items-center justify-center text-white text-xs font-bold">{String.fromCharCode(64+i)}</div>)}
                </div>
                <p className="text-sm text-gray-500"><span className="font-semibold text-gray-800">2,500+</span> students already joined</p>
              </div>
            </div>
            <div className="hidden md:flex justify-center">
              <div className="relative">
                <div className="w-80 h-80 bg-gradient-to-br from-primary-400 to-primary-600 rounded-3xl rotate-6 opacity-20 absolute inset-0"></div>
                <div className="w-80 h-80 bg-white rounded-3xl shadow-2xl p-8 relative z-10 flex flex-col justify-center space-y-6">
                  <div className="flex items-center space-x-4 bg-primary-50 p-4 rounded-xl"><div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center"><FiRepeat className="text-white text-xl" /></div><div><p className="text-2xl font-bold text-gray-800">15K+</p><p className="text-sm text-gray-500">Items Reused</p></div></div>
                  <div className="flex items-center space-x-4 bg-blue-50 p-4 rounded-xl"><div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center"><FiDollarSign className="text-white text-xl" /></div><div><p className="text-2xl font-bold text-gray-800">₹8L+</p><p className="text-sm text-gray-500">Money Saved</p></div></div>
                  <div className="flex items-center space-x-4 bg-emerald-50 p-4 rounded-xl"><div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center"><FiStar className="text-white text-xl" /></div><div><p className="text-2xl font-bold text-gray-800">50T+</p><p className="text-sm text-gray-500">Waste Reduced</p></div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              { icon: FiPackage, label: 'Total Listings', value: stats?.totalListings || 0, color: 'bg-blue-50 text-blue-600' },
              { icon: FiUsers, label: 'Students', value: stats?.totalUsers || 0, color: 'bg-purple-50 text-purple-600' },
              { icon: FiRepeat, label: 'Transactions', value: stats?.totalTransactions || 0, color: 'bg-primary-50 text-primary-600' },
              { icon: FiRepeat, label: 'Items Reused', value: stats?.itemsReused || 0, color: 'bg-emerald-50 text-emerald-600' },
              { icon: FiDollarSign, label: 'Money Saved', value: stats?.estimatedMoneySaved || 0, prefix: '₹', color: 'bg-amber-50 text-amber-600' },
              { icon: FiStar, label: 'Waste Reduced', value: stats?.wasteReduced || 0, suffix: 'kg', color: 'bg-teal-50 text-teal-600' },
            ].map((stat, i) => (
              <div key={i} className="text-center p-6 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-lg transition-all duration-300">
                <div className={`w-14 h-14 ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-3`}><stat.icon className="text-2xl" /></div>
                <p className="text-2xl font-bold text-gray-800"><Counter end={stat.value} prefix={stat.prefix || ''} suffix={stat.suffix || ''} /></p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-3">Browse by Category</h2>
            <p className="text-gray-500">Find exactly what you need from your campus community</p>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-4">
            {categories.map((cat) => (
              <Link key={cat.name} to={`/listings?category=${cat.name}`} className="group">
                <div className="bg-white rounded-2xl p-4 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100">
                  <div className={`w-14 h-14 bg-gradient-to-br ${cat.color} rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                    <cat.icon className="text-white text-xl" />
                  </div>
                  <p className="text-xs font-medium text-gray-700 leading-tight">{cat.name}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Featured Items</h2>
                <p className="text-gray-500">Popular items from your campus community</p>
              </div>
              <Link to="/listings" className="btn-secondary hidden md:flex items-center space-x-2"><span>View All</span><FiArrowRight /></Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.slice(0, 8).map(listing => <ListingCard key={listing._id} listing={listing} />)}
            </div>
            <div className="text-center mt-8 md:hidden">
              <Link to="/listings" className="btn-primary inline-flex items-center space-x-2"><span>View All Items</span><FiArrowRight /></Link>
            </div>
          </div>
        </section>
      )}

      <section className="py-20 bg-gradient-to-br from-primary-500 to-primary-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Start Your Sustainable Journey?</h2>
          <p className="text-primary-100 text-lg mb-8">Join thousands of students who are already saving money and reducing waste on campus.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register" className="bg-white text-primary-600 font-semibold py-3 px-8 rounded-xl hover:bg-primary-50 transition-all shadow-lg text-lg">Get Started Free</Link>
            <Link to="/listings" className="border-2 border-white text-white font-semibold py-3 px-8 rounded-xl hover:bg-white/10 transition-all text-lg">Explore Items</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
