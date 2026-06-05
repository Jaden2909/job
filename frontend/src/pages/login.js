import { useState } from 'react';
import { useRouter } from 'next/router';
import api from '../utils/api';

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/login', formData);
      if (response.data.success) {
        // Save token and profile details securely in browser storage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userRole', response.data.user.role);
        localStorage.setItem('userName', response.data.user.name);
        router.push('/');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '80px 20px', maxWidth: '420px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <div style={{ background: '#ffffff', padding: '32px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #e1e4e8' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px', color: '#111' }}>Account Login</h1>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '24px' }}>Log in to post or manage enterprise positions.</p>
        
        {error && (
          <div style={{ color: '#721c24', background: '#f8d7da', border: '1px solid #f5c6cb', padding: '12px', borderRadius: '6px', marginBottom: '20px', fontSize: '14px' }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: '#444' }}>Email Address</label>
            <input 
              type="email" 
              placeholder="you@company.com" 
              required 
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '15px', outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: '#444' }}>Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              required 
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '15px', outline: 'none' }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ width: '100%', padding: '12px', background: '#0070f3', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px', fontWeight: '600', marginTop: '8px' }}
          >
            {loading ? 'Verifying...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
