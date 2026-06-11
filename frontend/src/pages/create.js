import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import api from '../utils/api';

export default function CreateJob() {
  const router = useRouter();
  const [formData, setFormData] = useState({ title: '', companyName: '', location: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Guard Rail Check: Prevent non-logged-in users from seeing this form
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');

    if (!token) {
      // No token found? Bounce straight to registration page with a notice parameter
      router.push('/login?message=Please create an account or sign in to post job vacancies.');
    } else if (role !== 'Recruiter' && role !== 'Admin') {
      // Token found but wrong role? Send back home with a restriction warning
      router.push('/?error=Only users with a Recruiter profile can post new vacancies.');
    } else {
      // User is validated and safe to access
      setCheckingAuth(false);
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await api.post('/jobs', formData);
      if (response.data) {
        setSuccess(true);
        setFormData({ title: '', companyName: '', location: '', description: '' });
        // Take them back to feed to view their new listing after a brief pause
        setTimeout(() => router.push('/'), 1500);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit vacancy to cluster.');
    } finally {
      setLoading(false);
    }
  };

  // While redirecting or checking tokens, show a clean loading viewport state
  if (checkingAuth) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px', fontFamily: 'sans-serif', color: '#666' }}>
        <div style={{ fontSize: '16px', fontWeight: '500' }}>Checking organizational authorization...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 20px', maxWidth: '520px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <div style={{ background: '#ffffff', padding: '32px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #e1e4e8' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px', color: '#111' }}>Post a New Job</h1>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '24px' }}>Fill in the details below to submit a position to the live Atlas cluster.</p>

        {success && (
          <div style={{ color: '#155724', background: '#d4edda', border: '1px solid #c3e6cb', padding: '12px', borderRadius: '6px', marginBottom: '20px', fontSize: '14px', fontWeight: '500' }}>
            🎉 Position published successfully! Redirecting to home board...
          </div>
        )}

        {error && (
          <div style={{ color: '#721c24', background: '#f8d7da', border: '1px solid #f5c6cb', padding: '12px', borderRadius: '6px', marginBottom: '20px', fontSize: '14px' }}>
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: '#444' }}>Job Title</label>
            <input 
              type="text" 
              placeholder="e.g. Full Stack Engineer" 
              required 
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '15px', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: '#444' }}>Company Name</label>
            <input 
              type="text" 
              placeholder="e.g. Acme Corp" 
              required 
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '15px', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: '#444' }}>Location</label>
            <input 
              type="text" 
              placeholder="e.g. Remote / Bangalore" 
              required 
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '15px', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: '#444' }}>Job Description</label>
            <textarea 
              placeholder="Provide responsibilities, requirements, and stack details..." 
              required 
              rows={5}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '15px', fontFamily: 'sans-serif', boxSizing: 'border-box', resize: 'vertical' }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ width: '100%', padding: '12px', background: '#0070f3', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px', fontWeight: '600', marginTop: '8px' }}
          >
            {loading ? 'Publishing...' : 'Publish Job Listing'}
          </button>
        </form>
      </div>
    </div>
  );
}
