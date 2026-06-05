import { useState } from 'react';
import { useRouter } from 'next/router';
import api from '../utils/api';

export default function CreateJob() {
  const router = useRouter();
  const [formData, setFormData] = useState({ title: '', companyName: '', description: '', location: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.post('/jobs', formData);
      router.push('/');
    } catch (err) {
      console.error('Submission Error:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Submission failed. Double check your production backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '60px 20px', maxWidth: '520px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <div style={{ background: '#ffffff', padding: '32px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #e1e4e8' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '700', marginBottom: '8px', color: '#111' }}>Post a New Job</h1>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '24px' }}>Fill in the details below to submit a position to the live Atlas cluster.</p>
        
        {error && (
          <div style={{ color: '#721c24', background: '#f8d7da', border: '1px solid #f5c6cb', padding: '12px', borderRadius: '6px', marginBottom: '20px', fontSize: '14px' }}>
            {error}
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
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '15px', outline: 'none' }}
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
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '15px', outline: 'none' }}
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
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '15px', outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: '#444' }}>Job Description</label>
            <textarea 
              placeholder="Provide responsibilities, requirements, and stack details..." 
              required 
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '15px', height: '120px', resize: 'vertical', outline: 'none', fontFamily: 'sans-serif' }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ width: '100%', padding: '12px', background: '#0070f3', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px', fontWeight: '600', marginTop: '8px', transition: 'background 0.2s' }}
          >
            {loading ? 'Publishing Post...' : 'Publish Job Listing'}
          </button>
        </form>
      </div>
    </div>
  );
}
