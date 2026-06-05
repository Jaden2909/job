import { useEffect, useState } from 'react';
import api from '../utils/api';

export default function JobBoard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await api.get('/jobs');
        if (Array.isArray(response.data)) {
          setJobs(response.data);
        } else if (response.data && Array.isArray(response.data.jobs)) {
          setJobs(response.data.jobs);
        } else if (response.data && Array.isArray(response.data.data)) {
          setJobs(response.data.data);
        } else {
          setJobs([]);
        }
      } catch (err) {
        console.error('Frontend Fetch Error:', err.message);
        setError('Failed to load jobs from backend cluster.');
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: '40px', fontFamily: 'sans-serif', color: '#666' }}>Loading active cluster jobs...</div>;
  if (error) return <div style={{ color: '#dc3545', textAlign: 'center', padding: '40px', fontFamily: 'sans-serif' }}>{error}</div>;

  return (
    <div style={{ padding: '30px 20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#111', margin: 0 }}>Available Opportunities</h1>
        <p style={{ color: '#666', fontSize: '14px', margin: '4px 0 0 0' }}>Displaying real-time enterprise options fetched from Atlas.</p>
      </div>
      
      {jobs.length === 0 ? (
        <p style={{ color: '#666', textAlign: 'center', marginTop: '40px' }}>No jobs found in the database.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {jobs.map((job) => (
            <div key={job._id || Math.random()} style={{ background: '#fff', border: '1px solid #e1e4e8', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <h2 style={{ fontSize: '21px', color: '#0070f3', margin: '0 0 8px 0', fontWeight: '600' }}>{job.title || 'Untitled Position'}</h2>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', color: '#555', fontSize: '14px', marginBottom: '16px', borderBottom: '1px solid #f0f2f5', paddingBottom: '12px' }}>
                <span><strong>🏢 Company:</strong> {job.companyName || 'N/A'}</span>
                <span><strong>📍 Location:</strong> {job.location || 'N/A'}</span>
                <span><strong>💼 Type:</strong> {job.jobType || 'Full-time'}</span>
              </div>
              
              <div style={{ background: '#f8f9fa', padding: '12px 16px', borderRadius: '6px', borderLeft: '4px solid #0070f3' }}>
                <p style={{ margin: '0', fontSize: '15px', color: '#333', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                  {job.description || "No description provided."}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
