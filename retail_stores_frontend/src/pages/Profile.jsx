import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Icon from '../components/Icon';
import api from '../services/api';

function Detail({ label, value, note, mono = false }) {
  return (
    <div className="py-4 sm:grid sm:grid-cols-[180px_1fr] sm:gap-6">
      <dt className="text-sm text-ink-muted">
        {label}
        {note && <span className="block text-xs text-ink-muted/80">{note}</span>}
      </dt>
      <dd className={`mt-1 text-[15px] font-medium text-ink sm:mt-0 ${mono ? 'font-mono text-sm' : ''}`}>{value || '—'}</dd>
    </div>
  );
}

export default function Profile() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();

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
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex flex-1 items-center justify-center p-6">
          <div className="card w-full max-w-sm p-8 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-cream-200 text-ink-soft">
              <Icon name="lock" size={22} />
            </span>
            <p className="mt-4 font-display text-xl font-medium text-ink">Please sign in</p>
            <p className="mt-1 text-sm text-ink-muted">You’ll need to be signed in to see your profile.</p>
            <Link to="/login" className="btn btn-primary mt-6 w-full">
              Sign in
            </Link>
          </div>
        </main>
        <Footer />
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

      setMessage({ type: 'success', text: 'Saved. Your details are up to date.' });
      setIsEditing(false);
    } catch (err) {
      console.error('Profile update error:', err);
      setMessage({
        type: 'error',
        text: err.response?.data?.message || err.response?.data || 'We couldn’t save that. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = user.role?.toUpperCase().includes('ADMIN');
  const sideLink = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
      isActive ? 'bg-forest-50 text-forest-800' : 'text-ink-soft hover:bg-cream-100 hover:text-ink'
    }`;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="container-page flex-1 py-8 sm:py-12">
        <p className="eyebrow">Your account</p>
        <h1 className="mt-2 font-display text-4xl font-medium tracking-tight text-ink sm:text-5xl">Profile &amp; address</h1>

        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[280px_1fr]">
          {/* Sidebar */}
          <aside className="card p-5">
            <div className="flex items-center gap-4 border-b border-line pb-5">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-marigold-200 font-display text-2xl font-semibold text-marigold-700">
                {user.name?.[0]?.toUpperCase() || 'U'}
              </span>
              <div className="min-w-0">
                <p className="truncate font-display text-lg font-medium text-ink">{user.name}</p>
                <p className="text-xs text-ink-muted">{isAdmin ? 'Administrator' : 'Customer'}</p>
              </div>
            </div>
            <nav className="mt-4 space-y-1">
              <NavLink to="/profile" className={sideLink}>
                <Icon name="user" size={18} />
                Profile &amp; address
              </NavLink>
              <NavLink to="/orders" className={sideLink}>
                <Icon name="receipt" size={18} />
                My orders
              </NavLink>
              {isAdmin && (
                <NavLink to="/admindashboard" className={sideLink}>
                  <Icon name="dashboard" size={18} />
                  Admin dashboard
                </NavLink>
              )}
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-tomato-600 transition-colors hover:bg-tomato-50"
              >
                <Icon name="logout" size={18} />
                Sign out
              </button>
            </nav>
          </aside>

          {/* Content */}
          <section className="card p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-medium text-ink">
                  {isEditing ? 'Edit your details' : 'Your details'}
                </h2>
                <p className="mt-1 text-sm text-ink-muted">
                  {isEditing
                    ? 'Your email and city can’t be changed here.'
                    : 'This is where the shops will deliver your orders.'}
                </p>
              </div>
              {!isEditing && (
                <button type="button" onClick={handleStartEditing} className="btn btn-outline">
                  <Icon name="pencil" size={15} />
                  Edit
                </button>
              )}
            </div>

            {message.text && (
              <div
                className={`mt-6 flex items-center gap-3 rounded-xl border p-4 text-sm ${
                  message.type === 'success'
                    ? 'border-forest-200 bg-forest-50 text-forest-800'
                    : 'border-tomato-100 bg-tomato-50 text-tomato-700'
                }`}
              >
                <Icon name={message.type === 'success' ? 'check' : 'alert'} size={18} />
                {String(message.text)}
              </div>
            )}

            {!isEditing ? (
              <dl className="mt-4 divide-y divide-line">
                <Detail label="Full name" value={user.name} />
                <Detail label="Email" value={user.email} />
                <Detail label="House & street" value={user.street || user.address} />
                <Detail label="City" value={user.city} note="Can’t be changed" />
                <Detail label="Pincode" value={user.pincode} />
                <Detail label="Customer ID" value={`#${user.customerId || user.customer_id || '—'}`} mono />
              </dl>
            ) : (
              <form onSubmit={handleSave} className="mt-6">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label htmlFor="name" className="label">Full name</label>
                    <input id="name" type="text" name="name" value={formData.name} onChange={handleChange} className="field" required />
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="street" className="label">House &amp; street</label>
                    <input
                      id="street"
                      type="text"
                      name="street"
                      value={formData.street}
                      onChange={handleChange}
                      placeholder="Enter street address"
                      className="field"
                    />
                  </div>

                  <div>
                    <span className="label">City</span>
                    <p className="field-readonly flex items-center justify-between">
                      {user.city || '—'}
                      <Icon name="lock" size={15} className="text-ink-muted" />
                    </p>
                  </div>

                  <div>
                    <label htmlFor="pincode" className="label">Pincode</label>
                    <input
                      id="pincode"
                      type="text"
                      name="pincode"
                      inputMode="numeric"
                      maxLength={6}
                      value={formData.pincode}
                      onChange={handleChange}
                      className="field"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <span className="label">Email</span>
                    <p className="field-readonly flex items-center justify-between">
                      {user.email}
                      <Icon name="lock" size={15} className="text-ink-muted" />
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:justify-end">
                  <button type="button" onClick={handleCancel} className="btn btn-ghost">
                    Cancel
                  </button>
                  <button type="submit" disabled={loading} className="btn btn-primary">
                    {loading ? 'Saving…' : 'Save changes'}
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
