import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import api from '../utils/api';

export default function Home() {
  const router = useRouter();
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userContext, setUserContext] = useState({ name: '', role: '', id: '' });
  const [isLoginView, setIsLoginView] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Job-Seeker' });

  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('');

  useEffect(() => {
    const synchronizeAuthState = () => {
      const token = localStorage.getItem('token');
      const name = localStorage.getItem('userName');
      const role = localStorage.getItem('userRole');
      const id = localStorage.getItem('userId');

      if (token && name && role) {
        setIsLoggedIn(true);
        setUserContext({ name, role, id });
        if (!activeTab) {
          setActiveTab(role === 'Job-Seeker' ? 'explore' : 'my-listings');
        }
        fetchJobsFeed();
      } else {
        setIsLoggedIn(false);
        setUserContext({ name: '', role: '', id: '' });
        setJobs([]);
        setActiveTab('');
      }
    };

    synchronizeAuthState();
    window.addEventListener('storage', synchronizeAuthState);
    router.events.on('routeChangeComplete', synchronizeAuthState);
    
    return () => {
      window.removeEventListener('storage', synchronizeAuthState);
      router.events.off('routeChangeComplete', synchronizeAuthState);
    };
  }, [activeTab, router.events]);

  const fetchJobsFeed = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/jobs');
      setJobs(response.data || []);
    } catch (err) {
      setError('Failed to sync workspace feeds from backend clusters.');
    } finally {
      setLoading(false);
    }
  };

  const handleLandingAuth = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    const endpoint = isLoginView ? '/auth/login' : '/auth/register';
    const payload = isLoginView ? { email: formData.email, password: formData.password } : formData;

    try {
      const response = await api.post(endpoint, payload);
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userRole', response.data.user.role);
        localStorage.setItem('userName', response.data.user.name);
        localStorage.setItem('userId', response.data.user.id || response.data.user._id);
        
        window.dispatchEvent(new Event('storage'));
      }
    } catch (err) {
      setAuthError(err.response?.data?.error || 'Invalid credentials');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleApply = async (jobId) => {
    try {
      const response = await api.put(`/jobs/${jobId}/apply`);
      if (response.data.success) {
        alert('🎉 Application submitted successfully! Tracking status set to: Under Review');
        fetchJobsFeed(); 
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit application.');
    }
  };

  const handleUpdateStatus = async (jobId, applicantId, newStatus) => {
    try {
      const response = await api.put(`/jobs/${jobId}/status`, { applicantId, status: newStatus });
      if (response.data.success) {
        alert(`Pipeline tracking status updated cleanly to: ${newStatus}`);
        fetchJobsFeed();
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Error saving status change to pipeline server.');
    }
  };

  const handleDelete = async (jobId) => {
    if (!confirm('Are you absolutely certain you want to permanently delete this listing?')) return;
    try {
      const response = await api.delete(`/jobs/${jobId}`);
      if (response.data.success) {
        fetchJobsFeed(); 
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Unauthorized request action.');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.dispatchEvent(new Event('storage'));
  };

  const initialBaseDataset = userContext.role === 'Job-Seeker'
    ? (activeTab === 'applications' 
        ? jobs.filter(job => {
            const applicantIds = job.applicants?.map(a => typeof a === 'object' ? (a._id || a.id) : a) || [];
            return applicantIds.includes(userContext.id);
          })
        : jobs)
    : (activeTab === 'my-listings' 
        ? jobs.filter(job => job.postedBy === userContext.id)
        : jobs);

  const filteredDataset = initialBaseDataset.filter(job => {
    const q = searchTerm.toLowerCase();
    return (
      job.title?.toLowerCase().includes(q) || 
      job.companyName?.toLowerCase().includes(q) ||
      job.location?.toLowerCase().includes(q)
    );
  });

  if (!isLoggedIn) {
    return (
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 20px', fontFamily: 'sans-serif', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center', minHeight: '80vh' }}>
        <div>
          <span style={{ background: '#e6f0fa', color: '#0070f3', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '700' }}>
            ENTERPRISE JOB MANAGEMENT
          </span>
          <h1 style={{ fontSize: '48px', fontWeight: '800', color: '#111', lineHeight: '1.1', margin: '16px 0' }}>
            The streamlined gateway for developer roles.
          </h1>
          <p style={{ color: '#555', fontSize: '18px', lineHeight: '1.5' }}>
            Log in to manage active production listings, view application states, and deploy granular workspace management directly to the cloud cluster.
          </p>
        </div>

        <div style={{ background: '#ffffff', padding: '36px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', border: '1px solid #e1e4e8' }}>
          <div style={{ display: 'flex', borderBottom: '2px solid #eaeaea', marginBottom: '24px' }}>
            <button type="button" onClick={() => { setIsLoginView(true); setAuthError(null); }} style={{ flex: 1, paddingBottom: '12px', background: 'transparent', border: 'none', fontSize: '16px', fontWeight: '700', cursor: 'pointer', color: isLoginView ? '#0070f3' : '#777', borderBottom: isLoginView ? '2px solid #0070f3' : '2px solid transparent' }}>
              Sign In
            </button>
            <button type="button" onClick={() => { setIsLoginView(false); setAuthError(null); }} style={{ flex: 1, paddingBottom: '12px', background: 'transparent', border: 'none', fontSize: '16px', fontWeight: '700', cursor: 'pointer', color: !isLoginView ? '#0070f3' : '#777', borderBottom: !isLoginView ? '2px solid #0070f3' : '2px solid transparent' }}>
              Create Account
            </button>
          </div>

          {authError && <div style={{ color: '#dc3545', background: '#fdf3f3', padding: '10px', borderRadius: '6px', marginBottom: '16px', fontSize: '14px' }}>❌ {authError}</div>}

          <form onSubmit={handleLandingAuth} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {!isLoginView && (
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Full Name / Username</label>
                <input type="text" placeholder="AlexMercer" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} style={{ width: '100%', padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px' }} />
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Email or Username</label>
              <input type="text" placeholder="name@company.com or username" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} style={{ width: '100%', padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px' }} />
            </div>

            {!isLoginView && (
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Account Work Type</label>
                <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} style={{ width: '100%', padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px', backgroundColor: '#fff' }}>
                  <option value="Job-Seeker">Job-Seeker (Discover Positions)</option>
                  <option value="Recruiter">Recruiter (Post Openings)</option>
                </select>
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Password</label>
              <input type="password" placeholder="••••••••" required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} style={{ width: '100%', padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px' }} />
            </div>

            <button type="submit" disabled={authLoading} style={{ width: '100%', padding: '11px', background: '#0070f3', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '15px', fontWeight: '600' }}>
              {authLoading ? 'Verifying...' : isLoginView ? 'Sign In' : 'Sign Up'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px', fontFamily: 'sans-serif' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '20px 24px', borderRadius: '12px', border: '1px solid #e1e4e8', marginBottom: '24px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
        <div>
          <h2 style={{ margin: '0 0 4px 0', fontSize: '22px', color: '#111' }}>Welcome back, {userContext.name || 'User'}!</h2>
          <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
            Workspace Context Hub: <span style={{ color: '#0070f3', fontWeight: '600' }}>{userContext.role} Workspace</span>
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          {(userContext.role === 'Recruiter' || userContext.role === 'Admin') && (
            <Link href="/create">
              <button style={{ background: '#0070f3', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>
                + Post New Job
              </button>
            </Link>
          )}
          <button onClick={handleLogout} style={{ background: '#fff', border: '1px solid #dc3545', color: '#dc3545', padding: '10px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>
            Logout
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <input 
          type="text"
          placeholder="🔍 Dynamic filter listings by title or company stack profile..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '14px 16px', border: '1px solid #e1e4e8', borderRadius: '8px', fontSize: '15px', boxSizing: 'border-box', marginBottom: '20px', outline: 'none' }}
        />

        <div style={{ display: 'flex', borderBottom: '1px solid #e1e4e8', gap: '4px' }}>
          {userContext.role === 'Job-Seeker' ? (
            <>
              <button onClick={() => { setActiveTab('explore'); setSearchTerm(''); }} style={{ padding: '10px 20px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '15px', fontWeight: '600', color: activeTab === 'explore' ? '#0070f3' : '#666', borderBottom: activeTab === 'explore' ? '3px solid #0070f3' : '3px solid transparent' }}>
                Browse All Openings
              </button>
              <button onClick={() => { setActiveTab('applications'); setSearchTerm(''); }} style={{ padding: '10px 20px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '15px', fontWeight: '600', color: activeTab === 'applications' ? '#0070f3' : '#666', borderBottom: activeTab === 'applications' ? '3px solid #0070f3' : '3px solid transparent' }}>
                My Applications Status
              </button>
            </>
          ) : (
            <>
              <button onClick={() => { setActiveTab('my-listings'); setSearchTerm(''); }} style={{ padding: '10px 20px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '15px', fontWeight: '600', color: activeTab === 'my-listings' ? '#0070f3' : '#666', borderBottom: activeTab === 'my-listings' ? '3px solid #0070f3' : '3px solid transparent' }}>
                My Managed Listings
              </button>
              <button onClick={() => { setActiveTab('all-listings'); setSearchTerm(''); }} style={{ padding: '10px 20px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '15px', fontWeight: '600', color: activeTab === 'all-listings' ? '#0070f3' : '#666', borderBottom: activeTab === 'all-listings' ? '3px solid #0070f3' : '3px solid transparent' }}>
                Global Cluster Feed
              </button>
            </>
          )}
        </div>
      </div>
      
      {loading && <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Querying datastore collection...</div>}
      {error && <div style={{ color: '#dc3545', padding: '16px', background: '#fdf3f3', border: '1px solid #f5c6cb', borderRadius: '6px', marginBottom: '16px' }}>{error}</div>}
      
      {!loading && filteredDataset.length === 0 && (
        <div style={{ textAlign: 'center', padding: '50px 20px', border: '2px dashed #e1e4e8', borderRadius: '8px', color: '#777', backgroundColor: '#fff' }}>
          {searchTerm ? (
            `🔍 No active job postings match your search criteria for "${searchTerm}".`
          ) : activeTab === 'applications' ? (
            "You haven't submitted any job applications yet. Head over to 'Browse All Openings' to start applying!"
          ) : activeTab === 'my-listings' ? (
            "You haven't created any job listings yet. Click '+ Post New Job' to get started."
          ) : (
            "No current postings found in this feed segment."
          )}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {!loading && filteredDataset.map((job) => {
          const applicantIds = job.applicants?.map(a => typeof a === 'object' ? (a._id || a.id) : a) || [];
          const hasApplied = applicantIds.includes(userContext.id);
          const isOwner = job.postedBy === userContext.id;
          const showDeleteButton = userContext.role === 'Recruiter' && isOwner;
          
          const candidateRegistration = hasApplied ? job.applicants[applicantIds.indexOf(userContext.id)] : null;
          const currentStatus = candidateRegistration?.status || 'Under Review';

          return (
            <div key={job._id} style={{ backgroundColor: '#ffffff', border: '1px solid #e1e4e8', borderRadius: '8px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#0070f3', fontWeight: '700' }}>{job.title}</h4>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#555', marginBottom: '14px', flexWrap: 'wrap' }}>
                    <span>🏢 <strong>Company:</strong> {job.companyName}</span>
                    <span>📍 <strong>Location:</strong> {job.location}</span>
                    <span>💼 <strong>Type:</strong> {job.jobType || 'Full-time'}</span>
                    {userContext.role === 'Recruiter' && isOwner && (
                      <span style={{ color: '#28a745', fontWeight: '600' }}>📩 Total Submissions: {job.applicants?.length || 0}</span>
                    )}
                  </div>
                </div>

                {showDeleteButton && (
                  <button 
                    onClick={() => handleDelete(job._id)}
                    style={{ background: '#fff', border: '1px solid #dc3545', color: '#dc3545', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                  >
                    🗑️ Delete Listing
                  </button>
                )}
              </div>

              <div style={{ padding: '12px 16px', backgroundColor: '#f8f9fa', borderRadius: '6px', borderLeft: '4px solid #0070f3', fontSize: '14px', color: '#333', lineHeight: '1.5', marginBottom: '16px' }}>
                {job.description}
              </div>

              {userContext.role === 'Job-Seeker' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', borderTop: '1px solid #f0f0f0', paddingTop: '12px' }}>
                  {hasApplied ? (
                    <>
                      <span style={{ fontSize: '14px', color: '#555' }}>Pipeline Tracking Status:</span>
                      <span style={{ 
                        background: currentStatus === 'Rejected' ? '#fde8e8' : currentStatus === 'Shortlisted' || currentStatus === 'Interviewing' ? '#e1f5fe' : '#e6f4ea', 
                        color: currentStatus === 'Rejected' ? '#c53030' : currentStatus === 'Shortlisted' || currentStatus === 'Interviewing' ? '#0288d1' : '#137333', 
                        padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '700' 
                      }}>
                        {currentStatus}
                      </span>
                    </>
                  ) : (
                    <div style={{ marginLeft: 'auto' }}>
                      <button onClick={() => handleApply(job._id)} style={{ background: '#28a745', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                        Apply Now
                      </button>
                    </div>
                  )}
                </div>
              )}

              {userContext.role === 'Recruiter' && isOwner && job.applicants && job.applicants.length > 0 && (
                <div style={{ marginTop: '16px', padding: '14px', background: '#f4f7fa', borderRadius: '6px', border: '1px solid #dcdcdc' }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#333', marginBottom: '8px' }}>📄 Received Applications Board (Owner Access Only):</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {job.applicants.map((applicant, index) => {
                      const appStatus = applicant.status || 'Pending Review';
                      const targetId = applicant._id || applicant.id || index;
                      return (
                        <div key={index} style={{ fontSize: '13px', color: '#555', background: '#fff', padding: '8px 12px', borderRadius: '4px', border: '1px solid #e1e4e8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            👤 <strong style={{ color: '#111' }}>{applicant.name || 'Anonymous Applicant'}</strong> — ✉️ {applicant.email}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <select 
                              value={appStatus} 
                              onChange={(e) => handleUpdateStatus(job._id, targetId, e.target.value)}
                              style={{ padding: '4px 8px', fontSize: '12px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#fff' }}
                            >
                              <option value="Pending Review">Pending Review</option>
                              <option value="Shortlisted">Shortlisted</option>
                              <option value="Interviewing">Interviewing</option>
                              <option value="Rejected">Rejected</option>
                            </select>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
