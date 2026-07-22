import React, { useState, useEffect } from 'react';
import API from '../utils/api';
import { FiRepeat, FiDollarSign, FiStar, FiTruck, FiTrendingUp, FiPieChart } from 'react-icons/fi';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const SustainabilityDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/dashboard/sustainability').then(r => { setData(r.data.sustainability); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div></div>;
  if (!data) return <div className="text-center py-20 text-gray-500">Failed to load sustainability data</div>;

  const personalStats = [
    { icon: FiRepeat, label: 'Items Reused', value: data.personal.itemsReused, color: 'bg-blue-50 text-blue-600' },
    { icon: FiStar, label: 'Items Donated', value: data.personal.itemsDonated, color: 'bg-green-50 text-green-600' },
    { icon: FiTruck, label: 'Items Lent', value: data.personal.itemsLent, color: 'bg-purple-50 text-purple-600' },
    { icon: FiDollarSign, label: 'Money Saved', value: `₹${data.personal.moneySaved}`, color: 'bg-amber-50 text-amber-600' },
    { icon: FiStar, label: 'Waste Reduced', value: `${data.personal.wasteReduced}kg`, color: 'bg-emerald-50 text-emerald-600' },
    { icon: FiStar, label: 'CO₂ Reduced', value: `${data.personal.co2Reduced}kg`, color: 'bg-teal-50 text-teal-600' },
  ];

  const communityStats = [
    { icon: FiRepeat, label: 'Total Reused', value: data.community.totalReused, color: 'bg-blue-50 text-blue-600' },
    { icon: FiDollarSign, label: 'Money Saved', value: `₹${data.community.totalMoneySaved.toLocaleString()}`, color: 'bg-amber-50 text-amber-600' },
    { icon: FiStar, label: 'Waste Reduced', value: `${data.community.totalWasteReduced}kg`, color: 'bg-emerald-50 text-emerald-600' },
    { icon: FiStar, label: 'CO₂ Saved', value: `${data.community.totalCO2Saved}kg`, color: 'bg-teal-50 text-teal-600' },
    { icon: FiTrendingUp, label: 'Total Transactions', value: data.community.totalTransactions, color: 'bg-purple-50 text-purple-600' },
  ];

  const lineData = {
    labels: data.monthlyData.map(d => d.month),
    datasets: [
      { label: 'Transactions', data: data.monthlyData.map(d => d.transactions), borderColor: '#22C55E', backgroundColor: 'rgba(34,197,94,0.1)', fill: true, tension: 0.4 },
      { label: 'Savings (₹)', data: data.monthlyData.map(d => d.savings), borderColor: '#F59E0B', backgroundColor: 'rgba(245,158,11,0.1)', fill: true, tension: 0.4, yAxisID: 'y1' },
    ],
  };

  const doughnutData = {
    labels: data.categoryData.map(d => d._id),
    datasets: [{ data: data.categoryData.map(d => d.count), backgroundColor: ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#06B6D4', '#F97316', '#6B7280'] }],
  };

  const barData = {
    labels: data.monthlyData.map(d => d.month),
    datasets: [{ label: 'Transactions', data: data.monthlyData.map(d => d.transactions), backgroundColor: 'rgba(34,197,94,0.7)', borderRadius: 8 }],
  };

  const options = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } }, scales: { y: { beginAtZero: true }, y1: { position: 'right', beginAtZero: true, grid: { drawOnChartArea: false } } } };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Sustainability Dashboard</h1>
        <p className="text-gray-500">Track your environmental impact and community contribution</p>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Your Impact</h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {personalStats.map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center mb-3`}><stat.icon className="text-xl" /></div>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Community Impact</h2>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {communityStats.map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center mb-3`}><stat.icon className="text-xl" /></div>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center space-x-2"><FiTrendingUp className="text-primary-500" /><span>Monthly Trends</span></h3>
          <div className="h-64"><Line data={lineData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} /></div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center space-x-2"><FiPieChart className="text-primary-500" /><span>Category Distribution</span></h3>
          <div className="h-64"><Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} /></div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm lg:col-span-2">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center space-x-2"><FiTrendingUp className="text-primary-500" /><span>Monthly Transactions</span></h3>
          <div className="h-64"><Bar data={barData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } }, scales: { y: { beginAtZero: true } } }} /></div>
        </div>
      </div>
    </div>
  );
};

export default SustainabilityDashboard;
