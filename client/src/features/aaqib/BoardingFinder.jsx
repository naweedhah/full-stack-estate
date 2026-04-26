import { useState, useEffect, useContext, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Sparkles, MapPin, Users, PlusCircle, LayoutDashboard,
  Edit2, X, ShieldCheck, AlertTriangle, TrendingUp,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { AuthContext } from '../../context/AuthContext';
import {
  fetchAllBoardings,
  generateDescription,
  verifyImage,
  createBoarding,
  updateBoarding,
  toggleBoardingStatus,
  deleteBoarding as deleteBoardingAPI,
  getWaitlist,
} from './services/boardingService';
import apiRequest from '../../lib/apiRequest';
import './boardingFinder.scss';

const EMPTY_FORM = { title: '', location: '', price: '', capacity: '', genderAllowed: 'Any', features: '', description: '' };
const stripHtml = (html) => html?.replace(/<[^>]*>/g, '') || '';

function BoardingFinder() {
  const { currentUser, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dashboard';
  const setActiveTab = (tab) => setSearchParams({ tab });

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [images, setImages] = useState([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [myListings, setMyListings] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [isVerifyingImage, setIsVerifyingImage] = useState(false);
  const [aiTags, setAiTags] = useState([]);
  const [isImageLegit, setIsImageLegit] = useState(null);
  const [waitlistData, setWaitlistData] = useState([]);
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [showAIWarning, setShowAIWarning] = useState(false);
  const [toast, setToast] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchListings = async () => {
    try {
      const res = await fetchAllBoardings();
      setMyListings(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (activeTab === 'dashboard') fetchListings();
  }, [activeTab]);

  // 🚨 NEW: Transform listings data into chart format
  const chartData = useMemo(() => {
    return myListings.map(item => ({
      name: item.title.substring(0, 15) + (item.title.length > 15 ? '...' : ''),
      saves: item.savedCount || 0,
      inquiries: item.inquiryCount || 0,
      bookings: item.bookingCount || 0,
    }));
  }, [myListings]);

  const generateAIDescription = async () => {
    if (!formData.features) return showToast('Please enter features first.', 'error');
    setLoadingAI(true);
    try {
      const res = await generateDescription(formData.features);
      setFormData({ ...formData, description: res.data.description });
    } catch { showToast('Failed to generate AI description.', 'error'); }
    setLoadingAI(false);
  };

  const verifyImageWithAI = async () => {
    if (images.length === 0) return showToast('Please select an image first.', 'error');
    setIsVerifyingImage(true);
    try {
      const res = await verifyImage(images[0]);
      if (res.data.isLegitimate) {
        setIsImageLegit(true);
        setAiTags(res.data.tags);
        setFormData({ ...formData, features: formData.features + (formData.features ? ', ' : '') + res.data.tags.join(', ') });
      } else {
        setIsImageLegit(false);
        setAiTags([]);
        setShowAIWarning(true);
      }
    } catch { showToast('AI image scan failed.', 'error'); }
    setIsVerifyingImage(false);
  };

  const handleEditClick = (item) => {
    setEditingId(item._id);
    setFormData({
      title: item.title,
      location: item.location,
      price: item.price,
      capacity: item.capacity ?? '',
      genderAllowed: item.genderAllowed || 'Any',
      features: '',
      description: stripHtml(item.description),
    });
    setIsImageLegit(null);
    setAiTags([]);
    setImages([]);
    setActiveTab('add');
  };

  const validateForm = () => {
    if (formData.title.trim().length < 5) {
      showToast('Title must be at least 5 characters long.', 'error');
      return false;
    }
    if (formData.title.trim().length > 60) {
      showToast('Title is too long (maximum 60 characters).', 'error');
      return false;
    }
    if (formData.location.trim().length < 3) {
      showToast('Please provide a valid location.', 'error');
      return false;
    }
    if (!formData.price || Number(formData.price) <= 0) {
      showToast('Monthly price must be greater than Rs. 0.', 'error');
      return false;
    }
    if (!formData.capacity || Number(formData.capacity) < 1 || !Number.isInteger(Number(formData.capacity))) {
      showToast('Available slots must be a valid whole number (at least 1).', 'error');
      return false;
    }
    const wordCount = formData.description.trim().split(/\s+/).filter(word => word.length > 0).length;
    if (wordCount < 10) {
      showToast('Description must be at least 10 words to give students enough details.', 'error');
      return false;
    }
    if (!editingId && images.length === 0) {
      showToast('Please upload at least one room photo.', 'error');
      return false;
    }
    return true; 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    images.forEach(img => data.append('images', img));

    if (editingId) {
      try {
        await updateBoarding(editingId, data);
        showToast('Listing updated successfully!');
        setEditingId(null);
        setFormData(EMPTY_FORM);
        setImages([]);
        setActiveTab('dashboard');
      } catch (err) { 
        const errorMsg = err.response?.data?.errors?.[0] || 'Failed to update listing.';
        showToast(errorMsg, 'error'); 
      }
    } else {
      // 🚨 NEW: Ensure we actually have an ID before submitting!
      const userId = currentUser?.id || currentUser?._id;
      
      if (!userId) {
        return showToast('You must be logged in to publish a listing!', 'error');
      }

      data.append('ownerId', userId);
      
      try {
        await createBoarding(data);
        showToast('Boarding published!');
        setFormData(EMPTY_FORM);
        setImages([]);
        setIsImageLegit(null);
        setAiTags([]);
        setActiveTab('dashboard');
      } catch (err) { 
        const errorMsg = err.response?.data?.errors?.[0] || 'Failed to publish listing.';
        showToast(errorMsg, 'error'); 
      }
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Available' ? 'Full' : 'Available';
    await toggleBoardingStatus(id, newStatus);
    fetchListings();
  };

  const confirmDelete = (id) => setDeleteTarget(id);

  const handleDeleteConfirm = async () => {
    try {
      await deleteBoardingAPI(deleteTarget);
      showToast('Listing deleted.');
      setDeleteTarget(null);
      fetchListings();
    } catch { showToast('Failed to delete listing.', 'error'); }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setActiveTab('dashboard');
  };

  const handleLogout = async () => {
    try {
      await apiRequest.post('/auth/logout');
    } catch (_) {}
    updateUser(null);
    navigate('/');
  };

  const viewWaitlist = async (boardingId) => {
    try {
      const res = await getWaitlist(boardingId);
      setWaitlistData(res.data);
      setShowWaitlistModal(true);
    } catch { showToast('Failed to fetch waitlist.', 'error'); }
  };

  return (
    <div className="boardingFinder">

      {toast && (
        <div className={`bf-toast ${toast.type}`}>{toast.message}</div>
      )}

      {deleteTarget && (
        <div className="bf-overlay">
          <div className="bf-modal sm">
            <div className="bf-modal-center">
              <div className="bf-modal-icon">
                <AlertTriangle size={28} color="#e63946" />
              </div>
              <h3>Delete Listing?</h3>
              <p>This action cannot be undone. The listing will be permanently removed.</p>
            </div>
            <div className="bf-modal-row">
              <button className="btn-secondary" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="btn-danger" onClick={handleDeleteConfirm}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {showAIWarning && (
        <div className="bf-overlay">
          <div className="bf-modal sm">
            <div className="bf-modal-center">
              <div className="bf-modal-icon">
                <AlertTriangle size={28} color="#e63946" />
              </div>
              <h3>Verification Failed</h3>
              <p>This doesn't look like a legitimate room interior. Please upload a clear photo of the actual room.</p>
            </div>
            <button className="btn-primary full" onClick={() => setShowAIWarning(false)}>
              Okay, Got It
            </button>
          </div>
        </div>
      )}

      {showWaitlistModal && (
        <div className="bf-overlay">
          <div className="bf-modal">
            <div className="bf-modal-head">
              <h3><Users size={16} /> Smart Waitlist</h3>
              <button className="btn-ghost" onClick={() => setShowWaitlistModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="bf-wl-list">
              {waitlistData.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#7e736d', padding: '20px 0' }}>
                  No students on the waitlist yet.
                </p>
              ) : waitlistData.map((student, index) => (
                <div key={student._id} className="bf-wl-item">
                  <div className="bf-wl-num">{index + 1}</div>
                  <div>
                    <div className="bf-wl-name">{student.studentName}</div>
                    <div className="bf-wl-email">{student.studentEmail}</div>
                    <div className="bf-wl-date">Joined {new Date(student.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="bf-page">
        <div className="bf-tabs">
          <button
            className={activeTab === 'dashboard' ? 'active' : ''}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={15} /> My Listings
          </button>
          <button
            className={activeTab === 'add' ? 'active' : ''}
            onClick={() => { setActiveTab('add'); setEditingId(null); setFormData(EMPTY_FORM); }}
          >
            <PlusCircle size={15} /> Add Listing
          </button>
          <Link to="/bookings" className="bf-bookings-link">
            Manage Bookings
          </Link>
          <button className="bf-logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>

        {activeTab === 'dashboard' && (
          <div className="bf-dash-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* 🚨 NEW: Analytics Chart Section */}
            {myListings.length > 0 && (
              <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '24px', border: '1px solid #E0E0E0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#332D2A', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <TrendingUp color="#008080" size={20} /> Performance Overview
                </h3>
                <div style={{ height: '300px', width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="name" stroke="#7E736D" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#7E736D" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                      <Tooltip 
                        cursor={{ fill: '#F2EBE8' }} 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', color: '#332D2A', fontWeight: 'bold' }}
                      />
                      <Legend wrapperStyle={{ paddingTop: '20px' }}/>
                      <Bar dataKey="saves" name="Watchlist Saves" fill="#BED9D8" radius={[4, 4, 0, 0]} barSize={30} />
                      <Bar dataKey="inquiries" name="Messages" fill="#FECE51" radius={[4, 4, 0, 0]} barSize={30} />
                      <Bar dataKey="bookings" name="Booking Requests" fill="#008080" radius={[4, 4, 0, 0]} barSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Existing Listings Grid */}
            <div className="bf-dash-grid">
              {myListings.length === 0 ? (
                <div className="bf-empty">
                  <p>No listings yet. Add your first boarding to get started.</p>
                  <button className="btn-primary" onClick={() => setActiveTab('add')}>
                    <PlusCircle size={14} /> Add Listing
                  </button>
                </div>
              ) : myListings.map(item => (
                <div key={item._id} className="bf-dash-card">
                  <div className="bf-dash-card-top">
                    <div className="bf-dash-card-info">
                      <h3>{item.title}</h3>
                      <p><MapPin size={11} /> {item.location}</p>
                      <p><Users size={11} /> {item.capacity ?? '—'} slot{item.capacity !== 1 ? 's' : ''}</p>
                    </div>
                    <span className={`bf-badge ${item.status?.toLowerCase() || 'available'}`}>{item.status || 'Available'}</span>
                  </div>
                  <div className="bf-dash-card-actions">
                    <button className="btn-secondary" onClick={() => toggleStatus(item._id, item.status)}>
                      Mark {item.status === 'Available' ? 'Full' : 'Available'}
                    </button>
                    <button className="btn-secondary" onClick={() => handleEditClick(item)}>
                      <Edit2 size={13} /> Edit
                    </button>
                    <button className="btn-danger" onClick={() => confirmDelete(item._id)}>
                      <X size={13} /> Delete
                    </button>
                  </div>
                  {item.status === 'Full' && (
                    <button className="btn-primary full" onClick={() => viewWaitlist(item._id)}>
                      <Users size={14} /> View Waitlist
                    </button>
                  )}
                </div>
              ))}
            </div>

          </div>
        )}

        {activeTab === 'add' && (
          <div className="bf-form-wrap">
            <div className="bf-form-card">
              <div className="bf-form-header">
                <div>
                  <h2>{editingId ? 'Edit Listing' : 'Add New Listing'}</h2>
                  <p>{editingId ? 'Update your listing details below.' : 'Fill in the details for your boarding house.'}</p>
                </div>
                {editingId && (
                  <button className="btn-secondary" onClick={cancelEdit}>Cancel</button>
                )}
              </div>

              <form onSubmit={handleSubmit}>
                <div className="bf-form-body">

                  <div className="bf-panel">
                    <div className="bf-panel-header">
                      <span className="bf-panel-label">Room Photos</span>
                    </div>
                    <div className="bf-upload-row">
                      <div className="bf-upload-meta">
                        <div className="bf-upload-label">
                          {editingId ? 'Change Photos (Optional)' : 'Upload Room Photos'}
                        </div>
                        <input
                          type="file"
                          multiple
                          onChange={(e) => {
                            setImages([...e.target.files]);
                            setIsImageLegit(null);
                            setAiTags([]);
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={verifyImageWithAI}
                        disabled={images.length === 0 || isVerifyingImage}
                      >
                        <Sparkles size={14} />
                        {isVerifyingImage ? 'Scanning…' : 'AI Vision Scan'}
                      </button>
                    </div>
                    {isImageLegit !== null && (
                      <div className={`bf-ai-result ${isImageLegit ? 'legit' : 'flagged'}`}>
                        <div className="bf-ai-title">
                          {isImageLegit ? <ShieldCheck size={14} /> : <AlertTriangle size={14} />}
                          {isImageLegit ? 'AI Verified Interior' : 'AI Flagged: Invalid Image'}
                        </div>
                        {aiTags.length > 0 && (
                          <div className="bf-tags">
                            {aiTags.map((tag, idx) => <span key={idx}>{tag}</span>)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="bf-form-row">
                    <div className="bf-field">
                      <label>Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Cozy Room Near SLIIT"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      />
                    </div>
                    <div className="bf-field">
                      <label>Location</label>
                      <input
                        type="text"
                        placeholder="e.g. Malabe"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="bf-form-row">
                    <div className="bf-field">
                      <label>Monthly Price (Rs.)</label>
                      <input
                        type="number"
                        placeholder="e.g. 12000"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      />
                    </div>
                    <div className="bf-field">
                      <label>Available Slots</label>
                      <input
                        type="number"
                        min="1"
                        placeholder="e.g. 3"
                        value={formData.capacity}
                        onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="bf-form-row">
                    <div className="bf-field">
                      <label>Gender Allowed</label>
                      <select
                        value={formData.genderAllowed}
                        onChange={(e) => setFormData({ ...formData, genderAllowed: e.target.value })}
                      >
                        <option value="Any">Any Gender</option>
                        <option value="Male">Male Only</option>
                        <option value="Female">Female Only</option>
                      </select>
                    </div>
                  </div>

                  <div className="bf-panel">
                    <div className="bf-panel-header">
                      <span className="bf-panel-label"><Sparkles size={12} /> AI Assistant</span>
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={generateAIDescription}
                        disabled={loadingAI}
                      >
                        {loadingAI ? 'Generating…' : 'Generate Description'}
                      </button>
                    </div>
                    <div className="bf-field">
                      <label>Room Features</label>
                      <input
                        type="text"
                        placeholder="e.g. WiFi, AC, attached bathroom, parking"
                        value={formData.features}
                        onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="bf-field">
                    <label>Description</label>
                    <textarea
                      placeholder="Describe the boarding house for students…"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>

                  <button type="submit" className="btn-primary full">
                    {editingId ? <><Edit2 size={15} /> Update Listing</> : 'Publish Listing'}
                  </button>

                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BoardingFinder;