import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';

export default function Profile() {
  const { user, setUser } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    street: '',
    city: '',
    pincode: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Sync state whenever user context loads or changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        street: user.street || user.address || '',
        city: user.city || '',
        pincode: user.pincode || '',
      });
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-slate-50 to-blue-100 flex flex-col justify-between">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white/80 backdrop-blur-xl border border-white/80 p-8 rounded-3xl shadow-2xl text-center max-w-sm w-full">
            <div className="w-12 h-12 rounded-2xl bg-cyan-100 text-cyan-600 text-2xl flex items-center justify-center mx-auto mb-3">
              🔒
            </div>
            <p className="text-slate-700 font-bold text-lg">Access Restricted</p>
            <p className="text-slate-500 text-xs mt-1 mb-6">Please login to view your profile information.</p>
            <Link
              to="/login"
              className="w-full py-3 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-lg hover:shadow-purple-500/25 transition-all block text-center text-sm"
            >
              Sign In
            </Link>
          </div>
        </main>
        <footer className="py-6 text-center text-xs text-slate-500 border-t border-slate-200/60 bg-white/40">
          © {new Date().getFullYear()} Retail Store Management. All rights reserved.
        </footer>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStartEditing = () => {
    setMessage({ type: '', text: '' });
    setFormData({
      name: user?.name || '',
      street: user?.street || user?.address || '',
      city: user?.city || '',
      pincode: user?.pincode || '',
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setMessage({ type: '', text: '' });
    setFormData({
      name: user?.name || '',
      street: user?.street || user?.address || '',
      city: user?.city || '',
      pincode: user?.pincode || '',
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const payload = {
        name: formData.name,
        street: formData.street,
        city: user.city, // City stays unchanged
        pincode: formData.pincode,
      };

      const res = await api.put('/api/customers/profile', payload);
      const responseData = res.data || {};

      const updatedUser = {
        ...user,
        ...payload,
        ...(typeof responseData === 'object' ? responseData : {}),
      };

      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
    } catch (err) {
      console.error('Profile update error:', err);
      setMessage({
        type: 'error',
        text: err.response?.data?.message || err.response?.data || 'Failed to update profile. Try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-slate-50 to-blue-100 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-4xl mx-auto w-full px-6 py-10 flex-1 flex flex-col justify-center">
        <div className="bg-white/80 backdrop-blur-xl border border-white/80 p-8 sm:p-10 rounded-3xl shadow-2xl relative">
          
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-slate-100 pb-6">
            <div>
              <Link
                to="/dashboard"
                className="text-cyan-600 hover:text-cyan-700 text-xs font-bold uppercase tracking-wider transition-colors inline-block mb-2"
              >
                ← Back to Dashboard
              </Link>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Profile <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Information</span>
              </h1>
            </div>

            {/* Avatar Pill Badge */}
            <div className="flex items-center gap-3 bg-slate-50/80 border border-slate-200/60 px-4 py-2 rounded-2xl self-start sm:self-auto">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-cyan-500/20">
                {user.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">{user.name}</p>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200/60 inline-block">
                  {user.role === 'ADMIN' ? 'Administrator' : 'Customer'}
                </span>
              </div>
            </div>
          </div>

          {/* Feedback Banner */}
          {message.text && (
            <div
              className={`mb-6 p-4 rounded-2xl text-xs font-bold ${
                message.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* If EDIT MODE is OFF: Show values + Edit Button */}
          {!isEditing ? (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <p className="p-3.5 border border-slate-200/80 rounded-2xl bg-slate-50/70 text-slate-800 font-medium text-sm">
                    {user.name}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <p className="p-3.5 border border-slate-200/80 rounded-2xl bg-slate-100 text-slate-500 font-medium text-sm cursor-not-allowed">
                    {user.email}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Street Address
                  </label>
                  <p className="p-3.5 border border-slate-200/80 rounded-2xl bg-slate-50/70 text-slate-800 font-medium text-sm">
                    {user.street || user.address || '—'}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    City <span className="text-[10px] text-slate-400 font-normal">(Cannot be changed)</span>
                  </label>
                  <p className="p-3.5 border border-slate-200/80 rounded-2xl bg-slate-100 text-slate-400 font-medium text-sm cursor-not-allowed select-none">
                    {user.city || '—'}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Pincode
                  </label>
                  <p className="p-3.5 border border-slate-200/80 rounded-2xl bg-slate-50/70 text-slate-800 font-medium text-sm">
                    {user.pincode || '—'}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Customer ID
                  </label>
                  <p className="p-3.5 border border-slate-200/80 rounded-2xl bg-slate-100 text-slate-500 font-medium text-sm font-mono cursor-not-allowed">
                    #{user.customerId || user.customer_id}
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleStartEditing}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3.5 rounded-2xl font-bold text-sm text-center hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200"
                >
                  Edit Profile Details
                </button>
              </div>
            </div>
          ) : (
            /* If EDIT MODE is ON: Show editable form inputs */
            <form onSubmit={handleSave}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full p-3.5 border border-purple-300 rounded-2xl bg-white text-slate-800 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <p className="p-3.5 border border-slate-200/80 rounded-2xl bg-slate-100 text-slate-500 font-medium text-sm cursor-not-allowed">
                    {user.email}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Street Address
                  </label>
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleChange}
                    placeholder="Enter street address"
                    className="w-full p-3.5 border border-purple-300 rounded-2xl bg-white text-slate-800 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    City <span className="text-[10px] text-slate-400 font-normal">(Cannot be changed)</span>
                  </label>
                  <p className="p-3.5 border border-slate-200/80 rounded-2xl bg-slate-100 text-slate-400 font-medium text-sm cursor-not-allowed select-none">
                    {user.city || '—'}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Pincode
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    maxLength={6}
                    value={formData.pincode}
                    onChange={handleChange}
                    className="w-full p-3.5 border border-purple-300 rounded-2xl bg-white text-slate-800 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Customer ID
                  </label>
                  <p className="p-3.5 border border-slate-200/80 rounded-2xl bg-slate-100 text-slate-500 font-medium text-sm font-mono cursor-not-allowed">
                    #{user.customerId || user.customer_id}
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3.5 rounded-2xl font-bold text-sm text-center hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-3.5 bg-slate-100 text-slate-700 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

        </div>
      </main>

      <footer className="py-6 text-center text-xs text-slate-500 border-t border-slate-200/60 bg-white/40">
        © {new Date().getFullYear()} Retail Store Management. All rights reserved.
      </footer>
    </div>
  );
}