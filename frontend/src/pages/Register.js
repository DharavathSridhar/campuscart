import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiSun } from 'react-icons/fi';
import toast from 'react-hot-toast';

const departments = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'Electrical', 'Chemical', 'Biotechnology', 'Other'];
const years = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'M.Tech', 'PhD', 'Other'];

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '', email: '', collegeId: '', department: '', year: '', campus: '', studentType: 'hosteller', hostel: '', phone: '', password: '', confirmPassword: '', role: 'buyer'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.collegeId || !formData.department || !formData.year || !formData.campus || !formData.phone || !formData.password || !formData.confirmPassword) {
      return toast.error('All fields are required');
    }
    if (formData.studentType === 'hosteller' && !formData.hostel) {
      return toast.error('Hostel name is required for hostellers');
    }
    if (formData.password !== formData.confirmPassword) return toast.error('Passwords do not match');
    if (formData.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(formData);
      navigate(formData.role === 'seller' ? '/seller/dashboard' : '/buyer/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
    setLoading(false);
  };

  const fieldStyle = { marginBottom: '1rem' };
  const labelStyle = { display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' };
  const rowStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem' }}>
      <div style={{ width: '100%', maxWidth: '40rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '3.5rem', height: '3.5rem', background: 'linear-gradient(135deg, #4ade80, #16a34a)', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <FiSun style={{ color: 'white', fontSize: '1.5rem' }} />
          </div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#1f2937' }}>Create Account</h1>
          <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>Join your campus community on CampusCart</p>
        </div>
        <div style={{ background: 'white', borderRadius: '1.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', padding: '2rem', border: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: '0.75rem', padding: '0.25rem', marginBottom: '1.5rem' }}>
            {['buyer', 'seller'].map(role => (
              <button key={role} type="button" onClick={() => setFormData(prev => ({ ...prev, role }))} style={{
                flex: 1, padding: '0.625rem', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                background: formData.role === role ? 'white' : 'transparent',
                color: formData.role === role ? '#16a34a' : '#6b7280',
                boxShadow: formData.role === role ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}>
                {role === 'buyer' ? 'Buyer' : 'Student Seller'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Full Name</label>
              <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="input-field" placeholder="Enter your full name" />
            </div>

            <div style={rowStyle}>
              <div style={fieldStyle}>
                <label style={labelStyle}>College Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="input-field" placeholder="you@college.edu" />
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>College ID</label>
                <input type="text" name="collegeId" value={formData.collegeId} onChange={handleChange} className="input-field" placeholder="Your college ID" />
              </div>
            </div>

            <div style={rowStyle}>
              <div style={fieldStyle}>
                <label style={labelStyle}>Department</label>
                <select name="department" value={formData.department} onChange={handleChange} className="input-field">
                  <option value="">Select Department</option>
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>Year</label>
                <select name="year" value={formData.year} onChange={handleChange} className="input-field">
                  <option value="">Select Year</option>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>Campus Name</label>
              <input type="text" name="campus" value={formData.campus} onChange={handleChange} className="input-field" placeholder="Your campus" />
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>Are you a...</label>
              <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: '0.75rem', padding: '0.25rem' }}>
                {['hosteller', 'dayScholar'].map(type => (
                  <button key={type} type="button" onClick={() => setFormData(prev => ({ ...prev, studentType: type, hostel: type === 'dayScholar' ? '' : prev.hostel }))} style={{
                    flex: 1, padding: '0.625rem', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s',
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
              <div style={fieldStyle}>
                <label style={labelStyle}>Hostel Name</label>
                <input type="text" name="hostel" value={formData.hostel} onChange={handleChange} className="input-field" placeholder="Your hostel name" />
              </div>
            )}

            <div style={fieldStyle}>
              <label style={labelStyle}>Phone Number</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="input-field" placeholder="Your phone number" />
            </div>

            <div style={rowStyle}>
              <div style={fieldStyle}>
                <label style={labelStyle}>Password</label>
                <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} className="input-field" placeholder="Min 6 characters" />
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>Confirm Password</label>
                <input type={showPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="input-field" placeholder="Confirm password" />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '0.875rem', padding: 0 }}>
                {showPassword ? '🙈 Hide passwords' : '👁 Show passwords'}
              </button>
            </div>

            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Already have an account? <Link to="/login" style={{ color: '#22c55e', fontWeight: 600, textDecoration: 'none' }}>Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
